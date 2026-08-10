import React from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";
import PageAdvertisement from "@/components/Advertisement/PageAdvertisement";
import PageWrapper from "@/components/layout/PageWrapper";
import HelpCenter from "./pages/HelpCenter";

import "@/i18n";
import "@/index.css";
import "./readability.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

function App() {
    return <PageWrapper>
        <HelpCenter/>
        <PageAdvertisement afterSelector="main > section:nth-of-type(2)"/>
        <PageAdvertisement afterSelector="main > section:nth-of-type(4)"/>
    </PageWrapper>;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);