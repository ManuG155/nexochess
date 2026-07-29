import { StatusCodes } from "http-status-codes";

import {
    AnalysedGame,
    SerializedAnalysedGame
} from "shared/types/game/AnalysedGame";
import {
    ArchivedGameMetadata,
    GameArchive
} from "shared/types/game/ArchivedGame";
import { ArchiveSummary } from "shared/types/game/GameAnalysis";
import { GameResult } from "shared/constants/game/GameResult";
import {
    deserializeNode,
    getNodeChain,
    serializeNode
} from "shared/types/game/position/StateTreeNode";

import { getGameSummaryMetrics } from
    "@analysis/components/AnalysisPanel/GameSummaryPanel/summaryMetrics";
import APIResponse from "@/types/APIResponse";
import {
    deleteLocalArchivedGames,
    deleteLocalGameByFingerprint,
    getLocalArchivedGame,
    getLocalArchivedGames,
    isLocalArchiveId,
    saveLocalArchivedGame
} from "@/lib/localGameArchive";

function getResultNotation(game: AnalysedGame): ArchiveSummary["result"] {
    const whiteResult = game.players.white.result;

    if (whiteResult == GameResult.WIN) return "1-0";
    if (whiteResult == GameResult.LOSE) return "0-1";
    if (whiteResult == GameResult.DRAW) return "1/2-1/2";

    return "*";
}

function getFingerprintInput(game: AnalysedGame) {
    const moves = getNodeChain(game.stateTree)
        .slice(1)
        .map(node => node.state.move?.uci || node.state.move?.san || "")
        .join(" ");

    const white = game.players.white.username?.trim().toLowerCase() || "";
    const black = game.players.black.username?.trim().toLowerCase() || "";
    const date = game.date || "";

    return [
        game.initialPosition,
        white,
        black,
        date,
        game.players.white.rating?.toString() || "",
        game.players.black.rating?.toString() || "",
        game.timeControl || "",
        getResultNotation(game),
        moves
    ].join("|");
}

function fallbackHash(value: string) {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index++) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(16).padStart(8, "0");
}

async function getGameFingerprint(game: AnalysedGame) {
    const value = getFingerprintInput(game);

    if (globalThis.crypto?.subtle) {
        const digest = await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(value)
        );

        return Array.from(new Uint8Array(digest))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("")
            .slice(0, 32);
    }

    return fallbackHash(value);
}

async function prepareArchivedGame(game: AnalysedGame) {
    const chain = getNodeChain(game.stateTree);
    const finalNode = chain.at(-1) || game.stateTree;
    const metrics = getGameSummaryMetrics(game);
    const fingerprint = await getGameFingerprint(game);

    const opening = chain
        .map(node => node.state.opening)
        .filter((name): name is string => Boolean(name))
        .at(-1);

    const archiveSummary: ArchiveSummary = {
        fingerprint,
        savedAt: new Date().toISOString(),
        finalPosition: finalNode.state.fen,
        opening,
        moveCount: Math.ceil(Math.max(0, chain.length - 1) / 2),
        result: getResultNotation(game),
        white: {
            accuracy: metrics.white.accuracy,
            ratingChange: game.players.white.ratingChange
        },
        black: {
            accuracy: metrics.black.accuracy,
            ratingChange: game.players.black.ratingChange
        }
    };

    const gameWithSummary: AnalysedGame = {
        ...game,
        archiveSummary
    };

    const serializedGame: SerializedAnalysedGame = {
        ...gameWithSummary,
        stateTree: serializeNode(gameWithSummary.stateTree)
    };

    const metadata: ArchivedGameMetadata = {
        date: gameWithSummary.date,
        estimatedRatings: gameWithSummary.estimatedRatings,
        initialPosition: gameWithSummary.initialPosition,
        players: gameWithSummary.players,
        timeControl: gameWithSummary.timeControl,
        variant: gameWithSummary.variant,
        archiveSummary
    };

    return {
        fingerprint,
        serializedGame,
        metadata
    };
}

