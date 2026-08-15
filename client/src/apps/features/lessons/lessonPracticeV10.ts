import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildCheckpointPracticeLesson } from "./lessonPracticeV9";
import type { MovePractice, PracticeLesson } from "./lessonPracticeBase";

function move(
    id: string,
    fen: string,
    from: MovePractice["expected"]["from"],
    to: MovePractice["expected"]["to"],
    brilliant = false
): MovePractice {
    return {
        id,
        kind: "move",
        fen,
        prompt: "findMove",
        expected: { from, to },
        brilliant
    };
}

const doubleAttacks: MovePractice[] = [
    move("double-queen-a7-h7", "6k1/r6b/8/8/3Q4/8/8/7K w - - 0 1", "d4", "d7"),
    move("double-queen-b7-h7", "6k1/1r5b/8/8/4Q3/8/8/K7 w - - 0 1", "e4", "e7"),
    move("double-queen-a5-h5", "7k/8/8/r6b/3Q4/8/8/1K6 w - - 0 1", "d4", "d5"),
    move("double-queen-a6-h6", "7k/8/r6b/8/4Q3/8/8/1K6 w - - 0 1", "e4", "e6"),
    move("double-queen-b6-g6", "7k/8/1r4b1/8/3Q4/8/8/K7 w - - 0 1", "d4", "d6"),
    move("double-queen-b5-g5", "7k/8/8/1r4b1/4Q3/8/8/K7 w - - 0 1", "e4", "e5"),
    move("double-queen-a6-h6-from-c3", "6k1/8/r6b/8/8/2Q5/8/1K6 w - - 0 1", "c3", "c6"),
    move("double-queen-a5-h5-from-c3", "7k/8/8/r6b/8/2Q5/8/1K6 w - - 0 1", "c3", "c5"),
    move("double-queen-b6-g6-from-f3", "k7/8/1r4b1/8/8/5Q2/8/7K w - - 0 1", "f3", "f6"),
    move("double-queen-a6-h6-from-b3", "6k1/8/r6b/8/8/1Q6/8/6K1 w - - 0 1", "b3", "b6")
];

const forks: MovePractice[] = [
    move("fork-pawn-c6", "7k/1r1b4/8/2P5/8/8/8/K7 w - - 0 1", "c5", "c6"),
    move("fork-pawn-d6", "7k/2r1b3/8/3P4/8/8/8/K7 w - - 0 1", "d5", "d6"),
    move("fork-pawn-e6", "7k/3r1b2/8/4P3/8/8/8/K7 w - - 0 1", "e5", "e6"),
    move("fork-pawn-f6", "7k/4r1b1/8/5P2/8/8/8/K7 w - - 0 1", "f5", "f6"),
    move("fork-pawn-c5", "7k/8/1r1b4/8/2P5/8/8/K7 w - - 0 1", "c4", "c5"),
    move("fork-pawn-d5", "7k/8/2r1b3/8/3P4/8/8/K7 w - - 0 1", "d4", "d5"),
    move("fork-pawn-e5", "7k/8/3r1b2/8/4P3/8/8/K7 w - - 0 1", "e4", "e5"),
    move("fork-pawn-f5", "7k/8/4r1b1/8/5P2/8/8/K7 w - - 0 1", "f4", "f5"),
    move("fork-pawn-b6", "7k/r1b5/8/1P6/8/8/8/K7 w - - 0 1", "b5", "b6"),
    move("fork-pawn-g6", "7k/5r1b/8/6P1/8/8/8/K7 w - - 0 1", "g5", "g6")
];

const queenMate: MovePractice[] = [
    move("queen-mate-h8", "7k/5Q2/5K2/8/8/8/8/8 w - - 0 1", "f7", "g7"),
    move("queen-mate-a8", "k7/2Q5/2K5/8/8/8/8/8 w - - 0 1", "c7", "b7"),
    move("queen-mate-h1", "8/8/8/8/8/5K2/5Q2/7k w - - 0 1", "f2", "g2"),
    move("queen-mate-a1", "8/8/8/8/8/2K5/2Q5/k7 w - - 0 1", "c2", "b2"),
    move("queen-box-h8", "7k/8/3Q1K2/8/8/8/8/8 w - - 0 1", "d6", "f8"),
    move("queen-box-a8", "k7/8/2K1Q3/8/8/8/8/8 w - - 0 1", "e6", "c8"),
    move("queen-check-h8", "7k/8/8/3Q1K2/8/8/8/8 w - - 0 1", "d5", "d8"),
    move("queen-check-a8", "k7/8/8/2K1Q3/8/8/8/8 w - - 0 1", "e5", "e8"),
    move("queen-box-h8-from-c6", "7k/8/2Q2K2/8/8/8/8/8 w - - 0 1", "c6", "c8"),
    move("queen-box-a8-from-f6", "k7/8/5Q2/2K5/8/8/8/8 w - - 0 1", "f6", "f8")
];

