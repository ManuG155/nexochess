import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";
import { removeDefaultConsentLink } from "@/lib/consent";

import StatisticsPage from "./StatisticsPage";

import "@/i18n";
import "@/index.css";
import "@/apps/features/FeatureMobileBase.css";

const root = ReactDOM.createRoot(document.querySelector(".root")!);

function App() {
    useEffect(() => {
        removeDefaultConsentLink();
    }, []);

    return (
        <PageWrapper>
            <StatisticsPage />
        </PageWrapper>
    );
}

root.render(
    <I18nGate>
        <App />
    </I18nGate>
);
