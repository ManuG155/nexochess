import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";
import PageAdvertisement from "@/components/Advertisement/PageAdvertisement";
import { removeDefaultConsentLink } from "@/lib/consent";

import Faq from "./Faq";

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
        <Faq/>
        <PageAdvertisement afterSelector="main > section:nth-of-type(1)"/>
        <PageAdvertisement afterSelector="main > section:nth-of-type(2)"/>
    </PageWrapper>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);
