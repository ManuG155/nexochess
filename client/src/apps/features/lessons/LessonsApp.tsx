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
import { getCoachById } from "@analysis/lib/coach";
import type { CoachId } from "@analysis/lib/coach";

import {
    curriculumLevels,
    curriculumLessons,
    getNextCurriculumLesson,
    TOTAL_LESSONS
} from "./curriculum";
import type { CurriculumLesson, CurriculumTone } from "./curriculum";
import {
    loadLessonsProgress,
    markLessonComplete,
    setCurrentLesson,
    unlockLessonsThrough
} from "./progress";
import { buildPracticeLesson } from "./lessonPractice";
import type { PracticeChoice, PracticePosition } from "./lessonPractice";
import { analyseLessonPosition } from "./lessonCoachContext";
import type { LessonPieceType } from "./lessonCoachContext";
import LessonLandmark from "./LessonLandmarks";
import type { LandmarkVariant } from "./LessonLandmarks";

import * as styles from "./lessonsV4.module.css";
import * as polish from "./lessonsPolish.module.css";
import * as interactive from "./lessonsInteractive.module.css";

type View = "path" | "lesson";
type PathNodeState = "complete" | "current" | "available" | "locked";
type SessionResult = "success" | "error" | "illegal" | null;
type PathLabelSide = "left" | "right";
type CurriculumLessonEntry = (typeof curriculumLessons)[number];
type BoardSquareStyle = Record<string, string | number>;
type PathNodeStyle = React.CSSProperties & { "--label-shift-y"?: string };

interface LessonBoardSquareProps {
    children: React.ReactNode;
    square: Square;
    squareColor: "white" | "black";
    style: BoardSquareStyle;
}

const LessonBoardSquare = React.forwardRef<HTMLDivElement, LessonBoardSquareProps>(
    ({ children, style }, ref) => {
        const brilliant = style["--nexo-lesson-brilliant"];
        const squareStyle = { ...style };
        delete squareStyle["--nexo-lesson-brilliant"];

        return <div ref={ref} style={{ ...squareStyle, position: "relative" }}>
            {brilliant && <>
                <span className={styles.lessonSquareFeedback} aria-hidden="true"/>
                <span className={styles.lessonBrilliantBadge} aria-hidden="true">!!</span>
            </>}
            {children}
        </div>;
    }
);

LessonBoardSquare.displayName = "LessonBoardSquare";

const RANK_COORDINATES = ["8", "7", "6", "5", "4", "3", "2", "1"];
const FILE_COORDINATES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const PATH_WIDTH = 880;
const PATH_HEIGHT = 2960;
const NODE_Y_START = 190;
const NODE_Y_STEP = 138;
const NODE_X = [
    49, 40, 32, 34, 45,
    58, 67, 64, 53, 40,
    31, 35, 48, 62, 69,
    61, 48, 35, 39, 54
];

const LANDMARK_LABEL_ZONES: Array<{
    start: number;
    end: number;
    side: PathLabelSide;
}> = [
    { start: 360, end: 680, side: "right" },
    { start: 1060, end: 1435, side: "left" },
    { start: 1740, end: 2145, side: "right" },
    { start: 2380, end: 2860, side: "right" }
];

function nodeY(index: number) {
    return NODE_Y_START + index * NODE_Y_STEP;
}

function getPathLabelLayout(index: number, x: number, title: string) {
    const y = nodeY(index);
    let side: PathLabelSide = x >= 50 ? "right" : "left";
    let shiftY = 0;
    const obstacle = LANDMARK_LABEL_ZONES.find(zone => y >= zone.start && y <= zone.end);

    if (obstacle?.side == side) {
        side = side == "left" ? "right" : "left";
        shiftY = index % 2 == 0 ? -42 : 42;
    }

    if (title.length >= 22) {
        shiftY += index % 2 == 0 ? -12 : 12;
    }

    return { side, shiftY };
}

