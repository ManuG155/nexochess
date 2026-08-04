import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import Typography from "@/components/Typography";
import LanguagesDialog from "@/components/settings/LanguagesDialog";
import { getConsentCopy } from "@/components/privacy/CookieConsent/copy";
import {
    CONTACT_EMAIL,
    createContactBody,
    createGmailComposeUrl
} from "@/lib/contact";
import { manageDataConsent } from "@/lib/consent";

import FooterProps from "./FooterProps";
import * as styles from "./Footer.module.css";

function Footer({ className, style }: FooterProps) {
    const { t, i18n } = useTranslation(["common", "helpCenter"]);
    const [languagesOpen, setLanguagesOpen] = useState(false);

    const copyrightYear = useMemo(
        () => new Date().getFullYear(),
        []
    );

    const consentCopy = useMemo(
        () => getConsentCopy(i18n.resolvedLanguage || i18n.language),
        [i18n.resolvedLanguage, i18n.language]
    );

    const contactUrl = useMemo(() => createGmailComposeUrl({
        subject: `${t("footer.contact")} — NexoChess`,
        body: createContactBody(t("footer.contact"))
    }), [t, i18n.resolvedLanguage]);

    return <footer
        className={`${styles.wrapper} ${className || ""}`}
        style={style}
    >
        <div className={styles.brandSection}>
            <Typography
                iconClassName={styles.typographyIcon}
                textClassName={styles.typographyText}
                includeIcon
            />

            <p className={styles.tagline}>
                {t("footer.tagline")}
            </p>

            <span className={styles.copyrightNotice}>
                {t("footer.copyright", { year: copyrightYear })}
            </span>
        </div>

        <nav className={styles.links} aria-label={t("footer.navigationLabel")}>
            <div className={styles.linkGroup}>
                <a href="/help">
                    {t("navigationTitle", { ns: "helpCenter" })}
                </a>

                <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => setLanguagesOpen(true)}
                >
                    {t("footer.language")}
                </button>

                <a
                    href={contactUrl}
                    target="_blank"
                    rel="noreferrer"
                    title={CONTACT_EMAIL}
                    aria-label={`${t("footer.contact")}: ${CONTACT_EMAIL}`}
                >
                    {t("footer.contact")}
                </a>

                <button
                    type="button"
                    className={styles.linkButton}
                    onClick={manageDataConsent}
                >
                    {consentCopy.footerAction}
                </button>
            </div>

            <div className={styles.linkGroup}>
                <a href="/terms">
                    {t("footer.termsOfService")}
                </a>

                <a href="/privacy">
                    {t("footer.privacyPolicy")}
                </a>

                <a href="/source">
                    {t("footer.openSource")}
                </a>
            </div>
        </nav>

        <div className={styles.footerMeta}>
            <span>
                {t("footer.license")}
            </span>

            <span className={styles.freeGameReview}>
                {t("footer.freeGameReview")}
            </span>
        </div>

        {languagesOpen && <LanguagesDialog
            onClose={() => setLanguagesOpen(false)}
        />}
    </footer>;
}

export default Footer;
