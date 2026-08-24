import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PageWrapper from "@/components/layout/PageWrapper";
import { getLanguageRouterBasename } from "@/i18n/routing";
import { removeDefaultConsentLink } from "@/lib/consent";

const SignUp = lazy(() => import("./pages/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn"));

import "@/i18n";
import "@/index.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function App() {
    useEffect(() => {
        removeDefaultConsentLink();
    }, []);

    const basename = getLanguageRouterBasename(window.location.pathname);

    return <BrowserRouter basename={basename}>
        <PageWrapper>
            <Suspense fallback={null}>
                <Routes>
                    <Route path="/signup" element={<SignUp/>} />
                    <Route path="/signin" element={<SignIn/>} />
                </Routes>
            </Suspense>
        </PageWrapper>
    </BrowserRouter>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);