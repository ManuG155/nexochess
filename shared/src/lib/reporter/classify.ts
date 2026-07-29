import {
    WHITE
} from "chess.js";

import ReportOptions from
    "./types/AnalysisOptions";

import {
    StateTreeNode
} from "@/types/game/position/StateTreeNode";

import {
    Classification
} from "@/constants/Classification";

import {
    adaptPieceColour
} from "@/constants/PieceColour";

import {
    extractPreviousStateTreeNode,
    extractCurrentStateTreeNode
} from "./utils/extractNode";

import {
    getOpeningName
} from "./utils/opening";

import {
    getExpectedPointsLoss
} from "./expectedPoints";

import {
    pointLossClassify
} from "./classification/pointLoss";

import {
    considerMissClassification
} from "./classification/miss";

import {
    considerBrilliantClassification
} from "./classification/brilliant";

import {
    considerCriticalClassification
} from "./classification/critical";

/*
 * ============================================================
 * CLASSIFICATION V10 - RATING-AWARE STABLE
 * ============================================================
 *
 * V10 keeps the multi-game structural rules from V9 and adds a conservative
 * elite-rating correction only to standard classifications and Best.
 *
 * It keeps the V8 standard EP calibration intact and changes only four
 * structural points that failed to generalise:
 *
 * 1. BOOK
 *    Early theoretical recaptures can extend book by one extra ply.
 *
 * 2. BEST
 *    A nominal engine top move is only Best when the post-move evaluation
 *    also confirms that it did not lose meaningful Expected Points.
 *    This reduces unstable low-depth false Best classifications.
 *
 * 3. MISS
 *    Miss is now conservative around Best/Excellent moves and the V9
 *    detector adds baseline/gap checks to reduce ordinary mistakes being
 *    stolen by Miss.
 *
 * 4. GREAT
 *    The detector is still an override from Best/Excellent, but critical.ts
 *    now permits genuinely critical captures while rejecting obvious
 *    valuable recaptures.
 *
 * Accuracy V2 and Game Rating V5 are not modified.
 */

const MAX_THEORY_PLY = 16;
const THEORY_GAP_GRACE_PLIES = 3;
const THEORY_GRACE_CUTOFF_PLY = 6;
const THEORY_RECAPTURE_CUTOFF_PLY = 8;
const THEORY_RECAPTURE_MAX_GAP_PLIES = 2;

/*
 * Top-line instability guard.
 * A move can briefly appear as PV1 at one search depth yet evaluate worse
 * once the resulting position is analysed. V9 only grants Best when that
 * verification loss is tiny.
 */
const BEST_BASE_MAX_VERIFICATION_EP_LOSS = 0.008;
const BEST_ELITE_MAX_VERIFICATION_EP_LOSS = 0.014;
const BEST_ELITE_TOLERANCE_START_RATING = 2200;
const BEST_ELITE_TOLERANCE_FULL_RATING = 3000;

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

function getBestVerificationTolerance(
    playerRating?: number
) {
    if (
        playerRating == undefined
        || !Number.isFinite(
            playerRating
        )
    ) {
        return BEST_BASE_MAX_VERIFICATION_EP_LOSS;
    }

    const eliteFactor =
        clamp(
            (
                playerRating
                - BEST_ELITE_TOLERANCE_START_RATING
            )
            /
            (
                BEST_ELITE_TOLERANCE_FULL_RATING
                - BEST_ELITE_TOLERANCE_START_RATING
            ),
            0,
            1
        );

    return BEST_BASE_MAX_VERIFICATION_EP_LOSS
        + eliteFactor
        * (
            BEST_ELITE_MAX_VERIFICATION_EP_LOSS
            - BEST_BASE_MAX_VERIFICATION_EP_LOSS
        );
}

function getNodePly(
    node: StateTreeNode
) {
    let ply = 0;

    let current:
        StateTreeNode
        | undefined = node;

    while (
        current.parent
    ) {
        ply++;
        current = current.parent;
    }

    return ply;
}

function isImmediateRecapture(
    node: StateTreeNode
) {
    const currentUci =
        node.state.move?.uci;

    const previousUci =
        node.parent?.state.move?.uci;

    if (
        !currentUci
        || !previousUci
        || currentUci.length < 4
        || previousUci.length < 4
    ) {
        return false;
    }

    const currentDestination =
        currentUci.slice(
            2,
            4
        );

    const previousDestination =
        previousUci.slice(
            2,
            4
        );

    return currentDestination
        == previousDestination;
}

