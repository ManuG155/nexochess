const STORAGE_KEY = "nexochess_lessons_progress_v1";

export interface LessonsProgress {
    version: 1;
    completedLessonIds: string[];
}

const EMPTY_PROGRESS: LessonsProgress = {
    version: 1,
    completedLessonIds: []
};

export function loadLessonsProgress(): LessonsProgress {
    if (typeof localStorage == "undefined") return EMPTY_PROGRESS;

    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "");
        if (
            parsed?.version == 1
            && Array.isArray(parsed.completedLessonIds)
        ) {
            return {
                version: 1,
                completedLessonIds: parsed.completedLessonIds
                    .filter((value: unknown): value is string => (
                        typeof value == "string"
                    ))
            };
        }
    } catch {
        // A malformed local value must never block the learning experience.
    }

    return EMPTY_PROGRESS;
}

export function markLessonComplete(
    progress: LessonsProgress,
    lessonId: string
): LessonsProgress {
    if (progress.completedLessonIds.includes(lessonId)) return progress;

    const next: LessonsProgress = {
        ...progress,
        completedLessonIds: [...progress.completedLessonIds, lessonId]
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
}
