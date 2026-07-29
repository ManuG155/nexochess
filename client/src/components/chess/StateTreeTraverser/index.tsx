import React, {
    useEffect,
    useRef
} from "react";

import {
    useTranslation
} from "react-i18next";

import {
    Options as HotkeyOptions,
    useHotkeys
} from "react-hotkeys-hook";

import {
    getNodeChain
} from "shared/types/game/position/StateTreeNode";

import useAnalysisGameStore from "@analysis/stores/AnalysisGameStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import playBoardSound from "@/lib/boardSounds";

import StateTreeTraverserProps from "./StateTreeTraverserProps";
import * as styles from "./StateTreeTraverser.module.css";


type Interval =
    ReturnType<typeof setInterval>;


const hotkeyConfig: HotkeyOptions = {
    preventDefault:
        true
};


function BeginningIcon() {

    return (
        <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
        >
            <path
                d="M8 7v18M23 8l-9 8 9 8"
            />
        </svg>
    );
}


function BackIcon() {

    return (
        <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
        >
            <path
                d="M21 7l-10 9 10 9"
            />
        </svg>
    );
}


function PlayIcon() {

    return (
        <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
        >
            <path
                className={
                    styles.playPath
                }

                d="M11 7l14 9-14 9z"
            />
        </svg>
    );
}


function PauseIcon() {

    return (
        <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
        >
            <path
                className={
                    styles.pausePath
                }

                d="M10 7h4v18h-4zM18 7h4v18h-4z"
            />
        </svg>
    );
}


function NextIcon() {

    return (
        <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
        >
            <path
                d="M11 7l10 9-10 9"
            />
        </svg>
    );
}


function EndIcon() {

    return (
        <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
        >
            <path
                d="M24 7v18M9 8l9 8-9 8"
            />
        </svg>
    );
}


function StateTreeTraverser({
    className,
    style
}: StateTreeTraverserProps) {

    const {
        t
    } = useTranslation(
        "analysis"
    );


    const {
        analysisGame
    } = useAnalysisGameStore();


    const {
        currentStateTreeNode,
        setCurrentStateTreeNode,
        autoplayEnabled,
        setAutoplayEnabled
    } = useAnalysisBoardStore();


    const autoplayIntervalRef =

        useRef<Interval>();


    useEffect(
        () => {

            if (
                autoplayEnabled
            ) {

                traverseForwards();


                autoplayIntervalRef.current =

                    setInterval(

                        traverseForwards,

                        1000

                    );

            } else {

                clearInterval(
                    autoplayIntervalRef.current
                );
            }


            return () => {

                clearInterval(
                    autoplayIntervalRef.current
                );
            };

        },

        [
            autoplayEnabled
        ]
    );


    function traverseToBeginning() {

        setCurrentStateTreeNode(
            analysisGame.stateTree
        );


        setAutoplayEnabled(
            false
        );
    }


    function traverseToEnd() {

        const finalNode =

            getNodeChain(
                analysisGame.stateTree
            ).at(-1)

            ||

            analysisGame.stateTree;


        setCurrentStateTreeNode(
            finalNode
        );


        playBoardSound(
            finalNode
        );


        setAutoplayEnabled(
            false
        );
    }


    function traverseBackwards() {

        if (
            !currentStateTreeNode.parent
        ) {

            return;
        }


        const previousNode =

            currentStateTreeNode.parent;


        setCurrentStateTreeNode(
            previousNode
        );


        playBoardSound(
            previousNode
        );


        setAutoplayEnabled(
            false
        );
    }


    function traverseForwards() {

        setCurrentStateTreeNode(

            currentNode => {

                const priorityChild =

                    currentNode
                        .children
                        .at(0);


                if (
                    priorityChild
                ) {

                    playBoardSound(
                        priorityChild
                    );


                    return priorityChild;
                }


                setAutoplayEnabled(
                    false
                );


                return currentNode;
            }

        );
    }


    useHotkeys(
        "up, shift+left",
        traverseToBeginning,
        hotkeyConfig
    );


    useHotkeys(
        "down, shift+right",
        traverseToEnd,
        hotkeyConfig
    );


    useHotkeys(
        "left",
        traverseBackwards,
        hotkeyConfig
    );


    useHotkeys(
        "right",
        traverseForwards,
        hotkeyConfig
    );


    return (
        <div
            className={
                `${styles.wrapper} ${className}`
            }

            style={
                style
            }
        >

            <button
                type="button"
                className={
                    styles.navigationButton
                }
                onClick={
                    traverseToBeginning
                }
                title={
                    t(
                        "stateTreeTraverser.beginning"
                    )
                }
                aria-label={
                    t(
                        "stateTreeTraverser.beginning"
                    )
                }
            >
                <BeginningIcon />
            </button>


            <button
                type="button"
                className={
                    styles.navigationButton
                }
                onClick={
                    traverseBackwards
                }
                title={
                    t(
                        "stateTreeTraverser.back"
                    )
                }
                aria-label={
                    t(
                        "stateTreeTraverser.back"
                    )
                }
            >
                <BackIcon />
            </button>


            <button
                type="button"
                className={
                    styles.navigationButton
                }
                onClick={
                    () =>
                        setAutoplayEnabled(
                            !autoplayEnabled
                        )
                }
                title={
                    autoplayEnabled

                        ? t(
                            "stateTreeTraverser.pause"
                        )

                        : t(
                            "stateTreeTraverser.play"
                        )
                }
                aria-label={
                    autoplayEnabled

                        ? t(
                            "stateTreeTraverser.pause"
                        )

                        : t(
                            "stateTreeTraverser.play"
                        )
                }
            >

                {autoplayEnabled

                    ? <PauseIcon />

                    : <PlayIcon />
                }

            </button>


            <button
                type="button"
                className={
                    styles.navigationButton
                }
                onClick={
                    traverseForwards
                }
                title={
                    t(
                        "stateTreeTraverser.next"
                    )
                }
                aria-label={
                    t(
                        "stateTreeTraverser.next"
                    )
                }
            >
                <NextIcon />
            </button>


            <button
                type="button"
                className={
                    styles.navigationButton
                }
                onClick={
                    traverseToEnd
                }
                title={
                    t(
                        "stateTreeTraverser.end"
                    )
                }
                aria-label={
                    t(
                        "stateTreeTraverser.end"
                    )
                }
            >
                <EndIcon />
            </button>

        </div>
    );
}


export default StateTreeTraverser;
