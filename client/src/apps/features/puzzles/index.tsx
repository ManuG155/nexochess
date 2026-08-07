import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";
import { removeDefaultConsentLink } from "@/lib/consent";

import Puzzles from "./pages/Puzzles";

import "@/i18n";
import "@/index.css";
import "@/components/layout/PageWrapper/PuzzlesLightRepair.css";
import "@/components/layout/PageWrapper/PuzzlesSetupPolish.css";
import * as styles from "./index.module.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function App() {
    useEffect(() => {
        removeDefaultConsentLink();
    }, []);

    return <PageWrapper contentClassName={styles.content}>
        <Puzzles/>
    </PageWrapper>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);