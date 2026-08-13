import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import useSettingsStore from "@/stores/SettingsStore";
import { createCustomPieces } from "@/lib/chessAppearance";
import CoachPortrait from "@analysis/components/AnalysisPanel/CoachPortrait";
import { CoachExpression, getCoachById, getCoachSpokenLine } from "@analysis/lib/coach";

import { RepertoireStore } from "./repertoireStore";
import { buildDrillLines, drillFen, drillSquareStyles } from "./repertoireDrillModel";
import { formatEnhancementCopy, useRepertoireEnhancementCopy } from "./repertoireEnhancementCopy";
import * as styles from "./repertoireDrill.module.css";

type CoachId = "fog" | "foxy" | "cybe" | "max_rooks";
type Feedback = "idle" | "correct" | "wrong";
const COACH_IDS: CoachId[] = ["fog", "foxy", "cybe", "max_rooks"];

interface Props {
    store: RepertoireStore;
    repertoireId?: string;
    mixed?: boolean;
    onExit: () => void;
}

function RepertoireDrill({ store, repertoireId, mixed = false, onExit }: Props) {
    const copy = useRepertoireEnhancementCopy();
    const { t: tCoach } = useTranslation("coach", { useSuspense: false });
    const settings = useSettingsStore(state => state.settings);
    const setSettings = useSettingsStore(state => state.setSettings);
    const pieces = useMemo(() => createCustomPieces(settings.themes.piece), [settings.themes.piece]);
    const lines = useMemo(() => buildDrillLines(store, repertoireId, mixed), [store, repertoireId, mixed]);
    const [lineIndex, setLineIndex] = useState(0);
    const [moveIndex, setMoveIndex] = useState(0);
    const [selected, setSelected] = useState<Square>();
    const [feedback, setFeedback] = useState<Feedback>("idle");
    const [locked, setLocked] = useState(false);
    const [finished, setFinished] = useState(false);
    const [expression, setExpression] = useState<CoachExpression>("thinking");
    const [coachText, setCoachText] = useState(copy.coachReady);
    const timer = useRef<number>();
    const line = lines[lineIndex];
    const fen = line ? drillFen(line, moveIndex) : new Chess().fen();
    const expected = line?.moves[moveIndex];
    const learner = line?.repertoire.side == "black" ? "b" : "w";
    const learnerTurn = Boolean(expected) && new Chess(fen).turn() == learner;
    const coach = getCoachById(settings.appearance.selectedCoach);
    const spoken = getCoachSpokenLine(coach, coachText, `${line?.saved.id}|${moveIndex}|${feedback}`, tCoach);

    function later(action: () => void, delay: number) {
        if (timer.current != undefined) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(action, delay);
    }

    useEffect(() => () => {
        if (timer.current != undefined) window.clearTimeout(timer.current);
    }, []);

    useEffect(() => {
        if (!line || !expected || learnerTurn || locked || finished) return;
        setLocked(true);
        setExpression("explaining");
        setCoachText(copy.coachOpponent);
        later(() => {
            setMoveIndex(value => Math.min(value + 1, line.moves.length));
            setFeedback("idle");
            setSelected(undefined);
            setLocked(false);
        }, 430);
    }, [expected?.id, learnerTurn, line?.saved.id, finished]);

    useEffect(() => {
        if (!line || moveIndex < line.moves.length || locked || finished) return;
        setLocked(true);
        setExpression("celebrating");
        setCoachText(copy.coachLineDone);
        later(() => {
            if (lineIndex >= lines.length - 1) {
                setFinished(true);
                setLocked(false);
                return;
            }
            setLineIndex(value => value + 1);
            setMoveIndex(0);
            setFeedback("idle");
            setExpression("thinking");
            setCoachText(copy.coachReady);
            setLocked(false);
        }, 850);
    }, [moveIndex, line?.moves.length, lineIndex, lines.length, finished]);

    function chooseCoach(id: CoachId) {
        setSettings(draft => {
            draft.appearance.selectedCoach = id;
            return draft;
        });
    }

    function play(from: string, to: string) {
        if (!line || !expected || !learnerTurn || locked || finished) return false;
        const expectedUci = expected.moveUci || "";
        if (`${from}${to}` != expectedUci.slice(0, 4)) {
            setFeedback("wrong");
            setLocked(true);
            setSelected(undefined);
            setExpression("worried");
            setCoachText(formatEnhancementCopy(copy.coachWrong, { move: expected.moveSan || expectedUci }));
            later(() => {
                setMoveIndex(0);
                setFeedback("idle");
                setExpression("thinking");
                setCoachText(copy.coachReady);
                setLocked(false);
            }, 1250);
            return false;
        }
        setFeedback("correct");
        setLocked(true);
        setExpression("approving");
        setCoachText(copy.coachCorrect);
        later(() => {
            setMoveIndex(value => Math.min(value + 1, line.moves.length));
            setFeedback("idle");
            setLocked(false);
        }, 280);
        return true;
    }

    function clickSquare(name: string) {
        if (!line || !learnerTurn || locked || finished) return;
        const square = name as Square;
        const board = new Chess(fen);
        if (!selected) {
            if (board.get(square)?.color == learner) setSelected(square);
            return;
        }
        if (selected == square) {
            setSelected(undefined);
            return;
        }
        if (!play(selected, square) && !locked) setSelected(undefined);
    }

    if (!lines.length) return <section className={styles.emptyStudy}>
        <button type="button" onClick={onExit}>← {copy.exitStudy}</button>
        <div><h1>{copy.noStudyLines}</h1><p>{copy.noStudyLinesBody}</p></div>
    </section>;

    if (finished) return <section className={styles.completedStudy}>
        <div><span>✓</span><h1>{copy.studyComplete}</h1><p>{copy.studyCompleteBody}</p><button onClick={onExit}>{copy.exitStudy}</button></div>
    </section>;

    const progress = formatEnhancementCopy(copy.lineCounter, { current: lineIndex + 1, total: lines.length });
    const moveProgress = formatEnhancementCopy(copy.moveProgress, { current: Math.min(moveIndex + 1, line.moves.length), total: line.moves.length });
    const title = mixed ? copy.studyMixedTitle : formatEnhancementCopy(copy.studyTitle, { name: line.repertoire.name });

    return <section className={styles.studyShell}>
        <header className={styles.studyHeader}>
            <button type="button" onClick={onExit}>←</button>
            <div><span>{progress}</span><h1>{title}</h1><p>{copy.studyIntro}</p></div>
            <div className={styles.lineChip}><strong>{line.saved.name}</strong><span>{line.repertoire.name}</span></div>
        </header>
        <div className={styles.studyGrid}>
            <div className={styles.boardArea}>
                <div className={styles.boardWrap}>
                    <Chessboard
                        id="repertoire-saved-line-study"
                        position={fen}
                        boardOrientation={line.repertoire.side}
                        onPieceDrop={play}
                        onPieceDragBegin={(_piece, source) => learnerTurn && !locked && setSelected(source as Square)}
                        onPieceDragEnd={() => setSelected(undefined)}
                        onSquareClick={clickSquare}
                        arePiecesDraggable={learnerTurn && !locked}
                        customPieces={pieces}
                        customDarkSquareStyle={{ backgroundColor: settings.themes.board.darkSquareColour }}
                        customLightSquareStyle={{ backgroundColor: settings.themes.board.lightSquareColour }}
                        customSquareStyles={drillSquareStyles(fen, selected, settings.themes.board.legalMoveHints)}
                        showBoardNotation={settings.themes.board.coordinates == "inside"}
                        snapToCursor
                    />
                </div>
                <div className={styles.boardStatus}><strong>{moveProgress}</strong><span>{learnerTurn ? copy.studyIntro : copy.coachOpponent}</span></div>
            </div>
            <aside className={styles.studyPanel}>
                <section className={styles.coachSelector}>
                    <span>{copy.chooseCoach}</span>
                    <div>{COACH_IDS.map(id => <button key={id} type="button" data-active={settings.appearance.selectedCoach == id} onClick={() => chooseCoach(id)}>{getCoachById(id).name}</button>)}</div>
                </section>
                <section className={styles.coachCard}>
                    <CoachPortrait coach={coach} baseExpression={expression} speechText={spoken} animationsEnabled={settings.coach.animations} className={styles.coachPortrait}/>
                    <div><strong>{coach.name}</strong><p>{spoken}</p></div>
                </section>
                <section className={styles.feedbackCard} data-feedback={feedback}>
                    <b>{feedback == "correct" ? "✓" : feedback == "wrong" ? "×" : "·"}</b>
                    <div><strong>{feedback == "correct" ? copy.correct : feedback == "wrong" ? copy.wrong : line.saved.name}</strong>
                    <p>{feedback == "wrong" && expected ? `${formatEnhancementCopy(copy.correctMove, { move: expected.moveSan || expected.moveUci || "" })} ${copy.repeating}` : feedback == "correct" ? copy.coachCorrect : copy.studyIntro}</p></div>
                </section>
                <section className={styles.progressCard}><strong>{progress}</strong><span>{moveProgress}</span><div><i style={{ width: `${line.moves.length ? Math.min(100, moveIndex / line.moves.length * 100) : 0}%` }}/></div></section>
            </aside>
        </div>
    </section>;
}

export default RepertoireDrill;
