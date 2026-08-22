import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { StateTreeNode } from "shared/types/game/position/StateTreeNode";

import useSettingsStore from "@/stores/SettingsStore";
import StateTreeTraverser from "@/components/chess/StateTreeTraverser";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";

import RealtimeEngineArea from "./RealtimeEngineArea";
import GameAnalysis from "./GameAnalysis";
import EvaluationGraphArea from "./GameReport/EvaluationGraphArea";
import CoachMoveReaction from "./CoachMoveReaction";
import GameConclusions from "./GameConclusions";
import * as styles from "./AnalysisPanel.module.css";

import "./NexoReview.css";

interface ReviewContentProps {
    onBackToSummary: () => void;
}

type ReviewSubview = "review" | "conclusions";

const tabCopy: Record<string, { review: string; conclusions: string }> = {
    en: { review: "Review", conclusions: "Conclusions" },
    es: { review: "Revisión", conclusions: "Conclusiones" },
    fr: { review: "Révision", conclusions: "Conclusions" },
    de: { review: "Analyse", conclusions: "Fazit" },
    pt: { review: "Revisão", conclusions: "Conclusões" },
    ru: { review: "Разбор", conclusions: "Выводы" },
    zh: { review: "复盘", conclusions: "结论" },
    vi: { review: "Xem lại", conclusions: "Kết luận" },
    hi: { review: "समीक्षा", conclusions: "निष्कर्ष" },
    mr: { review: "आढावा", conclusions: "निष्कर्ष" },
    pl: { review: "Analiza", conclusions: "Wnioski" }
};

function getTabCopy(language?: string) {
    const key = (language || "en").toLowerCase().split("-")[0];
    return tabCopy[key] || tabCopy.en;
}

function ReviewContent({ onBackToSummary }: ReviewContentProps) {
    const { i18n } = useTranslation();
    const analysisSettings = useSettingsStore(
        state => state.settings.analysis
    );
    const coachSettings = useSettingsStore(
        state => state.settings.coach
    );
    const setCurrentStateTreeNode = useAnalysisBoardStore(
        state => state.setCurrentStateTreeNode
    );
    const setAutoplayEnabled = useAnalysisBoardStore(
        state => state.setAutoplayEnabled
    );

    const [subview, setSubview] = useState<ReviewSubview>("review");
    const tabs = getTabCopy(i18n.language);

    function openConclusionPosition(node: StateTreeNode) {
        setAutoplayEnabled(false);
        setCurrentStateTreeNode(node);
        setSubview("review");
    }

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
                    !coachSettings.enabled && subview == "review"
                        ? styles.reviewScrollAreaWithoutCoach
                        : "",
                    subview == "conclusions"
                        ? styles.reviewScrollAreaConclusions
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

                    <div
                        className={styles.reviewSubviewTabs}
                        role="tablist"
                        aria-label={tabs.review}
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={subview == "review"}
                            className={[
                                styles.reviewSubviewTab,
                                subview == "review"
                                    ? styles.reviewSubviewTabActive
                                    : ""
                            ].filter(Boolean).join(" ")}
                            onClick={() => setSubview("review")}
                        >
                            {tabs.review}
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={subview == "conclusions"}
                            className={[
                                styles.reviewSubviewTab,
                                subview == "conclusions"
                                    ? styles.reviewSubviewTabActive
                                    : ""
                            ].filter(Boolean).join(" ")}
                            onClick={() => setSubview("conclusions")}
                        >
                            {tabs.conclusions}
                        </button>
                    </div>
                </div>

                {subview == "review" ? (
                    <>
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
                    </>
                ) : (
                    <GameConclusions
                        onSelectNode={openConclusionPosition}
                    />
                )}
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
