import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chess, Move, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import useSettingsStore from "@/stores/SettingsStore";
import { createCustomPieces } from "@/lib/chessAppearance";
import CoachPicker from "@analysis/components/AnalysisPanel/CoachPicker";
import CoachPortrait from "@analysis/components/AnalysisPanel/CoachPortrait";
import { CoachExpression, CoachId, getCoachById } from "@analysis/lib/coach";

import { OpeningCatalogueEntry } from "./openingCatalogue";
import { CourseProgressStore, createLessonId, recordLessonReview } from "./courseProgress";
import { RepertoireSide, courseMoves, fenAt, inferSide } from "./courseV3Model";
import * as styles from "./courseV3.module.css";

type Mode = "study" | "practice" | "complete";

interface Props {
    opening: OpeningCatalogueEntry;
    lineNumber: number;
    lineTotal: number;
    progress: CourseProgressStore;
    setProgress: React.Dispatch<React.SetStateAction<CourseProgressStore>>;
    preferredSide?: RepertoireSide;
    startInPractice?: boolean;
    blindPractice?: boolean;
    onBack: () => void;
    onNext?: () => void;
    onLearned: (opening: OpeningCatalogueEntry, side: RepertoireSide) => void;
}

function explanation(move: Move | undefined, t: (key: string) => string) {
    if (!move) return t("learn.explanations.start");
    if (move.san.includes("O-O")) return t("learn.explanations.castle");
    if (move.san.includes("+")) return t("learn.explanations.check");
    if (move.san.includes("x")) return t("learn.explanations.capture");
    if (move.piece == "n") return t("learn.explanations.knight");
    if (move.piece == "b") return t("learn.explanations.bishop");
    if (move.piece == "q") return t("learn.explanations.queen");
    return move.piece == "p" ? t("learn.explanations.pawn") : t("learn.explanations.piece");
}

function getSquareStyles(fen: string, selected: Square | undefined, legalHints: boolean) {
    const result: NonNullable<React.ComponentProps<typeof Chessboard>["customSquareStyles"]> = {};
    if (!selected) return result;
    result[selected] = { boxShadow: "inset 0 0 0 4px rgba(96,151,255,.92)" };
    if (!legalHints) return result;
    const board = new Chess(fen);
    board.moves({ square: selected, verbose: true }).forEach(move => {
        result[move.to] = board.get(move.to)
            ? { boxShadow: "inset 0 0 0 5px rgba(18,24,34,.34)" }
            : { backgroundImage: "radial-gradient(circle, rgba(18,24,34,.42) 0 16%, transparent 17%)" };
    });
    return result;
}

