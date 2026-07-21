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

import ClassifiedMoveCard from
    "@analysis/components/report/ClassifiedMoveCard";

import StateTreeTraverser from
    "@/components/chess/StateTreeTraverser";

import AnalysisProgress from
    "./AnalysisProgress";

import RealtimeEngineArea from
    "./RealtimeEngineArea";

import GameSelection from
    "./GameSelection";

import GameAnalysis from
    "./GameAnalysis";

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
    const settings =
        useSettingsStore(
            state =>
                state.settings.analysis
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
     * Posición actualmente
     * mostrada en el tablero.
     */
    const currentNode =
        useAnalysisBoardStore(
            state =>
                state.currentStateTreeNode
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
                 * PROGRESO DEL ANÁLISIS.
                 *
                 * De momento lo conservamos.
                 *
                 * En un bloque posterior
                 * vamos a:
                 *
                 * - ocultar "Solving CAPTCHA";
                 * - mostrar progreso limpio;
                 * - sincronizar tablero
                 *   con movimiento analizado.
                 */}
                <AnalysisProgress />


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
                    <>

                        {/*
                         * Cabecera temporal
                         * de la revisión.
                         *
                         * Más adelante
                         * la convertiremos
                         * en nuestra cabecera
                         * compacta B + C.
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
                            >
                                ←
                            </button>

                        </div>



                        {/*
                         * Motor en tiempo real.
                         */}
                        {settings.engine.enabled && (

                            <RealtimeEngineArea />

                        )}


                        {/*
                         * Clasificación
                         * de la jugada actual.
                         */}
                        {(
                            currentNode.state.move

                            &&

                            !settings
                                .classifications
                                .hide

                            &&

                            (
                                settings
                                    .engine
                                    .enabled

                                ||

                                currentNode
                                    .state
                                    .classification
                            )
                        ) && (

                            <ClassifiedMoveCard />

                        )}


                        {/*
                         * Lista/árbol de movimientos.
                         *
                         * Este es el antiguo
                         * modo "Analysis".
                         */}
                        <GameAnalysis />

                    </>
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