import { create } from "zustand";

import { EngineLine } from "shared/types/game/position/EngineLine";

interface RealtimeEngineStore {
    displayedPositionFen?: string;
    displayedEngineLines: EngineLine[];

    setDisplayedEngineLines: (
        positionFen: string,
        lines: EngineLine[]
    ) => void;
}

const useRealtimeEngineStore = create<RealtimeEngineStore>(set => ({
    displayedPositionFen: undefined,
    displayedEngineLines: [],

    setDisplayedEngineLines(positionFen, lines) {
        set({
            displayedPositionFen: positionFen,
            displayedEngineLines: lines
        });
    }
}));

export default useRealtimeEngineStore;