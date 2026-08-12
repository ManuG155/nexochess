export interface OpeningCatalogueEntry {
    eco: string;
    name: string;
    pgn: string;
    family: string;
}

const SOURCE_BASE =
    "https://raw.githubusercontent.com/lichess-org/chess-openings/master";

const SOURCE_FILES = ["a.tsv", "b.tsv", "c.tsv", "d.tsv", "e.tsv"];

const FALLBACK_OPENINGS: OpeningCatalogueEntry[] = [
    { eco: "B00", name: "King's Pawn Game", pgn: "1. e4", family: "King's Pawn Game" },
    { eco: "C20", name: "King's Pawn Game: Open Game", pgn: "1. e4 e5", family: "King's Pawn Game" },
    { eco: "C60", name: "Ruy Lopez", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5", family: "Ruy Lopez" },
    { eco: "C50", name: "Italian Game", pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4", family: "Italian Game" },
    { eco: "B20", name: "Sicilian Defense", pgn: "1. e4 c5", family: "Sicilian Defense" },
    { eco: "B90", name: "Sicilian Defense: Najdorf Variation", pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6", family: "Sicilian Defense" },
    { eco: "C00", name: "French Defense", pgn: "1. e4 e6", family: "French Defense" },
    { eco: "B10", name: "Caro-Kann Defense", pgn: "1. e4 c6", family: "Caro-Kann Defense" },
    { eco: "B01", name: "Scandinavian Defense", pgn: "1. e4 d5", family: "Scandinavian Defense" },
    { eco: "B07", name: "Pirc Defense", pgn: "1. e4 d6 2. d4 Nf6 3. Nc3 g6", family: "Pirc Defense" },
    { eco: "A40", name: "Queen's Pawn Game", pgn: "1. d4", family: "Queen's Pawn Game" },
    { eco: "D00", name: "Queen's Gambit", pgn: "1. d4 d5 2. c4", family: "Queen's Gambit" },
    { eco: "D06", name: "Queen's Gambit Declined", pgn: "1. d4 d5 2. c4 e6", family: "Queen's Gambit Declined" },
    { eco: "D20", name: "Queen's Gambit Accepted", pgn: "1. d4 d5 2. c4 dxc4", family: "Queen's Gambit Accepted" },
    { eco: "E60", name: "King's Indian Defense", pgn: "1. d4 Nf6 2. c4 g6", family: "King's Indian Defense" },
    { eco: "E20", name: "Nimzo-Indian Defense", pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4", family: "Nimzo-Indian Defense" },
    { eco: "D10", name: "Slav Defense", pgn: "1. d4 d5 2. c4 c6", family: "Slav Defense" },
    { eco: "A10", name: "English Opening", pgn: "1. c4", family: "English Opening" },
    { eco: "A04", name: "Reti Opening", pgn: "1. Nf3", family: "Reti Opening" },
    { eco: "A45", name: "Trompowsky Attack", pgn: "1. d4 Nf6 2. Bg5", family: "Trompowsky Attack" }
];

let cataloguePromise: Promise<OpeningCatalogueEntry[]> | undefined;

function getFamily(name: string) {
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

async function fetchCatalogue() {
    const responses = await Promise.all(
        SOURCE_FILES.map(file => fetch(`${SOURCE_BASE}/${file}`))
    );

    if (responses.some(response => !response.ok)) {
        throw new Error("Opening catalogue unavailable");
    }

    const chunks = await Promise.all(responses.map(response => response.text()));
    return deduplicate(chunks.flatMap(parseTsv)).sort((a, b) => (
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
