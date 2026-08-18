import type { Square } from "chess.js";

import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildVariedPracticeLesson } from "./lessonPracticeV2";
import type {
    MovePractice,
    PracticeLesson,
    PracticePosition
} from "./lessonPracticeBase";

function move(
    id: string,
    fen: string,
    from: Square,
    to: Square
): MovePractice {
    return {
        id,
        kind: "move",
        fen,
        prompt: "moveTarget",
        expected: { from, to },
        revealTarget: true,
        focusSquares: [from, to],
        arrows: [[from, to]]
    };
}

function take(lessonId: string, positions: PracticePosition[], count: number): PracticeLesson {
    return {
        lessonId,
        positions: positions.slice(0, count)
    };
}

const rookPositions: PracticePosition[] = [
    move("rook-h1", "7k/8/8/8/3R4/8/8/K7 w - - 0 1", "d4", "g4"),
    move("rook-v1", "7k/8/8/8/3R4/8/8/K7 w - - 0 1", "d4", "d7"),
    move("rook-v2", "7k/8/8/8/8/2R5/8/K7 w - - 0 1", "c3", "c7"),
    move("rook-h2", "7k/8/8/8/5R2/8/8/K7 w - - 0 1", "f4", "b4"),
    move("rook-v3", "7k/8/8/8/8/8/1R6/K7 w - - 0 1", "b2", "b7"),
    move("rook-v4", "7k/8/8/8/8/6R1/8/K7 w - - 0 1", "g3", "g6"),
    move("rook-h3", "7k/8/8/4R3/8/8/8/K7 w - - 0 1", "e5", "h5"),
    move("rook-v5", "7k/8/8/4R3/8/8/8/K7 w - - 0 1", "e5", "e2")
];

const bishopPositions: PracticePosition[] = [
    move("bishop-ne", "6k1/8/8/8/3B4/8/8/K7 w - - 0 1", "d4", "g7"),
    move("bishop-nw", "7k/8/8/8/3B4/8/8/K7 w - - 0 1", "d4", "b6"),
    move("bishop-c3", "6k1/8/8/8/8/2B5/8/K7 w - - 0 1", "c3", "f6"),
    move("bishop-f3", "7k/8/8/8/8/5B2/8/K7 w - - 0 1", "f3", "c6"),
    move("bishop-b2", "7k/8/8/8/8/8/1B6/K7 w - - 0 1", "b2", "e5"),
    move("bishop-g2", "7k/8/8/8/8/8/6B1/K7 w - - 0 1", "g2", "d5"),
    move("bishop-e4", "6k1/8/8/8/4B3/8/8/K7 w - - 0 1", "e4", "b7")
];

const queenPositions: PracticePosition[] = [
    move("queen-row", "7k/8/8/8/3Q4/8/8/K7 w - - 0 1", "d4", "h4"),
    move("queen-file", "7k/8/8/8/3Q4/8/8/K7 w - - 0 1", "d4", "d7"),
    move("queen-diagonal", "6k1/8/8/8/3Q4/8/8/K7 w - - 0 1", "d4", "g7"),
    move("queen-back", "7k/8/8/8/8/2Q5/8/K7 w - - 0 1", "c3", "c7"),
    move("queen-diag-two", "7k/8/8/8/8/5Q2/8/K7 w - - 0 1", "f3", "c6"),
    move("queen-row-two", "7k/8/8/4Q3/8/8/8/K7 w - - 0 1", "e5", "b5"),
    move("queen-file-two", "7k/8/8/8/8/6Q1/8/K7 w - - 0 1", "g3", "g6"),
    move("queen-diag-three", "6k1/8/8/8/4Q3/8/8/K7 w - - 0 1", "e4", "b7")
];

const kingPositions: PracticePosition[] = [
    move("king-ne", "7k/8/8/8/3K4/8/8/8 w - - 0 1", "d4", "e5"),
    move("king-n", "7k/8/8/8/3K4/8/8/8 w - - 0 1", "d4", "d5"),
    move("king-nw", "7k/8/8/8/3K4/8/8/8 w - - 0 1", "d4", "c5"),
    move("king-e", "7k/8/8/8/3K4/8/8/8 w - - 0 1", "d4", "e4"),
    move("king-w", "7k/8/8/8/3K4/8/8/8 w - - 0 1", "d4", "c4"),
    move("king-se", "7k/8/8/8/3K4/8/8/8 w - - 0 1", "d4", "e3"),
    move("king-sw", "7k/8/8/8/3K4/8/8/8 w - - 0 1", "d4", "c3")
];

const knightPositions: PracticePosition[] = [
    move("knight-f5", "7k/8/8/8/3N4/8/8/K7 w - - 0 1", "d4", "f5"),
    move("knight-f3", "7k/8/8/8/3N4/8/8/K7 w - - 0 1", "d4", "f3"),
    move("knight-b5", "7k/8/8/8/3N4/8/8/K7 w - - 0 1", "d4", "b5"),
    move("knight-b3", "7k/8/8/8/3N4/8/8/K7 w - - 0 1", "d4", "b3"),
    move("knight-e6", "7k/8/8/8/3N4/8/8/K7 w - - 0 1", "d4", "e6"),
    move("knight-c6", "7k/8/8/8/3N4/8/8/K7 w - - 0 1", "d4", "c6"),
    move("knight-e2", "7k/8/8/8/3N4/8/8/K7 w - - 0 1", "d4", "e2"),
    move("knight-c2", "7k/8/8/8/3N4/8/8/K7 w - - 0 1", "d4", "c2")
];

const pawnPositions: PracticePosition[] = [
    move("pawn-one", "7k/8/8/8/8/8/4P3/K7 w - - 0 1", "e2", "e3"),
    move("pawn-two", "7k/8/8/8/8/8/3P4/K7 w - - 0 1", "d2", "d4"),
    move("pawn-capture-left", "7k/8/8/3p4/4P3/8/8/K7 w - - 0 1", "e4", "d5"),
    move("pawn-capture-right", "7k/8/8/4p3/3P4/8/8/K7 w - - 0 1", "d4", "e5"),
    move("pawn-f", "7k/8/8/8/8/5P2/8/K7 w - - 0 1", "f3", "f4"),
    move("pawn-c", "7k/8/8/8/8/2P5/8/K7 w - - 0 1", "c3", "c4"),
    move("pawn-a", "7k/8/8/8/8/8/P7/K7 w - - 0 1", "a2", "a4"),
    move("pawn-h", "7k/8/8/8/8/8/7P/K7 w - - 0 1", "h2", "h4")
];

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "first-contact.rook") {
        return take(lesson.id, rookPositions, lesson.practiceCount);
    }
    if (lesson.id == "first-contact.bishop") {
        return take(lesson.id, bishopPositions, lesson.practiceCount);
    }
    if (lesson.id == "first-contact.queen") {
        return take(lesson.id, queenPositions, lesson.practiceCount);
    }
    if (lesson.id == "first-contact.king") {
        return take(lesson.id, kingPositions, lesson.practiceCount);
    }
    if (lesson.id == "first-contact.knight") {
        return take(lesson.id, knightPositions, lesson.practiceCount);
    }
    if (lesson.id == "first-contact.pawn") {
        return take(lesson.id, pawnPositions, lesson.practiceCount);
    }

    return buildVariedPracticeLesson(lesson);
}
