import React, { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

import useSettingsStore from "@/stores/SettingsStore";
import NavigationBar from "@/components/layout/NavigationBar";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/privacy/CookieConsent";

import PageWrapperProps from "./PageWrapperProps";
import * as styles from "./PageWrapper.module.css";
import "./GlobalTheme.css";
import "./GlobalThemePolish.css";
import "./LightThemeContrast.css";
import "./LightThemeComponentFixes.css";

const queryClient = new QueryClient();
const BugReportingWidget = lazy(() => import("@/components/BugReportingWidget"));

function PageWrapper({
    children,
    className,
    style,
    contentClassName,
    contentStyle,
    footerClassName,
    footerStyle
}: PageWrapperProps) {
    const bugReportingMode = useSettingsStore(
        state => state.settings.bugReportingMode
    );

    const colourMode = useSettingsStore(
        state => state.settings.appearance.colourMode
    );

    const routeName = typeof window == "undefined"
        ? "home"
        : window.location.pathname.split("/").filter(Boolean).at(0)
            || "home";

    useEffect(() => {
        document.documentElement.dataset.theme = colourMode;
        document.body.dataset.theme = colourMode;

        return () => {
            delete document.documentElement.dataset.theme;
            delete document.body.dataset.theme;
        };
    }, [colourMode]);

    useEffect(() => {
        const brandLink = document.querySelector<HTMLAnchorElement>(
            'header a[href="/analysis"]'
        );

        if (!brandLink) return;

        brandLink.setAttribute("href", "/home");
        brandLink.setAttribute("aria-label", "NexoChess");
    }, []);

    return <QueryClientProvider client={queryClient}>
        <div
            className={[
                styles.page,
                className
            ].filter(Boolean).join(" ")}
            style={style}
            data-nexo-shell
            data-theme={colourMode}
            data-route={routeName}
        >
            <NavigationBar/>

            <div
                className={[
                    styles.content,
                    contentClassName
                ].filter(Boolean).join(" ")}
                style={contentStyle}
                data-nexo-content
            >
                {children}
            </div>

            <Footer className={footerClassName} style={footerStyle} />

            {bugReportingMode && <Suspense fallback={null}>
                <BugReportingWidget/>
            </Suspense>}

            <CookieConsent/>
            <ToastContainer/>
        </div>
    </QueryClientProvider>;
}

export default PageWrapper;
