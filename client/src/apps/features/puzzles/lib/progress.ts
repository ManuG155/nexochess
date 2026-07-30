import {
    PuzzleProfile,
    PuzzleSource
} from "../types";

const DATABASE_NAME = "nexochess-puzzles";
const DATABASE_VERSION = 1;
const COMPLETION_STORE = "completions";
const FALLBACK_COMPLETIONS_KEY = "nexochess-puzzle-completions-v1";
const PROFILE_KEY = "nexochess-puzzle-profile-v1";

export const CALIBRATION_ATTEMPTS = 12;

const defaultProfile: PuzzleProfile = {
    rating: 1500,
    attempts: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0
};

interface PuzzleCompletion {
    id: string;
    source: PuzzleSource;
    completedAt: string;
    solvedWithoutHelp: boolean;
}

function openProgressDatabase() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(
            DATABASE_NAME,
            DATABASE_VERSION
        );

        request.onupgradeneeded = () => {
            const database = request.result;

            if (!database.objectStoreNames.contains(COMPLETION_STORE)) {
                database.createObjectStore(
                    COMPLETION_STORE,
                    { keyPath: "id" }
                );
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function readFallbackCompletions() {
    try {
        const value = JSON.parse(
            localStorage.getItem(FALLBACK_COMPLETIONS_KEY) || "[]"
        );

        return Array.isArray(value)
            ? value.filter(item => typeof item == "string")
            : [];
    } catch {
        return [];
    }
}

function saveFallbackCompletion(id: string) {
    const ids = new Set(readFallbackCompletions());
    ids.add(id);

    localStorage.setItem(
        FALLBACK_COMPLETIONS_KEY,
        JSON.stringify([...ids])
    );
}

export async function getCompletedPuzzleIds() {
    if (typeof indexedDB == "undefined") {
        return new Set(readFallbackCompletions());
    }

    try {
        const database = await openProgressDatabase();

        const ids = await new Promise<IDBValidKey[]>((resolve, reject) => {
            const transaction = database.transaction(
                COMPLETION_STORE,
                "readonly"
            );

            const request = transaction
                .objectStore(COMPLETION_STORE)
                .getAllKeys();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        database.close();

        return new Set(ids.map(String));
    } catch {
        return new Set(readFallbackCompletions());
    }
}

export async function markPuzzleCompleted(
    id: string,
    source: PuzzleSource,
    solvedWithoutHelp: boolean
) {
    saveFallbackCompletion(id);

    if (typeof indexedDB == "undefined") return;

    try {
        const database = await openProgressDatabase();

        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(
                COMPLETION_STORE,
                "readwrite"
            );

            const completion: PuzzleCompletion = {
                id,
                source,
                completedAt: new Date().toISOString(),
                solvedWithoutHelp
            };

            const request = transaction
                .objectStore(COMPLETION_STORE)
                .put(completion);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        database.close();
    } catch {
        // The localStorage fallback already preserved the identifier.
    }
}

export function getPuzzleProfile(): PuzzleProfile {
    try {
        const value = JSON.parse(
            localStorage.getItem(PROFILE_KEY) || "null"
        );

        if (
            typeof value?.rating == "number"
            && typeof value?.attempts == "number"
            && typeof value?.correct == "number"
            && typeof value?.streak == "number"
            && typeof value?.bestStreak == "number"
        ) {
            return value;
        }
    } catch {
        // Fall back to a fresh calibration profile.
    }

    return { ...defaultProfile };
}

function expectedScore(playerRating: number, puzzleRating: number) {
    return 1 / (1 + 10 ** ((puzzleRating - playerRating) / 400));
}

export function recordRatedAttempt(
    profile: PuzzleProfile,
    puzzleRating: number,
    solvedWithoutHelp: boolean
) {
    const calibrated = profile.attempts >= CALIBRATION_ATTEMPTS;
    const kFactor = calibrated ? 24 : 48;
    const score = solvedWithoutHelp ? 1 : 0;

    const rating = Math.round(Math.min(
        3000,
        Math.max(
            600,
            profile.rating + kFactor * (
                score - expectedScore(profile.rating, puzzleRating)
            )
        )
    ));

    const streak = solvedWithoutHelp ? profile.streak + 1 : 0;

    const updated: PuzzleProfile = {
        rating,
        attempts: profile.attempts + 1,
        correct: profile.correct + score,
        streak,
        bestStreak: Math.max(profile.bestStreak, streak)
    };

    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));

    return updated;
}
