import { Chess } from "chess.js";
import type { Square } from "chess.js";

import type { PracticePosition } from "./lessonPracticeBase";

const FILES = "abcdefgh";
const ALL_SQUARES: Square[] = Array.from({ length: 64 }, (_, index) => {
    const file = FILES[index % 8];
    const rank = Math.floor(index / 8) + 1;
    return `${file}${rank}` as Square;
});

export type LessonPieceType = "p" | "n" | "b" | "r" | "q" | "k";

export interface LessonCoachContext {
    turn: "white" | "black";
    checkerType?: LessonPieceType;
    checkerSquare?: Square;
    movingPieceType?: LessonPieceType;
    from?: Square;
    targetPieceType?: LessonPieceType;
    to?: Square;
}

function coordinates(square: Square) {
    return {
        file: FILES.indexOf(square[0]),
        rank: Number(square[1]) - 1
    };
}

function clearRay(board: Chess, from: Square, target: Square) {
    const start = coordinates(from);
    const end = coordinates(target);
    const stepFile = Math.sign(end.file - start.file);
    const stepRank = Math.sign(end.rank - start.rank);
    let file = start.file + stepFile;
    let rank = start.rank + stepRank;

    while (file != end.file || rank != end.rank) {
        const square = `${FILES[file]}${rank + 1}` as Square;
        if (board.get(square)) return false;
        file += stepFile;
        rank += stepRank;
    }

    return true;
}

function attacksSquare(
    board: Chess,
    from: Square,
    type: LessonPieceType,
    color: "w" | "b",
    target: Square
) {
    const start = coordinates(from);
    const end = coordinates(target);
    const dx = end.file - start.file;
    const dy = end.rank - start.rank;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (type == "p") {
        const direction = color == "w" ? 1 : -1;
        return absX == 1 && dy == direction;
    }
    if (type == "n") {
        return (absX == 1 && absY == 2) || (absX == 2 && absY == 1);
    }
    if (type == "k") {
        return Math.max(absX, absY) == 1;
    }
    if (type == "b") {
        return absX == absY && absX > 0 && clearRay(board, from, target);
    }
    if (type == "r") {
        return (dx == 0 || dy == 0) && (absX + absY > 0) && clearRay(board, from, target);
    }
    return (
        ((absX == absY && absX > 0) || ((dx == 0 || dy == 0) && absX + absY > 0))
        && clearRay(board, from, target)
    );
}

function findKing(board: Chess, color: "w" | "b") {
    return ALL_SQUARES.find(square => {
        const piece = board.get(square);
        return piece?.color == color && piece.type == "k";
    });
}

function findChecker(board: Chess, turn: "w" | "b") {
    const kingSquare = findKing(board, turn);
    if (!kingSquare) return undefined;
    const enemy = turn == "w" ? "b" : "w";

    for (const square of ALL_SQUARES) {
        const piece = board.get(square);
        if (!piece || piece.color != enemy) continue;
        if (attacksSquare(board, square, piece.type as LessonPieceType, piece.color, kingSquare)) {
            return {
                type: piece.type as LessonPieceType,
                square
            };
        }
    }

    return undefined;
}

export function analyseLessonPosition(
    position: PracticePosition | undefined,
    fen: string
): LessonCoachContext {
    let board: Chess;
    try {
        board = new Chess(fen);
    } catch {
        return { turn: "white" };
    }

    const turn = board.turn();
    const checker = findChecker(board, turn);
    const context: LessonCoachContext = {
        turn: turn == "b" ? "black" : "white",
        checkerType: checker?.type,
        checkerSquare: checker?.square
    };

    if (position?.kind == "move") {
        const movingPiece = board.get(position.expected.from);
        const targetPiece = board.get(position.expected.to);
        context.movingPieceType = movingPiece?.type as LessonPieceType | undefined;
        context.targetPieceType = targetPiece?.type as LessonPieceType | undefined;
        context.from = position.expected.from;
        context.to = position.expected.to;
    }

    return context;
}
