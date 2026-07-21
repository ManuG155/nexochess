import Evaluation from "@/types/game/position/Evaluation";
import { PieceColour, flipPieceColour } from "@/constants/PieceColour";

interface ExpectedPointsOptions {
    moveColour: PieceColour;

    /*
     * Optional player rating used by contextual Classification V4 rules.
     *
     * IMPORTANT:
     * When this is omitted we preserve WintrChess's historical
     * 0.0035 gradient. That means Accuracy V2 can remain frozen
     * while contextual rules such as Miss can use the rating-aware model.
     */
    playerRating?: number;

    /*
     * Explicit override kept for backwards compatibility and testing.
     */
    centipawnGradient?: number;
}

const DEFAULT_CENTIPAWN_GRADIENT = 0.0035;

function clamp(
    value: number,
    min: number,
    max: number
) {
    return Math.min(max, Math.max(min, value));
}

/**
 * Empirical rating-aware centipawn -> Expected Points gradient for contextual rules.
 *
 * Chess.com publicly states that its Expected Points model depends on
 * both engine evaluation and player rating, but it does not publish the
 * exact internal formula. This is therefore our own approximation.
 *
 * Lower-rated players receive a flatter curve because a static engine
 * advantage is less reliably converted. Stronger players receive a
 * steeper curve because the same advantage is more predictive.
 *
 * If rating is undefined we intentionally return the old WintrChess
 * gradient so existing Accuracy V2 calculations do not change.
 */
export function getRatingAdjustedCentipawnGradient(
    rating?: number
) {
    if (
        rating == undefined
        || !Number.isFinite(rating)
    ) {
        return DEFAULT_CENTIPAWN_GRADIENT;
    }

    const safeRating = clamp(
        rating,
        100,
        3000
    );

    const strengthFactor = 1 / (
        1
        + Math.exp(
            -(safeRating - 1400) / 500
        )
    );

    /*
     * Approximate range:
     *
     * ~0.0028 around beginner ratings
     * ~0.0036 around 1400
     * ~0.0041 around 2000
     * ~0.0044 near elite ratings
     */
    return 0.0027 + (0.0018 * strengthFactor);
}

export function getExpectedPoints(
    evaluation: Evaluation,
    options?: ExpectedPointsOptions
) {
    const moveColour =
        options?.moveColour
        ?? PieceColour.WHITE;

    const centipawnGradient =
        options?.centipawnGradient
        ?? getRatingAdjustedCentipawnGradient(
            options?.playerRating
        );

    if (
        evaluation.type
        == "mate"
    ) {
        /*
         * Preserve the previous WintrChess handling of M0.
         */
        if (
            evaluation.value
            == 0
        ) {
            return Number(
                moveColour
                == PieceColour.WHITE
            );
        }

        return Number(
            evaluation.value > 0
        );
    }

    return 1 / (
        1
        + Math.exp(
            -centipawnGradient
            * evaluation.value
        )
    );
}

/**
 * Expected Points lost by the player who made the move.
 *
 * This deliberately preserves WintrChess's historical orientation logic.
 * The optional playerRating is used only when a caller explicitly requests the contextual rating-aware EP curve.
 * When playerRating is omitted, behaviour remains identical to the previous
 * model, which keeps Accuracy V2 frozen.
 */
export function getExpectedPointsLoss(
    previousEvaluation: Evaluation,
    currentEvaluation: Evaluation,
    moveColour: PieceColour,
    playerRating?: number
) {
    return Math.max(
        0,
        (
            getExpectedPoints(
                previousEvaluation,
                {
                    moveColour:
                        flipPieceColour(
                            moveColour
                        ),
                    playerRating
                }
            )
            - getExpectedPoints(
                currentEvaluation,
                {
                    moveColour,
                    playerRating
                }
            )
        )
        * (
            moveColour
                == PieceColour.WHITE
                ? 1
                : -1
        )
    );
}
