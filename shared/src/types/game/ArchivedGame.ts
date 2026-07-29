import AnalysedGame from "./AnalysedGame";

export type ArchiveStorage = "account" | "local";

export type ArchivedGameMetadata = (
    Omit<AnalysedGame, "stateTree" | "pgn">
    & {
        archiveSource?: ArchiveStorage;
    }
);

export type ArchivedGame = (
    Omit<ArchivedGameMetadata, "archiveSource">
    & {
        userId: string;
        gzippedStateTree: Buffer;
    }
);

export type GameArchive = Record<string, ArchivedGameMetadata>;
