import { OpeningCatalogueEntry } from "./openingCatalogue";
import { pgnMoveKeys } from "./courseDepth";

interface ParsedLine {
    entry: OpeningCatalogueEntry;
    moves: string[];
}

interface BuiltLesson {
    entry: OpeningCatalogueEntry;
    ply: number;
}

interface TheoryNode {
    children: Map<string, TheoryNode>;
    best?: ParsedLine;
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
    if (entry.name == entry.family) return 0;
    if (/\b(Main Line|Classical|Normal|Advance|Exchange|Accepted|Declined)\b/i.test(entry.name)) return 1;
    return 2;
}

function better(candidate: ParsedLine, current?: ParsedLine) {
    if (!current) return true;
    return candidate.moves.length > current.moves.length
        || (candidate.moves.length == current.moves.length && priority(candidate.entry) < priority(current.entry))
        || (candidate.moves.length == current.moves.length
            && priority(candidate.entry) == priority(current.entry)
            && candidate.entry.name.localeCompare(current.entry.name) < 0);
}

function createNode(): TheoryNode {
    return { children: new Map<string, TheoryNode>() };
}

function addToTrie(root: TheoryNode, line: ParsedLine) {
    let node = root;
    if (better(line, node.best)) node.best = line;
    for (const move of line.moves) {
        let child = node.children.get(move);
        if (!child) {
            child = createNode();
            node.children.set(move, child);
        }
        node = child;
        if (better(line, node.best)) node.best = line;
    }
}

function nodeAt(root: TheoryNode, moves: string[]) {
    let node: TheoryNode | undefined = root;
    for (const move of moves) {
        node = node.children.get(move);
        if (!node) return undefined;
    }
    return node;
}

function checkpointsFor(root: TheoryNode, mainLine: string[]) {
    const result: number[] = [];
    let node: TheoryNode | undefined = root;
    for (let depth = 0; depth < mainLine.length; depth += 1) {
        if (!node) break;
        if (depth >= 2 && node.children.size > 1) result.push(depth);
        node = node.children.get(mainLine[depth]);
    }
    return result;
}

function representativeFrom(candidates: ParsedLine[]) {
    return [...candidates].sort((a, b) => {
        const aPly = a.moves.length;
        const bPly = b.moves.length;
        const aDistance = aPly <= 14 ? 14 - aPly : aPly - 14 + 20;
        const bDistance = bPly <= 14 ? 14 - bPly : bPly - 14 + 20;
        return aDistance - bDistance || bPly - aPly;
    })[0];
}

export function countCourseLessonsFast(lines: OpeningCatalogueEntry[], maximum = 28) {
    const standardNames = new Set<string>();
    let personal = 0;
    for (const line of lines) {
        if (line.eco == "USR") personal += 1;
        else standardNames.add(line.name);
    }
    return Math.min(maximum, standardNames.size) + personal;
}

export function buildCourseLessonsIndexed(lines: OpeningCatalogueEntry[], maximum = 28) {
    const parsed = lines
        .map(entry => ({ entry, moves: movesFor(entry) }))
        .filter(item => item.moves.length > 0);

    const byFamily = new Map<string, ParsedLine[]>();
    for (const item of parsed) {
        const family = byFamily.get(item.entry.family);
        if (family) family.push(item);
        else byFamily.set(item.entry.family, [item]);
    }

    const result: BuiltLesson[] = [];

    for (const familyLines of byFamily.values()) {
        const root = createNode();
        familyLines.forEach(line => addToTrie(root, line));

        const byName = new Map<string, ParsedLine[]>();
        for (const item of familyLines) {
            const group = byName.get(item.entry.name);
            if (group) group.push(item);
            else byName.set(item.entry.name, [item]);
        }

        for (const group of byName.values()) {
            const representative = representativeFrom(group);
            if (!representative) continue;
            const prefixNode = nodeAt(root, representative.moves);
            const deepest = prefixNode?.best || representative;
            result.push({
                entry: {
                    ...representative.entry,
                    pgn: deepest.entry.pgn,
                    depthCheckpoints: checkpointsFor(root, deepest.moves)
                },
                ply: deepest.moves.length
            });
        }
    }

    return result
        .sort((a, b) => (
            priority(a.entry) - priority(b.entry)
            || a.ply - b.ply
            || a.entry.name.localeCompare(b.entry.name)
        ))
        .slice(0, maximum)
        .map(item => item.entry);
}
