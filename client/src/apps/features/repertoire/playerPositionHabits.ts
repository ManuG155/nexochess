import { Chess } from "chess.js";

export type HabitPlatform = "chesscom" | "lichess";
export type HabitSide = "white" | "black";

export interface HabitGame {
    moves: string[];
    side: HabitSide;
    score: number;
}

export interface PositionHabitReply {
    uci: string;
    san: string;
    count: number;
}

export interface PositionHabitMove {
    uci: string;
    san: string;
    count: number;
    wins: number;
    draws: number;
    losses: number;
    replies?: PositionHabitReply[];
}

export interface PositionHabit {
    fenKey: string;
    total: number;
    moves: PositionHabitMove[];
}

export interface PositionHabitStore {
    version: 1;
    platform: HabitPlatform;
    username: string;
    generatedAt: number;
    positions: Record<string, PositionHabit>;
}

const STORAGE_KEY = "nexochess.repertoire.position-habits.v1";
const CHANGE_EVENT = "nexochess:repertoire-position-habits";

export function positionFenKey(fen: string) {
    return fen.split(/\s+/).slice(0, 4).join(" ");
}

export function readPositionHabits(): PositionHabitStore | undefined {
    if (typeof window == "undefined") return undefined;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return undefined;
        const parsed = JSON.parse(raw) as PositionHabitStore;
        return parsed?.version == 1 && parsed.positions ? parsed : undefined;
    } catch {
        return undefined;
    }
}

export function habitAtFen(fen: string, store = readPositionHabits()) {
    return store?.positions[positionFenKey(fen)];
}

export function positionHabitChangeEvent() {
    return CHANGE_EVENT;
}

function writePositionHabits(store: PositionHabitStore) {
    if (typeof window == "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
    } catch {
        // Local persistence is optional; profiling itself must still succeed.
    }
}

function addReply(move: PositionHabitMove, boardAfterPlayerMove: Chess, san: string | undefined) {
    if (!san) return;
    const replyBoard = new Chess(boardAfterPlayerMove.fen());
    let reply;
    try {
        reply = replyBoard.move(san);
    } catch {
        return;
    }
    if (!reply) return;
    const uci = `${reply.from}${reply.to}${reply.promotion || ""}`;
    const replies = move.replies || [];
    const current = replies.find(item => item.uci == uci);
    if (current) current.count += 1;
    else replies.push({ uci, san: reply.san, count: 1 });
    move.replies = replies.sort((a, b) => b.count - a.count || a.san.localeCompare(b.san));
}

export function savePositionHabitsFromGames(
    games: HabitGame[],
    platform: HabitPlatform,
    username: string,
    maximumPlies = 24
) {
    const buckets = new Map<string, Map<string, PositionHabitMove>>();
    const totals = new Map<string, number>();

    for (const game of games) {
        const board = new Chess();
        const limit = Math.min(game.moves.length, maximumPlies);
        for (let ply = 0; ply < limit; ply += 1) {
            const san = game.moves[ply];
            const playerTurn = (game.side == "white" && board.turn() == "w")
                || (game.side == "black" && board.turn() == "b");
            const before = positionFenKey(board.fen());
            let move;
            try {
                move = board.move(san);
            } catch {
                break;
            }
            if (!move || !playerTurn) continue;

            const uci = `${move.from}${move.to}${move.promotion || ""}`;
            const moves = buckets.get(before) || new Map<string, PositionHabitMove>();
            const current = moves.get(uci) || {
                uci,
                san: move.san,
                count: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                replies: []
            };
            current.count += 1;
            if (game.score == 1) current.wins += 1;
            else if (game.score == 0.5) current.draws += 1;
            else current.losses += 1;
            if (ply + 1 < limit) addReply(current, board, game.moves[ply + 1]);
            moves.set(uci, current);
            buckets.set(before, moves);
            totals.set(before, (totals.get(before) || 0) + 1);
        }
    }

    const positions: Record<string, PositionHabit> = {};
    for (const [fenKey, moves] of buckets) {
        positions[fenKey] = {
            fenKey,
            total: totals.get(fenKey) || 0,
            moves: Array.from(moves.values()).sort((a, b) => b.count - a.count || a.san.localeCompare(b.san))
        };
    }

    writePositionHabits({
        version: 1,
        platform,
        username,
        generatedAt: Date.now(),
        positions
    });
}
