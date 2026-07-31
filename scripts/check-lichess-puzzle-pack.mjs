import { readFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import {
    isMainThread,
    parentPort,
    Worker,
    workerData
} from "node:worker_threads";
import { fileURLToPath } from "node:url";

import { Chess } from "chess.js";

const packPath = fileURLToPath(new URL(
    "../client/public/data/lichess-puzzles.json",
    import.meta.url
));

const requiredThemes = new Set([
    "advancedPawn",
    "advantage",
    "anastasiaMate",
    "arabianMate",
    "attackingF2F7",
    "attraction",
    "backRankMate",
    "balestraMate",
    "bishopEndgame",
    "blindSwineMate",
    "bodenMate",
    "capturingDefender",
    "castling",
    "clearance",
    "collinearMove",
    "cornerMate",
    "crushing",
    "defensiveMove",
    "deflection",
    "discoveredAttack",
    "discoveredCheck",
    "doubleBishopMate",
    "doubleCheck",
    "dovetailMate",
    "enPassant",
    "endgame",
    "epauletteMate",
    "equality",
    "exposedKing",
    "fork",
    "hangingPiece",
    "hookMate",
    "interference",
    "intermezzo",
    "killBoxMate",
    "kingsideAttack",
    "knightEndgame",
    "long",
    "master",
    "masterVsMaster",
    "mate",
    "mateIn1",
    "mateIn2",
    "mateIn3",
    "mateIn4",
    "mateIn5",
    "middlegame",
    "morphysMate",
    "oneMove",
    "opening",
    "operaMate",
    "pawnEndgame",
    "pillsburysMate",
    "pin",
    "promotion",
    "queenEndgame",
    "queenRookEndgame",
    "queensideAttack",
    "quietMove",
    "rookEndgame",
    "sacrifice",
    "short",
    "skewer",
    "smotheredMate",
    "superGM",
    "swallowstailMate",
    "trappedPiece",
    "triangleMate",
    "underPromotion",
    "veryLong",
    "vukovicMate",
    "xRayAttack",
    "zugzwang"
]);

async function readPack() {
    return JSON.parse(await readFile(packPath, "utf8"));
}

async function validateSlice(index, total) {
    const pack = await readPack();
    let checked = 0;

    for (
        let puzzleIndex = index;
        puzzleIndex < pack.puzzles.length;
        puzzleIndex += total
    ) {
        const puzzle = pack.puzzles[puzzleIndex];
        const board = new Chess(puzzle.fen);

        puzzle.moves.forEach(move => board.move(move));
        checked += 1;
    }

    return checked;
}

async function validateInWorkers(workerCount) {
    const workers = Array.from(
        { length: workerCount },
        (_, index) => new Promise((resolvePromise, rejectPromise) => {
            const worker = new Worker(new URL(import.meta.url), {
                workerData: { index, total: workerCount }
            });

            worker.once("message", resolvePromise);
            worker.once("error", rejectPromise);
            worker.once("exit", code => {
                if (code != 0) {
                    rejectPromise(new Error(
                        `Puzzle validator ${index} exited with code ${code}.`
                    ));
                }
            });
        })
    );

    const counts = await Promise.all(workers);
    return counts.reduce((total, count) => total + count, 0);
}

async function main() {
    const pack = await readPack();

    if (pack.sourceUrl != "https://database.lichess.org/#puzzles") {
        throw new Error("Unexpected Lichess puzzle source URL.");
    }

    if (pack.license != "CC0-1.0") {
        throw new Error("The puzzle package must declare CC0-1.0.");
    }

    if (!/^[a-f0-9]{64}$/i.test(pack.sourceSha256 || "")) {
        throw new Error("The source SHA-256 is missing or malformed.");
    }

    if (pack.puzzles.length < 50_000) {
        throw new Error("The production package needs at least 50,000 puzzles.");
    }

    const ids = new Set(pack.puzzles.map(puzzle => puzzle.id));
    if (ids.size != pack.puzzles.length) {
        throw new Error("Duplicate Lichess puzzle identifiers found.");
    }

    const themes = new Set(pack.puzzles.flatMap(puzzle => puzzle.themes));
    const missingThemes = [...requiredThemes]
        .filter(theme => !themes.has(theme));

    if (missingThemes.length > 0) {
        throw new Error(
            `Missing official puzzle themes: ${missingThemes.join(", ")}`
        );
    }

    const openingTags = new Set(
        pack.puzzles.flatMap(puzzle => puzzle.openingTags)
    );
    if (openingTags.size < 1_000) {
        throw new Error("Opening coverage is unexpectedly small.");
    }

    const workerCount = Math.min(4, availableParallelism());
    const checked = await validateInWorkers(workerCount);

    if (checked != pack.puzzles.length) {
        throw new Error(
            `Validated ${checked} of ${pack.puzzles.length} puzzles.`
        );
    }

    console.log(
        `Lichess puzzle audit passed: ${checked} legal puzzles, `
        + `${themes.size} themes and ${openingTags.size} opening tags.`
    );
}

if (isMainThread) {
    await main();
} else {
    try {
        const checked = await validateSlice(
            workerData.index,
            workerData.total
        );
        parentPort.postMessage(checked);
    } catch (error) {
        throw error;
    }
}
