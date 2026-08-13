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

import PlayerOpeningProfile from "./PlayerOpeningProfile";
import {
    OpeningCatalogueEntry,
    OpeningCategory,
    buildCourseLessons,
    featuredFamiliesForCategory,
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
import * as focus from "./courseFocus.module.css";

type RepertoireSide = "white" | "black";
type CourseMode = "learn" | "practice" | "complete";
type PanelMode = "learn" | "review";

interface OpeningLearningPanelProps {
    mode?: PanelMode;
    onAddToRepertoire: (
        opening: OpeningCatalogueEntry,
        side: RepertoireSide
    ) => void;
    onFocusChange?: (focused: boolean) => void;
}

interface OpeningFamily {
    name: string;
    lines: OpeningCatalogueEntry[];
}

const CATEGORY_ORDER: OpeningCategory[] = [
    "e4",
    "d4",
    "vsE4",
    "vsD4",
    "flank"
];

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

function OpeningLearningV2({
    mode = "learn",
    onAddToRepertoire,
    onFocusChange
}: OpeningLearningPanelProps) {
    const { t } = useTranslation("repertoire");
    const { t: tCourse } = useTranslation("repertoireCourse");
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
    const [category, setCategory] = useState<OpeningCategory>("e4");
    const [selectedFamily, setSelectedFamily] = useState<string>();
    const [preferredFamilySide, setPreferredFamilySide] =
        useState<RepertoireSide>();
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
    const [completedRuns, setCompletedRuns] = useState(0);
    const [requiredRuns, setRequiredRuns] = useState(2);
    const [lessonLimit, setLessonLimit] = useState(10);
    const [coachExpression, setCoachExpression] =
        useState<CoachExpression>("explaining");
    const [coachMessageKey, setCoachMessageKey] =
        useState("learn.coach.welcome");
    const [progress, setProgress] = useState<CourseProgressStore>(
        () => readCourseProgress()
    );

    const opponentTimerRef = useRef<number>();
    const repeatTimerRef = useRef<number>();
    const runHandledRef = useRef(false);

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
        onFocusChange?.(Boolean(selectedOpening));
        return () => {
            if (selectedOpening) onFocusChange?.(false);
        };
    }, [onFocusChange, selectedOpening]);

    useEffect(() => {
        setSelectedOpening(undefined);
        setSelectedFamily(undefined);
        setPreferredFamilySide(undefined);
        setCourseMode("learn");
        setPracticeIndex(0);
        setLearnStep(0);
        setSelectedSquare(undefined);
        setShowHint(false);
        setSessionMistakes(0);
        setSessionRecorded(false);
        setCompletedRuns(0);
        setRequiredRuns(2);
        runHandledRef.current = false;
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
        if (normalisedQuery) {
            return families.filter(family => (
                family.name.toLocaleLowerCase().includes(normalisedQuery)
                || family.lines.some(line => (
                    line.name.toLocaleLowerCase().includes(normalisedQuery)
                    || line.eco.toLocaleLowerCase().includes(normalisedQuery)
                ))
            )).slice(0, 100);
        }

        const featured = featuredFamiliesForCategory(category);
        return featured
            .map(name => families.find(family => family.name == name))
            .filter((family): family is OpeningFamily => Boolean(family));
    }, [category, families, normalisedQuery]);

    const family = selectedFamily
        ? families.find(item => item.name == selectedFamily)
        : undefined;
    const courseLines = useMemo(
        () => buildCourseLessons(family?.lines || []),
        [family]
    );
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

    const completedInFamily = courseLines.filter(line => (
        Boolean(progress[createLessonId(line.eco, line.name, line.pgn)])
    )).length;
    const recommendedIndex = Math.max(0, courseLines.findIndex(line => (
        !progress[createLessonId(line.eco, line.name, line.pgn)]
    )));
    const selectedIndex = selectedOpening
        ? courseLines.findIndex(line => (
            createLessonId(line.eco, line.name, line.pgn) == currentLessonId
        ))
        : -1;
    const nextOpening = selectedIndex >= 0
        ? courseLines[selectedIndex + 1]
        : undefined;

    useEffect(() => {
        if (opponentTimerRef.current != undefined) {
            window.clearTimeout(opponentTimerRef.current);
            opponentTimerRef.current = undefined;
        }

        if (
            courseMode != "practice"
            || !selectedOpening
            || practiceIndex >= courseMoves.length
            || expectedMove?.color == learnerColour
        ) return undefined;

        setCoachExpression("explaining");
        setCoachMessageKey("learn.coach.opponent");
        opponentTimerRef.current = window.setTimeout(() => {
            setPracticeIndex(index => Math.min(index + 1, courseMoves.length));
            setSelectedSquare(undefined);
            setShowHint(false);
        }, 430);

        return () => {
            if (opponentTimerRef.current != undefined) {
                window.clearTimeout(opponentTimerRef.current);
                opponentTimerRef.current = undefined;
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
            || runHandledRef.current
        ) return;

        runHandledRef.current = true;
        const nextCompletedRuns = completedRuns + 1;
        setCompletedRuns(nextCompletedRuns);

        if (nextCompletedRuns >= requiredRuns) {
            const alreadyLearned = Boolean(currentProgress);
            setProgress(previous => recordLessonReview(previous, {
                id: currentLessonId,
                openingName: selectedOpening.name,
                family: selectedOpening.family,
                eco: selectedOpening.eco,
                pgn: selectedOpening.pgn,
                side
            }, sessionMistakes));
            if (!alreadyLearned) onAddToRepertoire(selectedOpening, side);
            setSessionRecorded(true);
            setCourseMode("complete");
            setCoachExpression("celebrating");
            setCoachMessageKey("learn.coach.completed");
            return;
        }

        setCoachExpression("approving");
        setCoachMessageKey("course:practice.againCoach");
        repeatTimerRef.current = window.setTimeout(() => {
            runHandledRef.current = false;
            setPracticeIndex(0);
            setSelectedSquare(undefined);
            setShowHint(false);
            setCoachExpression("thinking");
            setCoachMessageKey("learn.coach.practiceStart");
        }, 700);

        return () => {
            if (repeatTimerRef.current != undefined) {
                window.clearTimeout(repeatTimerRef.current);
                repeatTimerRef.current = undefined;
            }
        };
    }, [
        completedRuns,
        courseMode,
        courseMoves.length,
        currentLessonId,
        currentProgress,
        onAddToRepertoire,
        practiceIndex,
        requiredRuns,
        selectedOpening,
        sessionMistakes,
        sessionRecorded,
        side
    ]);

    function selectFamily(name: string, preferredSide?: RepertoireSide) {
        setSelectedFamily(name);
        setPreferredFamilySide(preferredSide);
        setSelectedOpening(undefined);
        setQuery("");
        setCourseMode("learn");
        setLessonLimit(10);
        setCoachExpression("explaining");
        setCoachMessageKey("learn.coach.family");
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    function selectOpening(
        opening: OpeningCatalogueEntry,
        preferredSide?: RepertoireSide,
        startInPractice = false
    ) {
        const lessonId = createLessonId(opening.eco, opening.name, opening.pgn);
        const existing = progress[lessonId];
        setSelectedFamily(opening.family);
        setSelectedOpening(opening);
        setSide(preferredSide || existing?.side || inferSide(opening));
        setCourseMode(startInPractice ? "practice" : "learn");
        setLearnStep(0);
        setPracticeIndex(0);
        setSelectedSquare(undefined);
        setShowHint(false);
        setSessionMistakes(0);
        setSessionRecorded(false);
        setCompletedRuns(0);
        setRequiredRuns(existing ? 1 : 2);
        runHandledRef.current = false;
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
        setCompletedRuns(0);
        setRequiredRuns(currentProgress ? 1 : 2);
        runHandledRef.current = false;
        setCoachExpression("thinking");
        setCoachMessageKey("learn.coach.practiceStart");
    }

    function returnToLearn() {
        setCourseMode("learn");
        setLearnStep(0);
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

        setPracticeIndex(index => Math.min(index + 1, courseMoves.length));
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

    const coachTemplate = coachMessageKey.startsWith("course:")
        ? tCourse(coachMessageKey.slice("course:".length), {
            opening: selectedOpening?.name || selectedFamily || "",
            move: expectedMove?.san || ""
        })
        : t(coachMessageKey, {
            opening: selectedOpening?.name || selectedFamily || "",
            move: expectedMove?.san || ""
        });
    const coachMessage = getCoachSpokenLine(
        selectedCoach,
        coachTemplate,
        `${coachMessageKey}|${selectedOpening?.name || selectedFamily || "catalogue"}|${practiceIndex}|${learnStep}|${completedRuns}`,
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
                        <li>{tCourse("practice.autoRule")}</li>
                    </ol>
                </div>
            </div>

            <div className={styles.learningStats}>
                <div><strong>{learnedCount}</strong><span>{t("review.learned")}</span></div>
                <div><strong>{dueLessons.length}</strong><span>{t("review.due")}</span></div>
                <div><strong>{masteredCount}</strong><span>{t("review.mastered")}</span></div>
            </div>

            <PlayerOpeningProfile
                catalogue={catalogue}
                onTrainFamily={(familyName, familySide) => {
                    selectFamily(familyName, familySide);
                }}
            />

            <label className={styles.openingSearch}>
                <span>{t("learn.searchLabel")}</span>
                <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder={t("learn.searchPlaceholder")}
                />
                <small>{loading
                    ? t("learn.loading")
                    : t("learn.catalogueReady", { count: catalogue.length })}</small>
            </label>

            {!normalisedQuery && <div
                className={focus.categoryTabs}
                role="group"
                aria-label={tCourse("categories.label")}
            >
                {CATEGORY_ORDER.map(item => <button
                    key={item}
                    type="button"
                    className={category == item
                        ? focus.categoryActive
                        : focus.categoryButton}
                    onClick={() => setCategory(item)}
                >{tCourse(`categories.${item}`)}</button>)}
            </div>}

            <div className={styles.familyGrid}>
                {visibleFamilies.map(item => {
                    const moduleLines = buildCourseLessons(item.lines);
                    const completed = moduleLines.filter(line => (
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
                        <small>{t("learn.lessons", { count: moduleLines.length })}</small>
                        {completed > 0 && <em>{t("learn.progress", {
                            completed,
                            total: moduleLines.length
                        })}</em>}
                    </button>;
                })}
            </div>
        </section>;
    }

    if (!selectedOpening && family) {
        const progressPercent = courseLines.length > 0
            ? Math.round((completedInFamily / courseLines.length) * 100)
            : 0;

        return <section className={styles.learnSection}>
            <button
                type="button"
                className={styles.backButton}
                onClick={() => {
                    setSelectedFamily(undefined);
                    setPreferredFamilySide(undefined);
                }}
            >← {t("learn.allOpenings")}</button>
            <div className={styles.familyHeader}>
                <div>
                    <span className={styles.eyebrow}>{family.lines[0]?.eco}</span>
                    <h2>{family.name}</h2>
                    <p>{tCourse("path.intro")}</p>
                </div>
                <div className={styles.familyProgress}>
                    <strong>{completedInFamily}/{courseLines.length}</strong>
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

            <div className={focus.modulePath}>
                <div className={focus.modulePathHeader}>
                    <strong>{tCourse("path.title")}</strong>
                    <span>{tCourse("path.progress", {
                        completed: completedInFamily,
                        total: courseLines.length
                    })}</span>
                </div>
                <div className={focus.moduleProgressTrack}>
                    <div
                        className={focus.moduleProgressFill}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className={focus.lessonPath}>
                    {courseLines.slice(0, lessonLimit).map((opening, index) => {
                        const itemProgress = progress[createLessonId(
                            opening.eco,
                            opening.name,
                            opening.pgn
                        )];
                        const recommended = index == recommendedIndex;
                        return <button
                            key={createLessonId(opening.eco, opening.name, opening.pgn)}
                            type="button"
                            className={recommended
                                ? focus.lessonNodeRecommended
                                : focus.lessonNode}
                            onClick={() => selectOpening(
                                opening,
                                itemProgress?.side || preferredFamilySide
                            )}
                        >
                            <span className={focus.lessonBadge}>
                                {itemProgress ? "✓" : index + 1}
                            </span>
                            <span className={focus.lessonCopy}>
                                <strong>{opening.name == family.name
                                    ? t("learn.fundamentals")
                                    : opening.name.replace(`${family.name}: `, "")}</strong>
                                <small>{opening.pgn}</small>
                            </span>
                            <span className={focus.lessonStatus}>
                                {itemProgress?.mastered
                                    ? t("learn.mastered")
                                    : itemProgress
                                        ? t("learn.reviewScheduled")
                                        : recommended
                                            ? tCourse("path.recommended")
                                            : t("learn.study")}
                            </span>
                        </button>;
                    })}
                </div>
            </div>

            {lessonLimit < courseLines.length && <button
                type="button"
                className={styles.showMoreButton}
                onClick={() => setLessonLimit(limit => limit + 10)}
            >{t("learn.showMore", { remaining: courseLines.length - lessonLimit })}</button>}
        </section>;
    }

    if (!selectedOpening) return null;

    const activeFen = courseMode == "learn"
        ? courseFen
        : getFenAtStep(courseMoves, courseMode == "complete"
            ? courseMoves.length
            : practiceIndex);
    const currentLearnMove = learnStep > 0 ? courseMoves[learnStep - 1] : undefined;
    const explanation = explainMove(currentLearnMove);
    const repetitionCurrent = Math.min(completedRuns + 1, requiredRuns);
    const phaseLabel = courseMode == "learn"
        ? tCourse("practice.studyPhase")
        : courseMode == "practice"
            ? tCourse("practice.practicePhase")
            : tCourse("practice.completePhase");

    return <section className={focus.focusSection}>
        <div className={focus.topBar}>
            <button
                type="button"
                className={focus.backButton}
                onClick={() => setSelectedOpening(undefined)}
                aria-label={tCourse("practice.backModule")}
            >←</button>
            <div className={focus.titleBlock}>
                <span>{selectedOpening.eco} · {selectedOpening.family}</span>
                <strong>{selectedOpening.name}</strong>
                <small>{selectedOpening.pgn}</small>
            </div>
            <div className={focus.topActions}>
                <div className={focus.sidePicker}>
                    {(["white", "black"] as RepertoireSide[]).map(value => <button
                        key={value}
                        type="button"
                        className={side == value ? focus.sideActive : focus.sideButton}
                        onClick={() => {
                            setSide(value);
                            setPracticeIndex(0);
                            setCompletedRuns(0);
                            setSessionMistakes(0);
                            setSessionRecorded(false);
                            setRequiredRuns(currentProgress ? 1 : 2);
                            setSelectedSquare(undefined);
                            runHandledRef.current = false;
                        }}
                    >{t(`side.${value}`)}</button>)}
                </div>
                <div className={focus.progressChip}>
                    <strong>{phaseLabel}</strong>
                    <span>{selectedIndex + 1}/{courseLines.length}</span>
                </div>
            </div>
        </div>

        <div className={focus.grid}>
            <div className={focus.boardColumn}>
                <div className={focus.boardWrap}>
                    <Chessboard
                        id="repertoire-course-board-v2"
                        position={activeFen}
                        boardOrientation={side}
                        onPieceDrop={(from, to) => playPracticeMove(from, to)}
                        onPieceDragBegin={(_piece, source) => {
                            if (courseMode == "practice") {
                                setSelectedSquare(source as Square);
                            }
                        }}
                        onPieceDragEnd={() => setSelectedSquare(undefined)}
                        onSquareClick={onPracticeSquareClick}
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
                        customSquareStyles={
                            courseMode == "practice" ? practiceSquareStyles : {}
                        }
                        showBoardNotation={settings.themes.board.coordinates == "inside"}
                        snapToCursor
                    />
                </div>

                {courseMode == "learn" && <div className={focus.controlBar}>
                    <button
                        type="button"
                        disabled={learnStep == 0}
                        onClick={() => setLearnStep(step => Math.max(0, step - 1))}
                    >← {t("editor.previous")}</button>
                    <div className={focus.controlStatus}>
                        <strong>{t("learn.step", {
                            current: learnStep,
                            total: courseMoves.length
                        })}</strong>
                        <span>{tCourse("practice.studyHint")}</span>
                    </div>
                    {learnStep < courseMoves.length ? <button
                        type="button"
                        onClick={() => {
                            setLearnStep(step => Math.min(courseMoves.length, step + 1));
                            setCoachExpression("explaining");
                            setCoachMessageKey("learn.coach.move");
                        }}
                    >{t("editor.next")} →</button> : <button
                        type="button"
                        className={focus.primaryButton}
                        onClick={startPractice}
                    >{tCourse("practice.start")}</button>}
                </div>}

                {courseMode == "practice" && <div className={focus.controlBar}>
                    <button
                        type="button"
                        className={focus.secondaryButton}
                        onClick={requestHint}
                        disabled={!expectedMove || expectedMove.color != learnerColour}
                    >{t("learn.hint")}</button>
                    <div className={focus.controlStatus}>
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

                {courseMode == "complete" && <div className={focus.controlBar}>
                    <button
                        type="button"
                        className={focus.secondaryButton}
                        onClick={() => setSelectedOpening(undefined)}
                    >{tCourse("practice.backModule")}</button>
                    <div className={focus.controlStatus}>
                        <strong>{tCourse("practice.completeTitle")}</strong>
                        <span>{tCourse("practice.autoSaved")}</span>
                    </div>
                    {nextOpening ? <button
                        type="button"
                        className={focus.primaryButton}
                        onClick={() => selectOpening(nextOpening, side)}
                    >{tCourse("practice.nextLine")} →</button> : <button
                        type="button"
                        className={focus.primaryButton}
                        onClick={() => setSelectedOpening(undefined)}
                    >{tCourse("practice.moduleDone")}</button>}
                </div>}
            </div>

            <aside className={focus.panel}>
                {coachEnabled && <div className={focus.coachCard}>
                    <CoachPortrait
                        coach={selectedCoach}
                        baseExpression={coachExpression}
                        speechText={coachMessage}
                        animationsEnabled={settings.coach.animations}
                        className={focus.coachPortrait}
                    />
                    <div className={focus.coachBubble}>
                        <strong>{selectedCoach.name}</strong>
                        <p>{coachMessage}</p>
                    </div>
                </div>}

                {courseMode == "learn" && <div className={focus.panelCard}>
                    <span>{t("learn.whyTitle")}</span>
                    <strong>{currentLearnMove?.san || t("editor.startPosition")}</strong>
                    <p>{explanation}</p>
                </div>}

                {courseMode == "practice" && <div className={focus.repetitionCard}>
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

                {courseMode == "complete" && <div className={focus.completionCard}>
                    <span>{tCourse("practice.lessonComplete")}</span>
                    <strong>{tCourse("practice.completeTitle")}</strong>
                    <p>{tCourse("practice.completeBody")}</p>
                    <div className={focus.autoSaved}>
                        <span>✓</span>
                        <span>{tCourse("practice.autoSaved")}</span>
                    </div>
                    <div className={focus.completionActions}>
                        <button
                            type="button"
                            className={focus.secondaryButton}
                            onClick={() => setSelectedOpening(undefined)}
                        >{tCourse("practice.backModule")}</button>
                        {nextOpening && <button
                            type="button"
                            className={focus.primaryButton}
                            onClick={() => selectOpening(nextOpening, side)}
                        >{tCourse("practice.nextLine")}</button>}
                    </div>
                </div>}

                {currentProgress && <div className={focus.panelCard}>
                    <span>{t("learn.srsActive")}</span>
                    <strong>{currentProgress.mastered
                        ? t("learn.mastered")
                        : t("learn.nextReview", {
                            date: dueLabel(currentProgress)
                        })}</strong>
                    <p>{tCourse("practice.srsExplainer")}</p>
                </div>}

                <div className={focus.panelCard}>
                    <span>{t("learn.referenceLine")}</span>
                    <div className={focus.moveList}>
                        {courseMoves.map((move, index) => <button
                            type="button"
                            key={`${move.san}-${index}`}
                            className={
                                courseMode == "learn" && learnStep == index + 1
                                    ? focus.moveActive
                                    : focus.move
                            }
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

export default OpeningLearningV2;
