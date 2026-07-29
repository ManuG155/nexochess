import React, {
    useContext,
    useEffect,
    useRef
} from "react";

import {
    useTranslation
} from "react-i18next";

import {
    Classification
} from "shared/constants/Classification";

import {
    PieceColour
} from "shared/constants/PieceColour";

import {
    findNodeRecursively,
    getNodeChain
} from "shared/types/game/position/StateTreeNode";

import {
    classificationColours,
    classificationImages
} from "@analysis/constants/classifications";

import ContextMenu from "@/components/common/ContextMenu";
import useSettingsStore from "@/stores/SettingsStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import useContextMenu from "@/hooks/useContextMenu";

import MoveClickEventContext from "../../MoveClickEventContext";
import MoveProps from "./MoveProps";
import * as styles from "./Move.module.css";

import iconInterfaceDelete from "@assets/img/interface/delete.svg";
import iconInterfaceUp from "@assets/img/interface/up.svg";
import iconInterfaceHelp from "@assets/img/interface/help.svg";


/*
 * Iconografía solicitada para la lista de revisión.
 *
 * IMPORTANTE:
 * Seguimos exactamente la convención visual indicada por el usuario:
 *
 * Blancas -> ♚ ♛ ♜ ♝ ♞
 * Negras  -> ♔ ♕ ♖ ♗ ♘
 *
 * Los peones no muestran símbolo.
 */
const WHITE_MOVE_PIECES: Record<string, string> = {
    K: "♚",
    Q: "♛",
    R: "♜",
    B: "♝",
    N: "♞"
};

const BLACK_MOVE_PIECES: Record<string, string> = {
    K: "♔",
    Q: "♕",
    R: "♖",
    B: "♗",
    N: "♘"
};


/*
 * Estas clasificaciones siempre muestran su icono.
 */
const ALWAYS_HIGHLIGHT = new Set<Classification>([
    Classification.BRILLIANT,
    Classification.CRITICAL,
    Classification.MISTAKE,
    Classification.MISS,
    Classification.BLUNDER
]);


/*
 * En estas categorías frecuentes solo mostramos el icono
 * al comienzo de una secuencia consecutiva de la misma clase.
 */
const HIGHLIGHT_SEQUENCE_START = new Set<Classification>([
    Classification.BEST,
    Classification.EXCELLENT,
    Classification.INACCURACY
]);


function formatMoveSan(
    san:
        string,

    moveColour:
        PieceColour | undefined
) {

    if (
        !moveColour

        ||

        san.startsWith("O-O")
    ) {

        return san;
    }


    const pieceMap =

        moveColour
        == PieceColour.WHITE

            ? WHITE_MOVE_PIECES

            : BLACK_MOVE_PIECES;


    /*
     * Pieza que mueve:
     *
     * Nf3   -> ♞f3 / ♘f3
     * Bxd5  -> ♝xd5 / ♗xd5
     *
     * Los movimientos de peón permanecen sin prefijo.
     */
    let formatted =

        san.replace(
            /^([KQRBN])/,

            piece =>

                pieceMap[
                    piece
                ]

                ?? piece
        );


    /*
     * Promociones:
     *
     * e8=Q -> e8=♛ / e8=♕
     *
     * según el color que ha realizado el movimiento.
     */
    formatted =

        formatted.replace(
            /=([QRBN])/g,

            (
                _match,
                piece:
                    string
            ) =>

                "="

                +

                (
                    pieceMap[
                        piece
                    ]

                    ?? piece
                )
        );


    return formatted;
}


