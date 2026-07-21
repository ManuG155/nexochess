import {
    WHITE
} from "chess.js";

import {
    ExtractedCurrentNode,
    ExtractedPreviousNode
} from "../types/ExtractedNode";

import {
    Classification
} from "@/constants/Classification";

import {
    adaptPieceColour
} from "@/constants/PieceColour";

import {
    getClassificationExpectedPointsLoss
} from "./classificationExpectedPoints";

/*
 * ============================================================
 * CLASSIFICATION V5 - STANDARD MOVES
 * ============================================================
 *
 * Best is still reserved for the exact engine top move and is handled
 * by classify.ts.
 *
 * Standard non-top moves use a dedicated Classification Expected Points
 * calibration. This is deliberately separate from Accuracy V2 and Miss V4.
 *
 * The final category thresholds remain:
 *
 * EXCELLENT
 * classification EP loss <= 0.02
 *
 * GOOD
 * 0.02 < classification EP loss <= 0.05
 *
 * INACCURACY
 * 0.05 < classification EP loss <= 0.10
 *
 * MISTAKE
 * 0.10 < classification EP loss <= 0.20
 *
 * BLUNDER
 * classification EP loss > 0.20
 */

export function pointLossClassify(
    previous: ExtractedPreviousNode,
    current: ExtractedCurrentNode,
    playerRating?: number
) {
    const previousSubjectiveValue =
        previous.evaluation.value
        * (
            current.playedMove.color == WHITE
                ? 1
                : -1
        );

    const subjectiveValue =
        current.subjectiveEvaluation.value;

    /*
     * ========================================================
     * MATE -> MATE
     * ========================================================
     *
     * Keep the specialised WintrChess mate handling. A pure 0/1 Expected
     * Points representation cannot preserve mate-distance information.
     */
    if (
        previous.evaluation.type == "mate"
        && current.evaluation.type == "mate"
    ) {
        if (
            previousSubjectiveValue > 0
            && subjectiveValue < 0
        ) {
            return subjectiveValue < -3
                ? Classification.MISTAKE
                : Classification.BLUNDER;
        }

        const mateLoss = (
            current.evaluation.value
            - previous.evaluation.value
        ) * (
            current.playedMove.color == WHITE
                ? 1
                : -1
        );

        if (
            mateLoss < 0
            || (
                mateLoss == 0
                && subjectiveValue < 0
            )
        ) {
            return Classification.BEST;
        }

        if (
            mateLoss < 2
        ) {
            return Classification.EXCELLENT;
        }

        if (
            mateLoss < 7
        ) {
            return Classification.OKAY;
        }

        return Classification.INACCURACY;
    }

    /*
     * ========================================================
     * MATE -> CENTIPAWN
     * ========================================================
     */
    if (
        previous.evaluation.type == "mate"
        && current.evaluation.type == "centipawn"
    ) {
        if (
            subjectiveValue >= 800
        ) {
            return Classification.EXCELLENT;
        }

        if (
            subjectiveValue >= 400
        ) {
            return Classification.OKAY;
        }

        if (
            subjectiveValue >= 200
        ) {
            return Classification.INACCURACY;
        }

        if (
            subjectiveValue >= 0
        ) {
            return Classification.MISTAKE;
        }

        return Classification.BLUNDER;
    }

    /*
     * ========================================================
     * CENTIPAWN -> MATE
     * ========================================================
     */
    if (
        previous.evaluation.type == "centipawn"
        && current.evaluation.type == "mate"
    ) {
        if (
            subjectiveValue > 0
        ) {
            return Classification.BEST;
        }

        if (
            subjectiveValue >= -2
        ) {
            return Classification.BLUNDER;
        }

        if (
            subjectiveValue >= -5
        ) {
            return Classification.MISTAKE;
        }

        return Classification.INACCURACY;
    }

    /*
     * ========================================================
     * CENTIPAWN -> CENTIPAWN
     * ========================================================
     *
     * Classification V5 uses its own calibrated EP-loss scale.
     * Accuracy V2 is not involved here and remains unchanged.
     */
    const pointLoss =
        getClassificationExpectedPointsLoss(
            previous.evaluation,
            current.evaluation,
            adaptPieceColour(
                current.playedMove.color
            ),
            playerRating
        );

    if (
        pointLoss <= 0.02
    ) {
        return Classification.EXCELLENT;
    }

    if (
        pointLoss <= 0.05
    ) {
        return Classification.OKAY;
    }

    if (
        pointLoss <= 0.10
    ) {
        return Classification.INACCURACY;
    }

    if (
        pointLoss <= 0.20
    ) {
        return Classification.MISTAKE;
    }

    return Classification.BLUNDER;
}
