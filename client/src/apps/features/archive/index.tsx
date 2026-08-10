import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";

import PageWrapper from "@/components/layout/PageWrapper";
import Archive from "./pages/Archive";
import { removeDefaultConsentLink } from "@/lib/consent";

import "@/i18n";
import "@/index.css";

import * as styles from "./index.module.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function App() {
    useEffect(() => {
        removeDefaultConsentLink();
    }, []);

    return <PageWrapper contentClassName={styles.wrapper}>
        <Archive/>
    </PageWrapper>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);
