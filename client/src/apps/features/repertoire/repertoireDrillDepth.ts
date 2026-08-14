const STORAGE_KEY = "nexochess.repertoire.drill-depth.v1";

interface DrillDepthStore {
    version: 1;
    depths: Record<string, number>;
}

function readStore(): DrillDepthStore {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<DrillDepthStore> | null;
        if (!parsed || parsed.version != 1 || !parsed.depths) {
            return { version: 1, depths: {} };
        }
        return { version: 1, depths: parsed.depths };
    } catch {
        return { version: 1, depths: {} };
    }
}

export function readDrillDepth(lineId: string, totalPly: number) {
    const stored = Number(readStore().depths[lineId] || 0);
    if (!Number.isFinite(stored) || stored <= 0) return 0;
    return Math.min(totalPly, Math.max(0, stored));
}

export function writeDrillDepth(lineId: string, learnedPly: number) {
    const previous = readStore();
    const next: DrillDepthStore = {
        version: 1,
        depths: {
            ...previous.depths,
            [lineId]: Math.max(0, Math.round(learnedPly))
        }
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // Progress remains valid for the current session.
    }
}
