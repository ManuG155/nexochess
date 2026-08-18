import { Chess } from "chess.js";
import type { Square } from "chess.js";

import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildPreviousPracticeLesson } from "./lessonPracticeV10";
import type { MovePractice, PracticeLesson, PracticePosition } from "./lessonPracticeBase";

function move(id: string, fen: string, from: Square, to: Square): MovePractice {
    return {
        id,
        kind: "move",
        fen,
        prompt: "findMove",
        expected: { from, to }
    };
}

const MARKER_SQUARES: Square[] = [
    "a3", "h3", "a6", "h6", "b3", "g3", "b6", "g6",
    "c3", "f3", "c6", "f6", "a4", "h4", "b5", "g5"
];

function expectedIsLegal(position: MovePractice, fen = position.fen) {
    try {
        const board = new Chess(fen);
        return board.moves({ verbose: true }).some(candidate => (
            candidate.from == position.expected.from
            && candidate.to == position.expected.to
        ));
    } catch {
        return false;
    }
}

function expandMoves(lessonId: string, seeds: MovePractice[], count: number): PracticeLesson {
    const output: MovePractice[] = [];
    const signatures = new Set<string>();
    let variant = 0;

    while (output.length < count) {
        const seed = seeds[variant % seeds.length];
        let candidate: MovePractice = {
            ...seed,
            id: `${lessonId}-${output.length}-${seed.id}`
        };

        if (variant >= seeds.length) {
            const original = new Chess(seed.fen);
            const markerColour = original.turn() == "w" ? "b" : "w";
            const start = variant % MARKER_SQUARES.length;
            let variedFen: string | undefined;

            for (let offset = 0; offset < MARKER_SQUARES.length; offset += 1) {
                const marker = MARKER_SQUARES[(start + offset) % MARKER_SQUARES.length];
                if (marker == seed.expected.from || marker == seed.expected.to || original.get(marker)) {
                    continue;
                }

                const board = new Chess(seed.fen);
                if (!board.put({ type: "p", color: markerColour }, marker)) continue;
                const fen = board.fen();
                if (!expectedIsLegal(seed, fen)) continue;
                const signature = `${fen}:${seed.expected.from}${seed.expected.to}`;
                if (signatures.has(signature)) continue;
                variedFen = fen;
                break;
            }

            if (!variedFen) {
                throw new Error(`Could not create a distinct move practice for ${lessonId}.`);
            }
            candidate = { ...candidate, fen: variedFen };
        }

        if (!expectedIsLegal(candidate)) {
            throw new Error(
                `Lesson ${lessonId} contains illegal expected move `
                + `${candidate.expected.from}${candidate.expected.to}.`
            );
        }

        const signature = `${candidate.fen}:${candidate.expected.from}${candidate.expected.to}`;
        if (!signatures.has(signature)) {
            signatures.add(signature);
            output.push(candidate);
        }
        variant += 1;
    }

    return { lessonId, positions: output };
}

