import {
    PuzzleProfile,
    PuzzleSource
} from "../types";
import {
    trackPuzzleFailed,
    trackPuzzleSolved
} from "@/lib/analytics";

const DATABASE_NAME = "nexochess-puzzles";
const DATABASE_VERSION = 1;
const COMPLETION_STORE = "completions";
const FALLBACK_COMPLETIONS_KEY = "nexochess-puzzle-completions-v1";
const PROFILE_KEY = "nexochess-puzzle-profile-v1";
const CLOUD_PROGRESS_URL = "/api/puzzles/progress";

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

interface CloudPuzzleProgress {
    profile: PuzzleProfile | null;
    completions: string[];
}

let cloudProgressRequest: Promise<CloudPuzzleProgress | undefined> | undefined;

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

function saveFallbackCompletions(ids: Iterable<string>) {
    const storedIds = new Set(readFallbackCompletions());
    for (const id of ids) storedIds.add(id);

    localStorage.setItem(
        FALLBACK_COMPLETIONS_KEY,
        JSON.stringify([...storedIds])
    );
}

function saveFallbackCompletion(id: string) {
    saveFallbackCompletions([id]);
}

function isPuzzleProfile(value: unknown): value is PuzzleProfile {
    const profile = value as PuzzleProfile | undefined;

    return Boolean(
        profile
        && typeof profile.rating == "number"
        && typeof profile.attempts == "number"
        && typeof profile.correct == "number"
        && typeof profile.streak == "number"
        && typeof profile.bestStreak == "number"
    );
}

function savePuzzleProfile(profile: PuzzleProfile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

async function loadCloudProgress() {
    if (!cloudProgressRequest) {
        cloudProgressRequest = fetch(CLOUD_PROGRESS_URL, {
            cache: "no-store"
        }).then(async response => {
            if (!response.ok) return;

            const value = await response.json() as Partial<CloudPuzzleProgress>;
            const completions = Array.isArray(value.completions)
                ? value.completions.filter(id => typeof id == "string")
                : [];

            return {
                profile: isPuzzleProfile(value.profile)
                    ? value.profile
                    : null,
                completions
            };
        }).catch(() => undefined);
    }

    return await cloudProgressRequest;
}

async function saveCloudCompletions(completions: Array<{
    id: string;
    source: PuzzleSource;
    solvedWithoutHelp: boolean;
}>) {
    if (completions.length == 0) return;

    try {
        await fetch(`${CLOUD_PROGRESS_URL}/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(completions)
        });
    } catch {
        // Local IndexedDB remains the offline source of truth.
    }
}

async function saveCloudProfile(profile: PuzzleProfile) {
    try {
        await fetch(`${CLOUD_PROGRESS_URL}/profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile)
        });
    } catch {
        // localStorage remains the offline source of truth.
    }
}

async function readIndexedCompletionIds() {
    if (typeof indexedDB == "undefined") {
        return readFallbackCompletions();
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
        return ids.map(String);
    } catch {
        return readFallbackCompletions();
    }
}

async function storeLocalCompletions(completions: PuzzleCompletion[]) {
    saveFallbackCompletions(completions.map(completion => completion.id));

    if (typeof indexedDB == "undefined" || completions.length == 0) return;

    try {
        const database = await openProgressDatabase();

        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(
                COMPLETION_STORE,
                "readwrite"
            );
            const store = transaction.objectStore(COMPLETION_STORE);

            for (const completion of completions) store.put(completion);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });

        database.close();
    } catch {
        // The localStorage fallback already preserved every identifier.
    }
}

export async function getCompletedPuzzleIds() {
    const localIds = new Set(await readIndexedCompletionIds());
    const cloudProgress = await loadCloudProgress();

    if (!cloudProgress) return localIds;

    const cloudIds = new Set(cloudProgress.completions);
    const mergedIds = new Set([...localIds, ...cloudIds]);
    const now = new Date().toISOString();

    await storeLocalCompletions(
        [...cloudIds]
            .filter(id => !localIds.has(id))
            .map(id => ({
                id,
                source: id.startsWith("archive:") ? "archive" : "lichess",
                completedAt: now,
                solvedWithoutHelp: false
            }))
    );

    const localProfile = getPuzzleProfile();
    if (
        cloudProgress.profile
        && cloudProgress.profile.attempts > localProfile.attempts
    ) {
        savePuzzleProfile(cloudProgress.profile);
    } else if (
        localProfile.attempts > (cloudProgress.profile?.attempts || 0)
    ) {
        void saveCloudProfile(localProfile);
    }

    const localOnly = [...localIds]
        .filter(id => !cloudIds.has(id))
        .slice(0, 1_000)
        .map(id => ({
            id,
            source: id.startsWith("archive:")
                ? "archive" as const
                : "lichess" as const,
            solvedWithoutHelp: false
        }));

    void saveCloudCompletions(localOnly);
    return mergedIds;
}

export async function markPuzzleCompleted(
    id: string,
    source: PuzzleSource,
    solvedWithoutHelp: boolean
) {
    const completion: PuzzleCompletion = {
        id,
        source,
        completedAt: new Date().toISOString(),
        solvedWithoutHelp
    };

    saveFallbackCompletion(id);
    await storeLocalCompletions([completion]);

    if (solvedWithoutHelp) {
        trackPuzzleSolved(source);
    } else {
        trackPuzzleFailed(source);
    }

    void saveCloudCompletions([{
        id,
        source,
        solvedWithoutHelp
    }]);
}

export function getPuzzleProfile(): PuzzleProfile {
    try {
        const value = JSON.parse(
            localStorage.getItem(PROFILE_KEY) || "null"
        );

        if (isPuzzleProfile(value)) return value;
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

    savePuzzleProfile(updated);
    void saveCloudProfile(updated);

    return updated;
}
