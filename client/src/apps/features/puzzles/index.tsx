import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { useTranslation } from "react-i18next";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";
import { getSemanticDiscoveryCopy } from "@/i18n/semanticDiscoveryCopy";
import { removeDefaultConsentLink } from "@/lib/consent";

import PuzzleInfoDisclosure from "./components/PuzzleInfoDisclosure";
import Puzzles from "./pages/Puzzles";

import "@/i18n";
import "@/index.css";
import "@/components/layout/PageWrapper/PuzzlesLightRepair.css";
import "@/components/layout/PageWrapper/PuzzlesSetupPolish.css";
import "@/components/layout/PageWrapper/PuzzlesFinalLayout.css";
import "@/components/layout/PageWrapper/PuzzlesFinalFixes.css";
import "@/components/layout/PageWrapper/PuzzlesPolishV4.css";
import "@/components/layout/PageWrapper/PuzzlesPolishV5.css";
import * as styles from "./index.module.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function App() {
    const { i18n } = useTranslation();
    const semanticCopy = useMemo(
        () => getSemanticDiscoveryCopy(i18n.resolvedLanguage).puzzles,
        [i18n.resolvedLanguage]
    );

    useEffect(() => {
        removeDefaultConsentLink();
    }, []);

    return <PageWrapper contentClassName={styles.content}>
        <Puzzles/>
        <PuzzleInfoDisclosure
            copy={semanticCopy}
            relatedHref="/analysis"
            helpHref="/help"
        />
    </PageWrapper>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);