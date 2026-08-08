import React, { lazy, ReactNode, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";

import type AnalysedGame from "shared/types/game/AnalysedGame";
import type { StateTreeNode } from "shared/types/game/position/StateTreeNode";

import { useAuthedProfile } from "@/hooks/api/useProfile";
import Typography from "@/components/Typography";
import BlurBackground from "@/components/layout/BlurBackground";
import {
    currentLanguageHref,
    parseLanguagePathname
} from "@/i18n/routing";
import { completePendingAuthAnalytics } from "@/lib/analytics";
import HoverDropdown from "./HoverDropdown";
import * as styles from "./NavigationBar.module.css";

const PUZZLES_FLIP_EVENT = "nexochess:puzzles:flip-board";
const loadSidebar = () => import("@/components/layout/sidebar/Sidebar");
const loadShareDialog = () => import("@analysis/components/ShareDialog");
const Sidebar = lazy(loadSidebar);
const ShareDialog = lazy(loadShareDialog);

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

interface ShareState {
    game: AnalysedGame;
    currentNode: StateTreeNode;
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
        puzzle: <path d="M9.5 4H4v5.5a2.5 2.5 0 1 1 0 5V20h5.5a2.5 2.5 0 1 0 5 0H20v-5.5a2.5 2.5 0 1 0 0-5V4h-5.5a2.5 2.5 0 1 1-5 0Z" />,
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
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.09a2 2 0 0 1 1 1.74v.5a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z" />
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

    return <svg
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
    </svg>;
}

interface NavigationItemProps {
    children: ReactNode;
    current?: boolean;
    icon: IconName;
    url: string;
}

function NavigationItem({ children, current = false, icon, url }: NavigationItemProps) {
    return <a
        className={`${styles.navItem} ${current ? styles.active : ""}`}
        href={url}
        aria-current={current ? "page" : undefined}
    >
        <NavIcon name={icon} />
        <span className={styles.navLabel}>{children}</span>
    </a>;
}

interface NavigationActionProps {
    children: ReactNode;
    icon: IconName;
    onClick: () => void;
}

function NavigationAction({ children, icon, onClick }: NavigationActionProps) {
    return <button
        type="button"
        className={styles.actionButton}
        onClick={onClick}
    >
        <NavIcon name={icon} />
        <span className={styles.actionLabel}>{children}</span>
    </button>;
}

function NavigationBar() {
    const { t } = useTranslation(["common", "analysis"]);
    const { profile, status } = useAuthedProfile();
    const [sidebarMounted, setSidebarMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [shareState, setShareState] = useState<ShareState | null>(null);
    const currentPathname = parseLanguagePathname(location.pathname).basePathname;

    const onAnalysisPage = currentPathname.startsWith("/analysis");
    const onArchivePage = currentPathname.startsWith("/archive");
    const onAcademyPage = currentPathname.startsWith("/academy");
    const onSettingsPage = currentPathname.startsWith("/settings");
    const onPuzzlesPage = currentPathname.startsWith("/puzzles");
    void onSettingsPage;

    const showFlipAction = onAnalysisPage || onPuzzlesPage;
    const showShareAction = onAnalysisPage;
    const analysisHref = currentLanguageHref("/analysis?nexo-nav=1");

    useEffect(() => {
        if (status == "success") {
            completePendingAuthAnalytics(true);
        } else if (status == "error") {
            completePendingAuthAnalytics(false);
        }
    }, [status]);

    async function openSidebar() {
        setSidebarMounted(true);
        await loadSidebar();
        requestAnimationFrame(() => setSidebarOpen(true));
    }

    async function flipVisibleBoard() {
        if (onPuzzlesPage) {
            window.dispatchEvent(new Event(PUZZLES_FLIP_EVENT));
            return;
        }

        if (!onAnalysisPage) return;

        const { default: useAnalysisBoardStore } = await import(
            "@analysis/stores/AnalysisBoardStore"
        );
        const { boardFlipped, setBoardFlipped } = useAnalysisBoardStore.getState();
        setBoardFlipped(!boardFlipped);
    }

    async function openShareDialog() {
        if (!onAnalysisPage) return;

        const [gameStoreModule, boardStoreModule] = await Promise.all([
            import("@analysis/stores/AnalysisGameStore"),
            import("@analysis/stores/AnalysisBoardStore"),
            loadShareDialog()
        ]);

        setShareState({
            game: gameStoreModule.default.getState().analysisGame,
            currentNode: boardStoreModule.default.getState().currentStateTreeNode
        });
    }

    async function signOut() {
        const { default: authClient } = await import("@/lib/auth");
        await authClient.signOut();
        location.href = "/signin";
    }

    return <header className={styles.wrapper}>
        <div className={styles.brandArea}>
            <button
                type="button"
                className={styles.menuButton}
                onClick={() => {
                    void openSidebar();
                }}
                aria-label={t("navigationBar.openMenu", { ns: "common" })}
                aria-controls="nexo-sidebar"
                aria-expanded={sidebarOpen}
            >
                <NavIcon name="menu" />
            </button>

            <a
                className={styles.logoLink}
                href="/home"
                aria-label="NexoChess"
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
            aria-label={t("navigationBar.primaryNavigation", { ns: "common" })}
        >
            <NavigationItem icon="analysis" url={analysisHref} current={onAnalysisPage}>
                {t("sidebar.analysis", { ns: "common" })}
            </NavigationItem>
            <NavigationItem icon="archive" url="/archive" current={onArchivePage}>
                {t("sidebar.archive", { ns: "common" })}
            </NavigationItem>
            {showFlipAction && <NavigationAction icon="flip" onClick={() => {
                void flipVisibleBoard();
            }}>
                {t("optionsToolbar.flipBoard", { ns: "analysis" })}
            </NavigationAction>}
            <NavigationItem icon="academy" url="/academy" current={onAcademyPage}>
                {t("navigationBar.academy", { ns: "common" })}
            </NavigationItem>
            <NavigationItem icon="puzzle" url="/puzzles" current={onPuzzlesPage}>
                {t("navigationBar.puzzles", { ns: "common" })}
            </NavigationItem>
            {showShareAction && <NavigationAction icon="share" onClick={() => {
                void openShareDialog();
            }}>
                {t("navigationBar.share", { ns: "common" })}
            </NavigationAction>}
        </nav>

        <div className={styles.rightArea}>
            {(showFlipAction || showShareAction) && <div className={styles.analysisActions}>
                {showFlipAction && <NavigationAction icon="flip" onClick={() => {
                    void flipVisibleBoard();
                }}>
                    {t("optionsToolbar.flipBoard", { ns: "analysis" })}
                </NavigationAction>}
                {showShareAction && <NavigationAction icon="share" onClick={() => {
                    void openShareDialog();
                }}>
                    {t("navigationBar.share", { ns: "common" })}
                </NavigationAction>}
            </div>}

            <div className={styles.accountArea}>
                {status == "pending" && <span
                    className={styles.sessionLoading}
                    aria-label={t("loading", { ns: "common" })}
                />}
                {status == "success" && <HoverDropdown
                    dropdownClassName={styles.profileButton}
                    menuClassName={styles.profileMenu}
                    menuPosition="right"
                    openStrategy="click"
                    options={[{
                        label: t("navigationBar.profileMenu.signOut", { ns: "common" }),
                        onClick: signOut
                    }]}
                >
                    <NavIcon name="user" />
                    <span className={styles.profileUsername}>{profile.username}</span>
                </HoverDropdown>}
                {status == "error" && <a
                    className={`${styles.utilityButton} ${styles.signIn}`}
                    href="/signin"
                >
                    <NavIcon name="login" />
                    <span className={styles.signInLabel}>
                        {t("navigationBar.signIn", { ns: "common" })}
                    </span>
                </a>}
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

        {sidebarOpen && <BlurBackground
            style={{ zIndex: 1000 }}
            onClick={() => setSidebarOpen(false)}
        />}
        {sidebarMounted && <Suspense fallback={null}>
            <Sidebar
                style={{
                    zIndex: 1001,
                    transition: "left 0.3s ease",
                    left: sidebarOpen ? "0" : "-320px"
                }}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
        </Suspense>}
        {shareState && <Suspense fallback={null}>
            <ShareDialog
                game={shareState.game}
                currentNode={shareState.currentNode}
                onClose={() => setShareState(null)}
            />
        </Suspense>}
    </header>;
}

export default NavigationBar;
