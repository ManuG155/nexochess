import React from "react";

import {
    getNodeMoveNumber
} from "shared/types/game/position/StateTreeNode";

import {
    PieceColour
} from "shared/constants/PieceColour";

import Move from "../Move";

import LineGroupProps from "./LineGroupProps";
import * as styles from "./LineGroup.module.css";


const VARIATION_INDENT =
    12;


function LineGroup({
    indentCount,
    nodes,
    initialPosition,
    forceWhiteMoveNumber
}: LineGroupProps) {

    const firstNode =

        nodes.at(
            0
        );


    const whiteNode =

        nodes.find(

            node =>

                node?.state.moveColour
                == PieceColour.WHITE

        );


    const blackNode =

        nodes.find(

            node =>

                node?.state.moveColour
                == PieceColour.BLACK

        );


    const moveNumber =

        firstNode

            ? Math.trunc(

                getNodeMoveNumber(

                    firstNode,

                    initialPosition

                )

            )

            : 0;


    const numberSuffix =

        (
            forceWhiteMoveNumber

            ||

            firstNode?.state.moveColour
            == PieceColour.WHITE
        )

            ? "."

            : "...";


    return (
        <div
            className={
                styles.wrapper
            }

            style={{
                paddingLeft:

                    `${
                        10
                        +
                        indentCount
                        *
                        VARIATION_INDENT
                    }px`
            }}
        >

            <span
                className={
                    styles.moveNumber
                }
            >
                {
                    moveNumber
                }
                {
                    numberSuffix
                }
            </span>


            <div
                className={
                    styles.moveCell
                }
            >

                {whiteNode

                    ? (
                        <Move
                            node={
                                whiteNode
                            }
                        />
                    )

                    : null
                }

            </div>


            <div
                className={
                    styles.moveCell
                }
            >

                {blackNode

                    ? (
                        <Move
                            node={
                                blackNode
                            }
                        />
                    )

                    : null
                }

            </div>

        </div>
    );
}


export default LineGroup;
