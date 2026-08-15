import { Chess } from "chess.js";
import type { Square } from "chess.js";

import type { CurriculumLesson } from "./curriculum";
import {
    buildPracticeLesson as buildBasePracticeLesson
} from "./lessonPractice";
import type {
    ChoicePractice,
    PracticeLesson,
    PracticePosition,
    SelectPractice
} from "./lessonPractice";

const MARKER_SQUARES: Square[] = [
    "a6", "h6", "b6", "g6", "a3", "h3", "b3", "g3",
    "c6", "f6", "c3", "f3", "a5", "h5", "b5", "g5"
];

function signature(position: PracticePosition) {
    return JSON.stringify({
        fen: position.fen,
        kind: position.kind,
        expected: position.kind == "move" ? position.expected : undefined,
        acceptedSquares: position.kind == "select" ? position.acceptedSquares : undefined,
        correctChoice: position.kind == "choice" ? position.correctChoice : undefined
    });
}

function moveStillLegal(position: PracticePosition, fen: string) {
    if (position.kind != "move") return true;

    try {
        const board = new Chess(fen);
        return board.moves({ verbose: true }).some(move => (
            move.from == position.expected.from
            && move.to == position.expected.to
        ));
    } catch {
        return false;
    }
}

function distance(a: Square, b: Square) {
    const fileA = a.charCodeAt(0) - 97;
    const fileB = b.charCodeAt(0) - 97;
    const rankA = Number(a[1]);
    const rankB = Number(b[1]);
    return Math.max(Math.abs(fileA - fileB), Math.abs(rankA - rankB));
}

function importantSquares(position: PracticePosition) {
    const values = new Set<Square>(position.focusSquares || []);

    if (position.kind == "move") {
        values.add(position.expected.from);
        values.add(position.expected.to);
    } else if (position.kind == "select") {
        position.acceptedSquares.forEach(square => values.add(square));
    }

    return [...values];
}

function varyWithHarmlessMarker(
    position: PracticePosition,
    variant: number,
    used: Set<string>
): PracticePosition | undefined {
    if (position.kind == "choice") return undefined;

    let original: Chess;
    try {
        original = new Chess(position.fen);
    } catch {
        return undefined;
    }

    const protectedSquares = importantSquares(position);
    const sideToMove = original.turn();
    const markerColour = sideToMove == "w" ? "b" : "w";
    const candidates = [
        ...MARKER_SQUARES.slice(variant % MARKER_SQUARES.length),
        ...MARKER_SQUARES.slice(0, variant % MARKER_SQUARES.length)
    ];

    for (const candidate of candidates) {
        if (original.get(candidate)) continue;
        if (protectedSquares.some(square => distance(square, candidate) < 3)) continue;

        const board = new Chess(position.fen);
        const placed = board.put({ type: "p", color: markerColour }, candidate);
        if (!placed) continue;

        const fen = board.fen();
        if (!moveStillLegal(position, fen)) continue;

        const varied = {
            ...position,
            id: `${position.id}-var-${variant}-${candidate}`,
            fen
        } as PracticePosition;

        if (!used.has(signature(varied))) return varied;
    }

    return undefined;
}

function select(
    id: string,
    fen: string,
    acceptedSquares: Square[],
    prompt: SelectPractice["prompt"] = "selectMover"
): SelectPractice {
    return {
        id,
        kind: "select",
        fen,
        prompt,
        acceptedSquares
    };
}

function foundationalSidePractice(lessonId: string): PracticePosition[] {
    const whiteBack: Square[] = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"];
    const whitePawns: Square[] = ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"];

    const positions: PracticePosition[] = [
        select(
            `${lessonId}-full`,
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            [...whiteBack, ...whitePawns]
        ),
        select(
            `${lessonId}-developed`,
            "r1bqk2r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5",
            ["a1", "c1", "d1", "e1", "h1", "a2", "b2", "c2", "d2", "f2", "g2", "h2", "c3", "f3", "e4"]
        ),
        select(
            `${lessonId}-endgame`,
            "8/5pk1/6p1/8/4P3/5K2/6P1/8 w - - 0 1",
            ["f3", "e4", "g2"]
        ),
        select(
            `${lessonId}-pieces`,
            "4k3/8/2n2b2/8/3Q4/2B2N2/8/4K3 w - - 0 1",
            ["e1", "c3", "f3", "d4"]
        )
    ];

    return positions;
}

function drawPractice(): PracticePosition[] {
    const choices: ChoicePractice["choices"] = ["draw", "checkmate", "continue"];
    return [
        {
            id: "draw-stalemate-corner",
            kind: "choice",
            fen: "7k/5K2/6Q1/8/8/8/8/8 b - - 0 1",
            prompt: "choose",
            choices,
            correctChoice: "draw"
        },
        {
            id: "draw-bare-kings",
            kind: "choice",
            fen: "7k/8/8/8/8/8/8/K7 w - - 0 1",
            prompt: "choose",
            choices,
            correctChoice: "draw"
        },
        {
            id: "draw-bishop-kings",
            kind: "choice",
            fen: "7k/8/8/8/8/8/2B5/K7 w - - 0 1",
            prompt: "choose",
            choices,
            correctChoice: "draw"
        },
        {
            id: "draw-knight-kings",
            kind: "choice",
            fen: "7k/8/8/8/8/8/2N5/K7 w - - 0 1",
            prompt: "choose",
            choices,
            correctChoice: "draw"
        },
        {
            id: "draw-stalemate-left",
            kind: "choice",
            fen: "k7/2K5/1Q6/8/8/8/8/8 b - - 0 1",
            prompt: "choose",
            choices,
            correctChoice: "draw"
        },
        {
            id: "draw-insufficient-bishop",
            kind: "choice",
            fen: "8/7k/8/8/8/5B2/8/K7 b - - 0 1",
            prompt: "choose",
            choices,
            correctChoice: "draw"
        }
    ];
}

function ensureUnique(base: PracticeLesson): PracticeLesson {
    const used = new Set<string>();
    const positions: PracticePosition[] = [];

    base.positions.forEach((position, index) => {
        let candidate = position;
        let key = signature(candidate);

        if (used.has(key)) {
            const varied = varyWithHarmlessMarker(position, index + 1, used);
            if (varied) {
                candidate = varied;
                key = signature(candidate);
            }
        }

        positions.push(candidate);
        used.add(key);
    });

    return { ...base, positions };
}

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "first-contact.sides" || lesson.id == "first-contact.white-first") {
        const positions = foundationalSidePractice(lesson.id).slice(0, lesson.practiceCount);
        return { lessonId: lesson.id, positions };
    }

    if (lesson.id == "beginner.draws") {
        return {
            lessonId: lesson.id,
            positions: drawPractice().slice(0, lesson.practiceCount)
        };
    }

    return ensureUnique(buildBasePracticeLesson(lesson));
}
