import { useEffect, useState } from "react";

import { defaultEvaluation } from "shared/constants/utils";
import { getTopEngineLine } from "shared/types/game/position/EngineLine";
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

    const displayedPositionFen = useRealtimeEngineStore(
        state => state.displayedPositionFen
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
         * Las líneas del motor en tiempo real sólo son válidas para la FEN
         * para la que fueron calculadas. Antes se reutilizaba globalmente la
         * última línea visible, por lo que al recorrer una partida la barra
         * podía quedarse mostrando la evaluación de otra posición.
         */
        const realtimeEvaluation = displayedPositionFen
            == currentStateTreeNode.state.fen
            ? getTopEngineLine(displayedEngineLines)?.evaluation
            : undefined;

        /*
         * engineLines acumula profundidades. La primera entrada no tiene por
         * qué ser la mejor ni la más reciente, así que usamos explícitamente
         * la línea superior de mayor profundidad.
         */
        const storedEvaluation = getTopEngineLine(
            currentStateTreeNode.state.engineLines
        )?.evaluation;

        if (realtimeEvaluation) {
            setEvaluation(realtimeEvaluation);
            return;
        }

        if (storedEvaluation) {
            setEvaluation(storedEvaluation);
            return;
        }

        if (!gameAnalysisOpen) {
            setEvaluation(defaultEvaluation);
        }
        /*
         * Una variante recién creada tarda unos instantes en recibir su
         * primera línea. Durante ese intervalo conservamos la última lectura
         * en lugar de hacer parpadear la barra artificialmente a 0.0.
         */
    }, [
        currentStateTreeNode,
        currentStateTreeNodeUpdate,
        displayedEngineLines,
        displayedPositionFen,
        gameAnalysisOpen
    ]);

    return engineEnabled ? evaluation : undefined;
}

export default useEvaluation;
