import { getPageMetadataReplacements } from "../config/page-metadata.mjs";
import {
    getSearchIndexingPolicy,
    isCanonicalProductionSearchRequest,
    renderRobotsTxt,
    renderSitemapXml
} from "../config/search-indexing.mjs";
import {
    getDefaultLanguageAliasRedirect,
    parseLocalizedPathname,
    localizePathname
} from "../config/language-routing.mjs";
import {
    PERMANENT_CANONICAL_REDIRECT_STATUS,
    PRODUCTION_ENVIRONMENT,
    getProductionCanonicalRedirect,
    productionUrl
} from "../config/site.mjs";
import {
    AUTH_PATH,
    ensureCloudflareData,
    getCloudflareAuth
} from "./auth.mjs";
import { handleCloudflareApi } from "./api.mjs";

const PAGE_ROUTES = new Map([
    ["/", "home.html"],
    ["/about", "about.html"],
    ["/faq", "faq.html"],
    ["/analysis", "features/analysis.html"],
    ["/archive", "features/archive.html"],
    ["/academy", "features/academy.html"],
    ["/puzzles", "features/puzzles.html"],
    ["/guides", "guides.html"],
    ["/help", "footer/helpCenter.html"],
    ["/signin", "account/signin.html"],
    ["/signup", "account/signin.html"],
    ["/auth/reset-password", "account/resetPassword.html"],
    ["/terms", "footer/legal.html"],
    ["/privacy", "footer/legal.html"],
    ["/source", "footer/legal.html"]
]);

const AUTH_METADATA = {
    "/signin": {
        AUTH_TITLE: "Sign In",
        AUTH_DESCRIPTION: "Sign in to your NexoChess account.",
        AUTH_CANONICAL: productionUrl("/signin")
    },
    "/signup": {
        AUTH_TITLE: "Create Account",
        AUTH_DESCRIPTION: "Create a NexoChess account to sync your Archive across devices.",
        AUTH_CANONICAL: productionUrl("/signup")
    }
};

const MINIMAL_CSP = [
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'"
].join("; ");
const ANALYTICS_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/i;

function normalisePathname(pathname) {
    if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
    return pathname;
}

function metadataFor(localizedPathname, basePathname, language) {
    return {
        ...getPageMetadataReplacements(localizedPathname),
        ...(AUTH_METADATA[basePathname] || {}),
        PAGE_LANGUAGE: language
    };
}

function replacePlaceholders(html, replacements) {
    let output = html;
    for (const [key, value] of Object.entries(replacements)) {
        output = output.replaceAll("${" + key + "}", value);
    }
    return output;
}

function isProduction(env) {
    return env.NEXOCHESS_ENV === PRODUCTION_ENVIRONMENT;
}

function runtimeMetadata(env) {
    const environmentMeta = `<meta name="nexochess-environment" content="${env.NEXOCHESS_ENV || "unknown"}">`;
    if (!isProduction(env)) return environmentMeta;

    const measurementId = String(env.GOOGLE_ANALYTICS_MEASUREMENT_ID || "")
        .trim()
        .toUpperCase();
    if (!ANALYTICS_MEASUREMENT_ID_PATTERN.test(measurementId)) {
        return environmentMeta;
    }

    return `${environmentMeta}\n<meta name="nexochess-analytics-measurement-id" content="${measurementId}">`;
}

function injectRuntimeMetadata(html, env) {
    return html.replace("</head>", `${runtimeMetadata(env)}\n</head>`);
}

function withSecurityHeaders(headers, env) {
    const nextHeaders = new Headers(headers);
    nextHeaders.set("Content-Security-Policy", MINIMAL_CSP);
    nextHeaders.set(
        "Permissions-Policy",
        "camera=(), geolocation=(), microphone=(), payment=(), usb=(), browsing-topics=()"
    );
    nextHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
    nextHeaders.set("X-Content-Type-Options", "nosniff");
    nextHeaders.set("X-Frame-Options", "DENY");
    nextHeaders.set("X-XSS-Protection", "0");
    nextHeaders.delete("Server");
    nextHeaders.delete("X-Powered-By");

    if (isProduction(env)) {
        nextHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    } else {
        nextHeaders.delete("Strict-Transport-Security");
    }
    return nextHeaders;
}

function secureResponse(response, env, request) {
    const headers = withSecurityHeaders(response.headers, env);
    const indexingPolicy = getSearchIndexingPolicy(request.url, {
        environment: env.NEXOCHESS_ENV,
        responseStatus: response.status,
        contentType: headers.get("Content-Type")
    });

    if (indexingPolicy.directive) headers.set("X-Robots-Tag", indexingPolicy.directive);
    else headers.delete("X-Robots-Tag");

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

function withPageHeaders(headers, contentType, env) {
    const nextHeaders = new Headers(headers);
    if (contentType) nextHeaders.set("Content-Type", contentType);
    nextHeaders.set("Cache-Control", "no-cache, must-revalidate");

    if (isProduction(env)) {
        nextHeaders.delete("Pragma");
        nextHeaders.delete("Expires");
    } else {
        nextHeaders.set("Pragma", "no-cache");
        nextHeaders.set("Expires", "0");
    }
    return nextHeaders;
}

function isImmutableBundleUrl(url) {
    if (!url.pathname.endsWith(".bundle.js")) return false;
    if (url.searchParams.has("v")) return true;
    return /\.[0-9a-f]{8}\.bundle\.js$/i.test(url.pathname);
}

function withStaticAssetCaching(response, request) {
    if (!response.ok || !isImmutableBundleUrl(new URL(request.url))) return response;

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

function withApiHeaders(headers, contentType) {
    const nextHeaders = new Headers(headers);
    if (contentType) nextHeaders.set("Content-Type", contentType);
    nextHeaders.set("Cache-Control", "no-store");
    return nextHeaders;
}

function jsonResponse(body, status = 200, headers = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: withApiHeaders(new Headers(headers), "application/json; charset=utf-8")
    });
}

