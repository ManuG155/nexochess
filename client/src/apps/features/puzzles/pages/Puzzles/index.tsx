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
import Evaluation from "shared/types/game/position/Evaluation";

import useSettingsStore from "@/stores/SettingsStore";
import {
    createCustomPieces
} from "@/lib/chessAppearance";

import EvaluationBar from
    "@analysis/components/EvaluationBar";
import CoachPortrait from
    "@analysis/components/AnalysisPanel/CoachPortrait";
import CoachPicker from
    "@analysis/components/AnalysisPanel/CoachPicker";
import {
    CoachExpression,
    getCoachById,
    getCoachSpokenLine
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
    loadArchivePuzzleLibrary,
    loadNextLichessPuzzleRecord,
    loadPuzzleCatalogue,
    normaliseLichessPuzzle,
    pickRandomPuzzle
} from "../../lib/sources";
import {
    PuzzleCatalogue,
    PuzzleDifficulty,
    PuzzleProfile,
    PuzzleSource,
    PuzzleThemeSelection,
    TrainingPuzzle
} from "../../types";
import {
    formatOpeningTag,
    formatPuzzleTheme,
    getPuzzleFilterOptions,
    getVisiblePuzzleThemes,
    puzzleThemeCategories
} from "../../lib/themeCatalogue";

import * as styles from "./Puzzles.module.css";
import * as readable from "./Puzzles.readability.module.css";
import { getPuzzlePageCopy } from "./copy";

type PageState =
    | "loading"
    | "setup"
    | "playing"
    | "solved"
    | "revealed"
    | "empty"
    | "error";

type SourceLoadState = "loading" | "ready" | "error";

interface CoachMessage {
    key: string;
    text?: string;
    values?: Record<string, string | number>;
}

interface WrongMovePreview {
    fen: string;
    from: Square;
    to: Square;
}

interface MoveFeedback {
    square: Square;
    kind: "correct" | "brilliant";
}

interface PuzzleBoardSquareProps {
    children: React.ReactNode;
    square: Square;
    squareColor: "white" | "black";
    style: Record<string, string | number>;
}

const PuzzleBoardSquare = React.forwardRef<
    HTMLDivElement,
    PuzzleBoardSquareProps
>(({ children, style }, ref) => {
    const feedbackKind = style["--nexo-puzzle-feedback"];
    const squareStyle = { ...style };

    delete squareStyle["--nexo-puzzle-feedback"];

    return <div
        ref={ref}
        style={{
            ...squareStyle,
            position: "relative"
        }}
    >
        {feedbackKind && (
            <>
                <span
                    className={[
                        styles.squareFeedbackSurface,
                        feedbackKind == "brilliant"
                            ? styles.squareFeedbackBrilliant
                            : styles.squareFeedbackCorrect
                    ].join(" ")}
                    aria-hidden="true"
                />
                <span
                    className={[
                        styles.squareFeedbackIcon,
                        feedbackKind == "brilliant"
                            ? styles.squareFeedbackIconBrilliant
                            : styles.squareFeedbackIconCorrect
                    ].join(" ")}
                    aria-hidden="true"
                >
                    {feedbackKind == "brilliant" ? "!!" : "✓"}
                </span>
            </>
        )}
        {children}
    </div>;
});

PuzzleBoardSquare.displayName = "PuzzleBoardSquare";

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