const sacrificeOpenKing: MovePractice[] = [
    move("sac-open-qxh7", "6k1/6pp/8/7Q/8/8/8/K3R3 w - - 0 1", "h5", "h7", true),
    move("sac-open-qxa7", "1k6/pp6/8/Q7/8/8/8/3R3K w - - 0 1", "a5", "a7", true),
    move("sac-open-bxh7", "6k1/7p/8/8/8/3B4/8/K7 w - - 0 1", "d3", "h7", true),
    move("sac-open-bxa7", "1k6/p7/8/8/8/4B3/8/7K w - - 0 1", "e3", "a7", true),
    move("sac-open-rxg8", "6rk/8/8/8/8/8/8/K5R1 w - - 0 1", "g1", "g8", true),
    move("sac-open-rxb8", "kr6/8/8/8/8/8/8/1R5K w - - 0 1", "b1", "b8", true),
    move("sac-open-qxg7", "7k/6p1/8/6Q1/8/8/8/K7 w - - 0 1", "g5", "g7", true),
    move("sac-open-qxb7", "k7/1p6/8/1Q6/8/8/8/7K w - - 0 1", "b5", "b7", true),
    move("sac-open-bxg7", "7k/6p1/8/8/8/2B5/8/K7 w - - 0 1", "c3", "g7", true),
    move("sac-open-bxb7", "k7/1p6/8/8/8/5B2/8/7K w - - 0 1", "f3", "b7", true)
];

const sacrificeDeflection: MovePractice[] = [
    move("sac-deflect-rxe7", "4r2k/4q3/8/8/8/8/8/K3R3 w - - 0 1", "e1", "e7", true),
    move("sac-deflect-rxd7", "3r3k/3q4/8/8/8/8/8/K2R4 w - - 0 1", "d1", "d7", true),
    move("sac-deflect-qxh7", "6k1/6pr/8/7Q/8/8/8/K7 w - - 0 1", "h5", "h7", true),
    move("sac-deflect-qxa7", "1k6/rp6/8/Q7/8/8/8/7K w - - 0 1", "a5", "a7", true),
    move("sac-deflect-rxg7", "6k1/6qr/8/8/8/8/8/K5R1 w - - 0 1", "g1", "g7", true),
    move("sac-deflect-rxb7", "1k6/1rq5/8/8/8/8/8/1R5K w - - 0 1", "b1", "b7", true),
    move("sac-deflect-rxh7", "6k1/7q/8/8/8/8/8/K6R w - - 0 1", "h1", "h7", true),
    move("sac-deflect-rxa7", "1k6/q7/8/8/8/8/8/R6K w - - 0 1", "a1", "a7", true),
    move("sac-deflect-qxg7", "7k/6r1/8/6Q1/8/8/8/K7 w - - 0 1", "g5", "g7", true),
    move("sac-deflect-qxb7", "k7/1r6/8/1Q6/8/8/8/7K w - - 0 1", "b5", "b7", true)
];

const sacrificeMate: MovePractice[] = [
    move("sac-mate-rxg8", "6rk/7p/8/8/8/8/8/K5R1 w - - 0 1", "g1", "g8", true),
    move("sac-mate-rxb8", "kr6/p7/8/8/8/8/8/1R5K w - - 0 1", "b1", "b8", true),
    move("sac-mate-qxh7", "6k1/6pp/8/7Q/3B4/8/8/K7 w - - 0 1", "h5", "h7", true),
    move("sac-mate-qxa7", "1k6/pp6/8/Q7/4B3/8/8/7K w - - 0 1", "a5", "a7", true),
    move("sac-mate-bxh7", "6k1/6pp/8/8/8/3B4/7Q/K7 w - - 0 1", "d3", "h7", true),
    move("sac-mate-bxa7", "1k6/pp6/8/8/8/4B3/Q7/7K w - - 0 1", "e3", "a7", true),
    move("sac-mate-qxg7", "7k/6pr/8/6Q1/8/8/8/K7 w - - 0 1", "g5", "g7", true),
    move("sac-mate-qxb7", "k7/rp6/8/1Q6/8/8/8/7K w - - 0 1", "b5", "b7", true),
    move("sac-mate-bxg7", "7k/6pr/8/8/8/2B5/8/K7 w - - 0 1", "c3", "g7", true),
    move("sac-mate-bxb7", "k7/rp6/8/8/8/5B2/8/7K w - - 0 1", "f3", "b7", true)
];

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "intermediate.double-attack") {
        return { lessonId: lesson.id, positions: doubleAttacks.slice(0, lesson.practiceCount) };
    }
    if (lesson.id == "intermediate.fork") {
        return { lessonId: lesson.id, positions: forks.slice(0, lesson.practiceCount) };
    }
    if (lesson.id == "ready.king-queen-mate") {
        return { lessonId: lesson.id, positions: queenMate.slice(0, lesson.practiceCount) };
    }
    if (lesson.id == "ready.sacrifice-open-king") {
        return { lessonId: lesson.id, positions: sacrificeOpenKing.slice(0, lesson.practiceCount) };
    }
    if (lesson.id == "ready.sacrifice-deflection") {
        return { lessonId: lesson.id, positions: sacrificeDeflection.slice(0, lesson.practiceCount) };
    }
    if (lesson.id == "ready.sacrifice-mate") {
        return { lessonId: lesson.id, positions: sacrificeMate.slice(0, lesson.practiceCount) };
    }
    return buildCheckpointPracticeLesson(lesson);
}
