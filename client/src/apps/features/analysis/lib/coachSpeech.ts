import type { TFunction } from "i18next";

import type {
    CoachId,
    CoachOption
} from "./coach";

const MAX_SPOKEN_COMMENT_LENGTH = 560;

function hashText(value: string): number {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

function translatedLines(
    t: TFunction,
    key: string
): string[] {
    const value = t(key, {
        returnObjects: true,
        defaultValue: []
    });

    return Array.isArray(value)
        ? value.filter((line): line is string => typeof line == "string")
        : [];
}

function stableLine(
    values: string[],
    seed: string,
    tag: string
): string {
    return values[hashText(`${seed}|${tag}`) % values.length];
}

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

export function addOccasionalCoachCatchphrase(
    coach: CoachOption,
    line: string,
    seed: string,
    t: TFunction
): string {
    if (!line) return line;

    /*
     * Exactly one deterministic bucket out of four receives personality.
     * Reopening the same move keeps the same wording instead of flickering.
     */
    const includeCatchphrase = (
        hashText(`${seed}|${coach.id}|review-catchphrase`) % 4
    ) == 0;

    if (!includeCatchphrase) return line;

    const translatedPrefixes = translatedLines(
        t,
        `catchphrases.${coach.id}.prefixes`
    );
    const translatedSuffixes = translatedLines(
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
    const useSuffix = suffixes.length > 0
        && hashText(`${seed}|${coach.id}|review-position`) % 4 == 0;
    const phrase = stableLine(
        useSuffix ? suffixes : prefixes,
        seed,
        `${coach.id}-${useSuffix ? "suffix" : "prefix"}`
    );
    const full = useSuffix
        ? `${line} ${phrase}`
        : `${phrase} ${line}`;

    return full.length <= MAX_SPOKEN_COMMENT_LENGTH ? full : line;
}
