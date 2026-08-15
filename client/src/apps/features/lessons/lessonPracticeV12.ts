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

const threatMoves: MovePractice[] = [
    {
        id: "threat-knight-queen-e7",
        kind: "move",
        fen: "4q2k/8/8/8/8/2N5/8/K7 w - - 0 1",
        prompt: "findMove",
        expected: { from: "c3", to: "d5" }
    },
    {
        id: "threat-knight-queen-h7",
        kind: "move",
        fen: "k7/7q/8/8/4N3/8/8/7K w - - 0 1",
        prompt: "findMove",
        expected: { from: "e4", to: "f6" }
    },
    {
        id: "threat-bishop-queen-d8",
        kind: "move",
        fen: "3q3k/8/8/8/8/8/8/K1B5 w - - 0 1",
        prompt: "findMove",
        expected: { from: "c1", to: "g5" }
    },
    {
        id: "threat-bishop-queen-d7",
        kind: "move",
        fen: "7k/3q4/8/8/8/8/8/K4B2 w - - 0 1",
        prompt: "findMove",
        expected: { from: "f1", to: "b5" }
    },
    {
        id: "threat-rook-queen-d8",
        kind: "move",
        fen: "3q3k/8/8/8/8/8/8/R6K w - - 0 1",
        prompt: "findMove",
        expected: { from: "a1", to: "d1" }
    },
    {
        id: "threat-rook-queen-e8",
        kind: "move",
        fen: "k3q3/8/8/8/8/8/8/K6R w - - 0 1",
        prompt: "findMove",
        expected: { from: "h1", to: "e1" }
    },
    {
        id: "threat-queen-rook-h8",
        kind: "move",
        fen: "6kr/8/8/8/8/8/8/K2Q4 w - - 0 1",
        prompt: "findMove",
        expected: { from: "d1", to: "h5" }
    }
];

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "first-contact.king-safety-rule") {
        return {
            lessonId: lesson.id,
            positions: kingSafetyMoves.slice(0, lesson.practiceCount)
        };
    }

    if (lesson.id == "intermediate.threats") {
        return {
            lessonId: lesson.id,
            positions: threatMoves.slice(0, lesson.practiceCount)
        };
    }

    return buildMoveFirstPracticeLesson(lesson);
}
