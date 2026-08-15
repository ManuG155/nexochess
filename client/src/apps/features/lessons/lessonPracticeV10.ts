import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildCheckpointPracticeLesson } from "./lessonPracticeV9";
import type { MovePractice, PracticeLesson } from "./lessonPracticeBase";

function move(
    id: string,
    fen: string,
    from: MovePractice["expected"]["from"],
    to: MovePractice["expected"]["to"]
): MovePractice {
    return { id, kind: "move", fen, prompt: "findMove", expected: { from, to } };
}

const doubleAttacks: MovePractice[] = [
    move("double-knight-b8-d8", "1r1q3k/8/8/4N3/8/8/8/K7 w - - 0 1", "e5", "c6"),
    move("double-knight-c8-e8", "2r1q2k/8/8/5N2/8/8/8/K7 w - - 0 1", "f5", "d6"),
    move("double-knight-d8-f8", "3q1r1k/8/8/2N5/8/8/8/K7 w - - 0 1", "c5", "e6"),
    move("double-knight-e8-h7", "4r2k/7q/8/3N4/8/8/8/K7 w - - 0 1", "d5", "f6"),
    move("double-queen-a7-h7", "6k1/r6b/8/8/3Q4/8/8/K7 w - - 0 1", "d4", "d7"),
    move("double-queen-a4-h4", "r5k1/8/8/8/3Q3b/8/8/1K6 w - - 0 1", "d4", "a4"),
    move("double-queen-a5-h5", "6k1/8/8/r6b/4Q3/8/8/K7 w - - 0 1", "e4", "e5")
];

const forks: MovePractice[] = [
    move("fork-knight-b8-d8", "1r1q3k/8/8/4N3/8/8/8/K7 w - - 0 1", "e5", "c6"),
    move("fork-knight-c8-e8", "2r1q2k/8/8/5N2/8/8/8/K7 w - - 0 1", "f5", "d6"),
    move("fork-knight-d8-f8", "3q1r1k/8/8/2N5/8/8/8/K7 w - - 0 1", "c5", "e6"),
    move("fork-knight-e8-h7", "4r2k/7q/8/3N4/8/8/8/K7 w - - 0 1", "d5", "f6"),
    move("fork-pawn-c6", "7k/1r1b4/8/2P5/8/8/8/K7 w - - 0 1", "c5", "c6"),
    move("fork-pawn-d6", "7k/2r1b3/8/3P4/8/8/8/K7 w - - 0 1", "d5", "d6"),
    move("fork-pawn-e6", "7k/3r1b2/8/4P3/8/8/8/K7 w - - 0 1", "e5", "e6"),
    move("fork-pawn-f6", "7k/4r1b1/8/5P2/8/8/8/K7 w - - 0 1", "f5", "f6")
];

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "intermediate.double-attack") {
        return {
            lessonId: lesson.id,
            positions: doubleAttacks.slice(0, lesson.practiceCount)
        };
    }

    if (lesson.id == "intermediate.fork") {
        return {
            lessonId: lesson.id,
            positions: forks.slice(0, lesson.practiceCount)
        };
    }

    return buildCheckpointPracticeLesson(lesson);
}
