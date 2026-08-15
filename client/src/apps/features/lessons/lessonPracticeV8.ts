import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildCheckPracticeLesson } from "./lessonPracticeV7";
import type {
    MovePractice,
    PracticeLesson,
    PracticePosition,
    SelectPractice
} from "./lessonPracticeBase";

function move(
    id: string,
    fen: string,
    from: MovePractice["expected"]["from"],
    to: MovePractice["expected"]["to"]
): MovePractice {
    return { id, kind: "move", fen, prompt: "findMove", expected: { from, to } };
}

function select(
    id: string,
    fen: string,
    acceptedSquares: SelectPractice["acceptedSquares"]
): SelectPractice {
    return { id, kind: "select", fen, prompt: "selectConcept", acceptedSquares };
}

function lesson(lessonId: string, positions: PracticePosition[], count: number): PracticeLesson {
    return { lessonId, positions: positions.slice(0, count) };
}

const doubleAttacks: PracticePosition[] = [
    move("double-knight-king-rook", "r3k3/8/8/3N4/8/8/8/7K w - - 0 1", "d5", "c7"),
    move("double-knight-queen-rook", "1r1q3k/8/8/4N3/8/8/8/K7 w - - 0 1", "e5", "c6"),
    move("double-knight-c8-e8", "2r1k3/8/8/5N2/8/8/8/7K w - - 0 1", "f5", "d6"),
    move("double-knight-d8-f8", "3r1k2/8/8/2N5/8/8/8/7K w - - 0 1", "c5", "e6"),
    move("double-queen-a-file-rank", "r6k/8/8/8/3Q3b/8/8/K7 w - - 0 1", "d4", "a4"),
    move("double-queen-h-file-rank", "k6r/8/8/8/b3Q3/8/8/7K w - - 0 1", "e4", "h4"),
    move("double-bishop-king-rook", "4k1r1/8/8/8/2B5/8/8/K7 w - - 0 1", "c4", "f7")
];

const forks: PracticePosition[] = [
    move("fork-knight-c7", "r3k3/8/8/3N4/8/8/8/7K w - - 0 1", "d5", "c7"),
    move("fork-knight-c6", "1r1q3k/8/8/4N3/8/8/8/K7 w - - 0 1", "e5", "c6"),
    move("fork-knight-d6", "2r1k3/8/8/5N2/8/8/8/7K w - - 0 1", "f5", "d6"),
    move("fork-knight-e6", "3r1k2/8/8/2N5/8/8/8/7K w - - 0 1", "c5", "e6"),
    move("fork-pawn-d6", "7k/2n1b3/8/3P4/8/8/8/K7 w - - 0 1", "d5", "d6"),
    move("fork-pawn-e6", "7k/3r1b2/8/4P3/8/8/8/K7 w - - 0 1", "e5", "e6"),
    move("fork-pawn-c6", "7k/1r1b4/8/2P5/8/8/8/K7 w - - 0 1", "c5", "c6"),
    move("fork-pawn-f6", "7k/4r1b1/8/5P2/8/8/8/K7 w - - 0 1", "f5", "f6")
];

const removeDefenders: PracticePosition[] = [
    select("defender-knight-f7", "3r3k/5n2/8/8/3Q4/8/8/K7 w - - 0 1", ["f7"]),
    select("defender-knight-g7", "4r2k/6n1/8/8/8/8/8/K3R3 w - - 0 1", ["g7"]),
    select("defender-queen-d6", "7k/8/3q3b/8/8/8/8/K6Q w - - 0 1", ["d6"]),
    select("defender-pawn-b7", "7k/1p6/2n5/8/8/5B2/8/K7 w - - 0 1", ["b7"]),
    select("defender-bishop-d5", "r6k/8/8/3b4/8/8/8/R6K w - - 0 1", ["d5"]),
    select("defender-rook-h6", "7q/8/7r/8/8/8/8/K6R w - - 0 1", ["h6"]),
    select("defender-queen-c6", "2b4k/8/2q5/8/8/8/8/K1R5 w - - 0 1", ["c6"]),
    select("defender-pawn-e7", "7k/4p3/5n2/6B1/8/8/8/K7 w - - 0 1", ["e7"])
];

const interference: PracticePosition[] = [
    select("interference-rank-e8", "r6q/8/8/8/8/8/8/K6k w - - 0 1", ["e8"]),
    select("interference-rank-d8", "q6r/8/8/8/8/8/8/K6k w - - 0 1", ["d8"]),
    select("interference-file-d5", "3r3k/8/8/8/8/8/8/K2q4 w - - 0 1", ["d5"]),
    select("interference-diagonal-d5", "7k/6q1/8/8/8/8/1b6/K7 w - - 0 1", ["d5"]),
    select("interference-diagonal-e4", "k7/1q6/8/8/8/8/6b1/7K w - - 0 1", ["e4"]),
    select("interference-file-f4", "5r1k/8/8/8/8/8/8/K4q2 w - - 0 1", ["f4"])
];

