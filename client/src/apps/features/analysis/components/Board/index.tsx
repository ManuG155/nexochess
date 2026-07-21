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


/*
 * Barra de evaluación.
 *
 * 26 px de ancho.
 * 10 px de separación cuando
 * las coordenadas están dentro.
 */
const EVALUATION_BAR_WIDTH = 26;
const EVALUATION_BAR_GAP = 10;


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


    /*
     * Configuración visual
     * de nuestras flechas.
     */
    const arrowStyle = useSettingsStore(
        state =>
            state.settings.analysis.arrowStyle
    );


    /*
     * Posición de las coordenadas:
     *
     * "inside"
     * "outside"
     */
    const coordinatePosition =
        useSettingsStore(
            state =>
                state.settings
                    .themes
                    .board
                    .coordinates
        );


    const coordinatesOutside =
        coordinatePosition == "outside";


    /*
     * Renderizado personalizado
     * de las casillas.
     */
    const squareRenderer = useMemo(
        () => (
            createSquareRenderer(
                node,
                enableClassifications
            )
        ),
        [
            node,
            enableClassifications
        ]
    );


    /*
     * Estado para promociones.
     */
    const [
        heldPromotion,
        setHeldPromotion
    ] = useState<ClickMove>();


    /*
     * Flechas dibujadas manualmente
     * con botón derecho.
     */
    const [
        manualArrows,
        setManualArrows
    ] = useState<Arrow[]>([]);


    /*
     * Referencia al contenedor principal
     * del tablero.
     */
    const boardContainerRef =
        useRef<HTMLDivElement | null>(
            null
        );


    /*
     * Ancho disponible.
     */
    const {
        fullWidth: boardWidth
    } = useResizeObserver(
        boardContainerRef,
        1
    );


    /*
     * Si las coordenadas están fuera,
     * necesitamos algo más de separación
     * entre la barra de evaluación
     * y el tablero para colocar 8-1.
     *
     * Inside:
     * 10 px.
     *
     * Outside:
     * 28 px.
     */
    const evaluationBarGap =
        coordinatesOutside
            ? 28
            : EVALUATION_BAR_GAP;


    /*
     * Espacio horizontal reservado
     * para:
     *
     * barra + separación.
     */
    const evaluationReservedWidth =
        evaluation
            ? (
                EVALUATION_BAR_WIDTH
                + evaluationBarGap
            )
            : 0;


    /*
     * Tamaño real del Chessboard.
     *
     * Math.max protege al componente
     * durante el primer cálculo
     * del ResizeObserver.
     *
     * Nunca enviamos boardWidth={0}.
     */
    const chessboardWidth = Math.max(
        boardWidth
            - evaluationReservedWidth,
        1
    );


    /*
     * Coordenadas verticales.
     *
     * Normal:
     * 8 -> 1
     *
     * Flip Board:
     * 1 -> 8
     */
    const rankCoordinates = flipped
        ? [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8"
        ]
        : [
            "8",
            "7",
            "6",
            "5",
            "4",
            "3",
            "2",
            "1"
        ];


    /*
     * Coordenadas horizontales.
     *
     * Normal:
     * a -> h
     *
     * Flip Board:
     * h -> a
     */
    const fileCoordinates = flipped
        ? [
            "h",
            "g",
            "f",
            "e",
            "d",
            "c",
            "b",
            "a"
        ]
        : [
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h"
        ];


    /*
     * Flechas que finalmente
     * renderizamos:
     *
     * - motor;
     * - manuales.
     */
    const renderedArrows = useMemo(
        () => [
            ...(arrows ?? []).map(
                arrow => ({
                    ...arrow,

                    colour:
                        arrowStyle
                            .suggestionColour
                })
            ),

            ...manualArrows.map(
                ([from, to]) => ({
                    from,
                    to,

                    colour:
                        arrowStyle
                            .manualColour
                })
            )
        ],
        [
            arrows,
            manualArrows,
            arrowStyle.suggestionColour,
            arrowStyle.manualColour
        ]
    );


    /*
     * Perfiles superior e inferior
     * dependiendo de Flip Board.
     */
    const topProfile =
        flipped
            ? whiteProfile
            : blackProfile;


    const bottomProfile =
        flipped
            ? blackProfile
            : whiteProfile;


    function onSquareClick(
        square: Square,
        piece?: Piece
    ) {

        squares.setHighlighted([]);


        if (
            !piece
            || square == squares.selected
        ) {

            squares.setSelected(
                undefined
            );

            squares.clearPlayable();

        } else {

            squares.setSelected(
                square
            );


            squares.loadPlayable(
                node.state.fen,
                square
            );
        }


        if (!squares.selected) {
            return;
        }


        if (
            !squares.playable.includes(
                square
            )

            &&

            !squares.capturable.includes(
                square
            )
        ) {
            return;
        }


        const selectedPiece =
            new Chess(
                node.state.fen
            ).get(
                squares.selected
            );


        if (
            selectedPiece

            &&

            isMovePromotion(
                selectedPiece.type,
                square
            )
        ) {

            setHeldPromotion({
                from:
                    squares.selected,

                to:
                    square
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


        setHeldPromotion(
            undefined
        );


        const fromSquare =
            heldPromotion?.from
            || from;


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
                new Chess(
                    node.state.fen
                ).move({
                    from,
                    to,
                    promotion
                });


            squares.setPieceDropFlag(
                drop || false
            );


            return (
                onAddMove?.(move)
                || true
            );

        } catch {

            return false;
        }
    }


    return (
        <div
            className={
                `${styles.wrapper} ${className}`
            }

            style={
                style
            }
        >

            {/*
             * PERFIL SUPERIOR
             */}
            {topProfile && (
                <div
                    className={
                        `${styles.profile} ${profileClassName}`
                    }

                    style={{
                        borderRadius:
                            "7px 7px 0 0",

                        ...profileStyle
                    }}
                >

                    <PlayerProfile
                        profile={
                            topProfile
                        }
                    />

                </div>
            )}


            {/*
             * CONTENEDOR DEL TABLERO.
             *
             * Cuando las coordenadas
             * están fuera dejamos 22 px
             * debajo para las letras a-h.
             *
             * IMPORTANTE:
             * esto NO cambia la geometría
             * interna del Chessboard.
             */}
            <div
                className={
                    styles.boardContainer
                }

                ref={
                    boardContainerRef
                }

                style={{
                    marginBottom:
                        coordinatesOutside
                            ? "22px"
                            : undefined
                }}
            >

                {/*
                 * BARRA DE EVALUACIÓN
                 */}
                {evaluation && (
                    <EvaluationBar
                        evaluation={
                            evaluation
                        }

                        moveColour={
                            node.state.moveColour
                        }

                        flipped={
                            flipped
                        }

                        style={{
                            width:
                                EVALUATION_BAR_WIDTH,

                            minWidth:
                                EVALUATION_BAR_WIDTH,

                            marginRight:
                                evaluationBarGap
                        }}
                    />
                )}


                <SquaresContext.Provider
                    value={
                        squares
                    }
                >

                    {/*
                     * ESTE WRAPPER SIGUE SIENDO
                     * EL MISMO DE ANTES.
                     *
                     * No Grid.
                     * No nuevo contenedor.
                     *
                     * Chessboard conserva
                     * exactamente su posición.
                     */}
                    <div
                        className={
                            styles
                                .chessboardWrapper
                        }

                        style={{
                            width:
                                chessboardWidth,

                            height:
                                chessboardWidth
                        }}
                    >

                        {/*
                         * TABLERO REAL
                         */}
                        <Chessboard
                            position={
                                node.state.fen
                            }

                            boardOrientation={
                                flipped
                                    ? "black"
                                    : "white"
                            }


                            /*
                             * INSIDE:
                             *
                             * react-chessboard
                             * dibuja a-h / 1-8.
                             *
                             * OUTSIDE:
                             *
                             * react-chessboard
                             * oculta las suyas.
                             */
                            showBoardNotation={
                                !coordinatesOutside
                            }


                            /*
                             * Ocultamos las flechas
                             * originales de
                             * react-chessboard.
                             */
                            customArrowColor={
                                "rgba(0,0,0,0)"
                            }


                            /*
                             * Pero seguimos usando
                             * su detección de flechas
                             * manuales.
                             */
                            onArrowsChange={
                                setManualArrows
                            }


                            onSquareClick={
                                onSquareClick
                            }


                            onSquareRightClick={
                                squares
                                    .toggleHighlight
                            }


                            onPieceDragBegin={(
                                piece,
                                square
                            ) => {

                                squares.setSelected(
                                    square
                                );


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

                                squares.setSelected(
                                    undefined
                                );


                                squares
                                    .clearPlayable();


                                return addMove(
                                    from,
                                    to,
                                    getPieceType(
                                        piece
                                    ),
                                    true
                                );
                            }}


                            onPromotionPieceSelect={
                                onPromotionPieceSelect
                            }


                            customSquare={
                                squareRenderer
                            }


                            arePiecesDraggable={
                                piecesDraggable
                            }


                            customLightSquareStyle={
                                theme
                                    ?.lightSquareColour

                                    ? {
                                        backgroundColor:
                                            theme
                                                .lightSquareColour
                                    }

                                    : undefined
                            }


                            customDarkSquareStyle={
                                theme
                                    ?.darkSquareColour

                                    ? {
                                        backgroundColor:
                                            theme
                                                .darkSquareColour
                                    }

                                    : undefined
                            }


                            animationDuration={
                                165
                            }


                            showPromotionDialog={
                                !!heldPromotion
                            }


                            promotionToSquare={
                                heldPromotion?.to
                            }


                            promotionDialogVariant={
                                "vertical"
                            }


                            /*
                             * IMPORTANTE:
                             *
                             * Seguimos enviando
                             * directamente el tamaño
                             * calculado al Chessboard.
                             *
                             * No hay ningún Grid
                             * afectándolo.
                             */
                            boardWidth={
                                chessboardWidth
                            }
                        />


                        {/*
                         * NUESTRO RENDERER
                         * DE FLECHAS.
                         */}
                        <SuggestionArrowOverlay
                            arrows={
                                renderedArrows
                            }

                            flipped={
                                flipped
                            }

                            boardPixelWidth={
                                chessboardWidth
                            }

                            shaftWidthPx={
                                arrowStyle.width
                            }

                            headLengthPx={
                                arrowStyle
                                    .headLength
                            }

                            headWidthPx={
                                arrowStyle
                                    .headWidth
                            }
                        />


                        {/*
                         * COORDENADAS EXTERIORES.
                         *
                         * Se renderizan DENTRO
                         * del chessboardWrapper,
                         * pero mediante CSS:
                         *
                         * position: absolute.
                         *
                         * Por tanto NO participan
                         * en el tamaño del tablero.
                         */}
                        {coordinatesOutside && (
                            <>

                                {/*
                                 * NÚMEROS 8-1
                                 */}
                                <div
                                    className={
                                        styles
                                            .rankCoordinates
                                    }
                                >

                                    {rankCoordinates.map(
                                        rank => (

                                            <span
                                                key={
                                                    rank
                                                }

                                                className={
                                                    styles
                                                        .coordinate
                                                }
                                            >
                                                {rank}
                                            </span>

                                        )
                                    )}

                                </div>


                                {/*
                                 * LETRAS A-H
                                 */}
                                <div
                                    className={
                                        styles
                                            .fileCoordinates
                                    }
                                >

                                    {fileCoordinates.map(
                                        file => (

                                            <span
                                                key={
                                                    file
                                                }

                                                className={
                                                    styles
                                                        .coordinate
                                                }
                                            >
                                                {file}
                                            </span>

                                        )
                                    )}

                                </div>

                            </>
                        )}

                    </div>

                </SquaresContext.Provider>

            </div>


            {/*
             * PERFIL INFERIOR
             */}
            {bottomProfile && (
                <div
                    className={
                        `${styles.profile} ${profileClassName}`
                    }

                    style={{
                        borderRadius:
                            "0 0 7px 7px",

                        ...profileStyle
                    }}
                >

                    <PlayerProfile
                        profile={
                            bottomProfile
                        }
                    />

                </div>
            )}

        </div>
    );
}


export default Board;