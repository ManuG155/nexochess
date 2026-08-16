import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { StatusCodes } from "http-status-codes";

import EngineVersion from "shared/constants/EngineVersion";
import { Classification } from "shared/constants/Classification";
import type AnalysedGame from "shared/types/game/AnalysedGame";
import type { EngineLine } from "shared/types/game/position/EngineLine";
import { getTopEngineLine, pickEngineLines } from "shared/types/game/position/EngineLine";
import parseStateTree from "shared/lib/stateTree/parse";

import useSettingsStore from "@/stores/SettingsStore";
import { createCustomPieces, normalisePieceTheme } from "@/lib/chessAppearance";
import { playBoardMoveSound } from "@/lib/boardSounds";
import parsePgn from "@/lib/games/pgn";
import { archiveGame } from "@/lib/gameArchive";
import { currentLanguageHref } from "@/i18n/routing";
import Engine from "@analysis/lib/engine";
import createGameEvaluator from "@analysis/lib/evaluate";
import { analyseStateTree } from "@analysis/lib/reporter";
import {
    classificationColours,
    classificationImages
} from "@analysis/constants/classifications";

import { ENGINE_LEVELS, getEngineLevel } from "./engineLevels";
import * as styles from "./enginePlay.module.css";

type PlayerColour = "white" | "black";
type Phase = "setup" | "playing";
type LiveQuality =
    | Classification.BEST
    | Classification.EXCELLENT
    | Classification.OKAY
    | Classification.INACCURACY
    | Classification.MISTAKE
    | Classification.BLUNDER;

type PlayedMove = {
    san: string;
    uci: string;
    colour: PlayerColour;
    quality?: LiveQuality;
};

type MoveFeedback = {
    quality: LiveQuality;
    san: string;
    threat?: [Square, Square, string];
    decisionRequired: boolean;
};

const START_FEN = new Chess().fen();
const QUALITY_DEPTH = 12;
const QUALITY_TIME_MS = 260;
const BAD_MOVE_QUALITIES = new Set<LiveQuality>([
    Classification.MISTAKE,
    Classification.BLUNDER
]);

function colourFromTurn(turn: "w" | "b"): PlayerColour {
    return turn == "w" ? "white" : "black";
}

function uciFromMove(move: { from: string; to: string; promotion?: string }) {
    return `${move.from}${move.to}${move.promotion || ""}`;
}

function evaluationScore(line?: EngineLine) {
    if (!line) return 0;
    if (line.evaluation.type == "centipawn") return line.evaluation.value;

    const value = line.evaluation.value;
    const sign = value < 0 ? -1 : 1;
    return sign * (100000 - Math.min(Math.abs(value), 99) * 900);
}

function classifyPlayerMove(
    before: EngineLine | undefined,
    after: EngineLine | undefined,
    playerColour: PlayerColour
): LiveQuality {
    const beforeScore = evaluationScore(before);
    const afterScore = evaluationScore(after);
    const rawLoss = playerColour == "white"
        ? beforeScore - afterScore
        : afterScore - beforeScore;
    const loss = Math.max(0, rawLoss);

    if (loss <= 15) return Classification.BEST;
    if (loss <= 45) return Classification.EXCELLENT;
    if (loss <= 100) return Classification.OKAY;
    if (loss <= 180) return Classification.INACCURACY;
    if (loss <= 320) return Classification.MISTAKE;
    return Classification.BLUNDER;
}

function threatArrow(line?: EngineLine): MoveFeedback["threat"] {
    const uci = line?.moves[0]?.uci;
    if (!uci || uci.length < 4) return undefined;
    return [uci.slice(0, 2) as Square, uci.slice(2, 4) as Square, "#ef5350"];
}

function RobotAvatar({ compact = false }: { compact?: boolean }) {
    return <div className={compact ? styles.robotCompact : styles.robotAvatar} aria-hidden="true">
        <svg viewBox="0 0 120 120" role="img">
            <path d="M60 17v12"/>
            <circle cx="60" cy="13" r="6"/>
            <rect x="24" y="29" width="72" height="62" rx="20"/>
            <circle cx="47" cy="56" r="7"/>
            <circle cx="73" cy="56" r="7"/>
            <path d="M44 75h32"/>
            <path d="M24 51H13v22h11M96 51h11v22H96"/>
            <path d="M40 91v13M80 91v13M32 104h16M72 104h16"/>
        </svg>
    </div>;
}

