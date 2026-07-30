import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { useTranslation } from "react-i18next";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import PieceColour from "shared/constants/PieceColour";
import EngineVersion from "shared/constants/EngineVersion";
import { stringifyEvaluation } from "shared/lib/utils/chess";
import Evaluation from "shared/types/game/position/Evaluation";

import useSettingsStore from "@/stores/SettingsStore";
import {
    createCustomPieces
} from "@/lib/chessAppearance";

import EvaluationBar from
    "@analysis/components/EvaluationBar";
import CoachPortrait from
    "@analysis/components/AnalysisPanel/CoachPortrait";
import {
    CoachExpression,
    getCoachById
} from "@analysis/lib/coach";
import Engine from "@analysis/lib/engine";

import {
    CALIBRATION_ATTEMPTS,
    getCompletedPuzzleIds,
    getPuzzleProfile,
    markPuzzleCompleted,
    recordRatedAttempt
} from "../../lib/progress";
import {
    filterPuzzles,
    loadArchivePuzzles,
    loadLichessPuzzles,
    pickRandomPuzzle
} from "../../lib/sources";
import {
    PuzzleDifficulty,
    PuzzleProfile,
    PuzzleSource,
    PuzzleTheme,
    TrainingPuzzle
} from "../../types";

import * as styles from "./Puzzles.module.css";

type PageState =
    | "loading"
    | "setup"
    | "playing"
    | "solved"
    | "revealed"
    | "empty"
    | "error";

interface CoachMessage {
    key: string;
    values?: Record<string, string | number>;
}

const themes: PuzzleTheme[] = [
    "all",
    "mate",
    "fork",
    "pin",
    "endgame",
    "opening",
    "sacrifice",
    "defense"
];

const difficulties: PuzzleDifficulty[] = [
    "adaptive",
    "beginner",
    "intermediate",
    "advanced",
    "expert"
];

function getMoveSAN(fen: string, uci: string) {
    try {
        const board = new Chess(fen);
        return board.move(uci).san;
    } catch {
        return uci;
    }
}

function getVisibleThemes(puzzle: TrainingPuzzle) {
    const supported = themes.filter(theme => (
        theme != "all"
        && (
            puzzle.themes.includes(theme)
            || (
                theme == "mate"
                && puzzle.themes.some(value => (
                    value == "mate"
                    || /^mateIn\d+$/.test(value)
                ))
            )
            || (
                theme == "defense"
                && puzzle.themes.some(value => (
                    value == "defensiveMove"
                    || value == "equality"
                ))
            )
        )
    ));

    return supported.slice(0, 3);
}

