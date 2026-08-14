import { isMovePrefix, pgnMoveKeys } from "./courseDepth";

export interface OpeningCatalogueEntry {
    eco: string;
    name: string;
    pgn: string;
    family: string;
    depthCheckpoints?: number[];
}

export type OpeningCategory = "e4" | "d4" | "vsE4" | "vsD4" | "flank";

const SOURCE_BASE =
    "https://raw.githubusercontent.com/lichess-org/chess-openings/master";

const SOURCE_FILES = ["a.tsv", "b.tsv", "c.tsv", "d.tsv", "e.tsv"];

export const FEATURED_FAMILIES: Record<OpeningCategory, string[]> = {
    e4: [
        "Ruy Lopez",
        "Italian Game",
        "Scotch Game",
        "Ponziani Opening",
        "Vienna Game",
        "Four Knights Game",
        "King's Gambit"
    ],
    d4: [
        "Queen's Gambit",
        "London System",
        "Catalan Opening",
        "Trompowsky Attack",
        "Colle System",
        "Jobava London System"
    ],
    vsE4: [
        "Sicilian Defense",
        "French Defense",
        "Caro-Kann Defense",
        "Scandinavian Defense",
        "Pirc Defense",
        "Modern Defense",
        "Alekhine Defense"
    ],
    vsD4: [
        "King's Indian Defense",
        "Queen's Indian Defense",
        "Nimzo-Indian Defense",
        "Bogo-Indian Defense",
        "Grünfeld Defense",
        "Slav Defense",
        "Semi-Slav Defense",
        "Dutch Defense",
        "Benoni Defense",
        "Benko Gambit",
        "Queen's Gambit Declined",
        "Queen's Gambit Accepted"
    ],
    flank: [
        "English Opening",
        "Réti Opening",
        "Bird Opening",
        "King's Indian Attack"
    ]
};

