import React, {
    useEffect,
    useState
} from "react";

import useSettingsStore from
    "@/stores/SettingsStore";

import useAnalysisGameStore from
    "@analysis/stores/AnalysisGameStore";

import useAnalysisBoardStore from
    "@analysis/stores/AnalysisBoardStore";

import StateTreeTraverser from
    "@/components/chess/StateTreeTraverser";

import RealtimeEngineArea from
    "./RealtimeEngineArea";

import GameSelection from
    "./GameSelection";

import GameAnalysis from
    "./GameAnalysis";

import EvaluationGraphArea from
    "./GameReport/EvaluationGraphArea";

import CoachMoveReaction from
    "./CoachMoveReaction";

import GameSummaryPanel from
    "./GameSummaryPanel";

import AnalysisPanelProps from
    "./AnalysisPanelProps";

import * as styles from
    "./AnalysisPanel.module.css";


/*
 * Los dos únicos modos que
 * tendrá el panel después
 * de analizar una partida.
 *
 * summary:
 * resumen de la partida.
 *
 * review:
 * revisión movimiento a movimiento.
 */
type SidePanelMode =
    | "summary"
    | "review";


function AnalysisPanel({
    className,
    style
}: AnalysisPanelProps) {

    /*
     * Ajustes del análisis.
     */
    const analysisSettings =
        useSettingsStore(
            state =>
                state.settings.analysis
        );

    const coachSettings =
        useSettingsStore(
            state =>
                state.settings.coach
        );


    /*
     * Partida actualmente analizada.
     */
    const analysisGame =
        useAnalysisGameStore(
            state =>
                state.analysisGame
        );


    /*
     * Indica si ya hemos abierto
     * el análisis de una partida.
     */
    const gameAnalysisOpen =
        useAnalysisGameStore(
            state =>
                state.gameAnalysisOpen
        );



    /*
     * Permite cambiar la posición
     * mostrada por el tablero.
     */
    const setCurrentStateTreeNode =
        useAnalysisBoardStore(
            state =>
                state.setCurrentStateTreeNode
        );


    /*
     * Control del autoplay.
     */
    const setAutoplayEnabled =
        useAnalysisBoardStore(
            state =>
                state.setAutoplayEnabled
        );


    /*
     * Nuestro nuevo modo.
     *
     * Al terminar un análisis
     * empezaremos SIEMPRE
     * en el resumen.
     */
    const [
        sidePanelMode,
        setSidePanelMode
    ] = useState<SidePanelMode>(
        "summary"
    );


    /*
     * Si cerramos el análisis
     * y volvemos al selector PGN,
     * restauramos automáticamente
     * el modo resumen.
     *
     * Así la siguiente partida
     * nunca empieza accidentalmente
     * en modo review.
     */
    useEffect(
        () => {

            if (!gameAnalysisOpen) {

                setSidePanelMode(
                    "summary"
                );
            }

        },

        [
            gameAnalysisOpen
        ]
    );


    /*
     * EMPEZAR REVISIÓN.
     *
     * Cuando pulsamos el botón verde:
     *
     * 1. detenemos autoplay;
     * 2. llevamos el tablero
     *    a la posición inicial;
     * 3. cambiamos a modo review.
     */
    function startReview() {

        setAutoplayEnabled(
            false
        );


        setCurrentStateTreeNode(
            analysisGame.stateTree
        );


        setSidePanelMode(
            "review"
        );
    }


    /*
     * VOLVER AL RESUMEN
     *
     * Más adelante sustituiremos
     * este botón temporal por
     * la flecha pequeña y limpia
     * que quieres arriba a la izquierda.
     */
    function backToSummary() {

        setAutoplayEnabled(
            false
        );


        setSidePanelMode(
            "summary"
        );
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

            <div
                className={
                    styles.components
                }
            >

                {/*
                 * =================================================
                 * 1. NO HAY PARTIDA ANALIZADA
                 * =================================================
                 *
                 * Mostramos selector PGN.
                 */}
                {!gameAnalysisOpen && (

                    <GameSelection />

                )}


                {/*
                 * =================================================
                 * 2. RESUMEN
                 * =================================================
                 *
                 * Ya NO existe:
                 *
                 * Report | Analysis
                 *
                 * El flujo es ahora:
                 *
                 * Resumen
                 * ↓
                 * Empezar revisión
                 * ↓
                 * Review
                 */}
                {(
                    gameAnalysisOpen

                    &&

                    sidePanelMode
                    == "summary"
                ) && (

                    <GameSummaryPanel
                        onStartReview={
                            startReview
                        }
                    />

                )}


                {/*
                 * =================================================
                 * 3. REVISIÓN
                 * =================================================
                 */}
                {(
                    gameAnalysisOpen

                    &&

                    sidePanelMode
                    == "review"
                ) && (

                    <section
                        className={
                            styles.reviewCard
                        }
                    >

                        <div
                            className={[
                                styles.reviewScrollArea,
                                !coachSettings.enabled
                                    ? styles.reviewScrollAreaWithoutCoach
                                    : ""
                            ].filter(Boolean).join(" ")}
                        >

                            {/*
                             * Flecha discreta para volver
                             * al resumen de la partida.
                             *
                             * Forma parte de la misma tarjeta
                             * visual que todo el contenido
                             * de revisión.
                             */}
                            <div
                                className={
                                    styles.reviewHeader
                                }
                            >

                                <button
                                    type="button"

                                    className={
                                        styles.reviewBackButton
                                    }

                                    onClick={
                                        backToSummary
                                    }

                                    aria-label={
                                        "Volver al resumen"
                                    }

                                    title={
                                        "Volver al resumen"
                                    }
                                >
                                    ←
                                </button>

                            </div>


                            {/*
                             * Motor en tiempo real.
                             */}
                            {analysisSettings.engine.enabled && (

                                <RealtimeEngineArea />

                            )}


                            {/*
                             * Reacción espontánea del coach en
                             * momentos críticos del review.
                             */}
                            {coachSettings.enabled && (
                                <CoachMoveReaction />
                            )}


                            {/*
                             * Gráfico de evaluación de la partida.
                             * Permanece visible junto al coach y permite
                             * saltar directamente a cualquier movimiento.
                             */}
                            <div
                                className={
                                    styles.reviewGraphArea
                                }
                            >
                                <EvaluationGraphArea />
                            </div>


                            {/*
                             * Lista/árbol de movimientos.
                             *
                             * Tiene su propio scroll independiente:
                             * el coach permanece visible
                             * mientras recorremos toda la partida.
                             */}
                            <div
                                className={
                                    styles.reviewMovesArea
                                }
                            >
                                <GameAnalysis />
                            </div>

                        </div>

                    </section>

                )}

            </div>


            {/*
             * BOTONES:
             *
             * |<  ←  ▶  →  >|
             *
             * Solo aparecen durante
             * la revisión.
             *
             * En el resumen
             * desaparecen completamente.
             *
             * Más adelante los convertiremos
             * en cinco botones individuales,
             * flotantes y separados.
             */}
            {(
                gameAnalysisOpen

                &&

                sidePanelMode
                == "review"
            ) && (

                <div
                    className={
                        styles.traverserContainer
                    }
                >

                    <StateTreeTraverser
                        className={
                            styles.traverser
                        }
                    />

                </div>

            )}

        </div>
    );
}


export default AnalysisPanel;