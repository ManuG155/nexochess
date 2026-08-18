import { Chess } from "chess.js";
import type { Square } from "chess.js";

import type {
    AttemptResult,
    LessonMove,
    MoveStep,
    SelectSquareStep
} from "./lessonModel";

const FILES = "abcdefgh";

function sameMove(a: LessonMove, b: LessonMove) {
    return a.from == b.from && a.to == b.to;
}

function pathBlocked(board: Chess, from: Square, to: Square) {
    const fromFile = FILES.indexOf(from[0]);
    const toFile = FILES.indexOf(to[0]);
    const fromRank = Number(from[1]);
    const toRank = Number(to[1]);

    const fileStep = Math.sign(toFile - fromFile);
    const rankStep = Math.sign(toRank - fromRank);

    let file = fromFile + fileStep;
    let rank = fromRank + rankStep;

    while (file != toFile || rank != toRank) {
        const square = `${FILES[file]}${rank}` as Square;
        if (board.get(square)) return true;
        file += fileStep;
        rank += rankStep;
    }

    return false;
}

export function evaluateMoveAttempt(
    step: MoveStep,
    from: Square,
    to: Square
): AttemptResult {
    const board = new Chess(step.fen);
    const piece = board.get(from);
    const attempted = { from, to };

    let move;
    try {
        move = board.move({ from, to });
    } catch {
        move = undefined;
    }

    if (move && sameMove(attempted, step.targetMove)) {
        return {
            outcome: "success",
            feedbackKey: step.successKey,
            resultingFen: board.fen(),
            san: move.san
        };
    }

    if (
        move
        && step.acceptedMoves?.some(candidate => sameMove(attempted, candidate))
    ) {
        return {
            outcome: "acceptedAlternative",
            feedbackKey: step.successKey,
            resultingFen: board.fen(),
            san: move.san
        };
    }

    if (move) {
        return {
            outcome: "legalOffTarget",
            feedbackKey: "feedback.legalOffTarget"
        };
    }

    if (piece?.type == "r") {
        const sameFile = from[0] == to[0];
        const sameRank = from[1] == to[1];

        if (!sameFile && !sameRank) {
            return {
                outcome: "conceptualError",
                feedbackKey: "feedback.rookDiagonal"
            };
        }

        if ((sameFile || sameRank) && pathBlocked(board, from, to)) {
            return {
                outcome: "conceptualError",
                feedbackKey: "feedback.blocked"
            };
        }
    }

    return {
        outcome: "illegalAction",
        feedbackKey: "feedback.illegalAction"
    };
}

export function evaluateSquareAttempt(
    step: SelectSquareStep,
    square: Square
): AttemptResult {
    if (step.acceptedSquares.includes(square)) {
        return {
            outcome: "success",
            feedbackKey: step.successKey
        };
    }

    return {
        outcome: "legalOffTarget",
        feedbackKey: "feedback.wrongSquare"
    };
}