function methodNotAllowedResponse(allowedMethods) {
    return jsonResponse({ error: "Method not allowed." }, 405, {
        Allow: allowedMethods.join(", ")
    });
}

function isJsonContentType(request) {
    const contentType = request.headers.get("Content-Type") || "";
    return contentType.toLowerCase().split(";", 1)[0].trim() === "application/json";
}

async function serveAsset(env, request, assetPath, replacements = {}) {
    const assetUrl = new URL(`/apps/${assetPath}`, request.url);
    const assetResponse = await env.ASSETS.fetch(assetUrl);
    if (!assetResponse.ok) return assetResponse;

    const contentType = assetResponse.headers.get("Content-Type") || "";
    if (!contentType.toLowerCase().includes("text/html")) return assetResponse;

    let html = await assetResponse.text();
    html = replacePlaceholders(html, replacements);
    html = injectRuntimeMetadata(html, env);

    return new Response(html, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers: withPageHeaders(assetResponse.headers, "text/html; charset=utf-8", env)
    });
}

async function servePage(env, request, pathname, languageRoute) {
    const assetPath = PAGE_ROUTES.get(pathname);
    if (!assetPath) return null;

    return serveAsset(
        env,
        request,
        assetPath,
        metadataFor(languageRoute.localizedPathname, pathname, languageRoute.language)
    );
}

async function serveGeneratedSearchAsset(env, request, pathname) {
    const indexingEnabled = isCanonicalProductionSearchRequest(
        request.url,
        env.NEXOCHESS_ENV
    );
    const body = pathname === "/robots.txt"
        ? renderRobotsTxt({ indexingEnabled })
        : renderSitemapXml();
    const contentType = pathname === "/robots.txt"
        ? "text/plain; charset=utf-8"
        : "application/xml; charset=utf-8";

    return new Response(body, {
        status: 200,
        headers: withPageHeaders(new Headers(), contentType, env)
    });
}

async function handleRootRecoveryRoute(env, request, languageRoute) {
    const response = await servePage(env, request, "/", languageRoute);
    if (!response) return null;

    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, follow, noarchive");
    headers.set("Link", `<${productionUrl(languageRoute.localizedPathname)}>; rel="canonical"`);
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

async function handleAnalysisRecoveryRoute(env, request, languageRoute) {
    const response = await servePage(env, request, "/analysis", languageRoute);
    if (!response) return null;

    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, follow, noarchive");
    headers.set("Link", `<${productionUrl(languageRoute.localizedPathname)}>; rel="canonical"`);
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

async function routeRequest(env, request) {
    const url = new URL(request.url);
    const canonicalRedirect = getProductionCanonicalRedirect(url, env.NEXOCHESS_ENV);
    if (canonicalRedirect) {
        return new Response(null, {
            status: PERMANENT_CANONICAL_REDIRECT_STATUS,
            headers: { Location: canonicalRedirect }
        });
    }

    const defaultLanguageRedirect = getDefaultLanguageAliasRedirect(url);
    if (defaultLanguageRedirect) {
        return new Response(null, {
            status: PERMANENT_CANONICAL_REDIRECT_STATUS,
            headers: { Location: defaultLanguageRedirect }
        });
    }

    const pathname = normalisePathname(url.pathname);
    if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
        return serveGeneratedSearchAsset(env, request, pathname);
    }

    if (pathname === "/home") {
        const languageRoute = parseLocalizedPathname(pathname);
        languageRoute.localizedPathname = localizePathname("/", languageRoute.language);
        return handleRootRecoveryRoute(env, request, languageRoute);
    }

    if (pathname === "/analysis-entry") {
        const languageRoute = parseLocalizedPathname(pathname);
        languageRoute.localizedPathname = localizePathname("/analysis", languageRoute.language);
        return handleAnalysisRecoveryRoute(env, request, languageRoute);
    }

    if (pathname.startsWith(AUTH_PATH)) {
        const auth = await getCloudflareAuth(env);
        return auth.handler(request);
    }

    if (pathname.startsWith("/api/")) {
        if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && !isJsonContentType(request)) {
            return jsonResponse({ error: "Content-Type must be application/json." }, 415);
        }
        const apiResponse = await handleCloudflareApi(env, request);
        if (apiResponse) return apiResponse;
    }

    const languageRoute = parseLocalizedPathname(pathname);
    const pageResponse = await servePage(
        env,
        request,
        languageRoute.basePathname,
        languageRoute
    );
    if (pageResponse) return pageResponse;

    return env.ASSETS.fetch(request);
}

export default {
    async fetch(request, env) {
        await ensureCloudflareData(env);
        const response = await routeRequest(env, request);
        const secured = secureResponse(response, env, request);
        return withStaticAssetCaching(secured, request);
    }
};