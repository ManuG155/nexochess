import { readFile } from "node:fs/promises";

async function source(path) {
    return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

function requireText(content, text, message) {
    if (!content.includes(text)) throw new Error(message);
}

function forbidText(content, text, message) {
    if (content.includes(text)) throw new Error(message);
}

const [
    routing,
    navigation,
    worker,
    engine,
    realtimeArea,
    puzzles
] = await Promise.all([
    source("client/src/i18n/routing.ts"),
    source("client/src/components/layout/NavigationBar/index.tsx"),
    source("cloudflare/worker.mjs"),
    source("client/src/apps/features/analysis/lib/engine.ts"),
    source("client/src/apps/features/analysis/components/AnalysisPanel/RealtimeEngineArea/index.tsx"),
    source("client/src/apps/features/puzzles/pages/Puzzles/index.tsx")
]);

requireText(
    routing,
    '"/analysis-entry"',
    "The localized Analysis recovery route is missing."
);
requireText(
    navigation,
    'currentLanguageHref("/analysis-entry")',
    "Analysis navigation must bypass stale permanent redirects through the recovery route."
);
requireText(
    worker,
    'pathname === "/analysis-entry"',
    "The Worker does not serve the Analysis recovery entry route."
);
requireText(
    worker,
    'history.replaceState(history.state,"",${JSON.stringify(localizedAnalysis)})',
    "The Analysis recovery response must restore the canonical visible URL before React mounts."
);
requireText(
    worker,
    'headers.set("Clear-Site-Data", \'"cache"\')',
    "The recovery path must clear stale browser HTTP cache."
);

requireText(
    engine,
    'log.trim() == "uciok"',
    "Stockfish startup must wait for uciok."
);
requireText(
    engine,
    'log.trim() == "readyok"',
    "Stockfish searches must wait for readyok."
);
requireText(
    engine,
    'private postWhenUciReady(command: string)',
    "UCI setoption/position commands must be serialized after uciok."
);
requireText(
    engine,
    'this.postWhenUciReady(`position fen ${fen}`)',
    "Engine positions must use the serialized UCI command queue."
);

forbidText(
    realtimeArea,
    "AnalysisTab.REPORT",
    "Realtime analysis must not be disabled merely because the review/report UI is open."
);
requireText(
    realtimeArea,
    "void considerRealtimeAnalyse(currentStateTreeNode)",
    "A newly evaluated variation must be classified after its engine lines arrive."
);

requireText(
    puzzles,
    "onMouseDownCapture={beginManualArrow}",
    "Puzzle manual arrows must intercept the mouse gesture before react-chessboard."
);
requireText(
    puzzles,
    "event.nativeEvent.stopImmediatePropagation()",
    "Puzzle manual-arrow gestures must not leak into react-chessboard's straight-arrow renderer."
);
requireText(
    puzzles,
    "areArrowsAllowed={false}",
    "Native react-chessboard arrows must stay disabled in Puzzles."
);
requireText(
    puzzles,
    "...manualArrows.map(([from, to, colour]) => ({",
    "Puzzle manual arrows must be rendered through the NexoChess arrow overlay."
);
requireText(
    puzzles,
    "new Engine(EngineVersion.STOCKFISH_17_LITE)",
    "Each puzzle position must use the local Stockfish evaluator."
);
requireText(
    puzzles,
    "line.depth >= 1",
    "Puzzle evaluation must update from the first usable Stockfish depth."
);

console.log("v1.1 functional hotfix verification passed: Analysis recovery, UCI readiness, review variations, Puzzle evaluation and manual arrows are wired.");
