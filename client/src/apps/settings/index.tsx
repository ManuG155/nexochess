import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PageWrapper from "@/components/layout/PageWrapper";
import Settings from "./pages/Settings";
import { getLanguageRouterBasename } from "@/i18n/routing";
import { removeDefaultConsentLink } from "@/lib/consent";

const UserSection = lazy(() => import("./components/categories/User"));
const AppearanceSection = lazy(() => import("./components/categories/Appearance"));
const CoachSection = lazy(() => import("./components/categories/Coach"));
const BugReportingSection = lazy(() => import("./components/categories/BugReporting"));
const AnalysisSection = lazy(() => import("./components/categories/Analysis"));
const PrivacySection = lazy(() => import("./components/categories/Privacy"));

import "@/i18n";
import "@/index.css";
import * as styles from "./index.module.css";

const root = ReactDOM.createRoot(document.querySelector(".root")!);

function App() {
    useEffect(() => {
        removeDefaultConsentLink();
    }, []);

    const basename = getLanguageRouterBasename(window.location.pathname);

    return (
        <PageWrapper contentClassName={styles.content}>
            <BrowserRouter basename={basename}>
                <Suspense fallback={null}>
                    <Routes>
                    <Route path="/settings" element={<Settings/>}>
                        <Route index element={<Navigate to="/settings/appearance"/>}/>
                        <Route path="/settings/account" element={<Navigate to="/settings/user" replace/>}/>
                        <Route path="/settings/user" element={<UserSection/>}/>
                        <Route path="/settings/theme" element={<Navigate to="/settings/appearance" replace/>}/>
                        <Route path="/settings/appearance" element={<AppearanceSection/>}/>
                        <Route path="/settings/coach" element={<CoachSection/>}/>
                        <Route path="/settings/analysis" element={<AnalysisSection/>}/>
                        <Route path="/settings/bugs" element={<BugReportingSection/>}/>
                        <Route path="/settings/privacy" element={<PrivacySection/>}/>
                    </Route>
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </PageWrapper>
    );
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);