import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { OpeningCatalogueEntry } from "./openingCatalogue";
import { localizeOpeningName } from "./openingLocalization";
import { CourseProgressStore, createLessonId } from "./courseProgress";
import { RepertoireSide } from "./courseV3Model";
import * as styles from "./courseV3.module.css";

interface Props {
    name: string;
    lines: OpeningCatalogueEntry[];
    progress: CourseProgressStore;
    preferredSide?: RepertoireSide;
    onBack: () => void;
    onOpen: (opening: OpeningCatalogueEntry, side?: RepertoireSide, startPractice?: boolean, blindPractice?: boolean) => void;
    onReviewFamily: (lines: OpeningCatalogueEntry[]) => void;
}

function CourseFamilyV3({ name, lines, progress, preferredSide, onBack, onOpen, onReviewFamily }: Props) {
    const { t, i18n } = useTranslation("repertoire");
    const { t: tc } = useTranslation("repertoireCourse");
    const [limit, setLimit] = useState(10);
    const language = i18n.resolvedLanguage || i18n.language || "en";
    const learnedLines = lines.filter(item => progress[createLessonId(item.eco, item.name, item.pgn)]);
    const completed = learnedLines.length;
    const firstUnlearned = lines.findIndex(item => !progress[createLessonId(item.eco, item.name, item.pgn)]);
    const recommended = firstUnlearned < 0 ? -1 : firstUnlearned;
    const percent = lines.length ? Math.round(completed / lines.length * 100) : 0;
    const localizedFamily = localizeOpeningName(name, language);

    function studyNext() {
        const item = firstUnlearned >= 0 ? lines[firstUnlearned] : lines[0];
        if (item) onOpen(item, preferredSide);
    }

    return <section className={styles.browserShell}>
        <button className={styles.backToOpenings} onClick={onBack}>← {t("learn.allOpenings")}</button>
        <div className={styles.familyHero}>
            <div><span>{lines.find(item => item.eco != "USR")?.eco || lines[0]?.eco}</span><h2>{localizedFamily}</h2><p>{tc("path.intro")}</p></div>
            <div className={styles.familyHeroActions}>
                <div><strong>{completed}/{lines.length}</strong><span>{t("learn.linesLearned")}</span></div>
                <button type="button" onClick={studyNext} disabled={!lines.length}>{t("learn.study")}</button>
                <button type="button" onClick={() => onReviewFamily(learnedLines)} disabled={!learnedLines.length}>{t("modes.review")}</button>
            </div>
        </div>
        <div className={styles.pathCard}>
            <div className={styles.pathHead}><strong>{tc("path.title")}</strong><span>{percent}%</span></div>
            <div className={styles.pathTrack}><i style={{ width: `${percent}%` }}/></div>
            <div className={styles.lessonList} data-repertoire-tour="lesson-list">{lines.slice(0, limit).map((item, index) => {
                const learned = progress[createLessonId(item.eco, item.name, item.pgn)];
                const display = item.eco == "USR"
                    ? item.name
                    : item.name == name
                        ? t("learn.fundamentals")
                        : localizeOpeningName(item.name, language);
                return <button key={createLessonId(item.eco, item.name, item.pgn)} data-recommended={index == recommended} onClick={() => onOpen(item, learned?.side || preferredSide, Boolean(learned), Boolean(learned))}>
                    <b>{learned ? "✓" : index + 1}</b>
                    <div><strong>{display}</strong><small>{item.pgn}</small></div>
                    <span>{learned ? t("modes.review") : index == recommended ? tc("path.recommended") : t("learn.study")}</span>
                </button>;
            })}</div>
        </div>
        {limit < lines.length && <button className={styles.showMore} onClick={() => setLimit(value => value + 10)}>{t("learn.showMore", { remaining: lines.length - limit })}</button>}
    </section>;
}

export default CourseFamilyV3;