const FAMILY_ALIASES: Array<[RegExp, string]> = [
    [/\bJobava London System\b/i, "Jobava London System"],
    [/\bLondon System\b/i, "London System"],
    [/\bColle System\b/i, "Colle System"],
    [/\bKing's Indian Attack\b/i, "King's Indian Attack"],
    [/\bStonewall Attack\b/i, "Stonewall Attack"]
];

const FALLBACK_OPENINGS: OpeningCatalogueEntry[] = [
    { eco: "C60", name: "Ruy Lopez", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5", family: "Ruy Lopez" },
    { eco: "C50", name: "Italian Game", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4", family: "Italian Game" },
    { eco: "C45", name: "Scotch Game", pgn: "1. e4 e5 2. Nf3 Nc6 3. d4", family: "Scotch Game" },
    { eco: "C44", name: "Ponziani Opening", pgn: "1. e4 e5 2. Nf3 Nc6 3. c3", family: "Ponziani Opening" },
    { eco: "C25", name: "Vienna Game", pgn: "1. e4 e5 2. Nc3", family: "Vienna Game" },
    { eco: "C47", name: "Four Knights Game", pgn: "1. e4 e5 2. Nf3 Nc6 3. Nc3 Nf6", family: "Four Knights Game" },
    { eco: "C30", name: "King's Gambit", pgn: "1. e4 e5 2. f4", family: "King's Gambit" },

    { eco: "D06", name: "Queen's Gambit", pgn: "1. d4 d5 2. c4", family: "Queen's Gambit" },
    { eco: "D02", name: "Queen's Pawn Game: London System", pgn: "1. d4 d5 2. Nf3 Nf6 3. Bf4", family: "London System" },
    { eco: "E00", name: "Catalan Opening", pgn: "1. d4 Nf6 2. c4 e6 3. g3", family: "Catalan Opening" },
    { eco: "A45", name: "Trompowsky Attack", pgn: "1. d4 Nf6 2. Bg5", family: "Trompowsky Attack" },
    { eco: "D04", name: "Queen's Pawn Game: Colle System", pgn: "1. d4 d5 2. Nf3 Nf6 3. e3", family: "Colle System" },
    { eco: "D00", name: "Queen's Pawn Game: Jobava London System", pgn: "1. d4 d5 2. Nc3 Nf6 3. Bf4", family: "Jobava London System" },

    { eco: "B20", name: "Sicilian Defense", pgn: "1. e4 c5", family: "Sicilian Defense" },
    { eco: "C00", name: "French Defense", pgn: "1. e4 e6", family: "French Defense" },
    { eco: "B10", name: "Caro-Kann Defense", pgn: "1. e4 c6", family: "Caro-Kann Defense" },
    { eco: "B01", name: "Scandinavian Defense", pgn: "1. e4 d5", family: "Scandinavian Defense" },
    { eco: "B07", name: "Pirc Defense", pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6", family: "Pirc Defense" },
    { eco: "B06", name: "Modern Defense", pgn: "1. e4 g6", family: "Modern Defense" },
    { eco: "B02", name: "Alekhine Defense", pgn: "1. e4 Nf6", family: "Alekhine Defense" },

    { eco: "E60", name: "King's Indian Defense", pgn: "1. d4 Nf6 2. c4 g6", family: "King's Indian Defense" },
    { eco: "E12", name: "Queen's Indian Defense", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 b6", family: "Queen's Indian Defense" },
    { eco: "E20", name: "Nimzo-Indian Defense", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4", family: "Nimzo-Indian Defense" },
    { eco: "E11", name: "Bogo-Indian Defense", pgn: "1. d4 Nf6 2. c4 e6 3. Nf3 Bb4+", family: "Bogo-Indian Defense" },
    { eco: "D70", name: "Grünfeld Defense", pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 d5", family: "Grünfeld Defense" },
    { eco: "D10", name: "Slav Defense", pgn: "1. d4 d5 2. c4 c6", family: "Slav Defense" },
    { eco: "D43", name: "Semi-Slav Defense", pgn: "1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 e6", family: "Semi-Slav Defense" },
    { eco: "A80", name: "Dutch Defense", pgn: "1. d4 f5", family: "Dutch Defense" },
    { eco: "A56", name: "Benoni Defense", pgn: "1. d4 Nf6 2. c4 c5 3. d5", family: "Benoni Defense" },
    { eco: "A57", name: "Benko Gambit", pgn: "1. d4 Nf6 2. c4 c5 3. d5 b5", family: "Benko Gambit" },
    { eco: "D30", name: "Queen's Gambit Declined", pgn: "1. d4 d5 2. c4 e6", family: "Queen's Gambit Declined" },
    { eco: "D20", name: "Queen's Gambit Accepted", pgn: "1. d4 d5 2. c4 dxc4", family: "Queen's Gambit Accepted" },

    { eco: "A10", name: "English Opening", pgn: "1. c4", family: "English Opening" },
    { eco: "A04", name: "Réti Opening", pgn: "1. Nf3", family: "Réti Opening" },
    { eco: "A02", name: "Bird Opening", pgn: "1. f4", family: "Bird Opening" },
    { eco: "A07", name: "King's Indian Attack", pgn: "1. Nf3 d5 2. g3", family: "King's Indian Attack" }
];

let cataloguePromise: Promise<OpeningCatalogueEntry[]> | undefined;

function getFamily(name: string) {
    for (const [pattern, family] of FAMILY_ALIASES) {
        if (pattern.test(name)) return family;
    }
    return name.split(":")[0].trim();
}

function parseTsv(text: string): OpeningCatalogueEntry[] {
    return text
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .slice(1)
        .map(line => line.split("\t"))
        .filter(columns => columns.length >= 3)
        .map(([eco, name, pgn]) => ({
            eco: eco.trim(),
            name: name.trim(),
            pgn: pgn.trim(),
            family: getFamily(name)
        }))
        .filter(entry => entry.eco && entry.name && entry.pgn);
}

function deduplicate(entries: OpeningCatalogueEntry[]) {
    const seen = new Set<string>();
    return entries.filter(entry => {
        const key = `${entry.eco}|${entry.name}|${entry.pgn}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function plyCount(pgn: string) {
    return pgnMoveKeys(pgn).length;
}

function lessonPriority(entry: OpeningCatalogueEntry) {
    if (entry.name == entry.family) return 0;
    if (/\b(Main Line|Classical|Normal|Advance|Exchange|Accepted|Declined)\b/i.test(entry.name)) {
        return 1;
    }
    return 2;
}

function branchCheckpoints(
    mainLine: string[],
    familyLines: OpeningCatalogueEntry[]
) {
    const histories = familyLines
        .map(entry => pgnMoveKeys(entry.pgn))
        .filter(history => history.length > 0);
    const checkpoints: number[] = [];

    for (let depth = 2; depth < mainLine.length; depth += 1) {
        const prefix = mainLine.slice(0, depth);
        const nextMoves = new Set(
            histories
                .filter(history => (
                    history.length > depth && isMovePrefix(prefix, history)
                ))
                .map(history => history[depth])
        );
        if (nextMoves.size > 1) checkpoints.push(depth);
    }

    return checkpoints;
}

function extendLesson(
    representative: OpeningCatalogueEntry,
    familyLines: OpeningCatalogueEntry[]
) {
    const prefix = pgnMoveKeys(representative.pgn);
    if (!prefix.length) return representative;

    const candidates = familyLines
        .map(entry => ({ entry, moves: pgnMoveKeys(entry.pgn) }))
        .filter(candidate => isMovePrefix(prefix, candidate.moves))
        .sort((a, b) => (
            b.moves.length - a.moves.length
            || lessonPriority(a.entry) - lessonPriority(b.entry)
            || a.entry.name.localeCompare(b.entry.name)
        ));
    const deepest = candidates[0];
    const mainLine = deepest?.moves || prefix;

    return {
        ...representative,
        pgn: deepest?.entry.pgn || representative.pgn,
        depthCheckpoints: branchCheckpoints(mainLine, familyLines)
    };
}

export function buildCourseLessons(
    lines: OpeningCatalogueEntry[],
    maximum = 28
) {
    const grouped = new Map<string, OpeningCatalogueEntry[]>();
    for (const line of lines) {
        const list = grouped.get(line.name) || [];
        list.push(line);
        grouped.set(line.name, list);
    }

    const representatives = Array.from(grouped.values()).map(candidates => {
        const sorted = [...candidates].sort((a, b) => {
            const aPly = plyCount(a.pgn);
            const bPly = plyCount(b.pgn);
            const aDistance = aPly <= 14 ? 14 - aPly : aPly - 14 + 20;
            const bDistance = bPly <= 14 ? 14 - bPly : bPly - 14 + 20;
            return aDistance - bDistance || bPly - aPly;
        });
        return sorted[0];
    });

    const extended = representatives.map(representative => (
        extendLesson(
            representative,
            lines.filter(line => line.family == representative.family)
        )
    ));

    return extended
        .sort((a, b) => (
            lessonPriority(a) - lessonPriority(b)
            || plyCount(a.pgn) - plyCount(b.pgn)
            || a.name.localeCompare(b.name)
        ))
        .slice(0, maximum);
}

export function featuredFamiliesForCategory(category: OpeningCategory) {
    return FEATURED_FAMILIES[category];
}

async function fetchCatalogue() {
    const responses = await Promise.all(
        SOURCE_FILES.map(file => fetch(`${SOURCE_BASE}/${file}`))
    );

    if (responses.some(response => !response.ok)) {
        throw new Error("Opening catalogue unavailable");
    }

    const chunks = await Promise.all(responses.map(response => response.text()));
    return deduplicate([
        ...chunks.flatMap(parseTsv),
        ...FALLBACK_OPENINGS
    ]).sort((a, b) => (
        a.name.localeCompare(b.name) || a.pgn.length - b.pgn.length
    ));
}

export function loadOpeningCatalogue() {
    if (!cataloguePromise) {
        cataloguePromise = fetchCatalogue().catch(() => FALLBACK_OPENINGS);
    }
    return cataloguePromise;
}

export function getFallbackOpeningCatalogue() {
    return FALLBACK_OPENINGS;
}
