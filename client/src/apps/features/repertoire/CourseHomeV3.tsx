import React from "react";
import { useTranslation } from "react-i18next";
import PlayerOpeningProfile from "./PlayerOpeningProfile";
import { OpeningCatalogueEntry, OpeningCategory, buildCourseLessons, featuredFamiliesForCategory } from "./openingCatalogue";
import { CourseProgressStore, createLessonId, getDueLessons, getLearnedCount, getMasteredCount } from "./courseProgress";
import { RepertoireSide } from "./courseV3Model";
import * as styles from "./courseV3.module.css";
interface Family { name: string; lines: OpeningCatalogueEntry[]; }
interface Props { catalogue: OpeningCatalogueEntry[]; families: Family[]; progress: CourseProgressStore; loading: boolean; query: string; category: OpeningCategory; categories: OpeningCategory[]; onQuery: (value: string) => void; onCategory: (value: OpeningCategory) => void; onFamily: (name: string, side?: RepertoireSide) => void; }
function CourseHomeV3({ catalogue, families, progress, loading, query, category, categories, onQuery, onCategory, onFamily }: Props) {
    const { t } = useTranslation("repertoire");
    const { t: tc } = useTranslation("repertoireCourse");
    const q = query.trim().toLocaleLowerCase();
    const visible = q ? families.filter(item => item.name.toLocaleLowerCase().includes(q) || item.lines.some(line => line.name.toLocaleLowerCase().includes(q) || line.eco.toLocaleLowerCase().includes(q))).slice(0, 100) : featuredFamiliesForCategory(category).map(name => families.find(item => item.name == name)).filter((item): item is Family => Boolean(item));
    return <section className={styles.browserShell}>
        <div className={styles.browserHero}><div><span>{t("learn.eyebrow")}</span><h2>{t("learn.title")}</h2><p>{t("learn.intro")}</p></div><div className={styles.stats}><div><strong>{getLearnedCount(progress)}</strong><span>{t("review.learned")}</span></div><div><strong>{getDueLessons(progress).length}</strong><span>{t("review.due")}</span></div><div><strong>{getMasteredCount(progress)}</strong><span>{t("review.mastered")}</span></div></div></div>
        <PlayerOpeningProfile catalogue={catalogue} onTrainFamily={(name, side) => onFamily(name, side)}/>
        <label className={styles.searchBox}><span>{t("learn.searchLabel")}</span><input value={query} onChange={event => onQuery(event.target.value)} placeholder={t("learn.searchPlaceholder")}/><small>{loading ? t("learn.loading") : t("learn.catalogueReady", { count: catalogue.length })}</small></label>
        {!q && <div className={styles.categoryTabs}>{categories.map(item => <button key={item} data-active={category == item} onClick={() => onCategory(item)}>{tc(`categories.${item}`)}</button>)}</div>}
        <div className={styles.familyGrid}>{visible.map(item => { const lessons = buildCourseLessons(item.lines); const done = lessons.filter(line => progress[createLessonId(line.eco, line.name, line.pgn)]).length; return <button key={item.name} onClick={() => onFamily(item.name)}><span>{item.lines[0]?.eco}</span><strong>{item.name}</strong><small>{t("learn.lessons", { count: lessons.length })}</small>{done > 0 && <em>{t("learn.progress", { completed: done, total: lessons.length })}</em>}</button>; })}</div>
    </section>;
}
export default CourseHomeV3;
