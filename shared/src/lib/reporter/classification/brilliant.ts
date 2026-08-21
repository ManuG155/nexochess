import {
    Chess,
    Color,
    KING,
    Move,
    PieceSymbol,
    Square
} from "chess.js";

import {
    ExtractedPreviousNode,
    ExtractedCurrentNode
} from "../types/ExtractedNode";
import type { BoardPiece } from "../types/BoardPiece";
import { pieceValues } from "@/constants/utils";
import { isMoveCriticalCandidate } from "../utils/criticalMove";
import { getAttackingMoves } from "../utils/attackers";
import { isPieceSafe } from "../utils/pieceSafety";
import type Evaluation from "@/types/game/position/Evaluation";

const KING_DRAW_MATERIAL_DEFICIT = -3;
const KING_DRAW_WINDOW = 0.35;
const KING_DRAW_ALTERNATIVE_LOSS = -1.5;
const SACRIFICE_PV_PLIES = 8;
const SOUND_POSITIONAL_COMPENSATION = 1.5;

function evaluationForMover(
    evaluation: Evaluation,
    mover: Color
) {
    if (evaluation.type == "mate") {
        const mateForMover =
            (evaluation.value > 0)
            == (mover == "w");

        return mateForMover
            ? Number.POSITIVE_INFINITY
            : Number.NEGATIVE_INFINITY;
    }

    const whiteScore = evaluation.value / 100;
    return mover == "w"
        ? whiteScore
        : -whiteScore;
}

function isMateForMover(
    evaluation: Evaluation,
    mover: Color
) {
    return evaluation.type == "mate"
        && (
            (evaluation.value > 0)
            == (mover == "w")
        );
}

function materialBalance(
    board: Chess,
    mover: Color
) {
    let balance = 0;

    for (const rank of board.board()) {
        for (const piece of rank) {
            if (!piece || piece.type == KING) continue;

            const value = pieceValues[piece.type] || 0;
            balance += piece.color == mover
                ? value
                : -value;
        }
    }

    return balance;
}

function kingMoveSavesDraw(
    previous: ExtractedPreviousNode,
    current: ExtractedCurrentNode
) {
    const move = current.playedMove;
    if (move.piece != KING) return false;

    const mover = move.color;
    const deficit = materialBalance(previous.board, mover);

    if (deficit > KING_DRAW_MATERIAL_DEFICIT) {
        return false;
    }

    const bestScore = evaluationForMover(
        previous.evaluation,
        mover
    );

    if (
        !Number.isFinite(bestScore)
        || Math.abs(bestScore) > KING_DRAW_WINDOW
    ) {
        return false;
    }

    const alternative = previous.secondTopLine?.evaluation;
    if (!alternative) return false;

    const alternativeScore = evaluationForMover(
        alternative,
        mover
    );

    return alternativeScore
        <= KING_DRAW_ALTERNATIVE_LOSS;
}

interface SacrificeContinuation {
    accepted: boolean;
    materialSwing: number;
}

function analyseSacrificeContinuation(
    current: ExtractedCurrentNode,
    initialMaterialSwing: number
): SacrificeContinuation {
    const mover = current.playedMove.color;
    const offeredPiece = current.playedMove.piece as PieceSymbol;
    const board = new Chess(current.board.fen());

    let trackedSquare: Square = current.playedMove.to;
    let accepted = false;
    let materialSwing = initialMaterialSwing;

    for (
        let index = 0;
        index < Math.min(
            current.topLine.moves.length,
            SACRIFICE_PV_PLIES
        );
        index += 1
    ) {
        const uci = current.topLine.moves[index]?.uci;
        if (!uci) break;

        let move: Move;

        try {
            move = board.move(uci);
        } catch {
            break;
        }

        if (move.captured) {
            const capturedValue =
                pieceValues[move.captured as PieceSymbol] || 0;

            materialSwing += move.color == mover
                ? capturedValue
                : -capturedValue;
        }

        if (
            !accepted
            && move.color != mover
            && move.to == trackedSquare
            && move.captured == offeredPiece
        ) {
            accepted = true;
            continue;
        }

        /*
         * If the offered piece simply moves away before being taken, this
         * was a threat/tempo move, not a sacrifice.
         */
        if (
            !accepted
            && move.color == mover
            && move.from == trackedSquare
        ) {
            return {
                accepted: false,
                materialSwing
            };
        }
    }

    return {
        accepted,
        materialSwing
    };
}

function isSoundSacrifice(
    previous: ExtractedPreviousNode,
    current: ExtractedCurrentNode
) {
    const move = current.playedMove;

    if (move.piece == KING || move.promotion) return false;
    if (!isMoveCriticalCandidate(previous, current)) return false;

    const movedValue = pieceValues[move.piece as PieceSymbol] || 0;
    const capturedValue = move.captured
        ? pieceValues[move.captured as PieceSymbol] || 0
        : 0;

    /*
     * A bishop taking a queen and then being recaptured is not a sacrifice:
     * the move has already won more material than the bishop is worth.
     */
    if (movedValue <= capturedValue) return false;

    const beforePiece: BoardPiece = {
        square: move.from,
        type: move.piece as PieceSymbol,
        color: move.color
    };

    /*
     * Do not award Brilliant for merely disposing of a piece that was
     * already tactically lost before the move.
     */
    if (!isPieceSafe(previous.board, beforePiece)) {
        return false;
    }

    const offeredPiece: BoardPiece = {
        square: move.to,
        type: move.piece as PieceSymbol,
        color: move.color
    };

    if (
        getAttackingMoves(
            current.board,
            offeredPiece,
            false
        ).length == 0
    ) {
        return false;
    }

    const continuation = analyseSacrificeContinuation(
        current,
        capturedValue
    );

    if (!continuation.accepted) return false;

    const moverScore = evaluationForMover(
        current.evaluation,
        move.color
    );

    const concreteCompensation =
        continuation.materialSwing >= 0
        || isMateForMover(
            current.topLine.evaluation,
            move.color
        )
        || moverScore >= SOUND_POSITIONAL_COMPENSATION;

    return concreteCompensation;
}

/**
 * Brilliant is deliberately rare and concrete:
 *
 * - a sound sacrifice that the principal variation actually accepts and
 *   whose continuation produces material, mating or clear positional
 *   compensation; or
 * - a king move that is the unique drawing resource while materially lost.
 *
 * Strong non-sacrificial moves remain Best/Excellent/Great instead.
 */
export function considerBrilliantClassification(
    previous: ExtractedPreviousNode,
    current: ExtractedCurrentNode
) {
    if (current.playedMove.promotion) return false;

    if (kingMoveSavesDraw(previous, current)) {
        return true;
    }

    return isSoundSacrifice(previous, current);
}
