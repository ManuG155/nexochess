import { useState, useEffect } from "react";
import { StatusCodes } from "http-status-codes";
import { uniqWith } from "lodash-es";

import EngineVersion from "shared/constants/EngineVersion";
import { StateTreeNode } from "shared/types/game/position/StateTreeNode";
import { isEngineLineEqual } from "shared/types/game/position/EngineLine";
import { useAltcha } from "@/apps/features/analysis/hooks/useAltcha";
import AnalysisStatus from "@analysis/constants/AnalysisStatus";
import useSettingsStore from "@/stores/SettingsStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import useAnalysisProgressStore from "@analysis/stores/AnalysisProgressStore";
import useAnalysisSessionStore from "@analysis/stores/AnalysisSessionStore";
import Engine from "@analysis/lib/engine";
import { analyseNode } from "@analysis/lib/reporter";

function useRealtimeAnalyser() {
    const executeCaptcha = useAltcha();

    const settings = useSettingsStore(state => state.settings.analysis);

    const {
        analysisSessionToken,
        analysisCaptchaError
    } = useAnalysisSessionStore();

    const {
        currentStateTreeNode,
        dispatchCurrentNodeUpdate
    } = useAnalysisBoardStore();

    const setRealtimeClassifyError = useAnalysisProgressStore(
        state => state.setRealtimeClassifyError
    );

    const [
        classifyStatus,
        setClassifyStatus
    ] = useState(AnalysisStatus.INACTIVE);

    function cancelAnalyse(errorString?: string) {
        setClassifyStatus(AnalysisStatus.INACTIVE);
        setRealtimeClassifyError(errorString);
    }

    // Reattempt classification when CAPTCHA token updates
    useEffect(() => {
        if (classifyStatus != AnalysisStatus.AWAITING_CAPTCHA) return;

        if (analysisCaptchaError) {
            return cancelAnalyse(analysisCaptchaError);
        }

        void considerRealtimeAnalyse();
    }, [
        classifyStatus,
        analysisSessionToken,
        analysisCaptchaError
    ]);

    async function ensureEngineLines(node: StateTreeNode) {
        if (node.state.engineLines.length > 0) return true;

        /*
         * Una jugada alternativa necesita comparar su evaluación con la de
         * la posición padre. Normalmente esas líneas ya proceden del análisis
         * de la partida, pero una rama creada desde una posición sin líneas
         * completas no debe quedarse cargando para siempre: calculamos la
         * referencia localmente y continuamos la clasificación.
         */
        const selectedVersion = settings.engine.version;
        const localVersion = selectedVersion == EngineVersion.LICHESS_CLOUD
            ? EngineVersion.STOCKFISH_17_LITE
            : selectedVersion;
        const engine = new Engine(localVersion);

        engine
            .setThreadCount(1)
            .setLineCount(Math.max(1, settings.engine.lines))
            .setPosition(node.state.fen);

        try {
            const lines = await engine.evaluate({
                depth: settings.engine.depth,
                // Engine.evaluate recibe milisegundos (UCI `movetime`).
                timeLimit: settings.engine.timeLimitEnabled
                    ? settings.engine.timeLimit * 1000
                    : undefined
            });

            node.state.engineLines = uniqWith(
                node.state.engineLines.concat(lines),
                isEngineLineEqual
            );
            dispatchCurrentNodeUpdate();

            return node.state.engineLines.length > 0;
        } catch {
            return false;
        } finally {
            engine.terminate();
        }
    }

    async function considerRealtimeAnalyse(
        targetNode: StateTreeNode = currentStateTreeNode
    ) {
        if (!targetNode.parent) return;

        setClassifyStatus(AnalysisStatus.EVALUATING);
        setRealtimeClassifyError();

        const parentReady = await ensureEngineLines(targetNode.parent);
        if (!parentReady) {
            return cancelAnalyse("classifiedMoveCard.insufficientLines");
        }

        const analyseNodeResult = await analyseNode(targetNode, {
            includeBrilliant: settings.classifications.included.brilliant,
            includeTheory: settings.classifications.included.theory
        });

        // If session is invalid, await a new CAPTCHA solve
        if (analyseNodeResult.status == StatusCodes.UNAUTHORIZED) {
            executeCaptcha();
            setClassifyStatus(AnalysisStatus.AWAITING_CAPTCHA);

            return;
        }

        if (!analyseNodeResult.node)
            return cancelAnalyse("classifiedMoveCard.unknownError");

        // Apply classification and deactivate classifier
        const currentState = targetNode.state;
        const analysedState = analyseNodeResult.node.state;

        currentState.classification = analysedState.classification;
        currentState.accuracy = analysedState.accuracy;
        currentState.opening = analysedState.opening;

        if (!analysedState.classification)
            return cancelAnalyse("classifiedMoveCard.unknownError");

        cancelAnalyse();
        dispatchCurrentNodeUpdate();
    }

    return considerRealtimeAnalyse;
}

export default useRealtimeAnalyser;