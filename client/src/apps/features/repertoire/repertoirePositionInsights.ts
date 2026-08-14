import { Chess } from "chess.js";

import { OpeningCatalogueEntry } from "./openingCatalogue";
import { positionFenKey } from "./playerPositionHabits";

export interface CataloguePositionInsight {
    eco: string;
    family: string;
    name: string;
    nextSan: string;
    nextUci: string;
    continuationUci: string[];
}

interface IndexedOccurrence extends CataloguePositionInsight {
    identity: string;
}

let cachedSource: OpeningCatalogueEntry[] | undefined;
let cachedIndex = new Map<string, IndexedOccurrence[]>();

function identity(opening: OpeningCatalogueEntry) {
    return `${opening.eco}|${opening.name}|${opening.pgn}`;
}

function buildIndex(catalogue: OpeningCatalogueEntry[]) {
    if (cachedSource == catalogue) return cachedIndex;
    const index = new Map<string, IndexedOccurrence[]>();

    for (const opening of catalogue) {
        const parser = new Chess();
        try {
            parser.loadPgn(opening.pgn);
        } catch {
            continue;
        }
        const sans = parser.history();
        if (!sans.length) continue;

        const board = new Chess();
        const parsed: Array<{ fenKey: string; san: string; uci: string }> = [];
        for (const san of sans.slice(0, 32)) {
            const fenKey = positionFenKey(board.fen());
            let move;
            try {
                move = board.move(san);
            } catch {
                break;
            }
            if (!move) break;
            parsed.push({
                fenKey,
                san: move.san,
                uci: `${move.from}${move.to}${move.promotion || ""}`
            });
        }

        for (let indexAtMove = 0; indexAtMove < parsed.length; indexAtMove += 1) {
            const item = parsed[indexAtMove];
            const occurrence: IndexedOccurrence = {
                identity: identity(opening),
                eco: opening.eco,
                family: opening.family,
                name: opening.name,
                nextSan: item.san,
                nextUci: item.uci,
                continuationUci: parsed.slice(indexAtMove, indexAtMove + 8).map(move => move.uci)
            };
            const list = index.get(item.fenKey) || [];
            list.push(occurrence);
            index.set(item.fenKey, list);
        }
    }

    cachedSource = catalogue;
    cachedIndex = index;
    return index;
}

export function catalogueInsightsAtFen(
    fen: string,
    catalogue: OpeningCatalogueEntry[],
    maximum = 8
) {
    const occurrences = buildIndex(catalogue).get(positionFenKey(fen)) || [];
    if (occurrences.length < 2) return [];

    const distinctNames = new Set(occurrences.map(item => item.identity));
    const distinctMoves = new Set(occurrences.map(item => item.nextUci));
    if (distinctNames.size < 2 && distinctMoves.size < 2) return [];

    const seen = new Set<string>();
    const result: CataloguePositionInsight[] = [];
    const ordered = [...occurrences].sort((a, b) => {
        const moveFrequencyA = occurrences.filter(item => item.nextUci == a.nextUci).length;
        const moveFrequencyB = occurrences.filter(item => item.nextUci == b.nextUci).length;
        return moveFrequencyB - moveFrequencyA
            || b.continuationUci.length - a.continuationUci.length
            || a.name.localeCompare(b.name);
    });

    for (const occurrence of ordered) {
        const key = `${occurrence.nextUci}|${occurrence.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({
            eco: occurrence.eco,
            family: occurrence.family,
            name: occurrence.name,
            nextSan: occurrence.nextSan,
            nextUci: occurrence.nextUci,
            continuationUci: occurrence.continuationUci
        });
        if (result.length >= maximum) break;
    }
    return result;
}
