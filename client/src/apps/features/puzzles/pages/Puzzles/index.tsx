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
import { createCustomPieces } from "@/lib/chessAppearance";
import { playBoardMoveSound } from "@/lib/boardSounds";

import EvaluationBar from "@analysis/components/EvaluationBar";
import SuggestionArrowOverlay from
    "@analysis/components/Board/SuggestionArrowOverlay";
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
    loadPuzzleCatalogue,
    normaliseLichessPuzzle,
    pickRandomPuzzle
} from "../../lib/sources";
import { loadNextLichessPuzzleFromSelections } from "../../lib/multiSelection";
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
    getVisiblePuzzleThemes
} from "../../lib/themeCatalogue";

import ThemeMultiSelector from "./ThemeMultiSelector";
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
type ManualArrow = [Square, Square, string?];

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

interface PuzzleRatingEvent {
    id: string;
    delta: number;
    ratingAfter: number;
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
        style={{ ...squareStyle, position: "relative" }}
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

const AUTO_NEXT_STORAGE_KEY = "nexochess-puzzle-auto-next-v1";

function getAutoNextPreference() {
    if (typeof window == "undefined") return false;

    try {
        return window.localStorage.getItem(AUTO_NEXT_STORAGE_KEY) == "true";
    } catch {
        return false;
    }
}

function getProvisionalEvaluation(fen: string): Evaluation {
    try {
        const board = new Chess(fen);

        if (board.isCheckmate()) {
            return {
                type: "mate",
                value: board.turn() == "b" ? 1 : -1
            };
        }

        if (board.isDraw()) {
            return { type: "centipawn", value: 0 };
        }

        let material = 0;

        board.board().forEach(row => {
            row.forEach(piece => {
                if (!piece) return;

                const value = piece.type == "p"
                    ? 100
                    : piece.type == "n"
                        ? 320
                        : piece.type == "b"
                            ? 330
                            : piece.type == "r"
                                ? 500
                                : piece.type == "q"
                                    ? 900
                                    : 0;

                material += piece.color == "w" ? value : -value;
            });
        });

        return { type: "centipawn", value: material };
    } catch {
        return { type: "centipawn", value: 0 };
    }
}

function getMoveSAN(fen: string, uci: string) {
    try {
        const board = new Chess(fen);
        return board.move(uci).san;
    } catch {
        return uci;
    }
}

function Puzzles() {
    const { t, i18n } = useTranslation(["puzzles", "analysis"]);
    const { t: tCoach } = useTranslation("coach", { useSuspense: false });
    const pageCopy = useMemo(
        () => getPuzzlePageCopy(t),
        [i18n.resolvedLanguage, t]
    );
    const flipBoardLabel = t("optionsToolbar.flipBoard", {
        ns: "analysis"
    });

    const [pageState, setPageState] = useState<PageState>("loading");
    const [source, setSource] = useState<PuzzleSource>("archive");
    const [themeSelections, setThemeSelections] = useState<
        PuzzleThemeSelection[]
    >([{ category: "all" }]);
    const [difficulty, setDifficulty] =
        useState<PuzzleDifficulty>("adaptive");
    const [ratedSession, setRatedSession] = useState(true);
    const [hintsEnabled, setHintsEnabled] = useState(true);
    const [solutionEnabled, setSolutionEnabled] = useState(true);
    const [autoNext, setAutoNext] = useState(getAutoNextPreference);
    const [evaluationVisible, setEvaluationVisible] = useState(true);
    const [boardFlipped, setBoardFlipped] = useState(false);
    const [archivePuzzles, setArchivePuzzles] =
        useState<TrainingPuzzle[]>([]);
    const [analysedGameCount, setAnalysedGameCount] = useState(0);
    const [archiveLoadState, setArchiveLoadState] =
        useState<SourceLoadState>("loading");
    const [puzzleCatalogue, setPuzzleCatalogue] =
        useState<PuzzleCatalogue>();
    const [lichessLoadState, setLichessLoadState] =
        useState<SourceLoadState>("loading");
    const [requestingPuzzle, setRequestingPuzzle] = useState(false);
    const [profile, setProfile] = useState<PuzzleProfile>(getPuzzleProfile);
    const [puzzle, setPuzzle] = useState<TrainingPuzzle>();
    const [boardEvaluation, setBoardEvaluation] = useState<Evaluation>({
        type: "centipawn",
        value: 0
    });
    const [boardHistory, setBoardHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [solutionIndex, setSolutionIndex] = useState(0);
    const [selectedSquare, setSelectedSquare] = useState<Square>();
    const [wrongMovePreview, setWrongMovePreview] =
        useState<WrongMovePreview>();
    const [moveFeedback, setMoveFeedback] = useState<MoveFeedback>();
    const [ratingHistory, setRatingHistory] =
        useState<PuzzleRatingEvent[]>([]);
    const [hintArrow, setHintArrow] = useState<NonNullable<
        React.ComponentProps<typeof Chessboard>["customArrows"]
    >>([]);
    const [manualArrows, setManualArrows] = useState<ManualArrow[]>([]);
    const [pendingReply, setPendingReply] = useState(false);
    const [coachMessage, setCoachMessage] = useState<CoachMessage>({
        key: "coach.loading"
    });
    const [coachExpression, setCoachExpression] =
        useState<CoachExpression>("thinking");
    const [coachPickerOpen, setCoachPickerOpen] = useState(false);
    const [puzzleElapsedSeconds, setPuzzleElapsedSeconds] = useState(0);

    const settings = useSettingsStore(state => state.settings);
    const setSettings = useSettingsStore(state => state.setSettings);
    const selectedCoach = getCoachById(settings.appearance.selectedCoach);
    const coachEnabled = settings.coach.enabled;
    const customPieces = useMemo(
        () => createCustomPieces(settings.themes.piece),
        [settings.themes.piece]
    );

    const replyTimer = useRef<number | undefined>(undefined);
    const wrongMoveTimer = useRef<number | undefined>(undefined);
    const moveFeedbackTimer = useRef<number | undefined>(undefined);
    const autoNextTimer = useRef<number | undefined>(undefined);
    const liveFen = useRef("");
    const failedAttempt = useRef(false);
    const completedCurrentPuzzle = useRef(false);
    const completedIdsRef = useRef(new Set<string>());
    const profileRef = useRef(profile);
    const evaluationCacheRef = useRef(new Map<string, Evaluation>());
    const evaluationRequestRef = useRef(0);
    const manualArrowStartRef = useRef<Square>();
    const puzzleBoardShellRef = useRef<HTMLDivElement | null>(null);
    const setupRevealedRef = useRef(false);
    const requestingPuzzleRef = useRef(false);
    const puzzleStartedAtRef = useRef(0);

    useEffect(() => {
        profileRef.current = profile;
    }, [profile]);

    useEffect(() => {
        try {
            window.localStorage.setItem(
                AUTO_NEXT_STORAGE_KEY,
                String(autoNext)
            );
        } catch {
            // The preference remains active for the current tab.
        }

        if (!autoNext) window.clearTimeout(autoNextTimer.current);
    }, [autoNext]);

    useEffect(() => {
        if (!puzzle || pageState != "playing") return undefined;

        const updateElapsed = () => {
            const elapsed = Math.max(
                0,
                Math.floor((Date.now() - puzzleStartedAtRef.current) / 1000)
            );
            setPuzzleElapsedSeconds(elapsed);
        };

        updateElapsed();
        const intervalId = window.setInterval(updateElapsed, 1000);

        return () => window.clearInterval(intervalId);
    }, [puzzle?.id, pageState]);

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

        void Promise.allSettled([archivePromise, lichessPromise])
            .then(results => {
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
            window.clearTimeout(autoNextTimer.current);
        };
    }, []);

    function initialisePuzzle(nextPuzzle: TrainingPuzzle) {
        window.clearTimeout(replyTimer.current);
        window.clearTimeout(wrongMoveTimer.current);
        window.clearTimeout(moveFeedbackTimer.current);
        window.clearTimeout(autoNextTimer.current);

        puzzleStartedAtRef.current = Date.now();
        setPuzzleElapsedSeconds(0);

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
        setManualArrows([]);
        setPendingReply(false);
        setPageState("playing");

        window.requestAnimationFrame(() => {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        });

        setCoachExpression("explaining");
        setCoachMessage({
            key: nextPuzzle.source == "archive"
                ? "coach.archiveTurn"
                : "coach.lichessTurn",
            values: { colour: t(`colours.${nextPuzzle.solver}`) }
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

        const record = await loadNextLichessPuzzleFromSelections(
            completedIdsRef.current,
            themeSelections,
            difficulty,
            profileRef.current
        );

        return record ? normaliseLichessPuzzle(record) || undefined : undefined;
    }

    async function startTraining() {
        if (requestingPuzzleRef.current) return;

        window.clearTimeout(autoNextTimer.current);
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
            setCoachMessage({ key: "coach.loadError" });
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
            const previousProfile = profileRef.current;
            const updated = recordRatedAttempt(
                previousProfile,
                puzzle.rating,
                solvedWithoutHelp
            );
            const delta = updated.rating - previousProfile.rating;

            profileRef.current = updated;
            setProfile(updated);
            setRatingHistory(previous => [
                ...previous,
                {
                    id: puzzle.id,
                    delta,
                    ratingAfter: updated.rating
                }
            ].slice(-8));
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

        if (!revealed && autoNext) {
            window.clearTimeout(autoNextTimer.current);
            autoNextTimer.current = window.setTimeout(() => {
                void startTraining();
            }, 1500);
        }
    }

    async function skipPuzzle() {
        if (!puzzle || completedCurrentPuzzle.current) {
            void startTraining();
            return;
        }

        window.clearTimeout(replyTimer.current);
        window.clearTimeout(wrongMoveTimer.current);
        window.clearTimeout(moveFeedbackTimer.current);
        window.clearTimeout(autoNextTimer.current);
        setPendingReply(false);
        setWrongMovePreview(undefined);
        setMoveFeedback(undefined);
        failedAttempt.current = true;

        await finishPuzzle(true);
        await startTraining();
    }

    function returnToSetup() {
        window.clearTimeout(autoNextTimer.current);
        window.clearTimeout(replyTimer.current);
        setPuzzle(undefined);
        puzzleStartedAtRef.current = 0;
        setPuzzleElapsedSeconds(0);
        setPageState("setup");
        setPendingReply(false);
        setWrongMovePreview(undefined);
        setMoveFeedback(undefined);
        setCoachExpression("idle");
        setCoachMessage({ key: "coach.changeFilters" });
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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
        }).find(move => move.to == to);

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
                const attemptedMove = attemptBoard.move({
                    from: from as Square,
                    to: to as Square,
                    ...(legalMove.promotion
                        ? { promotion: legalMove.promotion }
                        : {})
                });
                playBoardMoveSound(attemptedMove.san);

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
            const playedMove = board.move(expected);
            playBoardMoveSound(playedMove.san);
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
        ) ? "brilliant" : "correct";

        liveFen.current = afterPlayer;
        appendPosition(afterPlayer);
        setSolutionIndex(nextIndex);
        setSelectedSquare(undefined);
        setHintArrow([]);
        setMoveFeedback({ square: to as Square, kind: feedbackKind });
        window.clearTimeout(moveFeedbackTimer.current);
        moveFeedbackTimer.current = window.setTimeout(() => {
            setMoveFeedback(undefined);
        }, feedbackKind == "brilliant" ? 1350 : 820);

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
                const playedReply = replyBoard.move(reply);
                playBoardMoveSound(playedReply.san);
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

            if (piece?.color == expectedColour) setSelectedSquare(square);
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

        const legalDestination = board.moves({
            square: selectedSquare,
            verbose: true
        }).some(move => move.to == square);

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
            values: { move: getMoveSAN(liveFen.current, expected) }
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
    const visibleThemes = puzzle ? getVisiblePuzzleThemes(puzzle) : [];
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

    const selectionLabels = useMemo(() => {
        const language = i18n.resolvedLanguage || "en";

        return themeSelections.map(selection => {
            if (selection.category == "all") {
                return t("themeCategories.all");
            }

            if (!selection.value) {
                return [
                    t(`themeCategories.${selection.category}`),
                    t("filters.clearSubtheme")
                ].join(" · ");
            }

            return selection.kind == "opening"
                ? formatOpeningTag(selection.value, language)
                : formatPuzzleTheme(selection.value, language);
        });
    }, [i18n.resolvedLanguage, t, themeSelections]);

    const setupCoachMessage = useMemo(() => {
        if (source == "archive") {
            if (archiveLoadState == "loading") return pageCopy.archiveChecking;
            if (analysedGameCount == 0) return pageCopy.archiveNoGames;
            if (archivePuzzles.length == 0) return pageCopy.archiveNoErrors;
            return pageCopy.archiveReady;
        }

        const language = i18n.resolvedLanguage || "en";
        let selectionText = selectionLabels.join(", ");

        try {
            selectionText = new Intl.ListFormat(language, {
                style: "long",
                type: "conjunction"
            }).format(selectionLabels);
        } catch {
            // join fallback already prepared.
        }

        return [
            `${t("setup.kicker")}: ${selectionText}.`,
            `${t("filters.difficulty")}: ${t(
                `difficulties.${difficulty}.title`
            )}.`
        ].join(" ");
    }, [
        analysedGameCount,
        archiveLoadState,
        archivePuzzles.length,
        difficulty,
        i18n.resolvedLanguage,
        pageCopy,
        selectionLabels,
        source,
        t
    ]);

    const spokenSetupCoachMessage = useMemo(
        () => getCoachSpokenLine(
            selectedCoach,
            setupCoachMessage,
            [
                "setup",
                source,
                setupCoachMessage,
                difficulty
            ].join("|"),
            tCoach
        ),
        [
            difficulty,
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
    const showRatedProfile = (puzzle?.source || source) == "lichess";
    const puzzleBoardOrientation = puzzle
        ? boardFlipped
            ? puzzle.solver == "white" ? "black" : "white"
            : puzzle.solver
        : "white";

    function pointerSquare(clientX: number, clientY: number) {
        const rect = puzzleBoardShellRef.current?.getBoundingClientRect();
        if (!rect || rect.width <= 0 || rect.height <= 0) return undefined;

        const fileIndex = Math.min(
            7,
            Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * 8))
        );
        const rankIndex = Math.min(
            7,
            Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * 8))
        );
        const normalFiles = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const flippedFiles = [...normalFiles].reverse();
        const file = (
            puzzleBoardOrientation == "black"
                ? flippedFiles
                : normalFiles
        )[fileIndex];
        const rank = puzzleBoardOrientation == "black"
            ? rankIndex + 1
            : 8 - rankIndex;

