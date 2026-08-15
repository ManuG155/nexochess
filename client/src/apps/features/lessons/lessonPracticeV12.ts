import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildMoveFirstPracticeLesson } from "./lessonPracticeV11";
import type { MovePractice, PracticeLesson } from "./lessonPracticeBase";

const kingSafetyMoves: MovePractice[] = [
    {
        id: "king-safety-rook-d",
        kind: "move",
        fen: "3r3k/8/8/8/3K4/8/8/8 w - - 0 1",
        prompt: "findMove",
        expected: { from: "d4", to: "c3" }
    },
    {
        id: "king-safety-bishop-b",
        kind: "move",
        fen: "7k/1b6/8/8/4K3/8/8/8 w - - 0 1",
        prompt: "findMove",
        expected: { from: "e4", to: "f4" }
    },
    {
        id: "king-safety-queen-a",
        kind: "move",
        fen: "7k/8/8/8/q2K4/8/8/8 w - - 0 1",
        prompt: "findMove",
        expected: { from: "d4", to: "e3" }
    },
    {
        id: "king-safety-rook-h",
        kind: "move",
        fen: "7k/8/8/8/4K2r/8/8/8 w - - 0 1",
        prompt: "findMove",
        expected: { from: "e4", to: "e3" }
    },
    {
        id: "king-safety-bishop-g",
        kind: "move",
        fen: "7k/6b1/8/8/3K4/8/8/8 w - - 0 1",
        prompt: "findMove",
        expected: { from: "d4", to: "c4" }
    },
    {
        id: "king-safety-queen-h",
        kind: "move",
        fen: "7k/8/8/4K2q/8/8/8/8 w - - 0 1",
        prompt: "findMove",
        expected: { from: "e5", to: "d4" }
    }
];

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "first-contact.king-safety-rule") {
        return {
            lessonId: lesson.id,
            positions: kingSafetyMoves.slice(0, lesson.practiceCount)
        };
    }

    return buildMoveFirstPracticeLesson(lesson);
}
