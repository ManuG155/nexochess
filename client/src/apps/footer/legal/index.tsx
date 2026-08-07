import React from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";
import { parseLanguagePathname } from "@/i18n/routing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SourceCode from "./pages/SourceCode";
import Terms from "./pages/Terms";

import "@/i18n";
import "@/index.css";
import "./readability.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function LegalPage() {
    const { basePathname } = parseLanguagePathname(window.location.pathname);

    switch (basePathname) {
        case "/privacy":
            return <PrivacyPolicy/>;
        case "/terms":
            return <Terms/>;
        case "/source":
            return <SourceCode/>;
        default:
            return null;
    }
}

function App() {
    return <PageWrapper>
        <LegalPage/>
    </PageWrapper>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);
