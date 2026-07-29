import { SerializedAnalysedGame } from "shared/types/game/AnalysedGame";
import {
    ArchivedGameMetadata,
    GameArchive
} from "shared/types/game/ArchivedGame";

const DATABASE_NAME = "nexochess";
const DATABASE_VERSION = 1;
const STORE_NAME = "gameArchive";

export const LOCAL_ARCHIVE_ID_PREFIX = "local-";

interface LocalArchivedGameRecord {
    id: string;
    fingerprint: string;
    game: SerializedAnalysedGame;
    metadata: ArchivedGameMetadata;
}

function openArchiveDatabase() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(
            DATABASE_NAME,
            DATABASE_VERSION
        );

        request.onupgradeneeded = () => {
            const database = request.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(
                    STORE_NAME,
                    { keyPath: "id" }
                );

                store.createIndex(
                    "fingerprint",
                    "fingerprint",
                    { unique: true }
                );
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function useStore<T>(
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore) => IDBRequest<T>
) {
    const database = await openArchiveDatabase();

    try {
        return await new Promise<T>((resolve, reject) => {
            const transaction = database.transaction(
                STORE_NAME,
                mode
            );

            const request = action(
                transaction.objectStore(STORE_NAME)
            );

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            transaction.onerror = () => reject(transaction.error);
        });
    } finally {
        database.close();
    }
}

export function isLocalArchiveId(gameId?: string | null) {
    return Boolean(gameId?.startsWith(LOCAL_ARCHIVE_ID_PREFIX));
}

export async function getLocalArchivedGames(): Promise<GameArchive> {
    if (typeof indexedDB == "undefined") return {};

    try {
        const records = await useStore<LocalArchivedGameRecord[]>(
            "readonly",
            store => store.getAll()
        );

        return Object.fromEntries(
            records.map(record => [
                record.id,
                {
                    ...record.metadata,
                    archiveSource: "local"
                }
            ])
        );
    } catch (error) {
        console.warn("Unable to read the local NexoChess archive.", error);
        return {};
    }
}

export async function getLocalArchivedGame(
    gameId: string
): Promise<SerializedAnalysedGame | undefined> {
    if (typeof indexedDB == "undefined") return;

    try {
        const record = await useStore<LocalArchivedGameRecord | undefined>(
            "readonly",
            store => store.get(gameId)
        );

        return record?.game;
    } catch (error) {
        console.warn("Unable to open this local NexoChess game.", error);
    }
}

export async function saveLocalArchivedGame(
    game: SerializedAnalysedGame,
    metadata: ArchivedGameMetadata,
    fingerprint: string
) {
    const id = `${LOCAL_ARCHIVE_ID_PREFIX}${fingerprint}`;

    if (typeof indexedDB == "undefined") return id;

    const record: LocalArchivedGameRecord = {
        id,
        fingerprint,
        game,
        metadata: {
            ...metadata,
            archiveSource: "local"
        }
    };

    try {
        await useStore<IDBValidKey>(
            "readwrite",
            store => store.put(record)
        );
    } catch (error) {
        console.warn("Unable to save this game in the local archive.", error);
    }

    return id;
}

export async function deleteLocalArchivedGames(gameIds: string[]) {
    if (typeof indexedDB == "undefined") return;

    const localIds = gameIds.filter(isLocalArchiveId);

    await Promise.all(localIds.map(async id => {
        try {
            await useStore<undefined>(
                "readwrite",
                store => store.delete(id)
            );
        } catch (error) {
            console.warn("Unable to delete a local archived game.", error);
        }
    }));
}

export async function clearLocalArchive() {
    if (typeof indexedDB == "undefined") return;

    const games = await getLocalArchivedGames();
    await deleteLocalArchivedGames(Object.keys(games));
}

export async function deleteLocalGameByFingerprint(
    fingerprint: string
) {
    return deleteLocalArchivedGames([
        `${LOCAL_ARCHIVE_ID_PREFIX}${fingerprint}`
    ]);
}
