import { Chess } from "chess.js";
import type { Square } from "chess.js";

import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildPreviousPracticeLesson } from "./lessonPracticeV12";
import type { MovePractice, PracticeLesson, PracticePosition } from "./lessonPracticeBase";

const escapeCheckMoves: MovePractice[] = [
    {
        id: "escape-bogo-bishop",
        kind: "move",
        fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 1",
        prompt: "findMove",
        expected: { from: "c1", to: "d2" },
        accepted: [{ from: "b1", to: "c3" }, { from: "b1", to: "d2" }]
    },
    {
        id: "escape-moscow-bishop",
        kind: "move",
        fen: "rnbqkbnr/pp2pppp/3p4/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1",
        prompt: "findMove",
        expected: { from: "c8", to: "d7" },
        accepted: [{ from: "b8", to: "c6" }]
    },
    {
        id: "escape-budapest-bishop",
        kind: "move",
        fen: "rnbqk2r/pppp1ppp/8/4P3/1bP2Bn1/8/PP2PPPP/RN1QKBNR w KQkq - 0 1",
        prompt: "findMove",
        expected: { from: "b1", to: "c3" },
        accepted: [{ from: "b1", to: "d2" }, { from: "d1", to: "d2" }]
    },
    {
        id: "escape-queen-a4",
        kind: "move",
        fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/Q1PP4/2N5/PP2PPPP/R1B1KBNR b KQkq - 0 1",
        prompt: "findMove",
        expected: { from: "c8", to: "d7" },
        accepted: [
            { from: "b8", to: "c6" },
            { from: "c7", to: "c6" },
            { from: "d8", to: "d7" }
        ]
    },
    {
        id: "escape-castled-bishop",
        kind: "move",
        fen: "r1bq1rk1/ppppbBpp/2n2n2/4p3/4P3/3P1N2/PPP2PPP/RNBQ1RK1 b - - 0 1",
        prompt: "findMove",
        expected: { from: "f8", to: "f7" }
    },
    {
        id: "escape-castled-knight",
        kind: "move",
        fen: "r2q1rk1/ppp2ppp/2np1N2/2b1p1B1/2BnP1b1/3P1N2/PPP2PPP/R2Q1RK1 b - - 0 1",
        prompt: "findMove",
        expected: { from: "g7", to: "f6" }
    },
    {
        id: "escape-centre-knight",
        kind: "move",
        fen: "r2qkbnr/ppp2ppp/3p4/3Pp3/2B1P1b1/4Bn2/PPP2PPP/RN1QK2R w KQkq - 0 1",
        prompt: "findMove",
        expected: { from: "g2", to: "f3" }
    }
];

const INTENTIONAL_SPARSE_LESSONS = new Set([
    "first-contact.board",
    "first-contact.sides",
    "first-contact.rook",
    "first-contact.bishop",
    "first-contact.queen",
    "first-contact.king",
    "first-contact.knight",
    "first-contact.pawn",
    "first-contact.white-first",
    "first-contact.turns",
    "first-contact.capture",
    "first-contact.capture-optional",
    "first-contact.blocking",
    "first-contact.knight-jumps",
    "first-contact.checkmate",
    "first-contact.mate-vs-stalemate",
    "first-contact.setup",
    "beginner.promotion",
    "beginner.en-passant",
    "beginner.draws",
    "intermediate.back-rank",
    "intermediate.ladder-mate",
    "intermediate.smothered-mate",
    "intermediate.mating-net",
    "ready.active-king",
    "ready.square-rule",
    "ready.opposition",
    "ready.distant-opposition",
    "ready.key-squares",
    "ready.king-queen-mate",
    "ready.king-rook-mate",
    "ready.pawn-endings",
    "ready.outside-passer"
]);

const ENDGAME_CHECKPOINT_MARKERS = [
    "ready.opposition",
    "ready.king-rook-mate",
    "ready.outside-passer"
];

const FILES = "abcdefgh";
const ALL_SQUARES: Square[] = Array.from({ length: 64 }, (_, index) => {
    const file = FILES[index % 8];
    const rank = Math.floor(index / 8) + 1;
    return `${file}${rank}` as Square;
});

type ContextPiece = {
    square: Square;
    type: "p" | "n" | "b" | "r" | "q";
    color: "w" | "b";
};

