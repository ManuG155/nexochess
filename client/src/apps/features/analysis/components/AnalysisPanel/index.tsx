import React, {
    lazy,
    Suspense,
    useEffect,
    useState
} from "react";

import useAnalysisGameStore from
    "@analysis/stores/AnalysisGameStore";

import useAnalysisBoardStore from
    "@analysis/stores/AnalysisBoardStore";

import GameSelection from
    "./GameSelection";

import AnalysisPanelProps from
    "./AnalysisPanelProps";

import * as styles from
    "./AnalysisPanel.module.css";

const loadGameSummaryPanel = () => import("./GameSummaryPanel");
const loadReviewContent = () => import("./ReviewContent");

const GameSummaryPanel = lazy(loadGameSummaryPanel);
const ReviewContent = lazy(loadReviewContent);


type SidePanelMode =
    | "summary"
    | "review";


function AnalysisPanel({
    className,
    style,
    onModeChange
}: AnalysisPanelProps) {
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

    const reviewRequested = new URLSearchParams(
        window.location.search
    ).get("review") == "1";

    const [
        sidePanelMode,
        setSidePanelMode
    ] = useState<SidePanelMode>(
        reviewRequested ? "review" : "summary"
    );

    useEffect(() => {
        if (!gameAnalysisOpen) {
            setSidePanelMode(
                reviewRequested ? "review" : "summary"
            );
            return;
        }

        // These panels are not needed on the landing screen. Fetch them only
        // after a game has been opened so the initial Analysis bundle can stay
        // focused on game selection and the board preview.
        void loadGameSummaryPanel();
        void loadReviewContent();

        if (reviewRequested) {
            setSidePanelMode("review");
        }
    }, [gameAnalysisOpen, reviewRequested]);

    useEffect(() => {
        onModeChange?.(sidePanelMode);
    }, [onModeChange, sidePanelMode]);

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
                "nexo-analysis-panel",
                !gameAnalysisOpen
                    ? styles.gameSelectionMode
                    : "",
                className
            ].filter(Boolean).join(" ")}
            data-analysis-panel-mode={sidePanelMode}
            style={style}
        >
            <div
                className={[
                    styles.components,
                    "nexo-analysis-components",
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
                    <Suspense fallback={null}>
                        <div className="nexo-mobile-summary-shell">
                            <GameSummaryPanel
                                onStartReview={startReview}
                            />
                        </div>
                    </Suspense>
                )}

                {reviewOpen && (
                    <Suspense fallback={null}>
                        <ReviewContent
                            onBackToSummary={backToSummary}
                        />
                    </Suspense>
                )}
            </div>
        </div>
    );
}


export default AnalysisPanel;
