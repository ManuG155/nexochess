import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "@/components/common/Button";
import ButtonColour from "@/components/common/Button/Colour";
import Separator from "@/components/common/Separator";
import LogMessage from "@/components/common/LogMessage";
import { clearLocalArchive } from "@/lib/localGameArchive";

import * as categoryStyles from "../Category.module.css";
import * as styles from "./Privacy.module.css";

function Privacy() {
    const { t } = useTranslation("settings");
    const [archiveCleared, setArchiveCleared] = useState(false);

    async function clearArchive() {
        const confirmed = window.confirm(t("privacySection.archive.confirm"));
        if (!confirmed) return;

        await clearLocalArchive();
        setArchiveCleared(true);
    }

    return (
        <div className={categoryStyles.wrapper}>
            <div className={styles.introduction}>
                <b className={categoryStyles.header}>
                    {t("privacySection.title")}
                </b>
                <span>{t("privacySection.description")}</span>
            </div>

            <Separator className={categoryStyles.separator}/>

            <section className={styles.infoCard}>
                <div className={styles.infoIcon} aria-hidden="true">✓</div>
                <div className={styles.copy}>
                    <h2>{t("privacySection.localData.title")}</h2>
                    <p>{t("privacySection.localData.description")}</p>
                </div>
            </section>

            <Separator className={categoryStyles.separator}/>

            <section className={styles.section}>
                <div className={styles.copy}>
                    <h2>{t("privacySection.archive.title")}</h2>
                    <p>{t("privacySection.archive.description")}</p>
                </div>
                <Button
                    style={{ backgroundColor: ButtonColour.RED }}
                    onClick={() => void clearArchive()}
                >
                    {t("privacySection.archive.clear")}
                </Button>
                {archiveCleared && (
                    <LogMessage theme="success">
                        {t("privacySection.archive.cleared")}
                    </LogMessage>
                )}
            </section>

            <Separator className={categoryStyles.separator}/>

            <section className={styles.linksSection}>
                <div className={styles.copy}>
                    <h2>{t("privacySection.policies.title")}</h2>
                    <p>{t("privacySection.policies.description")}</p>
                </div>
                <div className={styles.links}>
                    <a href="/privacy">
                        {t("privacySection.policies.privacy")}
                    </a>
                    <a href="/terms">
                        {t("privacySection.policies.terms")}
                    </a>
                    <a href="/source">
                        {t("privacySection.policies.source")}
                    </a>
                </div>
            </section>
        </div>
    );
}

export default Privacy;
