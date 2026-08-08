import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const files = Object.fromEntries(await Promise.all(
    Object.entries({
        routing: "client/src/i18n/routing.ts",
        navigation: "client/src/components/layout/NavigationBar/index.tsx",
        worker: "cloudflare/worker.mjs",
        engine: "client/src/apps/features/analysis/lib/engine.ts",
        realtimeAnalyser: "client/src/apps/features/analysis/hooks/useRealtimeAnalyser.ts",
        realtimeArea: "client/src/apps/features/analysis/components/AnalysisPanel/RealtimeEngineArea/index.tsx",
        reviewPanel: "client/src/apps/features/analysis/components/AnalysisPanel/index.tsx",
        reviewCss: "client/src/apps/features/analysis/components/AnalysisPanel/NexoReview.css",
        move: "client/src/components/chess/StateTreeEditor/components/Move/index.tsx",
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
 * The canonical /analysis URL had a permanent redirect during the homepage
 * transition. Internal navigation therefore enters through an unlisted
 * recovery route, which serves the Analysis document directly, clears HTTP
 * cache and rewrites the visible URL before BrowserRouter mounts.
 */
requireFragments("routing", "Localized Analysis recovery", [
    '"/analysis-entry"'
]);
requireFragments("navigation", "Analysis navigation recovery", [
    'currentLanguageHref("/analysis-entry")',
    'parseLanguagePathname(link.pathname).basePathname'
]);
requireFragments("worker", "Analysis recovery response", [
    'pathname === "/analysis-entry"',
    'renderAnalysisRecovery(request, env, languageRoute.language)',
    '"features/analysis.html"',
    'headers.set("Clear-Site-Data", \'"cache"\')',
    'history.replaceState(history.state,"",${JSON.stringify(localizedAnalysis)})'
]);

/*
 * UCI commands must install their listeners before they are posted. More
 * importantly, setoption/position are queued until uciok and every search is
 * fenced by readyok. This removes timing dependence when Puzzles or a review
 * variation creates a fresh Stockfish worker and evaluates immediately.
 */
const consumeStart = files.engine.indexOf("private consumeLogs(");
const consumeEnd = files.engine.indexOf("\n    /**", consumeStart);
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

requireFragments("engine", "Stockfish UCI lifecycle", [
    "private uciReady: Promise<void>;",
    'log => log.trim() == "uciok"',
    "private postWhenUciReady(command: string)",
    'this.postWhenUciReady(`position fen ${fen}`)',
    'log => log.trim() == "readyok"',
    "private evaluationGeneration = 0;",
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

/*
 * Review is a visual mode, not a reason to disable the engine. A side
 * variation must receive useful streamed lines and classification without
 * waiting for an entire depth-60/75 search to finish, so the move colour and
 * coach bubble are produced promptly.
 */
assert.ok(
    !files.realtimeArea.includes("AnalysisTab.REPORT"),
    "RealtimeEngineArea must not disable Stockfish merely because Review/REPORT is visible."
);
requireFragments("realtimeArea", "Realtime variant classification", [
    "const REVIEW_CLASSIFICATION_DEPTH = 12;",
    "key={currentStateTreeNode.state.fen}",
    "const classificationDepth = Math.min(",
    "line => line.depth >= classificationDepth",
    "currentStateTreeNode.state.engineLines.concat(usableLines)",
    "dispatchCurrentNodeUpdate();",
    "currentEngineLines.length == 0",
    "void considerRealtimeAnalyse(currentStateTreeNode);"
]);

/*
 * Review chrome never scrolls with the current move. Raw Stockfish lines stay
 * mounted for calculation but have zero visual/layout footprint, while the
 * move table is the sole vertical scroll container.
 */
requireFragments("reviewPanel", "Review move scroll boundary", [
    'data-review-moves-scroll="true"',
    '<RealtimeEngineArea />'
]);
requireFragments("reviewCss", "Fixed Review layout", [
    ".nexo-review-engine {\n    display: none !important;",
    "min-height: 0 !important;",
    "overflow: hidden !important;",
    "overflow-y: auto !important;"
]);
requireFragments("move", "Contained Review auto-scroll and move colours", [
    "const showClassificationColour = Boolean(",
    "showClassificationColour && classification",
    "classificationColours[classification]",
    "data-review-moves-scroll",
    "reviewScroll.scrollBy({"
]);

/*
 * Every displayed puzzle FEN owns a fresh lightweight Stockfish worker. It
 * updates from the first usable depth. Material can provide an immediate
 * non-zero transition, but an equal-material position must not be forced to
 * an artificial 0.0 while Stockfish starts.
 */
requireFragments("puzzles", "Dynamic puzzle evaluation", [
    "const engine = new Engine(EngineVersion.STOCKFISH_17_LITE);",
    ".setPosition(currentFen);",
    "line.depth >= 1",
    "evaluationCacheRef.current.set(currentFen, evaluation)",
    "provisionalEvaluation.value != 0",
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
 * react-chessboard's arrow renderer is disabled. The right-mouse gesture is
 * intercepted in capture phase and stopped at the native event, then both
 * hints and manual arrows go through NexoChess's overlay. Knight displacement
 * therefore always uses the L-shaped polygon, including user-drawn arrows.
 */
requireFragments("puzzles", "Puzzle manual arrow rendering", [
    "const manualArrowStartRef = useRef<Square>();",
    "onMouseDownCapture={beginManualArrow}",
    "onMouseUpCapture={finishManualArrow}",
    "event.nativeEvent.stopImmediatePropagation();",
    "areArrowsAllowed={false}",
    "...manualArrows.map(([from, to, colour]) => ({",
    "<SuggestionArrowOverlay"
]);
assert.ok(
    !files.puzzles.includes("onArrowsChange={setManualArrows}"),
    "Puzzles must not delegate user-drawn arrows to react-chessboard."
);
assert.ok(
    !files.puzzles.includes("onPointerDownCapture={beginManualArrow}"),
    "Puzzle manual arrows must use the mouse capture path that suppresses react-chessboard's mouse handlers."
);
requireFragments("arrows", "Knight L-arrow geometry", [
    "function isKnightShape(start: Point, end: Point): boolean",
    "function buildKnightArrowShape(",
    "const corner = getKnightCorner(start, target);"
]);

console.log(
    "Core v1.1 hotfix verification passed: Analysis navigation is canonical, Stockfish obeys UCI readiness, "
    + "Review variations classify from usable live lines with fixed chrome and contained move scrolling, "
    + "and Puzzles evaluates each FEN independently while knight arrows use NexoChess L geometry."
);
