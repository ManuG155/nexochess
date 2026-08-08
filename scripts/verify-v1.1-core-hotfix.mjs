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
 * UCI commands must install their listeners before they are posted. This
 * remains a fundamental invariant even though visible positions now receive
 * fresh workers instead of depending on cancellation of an older search.
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

requireFragments("engine", "Stockfish lifecycle", [
    "private terminated = false;",
    "this.worker.terminate();",
    "if (!this.evaluating || this.terminated) return;",
    'await this.consumeLogs(\n            "stop",',
    'log => log.startsWith("bestmove")'
]);

/* The fallback evaluator for a parent position uses UCI movetime in ms. */
requireFragments("realtimeAnalyser", "Realtime variant fallback", [
    "async function ensureEngineLines(node: StateTreeNode)",
    "settings.engine.timeLimit * 1000",
    "await ensureEngineLines(targetNode.parent)",
    "analyseNode(targetNode"
]);
requireFragments("realtimeArea", "Realtime variant classification", [
    "key={currentStateTreeNode.state.fen}",
    "currentStateTreeNode.state.engineLines.concat(lines)",
    "dispatchCurrentNodeUpdate();",
    "currentEngineLines.length == 0",
    "void considerRealtimeAnalyse(currentStateTreeNode);"
]);

/*
 * Every displayed puzzle FEN owns a fresh lightweight Stockfish worker. This
 * deliberately avoids the old stop/reuse dependency that could leave the
 * evaluation bar waiting forever after a move.
 */
requireFragments("puzzles", "Dynamic puzzle evaluation", [
    "const engine = new Engine(EngineVersion.STOCKFISH_17_LITE);",
    ".setPosition(currentFen);",
    "line.depth >= 1",
    "evaluationCacheRef.current.set(currentFen, evaluation)",
    "new Chess(currentFen).turn() == \"w\"",
    "engine.terminate();"
]);
assert.ok(
    !files.puzzles.includes("evaluationEngineRef"),
    "Puzzles must not reuse one Stockfish worker across displayed FENs."
);
assert.ok(
    !files.puzzles.includes("evaluationEngineVersionRef"),
    "Puzzles must not retain an engine-version ref for a shared evaluation worker."
);

/*
 * react-chessboard's own arrow renderer is disabled. Right-drag gestures are
 * captured by NexoChess and both hints and manual arrows are routed through
 * the same overlay, whose knight geometry is L-shaped.
 */
requireFragments("puzzles", "Puzzle manual arrow rendering", [
    "const manualArrowStartRef = useRef<Square>();",
    "onPointerDownCapture={beginManualArrow}",
    "onPointerUpCapture={finishManualArrow}",
    "areArrowsAllowed={false}",
    "...manualArrows.map(([from, to, colour]) => ({",
    "<SuggestionArrowOverlay"
]);
assert.ok(
    !files.puzzles.includes("onArrowsChange={setManualArrows}"),
    "Puzzles must not delegate user-drawn arrows to react-chessboard."
);
requireFragments("arrows", "Knight L-arrow geometry", [
    "function isKnightShape(start: Point, end: Point): boolean",
    "function buildKnightArrowShape(",
    "const corner = getKnightCorner(start, target);"
]);

console.log(
    "Core v1.1 hotfix verification passed: visible analysis positions use isolated Stockfish workers, "
    + "variant classification has a valid fallback, and Puzzles evaluates each FEN independently "
    + "while all manual knight arrows use NexoChess L-shaped geometry."
);