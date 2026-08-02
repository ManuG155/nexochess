const DEFAULT_ORIGIN =
    "https://nexochess-production.manuel-garcia-villaescusa.workers.dev";
const PUZZLE_DATA_ORIGIN =
    "https://nexochess-puzzle-data-staging.manuel-garcia-villaescusa.workers.dev";
const EXPECTED_PUZZLES = 6_057_356;

const origin = (process.argv[2] || DEFAULT_ORIGIN).replace(/\/$/, "");

async function request(path, options = {}) {
    const response = await fetch(`${origin}${path}`, {
        redirect: "manual",
        cache: "no-store",
        ...options
    });

    return response;
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

async function assertPage(path) {
    const response = await request(path);
    const contentType = response.headers.get("content-type") || "";
    const robots = response.headers.get("x-robots-tag");

    assert(response.status === 200, `${path} returned HTTP ${response.status}.`);
    assert(contentType.includes("text/html"), `${path} is not HTML.`);
    assert(!robots, `${path} is still blocked by X-Robots-Tag: ${robots}.`);

    console.log(`OK ${path}: HTTP 200, indexable HTML`);
}

await assertPage("/analysis");
await assertPage("/archive");
await assertPage("/puzzles");
await assertPage("/signin");

const sessionResponse = await request("/auth/account/get-session");
const sessionBody = await sessionResponse.text();
assert(
    sessionResponse.status === 200,
    `Better Auth returned HTTP ${sessionResponse.status}.`
);
assert(
    sessionBody.trim() === "null",
    `Unexpected anonymous session response: ${sessionBody.slice(0, 200)}`
);
console.log("OK Better Auth: anonymous session returned HTTP 200");

const profileResponse = await request("/api/account/profile");
assert(
    profileResponse.status === 401,
    `Protected profile returned HTTP ${profileResponse.status} instead of 401.`
);
console.log("OK protected API: anonymous profile returned HTTP 401");

const catalogueResponse = await fetch(`${PUZZLE_DATA_ORIGIN}/catalogue.json`, {
    cache: "no-store"
});
assert(
    catalogueResponse.status === 200,
    `Puzzle catalogue returned HTTP ${catalogueResponse.status}.`
);

const catalogue = await catalogueResponse.json();
assert(
    Number(catalogue.count) === EXPECTED_PUZZLES,
    `Puzzle catalogue contains ${catalogue.count} instead of ${EXPECTED_PUZZLES}.`
);
console.log(`OK puzzle data: ${EXPECTED_PUZZLES.toLocaleString("es-ES")} puzzles`);

console.log("\nPRODUCTION WORKER VERIFICATION PASSED");
console.log(origin);
