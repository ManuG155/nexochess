import { Classification } from "shared/constants/Classification";
import Evaluation from "shared/types/game/position/Evaluation";

export type PuzzleSource = "archive" | "lichess";

export type PuzzleThemeCategory =
    | "all"
    | "checkmate"
    | "tactics"
    | "attack"
    | "defense"
    | "advantage"
    | "endgame"
    | "opening"
    | "phase"
    | "length"
    | "master";

export interface PuzzleThemeSelection {
    category: PuzzleThemeCategory;
    kind?: "theme" | "opening";
    value?: string;
}

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
    openingTags: string[];
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
    openingTags: string[];
    gameUrl?: string;
}

export interface PuzzleCatalogueItem {
    value: string;
    count: number;
}

export interface PuzzleStaticAsset {
    path: string;
    count: number;
    bytes: number;
}

export interface PuzzleStaticFilter {
    count: number;
    shards: PuzzleStaticAsset[];
}

export interface PuzzleCatalogue {
    count: number;
    themes: PuzzleCatalogueItem[];
    openingTags: PuzzleCatalogueItem[];
    importedAt?: string;
    generatedAt?: string;
    dataPackSize?: number;
    dataPacks?: PuzzleStaticAsset[];
    filters?: Record<string, PuzzleStaticFilter>;
}

export interface PuzzleProfile {
    rating: number;
    attempts: number;
    correct: number;
    streak: number;
    bestStreak: number;
}
