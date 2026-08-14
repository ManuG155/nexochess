import { Chess, Move } from "chess.js";

import Engine from "@analysis/lib/engine";
import EngineVersion from "shared/constants/EngineVersion";
import { Classification } from "shared/constants/Classification";
import { EngineLine } from "shared/types/game/position/EngineLine";

import { RepertoireStore, newId, now, positionKey } from "./repertoireStore";

export interface RepertoireEngineResult {
    fen: string;
    bestUci: string;
    bestSan: string;
    pvUci: string[];
    pvSan: string[];
    evaluation: EngineLine["evaluation"];
}

export interface RepertoireMoveQuality {
    classification: Classification;
    lossCp: number;
    evaluation: EngineLine["evaluation"];
}

const ENGINE_DEPTH = 16;
const ENGINE_MOVE_TIME_MS = 1200;
const ENGINE_HARD_TIMEOUT_MS = 5500;

function bestFinishedLine(lines: EngineLine[]) {
    return [...lines]
        .filter(line => line.index == 1 && line.moves.length > 0)
        .sort((a, b) => b.depth - a.depth)[0];
}

async function evaluate(fen: string) {
    const instance = new Engine(EngineVersion.STOCKFISH_17_LITE)
        .setLineCount(1)
        .setThreadCount(1)
        .setPosition(fen);

    let timeoutId: number | undefined;

    try {
        const lines = await Promise.race([
            instance.evaluate({
                depth: ENGINE_DEPTH,
                timeLimit: ENGINE_MOVE_TIME_MS
            }),
            new Promise<EngineLine[]>((_, reject) => {
                timeoutId = window.setTimeout(() => {
                    instance.terminate();
                    reject(new Error("repertoire-engine-timeout"));
                }, ENGINE_HARD_TIMEOUT_MS);
            })
        ]);

        const line = bestFinishedLine(lines);
        if (!line) throw new Error("engine-no-line");
        return line;
    } finally {
        if (timeoutId != undefined) window.clearTimeout(timeoutId);
        instance.terminate();
    }
}

function uciMove(board: Chess, uci: string): Move | undefined {
    if (uci.length < 4) return undefined;
    try {
        return board.move({
            from: uci.slice(0, 2),
            to: uci.slice(2, 4),
            ...(uci.length > 4 ? { promotion: uci.slice(4, 5) } : {})
        });
    } catch {
        return undefined;
    }
}

export function pvToSan(fen: string, pv: string[], maximum = 8) {
    const board = new Chess(fen);
    const result: string[] = [];
    for (const uci of pv.slice(0, maximum)) {
        const move = uciMove(board, uci);
        if (!move) break;
        result.push(move.san);
    }
    return result;
}

export function appendPvToPgn(prefixMoves: Move[], fen: string, pv: string[], maximum = 8) {
    const tailBoard = new Chess(fen);
    const tail: Move[] = [];
    for (const uci of pv.slice(0, maximum)) {
        const move = uciMove(tailBoard, uci);
        if (!move) break;
        tail.push(move);
    }
    const board = new Chess();
    for (const move of [...prefixMoves, ...tail]) {
        try {
            board.move({ from: move.from, to: move.to, ...(move.promotion ? { promotion: move.promotion } : {}) });
        } catch {
            break;
        }
    }
    return board.pgn();
}

export function appendPvToRepertoire(
    previous: RepertoireStore,
    repertoireId: string,
    startNodeId: string,
    pv: string[],
    maximum = 8
) {
    const repertoire = previous.repertoires[repertoireId];
    const start = previous.nodes[startNodeId];
    if (!repertoire || !start) return { store: previous, lastNodeId: startNodeId };

    const nodes = { ...previous.nodes };
    let current = nodes[startNodeId];
    for (const uci of pv.slice(0, maximum)) {
        const board = new Chess(current.fen);
        const move = uciMove(board, uci);
        if (!move) break;
        const normalizedUci = `${move.from}${move.to}${move.promotion || ""}`;
        const existing = current.childIds.map(id => nodes[id]).find(node => node?.moveUci == normalizedUci);
        if (existing) {
            current = existing;
            continue;
        }
        const timestamp = now();
        const childId = newId();
        nodes[current.id] = {
            ...current,
            childIds: [...current.childIds, childId],
            preferredChildId: current.preferredChildId || childId,
            updatedAt: timestamp
        };
        const child = {
            id: childId,
            repertoireId,
            parentId: current.id,
            childIds: [],
            fen: board.fen(),
            positionKey: positionKey(board.fen()),
            moveUci: normalizedUci,
            moveSan: move.san,
            ply: current.ply + 1,
            notes: "",
            preferredChildId: null,
            createdAt: timestamp,
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
                [repertoireId]: { ...repertoire, updatedAt: timestamp }
            },
            nodes
        },
        lastNodeId: current.id
    };
}

function comparableScore(evaluation: EngineLine["evaluation"]) {
    if (evaluation.type == "mate") {
        if (evaluation.value == 0) return 0;
        const magnitude = 100000 - Math.min(999, Math.abs(evaluation.value)) * 100;
        return evaluation.value > 0 ? magnitude : -magnitude;
    }
    return evaluation.value;
}

function lossForMover(fen: string, best: EngineLine["evaluation"], candidate: EngineLine["evaluation"]) {
    const mover = new Chess(fen).turn();
    const bestScore = comparableScore(best);
    const candidateScore = comparableScore(candidate);
    return Math.max(0, mover == "w" ? bestScore - candidateScore : candidateScore - bestScore);
}

function classifyLoss(lossCp: number, isBest: boolean) {
    if (isBest || lossCp <= 10) return Classification.BEST;
    if (lossCp <= 30) return Classification.EXCELLENT;
    if (lossCp <= 70) return Classification.OKAY;
    if (lossCp <= 130) return Classification.INACCURACY;
    if (lossCp <= 260) return Classification.MISTAKE;
    return Classification.BLUNDER;
}

export async function analyseRepertoirePosition(fen: string): Promise<RepertoireEngineResult> {
    const line = await evaluate(fen);
    const moves = line.moves.slice(0, 8);
    if (!moves[0]) throw new Error("engine-no-line");
    return {
        fen,
        bestUci: moves[0].uci,
        bestSan: moves[0].san,
        pvUci: moves.map(move => move.uci),
        pvSan: moves.map(move => move.san),
        evaluation: line.evaluation
    };
}

export async function evaluateRepertoireMove(
    fen: string,
    moveUci: string,
    best: RepertoireEngineResult
): Promise<RepertoireMoveQuality | undefined> {
    const board = new Chess(fen);
    const move = uciMove(board, moveUci);
    if (!move) return undefined;
    if (moveUci.slice(0, 5) == best.bestUci.slice(0, 5)) {
        return { classification: Classification.BEST, lossCp: 0, evaluation: best.evaluation };
    }
    const candidateLine = await evaluate(board.fen());
    const lossCp = Math.round(lossForMover(fen, best.evaluation, candidateLine.evaluation));
    return {
        classification: classifyLoss(lossCp, false),
        lossCp,
        evaluation: candidateLine.evaluation
    };
}