function Puzzles() {
    const { t } = useTranslation([
        "puzzles",
        "analysis"
    ]);

    const [ pageState, setPageState ] =
        useState<PageState>("loading");
    const [ source, setSource ] =
        useState<PuzzleSource>("archive");
    const [ theme, setTheme ] =
        useState<PuzzleTheme>("all");
    const [ difficulty, setDifficulty ] =
        useState<PuzzleDifficulty>("adaptive");
    const [ ratedSession, setRatedSession ] =
        useState(true);
    const [ hintsEnabled, setHintsEnabled ] =
        useState(true);
    const [ solutionEnabled, setSolutionEnabled ] =
        useState(true);
    const [ archivePuzzles, setArchivePuzzles ] =
        useState<TrainingPuzzle[]>([]);
    const [ lichessPuzzles, setLichessPuzzles ] =
        useState<TrainingPuzzle[]>([]);
    const [ profile, setProfile ] =
        useState<PuzzleProfile>(getPuzzleProfile);
    const [ puzzle, setPuzzle ] =
        useState<TrainingPuzzle>();
    const [ boardEvaluation, setBoardEvaluation ] =
        useState<Evaluation>({
            type: "centipawn",
            value: 0
        });
    const [ boardHistory, setBoardHistory ] =
        useState<string[]>([]);
    const [ historyIndex, setHistoryIndex ] =
        useState(0);
    const [ solutionIndex, setSolutionIndex ] =
        useState(0);
    const [ selectedSquare, setSelectedSquare ] =
        useState<Square>();
    const [ hintArrow, setHintArrow ] =
        useState<NonNullable<
            React.ComponentProps<typeof Chessboard>["customArrows"]
        >>([]);
    const [ pendingReply, setPendingReply ] =
        useState(false);
    const [ coachMessage, setCoachMessage ] =
        useState<CoachMessage>({ key: "coach.loading" });
    const [ coachExpression, setCoachExpression ] =
        useState<CoachExpression>("thinking");

    const settings = useSettingsStore(state => state.settings);
    const selectedCoach = getCoachById(
        settings.appearance.selectedCoach
    );
    const customPieces = useMemo(
        () => createCustomPieces(settings.themes.piece),
        [settings.themes.piece]
    );

    const replyTimer = useRef<number | undefined>(undefined);
    const liveFen = useRef("");
    const failedAttempt = useRef(false);
    const completedCurrentPuzzle = useRef(false);
    const completedIdsRef = useRef(new Set<string>());
    const profileRef = useRef(profile);

    useEffect(() => {
        profileRef.current = profile;
    }, [profile]);

    useEffect(() => {
        let cancelled = false;

        async function loadSources() {
            try {
                const [
                    archive,
                    lichess,
                    completed
                ] = await Promise.all([
                    loadArchivePuzzles(),
                    loadLichessPuzzles(),
                    getCompletedPuzzleIds()
                ]);

                if (cancelled) return;

                setArchivePuzzles(archive);
                setLichessPuzzles(lichess);
                completedIdsRef.current = completed;
                setPageState("setup");
                setCoachMessage({
                    key: archive.length > 0
                        ? "coach.setupArchive"
                        : "coach.setupLichess"
                });
                setCoachExpression("idle");
            } catch {
                if (cancelled) return;

                setPageState("error");
                setCoachMessage({ key: "coach.loadError" });
                setCoachExpression("worried");
            }
        }

        void loadSources();

        return () => {
            cancelled = true;
            window.clearTimeout(replyTimer.current);
        };
    }, []);

    function initialisePuzzle(nextPuzzle: TrainingPuzzle) {
        window.clearTimeout(replyTimer.current);

        const history = nextPuzzle.previousFen
            ? [nextPuzzle.previousFen, nextPuzzle.startFen]
            : [nextPuzzle.startFen];

        setPuzzle(nextPuzzle);
        setBoardEvaluation(nextPuzzle.evaluation);
        setBoardHistory(history);
        setHistoryIndex(history.length - 1);
        setSolutionIndex(0);
        setSelectedSquare(undefined);
        setHintArrow([]);
        setPendingReply(false);
        setPageState("playing");
        setCoachExpression("explaining");
        setCoachMessage({
            key: nextPuzzle.source == "archive"
                ? "coach.archiveTurn"
                : "coach.lichessTurn",
            values: {
                colour: t(`colours.${nextPuzzle.solver}`)
            }
        });

        liveFen.current = nextPuzzle.startFen;
        failedAttempt.current = false;
        completedCurrentPuzzle.current = false;
    }

    function availablePuzzles() {
        const collection = source == "archive"
            ? archivePuzzles
            : lichessPuzzles;

        return filterPuzzles(
            collection,
            completedIdsRef.current,
            source == "archive" ? "all" : theme,
            source == "archive" ? "adaptive" : difficulty,
            profileRef.current
        );
    }

    function startTraining() {
        const nextPuzzle = pickRandomPuzzle(availablePuzzles());

        if (!nextPuzzle) {
            setPageState("empty");
            setCoachMessage({
                key: source == "archive"
                    ? "coach.noArchive"
                    : "coach.noFiltered"
            });
            setCoachExpression("worried");
            return;
        }

        initialisePuzzle(nextPuzzle);
    }

    async function finishPuzzle(revealed: boolean) {
        if (!puzzle || completedCurrentPuzzle.current) return;

        completedCurrentPuzzle.current = true;
        const solvedWithoutHelp = !failedAttempt.current && !revealed;

        const nextCompleted = new Set(completedIdsRef.current);
        nextCompleted.add(puzzle.id);
        completedIdsRef.current = nextCompleted;

        await markPuzzleCompleted(
            puzzle.id,
            puzzle.source,
            solvedWithoutHelp
        );

        if (
            puzzle.source == "lichess"
            && ratedSession
            && puzzle.rating
        ) {
            const updated = recordRatedAttempt(
                profileRef.current,
                puzzle.rating,
                solvedWithoutHelp
            );

            profileRef.current = updated;
            setProfile(updated);
        }

        setPageState(revealed ? "revealed" : "solved");
        setCoachExpression(revealed ? "explaining" : "celebrating");
        setCoachMessage({
            key: revealed
                ? "coach.solutionShown"
                : solvedWithoutHelp
                    ? "coach.solvedClean"
                    : "coach.solvedAfterHelp"
        });
    }

    function appendPosition(fen: string) {
        setBoardHistory(previous => {
            const next = [...previous, fen];
            setHistoryIndex(next.length - 1);
            return next;
        });
    }

    function playExpectedMove(from: string, to: string) {
        if (
            !puzzle
            || pageState != "playing"
            || pendingReply
            || historyIndex != boardHistory.length - 1
        ) return false;

        const expected = puzzle.solution[solutionIndex];
        const attempted = `${from}${to}`;

        if (!expected?.startsWith(attempted)) {
            failedAttempt.current = true;
            setSelectedSquare(undefined);
            setHintArrow([]);
            setCoachExpression("worried");
            setCoachMessage({ key: "coach.wrong" });
            return false;
        }

        const board = new Chess(liveFen.current);

        try {
            board.move(expected);
        } catch {
            setPageState("error");
            setCoachExpression("worried");
            setCoachMessage({ key: "coach.positionError" });
            return false;
        }

        const afterPlayer = board.fen();
        const nextIndex = solutionIndex + 1;

        liveFen.current = afterPlayer;
        appendPosition(afterPlayer);
        setSolutionIndex(nextIndex);
        setSelectedSquare(undefined);
        setHintArrow([]);

        if (nextIndex >= puzzle.solution.length) {
            void finishPuzzle(false);
            return true;
        }

        setPendingReply(true);
        setCoachExpression("approving");
        setCoachMessage({ key: "coach.correctContinue" });

        replyTimer.current = window.setTimeout(() => {
            const replyBoard = new Chess(afterPlayer);
            const reply = puzzle.solution[nextIndex];

            try {
                replyBoard.move(reply);
            } catch {
                setPendingReply(false);
                setPageState("error");
                setCoachExpression("worried");
                setCoachMessage({ key: "coach.positionError" });
                return;
            }

            const afterReply = replyBoard.fen();
            const followingIndex = nextIndex + 1;

            liveFen.current = afterReply;
            appendPosition(afterReply);
            setSolutionIndex(followingIndex);
            setPendingReply(false);

            if (followingIndex >= puzzle.solution.length) {
                void finishPuzzle(false);
                return;
            }

            setCoachExpression("explaining");
            setCoachMessage({ key: "coach.yourTurnAgain" });
        }, 420);

        return true;
    }

    function selectBoardSquare(square: Square) {
        if (
            !puzzle
            || pageState != "playing"
            || pendingReply
            || historyIndex != boardHistory.length - 1
        ) return;

        if (!selectedSquare) {
            const piece = new Chess(liveFen.current).get(square);
            const expectedColour = puzzle.solver == "white" ? "w" : "b";

            if (piece?.color == expectedColour) {
                setSelectedSquare(square);
            }

            return;
        }

        if (square == selectedSquare) {
            setSelectedSquare(undefined);
            return;
        }

        if (!playExpectedMove(selectedSquare, square)) {
            const piece = new Chess(liveFen.current).get(square);
            const expectedColour = puzzle.solver == "white" ? "w" : "b";
            setSelectedSquare(
                piece?.color == expectedColour ? square : undefined
            );
        }
    }

    function showHint() {
        if (!puzzle || !hintsEnabled || pageState != "playing") return;

        const expected = puzzle.solution[solutionIndex];
        if (!expected) return;

        failedAttempt.current = true;
        setHintArrow([[
            expected.slice(0, 2) as Square,
            expected.slice(2, 4) as Square,
            "#78a7ff"
        ]]);
        setCoachExpression("explaining");
        setCoachMessage({
            key: "coach.hint",
            values: {
                move: getMoveSAN(liveFen.current, expected)
            }
        });
    }

    function revealSolution() {
        if (!puzzle || !solutionEnabled || pageState != "playing") return;

        window.clearTimeout(replyTimer.current);
        failedAttempt.current = true;

        const board = new Chess(liveFen.current);
        const positions: string[] = [];

        for (
            let index = solutionIndex;
            index < puzzle.solution.length;
            index++
        ) {
            try {
                board.move(puzzle.solution[index]);
                positions.push(board.fen());
            } catch {
                break;
            }
        }

        if (positions.length > 0) {
            liveFen.current = positions.at(-1)!;
            setBoardHistory(previous => {
                const next = [...previous, ...positions];
                setHistoryIndex(next.length - 1);
                return next;
            });
        }

        setSolutionIndex(puzzle.solution.length);
        setPendingReply(false);
        setSelectedSquare(undefined);
        setHintArrow([]);
        void finishPuzzle(true);
    }

    const currentFen = boardHistory[historyIndex] || puzzle?.startFen;
    const atLivePosition = historyIndex == boardHistory.length - 1;
    const visibleThemes = puzzle ? getVisibleThemes(puzzle) : [];
    const calibrationRemaining = Math.max(
        0,
        CALIBRATION_ATTEMPTS - profile.attempts
    );
    const accuracy = profile.attempts > 0
        ? Math.round((profile.correct / profile.attempts) * 100)
        : 0;

    useEffect(() => {
        if (!puzzle || !currentFen) return;

        /*
         * Archived positions already carry the exact evaluation produced
         * during the user's game analysis. Lichess puzzle rows do not include
         * an engine score, so NexoChess evaluates the displayed position
         * locally instead of presenting a guessed value.
         */
        if (
            puzzle.source == "archive"
            && currentFen == puzzle.startFen
        ) {
            setBoardEvaluation(puzzle.evaluation);
            return;
        }

        let cancelled = false;
        const selectedVersion = settings.analysis.engine.version;
        const localVersion = selectedVersion == EngineVersion.LICHESS_CLOUD
            ? EngineVersion.STOCKFISH_17_LITE
            : selectedVersion;
        const engine = new Engine(localVersion);

        engine
            .setThreadCount(1)
            .setLineCount(1)
            .setPosition(currentFen);

        void engine.evaluate({
            depth: Math.min(
                14,
                Math.max(10, settings.analysis.engine.depth)
            ),
            timeLimit: 450,
            onEngineLine: line => {
                if (!cancelled && line.index == 1) {
                    setBoardEvaluation(line.evaluation);
                }
            }
        }).catch(() => {
            // Keep the last safe evaluation if this device cannot run a worker.
        }).finally(() => {
            engine.terminate();
        });

        return () => {
            cancelled = true;
            engine.terminate();
        };
    }, [
        currentFen,
        puzzle?.id,
        settings.analysis.engine.depth,
        settings.analysis.engine.version
    ]);

    return <main className={styles.page}>
        <section className={styles.hero}>
            <div>
                <span className={styles.eyebrow}>{t("hero.eyebrow")}</span>
                <h1>{t("hero.title")}</h1>
                <p>{t("hero.subtitle")}</p>
            </div>

            <div className={styles.profileStats}>
                <div>
                    <span>{t("stats.rating")}</span>
                    <strong>{profile.rating}</strong>
                    <small>
                        {calibrationRemaining > 0
                            ? t("stats.calibrating", {
                                count: calibrationRemaining
                            })
                            : t("stats.calibrated")
                        }
                    </small>
                </div>
                <div>
                    <span>{t("stats.accuracy")}</span>
                    <strong>{accuracy}%</strong>
                    <small>
                        {t("stats.attempts", {
                            count: profile.attempts
                        })}
                    </small>
                </div>
                <div>
                    <span>{t("stats.streak")}</span>
                    <strong>{profile.streak}</strong>
                    <small>
                        {t("stats.best", {
                            count: profile.bestStreak
                        })}
                    </small>
                </div>
            </div>
        </section>

        {(pageState == "loading" || pageState == "error") && (
            <section className={styles.stateCard}>
                <span className={styles.stateSpinner}/>
                <h2>
                    {t(
                        pageState == "loading"
                            ? "states.loadingTitle"
                            : "states.errorTitle"
                    )}
                </h2>
                <p>
                    {t(
                        pageState == "loading"
                            ? "states.loadingBody"
                            : "states.errorBody"
                    )}
                </p>
            </section>
        )}

        {(pageState == "setup" || pageState == "empty") && (
            <section className={styles.setupGrid}>
                <div className={styles.setupMain}>
                    <header className={styles.sectionHeader}>
                        <span>{t("setup.kicker")}</span>
                        <h2>{t("setup.title")}</h2>
                        <p>{t("setup.subtitle")}</p>
                    </header>

                    <div className={styles.sourceSelector}>
                        <button
                            type="button"
                            className={source == "archive"
                                ? styles.sourceActive
                                : ""
                            }
                            onClick={() => setSource("archive")}
                        >
                            <span className={styles.sourceIcon}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M4.5 8.5h15v11h-15zM3.5 4.5h17v4h-17zM9.5 12h5"/>
                                </svg>
                            </span>
                            <span>
                                <strong>{t("sources.archive.title")}</strong>
                                <small>{t("sources.archive.body")}</small>
                            </span>
                            <b>{archivePuzzles.length}</b>
                        </button>

                        <button
                            type="button"
                            className={source == "lichess"
                                ? styles.sourceActive
                                : ""
                            }
                            onClick={() => setSource("lichess")}
                        >
                            <span className={styles.sourceIcon}>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8 4.5c4-1.8 8 .6 8 4.5 0 2.2-1.2 3.4-3 4.7-1.5 1.1-2.4 2.3-2.4 4.3M9.8 21h.1"/>
                                </svg>
                            </span>
                            <span>
                                <strong>{t("sources.lichess.title")}</strong>
                                <small>{t("sources.lichess.body")}</small>
                            </span>
                            <b>{lichessPuzzles.length}</b>
                        </button>
                    </div>

                    {source == "archive" && archivePuzzles.length == 0 && (
                        <div className={styles.archiveEmpty}>
                            <span aria-hidden="true">↗</span>
                            <div>
                                <h3>{t("sources.archive.emptyTitle")}</h3>
                                <p>{t("sources.archive.emptyBody")}</p>
                            </div>
                            <a href="/analysis">
                                {t("sources.archive.action")}
                            </a>
                        </div>
                    )}

                    {source == "lichess" && (
                        <>
                            <div className={styles.filterBlock}>
                                <div className={styles.filterHeading}>
                                    <strong>{t("filters.theme")}</strong>
                                    <span>{t("filters.themeHelp")}</span>
                                </div>
                                <div className={styles.chips}>
                                    {themes.map(value => (
                                        <button
                                            type="button"
                                            key={value}
                                            className={theme == value
                                                ? styles.chipActive
                                                : ""
                                            }
                                            onClick={() => setTheme(value)}
                                        >
                                            {t(`themes.${value}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.filterBlock}>
                                <div className={styles.filterHeading}>
                                    <strong>{t("filters.difficulty")}</strong>
                                    <span>{t("filters.difficultyHelp")}</span>
                                </div>
                                <div className={styles.difficultyGrid}>
                                    {difficulties.map(value => (
                                        <button
                                            type="button"
                                            key={value}
                                            className={difficulty == value
                                                ? styles.difficultyActive
                                                : ""
                                            }
                                            onClick={() => setDifficulty(value)}
                                        >
                                            <strong>
                                                {t(`difficulties.${value}.title`)}
                                            </strong>
                                            <small>
                                                {t(`difficulties.${value}.range`)}
                                            </small>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div className={styles.sessionOptions}>
                        <OptionToggle
                            checked={ratedSession}
                            title={t("options.rated.title")}
                            description={t("options.rated.body")}
                            onChange={setRatedSession}
                        />
                        <OptionToggle
                            checked={hintsEnabled}
                            title={t("options.hints.title")}
                            description={t("options.hints.body")}
                            onChange={setHintsEnabled}
                        />
                        <OptionToggle
                            checked={solutionEnabled}
                            title={t("options.solution.title")}
                            description={t("options.solution.body")}
                            onChange={setSolutionEnabled}
                        />
                    </div>

                    {pageState == "empty" && (
                        <div className={styles.noMatch} role="status">
                            <strong>
                                {t(
                                    source == "archive"
                                        ? "states.noArchiveTitle"
                                        : "states.noMatchTitle"
                                )}
                            </strong>
                            <span>
                                {t(
                                    source == "archive"
                                        ? "states.noArchiveBody"
                                        : "states.noMatchBody"
                                )}
                            </span>
                        </div>
                    )}

                    <button
                        type="button"
                        className={styles.startButton}
                        onClick={startTraining}
                        disabled={
                            source == "archive"
                            && archivePuzzles.length == 0
                        }
                    >
                        <span aria-hidden="true">▶</span>
                        {t("setup.start")}
                    </button>
                </div>

                <CoachCard
                    coach={selectedCoach}
                    expression={coachExpression}
                    message={t(coachMessage.key, coachMessage.values)}
                    animationsEnabled={settings.coach.animations}
                    title={t("coach.title", { name: selectedCoach.name })}
                />
            </section>
        )}

        {puzzle && (
            pageState == "playing"
            || pageState == "solved"
            || pageState == "revealed"
        ) && (
            <section className={styles.trainingGrid}>
                <div className={styles.boardColumn}>
                    <header className={styles.puzzleMeta}>
                        <div>
                            <span>
                                {puzzle.source == "archive"
                                    ? t("puzzle.archiveSource")
                                    : t("puzzle.lichessSource")
                                }
                            </span>
                            <h2>
                                {t("puzzle.toMove", {
                                    colour: t(`colours.${puzzle.solver}`)
                                })}
                            </h2>
                        </div>

                        <div className={styles.puzzleBadges}>
                            {puzzle.rating && (
                                <span>
                                    {t("puzzle.rating", {
                                        rating: puzzle.rating
                                    })}
                                </span>
                            )}
                            {puzzle.classification && (
                                <span className={styles.errorBadge}>
                                    {t(
                                        `classifications.${puzzle.classification}`,
                                        { ns: "analysis" }
                                    )}
                                </span>
                            )}
                            {visibleThemes.map(value => (
                                <span key={value}>
                                    {t(`themes.${value}`)}
                                </span>
                            ))}
                        </div>
                    </header>

                    <div className={styles.boardStage}>
                        <EvaluationBar
                            className={styles.evaluationBar}
                            evaluation={boardEvaluation}
                            moveColour={
                                puzzle.solver == "white"
                                    ? PieceColour.WHITE
                                    : PieceColour.BLACK
                            }
                            flipped={puzzle.solver == "black"}
                        />

                        <div className={styles.boardShell}>
                            <Chessboard
                                position={currentFen}
                                boardOrientation={puzzle.solver}
                                showBoardNotation={
                                    settings.themes.board.coordinates
                                    == "inside"
                                }
                                animationDuration={165}
                                arePiecesDraggable={
                                    pageState == "playing"
                                    && !pendingReply
                                    && atLivePosition
                                }
                                onPieceDrop={(from, to) => (
                                    playExpectedMove(from, to)
                                )}
                                onSquareClick={selectBoardSquare}
                                customPieces={customPieces}
                                customArrows={hintArrow}
                                customArrowColor="#78a7ff"
                                customSquareStyles={selectedSquare
                                    ? {
                                        [selectedSquare]: {
                                            boxShadow:
                                                "inset 0 0 0 4px "
                                                + "rgba(96, 151, 255, 0.9)"
                                        }
                                    }
                                    : undefined
                                }
                                customLightSquareStyle={{
                                    backgroundColor:
                                        settings.themes.board.lightSquareColour
                                }}
                                customDarkSquareStyle={{
                                    backgroundColor:
                                        settings.themes.board.darkSquareColour
                                }}
                                customBoardStyle={{
                                    borderRadius: "5px",
                                    boxShadow:
                                        "0 24px 58px rgba(0, 0, 0, 0.34)"
                                }}
                            />

                            {settings.themes.board.coordinates == "outside" && (
                                <OutsideCoordinates
                                    flipped={puzzle.solver == "black"}
                                />
                            )}
                        </div>
                    </div>

                    <div className={styles.historyControls}>
                        <button
                            type="button"
                            onClick={() => setHistoryIndex(index => (
                                Math.max(0, index - 1)
                            ))}
                            disabled={historyIndex == 0}
                            aria-label={t("controls.previous")}
                        >
                            ←
                        </button>
                        <span>
                            {historyIndex == 0 && puzzle.previousFen
                                ? t("controls.beforeMistake")
                                : atLivePosition
                                    ? t("controls.current")
                                    : t("controls.linePosition", {
                                        current: historyIndex + 1,
                                        total: boardHistory.length
                                    })
                            }
                        </span>
                        <button
                            type="button"
                            onClick={() => setHistoryIndex(index => (
                                Math.min(
                                    boardHistory.length - 1,
                                    index + 1
                                )
                            ))}
                            disabled={atLivePosition}
                            aria-label={t("controls.next")}
                        >
                            →
                        </button>
                    </div>
                </div>

                <aside className={styles.trainingPanel}>
                    <CoachCard
                        coach={selectedCoach}
                        expression={coachExpression}
                        message={t(coachMessage.key, coachMessage.values)}
                        animationsEnabled={settings.coach.animations}
                        title={t("coach.title", { name: selectedCoach.name })}
                    />

                    <div className={styles.objectiveCard}>
                        <span>{t("puzzle.objective")}</span>
                        <h3>
                            {pageState == "solved"
                                ? t("puzzle.solvedTitle")
                                : pageState == "revealed"
                                    ? t("puzzle.revealedTitle")
                                    : t("puzzle.findMove")
                            }
                        </h3>
                        <p>
                            {puzzle.source == "archive"
                                ? t("puzzle.archiveContext", {
                                    move: puzzle.moveNumber || "—",
                                    badMove: puzzle.badMove || "—",
                                    game: puzzle.gameLabel || ""
                                })
                                : t("puzzle.lichessContext")
                            }
                        </p>

                        <div className={styles.lineProgress}>
                            {puzzle.solution.map((_, index) => (
                                <i
                                    key={index}
                                    className={
                                        index < solutionIndex
                                            ? styles.lineDone
                                            : index == solutionIndex
                                                ? styles.lineCurrent
                                                : ""
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    {pageState == "playing" ? (
                        <div className={styles.puzzleActions}>
                            <button
                                type="button"
                                onClick={showHint}
                                disabled={!hintsEnabled || pendingReply}
                            >
                                <span aria-hidden="true">?</span>
                                <strong>{t("actions.hint")}</strong>
                                <small>
                                    {hintsEnabled
                                        ? t("actions.hintHelp")
                                        : t("actions.disabled")
                                    }
                                </small>
                            </button>
                            <button
                                type="button"
                                onClick={revealSolution}
                                disabled={!solutionEnabled || pendingReply}
                            >
                                <span aria-hidden="true">✓</span>
                                <strong>{t("actions.solution")}</strong>
                                <small>
                                    {solutionEnabled
                                        ? t("actions.solutionHelp")
                                        : t("actions.disabled")
                                    }
                                </small>
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className={styles.nextPuzzle}
                            onClick={startTraining}
                        >
                            {t("actions.nextPuzzle")} →
                        </button>
                    )}

                    <div className={styles.secondaryActions}>
                        <button
                            type="button"
                            onClick={() => {
                                setPuzzle(undefined);
                                setPageState("setup");
                                setCoachExpression("idle");
                                setCoachMessage({ key: "coach.changeFilters" });
                            }}
                        >
                            {t("actions.changeFilters")}
                        </button>

                        {puzzle.gameUrl && (
                            <a
                                href={puzzle.gameUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {t("actions.sourceGame")} ↗
                            </a>
                        )}
                    </div>

                    <div className={styles.evaluationSummary}>
                        <span>{t("puzzle.evaluation")}</span>
                        <strong>
                            {stringifyEvaluation(
                                boardEvaluation,
                                true,
                                1
                            )}
                        </strong>
                        <small>{t("puzzle.evaluationNote")}</small>
                    </div>
                </aside>
            </section>
        )}

        <footer className={styles.attribution}>
            <span>{t("attribution.text")}</span>
            <a
                href="https://database.lichess.org/#puzzles"
                target="_blank"
                rel="noreferrer"
            >
                {t("attribution.link")} ↗
            </a>
        </footer>
    </main>;
}

function OptionToggle({
    checked,
    title,
    description,
    onChange
}: {
    checked: boolean;
    title: string;
    description: string;
    onChange: (checked: boolean) => void;
}) {
    return <button
        type="button"
        className={checked ? styles.optionEnabled : ""}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
    >
        <span>
            <strong>{title}</strong>
            <small>{description}</small>
        </span>
        <i><b/></i>
    </button>;
}

function CoachCard({
    coach,
    expression,
    message,
    animationsEnabled,
    title
}: {
    coach: ReturnType<typeof getCoachById>;
    expression: CoachExpression;
    message: string;
    animationsEnabled: boolean;
    title: string;
}) {
    return <div className={styles.coachCard}>
        <div className={styles.coachCopy}>
            <span>{title}</span>
            <p>{message}</p>
        </div>
        <div className={styles.coachPortrait}>
            <CoachPortrait
                coach={coach}
                baseExpression={expression}
                speechText={message}
                animationsEnabled={animationsEnabled}
            />
        </div>
    </div>;
}

function OutsideCoordinates({ flipped }: { flipped: boolean }) {
    const ranks = flipped
        ? ["1", "2", "3", "4", "5", "6", "7", "8"]
        : ["8", "7", "6", "5", "4", "3", "2", "1"];
    const files = flipped
        ? ["h", "g", "f", "e", "d", "c", "b", "a"]
        : ["a", "b", "c", "d", "e", "f", "g", "h"];

    return <>
        <div className={styles.outsideRanks} aria-hidden="true">
            {ranks.map(rank => <span key={rank}>{rank}</span>)}
        </div>
        <div className={styles.outsideFiles} aria-hidden="true">
            {files.map(file => <span key={file}>{file}</span>)}
        </div>
    </>;
}

export default Puzzles;
