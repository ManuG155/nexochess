import { Types } from "mongoose";
import { gzipSync, gunzipSync } from "zlib";
import { Compressed, compress, decompress } from "compress-json";
import { Buffer } from "buffer";

import { SerializedAnalysedGame } from "shared/types/game/AnalysedGame";
import {
    ArchivedGame,
    ArchivedGameMetadata
} from "shared/types/game/ArchivedGame";
import { SerializedStateTreeNode } from "shared/types/game/position/StateTreeNode";
import renderStateTree from "shared/lib/stateTree/render";
import ArchivedGameModel from "@/database/models/ArchivedGame";

export async function archiveAnalysedGame(
    game: SerializedAnalysedGame,
    userId: string
): Promise<ArchivedGame> {
    const packedStateTree = JSON.stringify(
        compress(game.stateTree)
    );

    const {
        pgn: _pgn,
        stateTree: _stateTree,
        ...metadata
    } = game;

    return {
        ...metadata,
        userId,
        gzippedStateTree: gzipSync(Buffer.from(packedStateTree))
    };
}

export async function unarchiveAnalysedGame(
    archivedGame: ArchivedGame
): Promise<SerializedAnalysedGame> {
    const packedStateTree: Compressed = JSON.parse(
        gunzipSync(archivedGame.gzippedStateTree).toString()
    );

    const stateTree: SerializedStateTreeNode = decompress(packedStateTree);

    const {
        userId: _userId,
        gzippedStateTree: _gzippedStateTree,
        ...metadata
    } = archivedGame;

    return {
        ...metadata,
        pgn: renderStateTree(stateTree, archivedGame),
        stateTree
    };
}

export async function clearArchivedGames(userId: string) {
    await ArchivedGameModel.deleteMany({
        userId: new Types.ObjectId(userId)
    });
}

export function getArchivedGameMetadata<T extends ArchivedGameMetadata>(
    game: T
): ArchivedGameMetadata {
    return {
        date: game.date,
        estimatedRatings: game.estimatedRatings,
        initialPosition: game.initialPosition,
        players: game.players,
        timeControl: game.timeControl,
        variant: game.variant,
        archiveSummary: game.archiveSummary,
        archiveSource: "account"
    };
}
