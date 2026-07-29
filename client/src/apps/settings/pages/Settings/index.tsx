import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate } from "react-router-dom";

import CategoryTab from "@/apps/settings/components/CategoryTab";

import * as styles from "./Settings.module.css";

function UserIcon() {
    return (
        <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor">
            <path d="M12 12a4.35 4.35 0 1 0 0-8.7 4.35 4.35 0 0 0 0 8.7Zm0 2c-4.58 0-8.3 2.37-8.3 5.3 0 .77.63 1.4 1.4 1.4h13.8c.77 0 1.4-.63 1.4-1.4 0-2.93-3.72-5.3-8.3-5.3Z"/>
        </svg>
    );
}

function CoachIcon() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="m2.4 8.1 9.6-4.8 9.6 4.8-3.25 1.63v4.02c0 .55-.3 1.06-.78 1.33A11.15 11.15 0 0 1 12 16.6a11.15 11.15 0 0 1-5.57-1.52 1.53 1.53 0 0 1-.78-1.33V9.73L2.4 8.1Zm17.95 2.4v5.14a.9.9 0 0 1-1.8 0v-4.23l1.8-.91Z"/>
        </svg>
    );
}

function PrivacyIcon() {
    return (
        <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor">
            <path d="M12 2.5 20 5.7v5.7c0 5.05-3.35 8.52-8 10.1-4.65-1.58-8-5.05-8-10.1V5.7L12 2.5Zm0 2.05L6 6.95v4.45c0 3.85 2.4 6.67 6 8.05 3.6-1.38 6-4.2 6-8.05V6.95l-6-2.4Zm-.9 4.05h1.8v4.05h-1.8V8.6Zm0 5.2h1.8v1.8h-1.8v-1.8Z"/>
        </svg>
    );
}

function Settings() {
    const { t } = useTranslation(["settings", "helpCenter"]);
    const navigate = useNavigate();
    const path = location.pathname;

    return (
        <div className={styles.wrapper}>
            <div className={styles.settingsContainer}>
                <aside className={styles.categories}>
                    <CategoryTab
                        className={styles.categoryTab}
                        active={path.includes("/settings/user")}
                        onClick={() => navigate("/settings/user")}
                    >
                        <span className={styles.categoryLabel}>
                            <span className={styles.categoryIcon} aria-hidden="true"><UserIcon/></span>
                            <span>{t("user.title")}</span>
                        </span>
                    </CategoryTab>

                    <CategoryTab
                        className={styles.categoryTab}
                        active={path.includes("/settings/analysis")}
                        onClick={() => navigate("/settings/analysis")}
                    >
                        <span className={styles.categoryLabel}>
                            <span className={styles.categoryIcon} aria-hidden="true">◎</span>
                            <span>{t("analysis.title")}</span>
                        </span>
                    </CategoryTab>

                    <CategoryTab
                        className={styles.categoryTab}
                        active={path.includes("/settings/appearance")}
                        onClick={() => navigate("/settings/appearance")}
                    >
                        <span className={styles.categoryLabel}>
                            <span className={styles.categoryIcon} aria-hidden="true">◐</span>
                            <span>{t("appearance.title")}</span>
                        </span>
                    </CategoryTab>

                    <CategoryTab
                        className={styles.categoryTab}
                        active={path.includes("/settings/coach")}
                        onClick={() => navigate("/settings/coach")}
                    >
                        <span className={styles.categoryLabel}>
                            <span className={styles.categoryIcon} aria-hidden="true"><CoachIcon/></span>
                            <span>{t("coach.title")}</span>
                        </span>
                    </CategoryTab>

                    <CategoryTab
                        className={styles.categoryTab}
                        active={path.includes("/settings/bugs")}
                        onClick={() => navigate("/settings/bugs")}
                    >
                        <span className={styles.categoryLabel}>
                            <span className={styles.categoryIcon} aria-hidden="true">!</span>
                            <span>{t("bugReporting.title")}</span>
                        </span>
                    </CategoryTab>

                    <hr className={styles.separator}/>

                    <CategoryTab
                        className={styles.categoryTab}
                        active={path.includes("/settings/privacy")}
                        onClick={() => navigate("/settings/privacy")}
                    >
                        <span className={styles.categoryLabel}>
                            <span className={styles.categoryIcon} aria-hidden="true"><PrivacyIcon/></span>
                            <span>{t("privacy")}</span>
                        </span>
                    </CategoryTab>

                    <CategoryTab
                        className={styles.categoryTab}
                        onClick={() => { location.href = "/help"; }}
                    >
                        <span className={styles.categoryLabel}>
                            <span className={styles.categoryIcon} aria-hidden="true">?</span>
                            <span>{t("navigationTitle", { ns: "helpCenter" })}</span>
                        </span>
                    </CategoryTab>
                </aside>

                <main className={styles.settings}>
                    <Suspense fallback={null}>
                        <Outlet/>
                    </Suspense>
                </main>
            </div>
        </div>
    );
}

export default Settings;