function isStillInOpeningTheory(
    node: StateTreeNode
) {
    const ply =
        getNodePly(
            node
        );

    if (
        ply > MAX_THEORY_PLY
    ) {
        return false;
    }

    if (
        getOpeningName(
            node.state.fen
        )
    ) {
        return true;
    }

    const immediateRecapture =
        isImmediateRecapture(
            node
        );

    let ancestor =
        node.parent;

    let ancestorPly =
        ply - 1;

    while (
        ancestor
        && ancestorPly > 0
    ) {
        if (
            getOpeningName(
                ancestor.state.fen
            )
        ) {
            const gap =
                ply - ancestorPly;

            /*
             * Original early grace used by V8.
             */
            if (
                ply <= THEORY_GRACE_CUTOFF_PLY
                && gap <= THEORY_GAP_GRACE_PLIES
            ) {
                return true;
            }

            /*
             * Multi-game V9 addition:
             * allow an early immediate recapture to remain theoretical.
             * This captures opening lines such as the Smith-Morra-style
             * Nxc3 recapture without turning an unrelated Bb5+ into Book.
             */
            if (
                ply <= THEORY_RECAPTURE_CUTOFF_PLY
                && immediateRecapture
                && gap <= THEORY_RECAPTURE_MAX_GAP_PLIES
            ) {
                return true;
            }

            return false;
        }

        ancestor =
            ancestor.parent;

        ancestorPly--;
    }

    return false;
}

export function classify(
    node: StateTreeNode,
    options?: ReportOptions
) {
    if (
        !node.parent
    ) {
        throw new Error(
            "no parent node exists to compare with."
        );
    }

    const previous =
        extractPreviousStateTreeNode(
            node.parent
        );

    const current =
        extractCurrentStateTreeNode(
            node
        );

    if (
        !previous
        || !current
    ) {
        throw new Error(
            "information missing from current or previous node."
        );
    }

    const opts = {
        includeBrilliant:
            options?.includeBrilliant
            ?? true,

        includeCritical:
            options?.includeCritical
            ?? true,

        includeTheory:
            options?.includeTheory
            ?? true,

        whiteRating:
            options?.whiteRating,

        blackRating:
            options?.blackRating
    };

    const playerRating =
        current.playedMove.color
        == WHITE
            ? opts.whiteRating
            : opts.blackRating;

    /*
     * 1. FORCED
     */
    if (
        previous.board.moves().length
        <= 1
    ) {
        return Classification.FORCED;
    }

    /*
     * 2. BOOK / THEORY
     */
    if (
        opts.includeTheory
        && isStillInOpeningTheory(
            node
        )
    ) {
        return Classification.THEORY;
    }

    /*
     * 3. CHECKMATE
     */
    if (
        current.board.isCheckmate()
    ) {
        return Classification.BEST;
    }

    /*
     * 4. STANDARD CLASSIFICATION
     */
    const topMovePlayed =
        previous.topMove.san
        == current.playedMove.san;

    const topMoveVerificationLoss =
        getExpectedPointsLoss(
            previous.evaluation,
            current.evaluation,
            adaptPieceColour(
                current.playedMove.color
            )
        );

    const stableTopMove =
        topMovePlayed
        && topMoveVerificationLoss
            <= getBestVerificationTolerance(
                playerRating
            );

    let classification =
        stableTopMove
            ? Classification.BEST
            : pointLossClassify(
                previous,
                current,
                playerRating
            );

    /*
     * 5. MISS
     *
     * A move already evaluated as Best or Excellent should not be stolen
     * by a contextual Miss rule. This specifically reduces the kind of
     * false Miss inflation observed in the acgoody benchmark.
     */
    const missEligible =
        classification
            != Classification.BEST
        && classification
            != Classification.EXCELLENT;

    if (
        missEligible
        && considerMissClassification(
            node,
            playerRating
        )
    ) {
        classification =
            Classification.MISS;
    }

    /*
     * 6. GREAT
     */
    if (
        classification
            != Classification.MISS
        && opts.includeCritical
        && (
            classification
                == Classification.BEST
            || classification
                == Classification.EXCELLENT
        )
        && considerCriticalClassification(
            previous,
            current
        )
    ) {
        classification =
            Classification.CRITICAL;
    }

    /*
     * 7. BRILLIANT
     */
    const brilliantEligible =
        classification
            == Classification.BEST
        || classification
            == Classification.EXCELLENT
        || classification
            == Classification.CRITICAL;

    if (
        classification
            != Classification.MISS
        && opts.includeBrilliant
        && brilliantEligible
        && considerBrilliantClassification(
            previous,
            current
        )
    ) {
        classification =
            Classification.BRILLIANT;
    }

    return classification;
}
