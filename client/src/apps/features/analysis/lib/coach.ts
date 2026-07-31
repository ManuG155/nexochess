import type { TFunction } from "i18next";

import { Classification } from "shared/constants/Classification";

export const coachIds = [
    "fog",
    "foxy",
    "cybe",
    "max_rooks"
] as const;

export type CoachId = (typeof coachIds)[number];
export type CoachSummaryState = "idle" | "analysing" | "ready";

export type CoachExpression =
    | "idle"
    | "blink"
    | "thinking"
    | "explaining"
    | "celebrating"
    | "worried"
    | "sad"
    | "approving"
    | "openArms"
    | "surprised"
    | "happy"
    | "error"
    | "speaking";

export type CoachExpressionMap = {
    idle: string;
    blink: string;
} & Partial<Record<Exclude<CoachExpression, "idle" | "blink">, string>>;

export interface CoachOption {
    id: CoachId;
    name: string;
    imagePath: string;
    expressions: CoachExpressionMap;
    pickerLines: string[];
    idleLines: string[];
    analysingLines: string[];
    readyLines: string[];
    reactions: Partial<Record<Classification, string[]>>;
}

export const coachOptions: CoachOption[] = [
    {
        id: "fog",
        name: "Pixie",
        imagePath: "/images/bots/fog/idle.png",
        expressions: {
            idle: "/images/bots/fog/idle.png",
            blink: "/images/bots/fog/blink-overlay-v2.png",
            thinking: "/images/bots/fog/thinking.png",
            explaining: "/images/bots/fog/explaining.png",
            celebrating: "/images/bots/fog/celebrating.png",
            worried: "/images/bots/fog/worried.png",
            sad: "/images/bots/fog/sad.png",
            approving: "/images/bots/fog/approving.png",
            openArms: "/images/bots/fog/open-arms.png"
        },
        pickerLines: [
            "Pixie here. Quiet positions still hide sharp ideas... meow.",
            "Prrr... I like calm positions. They make the tactics easier to smell.",
            "Meow. Sit back; I'll keep my eyes on every loose piece."
        ],
        idleLines: [
            "Load a game and I'll take a calm, careful look. Prrr.",
            "Meow. Bring me a game and let's see what your position was hiding.",
            "I'm ready when you are. No rush... cats never rush unless there's a reason."
        ],
        analysingLines: [
            "Give me a moment while I review your game:",
            "Prrr... give me a moment while I inspect every move:",
            "Meow. I'm going through the game now; give me a moment:"
        ],
        readyLines: [
            "I've finished reviewing the game. Let's look at the important bits.",
            "Prrr... review complete. I found a few moments worth scratching into.",
            "Meow. I'm done. Let's look at where the position really changed."
        ],
        reactions: {
            [Classification.BRILLIANT]: [
                "Prrr... that was beautiful. A genuinely brilliant move.",
                "Meow! Now that's the kind of move that makes my tail flick. Brilliant.",
                "Very nice. You found something special there... prrr."
            ],
            [Classification.CRITICAL]: [
                "Meow. Sharp eyes—that was a great find.",
                "Prrr... you handled a critical moment very well.",
                "That was the move. Nicely spotted."
            ],
            [Classification.MISTAKE]: [
                "Oof... even my whiskers twitched at that one. That's a mistake.",
                "Meow... this gave your opponent more than you wanted.",
                "Careful. That move let the position slip a little."
            ],
            [Classification.MISS]: [
                "Meow... the chance was right there, and it slipped away.",
                "Prrr... almost. There was a stronger opportunity hiding in the position.",
                "You had a chance to pounce there, but it got away."
            ],
            [Classification.BLUNDER]: [
                "Hiss... that's a blunder. Let's see exactly what went wrong.",
                "Meow. That one hurts—the position changes dramatically here.",
                "Ouch. Big swing. Let's slow this position down and inspect it."
            ]
        }
    },
    {
        id: "foxy",
        name: "Foxy",
        imagePath: "/images/bots/foxy/idle.png",
        expressions: {
            idle: "/images/bots/foxy/idle.png",
            blink: "/images/bots/foxy/blink-overlay.png",
            thinking: "/images/bots/foxy/thinking.png",
            explaining: "/images/bots/foxy/explaining.png",
            celebrating: "/images/bots/foxy/celebrating.png",
            worried: "/images/bots/foxy/worried.png",
            error: "/images/bots/foxy/error.png",
            happy: "/images/bots/foxy/happy.png",
            approving: "/images/bots/foxy/approving.png",
            openArms: "/images/bots/foxy/open-arms.png"
        },
        pickerLines: [
            "Foxy here. If there was a trick in the position, I probably found it.",
            "Heh... let's see who was being clever and who got caught.",
            "I like positions with hidden traps. Let's sniff them out."
        ],
        idleLines: [
            "Drop in a game and I'll sniff out the tactical turns.",
            "Heh. Show me the game—I'll look for the tricks between the moves.",
            "Ready when you are. Let's see where the position got sneaky."
        ],
        analysingLines: [
            "One moment while I sniff out the sneaky moments:",
            "Heh... give me a second. I'm checking every little trick:",
            "Let me hunt through the tactics for a moment:"
        ],
        readyLines: [
            "Done. I've got the sharp moments lined up for you.",
            "Heh. Review complete—and yes, there were a few tricks in there.",
            "All done. Let's look at where the position got interesting."
        ],
        reactions: {
            [Classification.BRILLIANT]: [
                "Heh! That's nasty—in the best possible way. Brilliant move.",
                "Oh, that's clever. Very clever.",
                "You set the trap and the position approves. Brilliant."
            ],
            [Classification.CRITICAL]: [
                "Nice. You found the move that keeps the pressure on.",
                "Heh... good eye. That was the critical idea.",
                "Exactly. That's how you keep your opponent uncomfortable."
            ],
            [Classification.MISTAKE]: [
                "Heh... that one left the door open.",
                "Careful. Your opponent gets a trick after this.",
                "That move was a little too generous."
            ],
            [Classification.MISS]: [
                "Ah, you had them! The chance slipped away.",
                "Heh... there was a tactical bite here, but you didn't take it.",
                "You were one move away from pouncing on the opportunity."
            ],
            [Classification.BLUNDER]: [
                "Ouch. That's the kind of slip a fox never forgets.",
                "Heh... no hiding this one. That's a blunder.",
                "Big problem. Your opponent gets a very clear opportunity now."
            ]
        }
    },
    {
        id: "cybe",
        name: "Cybe",
        imagePath: "/images/bots/cybe/idle.png",
        expressions: {
            idle: "/images/bots/cybe/idle.png",
            blink: "/images/bots/cybe/blink.png",
            thinking: "/images/bots/cybe/thinking.png",
            explaining: "/images/bots/cybe/explaining.png",
            celebrating: "/images/bots/cybe/celebrating.png",
            error: "/images/bots/cybe/error.png",
            surprised: "/images/bots/cybe/surprised.png",
            approving: "/images/bots/cybe/approving.png",
            openArms: "/images/bots/cybe/open-arms.png"
        },
        pickerLines: [
            "BEEP. Cybe online. Precision first, drama second.",
            "SYSTEM READY. BEEP. Send game data when prepared.",
            "Cybe connected. Tactical sensors calibrated. BEEP."
        ],
        idleLines: [
            "BEEP. Feed me a game and I'll process the cleanest improvements.",
            "SYSTEM IDLE. Game input requested.",
            "Cybe ready. BEEP. Awaiting chess data."
        ],
        analysingLines: [
            "BEEP. Processing game data now. Give me a moment:",
            "ANALYSIS RUNNING. BEEP. Please stand by:",
            "Computing critical positions. BEEP:"
        ],
        readyLines: [
            "BEEP. Analysis complete. Efficiency report is ready.",
            "PROCESS COMPLETE. Critical deviations identified.",
            "Review finished. BEEP. Optimal comparisons are ready."
        ],
        reactions: {
            [Classification.BRILLIANT]: [
                "BEEP. Exceptional move detected. Classification: brilliant.",
                "TACTICAL OUTPUT: outstanding. BEEP.",
                "Efficiency spike detected. Excellent calculation."
            ],
            [Classification.CRITICAL]: [
                "BEEP. Critical move found successfully.",
                "Optimal response located. Execution confirmed.",
                "High-importance decision handled correctly. BEEP."
            ],
            [Classification.MISTAKE]: [
                "WARNING. BEEP. Evaluation loss detected: mistake.",
                "Suboptimal decision detected. Review recommended.",
                "BEEP. Position efficiency decreased here."
            ],
            [Classification.MISS]: [
                "OPPORTUNITY LOST. BEEP. Stronger continuation was available.",
                "Critical chance not converted. Recalculation advised.",
                "BEEP. Tactical opportunity expired."
            ],
            [Classification.BLUNDER]: [
                "ALERT. BEEP-BEEP. Major evaluation drop detected.",
                "CRITICAL ERROR. Position changed significantly.",
                "BEEP. Blunder detected. Immediate review recommended."
            ]
        }
    },
    {
        id: "max_rooks",
        name: "Max Rooks",
        imagePath: "/images/bots/max_rooks/idle.png",
        expressions: {
            idle: "/images/bots/max_rooks/idle.png",
            blink: "/images/bots/max_rooks/blink.png",
            thinking: "/images/bots/max_rooks/thinking.png",
            explaining: "/images/bots/max_rooks/explaining.png",
            celebrating: "/images/bots/max_rooks/celebrating.png",
            happy: "/images/bots/max_rooks/happy.png",
            speaking: "/images/bots/max_rooks/speaking.png",
            surprised: "/images/bots/max_rooks/surprised.png",
            sad: "/images/bots/max_rooks/sad.png"
        },
        pickerLines: [
            "Max Rooks here. We'll keep it principled and practical.",
            "Hm. Good chess starts with clear decisions. Let's review yours.",
            "Let's keep the analysis simple: plans, tactics, consequences."
        ],
        idleLines: [
            "Show me the game and I'll explain what mattered most.",
            "Hm. Bring me the game and we'll identify the real turning points.",
            "Whenever you're ready, we'll review the position without unnecessary noise."
        ],
        analysingLines: [
            "Allow me a moment while I examine the game carefully:",
            "Hm. Give me a moment to review the critical decisions:",
            "Let's examine the game properly. One moment:"
        ],
        readyLines: [
            "The review is ready. Let's go through the key decisions.",
            "Hm. I've finished. There are a few moments worth studying closely.",
            "Review complete. Let's focus on the decisions that actually mattered."
        ],
        reactions: {
            [Classification.BRILLIANT]: [
                "Excellent. That is a genuinely sophisticated move.",
                "Hm. Very impressive—you understood the position deeply there.",
                "A brilliant decision. Precise and purposeful."
            ],
            [Classification.CRITICAL]: [
                "Very good. You found the critical continuation.",
                "Hm. Strong decision at an important moment.",
                "That was the right practical choice."
            ],
            [Classification.MISTAKE]: [
                "Hm. This move concedes too much. Let's understand why.",
                "A mistake, but an instructive one.",
                "This decision weakens your position more than it first appears."
            ],
            [Classification.MISS]: [
                "You had an opportunity here. Hm. The stronger move was easy to overlook.",
                "A missed chance. This is worth studying carefully.",
                "The position offered more than you took from it."
            ],
            [Classification.BLUNDER]: [
                "Hm. A serious error. Let's identify the calculation that was missing.",
                "This is the key mistake of the sequence. Slow down here.",
                "A major oversight. The lesson is more important than the result."
            ]
        }
    }
];