const CONTEXT_PIECES: ContextPiece[] = [
    { square: "a2", type: "p", color: "w" },
    { square: "a7", type: "p", color: "b" },
    { square: "h2", type: "p", color: "w" },
    { square: "h7", type: "p", color: "b" },
    { square: "b2", type: "p", color: "w" },
    { square: "b7", type: "p", color: "b" },
    { square: "g2", type: "p", color: "w" },
    { square: "g7", type: "p", color: "b" },
    { square: "c2", type: "p", color: "w" },
    { square: "c7", type: "p", color: "b" },
    { square: "f2", type: "p", color: "w" },
    { square: "f7", type: "p", color: "b" },
    { square: "d3", type: "p", color: "w" },
    { square: "d6", type: "p", color: "b" },
    { square: "e3", type: "p", color: "w" },
    { square: "e6", type: "p", color: "b" },
    { square: "c3", type: "n", color: "w" },
    { square: "c6", type: "n", color: "b" },
    { square: "f3", type: "n", color: "w" },
    { square: "f6", type: "n", color: "b" },
    { square: "c4", type: "b", color: "w" },
    { square: "c5", type: "b", color: "b" },
    { square: "f4", type: "b", color: "w" },
    { square: "f5", type: "b", color: "b" },
    { square: "a1", type: "r", color: "w" },
    { square: "a8", type: "r", color: "b" },
    { square: "h1", type: "r", color: "w" },
    { square: "h8", type: "r", color: "b" },
    { square: "d1", type: "q", color: "w" },
    { square: "d8", type: "q", color: "b" },
    { square: "e2", type: "p", color: "w" },
    { square: "e7", type: "p", color: "b" },
    { square: "b1", type: "n", color: "w" },
    { square: "b8", type: "n", color: "b" },
    { square: "g1", type: "n", color: "w" },
    { square: "g8", type: "n", color: "b" }
];

const STANDARD_LIMITS: Record<ContextPiece["type"], number> = {
    p: 8,
    n: 2,
    b: 2,
    r: 2,
    q: 1
};

function countPieces(board: Chess) {
    return ALL_SQUARES.reduce((count, square) => count + (board.get(square) ? 1 : 0), 0);
}

function countPieceType(board: Chess, type: ContextPiece["type"], color: ContextPiece["color"]) {
    return ALL_SQUARES.reduce((count, square) => {
        const piece = board.get(square);
        return count + (piece?.type == type && piece.color == color ? 1 : 0);
    }, 0);
}

function legalMoveSet(board: Chess) {
    return board.moves({ verbose: true }).map(move => `${move.from}${move.to}`);
}

function keepsTeachingMoveLegal(board: Chess, position: MovePractice) {
    const legal = new Set(legalMoveSet(board));
    if (!legal.has(`${position.expected.from}${position.expected.to}`)) return false;
    return (position.accepted || []).every(move => legal.has(`${move.from}${move.to}`));
}

function nearbySquares(square: Square) {
    const file = FILES.indexOf(square[0]);
    const rank = Number(square[1]) - 1;
    const output = new Set<Square>();

    for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
            const nextFile = file + dx;
            const nextRank = rank + dy;
            if (nextFile < 0 || nextFile > 7 || nextRank < 0 || nextRank > 7) continue;
            output.add(`${FILES[nextFile]}${nextRank + 1}` as Square);
        }
    }

    return output;
}

function protectedSquares(position: MovePractice) {
    const protectedSet = new Set<Square>([
        position.expected.from,
        position.expected.to,
        ...(position.focusSquares || []),
        ...(position.arrows || []).flatMap(([from, to]) => [from, to])
    ]);

    nearbySquares(position.expected.from).forEach(square => protectedSet.add(square));
    nearbySquares(position.expected.to).forEach(square => protectedSet.add(square));
    return protectedSet;
}

export function lessonNeedsGameContext(lessonId: string, positionId = "") {
    if (INTENTIONAL_SPARSE_LESSONS.has(lessonId)) return false;
    if (lessonId == "ready.final-checkpoint" && ENDGAME_CHECKPOINT_MARKERS.some(marker => positionId.includes(marker))) {
        return false;
    }
    return true;
}

function addGameContext(position: PracticePosition, lessonId: string): PracticePosition {
    if (position.kind != "move" || !lessonNeedsGameContext(lessonId, position.id)) return position;

    let board: Chess;
    try {
        board = new Chess(position.fen);
    } catch {
        return position;
    }

    if (countPieces(board) >= 12) return position;

    const blocked = protectedSquares(position);
    for (const candidate of CONTEXT_PIECES) {
        if (countPieces(board) >= 12) break;
        if (blocked.has(candidate.square) || board.get(candidate.square)) continue;
        if (countPieceType(board, candidate.type, candidate.color) >= STANDARD_LIMITS[candidate.type]) continue;

        const placed = board.put({ type: candidate.type, color: candidate.color }, candidate.square);
        if (!placed || !keepsTeachingMoveLegal(board, position)) {
            board.remove(candidate.square);
            continue;
        }
    }

    return { ...position, fen: board.fen() };
}

function buildDirectLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "first-contact.escape-check") {
        return {
            lessonId: lesson.id,
            positions: escapeCheckMoves.slice(0, lesson.practiceCount)
        };
    }
    return buildPreviousPracticeLesson(lesson);
}

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    const generated = buildDirectLesson(lesson);
    return {
        lessonId: generated.lessonId,
        positions: generated.positions.map(position => addGameContext(position, lesson.id))
    };
}
