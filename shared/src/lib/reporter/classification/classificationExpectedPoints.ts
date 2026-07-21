import {
    PieceColour
} from "@/constants/PieceColour";

import Evaluation from
    "@/types/game/position/Evaluation";

import {
    getExpectedPointsLoss
} from "../expectedPoints";

/*
 * ============================================================
 * CLASSIFICATION EXPECTED POINTS V10
 * ============================================================
 *
 * Accuracy V2 remains completely isolated from this file.
 * This model is used ONLY by the standard move classifier:
 *
 *   Excellent / Good / Inaccuracy / Mistake / Blunder
 *
 * V10 keeps the proven V5/V9 calibration unchanged for ordinary
 * club-level ratings. For elite ratings it progressively incorporates
 * the rating-aware Expected Points curve that already exists in
 * expectedPoints.ts.
 *
 * Why?
 *
 * Across the low/mid-rating anchor games, the stable historical curve
 * has behaved better than a fully rating-aware replacement.
 *
 * In elite games, however, V9 systematically accumulated too many
 * non-top moves in Excellent. A stronger player converts static engine
 * advantages more reliably, so a small engine deterioration should
 * represent a somewhat larger practical Expected Points loss.
 *
 * The transition is deliberately gradual and only starts above 2200.
 * Therefore Marta/acgoody-style games keep the exact V9 standard model,
 * while 3000+ games receive a modest elite correction.
 */

interface CalibrationAnchor {
    raw: number;
    calibrated: number;
}

const CALIBRATION_ANCHORS:
    CalibrationAnchor[] = [

    {
        raw: 0,
        calibrated: 0
    },

    {
        raw: 0.012,
        calibrated: 0.020
    },

    {
        raw: 0.035,
        calibrated: 0.050
    },

    {
        raw: 0.075,
        calibrated: 0.100
    },

    {
        raw: 0.200,
        calibrated: 0.200
    },

    {
        raw: 1,
        calibrated: 1
    }
];

const ELITE_BLEND_START_RATING = 2200;
const ELITE_BLEND_FULL_RATING = 3000;
const ELITE_MAX_RATING_AWARE_BLEND = 0.65;
const ELITE_MAX_SEVERITY_MULTIPLIER = 1.18;

function clamp(
    value: number,
    min: number,
    max: number
) {
    return Math.min(
        max,
        Math.max(
            min,
            value
        )
    );
}

function interpolate(
    value: number,
    left: CalibrationAnchor,
    right: CalibrationAnchor
) {
    if (
        right.raw == left.raw
    ) {
        return right.calibrated;
    }

    const progress =
        (
            value
            - left.raw
        )
        /
        (
            right.raw
            - left.raw
        );

    return left.calibrated
        + progress
        * (
            right.calibrated
            - left.calibrated
        );
}

function getEliteFactor(
    playerRating?: number
) {
    if (
        playerRating == undefined
        || !Number.isFinite(
            playerRating
        )
    ) {
        return 0;
    }

    return clamp(
        (
            playerRating
            - ELITE_BLEND_START_RATING
        )
        /
        (
            ELITE_BLEND_FULL_RATING
            - ELITE_BLEND_START_RATING
        ),
        0,
        1
    );
}

/**
 * Convert a raw Expected Points loss to the dedicated standard
 * classification scale used since V5.
 */
export function calibrateClassificationExpectedPointsLoss(
    rawLoss: number
) {
    const safeLoss =
        clamp(
            rawLoss,
            0,
            1
        );

    for (
        let index = 1;
        index < CALIBRATION_ANCHORS.length;
        index++
    ) {
        const left =
            CALIBRATION_ANCHORS[
                index - 1
            ];

        const right =
            CALIBRATION_ANCHORS[
                index
            ];

        if (
            safeLoss
            <= right.raw
        ) {
            return interpolate(
                safeLoss,
                left,
                right
            );
        }
    }

    return safeLoss;
}

/**
 * Expected Points loss used exclusively for standard move
 * classifications.
 *
 * Club / ordinary ratings:
 *   identical to V9.
 *
 * Elite ratings:
 *   blend the historical loss with the rating-aware loss, then apply a
 *   small severity correction. This is intentionally much milder than
 *   the old V3 experiment, which replaced the stable model outright.
 */
export function getClassificationExpectedPointsLoss(
    previousEvaluation: Evaluation,
    currentEvaluation: Evaluation,
    moveColour: PieceColour,
    playerRating?: number
) {
    const historicalRawLoss =
        getExpectedPointsLoss(
            previousEvaluation,
            currentEvaluation,
            moveColour
        );

    const eliteFactor =
        getEliteFactor(
            playerRating
        );

    if (
        eliteFactor <= 0
    ) {
        return calibrateClassificationExpectedPointsLoss(
            historicalRawLoss
        );
    }

    const ratingAwareRawLoss =
        getExpectedPointsLoss(
            previousEvaluation,
            currentEvaluation,
            moveColour,
            playerRating
        );

    const blendWeight =
        eliteFactor
        * ELITE_MAX_RATING_AWARE_BLEND;

    const blendedRawLoss =
        historicalRawLoss
        * (
            1 - blendWeight
        )
        + ratingAwareRawLoss
        * blendWeight;

    const calibratedLoss =
        calibrateClassificationExpectedPointsLoss(
            blendedRawLoss
        );

    const severityMultiplier =
        1
        + eliteFactor
        * (
            ELITE_MAX_SEVERITY_MULTIPLIER
            - 1
        );

    return clamp(
        calibratedLoss
        * severityMultiplier,
        0,
        1
    );
}
