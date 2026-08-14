import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import React from "react";

import { Repertoire, RepertoireNode, RepertoireStore, pathToNode } from "./repertoireStore";
import { SavedRepertoireLine, readSavedRepertoireLines } from "./savedRepertoireLines";

export interface DrillLine {
    saved: SavedRepertoireLine;
    repertoire: Repertoire;
    baseNode: RepertoireNode;
    moves: RepertoireNode[];
}

export function buildDrillLines(
    store: RepertoireStore,
    repertoireId?: string,
    mixed = false
): DrillLine[] {
    const result = Object.values(readSavedRepertoireLines().lines).flatMap(saved => {
        if (repertoireId && saved.repertoireId != repertoireId) return [];
        const repertoire = store.repertoires[saved.repertoireId];
        const endpoint = store.nodes[saved.nodeId];
        if (!repertoire || !endpoint) return [];
        const baseId = repertoire.baseNodeId && store.nodes[repertoire.baseNodeId]
            ? repertoire.baseNodeId
            : repertoire.rootNodeId;
        const baseNode = store.nodes[baseId];
        if (!baseNode) return [];
        const path = pathToNode(store, endpoint.id);
        const baseIndex = path.findIndex(node => node.id == baseId);
        if (baseIndex < 0) return [];
        const moves = path.slice(baseIndex + 1).filter(node => node.moveUci);
        return moves.length ? [{ saved, repertoire, baseNode, moves }] : [];
    });
    return mixed
        ? [...result].sort(() => Math.random() - .5)
        : result.sort((a, b) => a.saved.createdAt.localeCompare(b.saved.createdAt));
}

export function drillFen(line: DrillLine, index: number) {
    return index <= 0
        ? line.baseNode.fen
        : line.moves[Math.min(index - 1, line.moves.length - 1)].fen;
}

export function drillSquareStyles(
    fen: string,
    selected: Square | undefined,
    legalHints: boolean
): NonNullable<React.ComponentProps<typeof Chessboard>["customSquareStyles"]> {
    const result: NonNullable<React.ComponentProps<typeof Chessboard>["customSquareStyles"]> = {};
    if (!selected) return result;
    result[selected] = { boxShadow: "inset 0 0 0 4px rgba(96,151,255,.92)" };
    if (!legalHints) return result;
    const board = new Chess(fen);
    board.moves({ square: selected, verbose: true }).forEach(move => {
        result[move.to] = board.get(move.to)
            ? { boxShadow: "inset 0 0 0 5px rgba(18,24,34,.34)" }
            : { backgroundImage: "radial-gradient(circle, rgba(18,24,34,.42) 0 16%, transparent 17%)" };
    });
    return result;
}
