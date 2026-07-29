import {
    StateTreeNode
} from "@/types/game/position/StateTreeNode";

import Evaluation from
    "@/types/game/position/Evaluation";

import PieceColour from
    "@/constants/PieceColour";

import {
    getLineGroupSibling,
    getTopEngineLine
} from "@/types/game/position/EngineLine";

import {
    getExpectedPoints
} from "../expectedPoints";

/*
 * ============================================================
 * MISS DETECTOR V9 - MULTI-GAME CONSERVATIVE
 * ============================================================
 *
 * V4/V8 achieved excellent recall in the Marta benchmark but produced
 * too many Misses in the acgoody benchmark. V9 keeps the same A -> B -> C
 * model while making the broad routes more contextual.
 *
 * A = position before the opponent move.
 * B = opportunity created by the opponent move.
 * C = position after the player's response.
 *
 * Three generic Miss routes remain:
 *
 * 1. SWING MISS
 *    A visible opportunity appears and is immediately given back.
 *    The best line must also be meaningfully better than line 2.
 *
 * 2. PUNISHMENT MISS
 *    The opponent makes a large mistake and the player fails to punish it.
 *
 * 3. CRITICAL MISS
 *    A smaller tactical opportunity is missed, C returns close to the
 *    pre-opportunity baseline, and line 1 is clearly superior to line 2.
 *
 * The important V9 change is baseline protection: an ordinary self-created
 * mistake should not become Miss merely because an opportunity existed one
 * move earlier. A large tactical collapse can still be Miss when the lost
 * opportunity itself is enormous (for example the confirmed Qxg5 case).
 */

export type MissDiagnosticReason =
    | "missing-context"
    | "not-opponent-move"
    | "missing-engine-lines"
    | "played-top-move"
    | "opportunity-gain-too-low"
    | "opportunity-loss-too-low"
    | "opportunity-not-critical"
    | "catastrophic-self-blunder"
    | "miss";

export interface MissDiagnostic {
    isMiss: boolean;
    reason: MissDiagnosticReason;
    epA: number | null;
    epB: number | null;
    epC: number | null;
    opportunityGain: number | null;
    opportunityLost: number | null;
    selfInflictedLoss: number | null;
    winningThreshold: number | null;
    candidateScore: number | null;
    bestAlternativeGap: number | null;
}

/*
 * Route 1: broad swing.
 * Slightly more permissive on raw swing than V8, but now requires a real
 * line-1/line-2 distinction and sensible baseline behaviour.
 */
const MISS_SWING_MIN_GAIN = 0.075;
const MISS_SWING_MIN_LOSS = 0.075;
const MISS_SWING_MIN_GAP = 0.02;
const MISS_SWING_MAX_BASELINE_DRIFT = 0.06;
const MISS_SWING_HUGE_LOSS_ESCAPE = 0.20;

/*
 * Route 2: large opponent error that was not punished.
 */
const MISS_PUNISH_MIN_GAIN = 0.16;
const MISS_PUNISH_MIN_LOSS = 0.05;
const MISS_PUNISH_MIN_GAP = 0.02;
const MISS_PUNISH_MAX_SELF_LOSS = 0.10;
const MISS_PUNISH_HUGE_LOSS_ESCAPE = 0.20;

/*
 * Route 3: smaller but clearly tactical/critical opportunity.
 * These values deliberately cover the confirmed dxe5/a6-type pattern,
 * whose raw A -> B and B -> C swings can be modest.
 */
const MISS_CRITICAL_MIN_GAIN = 0.035;
const MISS_CRITICAL_MIN_LOSS = 0.040;
const MISS_CRITICAL_MIN_GAP = 0.030;
const MISS_CRITICAL_MIN_EP_B = 0.52;
const MISS_CRITICAL_MAX_BASELINE_DRIFT = 0.040;

const MISS_CATASTROPHIC_FINAL_EP = 0.10;
const MISS_SEVERE_SELF_LOSS = 0.30;

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

