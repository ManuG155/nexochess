import {
    PRODUCTION_CANONICAL_HOST,
    PRODUCTION_ENVIRONMENT,
    productionUrl
} from "./site.mjs";

const INDEX_DIRECTIVE =
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const NOINDEX_FOLLOW_DIRECTIVE = "noindex, follow, noarchive";
const NOINDEX_NOFOLLOW_DIRECTIVE = "noindex, nofollow, noarchive";

function freezeRoute(route) {
    return Object.freeze(route);
}

function normaliseHostname(hostname) {
    return String(hostname || "")
        .trim()
        .toLowerCase()
        .replace(/\.$/, "");
}

export const INDEXABLE_PAGE_ROUTES = Object.freeze([
    freezeRoute({
        pathname: "/",
        assetPath: "apps/home.html"
    }),
    freezeRoute({
        pathname: "/analysis",
        assetPath: "apps/features/analysis.html"
    }),
    freezeRoute({
        pathname: "/academy",
        assetPath: "apps/features/academy.html"
    }),
    freezeRoute({
        pathname: "/puzzles",
        assetPath: "apps/features/puzzles.html"
    }),
    freezeRoute({
        pathname: "/help",
        assetPath: "apps/footer/helpCenter.html"
    }),
    freezeRoute({
        pathname: "/terms",
        assetPath: "apps/footer/legal.html"
    }),
    freezeRoute({
        pathname: "/privacy",
        assetPath: "apps/footer/legal.html"
    }),
    freezeRoute({
        pathname: "/source",
        assetPath: "apps/footer/legal.html"
    })
]);

export const NOINDEX_PAGE_RULES = Object.freeze([
    freezeRoute({
        pathname: "/archive",
        match: "exact",
        directive: NOINDEX_FOLLOW_DIRECTIVE,
        reason: "The Archive contains browser-local or account-specific games."
    }),
    freezeRoute({
        pathname: "/signin",
        match: "exact",
        directive: NOINDEX_FOLLOW_DIRECTIVE,
        reason: "Authentication forms are utility pages."
    }),
    freezeRoute({
        pathname: "/signup",
        match: "exact",
        directive: NOINDEX_FOLLOW_DIRECTIVE,
        reason: "Authentication forms are utility pages."
    }),
    freezeRoute({
        pathname: "/auth/reset-password",
        match: "exact",
        directive: NOINDEX_NOFOLLOW_DIRECTIVE,
        reason: "Password-reset links can contain single-use tokens."
    }),
    freezeRoute({
        pathname: "/settings",
        match: "prefix",
        directive: NOINDEX_NOFOLLOW_DIRECTIVE,
        reason: "Settings are user-specific utility pages."
    }),
    freezeRoute({
        pathname: "/profile",
        match: "prefix",
        directive: NOINDEX_FOLLOW_DIRECTIVE,
        reason: "Profile rendering is dynamic and can expose duplicate URLs."
    }),
    freezeRoute({
        pathname: "/internal",
        match: "prefix",
        directive: NOINDEX_NOFOLLOW_DIRECTIVE,
        reason: "Internal administration must never appear in search results."
    }),
    freezeRoute({
        pathname: "/news",
        match: "prefix",
        directive: NOINDEX_FOLLOW_DIRECTIVE,
        reason: "The retired news routes redirect to the analysis application."
    })
]);

export const TECHNICAL_ROBOTS_DISALLOW_PATHS = Object.freeze([
    "/api/",
    "/apps/",
    "/cloudflare-build.json"
]);

export const INDEXING_DIRECTIVES = Object.freeze({
    index: INDEX_DIRECTIVE,
    noindexFollow: NOINDEX_FOLLOW_DIRECTIVE,
    noindexNofollow: NOINDEX_NOFOLLOW_DIRECTIVE
});

export function normaliseIndexingPathname(pathname) {
    if (!pathname) return "/";

    const normalised = pathname.startsWith("/")
        ? pathname
        : `/${pathname}`;

    if (normalised.length > 1 && normalised.endsWith("/")) {
        return normalised.slice(0, -1);
    }

    return normalised;
}

function matchesRule(pathname, rule) {
    if (rule.match === "exact") return pathname === rule.pathname;

    return pathname === rule.pathname
        || pathname.startsWith(`${rule.pathname}/`);
}

