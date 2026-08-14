import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import useSettingsStore from "@/stores/SettingsStore";
import { createCustomPieces } from "@/lib/chessAppearance";
import { playBoardMoveSound } from "@/lib/boardSounds";
import CoachPortrait from "@analysis/components/AnalysisPanel/CoachPortrait";
import {
    coachOptions,
    getCoachById
} from "@analysis/lib/coach";
import type { CoachId } from "@analysis/lib/coach";

import {
    evaluateMoveAttempt,
    evaluateSquareAttempt
} from "./lessonEngine";
import { getLessonFeedbackVisual } from "./feedbackAdapter";
import {
    loadLessonsProgress,
    markLessonComplete
} from "./progress";
import { rookLesson } from "./rookLesson";
import type {
    AttemptResult,
    LessonHint,
    LessonOutcome
} from "./lessonModel";

import * as styles from "./lessons.module.css";

type View = "path" | "lesson";

interface FeedbackState {
    outcome: LessonOutcome;
    key: string;
}

function isPositiveOutcome(outcome: LessonOutcome) {
    return outcome == "success" || outcome == "acceptedAlternative";
}

function CoachChooser({
    selectedCoachId,
    animationsEnabled,
    onSelect,
    onClose
}: {
    selectedCoachId: CoachId;
    animationsEnabled: boolean;
    onSelect: (id: CoachId) => void;
    onClose: () => void;
}) {
    const { t } = useTranslation("lessons");

    return <div className={styles.coachOverlay} onClick={onClose}>
        <section
            className={styles.coachDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lessons-coach-title"
            onClick={event => event.stopPropagation()}
        >
            <div className={styles.coachDialogHeader}>
                <div>
                    <span>NexoChess</span>
                    <h2 id="lessons-coach-title">{t("coach.choose")}</h2>
                </div>
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label={t("coach.close")}
                >
                    ×
                </button>
            </div>

            <div className={styles.coachGrid}>
                {coachOptions.map(coach => {
                    const selected = coach.id == selectedCoachId;
                    return <button
                        key={coach.id}
                        type="button"
                        className={[
                            styles.coachChoice,
                            selected ? styles.coachChoiceSelected : ""
                        ].filter(Boolean).join(" ")}
                        onClick={() => onSelect(coach.id)}
                        aria-pressed={selected}
                    >
                        <CoachPortrait
                            coach={coach}
                            baseExpression="idle"
                            speechText=""
                            animationsEnabled={animationsEnabled}
                            className={styles.coachChoicePortrait}
                        />
                        <strong>{coach.name}</strong>
                        {selected && <span className={styles.selectedMark}>✓</span>}
                    </button>;
                })}
            </div>
        </section>
    </div>;
}

function PathNode({
    label,
    symbol,
    state,
    onClick,
    alternate = false
}: {
    label: string;
    symbol: string;
    state: "current" | "complete" | "locked";
    onClick?: () => void;
    alternate?: boolean;
}) {
    return <div
        className={[
            styles.pathNodeRow,
            alternate ? styles.pathNodeAlternate : ""
        ].filter(Boolean).join(" ")}
        data-state={state}
    >
        <button
            type="button"
            className={styles.pathNode}
            disabled={state == "locked"}
            onClick={onClick}
            aria-label={label}
        >
            <span className={styles.nodeSymbol}>{state == "complete" ? "✓" : symbol}</span>
        </button>
        <div className={styles.nodeCopy}>
            <strong>{label}</strong>
            {state == "locked" && <span className={styles.lockedDot}>·</span>}
        </div>
    </div>;
}

function LessonsApp() {
    const { t } = useTranslation("lessons");
    const settings = useSettingsStore(state => state.settings);
    const setSettings = useSettingsStore(state => state.setSettings);
    const pieces = useMemo(
        () => createCustomPieces(settings.themes.piece),
        [settings.themes.piece]
    );

    const [view, setView] = useState<View>("path");
    const [stepIndex, setStepIndex] = useState(0);
    const [boardFen, setBoardFen] = useState(rookLesson.steps[0].fen);
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [hintCount, setHintCount] = useState(0);
    const [selectedFrom, setSelectedFrom] = useState<Square>();
    const [coachPickerOpen, setCoachPickerOpen] = useState(false);
    const [progress, setProgress] = useState(loadLessonsProgress);

    const coach = getCoachById(settings.appearance.selectedCoach);
    const step = rookLesson.steps[stepIndex];
    const complete = progress.completedLessonIds.includes(rookLesson.id);
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

    function startLesson() {
        setStepIndex(0);
        setBoardFen(rookLesson.steps[0].fen);
        setFeedback(null);
        setHintCount(0);
        setSelectedFrom(undefined);
        setView("lesson");
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

        const board = new Chess(step.fen);
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
            return;
        }

        if (step.kind != "message" && !resolved) return;

        const nextIndex = Math.min(stepIndex + 1, rookLesson.steps.length - 1);
        const nextStep = rookLesson.steps[nextIndex];

        if (nextStep.kind == "completion") {
            setProgress(current => markLessonComplete(current, rookLesson.id));
        }

        setStepIndex(nextIndex);
    }

    const squareStyles: NonNullable<
        React.ComponentProps<typeof Chessboard>["customSquareStyles"]
    > = {};

    if (selectedFrom) {
        squareStyles[selectedFrom] = {
            boxShadow: "inset 0 0 0 4px rgba(110,156,255,.95)"
        };
    }

    activeHint?.highlightSquares?.forEach(square => {
        squareStyles[square] = {
            boxShadow: "inset 0 0 0 5px rgba(94,184,255,.8)"
        };
    });

    if (step.kind == "move" && !activeHint) {
        squareStyles[step.targetMove.to] = {
            boxShadow: "inset 0 0 0 4px rgba(104,198,151,.68)"
        };
    }

    const feedbackVisual = feedback
        ? getLessonFeedbackVisual(feedback.outcome)
        : undefined;
    const progressPercent = Math.round(
        stepIndex / Math.max(1, rookLesson.steps.length - 1) * 100
    );

    if (view == "path") {
        return <main className={styles.shell}>
            <section className={styles.pathHero}>
                <div className={styles.heroCopy}>
                    <span className={styles.eyebrow}>{t("page.eyebrow")}</span>
                    <h1>{t("page.title")}</h1>
                    <p>{t("page.subtitle")}</p>
                </div>
                <div className={styles.heroProgress}>
                    <span>{t("path.progressLabel")}</span>
                    <strong>{complete ? "1" : "0"} / 1</strong>
                    <div className={styles.progressTrack}>
                        <i style={{ width: complete ? "100%" : "0%" }}/>
                    </div>
                </div>
            </section>

            <div className={styles.pathLayout}>
                <section className={styles.pathCard}>
                    <header className={styles.sectionHeader}>
                        <span>{t("path.sectionKicker")}</span>
                        <h2>{t("path.sectionTitle")}</h2>
                        <p>{t("path.sectionDescription")}</p>
                    </header>

                    <div className={styles.learningPath}>
                        <div className={styles.pathRail} aria-hidden="true"/>
                        <PathNode
                            label={t("path.nodes.rook")}
                            symbol="♜"
                            state={complete ? "complete" : "current"}
                            onClick={startLesson}
                        />
                        <PathNode
                            label={t("path.nodes.bishop")}
                            symbol="♝"
                            state="locked"
                            alternate
                        />
                        <PathNode
                            label={t("path.nodes.knight")}
                            symbol="♞"
                            state="locked"
                        />
                        <PathNode
                            label={t("path.nodes.checkpoint")}
                            symbol="★"
                            state="locked"
                            alternate
                        />
                    </div>

                    <button
                        type="button"
                        className={styles.startButton}
                        onClick={startLesson}
                    >
                        {complete ? t("path.replay") : t("path.start")}
                        <span aria-hidden="true">→</span>
                    </button>
                </section>

                <aside className={styles.coachCard}>
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
                            speechText={
                                complete
                                    ? t("coach.pathComplete")
                                    : t("coach.pathIntro")
                            }
                            animationsEnabled={settings.coach.animations}
                            className={styles.coachPortrait}
                        />
                    </button>
                    <div className={styles.speechBubble}>
                        <span>{coach.name}</span>
                        <p>{complete ? t("coach.pathComplete") : t("coach.pathIntro")}</p>
                        <small>{t("coach.clickToChange")}</small>
                    </div>
                </aside>
            </div>

            {coachPickerOpen && <CoachChooser
                selectedCoachId={coach.id}
                animationsEnabled={settings.coach.animations}
                onSelect={chooseCoach}
                onClose={() => setCoachPickerOpen(false)}
            />}
        </main>;
    }

    return <main className={styles.shell}>
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
                    <i style={{ width: `${progressPercent}%` }}/>
                </div>
            </div>
        </section>

        <div className={styles.lessonLayout}>
            <section className={styles.lessonStage}>
                {step.kind != "completion" ? <>
                    <div className={styles.boardFrame}>
                        <Chessboard
                            id="nexochess-lessons-board"
                            position={boardFen}
                            onPieceDrop={(from, to) => tryMove(from as Square, to as Square)}
                            onSquareClick={handleSquareClick}
                            arePiecesDraggable={step.kind == "move" && !resolved}
                            customPieces={pieces}
                            customDarkSquareStyle={{
                                backgroundColor: settings.themes.board.darkSquareColour
                            }}
                            customLightSquareStyle={{
                                backgroundColor: settings.themes.board.lightSquareColour
                            }}
                            customSquareStyles={squareStyles}
                            customArrows={activeHint?.arrows}
                            showBoardNotation={
                                settings.themes.board.coordinates == "inside"
                            }
                            snapToCursor
                        />
                    </div>

                    <div className={styles.challengeCard}>
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
                            style={{ "--feedback-colour": feedbackVisual.colour } as React.CSSProperties}
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
                    </div>
                </> : <section className={styles.completionCard}>
                    <span className={styles.completionIcon}>✓</span>
                    <span className={styles.eyebrow}>{t("lesson.completeKicker")}</span>
                    <h2>{t(step.titleKey)}</h2>
                    <p>{t(step.bodyKey)}</p>
                    <button type="button" className={styles.nextButton} onClick={advance}>
                        {t("actions.finish")}
                    </button>
                </section>}
            </section>

            <aside className={styles.coachCard}>
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
            </aside>
        </div>

        {coachPickerOpen && <CoachChooser
            selectedCoachId={coach.id}
            animationsEnabled={settings.coach.animations}
            onSelect={chooseCoach}
            onClose={() => setCoachPickerOpen(false)}
        />}
    </main>;
}

export default LessonsApp;
