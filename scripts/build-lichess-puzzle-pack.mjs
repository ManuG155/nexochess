import { createReadStream, createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { createInterface } from "node:readline";
import { dirname, extname, resolve } from "node:path";

const DEFAULT_LIMIT = 50_000;
const MIN_POPULARITY = 55;
const MIN_PER_THEME_AND_LEVEL = 20;

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
        input: inputArgument == "-" ? "-" : resolve(inputArgument),
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
    const openingTags = String(
        raw.OpeningTags ?? raw.openingTags ?? ""
    )
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
        openingTags,
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
        GameUrl: columns[8],
        OpeningTags: columns[9]
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

function getDifficultyBucket(rating) {
    if (rating < 1200) return "beginner";
    if (rating < 1800) return "intermediate";
    if (rating < 2200) return "advanced";
    return "expert";
}

function addToCoverageReservoir(
    reservoirs,
    seenByReservoir,
    key,
    puzzle
) {
    const reservoir = reservoirs.get(key) || [];
    const seen = (seenByReservoir.get(key) || 0) + 1;

    seenByReservoir.set(key, seen);
    addToReservoir(
        reservoir,
        puzzle,
        seen,
        MIN_PER_THEME_AND_LEVEL
    );
    reservoirs.set(key, reservoir);
}

async function main() {
    const { input, output, limit } = readArguments();
    const parseLine = input != "-" && extname(input) == ".ndjson"
        ? parseNDJSONLine
        : parseCSVLine;

    const lines = createInterface({
        input: input == "-" ? process.stdin : createReadStream(input),
        crlfDelay: Infinity
    });

    const generalReservoir = [];
    const coverageReservoirs = new Map();
    const seenByCoverageReservoir = new Map();
    const openingCoverage = new Map();
    let accepted = 0;

    for await (const line of lines) {
        const puzzle = parseLine(line);
        if (!puzzle) continue;

        accepted++;
        addToReservoir(
            generalReservoir,
            puzzle,
            accepted,
            limit
        );

        const level = getDifficultyBucket(puzzle.rating);

        for (const theme of puzzle.themes) {
            addToCoverageReservoir(
                coverageReservoirs,
                seenByCoverageReservoir,
                `${theme}\u0000${level}`,
                puzzle
            );
        }

        for (const openingTag of puzzle.openingTags) {
            const current = openingCoverage.get(openingTag);

            if (
                !current
                || puzzle.popularity > current.popularity
            ) {
                openingCoverage.set(openingTag, puzzle);
            }
        }
    }

    const selected = new Map();

    for (const reservoir of coverageReservoirs.values()) {
        reservoir.forEach(puzzle => selected.set(puzzle.id, puzzle));
    }

    for (const puzzle of openingCoverage.values()) {
        selected.set(puzzle.id, puzzle);
    }

    for (const puzzle of generalReservoir) {
        if (selected.size >= limit) break;
        selected.set(puzzle.id, puzzle);
    }

    if (selected.size > limit) {
        throw new Error(
            `The ${limit} puzzle limit is too small to preserve every `
            + "observed theme, rating band and opening tag."
        );
    }

    const puzzles = [...selected.values()];
    puzzles.sort((left, right) => left.id.localeCompare(right.id));

    await mkdir(dirname(output), { recursive: true });

    const stream = createWriteStream(output);

    stream.write(JSON.stringify({
        source: "Lichess Puzzle Database",
        sourceUrl: "https://database.lichess.org/#puzzles",
        license: "CC0-1.0",
        sourceSha256: process.env.LICHESS_SOURCE_SHA256 || undefined,
        generatedAt: new Date().toISOString(),
        coverage: {
            themes: [...new Set(
                puzzles.flatMap(puzzle => puzzle.themes)
            )].sort(),
            openingTags: [...new Set(
                puzzles.flatMap(puzzle => puzzle.openingTags)
            )].sort()
        },
        puzzles
    }));

    await new Promise((resolvePromise, rejectPromise) => {
        stream.end(resolvePromise);
        stream.on("error", rejectPromise);
    });

    console.log(
        `Wrote ${puzzles.length} puzzles from ${accepted} accepted rows `
        + `to ${output}. Coverage: `
        + `${new Set(puzzles.flatMap(puzzle => puzzle.themes)).size} themes, `
        + `${new Set(puzzles.flatMap(puzzle => puzzle.openingTags)).size} `
        + "opening tags."
    );
}

await main();
