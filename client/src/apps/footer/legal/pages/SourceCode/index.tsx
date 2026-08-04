import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import iconLogo from "@assets/img/nexochess-icon-white.png";

import { getLichessAttributionCopy } from "./lichessAttributionCopy";
import * as styles from "../../index.module.css";

const NEXOCHESS_SOURCE_URL = "https://github.com/ManuG155/nexochess";
const STOCKFISH_SOURCE_URL =
    "https://github.com/nmrugg/stockfish.js/tree/fe65b8845c65fd389a56887e004fa0a3436159e2";

function SourceCode() {
    const { t, i18n } = useTranslation("legal");
    const sourceCodeUrl = process.env.SOURCE_CODE_URL?.trim()
        || NEXOCHESS_SOURCE_URL;
    const [showSourceRequest, setShowSourceRequest] = useState(false);
    const [emailCopied, setEmailCopied] = useState(false);

    useEffect(() => {
        document.title = t("source.pageTitle");
    }, [t]);

    const sourceRequestMailto = useMemo(() => {
        const subject = t("source.nexochess.requestSubject");
        const body = t("source.nexochess.requestBody");

        return `mailto:contact@nexochess.com?subject=${encodeURIComponent(subject)}`
            + `&body=${encodeURIComponent(body)}`;
    }, [t]);

    const lichessCopy = useMemo(
        () => getLichessAttributionCopy(
            i18n.resolvedLanguage || i18n.language
        ),
        [i18n.resolvedLanguage, i18n.language]
    );

    async function copyContactEmail() {
        try {
            await navigator.clipboard.writeText("contact@nexochess.com");
            setEmailCopied(true);
            window.setTimeout(() => setEmailCopied(false), 2200);
        } catch {
            window.location.href = sourceRequestMailto;
        }
    }

    return <main className={styles.wrapper}>
        <div className={styles.shell}>
            <header className={styles.hero}>
                <div className={styles.heroTopline}>
                    <img src={iconLogo} alt="" aria-hidden="true" />
                    <span>{t("common.legalLabel")}</span>
                </div>
                <h1>{t("source.title")}</h1>
                <p>{t("source.summary")}</p>
            </header>

            <div className={styles.sourceGrid}>
                <section className={styles.sourceCard}>
                    <span className={styles.sourceBadge}>GPL-3.0</span>
                    <h2>{t("source.nexochess.title")}</h2>
                    <p>{t("source.nexochess.description")}</p>
                    {sourceCodeUrl ? <a
                        href={sourceCodeUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t("source.nexochess.openRepository")}
                    </a> : <>
                        <button
                            type="button"
                            className={styles.sourceAction}
                            aria-expanded={showSourceRequest}
                            onClick={() => setShowSourceRequest(value => !value)}
                        >
                            {t("source.nexochess.requestSource")}
                        </button>
                        {showSourceRequest && <div className={styles.sourceRequestBox}>
                            <p>{t("source.nexochess.requestInstructions")}</p>
                            <div className={styles.sourceRequestActions}>
                                <button type="button" onClick={() => void copyContactEmail()}>
                                    {emailCopied
                                        ? t("source.nexochess.copied")
                                        : t("source.nexochess.copyEmail")}
                                </button>
                                <a href={sourceRequestMailto}>
                                    {t("source.nexochess.openEmail")}
                                </a>
                            </div>
                        </div>}
                    </>}
                </section>

                <section className={styles.sourceCard}>
                    <span className={styles.sourceBadge}>{t("source.upstream.badge")}</span>
                    <h2>{t("source.upstream.title")}</h2>
                    <p>{t("source.upstream.description")}</p>
                    <a
                        href="https://github.com/WintrCat/wintrchess"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t("source.upstream.open")}
                    </a>
                </section>

                <section className={styles.sourceCard}>
                    <span className={styles.sourceBadge}>Stockfish.js 17</span>
                    <h2>{t("source.stockfish.title")}</h2>
                    <p>{t("source.stockfish.description")}</p>
                    <a
                        href={STOCKFISH_SOURCE_URL}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t("source.stockfish.open")}
                    </a>
                </section>

                <section className={styles.sourceCard}>
                    <span className={styles.sourceBadge}>CC0 1.0</span>
                    <h2>{lichessCopy.title}</h2>
                    <p>{lichessCopy.description}</p>
                    <a
                        href="https://database.lichess.org/#puzzles"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {lichessCopy.open}
                    </a>
                </section>

                <section className={styles.sourceCard}>
                    <span className={styles.sourceBadge}>{t("source.licenses.badge")}</span>
                    <h2>{t("source.licenses.title")}</h2>
                    <p>{t("source.licenses.description")}</p>
                    <a
                        href="/legal/ATTRIBUTIONS.txt"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t("source.licenses.contact")}
                    </a>
                </section>
            </div>

            <section className={styles.sourceNotice}>
                <strong>{t("source.notice.title")}</strong>
                <p>{t("source.notice.description")}</p>
            </section>
        </div>
    </main>;
}

export default SourceCode;
