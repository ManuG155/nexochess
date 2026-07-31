import { Chess } from "chess.js";

import { Classification } from "shared/constants/Classification";
import {
    getNodeChain
} from "shared/types/game/position/StateTreeNode";
import {
    getTopEngineLine
} from "shared/types/game/position/EngineLine";

import {
    getArchivedGame,
    getArchivedGames
} from "@/lib/gameArchive";

import {
    LichessPuzzleRecord,
    PuzzleCatalogue,
    PuzzleDifficulty,
    PuzzleProfile,
    PuzzleThemeSelection,
    TrainingPuzzle
} from "../types";
import { CALIBRATION_ATTEMPTS } from "./progress";
import { puzzleMatchesThemeSelection } from "./themeCatalogue";

const negativeClassifications = new Set<Classification>([
    Classification.INACCURACY,
    Classification.MISTAKE,
    Classification.MISS,
    Classification.BLUNDER
]);

const ARCHIVE_CONCURRENCY = 6;
const ARCHIVE_REQUEST_TIMEOUT_MS = 20_000;

export interface ArchivePuzzleLibrary {
    puzzles: TrainingPuzzle[];
    analysedGameCount: number;
}

function withTimeout<T>(
    promise: Promise<T>,
    milliseconds: number,
    message: string
) {
    return new Promise<T>((resolve, reject) => {
        let settled = false;
        const timeout = window.setTimeout(() => {
            if (settled) return;

            settled = true;
            reject(new Error(message));
        }, milliseconds);

        promise.then(value => {
            if (settled) return;

            settled = true;
            window.clearTimeout(timeout);
            resolve(value);
        }).catch(error => {
            if (settled) return;

            settled = true;
            window.clearTimeout(timeout);
            reject(error);
        });
    });
}

function validateSolution(fen: string, moves: string[]) {
    const board = new Chess(fen);
    const validMoves: string[] = [];

    for (const uci of moves) {
        try {
            board.move(uci);
            validMoves.push(uci);
        } catch {
            break;
        }
    }

    /*
     * Finish after the solver's move. Seven plies provide enough context
     * without turning a tactic into a full-game memorisation exercise.
     */
    const trimmed = validMoves.slice(0, 7);

    if (trimmed.length % 2 == 0) {
        trimmed.pop();
    }

    return trimmed;
}

function createArchivePuzzleId(
    fingerprint: string,
    nodeId: string
) {
    return `archive:${fingerprint}:${nodeId}`;
}

export async function loadArchivePuzzleLibrary():
    Promise<ArchivePuzzleLibrary> {
    const archiveResponse = await withTimeout(
        getArchivedGames(),
        ARCHIVE_REQUEST_TIMEOUT_MS,
        "The game archive took too long to respond."
    );
    const archive = archiveResponse.games || {};
    const puzzles: TrainingPuzzle[] = [];
    const entries = Object.entries(archive);
    let nextEntryIndex = 0;

    async function loadNextGames() {
        while (nextEntryIndex < entries.length) {
            const entryIndex = nextEntryIndex++;
            const [gameId, metadata] = entries[entryIndex];
            let response:
                Awaited<ReturnType<typeof getArchivedGame>>
                | undefined;

            try {
                response = await withTimeout(
                    getArchivedGame(gameId),
                    ARCHIVE_REQUEST_TIMEOUT_MS,
                    `Archived game ${gameId} took too long to respond.`
                );
            } catch {
                continue;
            }

            if (!response?.game) continue;

            const game = response.game;
            const chain = getNodeChain(game.stateTree);
            const fingerprint =
                game.archiveSummary?.fingerprint
                || metadata.archiveSummary?.fingerprint
                || gameId;

            for (let index = 1; index < chain.length; index++) {
                const node = chain[index];
                const classification = node.state.classification;

                if (
                    !classification
                    || !negativeClassifications.has(classification)
                ) continue;

                const line = getTopEngineLine(node.state.engineLines);
                if (!line?.moves.length) continue;

                const solution = validateSolution(
                    node.state.fen,
                    line.moves.map(move => move.uci)
                );

                if (solution.length == 0) continue;

                const board = new Chess(node.state.fen);
                const solver = board.turn() == "w" ? "white" : "black";
                const whiteName = game.players.white.username || "White";
                const blackName = game.players.black.username || "Black";

                puzzles.push({
                    id: createArchivePuzzleId(fingerprint, node.id),
                    source: "archive",
                    startFen: node.state.fen,
                    previousFen: node.parent?.state.fen,
                    solution,
                    solver,
                    evaluation: line.evaluation,
                    themes: [classification],
                    openingTags: [],
                    classification,
                    badMove: node.state.move?.san,
                    gameLabel: `${whiteName} — ${blackName}`,
                    moveNumber: Math.ceil(index / 2)
                });
            }
        }
    }

    await Promise.all(
        Array.from(
            {
                length: Math.min(
                    ARCHIVE_CONCURRENCY,
                    entries.length
                )
            },
            loadNextGames
        )
    );

    return {
        puzzles,
        analysedGameCount: entries.length
    };
}

