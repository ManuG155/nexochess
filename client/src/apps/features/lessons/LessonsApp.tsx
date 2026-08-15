import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import useSettingsStore from "@/stores/SettingsStore";
import {
    createCustomPieces,
    normalisePieceTheme
} from "@/lib/chessAppearance";
import { playBoardMoveSound } from "@/lib/boardSounds";
import CoachPicker from "@analysis/components/AnalysisPanel/CoachPicker";
import CoachPortrait from "@analysis/components/AnalysisPanel/CoachPortrait";
import {
    getCoachById
} from "@analysis/lib/coach";
import type { CoachId } from "@analysis/lib/coach";

import {
    curriculumLevels,
    curriculumLessons,
    getNextCurriculumLesson,
    TOTAL_LESSONS
} from "./curriculum";
import {
    evaluateMoveAttempt,
    evaluateSquareAttempt
} from "./lessonEngine";
import { getLessonFeedbackVisual } from "./feedbackAdapter";
import {
    loadLessonsProgress,
    markLessonComplete,
    setCurrentLesson,
    unlockLessonsThrough
} from "./progress";
import { rookLesson } from "./rookLesson";
import type {
    AttemptResult,
    LessonHint,
    LessonOutcome
} from "./lessonModel";

import * as styles from "./lessons.module.css";

type View = "path" | "lesson";
type CurriculumLessonEntry = (typeof curriculumLessons)[number];
type PathNodeState = "complete" | "current" | "available" | "locked";

interface FeedbackState {
    outcome: LessonOutcome;
    key: string;
}

const RANK_COORDINATES = ["8", "7", "6", "5", "4", "3", "2", "1"];
const FILE_COORDINATES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function isPositiveOutcome(outcome: LessonOutcome) {
    return outcome == "success" || outcome == "acceptedAlternative";
}

function PathNode({
    label,
    symbol,
    number,
    state,
    onClick,
    alternate = false
}: {
    label: string;
    symbol: string;
    number: number;
    state: PathNodeState;
    onClick: () => void;
    alternate?: boolean;
}) {
    return <div
        id={`lesson-node-${number}`}
        className={[
            styles.pathNodeRow,
            alternate ? styles.pathNodeAlternate : ""
        ].filter(Boolean).join(" ")}
        data-state={state}
    >
        <button
            type="button"
            className={styles.pathNode}
            onClick={onClick}
            aria-label={`${number}. ${label}`}
        >
            <span className={styles.nodeNumber}>{String(number).padStart(2, "0")}</span>
            <span className={styles.nodeSymbol} aria-hidden="true">
                {state == "complete" ? "✓" : symbol}
            </span>
            {state == "locked" && <span className={styles.nodeLock} aria-hidden="true">•</span>}
        </button>
        <div className={styles.nodeCopy}>
            <strong>{label}</strong>
        </div>
    </div>;
}

function LessonBoard({
    fen,
    selectedFrom,
    resolved,
    stepKind,
    pieces,
    darkSquareColour,
    lightSquareColour,
    coordinates,
    squareStyles,
    arrows,
    onSquareClick,
    onPieceDrop,
    onPieceDragBegin,
    onPieceDragEnd
}: {
    fen: string;
    selectedFrom?: Square;
    resolved: boolean;
    stepKind: string;
    pieces: ReturnType<typeof createCustomPieces>;
    darkSquareColour: string;
    lightSquareColour: string;
    coordinates: "inside" | "outside";
    squareStyles: NonNullable<React.ComponentProps<typeof Chessboard>["customSquareStyles"]>;
    arrows?: Array<[Square, Square]>;
    onSquareClick: (square: string) => void;
    onPieceDrop: (from: string, to: string) => boolean;
    onPieceDragBegin: (source: string) => void;
    onPieceDragEnd: () => void;
}) {
    const outside = coordinates == "outside";

    return <div
        className={styles.boardShell}
        data-coordinates={coordinates}
        data-selected={Boolean(selectedFrom)}
    >
        {outside && <div className={styles.rankCoordinates} aria-hidden="true">
            {RANK_COORDINATES.map(rank => <span key={rank}>{rank}</span>)}
        </div>}

        <div className={styles.boardFrame}>
            <Chessboard
                id="nexochess-lessons-board"
                position={fen}
                onPieceDrop={onPieceDrop}
                onPieceDragBegin={(_piece, source) => onPieceDragBegin(source)}
                onPieceDragEnd={onPieceDragEnd}
                onSquareClick={onSquareClick}
                arePiecesDraggable={stepKind == "move" && !resolved}
                customPieces={pieces}
                customDarkSquareStyle={{ backgroundColor: darkSquareColour }}
                customLightSquareStyle={{ backgroundColor: lightSquareColour }}
                customSquareStyles={squareStyles}
                customArrows={arrows}
                showBoardNotation={!outside}
                snapToCursor
            />
        </div>

        {outside && <div className={styles.fileCoordinates} aria-hidden="true">
            {FILE_COORDINATES.map(file => <span key={file}>{file}</span>)}
        </div>}
    </div>;
}

