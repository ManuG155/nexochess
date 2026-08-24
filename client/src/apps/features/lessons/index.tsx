import React, { lazy, Suspense, useState } from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";
import LoadingPlaceholder from "@/components/layout/LoadingPlaceholder";

import LessonsApp from "./LessonsApp";
import EndgameGateway from "./endgames/EndgameGateway";

import "@/i18n";
import "@/index.css";
import "../FeatureMobileBase.css";
import * as styles from "./lessons.module.css";

const EndgameLab = lazy(() => import("./endgames/EndgameLab"));

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function App() {
    const [endgamesOpen, setEndgamesOpen] = useState(() => (
        new URLSearchParams(window.location.search).get("mode") == "endgames"
    ));

    function openEndgames() {
        const url = new URL(window.location.href);
        url.searchParams.set("mode", "endgames");
        window.history.replaceState(window.history.state, "", url);
        setEndgamesOpen(true);
    }

    function closeEndgames() {
        const url = new URL(window.location.href);
        url.searchParams.delete("mode");
        window.history.replaceState(window.history.state, "", url);
        setEndgamesOpen(false);
    }

    return <PageWrapper contentClassName={styles.pageContent}>
        {endgamesOpen ? (
            <Suspense fallback={<LoadingPlaceholder />}>
                <EndgameLab onBack={closeEndgames}/>
            </Suspense>
        ) : <>
            <LessonsApp/>
            <EndgameGateway onOpen={openEndgames}/>
        </>}
    </PageWrapper>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);
