import { useEffect, useRef, useState } from "react";
import EngineVersion from "shared/constants/EngineVersion";
import Evaluation from "shared/types/game/position/Evaluation";
import Engine from "@analysis/lib/engine";

export default function useRepertoireEvaluation(fen: string, enabled: boolean) {
    const [evaluation, setEvaluation] = useState<Evaluation>({
        type: "centipawn",
        value: 0
    });
    const cacheRef = useRef(new Map<string, Evaluation>());
    const requestRef = useRef(0);

    useEffect(() => {
        const requestId = ++requestRef.current;
        const cached = cacheRef.current.get(fen);
        setEvaluation(cached ? { ...cached } : { type: "centipawn", value: 0 });
        if (!enabled) return;

        const engine = new Engine(EngineVersion.STOCKFISH_17_LITE);
        let cancelled = false;
        function update(next: Evaluation) {
            if (cancelled || requestId != requestRef.current) return;
            cacheRef.current.set(fen, next);
            setEvaluation({ ...next });
        }
        engine.setThreadCount(1).setLineCount(1).setPosition(fen);
        void engine.evaluate({
            depth: 16,
            timeLimit: 1200,
            onEngineLine: line => {
                if (line.index == 1 && line.depth >= 1) update(line.evaluation);
            }
        }).then(lines => {
            const finalLine = lines.filter(line => line.index == 1).at(-1);
            if (finalLine) update(finalLine.evaluation);
        }).catch(() => undefined).finally(() => engine.terminate());

        return () => {
            cancelled = true;
            requestRef.current++;
            engine.terminate();
        };
    }, [enabled, fen]);

    return evaluation;
}