function LessonsApp() {
    const { t } = useTranslation("lessons");
    const { t: tc, i18n } = useTranslation("lessonsCatalog");
    const settings = useSettingsStore(state => state.settings);
    const setSettings = useSettingsStore(state => state.setSettings);

    const pieces = useMemo(
        () => createCustomPieces(normalisePieceTheme(settings.themes.piece)),
        [settings.themes.piece]
    );

    const lessonTitles = useMemo(() => {
        const value = tc("lessonTitles", { returnObjects: true }) as unknown;
        return Array.isArray(value)
            ? value.map(item => String(item))
            : [];
    }, [i18n.resolvedLanguage, tc]);

    const [view, setView] = useState<View>("path");
    const [stepIndex, setStepIndex] = useState(0);
    const [boardFen, setBoardFen] = useState(rookLesson.steps[0].fen);
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [hintCount, setHintCount] = useState(0);
    const [selectedFrom, setSelectedFrom] = useState<Square>();
    const [coachPickerOpen, setCoachPickerOpen] = useState(false);
    const [jumpTarget, setJumpTarget] = useState<CurriculumLessonEntry | null>(null);
    const [plannedTarget, setPlannedTarget] = useState<CurriculumLessonEntry | null>(null);
    const [progress, setProgress] = useState(loadLessonsProgress);

    const coach = getCoachById(settings.appearance.selectedCoach);
    const step = rookLesson.steps[stepIndex];
    const resolved = feedback ? isPositiveOutcome(feedback.outcome) : false;
    const hints = step.hints || [];
    const activeHint: LessonHint | undefined = hintCount > 0
        ? hints[Math.min(hintCount - 1, hints.length - 1)]
        : undefined;

    const coachText = feedback
        ? t(feedback.key)
        : t(step.coachKey, { coach: coach.name });

    useEffect(() => {
        setBoardFen(step.fen);
        setFeedback(null);
        setHintCount(0);
        setSelectedFrom(undefined);
    }, [step.id]);

    useEffect(() => {
        if (view != "lesson") return;
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [view]);

    function titleFor(lesson: CurriculumLessonEntry) {
        return lessonTitles[lesson.titleIndex] || lesson.id;
    }

    function chooseCoach(id: CoachId) {
        setSettings(current => ({
            ...current,
            appearance: {
                ...current.appearance,
                selectedCoach: id
            }
        }));
        setCoachPickerOpen(false);
    }

    function resetRookLesson() {
        setStepIndex(0);
        setBoardFen(rookLesson.steps[0].fen);
        setFeedback(null);
        setHintCount(0);
        setSelectedFrom(undefined);
        setView("lesson");
    }

    function openCurriculumLesson(lesson: CurriculumLessonEntry) {
        if (!progress.unlockedLessonIds.includes(lesson.id)) {
            setJumpTarget(lesson);
            return;
        }

        setProgress(current => setCurrentLesson(current, lesson.id));

        if (lesson.playable && lesson.id == rookLesson.id) {
            resetRookLesson();
            return;
        }

        setPlannedTarget(lesson);
    }

    function confirmJump() {
        if (!jumpTarget) return;

        const next = unlockLessonsThrough(
            progress,
            curriculumLessons.map(lesson => lesson.id),
            jumpTarget.id
        );
        setProgress(next);

        const target = jumpTarget;
        setJumpTarget(null);

        if (target.playable && target.id == rookLesson.id) {
            resetRookLesson();
            return;
        }

        requestAnimationFrame(() => {
            const number = curriculumLessons.findIndex(
                lesson => lesson.id == target.id
            ) + 1;
            document
                .getElementById(`lesson-node-${number}`)
                ?.scrollIntoView({ block: "center", behavior: "smooth" });
        });
    }

    function registerResult(result: AttemptResult) {
        setFeedback({
            outcome: result.outcome,
            key: result.feedbackKey
        });

        if (isPositiveOutcome(result.outcome) && result.resultingFen) {
            setBoardFen(result.resultingFen);
        }

        if (isPositiveOutcome(result.outcome) && result.san) {
            playBoardMoveSound(result.san);
        }
    }

    function tryMove(from: Square, to: Square) {
        if (step.kind != "move" || resolved) return false;
        const result = evaluateMoveAttempt(step, from, to);
        registerResult(result);
        setSelectedFrom(undefined);
        return isPositiveOutcome(result.outcome);
    }

    function handleSquareClick(name: string) {
        const square = name as Square;

        if (step.kind == "selectSquare" && !resolved) {
            registerResult(evaluateSquareAttempt(step, square));
            return;
        }

        if (step.kind != "move" || resolved) return;

        const board = new Chess(boardFen);
        const piece = board.get(square);

        if (!selectedFrom) {
            if (piece?.color == "w") setSelectedFrom(square);
            return;
        }

        if (selectedFrom == square) {
            setSelectedFrom(undefined);
            return;
        }

        if (piece?.color == "w") {
            setSelectedFrom(square);
            return;
        }

        tryMove(selectedFrom, square);
    }

    function answerChoice(optionId: string) {
        if (step.kind != "multipleChoice" || resolved) return;

        if (optionId == step.correctOptionId) {
            registerResult({
                outcome: "success",
                feedbackKey: step.successKey
            });
        } else {
            registerResult({
                outcome: "conceptualError",
                feedbackKey: step.errorKey
            });
        }
    }

    function advance() {
        if (step.kind == "completion") {
            setView("path");
            requestAnimationFrame(() => {
                document
                    .getElementById(`lesson-node-${Math.max(
                        1,
                        curriculumLessons.findIndex(
                            lesson => lesson.id == progress.currentLessonId
                        ) + 1
                    )}`)
                    ?.scrollIntoView({ block: "center", behavior: "smooth" });
            });
            return;
        }

        if (step.kind != "message" && !resolved) return;

        const nextIndex = Math.min(stepIndex + 1, rookLesson.steps.length - 1);
        const nextStep = rookLesson.steps[nextIndex];

        if (nextStep.kind == "completion") {
            const nextCurriculumLesson = getNextCurriculumLesson(rookLesson.id);
            setProgress(current => markLessonComplete(
                current,
                rookLesson.id,
                nextCurriculumLesson?.id
            ));
        }

        setStepIndex(nextIndex);
    }

    const squareStyles: NonNullable<
        React.ComponentProps<typeof Chessboard>["customSquareStyles"]
    > = {};

    function mergeSquareStyle(
        square: Square,
        style: React.CSSProperties
    ) {
        squareStyles[square] = {
            ...(squareStyles[square] || {}),
            ...style
        };
    }

    if (
        selectedFrom
        && step.kind == "move"
        && !resolved
        && settings.themes.board.legalMoveHints
    ) {
        const board = new Chess(boardFen);
        board.moves({ square: selectedFrom, verbose: true }).forEach(move => {
            const occupied = board.get(move.to as Square);
            mergeSquareStyle(
                move.to as Square,
                occupied
                    ? { boxShadow: "inset 0 0 0 5px rgba(18,24,34,.34)" }
                    : {
                        backgroundImage:
                            "radial-gradient(circle, rgba(18,24,34,.42) 0 16%, transparent 17%)"
                    }
            );
        });
    }

    if (selectedFrom) {
        mergeSquareStyle(selectedFrom, {
            boxShadow: "inset 0 0 0 4px rgba(96,151,255,.92)"
        });
    }

    activeHint?.highlightSquares?.forEach(square => {
        mergeSquareStyle(square, {
            boxShadow: "inset 0 0 0 5px rgba(94,184,255,.82)"
        });
    });

    const feedbackVisual = feedback
        ? getLessonFeedbackVisual(feedback.outcome)
        : undefined;

    const lessonProgressPercent = Math.round(
        stepIndex / Math.max(1, rookLesson.steps.length - 1) * 100
    );

    const completedCount = curriculumLessons.filter(
        lesson => progress.completedLessonIds.includes(lesson.id)
    ).length;
    const pathProgressPercent = Math.round(completedCount / TOTAL_LESSONS * 100);

    if (view == "path") {
        let lessonNumber = 0;

        return <main className={`${styles.shell} ${styles.pathShell}`}>
            <section className={styles.pathHero}>
                <div className={styles.heroCopy}>
                    <span className={styles.eyebrow}>{t("page.eyebrow")}</span>
                    <h1>{t("page.title")}</h1>
                    <p>{t("page.subtitle")}</p>
                </div>

                <div className={styles.heroProgress}>
                    <span>{t("path.progressLabel")}</span>
                    <strong>{completedCount} / {TOTAL_LESSONS}</strong>
                    <div className={styles.progressTrack}>
                        <i style={{ width: `${pathProgressPercent}%` }}/>
                    </div>
                </div>
            </section>

            <div className={styles.pathExperience}>
                <div className={styles.pathStack}>
                    {curriculumLevels.map(level => (
                        <section
                            key={level.id}
                            className={styles.levelSection}
                            data-tone={level.tone}
                        >
                            <div className={styles.levelGlow} aria-hidden="true"/>
                            <div className={styles.levelDecorations} aria-hidden="true">
                                {level.decorations.map((symbol, index) => (
                                    <span key={`${symbol}-${index}`}><i>{symbol}</i></span>
                                ))}
                            </div>

                            <header className={styles.levelHeader}>
                                <div>
                                    <span>{tc(level.kickerKey)}</span>
                                    <h2>{tc(level.titleKey)}</h2>
                                    <p>{tc(level.descriptionKey)}</p>
                                </div>
                                <strong>
                                    {tc("levelLessonCount", {
                                        count: level.lessons.length
                                    })}
                                </strong>
                            </header>

                            <div className={styles.learningPath}>
                                <div className={styles.pathRail} aria-hidden="true"/>
                                {level.lessons.map((lesson, index) => {
                                    lessonNumber += 1;
                                    const number = lessonNumber;
                                    const complete = progress.completedLessonIds.includes(lesson.id);
                                    const unlocked = progress.unlockedLessonIds.includes(lesson.id);
                                    const current = progress.currentLessonId == lesson.id;

                                    const state: PathNodeState = complete
                                        ? "complete"
                                        : current
                                            ? "current"
                                            : unlocked
                                                ? "available"
                                                : "locked";

                                    return <PathNode
                                        key={lesson.id}
                                        label={titleFor({
                                            ...lesson,
                                            levelId: level.id,
                                            tone: level.tone
                                        })}
                                        symbol={lesson.symbol}
                                        number={number}
                                        state={state}
                                        alternate={index % 2 == 1}
                                        onClick={() => openCurriculumLesson({
                                            ...lesson,
                                            levelId: level.id,
                                            tone: level.tone
                                        })}
                                    />;
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                <aside className={styles.pathCoachRail}>
                    {settings.coach.enabled && <div className={styles.coachCard}>
                        <button
                            type="button"
                            className={styles.coachPortraitButton}
                            onClick={() => setCoachPickerOpen(true)}
                            aria-label={t("coach.change", { coach: coach.name })}
                            title={t("coach.change", { coach: coach.name })}
                        >
                            <CoachPortrait
                                coach={coach}
                                baseExpression="idle"
                                speechText={t("coach.pathIntro")}
                                animationsEnabled={settings.coach.animations}
                                className={styles.coachPortrait}
                            />
                        </button>
                        <div className={styles.speechBubble}>
                            <span>{coach.name}</span>
                            <p>{t("coach.pathIntro")}</p>
                            <small>{t("coach.clickToChange")}</small>
                        </div>
                    </div>}
                </aside>
            </div>

            {jumpTarget && <div
                className={styles.modalOverlay}
                onClick={() => setJumpTarget(null)}
            >
                <section
                    className={styles.pathDialog}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="lessons-jump-title"
                    onClick={event => event.stopPropagation()}
                >
                    <span className={styles.dialogKicker}>{tc("jump.kicker")}</span>
                    <h2 id="lessons-jump-title">{tc("jump.title")}</h2>
                    <strong>{titleFor(jumpTarget)}</strong>
                    <p>{tc("jump.body")}</p>
                    <div className={styles.dialogActions}>
                        <button type="button" onClick={() => setJumpTarget(null)}>
                            {tc("cancel")}
                        </button>
                        <button type="button" data-primary="true" onClick={confirmJump}>
                            {tc("jump.confirm")}
                        </button>
                    </div>
                </section>
            </div>}

            {plannedTarget && <div
                className={styles.modalOverlay}
                onClick={() => setPlannedTarget(null)}
            >
                <section
                    className={styles.pathDialog}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="lessons-planned-title"
                    onClick={event => event.stopPropagation()}
                >
                    <span className={styles.dialogKicker}>{tc("planned.kicker")}</span>
                    <h2 id="lessons-planned-title">{titleFor(plannedTarget)}</h2>
                    <p>{tc("planned.body")}</p>
                    <div className={styles.dialogActions}>
                        <button
                            type="button"
                            data-primary="true"
                            onClick={() => setPlannedTarget(null)}
                        >
                            {tc("close")}
                        </button>
                    </div>
                </section>
            </div>}

            {coachPickerOpen && <CoachPicker
                selectedCoach={coach}
                onClose={() => setCoachPickerOpen(false)}
                onConfirm={chooseCoach}
            />}
        </main>;
    }

    return <main className={`${styles.shell} ${styles.lessonShell}`}>
        <section className={styles.lessonHeader}>
            <button
                type="button"
                className={styles.backButton}
                onClick={() => setView("path")}
            >
                <span aria-hidden="true">←</span>
                {t("actions.back")}
            </button>

            <div className={styles.lessonHeading}>
                <span>{t(rookLesson.moduleKey)}</span>
                <h1>{t(rookLesson.titleKey)}</h1>
            </div>

            <div className={styles.stepProgress}>
                <strong>{t("lesson.step", {
                    current: Math.min(stepIndex + 1, rookLesson.steps.length),
                    total: rookLesson.steps.length
                })}</strong>
                <div className={styles.progressTrack}>
                    <i style={{ width: `${lessonProgressPercent}%` }}/>
                </div>
            </div>
        </section>

        <div className={styles.lessonViewport}>
            <aside className={styles.taskRail}>
                {step.kind != "completion" && <div className={styles.challengeCard}>
                    {step.kind == "message" && <p>{t(step.bodyKey)}</p>}

                    {step.kind == "move" && <>
                        <span className={styles.challengeLabel}>{t("lesson.yourTurn")}</span>
                        <p>{t(step.instructionKey)}</p>
                    </>}

                    {step.kind == "selectSquare" && <>
                        <span className={styles.challengeLabel}>{t("lesson.yourTurn")}</span>
                        <p>{t(step.instructionKey)}</p>
                    </>}

                    {step.kind == "multipleChoice" && <>
                        <span className={styles.challengeLabel}>{t("lesson.question")}</span>
                        <p>{t(step.questionKey)}</p>
                        <div className={styles.choiceRow}>
                            {step.options.map(option => <button
                                key={option.id}
                                type="button"
                                onClick={() => answerChoice(option.id)}
                                disabled={resolved}
                            >
                                {t(option.labelKey)}
                            </button>)}
                        </div>
                    </>}

                    {activeHint && <div className={styles.hintPanel}>
                        <strong>{t("actions.hint")}</strong>
                        <p>{t(activeHint.textKey)}</p>
                    </div>}

                    {feedback && feedbackVisual && <div
                        className={styles.feedback}
                        data-tone={feedbackVisual.tone}
                        style={{
                            "--feedback-colour": feedbackVisual.colour
                        } as React.CSSProperties}
                        role="status"
                    >
                        {feedbackVisual.icon
                            ? <img src={feedbackVisual.icon} alt="" aria-hidden="true"/>
                            : <span aria-hidden="true">!</span>}
                        <p>{t(feedback.key)}</p>
                    </div>}

                    <div className={styles.lessonActions}>
                        {step.kind != "message" && hints.length > 0 && !resolved
                            ? <button
                                type="button"
                                className={styles.hintButton}
                                onClick={() => setHintCount(value => (
                                    Math.min(value + 1, hints.length)
                                ))}
                                disabled={hintCount >= hints.length}
                            >
                                {hintCount >= hints.length
                                    ? t("actions.solutionShown")
                                    : hintCount + 1 == hints.length
                                        ? t("actions.showSolution")
                                        : t("actions.hint")}
                            </button>
                            : <span/>}

                        {(step.kind == "message" || resolved) && <button
                            type="button"
                            className={styles.nextButton}
                            onClick={advance}
                        >
                            {t("actions.next")}
                            <span aria-hidden="true">→</span>
                        </button>}
                    </div>
                </div>}
            </aside>

            <section className={styles.boardColumn}>
                {step.kind != "completion"
                    ? <LessonBoard
                        fen={boardFen}
                        selectedFrom={selectedFrom}
                        resolved={resolved}
                        stepKind={step.kind}
                        pieces={pieces}
                        darkSquareColour={settings.themes.board.darkSquareColour}
                        lightSquareColour={settings.themes.board.lightSquareColour}
                        coordinates={settings.themes.board.coordinates}
                        squareStyles={squareStyles}
                        arrows={activeHint?.arrows}
                        onSquareClick={handleSquareClick}
                        onPieceDrop={(from, to) => tryMove(
                            from as Square,
                            to as Square
                        )}
                        onPieceDragBegin={source => {
                            if (step.kind == "move" && !resolved) {
                                setSelectedFrom(source as Square);
                            }
                        }}
                        onPieceDragEnd={() => {
                            if (!resolved) setSelectedFrom(undefined);
                        }}
                    />
                    : <section className={styles.completionCard}>
                        <span className={styles.completionIcon}>✓</span>
                        <span className={styles.eyebrow}>{t("lesson.completeKicker")}</span>
                        <h2>{t(step.titleKey)}</h2>
                        <p>{t(step.bodyKey)}</p>
                        <button
                            type="button"
                            className={styles.nextButton}
                            onClick={advance}
                        >
                            {t("actions.finish")}
                        </button>
                    </section>}
            </section>

            <aside className={styles.coachRail}>
                {settings.coach.enabled && <div className={styles.coachCard}>
                    <button
                        type="button"
                        className={styles.coachPortraitButton}
                        onClick={() => setCoachPickerOpen(true)}
                        aria-label={t("coach.change", { coach: coach.name })}
                        title={t("coach.change", { coach: coach.name })}
                    >
                        <CoachPortrait
                            coach={coach}
                            baseExpression="idle"
                            speechText={coachText}
                            animationsEnabled={settings.coach.animations}
                            className={styles.coachPortrait}
                        />
                    </button>
                    <div className={styles.speechBubble}>
                        <span>{coach.name}</span>
                        <p>{coachText}</p>
                        <small>{t("coach.clickToChange")}</small>
                    </div>
                </div>}
            </aside>
        </div>

        {coachPickerOpen && <CoachPicker
            selectedCoach={coach}
            onClose={() => setCoachPickerOpen(false)}
            onConfirm={chooseCoach}
        />}
    </main>;
}

export default LessonsApp;
