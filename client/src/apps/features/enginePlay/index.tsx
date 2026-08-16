import React from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";

import EnginePlayApp from "./EnginePlayApp";

import "@/i18n";
import "@/index.css";
import * as styles from "./enginePlay.module.css";

const root = ReactDOM.createRoot(document.querySelector(".root")!);

function App() {
    return <PageWrapper contentClassName={styles.pageContent}>
        <EnginePlayApp/>
    </PageWrapper>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);
