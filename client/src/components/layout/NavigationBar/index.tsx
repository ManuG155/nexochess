import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";

import { useAuthedProfile } from "@/hooks/api/useProfile";

import useAnalysisGameStore from
    "@analysis/stores/AnalysisGameStore";

import useAnalysisBoardStore from
    "@analysis/stores/AnalysisBoardStore";

import ShareDialog from
    "@analysis/components/ShareDialog";

import Typography from "@/components/Typography";

import BlurBackground from
    "@/components/layout/BlurBackground";

import Sidebar from
    "@/components/layout/sidebar/Sidebar";

import authClient from "@/lib/auth";

import HoverDropdown from "./HoverDropdown";

import * as styles from "./NavigationBar.module.css";


type IconName =
    | "academy"
    | "analysis"
    | "archive"
    | "flip"
    | "login"
    | "menu"
    | "puzzle"
    | "settings"
    | "share"
    | "user";


interface NavIconProps {
    name: IconName;
}


function NavIcon({ name }: NavIconProps) {
    const paths: Record<IconName, ReactNode> = {
        analysis: <>
            <path d="M4 17.5V20h16v-2.5" />
            <path d="M7 15V9.5" />
            <path d="M12 15V4" />
            <path d="M17 15v-7" />
        </>,

        archive: <>
            <path d="M4.5 8.5h15v11h-15z" />
            <path d="M3.5 4.5h17v4h-17z" />
            <path d="M9.5 12h5" />
        </>,

        academy: <>
            <path d="m3 9 9-5 9 5-9 5z" />
            <path d="M7 11.2V16c2.8 2.2 7.2 2.2 10 0v-4.8" />
            <path d="M21 9v6" />
        </>,

        puzzle: <>
            <path d="M9.5 4H4v5.5a2.5 2.5 0 1 1 0 5V20h5.5a2.5 2.5 0 1 0 5 0H20v-5.5a2.5 2.5 0 1 0 0-5V4h-5.5a2.5 2.5 0 1 1-5 0Z" />
        </>,

        flip: <>
            <path d="M7 7h10l-2.5-2.5" />
            <path d="M17 17H7l2.5 2.5" />
            <path d="M19 9.5A7 7 0 0 1 17 17" />
            <path d="M5 14.5A7 7 0 0 1 7 7" />
        </>,

        share: <>
            <circle cx="18" cy="5" r="2.5" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path d="m8.2 10.8 7.6-4.6" />
            <path d="m8.2 13.2 7.6 4.6" />
        </>,

        login: <>
            <path d="M14 4h5v16h-5" />
            <path d="M11 8l4 4-4 4" />
            <path d="M15 12H4" />
        </>,

        settings: <>
            <circle cx="12" cy="12" r="3" />
            <path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7-.7-2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z" />
        </>,

        user: <>
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5.5 20c.5-4 2.7-6 6.5-6s6 2 6.5 6" />
        </>,

        menu: <>
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
        </>
    };

    return (
        <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
        >
            {paths[name]}
        </svg>
    );
}


interface NavigationItemProps {
    children: ReactNode;
    current?: boolean;
    icon: IconName;
    url: string;
}


function NavigationItem({
    children,
    current = false,
    icon,
    url
}: NavigationItemProps) {
    return (
        <a
            className={`${styles.navItem} ${current ? styles.active : ""}`}
            href={url}
            aria-current={current ? "page" : undefined}
        >
            <NavIcon name={icon} />
            <span className={styles.navLabel}>{children}</span>
        </a>
    );
}


interface FutureItemProps {
    children: ReactNode;
    icon: IconName;
    comingSoon: string;
}


function FutureItem({
    children,
    icon,
    comingSoon
}: FutureItemProps) {
    return (
        <button
            type="button"
            className={`${styles.navItem} ${styles.futureItem}`}
            title={comingSoon}
            aria-label={`${children} — ${comingSoon}`}
            disabled
        >
            <NavIcon name={icon} />
            <span className={styles.navLabel}>{children}</span>
            <span className={styles.soonDot} aria-hidden="true" />
        </button>
    );
}


