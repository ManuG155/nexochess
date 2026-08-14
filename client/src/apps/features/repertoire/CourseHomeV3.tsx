import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PlayerOpeningProfile from "./PlayerOpeningProfile";
import { OpeningCatalogueEntry, OpeningCategory, featuredFamiliesForCategory } from "./openingCatalogue";
import { countCourseLessonsFast } from "./courseLessonIndex";
import { localizeOpeningName } from "./openingLocalization";
import { CourseProgressStore, findLessonProgress, getLearnedCount, getMasteredCount } from "./courseProgress";
import { RepertoireSide } from "./courseV3Model";
import * as styles from "./courseV3.module.css";

interface Family { name: string; lines: OpeningCatalogueEntry[]; }
interface Props { catalogue: OpeningCatalogueEntry[]; families: Family[]; progress: CourseProgressStore; loading: boolean; query: string; onQuery: (value: string) => void; onFamily: (name: string, side?: RepertoireSide) => void; }
type CatalogueFilter = "all" | OpeningCategory;
const FILTERS: OpeningCategory[] = ["e4", "d4", "vsE4", "vsD4", "flank"];
const POPULAR = ["Italian", "Sicilian", "Ruy Lopez", "Queen's Gambit", "Caro-Kann", "French", "London", "Scotch", "King's Indian", "Nimzo-Indian", "Slav", "Catalan", "English", "Vienna", "Queen's Indian", "Grünfeld", "Pirc", "Dutch", "Réti", "Ponziani"];
const FILTER_COPY: Record<string, { filter: string; all: string }> = {
    en: { filter: "Filter", all: "All openings" }, es: { filter: "Filtro", all: "Todas las aperturas" }, fr: { filter: "Filtre", all: "Toutes les ouvertures" }, de: { filter: "Filter", all: "Alle Eröffnungen" }, pt: { filter: "Filtro", all: "Todas as aberturas" }, ru: { filter: "Фильтр", all: "Все дебюты" }, zh: { filter: "筛选", all: "全部开局" }, vi: { filter: "Bộ lọc", all: "Tất cả khai cuộc" }, hi: { filter: "फ़िल्टर", all: "सभी ओपनिंग" }, mr: { filter: "फिल्टर", all: "सर्व ओपनिंग" }, pl: { filter: "Filtr", all: "Wszystkie otwarcia" }
};

function popularity(name: string) {
    const index = POPULAR.findIndex(item => name.toLocaleLowerCase().includes(item.toLocaleLowerCase()));
    return index < 0 ? 999 : index;
}

function CourseHomeV3({ catalogue, families, progress, loading, query, onQuery, onFamily }: Props) {
    const { t, i18n } = useTranslation("repertoire");
    const { t: tc } = useTranslation("repertoireCourse");
    const [filter, setFilter] = useState<CatalogueFilter>("all");
    const [filterOpen, setFilterOpen] = useState(false);
    const language = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0].toLowerCase();
    const copy = FILTER_COPY[language] || FILTER_COPY.en;
    const q = query.trim().toLocaleLowerCase();
    const learned = getLearnedCount(progress);
    const sorted = useMemo(() => [...families].sort((a, b) => popularity(a.name) - popularity(b.name) || localizeOpeningName(a.name, language).localeCompare(localizeOpeningName(b.name, language))), [families, language]);
    const visible = useMemo(() => {
        let result = sorted;
        if (filter != "all") {
            const names = new Set(featuredFamiliesForCategory(filter));
            result = result.filter(item => names.has(item.name));
        }
        if (q) result = result.filter(item => {
            const familyDisplay = localizeOpeningName(item.name, language).toLocaleLowerCase();
            return item.name.toLocaleLowerCase().includes(q)
                || familyDisplay.includes(q)
                || item.lines.some(line => line.name.toLocaleLowerCase().includes(q) || localizeOpeningName(line.name, language).toLocaleLowerCase().includes(q) || line.eco.toLocaleLowerCase().includes(q));
        });
        return result;
    }, [filter, language, q, sorted]);

    return <section className={styles.browserShell}>
        <div className={styles.browserHero}><div><span>{t("learn.eyebrow")}</span><h2>{t("learn.title")}</h2><p>{t("learn.intro")}</p></div><div className={styles.stats}><div><strong>{learned}</strong><span>{t("review.learned")}</span></div><div><strong>{learned}</strong><span>{t("modes.review")}</span></div><div><strong>{getMasteredCount(progress)}</strong><span>{t("review.mastered")}</span></div></div></div>
        <PlayerOpeningProfile catalogue={catalogue} onTrainFamily={(name, side) => onFamily(name, side)}/>
        <div className={styles.catalogueTools}>
            <label className={styles.searchBox}><span>{t("learn.searchLabel")}</span><input value={query} onChange={event => onQuery(event.target.value)} placeholder={t("learn.searchPlaceholder")}/><small>{loading ? t("learn.loading") : t("learn.catalogueReady", { count: catalogue.length })}</small></label>
            <div className={styles.filterWrap}>
                <button type="button" className={styles.filterButton} data-active={filter != "all"} onClick={() => setFilterOpen(value => !value)} aria-expanded={filterOpen}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>{copy.filter}
                </button>
                {filterOpen && <div className={styles.filterMenu}>
                    <button type="button" data-active={filter == "all"} onClick={() => { setFilter("all"); setFilterOpen(false); }}>{copy.all}</button>
                    {FILTERS.map(item => <button type="button" key={item} data-active={filter == item} onClick={() => { setFilter(item); setFilterOpen(false); }}>{tc(`categories.${item}`)}</button>)}
                </div>}
            </div>
        </div>
        <div className={styles.catalogueViewport}>
            <div className={styles.familyGrid} data-repertoire-tour="family-grid">{visible.map(item => {
                const total = countCourseLessonsFast(item.lines);
                const done = item.lines.reduce((count, line) => count + (findLessonProgress(progress, line) ? 1 : 0), 0);
                return <button key={item.name} onClick={() => onFamily(item.name)}><span>{item.lines.find(line => line.eco != "USR")?.eco || item.lines[0]?.eco}</span><strong>{localizeOpeningName(item.name, language)}</strong><small>{t("learn.lessons", { count: total })}</small>{done > 0 && <em>{t("learn.progress", { completed: Math.min(done, total), total })}</em>}</button>;
            })}</div>
        </div>
    </section>;
}
export default CourseHomeV3;