function CourseLessonV3({ opening, lineNumber, lineTotal, progress, setProgress, preferredSide, startInPractice = false, blindPractice = false, onBack, onNext, onLearned }: Props) {
    const { t } = useTranslation("repertoire");
    const { t: tc } = useTranslation("repertoireCourse");
    const settings = useSettingsStore(state => state.settings);
    const setSettings = useSettingsStore(state => state.setSettings);
    const pieces = useMemo(() => createCustomPieces(settings.themes.piece), [settings.themes.piece]);
    const moves = useMemo(() => courseMoves(opening), [opening]);
    const lessonId = createLessonId(opening.eco, opening.name, opening.pgn);
    const old = progress[lessonId];
    const [side, setSide] = useState<RepertoireSide>(preferredSide || old?.side || inferSide(opening));
    const [mode, setMode] = useState<Mode>(startInPractice ? "practice" : "study");
    const [studyIndex, setStudyIndex] = useState(0);
    const [practiceIndex, setPracticeIndex] = useState(0);
    const [selected, setSelected] = useState<Square>();
    const [runs, setRuns] = useState(0);
    const [requiredRuns, setRequiredRuns] = useState(old ? 1 : 2);
    const [mistakes, setMistakes] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [hint, setHint] = useState(false);
    const [expression, setExpression] = useState<CoachExpression>("explaining");
    const [coachKey, setCoachKey] = useState(startInPractice ? "learn.coach.practiceStart" : "learn.coach.lineStart");
    const [coachPickerOpen, setCoachPickerOpen] = useState(false);
    const opponentTimer = useRef<number>();
    const resetTimer = useRef<number>();
    const learner = side == "white" ? "w" : "b";
    const expected = moves[practiceIndex];
    const activeFen = mode == "study" ? fenAt(moves, studyIndex) : fenAt(moves, mode == "complete" ? moves.length : practiceIndex);
    const coach = getCoachById(settings.appearance.selectedCoach);
    const spoken = t(coachKey, { opening: opening.name, move: expected?.san || "" });
    const squareStyles = getSquareStyles(activeFen, mode == "practice" ? selected : undefined, settings.themes.board.legalMoveHints);

    useEffect(() => () => {
        if (opponentTimer.current != undefined) window.clearTimeout(opponentTimer.current);
        if (resetTimer.current != undefined) window.clearTimeout(resetTimer.current);
    }, []);

    useEffect(() => {
        if (mode != "study") return;
        function onKeyDown(event: KeyboardEvent) {
            const target = event.target as HTMLElement | null;
            if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
            if (event.key == "ArrowLeft") {
                event.preventDefault();
                setStudyIndex(value => Math.max(0, value - 1));
            } else if (event.key == "ArrowRight") {
                event.preventDefault();
                setStudyIndex(value => Math.min(moves.length, value + 1));
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [mode, moves.length]);

    useEffect(() => {
        if (mode != "practice" || transitioning || !expected || expected.color == learner) return;
        if (opponentTimer.current != undefined) window.clearTimeout(opponentTimer.current);
        setExpression("explaining");
        setCoachKey("learn.coach.opponent");
        opponentTimer.current = window.setTimeout(() => {
            setPracticeIndex(value => Math.min(value + 1, moves.length));
            setSelected(undefined);
            setHint(false);
        }, 430);
    }, [expected?.san, learner, mode, moves.length, transitioning]);

    useEffect(() => {
        if (mode != "practice" || transitioning || !moves.length || practiceIndex < moves.length) return;
        const nextRuns = runs + 1;
        if (nextRuns >= requiredRuns) {
            const alreadyLearned = Boolean(old);
            setProgress(previous => recordLessonReview(previous, { id: lessonId, openingName: opening.name, family: opening.family, eco: opening.eco, pgn: opening.pgn, side }, mistakes));
            if (!alreadyLearned) onLearned(opening, side);
            setRuns(nextRuns);
            setMode("complete");
            setExpression("celebrating");
            setCoachKey("learn.coach.completed");
            return;
        }
        setRuns(nextRuns);
        setTransitioning(true);
        setExpression("approving");
        setCoachKey("learn.coach.practiceStart");
        resetTimer.current = window.setTimeout(() => {
            setPracticeIndex(0);
            setSelected(undefined);
            setHint(false);
            setTransitioning(false);
            setExpression("thinking");
            setCoachKey("learn.coach.practiceStart");
        }, 800);
    }, [mode, moves.length, practiceIndex, requiredRuns, runs, transitioning]);

    function resetPractice() {
        setMode("practice");
        setPracticeIndex(0);
        setRuns(0);
        setMistakes(0);
        setRequiredRuns(old ? 1 : 2);
        setSelected(undefined);
        setHint(false);
        setTransitioning(false);
        setExpression("thinking");
        setCoachKey("learn.coach.practiceStart");
    }

    function registerProblem() {
        setMistakes(value => value + 1);
        setRequiredRuns(value => Math.max(value, old ? 2 : 3));
    }

    function play(from: string, to: string) {
        if (mode != "practice" || transitioning || !expected || expected.color != learner) return false;
        if (expected.from != from || expected.to != to) {
            registerProblem();
            setExpression("worried");
            setCoachKey("learn.coach.tryAgain");
            setTransitioning(true);
            setHint(true);
            resetTimer.current = window.setTimeout(() => {
                setPracticeIndex(0);
                setSelected(undefined);
                setHint(false);
                setTransitioning(false);
                setExpression("thinking");
                setCoachKey("learn.coach.practiceStart");
            }, 1050);
            return false;
        }
        setPracticeIndex(value => Math.min(value + 1, moves.length));
        setSelected(undefined);
        setHint(false);
        setExpression("approving");
        setCoachKey("learn.coach.correct");
        return true;
    }

    function clickSquare(name: string) {
        if (mode != "practice" || transitioning || !expected || expected.color != learner) return;
        const square = name as Square;
        const board = new Chess(activeFen);
        const clickedPiece = board.get(square);
        if (!selected) {
            if (clickedPiece?.color == learner) setSelected(square);
            return;
        }
        if (selected == square) {
            setSelected(undefined);
            return;
        }
        if (clickedPiece?.color == learner) {
            setSelected(square);
            return;
        }
        play(selected, square);
    }

    function chooseCoach(id: CoachId) {
        setSettings(draft => {
            draft.appearance.selectedCoach = id;
            return draft;
        });
        setCoachPickerOpen(false);
    }

    const repetition = Math.min(runs + 1, requiredRuns);
    const currentMove = studyIndex > 0 ? moves[studyIndex - 1] : undefined;

    return <section className={styles.lessonShell}>
        <header className={styles.lessonHeader}>
            <button type="button" onClick={onBack}>←</button>
            <div><span>{opening.eco} · {opening.family}</span><h1>{opening.name}</h1>{!blindPractice && <p>{opening.pgn}</p>}</div>
            <div className={styles.headerActions}>
                <div className={styles.sidePicker}>{(["white", "black"] as RepertoireSide[]).map(value => <button key={value} data-active={side == value} onClick={() => { setSide(value); resetPractice(); }}>{t(`side.${value}`)}</button>)}</div>
                <div className={styles.lessonCount}><strong>{mode == "study" ? tc("practice.studyPhase") : mode == "practice" ? tc("practice.practicePhase") : tc("practice.completePhase")}</strong><span>{lineNumber}/{lineTotal}</span></div>
            </div>
        </header>
        <div className={styles.lessonGrid}>
            <div className={styles.lessonBoardColumn}>
                <div className={styles.lessonBoardWrap}><Chessboard id="repertoire-course-board-v3" position={activeFen} boardOrientation={side} onPieceDrop={play} onPieceDragBegin={(_piece, source) => mode == "practice" && setSelected(source as Square)} onPieceDragEnd={() => setSelected(undefined)} onSquareClick={clickSquare} arePiecesDraggable={mode == "practice" && !transitioning && expected?.color == learner} customPieces={pieces} customDarkSquareStyle={{ backgroundColor: settings.themes.board.darkSquareColour }} customLightSquareStyle={{ backgroundColor: settings.themes.board.lightSquareColour }} customSquareStyles={squareStyles} showBoardNotation={settings.themes.board.coordinates == "inside"} snapToCursor/></div>
                {mode == "study" && <div className={styles.lessonControls}><button disabled={!studyIndex} onClick={() => setStudyIndex(v => Math.max(0, v - 1))}>← {t("editor.previous")}</button><div><strong>{t("learn.step", { current: studyIndex, total: moves.length })}</strong><span>{tc("practice.studyHint")}</span></div>{studyIndex < moves.length ? <button onClick={() => setStudyIndex(v => Math.min(moves.length, v + 1))}>{t("editor.next")} →</button> : <button data-primary onClick={resetPractice}>{tc("practice.start")}</button>}</div>}
                {mode == "practice" && <div className={styles.lessonControls}><button onClick={() => { if (expected?.color == learner) { registerProblem(); setHint(true); } }} disabled={!expected || expected.color != learner}>{t("learn.hint")}</button><div><strong>{tc("practice.repetition", { current: repetition, total: requiredRuns })}</strong><span>{transitioning ? tc("practice.repeatRule") : hint && expected ? t("learn.hintMove", { move: expected.san }) : t("learn.practiceInstruction")}</span></div>{blindPractice ? <button onClick={onBack}>{tc("practice.backModule")}</button> : <button onClick={() => { setMode("study"); setStudyIndex(0); }}>{t("learn.reviewLine")}</button>}</div>}
                {mode == "complete" && <div className={styles.lessonControls}><button onClick={onBack}>{tc("practice.backModule")}</button><div><strong>{tc("practice.completeTitle")}</strong><span>{tc("practice.autoSaved")}</span></div>{onNext ? <button data-primary onClick={onNext}>{tc("practice.nextLine")} →</button> : <button data-primary onClick={onBack}>{tc("practice.moduleDone")}</button>}</div>}
            </div>
            <aside className={styles.lessonPanel}>
                <section className={styles.coachCard}>
                    <button type="button" className={styles.coachPortraitButton} onClick={() => setCoachPickerOpen(true)} aria-label={coach.name} title={coach.name}><CoachPortrait coach={coach} baseExpression={expression} speechText={spoken} animationsEnabled={settings.coach.animations} className={styles.coachPortrait}/></button>
                    <div><strong>{coach.name}</strong><p>{spoken}</p></div>
                </section>
                {mode == "study" && <section className={styles.infoCard}><span>{t("learn.whyTitle")}</span><strong>{currentMove?.san || t("editor.startPosition")}</strong><p>{explanation(currentMove, t)}</p></section>}
                {mode == "practice" && <section className={styles.infoCard}><span>{tc("practice.memoryBlock")}</span><strong>{tc("practice.repetition", { current: repetition, total: requiredRuns })}</strong><p>{requiredRuns > (old ? 1 : 2) ? tc("practice.extra") : tc("practice.repeatRule")}</p><div className={styles.repeatDots}>{Array.from({ length: requiredRuns }, (_, i) => <i key={i} data-done={i < runs}/>)}</div></section>}
                {mode == "complete" && <section className={styles.completeCard}><span>✓</span><strong>{tc("practice.lessonComplete")}</strong><p>{tc("practice.completeBody")}</p></section>}
                {!blindPractice && <section className={styles.infoCard}><span>{t("learn.referenceLine")}</span><div className={styles.referenceMoves}>{moves.map((move, i) => <button key={`${move.san}-${i}`} data-active={mode == "study" && studyIndex == i + 1} onClick={() => mode == "study" && setStudyIndex(i + 1)}><small>{i % 2 == 0 ? `${Math.floor(i / 2) + 1}.` : "…"}</small>{move.san}</button>)}</div></section>}
            </aside>
        </div>
        {coachPickerOpen && <CoachPicker selectedCoach={coach} onClose={() => setCoachPickerOpen(false)} onConfirm={chooseCoach}/>} 
    </section>;
}

export default CourseLessonV3;
