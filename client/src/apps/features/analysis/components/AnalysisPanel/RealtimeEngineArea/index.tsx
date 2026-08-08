import React, { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { uniqWith } from "lodash-es";

import { getNodeParentChain } from "shared/types/game/position/StateTreeNode";
import { isEngineLineEqual } from "shared/types/game/position/EngineLine";
import useRealtimeAnalyser from "@analysis/hooks/useRealtimeAnalyser";
import useSettingsStore from "@/stores/SettingsStore";
import useAnalysisGameStore from "@analysis/stores/AnalysisGameStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import useRealtimeEngineStore from "@analysis/stores/RealtimeEngineStore";
import RealtimeEngine from "@analysis/components/RealtimeEngine";

function RealtimeEngineArea() {
    const { settings } = useSettingsStore();

    const initialPosition = useAnalysisGameStore(
        state => state.analysisGame.initialPosition
    );

    const {
        currentStateTreeNode,
        currentEngineLines,
        dispatchCurrentNodeUpdate
    } = useAnalysisBoardStore(
        useShallow(state => ({
            currentStateTreeNode: state.currentStateTreeNode,
            currentEngineLines: state.currentStateTreeNode.state.engineLines,
            dispatchCurrentNodeUpdate: state.dispatchCurrentNodeUpdate
        }))
    );

    const setDisplayedEngineLines = useRealtimeEngineStore(
        state => state.setDisplayedEngineLines
    );

    const considerRealtimeAnalyse = useRealtimeAnalyser();

    const playedUciMoves = useMemo(() => (
        getNodeParentChain(currentStateTreeNode)
            .reverse()
            .filter(node => node.state.move)
            .map(node => node.state.move!.uci)
    ), [currentStateTreeNode]);

    useEffect(() => {
        if (
            !settings.analysis.engine.enabled
            || !currentStateTreeNode.parent
            || currentStateTreeNode.state.classification
            || currentEngineLines.length == 0
        ) return;

        void considerRealtimeAnalyse(currentStateTreeNode);
    }, [
        currentStateTreeNode,
        currentEngineLines.length,
        settings.analysis.engine.enabled
    ]);

    if (!settings.analysis.engine.enabled) {
        return null;
    }

    return <RealtimeEngine
        key={currentStateTreeNode.state.fen}
        initialPosition={initialPosition}
        playedUciMoves={playedUciMoves}
        config={{
            ...settings.analysis.engine,
            timeLimit: settings.analysis.engine.timeLimitEnabled
                ? settings.analysis.engine.timeLimit
                : undefined
        }}
        cachedEngineLines={currentEngineLines}
        onEngineLines={lines => {
            setDisplayedEngineLines(
                currentStateTreeNode.state.fen,
                lines
            );
        }}
        onEvaluationComplete={lines => {
            currentStateTreeNode.state.engineLines = uniqWith(
                currentStateTreeNode.state.engineLines.concat(lines),
                isEngineLineEqual
            );

            dispatchCurrentNodeUpdate();
            void considerRealtimeAnalyse(currentStateTreeNode);
        }}
    />;
}

export default RealtimeEngineArea;
