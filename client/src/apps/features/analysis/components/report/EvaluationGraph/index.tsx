import React from "react";

import {
    ResponsiveContainer,
    XAxis,
    YAxis,
    AreaChart,
    Area,
    Tooltip,
    ReferenceLine,
    ReferenceDot
} from "recharts";

import { max } from "lodash-es";

import {
    StateTreeNode
} from "shared/types/game/position/StateTreeNode";

import Evaluation from
    "shared/types/game/position/Evaluation";

import {
    defaultEvaluation
} from "shared/constants/utils";

import PieceColour from
    "shared/constants/PieceColour";

import {
    Classification
} from "shared/constants/Classification";

import {
    getTopEngineLine
} from "shared/types/game/position/EngineLine";

import {
    classificationColours
} from "@analysis/constants/classifications";

import EvaluationGraphPoint from "./Point";

import TooltipRenderer from
    "./TooltipRenderer";

import EvaluationGraphProps from
    "./EvaluationGraphProps";

import * as styles from
    "./EvaluationGraph.module.css";


/*
 * Clasificaciones que aparecen
 * destacadas como puntos de color
 * en el gráfico.
 */
const highlightedClassifications:
    Classification[] = [

        Classification.BRILLIANT,

        Classification.CRITICAL,

        Classification.INACCURACY,

        Classification.MISTAKE,

        Classification.BLUNDER
    ];


/*
 * Convierte una evaluación real
 * del motor en la posición vertical
 * utilizada por el gráfico.
 */
function getGraphY(
    node: StateTreeNode,
    evaluation: Evaluation,
    graphHeight: number
) {

    /*
     * Posiciones de mate.
     */
    if (
        evaluation.type
        == "mate"
    ) {

        if (
            evaluation.value
            == 0
        ) {

            if (
                node.state.moveColour
                == undefined
            ) {

                return (
                    graphHeight / 2
                );
            }


            return (
                node.state.moveColour
                == PieceColour.WHITE
            )
                ? graphHeight
                : 0;
        }


        return (
            evaluation.value >= 0
        )
            ? graphHeight
            : 0;
    }


    /*
     * Evaluación normal
     * en centipawns.
     */
    return (
        evaluation.value
        + (
            graphHeight / 2
        )
    );
}


