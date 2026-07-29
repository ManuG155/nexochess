import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import * as styles from "./HelpCenter.module.css";

import iconInterfaceHelp from "@assets/img/interface/help.svg";
import iconInterfaceAnalysis from "@assets/img/interface/analysis.svg";
import iconInterfaceUpload from "@assets/img/interface/upload.svg";
import iconInterfaceAccount from "@assets/img/interface/account.svg";
import iconInterfaceSettings from "@assets/img/interface/settings.svg";
import iconInterfaceCopy from "@assets/img/interface/copy.svg";
import iconInterfaceMail from "@assets/img/helpCenter/mail.png";
import iconArchive from "@assets/img/icons/archive.png";

interface TopicCardProps {
    icon: string;
    title: string;
    description: string;
    href: string;
    action: string;
}

function TopicCard({
    icon,
    title,
    description,
    href,
    action
}: TopicCardProps) {
    return <a className={styles.topicCard} href={href}>
        <span className={styles.topicIcon}>
            <img src={icon} alt="" />
        </span>

        <span className={styles.topicContent}>
            <strong>{title}</strong>
            <span>{description}</span>
        </span>

        <span className={styles.topicAction}>{action} →</span>
    </a>;
}

function HelpCenter() {
    const { t } = useTranslation("helpCenter");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        document.title = t("pageTitle");
    }, [t]);

    async function copyEmail() {
        try {
            await navigator.clipboard.writeText("contact@nexochess.com");
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
        } catch {
            window.location.href = "mailto:contact@nexochess.com";
        }
    }

    return <main className={styles.wrapper}>
        <section className={styles.hero}>
            <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>
                    {t("hero.eyebrow")}
                </span>

                <h1>{t("hero.title")}</h1>

                <p>{t("hero.subtitle")}</p>

                <div className={styles.heroActions}>
                    <a className={styles.primaryAction} href="/analysis">
                        <img src={iconInterfaceAnalysis} alt="" />
                        {t("actions.openAnalysis")}
                    </a>

                    <a className={styles.secondaryAction} href="#contact">
                        {t("actions.contact")}
                    </a>
                </div>
            </div>

            <div className={styles.heroVisual} aria-hidden="true">
                <div className={styles.helpOrb}>
                    <img src={iconInterfaceHelp} alt="" />
                </div>

                <div className={`${styles.floatingPill} ${styles.pillOne}`}>
                    PGN
                </div>

                <div className={`${styles.floatingPill} ${styles.pillTwo}`}>
                    Stockfish 17
                </div>

                <div className={`${styles.floatingPill} ${styles.pillThree}`}>
                    {t("hero.languagesBadge")}
                </div>
            </div>
        </section>

        <section className={styles.section}>
            <div className={styles.sectionHeading}>
                <span>{t("topics.eyebrow")}</span>
                <h2>{t("topics.title")}</h2>
                <p>{t("topics.subtitle")}</p>
            </div>

            <div className={styles.topicGrid}>
                <TopicCard
                    icon={iconInterfaceAnalysis}
                    title={t("topics.analysis.title")}
                    description={t("topics.analysis.description")}
                    action={t("topics.analysis.action")}
                    href="/analysis"
                />

                <TopicCard
                    icon={iconInterfaceUpload}
                    title={t("topics.import.title")}
                    description={t("topics.import.description")}
                    action={t("topics.import.action")}
                    href="#import-methods"
                />

                <TopicCard
                    icon={iconArchive}
                    title={t("topics.archive.title")}
                    description={t("topics.archive.description")}
                    action={t("topics.archive.action")}
                    href="/archive"
                />

                <TopicCard
                    icon={iconInterfaceSettings}
                    title={t("topics.settings.title")}
                    description={t("topics.settings.description")}
                    action={t("topics.settings.action")}
                    href="/settings"
                />
            </div>
        </section>

        <section className={`${styles.section} ${styles.stepsSection}`}>
            <div className={styles.sectionHeading}>
                <span>{t("steps.eyebrow")}</span>
                <h2>{t("steps.title")}</h2>
                <p>{t("steps.subtitle")}</p>
            </div>

            <div className={styles.stepsGrid}>
                {["choose", "import", "review"].map((step, index) => (
                    <article className={styles.stepCard} key={step}>
                        <span className={styles.stepNumber}>0{index + 1}</span>
                        <h3>{t(`steps.${step}.title`)}</h3>
                        <p>{t(`steps.${step}.description`)}</p>
                    </article>
                ))}
            </div>
        </section>

        <section className={styles.section} id="import-methods">
            <div className={styles.sectionHeading}>
                <span>{t("imports.eyebrow")}</span>
                <h2>{t("imports.title")}</h2>
                <p>{t("imports.subtitle")}</p>
            </div>

            <div className={styles.importGrid}>
                {[
                    ["PGN", "pgn"],
                    ["Chess.com", "chessCom"],
                    ["Lichess", "lichess"],
                    ["FEN", "fen"]
                ].map(([label, key]) => (
                    <article className={styles.importCard} key={key}>
                        <span className={styles.importBadge}>{label}</span>
                        <h3>{t(`imports.${key}.title`)}</h3>
                        <p>{t(`imports.${key}.description`)}</p>
                    </article>
                ))}
            </div>
        </section>

        <section className={`${styles.section} ${styles.faqSection}`}>
            <div className={styles.sectionHeading}>
                <span>{t("faq.eyebrow")}</span>
                <h2>{t("faq.title")}</h2>
                <p>{t("faq.subtitle")}</p>
            </div>

            <div className={styles.faqList}>
                {["account", "archive", "engine", "languages", "privacy"]
                    .map(item => (
                        <details className={styles.faqItem} key={item}>
                            <summary>{t(`faq.${item}.question`)}</summary>
                            <p>{t(`faq.${item}.answer`)}</p>
                        </details>
                    ))
                }
            </div>
        </section>

        <section className={styles.contactCard} id="contact">
            <div className={styles.contactIcon}>
                <img src={iconInterfaceMail} alt="" />
            </div>

            <div className={styles.contactCopy}>
                <span>{t("contact.eyebrow")}</span>
                <h2>{t("contact.title")}</h2>
                <p>{t("contact.message")}</p>
            </div>

            <div className={styles.contactActions}>
                <a href="mailto:contact@nexochess.com">
                    contact@nexochess.com
                </a>

                <button type="button" onClick={copyEmail}>
                    <img src={iconInterfaceCopy} alt="" />
                    {t(copied ? "contact.copied" : "contact.copy")}
                </button>
            </div>
        </section>
    </main>;
}

export default HelpCenter;
