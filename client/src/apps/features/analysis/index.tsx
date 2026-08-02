import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import PageWrapper from "@/components/layout/PageWrapper";
import { removeDefaultConsentLink } from "@/lib/consent";

import * as styles from "./index.module.css";

const Analysis = lazy(() => import("./pages/Analysis"));

import "@/i18n";
import "@/index.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function App() {
    useEffect(() => {
        removeDefaultConsentLink();
    }, []);

    return <BrowserRouter>
        <PageWrapper
            className={styles.wrapper}
            footerClassName={styles.footer}
        >
            <Routes>
                <Route
                    path="/analysis"
                    element={
                        <Suspense fallback={null}>
                            <Analysis/>
                        </Suspense>
                    }
                />
            </Routes>
        </PageWrapper>
    </BrowserRouter>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);