import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SourceCode from "./pages/SourceCode";
import Terms from "./pages/Terms";

import "@/i18n";
import "@/index.css";
import "./readability.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function App() {
    return <BrowserRouter>
        <PageWrapper>
            <Routes>
                <Route path="/privacy" element={<PrivacyPolicy/>} />
                <Route path="/terms" element={<Terms/>} />
                <Route path="/source" element={<SourceCode/>} />
            </Routes>
        </PageWrapper>
    </BrowserRouter>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);
