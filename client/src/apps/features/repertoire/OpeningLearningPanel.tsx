import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chess, Move, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import useSettingsStore from "@/stores/SettingsStore";
import { createCustomPieces } from "@/lib/chessAppearance";
import CoachPortrait from "@analysis/components/AnalysisPanel/CoachPortrait";
import {
    CoachExpression,
    getCoachById,
    getCoachSpokenLine
} from "@analysis/lib/coach";

import {
    OpeningCatalogueEntry,
    getFallbackOpeningCatalogue,
    loadOpeningCatalogue
} from "./openingCatalogue";
import {
    CourseProgressStore,
    LessonProgress,
    createLessonId,
    getDueLessons,
    getLearnedCount,
    getMasteredCount,
    readCourseProgress,
    recordLessonReview,
    writeCourseProgress
} from "./courseProgress";
import * as styles from "./learning.module.css";

type RepertoireSide = "white" | "black";
type CourseMode = "learn" | "practice";
type PanelMode = "learn" | "review";

interface OpeningLearningPanelProps {
    mode?: PanelMode;
    onAddToRepertoire: (
        opening: OpeningCatalogueEntry,
        side: RepertoireSide
    ) => void;
}

interface OpeningFamily {
    name: string;
    lines: OpeningCatalogueEntry[];
}