function EnginePlayApp() {
    const { t } = useTranslation("enginePlay");
    const settings = useSettingsStore(state => state.settings);
    const pieces = useMemo(
        () => createCustomPieces(normalisePieceTheme(settings.themes.piece)),
        [settings.themes.piece]
    );

    const [phase, setPhase] = useState<Phase>("setup");
    const [selectedElo, setSelectedElo] = useState(1000);
    const [playerColour, setPlayerColour] = useState<PlayerColour>("white");
    const [fen, setFen] = useState(START_FEN);
    const [positions, setPositions] = useState<string[]>([START_FEN]);
    const [moves, setMoves] = useState<PlayedMove[]>([]);
    const [viewIndex, setViewIndex] = useState(0);
    const [selectedFrom, setSelectedFrom] = useState<Square>();
    const [thinking, setThinking] = useState(false);
    const [coachText, setCoachText] = useState(t("coach.setup"));
    const [feedback, setFeedback] = useState<MoveFeedback>();
    const [gameResult, setGameResult] = useState<"win" | "loss" | "draw">();
    const [endDialogOpen, setEndDialogOpen] = useState(false);
    const [analysisBusy, setAnalysisBusy] = useState(false);
    const [analysisError, setAnalysisError] = useState<string>();

    const gameRef = useRef(new Chess());
    const qualityEngineRef = useRef<Engine>();
    const opponentEngineRef = useRef<Engine>();
    const baselineRef = useRef<EngineLine>();
    const sessionRef = useRef(0);

    const level = getEngineLevel(selectedElo);
    const latestIndex = positions.length - 1;
    const reviewing = phase == "playing" && viewIndex != latestIndex;
    const boardFen = positions[viewIndex] || fen;
    const boardOrientation = playerColour;
    const outsideCoordinates = settings.themes.board.coordinates == "outside";
    const ranks = boardOrientation == "white"
        ? ["8", "7", "6", "5", "4", "3", "2", "1"]
        : ["1", "2", "3", "4", "5", "6", "7", "8"];
    const files = boardOrientation == "white"
        ? ["a", "b", "c", "d", "e", "f", "g", "h"]
        : ["h", "g", "f", "e", "d", "c", "b", "a"];

    useEffect(() => () => {
        qualityEngineRef.current?.terminate();
        opponentEngineRef.current?.terminate();
    }, []);

    useEffect(() => {
        if (phase == "setup") setCoachText(t("coach.setup"));
    }, [t, phase]);

    function createSessionEngines() {
        qualityEngineRef.current?.terminate();
        opponentEngineRef.current?.terminate();

        const qualityEngine = new Engine(EngineVersion.STOCKFISH_17_LITE);
        qualityEngine.setLineCount(1);
        qualityEngineRef.current = qualityEngine;

        const opponentEngine = new Engine(EngineVersion.STOCKFISH_17_LITE);
        opponentEngine.setLineCount(8);
        opponentEngineRef.current = opponentEngine;
    }

    async function strongEvaluation(positionFen: string, session: number) {
        const engine = qualityEngineRef.current;
        if (!engine || session != sessionRef.current) return undefined;
        engine.setPosition(positionFen);
        const lines = await engine.evaluate({
            depth: QUALITY_DEPTH,
            timeLimit: QUALITY_TIME_MS
        });
        if (session != sessionRef.current) return undefined;
        return getTopEngineLine(lines);
    }

    async function primePlayerTurn(session: number) {
        if (session != sessionRef.current || gameRef.current.isGameOver()) return;
        setThinking(true);
        setCoachText(t("coach.reading"));
        baselineRef.current = await strongEvaluation(gameRef.current.fen(), session);
        if (session != sessionRef.current) return;
        setThinking(false);
        setCoachText(t("coach.yourTurn"));
    }

    function appendMove(move: PlayedMove, nextFen: string) {
        setMoves(current => [...current, move]);
        setPositions(current => {
            const next = [...current, nextFen];
            setViewIndex(next.length - 1);
            return next;
        });
        setFen(nextFen);
    }

    function setLastMoveQuality(quality: LiveQuality) {
        setMoves(current => current.map((move, index) => (
            index == current.length - 1 ? { ...move, quality } : move
        )));
    }

    function gameOutcome() {
        const board = gameRef.current;
        if (!board.isGameOver()) return undefined;
        if (!board.isCheckmate()) return "draw" as const;
        const losingColour = colourFromTurn(board.turn());
        return losingColour == playerColour ? "loss" as const : "win" as const;
    }

    function finishGame(result?: "win" | "loss" | "draw") {
        const resolved = result || gameOutcome() || "draw";
        const notation = resolved == "draw"
            ? "1/2-1/2"
            : (resolved == "win") == (playerColour == "white")
                ? "1-0"
                : "0-1";
        gameRef.current.setHeader("Result", notation);
        setGameResult(resolved);
        setThinking(false);
        setFeedback(undefined);
        setCoachText(t(`coach.end.${resolved}`));
        setEndDialogOpen(true);
    }

    async function chooseEngineMove(session: number) {
        const engine = opponentEngineRef.current;
        const board = gameRef.current;
        if (!engine || session != sessionRef.current || board.isGameOver()) return undefined;

        const currentFen = board.fen();
        engine.setPosition(currentFen);
        const lines = await engine.evaluate({
            depth: level.depth,
            timeLimit: level.timeMs
        });
        if (session != sessionRef.current) return undefined;

        const legalCount = board.moves().length;
        const lineCount = Math.max(1, Math.min(8, legalCount));
        const lineSet = pickEngineLines(currentFen, lines, {
            count: lineCount,
            source: EngineVersion.STOCKFISH_17_LITE
        });
        const candidates = lineSet?.length ? lineSet : [getTopEngineLine(lines)].filter(Boolean) as EngineLine[];
        if (!candidates.length) return undefined;

        const strength = (level.elo - 250) / 2750;
        const candidateIndex = Math.round((1 - strength) * (candidates.length - 1));
        return candidates[Math.min(candidateIndex, candidates.length - 1)]?.moves[0]?.uci;
    }

    async function playEngineMove(session: number) {
        if (session != sessionRef.current || gameRef.current.isGameOver()) return;
        setFeedback(undefined);
        setThinking(true);
        setSelectedFrom(undefined);
        setCoachText(t("coach.thinking"));

        try {
            const uci = await chooseEngineMove(session);
            if (!uci || session != sessionRef.current) return;
            const move = gameRef.current.move({
                from: uci.slice(0, 2),
                to: uci.slice(2, 4),
                promotion: uci[4] || "q"
            });
            const nextFen = gameRef.current.fen();
            appendMove({
                san: move.san,
                uci: uciFromMove(move),
                colour: playerColour == "white" ? "black" : "white"
            }, nextFen);
            playBoardMoveSound(move.san);
            setCoachText(t("coach.engineMove", { move: move.san }));

            if (gameRef.current.isGameOver()) {
                finishGame();
                return;
            }

            await primePlayerTurn(session);
        } catch (error) {
            console.error(error);
            if (session == sessionRef.current) {
                setThinking(false);
                setCoachText(t("coach.engineError"));
            }
        }
    }

    async function startGame() {
        const session = ++sessionRef.current;
        createSessionEngines();

        const board = new Chess();
        const date = new Date().toISOString().slice(0, 10).replaceAll("-", ".");
        const stockfishName = `Stockfish ${selectedElo}`;
        board.setHeader("Event", "NexoChess Motor");
        board.setHeader("Site", "NexoChess");
        board.setHeader("Date", date);
        board.setHeader("White", playerColour == "white" ? "NexoChess Player" : stockfishName);
        board.setHeader("Black", playerColour == "black" ? "NexoChess Player" : stockfishName);
        board.setHeader(playerColour == "white" ? "BlackElo" : "WhiteElo", String(selectedElo));
        board.setHeader("Result", "*");
        gameRef.current = board;
        baselineRef.current = undefined;

        setPhase("playing");
        setFen(board.fen());
        setPositions([board.fen()]);
        setMoves([]);
        setViewIndex(0);
        setSelectedFrom(undefined);
        setFeedback(undefined);
        setGameResult(undefined);
        setEndDialogOpen(false);
        setAnalysisBusy(false);
        setAnalysisError(undefined);
        setCoachText(t("coach.intro", { elo: selectedElo }));

        if (playerColour == "white") {
            await primePlayerTurn(session);
        } else {
            await playEngineMove(session);
        }
    }

    async function acceptUserMove(
        source: Square,
        target: Square
    ) {
        if (
            phase != "playing"
            || thinking
            || gameResult
            || feedback?.decisionRequired
            || reviewing
            || colourFromTurn(gameRef.current.turn()) != playerColour
        ) return false;

        const session = sessionRef.current;
        const beforeLine = baselineRef.current;
        let move;
        try {
            move = gameRef.current.move({ from: source, to: target, promotion: "q" });
        } catch {
            setSelectedFrom(undefined);
            return false;
        }
        if (!move) return false;

        const nextFen = gameRef.current.fen();
        appendMove({
            san: move.san,
            uci: uciFromMove(move),
            colour: playerColour
        }, nextFen);
        playBoardMoveSound(move.san);
        setSelectedFrom(undefined);
        setThinking(true);
        setCoachText(t("coach.checking", { move: move.san }));

        if (gameRef.current.isGameOver()) {
            setLastMoveQuality(Classification.BEST);
            finishGame();
            return true;
        }

        try {
            const afterLine = await strongEvaluation(nextFen, session);
            if (session != sessionRef.current) return true;
            const quality = classifyPlayerMove(beforeLine, afterLine, playerColour);
            const decisionRequired = BAD_MOVE_QUALITIES.has(quality);
            const nextFeedback: MoveFeedback = {
                quality,
                san: move.san,
                decisionRequired,
                threat: decisionRequired ? threatArrow(afterLine) : undefined
            };
            setLastMoveQuality(quality);
            setFeedback(nextFeedback);
            setThinking(false);
            setCoachText(t(`coach.quality.${quality}`, { move: move.san }));

            if (!decisionRequired) {
                window.setTimeout(() => {
                    if (session == sessionRef.current) void playEngineMove(session);
                }, 720);
            }
        } catch (error) {
            console.error(error);
            if (session == sessionRef.current) {
                setThinking(false);
                setFeedback(undefined);
                void playEngineMove(session);
            }
        }

        return true;
    }

    function retryMove() {
        if (!feedback?.decisionRequired || thinking) return;
        gameRef.current.undo();
        setMoves(current => current.slice(0, -1));
        setPositions(current => {
            const next = current.slice(0, -1);
            setViewIndex(Math.max(0, next.length - 1));
            return next;
        });
        setFen(gameRef.current.fen());
        setFeedback(undefined);
        setSelectedFrom(undefined);
        setCoachText(t("coach.retry"));
    }

    function continueAfterError() {
        if (!feedback?.decisionRequired || thinking) return;
        const session = sessionRef.current;
        baselineRef.current = undefined;
        setFeedback(undefined);
        void playEngineMove(session);
    }

    function handleSquareClick(squareName: string) {
        if (
            phase != "playing"
            || thinking
            || gameResult
            || feedback?.decisionRequired
            || reviewing
        ) return;

        const square = squareName as Square;
        const board = gameRef.current;
        const piece = board.get(square);
        const playerPieceColour = playerColour == "white" ? "w" : "b";

        if (!selectedFrom) {
            if (piece?.color == playerPieceColour && board.turn() == playerPieceColour) {
                setSelectedFrom(square);
            }
            return;
        }

        if (selectedFrom == square) {
            setSelectedFrom(undefined);
            return;
        }

        if (piece?.color == playerPieceColour) {
            setSelectedFrom(square);
            return;
        }

        void acceptUserMove(selectedFrom, square);
    }

    function moveListRows() {
        const rows: Array<{ number: number; white?: { move: PlayedMove; index: number }; black?: { move: PlayedMove; index: number } }> = [];
        moves.forEach((move, index) => {
            const rowIndex = Math.floor(index / 2);
            if (!rows[rowIndex]) rows[rowIndex] = { number: rowIndex + 1 };
            const entry = { move, index };
            if (move.colour == "white") rows[rowIndex].white = entry;
            else rows[rowIndex].black = entry;
        });
        return rows;
    }

    async function analyseFinishedGame() {
        if (!gameResult || analysisBusy) return;
        setAnalysisBusy(true);
        setAnalysisError(undefined);

        try {
            const pgn = gameRef.current.pgn({ maxWidth: 0, newline: "\n" });
            const importedGame = parsePgn(pgn);
            const analysisGame: AnalysedGame = {
                ...importedGame,
                stateTree: parseStateTree(importedGame)
            };
            const analysisSettings = settings.analysis;
            const evaluator = createGameEvaluator(analysisGame, {
                engineVersion: analysisSettings.engine.version,
                engineDepth: analysisSettings.engine.depth,
                engineTimeLimit: analysisSettings.engine.timeLimitEnabled
                    ? analysisSettings.engine.timeLimit
                    : undefined,
                cloudEngineLines: analysisSettings.engine.lines,
                maxEngineCount: 4,
                engineConfig: engine => engine.setLineCount(analysisSettings.engine.lines)
            });
            await evaluator.evaluate();

            const report = await analyseStateTree(analysisGame.stateTree, {
                includeBrilliant: analysisSettings.classifications.included.brilliant,
                includeCritical: analysisSettings.classifications.included.critical,
                includeTheory: analysisSettings.classifications.included.theory,
                whiteRating: analysisGame.players.white.rating,
                blackRating: analysisGame.players.black.rating
            });
            if (report.status != StatusCodes.OK || !report.gameAnalysis) {
                throw new Error("report_failed");
            }

            const completedGame: AnalysedGame = {
                ...analysisGame,
                ...report.gameAnalysis
            };
            const archived = await archiveGame(completedGame);
            if (!archived.id) throw new Error("archive_failed");

            const href = new URL(currentLanguageHref("/analysis"), window.location.origin);
            href.searchParams.set("game", archived.id);
            window.location.assign(`${href.pathname}${href.search}`);
        } catch (error) {
            console.error(error);
            setAnalysisError(t("end.analysisError"));
            setAnalysisBusy(false);
        }
    }

    const squareStyles: NonNullable<React.ComponentProps<typeof Chessboard>["customSquareStyles"]> = {};
    if (selectedFrom && !reviewing) {
        squareStyles[selectedFrom] = {
            boxShadow: "inset 0 0 0 4px rgba(83, 181, 238, .92)"
        };
        if (settings.themes.board.legalMoveHints) {
            try {
                gameRef.current.moves({ square: selectedFrom, verbose: true }).forEach(move => {
                    const target = move.to as Square;
                    squareStyles[target] = gameRef.current.get(target)
                        ? { boxShadow: "inset 0 0 0 5px rgba(18, 28, 39, .34)" }
                        : { backgroundImage: "radial-gradient(circle, rgba(18, 28, 39, .42) 0 16%, transparent 17%)" };
                });
            } catch {
                // Ignore stale selection while the engine is changing position.
            }
        }
    }

    const boardArrows = feedback?.threat && viewIndex == latestIndex
        ? [feedback.threat]
        : [];

    return <main className={styles.shell}>
        <header className={styles.hero}>
            <div>
                <span>{t("eyebrow")}</span>
                <h1>{t("title")}</h1>
                <p>{t("subtitle")}</p>
            </div>
            {phase == "playing" && <button
                type="button"
                className={styles.changeGameButton}
                onClick={() => {
                    ++sessionRef.current;
                    qualityEngineRef.current?.terminate();
                    opponentEngineRef.current?.terminate();
                    setPhase("setup");
                    setThinking(false);
                    setFeedback(undefined);
                    setGameResult(undefined);
                    setFen(START_FEN);
                    setPositions([START_FEN]);
                    setViewIndex(0);
                }}
            >
                {t("actions.changeSetup")}
            </button>}
        </header>

        <section className={styles.stage}>
            <div className={styles.boardColumn}>
                <div className={styles.playerStrip} data-side="opponent">
                    <RobotAvatar compact/>
                    <div>
                        <strong>Stockfish</strong>
                        <span>{t(`levels.${level.labelKey}`)} · {selectedElo}</span>
                    </div>
                    {thinking && <i className={styles.thinkingDot}>{t("thinking")}</i>}
                </div>

                <div className={styles.boardOuter} data-coordinates={outsideCoordinates ? "outside" : "inside"}>
                    {outsideCoordinates && <div className={styles.rankCoordinates} aria-hidden="true">
                        {ranks.map(rank => <span key={rank}>{rank}</span>)}
                    </div>}
                    <div className={styles.boardFrame}>
                        <Chessboard
                            id="nexochess-engine-board"
                            position={boardFen}
                            boardOrientation={boardOrientation}
                            arePiecesDraggable={
                                phase == "playing"
                                && !thinking
                                && !gameResult
                                && !feedback?.decisionRequired
                                && !reviewing
                                && colourFromTurn(gameRef.current.turn()) == playerColour
                            }
                            onPieceDrop={(source, target) => {
                                void acceptUserMove(source as Square, target as Square);
                                return true;
                            }}
                            onPieceDragBegin={(_piece, source) => setSelectedFrom(source as Square)}
                            onPieceDragEnd={() => setSelectedFrom(undefined)}
                            onSquareClick={handleSquareClick}
                            customPieces={pieces}
                            customLightSquareStyle={{ backgroundColor: settings.themes.board.lightSquareColour }}
                            customDarkSquareStyle={{ backgroundColor: settings.themes.board.darkSquareColour }}
                            customSquareStyles={squareStyles}
                            customArrows={boardArrows}
                            showBoardNotation={!outsideCoordinates}
                            snapToCursor
                        />
                    </div>
                    {outsideCoordinates && <div className={styles.fileCoordinates} aria-hidden="true">
                        {files.map(file => <span key={file}>{file}</span>)}
                    </div>}
                </div>

                <div className={styles.playerStrip} data-side="player">
                    <span className={styles.playerAvatar}>♟</span>
                    <div>
                        <strong>{t("you")}</strong>
                        <span>{playerColour == "white" ? t("white") : t("black")}</span>
                    </div>
                    {reviewing && <button type="button" onClick={() => setViewIndex(latestIndex)}>
                        {t("actions.returnLive")}
                    </button>}
                </div>
            </div>

            <aside className={styles.sidePanel}>
                {phase == "setup" ? <>
                    <div className={styles.coachCard}>
                        <RobotAvatar/>
                        <div className={styles.coachBubble}>
                            <strong>Stockfish</strong>
                            <p>{t("coach.setup")}</p>
                        </div>
                    </div>

                    <section className={styles.setupCard}>
                        <div className={styles.setupHeading}>
                            <span>{t("setup.difficulty")}</span>
                            <strong>{t(`levels.${level.labelKey}`)} · {selectedElo}</strong>
                        </div>
                        <div className={styles.levelList}>
                            {ENGINE_LEVELS.map(item => <button
                                key={item.elo}
                                type="button"
                                data-selected={selectedElo == item.elo}
                                onClick={() => setSelectedElo(item.elo)}
                            >
                                <span>{t(`levels.${item.labelKey}`)}</span>
                                <b>{item.elo}</b>
                            </button>)}
                        </div>

                        <div className={styles.colourPicker}>
                            <span>{t("setup.playAs")}</span>
                            <div>
                                <button
                                    type="button"
                                    data-selected={playerColour == "white"}
                                    onClick={() => setPlayerColour("white")}
                                >♔ {t("white")}</button>
                                <button
                                    type="button"
                                    data-selected={playerColour == "black"}
                                    onClick={() => setPlayerColour("black")}
                                >♚ {t("black")}</button>
                            </div>
                        </div>

                        <p className={styles.eloNote}>{t("setup.eloNote")}</p>
                        <button type="button" className={styles.primaryButton} onClick={() => void startGame()}>
                            {t("actions.play")}
                        </button>
                    </section>
                </> : <>
                    <div className={styles.coachCard}>
                        <RobotAvatar/>
                        <div className={styles.coachBubble}>
                            <strong>Stockfish</strong>
                            <p>{coachText}</p>
                        </div>
                    </div>

                    {feedback && <section
                        className={styles.feedbackCard}
                        style={{ borderColor: classificationColours[feedback.quality] }}
                    >
                        <img src={classificationImages[feedback.quality]} alt=""/>
                        <div>
                            <span>{t("moveQuality")}</span>
                            <strong style={{ color: classificationColours[feedback.quality] }}>
                                {t(`quality.${feedback.quality}`)}
                            </strong>
                            <small>{feedback.san}</small>
                        </div>
                        {feedback.decisionRequired && <div className={styles.feedbackActions}>
                            <button type="button" onClick={retryMove}>{t("actions.retry")}</button>
                            <button type="button" onClick={continueAfterError}>{t("actions.continue")}</button>
                        </div>}
                    </section>}

                    <section className={styles.movesCard}>
                        <header>
                            <div>
                                <span>{t("game.title")}</span>
                                <strong>{t("game.vs", { elo: selectedElo })}</strong>
                            </div>
                            {gameResult && !endDialogOpen && <button type="button" onClick={() => setEndDialogOpen(true)}>
                                {t("actions.result")}
                            </button>}
                        </header>

                        <div className={styles.moveList}>
                            {moveListRows().length == 0 && <p>{t("game.noMoves")}</p>}
                            {moveListRows().map(row => <div key={row.number} className={styles.moveRow}>
                                <span>{row.number}.</span>
                                {[row.white, row.black].map((entry, slot) => entry
                                    ? <button
                                        key={`${row.number}-${slot}`}
                                        type="button"
                                        data-active={viewIndex == entry.index + 1}
                                        onClick={() => setViewIndex(entry.index + 1)}
                                    >
                                        {entry.move.san}
                                        {entry.move.quality && <i style={{ background: classificationColours[entry.move.quality] }}/>} 
                                    </button>
                                    : <span key={`${row.number}-${slot}`} />)}
                            </div>)}
                        </div>

                        <div className={styles.traverser}>
                            <button type="button" onClick={() => setViewIndex(0)} disabled={viewIndex == 0}>|‹</button>
                            <button type="button" onClick={() => setViewIndex(index => Math.max(0, index - 1))} disabled={viewIndex == 0}>‹</button>
                            <span>{viewIndex} / {latestIndex}</span>
                            <button type="button" onClick={() => setViewIndex(index => Math.min(latestIndex, index + 1))} disabled={viewIndex == latestIndex}>›</button>
                            <button type="button" onClick={() => setViewIndex(latestIndex)} disabled={viewIndex == latestIndex}>›|</button>
                        </div>

                        {!gameResult && <button
                            type="button"
                            className={styles.resignButton}
                            onClick={() => finishGame("loss")}
                            disabled={thinking}
                        >
                            {t("actions.resign")}
                        </button>}
                    </section>
                </>}
            </aside>
        </section>

        {endDialogOpen && gameResult && <div className={styles.modalOverlay} onMouseDown={event => {
            if (event.target == event.currentTarget && !analysisBusy) setEndDialogOpen(false);
        }}>
            <section className={styles.endDialog} role="dialog" aria-modal="true" aria-labelledby="engine-result-title">
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={() => setEndDialogOpen(false)}
                    disabled={analysisBusy}
                    aria-label={t("actions.close")}
                >×</button>
                <RobotAvatar/>
                <span className={styles.endKicker}>{t("end.kicker")}</span>
                <h2 id="engine-result-title">{t(`end.${gameResult}.title`)}</h2>
                <p>{t(`end.${gameResult}.body`, { elo: selectedElo })}</p>
                {analysisBusy && <div className={styles.analysisProgress}>
                    <i/>
                    <span>{t("end.analysing")}</span>
                </div>}
                {analysisError && <p className={styles.analysisError}>{analysisError}</p>}
                <div className={styles.endActions}>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => void analyseFinishedGame()}
                        disabled={analysisBusy}
                    >
                        {t("actions.analyse")}
                    </button>
                    <button
                        type="button"
                        onClick={() => void startGame()}
                        disabled={analysisBusy}
                    >
                        {t("actions.playAgain")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setEndDialogOpen(false)}
                        disabled={analysisBusy}
                    >
                        {t("actions.close")}
                    </button>
                </div>
            </section>
        </div>}
    </main>;
}

export default EnginePlayApp;