        return `${file}${rank}` as Square;
    }

    function beginManualArrow(event: React.MouseEvent<HTMLDivElement>) {
        if (event.button != 2) return;

        const square = pointerSquare(event.clientX, event.clientY);
        if (!square) return;

        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        manualArrowStartRef.current = square;
    }

    function finishManualArrow(event: React.MouseEvent<HTMLDivElement>) {
        if (event.button != 2) return;

        const from = manualArrowStartRef.current;
        const to = pointerSquare(event.clientX, event.clientY);
        manualArrowStartRef.current = undefined;

        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();

        if (!from || !to || from == to) return;

        setManualArrows(previous => {
            const existing = previous.findIndex(
                ([start, end]) => start == from && end == to
            );

            if (existing >= 0) {
                return previous.filter((_, index) => index != existing);
            }

            return [
                ...previous,
                [from, to, settings.analysis.arrowStyle.manualColour]
            ];
        });
    }

    useEffect(() => {
        if (!coachEnabled && coachPickerOpen) setCoachPickerOpen(false);
    }, [coachEnabled, coachPickerOpen]);

    const boardSquareStyles = useMemo<NonNullable<
        React.ComponentProps<typeof Chessboard>["customSquareStyles"]
    >>(() => {
        const squareStyles: NonNullable<
            React.ComponentProps<typeof Chessboard>["customSquareStyles"]
        > = {};

        if (wrongMovePreview) {
            const wrongStyle = {
                backgroundImage:
                    "linear-gradient(rgba(224, 82, 73, 0.34), "
                    + "rgba(224, 82, 73, 0.34))",
                boxShadow: "inset 0 0 0 4px rgba(244, 111, 98, 0.9)"
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
                boxShadow: "inset 0 0 0 4px rgba(96, 151, 255, 0.9)"
            };
        }

        if (
            !selectedSquare
            || !currentFen
            || !atLivePosition
            || pageState != "playing"
            || pendingReply
            || !settings.themes.board.legalMoveHints
        ) return squareStyles;

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
                        "radial-gradient(circle, rgba(18, 24, 34, 0.42) "
                        + "0 16%, transparent 17%)"
                };
        });

        return squareStyles;
    }, [
        atLivePosition,
        currentFen,
        moveFeedback,
        pageState,
        pendingReply,
        selectedSquare,
        settings.themes.board.legalMoveHints,
        wrongMovePreview
    ]);

    useEffect(() => {
        if (!puzzle || !currentFen || !evaluationVisible) return;

        const requestId = ++evaluationRequestRef.current;
        const updateEvaluation = (evaluation: Evaluation) => {
            if (requestId != evaluationRequestRef.current) return;

            evaluationCacheRef.current.set(currentFen, evaluation);
            setBoardEvaluation({ ...evaluation });
        };

        if (puzzle.source == "archive" && currentFen == puzzle.startFen) {
            updateEvaluation(puzzle.evaluation);
            return;
        }

        const provisionalEvaluation = getProvisionalEvaluation(currentFen);
        const cachedEvaluation = evaluationCacheRef.current.get(currentFen);

        if (cachedEvaluation) {
            setBoardEvaluation({ ...cachedEvaluation });
        } else if (
            provisionalEvaluation.type == "mate"
            || provisionalEvaluation.value != 0
        ) {
            setBoardEvaluation({ ...provisionalEvaluation });
        }

        const engine = new Engine(EngineVersion.STOCKFISH_17_LITE);
        let cancelled = false;

        engine
            .setThreadCount(1)
            .setLineCount(1)
            .setPosition(currentFen);

        void engine.evaluate({
            depth: 16,
            timeLimit: 1200,
            onEngineLine: line => {
                if (
                    !cancelled
                    && requestId == evaluationRequestRef.current
                    && line.index == 1
                    && line.depth >= 1
                ) updateEvaluation(line.evaluation);
            }
        }).then(lines => {
            const finalLine = lines.filter(line => line.index == 1).at(-1);

            if (
                !cancelled
                && requestId == evaluationRequestRef.current
                && finalLine
            ) updateEvaluation(finalLine.evaluation);
        }).catch(() => {
            if (!cancelled && requestId == evaluationRequestRef.current) {
                setBoardEvaluation({ ...provisionalEvaluation });
            }
        }).finally(() => engine.terminate());

        return () => {
            cancelled = true;
            evaluationRequestRef.current++;
            engine.terminate();
        };
    }, [currentFen, evaluationVisible, puzzle?.id]);

    const profileStats = showRatedProfile ? (
        <div className={styles.profileStats}>
            <div>
                <span>{t("stats.rating")}</span>
                <strong>{profile.rating}</strong>
                <small>
                    {calibrationRemaining > 0
                        ? t("stats.calibrating", { count: calibrationRemaining })
                        : t("stats.calibrated")
                    }
                </small>
            </div>
            <div>
                <span>{t("stats.accuracy")}</span>
                <strong>{accuracy}%</strong>
                <small>{t("stats.attempts", { count: profile.attempts })}</small>
            </div>
            <div>
                <span>{t("stats.streak")}</span>
                <strong>{profile.streak}</strong>
                <small>{t("stats.best", { count: profile.bestStreak })}</small>
            </div>
        </div>
    ) : null;

    const sessionRatingTrail = showRatedProfile ? (
        <div className={styles.ratingTrail}>
            <span className={styles.ratingTrailLabel}>{t("stats.rating")}</span>
            <div className={styles.ratingTrailItems}>
                {ratingHistory.map((event, index) => (
                    <span
                        key={`${event.id}-${index}`}
                        className={[
                            styles.ratingResult,
                            event.delta > 0
                                ? styles.ratingGain
                                : event.delta < 0
                                    ? styles.ratingLoss
                                    : styles.ratingNeutral
                        ].join(" ")}
                        title={String(event.ratingAfter)}
                    >
                        {event.delta > 0 ? "+" : ""}{event.delta}
                    </span>
                ))}
                {puzzle?.source == "lichess"
                    && ratedSession
                    && pageState == "playing"
                    && <span className={styles.ratingPending} aria-hidden="true" />
                }
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
        {!trainingActive && (
            <section className={styles.hero}>
                <div>
                    <span className={styles.eyebrow}>{t("hero.eyebrow")}</span>
                    <h1>{t("hero.title")}</h1>
                    <p>{pageCopy.heroSubtitle}</p>
                </div>
                {profileStats}
            </section>
        )}

        {(pageState == "loading" || pageState == "error") && (
            <section className={styles.stateCard}>
                <span className={styles.stateSpinner} />
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
                "nexo-puzzle-setup-shell",
                !coachEnabled ? readable.setupGridWithoutCoach : ""
            ].filter(Boolean).join(" ")}>
                <div className={[
                    styles.setupMain,
                    readable.setupMain,
                    "nexo-puzzle-setup-main"
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
                                    <path d="M4.5 8.5h15v11h-15zM3.5 4.5h17v4h-17zM9.5 12h5" />
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
                                    <path d="M8 4.5c4-1.8 8 .6 8 4.5 0 2.2-1.2 3.4-3 4.7-1.5 1.1-2.4 2.3-2.4 4.3M9.8 21h.1" />
                                </svg>
                            </span>
                            <span>
                                <strong>{pageCopy.trainingTitle}</strong>
                                <small>{pageCopy.trainingSubtitle}</small>
                            </span>
                        </button>
                    </div>

                    {source == "archive"
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
                            <ThemeMultiSelector
                                catalogue={puzzleCatalogue}
                                selections={themeSelections}
                                onChange={setThemeSelections}
                            />

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
                                            aria-pressed={difficulty == value}
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
                        source == "archive" ? styles.archiveSessionOptions : ""
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
                            || (
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
                        message={spokenSetupCoachMessage}
                        animationsEnabled={settings.coach.animations}
                        title={t("coach.title", { name: selectedCoach.name })}
                        onCoachClick={() => setCoachPickerOpen(true)}
                    />
                )}
            </section>
        )}

        {puzzle && trainingActive && (
            <section className={[
                styles.trainingGrid,
                "nexo-puzzle-training-shell"
            ].join(" ")}>
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
                        </div>
                    </div>
                </header>

                <aside className="nexo-puzzle-left-rail">
                    <button
                        type="button"
                        className="nexo-puzzle-back-top"
                        onClick={returnToSetup}
                        title={t("actions.changeFilters")}
                        aria-label={t("actions.changeFilters")}
                    >
                        ←
                    </button>

                    {puzzle.source == "archive" && (
                        <div className="nexo-puzzle-source-card">
                            <strong>{puzzle.gameLabel || t("puzzle.archiveSource")}</strong>
                            <span>
                                {puzzle.moveNumber
                                    ? `${t("puzzle.archiveSource")} · #${puzzle.moveNumber}`
                                    : t("puzzle.archiveSource")
                                }
                            </span>
                        </div>
                    )}

                    {showRatedProfile && (
                        <div className="nexo-puzzle-score-card">
                            <div className="nexo-puzzle-score-head">
                                <strong>{t("options.rated.title")}</strong>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={ratedSession}
                                    aria-label={t("options.rated.title")}
                                    className="nexo-puzzle-switch"
                                    onClick={() => setRatedSession(value => !value)}
                                />
                            </div>
                            <strong className="nexo-puzzle-score-value">
                                {profile.rating}
                            </strong>
                            {puzzle.rating && (
                                <small>{t("puzzle.rating", { rating: puzzle.rating })}</small>
                            )}
                            <div className="nexo-puzzle-mini-stats">
                                <div>
                                    <span>{t("stats.accuracy")}</span>
                                    <strong>{accuracy}%</strong>
                                    <small>
                                        {t("stats.attempts", { count: profile.attempts })}
                                    </small>
                                </div>
                                <div>
                                    <span>{t("stats.streak")}</span>
                                    <strong>{profile.streak}</strong>
                                    <small>
                                        {t("stats.best", { count: profile.bestStreak })}
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="nexo-puzzle-session-card">
                        <button
                            type="button"
                            className="nexo-puzzle-back-link"
                            onClick={returnToSetup}
                        >
                            <span aria-hidden="true">‹</span>
                            {t("actions.changeFilters")}
                        </button>

                        <div className={[
                            "nexo-puzzle-left-control",
                            "nexo-puzzle-auto-next-control"
                        ].join(" ")}>
                            <div className="nexo-puzzle-control-row">
                                <strong>{t("actions.autoNext")}</strong>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={autoNext}
                                    aria-label={t("actions.autoNext")}
                                    className="nexo-puzzle-switch"
                                    onClick={() => setAutoNext(value => !value)}
                                />
                            </div>
                        </div>
                    </div>

                    {source == "lichess" && (
                        <details className="nexo-puzzle-difficulty-menu">
                            <summary>
                                <span>{t("filters.difficulty")}</span>
                                <small>{t(`difficulties.${difficulty}.title`)}</small>
                            </summary>
                            <div className="nexo-puzzle-difficulty-options">
                                {difficulties.map(value => (
                                    <button
                                        type="button"
                                        key={value}
                                        className={difficulty == value
                                            ? "nexo-active"
                                            : ""
                                        }
                                        onClick={event => {
                                            setDifficulty(value);
                                            const details = event.currentTarget
                                                .closest("details");
                                            if (details) details.open = false;
                                        }}
                                    >
                                        <span>{t(`difficulties.${value}.title`)}</span>
                                        <small>{t(`difficulties.${value}.range`)}</small>
                                    </button>
                                ))}
                            </div>
                        </details>
                    )}

                    <div
                        className="nexo-puzzle-timer"
                        role="timer"
                        aria-live="off"
                    >
                        <span aria-hidden="true">
                            <svg
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="13" r="8" />
                                <path d="M12 9v4l2.5 1.5" />
                                <path d="M9 3h6" />
                            </svg>
                        </span>
                        <strong>
                            {String(Math.floor(puzzleElapsedSeconds / 60))
                                .padStart(2, "0")}
                            :
                            {String(puzzleElapsedSeconds % 60)
                                .padStart(2, "0")}
                        </strong>
                    </div>

                    {showRatedProfile && (
                        <div className="nexo-puzzle-left-history">
                            {sessionRatingTrail}
                        </div>
                    )}
                </aside>

                <div className={[
                    styles.boardColumn,
                    "nexo-puzzle-board-column"
                ].join(" ")}>
                    <div
                        className={[
                            styles.boardStage,
                            settings.themes.board.coordinates == "outside"
                                ? styles.boardStageWithOutsideCoordinates
                                : "",
                            "nexo-puzzle-board-stage",
                            puzzleBoardOrientation == "black"
                                ? "nexo-puzzle-board-black"
                                : "nexo-puzzle-board-white",
                            evaluationVisible ? "" : "nexo-eval-hidden"
                        ].filter(Boolean).join(" ")}
                    >
                        <div className="nexo-puzzle-board-tools">
                            <button
                                type="button"
                                className={[
                                    "nexo-puzzle-tool-button",
                                    "nexo-puzzle-tool-flip"
                                ].join(" ")}
                                onClick={() => (
                                    setBoardFlipped(flipped => !flipped)
                                )}
                                title={flipBoardLabel}
                                aria-label={flipBoardLabel}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    width="20"
                                    height="20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                >
                                    <path d="M7 7h10l-2.5-2.5" />
                                    <path d="M17 17H7l2.5 2.5" />
                                    <path d="M19 9.5A7 7 0 0 1 17 17" />
                                    <path d="M5 14.5A7 7 0 0 1 7 7" />
                                </svg>
                            </button>
                        </div>

                        {evaluationVisible && (
                            <EvaluationBar
                                className={styles.evaluationBar}
                                evaluation={boardEvaluation}
                                moveColour={
                                    new Chess(currentFen).turn() == "w"
                                        ? PieceColour.WHITE
                                        : PieceColour.BLACK
                                }
                                flipped={puzzleBoardOrientation == "black"}
                            />
                        )}

                        <div
                            ref={puzzleBoardShellRef}
                            className={styles.boardShell}
                            onMouseDownCapture={beginManualArrow}
                            onMouseUpCapture={finishManualArrow}
                            onContextMenu={event => event.preventDefault()}
                        >
                            <Chessboard
                                position={currentFen}
                                boardOrientation={puzzleBoardOrientation}
                                showBoardNotation={
                                    settings.themes.board.coordinates == "inside"
                                }
                                animationDuration={165}
                                arePiecesDraggable={
                                    pageState == "playing"
                                    && !pendingReply
                                    && !wrongMovePreview
                                    && atLivePosition
                                }
                                onPieceDrop={(from, to) => playExpectedMove(from, to)}
                                onSquareClick={selectBoardSquare}
                                areArrowsAllowed={false}
                                customPieces={customPieces}
                                customSquare={
                                    PuzzleBoardSquare as unknown as NonNullable<
                                        React.ComponentProps<
                                            typeof Chessboard
                                        >["customSquare"]
                                    >
                                }
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

                            {(hintArrow.length > 0 || manualArrows.length > 0) && (
                                <SuggestionArrowOverlay
                                    arrows={[
                                        ...hintArrow.map(arrow => ({
                                            from: arrow[0],
                                            to: arrow[1],
                                            colour: String(arrow[2] || "#78a7ff")
                                        })),
                                        ...manualArrows.map(([from, to, colour]) => ({
                                            from,
                                            to,
                                            colour: String(
                                                colour
                                                || settings.analysis.arrowStyle.manualColour
                                            )
                                        }))
                                    ]}
                                    flipped={puzzleBoardOrientation == "black"}
                                />
                            )}

                            {settings.themes.board.coordinates == "outside" && (
                                <OutsideCoordinates
                                    flipped={puzzleBoardOrientation == "black"}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <aside className={[
                    styles.trainingPanel,
                    readable.trainingPanel,
                    "nexo-puzzle-right-rail"
                ].join(" ")}>
                    {coachEnabled && (
                        <CoachCard
                            coach={selectedCoach}
                            expression={coachExpression}
                            message={spokenCoachMessage}
                            animationsEnabled={settings.coach.animations}
                            title={t("coach.title", { name: selectedCoach.name })}
                            onCoachClick={() => setCoachPickerOpen(true)}
                        />
                    )}

                    <div className={[
                        styles.objectiveCard,
                        "nexo-puzzle-objective"
                    ].join(" ")}>
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

                        <div className={styles.positionDetails}>
                            {puzzle.rating && (
                                <span>
                                    {t("puzzle.rating", { rating: puzzle.rating })}
                                </span>
                            )}
                            {puzzle.classification && (
                                <span className={styles.positionErrorBadge}>
                                    {t(
                                        `classifications.${puzzle.classification}`,
                                        { ns: "analysis" }
                                    )}
                                </span>
                            )}
                            {visibleThemes
                                .filter(value => value != puzzle.classification)
                                .slice(0, 2)
                                .map(value => (
                                    <span key={value}>
                                        {formatPuzzleTheme(
                                            value,
                                            i18n.resolvedLanguage || "en"
                                        )}
                                    </span>
                                ))
                            }
                        </div>
                    </div>

                    {pageState == "playing" && (
                        <div className={[
                            styles.puzzleActions,
                            "nexo-puzzle-actions"
                        ].join(" ")}>
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
                        className={[
                            styles.nextPuzzle,
                            "nexo-puzzle-next"
                        ].join(" ")}
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

                    <div className={[
                        styles.secondaryActions,
                        "nexo-puzzle-secondary"
                    ].join(" ")}>
                        <button type="button" onClick={returnToSetup}>
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
        <i><b /></i>
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
        readable.coachCard,
        "nexo-puzzle-coach-card"
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