export async function loadArchivePuzzles(): Promise<TrainingPuzzle[]> {
    const library = await loadArchivePuzzleLibrary();

    return library.puzzles;
}

export function normaliseLichessPuzzle(
    record: LichessPuzzleRecord
): TrainingPuzzle | null {
    try {
        const board = new Chess(record.fen);
        board.move(record.moves[0]);

        const startFen = board.fen();
        const solution = validateSolution(
            startFen,
            record.moves.slice(1)
        );

        if (solution.length == 0) return null;

        const solver = board.turn() == "w" ? "white" : "black";

        return {
            id: `lichess:${record.id}`,
            source: "lichess",
            startFen,
            previousFen: record.fen,
            solution,
            solver,
            evaluation: {
                type: "centipawn",
                value: 0
            },
            rating: record.rating,
            themes: record.themes,
            openingTags: record.openingTags || [],
            gameUrl: record.gameUrl
        };
    } catch {
        return null;
    }
}

export async function loadPuzzleCatalogue() {
    const response = await fetch("/api/public/puzzles/catalogue");
    if (!response.ok) {
        throw new Error(
            `Unable to load the puzzle catalogue (${response.status}).`
        );
    }

    const catalogue = await response.json() as PuzzleCatalogue;

    if (
        !Number.isFinite(catalogue.count)
        || catalogue.count <= 0
        || !Array.isArray(catalogue.themes)
        || !Array.isArray(catalogue.openingTags)
    ) {
        throw new Error("The puzzle catalogue is empty or malformed.");
    }

    return catalogue;
}

function matchesDifficulty(
    puzzle: { rating?: number },
    difficulty: PuzzleDifficulty,
    profile: PuzzleProfile
) {
    if (!puzzle.rating) return true;

    switch (difficulty) {
        case "adaptive":
            if (profile.attempts < CALIBRATION_ATTEMPTS) return true;

            return (
                puzzle.rating >= profile.rating - 300
                && puzzle.rating <= profile.rating + 300
            );
        case "beginner":
            return puzzle.rating < 1200;
        case "intermediate":
            return puzzle.rating >= 1200 && puzzle.rating < 1800;
        case "advanced":
            return puzzle.rating >= 1800 && puzzle.rating < 2200;
        case "expert":
            return puzzle.rating >= 2200;
    }
}

export function filterPuzzles(
    puzzles: TrainingPuzzle[],
    completed: Set<string>,
    theme: PuzzleThemeSelection,
    difficulty: PuzzleDifficulty,
    profile: PuzzleProfile
) {
    return puzzles.filter(puzzle => (
        !completed.has(puzzle.id)
        && puzzleMatchesThemeSelection(puzzle, theme)
        && matchesDifficulty(puzzle, difficulty, profile)
    ));
}

export async function loadNextLichessPuzzleRecord(
    completed: Set<string>,
    theme: PuzzleThemeSelection,
    difficulty: PuzzleDifficulty,
    profile: PuzzleProfile
) {
    const parameters = new URLSearchParams({
        category: theme.category,
        difficulty,
        rating: String(profile.rating),
        attempts: String(profile.attempts)
    });

    if (theme.kind) parameters.set("kind", theme.kind);
    if (theme.value) parameters.set("value", theme.value);

    const excluded = [...completed]
        .filter(id => id.startsWith("lichess:"))
        .slice(-120);

    if (excluded.length > 0) {
        parameters.set("exclude", excluded.join(","));
    }

    const response = await fetch(
        `/api/public/puzzles/next?${parameters.toString()}`,
        { cache: "no-store" }
    );

    if (response.status == 404) return;

    if (!response.ok) {
        throw new Error(
            `Unable to load the next puzzle (${response.status}).`
        );
    }

    const result = await response.json() as {
        puzzle?: LichessPuzzleRecord;
    };

    if (
        !result.puzzle
        || typeof result.puzzle.id != "string"
        || typeof result.puzzle.fen != "string"
        || !Array.isArray(result.puzzle.moves)
        || !Array.isArray(result.puzzle.themes)
        || !Array.isArray(result.puzzle.openingTags)
    ) {
        throw new Error("The puzzle response is malformed.");
    }

    return result.puzzle;
}

export function pickRandomPuzzle<T>(puzzles: T[]) {
    if (puzzles.length == 0) return;

    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);

    return puzzles[randomValues[0] % puzzles.length];
}
