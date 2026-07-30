import { createReadStream, createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { createInterface } from "node:readline";
import { dirname, extname, resolve } from "node:path";

const DEFAULT_LIMIT = 25_000;
const MIN_POPULARITY = 55;

function readArguments() {
    const [, , inputArgument, outputArgument, limitArgument] = process.argv;

    if (!inputArgument || !outputArgument) {
        console.error(
            "Usage: node scripts/build-lichess-puzzle-pack.mjs "
            + "<lichess.csv|sample.ndjson> <output.json> [limit]"
        );
        process.exit(1);
    }

    const limit = Number.parseInt(limitArgument || "", 10);

    return {
        input: resolve(inputArgument),
        output: resolve(outputArgument),
        limit: Number.isFinite(limit) && limit > 0
            ? limit
            : DEFAULT_LIMIT
    };
}

function normalisePuzzle(raw) {
    const id = raw.PuzzleId || raw.id;
    const fen = raw.FEN || raw.fen;
    const moves = raw.Moves || raw.moves;
    const rating = Number(raw.Rating ?? raw.rating);
    const popularity = Number(raw.Popularity ?? raw.popularity);
    const themes = String(raw.Themes ?? raw.themes ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    const gameUrl = raw.GameUrl || raw.gameUrl;

    if (
        !id
        || !fen
        || !moves
        || !Number.isFinite(rating)
        || moves.trim().split(/\s+/).length < 2
        || (Number.isFinite(popularity) && popularity < MIN_POPULARITY)
    ) return null;

    return {
        id,
        fen,
        moves: moves.trim().split(/\s+/),
        rating,
        popularity: Number.isFinite(popularity) ? popularity : 0,
        themes,
        gameUrl
    };
}

function parseCSVLine(line) {
    const columns = line.split(",");

    if (columns[0] == "PuzzleId" || columns.length < 9) return null;

    return normalisePuzzle({
        PuzzleId: columns[0],
        FEN: columns[1],
        Moves: columns[2],
        Rating: columns[3],
        Popularity: columns[5],
        Themes: columns[7],
        GameUrl: columns[8]
    });
}

function parseNDJSONLine(line) {
    if (!line.trim()) return null;

    try {
        const value = JSON.parse(line);
        return normalisePuzzle(value.puzzle || value);
    } catch {
        return null;
    }
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

async function main() {
    const { input, output, limit } = readArguments();
    const parseLine = extname(input) == ".ndjson"
        ? parseNDJSONLine
        : parseCSVLine;

    const lines = createInterface({
        input: createReadStream(input),
        crlfDelay: Infinity
    });

    const puzzles = [];
    let accepted = 0;

    for await (const line of lines) {
        const puzzle = parseLine(line);
        if (!puzzle) continue;

        accepted++;
        addToReservoir(puzzles, puzzle, accepted, limit);
    }

    puzzles.sort((left, right) => left.id.localeCompare(right.id));

    await mkdir(dirname(output), { recursive: true });

    const stream = createWriteStream(output);

    stream.write(JSON.stringify({
        source: "Lichess Puzzle Database",
        sourceUrl: "https://database.lichess.org/#puzzles",
        license: "CC0-1.0",
        generatedAt: new Date().toISOString(),
        puzzles
    }));

    await new Promise((resolvePromise, rejectPromise) => {
        stream.end(resolvePromise);
        stream.on("error", rejectPromise);
    });

    console.log(
        `Wrote ${puzzles.length} puzzles from ${accepted} accepted rows `
        + `to ${output}`
    );
}

await main();