function Puzzles() {
    const { t, i18n } = useTranslation([
        "puzzles",
        "analysis"
    ]);
    const { t: tCoach } = useTranslation("coach", {
        useSuspense: false
    });
    const pageCopy = useMemo(
        () => getPuzzlePageCopy(t),
        [i18n.resolvedLanguage, t]
    );

    const [ pageState, setPageState ] =
        useState<PageState>("loading");
    const [ source, setSource ] =
        useState<PuzzleSource>("archive");
    const [ themeSelection, setThemeSelection ] =
        useState<PuzzleThemeSelection>({ category: "all" });
    const [ openingSearch, setOpeningSearch ] = useState("");
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
    const [ analysedGameCount, setAnalysedGameCount ] =
        useState(0);
    const [ archiveLoadState, setArchiveLoadState ] =
        useState<SourceLoadState>("loading");
    const [ puzzleCatalogue, setPuzzleCatalogue ] =
        useState<PuzzleCatalogue>();
    const [ lichessLoadState, setLichessLoadState ] =
        useState<SourceLoadState>("loading");
    const [ requestingPuzzle, setRequestingPuzzle ] =
        useState(false);
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
    const [ wrongMovePreview, setWrongMovePreview ] =
        useState<WrongMovePreview>();
    const [ moveFeedback, setMoveFeedback ] =
        useState<MoveFeedback>();
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
    const [ coachPickerOpen, setCoachPickerOpen ] =
        useState(false);

    const settings = useSettingsStore(state => state.settings);
    const setSettings = useSettingsStore(state => state.setSettings);
    const selectedCoach = getCoachById(
        settings.appearance.selectedCoach
    );
    const coachEnabled = settings.coach.enabled;
    const customPieces = useMemo(
        () => createCustomPieces(settings.themes.piece),
        [settings.themes.piece]
    );

    const replyTimer = useRef<number | undefined>(undefined);
    const wrongMoveTimer = useRef<number | undefined>(undefined);
    const moveFeedbackTimer = useRef<number | undefined>(undefined);
    const liveFen = useRef("");
    const failedAttempt = useRef(false);
    const completedCurrentPuzzle = useRef(false);
    const completedIdsRef = useRef(new Set<string>());
    const profileRef = useRef(profile);
    const evaluationCacheRef = useRef(new Map<string, Evaluation>());
    const evaluationRequestRef = useRef(0);
    const setupRevealedRef = useRef(false);
    const requestingPuzzleRef = useRef(false);

    useEffect(() => {
        profileRef.current = profile;
    }, [profile]);

    useEffect(() => {
        let cancelled = false;

        function revealSetup(
            preferredSource: PuzzleSource,
            coachMessageKey: string
        ) {
            if (cancelled || setupRevealedRef.current) return;

            setupRevealedRef.current = true;
            setSource(preferredSource);
            setPageState("setup");
            setCoachMessage({ key: coachMessageKey });
            setCoachExpression("idle");
        }

        void getCompletedPuzzleIds()
            .then(completed => {
                if (!cancelled) completedIdsRef.current = completed;
            })
            .catch(() => {
                // Progress has its own localStorage fallback.
            });

        const archivePromise = loadArchivePuzzleLibrary()
            .then(library => {
                if (cancelled) return;

                setArchivePuzzles(library.puzzles);
                setAnalysedGameCount(library.analysedGameCount);
                setArchiveLoadState("ready");
                revealSetup("archive", "coach.setupArchive");
            })
            .catch(error => {
                if (!cancelled) setArchiveLoadState("error");
                throw error;
            });

        const lichessPromise = loadPuzzleCatalogue()
            .then(catalogue => {
                if (cancelled) return;

                setPuzzleCatalogue(catalogue);
                setLichessLoadState("ready");
            })
            .catch(error => {
                if (!cancelled) setLichessLoadState("error");
                throw error;
            });

        void Promise.allSettled([
            archivePromise,
            lichessPromise
        ]).then(results => {
            if (cancelled || setupRevealedRef.current) return;

            if (results[1].status == "fulfilled") {
                revealSetup("lichess", "coach.setupLichess");
            } else {
                setPageState("error");
                setCoachMessage({ key: "coach.loadError" });
                setCoachExpression("worried");
            }
        });

        return () => {
            cancelled = true;
            window.clearTimeout(replyTimer.current);
            window.clearTimeout(wrongMoveTimer.current);
            window.clearTimeout(moveFeedbackTimer.current);
        };
    }, []);

    function initialisePuzzle(nextPuzzle: TrainingPuzzle) {
        window.clearTimeout(replyTimer.current);
        window.clearTimeout(wrongMoveTimer.current);
        window.clearTimeout(moveFeedbackTimer.current);

        const history = nextPuzzle.previousFen
            ? [nextPuzzle.previousFen, nextPuzzle.startFen]
            : [nextPuzzle.startFen];

        setPuzzle(nextPuzzle);
        setBoardEvaluation(nextPuzzle.evaluation);
        setBoardHistory(history);
        setHistoryIndex(history.length - 1);
        setSolutionIndex(0);
        setSelectedSquare(undefined);
        setWrongMovePreview(undefined);
        setMoveFeedback(undefined);
        setHintArrow([]);
        setPendingReply(false);
        setPageState("playing");

        window.requestAnimationFrame(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "auto"
            });
        });

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

    async function getNextAvailablePuzzle() {
        if (source == "archive") {
            return pickRandomPuzzle(filterPuzzles(
                archivePuzzles,
                completedIdsRef.current,
                { category: "all" },
                "adaptive",
                profileRef.current
            ));
        }

        const record = await loadNextLichessPuzzleRecord(
            completedIdsRef.current,
            themeSelection,
            difficulty,
            profileRef.current
        );

        return record ? normaliseLichessPuzzle(record) || undefined : undefined;
    }

    async function startTraining() {
        if (requestingPuzzleRef.current) return;

        requestingPuzzleRef.current = true;
        setRequestingPuzzle(true);

        try {
            const nextPuzzle = await getNextAvailablePuzzle();

            if (!nextPuzzle) {
                setPageState("empty");
                setCoachMessage({
                    key: source == "archive"
                        ? "coach.noArchive"
                        : "coach.noFiltered",
                    text: source == "archive"
                        ? undefined
                        : pageCopy.noFilteredPuzzle
                });
                setCoachExpression("worried");
                return;
            }

            initialisePuzzle(nextPuzzle);
        } catch {
            setPageState("error");
            setCoachMessage({
                key: "coach.loadError"
            });
            setCoachExpression("worried");
        } finally {
            requestingPuzzleRef.current = false;
            setRequestingPuzzle(false);
        }
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

    async function skipPuzzle() {
        if (!puzzle || completedCurrentPuzzle.current) {
            void startTraining();
            return;
        }

        window.clearTimeout(replyTimer.current);
        window.clearTimeout(wrongMoveTimer.current);
        window.clearTimeout(moveFeedbackTimer.current);
        setPendingReply(false);
        setWrongMovePreview(undefined);
        setMoveFeedback(undefined);
        failedAttempt.current = true;

        await finishPuzzle(true);
        await startTraining();
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
            || wrongMovePreview
            || historyIndex != boardHistory.length - 1
        ) return false;

        const attemptBoard = new Chess(liveFen.current);
        const legalMove = attemptBoard.moves({
            square: from as Square,
            verbose: true
        })
            .find(move => move.to == to);

        if (!legalMove) return false;

        const expected = puzzle.solution[solutionIndex];
        const attempted = `${from}${to}`;

        if (!expected?.startsWith(attempted)) {
            failedAttempt.current = true;
            setSelectedSquare(undefined);
            setHintArrow([]);
            setMoveFeedback(undefined);
            setCoachExpression("worried");
            setCoachMessage({ key: "coach.wrong" });

            try {
                attemptBoard.move({
                    from: from as Square,
                    to: to as Square,
                    ...(legalMove.promotion
                        ? { promotion: legalMove.promotion }
                        : {})
                });

                setWrongMovePreview({
                    fen: attemptBoard.fen(),
                    from: from as Square,
                    to: to as Square
                });
                window.clearTimeout(wrongMoveTimer.current);
                wrongMoveTimer.current = window.setTimeout(() => {
                    setWrongMovePreview(undefined);
                }, 680);
            } catch {
                return false;
            }

            return true;
        }

        window.clearTimeout(wrongMoveTimer.current);
        setWrongMovePreview(undefined);
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
        const feedbackKind = (
            solutionIndex == 0
            && puzzle.themes.includes("sacrifice")
        )
            ? "brilliant"
            : "correct";

        liveFen.current = afterPlayer;
        appendPosition(afterPlayer);
        setSolutionIndex(nextIndex);
        setSelectedSquare(undefined);
        setHintArrow([]);
        setMoveFeedback({
            square: to as Square,
            kind: feedbackKind
        });
        window.clearTimeout(moveFeedbackTimer.current);
        moveFeedbackTimer.current = window.setTimeout(() => {
            setMoveFeedback(undefined);
        }, 820);

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
        }, 680);

        return true;
    }

    function selectBoardSquare(square: Square) {
        if (
            !puzzle
            || pageState != "playing"
            || pendingReply
            || wrongMovePreview
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

        const board = new Chess(liveFen.current);
        const piece = board.get(square);
        const expectedColour = puzzle.solver == "white" ? "w" : "b";

        if (piece?.color == expectedColour) {
            setSelectedSquare(square);
            return;
        }

        const legalDestination = board
            .moves({
                square: selectedSquare,
                verbose: true
            })
            .some(move => move.to == square);

        if (!legalDestination) {
            setSelectedSquare(undefined);
            return;
        }

        if (!playExpectedMove(selectedSquare, square)) {
            setSelectedSquare(undefined);
        }
    }

    function showHint() {
        if (!puzzle || !hintsEnabled || pageState != "playing") return;

        window.clearTimeout(wrongMoveTimer.current);
        setWrongMovePreview(undefined);
        setMoveFeedback(undefined);
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
        window.clearTimeout(wrongMoveTimer.current);
        window.clearTimeout(moveFeedbackTimer.current);
        failedAttempt.current = true;
        setWrongMovePreview(undefined);
        setMoveFeedback(undefined);

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

    const reviewedFen = boardHistory[historyIndex] || puzzle?.startFen;
    const currentFen = wrongMovePreview?.fen || reviewedFen;
    const atLivePosition = historyIndex == boardHistory.length - 1;
    const visibleThemes = puzzle
        ? getVisiblePuzzleThemes(puzzle)
        : [];
    const filterOptions = useMemo(
        () => getPuzzleFilterOptions(
            puzzleCatalogue,
            themeSelection.category
        ),
        [puzzleCatalogue, themeSelection.category]
    );
    const visibleFilterOptions = useMemo(() => {
        const query = openingSearch.trim().toLocaleLowerCase(
            i18n.resolvedLanguage
        );

        if (
            themeSelection.category != "opening"
            || !query
        ) return filterOptions;

        return filterOptions.filter(option => (
            formatOpeningTag(
                option.value,
                i18n.resolvedLanguage || "en"
            ).toLocaleLowerCase(i18n.resolvedLanguage)
                .includes(query)
        ));
    }, [
        filterOptions,
        i18n.resolvedLanguage,
        openingSearch,
        themeSelection.category
    ]);
    const translatedCoachMessage = coachMessage.text || t(
        coachMessage.key,
        coachMessage.values
    );
    const spokenCoachMessage = useMemo(
        () => getCoachSpokenLine(
            selectedCoach,
            translatedCoachMessage,
            [
                puzzle?.id || "setup",
                coachMessage.text || coachMessage.key,
                solutionIndex
            ].join("|"),
            tCoach
        ),
        [
            coachMessage.key,
            coachMessage.text,
            puzzle?.id,
            selectedCoach,
            solutionIndex,
            tCoach,
            translatedCoachMessage
        ]
    );
    const setupCoachMessage = useMemo(() => {
        if (source != "archive") return pageCopy.trainingSetup;
        if (archiveLoadState == "loading") return pageCopy.archiveChecking;
        if (analysedGameCount == 0) return pageCopy.archiveNoGames;
        if (archivePuzzles.length == 0) return pageCopy.archiveNoErrors;

        return pageCopy.archiveReady;
    }, [
        analysedGameCount,
        archiveLoadState,
        archivePuzzles.length,
        pageCopy,
        source
    ]);
    const spokenSetupCoachMessage = useMemo(
        () => getCoachSpokenLine(
            selectedCoach,
            setupCoachMessage,
            [
                "setup",
                source,
                archiveLoadState,
                analysedGameCount,
                archivePuzzles.length
            ].join("|"),
            tCoach
        ),
        [
            analysedGameCount,
            archiveLoadState,
            archivePuzzles.length,
            selectedCoach,
            setupCoachMessage,
            source,
            tCoach
        ]
    );
    const calibrationRemaining = Math.max(
        0,
        CALIBRATION_ATTEMPTS - profile.attempts
    );
    const accuracy = profile.attempts > 0
        ? Math.round((profile.correct / profile.attempts) * 100)
        : 0;
    const trainingActive = Boolean(
        puzzle
        && (
            pageState == "playing"
            || pageState == "solved"
            || pageState == "revealed"
        )
    );
    const showRatedProfile = (
        puzzle?.source
        || source
    ) == "lichess";

    useEffect(() => {
        if (!coachEnabled && coachPickerOpen) {
            setCoachPickerOpen(false);
        }
    }, [coachEnabled, coachPickerOpen]);

    const boardSquareStyles = useMemo<
        NonNullable<
            React.ComponentProps<typeof Chessboard>["customSquareStyles"]
        >
    >(() => {
        const squareStyles: NonNullable<
            React.ComponentProps<typeof Chessboard>["customSquareStyles"]
        > = {};

        if (wrongMovePreview) {
            const wrongStyle = {
                backgroundImage:
                    "linear-gradient("
                    + "rgba(224, 82, 73, 0.34), "
                    + "rgba(224, 82, 73, 0.34))",
                boxShadow:
                    "inset 0 0 0 4px rgba(244, 111, 98, 0.9)"
            };

            squareStyles[wrongMovePreview.from] = wrongStyle;
            squareStyles[wrongMovePreview.to] = wrongStyle;
            return squareStyles;
        }

        if (moveFeedback) {
            squareStyles[moveFeedback.square] = {
                "--nexo-puzzle-feedback": moveFeedback.kind
            };
        }

        if (selectedSquare) {
            squareStyles[selectedSquare] = {
                boxShadow:
                    "inset 0 0 0 4px rgba(96, 151, 255, 0.9)"
            };
        }

        if (
            !selectedSquare
            || !currentFen
            || !atLivePosition
            || pageState != "playing"
            || pendingReply
            || !settings.themes.board.legalMoveHints
        ) {
            return squareStyles;
        }

        const board = new Chess(currentFen);
        const legalMoves = board.moves({
            square: selectedSquare,
            verbose: true
        });

        legalMoves.forEach(move => {
            squareStyles[move.to] = board.get(move.to)
                ? {
                    boxShadow:
                        "inset 0 0 0 5px rgba(18, 24, 34, 0.34)"
                }
                : {
                    backgroundImage:
                        "radial-gradient(circle, "
                        + "rgba(18, 24, 34, 0.42) 0 16%, "
                        + "transparent 17%)"
                };
        });

        return squareStyles;
    }, [
        atLivePosition,
        currentFen,
        pageState,
        pendingReply,
        selectedSquare,
        settings.themes.board.legalMoveHints,
        moveFeedback,
        wrongMovePreview
    ]);

    useEffect(() => {
        if (!puzzle || !currentFen) return;

        const requestId = ++evaluationRequestRef.current;
        const updateEvaluation = (evaluation: Evaluation) => {
            if (requestId != evaluationRequestRef.current) return;

            evaluationCacheRef.current.set(currentFen, evaluation);
            setBoardEvaluation({ ...evaluation });
        };

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
            updateEvaluation(puzzle.evaluation);
            return;
        }

        const cachedEvaluation =
            evaluationCacheRef.current.get(currentFen);
        if (cachedEvaluation) {
            setBoardEvaluation({ ...cachedEvaluation });
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
                    updateEvaluation(line.evaluation);
                }
            }
        }).then(lines => {
            const finalLine = lines
                .filter(line => line.index == 1)
                .at(-1);

            if (!cancelled && finalLine) {
                updateEvaluation(finalLine.evaluation);
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

    const profileStats = showRatedProfile ? (
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
    ) : null;

    return <main
        className={[
            styles.page,
            readable.page,
            trainingActive ? styles.trainingPage : ""
        ].filter(Boolean).join(" ")}
    >
        {!trainingActive && <section className={styles.hero}>
            <div>
                <span className={styles.eyebrow}>{t("hero.eyebrow")}</span>
                <h1>{t("hero.title")}</h1>
                <p>{pageCopy.heroSubtitle}</p>
            </div>

            {profileStats}
        </section>}

        {(pageState == "loading" || pageState == "error") && (
            <section className={styles.stateCard}>
                <span className={styles.stateSpinner}/>
                <h2>
                    {pageState == "loading"
                        ? t("states.loadingTitle")
                        : pageCopy.loadErrorTitle
                    }
                </h2>
                <p>
                    {pageState == "loading"
                        ? t("states.loadingBody")
                        : pageCopy.loadErrorBody
                    }
                </p>
            </section>
        )}

        {(pageState == "setup" || pageState == "empty") && (
            <section className={[
                styles.setupGrid,
                readable.setupGrid,
                !coachEnabled
                    ? readable.setupGridWithoutCoach
                    : ""
            ].filter(Boolean).join(" ")}>
                <div className={[
                    styles.setupMain,
                    readable.setupMain
                ].join(" ")}>
                    <header className={[
                        styles.sectionHeader,
                        readable.sectionHeader
                    ].join(" ")}>
                        <span>{t("setup.kicker")}</span>
                        <h2>{t("setup.title")}</h2>
                        <p>{t("setup.subtitle")}</p>
                    </header>

                    <div className={[
                        styles.sourceSelector,
                        readable.sourceSelector
                    ].join(" ")}>
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
                                <strong>{pageCopy.trainingTitle}</strong>
                                <small>{pageCopy.trainingSubtitle}</small>
                            </span>
                        </button>
                    </div>

                    {
                        source == "archive"
                        && archiveLoadState == "ready"
                        && archivePuzzles.length == 0
                        && (
                            <div className={styles.archiveEmpty}>
                                <span aria-hidden="true">↗</span>
                                <div>
                                    <h3>
                                        {analysedGameCount == 0
                                            ? pageCopy.noGamesTitle
                                            : pageCopy.noErrorsTitle
                                        }
                                    </h3>
                                    <p>
                                        {analysedGameCount == 0
                                            ? pageCopy.noGamesBody
                                            : pageCopy.noErrorsBody
                                        }
                                    </p>
                                </div>
                                <a href="/analysis">
                                    {t("sources.archive.action")}
                                </a>
                            </div>
                        )
                    }

                    {source == "lichess" && (
                        <>
                            <div className={[
                                styles.filterBlock,
                                readable.filterBlock
                            ].join(" ")}>
                                <div className={[
                                    styles.filterHeading,
                                    readable.filterHeading
                                ].join(" ")}>
                                    <strong>{t("filters.theme")}</strong>
                                    <span>{t("filters.themeHelp")}</span>
                                </div>
                                <div className={[
                                    styles.themeCategories,
                                    readable.themeCategories
                                ].join(" ")}>
                                    {puzzleThemeCategories.map(value => (
                                        <button
                                            type="button"
                                            key={value}
                                            className={
                                                themeSelection.category
                                                == value
                                                    ? styles.themeCategoryActive
                                                    : ""
                                            }
                                            onClick={() => {
                                                setThemeSelection({
                                                    category: value
                                                });
                                                setOpeningSearch("");
                                            }}
                                            aria-pressed={
                                                themeSelection.category
                                                == value
                                            }
                                        >
                                            <span>
                                                {t(
                                                    `themeCategories.${value}`
                                                )}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {filterOptions.length > 0 && (
                                    <div className={[
                                        styles.subthemePanel,
                                        readable.subthemePanel
                                    ].join(" ")}>
                                        <div
                                            className={
                                                [
                                                    styles.subthemeHeading,
                                                    readable.subthemeHeading
                                                ].join(" ")
                                            }
                                        >
                                            <div>
                                                <strong>
                                                    {t("filters.subtheme", {
                                                        theme: t(
                                                            "themeCategories."
                                                            + themeSelection
                                                                .category
                                                        )
                                                    })}
                                                </strong>
                                                <span>
                                                    {t(
                                                        "filters.subthemeHelp"
                                                    )}
                                                </span>
                                            </div>

                                            {themeSelection.value && (
                                                <button
                                                    type="button"
                                                    onClick={() => (
                                                        setThemeSelection({
                                                            category:
                                                                themeSelection
                                                                    .category
                                                        })
                                                    )}
                                                >
                                                    {t(
                                                        "filters.clearSubtheme"
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {themeSelection.category
                                            == "opening"
                                            && filterOptions.length > 8
                                            && (
                                                <input
                                                    type="search"
                                                    value={openingSearch}
                                                    onChange={event => (
                                                        setOpeningSearch(
                                                            event.target.value
                                                        )
                                                    )}
                                                    placeholder={t(
                                                        "filters.openingSearch"
                                                    )}
                                                    aria-label={t(
                                                        "filters.openingSearch"
                                                    )}
                                                    className={
                                                        readable.openingSearch
                                                    }
                                                />
                                            )}

                                        <div className={[
                                            styles.subthemeGrid,
                                            readable.subthemeGrid
                                        ].join(" ")}>
                                            {visibleFilterOptions.map(option => {
                                                const active = (
                                                    themeSelection.kind
                                                        == option.kind
                                                    && themeSelection.value
                                                        == option.value
                                                );

                                                return (
                                                    <button
                                                        type="button"
                                                        key={
                                                            `${option.kind}:`
                                                            + option.value
                                                        }
                                                        className={active
                                                            ? styles
                                                                .subthemeActive
                                                            : ""
                                                        }
                                                        onClick={() => (
                                                            setThemeSelection(
                                                                active
                                                                    ? {
                                                                        category:
                                                                            themeSelection
                                                                                .category
                                                                    }
                                                                    : {
                                                                        category:
                                                                            themeSelection
                                                                                .category,
                                                                        kind:
                                                                            option
                                                                                .kind,
                                                                        value:
                                                                            option
                                                                                .value
                                                                    }
                                                            )
                                                        )}
                                                    >
                                                        <span>
                                                            {option.kind
                                                                == "opening"
                                                                ? formatOpeningTag(
                                                                    option.value,
                                                                    i18n
                                                                        .resolvedLanguage
                                                                        || "en"
                                                                )
                                                                : formatPuzzleTheme(
                                                                    option.value,
                                                                    i18n
                                                                        .resolvedLanguage
                                                                        || "en"
                                                                )
                                                            }
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {visibleFilterOptions.length == 0 && (
                                            <p
                                                className={
                                                    styles.noSubthemeResults
                                                }
                                            >
                                                {t(
                                                    "filters.noSubthemeResults"
                                                )}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className={[
                                styles.filterBlock,
                                readable.filterBlock
                            ].join(" ")}>
                                <div className={[
                                    styles.filterHeading,
                                    readable.filterHeading
                                ].join(" ")}>
                                    <strong>{t("filters.difficulty")}</strong>
                                    <span>{t("filters.difficultyHelp")}</span>
                                </div>
                                <div className={[
                                    styles.difficultyGrid,
                                    readable.difficultyGrid
                                ].join(" ")}>
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

                    <div className={[
                        styles.sessionOptions,
                        readable.sessionOptions,
                        source == "archive"
                            ? styles.archiveSessionOptions
                            : ""
                    ].filter(Boolean).join(" ")}>
                        {source == "lichess" && (
                            <OptionToggle
                                checked={ratedSession}
                                title={t("options.rated.title")}
                                description={t("options.rated.body")}
                                onChange={setRatedSession}
                            />
                        )}
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
                                {source == "archive"
                                    ? t("states.noArchiveTitle")
                                    : pageCopy.noMatchTitle
                                }
                            </strong>
                            <span>
                                {source == "archive"
                                    ? t("states.noArchiveBody")
                                    : pageCopy.noMatchBody
                                }
                            </span>
                        </div>
                    )}

                    <button
                        type="button"
                        className={[
                            styles.startButton,
                            readable.startButton
                        ].join(" ")}
                        onClick={() => void startTraining()}
                        disabled={
                            requestingPuzzle
                            ||
                            (
                                source == "archive"
                                && (
                                    archiveLoadState != "ready"
                                    || archivePuzzles.length == 0
                                )
                            )
                            || (
                                source == "lichess"
                                && lichessLoadState != "ready"
                            )
                        }
                    >
                        <span aria-hidden="true">▶</span>
                        {t("setup.start")}
                    </button>
                </div>

                {coachEnabled && (
                    <CoachCard
                        coach={selectedCoach}
                        expression={coachExpression}
                        message={
                            pageState == "setup"
                                ? spokenSetupCoachMessage
                                : spokenCoachMessage
                        }
                        animationsEnabled={settings.coach.animations}
                        title={t("coach.title", {
                            name: selectedCoach.name
                        })}
                        onCoachClick={() => setCoachPickerOpen(true)}
                    />
                )}
            </section>
        )}

        {puzzle && (
            pageState == "playing"
            || pageState == "solved"
            || pageState == "revealed"
        ) && (
            <section className={styles.trainingGrid}>
                <header className={styles.workspaceHeader}>
                    <div className={styles.workspaceIdentity}>
                        <span className={styles.workspaceSource}>
                            {puzzle.source == "archive"
                                ? t("puzzle.archiveSource")
                                : pageCopy.thematicSource
                            }
                        </span>

                        <div className={styles.workspaceTitleRow}>
                            <h2>
                                {t("puzzle.toMove", {
                                    colour: t(`colours.${puzzle.solver}`)
                                })}
                            </h2>

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
                                        {formatPuzzleTheme(
                                            value,
                                            i18n.resolvedLanguage || "en"
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {profileStats}
                </header>

                <div className={styles.boardColumn}>
                    <div className={[
                        styles.boardStage,
                        settings.themes.board.coordinates == "outside"
                            ? styles.boardStageWithOutsideCoordinates
                            : ""
                    ].filter(Boolean).join(" ")}>
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
                                    && !wrongMovePreview
                                    && atLivePosition
                                }
                                onPieceDrop={(from, to) => (
                                    playExpectedMove(from, to)
                                )}
                                onSquareClick={selectBoardSquare}
                                customPieces={customPieces}
                                customSquare={
                                    PuzzleBoardSquare as unknown as NonNullable<
                                        React.ComponentProps<
                                            typeof Chessboard
                                        >["customSquare"]
                                    >
                                }
                                customArrows={hintArrow}
                                customArrowColor="#78a7ff"
                                customSquareStyles={boardSquareStyles}
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

                </div>

                <aside className={[
                    styles.trainingPanel,
                    readable.trainingPanel
                ].join(" ")}>
                    {coachEnabled && (
                        <CoachCard
                            coach={selectedCoach}
                            expression={coachExpression}
                            message={spokenCoachMessage}
                            animationsEnabled={settings.coach.animations}
                            title={t("coach.title", {
                                name: selectedCoach.name
                            })}
                            onCoachClick={() => setCoachPickerOpen(true)}
                        />
                    )}

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
                                : pageCopy.thematicContext
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

                        {boardHistory.length > 1 && (
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
                        )}
                    </div>

                    {pageState == "playing" && (
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
                    )}

                    <button
                        type="button"
                        className={styles.nextPuzzle}
                        onClick={() => {
                            if (pageState == "playing") {
                                void skipPuzzle();
                                return;
                            }

                            void startTraining();
                        }}
                    >
                        {t("actions.nextPuzzle")} →
                    </button>

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
                                {pageCopy.sourceGame} ↗
                            </a>
                        )}
                    </div>
                </aside>
            </section>
        )}

        {coachEnabled && coachPickerOpen && (
            <CoachPicker
                selectedCoach={selectedCoach}
                onClose={() => setCoachPickerOpen(false)}
                onConfirm={coachId => {
                    setSettings(draft => {
                        draft.appearance.selectedCoach = coachId;
                        return draft;
                    });
                    setCoachPickerOpen(false);
                }}
            />
        )}
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
    title,
    onCoachClick
}: {
    coach: ReturnType<typeof getCoachById>;
    expression: CoachExpression;
    message: string;
    animationsEnabled: boolean;
    title: string;
    onCoachClick: () => void;
}) {
    return <div className={[
        styles.coachCard,
        readable.coachCard
    ].join(" ")}>
        <div className={[
            styles.coachCopy,
            readable.coachCopy
        ].join(" ")}>
            <span>{title}</span>
            <p>{message}</p>
        </div>
        <button
            type="button"
            className={[
                styles.coachPortrait,
                readable.coachPortrait
            ].join(" ")}
            onClick={onCoachClick}
            aria-label={title}
            title={title}
        >
            <CoachPortrait
                coach={coach}
                baseExpression={expression}
                speechText={message}
                animationsEnabled={animationsEnabled}
            />
        </button>
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
