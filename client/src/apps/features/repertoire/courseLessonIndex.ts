import { OpeningCatalogueEntry } from "./openingCatalogue";
import { pgnMoveKeys } from "./courseDepth";

interface ParsedLine {
    entry: OpeningCatalogueEntry;
    moves: string[];
}

interface TheoryNode {
    children: Map<string, TheoryNode>;
}

const moveCache = new WeakMap<OpeningCatalogueEntry, string[]>();

function movesFor(entry: OpeningCatalogueEntry) {
    const cached = moveCache.get(entry);
    if (cached) return cached;
    const moves = pgnMoveKeys(entry.pgn);
    moveCache.set(entry, moves);
    return moves;
}

function priority(entry: OpeningCatalogueEntry) {
    if (entry.eco == "USR") return 3;
    if (entry.name == entry.family) return 0;
    if (/\b(Main Line|Classical|Normal|Advance|Exchange|Accepted|Declined)\b/i.test(entry.name)) return 1;
    return 2;
}

function createNode(): TheoryNode {
    return { children: new Map<string, TheoryNode>() };
}

function addToTrie(root: TheoryNode, moves: string[]) {
    let node = root;
    for (const move of moves) {
        let child = node.children.get(move);
        if (!child) {
            child = createNode();
            node.children.set(move, child);
        }
        node = child;
    }
}

function checkpointsFor(root: TheoryNode, line: string[]) {
    const result: number[] = [];
    let node: TheoryNode | undefined = root;

    for (let depth = 0; depth < line.length; depth += 1) {
        if (!node) break;
        if (depth >= 2 && node.children.size > 1) result.push(depth);
        node = node.children.get(line[depth]);
    }

    return result;
}

export function courseLessonSequenceKey(entry: OpeningCatalogueEntry) {
    return movesFor(entry).join(" ");
}

export function countCourseLessonsFast(
    lines: OpeningCatalogueEntry[],
    maximum = Number.POSITIVE_INFINITY
) {
    const sequences = new Set<string>();

    for (const line of lines) {
        const key = courseLessonSequenceKey(line);
        if (key) sequences.add(key);
        if (sequences.size >= maximum) return maximum;
    }

    return sequences.size;
}

/*
 * A course is a repertoire, not a top-28 catalogue.  Keep every distinct
 * move sequence supplied by the opening source (and every genuinely new
 * personal branch), while collapsing only exact duplicate paths.
 *
 * This also means the family map and the study counter describe the same
 * set of available variations.
 */
export function buildCourseLessonsIndexed(
    lines: OpeningCatalogueEntry[],
    maximum = Number.POSITIVE_INFINITY
) {
    const parsed = lines
        .map(entry => ({ entry, moves: movesFor(entry) }))
        .filter(item => item.moves.length > 0);

    const byFamily = new Map<string, ParsedLine[]>();
    for (const item of parsed) {
        const family = byFamily.get(item.entry.family);
        if (family) family.push(item);
        else byFamily.set(item.entry.family, [item]);
    }

    const result: Array<{ entry: OpeningCatalogueEntry; ply: number }> = [];

    for (const familyLines of byFamily.values()) {
        const root = createNode();
        familyLines.forEach(line => addToTrie(root, line.moves));

        const bySequence = new Map<string, ParsedLine>();
        for (const item of familyLines) {
            const key = item.moves.join(" ");
            const current = bySequence.get(key);
            if (
                !current
                || priority(item.entry) < priority(current.entry)
                || (
                    priority(item.entry) == priority(current.entry)
                    && item.entry.name.localeCompare(current.entry.name) < 0
                )
            ) {
                bySequence.set(key, item);
            }
        }

        for (const item of bySequence.values()) {
            result.push({
                entry: {
                    ...item.entry,
                    depthCheckpoints: checkpointsFor(root, item.moves)
                },
                ply: item.moves.length
            });
        }
    }

    const ordered = result.sort((a, b) => (
        priority(a.entry) - priority(b.entry)
        || a.ply - b.ply
        || a.entry.name.localeCompare(b.entry.name)
        || a.entry.pgn.localeCompare(b.entry.pgn)
    ));

    return Number.isFinite(maximum)
        ? ordered.slice(0, maximum).map(item => item.entry)
        : ordered.map(item => item.entry);
}
