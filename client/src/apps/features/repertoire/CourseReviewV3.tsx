import React from "react";
import { useTranslation } from "react-i18next";

import { CourseProgressStore, getLearnedCount, getMasteredCount } from "./courseProgress";
import { RepertoireSide, openingFromProgress } from "./courseV3Model";
import { OpeningCatalogueEntry } from "./openingCatalogue";
import * as styles from "./courseV3.module.css";

interface Props {
    progress: CourseProgressStore;
    onOpen: (opening: OpeningCatalogueEntry, side?: RepertoireSide, practice?: boolean) => void;
    onReviewAll?: (openings: OpeningCatalogueEntry[]) => void;
}

function CourseReviewV3({ progress, onOpen, onReviewAll }: Props) {
    const { t } = useTranslation("repertoire");
    const learned = Object.values(progress);
    const openings = learned.map(openingFromProgress);
    return <section className={styles.browserShell}>
        <div className={styles.browserHero}>
            <div><span>{t("review.eyebrow")}</span><h2>{t("review.title")}</h2><p>{t("review.intro")}</p></div>
            <div className={styles.reviewHeroActions}>
                <div className={styles.stats}><div><strong>{getLearnedCount(progress)}</strong><span>{t("review.learned")}</span></div><div><strong>{getMasteredCount(progress)}</strong><span>{t("review.mastered")}</span></div></div>
                <button type="button" className={styles.reviewAllButton} onClick={() => onReviewAll?.(openings)} disabled={!openings.length || !onReviewAll}>{t("review.start")}</button>
            </div>
        </div>
        {learned.length == 0 ? <div className={styles.emptyReview}><span>✓</span><h3>{t("review.emptyTitle")}</h3><p>{t("review.emptyBody")}</p></div> : <div className={styles.reviewList}>{learned.map(item => <button key={item.lessonId} onClick={() => onOpen(openingFromProgress(item), item.side, true)}><span>{item.eco}</span><div><strong>{item.openingName}</strong><small>{item.family}</small></div><em>{t("modes.review")}</em></button>)}</div>}
    </section>;
}
export default CourseReviewV3;
