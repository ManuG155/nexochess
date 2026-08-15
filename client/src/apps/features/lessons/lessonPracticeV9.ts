import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildCuratedPracticeLesson } from "./lessonPracticeV8";
import type { PracticeLesson, PracticePosition } from "./lessonPracticeBase";

function proxyLesson(id: string, practiceCount: number): CurriculumLesson {
    return {
        id,
        titleIndex: -1,
        symbol: "•",
        practiceCount
    };
}

function positionsFrom(id: string, count: number) {
    return buildCuratedPracticeLesson(proxyLesson(id, count)).positions;
}

function checkpoint(lessonId: string, positions: PracticePosition[], count: number): PracticeLesson {
    return {
        lessonId,
        positions: positions.slice(0, count).map((position, index) => ({
            ...position,
            id: `${lessonId}-${index}-${position.id}`
        }))
    };
}

function beginnerCheckpoint(count: number) {
    return checkpoint("beginner.checkpoint", [
        ...positionsFrom("first-contact.rook", 2),
        ...positionsFrom("first-contact.bishop", 2),
        ...positionsFrom("first-contact.knight", 2),
        ...positionsFrom("beginner.development", 2),
        ...positionsFrom("first-contact.check", 2)
    ], count);
}

function tacticalCheckpoint(count: number) {
    return checkpoint("intermediate.checkpoint", [
        ...positionsFrom("intermediate.remove-defender", 2),
        ...positionsFrom("intermediate.mating-net", 2),
        ...positionsFrom("intermediate.interference", 2),
        ...positionsFrom("intermediate.activity", 2),
        ...positionsFrom("ready.king-rook-mate", 2)
    ], count);
}

function finalCheckpoint(count: number) {
    return checkpoint("ready.final-checkpoint", [
        ...positionsFrom("ready.opposition", 2),
        ...positionsFrom("ready.king-rook-mate", 2),
        ...positionsFrom("intermediate.activity", 2),
        ...positionsFrom("intermediate.remove-defender", 2),
        ...positionsFrom("intermediate.mating-net", 2)
    ], count);
}

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "beginner.checkpoint") {
        return beginnerCheckpoint(lesson.practiceCount);
    }
    if (lesson.id == "intermediate.checkpoint") {
        return tacticalCheckpoint(lesson.practiceCount);
    }
    if (lesson.id == "ready.final-checkpoint") {
        return finalCheckpoint(lesson.practiceCount);
    }

    return buildCuratedPracticeLesson(lesson);
}
