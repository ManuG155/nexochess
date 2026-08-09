import React from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";

import Guides from "./Guides";

import "@/i18n";
import "@/index.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

root.render(
    <I18nGate>
        <PageWrapper>
            <Guides/>
        </PageWrapper>
    </I18nGate>
);