export function getCoachById(id: CoachId): CoachOption {
    return coachOptions.find(option => option.id == id) || coachOptions[0];
}

export function getCoachExpressionPath(
    coach: CoachOption,
    expression: CoachExpression
): string {
    return coach.expressions[expression] || coach.expressions.idle;
}

export function pickRandomLine(lines: string[]): string {
    if (lines.length == 0) return "";
    return lines[Math.floor(Math.random() * lines.length)];
}

function getTranslatedCoachLines(
    t: TFunction | undefined,
    key: string
): string[] {
    if (!t) return [];

    const value = t(key, {
        returnObjects: true,
        defaultValue: []
    });

    return Array.isArray(value)
        ? value.filter((line): line is string => typeof line == "string")
        : [];
}

export function getCoachSummaryLine(
    coach: CoachOption,
    state: CoachSummaryState,
    t?: TFunction
): string {
    const translated = getTranslatedCoachLines(
        t,
        `summary.${coach.id}.${state}`
    );

    const line = translated.length > 0
        ? pickRandomLine(translated)
        : state == "analysing"
            ? pickRandomLine(coach.analysingLines)
            : state == "ready"
                ? pickRandomLine(coach.readyLines)
                : pickRandomLine(coach.idleLines);

    return getCoachSpokenLine(
        coach,
        line,
        `summary-${state}-${line}`,
        t
    );
}

