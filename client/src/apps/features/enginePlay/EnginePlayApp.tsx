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
import {
    getCoachById,
    getCoachReaction,
    getCoachSpokenLine
} from "@analysis/lib/coach";
import type { CoachExpression, CoachId } from "@analysis/lib/coach";
import CoachPicker from "@analysis/components/AnalysisPanel/CoachPicker";
import CoachPortrait from "@analysis/components/AnalysisPanel/CoachPortrait";

import { ENGINE_LEVELS, getEngineLevel } from "./engineLevels";
import { getTheoryMoves, isTheoryMove } from "./openingBook";
import * as styles from "./enginePlay.module.css";
import * as v3 from "./enginePlayV3.module.css";

type PlayerColour = "white" | "black";
type Phase = "setup" | "playing";
type LiveQuality =
    | Classification.THEORY
    | Classification.BEST
    | Classification.EXCELLENT
    | Classification.OKAY
    | Classification.INACCURACY
    | Classification.MISTAKE
    | Classification.BLUNDER;

type ThreatArrow = [Square, Square, string];

type PlayedMove = {
    san: string;
    uci: string;
    colour: PlayerColour;
    quality?: LiveQuality;
    decisionRequired?: boolean;
    threat?: ThreatArrow;
    forcedReplyUci?: string;
};

type MoveFeedback = {
    quality: LiveQuality;
    san: string;
    to: Square;
    threat?: ThreatArrow;
    forcedReplyUci?: string;
    decisionRequired: boolean;
};

type PersistedDuel = {
    version: 1;
    selectedElo: number;
    playerColour: PlayerColour;
    moves: PlayedMove[];
    redoStack: PlayedMove[];
};

const START_FEN = new Chess().fen();
const QUALITY_DEPTH = 10;
const QUALITY_TIME_MS = 140;
const DUEL_STORAGE_KEY = "nexochess_duel_active_v1";
const BAD_MOVE_QUALITIES = new Set<LiveQuality>([
    Classification.MISTAKE,
    Classification.BLUNDER
]);

function colourFromTurn(turn: "w" | "b"): PlayerColour {
    return turn == "w" ? "white" : "black";
}

function uciFromMove(move: { from: string; to: string; promotion?: string }) {
    return `${move.from}${move.to}${move.promotion || ""}`.toLowerCase();
}

function moveFromUci(uci: string) {
    return {
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4] || "q"
    };
}

function historyUci(board: Chess) {
    return board.history({ verbose: true }).map(uciFromMove);
}

function isLegalUci(board: Chess, uci: string) {
    return board.moves({ verbose: true }).some(move => uciFromMove(move) == uci.toLowerCase());
}

function isPlayedMove(value: unknown): value is PlayedMove {
    if (!value || typeof value != "object") return false;
    const candidate = value as Partial<PlayedMove>;
    return typeof candidate.san == "string"
        && typeof candidate.uci == "string"
        && (candidate.colour == "white" || candidate.colour == "black");
}

