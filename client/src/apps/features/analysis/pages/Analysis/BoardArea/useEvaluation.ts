import { useEffect, useState } from "react";

import { defaultEvaluation } from "shared/constants/utils";
import useAnalysisGameStore from "@analysis/stores/AnalysisGameStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import useRealtimeEngineStore from "@analysis/stores/RealtimeEngineStore";
import useSettingsStore from "@/stores/SettingsStore";

function useEvaluation() {
    const engineEnabled = useSettingsStore(
        state => state.settings.analysis.engine.enabled
    );

    const gameAnalysisOpen = useAnalysisGameStore(
        state => state.gameAnalysisOpen
    );

    const displayedEngineLines = useRealtimeEngineStore(
        state => state.displayedEngineLines
    );

    const currentStateTreeNode = useAnalysisBoardStore(
        state => state.currentStateTreeNode
    );

    const currentStateTreeNodeUpdate = useAnalysisBoardStore(
        state => state.currentStateTreeNodeUpdate
    );

    const [ evaluation, setEvaluation ] = useState(defaultEvaluation);

    useEffect(() => {
        /*
         * Mientras el motor en tiempo real está calculando, su primera línea
         * es la fuente más reciente. En el resumen y durante la revisión ese
         * motor puede no estar montado; en ese caso usamos la evaluación que
         * ya quedó guardada en la posición analizada.
         */
        const realtimeEvaluation =
            displayedEngineLines.at(0)?.evaluation;
        const storedEvaluation =
            currentStateTreeNode.state.engineLines.at(0)?.evaluation;

        if (realtimeEvaluation) {
            setEvaluation(realtimeEvaluation);
            return;
        }

        if (storedEvaluation) {
            setEvaluation(storedEvaluation);
            return;
        }

        setEvaluation(defaultEvaluation);
    }, [
        currentStateTreeNode,
        currentStateTreeNodeUpdate,
        displayedEngineLines,
        gameAnalysisOpen
    ]);

    return engineEnabled ? evaluation : undefined;
}

export default useEvaluation;
