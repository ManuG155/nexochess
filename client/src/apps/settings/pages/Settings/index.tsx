import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate } from "react-router-dom";

import { useAuthedProfile } from "@/hooks/api/useProfile";
import LoadingPlaceholder from "@/components/layout/LoadingPlaceholder";
import CategoryTab from "@/apps/settings/components/CategoryTab";
import { manageDataConsent } from "@/lib/consent";

import * as styles from "./Settings.module.css";


function Settings() {
    const { t } = useTranslation([
        "settings",
        "common",
        "helpCenter"
    ]);

    const navigate = useNavigate();

    const { status } = useAuthedProfile();


    return (
        <div className={styles.wrapper}>
            <div className={styles.settingsContainer}>

                {/*
                 * MENÚ LATERAL
                 *
                 * Lo ponemos primero para que aparezca
                 * a la izquierda del contenido.
                 */}
                <aside className={styles.categories}>

                    {status == "success" && (
                        <CategoryTab
                            className={styles.categoryTab}
                            active={
                                location.pathname.includes(
                                    "/settings/account"
                                )
                            }
                            onClick={() => (
                                navigate("/settings/account")
                            )}
                        >
                            <span className={styles.categoryLabel}>
                                <span
                                    className={styles.categoryIcon}
                                    aria-hidden="true"
                                >
                                    ●
                                </span>

                                <span>
                                    {t("account.title")}
                                </span>
                            </span>
                        </CategoryTab>
                    )}


                    <CategoryTab
                        className={styles.categoryTab}
                        active={
                            location.pathname.includes(
                                "/settings/theme"
                            )
                        }
                        onClick={() => (
                            navigate("/settings/theme")
                        )}
                    >
                        <span className={styles.categoryLabel}>
                            <span
                                className={styles.categoryIcon}
                                aria-hidden="true"
                            >
                                ♟
                            </span>

                            <span>
                                {t("boardAndPieces.title")}
                            </span>
                        </span>
                    </CategoryTab>


                    <CategoryTab
                        className={styles.categoryTab}
                        active={
                            location.pathname.includes(
                                "/settings/analysis"
                            )
                        }
                        onClick={() => (
                            navigate("/settings/analysis")
                        )}
                    >
                        <span className={styles.categoryLabel}>
                            <span
                                className={styles.categoryIcon}
                                aria-hidden="true"
                            >
                                ◎
                            </span>

                            <span>
                                {t("analysis.title")}
                            </span>
                        </span>
                    </CategoryTab>


                    <CategoryTab
                        className={styles.categoryTab}
                        active={
                            location.pathname.includes(
                                "/settings/bugs"
                            )
                        }
                        onClick={() => (
                            navigate("/settings/bugs")
                        )}
                    >
                        <span className={styles.categoryLabel}>
                            <span
                                className={styles.categoryIcon}
                                aria-hidden="true"
                            >
                                !
                            </span>

                            <span>
                                {t("bugReporting.title")}
                            </span>
                        </span>
                    </CategoryTab>


                    <hr className={styles.separator} />


                    <CategoryTab
                        className={styles.categoryTab}
                        onClick={manageDataConsent}
                    >
                        <span className={styles.categoryLabel}>
                            <span
                                className={styles.categoryIcon}
                                aria-hidden="true"
                            >
                                ◆
                            </span>

                            <span>
                                {t("privacy")}
                            </span>
                        </span>
                    </CategoryTab>


                    <CategoryTab
                        className={styles.categoryTab}
                        onClick={() => {
                            location.href = "/help";
                        }}
                    >
                        <span className={styles.categoryLabel}>
                            <span
                                className={styles.categoryIcon}
                                aria-hidden="true"
                            >
                                ?
                            </span>

                            <span>
                                {t(
                                    "title",
                                    { ns: "helpCenter" }
                                )}
                            </span>
                        </span>
                    </CategoryTab>

                </aside>


                {/*
                 * CONTENIDO PRINCIPAL
                 */}
                <main className={styles.settings}>
                    <Suspense
                        fallback={
                            <LoadingPlaceholder />
                        }
                    >
                        <Outlet />
                    </Suspense>
                </main>

            </div>
        </div>
    );
}


export default Settings;