export function getIndexablePageRoute(pathname) {
    const normalised = normaliseIndexingPathname(pathname);

    return INDEXABLE_PAGE_ROUTES.find(route => (
        route.pathname === normalised
    )) || null;
}

export function getNoindexPageRule(pathname) {
    const normalised = normaliseIndexingPathname(pathname);

    return NOINDEX_PAGE_RULES.find(rule => (
        matchesRule(normalised, rule)
    )) || null;
}

export function isCanonicalProductionSearchRequest(input, environment) {
    const url = input instanceof URL ? input : new URL(input);

    return environment === PRODUCTION_ENVIRONMENT
        && normaliseHostname(url.hostname) === PRODUCTION_CANONICAL_HOST;
}

function isTechnicalPath(pathname) {
    return TECHNICAL_ROBOTS_DISALLOW_PATHS.some(path => (
        path.endsWith("/")
            ? pathname.startsWith(path)
            : pathname === path
    ));
}

function isHtmlResponse(contentType) {
    return String(contentType || "")
        .toLowerCase()
        .includes("text/html");
}

export function getSearchIndexingPolicy(input, {
    environment,
    responseStatus = 200,
    contentType = ""
} = {}) {
    const url = input instanceof URL ? input : new URL(input);
    const pathname = normaliseIndexingPathname(url.pathname);
    const canonicalProduction = isCanonicalProductionSearchRequest(
        url,
        environment
    );

    if (!canonicalProduction) {
        return {
            indexable: false,
            directive: NOINDEX_NOFOLLOW_DIRECTIVE,
            canonicalUrl: null,
            reason: "Non-production hosts and preview deployments are excluded."
        };
    }

    if (responseStatus >= 400) {
        return {
            indexable: false,
            directive: NOINDEX_NOFOLLOW_DIRECTIVE,
            canonicalUrl: null,
            reason: "Error responses are excluded."
        };
    }

    if (isTechnicalPath(pathname)) {
        return {
            indexable: false,
            directive: NOINDEX_NOFOLLOW_DIRECTIVE,
            canonicalUrl: null,
            reason: "Technical resources are excluded."
        };
    }

    const indexableRoute = getIndexablePageRoute(pathname);
    if (indexableRoute) {
        const canonicalUrl = productionUrl(indexableRoute.pathname);

        if (url.search) {
            return {
                indexable: false,
                directive: NOINDEX_FOLLOW_DIRECTIVE,
                canonicalUrl,
                reason: "Parameterized application states are not standalone pages."
            };
        }

        return {
            indexable: true,
            directive: INDEX_DIRECTIVE,
            canonicalUrl,
            reason: "Public canonical page."
        };
    }

    const noindexRule = getNoindexPageRule(pathname);
    if (noindexRule) {
        return {
            indexable: false,
            directive: noindexRule.directive,
            canonicalUrl: null,
            reason: noindexRule.reason
        };
    }

    if (isHtmlResponse(contentType)) {
        return {
            indexable: false,
            directive: NOINDEX_NOFOLLOW_DIRECTIVE,
            canonicalUrl: null,
            reason: "Unlisted HTML routes default to noindex."
        };
    }

    return {
        indexable: false,
        directive: null,
        canonicalUrl: null,
        reason: "Non-document assets do not need a robots directive."
    };
}

export function renderRobotsTxt({ indexingEnabled = true } = {}) {
    if (!indexingEnabled) {
        return [
            "User-agent: *",
            "Allow: /",
            ""
        ].join("\n");
    }

    return [
        "User-agent: *",
        "Allow: /",
        ...TECHNICAL_ROBOTS_DISALLOW_PATHS.map(path => (
            `Disallow: ${path}`
        )),
        "",
        `Sitemap: ${productionUrl("/sitemap.xml")}`,
        ""
    ].join("\n");
}

function escapeXml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&apos;");
}

export function renderSitemapXml() {
    const entries = INDEXABLE_PAGE_ROUTES.map(route => [
        "    <url>",
        `        <loc>${escapeXml(productionUrl(route.pathname))}</loc>`,
        "    </url>"
    ].join("\n"));

    return [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
        ...entries,
        "</urlset>",
        ""
    ].join("\n");
}
