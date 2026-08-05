const ENVIRONMENTS = {
    staging: {
        origin: "https://nexochess-staging.manuel-garcia-villaescusa.workers.dev",
        puzzleOrigin: "https://nexochess-puzzle-data-staging.manuel-garcia-villaescusa.workers.dev",
        shouldBeIndexable: false
    },
    production: {
        origin: "https://www.nexochess.com",
        puzzleOrigin: "https://nexochess-puzzle-data-production.manuel-garcia-villaescusa.workers.dev",
        shouldBeIndexable: true
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

async function assertPage(path) {
    const response = await request(path);
    const contentType = response.headers.get("content-type") || "";
    const robots = response.headers.get("x-robots-tag") || "";

    assert(response.status === 200, `${path} returned HTTP ${response.status}.`);
    assert(contentType.includes("text/html"), `${path} is not HTML.`);
    assertSecurityHeaders(response, path);

    if (environment.shouldBeIndexable) {
        assert(!robots, `${path} is unexpectedly blocked by X-Robots-Tag: ${robots}.`);
    } else {
        assert(robots.includes("noindex"), `${path} is not protected from indexing.`);
    }

    console.log(`OK ${path}: HTTP 200 and security headers present`);
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
    assertSecurityHeaders(response, path);
    console.log(`OK ${path}: JavaScript bundle available`);
}

for (const path of [
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
await assertJavaScript("/settings.bundle.js");

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
