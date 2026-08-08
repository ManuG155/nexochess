import { Chess } from "chess.js";

import { EngineLine } from "shared/types/game/position/EngineLine";
import EngineVersion from "shared/constants/EngineVersion";
import { STARTING_FEN } from "shared/constants/utils";

// Convert UCI evaluation types to our ones
const uciEvaluationTypes: Record<string, string | undefined> = {
    cp: "centipawn",
    mate: "mate"
};

class Engine {
    private worker: Worker;
    private version: EngineVersion;
    private uciReady: Promise<void>;

    private position = STARTING_FEN;
    private evaluating = false;
    private terminated = false;
    private evaluationGeneration = 0;

    constructor(version: EngineVersion) {
        this.worker = new Worker("/engines/" + version);
        this.version = version;

        this.uciReady = this.consumeLogs(
            "uci",
            log => log.trim() == "uciok"
        ).then(() => undefined);

        this.setPosition(this.position);
    }

    private consumeLogs(
        command: string,
        endCondition: (logMessage: string) => boolean,
        onLogReceived?: (logMessage: string) => void
    ): Promise<string[]> {
        const worker = this.worker;
        const logMessages: string[] = [];

        return new Promise((res, rej) => {
            function cleanup() {
                worker.removeEventListener("message", onMessageReceived);
                worker.removeEventListener("error", onErrorReceived);
            }

            function onErrorReceived(event: ErrorEvent) {
                cleanup();
                rej(event);
            }

            function onMessageReceived(event: MessageEvent) {
                const message = String(event.data);

                onLogReceived?.(message);

                logMessages.push(message);

                if (endCondition(message)) {
                    cleanup();
                    res(logMessages);
                }
            }

            worker.addEventListener("message", onMessageReceived);
            worker.addEventListener("error", onErrorReceived);
            worker.postMessage(command);
        });
    }

    /**
     * UCI no permite asumir que el motor acepta opciones o posiciones antes
     * de responder a `uci`. Conservamos la API síncrona/encadenable, pero la
     * orden real queda encolada hasta `uciok`. Las callbacks de una Promise se
     * ejecutan en orden de registro, por lo que setoption/position mantienen
     * exactamente el orden en que el llamador las configuró antes de evaluate.
     */
    private postWhenUciReady(command: string) {
        void this.uciReady.then(() => {
            if (!this.terminated) {
                this.worker.postMessage(command);
            }
        });
    }

    onMessage(handler: (message: string) => void) {
        this.worker.addEventListener("message", event => {
            handler(String(event.data));
        });

        return this;
    }

    onError(handler: (error: string) => void) {
        this.worker.addEventListener("error", event => {
            handler(String(event.error));
        });

        return this;
    }

    terminate() {
        if (this.terminated) return;

        this.evaluationGeneration++;
        this.evaluating = false;
        this.terminated = true;

        try {
            this.worker.postMessage("quit");
        } catch {
            // The worker may already have stopped itself.
        }

        this.worker.terminate();
    }

    setOption(option: string, value: string) {
        this.postWhenUciReady(
            `setoption name ${option} value ${value}`
        );

        return this;
    }

    setLineCount(lines: number) {
        this.setOption("MultiPV", lines.toString());

        return this;
    }

    setThreadCount(threads: number) {
        this.setOption("Threads", threads.toString());

        return this;
    }

    setPosition(fen: string, uciMoves?: string[]) {
        if (uciMoves?.length) {
            this.postWhenUciReady(
                `position fen ${fen} moves ${uciMoves.join(" ")}`
            );

            const board = new Chess(fen);
            for (const uciMove of uciMoves) {
                board.move(uciMove);
            }

            this.position = board.fen();

            return this;
        }

        this.postWhenUciReady(`position fen ${fen}`);
        this.position = fen;

        return this;
    }

    async evaluate(options: {
        depth: number;
        timeLimit?: number;
        onEngineLine?: (line: EngineLine) => void;
    }): Promise<EngineLine[]> {
        const engineLines: EngineLine[] = [];
        const generation = ++this.evaluationGeneration;

        const maxTimeArgument = options.timeLimit
            ? `movetime ${options.timeLimit}` : "";

        /*
         * Todos los setoption/position registrados antes de esta llamada se
         * vacían al resolver uciReady. Después `isready` funciona como barrera
         * UCI: `go` no sale hasta que Stockfish confirma que procesó todo.
         */
        await this.uciReady;
        if (this.terminated || generation != this.evaluationGeneration) {
            return [];
        }

        await this.consumeLogs(
            "isready",
            log => log.trim() == "readyok"
        );
        if (this.terminated || generation != this.evaluationGeneration) {
            return [];
        }

        this.evaluating = true;

        try {
            await this.consumeLogs(
                `go depth ${options.depth} ${maxTimeArgument}`,
                log => (
                    log.startsWith("bestmove")
                    || log.includes("depth 0")
                ),
                log => {
                    if (!log.startsWith("info depth")) return;
                    if (log.includes("currmove")) return;

                    const depth = parseInt(log.match(/(?<= depth )\d+/)?.[0] || "");
                    if (isNaN(depth)) return;

                    const index = parseInt(log.match(/(?<= multipv )\d+/)?.[0] || "") || 1;

                    const scoreMatches = log.match(/ score (cp|mate) (-?\d+)/);

                    const evaluationType = uciEvaluationTypes[scoreMatches?.[1] || ""];
                    if (
                        evaluationType != "centipawn"
                        && evaluationType != "mate"
                    ) return;

                    let evaluationScore = parseInt(scoreMatches?.[2] || "");
                    if (isNaN(evaluationScore)) return;

                    if (this.position.includes(" b ")) {
                        evaluationScore = -evaluationScore;
                    }

                    const moveUcis = log.match(/ pv (.*)/)?.at(1)?.split(" ") || [];

                    const moveSans: string[] = [];

                    const board = new Chess(this.position);
                    for (const moveUci of moveUcis) {
                        moveSans.push(board.move(moveUci).san);
                    }

                    const newEngineLine: EngineLine = {
                        depth: depth,
                        index: index,
                        evaluation: {
                            type: evaluationType,
                            value: evaluationScore
                        },
                        source: this.version,
                        moves: moveUcis.map((moveUci, moveIndex) => ({
                            uci: moveUci,
                            san: moveSans[moveIndex]
                        }))
                    };

                    engineLines.push(newEngineLine);
                    options.onEngineLine?.(newEngineLine);
                }
            );

            if (
                this.terminated
                || generation != this.evaluationGeneration
            ) {
                return [];
            }

            return engineLines;
        } finally {
            this.evaluating = false;
        }
    }

    async stopEvaluation() {
        this.evaluationGeneration++;
        if (!this.evaluating || this.terminated) return;

        await this.consumeLogs(
            "stop",
            log => log.startsWith("bestmove")
        );

        this.evaluating = false;
    }
}

export default Engine;
