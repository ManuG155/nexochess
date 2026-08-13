import type {
    Repertoire,
    RepertoireNode,
    RepertoireStore
} from "./repertoireStore";
import { newId, now, pathToNode } from "./repertoireStore";

export interface RepertoireSavedLine {
    id: string;
    name: string;
    nodeId: string;
    baseNodeId: string;
    createdAt: string;
    updatedAt: string;
}

declare module "./repertoireStore" {
    interface Repertoire {
        savedLines?: RepertoireSavedLine[];
    }
}

export function getSavedLines(repertoire?: Repertoire) {
    return repertoire?.savedLines || [];
}

export function pathFromBase(
    store: RepertoireStore,
    nodeId: string,
    baseNodeId: string
): RepertoireNode[] {
    const path = pathToNode(store, nodeId);
    const baseIndex = path.findIndex(node => node.id == baseNodeId);
    return baseIndex < 0 ? [] : path.slice(baseIndex + 1);
}

export function canSaveLine(
    store: RepertoireStore,
    nodeId: string,
    baseNodeId: string
) {
    return nodeId != baseNodeId
        && pathFromBase(store, nodeId, baseNodeId).length > 0;
}

function formatMove(node: RepertoireNode) {
    if (!node.moveSan) return "";
    const moveNumber = Math.ceil(node.ply / 2);
    return node.ply % 2 == 1
        ? `${moveNumber}. ${node.moveSan}`
        : `${moveNumber}... ${node.moveSan}`;
}

export function describeSavedLine(
    store: RepertoireStore,
    nodeId: string,
    baseNodeId: string
) {
    return pathFromBase(store, nodeId, baseNodeId)
        .map(formatMove)
        .filter(Boolean)
        .join(" ");
}

export function suggestSavedLineName(
    store: RepertoireStore,
    repertoire: Repertoire,
    nodeId: string,
    baseNodeId: string
) {
    const moves = pathFromBase(store, nodeId, baseNodeId)
        .slice(0, 4)
        .map(formatMove)
        .filter(Boolean)
        .join(" ");
    return moves ? `${repertoire.name} · ${moves}` : repertoire.name;
}

export function upsertSavedLine(
    previous: RepertoireStore,
    repertoireId: string,
    input: { name: string; nodeId: string; baseNodeId: string }
) {
    const repertoire = previous.repertoires[repertoireId];
    if (!repertoire) return previous;
    const timestamp = now();
    const existing = getSavedLines(repertoire)
        .find(line => line.nodeId == input.nodeId);
    const line: RepertoireSavedLine = existing
        ? {
            ...existing,
            name: input.name,
            baseNodeId: input.baseNodeId,
            updatedAt: timestamp
        }
        : {
            id: newId(),
            name: input.name,
            nodeId: input.nodeId,
            baseNodeId: input.baseNodeId,
            createdAt: timestamp,
            updatedAt: timestamp
        };
    const savedLines = existing
        ? getSavedLines(repertoire).map(item => item.id == existing.id ? line : item)
        : [...getSavedLines(repertoire), line];

    return {
        ...previous,
        repertoires: {
            ...previous.repertoires,
            [repertoireId]: {
                ...repertoire,
                savedLines,
                updatedAt: timestamp
            }
        }
    };
}

export function removeSavedLine(
    previous: RepertoireStore,
    repertoireId: string,
    lineId: string
) {
    const repertoire = previous.repertoires[repertoireId];
    if (!repertoire) return previous;
    return {
        ...previous,
        repertoires: {
            ...previous.repertoires,
            [repertoireId]: {
                ...repertoire,
                savedLines: getSavedLines(repertoire).filter(line => line.id != lineId),
                updatedAt: now()
            }
        }
    };
}

export function pruneSavedLines(
    repertoire: Repertoire,
    removedNodeIds: string[]
) {
    const removed = new Set(removedNodeIds);
    return getSavedLines(repertoire).filter(line => (
        !removed.has(line.nodeId) && !removed.has(line.baseNodeId)
    ));
}
