import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import useGameSelector from "@/hooks/useGameSelector";
import GameSelector from "@/components/chess/GameSelector";
import LogMessage from "@/components/common/LogMessage";

import useAnalysisProgressStore from
    "@analysis/stores/AnalysisProgressStore";
import useImportGame from "@analysis/hooks/useImportGame";
import useEvaluateGame from "@analysis/hooks/useEvaluateGame";

import AnalyseButton from "../../AnalyseButton";

import * as styles from "./GameSelection.module.css";


function GameSelection() {
    const { t } = useTranslation("analysis");

    const {
        setSelectedGame,
        selectedGame,
        savedCurrentFieldInput
    } = useGameSelector();

    const setEvaluationController = useAnalysisProgressStore(
        state => state.setEvaluationController
    );

    const [statusMessage, setStatusMessage] = useState<string>();
    const [importError, setImportError] = useState<string>();

    const importSelectedGame = useImportGame();
    const evaluateGame = useEvaluateGame();

    const canAnalyse = Boolean(
        selectedGame
        || savedCurrentFieldInput.trim()
    );

    async function onAnalyseClick() {
        setImportError(undefined);

        try {
            const importedGame = await importSelectedGame(setStatusMessage);
            const controller = await evaluateGame(importedGame);
            setEvaluationController(controller);
        } catch (error) {
            setImportError((error as Error).message);
        }
    }

    return (
        <section className={styles.wrapper}>
            <header className={styles.intro}>
                <span className={styles.eyebrow}>
                    {t("gameSelection.eyebrow")}
                </span>

                <h1>{t("gameSelection.title")}</h1>

                <p>{t("gameSelection.subtitle")}</p>

            </header>

            <GameSelector
                saveLocalStorage
                onGameSelect={setSelectedGame}
            />

            <AnalyseButton
                onClick={onAnalyseClick}
                disabled={!canAnalyse}
            />

            <p className={styles.localNote}>
                {t("gameSelection.localNote")}
            </p>

            {statusMessage && (
                <i className={styles.statusMessage}>
                    {statusMessage}
                </i>
            )}

            {importError && (
                <LogMessage>
                    {importError}
                </LogMessage>
            )}
        </section>
    );
}

export default GameSelection;
