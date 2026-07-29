import { sum, round } from "lodash-es";

import AnalysedGame from "shared/types/game/AnalysedGame";
import EngineVersion from "shared/constants/EngineVersion";
import {
    StateTreeNode,
    getNodeChain
} from "shared/types/game/position/StateTreeNode";
import { getTopEngineLine } from "shared/types/game/position/EngineLine";
import Engine from "@analysis/lib/engine";
import getCloudEvaluation from "./cloudEvaluate";

interface EvaluateMovesOptions {
    engineVersion: EngineVersion;
    maxEngineCount?: number;
    engineDepth: number;
    engineTimeLimit?: number;
    cloudEngineLines: number;
    engineConfig?: (engine: Engine) => void;
    onProgress?: (progress: number) => void;

    /*
     * Se dispara únicamente cuando la evaluación completada avanza
     * de forma continua por la línea principal.
     *
     * Aunque haya varios motores trabajando en paralelo, la UI recibe
     * las posiciones en orden 0, 1, 2, 3... para que el tablero y el
     * gráfico progresen de manera estable y nunca salten hacia atrás.
     */
    onSequentialPositionComplete?: (
        node: StateTreeNode,
        index: number,
        visibleNodeCount: number
    ) => void;

    verbose?: boolean;
}

interface EvaluationProcess {
    evaluate: () => Promise<StateTreeNode[]>;
    controller: AbortController;
}

function createGameEvaluator(
    game: AnalysedGame,
    options: EvaluateMovesOptions
): EvaluationProcess {
    const controller = new AbortController();

    const stateTreeNodes = getNodeChain(game.stateTree);

    // Each state tree node keeps a progress from 0 to 1
    const progresses: number[] = [];

    /*
     * Los motores locales pueden terminar posiciones fuera de orden.
     * Guardamos cuáles están completas y solo exponemos a la interfaz
     * el frente continuo ya evaluado.
     */
    const completedPositions = new Array<boolean>(
        stateTreeNodes.length
    ).fill(false);

    let sequentialCompletedIndex = -1;

    function getProgress() {
        return round(sum(progresses) / stateTreeNodes.length, 3);
    }

    function markPositionComplete(index: number) {
        if (index < 0 || index >= completedPositions.length) return;
        if (completedPositions[index]) return;

        completedPositions[index] = true;

        while (
            sequentialCompletedIndex + 1 < completedPositions.length
            && completedPositions[sequentialCompletedIndex + 1]
        ) {
            sequentialCompletedIndex++;

            const node = stateTreeNodes[sequentialCompletedIndex];

            options.onSequentialPositionComplete?.(
                node,
                sequentialCompletedIndex,
                sequentialCompletedIndex + 1
            );
        }
    }

    async function evaluator(): Promise<StateTreeNode[]> {
        // Apply cloud evaluations where possible
        for (
            let index = 0;
            index < stateTreeNodes.length;
            index++
        ) {
            if (controller.signal.aborted) break;

            const stateTreeNode = stateTreeNodes[index];

            try {
                var cloudEngineLines = await getCloudEvaluation(
                    stateTreeNode.state.fen,
                    options.cloudEngineLines
                );
            } catch {
                break;
            }

            const topCloudLine = getTopEngineLine(cloudEngineLines);
            if (!topCloudLine) break;

            if (topCloudLine.depth < options.engineDepth) break;
            if (cloudEngineLines.length < options.cloudEngineLines) break;

            stateTreeNode.state.engineLines = [
                ...stateTreeNode.state.engineLines,
                ...cloudEngineLines
            ];

            progresses[index] = 1;
            markPositionComplete(index);
            options.onProgress?.(getProgress());
        }

        // Locally evaluate remaining positions

        // Maximum engine count or however many are needed for each
        // remaining position, add 1 for cutoff for last cloud evaluated state
        const evaluatedStateCount = stateTreeNodes.filter(
            node => node.state.engineLines.some(
                line => line.source == EngineVersion.LICHESS_CLOUD
            )
        ).length;

        const engineCount = Math.min(
            options.maxEngineCount || 1,
            (stateTreeNodes.length - evaluatedStateCount) + 1
        );

        let enginesResting = 0;
        let stateTreeNodeIndex = Math.max(evaluatedStateCount - 1, 0);

        return await new Promise((res, rej) => {
            // Bring an engine to a new FEN
            function evaluateNextPosition(engine: Engine) {
                const currentStateTreeNodeIndex = stateTreeNodeIndex;
                const currentStateTreeNode = stateTreeNodes[stateTreeNodeIndex];

                if (stateTreeNodeIndex >= stateTreeNodes.length) {
                    engine.terminate();

                    if (++enginesResting == engineCount) {
                        res(stateTreeNodes);
                    }

                    return;
                }

                engine.setPosition(
                    game.initialPosition,
                    stateTreeNodes
                        .slice(0, stateTreeNodeIndex + 1)
                        .filter(node => node.state.move)
                        .map(node => node.state.move!.uci)
                );

                engine.evaluate({
                    depth: options.engineDepth,
                    timeLimit: options.engineTimeLimit
                        ? options.engineTimeLimit * 1000
                        : undefined,
                    onEngineLine: line => {
                        // Depth 0 is given for states with no legal moves
                        const localProgress = line.depth == 0
                            ? 1
                            : line.depth / options.engineDepth;

                        // Progress value will already exist for cutoff node
                        progresses[currentStateTreeNodeIndex] = Math.max(
                            progresses[currentStateTreeNodeIndex] || 0,
                            localProgress
                        );

                        options.onProgress?.(getProgress());
                    }
                }).then(lines => {
                    progresses[currentStateTreeNodeIndex] = 1;

                    currentStateTreeNode.state.engineLines = [
                        ...currentStateTreeNode.state.engineLines,
                        ...lines
                    ];

                    markPositionComplete(currentStateTreeNodeIndex);
                    options.onProgress?.(getProgress());

                    evaluateNextPosition(engine);
                });

                stateTreeNodeIndex++;
            }

            // Start engines on first positions
            const engines: Engine[] = [];

            for (let i = 0; i < engineCount; i++) {
                const engine = new Engine(options.engineVersion);
                engines.push(engine);

                options.engineConfig?.(engine);

                if (options.verbose) {
                    engine.onMessage(console.log);
                }

                engine.onError(rej);

                evaluateNextPosition(engine);
            }

            controller.signal.addEventListener("abort", () => {
                engines.forEach(engine => engine.terminate());
                rej("abort");
            });
        });
    }

    return { evaluate: evaluator, controller };
}

export default createGameEvaluator;
