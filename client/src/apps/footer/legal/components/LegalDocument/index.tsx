import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import iconLogo from "@assets/img/nexochess-icon-white.png";

import * as styles from "../../index.module.css";

export interface LegalSection {
    title: string;
    paragraphs?: string[];
    bullets?: string[];
}

export interface LegalDocumentCopy {
    pageTitle?: string;
    title?: string;
    summary?: string;
    plainTitle?: string;
    plainSummary?: string;
    updated?: string;
    sections?: Record<string, LegalSection>;
}

interface LegalDocumentProps {
    documentKey: "terms" | "privacy";
    sectionOrder: string[];
    copy?: LegalDocumentCopy;
}

const privacyResources = [
    {
        key: "cloudflare",
        label: "Cloudflare",
        url: "https://www.cloudflare.com/privacypolicy/"
    },
    { key: "google", url: "https://policies.google.com/privacy" },
    { key: "brevo", url: "https://www.brevo.com/legal/privacypolicy/" },
    { key: "chessCom", url: "https://www.chess.com/legal/privacy" },
    { key: "lichess", url: "https://lichess.org/privacy" }
];

function LegalDocument({ documentKey, sectionOrder, copy }: LegalDocumentProps) {
    const { t } = useTranslation("legal");
    const pageTitle = copy?.pageTitle || t(`${documentKey}.pageTitle`);

    useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);

    const translatedSections = t(`${documentKey}.sections`, {
        returnObjects: true
    }) as Record<string, LegalSection>;
    const sections = {
        ...translatedSections,
        ...(copy?.sections || {})
    };

    return <main className={styles.wrapper}>
        <div className={styles.shell}>
            <header className={styles.hero}>
                <div className={styles.heroTopline}>
                    <img src={iconLogo} alt="" aria-hidden="true" />
                    <span>{t("common.legalLabel")}</span>
                </div>

                <h1>{copy?.title || t(`${documentKey}.title`)}</h1>
                <p>{copy?.summary || t(`${documentKey}.summary`)}</p>

                <div className={styles.metaRow}>
                    <span>{copy?.updated || t("common.updated")}</span>
                    <a href="mailto:contact@nexochess.com">
                        contact@nexochess.com
                    </a>
                </div>
            </header>

            <div className={styles.documentLayout}>
                <aside className={styles.contentsCard}>
                    <span className={styles.contentsTitle}>
                        {t("common.contents")}
                    </span>
                    <nav>
                        {sectionOrder.map((sectionKey, index) => (
                            <a key={sectionKey} href={`#${sectionKey}`}>
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                {sections[sectionKey]?.title}
                            </a>
                        ))}
                    </nav>
                </aside>

                <article className={styles.document}>
                    <section className={styles.summaryCard}>
                        <strong>{copy?.plainTitle || t(`${documentKey}.plainTitle`)}</strong>
                        <p>{copy?.plainSummary || t(`${documentKey}.plainSummary`)}</p>
                    </section>

                    {sectionOrder.map((sectionKey, index) => {
                        const section = sections[sectionKey];
                        if (!section) return null;

                        return <section
                            key={sectionKey}
                            id={sectionKey}
                            className={styles.legalSection}
                        >
                            <div className={styles.sectionNumber}>
                                {String(index + 1).padStart(2, "0")}
                            </div>
                            <div className={styles.sectionContent}>
                                <h2>{section.title}</h2>

                                {section.paragraphs?.map((paragraph, paragraphIndex) => (
                                    <p key={paragraphIndex}>{paragraph}</p>
                                ))}

                                {section.bullets && section.bullets.length > 0 && (
                                    <ul>
                                        {section.bullets.map((bullet, bulletIndex) => (
                                            <li key={bulletIndex}>{bullet}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>;
                    })}

                    {documentKey == "privacy" && <section className={styles.resourcesCard}>
                        <div>
                            <strong>{t("privacy.resources.title")}</strong>
                            <p>{t("privacy.resources.description")}</p>
                        </div>
                        <div className={styles.resourceLinks}>
                            {privacyResources.map(resource => (
                                <a
                                    key={resource.key}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {resource.label
                                        || t(`privacy.resources.${resource.key}`)}
                                </a>
                            ))}
                        </div>
                    </section>}

                    <section className={styles.contactCard}>
                        <div>
                            <strong>{t("common.contactTitle")}</strong>
                            <p>{t("common.contactDescription")}</p>
                        </div>
                        <a href="mailto:contact@nexochess.com">
                            {t("common.contactButton")}
                        </a>
                    </section>
                </article>
            </div>
        </div>
    </main>;
}

export default LegalDocument;