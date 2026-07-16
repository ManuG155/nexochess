import { useMemo } from "react";

import { Classification } from "shared/constants/Classification";
import { parseUciMove } from "shared/lib/utils/chess";
import { getTopEngineLine } from "shared/types/game/position/EngineLine";
import { classificationColours } from "@analysis/constants/classifications";
import EngineArrowType from "@analysis/constants/EngineArrowType";
import SuggestionArrow from "@analysis/components/Board/SuggestionArrow";
import useSettingsStore from "@/stores/SettingsStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import useRealtimeEngineStore from "@analysis/stores/RealtimeEngineStore";

const arrowColour = classificationColours[Classification.BEST];

function createSuggestionArrow(uciMove: string): SuggestionArrow[] {
    const move = parseUciMove(uciMove);

    return [{
        from: move.from,
        to: move.to,
        colour: arrowColour
    }];
}

function useSuggestionArrows(): SuggestionArrow[] {
    const settings = useSettingsStore(state => state.settings.analysis);

    const node = useAnalysisBoardStore(state => state.currentStateTreeNode);

    const { displayedEngineLines } = useRealtimeEngineStore();

    return useMemo(() => {
        const arrowsType = settings.engine.suggestionArrows;

        if (arrowsType == EngineArrowType.TOP_CONTINUATION) {
            const uciMove = displayedEngineLines.at(0)?.moves.at(0)?.uci;

            if (!uciMove) return [];

            return createSuggestionArrow(uciMove);
        }

        if (arrowsType == EngineArrowType.TOP_ALTERNATIVE) {
            if (!node.parent) return [];

            const previousTopUci = getTopEngineLine(
                node.parent.state.engineLines
            )?.moves.at(0)?.uci;

            if (!previousTopUci) return [];

            return createSuggestionArrow(previousTopUci);
        }

        return [];
    }, [
        node.state.fen,
        displayedEngineLines,
        settings.engine.suggestionArrows
    ]);
}

export default useSuggestionArrows;