import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import {
    createReadStream,
    createWriteStream,
    statSync
} from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { createInterface } from "node:readline";
import { PassThrough, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

import {
    parsePuzzle,
    randomKeyFromId
} from "./import-lichess-puzzles.mjs";

const DEFAULT_LIMIT = 50_000;
const MIN_PER_THEME_AND_LEVEL = 20;
const SCHEMA_PATH = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../cloudflare/d1/puzzles-schema.sql"
);

function readArguments() {
    const args = process.argv.slice(2);
    const positional = args.filter(argument => !argument.startsWith("--"));
    const limitArgument = args.find(argument => argument.startsWith("--limit="));

    if (positional.length < 2) {
        console.error(
            "Usage: node scripts/export-puzzles-d1-sql.mjs "
            + "<lichess_db_puzzle.csv.zst|lichess_db_puzzle.csv> "
            + "<output.sql> [--limit=50000]"
        );
        process.exit(1);
    }

    const parsedLimit = Number.parseInt(
        limitArgument?.split("=")[1] || "",
        10
    );

    return {
        input: resolve(positional[0]),
        output: resolve(positional[1]),
        limit: Number.isFinite(parsedLimit) && parsedLimit > 0
            ? parsedLimit
            : DEFAULT_LIMIT
    };
}

