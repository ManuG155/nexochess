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

function withApiHeaders(headers, contentType) {
    const nextHeaders = new Headers(headers);
    if (contentType) nextHeaders.set("Content-Type", contentType);
    nextHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    nextHeaders.set("Pragma", "no-cache");
    nextHeaders.set("Expires", "0");
    nextHeaders.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return nextHeaders;
}

function textDocument(request, env, body, contentType, status = 200) {
    return new Response(request.method === "HEAD" ? null : body, {
        status,
        headers: withPageHeaders({}, contentType, env)
    });
}

async function renderPage(request, env, filepath, replacements = {}, status = 200) {
    const assetUrl = new URL(`/apps/${filepath}`, request.url);
    const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, {
        method: "GET",
        headers: request.headers
    }));
    if (!assetResponse.ok) return assetResponse;

    const html = replacePlaceholders(await assetResponse.text(), replacements);
    return new Response(request.method === "HEAD" ? null : html, {
        status,
        headers: withPageHeaders(assetResponse.headers, "text/html; charset=utf-8", env)
    });
}

async function renderHomepageRecovery(request, env, language) {
    const localizedRoot = localizePathname("/", language);
    const pageResponse = await renderPage(
        request,
        env,
        "home.html",
        metadataFor(localizedRoot, "/", language)
    );
    const headers = new Headers(pageResponse.headers);
    headers.set("Clear-Site-Data", '"cache"');

    if (!pageResponse.ok || request.method === "HEAD") {
        return new Response(pageResponse.body, {
            status: pageResponse.status,
            statusText: pageResponse.statusText,
            headers
        });
    }

    const recoveryScript = `<script>(async()=>{const root=${JSON.stringify(localizedRoot)};try{const response=await fetch(root,{cache:"reload",credentials:"same-origin",redirect:"follow"});if(response.ok&&new URL(response.url,location.href).pathname===root){history.replaceState(history.state,"",root);}}catch{}})();</script>`;
    const html = (await pageResponse.text()).replace(
        "</head>",
        `${recoveryScript}\n</head>`
    );

    return new Response(html, {
        status: pageResponse.status,
        statusText: pageResponse.statusText,
        headers
    });
}

function json(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: withApiHeaders({ "Content-Type": "application/json; charset=utf-8" })
    });
}

async function getCloudflareBackend(request, env) {
    try {
        const auth = getCloudflareAuth(env, request);
        await ensureCloudflareData(auth, env);
        return auth;
    } catch (error) {
        console.error("Cloudflare backend initialisation failed", error);
        return null;
    }
}

function redirectToCanonicalProductionOrigin(request, env) {
    const target = getProductionCanonicalRedirect(request.url, env);
    return target ? Response.redirect(target, PERMANENT_CANONICAL_REDIRECT_STATUS) : null;
}

async function handleRequest(request, env) {
    const canonicalRedirect = redirectToCanonicalProductionOrigin(request, env);
    if (canonicalRedirect) return canonicalRedirect;

    const url = new URL(request.url);
    const rawPathname = normalisePathname(url.pathname);

    if (rawPathname === AUTH_PATH || rawPathname.startsWith(`${AUTH_PATH}/`)) {
        const auth = await getCloudflareBackend(request, env);
        return auth
            ? auth.handler(request)
            : json({ error: "Cloudflare authentication is not configured yet." }, 503);
    }

    if (rawPathname.startsWith("/api/")) {
        const auth = await getCloudflareBackend(request, env);
        return auth
            ? handleCloudflareApi(request, env, auth)
            : json({ error: "The Cloudflare data service is not configured yet." }, 503);
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    const indexingEnabled = isCanonicalProductionSearchRequest(url, env.NEXOCHESS_ENV);
    if (rawPathname === "/robots.txt") {
        return textDocument(request, env, renderRobotsTxt({ indexingEnabled }), "text/plain; charset=utf-8");
    }
    if (rawPathname === "/sitemap.xml") {
        return indexingEnabled
            ? textDocument(request, env, renderSitemapXml(), "application/xml; charset=utf-8")
            : textDocument(request, env, "Not Found\n", "text/plain; charset=utf-8", 404);
    }

    const englishAlias = getDefaultLanguageAliasRedirect(url);
    if (englishAlias) return Response.redirect(englishAlias, 308);

    const languageRoute = parseLocalizedPathname(rawPathname);
    const pathname = languageRoute.basePathname;
    const localizedPathname = languageRoute.localizedPathname;

    if (pathname === "/home") {
        return renderHomepageRecovery(request, env, languageRoute.language);
    }

    if (pathname.startsWith("/news")) {
        return Response.redirect(
            new URL(localizePathname("/analysis", languageRoute.language), request.url),
            308
        );
    }

    if (pathname === "/settings" || pathname.startsWith("/settings/")) {
        return renderPage(
            request,
            env,
            "settings.html",
            metadataFor(localizedPathname, "/settings", languageRoute.language)
        );
    }

    const filepath = PAGE_ROUTES.get(pathname);
    if (filepath) {
        return renderPage(
            request,
            env,
            filepath,
            metadataFor(localizedPathname, pathname, languageRoute.language)
        );
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) return assetResponse;
    return renderPage(request, env, "unfound.html", {}, 404);
}

export default {
    async fetch(request, env) {
        return secureResponse(await handleRequest(request, env), env, request);
    }
};
