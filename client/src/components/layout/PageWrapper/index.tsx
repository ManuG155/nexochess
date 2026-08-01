import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { ToastContainer } from "react-toastify";

import useSettingsStore from "@/stores/SettingsStore";
import useAnnouncement from "@/hooks/api/useAnnouncement";
import Announcement from "@/components/layout/Announcement";
import NavigationBar from "@/components/layout/NavigationBar";
import Footer from "@/components/layout/Footer";
import BugReportingWidget from "@/components/BugReportingWidget";

import PageWrapperProps from "./PageWrapperProps";
import * as styles from "./PageWrapper.module.css";
import "./GlobalTheme.css";
import "./GlobalThemePolish.css";
import "./LightThemeContrast.css";
import "./LightThemeComponentFixes.css";
import "./PuzzlesLightRepair.css";

const queryClient = new QueryClient();

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

    const { announcement, status: announcementStatus } = useAnnouncement();

    const [ announcementOpen, setAnnouncementOpen ] = useState(true);

    const routeName = typeof window == "undefined"
        ? "analysis"
        : window.location.pathname.split("/").filter(Boolean).at(0)
            || "analysis";

    useEffect(() => {
        document.documentElement.dataset.theme = colourMode;
        document.body.dataset.theme = colourMode;

        return () => {
            delete document.documentElement.dataset.theme;
            delete document.body.dataset.theme;
        };
    }, [colourMode]);

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
            {announcementOpen && announcementStatus == "success"
                && <Announcement
                    style={{ zIndex: 99 }}
                    setOpen={setAnnouncementOpen}
                    colour={announcement.colour}
                >
                    <ReactMarkdown className={styles.announcementMarkdown}>
                        {announcement.content}
                    </ReactMarkdown>
                </Announcement>
            }

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

            {bugReportingMode && <BugReportingWidget/>}

            <ToastContainer/>
        </div>
    </QueryClientProvider>;
}

export default PageWrapper;
