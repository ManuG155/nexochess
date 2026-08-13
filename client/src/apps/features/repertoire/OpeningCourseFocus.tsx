import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chess, Move, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import useSettingsStore from "@/stores/SettingsStore";
import { createCustomPieces } from "@/lib/chessAppearance";
import CoachPortrait from "@analysis/components/AnalysisPanel/CoachPortrait";
import {
    CoachExpression,
    CoachId,
    coachOptions,
    getCoachById,
    getCoachSpokenLine
} from "@analysis/lib/coach";

import { OpeningCatalogueEntry } from "./openingCatalogue";
import {
    CourseProgressStore,
    createLessonId,
    recordLessonReview
} from "./courseProgress";
import * as focus from "./courseFocus.module.css";
import * as polish from "./coursePolish.module.css";

export type RepertoireSide = "white" | "black";
type CourseMode = "learn" | "practice" | "complete";

interface OpeningCourseFocusProps {
    opening: OpeningCatalogueEntry;
    courseLines: OpeningCatalogueEntry[];
    initialSide: RepertoireSide;
    startInPractice?: boolean;
    progress: CourseProgressStore;
    setProgress: React.Dispatch<React.SetStateAction<CourseProgressStore>>;
    onAddToRepertoire: (
        opening: OpeningCatalogueEntry,
        side: RepertoireSide
    ) => void;
    onBack: () => void;
    onNext: (opening: OpeningCatalogueEntry, side: RepertoireSide) => void;
}

function getCourseMoves(opening: OpeningCatalogueEntry) {
    try {
        const board = new Chess();
        board.loadPgn(opening.pgn);
        return board.history({ verbose: true });
    } catch {
        return [] as Move[];
    }
}

function getFenAtStep(moves: Move[], step: number) {
    const board = new Chess();
    for (const move of moves.slice(0, step)) {
        board.move({
            from: move.from,
            to: move.to,
            ...(move.promotion ? { promotion: move.promotion } : {})
        });
    }
    return board.fen();
}

