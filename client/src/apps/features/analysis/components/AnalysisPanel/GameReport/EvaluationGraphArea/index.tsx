import React, { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { findIndex } from "lodash-es";

import { getNodeChain } from "shared/types/game/position/StateTreeNode";
import AnalysisStatus from "@analysis/constants/AnalysisStatus";
import useAnalysisGameStore from "@analysis/stores/AnalysisGameStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import useAnalysisProgressStore from "@analysis/stores/AnalysisProgressStore";
import EvaluationGraph from "@analysis/components/report/EvaluationGraph";
import playBoardSound from "@/lib/boardSounds";

function EvaluationGraphArea() {
    const analysisGame = useAnalysisGameStore(state => state.analysisGame);

    const {
        currentStateTreeNodeUpdate,
        currentStateTreeNode,
        setCurrentStateTreeNode
    } = useAnalysisBoardStore(
        useShallow(state => ({
            currentStateTreeNodeUpdate: state.currentStateTreeNodeUpdate,
            currentStateTreeNode: state.currentStateTreeNode,
            setCurrentStateTreeNode: state.setCurrentStateTreeNode
        }))
    );

    const {
        analysisStatus,
        evaluationVisibleNodeCount
    } = useAnalysisProgressStore(
        useShallow(state => ({
            analysisStatus: state.analysisStatus,
            evaluationVisibleNodeCount: state.evaluationVisibleNodeCount
        }))
    );

    const mainlineChain = useMemo(() => (
        getNodeChain(analysisGame.stateTree)
    ), [analysisGame, currentStateTreeNodeUpdate]);

    const visibleNodeCount = analysisStatus == AnalysisStatus.INACTIVE
        ? undefined
        : Math.max(1, evaluationVisibleNodeCount);

    return <EvaluationGraph
        nodes={mainlineChain}
        visibleNodeCount={visibleNodeCount}
        selectedIndex={findIndex(
            mainlineChain,
            node => node.id == currentStateTreeNode.id
        )}
        onPointClick={point => {
            if (point.y == null) return;

            const clickedNode = mainlineChain.find(
                node => node.id == point.nodeId
            );
            if (!clickedNode) return;

            setCurrentStateTreeNode(clickedNode);
            playBoardSound(clickedNode);
        }}
    />;
}

export default EvaluationGraphArea;
