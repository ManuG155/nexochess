import React, { useEffect, useMemo, useState } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useTranslation } from "react-i18next";

import useSettingsStore from "@/stores/SettingsStore";
import {
    createCustomPieces,
    normalisePieceTheme
} from "@/lib/chessAppearance";
import { playBoardMoveSound } from "@/lib/boardSounds";

import {
    ENDGAME_THEMES,
    ENDGAME_TIERS,
    loadEndgamePositions
} from "./catalog";
import { getEndgameCopy } from "./copy";
import {
    loadEndgameLabProgress,
    registerEndgameAttempt,
    registerEndgameDowngrade,
    registerEndgameHint,
    registerEndgameSolved,
    themeMastery,
    tierMastery
} from "./progress";
import {
    categoryOutcome,
    countPieces,
    invertOutcome,
    outcomeRank,
    probeTablebase,
    supportsTablebase,
    TablebaseError
} from "./tablebase";
import type {
    CoarseOutcome,
    EndgamePosition,
    EndgameThemeId,
    EndgameTier,
    TablebaseProbe
} from "./types";

import * as styles from "./EndgameLab.module.css";

type Screen = "levels" | "themes" | "play";
type FeedbackTone = "good" | "bad" | "neutral";

const MAX_SUCCESSFUL_PLAYER_MOVES = 8;

interface SessionPosition {
    id: string;
    fen: string;
    theme?: EndgameThemeId;
    tier?: EndgameTier;
    custom?: boolean;
}

function exactOutcomeAfterMove(probe: TablebaseProbe) {
    return invertOutcome(categoryOutcome(probe.category));
}