export function getCoachPickerLine(
    coach: CoachOption,
    t?: TFunction
): string {
    const translated = getTranslatedCoachLines(
        t,
        `summary.${coach.id}.picker`
    );

    const line = translated.length > 0
        ? pickRandomLine(translated)
        : pickRandomLine(coach.pickerLines);

    return getCoachSpokenLine(
        coach,
        line,
        `picker-${line}`,
        t
    );
}

interface CoachCatchphraseSet {
    probability: number;
    prefixes: string[];
    suffixes?: string[];
}


const catchphraseSets: Record<
    CoachId,
    Partial<Record<Classification, CoachCatchphraseSet>>
> = {
    fog: {
        [Classification.BRILLIANT]: {
            probability: 78,
            prefixes: ["Prrr...", "Meow!", "Mrrp..."],
            suffixes: ["That one had claws.", "Prrr."]
        },
        [Classification.CRITICAL]: {
            probability: 56,
            prefixes: ["Mrrp...", "Meow.", "Prrr..."]
        },
        [Classification.BEST]: {
            probability: 34,
            prefixes: ["Mrrp...", "Prrr..."]
        },
        [Classification.EXCELLENT]: {
            probability: 38,
            prefixes: ["Prrr...", "Meow."]
        },
        [Classification.INACCURACY]: {
            probability: 40,
            prefixes: ["Sniff, sniff...", "Mrrp..."]
        },
        [Classification.MISTAKE]: {
            probability: 58,
            prefixes: ["Mrrp...", "Sniff, sniff...", "Meow..."]
        },
        [Classification.MISS]: {
            probability: 58,
            prefixes: ["Mrrp...", "Meow..."]
        },
        [Classification.BLUNDER]: {
            probability: 82,
            prefixes: ["Hiss...", "Agh, meow...", "Mrrp..."]
        }
    },
    foxy: {
        [Classification.BRILLIANT]: {
            probability: 76,
            prefixes: ["Yip!", "Heh...", "Sniff, sniff..."],
            suffixes: ["Beautifully sneaky.", "Nicely hunted."]
        },
        [Classification.CRITICAL]: {
            probability: 52,
            prefixes: ["Yip!", "Heh...", "Sniff, sniff..."]
        },
        [Classification.BEST]: {
            probability: 34,
            prefixes: ["Heh...", "Sniff, sniff..."]
        },
        [Classification.EXCELLENT]: {
            probability: 38,
            prefixes: ["Heh...", "Yip!"]
        },
        [Classification.INACCURACY]: {
            probability: 40,
            prefixes: ["Tch...", "Sniff, sniff..."]
        },
        [Classification.MISTAKE]: {
            probability: 56,
            prefixes: ["Tch...", "Sniff, sniff...", "Heh..."]
        },
        [Classification.MISS]: {
            probability: 56,
            prefixes: ["Tch...", "Heh..."]
        },
        [Classification.BLUNDER]: {
            probability: 80,
            prefixes: ["Tch...", "Sniff, sniff...", "Agh..."]
        }
    },
    cybe: {
        [Classification.BRILLIANT]: {
            probability: 82,
            prefixes: ["BEEP.", "TACTICAL SURGE.", "PATTERN LOCKED."],
            suffixes: ["Sequence validated.", "Pattern cached."]
        },
        [Classification.CRITICAL]: {
            probability: 62,
            prefixes: ["BEEP.", "SEQUENCE CONFIRMED.", "SIGNAL LOCKED."]
        },
        [Classification.BEST]: {
            probability: 44,
            prefixes: ["BEEP.", "OPTIMAL PATH.", "SEQUENCE CONFIRMED."]
        },
        [Classification.EXCELLENT]: {
            probability: 44,
            prefixes: ["BEEP.", "OUTPUT STABLE."]
        },
        [Classification.INACCURACY]: {
            probability: 48,
            prefixes: ["WARNING.", "SIGNAL DRIFT."]
        },
        [Classification.MISTAKE]: {
            probability: 66,
            prefixes: ["SYSTEM ALERT.", "WARNING.", "RECALCULATING."]
        },
        [Classification.MISS]: {
            probability: 66,
            prefixes: ["OPPORTUNITY LOST.", "RECALCULATING."]
        },
        [Classification.BLUNDER]: {
            probability: 88,
            prefixes: ["CRITICAL FAULT.", "SYSTEM ALERT.", "BEEP-BEEP."],
            suffixes: ["Immediate rescan required."]
        }
    },
    max_rooks: {
        [Classification.BRILLIANT]: {
            probability: 72,
            prefixes: ["Magnificent.", "Good heavens...", "Hm..."],
            suffixes: ["Remember that idea."]
        },
        [Classification.CRITICAL]: {
            probability: 50,
            prefixes: ["Indeed.", "Hm...", "Very good."]
        },
        [Classification.BEST]: {
            probability: 34,
            prefixes: ["Indeed.", "Precisely.", "Hm..."]
        },
        [Classification.EXCELLENT]: {
            probability: 38,
            prefixes: ["Very good.", "Indeed."]
        },
        [Classification.INACCURACY]: {
            probability: 38,
            prefixes: ["Hm...", "Ahem..."]
        },
        [Classification.MISTAKE]: {
            probability: 54,
            prefixes: ["Agh...", "Hm...", "Steady now."]
        },
        [Classification.MISS]: {
            probability: 54,
            prefixes: ["Agh...", "Hm..."]
        },
        [Classification.BLUNDER]: {
            probability: 78,
            prefixes: ["Agh...", "Good heavens...", "Steady now."],
            suffixes: ["Let us rebuild the line carefully."]
        }
    }
};


