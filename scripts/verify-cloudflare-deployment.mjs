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

async function assertJavaScript(path) {
    const response = await request(path);
    const contentType = response.headers.get("content-type") || "";
    const source = await response.text();

    assert(response.status === 200, `${path} returned HTTP ${response.status}.`);
    assert(contentType.includes("javascript"), `${path} is not JavaScript.`);
    assert(
        !source.trimStart().startsWith("<!DOCTYPE html"),
        `${path} returned HTML instead of JavaScript.`
    );
    console.log(`OK ${path}: JavaScript bundle available`);
}

async function assertSearchFiles() {
    const nonce = Date.now();
    const indexingEnabled = isCanonicalProductionSearchRequest(
        new URL(origin),
        environmentName
    );

    const robotsPath = `/robots.txt?verify=${nonce}`;
    const robotsResponse = await request(robotsPath);
    const robotsBody = await robotsResponse.text();
    const expectedRobots = renderRobotsTxt({ indexingEnabled });

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

    const sitemapPath = `/sitemap.xml?verify=${nonce}`;
    const sitemapResponse = await request(sitemapPath);
    const sitemapBody = await sitemapResponse.text();
    assertSecurityHeaders(sitemapResponse, "/sitemap.xml");

    if (indexingEnabled) {
        assert(sitemapResponse.status === 200, "Production sitemap did not return HTTP 200.");
        assert(
            (sitemapResponse.headers.get("content-type") || "").includes("application/xml"),
            "Production sitemap has an unexpected Content-Type."
        );
        assert(
            sitemapBody === renderSitemapXml(),
            "Production sitemap does not match the central indexing policy."
        );
    } else {
        assert(
            sitemapResponse.status === 404,
            `Non-production sitemap returned HTTP ${sitemapResponse.status} instead of 404.`
        );
        assert(
            sitemapBody === "Not Found\n",
            "Non-production sitemap returned unexpected content."
        );
    }

    console.log(`OK search files: ${environmentName} robots and sitemap policy`);
}

for (const path of [
    "/",
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
await assertJavaScript("/home.bundle.js");
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
assert(invalidProfile.status === 404, "Malformed public profile did not return 404.");

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
