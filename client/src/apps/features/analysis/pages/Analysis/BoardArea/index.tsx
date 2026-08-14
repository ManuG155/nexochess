import React from "react";
import { useTranslation } from "react-i18next";
import { Move } from "chess.js";

import { addChildMove } from "shared/types/game/position/StateTreeNode";
import AnalysisTab from "@analysis/constants/AnalysisTab";
import AnalysisStatus from "@analysis/constants/AnalysisStatus";
import useSettingsStore from "@/stores/SettingsStore";
import useAnalysisGameStore from "@analysis/stores/AnalysisGameStore";
import useAnalysisTabStore from "@analysis/stores/AnalysisTabStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import useAnalysisProgressStore from "@analysis/stores/AnalysisProgressStore";
import Board from "@analysis/components/Board";
import playBoardSound from "@/lib/boardSounds";

import useEvaluation from "./useEvaluation";
import useSuggestionArrows from "./useSuggestionArrows";
import * as styles from "./BoardArea.module.css";

function BoardArea() {
    const { t } = useTranslation("analysis");
    const settings = useSettingsStore(state => state.settings.analysis);
    const theme = useSettingsStore(state => state.settings.themes);

    const {
        analysisGame,
        gameAnalysisOpen,
        setGameAnalysisOpen
    } = useAnalysisGameStore();

    const setActiveTab = useAnalysisTabStore(state => state.setActiveTab);

    const analysisStatus = useAnalysisProgressStore(
        state => state.analysisStatus
    );

    const {
        currentStateTreeNode,
        setCurrentStateTreeNode,
        dispatchCurrentNodeUpdate,
        autoplayEnabled,
        boardFlipped,
        setBoardFlipped
    } = useAnalysisBoardStore();

    const evaluation = useEvaluation();
    const suggestionArrows = useSuggestionArrows();
    const flipBoardLabel = t("optionsToolbar.flipBoard");

    function addMove(move: Move) {
        if (!gameAnalysisOpen) {
            setGameAnalysisOpen(true);
            setActiveTab(AnalysisTab.ANALYSIS);
        }

        setCurrentStateTreeNode(prev => {
            const createdNode = addChildMove(prev, move.san);
            playBoardSound(createdNode);

            return createdNode;
        });

        dispatchCurrentNodeUpdate();

        return true;
    }

    return <div
        className={styles.boardArea}
        style={{
            maxWidth: `calc(100vh - ${evaluation ? 195 : 235}px)`
        }}
    >
        <button
            type="button"
            className={styles.flipBoardButton}
            onClick={() => setBoardFlipped(!boardFlipped)}
            title={flipBoardLabel}
            aria-label={flipBoardLabel}
        >
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            >
                <path d="M7 7h10l-2.5-2.5" />
                <path d="M17 17H7l2.5 2.5" />
                <path d="M19 9.5A7 7 0 0 1 17 17" />
                <path d="M5 14.5A7 7 0 0 1 7 7" />
            </svg>
        </button>

        <Board
            className={styles.board}
            profileClassName={styles.boardProfile}
            whiteProfile={analysisGame.players.white}
            blackProfile={analysisGame.players.black}
            theme={{
                lightSquareColour: theme.board.lightSquareColour,
                darkSquareColour: theme.board.darkSquareColour
            }}
            node={currentStateTreeNode}
            flipped={boardFlipped}
            evaluation={evaluation}
            arrows={suggestionArrows}
            piecesDraggable={
                analysisStatus == AnalysisStatus.INACTIVE
                && !autoplayEnabled
            }
            enableClassifications={!settings.classifications.hide}
            onAddMove={addMove}
        />
    </div>;
}

export default BoardArea;