function hashCoachText(value: string): number {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}


function pickStableCoachLine(
    values: string[],
    seed: string,
    tag: string
): string {
    return values[
        hashCoachText(`${seed}|${tag}`) % values.length
    ];
}

const catchphraseMarkers: Record<CoachId, RegExp> = {
    fog: /\b(mrrp|meow|miau|prrr)\b/i,
    foxy: /\b(yip|heh|je)\b|sniff,\s*sniff|olf,\s*olf/i,
    cybe: /\b(beep|bip|pattern locked|patrón fijado)\b/i,
    max_rooks: /\b(hm|indeed|en efecto|quite|ciertamente)\b/i
};

const fallbackCatchphrases: Record<CoachId, {
    prefixes: string[];
    suffixes: string[];
}> = {
    fog: {
        prefixes: ["Mrrp...", "Meow.", "Prrr..."],
        suffixes: ["Prrr."]
    },
    foxy: {
        prefixes: ["Heh...", "Yip.", "Sniff, sniff..."],
        suffixes: ["Nicely hunted."]
    },
    cybe: {
        prefixes: ["BEEP.", "SEQUENCE CHECKED.", "PATTERN LOCKED."],
        suffixes: ["Analysis stored."]
    },
    max_rooks: {
        prefixes: ["Hm.", "Indeed.", "Quite."],
        suffixes: ["Remember the idea."]
    }
};

