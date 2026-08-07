import React, {
    useEffect,
    useState
} from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { cloneDeep } from "lodash-es";

import AnalysisStatus from "@analysis/constants/AnalysisStatus";
import defaultAnalysedGame from "@analysis/constants/defaultAnalysedGame";
import useAnalysisGameStore from "@analysis/stores/AnalysisGameStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import useAnalysisProgressStore from "@analysis/stores/AnalysisProgressStore";
import useRealtimeEngineStore from "@analysis/stores/RealtimeEngineStore";
import useAnalysisTabStore from "@analysis/stores/AnalysisTabStore";
import useAnalysisSessionStore from "@analysis/stores/AnalysisSessionStore";
import { archiveGame } from "@/lib/gameArchive";
import AnalysisTab from "@analysis/constants/AnalysisTab";
import LogMessage from "@/components/common/LogMessage";

import * as styles from "./OptionsToolbar.module.css";

function OptionsToolbar() {
    const { t } = useTranslation("analysis");
    const [ searchParams, setSearchParams ] = useSearchParams();

    const {
        analysisGame,
        setAnalysisGame,
        gameAnalysisOpen,
        setGameAnalysisOpen
    } = useAnalysisGameStore();

    const {
        currentStateTreeNode,
        setCurrentStateTreeNode,
        boardFlipped,
        setBoardFlipped
    } = useAnalysisBoardStore();

    const {
        analysisStatus,
        setAnalysisStatus,
        evaluationController,
        setAnalysisError
    } = useAnalysisProgressStore();

    const setDisplayedEngineLines = useRealtimeEngineStore(
        state => state.setDisplayedEngineLines
    );

    const setActiveTab = useAnalysisTabStore(
        state => state.setActiveTab
    );

    const resetAnalysisSession = useAnalysisSessionStore(
        state => state.reset
    );

    const [ archiveStatus, setArchiveStatus ] = useState<
        "inactive" | "fetching" | "success" | "error"
    >("inactive");

    useEffect(() => {
        setArchiveStatus("inactive");
    }, [analysisGame]);

    function flipBoard() {
        setBoardFlipped(!boardFlipped);
    }

    function resetAnalysis() {
        setSearchParams(
            Object.fromEntries(
                searchParams.entries()
            ),
            { replace: true }
        );

        searchParams.delete("game");
        setSearchParams(
            Object.fromEntries(
                searchParams.entries()
            ),
            { replace: true }
        );

        evaluationController?.abort();

        setAnalysisStatus(
            AnalysisStatus.INACTIVE
        );

        setAnalysisError();

        const freshAnalysisGame =
            cloneDeep(
                defaultAnalysedGame
            );

        setGameAnalysisOpen(false);

        setAnalysisGame(
            freshAnalysisGame
        );

        setCurrentStateTreeNode(
            freshAnalysisGame.stateTree
        );

        setDisplayedEngineLines(
            freshAnalysisGame.stateTree.state.fen,
            []
        );
    }

    async function saveToArchive() {
        setArchiveStatus(
            "fetching"
        );

        const archival =
            await archiveGame(
                analysisGame,
                searchParams.get(
                    "game"
                ) || undefined
            );

        if (!archival) {
            setArchiveStatus("error");
            return;
        }

        setArchiveStatus("success");

        searchParams.set("game", archival.id);
        setSearchParams(
            Object.fromEntries(
                searchParams.entries()
            ),
            { replace: true }
        );
    }

    function closeAnalysis() {
        setGameAnalysisOpen(false);
        setActiveTab(AnalysisTab.GAME);
        resetAnalysisSession();
    }

    return <div className={styles.wrapper}>
        <div className={styles.buttonRow}>
            <button
                type="button"
                onClick={flipBoard}
            >
                {t("optionsToolbar.flipBoard")}
            </button>

            <button
                type="button"
                onClick={resetAnalysis}
            >
                {t("optionsToolbar.newGame")}
            </button>

            {gameAnalysisOpen && <button
                type="button"
                onClick={closeAnalysis}
            >
                {t("optionsToolbar.closeAnalysis")}
            </button>}

            <button
                type="button"
                onClick={() => void saveToArchive()}
                disabled={archiveStatus == "fetching"}
            >
                {t("optionsToolbar.saveToArchive")}
            </button>
        </div>

        {archiveStatus == "success" && <LogMessage>
            {t("optionsToolbar.archiveSuccess")}
        </LogMessage>}
        {archiveStatus == "error" && <LogMessage>
            {t("optionsToolbar.archiveError")}
        </LogMessage>}
    </div>;
}

export default OptionsToolbar;
