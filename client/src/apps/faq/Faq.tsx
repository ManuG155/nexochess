import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import * as styles from "./Faq.module.css";

const faqItems = [
    "account",
    "archive",
    "engine",
    "languages",
    "privacy"
] as const;

function Faq() {
    const { t } = useTranslation("helpCenter");

    useEffect(() => {
        document.title = `NexoChess — ${t("faq.eyebrow")}`;
    }, [t]);

    return <main className={styles.faq}>
        <section className={styles.hero} aria-labelledby="faq-title">
            <div className={styles.heroGlow} aria-hidden="true" />

            <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>{t("faq.eyebrow")}</span>
                <h1 id="faq-title">{t("faq.title")}</h1>
                <p>{t("faq.subtitle")}</p>

                <div className={styles.heroActions}>
                    <a className={styles.primaryAction} href="/analysis">
                        {t("actions.openAnalysis")}
                        <span aria-hidden="true">→</span>
                    </a>
                    <a className={styles.secondaryAction} href="/help">
                        {t("navigationTitle")}
                    </a>
                </div>
            </div>

            <aside className={styles.summaryCard} aria-label={t("faq.eyebrow")}>
                <span className={styles.summaryMark} aria-hidden="true">?</span>
                <strong>5</strong>
                <span>{t("faq.eyebrow")}</span>
                <small>{t("hero.languagesBadge")}</small>
            </aside>
        </section>

        <section className={styles.content} aria-label={t("faq.eyebrow")}>
            <div className={styles.sectionHeading}>
                <span>{t("faq.eyebrow")}</span>
                <h2>{t("faq.title")}</h2>
                <p>{t("faq.subtitle")}</p>
            </div>

            <div className={styles.questionList}>
                {faqItems.map(item => (
                    <details className={styles.question} key={item}>
                        <summary>
                            <span>{t(`faq.${item}.question`)}</span>
                            <span className={styles.chevron} aria-hidden="true">+</span>
                        </summary>
                        <div className={styles.answer}>
                            <p>{t(`faq.${item}.answer`)}</p>
                        </div>
                    </details>
                ))}
            </div>
        </section>

        <section className={styles.finalCallout}>
            <div>
                <span className={styles.eyebrow}>{t("contact.eyebrow")}</span>
                <h2>{t("contact.title")}</h2>
                <p>{t("contact.message")}</p>
            </div>

            <a className={styles.secondaryAction} href="/help#contact">
                {t("actions.contact")}
            </a>
        </section>
    </main>;
}

export default Faq;