export function getWinningExpectedPointsThreshold(
    rating?: number
) {
    const safeRating = clamp(
        rating ?? 1200,
        100,
        3000
    );

    const strengthFactor = 1 / (
        1
        + Math.exp(
            -(safeRating - 1400) / 500
        )
    );

    return 0.74 - (0.03 * strengthFactor);
}

function getExpectedPointsForColour(
    evaluation: Evaluation,
    colour: PieceColour,
    playerRating?: number
) {
    const whiteExpectedPoints =
        getExpectedPoints(
            evaluation,
            {
                moveColour: colour,
                playerRating
            }
        );

    if (
        colour == PieceColour.WHITE
    ) {
        return whiteExpectedPoints;
    }

    return 1 - whiteExpectedPoints;
}

function emptyDiagnostic(
    reason: MissDiagnosticReason
): MissDiagnostic {
    return {
        isMiss: false,
        reason,
        epA: null,
        epB: null,
        epC: null,
        opportunityGain: null,
        opportunityLost: null,
        selfInflictedLoss: null,
        winningThreshold: null,
        candidateScore: null,
        bestAlternativeGap: null
    };
}

export function getMissDiagnostic(
    node: StateTreeNode,
    playerRating?: number
): MissDiagnostic {
    const afterResponse =
        node;

    const afterOpponentMove =
        node.parent;

    const beforeOpponentMove =
        afterOpponentMove?.parent;

    const playerColour =
        node.state.moveColour;

    if (
        !playerColour
        || !afterOpponentMove
        || !beforeOpponentMove
    ) {
        return emptyDiagnostic(
            "missing-context"
        );
    }

    if (
        !afterOpponentMove.state.move
        || afterOpponentMove.state.moveColour
            == playerColour
    ) {
        return emptyDiagnostic(
            "not-opponent-move"
        );
    }

    const beforeLine =
        getTopEngineLine(
            beforeOpponentMove
                .state
                .engineLines
        );

    const opportunityLine =
        getTopEngineLine(
            afterOpponentMove
                .state
                .engineLines
        );

    const responseLine =
        getTopEngineLine(
            afterResponse
                .state
                .engineLines
        );

    if (
        !beforeLine
        || !opportunityLine
        || !responseLine
    ) {
        return emptyDiagnostic(
            "missing-engine-lines"
        );
    }

    const secondOpportunityLine =
        getLineGroupSibling(
            afterOpponentMove
                .state
                .engineLines,
            opportunityLine,
            2
        );

    const epA =
        getExpectedPointsForColour(
            beforeLine.evaluation,
            playerColour,
            playerRating
        );

    const epB =
        getExpectedPointsForColour(
            opportunityLine.evaluation,
            playerColour,
            playerRating
        );

    const epC =
        getExpectedPointsForColour(
            responseLine.evaluation,
            playerColour,
            playerRating
        );

    const epSecond =
        secondOpportunityLine
            ? getExpectedPointsForColour(
                secondOpportunityLine.evaluation,
                playerColour,
                playerRating
            )
            : null;

    const bestAlternativeGap =
        epSecond == null
            ? 0
            : Math.max(
                0,
                epB - epSecond
            );

    const opportunityGain =
        epB - epA;

    const opportunityLost =
        epB - epC;

    const selfInflictedLoss =
        epA - epC;

    const baselineDrift =
        Math.abs(
            epC - epA
        );

    const winningThreshold =
        getWinningExpectedPointsThreshold(
            playerRating
        );

    const topMoveSan =
        opportunityLine.moves.at(0)?.san;

    const playedMoveSan =
        node.state.move?.san;

    const playedTopMove =
        Boolean(
            topMoveSan
            && playedMoveSan
            && topMoveSan == playedMoveSan
        );

    const swingBaselineOkay =
        baselineDrift
            <= MISS_SWING_MAX_BASELINE_DRIFT
        || opportunityLost
            >= MISS_SWING_HUGE_LOSS_ESCAPE;

    const swingMiss =
        opportunityGain >= MISS_SWING_MIN_GAIN
        && opportunityLost >= MISS_SWING_MIN_LOSS
        && bestAlternativeGap >= MISS_SWING_MIN_GAP
        && swingBaselineOkay;

    const punishmentBaselineOkay =
        selfInflictedLoss
            <= MISS_PUNISH_MAX_SELF_LOSS
        || opportunityLost
            >= MISS_PUNISH_HUGE_LOSS_ESCAPE;

    const punishmentMiss =
        opportunityGain >= MISS_PUNISH_MIN_GAIN
        && opportunityLost >= MISS_PUNISH_MIN_LOSS
        && bestAlternativeGap >= MISS_PUNISH_MIN_GAP
        && punishmentBaselineOkay;

    const criticalMiss =
        opportunityGain >= MISS_CRITICAL_MIN_GAIN
        && opportunityLost >= MISS_CRITICAL_MIN_LOSS
        && bestAlternativeGap >= MISS_CRITICAL_MIN_GAP
        && epB >= MISS_CRITICAL_MIN_EP_B
        && baselineDrift <= MISS_CRITICAL_MAX_BASELINE_DRIFT;

    const candidateScore =
        Math.max(
            Math.min(
                opportunityGain / MISS_SWING_MIN_GAIN,
                opportunityLost / MISS_SWING_MIN_LOSS,
                bestAlternativeGap / MISS_SWING_MIN_GAP
            ),
            Math.min(
                opportunityGain / MISS_PUNISH_MIN_GAIN,
                opportunityLost / MISS_PUNISH_MIN_LOSS,
                bestAlternativeGap / MISS_PUNISH_MIN_GAP
            ),
            Math.min(
                opportunityGain / MISS_CRITICAL_MIN_GAIN,
                opportunityLost / MISS_CRITICAL_MIN_LOSS,
                bestAlternativeGap / MISS_CRITICAL_MIN_GAP,
                epB / MISS_CRITICAL_MIN_EP_B,
                MISS_CRITICAL_MAX_BASELINE_DRIFT
                    / Math.max(
                        baselineDrift,
                        0.001
                    )
            )
        );

    const base = {
        epA,
        epB,
        epC,
        opportunityGain,
        opportunityLost,
        selfInflictedLoss,
        winningThreshold,
        candidateScore,
        bestAlternativeGap
    };

    if (
        playedTopMove
    ) {
        return {
            ...base,
            isMiss: false,
            reason: "played-top-move"
        };
    }

    const catastrophicFinalPosition =
        epC <= MISS_CATASTROPHIC_FINAL_EP;

    const severeSelfInflictedLoss =
        selfInflictedLoss >= MISS_SEVERE_SELF_LOSS;

    if (
        catastrophicFinalPosition
        && severeSelfInflictedLoss
    ) {
        return {
            ...base,
            isMiss: false,
            reason:
                "catastrophic-self-blunder"
        };
    }

    if (
        swingMiss
        || punishmentMiss
        || criticalMiss
    ) {
        return {
            ...base,
            isMiss: true,
            reason: "miss"
        };
    }

    if (
        opportunityGain
        < MISS_CRITICAL_MIN_GAIN
    ) {
        return {
            ...base,
            isMiss: false,
            reason:
                "opportunity-gain-too-low"
        };
    }

    if (
        opportunityLost
        < MISS_CRITICAL_MIN_LOSS
    ) {
        return {
            ...base,
            isMiss: false,
            reason:
                "opportunity-loss-too-low"
        };
    }

    return {
        ...base,
        isMiss: false,
        reason:
            "opportunity-not-critical"
    };
}

export function considerMissClassification(
    node: StateTreeNode,
    playerRating?: number
) {
    return getMissDiagnostic(
        node,
        playerRating
    ).isMiss;
}
