import React, { ReactNode, useEffect, useState } from "react";

import i18n from "@/i18n";

interface I18nGateProps {
    children: ReactNode;
}

/**
 * Keeps the application hidden until the initial translation bundle is ready.
 * This avoids rendering raw i18n keys and partial navigation while namespaces
 * are still loading from /locales.
 */
function I18nGate({ children }: I18nGateProps) {
    const [ready, setReady] = useState(i18n.isInitialized);

    useEffect(() => {
        if (i18n.isInitialized) {
            setReady(true);
            return;
        }

        const onInitialized = () => setReady(true);
        i18n.on("initialized", onInitialized);

        return () => {
            i18n.off("initialized", onInitialized);
        };
    }, []);

    if (!ready) return null;

    return <>{children}</>;
}

export default I18nGate;
