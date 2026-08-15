import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildEnPassantPracticeLesson } from "./lessonPracticeV5";
import type { MovePractice, PracticeLesson } from "./lessonPracticeBase";

const castlingPositions: MovePractice[] = [
    {
        id: "castle-white-king",
        kind: "move",
        fen: "4k3/8/8/8/8/8/8/4K2R w K - 0 1",
        prompt: "findMove",
        expected: { from: "e1", to: "g1" },
        focusSquares: ["e1", "f1", "g1", "h1"]
    },
    {
        id: "castle-white-queen",
        kind: "move",
        fen: "4k3/8/8/8/8/8/8/R3K3 w Q - 0 1",
        prompt: "findMove",
        expected: { from: "e1", to: "c1" },
        focusSquares: ["a1", "b1", "c1", "d1", "e1"]
    },
    {
        id: "castle-black-king",
        kind: "move",
        fen: "4k2r/8/8/8/8/8/8/4K3 b k - 0 1",
        prompt: "findMove",
        expected: { from: "e8", to: "g8" },
        focusSquares: ["e8", "f8", "g8", "h8"]
    },
    {
        id: "castle-black-queen",
        kind: "move",
        fen: "r3k3/8/8/8/8/8/8/4K3 b q - 0 1",
        prompt: "findMove",
        expected: { from: "e8", to: "c8" },
        focusSquares: ["a8", "b8", "c8", "d8", "e8"]
    },
    {
        id: "castle-white-shelter",
        kind: "move",
        fen: "4k3/8/8/8/8/8/5PPP/4K2R w K - 0 1",
        prompt: "findMove",
        expected: { from: "e1", to: "g1" },
        focusSquares: ["e1", "f1", "g1", "h1", "f2", "g2", "h2"]
    },
    {
        id: "castle-white-queen-shelter",
        kind: "move",
        fen: "4k3/8/8/8/8/8/PPP5/R3K3 w Q - 0 1",
        prompt: "findMove",
        expected: { from: "e1", to: "c1" },
        focusSquares: ["a1", "b1", "c1", "d1", "e1", "a2", "b2", "c2"]
    },
    {
        id: "castle-black-shelter",
        kind: "move",
        fen: "4k2r/5ppp/8/8/8/8/8/4K3 b k - 0 1",
        prompt: "findMove",
        expected: { from: "e8", to: "g8" },
        focusSquares: ["e8", "f8", "g8", "h8", "f7", "g7", "h7"]
    }
];

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "beginner.castling" || lesson.id == "beginner.king-safety") {
        return {
            lessonId: lesson.id,
            positions: castlingPositions.slice(0, lesson.practiceCount)
        };
    }

    return buildEnPassantPracticeLesson(lesson);
}
