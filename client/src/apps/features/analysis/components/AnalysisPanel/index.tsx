import React, {
    useEffect,
    useState
} from "react";

import useSettingsStore from
    "@/stores/SettingsStore";

import useAnalysisGameStore from
    "@analysis/stores/AnalysisGameStore";

import useAnalysisBoardStore from
    "@analysis/stores/AnalysisBoardStore";

import StateTreeTraverser from
    "@/components/chess/StateTreeTraverser";

import RealtimeEngineArea from
    "./RealtimeEngineArea";

import GameSelection from
    "./GameSelection";

import GameAnalysis from
    "./GameAnalysis";

import EvaluationGraphArea from
    "./GameReport/EvaluationGraphArea";

import CoachMoveReaction from
    "./CoachMoveReaction";

import GameSummaryPanel from
    "./GameSummaryPanel";

import AnalysisPanelProps from
    "./AnalysisPanelProps";

import * as styles from
    "./AnalysisPanel.module.css";

import "./NexoReview.css";


type SidePanelMode =
    | "summary"
    | "review";


function AnalysisPanel({
    className,
    style
}: AnalysisPanelProps) {
    const analysisSettings = useSettingsStore(
        state => state.settings.analysis
    );

    const coachSettings = useSettingsStore(
        state => state.settings.coach
    );

    const analysisGame = useAnalysisGameStore(
        state => state.analysisGame
    );

    const gameAnalysisOpen = useAnalysisGameStore(
        state => state.gameAnalysisOpen
    );

    const setCurrentStateTreeNode = useAnalysisBoardStore(
        state => state.setCurrentStateTreeNode
    );

    const setAutoplayEnabled = useAnalysisBoardStore(
        state => state.setAutoplayEnabled
    );

    const [
        sidePanelMode,
        setSidePanelMode
    ] = useState<SidePanelMode>("summary");

    useEffect(() => {
        if (!gameAnalysisOpen) {
            setSidePanelMode("summary");
        }
    }, [gameAnalysisOpen]);

    function startReview() {
        setAutoplayEnabled(false);
        setCurrentStateTreeNode(analysisGame.stateTree);
        setSidePanelMode("review");
    }

    function backToSummary() {
        setAutoplayEnabled(false);
        setSidePanelMode("summary");
    }

    const reviewOpen =
        gameAnalysisOpen
        && sidePanelMode == "review";

    return (
        <div
            className={[
                styles.wrapper,
                !gameAnalysisOpen
                    ? styles.gameSelectionMode
                    : "",
                className
            ].filter(Boolean).join(" ")}
            style={style}
        >
            <div
                className={[
                    styles.components,
                    reviewOpen
                        ? "nexo-review-mode"
                        : ""
                ].filter(Boolean).join(" ")}
            >
                {!gameAnalysisOpen && (
                    <GameSelection />
                )}

                {(
                    gameAnalysisOpen
                    && sidePanelMode == "summary"
                ) && (
                    <GameSummaryPanel
                        onStartReview={startReview}
                    />
                )}

                {reviewOpen && (
                    <section
                        className={[
                            styles.reviewCard,
                            "nexo-review-card"
                        ].join(" ")}
                    >
                        <div
                            className={[
                                styles.reviewScrollArea,
                                "nexo-review-content",
                                !coachSettings.enabled
                                    ? styles.reviewScrollAreaWithoutCoach
                                    : ""
                            ].filter(Boolean).join(" ")}
                        >
                            <div
                                className={[
                                    styles.reviewHeader,
                                    "nexo-review-header"
                                ].join(" ")}
                            >
                                <button
                                    type="button"
                                    className={[
                                        styles.reviewBackButton,
                                        "nexo-review-back"
                                    ].join(" ")}
                                    onClick={backToSummary}
                                    aria-label="Volver al resumen"
                                    title="Volver al resumen"
                                >
                                    ←
                                </button>
                            </div>

                            {analysisSettings.engine.enabled && (
                                <div className="nexo-review-engine">
                                    <RealtimeEngineArea />
                                </div>
                            )}

                            {coachSettings.enabled && (
                                <div className="nexo-review-coach">
                                    <CoachMoveReaction />
                                </div>
                            )}

                            <div
                                className={[
                                    styles.reviewGraphArea,
                                    "nexo-review-graph"
                                ].join(" ")}
                            >
                                <EvaluationGraphArea />
                            </div>

                            <div
                                className={[
                                    styles.reviewMovesArea,
                                    "nexo-review-moves"
                                ].join(" ")}
                                data-review-moves-scroll="true"
                            >
                                <GameAnalysis />
                            </div>
                        </div>

                        <div
                            className={[
                                styles.traverserContainer,
                                "nexo-review-footer"
                            ].join(" ")}
                        >
                            <StateTreeTraverser
                                className={[
                                    styles.traverser,
                                    "nexo-review-traverser"
                                ].join(" ")}
                            />
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}


export default AnalysisPanel;
