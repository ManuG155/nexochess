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

    /*
     * Usamos traducciones de:
     *
     * common
     * analysis
     */
    const { t } = useTranslation([
        "common",
        "analysis"
    ]);


    /*
     * Información del usuario autenticado.
     */
    const {
        profile,
        status
    } = useAuthedProfile();


    /*
     * Control del menú lateral para
     * pantallas pequeñas.
     */
    const [
        sidebarOpen,
        setSidebarOpen
    ] = useState(false);


    /*
     * Control del diálogo de compartir.
     */
    const [
        shareOpen,
        setShareOpen
    ] = useState(false);


    /*
     * Solo mostramos Flip Board y Share
     * cuando estamos en la página Analysis.
     */
    const onAnalysisPage =
        location.pathname.startsWith(
            "/analysis"
        );


    /*
     * Partida actualmente cargada.
     *
     * ShareDialog necesita esta información.
     */
    const analysisGame = useAnalysisGameStore(
        state => state.analysisGame
    );


    /*
     * Nodo actual del árbol de posiciones.
     *
     * ShareDialog también lo necesita.
     */
    const currentStateTreeNode =
        useAnalysisBoardStore(
            state =>
                state.currentStateTreeNode
        );


    /*
     * Estado de orientación del tablero.
     */
    const boardFlipped =
        useAnalysisBoardStore(
            state => state.boardFlipped
        );


    /*
     * Función para cambiar
     * la orientación del tablero.
     */
    const setBoardFlipped =
        useAnalysisBoardStore(
            state => state.setBoardFlipped
        );


    /*
     * Cerrar sesión.
     */
    async function signOut() {
        await authClient.signOut();

        location.href = "/signin";
    }


    return (
        <div className={styles.wrapper}>

            {/*
             * =====================================================
             * ZONA IZQUIERDA
             * =====================================================
             *
             * Logo
             * Analysis
             * Archive
             * Flip Board
             * Share
             */}
            <div className={styles.section}>

                {/*
                 * Logo + botón menú móvil
                 */}
                <div className={styles.section}>

                    <img
                        className={
                            styles.menuButton
                        }
                        src={
                            iconInterfaceMenu
                        }
                        height={35}
                        onClick={() => (
                            setSidebarOpen(true)
                        )}
                    />


                    <a
                        className={styles.logoLink}
                        href="/analysis"
                        aria-label={t("navigationBar.openAnalysis", { ns: "common" })}
                    >
                        <Typography
                            iconClassName={styles.typographyIcon}
                            textClassName={styles.typographyText}
                            includeIcon
                        />
                    </a>

                </div>


                {/*
                 * Navegación principal
                 */}
                <div className={styles.tabs}>

                    {/*
                     * ANALYSIS
                     */}
                    <HoverDropdown
                        icon={
                            iconIconsAnalysis
                        }
                        url="/analysis"
                    >
                        {t(
                            "sidebar.analysis",
                            { ns: "common" }
                        )}
                    </HoverDropdown>


                    {/*
                     * ARCHIVE
                     */}
                    <HoverDropdown
                        icon={
                            iconIconsArchive
                        }
                        url="/archive"
                    >
                        {t(
                            "sidebar.archive",
                            { ns: "common" }
                        )}
                    </HoverDropdown>


                    {/*
                     * FLIP BOARD
                     *
                     * Solo en /analysis.
                     *
                     * Usa nuestra clase navAction
                     * para tener la misma animación
                     * inferior azul que Analysis
                     * y Archive.
                     */}
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
                                    "optionsToolbar"
                                    + ".flipBoard",
                                    {
                                        ns:
                                            "analysis"
                                    }
                                )}
                            </span>
                        </button>
                    )}


                    {/*
                     * SHARE
                     *
                     * Ahora vive al lado
                     * de Flip Board.
                     *
                     * Ya NO estará como
                     * icono suelto a la derecha.
                     */}
                    {onAnalysisPage && (
                        <button
                            type="button"
                            className={
                                styles.navAction
                            }
                            onClick={() => (
                                setShareOpen(true)
                            )}
                        >
                            <img
                                src={iconShare}
                                alt=""
                            />

                            <span>
                                {t(
                                    "optionsToolbar"
                                    + ".share",
                                    {
                                        ns:
                                            "analysis"
                                    }
                                )}
                            </span>
                        </button>
                    )}

                </div>

            </div>


            {/*
             * =====================================================
             * ZONA DERECHA
             * =====================================================
             *
             * Usuario / Sign In
             * Settings
             *
             * NO Ko-fi.
             * NO Share.
             */}
            <div className={styles.section}>

                {/*
                 * Mientras se comprueba
                 * la sesión del usuario.
                 */}
                {status == "pending" && (
                    <span>
                        {t(
                            "loading",
                            { ns: "common" }
                        )}
                    </span>
                )}


                {/*
                 * USUARIO CON SESIÓN INICIADA
                 */}
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
                                        {
                                            ns:
                                                "common"
                                        }
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


                {/*
                 * USUARIO NO AUTENTICADO
                 */}
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
                                "navigationBar"
                                + ".signIn",
                                {
                                    ns:
                                        "common"
                                }
                            )}
                        </Button>

                    </a>
                )}


                {/*
                 * SETTINGS
                 *
                 * Este es el ÚNICO acceso
                 * principal a Settings.
                 *
                 * Siempre está visible
                 * arriba a la derecha.
                 */}
                <a href="/settings">

                    <Button
                        className={
                            styles.settings
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
                    id={
                        "navigation-bar-settings"
                    }
                    content={t(
                        "settings",
                        { ns: "common" }
                    )}
                    delayShow={500}
                />

            </div>


            {/*
             * Fondo desenfocado
             * cuando se abre el Sidebar.
             */}
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


            {/*
             * Sidebar móvil.
             */}
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


            {/*
             * SHARE DIALOG.
             *
             * Sigue existiendo exactamente
             * igual que antes.
             *
             * Lo único que hemos cambiado
             * es el botón que lo abre.
             */}
            {shareOpen && (
                <ShareDialog
                    game={
                        analysisGame
                    }
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