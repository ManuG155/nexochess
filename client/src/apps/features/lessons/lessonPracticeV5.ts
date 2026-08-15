import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildMatePracticeLesson } from "./lessonPracticeV4";
import type { MovePractice, PracticeLesson } from "./lessonPracticeBase";

const enPassantPositions: MovePractice[] = [
    {
        id: "ep-e5-d6",
        kind: "move",
        fen: "7k/8/8/3pP3/8/8/8/K7 w - d6 0 1",
        prompt: "findMove",
        expected: { from: "e5", to: "d6" },
        focusSquares: ["e5", "d5", "d6"]
    },
    {
        id: "ep-d5-e6",
        kind: "move",
        fen: "7k/8/8/3Pp3/8/8/8/K7 w - e6 0 1",
        prompt: "findMove",
        expected: { from: "d5", to: "e6" },
        focusSquares: ["d5", "e5", "e6"]
    },
    {
        id: "ep-c5-b6",
        kind: "move",
        fen: "7k/8/8/1pP5/8/8/8/K7 w - b6 0 1",
        prompt: "findMove",
        expected: { from: "c5", to: "b6" },
        focusSquares: ["c5", "b5", "b6"]
    },
    {
        id: "ep-f5-g6",
        kind: "move",
        fen: "7k/8/8/5Pp1/8/8/8/K7 w - g6 0 1",
        prompt: "findMove",
        expected: { from: "f5", to: "g6" },
        focusSquares: ["f5", "g5", "g6"]
    },
    {
        id: "ep-b5-c6",
        kind: "move",
        fen: "7k/8/8/1Pp5/8/8/8/K7 w - c6 0 1",
        prompt: "findMove",
        expected: { from: "b5", to: "c6" },
        focusSquares: ["b5", "c5", "c6"]
    }
];

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "beginner.en-passant") {
        return {
            lessonId: lesson.id,
            positions: enPassantPositions.slice(0, lesson.practiceCount)
        };
    }

    return buildMatePracticeLesson(lesson);
}
