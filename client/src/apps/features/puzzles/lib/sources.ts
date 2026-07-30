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
    LichessPuzzlePack,
    LichessPuzzleRecord,
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

export async function loadArchivePuzzles(): Promise<TrainingPuzzle[]> {
    const archiveResponse = await getArchivedGames();
    const archive = archiveResponse.games || {};
    const puzzles: TrainingPuzzle[] = [];

    for (const [gameId, metadata] of Object.entries(archive)) {
        const response = await getArchivedGame(gameId);
        if (!response.game) continue;

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

    return puzzles;
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

export async function loadLichessPuzzleRecords() {
    const response = await fetch("/data/lichess-puzzles.json");
    if (!response.ok) return [];

    const pack = await response.json() as LichessPuzzlePack;

    return pack.puzzles;
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

export function filterLichessPuzzleRecords(
    puzzles: LichessPuzzleRecord[],
    completed: Set<string>,
    theme: PuzzleThemeSelection,
    difficulty: PuzzleDifficulty,
    profile: PuzzleProfile
) {
    return puzzles.filter(puzzle => (
        !completed.has(`lichess:${puzzle.id}`)
        && puzzleMatchesThemeSelection(puzzle, theme)
        && matchesDifficulty(puzzle, difficulty, profile)
    ));
}

export function pickRandomPuzzle<T>(puzzles: T[]) {
    if (puzzles.length == 0) return;

    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);

    return puzzles[randomValues[0] % puzzles.length];
}
