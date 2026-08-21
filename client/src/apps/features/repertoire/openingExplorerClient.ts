export interface OpeningExplorerMove {
    uci: string;
    san: string;
    white: number;
    draws: number;
    black: number;
}

export interface OpeningExplorerPosition {
    white: number;
    draws: number;
    black: number;
    moves: OpeningExplorerMove[];
}

const CACHE = new Map<string, Promise<OpeningExplorerPosition | null>>();

function safeNumber(value: unknown) {
    return typeof value == "number" && Number.isFinite(value) ? value : 0;
}

function normalize(payload: unknown): OpeningExplorerPosition | null {
    if (!payload || typeof payload != "object") return null;
    const source = payload as Record<string, unknown>;
    const rawMoves = Array.isArray(source.moves) ? source.moves : [];
    const moves = rawMoves.flatMap(raw => {
        if (!raw || typeof raw != "object") return [];
        const move = raw as Record<string, unknown>;
        if (typeof move.uci != "string" || typeof move.san != "string") return [];
        return [{
            uci: move.uci,
            san: move.san,
            white: safeNumber(move.white),
            draws: safeNumber(move.draws),
            black: safeNumber(move.black)
        }];
    });
    return {
        white: safeNumber(source.white),
        draws: safeNumber(source.draws),
        black: safeNumber(source.black),
        moves
    };
}

function requestUrl(fen: string) {
    const params = new URLSearchParams();
    params.set("variant", "standard");
    params.set("fen", fen);
    // The current public explorer documents these filters as comma-separated
    // values. Avoid optional numeric parameters here as they are unnecessary
    // for our use and have had compatibility changes in the public endpoint.
    params.set("speeds", "blitz,rapid,classical");
    params.set("ratings", "1600,1800,2000,2200,2500");
    return `https://explorer.lichess.ovh/lichess?${params.toString()}`;
}

export function loadOpeningPopularity(fen: string) {
    const existing = CACHE.get(fen);
    if (existing) return existing;

    const request = fetch(requestUrl(fen), {
        method: "GET",
        headers: { Accept: "application/json" }
    })
        .then(async response => {
            if (!response.ok) return null;
            return normalize(await response.json());
        })
        .catch(() => null);

    CACHE.set(fen, request);
    return request;
}

export function moveGames(move: OpeningExplorerMove | undefined) {
    return move ? move.white + move.draws + move.black : 0;
}

export function moveShare(position: OpeningExplorerPosition | null, move: OpeningExplorerMove | undefined) {
    if (!position || !move) return null;
    const total = position.white + position.draws + position.black;
    if (!total) return null;
    return moveGames(move) / total * 100;
}
