import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";

import PageWrapper from "@/components/layout/PageWrapper";
import Unfound from "./pages/Unfound";
import { removeDefaultConsentLink } from "@/lib/consent";

import "@/i18n";
import "@/index.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function App() {
    useEffect(() => {
        removeDefaultConsentLink();
    }, []);

    return <PageWrapper>
        <Unfound/>
    </PageWrapper>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);