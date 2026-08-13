import { Chess, Move } from "chess.js";

import Engine, { EngineLine } from "@analysis/lib/engine";
import EngineVersion from "shared/constants/EngineVersion";
import { Classification } from "shared/constants/Classification";

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

let engine: Engine | undefined;
let readyPromise: Promise<void> | undefined;
let readyResolve: (() => void) | undefined;
let serial = Promise.resolve();

function ensureEngine() {
    if (engine) return { engine, ready: readyPromise || Promise.resolve() };
    readyPromise = new Promise<void>(resolve => { readyResolve = resolve; });
    engine = new Engine({
        engine: EngineVersion.STOCKFISH_17_LITE,
        threads: 1,
        hash: 32,
        depth: 15,
        searchTime: 950,
        lines: 1,
        useNNUE: true
    }, () => {
        readyResolve?.();
        readyResolve = undefined;
    });
    return { engine, ready: readyPromise };
}

function evaluate(fen: string) {
    const run = async () => {
        const instance = ensureEngine();
        await instance.ready;
        return new Promise<EngineLine>((resolve, reject) => {
            let settled = false;
            const timeout = window.setTimeout(() => {
                if (settled) return;
                settled = true;
                instance.engine.stopEvaluation();
                reject(new Error("engine-timeout"));
            }, 6500);
            instance.engine.evaluatePosition(fen, () => undefined, lines => {
                if (settled) return;
                settled = true;
                window.clearTimeout(timeout);
                const line = lines[0];
                if (!line) reject(new Error("engine-no-line"));
                else resolve(line);
            });
        });
    };
    const result = serial.then(run, run);
    serial = result.then(() => undefined, () => undefined);
    return result;
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
    return Math.max(0, mover == "w" ? candidateScore - bestScore : bestScore - candidateScore);
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
    const pvUci = line.pv.slice(0, 8);
    const pvSan = pvToSan(fen, pvUci, 8);
    if (!pvUci[0] || !pvSan[0]) throw new Error("engine-no-line");
    return {
        fen,
        bestUci: pvUci[0],
        bestSan: pvSan[0],
        pvUci,
        pvSan,
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
