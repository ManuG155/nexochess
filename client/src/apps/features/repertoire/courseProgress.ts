export interface LessonProgress {
    lessonId: string;
    openingName: string;
    family: string;
    eco: string;
    pgn: string;
    side: "white" | "black";
    repetitions: number;
    intervalDays: number;
    ease: number;
    dueAt: string;
    lastReviewedAt: string;
    mistakes: number;
    streak: number;
    mastered: boolean;
    learnedPly?: number;
    availablePly?: number;
}

export type CourseProgressStore = Record<string, LessonProgress>;

const STORAGE_KEY = "nexochess.repertoire.srs.v1";
const MIN_EASE = 1.3;

export function createLessonId(eco: string, name: string, pgn: string) {
    return `${eco}|${name}|${pgn}`;
}

export function findLessonProgress(
    progress: CourseProgressStore,
    lesson: { eco: string; name: string; pgn?: string }
) {
    if (lesson.pgn) {
        const exact = progress[createLessonId(lesson.eco, lesson.name, lesson.pgn)];
        if (exact) return exact;
    }
    return Object.values(progress).find(item => (
        item.eco == lesson.eco && item.openingName == lesson.name
    ));
}

function uniqueProgress(progress: CourseProgressStore) {
    const byOpening = new Map<string, LessonProgress>();
    for (const item of Object.values(progress)) {
        const key = `${item.eco}|${item.openingName}`;
        const previous = byOpening.get(key);
        if (!previous || previous.lastReviewedAt < item.lastReviewedAt) {
            byOpening.set(key, item);
        }
    }
    return Array.from(byOpening.values());
}

export function readCourseProgress(): CourseProgressStore {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as CourseProgressStore;
        return parsed && typeof parsed == "object" ? parsed : {};
    } catch {
        return {};
    }
}

export function writeCourseProgress(progress: CourseProgressStore) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isDue(progress: LessonProgress, now = Date.now()) {
    const due = Date.parse(progress.dueAt);
    return Number.isFinite(due) && due <= now;
}

function addDays(date: Date, days: number) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function qualityFromMistakes(mistakes: number) {
    if (mistakes <= 0) return 5;
    if (mistakes == 1) return 4;
    if (mistakes <= 3) return 3;
    return 2;
}

export function recordLessonReview(
    previous: CourseProgressStore,
    lesson: {
        id: string;
        openingName: string;
        family: string;
        eco: string;
        pgn: string;
        side: "white" | "black";
        learnedPly?: number;
        availablePly?: number;
    },
    mistakes: number
): CourseProgressStore {
    const now = new Date();
    const old = previous[lesson.id] || Object.values(previous).find(item => (
        item.eco == lesson.eco && item.openingName == lesson.openingName
    ));
    const quality = qualityFromMistakes(mistakes);
    let repetitions = old?.repetitions || 0;
    let intervalDays = old?.intervalDays || 0;
    let ease = old?.ease || 2.5;
    let streak = old?.streak || 0;

    if (quality < 3) {
        repetitions = 0;
        intervalDays = 0.25;
        streak = 0;
    } else {
        repetitions += 1;
        streak += 1;
        if (repetitions == 1) {
            intervalDays = 1;
        } else if (repetitions == 2) {
            intervalDays = 3;
        } else {
            intervalDays = Math.max(4, Math.round(intervalDays * ease));
        }
    }

    ease = Math.max(
        MIN_EASE,
        ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    const mastered = repetitions >= 4 && intervalDays >= 14;
    const next: LessonProgress = {
        lessonId: lesson.id,
        openingName: lesson.openingName,
        family: lesson.family,
        eco: lesson.eco,
        pgn: lesson.pgn,
        side: lesson.side,
        repetitions,
        intervalDays,
        ease,
        dueAt: addDays(now, intervalDays).toISOString(),
        lastReviewedAt: now.toISOString(),
        mistakes,
        streak,
        mastered,
        learnedPly: lesson.learnedPly ?? old?.learnedPly,
        availablePly: lesson.availablePly ?? old?.availablePly
    };

    const cleaned = { ...previous };
    for (const [key, item] of Object.entries(cleaned)) {
        if (
            key != lesson.id
            && item.eco == lesson.eco
            && item.openingName == lesson.openingName
        ) delete cleaned[key];
    }

    return {
        ...cleaned,
        [lesson.id]: next
    };
}

export function getDueLessons(progress: CourseProgressStore) {
    return uniqueProgress(progress)
        .filter(item => isDue(item))
        .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

export function getLearnedCount(progress: CourseProgressStore) {
    return uniqueProgress(progress).length;
}

export function getMasteredCount(progress: CourseProgressStore) {
    return uniqueProgress(progress).filter(item => item.mastered).length;
}
