import React from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";

import LessonsApp from "./LessonsApp";

import "@/i18n";
import "@/index.css";
import * as styles from "./lessons.module.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function App() {
    return <PageWrapper contentClassName={styles.pageContent}>
        <LessonsApp/>
    </PageWrapper>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);
