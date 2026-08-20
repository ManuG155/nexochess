import { useTranslation } from "react-i18next";

import AnalysedGame from "shared/types/game/AnalysedGame";
import {
    StateTreeNode,
    getNodeChain
} from "shared/types/game/position/StateTreeNode";
import AnalysisStatus from "@analysis/constants/AnalysisStatus";
import useSettingsStore from "@/stores/SettingsStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import useAnalysisProgressStore from "@analysis/stores/AnalysisProgressStore";
import createGameEvaluator from "../lib/evaluate";

/*
 * Ritmo visual del tablero durante el análisis.
 *
 * Los motores pueden acabar posiciones fuera de orden y, cuando se libera
 * una posición bloqueada, evaluate.ts puede entregar varias posiciones
 * consecutivas prácticamente en el mismo instante. Si las pintamos todas
 * inmediatamente, react-chessboard acumula animaciones y puede terminar con
 * piezas desincronizadas o invisibles mientras el resaltado de la última
 * jugada sí continúa cambiando.
 *
 * La cola visual desacopla el motor de la animación de la interfaz:
 * - el motor sigue trabajando en paralelo y a máxima velocidad;
 * - la UI reproduce SIEMPRE las posiciones en orden;
 * - tablero, gráfico y porcentaje avanzan juntos.
 */
const NORMAL_VISUAL_STEP_MS = 150;
const MEDIUM_BACKLOG_STEP_MS = 90;
const LARGE_BACKLOG_STEP_MS = 55;

interface VisualPositionUpdate {
    node: StateTreeNode;
    visibleNodeCount: number;
}

