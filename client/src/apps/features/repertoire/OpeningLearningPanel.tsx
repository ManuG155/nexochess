import React, { useEffect, useMemo, useState } from "react";
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
import * as styles from "./index.module.css";

type RepertoireSide = "white" | "black";
type CourseMode = "learn" | "practice";

interface OpeningLearningPanelProps {
    onAddToRepertoire: (
        opening: OpeningCatalogueEntry,
        side: RepertoireSide
    ) => void;
}

interface OpeningFamily {
    name: string;
    lines: OpeningCatalogueEntry[];
}

const COURSE_PROGRESS_KEY = "nexochess.repertoire.course-progress.v1";

function readCompletedLessons() {
    try {
        const value = JSON.parse(
            localStorage.getItem(COURSE_PROGRESS_KEY) || "[]"
        );
        return new Set<string>(Array.isArray(value) ? value : []);
    } catch {
        return new Set<string>();
    }
}

function lessonId(opening: OpeningCatalogueEntry) {
    return `${opening.eco}|${opening.name}|${opening.pgn}`;
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

function OpeningLearningPanel({
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
    const [coachExpression, setCoachExpression] =
        useState<CoachExpression>("explaining");
    const [coachMessageKey, setCoachMessageKey] =
        useState("learn.coach.welcome");
    const [completedLessons, setCompletedLessons] =
        useState<Set<string>>(() => readCompletedLessons());

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
        localStorage.setItem(
            COURSE_PROGRESS_KEY,
            JSON.stringify(Array.from(completedLessons))
        );
    }, [completedLessons]);

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
        return source.slice(0, normalisedQuery ? 80 : 24);
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
    const lessonComplete = Boolean(
        selectedOpening
        && completedLessons.has(lessonId(selectedOpening))
    );

    const completedInFamily = family?.lines.filter(line => (
        completedLessons.has(lessonId(line))
    )).length || 0;

    useEffect(() => {
        if (
            courseMode != "practice"
            || !selectedOpening
            || practiceIndex >= courseMoves.length
            || expectedMove?.color == learnerColour
        ) return;

        setCoachExpression("explaining");
        setCoachMessageKey("learn.coach.opponent");
        const timer = window.setTimeout(() => {
            setPracticeIndex(index => Math.min(index + 1, courseMoves.length));
            setSelectedSquare(undefined);
            setShowHint(false);
        }, 560);
        return () => window.clearTimeout(timer);
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
        ) return;

        setCompletedLessons(previous => new Set(previous).add(
            lessonId(selectedOpening)
        ));
        setCoachExpression("celebrating");
        setCoachMessageKey("learn.coach.completed");
    }, [courseMode, courseMoves.length, practiceIndex, selectedOpening]);

    function selectFamily(name: string) {
        setSelectedFamily(name);
        setSelectedOpening(undefined);
        setQuery("");
        setCourseMode("learn");
        setCoachExpression("explaining");
        setCoachMessageKey("learn.coach.family");
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    function selectOpening(opening: OpeningCatalogueEntry) {
        setSelectedOpening(opening);
        setSide(inferSide(opening));
        setCourseMode("learn");
        setLearnStep(0);
        setPracticeIndex(0);
        setSelectedSquare(undefined);
        setShowHint(false);
        setCoachExpression("explaining");
        setCoachMessageKey("learn.coach.lineStart");
    }

    function startPractice() {
        setCourseMode("practice");
        setPracticeIndex(0);
        setSelectedSquare(undefined);
        setShowHint(false);
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
                        <li>{t("learn.methodAdd")}</li>
                    </ol>
                </div>
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
                        completedLessons.has(lessonId(line))
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
            <button type="button" className={styles.backLibrary} onClick={() => setSelectedFamily(undefined)}>
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
                    className={styles.courseCoachPortraitSmall}
                />
                <div><strong>{selectedCoach.name}</strong><p>{coachMessage}</p></div>
            </div>}

            <div className={styles.lessonList}>
                {family.lines.map((opening, index) => <button
                    key={lessonId(opening)}
                    type="button"
                    className={styles.lessonCard}
                    onClick={() => selectOpening(opening)}
                >
                    <span className={styles.lessonNumber}>{index + 1}</span>
                    <span className={styles.lessonCopy}>
                        <strong>{opening.name == family.name ? t("learn.fundamentals") : opening.name.replace(`${family.name}: `, "")}</strong>
                        <small>{opening.pgn}</small>
                    </span>
                    <span className={styles.lessonStatus}>
                        {completedLessons.has(lessonId(opening)) ? `✓ ${t("learn.learned")}` : t("learn.study")}
                    </span>
                </button>)}
            </div>
        </section>;
    }

    if (!selectedOpening) return null;

    const activeFen = courseMode == "practice" ? practiceFen : courseFen;
    const boardOrientation = side;
    const currentLearnMove = learnStep > 0 ? courseMoves[learnStep - 1] : undefined;

    return <section className={styles.learnSection}>
        <button type="button" className={styles.backLibrary} onClick={() => setSelectedOpening(undefined)}>
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
                        className={side == value ? styles.filterActive : styles.filterButton}
                        onClick={() => {
                            setSide(value);
                            setPracticeIndex(0);
                            setSelectedSquare(undefined);
                        }}
                    >{t(`side.${value}`)}</button>)}
                </div>
            </div>
        </div>

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
                        {lessonComplete ? t("learn.practiceAgain") : t("learn.practice")}
                    </button>
                </> : <div className={styles.practiceControls}>
                    <div>
                        <strong>{practiceIndex >= courseMoves.length ? t("learn.practiceComplete") : t("learn.practiceProgress", { current: practiceIndex, total: courseMoves.length })}</strong>
                        <span>{showHint && expectedMove ? t("learn.hintMove", { move: expectedMove.san }) : t("learn.practiceInstruction")}</span>
                    </div>
                    <button type="button" className={styles.secondaryButton} onClick={() => {
                        setShowHint(true);
                        setCoachExpression("explaining");
                        setCoachMessageKey("learn.coach.hint");
                    }} disabled={!expectedMove || expectedMove.color != learnerColour}>{t("learn.hint")}</button>
                    <button type="button" className={styles.secondaryButton} onClick={returnToLearn}>{t("learn.review")}</button>
                </div>}
            </div>

            <aside className={styles.coursePanel}>
                {coachEnabled && <div className={styles.courseCoach}>
                    <CoachPortrait
                        coach={selectedCoach}
                        baseExpression={coachExpression}
                        speechText={coachMessage}
                        className={styles.courseCoachPortrait}
                    />
                    <div className={styles.coachBubble}>
                        <strong>{selectedCoach.name}</strong>
                        <p>{coachMessage}</p>
                    </div>
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
