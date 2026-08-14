import { Classification } from "shared/constants/Classification";
import {
    classificationColours,
    classificationImages
} from "@analysis/constants/classifications";

import type { LessonOutcome } from "./lessonModel";

export interface LessonFeedbackVisual {
    colour: string;
    icon?: string;
    tone: "positive" | "negative" | "neutral";
}

export function getLessonFeedbackVisual(
    outcome: LessonOutcome
): LessonFeedbackVisual {
    if (outcome == "success" || outcome == "acceptedAlternative") {
        return {
            colour: classificationColours[Classification.OKAY],
            icon: classificationImages[Classification.OKAY],
            tone: "positive"
        };
    }

    if (outcome == "conceptualError") {
        return {
            colour: classificationColours[Classification.MISS],
            icon: classificationImages[Classification.MISS],
            tone: "negative"
        };
    }

    return {
        colour: "#8ea0b7",
        tone: "neutral"
    };
}