const moveFirstLessons: Record<string, MovePractice[]> = {
    "first-contact.board": [
        move("board-a1", "7k/8/8/8/8/8/1K6/8 w - - 0 1", "b2", "a1"),
        move("board-h1", "k7/8/8/8/8/8/6K1/8 w - - 0 1", "g2", "h1"),
        move("board-d4", "7k/8/8/4K3/8/8/8/8 w - - 0 1", "e5", "d4")
    ],
    "first-contact.sides": [
        move("sides-white-e4", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "e2", "e4"),
        move("sides-black-e5", "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b kq - 0 1", "e7", "e5"),
        move("sides-white-nf3", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "g1", "f3"),
        move("sides-black-nf6", "rnbqkbnr/pppppppp/8/8/4P3/5N2/PPPP1PPP/RNBQKB1R b kq - 1 1", "g8", "f6")
    ],
    "first-contact.white-first": [
        move("white-first-e4", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "e2", "e4"),
        move("white-first-d4", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "d2", "d4")
    ],
    "first-contact.turns": [
        move("turn-white", "7k/8/5n2/8/8/2N5/8/K7 w - - 0 1", "c3", "d5"),
        move("turn-black", "7k/8/5n2/8/8/2N5/8/K7 b - - 0 1", "f6", "d5")
    ],
    "first-contact.blocking": [
        move("blocking-bishop", "7k/8/8/8/8/8/3P4/K1B5 w - - 0 1", "d2", "d4"),
        move("blocking-bishop-king", "7k/8/8/8/8/8/4P3/K4B2 w - - 0 1", "e2", "e4"),
        move("blocking-rook-capture", "7k/8/8/8/2p5/3P4/8/K2R4 w - - 0 1", "d3", "c4")
    ],
    "first-contact.king-safety-rule": [
        move("king-safe-rook", "3r3k/8/8/8/3K4/8/8/8 w - - 0 1", "d4", "c3"),
        move("king-safe-bishop", "7k/1b6/8/8/4K3/8/8/8 w - - 0 1", "e4", "f3"),
        move("king-safe-queen", "7k/8/8/8/q2K4/8/8/8 w - - 0 1", "d4", "e3")
    ],
    "first-contact.setup": [
        move("setup-e-pawn", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "e2", "e4"),
        move("setup-d-pawn", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "d2", "d4"),
        move("setup-knight-g", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "g1", "f3"),
        move("setup-knight-b", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "b1", "c3")
    ],
    "beginner.attacked": [
        move("attacked-queen", "3r3k/8/8/8/3Q4/8/8/K7 w - - 0 1", "d4", "f2"),
        move("attacked-knight", "1b5k/8/8/4N3/8/8/8/K7 w - - 0 1", "e5", "c4"),
        move("attacked-rook", "7k/3b4/8/8/R7/8/8/K7 w - - 0 1", "a4", "a2")
    ],
    "beginner.defended": [
        move("defended-knight", "7k/8/8/5p2/3N4/3Q4/8/K7 w - - 0 1", "d4", "f5"),
        move("defended-knight-c5", "7k/8/8/2p5/4N3/4Q3/8/K7 w - - 0 1", "e4", "c5"),
        move("defended-bishop", "7k/8/4p3/8/2B5/1Q6/8/K7 w - - 0 1", "c4", "e6")
    ],
    "beginner.loose": [
        move("loose-bishop", "7k/8/8/3b4/8/8/8/K2Q4 w - - 0 1", "d1", "d5"),
        move("loose-knight", "7k/8/8/4n3/8/8/1B6/K7 w - - 0 1", "b2", "e5"),
        move("loose-rook", "7k/8/5r2/8/3B4/8/8/K7 w - - 0 1", "d4", "f6")
    ],
    "beginner.queen-early": [
        move("queen-early-a3", "6k1/8/8/8/1q6/8/P7/6K1 w - - 0 1", "a2", "a3"),
        move("queen-early-h4", "1k6/8/8/6q1/8/8/7P/K7 w - - 0 1", "h2", "h4"),
        move("queen-early-c3", "6k1/8/8/8/1q6/8/2P5/6K1 w - - 0 1", "c2", "c3")
    ],
    "beginner.threat-awareness": [
        move("threat-save-queen", "3r3k/8/8/8/3Q4/8/8/K7 w - - 0 1", "d4", "f2"),
        move("threat-save-rook", "7k/3b4/8/8/R7/8/8/K7 w - - 0 1", "a4", "a2"),
        move("threat-save-knight", "1b5k/8/8/4N3/8/8/8/K7 w - - 0 1", "e5", "c4")
    ],
    "intermediate.threats": [
        move("threat-knight-queen", "7k/8/5q2/8/8/2N5/8/K7 w - - 0 1", "c3", "d5"),
        move("threat-bishop-queen", "3q3k/8/8/8/8/8/8/K1B5 w - - 0 1", "c1", "g5"),
        move("threat-rook-queen", "7k/3q4/8/8/8/8/8/R6K w - - 0 1", "a1", "d1")
    ],
    "intermediate.pin": [
        move("pin-bishop", "4k3/8/2n5/8/2B5/8/8/K7 w - - 0 1", "c4", "b5"),
        move("pin-bishop-f", "4k3/8/2n5/8/8/8/8/K4B2 w - - 0 1", "f1", "b5"),
        move("pin-rook", "3k4/3n4/8/8/8/8/8/R6K w - - 0 1", "a1", "d1")
    ],
    "intermediate.skewer": [
        move("skewer-rook-d", "3q4/3k4/8/8/8/8/8/K2R4 w - - 0 1", "d1", "d6"),
        move("skewer-rook-e", "4q3/4k3/8/8/8/8/8/K3R3 w - - 0 1", "e1", "e6"),
        move("skewer-bishop", "4q3/3k4/8/8/2B5/8/8/K7 w - - 0 1", "c4", "b5")
    ],
    "intermediate.remove-defender": [
        move("remove-knight", "3r3k/8/2n5/8/8/8/6B1/K2Q4 w - - 0 1", "g2", "c6"),
        move("remove-bishop", "2r4k/8/4b3/8/8/8/8/K2QR3 w - - 0 1", "e1", "e6"),
        move("remove-pawn", "7k/4p3/5n2/6B1/8/8/8/K7 w - - 0 1", "g5", "e7")
    ],
    "intermediate.overload": [
        move("overload-queen-h", "3r3k/8/3q3p/8/8/8/8/K6Q w - - 0 1", "h1", "h6"),
        move("overload-queen-a", "k2r4/p2q4/8/8/8/8/8/Q6K w - - 0 1", "a1", "a7"),
        move("overload-bishop", "2r4k/8/4b3/7p/8/8/8/K6Q w - - 0 1", "h1", "h5")
    ],
    "intermediate.interference": [
        move("interference-rank", "r6q/7k/2B5/8/8/8/8/K7 w - - 0 1", "c6", "e8"),
        move("interference-diagonal", "7k/6q1/8/8/8/5N2/1b6/K7 w - - 0 1", "f3", "d4"),
        move("interference-file", "3r3k/8/8/8/8/2B5/8/K2q4 w - - 0 1", "c3", "d4")
    ],
    "intermediate.xray": [
        move("xray-rook", "3q3k/8/8/3n4/8/8/8/R6K w - - 0 1", "a1", "d1"),
        move("xray-bishop", "7k/8/6r1/5p2/8/8/8/KB6 w - - 0 1", "b1", "e4"),
        move("xray-queen", "7k/7q/7n/8/8/8/8/K2Q4 w - - 0 1", "d1", "h5")
    ],
    "intermediate.trapped-piece": [
        move("trap-finish-queen", "q6k/8/2B5/8/8/8/8/7K w - - 0 1", "c6", "a8"),
        move("trap-finish-rook", "k6r/5N2/8/8/8/8/8/7K w - - 0 1", "f7", "h8"),
        move("trap-finish-bishop", "7k/8/5b2/8/3N4/8/8/K7 w - - 0 1", "d4", "f5")
    ],
    "intermediate.open-files": [
        move("open-file-left", "7k/8/8/8/8/8/8/R6K w - - 0 1", "a1", "d1"),
        move("open-file-right", "7k/8/8/8/8/8/8/K6R w - - 0 1", "h1", "e1")
    ],
    "intermediate.weak-squares": [
        move("weak-d5", "7k/8/2p1p3/8/5N2/8/8/K7 w - - 0 1", "f4", "d5"),
        move("weak-e5", "7k/8/3p1p2/8/2N5/8/8/K7 w - - 0 1", "c4", "e5")
    ],
    "intermediate.passed-pawn": [
        move("passed-d", "7k/8/p6p/3P4/8/8/8/K7 w - - 0 1", "d5", "d6"),
        move("passed-f", "7k/8/1pp5/5P2/8/8/8/K7 w - - 0 1", "f5", "f6")
    ],
    "intermediate.worst-piece": [
        move("worst-bishop", "7k/8/8/8/3PP3/8/8/K1B5 w - - 0 1", "c1", "f4"),
        move("worst-knight", "7k/8/8/8/8/8/8/1N5K w - - 0 1", "b1", "c3"),
        move("worst-rook", "7k/8/8/8/8/8/8/R6K w - - 0 1", "a1", "a7")
    ],
    "ready.square-rule": [
        move("square-rule-e", "7k/8/8/4p3/8/8/8/6K1 w - - 0 1", "g1", "f2"),
        move("square-rule-d", "k7/8/8/3p4/8/8/8/1K6 w - - 0 1", "b1", "c2"),
        move("square-rule-c", "7k/8/2p5/8/8/8/8/6K1 w - - 0 1", "g1", "f2")
    ],
    "ready.key-squares": [
        move("key-e", "7k/8/8/4K3/4P3/8/8/8 w - - 0 1", "e5", "e6"),
        move("key-d", "7k/8/8/3K4/3P4/8/8/8 w - - 0 1", "d5", "c6"),
        move("key-f", "k7/8/8/5K2/5P2/8/8/8 w - - 0 1", "f5", "f6")
    ],
    "ready.outside-passer": [
        move("outside-a", "7k/8/4p3/P2P4/8/8/8/K7 w - - 0 1", "a5", "a6"),
        move("outside-h", "k7/8/3p4/4P2P/8/8/8/7K w - - 0 1", "h5", "h6")
    ],
    "ready.blunder-check": [
        move("blunder-save-queen", "3r3k/8/8/8/3Q4/8/8/K7 w - - 0 1", "d4", "f2"),
        move("blunder-save-knight", "1b5k/8/8/4N3/8/8/8/K7 w - - 0 1", "e5", "c4"),
        move("blunder-save-rook", "7k/3b4/8/8/R7/8/8/K7 w - - 0 1", "a4", "a2")
    ]
};

