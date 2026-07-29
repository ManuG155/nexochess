import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import I18nGate from "@/components/layout/I18nGate";

import "@/i18n";
import "@/index.css";

const root = ReactDOM.createRoot(
    document.querySelector(".root")!
);

/*
 * The public News section has been retired from NexoChess.
 * Old /news bookmarks are redirected to Analysis instead of exposing a
 * dead navigation destination. Internal/admin news tooling is left alone so
 * removing the public feature cannot break unrelated server functionality.
 */
function App() {
    useEffect(() => {
        location.replace("/analysis");
    }, []);

    return null;
}

root.render(
    <I18nGate>
        <App/>
    </I18nGate>
);
