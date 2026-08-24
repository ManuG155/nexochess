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
    extractPreviousStateTreeNode,
    extractCurrentStateTreeNode
} from "./utils/extractNode";

import {
    getOpeningName
} from "./utils/opening";

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
 * CLASSIFICATION V11 - ENGINE COHERENT
 * ============================================================
 *
 * The move shown as Stockfish PV1 is the engine recommendation for the
 * position. Review must never display that same move as an inaccuracy,
 * mistake or miss merely because the next independently analysed position
 * converged to a slightly different evaluation.
 *
 * Standard non-PV1 moves still use Expected Points loss. Miss, Great and
 * Brilliant remain contextual overrides, but PV1 always starts from Best.
 * Accuracy and Game Rating formulas are not changed here.
 */

const MAX_THEORY_PLY = 16;
const THEORY_GAP_GRACE_PLIES = 3;
const THEORY_GRACE_CUTOFF_PLY = 6;
const THEORY_RECAPTURE_CUTOFF_PLY = 8;
const THEORY_RECAPTURE_MAX_GAP_PLIES = 2;

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

            if (
                ply <= THEORY_GRACE_CUTOFF_PLY
                && gap <= THEORY_GAP_GRACE_PLIES
            ) {
                return true;
            }

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
     *
     * Compare UCI/LAN first. SAN is retained only as a compatibility
     * fallback. If the played move is PV1, it is the engine's Best move.
     */
    const topMovePlayed =
        previous.topMove.lan
            == current.playedMove.lan
        || previous.topMove.san
            == current.playedMove.san;

    let classification =
        topMovePlayed
            ? Classification.BEST
            : pointLossClassify(
                previous,
                current,
                playerRating
            );

    /*
     * 5. MISS
     *
     * A Best or Excellent move cannot be stolen by the contextual Miss
     * detector. In particular, PV1 can no longer be both the recommended
     * arrow and an inaccuracy/miss in the move list.
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