function EndgameLab({ onBack }: { onBack: () => void }) {
    const { i18n } = useTranslation();
    const language = i18n.resolvedLanguage || i18n.language || "en";
    const c = getEndgameCopy(language);
    const settings = useSettingsStore(state => state.settings);
    const pieces = useMemo(
        () => createCustomPieces(normalisePieceTheme(settings.themes.piece)),
        [settings.themes.piece]
    );

    const [screen, setScreen] = useState<Screen>("levels");
    const [tier, setTier] = useState<EndgameTier>();
    const [loadedPositions, setLoadedPositions] = useState<EndgamePosition[]>([]);
    const [loadingTier, setLoadingTier] = useState(false);
    const [theme, setTheme] = useState<EndgameThemeId>();
    const [positionIndex, setPositionIndex] = useState(0);
    const [sessionPosition, setSessionPosition] = useState<SessionPosition>();
    const [progress, setProgress] = useState(loadEndgameLabProgress);
    const [customFen, setCustomFen] = useState("");
    const [customError, setCustomError] = useState<string>();

    const [boardFen, setBoardFen] = useState("");
    const [playerColour, setPlayerColour] = useState<"w" | "b">("w");
    const [rootOutcome, setRootOutcome] = useState<CoarseOutcome>();
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState<string>();
    const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>("neutral");
    const [selectedFrom, setSelectedFrom] = useState<Square>();
    const [hintSquares, setHintSquares] = useState<[Square, Square]>();
    const [retryFen, setRetryFen] = useState<string>();
    const [attemptHadError, setAttemptHadError] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [successfulPlayerMoves, setSuccessfulPlayerMoves] = useState(0);
    const [solved, setSolved] = useState(false);

    const tierThemes = useMemo(
        () => ENDGAME_THEMES.filter(item => item.tier == tier),
        [tier]
    );

    const themePositions = useMemo(
        () => loadedPositions.filter(item => item.theme == theme),
        [loadedPositions, theme]
    );

    async function chooseTier(nextTier: EndgameTier) {
        setLoadingTier(true);
        setTier(nextTier);
        setTheme(undefined);
        setLoadedPositions([]);
        try {
            const positions = await loadEndgamePositions(nextTier);
            setLoadedPositions(positions);
            setScreen("themes");
        } finally {
            setLoadingTier(false);
        }
    }

    function startTheme(nextTheme: EndgameThemeId) {
        const positions = loadedPositions.filter(item => item.theme == nextTheme);
        if (!positions.length) return;
        setTheme(nextTheme);
        setPositionIndex(0);
        setSessionPosition(positions[0]);
        setScreen("play");
    }

    function startCustomPosition() {
        setCustomError(undefined);
        let board: Chess;
        try {
            board = new Chess(customFen.trim());
        } catch {
            setCustomError(c.invalidFen);
            return;
        }

        const fen = board.fen();
        if (!supportsTablebase(fen)) {
            setCustomError(countPieces(fen) > 7 ? c.tooManyPieces : c.invalidFen);
            return;
        }

        setTier(undefined);
        setTheme(undefined);
        setLoadedPositions([]);
        setPositionIndex(0);
        setSessionPosition({ id: `custom-${Date.now()}`, fen, custom: true });
        setScreen("play");
    }

    function completeExercise(message: string) {
        setSolved(true);
        setFeedback(message);
        setFeedbackTone("good");

        if (sessionPosition?.theme) {
            setProgress(current => registerEndgameSolved(
                current,
                sessionPosition.theme!,
                sessionPosition.id,
                !attemptHadError && !hintUsed
            ));
        }
    }

    useEffect(() => {
        if (!sessionPosition) return;

        let cancelled = false;
        let board: Chess;
        try {
            board = new Chess(sessionPosition.fen);
        } catch {
            setFeedback(c.invalidFen);
            setFeedbackTone("bad");
            return;
        }

        setBoardFen(board.fen());
        setPlayerColour(board.turn());
        setRootOutcome(undefined);
        setBusy(true);
        setFeedback(c.probing);
        setFeedbackTone("neutral");
        setSelectedFrom(undefined);
        setHintSquares(undefined);
        setRetryFen(undefined);
        setAttemptHadError(false);
        setHintUsed(false);
        setSuccessfulPlayerMoves(0);
        setSolved(false);

        if (sessionPosition.theme) {
            setProgress(current => registerEndgameAttempt(
                current,
                sessionPosition.theme!
            ));
        }

        void probeTablebase(board.fen())
            .then(probe => {
                if (cancelled) return;
                setRootOutcome(categoryOutcome(probe.category));
                setFeedback(undefined);
                setBusy(false);
            })
            .catch(() => {
                if (cancelled) return;
                setFeedback(c.tablebaseUnavailable);
                setFeedbackTone("bad");
                setBusy(false);
            });

        return () => {
            cancelled = true;
        };
    }, [sessionPosition?.id]);

    function downgradeMessage(from: CoarseOutcome, to: CoarseOutcome) {
        if (from == "win" && to == "draw") return c.lostWinToDraw;
        if (from == "win" && to == "loss") return c.lostWinToLoss;
        if (from == "draw" && to == "loss") return c.lostDraw;
        return c.positionFinished;
    }

    async function afterUserMove(beforeFen: string, movedBoard: Chess) {
        if (!rootOutcome || !sessionPosition) return;

        if (movedBoard.isGameOver()) {
            if (movedBoard.isCheckmate()) {
                completeExercise(c.checkmate);
                return;
            }
            if (rootOutcome == "draw") {
                completeExercise(c.drawReached);
                return;
            }
            setRetryFen(beforeFen);
            setAttemptHadError(true);
            setFeedback(c.lostWinToDraw);
            setFeedbackTone("bad");
            return;
        }

        setBusy(true);
        setFeedback(c.probing);
        setFeedbackTone("neutral");

        try {
            const child = await probeTablebase(movedBoard.fen());
            const playerOutcome = exactOutcomeAfterMove(child);

            if (outcomeRank(playerOutcome) < outcomeRank(rootOutcome)) {
                setRetryFen(beforeFen);
                setAttemptHadError(true);
                setFeedback(downgradeMessage(rootOutcome, playerOutcome));
                setFeedbackTone("bad");
                if (sessionPosition.theme) {
                    setProgress(current => registerEndgameDowngrade(
                        current,
                        sessionPosition.theme!
                    ));
                }
                setBusy(false);
                return;
            }

            const nextSuccessful = successfulPlayerMoves + 1;
            setSuccessfulPlayerMoves(nextSuccessful);
            setFeedback(
                rootOutcome == "win"
                    ? c.maintainedWin
                    : c.maintainedDraw
            );
            setFeedbackTone("good");

            if (nextSuccessful >= MAX_SUCCESSFUL_PLAYER_MOVES) {
                completeExercise(c.positionFinished);
                setBusy(false);
                return;
            }

            const bestReply = child.moves[0];
            if (!bestReply) {
                completeExercise(
                    rootOutcome == "draw" ? c.drawReached : c.positionFinished
                );
                setBusy(false);
                return;
            }

            window.setTimeout(() => {
                try {
                    const replyBoard = new Chess(movedBoard.fen());
                    const reply = replyBoard.move(bestReply.uci);
                    if (!reply) throw new Error();
                    setBoardFen(replyBoard.fen());
                    playBoardMoveSound(reply.san);

                    if (replyBoard.isGameOver()) {
                        if (replyBoard.isDraw() && rootOutcome == "draw") {
                            completeExercise(c.drawReached);
                        } else {
                            setFeedback(c.positionFinished);
                            setFeedbackTone("neutral");
                        }
                    }
                } catch {
                    setFeedback(c.tablebaseUnavailable);
                    setFeedbackTone("bad");
                } finally {
                    setBusy(false);
                }
            }, 420);
        } catch {
            setFeedback(c.tablebaseUnavailable);
            setFeedbackTone("bad");
            setBusy(false);
        }
    }

    function registerMove(from: Square, to: Square) {
        if (
            !boardFen
            || busy
            || solved
            || retryFen
            || !rootOutcome
        ) return false;

        const board = new Chess(boardFen);
        if (board.turn() != playerColour) return false;
        const beforeFen = board.fen();

        let move;
        try {
            move = board.move({ from, to, promotion: "q" });
        } catch {
            return false;
        }
        if (!move) return false;

        setBoardFen(board.fen());
        setSelectedFrom(undefined);
        setHintSquares(undefined);
        playBoardMoveSound(move.san);
        void afterUserMove(beforeFen, board);
        return true;
    }

    function handleSquareClick(squareName: string) {
        if (!boardFen || busy || solved || retryFen) return;
        const square = squareName as Square;
        const board = new Chess(boardFen);
        if (board.turn() != playerColour) return;
        const piece = board.get(square);

        if (!selectedFrom) {
            if (piece?.color == playerColour) setSelectedFrom(square);
            return;
        }
        if (selectedFrom == square) {
            setSelectedFrom(undefined);
            return;
        }
        if (piece?.color == playerColour) {
            setSelectedFrom(square);
            return;
        }
        registerMove(selectedFrom, square);
    }

    async function showHint() {
        if (!boardFen || busy || solved || retryFen || !sessionPosition) return;
        setBusy(true);
        try {
            const probe = await probeTablebase(boardFen);
            const best = probe.moves[0];
            if (!best || best.uci.length < 4) return;
            setHintSquares([
                best.uci.slice(0, 2) as Square,
                best.uci.slice(2, 4) as Square
            ]);
            setFeedback(c.bestMove(best.san));
            setFeedbackTone("neutral");
            setHintUsed(true);
            if (sessionPosition.theme) {
                setProgress(current => registerEndgameHint(
                    current,
                    sessionPosition.theme!
                ));
            }
        } catch {
            setFeedback(c.tablebaseUnavailable);
            setFeedbackTone("bad");
        } finally {
            setBusy(false);
        }
    }

    function resetPosition() {
        if (!sessionPosition) return;
        setSessionPosition({ ...sessionPosition, id: `${sessionPosition.id.split("#")[0]}#${Date.now()}` });
    }

    function retryMove() {
        if (!retryFen) return;
        setBoardFen(retryFen);
        setRetryFen(undefined);
        setSelectedFrom(undefined);
        setHintSquares(undefined);
        setFeedback(undefined);
        setFeedbackTone("neutral");
    }

    function nextPosition() {
        if (sessionPosition?.custom) {
            setScreen("levels");
            setSessionPosition(undefined);
            return;
        }
        const nextIndex = positionIndex + 1;
        if (nextIndex < themePositions.length) {
            setPositionIndex(nextIndex);
            setSessionPosition(themePositions[nextIndex]);
            return;
        }
        setScreen("themes");
        setSessionPosition(undefined);
    }

    const squareStyles: NonNullable<React.ComponentProps<typeof Chessboard>["customSquareStyles"]> = {};
    if (selectedFrom) {
        squareStyles[selectedFrom] = {
            boxShadow: "inset 0 0 0 4px rgba(88, 176, 255, .88)"
        };
    }
    if (hintSquares) {
        squareStyles[hintSquares[0]] = {
            ...(squareStyles[hintSquares[0]] || {}),
            boxShadow: "inset 0 0 0 4px rgba(244, 189, 92, .9)"
        };
        squareStyles[hintSquares[1]] = {
            ...(squareStyles[hintSquares[1]] || {}),
            boxShadow: "inset 0 0 0 4px rgba(244, 189, 92, .9)"
        };
    }

    if (screen == "levels") {
        return (
            <main className={styles.lab}>
                <header className={styles.hero}>
                    <button type="button" className={styles.back} onClick={onBack}>← {c.backLessons}</button>
                    <span>{c.eyebrow}</span>
                    <h1>{c.title}</h1>
                    <p>{c.subtitle}</p>
                    <div className={styles.exactPill}><b>{c.exactBadge}</b><span>{c.exactDescription}</span></div>
                </header>

                <section className={styles.levelSection}>
                    <div className={styles.sectionHeading}>
                        <div><span>01</span><h2>{c.chooseLevel}</h2></div>
                        <small>{c.noPreload}</small>
                    </div>
                    <div className={styles.levelGrid}>
                        {ENDGAME_TIERS.map((item, index) => {
                            const ids = ENDGAME_THEMES.filter(themeItem => themeItem.tier == item).map(themeItem => themeItem.id);
                            const count = ENDGAME_THEMES.filter(themeItem => themeItem.tier == item).reduce((sum, themeItem) => sum + themeItem.count, 0);
                            const mastery = tierMastery(progress, item, ids);
                            return (
                                <button
                                    type="button"
                                    className={styles.levelCard}
                                    data-tier={item}
                                    key={item}
                                    disabled={loadingTier}
                                    onClick={() => void chooseTier(item)}
                                >
                                    <span className={styles.levelNumber}>0{index + 1}</span>
                                    <strong>{c.tiers[item].title}</strong>
                                    <p>{c.tiers[item].description}</p>
                                    <div><span>{c.levelPositions(count)}</span><b>{c.mastery} {mastery}%</b></div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className={styles.customCard}>
                    <div>
                        <span>FEN</span>
                        <h2>{c.customTitle}</h2>
                        <p>{c.customSubtitle}</p>
                    </div>
                    <div className={styles.customForm}>
                        <input
                            value={customFen}
                            onChange={event => setCustomFen(event.target.value)}
                            placeholder={c.customPlaceholder}
                            spellCheck={false}
                        />
                        <button type="button" onClick={startCustomPosition}>{c.customCta}</button>
                        {customError && <small>{customError}</small>}
                    </div>
                </section>
            </main>
        );
    }

    if (screen == "themes" && tier) {
        return (
            <main className={styles.lab}>
                <header className={styles.compactHero}>
                    <button type="button" className={styles.back} onClick={() => setScreen("levels")}>← {c.backLevels}</button>
                    <span>{c.tiers[tier].title}</span>
                    <h1>{c.selectTheme}</h1>
                    <p>{c.tiers[tier].description}</p>
                </header>
                <div className={styles.themeGrid}>
                    {tierThemes.map(item => (
                        <button
                            type="button"
                            className={styles.themeCard}
                            key={item.id}
                            onClick={() => startTheme(item.id)}
                        >
                            <span className={styles.themeSymbol}>{item.symbol}</span>
                            <div>
                                <strong>{c.themes[item.id]}</strong>
                                <span>{c.levelPositions(item.count)}</span>
                            </div>
                            <b>{themeMastery(progress, item.id)}%</b>
                        </button>
                    ))}
                </div>
            </main>
        );
    }

    if (!sessionPosition) return null;

    const activeThemeName = sessionPosition.theme
        ? c.themes[sessionPosition.theme]
        : c.customTitle;
    const objective = rootOutcome ? c.objective[rootOutcome] : c.probing;
    const positionTotal = sessionPosition.custom ? 1 : themePositions.length;
    const currentPosition = sessionPosition.custom ? 1 : positionIndex + 1;

    return (
        <main className={`${styles.lab} ${styles.playPage}`}>
            <header className={styles.playHeader}>
                <button
                    type="button"
                    className={styles.back}
                    onClick={() => {
                        setSessionPosition(undefined);
                        setScreen(sessionPosition.custom ? "levels" : "themes");
                    }}
                >
                    ← {sessionPosition.custom ? c.backLevels : c.backThemes}
                </button>
                <div>
                    <span>{activeThemeName}</span>
                    <h1>{objective}</h1>
                </div>
                <div className={styles.positionCounter}>
                    <span>{c.position(currentPosition, positionTotal)}</span>
                    <b>{c.exactBadge}</b>
                </div>
            </header>

            <section className={styles.practiceLayout}>
                <div className={styles.boardColumn}>
                    <div className={styles.boardFrame}>
                        <Chessboard
                            id="nexochess-endgame-lab-board"
                            position={boardFen || sessionPosition.fen}
                            boardOrientation={playerColour == "w" ? "white" : "black"}
                            customPieces={pieces}
                            customLightSquareStyle={{ backgroundColor: settings.themes.board.lightSquareColour }}
                            customDarkSquareStyle={{ backgroundColor: settings.themes.board.darkSquareColour }}
                            customSquareStyles={squareStyles}
                            arePiecesDraggable={!busy && !solved && !retryFen}
                            onPieceDrop={(from, to) => registerMove(from as Square, to as Square)}
                            onSquareClick={handleSquareClick}
                            showBoardNotation
                            snapToCursor
                        />
                    </div>
                </div>

                <aside className={styles.practicePanel}>
                    <div className={styles.outcomeBox}>
                        <span>{rootOutcome ? c.objective[rootOutcome] : c.probing}</span>
                        <strong>{busy ? c.opponentTurn : c.yourTurn}</strong>
                    </div>

                    {feedback && (
                        <div className={styles.feedback} data-tone={feedbackTone}>
                            {feedback}
                        </div>
                    )}

                    <div className={styles.actions}>
                        {retryFen ? (
                            <button type="button" data-primary="true" onClick={retryMove}>{c.retry}</button>
                        ) : solved ? (
                            <button type="button" data-primary="true" onClick={nextPosition}>{c.next}</button>
                        ) : (
                            <>
                                <button type="button" onClick={resetPosition}>{c.reset}</button>
                                <button type="button" onClick={() => void showHint()} disabled={busy}>{c.hint}</button>
                            </>
                        )}
                    </div>

                    {sessionPosition.theme && (
                        <div className={styles.masteryPanel}>
                            <span>{c.mastery}</span>
                            <strong>{themeMastery(progress, sessionPosition.theme)}%</strong>
                            <div><i style={{ width: `${themeMastery(progress, sessionPosition.theme)}%` }} /></div>
                            {solved && !attemptHadError && !hintUsed && <small>{c.firstTry}</small>}
                        </div>
                    )}
                </aside>
            </section>
        </main>
    );
}

export default EndgameLab;
