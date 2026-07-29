import {
    PAWN
} from "chess.js";

import {
    ExtractedCurrentNode,
    ExtractedPreviousNode
} from "../types/ExtractedNode";

import {
    flipPieceColour,
    adaptPieceColour
} from "@/constants/PieceColour";

import {
    getCaptureSquare
} from "@/lib/utils/chess";

import {
    getExpectedPointsLoss
} from "../expectedPoints";

import {
    isMoveCriticalCandidate
} from "../utils/criticalMove";

import {
    isPieceSafe
} from "../utils/pieceSafety";

/*
 * ============================================================
 * GREAT DETECTOR V9 - MULTI-GAME
 * ============================================================
 *
 * V8 was too conservative with captures. In the acgoody benchmark,
 * confirmed Great moves such as Nxe5 / Bxf4 / ...fxe6 are captures,
 * while obvious valuable recaptures in the Marta game (for example
 * taking back a queen or bishop immediately) should remain ordinary Best.
 *
 * V9 therefore no longer rejects every capture of loose material.
 * Instead:
 *
 * - ordinary critical moves require a 0.075 EP loss on line 2;
 * - a capture of loose material requires a stronger 0.12 EP gap;
 * - an immediate recapture of a NON-PAWN is treated as an obvious
 *   recapture and is not promoted to Great;
 * - pawn recaptures can still be Great if they are genuinely critical.
 *
 * This is intentionally conservative and does not touch Brilliant.
 */

const GREAT_MIN_SECOND_LINE_EP_LOSS = 0.075;
const GREAT_MIN_FREE_CAPTURE_EP_LOSS = 0.12;

export function considerCriticalClassification(
    previous: ExtractedPreviousNode,
    current: ExtractedCurrentNode
) {
    if (
        !isMoveCriticalCandidate(
            previous,
            current
        )
    ) {
        return false;
    }

    /*
     * It is not useful to call a move Great merely because mate is
     * already available and preserved.
     */
    if (
        current.subjectiveEvaluation.type == "mate"
        && current.subjectiveEvaluation.value > 0
    ) {
        return false;
    }

    let freeCapture = false;

    if (
        current.playedMove.captured
    ) {
        const capturedPieceSafety =
            isPieceSafe(
                previous.board,
                {
                    color:
                        flipPieceColour(
                            current.playedMove.color
                        ),
                    square:
                        getCaptureSquare(
                            current.playedMove
                        ),
                    type:
                        current.playedMove.captured
                }
            );

        freeCapture =
            !capturedPieceSafety;

        /*
         * Obvious valuable recaptures should stay Best rather than Great.
         * We deliberately allow pawn recaptures because the acgoody
         * benchmark contains a confirmed Great pawn recapture (...fxe6).
         */
        const immediateRecapture =
            previous.playedMove?.to
            == current.playedMove.to;

        const capturesNonPawn =
            current.playedMove.captured
            != PAWN;

        if (
            immediateRecapture
            && capturesNonPawn
        ) {
            return false;
        }
    }

    if (
        !previous.secondTopLine?.evaluation
    ) {
        return false;
    }

    const secondTopMovePointLoss =
        getExpectedPointsLoss(
            previous.evaluation,
            previous.secondTopLine.evaluation,
            adaptPieceColour(
                current.playedMove.color
            )
        );

    const requiredGap =
        freeCapture
            ? GREAT_MIN_FREE_CAPTURE_EP_LOSS
            : GREAT_MIN_SECOND_LINE_EP_LOSS;

    return secondTopMovePointLoss
        >= requiredGap;
}
