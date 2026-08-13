import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { OpeningCatalogueEntry } from "./openingCatalogue";
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
    const { t } = useTranslation("repertoire");
    const { t: tc } = useTranslation("repertoireCourse");
    const [limit, setLimit] = useState(10);
    const learnedLines = lines.filter(item => progress[createLessonId(item.eco, item.name, item.pgn)]);
    const completed = learnedLines.length;
    const firstUnlearned = lines.findIndex(item => !progress[createLessonId(item.eco, item.name, item.pgn)]);
    const recommended = firstUnlearned < 0 ? -1 : firstUnlearned;
    const percent = lines.length ? Math.round(completed / lines.length * 100) : 0;

    function studyNext() {
        const item = firstUnlearned >= 0 ? lines[firstUnlearned] : lines[0];
        if (item) onOpen(item, preferredSide);
    }

    return <section className={styles.browserShell}>
        <button className={styles.backToOpenings} onClick={onBack}>← {t("learn.allOpenings")}</button>
        <div className={styles.familyHero}>
            <div><span>{lines[0]?.eco}</span><h2>{name}</h2><p>{tc("path.intro")}</p></div>
            <div className={styles.familyHeroActions}>
                <div><strong>{completed}/{lines.length}</strong><span>{t("learn.linesLearned")}</span></div>
                <button type="button" onClick={studyNext} disabled={!lines.length}>{t("learn.study")}</button>
                <button type="button" onClick={() => onReviewFamily(learnedLines)} disabled={!learnedLines.length}>{t("modes.review")}</button>
            </div>
        </div>
        <div className={styles.pathCard}>
            <div className={styles.pathHead}><strong>{tc("path.title")}</strong><span>{percent}%</span></div>
            <div className={styles.pathTrack}><i style={{ width: `${percent}%` }}/></div>
            <div className={styles.lessonList}>{lines.slice(0, limit).map((item, index) => {
                const learned = progress[createLessonId(item.eco, item.name, item.pgn)];
                return <button key={createLessonId(item.eco, item.name, item.pgn)} data-recommended={index == recommended} onClick={() => onOpen(item, learned?.side || preferredSide, Boolean(learned), Boolean(learned))}>
                    <b>{learned ? "✓" : index + 1}</b>
                    <div><strong>{item.name == name ? t("learn.fundamentals") : item.name.replace(`${name}: `, "")}</strong><small>{item.pgn}</small></div>
                    <span>{learned ? t("modes.review") : index == recommended ? tc("path.recommended") : t("learn.study")}</span>
                </button>;
            })}</div>
        </div>
        {limit < lines.length && <button className={styles.showMore} onClick={() => setLimit(value => value + 10)}>{t("learn.showMore", { remaining: lines.length - limit })}</button>}
    </section>;
}

export default CourseFamilyV3;
