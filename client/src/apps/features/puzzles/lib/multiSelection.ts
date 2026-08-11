import {
    PuzzleDifficulty,
    PuzzleProfile,
    PuzzleThemeSelection
} from "../types";
import { loadNextLichessPuzzleRecord } from "./sources";

function randomIndex(length: number) {
    if (length <= 1) return 0;

    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);

    return randomValues[0] % length;
}

function normaliseSelections(selections: PuzzleThemeSelection[]) {
    const values = selections.length > 0
        ? selections
        : [{ category: "all" } as PuzzleThemeSelection];
    const unique = new Map<string, PuzzleThemeSelection>();

    values.forEach(selection => {
        const key = [
            selection.category,
            selection.kind || "category",
            selection.value || "all"
        ].join(":");

        unique.set(key, selection);
    });

    return [...unique.values()];
}

export async function loadNextLichessPuzzleFromSelections(
    completed: Set<string>,
    selections: PuzzleThemeSelection[],
    difficulty: PuzzleDifficulty,
    profile: PuzzleProfile
) {
    const pool = normaliseSelections(selections);
    const start = randomIndex(pool.length);
    const ordered = [
        ...pool.slice(start),
        ...pool.slice(0, start)
    ];

    for (const selection of ordered) {
        const record = await loadNextLichessPuzzleRecord(
            completed,
            selection,
            difficulty,
            profile
        );

        if (record) return record;
    }
}
