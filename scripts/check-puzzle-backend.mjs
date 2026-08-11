import { readFile } from "node:fs/promises";

const files = {
    client: "client/src/apps/features/puzzles/lib/sources.ts",
    multiSelection: "client/src/apps/features/puzzles/lib/multiSelection.ts",
    page: "client/src/apps/features/puzzles/pages/Puzzles/index.tsx",
    types: "client/src/apps/features/puzzles/types.ts",
    build: "scripts/build-cloudflare.mjs",
    exporter: "scripts/export-puzzles-static.mjs",
    importer: "scripts/import-lichess-puzzles.mjs",
    remoteVerifier: "scripts/verify-puzzle-data.mjs",
    deploymentVerifier: "scripts/verify-cloudflare-deployment.mjs",
    packageJson: "package.json"
};
const EXPECTED_PRODUCTION_PUZZLE_ORIGIN =
    "https://nexochess-puzzle-data-production.manuel-garcia-villaescusa.workers.dev";

const contents = Object.fromEntries(await Promise.all(
    Object.entries(files).map(async ([name, path]) => [
        name,
        await readFile(path, "utf8")
    ])
));
const packageJson = JSON.parse(contents.packageJson);
const errors = [];

function requireFragments(name, description, fragments) {
    for (const fragment of fragments) {
        if (!contents[name].includes(fragment)) {
            errors.push(`${description} is missing: ${fragment}`);
        }
    }
}

if (contents.client.includes("/data/lichess-puzzles.json")) {
    errors.push("The client still downloads the obsolete monolithic puzzle pack.");
}

for (const obsoleteEndpoint of [
    "/api/public/puzzles/catalogue",
    "/api/public/puzzles/next"
]) {
    if (contents.client.includes(obsoleteEndpoint)) {
        errors.push(
            `The client still uses the retired Mongo puzzle endpoint: ${obsoleteEndpoint}`
        );
    }
}

requireFragments("client", "The static puzzle client", [
    "STATIC_PUZZLE_ORIGIN",
    "loadStaticJson",
    '"catalogue.json"',
    "loadPuzzleCatalogue",
    "loadNextLichessPuzzleRecord",
    "catalogue.dataPackSize",
    "catalogue.dataPacks",
    "catalogue.filters",
    "selected.shard.path",
    "packReference.path",
    "unpackStaticPuzzle"
]);

requireFragments("multiSelection", "The multi-selection puzzle bridge", [
    'import { loadNextLichessPuzzleRecord } from "./sources"',
    "export async function loadNextLichessPuzzleFromSelections(",
    "const record = await loadNextLichessPuzzleRecord("
]);

requireFragments("page", "The Puzzles page connection", [
    "loadPuzzleCatalogue",
    "loadNextLichessPuzzleFromSelections",
    "normaliseLichessPuzzle",
    "const lichessPromise = loadPuzzleCatalogue()",
    "const record = await loadNextLichessPuzzleFromSelections("
]);

requireFragments("types", "The static puzzle catalogue types", [
    "export interface PuzzleStaticAsset",
    "export interface PuzzleStaticFilter",
    "dataPackSize?: number",
    "dataPacks?: PuzzleStaticAsset[]",
    "filters?: Record<string, PuzzleStaticFilter>"
]);

requireFragments("build", "The Cloudflare puzzle-origin build", [
    "DEFAULT_STATIC_PUZZLE_ORIGIN",
    'readArgument("--puzzle-origin")',
    "NEXOCHESS_PUZZLE_ORIGIN",
    "configureStaticPuzzleOrigin",
    "bundle.replaceAll(DEFAULT_STATIC_PUZZLE_ORIGIN, staticPuzzleOrigin)",
    "puzzleDataOrigin: staticPuzzleOrigin",
    "puzzleOriginReplacements"
]);

requireFragments("exporter", "The static puzzle exporter", [
    "DATA_PACK_SIZE",
    "INDEX_SHARD_SIZE",
    "MAX_STATIC_FILES",
    "MAX_STATIC_FILE_BYTES",
    "filterKeysForPuzzle",
    "writeDataPack",
    "writeIndexShards",
    'join(output, "catalogue.json")',
    'join(output, "_headers")',
    "Access-Control-Allow-Origin: *",
    "ordinal !== expectedCount",
    "validateOutput(output)"
]);

requireFragments("importer", "The atomic Mongo source importer", [
    "STAGING_COLLECTION",
    "dropTarget: true",
    "createIndexes"
]);

requireFragments("remoteVerifier", "The remote puzzle-data verifier", [
    "EXPECTED_PUZZLE_COUNT = 6_057_356",
    'fetch(`${origin}/catalogue.json`',
    'response.headers.get("access-control-allow-origin")',
    'cors !== "*"'
]);

requireFragments("deploymentVerifier", "The deployment puzzle smoke test", [
    "EXPECTED_PUZZLES = 6_057_356",
    'fetch(`${puzzleOrigin}/catalogue.json`',
    "Number(catalogue.count) === EXPECTED_PUZZLES"
]);

const productionBuild = packageJson.scripts?.["build:cloudflare:production"] || "";
const productionBuildArguments = productionBuild.trim().split(/\s+/u);
const puzzleOriginArgumentIndexes = productionBuildArguments
    .map((argument, index) => argument === "--puzzle-origin" ? index : -1)
    .filter(index => index >= 0);
const productionPuzzleOrigin = puzzleOriginArgumentIndexes.length === 1
    ? productionBuildArguments[puzzleOriginArgumentIndexes[0] + 1]
    : undefined;

if (productionPuzzleOrigin !== EXPECTED_PRODUCTION_PUZZLE_ORIGIN) {
    errors.push(
        "The production build must select exactly the approved production "
        + "puzzle-data origin."
    );
}

if (packageJson.scripts?.["verify:puzzle-data"] !== "node scripts/verify-puzzle-data.mjs") {
    errors.push("The remote puzzle-data verification script is not exposed through npm.");
}

if (errors.length > 0) {
    console.error("Puzzle backend audit failed:");
    errors.forEach(error => console.error(`- ${error}`));
    process.exit(1);
}

console.log(
    "Puzzle backend audit passed: atomic Mongo import, static Cloudflare "
    + "catalogue, indexed shards, data packs, multi-selection routing and "
    + "environment-specific origins are connected."
);
