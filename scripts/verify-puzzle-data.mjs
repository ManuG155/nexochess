const EXPECTED_PUZZLE_COUNT = 6_057_356;
const DEFAULT_ORIGIN =
    "https://nexochess-puzzle-data-production.manuel-garcia-villaescusa.workers.dev";

function normaliseOrigin(value) {
    const url = new URL(value);

    if (url.protocol !== "https:") {
        throw new Error("The puzzle data origin must use HTTPS.");
    }

    url.pathname = "";
    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, "");
}

const origin = normaliseOrigin(process.argv[2] || DEFAULT_ORIGIN);
const response = await fetch(`${origin}/catalogue.json`, {
    headers: {
        Origin: "https://www.nexochess.com"
    },
    cache: "no-store"
});

if (!response.ok) {
    throw new Error(
        `Puzzle catalogue returned HTTP ${response.status} from ${origin}.`
    );
}

const catalogue = await response.json();

if (catalogue?.count !== EXPECTED_PUZZLE_COUNT) {
    throw new Error(
        `Expected ${EXPECTED_PUZZLE_COUNT} puzzles, received ${catalogue?.count}.`
    );
}

const cors = response.headers.get("access-control-allow-origin");
if (cors !== "*") {
    throw new Error(
        `Puzzle data CORS is not public. Received: ${cors || "missing"}.`
    );
}

console.log(`OK puzzle data: ${catalogue.count.toLocaleString("es-ES")} puzzles`);
console.log(`OK CORS: ${cors}`);
console.log(origin);
