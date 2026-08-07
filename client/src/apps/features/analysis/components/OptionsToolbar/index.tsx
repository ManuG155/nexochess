import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import { useShallow } from "zustand/react/shallow";

import { StatusCodes } from "http-status-codes";

import {
    FetchStatus
} from "@tanstack/react-query";

import {
    cloneDeep,
    omit
} from "lodash-es";


import {
    defaultAnalysedGame
} from "shared/constants/utils";

import AnalysisStatus from
    "@analysis/constants/AnalysisStatus";

import useAnalysisProgressStore from
    "../../stores/AnalysisProgressStore";

import {
    useAnalysisGameStore
} from "@analysis/stores/AnalysisGameStore";

import useAnalysisBoardStore from
    "@analysis/stores/AnalysisBoardStore";

import useRealtimeEngineStore from
    "@analysis/stores/RealtimeEngineStore";

import {
    useAuthedProfile
} from "@/hooks/api/useProfile";

import Button from
    "@/components/common/Button";

import displayToast from
    "@/lib/toast";

import {
    archiveGame
} from "@/lib/gameArchive";


import * as styles from
    "./OptionsToolbar.module.css";


import iconBack from
    "@assets/img/interface/back.svg";

import iconSave from
    "@assets/img/interface/save.svg";


function OptionsToolbar() {
    const { t } = useTranslation([
        "analysis",
        "common"
    ]);


    const [
        searchParams,
        setSearchParams
    ] = useSearchParams();


    const {
        status: profileStatus
    } = useAuthedProfile();


    const {
        evaluationController,
        setAnalysisStatus,
        setAnalysisError
    } = useAnalysisProgressStore(
        useShallow(state => ({
            evaluationController:
                state.evaluationController,

            setAnalysisStatus:
                state.setAnalysisStatus,

            setAnalysisError:
                state.setAnalysisError
        }))
    );


    const {
        analysisGame,
        setAnalysisGame,
        gameAnalysisOpen,
        setGameAnalysisOpen
    } = useAnalysisGameStore();


    const {
        setCurrentStateTreeNode
    } = useAnalysisBoardStore();


    const setDisplayedEngineLines =
        useRealtimeEngineStore(
            state =>
                state.setDisplayedEngineLines
        );


    const [
        archiveStatus,
        setArchiveStatus
    ] = useState<FetchStatus>("idle");


    function back() {
        setSearchParams(
            omit(
                Object.fromEntries(
                    searchParams.entries()
                ),
                ["game"]
            )
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


        if (
            archival.status
            == StatusCodes
                .INSUFFICIENT_STORAGE
        ) {
            return displayToast({
                message:
                    t(
                        "optionsToolbar"
                        + ".noArchiveStorage"
                    ),

                theme:
                    "error",

                autoClose:
                    false
            });
        }


        if (!archival.id) {
            return displayToast({
                message:
                    t(
                        "unknownError",
                        { ns: "common" }
                    ),

                theme:
                    "error"
            });
        }


        setSearchParams({
            ...Object.fromEntries(
                searchParams.entries()
            ),

            game:
                archival.id
        });


        setArchiveStatus(
            "idle"
        );


        displayToast({
            message:
                t(
                    "optionsToolbar"
                    + ".gameArchived"
                ),

            theme:
                "success",

            autoClose:
                10
        });
    }


    return (
        <div className={styles.wrapper}>

            {gameAnalysisOpen && (
                <Button
                    icon={iconBack}
                    iconSize="40px"
                    className={
                        styles.backButton
                    }
                    tooltipId={
                        "options-toolbar-back"
                    }
                    onClick={back}
                />
            )}


            <Tooltip
                id="options-toolbar-back"
                content={t(
                    "back",
                    { ns: "common" }
                )}
                delayShow={500}
            />


            {(
                gameAnalysisOpen
                && profileStatus
                    == "success"
            ) && (
                <Button
                    className={
                        styles.optionButton
                    }
                    icon={iconSave}
                    iconSize="35px"
                    tooltipId={
                        "options-toolbar-save"
                    }
                    disabled={
                        archiveStatus
                            == "fetching"
                    }
                    onClick={
                        saveToArchive
                    }
                />
            )}


            <Tooltip
                id="options-toolbar-save"
                content={t(
                    "optionsToolbar.save"
                )}
                delayShow={500}
            />

        </div>
    );
}


export default OptionsToolbar;