import React from "react";
import { useTranslation } from "react-i18next";

import { CourseProgressStore, getDueLessons, getLearnedCount, getMasteredCount } from "./courseProgress";
import { RepertoireSide, openingFromProgress } from "./courseV3Model";
import { OpeningCatalogueEntry } from "./openingCatalogue";
import * as styles from "./courseV3.module.css";

interface Props {
    progress: CourseProgressStore;
    onOpen: (opening: OpeningCatalogueEntry, side?: RepertoireSide, practice?: boolean) => void;
}

function CourseReviewV3({ progress, onOpen }: Props) {
    const { t } = useTranslation("repertoire");
    const due = getDueLessons(progress);
    return <section className={styles.browserShell}>
        <div className={styles.browserHero}>
            <div><span>{t("review.eyebrow")}</span><h2>{t("review.title")}</h2><p>{t("review.intro")}</p></div>
            <div className={styles.stats}><div><strong>{due.length}</strong><span>{t("review.due")}</span></div><div><strong>{getLearnedCount(progress)}</strong><span>{t("review.learned")}</span></div><div><strong>{getMasteredCount(progress)}</strong><span>{t("review.mastered")}</span></div></div>
        </div>
        {due.length == 0 ? <div className={styles.emptyReview}><span>✓</span><h3>{t("review.emptyTitle")}</h3><p>{t("review.emptyBody")}</p></div> : <div className={styles.reviewList}>{due.map(item => <button key={item.lessonId} onClick={() => onOpen(openingFromProgress(item), item.side, true)}><span>{item.eco}</span><div><strong>{item.openingName}</strong><small>{item.pgn}</small></div><em>{t(`side.${item.side}`)}</em></button>)}</div>}
    </section>;
}
export default CourseReviewV3;
