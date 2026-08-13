import { Chess } from "chess.js";

import { OpeningCatalogueEntry } from "./openingCatalogue";

export type PlayerPlatform = "chesscom" | "lichess";
export type PlayerSide = "white" | "black";

interface RecentGame {
    moves: string[];
    side: PlayerSide;
    score: number;
}

interface OpeningMatcher {
    opening: OpeningCatalogueEntry;
    moves: string[];
}

export interface PlayerOpeningStat {
    family: string;
    side: PlayerSide;
    games: number;
    wins: number;
    draws: number;
    losses: number;
    scoreRate: number;
    averageKnownMoves: number;
    priority: number;
}

export interface PlayerOpeningProfile {
    username: string;
    platform: PlayerPlatform;
    gamesAnalysed: number;
    white: PlayerOpeningStat[];
    black: PlayerOpeningStat[];
    recommendations: PlayerOpeningStat[];
}

let matcherSource: OpeningCatalogueEntry[] | undefined;
let matcherCache: OpeningMatcher[] = [];

function scoreFromChessComResult(result: string) {
    if (result == "win") return 1;
    if ([
        "agreed",
        "repetition",
        "stalemate",
        "insufficient",
        "50move",
        "timevsinsufficient"
    ].includes(result)) return 0.5;
    return 0;
}

function parsePgnMoves(pgn: string) {
    try {
        const board = new Chess();
        board.loadPgn(pgn);
        return board.history();
    } catch {
        return [];
    }
}

async function fetchChessComGames(username: string, maximum: number) {
    const archiveResponse = await fetch(
        `https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/archives`,
        { headers: { Accept: "application/json" } }
    );
    if (!archiveResponse.ok) throw new Error("player-unavailable");

    const archivePayload = await archiveResponse.json() as { archives?: string[] };
    const archives = [...(archivePayload.archives || [])].reverse();
    const result: RecentGame[] = [];
    const normalizedUsername = username.toLocaleLowerCase();

    for (const archive of archives) {
        if (result.length >= maximum) break;
        const response = await fetch(archive, {
            headers: { Accept: "application/json" }
        });
        if (!response.ok) continue;

        const payload = await response.json() as {
            games?: Array<{
                pgn?: string;
                rules?: string;
                end_time?: number;
                white?: { username?: string; result?: string };
                black?: { username?: string; result?: string };
            }>;
        };
        const games = [...(payload.games || [])]
            .filter(game => game.rules == null || game.rules == "chess")
            .sort((a, b) => (b.end_time || 0) - (a.end_time || 0));

        for (const game of games) {
            if (result.length >= maximum) break;
            if (!game.pgn) continue;
            const whiteName = game.white?.username?.toLocaleLowerCase();
            const blackName = game.black?.username?.toLocaleLowerCase();
            const side: PlayerSide | undefined = whiteName == normalizedUsername
                ? "white"
                : blackName == normalizedUsername
                    ? "black"
                    : undefined;
            if (!side) continue;

            const moves = parsePgnMoves(game.pgn);
            if (moves.length == 0) continue;
            const player = side == "white" ? game.white : game.black;
            result.push({
                moves,
                side,
                score: scoreFromChessComResult(player?.result || "")
            });
        }
    }

    if (result.length == 0) throw new Error("no-games");
    return result;
}

async function fetchLichessGames(username: string, maximum: number) {
    const url = new URL(
        `https://lichess.org/api/games/user/${encodeURIComponent(username)}`
    );
    url.searchParams.set("max", String(maximum));
    url.searchParams.set("moves", "true");
    url.searchParams.set("opening", "true");
    url.searchParams.set("sort", "dateDesc");
    url.searchParams.set("finished", "true");

    const response = await fetch(url, {
        headers: { Accept: "application/x-ndjson" }
    });
    if (!response.ok) throw new Error("player-unavailable");

    const normalizedUsername = username.toLocaleLowerCase();
    const result: RecentGame[] = [];
    for (const line of (await response.text()).split(/\r?\n/)) {
        if (!line.trim()) continue;
        let game: {
            variant?: string;
            winner?: "white" | "black";
            moves?: string;
            players?: {
                white?: { user?: { name?: string; id?: string } };
                black?: { user?: { name?: string; id?: string } };
            };
        };
        try {
            game = JSON.parse(line);
        } catch {
            continue;
        }
        if (game.variant && game.variant != "standard") continue;
        const whiteName = (
            game.players?.white?.user?.id
            || game.players?.white?.user?.name
            || ""
        ).toLocaleLowerCase();
        const blackName = (
            game.players?.black?.user?.id
            || game.players?.black?.user?.name
            || ""
        ).toLocaleLowerCase();
        const side: PlayerSide | undefined = whiteName == normalizedUsername
            ? "white"
            : blackName == normalizedUsername
                ? "black"
                : undefined;
        const moves = game.moves?.trim().split(/\s+/).filter(Boolean) || [];
        if (!side || moves.length == 0) continue;
        result.push({
            moves,
            side,
            score: game.winner == null
                ? 0.5
                : game.winner == side
                    ? 1
                    : 0
        });
    }

    if (result.length == 0) throw new Error("no-games");
    return result;
}