function useEvaluateGame() {
    const { t } = useTranslation("analysis");

    const settings = useSettingsStore(
        state => state.settings.analysis.engine
    );

    const {
        setCurrentStateTreeNode,
        dispatchCurrentNodeUpdate
    } = useAnalysisBoardStore();

    const {
        setAnalysisStatus,
        setEvaluationProgress,
        setEvaluationVisibleNodeCount,
        setAnalysisError
    } = useAnalysisProgressStore();

    async function evaluateGame(analysisGame: AnalysedGame) {
        const mainlineNodes = getNodeChain(
            analysisGame.stateTree
        );

        const totalNodeCount = Math.max(
            1,
            mainlineNodes.length
        );

        const visualQueue: VisualPositionUpdate[] = [];

        let visualTimer:
            ReturnType<typeof setTimeout>
            | undefined;

        let visualDrainResolver:
            (() => void)
            | undefined;

        let visualPlaybackAborted = false;

        function resolveVisualDrainIfIdle() {
            if (
                visualQueue.length == 0
                && !visualTimer
            ) {
                visualDrainResolver?.();
                visualDrainResolver = undefined;
            }
        }

        function getVisualStepDelay() {
            /*
             * Si varios motores liberan una gran cola de posiciones de golpe,
             * aceleramos suavemente la reproducción para que la UI no tarde
             * decenas de segundos en alcanzar al motor. Nunca se saltan nodos:
             * simplemente reducimos el tiempo entre posiciones.
             */
            if (visualQueue.length >= 24) {
                return LARGE_BACKLOG_STEP_MS;
            }

            if (visualQueue.length >= 10) {
                return MEDIUM_BACKLOG_STEP_MS;
            }

            return NORMAL_VISUAL_STEP_MS;
        }

        function playNextVisualPosition() {
            if (visualPlaybackAborted) {
                visualQueue.length = 0;
                resolveVisualDrainIfIdle();
                return;
            }

            if (visualTimer || visualQueue.length == 0) {
                resolveVisualDrainIfIdle();
                return;
            }

            const nextUpdate = visualQueue.shift();
            if (!nextUpdate) {
                resolveVisualDrainIfIdle();
                return;
            }

            /*
             * Una sola fuente de progreso visual:
             *
             * 1. cambiamos la posición del tablero;
             * 2. revelamos exactamente el mismo nodo en el gráfico;
             * 3. actualizamos el porcentaje con ese mismo avance.
             *
             * De este modo los tres elementos permanecen sincronizados.
             */
            setCurrentStateTreeNode(
                nextUpdate.node
            );

            setEvaluationVisibleNodeCount(
                nextUpdate.visibleNodeCount
            );

            setEvaluationProgress(
                Math.min(
                    1,
                    nextUpdate.visibleNodeCount
                        / totalNodeCount
                )
            );

            dispatchCurrentNodeUpdate();

            visualTimer = setTimeout(
                () => {
                    visualTimer = undefined;
                    playNextVisualPosition();
                },
                getVisualStepDelay()
            );
        }

        function enqueueVisualPosition(
            node: StateTreeNode,
            visibleNodeCount: number
        ) {
            if (visualPlaybackAborted) return;

            visualQueue.push({
                node,
                visibleNodeCount
            });

            playNextVisualPosition();
        }

        function waitForVisualPlayback() {
            if (
                visualQueue.length == 0
                && !visualTimer
            ) {
                return Promise.resolve();
            }

            return new Promise<void>(resolve => {
                visualDrainResolver = resolve;
            });
        }

        setAnalysisError(undefined);
        setEvaluationProgress(0);
        setEvaluationVisibleNodeCount(0);
        setCurrentStateTreeNode(analysisGame.stateTree);
        dispatchCurrentNodeUpdate();
        setAnalysisStatus(AnalysisStatus.EVALUATING);

        const evaluator = createGameEvaluator(analysisGame, {
            engineVersion: settings.version,
            engineDepth: settings.depth,
            engineTimeLimit: settings.timeLimitEnabled
                ? settings.timeLimit
                : undefined,
            cloudEngineLines: settings.lines,
            maxEngineCount: 4,
            engineConfig: engine => engine.setLineCount(settings.lines),

            /*
             * El porcentaje ya no sigue la profundidad parcial de cuatro
             * motores distintos. Ahora sigue las posiciones COMPLETADAS que
             * el usuario está viendo. Esto mantiene sincronizados porcentaje,
             * tablero y gráfico.
             */
            onProgress: () => undefined,

            /*
             * evaluate.ts ya garantiza que estos callbacks representan el
             * frente continuo 0, 1, 2, 3... aunque los motores terminen fuera
             * de orden. Aquí simplemente los metemos en una cola visual para
             * evitar que React reciba 20 cambios de posición en el mismo tick.
             */
            onSequentialPositionComplete: (
                node,
                _index,
                visibleNodeCount
            ) => {
                enqueueVisualPosition(
                    node,
                    visibleNodeCount
                );
            }
        });

        evaluator.controller.signal.addEventListener(
            "abort",
            () => {
                visualPlaybackAborted = true;
                visualQueue.length = 0;

                if (visualTimer) {
                    clearTimeout(visualTimer);
                    visualTimer = undefined;
                }

                resolveVisualDrainIfIdle();
            }
        );

        evaluator.evaluate()
            .then(async () => {
                /*
                 * El motor puede haber acabado antes que la pequeña cola
                 * visual. Esperamos a que el tablero y el gráfico alcancen la
                 * última posición antes de pasar a la fase interna de CAPTCHA
                 * y generación del informe.
                 */
                await waitForVisualPlayback();

                if (visualPlaybackAborted) return;

                setEvaluationProgress(1);
                setEvaluationVisibleNodeCount(
                    totalNodeCount
                );

                setAnalysisStatus(
                    AnalysisStatus.AWAITING_CAPTCHA
                );
            })
            .catch(err => {
                if (err == "abort") return;

                console.error(err);
                setAnalysisError(t("analysisError"));
            });

        return evaluator.controller;
    }

    return evaluateGame;
}

export default useEvaluateGame;