function NavigationBar() {
    const { t } = useTranslation([
        "common",
        "analysis"
    ]);

    const {
        profile,
        status
    } = useAuthedProfile();

    const [
        sidebarOpen,
        setSidebarOpen
    ] = useState(false);

    const [
        shareOpen,
        setShareOpen
    ] = useState(false);

    const onAnalysisPage =
        location.pathname.startsWith(
            "/analysis"
        );

    const onArchivePage =
        location.pathname.startsWith(
            "/archive"
        );

    const analysisGame = useAnalysisGameStore(
        state => state.analysisGame
    );

    const currentStateTreeNode =
        useAnalysisBoardStore(
            state =>
                state.currentStateTreeNode
        );

    const boardFlipped =
        useAnalysisBoardStore(
            state => state.boardFlipped
        );

    const setBoardFlipped =
        useAnalysisBoardStore(
            state => state.setBoardFlipped
        );

    async function signOut() {
        await authClient.signOut();

        location.href = "/signin";
    }

    const comingSoon = t(
        "navigationBar.comingSoon",
        { ns: "common" }
    );

    return (
        <header className={styles.wrapper}>
            <div className={styles.brandArea}>
                <button
                    type="button"
                    className={styles.menuButton}
                    onClick={() => setSidebarOpen(true)}
                    aria-label={t(
                        "navigationBar.openMenu",
                        { ns: "common" }
                    )}
                >
                    <NavIcon name="menu" />
                </button>

                <a
                    className={styles.logoLink}
                    href="/analysis"
                    aria-label={t(
                        "navigationBar.openAnalysis",
                        { ns: "common" }
                    )}
                >
                    <Typography
                        iconClassName={styles.typographyIcon}
                        textClassName={styles.typographyText}
                        includeIcon
                    />
                </a>
            </div>

            <nav
                className={styles.primaryNavigation}
                aria-label={t(
                    "navigationBar.primaryNavigation",
                    { ns: "common" }
                )}
            >
                <NavigationItem
                    icon="analysis"
                    url="/analysis"
                    current={onAnalysisPage}
                >
                    {t("sidebar.analysis", { ns: "common" })}
                </NavigationItem>

                <NavigationItem
                    icon="archive"
                    url="/archive"
                    current={onArchivePage}
                >
                    {t("sidebar.archive", { ns: "common" })}
                </NavigationItem>

                <FutureItem
                    icon="academy"
                    comingSoon={comingSoon}
                >
                    {t("navigationBar.academy", { ns: "common" })}
                </FutureItem>

                <FutureItem
                    icon="puzzle"
                    comingSoon={comingSoon}
                >
                    {t("navigationBar.puzzles", { ns: "common" })}
                </FutureItem>
            </nav>

            <div className={styles.rightArea}>
                {onAnalysisPage && (
                    <div className={styles.analysisActions}>
                        <button
                            type="button"
                            className={styles.actionButton}
                            onClick={() => (
                                setBoardFlipped(
                                    !boardFlipped
                                )
                            )}
                        >
                            <NavIcon name="flip" />
                            <span className={styles.actionLabel}>
                                {t(
                                    "optionsToolbar.flipBoard",
                                    { ns: "analysis" }
                                )}
                            </span>
                        </button>

                        <button
                            type="button"
                            className={styles.actionButton}
                            onClick={() => setShareOpen(true)}
                        >
                            <NavIcon name="share" />
                            <span className={styles.actionLabel}>
                                {t(
                                    "optionsToolbar.share",
                                    { ns: "analysis" }
                                )}
                            </span>
                        </button>
                    </div>
                )}

                <div className={styles.accountArea}>
                    {status == "pending" && (
                        <span
                            className={styles.sessionLoading}
                            aria-label={t("loading", { ns: "common" })}
                        />
                    )}

                    {status == "success" && (
                        <HoverDropdown
                            dropdownClassName={
                                styles.profileButton
                            }
                            menuClassName={
                                styles.profileMenu
                            }
                            menuPosition="right"
                            openStrategy="click"
                            options={[
                                {
                                    label:
                                        t(
                                            "navigationBar.profileMenu.signOut",
                                            { ns: "common" }
                                        ),
                                    onClick:
                                        signOut
                                }
                            ]}
                        >
                            <NavIcon name="user" />
                            <span className={styles.profileUsername}>
                                {profile.username}
                            </span>
                        </HoverDropdown>
                    )}

                    {status == "error" && (
                        <a
                            className={`${styles.utilityButton} ${styles.signIn}`}
                            href="/signin"
                        >
                            <NavIcon name="login" />
                            <span className={styles.signInLabel}>
                                {t(
                                    "navigationBar.signIn",
                                    { ns: "common" }
                                )}
                            </span>
                        </a>
                    )}

                    <a
                        className={styles.utilityButton}
                        href="/settings"
                        aria-label={t("settings", { ns: "common" })}
                        data-tooltip-id="navigation-bar-settings"
                    >
                        <NavIcon name="settings" />
                    </a>

                    <Tooltip
                        id="navigation-bar-settings"
                        content={t("settings", { ns: "common" })}
                        delayShow={500}
                    />
                </div>
            </div>

            {sidebarOpen && (
                <BlurBackground
                    style={{
                        zIndex: 1000
                    }}
                    onClick={() => (
                        setSidebarOpen(false)
                    )}
                />
            )}

            <Sidebar
                style={{
                    zIndex: 1001,
                    transition:
                        "left 0.3s ease",
                    left:
                        sidebarOpen
                            ? "0"
                            : "-320px"
                }}
                onClose={() => (
                    setSidebarOpen(false)
                )}
            />

            {shareOpen && (
                <ShareDialog
                    game={analysisGame}
                    currentNode={currentStateTreeNode}
                    onClose={() => setShareOpen(false)}
                />
            )}
        </header>
    );
}


export default NavigationBar;
