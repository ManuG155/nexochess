import { Chess } from "chess.js";

export const INITIAL_DEPTH_PLIES = 8;
export const DEPTH_STEP_PLIES = 6;

export interface DepthProgressLike {
    pgn: string;
    learnedPly?: number;
    availablePly?: number;
}

export function pgnMoveKeys(pgn: string) {
    try {
        const board = new Chess();
        board.loadPgn(pgn);
        return board.history({ verbose: true }).map(move => (
            `${move.from}${move.to}${move.promotion || ""}`
        ));
    } catch {
        return [] as string[];
    }
}

export function pgnPlyCount(pgn: string) {
    return pgnMoveKeys(pgn).length;
}

export function initialDepth(totalPly: number) {
    if (totalPly <= 0) return 0;
    return Math.min(totalPly, INITIAL_DEPTH_PLIES);
}

export function nextDepth(currentPly: number, totalPly: number) {
    if (totalPly <= 0) return 0;
    if (currentPly <= 0) return initialDepth(totalPly);
    return Math.min(totalPly, currentPly + DEPTH_STEP_PLIES);
}

export function learnedDepth(
    progress: DepthProgressLike | undefined,
    availablePly: number
) {
    if (!progress || availablePly <= 0) return 0;
    const stored = Number(progress.learnedPly);
    const fallback = pgnPlyCount(progress.pgn);
    const learned = Number.isFinite(stored) && stored > 0 ? stored : fallback;
    return Math.max(0, Math.min(availablePly, learned));
}

export function fullMoveCount(ply: number) {
    return Math.max(0, Math.ceil(ply / 2));
}

export function depthIncrementMoves(currentPly: number, totalPly: number) {
    return Math.max(
        0,
        fullMoveCount(nextDepth(currentPly, totalPly)) - fullMoveCount(currentPly)
    );
}

export function isMovePrefix(prefix: string[], candidate: string[]) {
    return prefix.length <= candidate.length
        && prefix.every((move, index) => candidate[index] == move);
}