function buildRailPath(count: number) {
    if (!count) return "";

    const points = Array.from({ length: count }, (_, index) => ({
        x: NODE_X[index % NODE_X.length] / 100 * PATH_WIDTH,
        y: nodeY(index)
    }));

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        const middleY = (previous.y + current.y) / 2;
        d += ` C ${previous.x} ${middleY}, ${current.x} ${middleY}, ${current.x} ${current.y}`;
    }

    return d;
}

function getToneLevel(tone: CurriculumTone) {
    return curriculumLevels.find(level => level.tone == tone) || curriculumLevels[0];
}

function LessonBoard({
    position,
    fen,
    selectedFrom,
    result,
    pieces,
    darkSquareColour,
    lightSquareColour,
    coordinates,
    legalMoveHints,
    hintVisible,
    brilliantSquare,
    onSquareClick,
    onPieceDrop,
    onPieceDragBegin,
    onPieceDragEnd
}: {
    position: PracticePosition;
    fen: string;
    selectedFrom?: Square;
    result: SessionResult;
    pieces: ReturnType<typeof createCustomPieces>;
    darkSquareColour: string;
    lightSquareColour: string;
    coordinates: "inside" | "outside";
    legalMoveHints: boolean;
    hintVisible: boolean;
    brilliantSquare?: Square;
    onSquareClick: (square: string) => void;
    onPieceDrop: (from: string, to: string) => boolean;
    onPieceDragBegin: (source: string) => void;
    onPieceDragEnd: () => void;
}) {
    const outside = coordinates == "outside";
    const squareStyles: NonNullable<React.ComponentProps<typeof Chessboard>["customSquareStyles"]> = {};

    function mergeSquareStyle(square: Square, style: React.CSSProperties) {
        squareStyles[square] = {
            ...(squareStyles[square] || {}),
            ...style
        };
    }

    if (selectedFrom) {
        mergeSquareStyle(selectedFrom, {
            boxShadow: "inset 0 0 0 4px rgba(109, 169, 255, .9)"
        });
    }

    if (selectedFrom && position.kind == "move" && result != "success" && legalMoveHints) {
        try {
            const board = new Chess(fen);
            board.moves({ square: selectedFrom, verbose: true }).forEach(move => {
                const target = move.to as Square;
                const occupied = board.get(target);
                mergeSquareStyle(
                    target,
                    occupied
                        ? { boxShadow: "inset 0 0 0 5px rgba(15, 23, 34, .36)" }
                        : {
                            backgroundImage:
                                "radial-gradient(circle, rgba(15, 23, 34, .43) 0 16%, transparent 17%)"
                        }
                );
            });
        } catch {
            // An invalid teaching position must not break the whole page.
        }
    }

    if (hintVisible) {
        const hintSquares = position.focusSquares
            || (position.kind == "move"
                ? [position.expected.from, position.expected.to]
                : position.kind == "select"
                    ? position.acceptedSquares
                    : []);

        hintSquares.forEach(value => {
            mergeSquareStyle(value, {
                boxShadow: "inset 0 0 0 5px rgba(118, 211, 255, .78)"
            });
        });
    }

    const renderedStyles = { ...squareStyles };
    if (brilliantSquare) {
        renderedStyles[brilliantSquare] = {
            ...(renderedStyles[brilliantSquare] || {}),
            "--nexo-lesson-brilliant": "true"
        } as BoardSquareStyle;
    }

    const arrows = hintVisible
        ? position.arrows
            || (position.kind == "move"
                ? [[position.expected.from, position.expected.to] as [Square, Square]]
                : [])
        : [];

    return <div className={styles.boardShellV4} data-coordinates={coordinates}>
        {outside && <div className={styles.rankCoordinatesV4} aria-hidden="true">
            {RANK_COORDINATES.map(rank => <span key={rank}>{rank}</span>)}
        </div>}

        <div className={styles.boardFrameV4}>
            <Chessboard
                id="nexochess-lessons-board-v4"
                position={fen}
                arePiecesDraggable={position.kind == "move" && result != "success"}
                onPieceDrop={onPieceDrop}
                onPieceDragBegin={(_piece, source) => onPieceDragBegin(source)}
                onPieceDragEnd={onPieceDragEnd}
                onSquareClick={onSquareClick}
                customPieces={pieces}
                customLightSquareStyle={{ backgroundColor: lightSquareColour }}
                customDarkSquareStyle={{ backgroundColor: darkSquareColour }}
                customSquareStyles={renderedStyles}
                customArrows={arrows}
                customSquare={
                    LessonBoardSquare as unknown as NonNullable<
                        React.ComponentProps<typeof Chessboard>["customSquare"]
                    >
                }
                showBoardNotation={!outside}
                snapToCursor
            />
        </div>

        {outside && <div className={styles.fileCoordinatesV4} aria-hidden="true">
            {FILE_COORDINATES.map(file => <span key={file}>{file}</span>)}
        </div>}
    </div>;
}

