import React from "react";

import useSettingsStore from "@/stores/SettingsStore";
import StateTreeTraverser from "@/components/chess/StateTreeTraverser";

import RealtimeEngineArea from "./RealtimeEngineArea";
import GameAnalysis from "./GameAnalysis";
import EvaluationGraphArea from "./GameReport/EvaluationGraphArea";
import CoachMoveReaction from "./CoachMoveReaction";
import * as styles from "./AnalysisPanel.module.css";

import "./NexoReview.css";

interface ReviewContentProps {
    onBackToSummary: () => void;
}

function ReviewContent({ onBackToSummary }: ReviewContentProps) {
    const analysisSettings = useSettingsStore(
        state => state.settings.analysis
    );
    const coachSettings = useSettingsStore(
        state => state.settings.coach
    );

    return (
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
                        onClick={onBackToSummary}
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
    );
}

export default ReviewContent;
