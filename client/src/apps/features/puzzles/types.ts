import { Classification } from "shared/constants/Classification";
import Evaluation from "shared/types/game/position/Evaluation";

export type PuzzleSource = "archive" | "lichess";

export type PuzzleTheme =
    | "all"
    | "mate"
    | "fork"
    | "pin"
    | "endgame"
    | "opening"
    | "sacrifice"
    | "defense";

export type PuzzleDifficulty =
    | "adaptive"
    | "beginner"
    | "intermediate"
    | "advanced"
    | "expert";

export interface TrainingPuzzle {
    id: string;
    source: PuzzleSource;
    startFen: string;
    previousFen?: string;
    solution: string[];
    solver: "white" | "black";
    evaluation: Evaluation;
    rating?: number;
    themes: string[];
    gameUrl?: string;
    classification?: Classification;
    badMove?: string;
    gameLabel?: string;
    moveNumber?: number;
}

export interface LichessPuzzleRecord {
    id: string;
    fen: string;
    moves: string[];
    rating: number;
    popularity: number;
    themes: string[];
    gameUrl?: string;
}

export interface LichessPuzzlePack {
    source: string;
    sourceUrl: string;
    license: "CC0-1.0";
    generatedAt: string;
    puzzles: LichessPuzzleRecord[];
}

export interface PuzzleProfile {
    rating: number;
    attempts: number;
    correct: number;
    streak: number;
    bestStreak: number;
}
