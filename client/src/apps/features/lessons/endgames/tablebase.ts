import type {
    CoarseOutcome,
    TablebaseCategory,
    TablebaseProbe
} from "./types";

const TABLEBASE_ENDPOINT = "https://tablebase.lichess.ovh/standard";
const REQUEST_TIMEOUT_MS = 10_000;
const RATE_LIMIT_COOLDOWN_MS = 60_000;

const cache = new Map<string, Promise<TablebaseProbe>>();
let requestQueue: Promise<void> = Promise.resolve();
let blockedUntil = 0;

export class TablebaseError extends Error {
    code: "unsupported" | "rate-limit" | "network" | "invalid";

    constructor(
        code: TablebaseError["code"],
        message: string
    ) {
        super(message);
        this.code = code;
    }
}

export function countPieces(fen: string) {
    const board = fen.split(" ")[0] || "";
    return [...board].filter(char => /[prnbqk]/i.test(char)).length;
}

export function supportsTablebase(fen: string) {
    const count = countPieces(fen);
    return count >= 2 && count <= 7;
}

export function categoryOutcome(category: TablebaseCategory): CoarseOutcome {
    if (category == "win") return "win";
    if (category == "loss") return "loss";

    /*
     * Syzygy categories affected by the fifty-move rule are treated
     * conservatively as draw for pedagogy. NexoChess should never promise a
     * mathematically forced win when the API itself marks the result as
     * rule-dependent or rounded.
     */
    return "draw";
}

export function invertOutcome(outcome: CoarseOutcome): CoarseOutcome {
    if (outcome == "win") return "loss";
    if (outcome == "loss") return "win";
    return "draw";
}

export function outcomeRank(outcome: CoarseOutcome) {
    if (outcome == "win") return 2;
    if (outcome == "draw") return 1;
    return 0;
}

async function queuedFetch(fen: string): Promise<TablebaseProbe> {
    let release!: () => void;
    const previous = requestQueue;
    requestQueue = new Promise<void>(resolve => {
        release = resolve;
    });

    await previous;

    try {
        if (!supportsTablebase(fen)) {
            throw new TablebaseError(
                "unsupported",
                "Exact tablebase feedback is available for positions with seven pieces or fewer."
            );
        }

        if (Date.now() < blockedUntil) {
            throw new TablebaseError(
                "rate-limit",
                "The exact tablebase is cooling down after a rate limit."
            );
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(
            () => controller.abort(),
            REQUEST_TIMEOUT_MS
        );

        try {
            const response = await fetch(
                `${TABLEBASE_ENDPOINT}?fen=${encodeURIComponent(fen)}`,
                {
                    method: "GET",
                    signal: controller.signal,
                    headers: { Accept: "application/json" }
                }
            );

            if (response.status == 429) {
                blockedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
                throw new TablebaseError(
                    "rate-limit",
                    "The exact tablebase has temporarily rate-limited requests."
                );
            }

            if (response.status == 400 || response.status == 404) {
                throw new TablebaseError(
                    "invalid",
                    "This position cannot be probed by the exact tablebase."
                );
            }

            if (!response.ok) {
                throw new TablebaseError(
                    "network",
                    `Tablebase request failed (${response.status}).`
                );
            }

            return await response.json() as TablebaseProbe;
        } catch (error) {
            if (error instanceof TablebaseError) throw error;
            throw new TablebaseError(
                "network",
                "The exact tablebase is temporarily unavailable."
            );
        } finally {
            window.clearTimeout(timeout);
        }
    } finally {
        release();
    }
}

export function probeTablebase(fen: string) {
    const key = fen.trim();
    const cached = cache.get(key);
    if (cached) return cached;

    const request = queuedFetch(key).catch(error => {
        cache.delete(key);
        throw error;
    });
    cache.set(key, request);
    return request;
}
