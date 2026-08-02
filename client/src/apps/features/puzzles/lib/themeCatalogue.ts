export * from "./themeCatalogueLegacy";

import type {
    PuzzleCatalogue,
    PuzzleThemeCategory
} from "../types";
import type {
    PuzzleFilterOption
} from "./themeCatalogueLegacy";
import {
    getPuzzleFilterOptions as getLegacyPuzzleFilterOptions
} from "./themeCatalogueLegacy";

const difficultyBuckets = [
    "beginner",
    "intermediate",
    "advanced",
    "expert"
] as const;

const indexedCategoryThemes: Record<
    Exclude<PuzzleThemeCategory, "all" | "opening">,
    readonly string[]
> = {
    checkmate: [
        "mate",
        "mateIn1",
        "mateIn2",
        "mateIn3",
        "mateIn4",
        "mateIn5",
        "anastasiaMate",
        "arabianMate",
        "backRankMate",
        "balestraMate",
        "blindSwineMate",
        "bodenMate",
        "cornerMate",
        "doubleBishopMate",
        "dovetailMate",
        "epauletteMate",
        "hookMate",
        "killBoxMate",
        "morphysMate",
        "operaMate",
        "pillsburysMate",
        "smotheredMate",
        "swallowstailMate",
        "triangleMate",
        "vukovicMate"
    ],
    tactics: [
        "advancedPawn",
        "attraction",
        "capturingDefender",
        "castling",
        "clearance",
        "collinearMove",
        "deflection",
        "discoveredAttack",
        "discoveredCheck",
        "doubleCheck",
        "enPassant",
        "fork",
        "hangingPiece",
        "interference",
        "intermezzo",
        "pin",
        "promotion",
        "quietMove",
        "sacrifice",
        "skewer",
        "trappedPiece",
        "underPromotion",
        "xRayAttack",
        "zugzwang"
    ],
    attack: [
        "attackingF2F7",
        "exposedKing",
        "kingsideAttack",
        "queensideAttack"
    ],
    defense: [
        "defensiveMove",
        "equality"
    ],
    advantage: [
        "advantage",
        "crushing",
        "equality"
    ],
    endgame: [
        "endgame",
        "bishopEndgame",
        "knightEndgame",
        "pawnEndgame",
        "queenEndgame",
        "queenRookEndgame",
        "rookEndgame",
        "advancedPawn",
        "promotion",
        "underPromotion",
        "zugzwang"
    ],
    phase: [
        "opening",
        "middlegame",
        "endgame"
    ],
    length: [
        "oneMove",
        "short",
        "long",
        "veryLong"
    ],
    master: [
        "master",
        "masterVsMaster",
        "superGM"
    ]
};

function indexedThemeCount(
    catalogue: PuzzleCatalogue,
    theme: string
) {
    return difficultyBuckets.reduce((total, difficulty) => (
        total
        + (catalogue.filters?.[
            `theme:${theme}|${difficulty}`
        ]?.count || 0)
    ), 0);
}

export function getPuzzleFilterOptions(
    catalogue: PuzzleCatalogue | undefined,
    category: PuzzleThemeCategory
): PuzzleFilterOption[] {
    if (category == "all") return [];

    if (category == "opening") {
        return getLegacyPuzzleFilterOptions(catalogue, category);
    }

    const catalogueCounts = new Map(
        (catalogue?.themes || []).map(item => [item.value, item.count])
    );

    return indexedCategoryThemes[category]
        .map(value => ({
            kind: "theme" as const,
            value,
            count: catalogue
                ? indexedThemeCount(catalogue, value)
                    || catalogueCounts.get(value)
                    || 0
                : 0
        }))
        .sort((left, right) => (
            right.count - left.count
            || left.value.localeCompare(right.value)
        ));
}