export function getCoachSpokenLine(
    coach: CoachOption,
    line: string,
    seed: string,
    t?: TFunction
) {
    if (!line || catchphraseMarkers[coach.id].test(line)) return line;

    const translatedPrefixes = getTranslatedCoachLines(
        t,
        `catchphrases.${coach.id}.prefixes`
    );
    const translatedSuffixes = getTranslatedCoachLines(
        t,
        `catchphrases.${coach.id}.suffixes`
    );
    const fallback = fallbackCatchphrases[coach.id];
    const prefixes = translatedPrefixes.length > 0
        ? translatedPrefixes
        : fallback.prefixes;
    const suffixes = translatedSuffixes.length > 0
        ? translatedSuffixes
        : fallback.suffixes;
    const prefix = pickStableCoachLine(
        prefixes,
        seed,
        `${coach.id}-spoken-prefix`
    );
    const suffix = (
        suffixes.length > 0
        && hashCoachText(`${seed}|${coach.id}|spoken-suffix`) % 100 < 24
    )
        ? pickStableCoachLine(
            suffixes,
            seed,
            `${coach.id}-spoken-suffix`
        )
        : "";
    const full = [prefix, line, suffix].filter(Boolean).join(" ");

    if (full.length <= 210) return full;

    const withoutSuffix = `${prefix} ${line}`;
    return withoutSuffix.length <= 210 ? withoutSuffix : line;
}


