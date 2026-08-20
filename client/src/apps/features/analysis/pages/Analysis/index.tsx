import React, {
    useEffect,
    useMemo,
    useState
} from "react";
import { useTranslation } from "react-i18next";

import ads from "@/constants/advertisements";
import Advertisement from "@/components/Advertisement";
import SemanticDiscoverySection from
    "@/components/SemanticDiscoverySection/SemanticDiscoverySection";
import { getSemanticDiscoveryCopy } from "@/i18n/semanticDiscoveryCopy";
import useGameLoader from "@analysis/hooks/useGameLoader";
import AnalysisPanel from "@analysis/components/AnalysisPanel";
import {
    AnalysisPanelMode
} from "@analysis/components/AnalysisPanel/AnalysisPanelProps";
import {
    getGameSummaryMetrics
} from "@analysis/components/AnalysisPanel/GameSummaryPanel/summaryMetrics";
import AnalysisStatus from "@analysis/constants/AnalysisStatus";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import useAnalysisGameStore from "@analysis/stores/AnalysisGameStore";
import useAnalysisProgressStore from "@analysis/stores/AnalysisProgressStore";

import BoardArea from "./BoardArea";
import * as styles from "./Analysis.module.css";

function Analysis() {
    useGameLoader();
    const { i18n } = useTranslation();
    const semanticCopy = useMemo(
        () => getSemanticDiscoveryCopy(i18n.resolvedLanguage).analysis,
        [i18n.resolvedLanguage]
    );

    const analysisGame = useAnalysisGameStore(
        state => state.analysisGame
    );
    const gameAnalysisOpen = useAnalysisGameStore(
        state => state.gameAnalysisOpen
    );
    const analysisStatus = useAnalysisProgressStore(
        state => state.analysisStatus
    );
    const currentStateTreeNodeUpdate = useAnalysisBoardStore(
        state => state.currentStateTreeNodeUpdate
    );

    const [panelMode, setPanelMode] = useState<AnalysisPanelMode>("summary");

    const metrics = useMemo(
        () => getGameSummaryMetrics(analysisGame),
        [analysisGame, currentStateTreeNodeUpdate]
    );

    const hasCompletedAnalysis =
        metrics.white.accuracy != null
        || metrics.black.accuracy != null
        || metrics.white.estimatedRating != null
        || metrics.black.estimatedRating != null;

    const mobileView = !gameAnalysisOpen
        ? "selection"
        : panelMode == "review"
            ? "review"
            : analysisStatus != AnalysisStatus.INACTIVE
                ? "loading"
                : hasCompletedAnalysis
                    ? "summary"
                    : "ready";

    useEffect(() => {
        const url = new URL(window.location.href);
        if (!url.searchParams.has("nexo-nav")) return;

        url.searchParams.delete("nexo-nav");
        window.history.replaceState(
            window.history.state,
            "",
            url.pathname + url.search + url.hash
        );
    }, []);

    return <div
        className={`${styles.wrapper} nexo-analysis-root`}
        data-analysis-view={mobileView}
    >
        <div className={styles.analysisStage}>
            <div className={`${styles.sideAdvertisement} ${styles.sideAdvertisementLeft}`}>
                <Advertisement
                    adUnitId={ads.analysis.side}
                    format="vertical"
                    fullWidthResponsive={false}
                    style={{ width: "100%" }}
                />
            </div>

            <div
                className={`${styles.analysisSection} nexo-analysis-layout`}
                data-analysis-mobile-view={mobileView}
            >
                <div className="nexo-analysis-board-slot">
                    <BoardArea/>
                </div>

                <AnalysisPanel
                    className={styles.panel}
                    onModeChange={setPanelMode}
                />
            </div>

            <div className={`${styles.sideAdvertisement} ${styles.sideAdvertisementRight}`}>
                <Advertisement
                    adUnitId={ads.analysis.side}
                    format="vertical"
                    fullWidthResponsive={false}
                    style={{ width: "100%" }}
                />
            </div>
        </div>

        <SemanticDiscoverySection
            copy={semanticCopy}
            relatedHref="/puzzles"
            helpHref="/help"
        />
    </div>;
}

export default Analysis;