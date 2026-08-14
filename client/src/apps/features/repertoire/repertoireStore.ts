import { Chess, Move } from "chess.js";

import { ImportedPgnLine } from "./pgnImport";
import { OpeningCatalogueEntry } from "./openingCatalogue";

export type RepertoireSide = "white" | "black";

export interface Repertoire {
    id: string;
    name: string;
    side: RepertoireSide;
    rootNodeId: string;
    baseNodeId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RepertoireNode {
    id: string;
    repertoireId: string;
    parentId: string | null;
    childIds: string[];
    fen: string;
    positionKey: string;
    moveUci: string | null;
    moveSan: string | null;
    ply: number;
    notes: string;
    preferredChildId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface RepertoireStore {
    version: 1;
    repertoires: Record<string, Repertoire>;
    nodes: Record<string, RepertoireNode>;
}

export interface OpenTarget {
    repertoireId: string;
    nodeId?: string;
}

export interface ImportResult {
    ok: boolean;
    count?: number;
    message?: string;
    store?: RepertoireStore;
}

const STORAGE_KEY = "nexochess.repertoire.v1";
export const START_FEN = new Chess().fen();

export function now() {
    return new Date().toISOString();
}

export function newId() {
    if (typeof crypto != "undefined" && typeof crypto.randomUUID == "function") {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function positionKey(fen: string) {
    return fen.split(" ").slice(0, 4).join(" ");
}

export function emptyStore(): RepertoireStore {
    return { version: 1, repertoires: {}, nodes: {} };
}

export function readRepertoireStore(): RepertoireStore {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return emptyStore();
        const parsed = JSON.parse(raw) as RepertoireStore;
        return validateStore(parsed) ? parsed : emptyStore();
    } catch {
        return emptyStore();
    }
}

export function writeRepertoireStore(store: RepertoireStore) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function validateStore(value: unknown): value is RepertoireStore {
    if (!value || typeof value != "object") return false;
    const store = value as Partial<RepertoireStore>;
    return store.version == 1
        && Boolean(store.repertoires)
        && typeof store.repertoires == "object"
        && Boolean(store.nodes)
        && typeof store.nodes == "object";
}

export function descendants(store: RepertoireStore, nodeId: string): string[] {
    const node = store.nodes[nodeId];
    if (!node) return [];
    return [nodeId, ...node.childIds.flatMap(childId => descendants(store, childId))];
}

export function pathToNode(store: RepertoireStore, nodeId: string): RepertoireNode[] {
    const result: RepertoireNode[] = [];
    let cursor = store.nodes[nodeId];
    while (cursor) {
        result.push(cursor);
        if (!cursor.parentId) break;
        cursor = store.nodes[cursor.parentId];
    }
    return result.reverse();
}

export function countMoves(store: RepertoireStore, repertoire: Repertoire) {
    return Math.max(0, descendants(store, repertoire.rootNodeId).length - 1);
}

export function createRepertoire(
    previous: RepertoireStore,
    name: string,
    side: RepertoireSide
) {
    const repertoireId = newId();
    const rootNodeId = newId();
    const timestamp = now();
    const repertoire: Repertoire = {
        id: repertoireId,
        name,
        side,
        rootNodeId,
        baseNodeId: rootNodeId,
        createdAt: timestamp,
        updatedAt: timestamp
    };
    const root: RepertoireNode = {
        id: rootNodeId,
        repertoireId,
        parentId: null,
        childIds: [],
        fen: START_FEN,
        positionKey: positionKey(START_FEN),
        moveUci: null,
        moveSan: null,
        ply: 0,
        notes: "",
        preferredChildId: null,
        createdAt: timestamp,
        updatedAt: timestamp
    };
    return {
        repertoire,
        store: {
            version: 1 as const,
            repertoires: {
                ...previous.repertoires,
                [repertoireId]: repertoire
            },
            nodes: {
                ...previous.nodes,
                [rootNodeId]: root
            }
        }
    };
}

export function deleteRepertoireFromStore(
    previous: RepertoireStore,
    repertoire: Repertoire
) {
    const repertoires = { ...previous.repertoires };
    const nodes = { ...previous.nodes };
    delete repertoires[repertoire.id];
    for (const id of descendants(previous, repertoire.rootNodeId)) {
        delete nodes[id];
    }
    return { version: 1 as const, repertoires, nodes };
}

function mergeVerboseMoves(
    previous: RepertoireStore,
    repertoireId: string,
    moves: Array<{ move: Move; note?: string }>
) {
    const repertoire = previous.repertoires[repertoireId];
    if (!repertoire) return { store: previous, lastNodeId: "" };

    const nodes = { ...previous.nodes };
    let current = nodes[repertoire.rootNodeId];
    if (!current) return { store: previous, lastNodeId: "" };

    for (const source of moves) {
        const board = new Chess(current.fen);
        let move: Move;
        try {
            move = board.move({
                from: source.move.from,
                to: source.move.to,
                ...(source.move.promotion
                    ? { promotion: source.move.promotion }
                    : {})
            });
        } catch {
            break;
        }

        const uci = `${move.from}${move.to}${move.promotion || ""}`;
        const existing = current.childIds
            .map(id => nodes[id])
            .find(node => node?.moveUci == uci);

        if (existing) {
            if (source.note?.trim() && !existing.notes.trim()) {
                nodes[existing.id] = {
                    ...existing,
                    notes: source.note.trim(),
                    updatedAt: now()
                };
                current = nodes[existing.id];
            } else {
                current = existing;
            }
            continue;
        }

        const timestamp = now();
        const childId = newId();
        const child: RepertoireNode = {
            id: childId,
            repertoireId,
            parentId: current.id,
            childIds: [],
            fen: board.fen(),
            positionKey: positionKey(board.fen()),
            moveUci: uci,
            moveSan: move.san,
            ply: current.ply + 1,
            notes: source.note?.trim() || "",
            preferredChildId: null,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        nodes[current.id] = {
            ...current,
            childIds: [...current.childIds, childId],
            preferredChildId: current.preferredChildId || childId,
            updatedAt: timestamp
        };
        nodes[childId] = child;
        current = child;
    }

    const timestamp = now();
    return {
        store: {
            version: 1 as const,
            repertoires: {
                ...previous.repertoires,
                [repertoireId]: {
                    ...repertoire,
                    updatedAt: timestamp
                }
            },
            nodes
        },
        lastNodeId: current.id
    };
}

export function mergeSanLine(
    previous: RepertoireStore,
    repertoireId: string,
    line: ImportedPgnLine
) {
    const board = new Chess();
    const moves: Array<{ move: Move; note?: string }> = [];
    for (const source of line.moves) {
        try {
            const move = board.move(source.san);
            if (!move) break;
            moves.push({ move, note: source.note });
        } catch {
            break;
        }
    }
    return mergeVerboseMoves(previous, repertoireId, moves);
}

export function mergeOpening(
    previous: RepertoireStore,
    opening: OpeningCatalogueEntry,
    side: RepertoireSide
) {
    let working = previous;
    let repertoire = Object.values(working.repertoires).find(item => (
        item.side == side
        && item.name.trim().toLocaleLowerCase()
            == opening.family.trim().toLocaleLowerCase()
    ));

    if (!repertoire) {
        const created = createRepertoire(working, opening.family, side);
        working = created.store;
        repertoire = created.repertoire;
    }

    const board = new Chess();
    try {
        board.loadPgn(opening.pgn);
    } catch {
        return {
            store: working,
            repertoire,
            lastNodeId: repertoire.rootNodeId
        };
    }
    const verbose = board.history({ verbose: true }).map(move => ({ move }));
    const merged = mergeVerboseMoves(working, repertoire.id, verbose);
    return {
        store: merged.store,
        repertoire,
        lastNodeId: merged.lastNodeId || repertoire.rootNodeId
    };
}

export function importPgnLines(
    previous: RepertoireStore,
    name: string,
    side: RepertoireSide,
    lines: ImportedPgnLine[]
) {
    const created = createRepertoire(previous, name, side);
    let store = created.store;
    for (const line of lines) {
        store = mergeSanLine(store, created.repertoire.id, line).store;
    }
    return {
        store,
        repertoire: created.repertoire,
        importedLines: lines.length
    };
}

export function importBackupStore(
    previous: RepertoireStore,
    content: string,
    importedSuffix: string
): ImportResult {
    let source: RepertoireStore;
    try {
        source = JSON.parse(content) as RepertoireStore;
    } catch {
        return { ok: false };
    }
    if (!validateStore(source)) return { ok: false };

    const next: RepertoireStore = {
        version: 1,
        repertoires: { ...previous.repertoires },
        nodes: { ...previous.nodes }
    };
    let count = 0;

    for (const repertoire of Object.values(source.repertoires)) {
        if (!source.nodes[repertoire.rootNodeId]) continue;
        const oldIds = descendants(source, repertoire.rootNodeId);
        const idMap = new Map<string, string>();
        oldIds.forEach(id => idMap.set(id, newId()));
        const repertoireId = newId();

        for (const oldId of oldIds) {
            const node = source.nodes[oldId];
            const id = idMap.get(oldId);
            if (!node || !id) continue;
            next.nodes[id] = {
                ...node,
                id,
                repertoireId,
                parentId: node.parentId
                    ? idMap.get(node.parentId) || null
                    : null,
                childIds: node.childIds
                    .map(childId => idMap.get(childId))
                    .filter((childId): childId is string => Boolean(childId)),
                preferredChildId: node.preferredChildId
                    ? idMap.get(node.preferredChildId) || null
                    : null
            };
        }

        const rootNodeId = idMap.get(repertoire.rootNodeId);
        if (!rootNodeId) continue;
        const duplicateName = Object.values(next.repertoires)
            .some(item => item.name == repertoire.name && item.side == repertoire.side);
        next.repertoires[repertoireId] = {
            ...repertoire,
            id: repertoireId,
            name: duplicateName
                ? `${repertoire.name} (${importedSuffix})`
                : repertoire.name,
            rootNodeId,
            baseNodeId: repertoire.baseNodeId
                ? idMap.get(repertoire.baseNodeId) || rootNodeId
                : rootNodeId,
            updatedAt: now()
        };
        count++;
    }

    return count > 0
        ? { ok: true, count, store: next }
        : { ok: false };
}

export function serializeBackup(store: RepertoireStore) {
    return JSON.stringify(store, null, 2);
}
