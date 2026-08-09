import {
    getSearchIndexingPolicy,
    isCanonicalProductionSearchRequest,
    renderRobotsTxt,
    renderSitemapXml
} from "../config/search-indexing.mjs";
import {
    PRODUCTION_CANONICAL_ORIGIN,
    PRODUCTION_PUZZLE_ORIGIN,
    STAGING_ORIGIN,
    STAGING_PUZZLE_ORIGIN
} from "../config/site.mjs";

const ENVIRONMENTS = {
    staging: {
        origin: STAGING_ORIGIN,
        puzzleOrigin: STAGING_PUZZLE_ORIGIN
    },
    production: {
        origin: PRODUCTION_CANONICAL_ORIGIN,
        puzzleOrigin: PRODUCTION_PUZZLE_ORIGIN
    }
};
const EXPECTED_PUZZLES = 6_057_356;
const SEARCH_PROPAGATION_ATTEMPTS = 8;
const SEARCH_PROPAGATION_DELAY_MS = 1_500;

function argument(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

const environmentName = argument("--environment") || "staging";
const environment = ENVIRONMENTS[environmentName];
if (!environment) {
    throw new Error("Use --environment staging or --environment production.");
}

const origin = (argument("--origin") || environment.origin).replace(/\/$/, "");
const puzzleOrigin = (
    argument("--puzzle-origin") || environment.puzzleOrigin
).replace(/\/$/, "");

async function request(path, options = {}) {
    return fetch(`${origin}${path}`, {
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(20_000),
        ...options
    });
}

function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function requestSearchDocument(pathname, {
    expectedStatus,
    expectedContentType,
    expectedBody
}) {
    let lastResponse = null;
    let lastBody = "";

    for (let attempt = 1; attempt <= SEARCH_PROPAGATION_ATTEMPTS; attempt += 1) {
        const nonce = `${Date.now()}-${attempt}`;
        const response = await request(`${pathname}?verify=${nonce}`);
        const body = await response.text();
        const contentType = response.headers.get("content-type") || "";

        lastResponse = response;
        lastBody = body;

        if (
            response.status === expectedStatus
            && contentType.includes(expectedContentType)
            && body === expectedBody
        ) {
            if (attempt > 1) {
                console.log(`OK ${pathname}: current deployment observed after ${attempt} attempts`);
            }
            return { response, body };
        }

        if (attempt < SEARCH_PROPAGATION_ATTEMPTS) {
            console.warn(
                `Waiting for ${pathname} deployment propagation `
                + `(${attempt}/${SEARCH_PROPAGATION_ATTEMPTS})...`
            );
            await delay(SEARCH_PROPAGATION_DELAY_MS);
        }
    }

    return { response: lastResponse, body: lastBody };
}

function assertSecurityHeaders(response, path) {
    const csp = response.headers.get("content-security-policy") || "";
    const permissions = response.headers.get("permissions-policy") || "";

    assert(csp.includes("frame-ancestors 'none'"), `${path} lacks frame protection.`);
    assert(
        response.headers.get("x-content-type-options") === "nosniff",
        `${path} lacks nosniff.`
    );
    assert(
        response.headers.get("x-frame-options") === "DENY",
        `${path} lacks X-Frame-Options DENY.`
    );
    assert(
        response.headers.get("referrer-policy") === "strict-origin-when-cross-origin",
        `${path} has an unexpected Referrer-Policy.`
    );
    assert(permissions.includes("camera=()"), `${path} lacks Permissions-Policy.`);
}

function expectedRobotsDirective(path, response) {
    return getSearchIndexingPolicy(`${origin}${path}`, {
        environment: environmentName,
        responseStatus: response.status,
        contentType: response.headers.get("content-type")
    }).directive || "";
}

async function assertPage(path) {
    const response = await request(path);
    const contentType = response.headers.get("content-type") || "";
    const robots = response.headers.get("x-robots-tag") || "";

    assert(response.status === 200, `${path} returned HTTP ${response.status}.`);
    assert(contentType.includes("text/html"), `${path} is not HTML.`);
    assertSecurityHeaders(response, path);
    assert(
        robots === expectedRobotsDirective(path, response),
        `${path} returned X-Robots-Tag "${robots}" instead of "${expectedRobotsDirective(path, response)}".`
    );

    console.log(`OK ${path}: HTTP 200, security and indexing headers`);
}

async function assertJavaScript(path, { immutable = false } = {}) {
    const response = await request(path);
    const contentType = response.headers.get("content-type") || "";
    const source = await response.text();

    assert(response.status === 200, `${path} returned HTTP ${response.status}.`);
    assert(contentType.includes("javascript"), `${path} is not JavaScript.`);
    assert(
        !source.trimStart().startsWith("<!DOCTYPE html"),
        `${path} returned HTML instead of JavaScript.`
    );

    if (immutable) {
        const cacheControl = response.headers.get("cache-control") || "";
        assert(
            cacheControl.includes("max-age=31536000") && cacheControl.includes("immutable"),
            `${path} is versioned but lacks long-lived immutable browser caching.`
        );
    }

    console.log(
        `OK ${path}: JavaScript bundle available${immutable ? ", immutable cache" : ""}`
    );
}

async function assertSearchFiles() {
    const indexingEnabled = isCanonicalProductionSearchRequest(
        new URL(origin),
        environmentName
    );
    const expectedRobots = renderRobotsTxt({ indexingEnabled });
    const expectedSitemap = indexingEnabled ? renderSitemapXml() : "Not Found\n";

    const { response: robotsResponse, body: robotsBody } = await requestSearchDocument(
        "/robots.txt",
        {
            expectedStatus: 200,
            expectedContentType: "text/plain",
            expectedBody: expectedRobots
        }
    );

    assert(robotsResponse.status === 200, "robots.txt did not return HTTP 200.");
    assert(
        (robotsResponse.headers.get("content-type") || "").includes("text/plain"),
        "robots.txt has an unexpected Content-Type."
    );
    assertSecurityHeaders(robotsResponse, "/robots.txt");
    assert(
        robotsBody === expectedRobots,
        `robots.txt does not match the ${environmentName} indexing policy.`
    );

    const { response: sitemapResponse, body: sitemapBody } = await requestSearchDocument(
        "/sitemap.xml",
        {
            expectedStatus: indexingEnabled ? 200 : 404,
            expectedContentType: indexingEnabled ? "application/xml" : "text/plain",
            expectedBody: expectedSitemap
        }
    );
    assertSecurityHeaders(sitemapResponse, "/sitemap.xml");

    if (indexingEnabled) {
        assert(sitemapResponse.status === 200, "Production sitemap did not return HTTP 200.");
        assert(
            (sitemapResponse.headers.get("content-type") || "").includes("application/xml"),
            "Production sitemap has an unexpected Content-Type."
        );
        assert(
            sitemapBody === expectedSitemap,
            `Production sitemap does not match the central indexing policy after ${SEARCH_PROPAGATION_ATTEMPTS} propagation checks.`
        );
    } else {
        assert(
            sitemapResponse.status === 404,
            `Non-production sitemap returned HTTP ${sitemapResponse.status} instead of 404.`
        );
        assert(
            sitemapBody === expectedSitemap,
            "Non-production sitemap returned unexpected content."
        );
    }

    console.log(`OK search files: ${environmentName} robots and sitemap policy`);
}

for (const path of [
    "/",
    "/about",
    "/faq",
    "/analysis",
    "/archive",
    "/puzzles",
    "/settings",
    "/signin",
    "/privacy",
    "/terms",
    "/source",
    "/help"
]) {
    await assertPage(path);
}
await assertPage("/analysis?game=deployment-smoke-test");
await assertJavaScript("/home.bundle.js?v=deployment-smoke-test", { immutable: true });
await assertJavaScript("/about.bundle.js");
await assertJavaScript("/faq.bundle.js");
await assertJavaScript("/settings.bundle.js");
await assertSearchFiles();

const sessionResponse = await request("/auth/account/get-session");
const sessionBody = await sessionResponse.text();
assert(sessionResponse.status === 200, "Better Auth did not return HTTP 200.");
assert(sessionBody.trim() === "null", "Anonymous session response is unexpected.");
assertSecurityHeaders(sessionResponse, "/auth/account/get-session");
console.log("OK Better Auth anonymous session");

const profileResponse = await request("/api/account/profile");
assert(profileResponse.status === 401, "Protected profile did not return HTTP 401.");
assertSecurityHeaders(profileResponse, "/api/account/profile");
console.log("OK protected API isolation");

const invalidProfile = await request("/api/public/profile/%E0%A4%A");
assert(
    invalidProfile.status >= 400 && invalidProfile.status < 500,
    `Malformed public profile was not rejected with HTTP 4xx (got ${invalidProfile.status}).`
);
console.log(`OK malformed public profile rejected: HTTP ${invalidProfile.status}`);

const unknownApi = await request("/api/operations/unknown");
assert(unknownApi.status === 404, "Unknown API route did not return 404.");
console.log("OK public API error handling");

const catalogueResponse = await fetch(`${puzzleOrigin}/catalogue.json`, {
    cache: "no-store",
    signal: AbortSignal.timeout(20_000)
});
assert(catalogueResponse.status === 200, "Puzzle catalogue is unavailable.");
const catalogue = await catalogueResponse.json();
assert(
    Number(catalogue.count) === EXPECTED_PUZZLES,
    `Puzzle catalogue contains ${catalogue.count} instead of ${EXPECTED_PUZZLES}.`
);
console.log(`OK puzzle data: ${EXPECTED_PUZZLES.toLocaleString("es-ES")} puzzles`);

console.log(`\n${environmentName.toUpperCase()} DEPLOYMENT VERIFICATION PASSED`);
console.log(origin);
