import { Classification } from "shared/constants/Classification";
import { getTopEngineLine } from "shared/types/game/position/EngineLine";
import type { StateTreeNode } from
    "shared/types/game/position/StateTreeNode";

import { formatCoachDetail } from "./coachCommentLocale";

const NEGATIVE_CLASSIFICATIONS = new Set<Classification>([
    Classification.INACCURACY,
    Classification.MISTAKE,
    Classification.BLUNDER,
    Classification.RISKY
]);

/**
 * The detailed-comment fallback used to say things such as
 * "Nf3 avoided this tactic" even when no short, human-readable tactic had
 * actually been identified. That is more confusing than useful.
 *
 * Concrete tactical explanations are handled by coachTacticInsight and its
 * clickable button. If that detector did not find one, remove only the
 * unsupported generic "this tactic" sentence and keep the rest of the
 * explanation intact.
 */
export function removeUnsupportedTacticClaim(
    text: string,
    node: StateTreeNode,
    classification: Classification | undefined,
    language?: string
) {
    if (
        !classification
        || !NEGATIVE_CLASSIFICATIONS.has(classification)
        || !node.parent
    ) {
        return text;
    }

    const bestSan = getTopEngineLine(
        node.parent.state.engineLines
    )?.moves.at(0)?.san;

    if (!bestSan) return text;

    const unsupportedSentence = formatCoachDetail(
        language,
        "bestAvoidsTactic",
        { best: bestSan }
    );

    if (!text.includes(unsupportedSentence)) {
        return text;
    }

    return text
        .replace(unsupportedSentence, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}
