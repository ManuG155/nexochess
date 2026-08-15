import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildMoveFirstPracticeLesson } from "./lessonPracticeV11";
import type { MovePractice, PracticeLesson } from "./lessonPracticeBase";

const kingSafetyMoves: MovePractice[] = [
    { id: "king-safety-rook-d", kind: "move", fen: "3r3k/8/8/8/3K4/8/8/8 w - - 0 1", prompt: "findMove", expected: { from: "d4", to: "c3" } },
    { id: "king-safety-bishop-b", kind: "move", fen: "7k/1b6/8/8/4K3/8/8/8 w - - 0 1", prompt: "findMove", expected: { from: "e4", to: "f4" } },
    { id: "king-safety-queen-a", kind: "move", fen: "7k/8/8/8/q2K4/8/8/8 w - - 0 1", prompt: "findMove", expected: { from: "d4", to: "e3" } },
    { id: "king-safety-rook-h", kind: "move", fen: "7k/8/8/8/4K2r/8/8/8 w - - 0 1", prompt: "findMove", expected: { from: "e4", to: "e3" } },
    { id: "king-safety-bishop-g", kind: "move", fen: "7k/6b1/8/8/3K4/8/8/8 w - - 0 1", prompt: "findMove", expected: { from: "d4", to: "c4" } },
    { id: "king-safety-queen-h", kind: "move", fen: "7k/8/8/4K2q/8/8/8/8 w - - 0 1", prompt: "findMove", expected: { from: "e5", to: "d4" } }
];

const threatMoves: MovePractice[] = [
    { id: "threat-knight-queen-e7", kind: "move", fen: "4q2k/8/8/8/8/2N5/8/K7 w - - 0 1", prompt: "findMove", expected: { from: "c3", to: "d5" } },
    { id: "threat-knight-queen-h7", kind: "move", fen: "k7/7q/8/8/4N3/8/8/K7 w - - 0 1", prompt: "findMove", expected: { from: "e4", to: "f6" } },
    { id: "threat-bishop-queen-d8", kind: "move", fen: "3q3k/8/8/8/8/8/8/K1B5 w - - 0 1", prompt: "findMove", expected: { from: "c1", to: "g5" } },
    { id: "threat-bishop-queen-d7", kind: "move", fen: "7k/3q4/8/8/8/8/8/K4B2 w - - 0 1", prompt: "findMove", expected: { from: "f1", to: "b5" } },
    { id: "threat-rook-queen-d8", kind: "move", fen: "3q3k/8/8/8/8/8/8/R6K w - - 0 1", prompt: "findMove", expected: { from: "a1", to: "d1" } },
    { id: "threat-rook-queen-e8", kind: "move", fen: "k3q3/8/8/8/8/8/8/K6R w - - 0 1", prompt: "findMove", expected: { from: "h1", to: "e1" } },
    { id: "threat-queen-rook-h8", kind: "move", fen: "6kr/8/8/8/8/8/8/K2Q4 w - - 0 1", prompt: "findMove", expected: { from: "d1", to: "h5" } }
];

const removeDefenderMoves: MovePractice[] = [
    { id: "remove-defender-queen-d7", kind: "move", fen: "7k/3pr3/8/8/8/8/3Q4/K7 w - - 0 1", prompt: "findMove", expected: { from: "d2", to: "d7" } },
    { id: "remove-defender-bishop-f6", kind: "move", fen: "7k/4b3/5n2/8/8/2B5/8/K7 w - - 0 1", prompt: "findMove", expected: { from: "c3", to: "f6" } },
    { id: "remove-defender-rook-d7", kind: "move", fen: "3q3k/3r4/8/8/3R4/8/3Q4/K7 w - - 0 1", prompt: "findMove", expected: { from: "d4", to: "d7" } },
    { id: "remove-defender-knight-f7", kind: "move", fen: "6k1/5pp1/8/4N3/8/8/8/K6R w - - 0 1", prompt: "findMove", expected: { from: "e5", to: "f7" } },
    { id: "remove-defender-rook-e6", kind: "move", fen: "6k1/3q4/4p3/8/8/4R3/8/K2Q4 w - - 0 1", prompt: "findMove", expected: { from: "e3", to: "e6" } },
    { id: "remove-defender-queen-e7", kind: "move", fen: "k7/3rp3/8/8/8/8/4Q3/7K w - - 0 1", prompt: "findMove", expected: { from: "e2", to: "e7" } },
    { id: "remove-defender-bishop-c6", kind: "move", fen: "k7/3b4/2n5/8/8/5B2/8/7K w - - 0 1", prompt: "findMove", expected: { from: "f3", to: "c6" } },
    { id: "remove-defender-rook-e7", kind: "move", fen: "k3q3/4r3/8/8/4R3/8/4Q3/7K w - - 0 1", prompt: "findMove", expected: { from: "e4", to: "e7" } }
];

