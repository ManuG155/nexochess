import { Chess } from "chess.js";

export const INITIAL_DEPTH_PLIES = 8;
export const DEPTH_STEP_PLIES = 6;
const CHECKPOINT_SNAP = 2;

export interface DepthProgressLike {
    pgn: string;
    learnedPly?: number;
    availablePly?: number;
}

interface CachedPgn {
    keys: string[];
    sans: string[];
}

const PGN_CACHE = new Map<string, CachedPgn>();
const FAST_SAN_CACHE = new Map<string, string[]>();

function parsePgn(pgn: string): CachedPgn {
    const key = pgn.trim();
    const cached = PGN_CACHE.get(key);
    if (cached) return cached;
    try {
        const board = new Chess();
        board.loadPgn(key);
        const history = board.history({ verbose: true });
        const parsed = {
            keys: history.map(move => `${move.from}${move.to}${move.promotion || ""}`),
            sans: history.map(move => move.san)
        };
        PGN_CACHE.set(key, parsed);
        return parsed;
    } catch {
        const empty = { keys: [] as string[], sans: [] as string[] };
        PGN_CACHE.set(key, empty);
        return empty;
    }
}

/*
 * Catalogue PGNs are standard movetext. Building a course index or navigation
 * tree does not need legality checking, so tokenize SAN without instantiating
 * chess.js hundreds of times. Actual lessons still use the validated parser.
 */
export function fastPgnSanTokens(pgn: string) {
    const cacheKey = pgn.trim();
    const cached = FAST_SAN_CACHE.get(cacheKey);
    if (cached) return cached;

    let text = cacheKey
        .replace(/^\s*\[[^\]]*\]\s*$/gm, " ")
        .replace(/\{[^}]*\}/g, " ")
        .replace(/;[^\r\n]*/g, " ");
    // Source lines have no nested RAVs, but this safely removes simple pasted
    // variations too without making the hot catalogue path depend on chess.js.
    for (let pass = 0; pass < 4 && /\([^()]*\)/.test(text); pass += 1) {
        text = text.replace(/\([^()]*\)/g, " ");
    }

    const result = text
        .split(/\s+/)
        .map(token => token.trim())
        .filter(Boolean)
        .map(token => token.replace(/^\d+\.(?:\.\.)?/, ""))
        .filter(token => Boolean(token) && !/^\d+\.{1,3}$/.test(token))
        .filter(token => !/^\$\d+$/.test(token))
        .filter(token => !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token))
        .map(token => token.replace(/[!?]+$/g, ""))
        .filter(Boolean);

    FAST_SAN_CACHE.set(cacheKey, result);
    return result;
}

export function pgnMoveKeys(pgn: string) {
    return parsePgn(pgn).keys;
}

export function pgnSanMoves(pgn: string) {
    return parsePgn(pgn).sans;
}

export function pgnPlyCount(pgn: string) {
    return parsePgn(pgn).keys.length;
}

function snapToTheoryCheckpoint(
    desired: number,
    currentPly: number,
    totalPly: number,
    checkpoints: number[] = []
) {
    const nearby = checkpoints
        .filter(checkpoint => (
            checkpoint > currentPly
            && checkpoint <= totalPly
            && Math.abs(checkpoint - desired) <= CHECKPOINT_SNAP
        ))
        .sort((a, b) => (
            Math.abs(a - desired) - Math.abs(b - desired)
            || a - b
        ));
    return nearby[0] || Math.min(totalPly, desired);
}

export function initialDepth(totalPly: number, checkpoints: number[] = []) {
    if (totalPly <= 0) return 0;
    return snapToTheoryCheckpoint(
        Math.min(totalPly, INITIAL_DEPTH_PLIES),
        0,
        totalPly,
        checkpoints
    );
}

export function nextDepth(
    currentPly: number,
    totalPly: number,
    checkpoints: number[] = []
) {
    if (totalPly <= 0) return 0;
    if (currentPly <= 0) return initialDepth(totalPly, checkpoints);
    return snapToTheoryCheckpoint(
        Math.min(totalPly, currentPly + DEPTH_STEP_PLIES),
        currentPly,
        totalPly,
        checkpoints
    );
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

export function depthIncrementMoves(
    currentPly: number,
    totalPly: number,
    checkpoints: number[] = []
) {
    return Math.max(
        0,
        fullMoveCount(nextDepth(currentPly, totalPly, checkpoints))
            - fullMoveCount(currentPly)
    );
}

export function isMovePrefix(prefix: string[], candidate: string[]) {
    return prefix.length <= candidate.length
        && prefix.every((move, index) => candidate[index] == move);
}
