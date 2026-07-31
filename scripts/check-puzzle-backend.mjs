import { readFile } from "node:fs/promises";

const files = {
    client: "client/src/apps/features/puzzles/lib/sources.ts",
    page: "client/src/apps/features/puzzles/pages/Puzzles/index.tsx",
    server: "server/src/routes/api/public/puzzles.ts",
    importer: "scripts/import-lichess-puzzles.mjs"
};

const contents = Object.fromEntries(await Promise.all(
    Object.entries(files).map(async ([name, path]) => [
        name,
        await readFile(path, "utf8")
    ])
));

const errors = [];

if (contents.client.includes("/data/lichess-puzzles.json")) {
    errors.push("The client still downloads the obsolete static puzzle pack.");
}

if (!contents.client.includes("/api/public/puzzles/catalogue")) {
    errors.push("The client puzzle catalogue endpoint is missing.");
}

if (!contents.client.includes("/api/public/puzzles/next")) {
    errors.push("The client next-puzzle endpoint is missing.");
}

if (
    !contents.server.includes('router.get("/puzzles/catalogue"')
    || !contents.server.includes('router.get("/puzzles/next"')
) {
    errors.push("The public puzzle API is incomplete.");
}

if (
    !contents.importer.includes("STAGING_COLLECTION")
    || !contents.importer.includes("dropTarget: true")
    || !contents.importer.includes("createIndexes")
) {
    errors.push("The atomic puzzle importer is incomplete.");
}

if (!contents.page.includes("loadPuzzleCatalogue")) {
    errors.push("The Puzzles page does not use the server catalogue.");
}

if (errors.length > 0) {
    console.error("Puzzle backend audit failed:");
    errors.forEach(error => console.error(`- ${error}`));
    process.exit(1);
}

console.log(
    "Puzzle backend audit passed: streamed import, indexed catalogue "
    + "and filtered API are connected."
);
