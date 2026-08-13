import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import useSettingsStore from "@/stores/SettingsStore";
import CoachPortrait from "@analysis/components/AnalysisPanel/CoachPortrait";
import { getCoachById, getCoachSpokenLine } from "@analysis/lib/coach";

import PlayerOpeningProfile from "./PlayerOpeningProfile";
import OpeningCourseFocus, { RepertoireSide } from "./OpeningCourseFocus";
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
    writeCourseProgress
} from "./courseProgress";
import * as styles from "./learning.module.css";
import * as focus from "./courseFocus.module.css";

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

interface LessonSelection {
    opening: OpeningCatalogueEntry;
    side: RepertoireSide;
    startInPractice: boolean;
}

const CATEGORY_ORDER: OpeningCategory[] = ["e4", "d4", "vsE4", "vsD4", "flank"];

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

export default function OpeningLearningV3({
    mode = "learn",
    onAddToRepertoire,
    onFocusChange
}: OpeningLearningPanelProps) {
    const { t } = useTranslation("repertoire");
    const { t: tCourse } = useTranslation("repertoireCourse");
    const { t: tCoach } = useTranslation("coach", { useSuspense: false });
    const settings = useSettingsStore(state => state.settings);
    const selectedCoach = getCoachById(settings.appearance.selectedCoach);

    const [catalogue, setCatalogue] = useState<OpeningCatalogueEntry[]>(
        getFallbackOpeningCatalogue()
    );
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<OpeningCategory>("e4");
    const [selectedFamily, setSelectedFamily] = useState<string>();
    const [preferredFamilySide, setPreferredFamilySide] = useState<RepertoireSide>();
    const [selection, setSelection] = useState<LessonSelection>();
    const [lessonLimit, setLessonLimit] = useState(10);
    const [progress, setProgress] = useState<CourseProgressStore>(
        () => readCourseProgress()
    );

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

    useEffect(() => writeCourseProgress(progress), [progress]);

    useEffect(() => {
        onFocusChange?.(Boolean(selection));
        return () => {
            if (selection) onFocusChange?.(false);
        };
    }, [onFocusChange, selection]);

    useEffect(() => {
        setSelection(undefined);
        setSelectedFamily(undefined);
        setPreferredFamilySide(undefined);
        setQuery("");
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
        return featuredFamiliesForCategory(category)
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
    const dueLessons = useMemo(() => getDueLessons(progress), [progress]);
    const learnedCount = useMemo(() => getLearnedCount(progress), [progress]);
    const masteredCount = useMemo(() => getMasteredCount(progress), [progress]);
    const completedInFamily = courseLines.filter(line => (
        Boolean(progress[createLessonId(line.eco, line.name, line.pgn)])
    )).length;
    const recommendedIndex = courseLines.findIndex(line => (
        !progress[createLessonId(line.eco, line.name, line.pgn)]
    ));

    function selectFamily(name: string, preferredSide?: RepertoireSide) {
        setSelectedFamily(name);
        setPreferredFamilySide(preferredSide);
        setSelection(undefined);
        setQuery("");
        setLessonLimit(10);
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
        setSelection({
            opening,
            side: preferredSide || existing?.side || inferSide(opening),
            startInPractice
        });
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    if (selection) {
        return <OpeningCourseFocus
            key={`${createLessonId(
                selection.opening.eco,
                selection.opening.name,
                selection.opening.pgn
            )}|${selection.side}|${selection.startInPractice ? "practice" : "learn"}`}
            opening={selection.opening}
            courseLines={courseLines}
            initialSide={selection.side}
            startInPractice={selection.startInPractice}
            progress={progress}
            setProgress={setProgress}
            onAddToRepertoire={onAddToRepertoire}
            onBack={() => setSelection(undefined)}
            onNext={(opening, side) => selectOpening(opening, side)}
        />;
    }

    if (mode == "review") {
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
                onTrainFamily={(familyName, familySide) => selectFamily(familyName, familySide)}
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
                    className={category == item ? focus.categoryActive : focus.categoryButton}
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

    if (!family) return null;
    const progressPercent = courseLines.length > 0
        ? Math.round((completedInFamily / courseLines.length) * 100)
        : 0;
    const coachTemplate = t("learn.coach.family", { opening: family.name });
    const coachMessage = getCoachSpokenLine(
        selectedCoach,
        coachTemplate,
        `repertoire-family|${family.name}`,
        tCoach
    );

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

        {settings.coach.enabled && <div className={styles.courseCoachCompact}>
            <CoachPortrait
                coach={selectedCoach}
                baseExpression="explaining"
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
                <div className={focus.moduleProgressFill} style={{ width: `${progressPercent}%` }}/>
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
                        className={recommended ? focus.lessonNodeRecommended : focus.lessonNode}
                        onClick={() => selectOpening(
                            opening,
                            itemProgress?.side || preferredFamilySide
                        )}
                    >
                        <span className={focus.lessonBadge}>{itemProgress ? "✓" : index + 1}</span>
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
