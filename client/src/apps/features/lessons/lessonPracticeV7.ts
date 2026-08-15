import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildCastlingPracticeLesson } from "./lessonPracticeV6";
import type { MovePractice, PracticeLesson } from "./lessonPracticeBase";

const finishDevelopment: MovePractice[] = [
    {
        id: "develop-knight-b1-c3",
        kind: "move",
        fen: "7k/8/8/8/8/8/8/1N5K w - - 0 1",
        prompt: "findMove",
        expected: { from: "b1", to: "c3" }
    },
    {
        id: "develop-knight-g1-f3",
        kind: "move",
        fen: "7k/8/8/8/8/8/8/K5N1 w - - 0 1",
        prompt: "findMove",
        expected: { from: "g1", to: "f3" }
    },
    {
        id: "develop-bishop-c1-f4",
        kind: "move",
        fen: "7k/8/8/8/3PP3/8/8/K1B5 w - - 0 1",
        prompt: "findMove",
        expected: { from: "c1", to: "f4" }
    },
    {
        id: "develop-bishop-f1-c4",
        kind: "move",
        fen: "7k/8/8/8/4P3/8/8/K4B2 w - - 0 1",
        prompt: "findMove",
        expected: { from: "f1", to: "c4" }
    },
    {
        id: "develop-knight-b1-d2",
        kind: "move",
        fen: "7k/8/8/8/8/8/8/1N5K w - - 0 1",
        prompt: "findMove",
        expected: { from: "b1", to: "d2" }
    },
    {
        id: "develop-bishop-c1-g5",
        kind: "move",
        fen: "7k/8/8/8/3PP3/8/8/K1B5 w - - 0 1",
        prompt: "findMove",
        expected: { from: "c1", to: "g5" }
    }
];

const checkingMoves: MovePractice[] = [
    {
        id: "check-rook-e-file",
        kind: "move",
        fen: "4k3/8/8/8/8/8/4R3/7K w - - 0 1",
        prompt: "findMove",
        expected: { from: "e2", to: "e7" }
    },
    {
        id: "check-rook-a-file",
        kind: "move",
        fen: "k7/8/8/8/8/8/R7/7K w - - 0 1",
        prompt: "findMove",
        expected: { from: "a2", to: "a7" }
    },
    {
        id: "check-bishop-h7",
        kind: "move",
        fen: "8/7k/8/8/2B5/8/8/K7 w - - 0 1",
        prompt: "findMove",
        expected: { from: "c4", to: "g8" }
    },
    {
        id: "check-bishop-a7",
        kind: "move",
        fen: "8/k7/8/8/5B2/8/8/7K w - - 0 1",
        prompt: "findMove",
        expected: { from: "f4", to: "b8" }
    },
    {
        id: "check-queen-h-file",
        kind: "move",
        fen: "7k/8/8/8/3Q4/8/8/K7 w - - 0 1",
        prompt: "findMove",
        expected: { from: "d4", to: "h4" }
    },
    {
        id: "check-knight-h7",
        kind: "move",
        fen: "8/7k/8/3N4/8/8/8/K7 w - - 0 1",
        prompt: "findMove",
        expected: { from: "d5", to: "f6" }
    }
];

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "beginner.finish-development") {
        return {
            lessonId: lesson.id,
            positions: finishDevelopment.slice(0, lesson.practiceCount)
        };
    }

    if (lesson.id == "first-contact.check") {
        return {
            lessonId: lesson.id,
            positions: checkingMoves.slice(0, lesson.practiceCount)
        };
    }

    return buildCastlingPracticeLesson(lesson);
}
