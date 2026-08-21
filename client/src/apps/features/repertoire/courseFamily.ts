/*
 * Repertoire courses intentionally group closely related named branches under
 * one learnable opening family. The source catalogue sometimes exposes those
 * branches as separate top-level names (for example Accepted/Declined, Jobava
 * London, or Queen's Indian "with e3" records), which is useful metadata but
 * makes a poor course boundary.
 */
const COURSE_FAMILY_ALIASES: Array<[RegExp, string]> = [
    [/^Jobava London System$/i, "London System"],
    [/^Pseudo[- ]Queen's Indian Defense$/i, "Queen's Indian Defense"]
];

export function canonicalCourseFamily(value: string) {
    let family = value.trim();

    /*
     * Names such as "Queen's Indian Defense, with e3, Bb4+ Line" are
     * continuations of the same defense, not separate courses.
     */
    family = family.replace(/,\s*with\b.*$/i, "").trim();

    /* Accepted and Declined belong to the gambit course that contains both. */
    family = family.replace(/\s+(Accepted|Declined)$/i, "").trim();

    for (const [pattern, canonical] of COURSE_FAMILY_ALIASES) {
        if (pattern.test(family)) return canonical;
    }

    return family;
}
