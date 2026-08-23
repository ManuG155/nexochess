import React, { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ToastContainer } from "react-toastify";

import useSettingsStore from "@/stores/SettingsStore";
import NavigationBar from "@/components/layout/NavigationBar";
import CookieConsent from "@/components/privacy/CookieConsent";
import { getAccessibilityCopy } from "@/i18n/accessibilityCopy";
import { parseLanguagePathname } from "@/i18n/routing";
import { initialiseAnalytics } from "@/lib/analytics";

import PageWrapperProps from "./PageWrapperProps";
import * as styles from "./PageWrapper.module.css";
import "./GlobalTheme.css";
import "./GlobalThemePolish.css";
import "./LightThemeContrast.css";
import "./LightThemeComponentFixes.css";
import "./Accessibility.css";

const queryClient = new QueryClient();
const Footer = lazy(() => import("@/components/layout/Footer"));
const BugReportingWidget = lazy(() => import("@/components/BugReportingWidget"));
const ReleaseNotice = lazy(() => import("@/components/releases/ReleaseNotice"));
const ReleaseNoticeV12 = lazy(() => import("@/components/releases/ReleaseNoticeV12"));
const ReleaseNoticeV13 = lazy(() => import("@/components/releases/ReleaseNoticeV13"));
const SiteTour = lazy(() => import("@/components/tutorial/SiteTour"));

const SITE_TOUR_ROUTES = new Set([
    "analysis",
    "analysis-entry",
    "academy",
    "lessons",
    "engine",
    "archive",
    "statistics",
    "puzzles"
]);

function PageWrapper({
    children,
    className,
    style,
    contentClassName,
    contentStyle,
    footerClassName,
    footerStyle
}: PageWrapperProps) {
    const { i18n } = useTranslation();
    const [releaseNoticesReady, setReleaseNoticesReady] = useState(false);
    const accessibilityCopy = getAccessibilityCopy(
        i18n.resolvedLanguage || i18n.language
    );
    const bugReportingMode = useSettingsStore(
        state => state.settings.bugReportingMode
    );

    const colourMode = useSettingsStore(
        state => state.settings.appearance.colourMode
    );

    const routeName = typeof window == "undefined"
        ? "home"
        : parseLanguagePathname(window.location.pathname)
            .basePathname.split("/").filter(Boolean).at(0)
            || "home";

    const releaseNoticesEnabled = routeName == "home";
    const siteTourEnabled = SITE_TOUR_ROUTES.has(routeName);

    useEffect(() => initialiseAnalytics(), []);

    useEffect(() => {
        document.documentElement.dataset.theme = colourMode;
        document.body.dataset.theme = colourMode;

        return () => {
            delete document.documentElement.dataset.theme;
            delete document.body.dataset.theme;
        };
    }, [colourMode]);

    useEffect(() => {
        if (!releaseNoticesEnabled) {
            setReleaseNoticesReady(false);
            return;
        }

        let timer: number | undefined;

        const scheduleReleaseNotices = () => {
            // Release dialogs are useful product messaging, but a late modal
            // can become the page's LCP on slow mobile connections. Keep them
            // on the Home experience and completely off product critical paths
            // such as Analysis, Puzzles and Lessons.
            timer = window.setTimeout(
                () => setReleaseNoticesReady(true),
                250
            );
        };

        if (document.readyState == "complete") {
            scheduleReleaseNotices();
        } else {
            window.addEventListener("load", scheduleReleaseNotices, {
                once: true
            });
        }

        return () => {
            window.removeEventListener("load", scheduleReleaseNotices);
            if (timer != undefined) window.clearTimeout(timer);
        };
    }, [releaseNoticesEnabled]);

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
            <a className={styles.skipLink} href="#nexo-main-content">
                {accessibilityCopy.skipToContent}
            </a>

            <NavigationBar/>

            <div
                id="nexo-main-content"
                className={[
                    styles.content,
                    contentClassName
                ].filter(Boolean).join(" ")}
                style={contentStyle}
                data-nexo-content
                tabIndex={-1}
            >
                {children}
            </div>

            <Suspense fallback={null}>
                <Footer className={footerClassName} style={footerStyle} />
            </Suspense>

            {siteTourEnabled && <Suspense fallback={null}>
                <SiteTour routeName={routeName}/>
            </Suspense>}

            {bugReportingMode && <Suspense fallback={null}>
                <BugReportingWidget/>
            </Suspense>}

            {releaseNoticesEnabled && releaseNoticesReady && <>
                <Suspense fallback={null}>
                    <ReleaseNoticeV13/>
                </Suspense>
                <Suspense fallback={null}>
                    <ReleaseNoticeV12/>
                </Suspense>
                <Suspense fallback={null}>
                    <ReleaseNotice/>
                </Suspense>
            </>}
            <CookieConsent/>
            <ToastContainer/>
        </div>
    </QueryClientProvider>;
}

export default PageWrapper;
