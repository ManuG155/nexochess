import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";
import PageAdvertisement from "@/components/Advertisement/PageAdvertisement";
import { removeDefaultConsentLink } from "@/lib/consent";

import Home from "./Home";

import "@/i18n";
import "@/index.css";
import "./Home.mobile.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function App() {
    useEffect(() => {
        removeDefaultConsentLink();
    }, []);

    return <PageWrapper>
        <Home/>
        <PageAdvertisement afterSelector="main > section:nth-of-type(2)"/>
        <PageAdvertisement afterSelector="main > section:nth-of-type(3)"/>
    </PageWrapper>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);