function curatedCheckpoint(lesson: CurriculumLesson): PracticeLesson | undefined {
    if (lesson.id != "intermediate.checkpoint" && lesson.id != "ready.final-checkpoint") {
        return undefined;
    }

    const sourceIds = lesson.id == "intermediate.checkpoint"
        ? ["intermediate.remove-defender", "intermediate.pin", "intermediate.interference", "intermediate.fork", "intermediate.mating-net"]
        : ["ready.opposition", "ready.king-rook-mate", "intermediate.activity", "intermediate.remove-defender", "ready.outside-passer"];

    const positions: PracticePosition[] = [];
    for (const sourceId of sourceIds) {
        const sourceLesson = { ...lesson, id: sourceId, practiceCount: 2 };
        const override = moveFirstLessons[sourceId];
        const generated = override
            ? expandMoves(sourceId, override, 2)
            : buildPreviousPracticeLesson(sourceLesson);
        generated.positions.forEach((position, index) => {
            positions.push({ ...position, id: `${lesson.id}-${sourceId}-${index}` });
        });
    }

    return { lessonId: lesson.id, positions: positions.slice(0, lesson.practiceCount) };
}

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    const checkpoint = curatedCheckpoint(lesson);
    if (checkpoint) return checkpoint;

    const override = moveFirstLessons[lesson.id];
    if (override) return expandMoves(lesson.id, override, lesson.practiceCount);

    const previous = buildPreviousPracticeLesson(lesson);
    const remainingSelect = previous.positions.find(position => position.kind == "select");
    if (remainingSelect) {
        throw new Error(
            `Lesson ${lesson.id} still uses select-only practice (${remainingSelect.id}). `
            + "Every board exercise must be solved by moving a piece."
        );
    }
    return previous;
}