function validateInput(input) {
    const stats = statSync(input);

    if (!stats.isFile() || stats.size === 0) {
        throw new Error(`Invalid or empty puzzle database: ${input}`);
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
            "Could not start zstd. Build the Docker image before exporting. "
            + `Original error: ${error.message}`
        ));
    });

    decompressor.on("close", code => {
        finished = true;

        if (code === 0) {
            output.end();
            return;
        }

        output.destroy(new Error(
            `zstd failed with exit code ${code}. `
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

    if (extname(input).toLowerCase() !== ".zst") return hashedStream;

    return createZstdStream(hashedStream);
}

function addToReservoir(reservoir, puzzle, seen, limit) {
    if (reservoir.length < limit) {
        reservoir.push(puzzle);
        return;
    }

    const replacementIndex = Math.floor(Math.random() * seen);

    if (replacementIndex < limit) {
        reservoir[replacementIndex] = puzzle;
    }
}

function difficultyBucket(rating) {
    if (rating < 1200) return "beginner";
    if (rating < 1800) return "intermediate";
    if (rating < 2200) return "advanced";
    return "expert";
}

function addCoveragePuzzle(reservoirs, seenCounts, key, puzzle) {
    const reservoir = reservoirs.get(key) || [];
    const seen = (seenCounts.get(key) || 0) + 1;

    seenCounts.set(key, seen);
    addToReservoir(
        reservoir,
        puzzle,
        seen,
        MIN_PER_THEME_AND_LEVEL
    );
    reservoirs.set(key, reservoir);
}

function sqlString(value) {
    if (value === undefined || value === null) return "NULL";

    return `'${String(value).replaceAll("'", "''")}'`;
}

function incrementCounts(counts, values) {
    for (const value of values) {
        counts.set(value, (counts.get(value) || 0) + 1);
    }
}

function sortedCounts(counts) {
    return [...counts.entries()].sort((left, right) => (
        right[1] - left[1]
        || left[0].localeCompare(right[0])
    ));
}

function write(stream, value) {
    return new Promise((resolvePromise, rejectPromise) => {
        if (stream.write(value)) {
            resolvePromise();
            return;
        }

        stream.once("drain", resolvePromise);
        stream.once("error", rejectPromise);
    });
}

async function writeBatchedRows(stream, table, columns, rows, batchSize = 100) {
    for (let index = 0; index < rows.length; index += batchSize) {
        const batch = rows.slice(index, index + batchSize);
        const statement = `INSERT INTO ${table} (${columns.join(", ")}) VALUES\n`
            + batch.map(row => `    (${row.join(", ")})`).join(",\n")
            + ";\n";

        await write(stream, statement);
    }
}

async function selectPuzzles(input, limit, sourceHash) {
    const inputStream = createInputStream(input, sourceHash);
    const lines = createInterface({
        input: inputStream,
        crlfDelay: Infinity
    });
    const generalReservoir = [];
    const coverageReservoirs = new Map();
    const seenByCoverage = new Map();
    const openingCoverage = new Map();
    let accepted = 0;
    let ignored = 0;

    for await (const line of lines) {
        const puzzle = parsePuzzle(line);

        if (!puzzle) {
            ignored += 1;
            continue;
        }

        accepted += 1;
        addToReservoir(generalReservoir, puzzle, accepted, limit);

        const level = difficultyBucket(puzzle.rating);

        for (const theme of puzzle.themes) {
            addCoveragePuzzle(
                coverageReservoirs,
                seenByCoverage,
                `${theme}\u0000${level}`,
                puzzle
            );
        }

        for (const openingTag of puzzle.openingTags) {
            const current = openingCoverage.get(openingTag);

            if (!current || puzzle.popularity > current.popularity) {
                openingCoverage.set(openingTag, puzzle);
            }
        }

        if (accepted % 500_000 === 0) {
            console.log(`${accepted.toLocaleString("en-US")} rows sampled...`);
        }
    }

    const selected = new Map();

    for (const reservoir of coverageReservoirs.values()) {
        for (const puzzle of reservoir) selected.set(puzzle._id, puzzle);
    }

    for (const puzzle of openingCoverage.values()) {
        selected.set(puzzle._id, puzzle);
    }

    for (const puzzle of generalReservoir) {
        if (selected.size >= limit) break;
        selected.set(puzzle._id, puzzle);
    }

    if (selected.size > limit) {
        throw new Error(
            `The ${limit} puzzle limit cannot preserve every observed theme, `
            + "difficulty band and opening. Increase --limit."
        );
    }

    console.log(
        `Selected ${selected.size.toLocaleString("en-US")} puzzles from `
        + `${accepted.toLocaleString("en-US")} valid rows `
        + `(${ignored.toLocaleString("en-US")} ignored).`
    );

    return [...selected.values()].sort((left, right) => (
        left._id.localeCompare(right._id)
    ));
}

async function exportSql(output, puzzles, sourceSha256) {
    const schema = await readFile(SCHEMA_PATH, "utf8");
    const stream = createWriteStream(output);
    const themeCounts = new Map();
    const openingCounts = new Map();
    const themeRows = [];
    const openingRows = [];

    await write(stream, `${schema.trim()}\n\n`);

    for (const [index, puzzle] of puzzles.entries()) {
        incrementCounts(themeCounts, puzzle.themes);
        incrementCounts(openingCounts, puzzle.openingTags);

        const openingAvailable = (
            puzzle.themes.includes("opening")
            || puzzle.openingTags.length > 0
        ) ? 1 : 0;
        const integerRandomKey = Math.floor(
            randomKeyFromId(puzzle._id) * 4294967296
        );

        await write(stream,
            "INSERT INTO puzzles ("
            + "id, fen, moves_json, rating, popularity, themes_json, "
            + "opening_tags_json, game_url, random_key, opening_available"
            + ") VALUES ("
            + [
                sqlString(puzzle._id),
                sqlString(puzzle.fen),
                sqlString(JSON.stringify(puzzle.moves)),
                puzzle.rating,
                puzzle.popularity,
                sqlString(JSON.stringify(puzzle.themes)),
                sqlString(JSON.stringify(puzzle.openingTags)),
                sqlString(puzzle.gameUrl),
                integerRandomKey,
                openingAvailable
            ].join(", ")
            + ");\n"
        );

        for (const theme of puzzle.themes) {
            themeRows.push([
                sqlString(puzzle._id),
                sqlString(theme)
            ]);
        }

        for (const openingTag of puzzle.openingTags) {
            openingRows.push([
                sqlString(puzzle._id),
                sqlString(openingTag)
            ]);
        }

        if ((index + 1) % 10_000 === 0) {
            console.log(`${(index + 1).toLocaleString("en-US")} SQL rows written...`);
        }
    }

    await writeBatchedRows(
        stream,
        "puzzle_themes",
        ["puzzle_id", "theme"],
        themeRows
    );
    await writeBatchedRows(
        stream,
        "puzzle_openings",
        ["puzzle_id", "opening_tag"],
        openingRows
    );
    await writeBatchedRows(
        stream,
        "puzzle_theme_counts",
        ["value", "count"],
        sortedCounts(themeCounts).map(([value, count]) => [
            sqlString(value),
            count
        ])
    );
    await writeBatchedRows(
        stream,
        "puzzle_opening_counts",
        ["value", "count"],
        sortedCounts(openingCounts).map(([value, count]) => [
            sqlString(value),
            count
        ])
    );

    await write(stream, `
CREATE INDEX puzzles_random_idx
    ON puzzles(random_key);
CREATE INDEX puzzles_rating_random_idx
    ON puzzles(rating, random_key);
CREATE INDEX puzzle_themes_theme_idx
    ON puzzle_themes(theme, puzzle_id);
CREATE INDEX puzzle_openings_opening_idx
    ON puzzle_openings(opening_tag, puzzle_id);

INSERT INTO puzzle_catalogue (id, count, imported_at, source_sha256)
VALUES (
    1,
    ${puzzles.length},
    ${sqlString(new Date().toISOString())},
    ${sqlString(sourceSha256)}
);

PRAGMA optimize;
`);

    await new Promise((resolvePromise, rejectPromise) => {
        stream.end(resolvePromise);
        stream.on("error", rejectPromise);
    });
}

async function main() {
    const { input, output, limit } = readArguments();
    validateInput(input);

    const sourceHash = createHash("sha256");
    const puzzles = await selectPuzzles(input, limit, sourceHash);
    const sourceSha256 = sourceHash.digest("hex");

    await exportSql(output, puzzles, sourceSha256);

    console.log(`D1 import file written to ${output}`);
    console.log(`Source SHA-256: ${sourceSha256}`);
}

await main();
