import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import useSettingsStore from "@/stores/SettingsStore";
import { createCustomPieces } from "@/lib/chessAppearance";
import CoachPicker from "@analysis/components/AnalysisPanel/CoachPicker";
import CoachPortrait from "@analysis/components/AnalysisPanel/CoachPortrait";
import { CoachExpression, CoachId, getCoachById } from "@analysis/lib/coach";

import { RepertoireStore } from "./repertoireStore";
import { localizeMaybeOpening } from "./openingLocalization";
import { buildDrillLines, drillFen, drillSquareStyles } from "./repertoireDrillModel";
import { formatEnhancementCopy, useRepertoireEnhancementCopy } from "./repertoireEnhancementCopy";
import { depthIncrementMoves, fullMoveCount, initialDepth, nextDepth } from "./courseDepth";
import { courseDepthCopy, formatDepthCopy } from "./courseDepthCopy";
import { readDrillDepth, writeDrillDepth } from "./repertoireDrillDepth";
import * as styles from "./repertoireDrill.module.css";
import * as boardTools from "./repertoireBoardTools.module.css";

type Feedback = "idle" | "correct" | "wrong";

interface Props { store: RepertoireStore; repertoireId?: string; mixed?: boolean; onExit: () => void; }

function RepertoireDrill({ store, repertoireId, mixed = false, onExit }: Props) {
    const copy = useRepertoireEnhancementCopy();
    const { i18n } = useTranslation();
    const { t: tAnalysis } = useTranslation("analysis");
    const language = i18n.resolvedLanguage || i18n.language || "en";
    const depthCopy = courseDepthCopy(language);
    const settings = useSettingsStore(state => state.settings);
    const setSettings = useSettingsStore(state => state.setSettings);
    const pieces = useMemo(() => createCustomPieces(settings.themes.piece), [settings.themes.piece]);
    const lines = useMemo(() => buildDrillLines(store, repertoireId, mixed), [store, repertoireId, mixed]);
    const firstLine = lines[0];
    const firstLearnedDepth = firstLine ? readDrillDepth(firstLine.saved.id, firstLine.moves.length) : 0;
    const [lineIndex, setLineIndex] = useState(0);
    const [targetPly, setTargetPly] = useState(() => firstLine ? firstLearnedDepth || initialDepth(firstLine.moves.length) : 0);
    const [moveIndex, setMoveIndex] = useState(0);
    const [selected, setSelected] = useState<Square>();
    const [feedback, setFeedback] = useState<Feedback>("idle");
    const [locked, setLocked] = useState(false);
    const [finished, setFinished] = useState(false);
    const [expression, setExpression] = useState<CoachExpression>("thinking");
    const [coachText, setCoachText] = useState(copy.coachReady);
    const [coachPickerOpen, setCoachPickerOpen] = useState(false);
    const [boardFlipped, setBoardFlipped] = useState(false);
    const timer = useRef<number>();
    const line = lines[lineIndex];
    const activeMoves = line?.moves.slice(0, targetPly) || [];
    const fen = line ? drillFen(line, moveIndex) : new Chess().fen();
    const expected = activeMoves[moveIndex];
    const learner = line?.repertoire.side == "black" ? "b" : "w";
    const learnerTurn = Boolean(expected) && new Chess(fen).turn() == learner;
    const coach = getCoachById(settings.appearance.selectedCoach);
    const spoken = coachText;
    const lineComplete = Boolean(line) && activeMoves.length > 0 && moveIndex >= activeMoves.length && !finished;
    const hasNextLine = lineIndex < lines.length - 1;
    const canDeepen = Boolean(line) && targetPly < (line?.moves.length || 0);
    const totalMoves = fullMoveCount(line?.moves.length || 0);
    const targetMoves = fullMoveCount(targetPly);
    const deepenCount = depthIncrementMoves(targetPly, line?.moves.length || 0);
    const baseOrientation = line?.repertoire.side || "white";
    const boardOrientation = boardFlipped
        ? baseOrientation == "white" ? "black" : "white"
        : baseOrientation;
    const flipBoardLabel = tAnalysis("optionsToolbar.flipBoard");

    function later(action: () => void, delay: number) { if (timer.current != undefined) window.clearTimeout(timer.current); timer.current = window.setTimeout(action, delay); }
    useEffect(() => () => { if (timer.current != undefined) window.clearTimeout(timer.current); }, []);
    useEffect(() => { setBoardFlipped(false); }, [line?.repertoire.side]);

    useEffect(() => {
        if (!line || !expected || learnerTurn || locked || finished) return;
        setLocked(true); setExpression("explaining"); setCoachText(copy.coachOpponent);
        later(() => { setMoveIndex(value => Math.min(value + 1, activeMoves.length)); setFeedback("idle"); setSelected(undefined); setLocked(false); }, 430);
    }, [expected?.id, learnerTurn, line?.saved.id, finished, activeMoves.length]);

    useEffect(() => {
        if (!line || !activeMoves.length || moveIndex < activeMoves.length || locked || finished) return;
        writeDrillDepth(line.saved.id, targetPly);
        setExpression("celebrating");
        if (canDeepen) {
            setLocked(true);
            setCoachText(depthCopy.deepenBody);
            return;
        }
        if (lineIndex >= lines.length - 1) {
            setCoachText(copy.studyCompleteBody);
            setFinished(true);
            setLocked(false);
            return;
        }
        setLocked(true);
        setCoachText(copy.nextLine);
    }, [moveIndex, activeMoves.length, lineIndex, lines.length, finished, locked, canDeepen, targetPly, line?.saved.id]);

    function chooseCoach(id: CoachId) {
        setSettings(draft => { draft.appearance.selectedCoach = id; return draft; });
        setCoachPickerOpen(false);
    }

    function nextLine() {
        if (!hasNextLine) return;
        if (timer.current != undefined) window.clearTimeout(timer.current);
        const nextIndex = Math.min(lineIndex + 1, lines.length - 1);
        const next = lines[nextIndex];
        const learned = next ? readDrillDepth(next.saved.id, next.moves.length) : 0;
        setLineIndex(nextIndex);
        setTargetPly(next ? learned || initialDepth(next.moves.length) : 0);
        setMoveIndex(0);
        setSelected(undefined);
        setFeedback("idle");
        setExpression("thinking");
        setCoachText(copy.coachReady);
        setLocked(false);
    }

    function deepenLine() {
        if (!line || !canDeepen) return;
        if (timer.current != undefined) window.clearTimeout(timer.current);
        const next = nextDepth(targetPly, line.moves.length);
        if (next <= targetPly) return;
        setTargetPly(next);
        setMoveIndex(0);
        setSelected(undefined);
        setFeedback("idle");
        setExpression("thinking");
        setCoachText(copy.coachReady);
        setLocked(false);
    }

    function play(from: string, to: string) {
        if (!line || !expected || !learnerTurn || locked || finished) return false;
        const expectedUci = expected.moveUci || "";
        if (`${from}${to}` != expectedUci.slice(0, 4)) {
            const expectedMove = expected.moveSan || expectedUci;
            setFeedback("wrong");
            setSelected(undefined);
            setExpression("worried");
            setCoachText(formatEnhancementCopy(copy.correctMove, { move: expectedMove }));
            return false;
        }
        setFeedback("correct"); setLocked(true); setExpression("approving"); setCoachText(copy.coachCorrect);
        later(() => { setMoveIndex(value => Math.min(value + 1, activeMoves.length)); setFeedback("idle"); setLocked(false); }, 280);
        return true;
    }

    function clickSquare(name: string) {
        if (!line || !learnerTurn || locked || finished) return;
        const square = name as Square;
        const board = new Chess(fen);
        const clickedPiece = board.get(square);
        if (!selected) { if (clickedPiece?.color == learner) setSelected(square); return; }
        if (selected == square) { setSelected(undefined); return; }
        if (clickedPiece?.color == learner) { setSelected(square); return; }
        play(selected, square);
    }

    if (!lines.length) return <section className={styles.emptyStudy}><button type="button" onClick={onExit}>{copy.exitStudy}</button><div><h1>{copy.noStudyLines}</h1><p>{copy.noStudyLinesBody}</p></div></section>;
    if (finished) return <section className={styles.completedStudy}><div><span>✓</span><h1>{copy.studyComplete}</h1><p>{copy.studyCompleteBody}</p><button onClick={onExit}>{copy.exitStudy}</button></div></section>;

    const progress = formatEnhancementCopy(copy.lineCounter, { current: lineIndex + 1, total: lines.length });
    const moveProgress = formatEnhancementCopy(copy.moveProgress, { current: Math.min(moveIndex + 1, activeMoves.length), total: activeMoves.length });
    const depthProgress = formatDepthCopy(depthCopy.learned, { learned: targetMoves, available: totalMoves });
    const repertoireName = localizeMaybeOpening(line.repertoire.name, language);
    const savedName = localizeMaybeOpening(line.saved.name, language);
    const title = mixed ? copy.studyMixedTitle : formatEnhancementCopy(copy.studyTitle, { name: repertoireName });

    return <section className={styles.studyShell}>
        <header className={styles.studyHeader}><button type="button" onClick={onExit}>{copy.exitStudy}</button><div><span>{progress}</span><h1>{title}</h1><p>{copy.studyIntro}</p></div><div className={styles.lineChip}><strong>{savedName}</strong><span>{repertoireName}</span></div></header>
        <div className={styles.studyGrid}>
            <div className={styles.boardArea}>
                <div className={`${styles.boardWrap} ${boardTools.boardContainer}`} data-board-orientation={boardOrientation}>
                    <button type="button" className={boardTools.flipButton} onClick={() => setBoardFlipped(value => !value)} title={flipBoardLabel} aria-label={flipBoardLabel}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10l-2.5-2.5"/><path d="M17 17H7l2.5 2.5"/><path d="M19 9.5A7 7 0 0 1 17 17"/><path d="M5 14.5A7 7 0 0 1 7 7"/></svg>
                    </button>
                    <Chessboard id="repertoire-saved-line-study" position={fen} boardOrientation={boardOrientation} onPieceDrop={play} onPieceDragBegin={(_piece, source) => learnerTurn && !locked && setSelected(source as Square)} onPieceDragEnd={() => setSelected(undefined)} onSquareClick={clickSquare} arePiecesDraggable={learnerTurn && !locked} customPieces={pieces} customDarkSquareStyle={{ backgroundColor: settings.themes.board.darkSquareColour }} customLightSquareStyle={{ backgroundColor: settings.themes.board.lightSquareColour }} customSquareStyles={drillSquareStyles(fen, selected, settings.themes.board.legalMoveHints)} showBoardNotation={settings.themes.board.coordinates == "inside"} snapToCursor/>
                </div>
                <div className={styles.boardStatus}><strong>{lineComplete ? `✓ ${copy.correct}` : moveProgress}</strong><span>{lineComplete ? canDeepen ? formatDepthCopy(depthCopy.deepen, { count: deepenCount }) : copy.nextLine : learnerTurn ? copy.studyIntro : copy.coachOpponent}</span></div>
            </div>
            <aside className={styles.studyPanel}>
                {settings.coach.enabled && <section className={styles.coachCard}><button type="button" className={styles.coachPortraitButton} onClick={() => setCoachPickerOpen(true)} aria-label={coach.name} title={coach.name}><CoachPortrait coach={coach} baseExpression={expression} speechText={spoken} animationsEnabled={settings.coach.animations} className={styles.coachPortrait}/></button><div><strong>{coach.name}</strong><p>{spoken}</p></div></section>}
                {lineComplete && (canDeepen || hasNextLine) && <section className={styles.lineCompleteCard}><span>✓</span><div><strong>{copy.correct}</strong><p>{canDeepen ? depthProgress : savedName}</p></div><button type="button" onClick={canDeepen ? deepenLine : nextLine}>{canDeepen ? formatDepthCopy(depthCopy.deepen, { count: deepenCount }) : copy.nextLine}</button></section>}
                <section className={styles.feedbackCard} data-feedback={feedback}><b>{feedback == "correct" ? "✓" : feedback == "wrong" ? "×" : "·"}</b><div><strong>{feedback == "correct" ? copy.correct : feedback == "wrong" ? copy.wrong : savedName}</strong><p>{feedback == "wrong" && expected ? formatEnhancementCopy(copy.correctMove, { move: expected.moveSan || expected.moveUci || "" }) : feedback == "correct" ? copy.coachCorrect : copy.studyIntro}</p></div></section>
                <section className={styles.progressCard}><strong>{progress}</strong><span>{moveProgress} · {depthProgress}</span><div><i style={{ width: `${activeMoves.length ? Math.min(100, moveIndex / activeMoves.length * 100) : 0}%` }}/></div></section>
            </aside>
        </div>
        {settings.coach.enabled && coachPickerOpen && <CoachPicker selectedCoach={coach} onClose={() => setCoachPickerOpen(false)} onConfirm={chooseCoach}/>} 
    </section>;
}

export default RepertoireDrill;