function getCourseMoves(opening?: OpeningCatalogueEntry) {
    if (!opening) return [] as Move[];
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

function inferSide(opening: OpeningCatalogueEntry): RepertoireSide {
    return /defen[sc]e|countergambit|counterattack/i.test(opening.family)
        ? "black"
        : "white";
}

function openingFromProgress(progress: LessonProgress): OpeningCatalogueEntry {
    return {
        eco: progress.eco,
        name: progress.openingName,
        pgn: progress.pgn,
        family: progress.family
    };
}

function dueLabel(progress: LessonProgress) {
    const due = new Date(progress.dueAt);
    if (!Number.isFinite(due.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(due);
}

function OpeningLearningPanel({
    mode = "learn",
    onAddToRepertoire
}: OpeningLearningPanelProps) {
    const { t } = useTranslation("repertoire");
    const { t: tCoach } = useTranslation("coach", { useSuspense: false });
    const settings = useSettingsStore(state => state.settings);
    const customPieces = useMemo(
        () => createCustomPieces(settings.themes.piece),
        [settings.themes.piece]
    );
    const selectedCoach = getCoachById(settings.appearance.selectedCoach);
    const coachEnabled = settings.coach.enabled;

    const [catalogue, setCatalogue] = useState<OpeningCatalogueEntry[]>(
        getFallbackOpeningCatalogue()
    );
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [selectedFamily, setSelectedFamily] = useState<string>();
    const [selectedOpening, setSelectedOpening] =
        useState<OpeningCatalogueEntry>();
    const [side, setSide] = useState<RepertoireSide>("white");
    const [courseMode, setCourseMode] = useState<CourseMode>("learn");
    const [learnStep, setLearnStep] = useState(0);
    const [practiceIndex, setPracticeIndex] = useState(0);
    const [selectedSquare, setSelectedSquare] = useState<Square>();
    const [showHint, setShowHint] = useState(false);
    const [sessionMistakes, setSessionMistakes] = useState(0);
    const [sessionRecorded, setSessionRecorded] = useState(false);
    const [lessonLimit, setLessonLimit] = useState(14);
    const [coachExpression, setCoachExpression] =
        useState<CoachExpression>("explaining");
    const [coachMessageKey, setCoachMessageKey] =
        useState("learn.coach.welcome");
    const [progress, setProgress] = useState<CourseProgressStore>(
        () => readCourseProgress()
    );

    const autoAdvanceRef = useRef<number>();

    useEffect(() => {
        let cancelled = false;
        void loadOpeningCatalogue().then(entries => {
            if (!cancelled) {
                setCatalogue(entries);
                setLoading(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        writeCourseProgress(progress);
    }, [progress]);

    useEffect(() => {
        setSelectedOpening(undefined);
        setSelectedFamily(undefined);
        setCourseMode("learn");
        setPracticeIndex(0);
        setLearnStep(0);
        setSelectedSquare(undefined);
        setShowHint(false);
        setSessionMistakes(0);
        setSessionRecorded(false);
    }, [mode]);

    const families = useMemo<OpeningFamily[]>(() => {
        const grouped = new Map<string, OpeningCatalogueEntry[]>();
        for (const opening of catalogue) {
            const list = grouped.get(opening.family) || [];
            list.push(opening);
            grouped.set(opening.family, list);
        }
        return Array.from(grouped, ([name, lines]) => ({
            name,
            lines: [...lines].sort((a, b) => (
                a.pgn.length - b.pgn.length || a.name.localeCompare(b.name)
            ))
        })).sort((a, b) => a.name.localeCompare(b.name));
    }, [catalogue]);

    const normalisedQuery = query.trim().toLocaleLowerCase();
    const visibleFamilies = useMemo(() => {
        const source = normalisedQuery
            ? families.filter(family => (
                family.name.toLocaleLowerCase().includes(normalisedQuery)
                || family.lines.some(line => (
                    line.name.toLocaleLowerCase().includes(normalisedQuery)
                    || line.eco.toLocaleLowerCase().includes(normalisedQuery)
                ))
            ))
            : families.filter(family => getFallbackOpeningCatalogue()
                .some(opening => opening.family == family.name));
        return source.slice(0, normalisedQuery ? 100 : 24);
    }, [families, normalisedQuery]);

    const family = selectedFamily
        ? families.find(item => item.name == selectedFamily)
        : undefined;
    const courseMoves = useMemo(
        () => getCourseMoves(selectedOpening),
        [selectedOpening]
    );
    const courseFen = getFenAtStep(courseMoves, learnStep);
    const practiceFen = getFenAtStep(courseMoves, practiceIndex);
    const expectedMove = courseMoves[practiceIndex];
    const learnerColour = side == "white" ? "w" : "b";
    const currentLessonId = selectedOpening
        ? createLessonId(
            selectedOpening.eco,
            selectedOpening.name,
            selectedOpening.pgn
        )
        : "";
    const currentProgress = currentLessonId
        ? progress[currentLessonId]
        : undefined;
    const dueLessons = useMemo(() => getDueLessons(progress), [progress]);
    const learnedCount = useMemo(() => getLearnedCount(progress), [progress]);
    const masteredCount = useMemo(() => getMasteredCount(progress), [progress]);

    const completedInFamily = family?.lines.filter(line => (
        Boolean(progress[createLessonId(line.eco, line.name, line.pgn)])
    )).length || 0;

    useEffect(() => {
        if (autoAdvanceRef.current != undefined) {
            window.clearTimeout(autoAdvanceRef.current);
            autoAdvanceRef.current = undefined;
        }

        if (
            courseMode != "practice"
            || !selectedOpening
            || practiceIndex >= courseMoves.length
            || expectedMove?.color == learnerColour
        ) return undefined;

        setCoachExpression("explaining");
        setCoachMessageKey("learn.coach.opponent");
        autoAdvanceRef.current = window.setTimeout(() => {
            setPracticeIndex(index => Math.min(index + 1, courseMoves.length));
            setSelectedSquare(undefined);
            setShowHint(false);
        }, 520);

        return () => {
            if (autoAdvanceRef.current != undefined) {
                window.clearTimeout(autoAdvanceRef.current);
                autoAdvanceRef.current = undefined;
            }
        };
    }, [
        courseMode,
        courseMoves.length,
        expectedMove?.color,
        learnerColour,
        practiceIndex,
        selectedOpening?.name
    ]);

    useEffect(() => {
        if (
            courseMode != "practice"
            || !selectedOpening
            || courseMoves.length == 0
            || practiceIndex < courseMoves.length
            || sessionRecorded
        ) return;

        setProgress(previous => recordLessonReview(previous, {
            id: currentLessonId,
            openingName: selectedOpening.name,
            family: selectedOpening.family,
            eco: selectedOpening.eco,
            pgn: selectedOpening.pgn,
            side
        }, sessionMistakes));
        setSessionRecorded(true);
        setCoachExpression("celebrating");
        setCoachMessageKey("learn.coach.completed");
    }, [
        courseMode,
        courseMoves.length,
        currentLessonId,
        practiceIndex,
        selectedOpening,
        sessionMistakes,
        sessionRecorded,
        side
    ]);

    function selectFamily(name: string) {
        setSelectedFamily(name);
        setSelectedOpening(undefined);
        setQuery("");
        setCourseMode("learn");
        setLessonLimit(14);
        setCoachExpression("explaining");
        setCoachMessageKey("learn.coach.family");
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    function selectOpening(
        opening: OpeningCatalogueEntry,
        preferredSide?: RepertoireSide,
        startInPractice = false
    ) {
        setSelectedFamily(opening.family);
        setSelectedOpening(opening);
        setSide(preferredSide || inferSide(opening));
        setCourseMode(startInPractice ? "practice" : "learn");
        setLearnStep(0);
        setPracticeIndex(0);
        setSelectedSquare(undefined);
        setShowHint(false);
        setSessionMistakes(0);
        setSessionRecorded(false);
        setCoachExpression(startInPractice ? "thinking" : "explaining");
        setCoachMessageKey(
            startInPractice
                ? "learn.coach.practiceStart"
                : "learn.coach.lineStart"
        );
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    function startPractice() {
        setCourseMode("practice");
        setPracticeIndex(0);
        setSelectedSquare(undefined);
        setShowHint(false);
        setSessionMistakes(0);
        setSessionRecorded(false);
        setCoachExpression("thinking");
        setCoachMessageKey("learn.coach.practiceStart");
    }

    function returnToLearn() {
        setCourseMode("learn");
        setLearnStep(0);
        setSelectedSquare(undefined);
        setShowHint(false);
        setCoachExpression("explaining");
        setCoachMessageKey("learn.coach.lineStart");
    }

    function playPracticeMove(from: string, to: string) {
        if (
            courseMode != "practice"
            || !expectedMove
            || expectedMove.color != learnerColour
        ) return false;

        const correct = expectedMove.from == from && expectedMove.to == to;
        if (!correct) {
            setSessionMistakes(value => value + 1);
            setCoachExpression("worried");
            setCoachMessageKey("learn.coach.tryAgain");
            setShowHint(false);
            setSelectedSquare(undefined);
            return false;
        }

        setPracticeIndex(index => Math.min(index + 1, courseMoves.length));
        setSelectedSquare(undefined);
        setShowHint(false);
        setCoachExpression(
            practiceIndex + 1 >= courseMoves.length ? "celebrating" : "approving"
        );
        setCoachMessageKey(
            practiceIndex + 1 >= courseMoves.length
                ? "learn.coach.completed"
                : "learn.coach.correct"
        );
        return true;
    }

    function requestHint() {
        if (!expectedMove || expectedMove.color != learnerColour) return;
        if (!showHint) setSessionMistakes(value => value + 1);
        setShowHint(true);
        setCoachExpression("explaining");
        setCoachMessageKey("learn.coach.hint");
    }

    function onPracticeSquareClick(squareName: string) {
        if (!expectedMove || expectedMove.color != learnerColour) return;
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

    const practiceSquareStyles: NonNullable<
        React.ComponentProps<typeof Chessboard>["customSquareStyles"]
    > = {};
    if (selectedSquare) {
        practiceSquareStyles[selectedSquare] = {
            boxShadow: "inset 0 0 0 4px rgba(96,151,255,.92)"
        };
        if (settings.themes.board.legalMoveHints) {
            const board = new Chess(practiceFen);
            board.moves({ square: selectedSquare, verbose: true }).forEach(move => {
                practiceSquareStyles[move.to] = board.get(move.to)
                    ? { boxShadow: "inset 0 0 0 5px rgba(18,24,34,.34)" }
                    : {
                        backgroundImage:
                            "radial-gradient(circle, rgba(18,24,34,.42) 0 16%, transparent 17%)"
                    };
            });
        }
    }

    const coachMessage = getCoachSpokenLine(
        selectedCoach,
        t(coachMessageKey, {
            opening: selectedOpening?.name || selectedFamily || "",
            move: expectedMove?.san || ""
        }),
        `${coachMessageKey}|${selectedOpening?.name || selectedFamily || "catalogue"}|${practiceIndex}|${learnStep}`,
        tCoach
    );

    if (mode == "review" && !selectedOpening) {
        const future = Object.values(progress)
            .filter(item => !dueLessons.includes(item))
            .sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];

        return <section className={styles.learnSection}>
            <div className={styles.reviewHero}>
                <div>
                    <span className={styles.eyebrow}>{t("review.eyebrow")}</span>
                    <h2>{t("review.title")}</h2>
                    <p>{t("review.intro")}</p>
                </div>
                <div className={styles.reviewStats}>
                    <div><strong>{dueLessons.length}</strong><span>{t("review.due")}</span></div>
                    <div><strong>{learnedCount}</strong><span>{t("review.learned")}</span></div>
                    <div><strong>{masteredCount}</strong><span>{t("review.mastered")}</span></div>
                </div>
            </div>

            {dueLessons.length == 0 ? <div className={styles.reviewEmpty}>
                <span>✓</span>
                <h3>{t("review.emptyTitle")}</h3>
                <p>{future
                    ? t("review.next", { date: dueLabel(future) })
                    : t("review.emptyBody")}</p>
            </div> : <div className={styles.reviewQueue}>
                <div className={styles.reviewQueueHeader}>
                    <div>
                        <strong>{t("review.queueTitle")}</strong>
                        <span>{t("review.queueHelp")}</span>
                    </div>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => selectOpening(
                            openingFromProgress(dueLessons[0]),
                            dueLessons[0].side,
                            true
                        )}
                    >{t("review.start")}</button>
                </div>
                {dueLessons.map(item => <button
                    type="button"
                    key={item.lessonId}
                    className={styles.reviewItem}
                    onClick={() => selectOpening(
                        openingFromProgress(item),
                        item.side,
                        true
                    )}
                >
                    <span className={styles.reviewEco}>{item.eco}</span>
                    <span><strong>{item.openingName}</strong><small>{item.pgn}</small></span>
                    <span className={styles.reviewSide}>{t(`side.${item.side}`)}</span>
                </button>)}
            </div>}
        </section>;
    }

    if (!selectedFamily) {
        return <section className={styles.learnSection}>
            <div className={styles.learnIntro}>
                <div>
                    <span className={styles.eyebrow}>{t("learn.eyebrow")}</span>
                    <h2>{t("learn.title")}</h2>
                    <p>{t("learn.intro")}</p>
                </div>
                <div className={styles.learnMethod}>
                    <strong>{t("learn.methodTitle")}</strong>
                    <ol>
                        <li>{t("learn.methodUnderstand")}</li>
                        <li>{t("learn.methodFollow")}</li>
                        <li>{t("learn.methodPractice")}</li>
                        <li>{t("learn.methodReview")}</li>
                        <li>{t("learn.methodAdd")}</li>
                    </ol>
                </div>
            </div>

            <div className={styles.learningStats}>
                <div><strong>{learnedCount}</strong><span>{t("review.learned")}</span></div>
                <div><strong>{dueLessons.length}</strong><span>{t("review.due")}</span></div>
                <div><strong>{masteredCount}</strong><span>{t("review.mastered")}</span></div>
            </div>

            <label className={styles.openingSearch}>
                <span>{t("learn.searchLabel")}</span>
                <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder={t("learn.searchPlaceholder")}
                />
                <small>{loading ? t("learn.loading") : t("learn.catalogueReady", { count: catalogue.length })}</small>
            </label>

            <div className={styles.familyGrid}>
                {visibleFamilies.map(item => {
                    const completed = item.lines.filter(line => (
                        Boolean(progress[createLessonId(line.eco, line.name, line.pgn)])
                    )).length;
                    return <button
                        type="button"
                        key={item.name}
                        className={styles.familyCard}
                        onClick={() => selectFamily(item.name)}
                    >
                        <span>{item.lines[0]?.eco}</span>
                        <strong>{item.name}</strong>
                        <small>{t("learn.lessons", { count: item.lines.length })}</small>
                        {completed > 0 && <em>{t("learn.progress", { completed, total: item.lines.length })}</em>}
                    </button>;
                })}
            </div>
        </section>;
    }

    if (!selectedOpening && family) {
        return <section className={styles.learnSection}>
            <button type="button" className={styles.backButton} onClick={() => setSelectedFamily(undefined)}>
                ← {t("learn.allOpenings")}
            </button>
            <div className={styles.familyHeader}>
                <div>
                    <span className={styles.eyebrow}>{family.lines[0]?.eco}</span>
                    <h2>{family.name}</h2>
                    <p>{t("learn.familyIntro")}</p>
                </div>
                <div className={styles.familyProgress}>
                    <strong>{completedInFamily}/{family.lines.length}</strong>
                    <span>{t("learn.linesLearned")}</span>
                </div>
            </div>

            {coachEnabled && <div className={styles.courseCoachCompact}>
                <CoachPortrait
                    coach={selectedCoach}
                    baseExpression={coachExpression}
                    speechText={coachMessage}
                    animationsEnabled={settings.coach.animations}
                    className={styles.courseCoachPortraitSmall}
                />
                <div><strong>{selectedCoach.name}</strong><p>{coachMessage}</p></div>
            </div>}

            <div className={styles.depthGuide}>
                <strong>{t("learn.depthTitle")}</strong>
                <p>{t("learn.depthHelp")}</p>
            </div>

            <div className={styles.lessonList}>
                {family.lines.slice(0, lessonLimit).map((opening, index) => {
                    const itemProgress = progress[createLessonId(
                        opening.eco,
                        opening.name,
                        opening.pgn
                    )];
                    return <button
                        key={createLessonId(opening.eco, opening.name, opening.pgn)}
                        type="button"
                        className={styles.lessonCard}
                        onClick={() => selectOpening(opening, itemProgress?.side)}
                    >
                        <span className={styles.lessonNumber}>{index + 1}</span>
                        <span className={styles.lessonCopy}>
                            <strong>{opening.name == family.name ? t("learn.fundamentals") : opening.name.replace(`${family.name}: `, "")}</strong>
                            <small>{opening.pgn}</small>
                        </span>
                        <span className={styles.lessonStatus}>
                            {itemProgress?.mastered
                                ? `✓ ${t("learn.mastered")}`
                                : itemProgress
                                    ? t("learn.reviewScheduled")
                                    : t("learn.study")}
                        </span>
                    </button>;
                })}
            </div>

            {lessonLimit < family.lines.length && <button
                type="button"
                className={styles.showMoreButton}
                onClick={() => setLessonLimit(limit => limit + 20)}
            >{t("learn.showMore", { remaining: family.lines.length - lessonLimit })}</button>}
        </section>;
    }

    if (!selectedOpening) return null;

    const activeFen = courseMode == "practice" ? practiceFen : courseFen;
    const boardOrientation = side;
    const currentLearnMove = learnStep > 0 ? courseMoves[learnStep - 1] : undefined;
    const explanation = explainMove(currentLearnMove);

    return <section className={styles.learnSection}>
        <button type="button" className={styles.backButton} onClick={() => setSelectedOpening(undefined)}>
            ← {selectedFamily}
        </button>

        <div className={styles.courseHeader}>
            <div>
                <span className={styles.eyebrow}>{selectedOpening.eco}</span>
                <h2>{selectedOpening.name}</h2>
                <p>{selectedOpening.pgn}</p>
            </div>
            <div className={styles.courseSidePicker}>
                <span>{t("learn.prepareAs")}</span>
                <div>
                    {(["white", "black"] as RepertoireSide[]).map(value => <button
                        key={value}
                        type="button"
                        className={side == value ? styles.sideActive : styles.sideButton}
                        onClick={() => {
                            setSide(value);
                            setPracticeIndex(0);
                            setSessionMistakes(0);
                            setSessionRecorded(false);
                            setSelectedSquare(undefined);
                        }}
                    >{t(`side.${value}`)}</button>)}
                </div>
            </div>
        </div>

        {currentProgress && <div className={styles.srsBanner}>
            <div>
                <strong>{currentProgress.mastered ? t("learn.mastered") : t("learn.srsActive")}</strong>
                <span>{t("learn.nextReview", { date: dueLabel(currentProgress) })}</span>
            </div>
            <span>{t("learn.streak", { count: currentProgress.streak })}</span>
        </div>}

        <div className={styles.courseGrid}>
            <div className={styles.courseBoardColumn}>
                <div className={styles.courseBoardWrap}>
                    <Chessboard
                        id="repertoire-course-board"
                        position={activeFen}
                        boardOrientation={boardOrientation}
                        onPieceDrop={(from, to) => playPracticeMove(from, to)}
                        onPieceDragBegin={(_piece, source) => {
                            if (courseMode == "practice") setSelectedSquare(source as Square);
                        }}
                        onPieceDragEnd={() => setSelectedSquare(undefined)}
                        onSquareClick={onPracticeSquareClick}
                        arePiecesDraggable={courseMode == "practice" && expectedMove?.color == learnerColour}
                        customPieces={customPieces}
                        customDarkSquareStyle={{ backgroundColor: settings.themes.board.darkSquareColour }}
                        customLightSquareStyle={{ backgroundColor: settings.themes.board.lightSquareColour }}
                        customSquareStyles={courseMode == "practice" ? practiceSquareStyles : {}}
                        showBoardNotation={settings.themes.board.coordinates == "inside"}
                        snapToCursor
                    />
                </div>

                {courseMode == "learn" ? <>
                    <div className={styles.courseControls}>
                        <button type="button" disabled={learnStep == 0} onClick={() => setLearnStep(step => Math.max(0, step - 1))}>← {t("editor.previous")}</button>
                        <span>{t("learn.step", { current: learnStep, total: courseMoves.length })}</span>
                        <button type="button" disabled={learnStep >= courseMoves.length} onClick={() => {
                            setLearnStep(step => Math.min(courseMoves.length, step + 1));
                            setCoachExpression("explaining");
                            setCoachMessageKey("learn.coach.move");
                        }}>{t("editor.next")} →</button>
                    </div>
                    <button type="button" className={styles.primaryButton} onClick={startPractice} disabled={courseMoves.length == 0}>
                        {currentProgress ? t("learn.practiceAgain") : t("learn.practice")}
                    </button>
                </> : <div className={styles.practiceControls}>
                    <div>
                        <strong>{practiceIndex >= courseMoves.length ? t("learn.practiceComplete") : t("learn.practiceProgress", { current: practiceIndex, total: courseMoves.length })}</strong>
                        <span>{showHint && expectedMove ? t("learn.hintMove", { move: expectedMove.san }) : t("learn.practiceInstruction")}</span>
                    </div>
                    <button type="button" className={styles.secondaryButton} onClick={requestHint} disabled={!expectedMove || expectedMove.color != learnerColour}>{t("learn.hint")}</button>
                    <button type="button" className={styles.secondaryButton} onClick={returnToLearn}>{t("learn.reviewLine")}</button>
                </div>}
            </div>

            <aside className={styles.coursePanel}>
                {coachEnabled && <div className={styles.courseCoach}>
                    <CoachPortrait
                        coach={selectedCoach}
                        baseExpression={coachExpression}
                        speechText={coachMessage}
                        animationsEnabled={settings.coach.animations}
                        className={styles.courseCoachPortrait}
                    />
                    <div className={styles.coachBubble}>
                        <strong>{selectedCoach.name}</strong>
                        <p>{coachMessage}</p>
                    </div>
                </div>}

                {courseMode == "learn" && <div className={styles.whyCard}>
                    <span>{t("learn.whyTitle")}</span>
                    <strong>{currentLearnMove?.san || t("editor.startPosition")}</strong>
                    <p>{explanation}</p>
                </div>}

                <div className={styles.courseMoveList}>
                    <strong>{t("learn.referenceLine")}</strong>
                    <div>
                        {courseMoves.map((move, index) => <button
                            type="button"
                            key={`${move.san}-${index}`}
                            className={courseMode == "learn" && learnStep == index + 1 ? styles.courseMoveActive : styles.courseMove}
                            onClick={() => courseMode == "learn" && setLearnStep(index + 1)}
                        >
                            <span>{index % 2 == 0 ? `${Math.floor(index / 2) + 1}.` : "…"}</span>
                            {move.san}
                        </button>)}
                    </div>
                    {courseMode == "learn" && <p>{currentLearnMove ? t("learn.currentMove", { move: currentLearnMove.san }) : t("learn.startPosition")}</p>}
                </div>

                <div className={styles.courseAddBox}>
                    <strong>{t("learn.keepIt")}</strong>
                    <p>{t("learn.keepItHelp")}</p>
                    <button type="button" className={styles.primaryButton} onClick={() => onAddToRepertoire(selectedOpening, side)}>
                        {t("learn.addToRepertoire")}
                    </button>
                </div>
            </aside>
        </div>
    </section>;
}

export default OpeningLearningPanel;