const interferenceMoves: MovePractice[] = [
    { id: "interference-rank-e8", kind: "move", fen: "r6q/7k/2B5/8/8/8/8/1K6 w - - 0 1", prompt: "findMove", expected: { from: "c6", to: "e8" } },
    { id: "interference-rank-d8", kind: "move", fen: "q6r/7k/5B2/8/8/8/8/1K6 w - - 0 1", prompt: "findMove", expected: { from: "f6", to: "d8" } },
    { id: "interference-rank-e5", kind: "move", fen: "7k/8/8/r6q/8/2B5/8/1K6 w - - 0 1", prompt: "findMove", expected: { from: "c3", to: "e5" } },
    { id: "interference-rank-d4", kind: "move", fen: "7k/8/8/8/q6r/8/5B2/1K6 w - - 0 1", prompt: "findMove", expected: { from: "f2", to: "d4" } },
    { id: "interference-file-d3", kind: "move", fen: "3r3k/8/8/1B6/8/8/K7/3q4 w - - 0 1", prompt: "findMove", expected: { from: "b5", to: "d3" } },
    { id: "interference-file-e2", kind: "move", fen: "4r2k/8/8/8/2B5/8/K7/4q3 w - - 0 1", prompt: "findMove", expected: { from: "c4", to: "e2" } },
    { id: "interference-rank-f6", kind: "move", fen: "7k/8/r6q/4B3/8/8/8/1K6 w - - 0 1", prompt: "findMove", expected: { from: "e5", to: "f6" } },
    { id: "interference-rank-c3", kind: "move", fen: "7k/8/8/8/8/q6r/1B6/1K6 w - - 0 1", prompt: "findMove", expected: { from: "b2", to: "c3" } }
];

const trappedPieceMoves: MovePractice[] = [
    { id: "trapped-queen-a8", kind: "move", fen: "q6k/8/2B5/8/8/8/8/7K w - - 0 1", prompt: "findMove", expected: { from: "c6", to: "a8" } },
    { id: "trapped-rook-h8", kind: "move", fen: "k6r/5N2/8/8/8/8/8/7K w - - 0 1", prompt: "findMove", expected: { from: "f7", to: "h8" } },
    { id: "trapped-bishop-f5", kind: "move", fen: "7k/8/8/5b2/3N4/8/8/K7 w - - 0 1", prompt: "findMove", expected: { from: "d4", to: "f5" } },
    { id: "trapped-queen-b8", kind: "move", fen: "1q5k/8/8/8/8/8/8/KR6 w - - 0 1", prompt: "findMove", expected: { from: "b1", to: "b8" } },
    { id: "trapped-rook-g7", kind: "move", fen: "7k/6r1/8/8/8/2B5/8/K7 w - - 0 1", prompt: "findMove", expected: { from: "c3", to: "g7" } },
    { id: "trapped-knight-c6", kind: "move", fen: "7k/8/2n5/8/8/8/6B1/K7 w - - 0 1", prompt: "findMove", expected: { from: "g2", to: "c6" } },
    { id: "trapped-bishop-e6", kind: "move", fen: "7k/8/4b3/8/8/8/8/K3R3 w - - 0 1", prompt: "findMove", expected: { from: "e1", to: "e6" } }
];

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "first-contact.king-safety-rule") return { lessonId: lesson.id, positions: kingSafetyMoves.slice(0, lesson.practiceCount) };
    if (lesson.id == "intermediate.threats") return { lessonId: lesson.id, positions: threatMoves.slice(0, lesson.practiceCount) };
    if (lesson.id == "intermediate.remove-defender") return { lessonId: lesson.id, positions: removeDefenderMoves.slice(0, lesson.practiceCount) };
    if (lesson.id == "intermediate.interference") return { lessonId: lesson.id, positions: interferenceMoves.slice(0, lesson.practiceCount) };
    if (lesson.id == "intermediate.trapped-piece") return { lessonId: lesson.id, positions: trappedPieceMoves.slice(0, lesson.practiceCount) };
    return buildMoveFirstPracticeLesson(lesson);
}