function buildMatchers(catalogue: OpeningCatalogueEntry[]) {
    if (matcherSource == catalogue) return matcherCache;
    matcherSource = catalogue;
    matcherCache = catalogue.flatMap(opening => {
        const moves = parsePgnMoves(opening.pgn);
        return moves.length > 0 ? [{ opening, moves }] : [];
    });
    return matcherCache;
}

function isPrefix(prefix: string[], moves: string[]) {
    if (prefix.length > moves.length) return false;
    return prefix.every((move, index) => move == moves[index]);
}

function classifyGame(game: RecentGame, matchers: OpeningMatcher[]) {
    let best: OpeningMatcher | undefined;
    for (const matcher of matchers) {
        if (best && matcher.moves.length <= best.moves.length) continue;
        if (isPrefix(matcher.moves, game.moves)) best = matcher;
    }
    return best;
}

function buildStats(games: RecentGame[], catalogue: OpeningCatalogueEntry[]) {
    const matchers = buildMatchers(catalogue);
    const groups = new Map<string, {
        family: string;
        side: PlayerSide;
        games: number;
        wins: number;
        draws: number;
        losses: number;
        points: number;
        knownPlies: number;
    }>();

    for (const game of games) {
        const match = classifyGame(game, matchers);
        const family = match?.opening.family || "Other openings";
        const key = `${game.side}|${family}`;
        const group = groups.get(key) || {
            family,
            side: game.side,
            games: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            points: 0,
            knownPlies: 0
        };
        group.games += 1;
        group.points += game.score;
        group.knownPlies += match?.moves.length || 0;
        if (game.score == 1) group.wins += 1;
        else if (game.score == 0.5) group.draws += 1;
        else group.losses += 1;
        groups.set(key, group);
    }

    return Array.from(groups.values()).map(group => {
        const scoreRate = group.games > 0 ? group.points / group.games : 0;
        const averageKnownMoves = group.games > 0
            ? Math.round((group.knownPlies / group.games / 2) * 10) / 10
            : 0;
        const priority = group.games * (1.15 - scoreRate)
            + Math.max(0, 4 - averageKnownMoves) * 0.2;
        return {
            family: group.family,
            side: group.side,
            games: group.games,
            wins: group.wins,
            draws: group.draws,
            losses: group.losses,
            scoreRate,
            averageKnownMoves,
            priority
        } satisfies PlayerOpeningStat;
    });
}

export async function analysePlayerOpenings(
    platform: PlayerPlatform,
    username: string,
    maximum: number,
    catalogue: OpeningCatalogueEntry[]
): Promise<PlayerOpeningProfile> {
    const cleanUsername = username.trim();
    if (!cleanUsername) throw new Error("invalid-username");

    const games = platform == "chesscom"
        ? await fetchChessComGames(cleanUsername, maximum)
        : await fetchLichessGames(cleanUsername, maximum);
    const stats = buildStats(games, catalogue);
    const byFrequency = (side: PlayerSide) => stats
        .filter(item => item.side == side && item.family != "Other openings")
        .sort((a, b) => b.games - a.games || a.scoreRate - b.scoreRate);
    const recommendations = stats
        .filter(item => item.family != "Other openings")
        .sort((a, b) => b.priority - a.priority || b.games - a.games)
        .slice(0, 3);

    return {
        username: cleanUsername,
        platform,
        gamesAnalysed: games.length,
        white: byFrequency("white"),
        black: byFrequency("black"),
        recommendations
    };
}
