import React, { useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import {
    Arrow,
    Piece,
    Square
} from "react-chessboard/dist/chessboard/types";
import { Chess, Move, PieceSymbol } from "chess.js";

import { defaultRootNode } from "shared/constants/utils";
import { isMovePromotion } from "shared/lib/utils/chess";

import useResizeObserver from "@/hooks/useResizeObserver";
import useSettingsStore from "@/stores/SettingsStore";
import PlayerProfile from "@/components/chess/PlayerProfile";

import EvaluationBar from "../EvaluationBar";

import { useSquares } from "./squares/useSquares";
import createSquareRenderer from "./squares/SquareRenderer";
import { SquaresContext } from "./squares/SquaresContext";

import BoardProps from "./BoardProps";
import SuggestionArrowOverlay from "./SuggestionArrowOverlay";

import * as styles from "./Board.module.css";


type ClickMove = Pick<Move, "from" | "to">;


function getPieceType(piece: Piece) {
    return piece.at(1)?.toLowerCase() as PieceSymbol;
}


function Board({
    className,
    style,
    profileClassName,
    profileStyle,
    whiteProfile,
    blackProfile,
    theme,
    piecesDraggable = true,
    node = defaultRootNode,
    flipped,
    evaluation,
    arrows,
    enableClassifications = true,
    onAddMove
}: BoardProps) {
    const squares = useSquares();

    const arrowStyle = useSettingsStore(
        state => state.settings.analysis.arrowStyle
    );

    const squareRenderer = useMemo(() => (
        createSquareRenderer(node, enableClassifications)
    ), [
        node,
        enableClassifications
    ]);

    const [
        heldPromotion,
        setHeldPromotion
    ] = useState<ClickMove>();

    const [
        manualArrows,
        setManualArrows
    ] = useState<Arrow[]>([]);

    const boardContainerRef =
        useRef<HTMLDivElement | null>(null);

    const {
        fullWidth: boardWidth
    } = useResizeObserver(
        boardContainerRef,
        1
    );

    /*
     * VOLVEMOS AL CÁLCULO QUE FUNCIONABA.
     * Mañana reharemos coordenadas y barra
     * sin tocar la geometría interna del tablero.
     */
    const chessboardWidth =
        boardWidth - (evaluation ? 40 : 0);

    const renderedArrows = useMemo(() => [
        ...(arrows ?? []).map(arrow => ({
            ...arrow,
            colour: arrowStyle.suggestionColour
        })),

        ...manualArrows.map(([from, to]) => ({
            from,
            to,
            colour: arrowStyle.manualColour
        }))
    ], [
        arrows,
        manualArrows,
        arrowStyle.suggestionColour,
        arrowStyle.manualColour
    ]);

    const topProfile =
        flipped ? whiteProfile : blackProfile;

    const bottomProfile =
        flipped ? blackProfile : whiteProfile;


    function onSquareClick(
        square: Square,
        piece?: Piece
    ) {
        squares.setHighlighted([]);

        if (
            !piece
            || square == squares.selected
        ) {
            squares.setSelected(undefined);
            squares.clearPlayable();
        } else {
            squares.setSelected(square);

            squares.loadPlayable(
                node.state.fen,
                square
            );
        }

        if (!squares.selected) {
            return;
        }

        if (
            !squares.playable.includes(square)
            && !squares.capturable.includes(square)
        ) {
            return;
        }

        const selectedPiece =
            new Chess(node.state.fen)
                .get(squares.selected);

        if (
            selectedPiece
            && isMovePromotion(
                selectedPiece.type,
                square
            )
        ) {
            setHeldPromotion({
                from: squares.selected,
                to: square
            });
        }

        addMove(
            squares.selected,
            square
        );
    }


    function onPromotionPieceSelect(
        piece?: Piece,
        from?: Square,
        to?: Square
    ) {
        if (
            !piece
            || !to
        ) {
            return false;
        }

        setHeldPromotion(undefined);

        const fromSquare =
            heldPromotion?.from || from;

        if (!fromSquare) {
            return false;
        }

        return addMove(
            fromSquare,
            to,
            getPieceType(piece)
        );
    }


    function addMove(
        from: Square,
        to: Square,
        promotion?: PieceSymbol,
        drop?: boolean
    ) {
        try {
            const move =
                new Chess(node.state.fen)
                    .move({
                        from,
                        to,
                        promotion
                    });

            squares.setPieceDropFlag(
                drop || false
            );

            return onAddMove?.(move) || true;
        } catch {
            return false;
        }
    }


    return (
        <div
            className={`${styles.wrapper} ${className}`}
            style={style}
        >
            {topProfile && (
                <div
                    className={
                        `${styles.profile} ${profileClassName}`
                    }
                    style={{
                        borderRadius: "7px 7px 0 0",
                        ...profileStyle
                    }}
                >
                    <PlayerProfile
                        profile={topProfile}
                    />
                </div>
            )}

            <div
                className={styles.boardContainer}
                ref={boardContainerRef}
            >
                {evaluation && (
                    <EvaluationBar
                        evaluation={evaluation}
                        moveColour={node.state.moveColour}
                        flipped={flipped}
                    />
                )}

                <SquaresContext.Provider value={squares}>
                    <div
                        className={styles.chessboardWrapper}
                        style={{
                            width: chessboardWidth,
                            height: chessboardWidth
                        }}
                    >
                        <Chessboard
                            position={node.state.fen}
                            boardOrientation={
                                flipped
                                    ? "black"
                                    : "white"
                            }

                            customArrowColor="rgba(0,0,0,0)"
                            onArrowsChange={setManualArrows}

                            onSquareClick={onSquareClick}
                            onSquareRightClick={
                                squares.toggleHighlight
                            }

                            onPieceDragBegin={(
                                piece,
                                square
                            ) => {
                                squares.setSelected(square);

                                squares.loadPlayable(
                                    node.state.fen,
                                    square
                                );
                            }}

                            onPieceDrop={(
                                from,
                                to,
                                piece
                            ) => {
                                squares.setSelected(undefined);
                                squares.clearPlayable();

                                return addMove(
                                    from,
                                    to,
                                    getPieceType(piece),
                                    true
                                );
                            }}

                            onPromotionPieceSelect={
                                onPromotionPieceSelect
                            }

                            customSquare={squareRenderer}

                            arePiecesDraggable={
                                piecesDraggable
                            }

                            customLightSquareStyle={
                                theme?.lightSquareColour
                                    ? {
                                        backgroundColor:
                                            theme.lightSquareColour
                                    }
                                    : undefined
                            }

                            customDarkSquareStyle={
                                theme?.darkSquareColour
                                    ? {
                                        backgroundColor:
                                            theme.darkSquareColour
                                    }
                                    : undefined
                            }

                            animationDuration={165}

                            showPromotionDialog={
                                !!heldPromotion
                            }

                            promotionToSquare={
                                heldPromotion?.to
                            }

                            promotionDialogVariant="vertical"

                            boardWidth={chessboardWidth}
                        />

                        <SuggestionArrowOverlay
                            arrows={renderedArrows}
                            flipped={flipped}
                            boardPixelWidth={chessboardWidth}
                            shaftWidthPx={arrowStyle.width}
                            headLengthPx={
                                arrowStyle.headLength
                            }
                            headWidthPx={
                                arrowStyle.headWidth
                            }
                        />
                    </div>
                </SquaresContext.Provider>
            </div>

            {bottomProfile && (
                <div
                    className={
                        `${styles.profile} ${profileClassName}`
                    }
                    style={{
                        borderRadius: "0 0 7px 7px",
                        ...profileStyle
                    }}
                >
                    <PlayerProfile
                        profile={bottomProfile}
                    />
                </div>
            )}
        </div>
    );
}


export default Board;