function LessonsApp() {
    const { t } = useTranslation("lessons");
    const { t: tc, i18n } = useTranslation("lessonsCatalog");
    const { t: tp } = useTranslation("lessonsPractice");
    const settings = useSettingsStore(state => state.settings);
    const setSettings = useSettingsStore(state => state.setSettings);

    const pieces = useMemo(
        () => createCustomPieces(normalisePieceTheme(settings.themes.piece)),
        [settings.themes.piece]
    );

    const lessonTitles = useMemo(() => {
        const value = tc("lessonTitles", { returnObjects: true }) as unknown;
        return Array.isArray(value) ? value.map(item => String(item)) : [];
    }, [i18n.resolvedLanguage, tc]);

    const [view, setView] = useState<View>("path");
    const [progress, setProgress] = useState(loadLessonsProgress);
    const [activeLessonId, setActiveLessonId] = useState(progress.currentLessonId);
    const [positionIndex, setPositionIndex] = useState(0);
    const [boardFen, setBoardFen] = useState("");
    const [selectedFrom, setSelectedFrom] = useState<Square>();
    const [result, setResult] = useState<SessionResult>(null);
    const [hintVisible, setHintVisible] = useState(false);
    const [brilliantSquare, setBrilliantSquare] = useState<Square>();
    const [lastMoveSan, setLastMoveSan] = useState<string>();
    const [sessionComplete, setSessionComplete] = useState(false);
    const [coachPickerOpen, setCoachPickerOpen] = useState(false);
    const [jumpTarget, setJumpTarget] = useState<CurriculumLessonEntry | null>(null);
    const [recentlyUnlockedId, setRecentlyUnlockedId] = useState<string>();
    const [recentlyCompletedId, setRecentlyCompletedId] = useState<string>();

    const coach = getCoachById(settings.appearance.selectedCoach);
    const activeLesson = curriculumLessons.find(item => item.id == activeLessonId)
        || curriculumLessons[0];
    const practiceLesson = useMemo(
        () => buildPracticeLesson(activeLesson),
        [activeLesson.id]
    );
    const position = practiceLesson.positions[Math.min(
        positionIndex,
        Math.max(0, practiceLesson.positions.length - 1)
    )];
    const activeLevel = getToneLevel(activeLesson.tone);

    function titleFor(lesson: CurriculumLessonEntry | CurriculumLesson) {
        if (lesson.titleIndex >= 0) {
            return lessonTitles[lesson.titleIndex] || lesson.titleEn || lesson.id;
        }

        const language = i18n.resolvedLanguage || i18n.language;
        if (language?.toLowerCase().startsWith("es") && lesson.titleEs) {
            return lesson.titleEs;
        }
        return lesson.titleEn || lesson.titleEs || lesson.id;
    }

    const activeTitle = titleFor(activeLesson);

    function pieceLabel(type?: LessonPieceType) {
        return tp(`pieceNames.${type || "piece"}`);
    }

    useEffect(() => {
        if (!position) return;
        setBoardFen(position.fen);
        setSelectedFrom(undefined);
        setResult(null);
        setHintVisible(false);
        setBrilliantSquare(undefined);
        setLastMoveSan(undefined);
    }, [position?.id]);

    useEffect(() => {
        if (view == "lesson") {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }
    }, [view, activeLessonId]);

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

    function startLesson(lesson: CurriculumLessonEntry) {
        const nextProgress = setCurrentLesson(progress, lesson.id);
        setProgress(nextProgress);
        setActiveLessonId(lesson.id);
        setPositionIndex(0);
        setSessionComplete(false);
        setResult(null);
        setHintVisible(false);
        setSelectedFrom(undefined);
        setBrilliantSquare(undefined);
        setLastMoveSan(undefined);
        setView("lesson");
    }

    function openLesson(lesson: CurriculumLessonEntry) {
        if (!progress.unlockedLessonIds.includes(lesson.id)) {
            setJumpTarget(lesson);
            return;
        }
        startLesson(lesson);
    }

    function confirmJump() {
        if (!jumpTarget) return;

        const target = jumpTarget;
        const next = unlockLessonsThrough(
            progress,
            curriculumLessons.map(item => item.id),
            target.id
        );
        setProgress(next);
        setJumpTarget(null);
        setActiveLessonId(target.id);
        setPositionIndex(0);
        setSessionComplete(false);
        setResult(null);
        setHintVisible(false);
        setSelectedFrom(undefined);
        setBrilliantSquare(undefined);
        setLastMoveSan(undefined);
        setView("lesson");
    }

    function movesMatch(a: { from: Square; to: Square }, b: { from: Square; to: Square }) {
        return a.from == b.from && a.to == b.to;
    }

    function registerMove(from: Square, to: Square) {
        if (!position || position.kind != "move" || result == "success") return false;

        const attempted = { from, to };
        const correct = movesMatch(attempted, position.expected)
            || Boolean(position.accepted?.some(move => movesMatch(attempted, move)));

        let board: Chess;
        try {
            board = new Chess(boardFen);
        } catch {
            setLastMoveSan(undefined);
            setResult("illegal");
            return false;
        }

        let move;
        try {
            move = board.move({ from, to, promotion: "q" });
        } catch {
            setLastMoveSan(undefined);
            setResult("illegal");
            setSelectedFrom(undefined);
            return false;
        }

        if (!move) {
            setLastMoveSan(undefined);
            setResult("illegal");
            setSelectedFrom(undefined);
            return false;
        }

        if (!correct) {
            setLastMoveSan(undefined);
            setResult("error");
            setSelectedFrom(undefined);
            return false;
        }

        setBoardFen(board.fen());
        setLastMoveSan(move.san);
        setResult("success");
        setSelectedFrom(undefined);
        playBoardMoveSound(move.san);

        if (position.brilliant || activeLesson.brilliant) {
            setBrilliantSquare(to);
            window.setTimeout(() => setBrilliantSquare(undefined), 1380);
        }

        return true;
    }

    function handleSquareClick(name: string) {
        if (!position || result == "success") return;
        const target = name as Square;

        if (position.kind == "select") {
            setLastMoveSan(undefined);
            setResult(position.acceptedSquares.includes(target) ? "success" : "error");
            return;
        }

        if (position.kind != "move") return;

        let board: Chess;
        try {
            board = new Chess(boardFen);
        } catch {
            setLastMoveSan(undefined);
            setResult("illegal");
            return;
        }

        const piece = board.get(target);
        const turn = board.turn();

        if (!selectedFrom) {
            if (piece?.color == turn) {
                setResult(null);
                setSelectedFrom(target);
            }
            return;
        }

        if (selectedFrom == target) {
            setSelectedFrom(undefined);
            return;
        }

        if (piece?.color == turn) {
            setResult(null);
            setSelectedFrom(target);
            return;
        }

        registerMove(selectedFrom, target);
    }

    function answerChoice(choice: PracticeChoice) {
        if (!position || position.kind != "choice" || result == "success") return;
        setLastMoveSan(undefined);
        setResult(choice == position.correctChoice ? "success" : "error");
    }

    function advancePosition() {
        if (result != "success") return;

        if (positionIndex + 1 < practiceLesson.positions.length) {
            setPositionIndex(value => value + 1);
            return;
        }

        const nextLesson = getNextCurriculumLesson(activeLesson.id);
        const nextProgress = markLessonComplete(
            progress,
            activeLesson.id,
            nextLesson?.id
        );

        setProgress(nextProgress);
        setRecentlyCompletedId(activeLesson.id);
        setRecentlyUnlockedId(nextLesson?.id);
        setSessionComplete(true);
    }

    useEffect(() => {
        if (view != "lesson" || sessionComplete || result != "success") return;
        const timer = window.setTimeout(() => advancePosition(), 1250);
        return () => window.clearTimeout(timer);
    }, [view, sessionComplete, result, positionIndex, activeLesson.id, practiceLesson.positions.length]);

    function finishLesson() {
        const nextLesson = getNextCurriculumLesson(activeLesson.id);
        setView("path");

        window.setTimeout(() => {
            const targetId = nextLesson?.id || activeLesson.id;
            document
                .getElementById(`lesson-node-${targetId}`)
                ?.scrollIntoView({ block: "center", behavior: "smooth" });
        }, 90);
    }

    const completedCount = curriculumLessons.filter(
        lesson => progress.completedLessonIds.includes(lesson.id)
    ).length;
    const pathProgressPercent = Math.round(completedCount / TOTAL_LESSONS * 100);
    const lessonProgressPercent = practiceLesson.positions.length
        ? Math.round((positionIndex + (result == "success" ? 1 : 0)) / practiceLesson.positions.length * 100)
        : 0;

    if (view == "path") {
        return <main className={`${styles.shellV4} ${styles.pathPage} ${polish.pathShell}`} data-tone="ice">
            <section className={styles.pathHeroV4}>
                <div className={styles.heroCopyV4}>
                    <span>{t("page.eyebrow")}</span>
                    <h1>{t("page.title")}</h1>
                    <p>{t("page.subtitle")}</p>
                </div>

                <div className={styles.heroProgressV4}>
                    <span>{t("path.progressLabel")}</span>
                    <strong>{completedCount} / {TOTAL_LESSONS}</strong>
                    <div className={styles.progressTrackV4}>
                        <i style={{ width: `${pathProgressPercent}%` }}/>
                    </div>
                </div>
            </section>

            <div className={styles.pathWorld}>
                {curriculumLevels.map(level => {
                    const rail = buildRailPath(level.lessons.length);

                    return <section
                        key={level.id}
                        className={`${styles.levelSection} ${polish.levelAtmosphere}`}
                        data-tone={level.tone}
                    >
                        <div className={polish.environmentLayer} aria-hidden="true">
                            <span/><span/><span/>
                        </div>

                        <header className={`${styles.levelHeaderV4} ${polish.levelHeaderLarge}`}>
                            <div>
                                <span>{tc(level.kickerKey)}</span>
                                <h2>{tc(level.titleKey)}</h2>
                                <p>{tc(level.descriptionKey)}</p>
                            </div>
                            <strong>{tc("levelLessonCount", { count: level.lessons.length })}</strong>
                        </header>

                        <div className={`${styles.pathStage} ${polish.pathStageTall}`}>
                            <svg
                                className={styles.pathRailSvg}
                                viewBox={`0 0 ${PATH_WIDTH} ${PATH_HEIGHT}`}
                                preserveAspectRatio="none"
                                aria-hidden="true"
                            >
                                <path className={styles.pathRailShadow} d={rail}/>
                                <path className={styles.pathRailBase} d={rail}/>
                                <path className={styles.pathRailLight} d={rail}/>
                            </svg>

                            {[0, 1, 2, 3].map(slot => <div
                                key={slot}
                                className={`${styles.landmarkSlot} ${polish.landmarkSlotSpread}`}
                                data-slot={slot}
                                aria-hidden="true"
                            >
                                <LessonLandmark
                                    tone={level.tone}
                                    variant={slot as LandmarkVariant}
                                />
                            </div>)}

                            {level.lessons.map((lesson, index) => {
                                const entry = {
                                    ...lesson,
                                    levelId: level.id,
                                    tone: level.tone
                                };
                                const title = titleFor(entry);
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
                                const x = NODE_X[index % NODE_X.length];
                                const labelLayout = getPathLabelLayout(index, x, title);
                                const classNames = [styles.pathNodeWrap, polish.pathNodeSafe];
                                if (recentlyUnlockedId == lesson.id) classNames.push(styles.unlockPulse);
                                if (recentlyCompletedId == lesson.id) classNames.push(styles.completePulse);
                                const nodeStyle: PathNodeStyle = {
                                    left: `${x}%`,
                                    top: `${nodeY(index)}px`,
                                    "--label-shift-y": `${labelLayout.shiftY}px`
                                };

                                return <div
                                    id={`lesson-node-${lesson.id}`}
                                    key={lesson.id}
                                    className={classNames.join(" ")}
                                    data-state={state}
                                    data-label-side={labelLayout.side}
                                    style={nodeStyle}
                                >
                                    <button
                                        type="button"
                                        className={styles.pathNodeButton}
                                        onClick={() => openLesson(entry)}
                                        aria-label={title}
                                    >
                                        <span className={styles.nodeSymbolV4} aria-hidden="true">
                                            {complete ? "✓" : lesson.symbol}
                                        </span>
                                        <span className={`${styles.nodeNumberV4} ${polish.nodeNumberSafe}`} aria-hidden="true">
                                            {String(curriculumLessons.findIndex(item => item.id == lesson.id) + 1).padStart(2, "0")}
                                        </span>
                                    </button>
                                    <div className={`${styles.nodeCopyV4} ${polish.pathNodeCopy}`}>
                                        <strong>{title}</strong>
                                    </div>
                                </div>;
                            })}
                        </div>
                    </section>;
                })}
            </div>

            {jumpTarget && <div
                className={styles.modalOverlayV4}
                onClick={() => setJumpTarget(null)}
            >
                <section
                    className={styles.jumpDialogV4}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="lessons-jump-title"
                    onClick={event => event.stopPropagation()}
                >
                    <span>{tc("jump.kicker")}</span>
                    <h2 id="lessons-jump-title">{tc("jump.title")}</h2>
                    <strong>{titleFor(jumpTarget)}</strong>
                    <p>{tc("jump.body")}</p>
                    <div className={styles.dialogActionsV4}>
                        <button type="button" onClick={() => setJumpTarget(null)}>
                            {tc("cancel")}
                        </button>
                        <button type="button" data-primary="true" onClick={confirmJump}>
                            {tc("jump.confirm")}
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

    const isBoardTour = activeLesson.id == "first-contact.board" && position?.kind == "move";
    const boardTarget = isBoardTour ? position.expected.to.toUpperCase() : undefined;
    const coachContext = analyseLessonPosition(position, position?.fen || boardFen);
    const turn = coachContext.turn;
    const turnLabel = tp(`choices.${turn}`);
    const movingPiece = pieceLabel(coachContext.movingPieceType);
    const targetPiece = pieceLabel(coachContext.targetPieceType);
    const checkerPiece = pieceLabel(coachContext.checkerType);

    let coachText: string;
    if (result == "success") {
        const successKey = `coachDynamic.success${positionIndex % 4 + 1}`;
        coachText = tp(successKey, { move: lastMoveSan || "" });
    } else if (result == "illegal") {
        coachText = tp("coachDynamic.illegal");
    } else if (result == "error") {
        coachText = tp("coachDynamic.error");
    } else if (hintVisible) {
        coachText = coachContext.checkerType
            ? tp("coachDynamic.hintCheck", {
                attacker: checkerPiece,
                square: coachContext.checkerSquare?.toUpperCase()
            })
            : position?.kind == "move"
                ? tp("coachDynamic.hintMove", {
                    piece: movingPiece,
                    from: coachContext.from?.toUpperCase(),
                    lesson: activeTitle
                })
                : tp("coachDynamic.hintChoice", { lesson: activeTitle });
    } else if (isBoardTour) {
        coachText = tp("coachBoard", {
            square: boardTarget,
            current: Math.min(positionIndex + 1, practiceLesson.positions.length),
            total: practiceLesson.positions.length
        });
    } else if (coachContext.checkerType) {
        coachText = tp("coachDynamic.check", {
            side: turnLabel,
            attacker: checkerPiece,
            square: coachContext.checkerSquare?.toUpperCase()
        });
    } else if (position?.kind == "move" && coachContext.targetPieceType) {
        coachText = tp("coachDynamic.capture", {
            side: turnLabel,
            piece: movingPiece,
            from: coachContext.from?.toUpperCase(),
            target: targetPiece,
            to: coachContext.to?.toUpperCase(),
            lesson: activeTitle
        });
    } else if (position?.kind == "move") {
        coachText = tp("coachDynamic.position", {
            side: turnLabel,
            piece: movingPiece,
            from: coachContext.from?.toUpperCase(),
            lesson: activeTitle
        });
    } else {
        coachText = tp("coachDynamic.choice", {
            side: turnLabel,
            lesson: activeTitle
        });
    }

    return <main
        className={`${styles.shellV4} ${styles.sessionPage} ${polish.sessionAtmosphere}`}
        data-tone={activeLesson.tone}
    >
        <div className={polish.sessionDecor} aria-hidden="true">
            <span/><span/><span/><span/>
        </div>

        <section className={`${styles.sessionHeaderV4} ${polish.sessionHeaderCompact}`}>
            <button
                type="button"
                className={styles.sessionBack}
                onClick={() => setView("path")}
            >
                <span aria-hidden="true">←</span>
                {t("actions.back")}
            </button>

            <div className={styles.sessionProgressV4}>
                <strong>{tp("positionProgress", {
                    current: Math.min(positionIndex + 1, practiceLesson.positions.length),
                    total: practiceLesson.positions.length
                })}</strong>
                <div className={styles.progressTrackV4}>
                    <i style={{ width: `${lessonProgressPercent}%` }}/>
                </div>
            </div>
        </section>

        <div className={`${styles.sessionStage} ${polish.sessionStageRich}`}>
            {!sessionComplete && position && <aside className={styles.taskRailV4}>
                <div className={`${styles.taskCardV4} ${polish.taskCardRich} ${interactive.taskCard}`}>
                    <div className={polish.taskTopline}>
                        <span className={styles.challengeEyebrow}>{t("lesson.yourTurn")}</span>
                        <span className={polish.turnBadge} data-turn={turn}>
                            <span aria-hidden="true">{turn == "white" ? "♙" : "♟"}</span>
                            {turnLabel}
                        </span>
                    </div>
                    <span className={polish.levelChip}>{tc(activeLevel.titleKey)}</span>
                    <h2>{activeTitle}</h2>

                    <div className={`${styles.positionMeta} ${interactive.positionMeta}`}>
                        <span>{tp("positionProgress", {
                            current: positionIndex + 1,
                            total: practiceLesson.positions.length
                        })}</span>
                        <span>{tp("positions", { count: practiceLesson.positions.length })}</span>
                    </div>

                    {position.kind == "move" && position.revealTarget && <div className={styles.moveTarget}>
                        <span>{position.expected.from}</span>
                        <span aria-hidden="true">→</span>
                        <span>{position.expected.to}</span>
                    </div>}

                    {isBoardTour && boardTarget && <div className={styles.moveTarget}>
                        <span>{position.expected.from.toUpperCase()}</span>
                        <span aria-hidden="true">→</span>
                        <span>{boardTarget}</span>
                    </div>}

                    {position.kind == "choice" && <div className={styles.choiceGrid}>
                        {position.choices.map(choice => <button
                            key={choice}
                            type="button"
                            className={styles.choiceButton}
                            onClick={() => answerChoice(choice)}
                            disabled={result == "success"}
                        >
                            {tp(`choices.${choice}`)}
                        </button>)}
                    </div>}

                    {result && <div
                        className={`${styles.feedbackV4} ${interactive.feedback}`}
                        data-result={result == "success" ? "success" : "error"}
                        role="status"
                    >
                        <span className={styles.feedbackIcon} aria-hidden="true">
                            {result == "success" ? "✓" : "!"}
                        </span>
                        <span>
                            {result == "success"
                                ? tp("correct")
                                : result == "illegal"
                                    ? tp("illegal")
                                    : tp("tryAgain")}
                        </span>
                    </div>}

                    <div className={`${styles.taskActions} ${interactive.taskActions}`}>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => setHintVisible(value => !value)}
                            disabled={result == "success"}
                        >
                            {t("actions.hint")}
                        </button>
                    </div>
                </div>
            </aside>}

            <section className={styles.boardStageV4}>
                {!sessionComplete && position
                    ? <LessonBoard
                        position={position}
                        fen={boardFen || position.fen}
                        selectedFrom={selectedFrom}
                        result={result}
                        pieces={pieces}
                        darkSquareColour={settings.themes.board.darkSquareColour}
                        lightSquareColour={settings.themes.board.lightSquareColour}
                        coordinates={settings.themes.board.coordinates}
                        legalMoveHints={settings.themes.board.legalMoveHints}
                        hintVisible={hintVisible}
                        brilliantSquare={brilliantSquare}
                        onSquareClick={handleSquareClick}
                        onPieceDrop={(from, to) => registerMove(from as Square, to as Square)}
                        onPieceDragBegin={source => {
                            if (position.kind == "move" && result != "success") {
                                setResult(null);
                                setSelectedFrom(source as Square);
                            }
                        }}
                        onPieceDragEnd={() => {
                            if (result != "success") setSelectedFrom(undefined);
                        }}
                    />
                    : <section className={styles.completionStage}>
                        <span className={styles.completionMark} aria-hidden="true">✓</span>
                        <span className={styles.completionEyebrow}>{t("lesson.completeKicker")}</span>
                        <h2>{tp("completed", { lesson: activeTitle })}</h2>
                        <p>{tp("completedBody")}</p>
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={finishLesson}
                        >
                            {t("actions.finish")}
                        </button>
                    </section>}
            </section>

            {!sessionComplete && <aside className={styles.coachRailV4}>
                <div className={`${styles.coachCardV4} ${polish.coachCardRich}`}>
                    <button
                        type="button"
                        className={styles.coachPortraitButtonV4}
                        onClick={() => setCoachPickerOpen(true)}
                        aria-label={t("coach.change", { coach: coach.name })}
                        title={t("coach.change", { coach: coach.name })}
                    >
                        <CoachPortrait
                            coach={coach}
                            baseExpression="idle"
                            speechText={coachText}
                            animationsEnabled={settings.coach.animations}
                            className={styles.coachPortraitV4}
                        />
                    </button>
                    <div className={`${styles.coachBubbleV4} ${interactive.coachBubble}`}>
                        <strong>{coach.name}</strong>
                        <p>{coachText}</p>
                        <small>{t("coach.clickToChange")}</small>
                    </div>
                </div>
            </aside>}
        </div>

        {coachPickerOpen && <CoachPicker
            selectedCoach={coach}
            onClose={() => setCoachPickerOpen(false)}
            onConfirm={chooseCoach}
        />}
    </main>;
}

export default LessonsApp;
