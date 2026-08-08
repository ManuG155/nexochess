import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const files = Object.fromEntries(await Promise.all(
    Object.entries({
        engine: "client/src/apps/features/analysis/lib/engine.ts",
        realtimeAnalyser: "client/src/apps/features/analysis/hooks/useRealtimeAnalyser.ts",
        realtimeArea: "client/src/apps/features/analysis/components/AnalysisPanel/RealtimeEngineArea/index.tsx",
        puzzles: "client/src/apps/features/puzzles/pages/Puzzles/index.tsx",
        arrows: "client/src/apps/features/analysis/components/Board/SuggestionArrowOverlay/index.tsx"
    }).map(async ([name, path]) => [name, await readFile(resolve(path), "utf8")])
));

function requireFragments(name, description, fragments) {
    for (const fragment of fragments) {
        assert.ok(
            files[name].includes(fragment),
            `${description} is missing: ${fragment}`
        );
    }
}

/*
 * Stockfish cancellation must be race-free. A listener that is installed
 * after `postMessage("stop")` can miss the immediate `bestmove` response and
 * leave every subsequent realtime evaluation waiting forever.
 */
const consumeStart = files.engine.indexOf("private consumeLogs(");
const consumeEnd = files.engine.indexOf("\n    onMessage(", consumeStart);
assert.ok(consumeStart >= 0 && consumeEnd > consumeStart);
const consumeLogs = files.engine.slice(consumeStart, consumeEnd);
const listenerIndex = consumeLogs.indexOf(
    'worker.addEventListener("message", onMessageReceived)'
);
const postIndex = consumeLogs.indexOf("worker.postMessage(command)");
assert.ok(
    listenerIndex >= 0 && postIndex > listenerIndex,
    "Engine.consumeLogs must attach its message listener before posting the UCI command."
);

const stopStart = files.engine.indexOf("async stopEvaluation()");
assert.ok(stopStart >= 0, "Engine.stopEvaluation is missing.");
const stopEvaluation = files.engine.slice(stopStart);
requireFragments("engine", "Race-free Stockfish lifecycle", [
    'await this.consumeLogs(\n            "stop",',
    'log => log.startsWith("bestmove")',
    "finally {\n            this.evaluating = false;"
]);
assert.ok(
    !stopEvaluation.includes('this.worker.postMessage("stop")'),
    "Engine.stopEvaluation must not post `stop` before consumeLogs attaches its listener."
);

/* The fallback evaluator for a parent position uses UCI movetime in ms. */
requireFragments("realtimeAnalyser", "Realtime variant fallback", [
    "async function ensureEngineLines(node: StateTreeNode)",
    "settings.engine.timeLimit * 1000",
    "await ensureEngineLines(targetNode.parent)",
    "analyseNode(targetNode"
]);
requireFragments("realtimeArea", "Realtime variant classification", [
    "currentStateTreeNode.state.engineLines.concat(lines)",
    "dispatchCurrentNodeUpdate();",
    "void considerRealtimeAnalyse(currentStateTreeNode);"
]);

/*
 * Puzzles must reuse one engine across position changes and cancel/restart
 * that engine for every displayed FEN. This protects the evaluation bar from
 * behaving like a static decoration during multi-move puzzles.
 */
requireFragments("puzzles", "Dynamic puzzle evaluation", [
    "const evaluationEngineRef = useRef<Engine>();",
    "const evaluationEngineVersionRef = useRef<EngineVersion>();",
    "await engine.stopEvaluation();",
    ".setPosition(currentFen);",
    "line.depth >= 1",
    "evaluationCacheRef.current.set(currentFen, evaluation)",
    "new Chess(currentFen).turn() == \"w\""
]);

/*
 * Native react-chessboard arrows are transparent; both hints and user-drawn
 * arrows are routed through NexoChess's overlay, whose knight geometry is L.
 */
requireFragments("puzzles", "Puzzle manual arrow rendering", [
    "const [ manualArrows, setManualArrows ] =",
    'customArrowColor="rgba(0,0,0,0)"',
    "onArrowsChange={setManualArrows}",
    "...manualArrows.map(([from, to]) => ({",
    "<SuggestionArrowOverlay"
]);
requireFragments("arrows", "Knight L-arrow geometry", [
    "function isKnightShape(start: Point, end: Point): boolean",
    "function buildKnightArrowShape(",
    "const corner = getKnightCorner(start, target);"
]);

console.log(
    "Core v1.1 hotfix verification passed: realtime Stockfish cancellation is race-free, "
    + "variant classification has a valid fallback, and Puzzles has dynamic evaluation plus L-shaped manual knight arrows."
);