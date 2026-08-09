import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import ads from "@/constants/advertisements";
import Advertisement from "@/components/Advertisement";
import SemanticDiscoverySection from
    "@/components/SemanticDiscoverySection/SemanticDiscoverySection";
import { getSemanticDiscoveryCopy } from "@/i18n/semanticDiscoveryCopy";
import useGameLoader from "@analysis/hooks/useGameLoader";
import AnalysisPanel from "@analysis/components/AnalysisPanel";

import BoardArea from "./BoardArea";
import * as styles from "./Analysis.module.css";

function Analysis() {
    useGameLoader();
    const { i18n } = useTranslation();
    const semanticCopy = useMemo(
        () => getSemanticDiscoveryCopy(i18n.resolvedLanguage).analysis,
        [i18n.resolvedLanguage]
    );

    useEffect(() => {
        const url = new URL(window.location.href);
        if (!url.searchParams.has("nexo-nav")) return;

        url.searchParams.delete("nexo-nav");
        window.history.replaceState(
            window.history.state,
            "",
            url.pathname + url.search + url.hash
        );
    }, []);

    return <div className={styles.wrapper}>
        <div className={styles.advertisement}>
            <Advertisement adUnitId={ads.analysis.top} style={{
                width: "100%", height: "100px"
            }}/>
        </div>

        <div className={styles.analysisSection}>
            <BoardArea/>

            <AnalysisPanel className={styles.panel} />
        </div>

        <div className={styles.advertisement}>
            <Advertisement adUnitId={ads.analysis.bottom} style={{
                width: "100%", height: "100px"
            }}/>
        </div>

        <SemanticDiscoverySection
            copy={semanticCopy}
            relatedHref="/puzzles"
            helpHref="/help"
        />
    </div>;
}

export default Analysis;