function EvaluationGraph({
    className,
    style,
    nodes,
    selectedIndex,
    visibleNodeCount,
    onPointClick
}: EvaluationGraphProps) {

    /*
     * Buscamos la evaluación absoluta
     * más extrema de toda la partida.
     *
     * Se utiliza para dimensionar
     * verticalmente el gráfico.
     */
    const absoluteHighestValue = max(

        nodes.map(
            (
                node,
                index
            ) => {

                if (
                    visibleNodeCount != undefined
                    && index >= visibleNodeCount
                ) {
                    return 0;
                }

                return Math.abs(
                    getTopEngineLine(
                        node.state.engineLines
                    )?.evaluation.value
                    || 0
                );
            }
        )

    ) || 1;


    /*
     * Dejamos algo de margen vertical
     * para que los picos no queden
     * totalmente pegados al borde.
     */
    const yAxisPadding =
        absoluteHighestValue
        * 0.2;


    /*
     * Convertimos cada posición
     * de la partida en un punto
     * del gráfico.
     */
    const dataPoints = nodes.map(
        (
            node,
            index
        ) => {

            const topEngineLine =
                getTopEngineLine(
                    node.state.engineLines
                );


            const evaluation =
                topEngineLine?.evaluation
                || defaultEvaluation;


            const graphHeight = (
                absoluteHighestValue
                + yAxisPadding
            ) * 2;


            const isVisible =
                visibleNodeCount == undefined
                || index < visibleNodeCount;


            return {

                nodeId:
                    node.id,

                state:
                    node.state,

                evaluation:
                    evaluation,

                x:
                    index,

                y:
                    (
                        isVisible
                        && topEngineLine
                    )
                        ? getGraphY(
                            node,
                            evaluation,
                            graphHeight
                        )
                        : null

            } as EvaluationGraphPoint;
        }
    );


    /*
     * Puntos con clasificaciones
     * especialmente importantes.
     */
    const highlightedPoints =
        dataPoints.filter(
            point => (

                point.y != null

                &&

                point.state.classification

                &&

                highlightedClassifications.includes(
                    point.state
                        .classification
                )
            )
        );


    /*
     * Movimiento actualmente
     * seleccionado en la revisión.
     */
    const selectedPoint =
        dataPoints[
            selectedIndex
        ];


    /*
     * Color de la línea vertical
     * del movimiento seleccionado.
     *
     * Si tiene clasificación:
     * usamos su color.
     *
     * Si no:
     * gris.
     */
    const selectedPointColour =
        selectedPoint
            ?.state
            .classification

            ? classificationColours[
                selectedPoint
                    .state
                    .classification
            ]

            : "gray";


    return (
        <div
            className={
                styles.wrapper
            }
        >

            <ResponsiveContainer
                width={
                    style?.width
                    || "100%"
                }

                height={
                    style?.height
                    || 100
                }
            >

                <AreaChart
                    className={
                        `${styles.chart} ${className}`
                    }

                    margin={{
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    }}

                    data={
                        dataPoints
                    }

                    onClick={event => {
    const payload =
        event.activePayload?.at(0)?.payload;

    if (!payload) {
        return;
    }

    onPointClick?.(
        payload as EvaluationGraphPoint
    );
}}
                >

                    {/*
                     * Los ejes existen
                     * internamente,
                     * pero no se muestran.
                     */}
                    <XAxis
                        hide
                        dataKey="x"
                    />


                    <YAxis
                        hide

                        domain={[
                            0,

                            absoluteHighestValue
                            * 2

                            +

                            (
                                yAxisPadding
                                * 2
                            )
                        ]}
                    />


                    {/*
                     * Área blanca principal
                     * que representa
                     * la evolución.
                     */}
                    <Area
                        dataKey="y"

                        type="monotone"

                        fill="#FFFFFF"

                        fillOpacity={1}

                        strokeWidth={0}

                        isAnimationActive={
                            false
                        }
                    />


                    {/*
                     * Línea horizontal central:
                     *
                     * evaluación 0.00.
                     */}
                    <ReferenceLine
                        y={
                            absoluteHighestValue
                            + yAxisPadding
                        }

                        stroke={
                            "rgba(120, 120, 120, 0.55)"
                        }

                        strokeWidth={
                            1
                        }
                    />


                    {/*
                     * TOOLTIP DEL CURSOR.
                     *
                     * Cuando movemos el ratón
                     * sobre el gráfico:
                     *
                     * - aparece el tooltip;
                     * - aparece una línea vertical;
                     * - la línea es tenue;
                     * - es discontinua.
                     *
                     * Esto NO sustituye
                     * la línea del movimiento
                     * seleccionado.
                     */}
                    <Tooltip
                        cursor={{
                            stroke:
                                "rgba(255, 255, 255, 0.32)",

                            strokeWidth:
                                1,

                            strokeDasharray:
                                "4 4"
                        }}

                        content={({
                            label
                        }) => {

                            const point =
                                typeof label
                                == "number"

                                &&

                                dataPoints[
                                    label
                                ];


                            return (
                                point
                                && point.y != null
                            )

                                ? (
                                    <TooltipRenderer
                                        dataPoint={
                                            point
                                        }
                                    />
                                )

                                : null;
                        }}
                    />


                    {/*
                     * MOVIMIENTO SELECCIONADO.
                     *
                     * Línea sólida.
                     *
                     * Es independiente
                     * de la línea discontinua
                     * del cursor.
                     */}
                    {(
                        selectedPoint
                        && selectedPoint.y != null
                    ) && (
                        <>

                            <ReferenceLine
                                x={
                                    selectedPoint.x
                                }

                                stroke={
                                    selectedPointColour
                                }

                                strokeWidth={
                                    2
                                }
                            />


                            <ReferenceDot
                                x={
                                    selectedPoint.x
                                }

                                y={
                                    selectedPoint.y
                                }

                                r={
                                    4
                                }

                                fill={
                                    selectedPointColour
                                }

                                strokeWidth={
                                    0
                                }
                            />

                        </>
                    )}


                    {/*
                     * Puntos de clasificaciones
                     * relevantes:
                     *
                     * brillante,
                     * crítica,
                     * imprecisión,
                     * error,
                     * blunder.
                     */}
                    {highlightedPoints.map(
                        point => (

                            <ReferenceDot
                                key={
                                    point.nodeId
                                }

                                x={
                                    point.x
                                }

                                y={
                                    point.y!
                                }

                                r={
                                    3
                                }

                                fill={
                                    classificationColours[
                                        point
                                            .state
                                            .classification!
                                    ]
                                }

                                strokeWidth={
                                    0
                                }
                            />

                        )
                    )}

                </AreaChart>

            </ResponsiveContainer>

        </div>
    );
}


export default EvaluationGraph;