function dueLabel(value?: string) {
    if (!value) return "";
    const due = new Date(value);
    if (!Number.isFinite(due.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(due);
}

export default function OpeningCourseFocus({
    opening,
    courseLines,
    initialSide,
    startInPractice = false,
    progress,
    setProgress,
    onAddToRepertoire,
    onBack,
    onNext
}: OpeningCourseFocusProps) {
    const { t } = useTranslation("repertoire");
    const { t: tCourse } = useTranslation("repertoireCourse");
    const { t: tEditor } = useTranslation("repertoireEditor");
    const { t: tCoach } = useTranslation("coach", { useSuspense: false });
    const settings = useSettingsStore(state => state.settings);
    const setSettings = useSettingsStore(state => state.setSettings);
    const customPieces = useMemo(
        () => createCustomPieces(settings.themes.piece),
        [settings.themes.piece]
    );
    const selectedCoach = getCoachById(settings.appearance.selectedCoach);
    const coachEnabled = settings.coach.enabled;

    const moves = useMemo(() => getCourseMoves(opening), [opening]);
    const lessonId = createLessonId(opening.eco, opening.name, opening.pgn);
    const currentProgress = progress[lessonId];
    const selectedIndex = courseLines.findIndex(line => (
        createLessonId(line.eco, line.name, line.pgn) == lessonId
    ));
    const nextOpening = selectedIndex >= 0 ? courseLines[selectedIndex + 1] : undefined;

    const [side, setSide] = useState<RepertoireSide>(initialSide);
    const [courseMode, setCourseMode] = useState<CourseMode>(
        startInPractice ? "practice" : "learn"
    );
    const [learnStep, setLearnStep] = useState(0);
    const [practiceIndex, setPracticeIndex] = useState(0);
    const [selectedSquare, setSelectedSquare] = useState<Square>();
    const [showHint, setShowHint] = useState(false);
    const [sessionMistakes, setSessionMistakes] = useState(0);
    const [sessionRecorded, setSessionRecorded] = useState(false);
    const [completedRuns, setCompletedRuns] = useState(0);
    const [requiredRuns, setRequiredRuns] = useState(currentProgress ? 1 : 2);
    const [coachExpression, setCoachExpression] = useState<CoachExpression>(
        startInPractice ? "thinking" : "explaining"
    );
    const [coachMessageKey, setCoachMessageKey] = useState(
        startInPractice ? "learn.coach.practiceStart" : "learn.coach.lineStart"
    );

    const opponentTimerRef = useRef<number>();
    const repeatTimerRef = useRef<number>();
    const runHandledRef = useRef(false);

    const learnerColour = side == "white" ? "w" : "b";
    const expectedMove = moves[practiceIndex];
    const practiceFen = getFenAtStep(moves, practiceIndex);
    const activeFen = courseMode == "learn"
        ? getFenAtStep(moves, learnStep)
        : getFenAtStep(moves, courseMode == "complete" ? moves.length : practiceIndex);

    function clearRepeatTimer() {
        if (repeatTimerRef.current != undefined) {
            window.clearTimeout(repeatTimerRef.current);
            repeatTimerRef.current = undefined;
        }
    }

    useEffect(() => () => {
        clearRepeatTimer();
        if (opponentTimerRef.current != undefined) {
            window.clearTimeout(opponentTimerRef.current);
        }
    }, []);

    useEffect(() => {
        if (opponentTimerRef.current != undefined) {
            window.clearTimeout(opponentTimerRef.current);
            opponentTimerRef.current = undefined;
        }
        if (
            courseMode != "practice"
            || practiceIndex >= moves.length
            || expectedMove?.color == learnerColour
        ) return undefined;

        setCoachExpression("explaining");
        setCoachMessageKey("learn.coach.opponent");
        opponentTimerRef.current = window.setTimeout(() => {
            setPracticeIndex(index => Math.min(index + 1, moves.length));
            setSelectedSquare(undefined);
            setShowHint(false);
        }, 430);

        return () => {
            if (opponentTimerRef.current != undefined) {
                window.clearTimeout(opponentTimerRef.current);
                opponentTimerRef.current = undefined;
            }
        };
    }, [courseMode, expectedMove?.color, learnerColour, moves.length, practiceIndex]);

    useEffect(() => {
        if (
            courseMode != "practice"
            || moves.length == 0
            || practiceIndex < moves.length
            || sessionRecorded
            || runHandledRef.current
        ) return;

        runHandledRef.current = true;
        const nextCompletedRuns = completedRuns + 1;
        setCompletedRuns(nextCompletedRuns);

        if (nextCompletedRuns >= requiredRuns) {
            const alreadyLearned = Boolean(currentProgress);
            setProgress(previous => recordLessonReview(previous, {
                id: lessonId,
                openingName: opening.name,
                family: opening.family,
                eco: opening.eco,
                pgn: opening.pgn,
                side
            }, sessionMistakes));
            if (!alreadyLearned) onAddToRepertoire(opening, side);
            setSessionRecorded(true);
            setCourseMode("complete");
            setCoachExpression("celebrating");
            setCoachMessageKey("learn.coach.completed");
            return;
        }

        setCoachExpression("approving");
        setCoachMessageKey("course:practice.againCoach");
        clearRepeatTimer();
        repeatTimerRef.current = window.setTimeout(() => {
            repeatTimerRef.current = undefined;
            runHandledRef.current = false;
            setPracticeIndex(0);
            setSelectedSquare(undefined);
            setShowHint(false);
            setCoachExpression("thinking");
            setCoachMessageKey("learn.coach.practiceStart");
        }, 850);
    }, [
        completedRuns,
        courseMode,
        currentProgress,
        lessonId,
        moves.length,
        onAddToRepertoire,
        opening,
        practiceIndex,
        requiredRuns,
        sessionMistakes,
        sessionRecorded,
        setProgress,
        side
    ]);

    function resetPractice(nextSide = side) {
        clearRepeatTimer();
        setSide(nextSide);
        setCourseMode("practice");
        setPracticeIndex(0);
        setSelectedSquare(undefined);
        setShowHint(false);
        setSessionMistakes(0);
        setSessionRecorded(false);
        setCompletedRuns(0);
        setRequiredRuns(currentProgress ? 1 : 2);
        runHandledRef.current = false;
        setCoachExpression("thinking");
        setCoachMessageKey("learn.coach.practiceStart");
    }

    function returnToLearn() {
        clearRepeatTimer();
        setCourseMode("learn");
        setLearnStep(0);
        setPracticeIndex(0);
        setSelectedSquare(undefined);
        setShowHint(false);
        setSessionRecorded(false);
        setCompletedRuns(0);
        runHandledRef.current = false;
        setCoachExpression("explaining");
        setCoachMessageKey("learn.coach.lineStart");
    }

    function registerDifficulty() {
        setSessionMistakes(value => value + 1);
        setRequiredRuns(value => Math.max(value, currentProgress ? 2 : 3));
    }

    function playPracticeMove(from: string, to: string) {
        if (
            courseMode != "practice"
            || !expectedMove
            || expectedMove.color != learnerColour
        ) return false;
        const correct = expectedMove.from == from && expectedMove.to == to;
        if (!correct) {
            registerDifficulty();
            setCoachExpression("worried");
            setCoachMessageKey("learn.coach.tryAgain");
            setShowHint(false);
            setSelectedSquare(undefined);
            return false;
        }
        setPracticeIndex(index => Math.min(index + 1, moves.length));
        setSelectedSquare(undefined);
        setShowHint(false);
        setCoachExpression("approving");
        setCoachMessageKey("learn.coach.correct");
        return true;
    }

    function requestHint() {
        if (!expectedMove || expectedMove.color != learnerColour) return;
        if (!showHint) registerDifficulty();
        setShowHint(true);
        setCoachExpression("explaining");
        setCoachMessageKey("learn.coach.hint");
    }

    function onSquareClick(squareName: string) {
        if (
            courseMode != "practice"
            || !expectedMove
            || expectedMove.color != learnerColour
        ) return;
        const square = squareName as Square;
        const board = new Chess(practiceFen);
        if (!selectedSquare) {
            const piece = board.get(square);
            if (piece?.color == learnerColour) setSelectedSquare(square);
            return;
        }
        if (selectedSquare == square) {
            setSelectedSquare(undefined);
            return;
        }
        if (!playPracticeMove(selectedSquare, square)) {
            const piece = board.get(square);
            setSelectedSquare(piece?.color == learnerColour ? square : undefined);
        }
    }

    const squareStyles: NonNullable<
        React.ComponentProps<typeof Chessboard>["customSquareStyles"]
    > = {};
    if (selectedSquare && courseMode == "practice") {
        squareStyles[selectedSquare] = {
            boxShadow: "inset 0 0 0 4px rgba(96,151,255,.92)"
        };
        if (settings.themes.board.legalMoveHints) {
            const board = new Chess(practiceFen);
            board.moves({ square: selectedSquare, verbose: true }).forEach(move => {
                squareStyles[move.to] = board.get(move.to)
                    ? { boxShadow: "inset 0 0 0 5px rgba(18,24,34,.34)" }
                    : {
                        backgroundImage:
                            "radial-gradient(circle, rgba(18,24,34,.42) 0 16%, transparent 17%)"
                    };
            });
        }
    }

    function explainMove(move?: Move) {
        if (!move) return t("learn.explanations.start");
        if (move.san.includes("O-O")) return t("learn.explanations.castle");
        if (move.san.includes("+")) return t("learn.explanations.check");
        if (move.san.includes("x")) return t("learn.explanations.capture");
        if (move.piece == "n") return t("learn.explanations.knight");
        if (move.piece == "b") return t("learn.explanations.bishop");
        if (move.piece == "q") return t("learn.explanations.queen");
        if (move.piece == "p" && ["d4", "e4", "d5", "e5"].includes(move.to)) {
            return t("learn.explanations.centrePawn");
        }
        if (move.piece == "p") return t("learn.explanations.pawn");
        return t("learn.explanations.piece");
    }

    const currentLearnMove = learnStep > 0 ? moves[learnStep - 1] : undefined;
    const coachTemplate = coachMessageKey.startsWith("course:")
        ? tCourse(coachMessageKey.slice("course:".length), {
            opening: opening.name,
            move: expectedMove?.san || ""
        })
        : t(coachMessageKey, {
            opening: opening.name,
            move: expectedMove?.san || ""
        });
    const coachMessage = getCoachSpokenLine(
        selectedCoach,
        coachTemplate,
        `${coachMessageKey}|${opening.name}|${practiceIndex}|${learnStep}|${completedRuns}`,
        tCoach
    );
    const repetitionCurrent = Math.min(completedRuns + 1, requiredRuns);
    const phaseLabel = courseMode == "learn"
        ? tCourse("practice.studyPhase")
        : courseMode == "practice"
            ? tCourse("practice.practicePhase")
            : tCourse("practice.completePhase");

    return <section className={`${focus.focusSection} ${polish.focusSection}`}>
        <div className={`${focus.topBar} ${polish.topBar}`}>
            <button
                type="button"
                className={focus.backButton}
                onClick={() => {
                    clearRepeatTimer();
                    onBack();
                }}
                aria-label={tCourse("practice.backModule")}
            >←</button>
            <div className={`${focus.titleBlock} ${polish.titleBlock}`}>
                <span>{opening.eco} · {opening.family}</span>
                <strong>{opening.name}</strong>
                <small>{opening.pgn}</small>
            </div>
            <div className={focus.topActions}>
                <div className={focus.sidePicker}>
                    {(["white", "black"] as RepertoireSide[]).map(value => <button
                        key={value}
                        type="button"
                        className={side == value ? focus.sideActive : focus.sideButton}
                        onClick={() => resetPractice(value)}
                    >{t(`side.${value}`)}</button>)}
                </div>
                <div className={focus.progressChip}>
                    <strong>{phaseLabel}</strong>
                    <span>{selectedIndex + 1}/{courseLines.length}</span>
                </div>
            </div>
        </div>

        <div className={`${focus.grid} ${polish.grid}`}>
            <div className={focus.boardColumn}>
                <div className={`${focus.boardWrap} ${polish.boardWrap}`}>
                    <Chessboard
                        id="repertoire-course-board-v3"
                        position={activeFen}
                        boardOrientation={side}
                        onPieceDrop={(from, to) => playPracticeMove(from, to)}
                        onPieceDragBegin={(_piece, source) => {
                            if (courseMode == "practice") setSelectedSquare(source as Square);
                        }}
                        onPieceDragEnd={() => setSelectedSquare(undefined)}
                        onSquareClick={onSquareClick}
                        arePiecesDraggable={
                            courseMode == "practice"
                            && expectedMove?.color == learnerColour
                        }
                        customPieces={customPieces}
                        customDarkSquareStyle={{
                            backgroundColor: settings.themes.board.darkSquareColour
                        }}
                        customLightSquareStyle={{
                            backgroundColor: settings.themes.board.lightSquareColour
                        }}
                        customSquareStyles={squareStyles}
                        showBoardNotation={settings.themes.board.coordinates == "inside"}
                        snapToCursor
                    />
                </div>

                {courseMode == "learn" && <div className={`${focus.controlBar} ${polish.controlBar}`}>
                    <button
                        type="button"
                        disabled={learnStep == 0}
                        onClick={() => setLearnStep(step => Math.max(0, step - 1))}
                    >← {t("editor.previous")}</button>
                    <div className={`${focus.controlStatus} ${polish.controlStatus}`}>
                        <strong>{t("learn.step", { current: learnStep, total: moves.length })}</strong>
                        <span>{tCourse("practice.studyHint")}</span>
                    </div>
                    {learnStep < moves.length ? <button
                        type="button"
                        onClick={() => {
                            setLearnStep(step => Math.min(moves.length, step + 1));
                            setCoachExpression("explaining");
                            setCoachMessageKey("learn.coach.move");
                        }}
                    >{t("editor.next")} →</button> : <button
                        type="button"
                        className={focus.primaryButton}
                        onClick={() => resetPractice()}
                    >{tCourse("practice.start")}</button>}
                </div>}

                {courseMode == "practice" && <div className={`${focus.controlBar} ${polish.controlBar}`}>
                    <button
                        type="button"
                        className={focus.secondaryButton}
                        onClick={requestHint}
                        disabled={!expectedMove || expectedMove.color != learnerColour}
                    >{t("learn.hint")}</button>
                    <div className={`${focus.controlStatus} ${polish.controlStatus}`}>
                        <strong>{tCourse("practice.repetition", {
                            current: repetitionCurrent,
                            total: requiredRuns
                        })}</strong>
                        <span>{showHint && expectedMove
                            ? t("learn.hintMove", { move: expectedMove.san })
                            : t("learn.practiceInstruction")}</span>
                    </div>
                    <button
                        type="button"
                        className={focus.secondaryButton}
                        onClick={returnToLearn}
                    >{t("learn.reviewLine")}</button>
                </div>}

                {courseMode == "complete" && <div className={`${focus.controlBar} ${polish.controlBar}`}>
                    <button type="button" className={focus.secondaryButton} onClick={onBack}>
                        {tCourse("practice.backModule")}
                    </button>
                    <div className={`${focus.controlStatus} ${polish.controlStatus}`}>
                        <strong>{tCourse("practice.completeTitle")}</strong>
                        <span>{tCourse("practice.autoSaved")}</span>
                    </div>
                    {nextOpening ? <button
                        type="button"
                        className={focus.primaryButton}
                        onClick={() => onNext(nextOpening, side)}
                    >{tCourse("practice.nextLine")} →</button> : <button
                        type="button"
                        className={focus.primaryButton}
                        onClick={onBack}
                    >{tCourse("practice.moduleDone")}</button>}
                </div>}
            </div>

            <aside className={`${focus.panel} ${polish.panel}`}>
                {coachEnabled && <div className={`${focus.coachCard} ${polish.coachCard}`}>
                    <CoachPortrait
                        coach={selectedCoach}
                        baseExpression={coachExpression}
                        speechText={coachMessage}
                        animationsEnabled={settings.coach.animations}
                        className={`${focus.coachPortrait} ${polish.coachPortrait}`}
                    />
                    <div className={`${focus.coachBubble} ${polish.coachBubble}`}>
                        <div className={polish.coachHeader}>
                            <strong>{selectedCoach.name}</strong>
                            <select
                                className={polish.coachPicker}
                                value={selectedCoach.id}
                                aria-label={tEditor("coachPicker")}
                                title={tEditor("coachPicker")}
                                onChange={event => {
                                    const nextCoach = event.target.value as CoachId;
                                    setSettings(previous => ({
                                        ...previous,
                                        appearance: {
                                            ...previous.appearance,
                                            selectedCoach: nextCoach
                                        }
                                    }));
                                }}
                            >
                                {coachOptions.map(coach => <option key={coach.id} value={coach.id}>
                                    {coach.name}
                                </option>)}
                            </select>
                        </div>
                        <p>{coachMessage}</p>
                    </div>
                </div>}

                {courseMode == "learn" && <div className={`${focus.panelCard} ${polish.panelCard}`}>
                    <span>{t("learn.whyTitle")}</span>
                    <strong>{currentLearnMove?.san || t("editor.startPosition")}</strong>
                    <p>{explainMove(currentLearnMove)}</p>
                </div>}

                {courseMode == "practice" && <div className={`${focus.repetitionCard} ${polish.repetitionCard}`}>
                    <span>{tCourse("practice.memoryBlock")}</span>
                    <strong>{tCourse("practice.repetition", {
                        current: repetitionCurrent,
                        total: requiredRuns
                    })}</strong>
                    <p>{requiredRuns > (currentProgress ? 1 : 2)
                        ? tCourse("practice.extra")
                        : tCourse("practice.repeatRule")}</p>
                    <div className={focus.repetitionDots}>
                        {Array.from({ length: requiredRuns }, (_, index) => <i
                            key={index}
                            data-done={index < completedRuns ? "true" : "false"}
                        />)}
                    </div>
                </div>}

                {courseMode == "complete" && <div className={`${focus.completionCard} ${polish.completionCard}`}>
                    <span>{tCourse("practice.lessonComplete")}</span>
                    <strong>{tCourse("practice.completeTitle")}</strong>
                    <p>{tCourse("practice.completeBody")}</p>
                    <div className={focus.autoSaved}>
                        <span>✓</span>
                        <span>{tCourse("practice.autoSaved")}</span>
                    </div>
                </div>}

                {currentProgress && <div className={`${focus.panelCard} ${polish.panelCard}`}>
                    <span>{t("learn.srsActive")}</span>
                    <strong>{currentProgress.mastered
                        ? t("learn.mastered")
                        : t("learn.nextReview", { date: dueLabel(currentProgress.dueAt) })}</strong>
                    <p>{tCourse("practice.srsExplainer")}</p>
                </div>}

                <div className={`${focus.panelCard} ${polish.panelCard}`}>
                    <span>{t("learn.referenceLine")}</span>
                    <div className={`${focus.moveList} ${polish.moveList}`}>
                        {moves.map((move, index) => <button
                            type="button"
                            key={`${move.san}-${index}`}
                            className={courseMode == "learn" && learnStep == index + 1
                                ? focus.moveActive
                                : focus.move}
                            onClick={() => {
                                if (courseMode == "learn") setLearnStep(index + 1);
                            }}
                        >
                            <span>{index % 2 == 0
                                ? `${Math.floor(index / 2) + 1}.`
                                : "…"}</span>
                            {move.san}
                        </button>)}
                    </div>
                </div>
            </aside>
        </div>
    </section>;
}
