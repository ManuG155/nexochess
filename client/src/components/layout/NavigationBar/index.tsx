import React, { useState } from "react";
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
import Button from "@/components/common/Button";
import BlurBackground from
    "@/components/layout/BlurBackground";

import Sidebar from
    "@/components/layout/sidebar/Sidebar";

import authClient from "@/lib/auth";

import HoverDropdown from "./HoverDropdown";

import * as styles from "./NavigationBar.module.css";


import iconInterfaceMenu from
    "@assets/img/interface/menu.svg";

import iconIconsAnalysis from
    "@assets/img/icons/analysis.png";

import iconIconsArchive from
    "@assets/img/icons/archive.png";

import iconIconsNews from
    "@assets/img/icons/news.png";

import iconKofi from
    "@assets/img/kofi.svg";

import iconInterfaceSignin from
    "@assets/img/interface/sign_in.svg";

import iconInterfaceAccount from
    "@assets/img/interface/account.svg";

import iconIconsSettings from
    "@assets/img/icons/settings.png";

import iconFlip from
    "@assets/img/interface/flip.svg";

import iconShare from
    "@assets/img/interface/share.svg";


function NavigationBar() {
    const { t } = useTranslation([
        "common",
        "analysis"
    ]);

    const {
        profile,
        status
    } = useAuthedProfile();

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const [shareOpen, setShareOpen] =
        useState(false);


    const onAnalysisPage =
        location.pathname.startsWith(
            "/analysis"
        );


    const analysisGame =
        useAnalysisGameStore(
            state => state.analysisGame
        );


    const {
        currentStateTreeNode,
        boardFlipped,
        setBoardFlipped
    } = useAnalysisBoardStore();


    async function signOut() {
        await authClient.signOut();

        location.href = "/signin";
    }


    return (
        <div className={styles.wrapper}>

            <div className={styles.section}>

                <div className={styles.section}>
                    <img
                        className={styles.menuButton}
                        src={iconInterfaceMenu}
                        height={35}
                        onClick={() => (
                            setSidebarOpen(true)
                        )}
                    />

                    <Typography
                        textClassName={
                            styles.typographyText
                        }
                        includeIcon
                    />
                </div>


                <div className={styles.tabs}>

                    <HoverDropdown
                        icon={iconIconsAnalysis}
                        url="/analysis"
                    >
                        {t(
                            "sidebar.analysis",
                            { ns: "common" }
                        )}
                    </HoverDropdown>


                    <HoverDropdown
                        icon={iconIconsArchive}
                        url="/archive"
                    >
                        {t(
                            "sidebar.archive",
                            { ns: "common" }
                        )}
                    </HoverDropdown>


                    <HoverDropdown
                        icon={iconIconsNews}
                        url="/news"
                    >
                        {t(
                            "sidebar.news",
                            { ns: "common" }
                        )}
                    </HoverDropdown>


                    {onAnalysisPage && (
                        <button
                            type="button"
                            className={
                                styles.navAction
                            }
                            onClick={() => (
                                setBoardFlipped(
                                    !boardFlipped
                                )
                            )}
                        >
                            <img
                                src={iconFlip}
                                alt=""
                            />

                            <span>
                                {t(
                                    "optionsToolbar.flipBoard",
                                    { ns: "analysis" }
                                )}
                            </span>
                        </button>
                    )}

                </div>

            </div>


            <div className={styles.section}>

                <a
                    href="https://ko-fi.com/wintrcat"
                    target="_blank"
                >
                    <Button
                        className={styles.support}
                        icon={iconKofi}
                        tooltipId={
                            "navigation-bar-support"
                        }
                    />
                </a>


                <Tooltip
                    id="navigation-bar-support"
                    content={t(
                        "navigationBar.tooltips.support",
                        { ns: "common" }
                    )}
                    delayShow={500}
                />


                {onAnalysisPage && (
                    <>
                        <Button
                            className={
                                styles.topAction
                            }
                            icon={iconShare}
                            iconSize="28px"
                            tooltipId={
                                "navigation-bar-share"
                            }
                            onClick={() => (
                                setShareOpen(true)
                            )}
                        />

                        <Tooltip
                            id="navigation-bar-share"
                            content={t(
                                "optionsToolbar.share",
                                { ns: "analysis" }
                            )}
                            delayShow={500}
                        />
                    </>
                )}


                {status == "pending" && (
                    <span>
                        {t(
                            "loading",
                            { ns: "common" }
                        )}
                    </span>
                )}


                {status == "success" && (
                    <HoverDropdown
                        dropdownClassName={
                            styles.profileMenu
                        }
                        menuPosition="right"
                        openStrategy="click"
                        options={[
                            {
                                icon:
                                    iconInterfaceSignin,

                                label:
                                    t(
                                        "navigationBar"
                                        + ".profileMenu"
                                        + ".signOut",
                                        { ns: "common" }
                                    ),

                                onClick:
                                    signOut
                            }
                        ]}
                    >
                        <span
                            className={
                                styles.profileUsername
                            }
                        >
                            {profile.username}
                        </span>

                        <img
                            className={
                                styles.profileIcon
                            }
                            src={
                                iconInterfaceAccount
                            }
                        />
                    </HoverDropdown>
                )}


                {status == "error" && (
                    <a href="/signin">
                        <Button
                            className={
                                styles.signIn
                            }
                            icon={
                                iconInterfaceSignin
                            }
                            iconSize="28px"
                        >
                            {t(
                                "navigationBar.signIn",
                                { ns: "common" }
                            )}
                        </Button>
                    </a>
                )}


                {/*
                 * ÚNICO ACCESO A SETTINGS.
                 * Siempre arriba a la derecha.
                 */}
                <a href="/settings">
                    <Button
                        className={
                            styles.topAction
                        }
                        icon={
                            iconIconsSettings
                        }
                        iconSize="28px"
                        tooltipId={
                            "navigation-bar-settings"
                        }
                    />
                </a>


                <Tooltip
                    id="navigation-bar-settings"
                    content={t(
                        "settings",
                        { ns: "common" }
                    )}
                    delayShow={500}
                />

            </div>


            {sidebarOpen && (
                <BlurBackground
                    style={{ zIndex: 1000 }}
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
                    currentNode={
                        currentStateTreeNode
                    }
                    onClose={() => (
                        setShareOpen(false)
                    )}
                />
            )}

        </div>
    );
}


export default NavigationBar;