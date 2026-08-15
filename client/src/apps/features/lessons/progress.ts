import { FIRST_LESSON_ID } from "./curriculum";

const STORAGE_KEY = "nexochess_lessons_progress_v2";

export interface LessonsProgress {
    version: 2;
    completedLessonIds: string[];
    unlockedLessonIds: string[];
    currentLessonId: string;
}

const EMPTY_PROGRESS: LessonsProgress = {
    version: 2,
    completedLessonIds: [],
    unlockedLessonIds: [FIRST_LESSON_ID],
    currentLessonId: FIRST_LESSON_ID
};

function uniqueStrings(values: unknown): string[] {
    if (!Array.isArray(values)) return [];
    return [...new Set(values.filter((value): value is string => (
        typeof value == "string"
    )))];
}

export function loadLessonsProgress(): LessonsProgress {
    if (typeof localStorage == "undefined") return EMPTY_PROGRESS;

    try {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "");
        if (current?.version == 2) {
            const completedLessonIds = uniqueStrings(current.completedLessonIds);
            const unlockedLessonIds = uniqueStrings(current.unlockedLessonIds);
            if (!unlockedLessonIds.includes(FIRST_LESSON_ID)) {
                unlockedLessonIds.unshift(FIRST_LESSON_ID);
            }

            return {
                version: 2,
                completedLessonIds,
                unlockedLessonIds,
                currentLessonId: typeof current.currentLessonId == "string"
                    ? current.currentLessonId
                    : FIRST_LESSON_ID
            };
        }
    } catch {
        // Try the previous local format below.
    }

    try {
        const previous = JSON.parse(
            localStorage.getItem("nexochess_lessons_progress_v1") || ""
        );
        if (previous?.version == 1) {
            const completedLessonIds = uniqueStrings(previous.completedLessonIds);
            return {
                version: 2,
                completedLessonIds,
                unlockedLessonIds: [FIRST_LESSON_ID],
                currentLessonId: FIRST_LESSON_ID
            };
        }
    } catch {
        // A malformed local value must never block the learning experience.
    }

    return EMPTY_PROGRESS;
}

function persist(progress: LessonsProgress) {
    if (typeof localStorage != "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
    return progress;
}

export function markLessonComplete(
    progress: LessonsProgress,
    lessonId: string,
    nextLessonId?: string
): LessonsProgress {
    const completedLessonIds = progress.completedLessonIds.includes(lessonId)
        ? progress.completedLessonIds
        : [...progress.completedLessonIds, lessonId];

    const unlockedLessonIds = [...progress.unlockedLessonIds];
    if (nextLessonId && !unlockedLessonIds.includes(nextLessonId)) {
        unlockedLessonIds.push(nextLessonId);
    }

    return persist({
        ...progress,
        completedLessonIds,
        unlockedLessonIds,
        currentLessonId: nextLessonId || lessonId
    });
}

export function unlockLessonsThrough(
    progress: LessonsProgress,
    orderedLessonIds: string[],
    targetLessonId: string
): LessonsProgress {
    const targetIndex = orderedLessonIds.indexOf(targetLessonId);
    if (targetIndex < 0) return progress;

    const unlocked = new Set(progress.unlockedLessonIds);
    orderedLessonIds.slice(0, targetIndex + 1).forEach(id => unlocked.add(id));

    return persist({
        ...progress,
        unlockedLessonIds: [...unlocked],
        currentLessonId: targetLessonId
    });
}

export function setCurrentLesson(
    progress: LessonsProgress,
    lessonId: string
): LessonsProgress {
    if (!progress.unlockedLessonIds.includes(lessonId)) return progress;
    return persist({
        ...progress,
        currentLessonId: lessonId
    });
}
