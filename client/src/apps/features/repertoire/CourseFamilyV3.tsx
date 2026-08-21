import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { OpeningCatalogueEntry } from "./openingCatalogue";
import { localizeOpeningName } from "./openingLocalization";
import { CourseProgressStore, findLessonProgress } from "./courseProgress";
import { RepertoireSide } from "./courseV3Model";
import { learnedDepth, pgnPlyCount } from "./courseDepth";
import CourseRepertoireTree from "./CourseRepertoireTree";
import * as styles from "./courseV3.module.css";

interface Props {
    name: string;
    lines: OpeningCatalogueEntry[];
    progress: CourseProgressStore;
    preferredSide?: RepertoireSide;
    onBack: () => void;
    onOpen: (opening: OpeningCatalogueEntry, side?: RepertoireSide, startPractice?: boolean, blindPractice?: boolean) => void;
    onReviewFamily: (lines: OpeningCatalogueEntry[]) => void;
    onAddToRepertoire: (opening: OpeningCatalogueEntry, side: RepertoireSide) => void;
}

function CourseFamilyV3({ name, lines, progress, preferredSide, onBack, onOpen, onReviewFamily, onAddToRepertoire }: Props) {
    const { t, i18n } = useTranslation("repertoire");
    const { t: tc } = useTranslation("repertoireCourse");
    const language = i18n.resolvedLanguage || i18n.language || "en";

    const lineStates = useMemo(() => lines.map(item => {
        const itemProgress = findLessonProgress(progress, item);
        // Untouched lines are known to be at 0%; parsing every one just to prove
        // that used to block large courses such as the Sicilian on entry.
        const availablePly = itemProgress ? pgnPlyCount(item.pgn) : 0;
        const learnedPly = itemProgress ? learnedDepth(itemProgress, availablePly) : 0;
        return {
            item,
            progress: itemProgress,
            availablePly,
            learnedPly,
            complete: Boolean(itemProgress && availablePly > 0 && learnedPly >= availablePly)
        };
    }), [lines, progress]);

    const learnedLines = lineStates
        .filter(state => state.learnedPly > 0)
        .map(state => state.item);
    const completed = learnedLines.length;
    const firstNew = lineStates.findIndex(state => state.learnedPly == 0);
    const firstPartial = lineStates.findIndex(state => state.learnedPly > 0 && !state.complete);
    const recommended = firstNew >= 0 ? firstNew : firstPartial;
    const depthScore = lineStates.reduce((sum, state) => (
        sum + (state.availablePly ? state.learnedPly / state.availablePly : 0)
    ), 0);
    const percent = lineStates.length
        ? Math.round(depthScore / lineStates.length * 100)
        : 0;
    const localizedFamily = localizeOpeningName(name, language);

    function studyNext() {
        const index = recommended >= 0 ? recommended : 0;
        const state = lineStates[index];
        if (!state) return;
        onOpen(
            state.item,
            state.progress?.side || preferredSide,
            Boolean(state.progress && state.complete),
            Boolean(state.progress && state.complete)
        );
    }

    return <section className={styles.browserShell}>
        <button className={styles.backToOpenings} onClick={onBack}>← {t("learn.allOpenings")}</button>
        <div className={styles.familyHero}>
            <div>
                <span>{lines.find(item => item.eco != "USR")?.eco || lines[0]?.eco}</span>
                <h2>{localizedFamily}</h2>
                <p>{tc("path.intro")}</p>
            </div>
            <div className={styles.familyHeroActions}>
                <div><strong>{completed}/{lines.length}</strong><span>{t("learn.linesLearned")}</span></div>
                <button type="button" data-repertoire-tour="study-next" onClick={studyNext} disabled={!lines.length}>{t("learn.study")}</button>
                <button type="button" onClick={() => onReviewFamily(learnedLines)} disabled={!learnedLines.length}>{t("modes.review")}</button>
            </div>
        </div>
        <CourseRepertoireTree
            name={name}
            lines={lines}
            progress={progress}
            preferredSide={preferredSide}
            percent={percent}
            language={language}
            title={tc("path.title")}
            loadingLabel={t("learn.loading")}
            onOpen={onOpen}
            onAddToRepertoire={onAddToRepertoire}
        />
    </section>;
}

export default CourseFamilyV3;
