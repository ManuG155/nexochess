import React, { KeyboardEvent, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import SidebarTab from "../SidebarTab";
import Separator from "@/components/common/Separator";
import Typography from "@/components/Typography";

import SidebarProps from "./SidebarProps";
import * as styles from "./Sidebar.module.css";

import iconInterfaceClose from "@assets/img/interface/close.svg";
import iconIconsAnalysis from "@assets/img/icons/analysis.png";
import iconIconsArchive from "@assets/img/icons/archive.png";
import iconIconsAcademy from "@assets/img/icons/academy.svg";
import iconIconsPuzzles from "@assets/img/icons/puzzles.svg";
import iconIconsSettings from "@assets/img/icons/settings.png";

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
].join(",");

function Sidebar({ style, onClose, open = true }: SidebarProps) {
    const { t } = useTranslation("common");
    const sidebarRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) return;

        previousFocusRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        const frame = requestAnimationFrame(() => {
            sidebarRef.current
                ?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
                ?.focus();
        });

        return () => {
            cancelAnimationFrame(frame);
            previousFocusRef.current?.focus();
        };
    }, [open]);

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape") {
            event.preventDefault();
            onClose?.();
            return;
        }

        if (event.key !== "Tab") return;

        const focusable = Array.from(
            sidebarRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) || []
        ).filter(element => element.offsetParent !== null);

        if (focusable.length === 0) {
            event.preventDefault();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    const tabIndex = open ? 0 : -1;

    return <div
        id="nexo-sidebar"
        ref={sidebarRef}
        className={styles.sidebar}
        style={style}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-label={t("navigationBar.primaryNavigation")}
        onClick={event => event.stopPropagation()}
        onKeyDown={open ? handleKeyDown : undefined}
    >
        <div className={styles.titleSection}>
            <button
                type="button"
                className={styles.closeButton}
                aria-label={t("dialog.close")}
                tabIndex={tabIndex}
                onClick={onClose}
            >
                <img
                    src={iconInterfaceClose}
                    alt=""
                    aria-hidden="true"
                />
            </button>

            <a
                className={styles.titleLink}
                href="/analysis"
                aria-label={t("navigationBar.openAnalysis")}
                tabIndex={tabIndex}
            >
                <Typography className={styles.title} includeIcon/>
            </a>
        </div>

        <div style={{ padding: "0 10px" }}>
            <Separator style={{ margin: 0 }} />
        </div>

        <div className={styles.tabs}>
            <div className={styles.tabSection}>
                <SidebarTab
                    url="/analysis"
                    icon={iconIconsAnalysis}
                    style={{ width: "100%" }}
                    tabIndex={tabIndex}
                >
                    {t("sidebar.analysis")}
                </SidebarTab>

                <SidebarTab
                    url="/archive"
                    icon={iconIconsArchive}
                    iconSize="20px"
                    style={{ width: "100%" }}
                    tabIndex={tabIndex}
                >
                    {t("sidebar.archive")}
                </SidebarTab>

                <SidebarTab
                    url="/academy"
                    icon={iconIconsAcademy}
                    iconSize="22px"
                    style={{ width: "100%" }}
                    tabIndex={tabIndex}
                >
                    {t("navigationBar.academy")}
                </SidebarTab>

                <SidebarTab
                    url="/puzzles"
                    icon={iconIconsPuzzles}
                    iconSize="22px"
                    style={{ width: "100%" }}
                    tabIndex={tabIndex}
                >
                    {t("navigationBar.puzzles")}
                </SidebarTab>
            </div>

            <div className={styles.tabSection}>
                <SidebarTab
                    url="/settings"
                    icon={iconIconsSettings}
                    style={{ width: "100%" }}
                    tabIndex={tabIndex}
                >
                    {t("settings")}
                </SidebarTab>
            </div>
        </div>
    </div>;
}

export default Sidebar;