function annotateAccountArchive(archive: GameArchive): GameArchive {
    return Object.fromEntries(
        Object.entries(archive).map(([id, game]) => [
            id,
            {
                ...game,
                archiveSource: "account"
            }
        ])
    );
}

function mergeArchives(
    accountArchive: GameArchive,
    localArchive: GameArchive
) {
    const accountFingerprints = new Set(
        Object.values(accountArchive)
            .map(game => game.archiveSummary?.fingerprint)
            .filter((value): value is string => Boolean(value))
    );

    const uniqueLocalArchive = Object.fromEntries(
        Object.entries(localArchive).filter(([, game]) => {
            const fingerprint = game.archiveSummary?.fingerprint;
            return !fingerprint || !accountFingerprints.has(fingerprint);
        })
    );

    return {
        ...accountArchive,
        ...uniqueLocalArchive
    };
}

export async function getArchivedGames(): APIResponse<{ games: GameArchive }> {
    const localArchive = await getLocalArchivedGames();

    try {
        const response = await fetch("/api/analysis/archive");

        if (response.ok) {
            const accountArchive = annotateAccountArchive(
                await response.json() as GameArchive
            );

            return {
                status: StatusCodes.OK,
                games: mergeArchives(accountArchive, localArchive)
            };
        }

        if (response.status == StatusCodes.UNAUTHORIZED) {
            return {
                status: StatusCodes.OK,
                games: localArchive
            };
        }

        if (Object.keys(localArchive).length > 0) {
            return {
                status: StatusCodes.OK,
                games: localArchive
            };
        }

        return { status: response.status as StatusCodes };
    } catch {
        return Object.keys(localArchive).length > 0
            ? { status: StatusCodes.OK, games: localArchive }
            : { status: StatusCodes.SERVICE_UNAVAILABLE };
    }
}

export async function getArchivedGame(
    gameId: string
): APIResponse<{ game: AnalysedGame }> {
    if (isLocalArchiveId(gameId)) {
        const serializedGame = await getLocalArchivedGame(gameId);

        if (!serializedGame) {
            return { status: StatusCodes.NOT_FOUND };
        }

        return {
            status: StatusCodes.OK,
            game: {
                ...serializedGame,
                stateTree: deserializeNode(serializedGame.stateTree)
            }
        };
    }

    const response = await fetch(`/api/public/archived-game?id=${gameId}`);

    if (!response.ok) return { status: response.status as StatusCodes };

    const serializedGame: SerializedAnalysedGame = await response.json();

    const game: AnalysedGame = {
        ...serializedGame,
        stateTree: deserializeNode(serializedGame.stateTree)
    };

    return { status: response.status as StatusCodes, game };
}

export async function archiveGame(
    game: AnalysedGame,
    gameId?: string
): APIResponse<{ id: string }> {
    const {
        fingerprint,
        serializedGame,
        metadata
    } = await prepareArchivedGame(game);

    const accountGameId = gameId && !isLocalArchiveId(gameId)
        ? gameId
        : undefined;

    const url = accountGameId
        ? `/api/analysis/archive/add?id=${accountGameId}`
        : "/api/analysis/archive/add";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(serializedGame)
        });

        if (response.ok) {
            await deleteLocalGameByFingerprint(fingerprint);

            return {
                status: response.status as StatusCodes,
                id: await response.text()
            };
        }
    } catch {
        // A local archive is the reliable fallback for offline/guest use.
    }

    const localId = await saveLocalArchivedGame(
        serializedGame,
        metadata,
        fingerprint
    );

    return {
        status: StatusCodes.OK,
        id: localId
    };
}

export async function deleteArchivedGames(
    gameIds: string[]
): APIResponse {
    const localIds = gameIds.filter(isLocalArchiveId);
    const accountIds = gameIds.filter(id => !isLocalArchiveId(id));

    await deleteLocalArchivedGames(localIds);

    if (accountIds.length == 0) {
        return { status: StatusCodes.OK };
    }

    const response = await fetch("/api/analysis/archive/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountIds)
    });

    return { status: response.status as StatusCodes };
}