const matingNets: PracticePosition[] = [
    move("net-queen-h8", "7k/5Q2/5K2/8/8/8/8/8 w - - 0 1", "f7", "g7"),
    move("net-queen-a8", "k7/2Q5/2K5/8/8/8/8/8 w - - 0 1", "c7", "b7"),
    move("net-back-rank-right", "6k1/5ppp/8/8/8/8/8/K3R3 w - - 0 1", "e1", "e8"),
    move("net-ladder-right", "7k/R7/1R6/8/8/8/8/K7 w - - 0 1", "b6", "b8"),
    move("net-smothered-right", "6rk/5ppp/3N4/8/8/8/8/K7 w - - 0 1", "d6", "f7"),
    move("net-back-rank-left", "1k6/ppp5/8/8/8/8/8/3R3K w - - 0 1", "d1", "d8"),
    move("net-rook-h7", "7k/R7/6K1/8/8/8/8/8 w - - 0 1", "a7", "h7"),
    move("net-rook-a7", "k7/7R/1K6/8/8/8/8/8 w - - 0 1", "h7", "a7")
];

const activity: PracticePosition[] = [
    move("activity-rook-seventh", "7k/8/8/8/8/8/8/R6K w - - 0 1", "a1", "a7"),
    move("activity-bishop-diagonal", "7k/8/8/8/8/8/8/K1B5 w - - 0 1", "c1", "g5"),
    move("activity-knight-centre", "7k/8/8/8/8/8/8/1N5K w - - 0 1", "b1", "c3"),
    move("activity-rook-open-file", "7k/8/8/8/8/8/8/K2R4 w - - 0 1", "d1", "d7"),
    move("activity-bishop-centre", "7k/8/8/8/8/5B2/8/K7 w - - 0 1", "f3", "d5"),
    move("activity-knight-outpost", "7k/8/8/8/8/2N5/8/K7 w - - 0 1", "c3", "d5")
];

const opposition: PracticePosition[] = [
    move("opposition-e-file", "8/4k3/8/8/4K3/8/8/8 w - - 0 1", "e4", "e5"),
    move("opposition-d-file", "8/3k4/8/8/3K4/8/8/8 w - - 0 1", "d4", "d5"),
    move("opposition-c-file", "8/8/2k5/8/8/2K5/8/8 w - - 0 1", "c3", "c4"),
    move("opposition-f-file", "8/8/5k2/8/8/5K2/8/8 w - - 0 1", "f3", "f4"),
    move("opposition-shift-left", "8/3k4/8/4K3/8/8/8/8 w - - 0 1", "e5", "d5"),
    move("opposition-shift-right", "8/4k3/8/3K4/8/8/8/8 w - - 0 1", "d5", "e5"),
    move("opposition-c-to-d", "8/8/3k4/8/2K5/8/8/8 w - - 0 1", "c4", "d4"),
    move("opposition-f-to-e", "8/8/4k3/8/5K2/8/8/8 w - - 0 1", "f4", "e4")
];

const rookMate: PracticePosition[] = [
    move("rook-mate-h7", "7k/R7/6K1/8/8/8/8/8 w - - 0 1", "a7", "h7"),
    move("rook-mate-a7", "k7/7R/1K6/8/8/8/8/8 w - - 0 1", "h7", "a7"),
    move("rook-mate-h2", "8/8/8/8/8/6K1/R7/7k w - - 0 1", "a2", "h2"),
    move("rook-mate-a2", "8/8/8/8/8/1K6/7R/k7 w - - 0 1", "h2", "a2"),
    move("rook-box-e8", "7k/8/4RK2/8/8/8/8/8 w - - 0 1", "e6", "e8"),
    move("rook-box-d8", "k7/8/2KR4/8/8/8/8/8 w - - 0 1", "d6", "d8"),
    move("rook-mate-e1", "8/8/8/8/8/4R1K1/8/7k w - - 0 1", "e3", "e1"),
    move("rook-mate-d1", "8/8/8/8/8/1K1R4/8/k7 w - - 0 1", "d3", "d1")
];

export function buildPracticeLesson(lessonEntry: CurriculumLesson): PracticeLesson {
    if (lessonEntry.id == "intermediate.double-attack") {
        return lesson(lessonEntry.id, doubleAttacks, lessonEntry.practiceCount);
    }
    if (lessonEntry.id == "intermediate.fork") {
        return lesson(lessonEntry.id, forks, lessonEntry.practiceCount);
    }
    if (lessonEntry.id == "intermediate.remove-defender") {
        return lesson(lessonEntry.id, removeDefenders, lessonEntry.practiceCount);
    }
    if (lessonEntry.id == "intermediate.interference") {
        return lesson(lessonEntry.id, interference, lessonEntry.practiceCount);
    }
    if (lessonEntry.id == "intermediate.mating-net") {
        return lesson(lessonEntry.id, matingNets, lessonEntry.practiceCount);
    }
    if (lessonEntry.id == "intermediate.activity") {
        return lesson(lessonEntry.id, activity, lessonEntry.practiceCount);
    }
    if (lessonEntry.id == "ready.opposition") {
        return lesson(lessonEntry.id, opposition, lessonEntry.practiceCount);
    }
    if (lessonEntry.id == "ready.king-rook-mate") {
        return lesson(lessonEntry.id, rookMate, lessonEntry.practiceCount);
    }

    return buildCheckPracticeLesson(lessonEntry);
}