export function getCoachReaction(
    coach: CoachOption,
    classification: Classification,
    dynamicComment?: string,
    seed: string = classification,
    t?: TFunction
): string | null {
    if (!dynamicComment) {
        const lines = coach.reactions[classification];
        if (!lines?.length) return null;
        const line = pickRandomLine(lines);

        return getCoachSpokenLine(
            coach,
            line,
            `${seed}|fallback-reaction`,
            t
        );
    }

    const set = catchphraseSets[coach.id][classification];
    if (!set) {
        return getCoachSpokenLine(
            coach,
            dynamicComment,
            `${seed}|generic-reaction`,
            t
        );
    }

    const roll = hashCoachText(
        `${seed}|${coach.id}|${classification}|catchphrase-roll`
    ) % 100;

    if (roll >= set.probability) {
        return getCoachSpokenLine(
            coach,
            dynamicComment,
            `${seed}|probability-fallback`,
            t
        );
    }

    const translatedPrefixes = getTranslatedCoachLines(
        t,
        `catchphrases.${coach.id}.prefixes`
    );
    const translatedSuffixes = getTranslatedCoachLines(
        t,
        `catchphrases.${coach.id}.suffixes`
    );
    const prefixes = translatedPrefixes.length > 0
        ? translatedPrefixes
        : set.prefixes;
    const suffixes = translatedSuffixes.length > 0
        ? translatedSuffixes
        : set.suffixes || [];

    const prefix = pickStableCoachLine(
        prefixes,
        seed,
        `${coach.id}-${classification}-prefix`
    );

    const includeSuffix = Boolean(
        suffixes.length
        && hashCoachText(`${seed}|suffix`) % 100 < 34
    );

    const suffix = includeSuffix
        ? pickStableCoachLine(
            suffixes,
            seed,
            `${coach.id}-${classification}-suffix`
        )
        : "";

    const full = [prefix, dynamicComment, suffix]
        .filter(Boolean)
        .join(" ");

    if (full.length <= 190) return full;

    const withoutSuffix = `${prefix} ${dynamicComment}`;
    if (withoutSuffix.length <= 190) return withoutSuffix;

    return dynamicComment;
}

export function isCriticalCoachClassification(
    classification: Classification | undefined
): classification is Classification {
    return classification == Classification.BRILLIANT
        || classification == Classification.CRITICAL
        || classification == Classification.MISTAKE
        || classification == Classification.MISS
        || classification == Classification.BLUNDER;
}
