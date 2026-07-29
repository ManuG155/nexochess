import React, { useMemo } from "react";
import { clamp } from "lodash-es";

import PieceColour from "shared/constants/PieceColour";

import {
    stringifyEvaluation
} from "shared/lib/utils/chess";

import EvaluationBarProps from
    "./EvaluationBarProps";

import * as styles from
    "./EvaluationBar.module.css";


const WHITE_COLOUR = "#FFFFFF";

const BLACK_COLOUR = "#403D39";

const WHITE_EVALUATION_TEXT_COLOUR =
    "#302E2B";


function EvaluationBar({
    className,
    style,
    evaluation,
    moveColour,
    flipped = false
}: EvaluationBarProps) {

    /*
     * Texto que aparece dentro
     * de la barra.
     *
     * Queremos siempre valor absoluto.
     *
     * +4.73 -> 4.7
     * -1.82 -> 1.8
     *
     * El signo positivo/negativo
     * se conserva únicamente
     * en el gráfico de evaluación.
     */
    const evaluationText = useMemo(() => (
        stringifyEvaluation(
            {
                ...evaluation,

                value: Math.abs(
                    evaluation.value
                )
            },

            false,

            1
        )
    ), [
        evaluation
    ]);


    /*
     * Calculamos qué porcentaje
     * de la barra pertenece
     * visualmente a las negras.
     *
     * 50%:
     * posición igualada.
     *
     * Menos de 50%:
     * ventaja blanca.
     *
     * Más de 50%:
     * ventaja negra.
     *
     * Conservamos la fórmula
     * que utilizaba WintrChess
     * para no cambiar todavía
     * el comportamiento matemático
     * de la evaluación.
     */
    const blackPercentage = useMemo(() => {

        /*
         * Evaluación normal
         * en centipawns.
         */
        if (
            evaluation.type
            == "centipawn"
        ) {
            return clamp(
                50
                - (
                    evaluation.value
                    / 20
                ),

                5,

                95
            );
        }


        /*
         * Evaluación de mate.
         */
        if (
            evaluation.value == 0
        ) {
            return (
                moveColour
                == PieceColour.WHITE
            )
                ? 0
                : 100;
        }


        return (
            evaluation.value > 0
        )
            ? 0
            : 100;

    }, [
        evaluation,
        moveColour
    ]);


    /*
     * Convertimos el porcentaje
     * a una escala entre 0 y 1.
     *
     * Ejemplo:
     *
     * 63%
     * ->
     * 0.63
     *
     * Esto se utilizará con:
     *
     * transform: scaleY(...)
     *
     * en lugar de cambiar height.
     */
    const blackRatio =
        blackPercentage / 100;


    /*
     * Cuando el tablero está normal:
     *
     * negras arriba
     * blancas abajo
     *
     * El fondo de la barra es blanco
     * y dibujamos una capa negra
     * creciendo desde arriba.
     *
     *
     * Cuando Flip Board está activo:
     *
     * blancas arriba
     * negras abajo
     *
     * El fondo pasa a ser negro
     * y dibujamos la parte blanca
     * creciendo desde arriba.
     */
    const overlayRatio = flipped
        ? 1 - blackRatio
        : blackRatio;


    const baseColour = flipped
        ? BLACK_COLOUR
        : WHITE_COLOUR;


    const overlayColour = flipped
        ? WHITE_COLOUR
        : BLACK_COLOUR;


    /*
     * Determinamos quién tiene
     * la ventaja.
     *
     * Si la zona negra ocupa
     * menos de la mitad,
     * ganan blancas.
     *
     * Si ocupa más,
     * ganan negras.
     */
    const whiteIsBetter =
        blackPercentage <= 50;


    /*
     * Posición del número.
     *
     * Tablero normal:
     *
     * Blancas ganan -> abajo.
     * Negras ganan  -> arriba.
     *
     * Cuando el tablero se gira,
     * la etiqueta sigue visualmente
     * al color correspondiente.
     */
    const evaluationAtBottom = flipped
        ? !whiteIsBetter
        : whiteIsBetter;


    /*
     * Color del número.
     *
     * Ventaja blanca:
     * texto oscuro.
     *
     * Ventaja negra:
     * texto blanco.
     */
    const evaluationTextColour =
        whiteIsBetter
            ? WHITE_EVALUATION_TEXT_COLOUR
            : WHITE_COLOUR;


    return (
        <div
            className={
                `${styles.evaluationBar} ${className}`
            }

            style={{
                backgroundColor:
                    baseColour,

                ...style
            }}
        >

            {/*
             * CAPA SUPERIOR ANIMADA.
             *
             * Muy importante:
             *
             * Ya NO modificamos:
             *
             * height: 63%
             *
             * Ahora usamos:
             *
             * transform: scaleY(0.63)
             *
             * Esto evita recalcular
             * constantemente el layout
             * durante la animación.
             */}
            <div
                className={
                    styles.overBar
                }

                style={{
                    backgroundColor:
                        overlayColour,

                    transform:
                        `scaleY(${overlayRatio})`
                }}
            />


            {/*
             * NÚMERO DE EVALUACIÓN.
             */}
            <span
                className={
                    styles.evaluationText
                }

                style={{
                    ...(evaluationAtBottom
                        ? {
                            bottom: "6px"
                        }
                        : {
                            top: "6px"
                        }
                    ),

                    color:
                        evaluationTextColour
                }}
            >
                {evaluationText}
            </span>

        </div>
    );
}


export default EvaluationBar;