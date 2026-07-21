import React from "react";

import {
    stringifyEvaluation
} from "shared/lib/utils/chess";

import EvaluationGraphPoint from
    "./Point";

import * as styles from
    "./EvaluationGraph.module.css";


interface TooltipRendererProps {

    dataPoint:
        EvaluationGraphPoint;

}


function TooltipRenderer({
    dataPoint
}: TooltipRendererProps) {

    return (
        <div
            className={
                styles.tooltip
            }
        >

            {/*
             * Evaluación:
             *
             * blancas:
             * +2.28
             *
             * negras:
             * -1.83
             *
             * Conservamos dos decimales
             * y el signo.
             */}
            <span
                className={
                    styles.tooltipEvaluation
                }
            >

                {stringifyEvaluation(
                    dataPoint.evaluation,
                    true
                )}

            </span>


            {/*
             * Movimiento correspondiente:
             *
             * Nxe5
             * Qxd3
             * O-O
             * etc.
             *
             * Solo aparece si existe.
             */}
            {dataPoint.state.move?.san && (

                <span
                    className={
                        styles.tooltipMove
                    }
                >

                    {
                        dataPoint
                            .state
                            .move
                            .san
                    }

                </span>

            )}

        </div>
    );
}


export default TooltipRenderer;