export interface SavedRepertoireLine {
    id: string;
    repertoireId: string;
    nodeId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface SavedRepertoireLineStore {
    version: 1;
    lines: Record<string, SavedRepertoireLine>;
}

const STORAGE_KEY = "nexochess.repertoire.saved-lines.v1";

function id() {
    if (typeof crypto != "undefined" && typeof crypto.randomUUID == "function") {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyStore(): SavedRepertoireLineStore {
    return { version: 1, lines: {} };
}

export function readSavedRepertoireLines(): SavedRepertoireLineStore {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return emptyStore();
        const parsed = JSON.parse(raw) as Partial<SavedRepertoireLineStore>;
        if (parsed.version != 1 || !parsed.lines || typeof parsed.lines != "object") {
            return emptyStore();
        }
        return parsed as SavedRepertoireLineStore;
    } catch {
        return emptyStore();
    }
}

export function writeSavedRepertoireLines(store: SavedRepertoireLineStore) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function linesForRepertoire(
    store: SavedRepertoireLineStore,
    repertoireId: string
) {
    return Object.values(store.lines)
        .filter(line => line.repertoireId == repertoireId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function upsertSavedRepertoireLine(
    previous: SavedRepertoireLineStore,
    input: { repertoireId: string; nodeId: string; name: string }
) {
    const existing = Object.values(previous.lines).find(line => (
        line.repertoireId == input.repertoireId && line.nodeId == input.nodeId
    ));
    const timestamp = new Date().toISOString();
    const line: SavedRepertoireLine = existing
        ? {
            ...existing,
            name: input.name.trim(),
            updatedAt: timestamp
        }
        : {
            id: id(),
            repertoireId: input.repertoireId,
            nodeId: input.nodeId,
            name: input.name.trim(),
            createdAt: timestamp,
            updatedAt: timestamp
        };
    return {
        version: 1 as const,
        lines: {
            ...previous.lines,
            [line.id]: line
        }
    };
}

export function deleteSavedRepertoireLine(
    previous: SavedRepertoireLineStore,
    lineId: string
) {
    const lines = { ...previous.lines };
    delete lines[lineId];
    return { version: 1 as const, lines };
}
