import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import {
    createReadStream,
    statSync
} from "node:fs";
import { extname, resolve } from "node:path";
import { createInterface } from "node:readline";
import { PassThrough, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const PUZZLE_COLLECTION = "puzzles";
const STAGING_COLLECTION = "puzzlesImport";
const METADATA_COLLECTION = "puzzleMetadata";
const BATCH_SIZE = 5_000;
const IMPORTER_VERSION = "v4";

function readArguments() {
    const args = process.argv.slice(2);
    const inputArgument = args.find(argument => !argument.startsWith("--"));
    const limitArgument = args.find(argument => argument.startsWith("--limit="));

    if (!inputArgument) {
        console.error(
            "Usage: npm run import:puzzles -- "
            + "<lichess_db_puzzle.csv.zst|lichess_db_puzzle.csv> "
            + "[--limit=10000]"
        );
        process.exit(1);
    }

    const limit = Number.parseInt(limitArgument?.split("=")[1] || "", 10);

    return {
        input: resolve(inputArgument),
        limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
        checkOnly: args.includes("--check-only")
    };
}

function splitValues(value) {
    return String(value || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

function randomKeyFromId(id) {
    let hash = 2166136261;

    for (let index = 0; index < id.length; index++) {
        hash ^= id.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0) / 4294967296;
}

function parsePuzzle(line) {
    const columns = line.split(",");
    columns[0] = columns[0]?.replace(/^\uFEFF/, "");

    if (columns[0] == "PuzzleId" || columns.length < 9) return;

    const id = columns[0];
    const fen = columns[1];
    const moves = splitValues(columns[2]);
    const rating = Number.parseInt(columns[3], 10);
    const popularity = Number.parseInt(columns[5], 10);
    const themes = splitValues(columns[7]);
    const gameUrl = columns[8] || undefined;
    const openingTags = splitValues(columns[9]);

    if (
        !id
        || !fen
        || moves.length < 2
        || !Number.isFinite(rating)
    ) return;

    return {
        _id: id,
        fen,
        moves,
        rating,
        popularity: Number.isFinite(popularity) ? popularity : 0,
        themes,
        openingTags,
        ...(gameUrl ? { gameUrl } : {}),
        randomKey: randomKeyFromId(id)
    };
}

export {
    parsePuzzle,
    randomKeyFromId
};

function incrementCounts(counts, values) {
    for (const value of values) {
        counts.set(value, (counts.get(value) || 0) + 1);
    }
}

function sortedCounts(counts) {
    return [...counts]
        .map(([value, count]) => ({ value, count }))
        .sort((left, right) => (
            right.count - left.count
            || left.value.localeCompare(right.value)
        ));
}

function validateInput(input) {
    const stats = statSync(input);

    if (!stats.isFile()) {
        throw new Error(`The puzzle database path is not a file: ${input}`);
    }

    if (stats.size == 0) {
        throw new Error(`The puzzle database file is empty: ${input}`);
    }
}

function createZstdStream(hashedStream) {
    const output = new PassThrough();
    const decompressor = spawn(
        "zstd",
        ["-dc", "--no-progress"],
        { stdio: ["pipe", "pipe", "pipe"] }
    );
    let stderr = "";
    let finished = false;

    decompressor.stderr.setEncoding("utf8");
    decompressor.stderr.on("data", chunk => {
        stderr = `${stderr}${chunk}`.slice(-4_000);
    });

    decompressor.stdout.pipe(output, { end: false });

    pipeline(hashedStream, decompressor.stdin).catch(error => {
        decompressor.kill();
        output.destroy(error);
    });

    decompressor.on("error", error => {
        output.destroy(new Error(
            "Could not start the zstd decompressor. Rebuild the app image "
            + `before importing. Original error: ${error.message}`
        ));
    });

    decompressor.on("close", code => {
        finished = true;

        if (code == 0) {
            output.end();
            return;
        }

        output.destroy(new Error(
            `zstd could not decompress the puzzle database (exit ${code}). `
            + (stderr.trim() || "No further details were returned.")
        ));
    });

    output.on("close", () => {
        if (!finished) decompressor.kill();
        if (!hashedStream.destroyed) hashedStream.destroy();
    });

    return output;
}

function createInputStream(input, sourceHash) {
    const rawStream = createReadStream(input);
    const hashingStream = new Transform({
        transform(chunk, encoding, callback) {
            sourceHash.update(chunk);
            callback(null, chunk);
        }
    });
    const hashedStream = rawStream.pipe(hashingStream);

    if (extname(input).toLowerCase() != ".zst") return hashedStream;

    const decompressedStream = createZstdStream(hashedStream);
    decompressedStream.on("close", () => {
        if (!rawStream.destroyed) rawStream.destroy();
    });

    return decompressedStream;
}

async function insertBatch(collection, batch) {
    if (batch.length == 0) return;

    await collection.insertMany(batch, { ordered: true });
    batch.length = 0;
}

async function checkSource(input, limit) {
    const sourceHash = createHash("sha256");
    const inputStream = createInputStream(input, sourceHash);
    const lines = createInterface({
        input: inputStream,
        crlfDelay: Infinity
    });
    const target = limit || 1_000;
    let valid = 0;
    let ignored = 0;
    let firstLine;

    for await (const line of lines) {
        if (firstLine == undefined && line.trim()) {
            firstLine = line.slice(0, 300);
        }

        if (parsePuzzle(line)) {
            valid += 1;
        } else {
            ignored += 1;
        }

        if (valid >= target) {
            inputStream.destroy();
            break;
        }
    }

    if (valid == 0) {
        throw new Error(
            `No valid puzzle rows were found after reading ${ignored} lines. `
            + `First decompressed line: ${
                JSON.stringify(firstLine ?? "<no output>")
            }`
        );
    }

    console.log(
        `Source check passed: ${valid.toLocaleString("en-US")} valid puzzles`
        + ` (${ignored.toLocaleString("en-US")} ignored rows).`
    );
}

async function main() {
    const { input, limit, checkOnly } = readArguments();
    validateInput(input);

    console.log(`NexoChess puzzle importer ${IMPORTER_VERSION}`);
    console.log(`Importing puzzles from ${input}`);
    if (limit) console.log(`Test limit enabled: ${limit} puzzles`);

    if (checkOnly) {
        await checkSource(input, limit);
        return;
    }

    const [
        { default: dotenv },
        { MongoClient }
    ] = await Promise.all([
        import("dotenv"),
        import("mongodb")
    ]);
    dotenv.config();

    const databaseUri = process.env.DATABASE_URI
        || "mongodb://database/wintrchess";
    const client = new MongoClient(databaseUri);
    const sourceHash = createHash("sha256");
    const themeCounts = new Map();
    const openingCounts = new Map();
    let imported = 0;
    let ignored = 0;
    let firstDecompressedLine;

    await client.connect();
    const database = client.db();

    try {
        await database
            .collection(STAGING_COLLECTION)
            .drop()
            .catch(error => {
                if (error?.codeName != "NamespaceNotFound") throw error;
            });
        await database.createCollection(STAGING_COLLECTION);

        const staging = database.collection(STAGING_COLLECTION);
        const inputStream = createInputStream(input, sourceHash);
        const lines = createInterface({
            input: inputStream,
            crlfDelay: Infinity
        });
        const batch = [];

        for await (const line of lines) {
            if (firstDecompressedLine == undefined && line.trim()) {
                firstDecompressedLine = line.slice(0, 300);
            }

            const puzzle = parsePuzzle(line);

            if (!puzzle) {
                ignored += 1;
                continue;
            }

            batch.push(puzzle);
            incrementCounts(themeCounts, puzzle.themes);
            incrementCounts(openingCounts, puzzle.openingTags);
            imported += 1;

            if (batch.length >= BATCH_SIZE) {
                await insertBatch(staging, batch);
            }

            if (imported % 100_000 == 0) {
                console.log(
                    `${imported.toLocaleString("en-US")} puzzles imported`
                );
            }

            if (limit && imported >= limit) {
                inputStream.destroy();
                break;
            }
        }

        await insertBatch(staging, batch);

        if (imported == 0) {
            throw new Error(
                `No valid puzzle rows were found after reading ${ignored} lines. `
                + `First decompressed line: ${
                    JSON.stringify(firstDecompressedLine ?? "<no output>")
                }`
            );
        }

        console.log("Creating puzzle indexes. This can take several minutes...");
        await staging.createIndexes([
            {
                key: { randomKey: 1, rating: 1 },
                name: "random_rating"
            },
            {
                key: { themes: 1, randomKey: 1, rating: 1 },
                name: "themes_random_rating"
            },
            {
                key: { openingTags: 1, randomKey: 1, rating: 1 },
                name: "openings_random_rating"
            }
        ]);

        await staging.rename(PUZZLE_COLLECTION, { dropTarget: true });

        const sourceSha256 = limit ? undefined : sourceHash.digest("hex");
        await database.collection(METADATA_COLLECTION).updateOne(
            { _id: "catalogue" },
            {
                $set: {
                    count: imported,
                    themes: sortedCounts(themeCounts),
                    openingTags: sortedCounts(openingCounts),
                    importedAt: new Date().toISOString(),
                    ...(sourceSha256 ? { sourceSha256 } : {}),
                    ...(limit ? { testLimit: limit } : { testLimit: null })
                }
            },
            { upsert: true }
        );

        console.log(
            `Import complete: ${imported.toLocaleString("en-US")} puzzles, `
            + `${themeCounts.size} themes and ${openingCounts.size} openings.`
        );
        console.log(`Ignored rows (including the header): ${ignored}`);
        if (sourceSha256) console.log(`Source SHA-256: ${sourceSha256}`);
    } finally {
        await client.close();
    }
}

if (
    process.argv[1]
    && resolve(process.argv[1]) == fileURLToPath(import.meta.url)
) {
    await main();
}