function Move({
    node,
    children
}: MoveProps) {

    const {
        t
    } = useTranslation(
        "analysis"
    );


    const onMoveClick =

        useContext(
            MoveClickEventContext
        );


    const classificationsHidden =

        useSettingsStore(
            state =>
                state
                    .settings
                    .analysis
                    .classifications
                    .hide
        );


    const {
        currentStateTreeNode,
        setCurrentStateTreeNode,
        dispatchCurrentNodeUpdate
    } = useAnalysisBoardStore();


    const {
        contextMenuPosition,
        openContextMenu
    } = useContextMenu();


    const moveEntryRef =

        useRef<HTMLDivElement>(
            null
        );


    const classification =

        node
            ?.state
            .classification;


    const previousClassification =

        node
            ?.parent
            ?.state
            .classification;


    const nextClassification =

        node
            ?.children
            .at(0)
            ?.state
            .classification;


    const isTheory =

        classification
        == Classification.THEORY;


    /*
     * Theory solo muestra icono en:
     *
     * - primera jugada de la secuencia teórica;
     * - última jugada antes de abandonar la teoría.
     */
    const isTheoryBoundary =

        isTheory

        &&

        (
            previousClassification
            != Classification.THEORY

            ||

            nextClassification
            != Classification.THEORY
        );


    const showClassificationHighlight =

        Boolean(

            classification

            &&

            !classificationsHidden

            &&

            (
                ALWAYS_HIGHLIGHT.has(
                    classification
                )

                ||

                (
                    HIGHLIGHT_SEQUENCE_START.has(
                        classification
                    )

                    &&

                    classification
                    != previousClassification
                )

                ||

                isTheoryBoundary
            )

        );


    const isCurrent =

        currentStateTreeNode
        == node;


    /*
     * Cuando navegamos con las flechas inferiores,
     * mantenemos automáticamente visible la jugada seleccionada
     * dentro del scroll de la tabla.
     */
    useEffect(
        () => {

            if (
                isCurrent
            ) {

                moveEntryRef
                    .current
                    ?.scrollIntoView({
                        block:
                            "nearest",

                        inline:
                            "nearest",

                        behavior:
                            "smooth"
                    });
            }

        },

        [
            isCurrent
        ]
    );


    function deleteNode() {

        if (
            !node?.parent
        ) {

            return;
        }


        const siblings =

            node
                .parent
                .children;


        siblings.splice(

            siblings.indexOf(
                node
            ),

            1

        );


        if (
            node.mainline

            &&

            siblings.length > 0
        ) {

            for (
                const siblingChainNode
                of getNodeChain(
                    siblings[0]
                )
            ) {

                siblingChainNode.mainline =
                    true;
            }
        }


        const deletedNodeCurrentChild =

            findNodeRecursively(

                node,

                searchNode =>

                    searchNode.id
                    == currentStateTreeNode.id

            );


        if (
            deletedNodeCurrentChild
        ) {

            setCurrentStateTreeNode(
                node.parent
            );
        }


        dispatchCurrentNodeUpdate();
    }


    function promoteNode() {

        if (
            !node?.parent
        ) {

            return;
        }


        const siblings =

            node
                .parent
                .children;


        const promotedNode =

            siblings

                .splice(

                    siblings.indexOf(
                        node
                    ),

                    1

                )

                .at(0);


        if (
            !promotedNode
        ) {

            return;
        }


        siblings.unshift(
            promotedNode
        );


        setCurrentStateTreeNode(
            node
        );
    }


    const moveText =

        node?.state.move

            ? formatMoveSan(

                node.state.move.san,

                node.state.moveColour

            )

            : children

            || "?";


    return (
        <div
            ref={
                moveEntryRef
            }

            className={
                styles.moveEntry
            }
        >

            <span
                className={
                    styles.iconSlot
                }
            >

                {(
                    showClassificationHighlight

                    &&

                    classification
                ) && (

                    <img
                        className={
                            styles.classificationIcon
                        }

                        src={
                            classificationImages[
                                classification
                            ]
                        }

                        width={
                            24
                        }

                        height={
                            24
                        }

                        alt=""
                    />

                )}

            </span>


            <span
                className={
                    styles.wrapper

                    +

                    (
                        isCurrent
                            ? ` ${styles.current}`
                            : ""
                    )
                }

                style={
                    (
                        showClassificationHighlight

                        &&

                        classification
                    )

                        ? {
                            color:
                                classificationColours[
                                    classification
                                ]
                        }

                        : undefined
                }

                onClick={
                    () => {

                        if (
                            node
                        ) {

                            onMoveClick?.(
                                node
                            );
                        }
                    }
                }

                onContextMenu={
                    openContextMenu
                }
            >
                {
                    moveText
                }
            </span>


            {contextMenuPosition && (

                <ContextMenu
                    position={
                        contextMenuPosition
                    }

                    options={[
                        {
                            icon:
                                iconInterfaceDelete,

                            label:
                                t(
                                    "stateTreeEditor.moveContextMenu.delete"
                                ),

                            onSelect:
                                deleteNode
                        },

                        {
                            icon:
                                iconInterfaceUp,

                            label:
                                t(
                                    "stateTreeEditor.moveContextMenu.promote"
                                ),

                            onSelect:
                                promoteNode
                        },

                        ...(
                            process.env.NODE_ENV
                            == "development"

                                ? [
                                    {
                                        icon:
                                            iconInterfaceHelp,

                                        label:
                                            "Log state tree node",

                                        onSelect:
                                            () =>
                                                console.log(
                                                    node
                                                )
                                    }
                                ]

                                : []
                        )
                    ]}
                />

            )}

        </div>
    );
}


export default Move;
