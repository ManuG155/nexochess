import { useTranslation } from "react-i18next";
import { StatusCodes } from "http-status-codes";
import { useSearchParams } from "react-router-dom";

import {
    getNodeChain
} from "shared/types/game/position/StateTreeNode";
import AnalysisStatus from "@analysis/constants/AnalysisStatus";
import useSettingsStore from "@/stores/SettingsStore";
import useAnalysisGameStore from "@analysis/stores/AnalysisGameStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import useAnalysisProgressStore from "@analysis/stores/AnalysisProgressStore";
import { analyseStateTree } from "@analysis/lib/reporter";
import { archiveGame } from "@/lib/gameArchive";
import {
    trackAnalysisCompleted,
    trackAnalysisFailed,
    trackAnalysisStarted
} from "@/lib/analytics";

function useAnalyseGame(
    onAnalysisError?: (message: string) => void
) {
    const { t } = useTranslation("analysis");

    const [searchParams, setSearchParams] = useSearchParams();

    const settings = useSettingsStore(state => state.settings.analysis);

    const {
        analysisGame,
        setAnalysisGame
    } = useAnalysisGameStore();

    const {
        setCurrentStateTreeNode,
        dispatchCurrentNodeUpdate
    } = useAnalysisBoardStore();

    const {
        setAnalysisStatus,
        setEvaluationVisibleNodeCount
    } = useAnalysisProgressStore();

    return async () => {
        trackAnalysisStarted();

        const analyseResult = await analyseStateTree(
            analysisGame.stateTree,
            {
                includeBrilliant:
                    settings
                        .classifications
                        .included
                        .brilliant,

                includeCritical:
                    settings
                        .classifications
                        .included
                        .critical,

                includeTheory:
                    settings
                        .classifications
                        .included
                        .theory,

                whiteRating:
                    analysisGame
                        .players
                        .white
                        .rating,

                blackRating:
                    analysisGame
                        .players
                        .black
                        .rating
            }
        );

        if (analyseResult.status != StatusCodes.OK) {
            trackAnalysisFailed("request_failed");
            return onAnalysisError?.(
                t("progressReporter.reportFailed")
            );
        }

        if (!analyseResult.gameAnalysis) {
            trackAnalysisFailed("missing_result");
            return setAnalysisStatus(AnalysisStatus.INACTIVE);
        }

        const completedGame = {
            ...analysisGame,
            ...analyseResult.gameAnalysis
        };

        trackAnalysisCompleted();
        setAnalysisGame(completedGame);

        /*
         * Al terminar, volvemos a la posición inicial. El usuario llega al
         * resumen con el gráfico completo y puede iniciar la revisión desde
         * la primera jugada, en lugar de quedarse en la última posición que
         * estaba mostrando el análisis progresivo.
         */
        setCurrentStateTreeNode(
            completedGame.stateTree
        );

        setEvaluationVisibleNodeCount(
            getNodeChain(
                completedGame.stateTree
            ).length
        );

        dispatchCurrentNodeUpdate();
        setAnalysisStatus(AnalysisStatus.INACTIVE);

        /*
         * Every completed review is archived automatically. The archive
         * helper stores it in the signed-in account when available and
         * transparently falls back to IndexedDB for guests or offline use.
         * Fingerprinting prevents the same game from being duplicated.
         */
        void archiveGame(
            completedGame,
            searchParams.get("game") || undefined
        ).then(archival => {
            if (!archival.id) return;

            setSearchParams({
                ...Object.fromEntries(searchParams.entries()),
                game: archival.id
            }, { replace: true });
        }).catch(error => {
            console.warn("NexoChess could not auto-save this game.", error);
        });
    };
}

export default useAnalyseGame;