function isPersistedDuel(value: unknown): value is PersistedDuel {
    if (!value || typeof value != "object") return false;
    const candidate = value as Partial<PersistedDuel>;
    return candidate.version == 1
        && typeof candidate.selectedElo == "number"
        && (candidate.playerColour == "white" || candidate.playerColour == "black")
        && Array.isArray(candidate.moves)
        && candidate.moves.every(isPlayedMove)
        && Array.isArray(candidate.redoStack)
        && candidate.redoStack.every(isPlayedMove);
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

function threatArrow(line?: EngineLine): ThreatArrow | undefined {
    const uci = line?.moves[0]?.uci;
    if (!uci || uci.length < 4) return undefined;
    return [uci.slice(0, 2) as Square, uci.slice(2, 4) as Square, "#ef5350"];
}

function coachExpressionFor(
    thinking: boolean,
    feedback: MoveFeedback | undefined,
    gameResult: "win" | "loss" | "draw" | undefined
): CoachExpression {
    if (gameResult == "win") return "surprised";
    if (gameResult == "loss") return "celebrating";
    if (gameResult == "draw") return "approving";
    if (thinking) return "thinking";
    if (feedback?.quality == Classification.BLUNDER) return "error";
    if (feedback?.quality == Classification.MISTAKE) return "worried";
    if (feedback?.quality == Classification.INACCURACY) return "explaining";
    if (
        feedback?.quality == Classification.THEORY
        || feedback?.quality == Classification.BEST
        || feedback?.quality == Classification.EXCELLENT
    ) return "approving";
    return "idle";
}

function EnginePlayApp() {
    const { t, i18n } = useTranslation("enginePlay");
    const { t: coachT } = useTranslation("coach", { useSuspense: false });
    const settings = useSettingsStore(state => state.settings);
    const setSettings = useSettingsStore(state => state.setSettings);
    const selectedCoach = getCoachById(settings.appearance.selectedCoach);
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
    const [redoStack, setRedoStack] = useState<PlayedMove[]>([]);
    const [viewIndex, setViewIndex] = useState(0);
    const [selectedFrom, setSelectedFrom] = useState<Square>();
    const [thinking, setThinking] = useState(false);
    const [coachText, setCoachText] = useState("");
    const [coachPickerOpen, setCoachPickerOpen] = useState(false);
    const [feedback, setFeedback] = useState<MoveFeedback>();
    const [gameResult, setGameResult] = useState<"win" | "loss" | "draw">();
    const [endDialogOpen, setEndDialogOpen] = useState(false);
    const [analysisBusy, setAnalysisBusy] = useState(false);
    const [analysisError, setAnalysisError] = useState<string>();
    const [persistenceReady, setPersistenceReady] = useState(false);

    const gameRef = useRef(new Chess());
    const qualityEngineRef = useRef<Engine>();
    const opponentEngineRef = useRef<Engine>();
    const baselineRef = useRef<EngineLine>();
    const sessionRef = useRef(0);
    const resumeTimerRef = useRef<number>();
    const pendingRestoreRef = useRef(false);

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
    const coachExpression = coachExpressionFor(thinking, feedback, gameResult);

    function spoken(line: string, seed: string) {
        return getCoachSpokenLine(selectedCoach, line, seed, coachT);
    }

    useEffect(() => {
        document.title = `NexoChess · ${t("nav")}`;
    }, [i18n.resolvedLanguage, t]);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(DUEL_STORAGE_KEY);
            if (!stored) {
                setPersistenceReady(true);
                return;
            }

            const parsed: unknown = JSON.parse(stored);
            if (!isPersistedDuel(parsed) || !ENGINE_LEVELS.some(item => item.elo == parsed.selectedElo)) {
                window.localStorage.removeItem(DUEL_STORAGE_KEY);
                setPersistenceReady(true);
                return;
            }

            const board = new Chess();
            const restoredPositions = [board.fen()];
            const restoredMoves: PlayedMove[] = [];
            for (const storedMove of parsed.moves) {
                const replayed = board.move(moveFromUci(storedMove.uci));
                if (!replayed) throw new Error("invalid_persisted_move");
                restoredMoves.push({
                    ...storedMove,
                    san: replayed.san,
                    uci: uciFromMove(replayed)
                });
                restoredPositions.push(board.fen());
            }

            if (board.isGameOver()) {
                window.localStorage.removeItem(DUEL_STORAGE_KEY);
                setPersistenceReady(true);
                return;
            }

            const date = new Date().toISOString().slice(0, 10).replaceAll("-", ".");
            board.setHeader("Event", "NexoChess Duelo");
            board.setHeader("Site", "NexoChess");
            board.setHeader("Date", date);
            board.setHeader("White", parsed.playerColour == "white" ? t("you") : selectedCoach.name);
            board.setHeader("Black", parsed.playerColour == "black" ? t("you") : selectedCoach.name);
            board.setHeader(parsed.playerColour == "white" ? "BlackElo" : "WhiteElo", String(parsed.selectedElo));
            board.setHeader("Result", "*");
            gameRef.current = board;
            baselineRef.current = undefined;

            const lastMove = restoredMoves[restoredMoves.length - 1];
            const restoredFeedback = lastMove?.colour == parsed.playerColour && lastMove.quality
                ? {
                    quality: lastMove.quality,
                    san: lastMove.san,
                    to: lastMove.uci.slice(2, 4) as Square,
                    decisionRequired: Boolean(lastMove.decisionRequired),
                    threat: lastMove.threat,
                    forcedReplyUci: lastMove.forcedReplyUci
                } satisfies MoveFeedback
                : undefined;

            setSelectedElo(parsed.selectedElo);
            setPlayerColour(parsed.playerColour);
            setPhase("playing");
            setFen(board.fen());
            setPositions(restoredPositions);
            setMoves(restoredMoves);
            setRedoStack(parsed.redoStack);
            setViewIndex(restoredPositions.length - 1);
            setSelectedFrom(undefined);
            setFeedback(restoredFeedback);
            setGameResult(undefined);
            setEndDialogOpen(false);
            setAnalysisBusy(false);
            setAnalysisError(undefined);
            pendingRestoreRef.current = true;
            setPersistenceReady(true);
        } catch (error) {
            console.error(error);
            window.localStorage.removeItem(DUEL_STORAGE_KEY);
            setPersistenceReady(true);
        }
    }, []);

    useEffect(() => {
        if (!persistenceReady || phase != "playing" || !pendingRestoreRef.current) return;
        pendingRestoreRef.current = false;
        const session = ++sessionRef.current;

        if (feedback?.decisionRequired) {
            setThinking(false);
            setCoachText(spoken(
                t(`coach.quality.${feedback.quality}`, { move: feedback.san }),
                `restore-feedback-${feedback.san}`
            ));
            return;
        }

        createSessionEngines();
        if (colourFromTurn(gameRef.current.turn()) == playerColour) {
            void primePlayerTurn(session);
        } else {
            void playEngineMove(session);
        }
    }, [persistenceReady, phase, playerColour]);

    useEffect(() => {
        if (!persistenceReady) return;
        if (gameResult) {
            window.localStorage.removeItem(DUEL_STORAGE_KEY);
            return;
        }
        if (phase != "playing") return;

        const snapshot: PersistedDuel = {
            version: 1,
            selectedElo,
            playerColour,
            moves,
            redoStack
        };
        window.localStorage.setItem(DUEL_STORAGE_KEY, JSON.stringify(snapshot));
    }, [gameResult, moves, persistenceReady, phase, playerColour, redoStack, selectedElo]);

    useEffect(() => () => {
        if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
        qualityEngineRef.current?.terminate();
        opponentEngineRef.current?.terminate();
    }, []);

    useEffect(() => {
        if (phase != "setup") return;
        setCoachText(getCoachSpokenLine(
            selectedCoach,
            t("coach.setup", { coach: selectedCoach.name }),
            `duel-setup-${selectedCoach.id}`,
            coachT
        ));
    }, [coachT, phase, selectedCoach.id, selectedCoach.name, t]);

    function stopEngines() {
        if (resumeTimerRef.current) {
            window.clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = undefined;
        }
        qualityEngineRef.current?.terminate();
        opponentEngineRef.current?.terminate();
        qualityEngineRef.current = undefined;
        opponentEngineRef.current = undefined;
    }

    function createSessionEngines() {
        stopEngines();

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
        setCoachText(spoken(t("coach.reading"), `reading-${historyUci(gameRef.current).length}`));
        baselineRef.current = await strongEvaluation(gameRef.current.fen(), session);
        if (session != sessionRef.current) return;
        setThinking(false);
        setCoachText(spoken(t("coach.yourTurn"), `your-turn-${historyUci(gameRef.current).length}`));
    }

    function appendMove(move: PlayedMove, nextFen: string, clearRedo = true) {
        setMoves(current => [...current, move]);
        setPositions(current => {
            const next = [...current, nextFen];
            setViewIndex(next.length - 1);
            return next;
        });
        if (clearRedo) setRedoStack([]);
        setFen(nextFen);
    }

    function updateLastMoveFeedback(nextFeedback: MoveFeedback) {
        setMoves(current => current.map((move, index) => (
            index == current.length - 1
                ? {
                    ...move,
                    quality: nextFeedback.quality,
                    decisionRequired: nextFeedback.decisionRequired,
                    threat: nextFeedback.threat,
                    forcedReplyUci: nextFeedback.forcedReplyUci
                }
                : move
        )));
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
        window.localStorage.removeItem(DUEL_STORAGE_KEY);
        setGameResult(resolved);
        setThinking(false);
        setFeedback(undefined);
        setCoachText(spoken(
            t(`coach.end.${resolved}`, { coach: selectedCoach.name }),
            `end-${resolved}-${historyUci(gameRef.current).length}`
        ));
        setEndDialogOpen(true);
    }

    function chooseBookMove() {
        const board = gameRef.current;
        const history = historyUci(board);
        const legalBookMoves = getTheoryMoves(history).filter(uci => isLegalUci(board, uci));
        if (!legalBookMoves.length) return undefined;

        const seedText = `${selectedElo}:${history.join("")}`;
        let seed = 0;
        for (const character of seedText) seed = ((seed * 31) + character.charCodeAt(0)) >>> 0;
        return legalBookMoves[seed % legalBookMoves.length];
    }

    async function chooseEngineMove(session: number) {
        const engine = opponentEngineRef.current;
        const board = gameRef.current;
        if (!engine || session != sessionRef.current || board.isGameOver()) return undefined;

        const bookMove = chooseBookMove();
        if (bookMove) return bookMove;

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
        const candidates = lineSet?.length
            ? lineSet
            : [getTopEngineLine(lines)].filter(Boolean) as EngineLine[];
        if (!candidates.length) return undefined;

        const candidateIndex = Math.min(
            candidates.length - 1,
            Math.max(0, Math.round((3000 - level.elo) / 750))
        );
        return candidates[candidateIndex]?.moves[0]?.uci;
    }

    async function playEngineMove(session: number, forcedReplyUci?: string) {
        if (session != sessionRef.current || gameRef.current.isGameOver()) return;
        setThinking(true);
        setSelectedFrom(undefined);
        setCoachText(spoken(t("coach.thinking"), `thinking-${historyUci(gameRef.current).length}`));

        try {
            const forced = forcedReplyUci && isLegalUci(gameRef.current, forcedReplyUci)
                ? forcedReplyUci
                : undefined;
            const uci = forced || await chooseEngineMove(session);
            if (!uci || session != sessionRef.current) return;

            const move = gameRef.current.move(moveFromUci(uci));
            const nextFen = gameRef.current.fen();
            appendMove({
                san: move.san,
                uci: uciFromMove(move),
                colour: playerColour == "white" ? "black" : "white"
            }, nextFen);
            playBoardMoveSound(move.san);
            setFeedback(undefined);
            setCoachText(spoken(
                t("coach.engineMove", { move: move.san }),
                `engine-move-${move.san}-${historyUci(gameRef.current).length}`
            ));

            if (gameRef.current.isGameOver()) {
                finishGame();
                return;
            }

            await primePlayerTurn(session);
        } catch (error) {
            console.error(error);
            if (session == sessionRef.current) {
                setThinking(false);
                setCoachText(spoken(t("coach.engineError"), "engine-error"));
            }
        }
    }

    function resumeEditedPosition(session: number, restoredFeedback?: MoveFeedback) {
        if (session != sessionRef.current || gameRef.current.isGameOver()) return;

        if (restoredFeedback?.decisionRequired) {
            setThinking(false);
            setCoachText(spoken(
                t(`coach.quality.${restoredFeedback.quality}`, { move: restoredFeedback.san }),
                `history-feedback-${restoredFeedback.san}`
            ));
            return;
        }

        createSessionEngines();
        if (colourFromTurn(gameRef.current.turn()) == playerColour) {
            void primePlayerTurn(session);
            return;
        }

        setThinking(true);
        setCoachText(spoken(t("coach.thinking"), `history-thinking-${historyUci(gameRef.current).length}`));
        resumeTimerRef.current = window.setTimeout(() => {
            resumeTimerRef.current = undefined;
            if (session == sessionRef.current) {
                setFeedback(undefined);
                void playEngineMove(session);
            }
        }, 650);
    }

    async function startGame() {
        const session = ++sessionRef.current;
        pendingRestoreRef.current = false;
        window.localStorage.removeItem(DUEL_STORAGE_KEY);
        createSessionEngines();

        const board = new Chess();
        const date = new Date().toISOString().slice(0, 10).replaceAll("-", ".");
        board.setHeader("Event", "NexoChess Duelo");
        board.setHeader("Site", "NexoChess");
        board.setHeader("Date", date);
        board.setHeader(
            "White",
            playerColour == "white" ? t("you") : selectedCoach.name
        );
        board.setHeader(
            "Black",
            playerColour == "black" ? t("you") : selectedCoach.name
        );
        board.setHeader(
            playerColour == "white" ? "BlackElo" : "WhiteElo",
            String(selectedElo)
        );
        board.setHeader("Result", "*");
        gameRef.current = board;
        baselineRef.current = undefined;

        setPhase("playing");
        setFen(board.fen());
        setPositions([board.fen()]);
        setMoves([]);
        setRedoStack([]);
        setViewIndex(0);
        setSelectedFrom(undefined);
        setFeedback(undefined);
        setGameResult(undefined);
        setEndDialogOpen(false);
        setAnalysisBusy(false);
        setAnalysisError(undefined);
        setCoachText(spoken(
            t("coach.intro", { elo: selectedElo, coach: selectedCoach.name }),
            `intro-${selectedCoach.id}-${selectedElo}`
        ));

        if (playerColour == "white") {
            await primePlayerTurn(session);
        } else {
            await playEngineMove(session);
        }
    }

    function returnToSetup() {
        ++sessionRef.current;
        stopEngines();
        gameRef.current = new Chess();
        baselineRef.current = undefined;
        setPhase("setup");
        setThinking(false);
        setFeedback(undefined);
        setGameResult(undefined);
        setEndDialogOpen(false);
        setAnalysisError(undefined);
        setSelectedFrom(undefined);
        setFen(START_FEN);
        setPositions([START_FEN]);
        setMoves([]);
        setRedoStack([]);
        setViewIndex(0);
    }

    async function acceptUserMove(source: Square, target: Square) {
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
        const historyBefore = historyUci(gameRef.current);
        let move;
        try {
            move = gameRef.current.move({ from: source, to: target, promotion: "q" });
        } catch {
            setSelectedFrom(undefined);
            return false;
        }
        if (!move) return false;

        const playedUci = uciFromMove(move);
        const theoryMove = isTheoryMove(historyBefore, playedUci);
        setFeedback(undefined);
        setRedoStack([]);
        const nextFen = gameRef.current.fen();
        appendMove({
            san: move.san,
            uci: playedUci,
            colour: playerColour
        }, nextFen);
        playBoardMoveSound(move.san);
        setSelectedFrom(undefined);
        setThinking(true);
        setCoachText(spoken(
            t("coach.checking", { move: move.san }),
            `checking-${move.san}-${historyBefore.length}`
        ));

        if (gameRef.current.isGameOver()) {
            setLastMoveQuality(Classification.BEST);
            finishGame();
            return true;
        }

        if (theoryMove) {
            const theoryFeedback: MoveFeedback = {
                quality: Classification.THEORY,
                san: move.san,
                to: move.to as Square,
                decisionRequired: false
            };
            const dynamicComment = t("coach.quality.theory", { move: move.san });
            const reaction = getCoachReaction(
                selectedCoach,
                Classification.THEORY,
                dynamicComment,
                `${move.san}-theory-${historyBefore.length}`,
                coachT
            ) || dynamicComment;

            baselineRef.current = undefined;
            updateLastMoveFeedback(theoryFeedback);
            setFeedback(theoryFeedback);
            setThinking(false);
            setCoachText(reaction);
            window.setTimeout(() => {
                if (session == sessionRef.current) void playEngineMove(session);
            }, 480);
            return true;
        }

        try {
            const afterLine = await strongEvaluation(nextFen, session);
            if (session != sessionRef.current) return true;
            const quality = classifyPlayerMove(beforeLine, afterLine, playerColour);
            const decisionRequired = BAD_MOVE_QUALITIES.has(quality);
            const forcedReplyUci = decisionRequired ? afterLine?.moves[0]?.uci : undefined;
            const nextFeedback: MoveFeedback = {
                quality,
                san: move.san,
                to: move.to as Square,
                decisionRequired,
                forcedReplyUci,
                threat: decisionRequired ? threatArrow(afterLine) : undefined
            };
            const dynamicComment = t(`coach.quality.${quality}`, { move: move.san });
            const reaction = getCoachReaction(
                selectedCoach,
                quality,
                dynamicComment,
                `${move.san}-${quality}-${historyBefore.length}`,
                coachT
            ) || dynamicComment;

            updateLastMoveFeedback(nextFeedback);
            setFeedback(nextFeedback);
            setThinking(false);
            setCoachText(reaction);

            if (!decisionRequired) {
                window.setTimeout(() => {
                    if (session == sessionRef.current) void playEngineMove(session);
                }, 650);
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
        const session = ++sessionRef.current;
        stopEngines();
        gameRef.current.undo();
        gameRef.current.setHeader("Result", "*");
        baselineRef.current = undefined;
        setMoves(current => current.slice(0, -1));
        setPositions(current => {
            const next = current.slice(0, -1);
            setViewIndex(Math.max(0, next.length - 1));
            return next;
        });
        setRedoStack([]);
        setFen(gameRef.current.fen());
        setFeedback(undefined);
        setGameResult(undefined);
        setEndDialogOpen(false);
        setSelectedFrom(undefined);
        setCoachText(spoken(t("coach.retry"), `retry-${historyUci(gameRef.current).length}`));
        createSessionEngines();
        void primePlayerTurn(session);
    }

    function continueAfterError() {
        if (!feedback?.decisionRequired || thinking) return;
        const session = sessionRef.current;
        const forcedReply = feedback.forcedReplyUci;
        baselineRef.current = undefined;
        setFeedback(undefined);
        void playEngineMove(session, forcedReply);
    }

    function undoLiveMove() {
        if (phase != "playing" || !moves.length || analysisBusy) return;

        const session = ++sessionRef.current;
        stopEngines();
        setThinking(false);
        const lastMove = moves[moves.length - 1];
        const undone = gameRef.current.undo();
        if (!undone) return;

        const nextMoves = moves.slice(0, -1);
        const nextPositions = positions.slice(0, -1);
        gameRef.current.setHeader("Result", "*");
        baselineRef.current = undefined;
        setMoves(nextMoves);
        setPositions(nextPositions);
        setRedoStack(current => [lastMove, ...current]);
        setFen(gameRef.current.fen());
        setViewIndex(Math.max(0, nextPositions.length - 1));
        setSelectedFrom(undefined);
        setFeedback(undefined);
        setGameResult(undefined);
        setEndDialogOpen(false);
        setAnalysisError(undefined);

        resumeEditedPosition(session);
    }

    function redoLiveMove() {
        if (phase != "playing" || !redoStack.length || analysisBusy) return;

        const session = ++sessionRef.current;
        stopEngines();
        setThinking(false);
        const [restored, ...remaining] = redoStack;
        let replayed;
        try {
            replayed = gameRef.current.move(moveFromUci(restored.uci));
        } catch {
            setRedoStack([]);
            return;
        }
        if (!replayed) {
            setRedoStack([]);
            return;
        }

        const nextFen = gameRef.current.fen();
        const restoredMove: PlayedMove = {
            ...restored,
            san: replayed.san,
            uci: uciFromMove(replayed)
        };
        const nextMoves = [...moves, restoredMove];
        const nextPositions = [...positions, nextFen];
        setMoves(nextMoves);
        setPositions(nextPositions);
        setRedoStack(remaining);
        setFen(nextFen);
        setViewIndex(nextPositions.length - 1);
        setSelectedFrom(undefined);
        setGameResult(undefined);
        setEndDialogOpen(false);
        baselineRef.current = undefined;

        const restoredFeedback = restoredMove.colour == playerColour && restoredMove.quality
            ? {
                quality: restoredMove.quality,
                san: restoredMove.san,
                to: restoredMove.uci.slice(2, 4) as Square,
                decisionRequired: Boolean(restoredMove.decisionRequired),
                threat: restoredMove.threat,
                forcedReplyUci: restoredMove.forcedReplyUci
            } satisfies MoveFeedback
            : undefined;
        setFeedback(restoredFeedback);

        if (gameRef.current.isGameOver()) {
            finishGame();
            return;
        }

        resumeEditedPosition(session, restoredFeedback);
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
        const rows: Array<{
            number: number;
            white?: { move: PlayedMove; index: number };
            black?: { move: PlayedMove; index: number };
        }> = [];
        moves.forEach((move, index) => {
            const rowIndex = Math.floor(index / 2);
            if (!rows[rowIndex]) rows[rowIndex] = { number: rowIndex + 1 };
            const entry = { move, index };
            if (move.colour == "white") rows[rowIndex].white = entry;
            else rows[rowIndex].black = entry;
        });
        return rows;
    }

    function confirmCoach(coachId: CoachId) {
        const nextCoach = getCoachById(coachId);
        setSettings(current => ({
            ...current,
            appearance: {
                ...current.appearance,
                selectedCoach: coachId
            }
        }));

        if (phase == "playing") {
            gameRef.current.setHeader(
                playerColour == "white" ? "Black" : "White",
                nextCoach.name
            );
            setCoachText(getCoachSpokenLine(
                nextCoach,
                t("coach.yourTurn"),
                `coach-change-${coachId}`,
                coachT
            ));
        } else {
            setCoachText(getCoachSpokenLine(
                nextCoach,
                t("coach.setup", { coach: nextCoach.name }),
                `duel-setup-${coachId}`,
                coachT
            ));
        }
        setCoachPickerOpen(false);
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

    if (feedback && viewIndex == latestIndex) {
        squareStyles[feedback.to] = {
            boxShadow: `inset 0 0 0 4px ${classificationColours[feedback.quality]}b8`,
            backgroundImage: `url("${classificationImages[feedback.quality]}")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 5px top 5px",
            backgroundSize: "30% auto"
        };
    }

    const boardArrows = feedback?.threat && viewIndex == latestIndex
        ? [feedback.threat]
        : [];

    return <main className={styles.shell} data-phase={phase}>
        {phase == "setup" && <header className={styles.hero}>
            <span>{t("eyebrow")}</span>
            <div className={styles.heroLine}>
                <h1>{t("title")}</h1>
                <p>{t("subtitle")}</p>
            </div>
        </header>}

        <section className={`${styles.stage} ${v3.stage}`}>
            <div className={`${styles.boardColumn} ${v3.boardColumn}`}>
                <div className={styles.playerStrip} data-side="opponent">
                    <img
                        className={styles.opponentMiniPortrait}
                        src={selectedCoach.imagePath}
                        alt=""
                    />
                    <div>
                        <strong>{selectedCoach.name}</strong>
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

            <aside className={`${styles.sidePanel} ${v3.sidePanel}`}>
                <div className={`${styles.coachCard} ${v3.coachCard}`}>
                    <button
                        type="button"
                        className={`${styles.coachPortraitButton} ${v3.coachPortraitButton}`}
                        onClick={() => setCoachPickerOpen(true)}
                        aria-label={selectedCoach.name}
                    >
                        <CoachPortrait
                            className={`${styles.coachPortrait} ${v3.coachPortrait}`}
                            coach={selectedCoach}
                            baseExpression={coachExpression}
                            speechText={settings.coach.animations ? coachText : ""}
                            animationsEnabled={settings.coach.animations}
                        />
                    </button>
                    <div className={styles.coachBubble}>
                        <div className={styles.coachNameLine}>
                            <strong>{selectedCoach.name}</strong>
                            <span>Stockfish · {selectedElo}</span>
                        </div>
                        <p>{coachText}</p>
                        <small>{t("coach.changeHint")}</small>
                    </div>
                </div>

                {phase == "setup" ? <section className={styles.setupCard}>
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
                </section> : <>
                    {feedback && <section
                        className={styles.feedbackCard}
                        style={{ borderColor: classificationColours[feedback.quality] }}
                    >
                        <img src={classificationImages[feedback.quality]} alt="" />
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
                                <strong>{t("game.vs", {
                                    coach: selectedCoach.name,
                                    elo: selectedElo
                                })}</strong>
                            </div>
                            <div className={styles.headerActions}>
                                {gameResult && !endDialogOpen && <button type="button" onClick={() => setEndDialogOpen(true)}>
                                    {t("actions.result")}
                                </button>}
                                <button
                                    type="button"
                                    className={styles.backToSetupButton}
                                    onClick={returnToSetup}
                                >
                                    <span aria-hidden="true">←</span>
                                    {t("actions.changeSetup")}
                                </button>
                            </div>
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
                                        style={entry.move.quality ? {
                                            color: classificationColours[entry.move.quality],
                                            fontWeight: 900
                                        } : undefined}
                                    >
                                        {entry.move.san}
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

                        <div className={v3.editControls}>
                            <button
                                type="button"
                                onClick={undoLiveMove}
                                disabled={!moves.length || analysisBusy}
                                title={t("actions.undo")}
                                aria-label={t("actions.undo")}
                            >
                                <span aria-hidden="true">↶</span>
                                {t("actions.undo")}
                            </button>
                            <button
                                type="button"
                                onClick={redoLiveMove}
                                disabled={!redoStack.length || analysisBusy}
                                title={t("actions.redo")}
                                aria-label={t("actions.redo")}
                            >
                                <span aria-hidden="true">↷</span>
                                {t("actions.redo")}
                            </button>
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
            <section
                className={styles.endDialog}
                data-result={gameResult}
                role="dialog"
                aria-modal="true"
                aria-labelledby="engine-result-title"
            >
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={() => setEndDialogOpen(false)}
                    disabled={analysisBusy}
                    aria-label={t("actions.close")}
                >×</button>

                <span className={styles.endKicker}>{t("end.kicker")}</span>
                <h2 id="engine-result-title">
                    {t(`end.${gameResult}.title`, { coach: selectedCoach.name })}
                </h2>

                <div className={styles.endMatchup}>
                    <div className={styles.endPlayer}>
                        <span className={styles.endPlayerIcon}>♟</span>
                        <strong>{t("you")}</strong>
                        <small>{playerColour == "white" ? t("white") : t("black")}</small>
                    </div>
                    <div className={styles.endResultMark} aria-hidden="true">
                        {gameResult == "win" ? "✓" : gameResult == "loss" ? "×" : "½"}
                    </div>
                    <div className={styles.endPlayer}>
                        <div className={styles.endCoachWrap}>
                            <CoachPortrait
                                className={styles.endCoachPortrait}
                                coach={selectedCoach}
                                baseExpression={coachExpression}
                                speechText=""
                                animationsEnabled={false}
                            />
                        </div>
                        <strong>{selectedCoach.name}</strong>
                        <small>{t(`levels.${level.labelKey}`)} · {selectedElo}</small>
                    </div>
                </div>

                <p>{t(`end.${gameResult}.body`, {
                    coach: selectedCoach.name,
                    elo: selectedElo
                })}</p>

                {analysisBusy && <div className={styles.analysisProgress}>
                    <i />
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

        {coachPickerOpen && <CoachPicker
            selectedCoach={selectedCoach}
            onClose={() => setCoachPickerOpen(false)}
            onConfirm={confirmCoach}
            forceVisible
        />}
    </main>;
}

export default EnginePlayApp;
