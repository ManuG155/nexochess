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
    onOpen: (opening: OpeningCatalogueEntry, side?: RepertoireSide) => void;
}

function CourseFamilyV3({ name, lines, progress, preferredSide, onBack, onOpen }: Props) {
    const { t } = useTranslation("repertoire");
    const { t: tc } = useTranslation("repertoireCourse");
    const [limit, setLimit] = useState(10);
    const completed = lines.filter(item => progress[createLessonId(item.eco, item.name, item.pgn)]).length;
    const firstUnlearned = lines.findIndex(item => !progress[createLessonId(item.eco, item.name, item.pgn)]);
    const recommended = firstUnlearned < 0 ? Math.max(0, lines.length - 1) : firstUnlearned;
    const percent = lines.length ? Math.round(completed / lines.length * 100) : 0;

    return <section className={styles.browserShell}>
        <button className={styles.backToOpenings} onClick={onBack}>← {t("learn.allOpenings")}</button>
        <div className={styles.familyHero}>
            <div><span>{lines[0]?.eco}</span><h2>{name}</h2><p>{tc("path.intro")}</p></div>
            <div><strong>{completed}/{lines.length}</strong><span>{t("learn.linesLearned")}</span></div>
        </div>
        <div className={styles.pathCard}>
            <div className={styles.pathHead}><strong>{tc("path.title")}</strong><span>{percent}%</span></div>
            <div className={styles.pathTrack}><i style={{ width: `${percent}%` }}/></div>
            <div className={styles.lessonList}>{lines.slice(0, limit).map((item, index) => {
                const learned = progress[createLessonId(item.eco, item.name, item.pgn)];
                return <button key={createLessonId(item.eco, item.name, item.pgn)} data-recommended={index == recommended} onClick={() => onOpen(item, learned?.side || preferredSide)}>
                    <b>{learned ? "✓" : index + 1}</b>
                    <div><strong>{item.name == name ? t("learn.fundamentals") : item.name.replace(`${name}: `, "")}</strong><small>{item.pgn}</small></div>
                    <span>{learned?.mastered ? t("learn.mastered") : learned ? t("learn.reviewScheduled") : index == recommended ? tc("path.recommended") : t("learn.study")}</span>
                </button>;
            })}</div>
        </div>
        {limit < lines.length && <button className={styles.showMore} onClick={() => setLimit(value => value + 10)}>{t("learn.showMore", { remaining: lines.length - limit })}</button>}
    </section>;
}

export default CourseFamilyV3;
