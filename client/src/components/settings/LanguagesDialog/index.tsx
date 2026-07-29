import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import Dialog from "@/components/common/Dialog";
import languages from "@/i18n/languages";

import LanguagesDialogProps from "./LanguagesDialogProps";
import * as styles from "./LanguagesDialog.module.css";

function LanguagesDialog({ onClose }: LanguagesDialogProps) {
    const { t, i18n } = useTranslation("common");
    const [query, setQuery] = useState("");

    const selectedLanguage = (
        i18n.resolvedLanguage || i18n.language
    ).split("-")[0];

    const filteredLanguages = useMemo(() => {
        const normalisedQuery = query.trim().toLocaleLowerCase();
        if (!normalisedQuery) return languages;

        return languages.filter(language => (
            language.label.toLocaleLowerCase().includes(normalisedQuery)
            || language.id.includes(normalisedQuery)
        ));
    }, [query]);

    async function setLanguage(id: string) {
        await i18n.changeLanguage(id);
        onClose();
    }

    return <Dialog className={styles.wrapper} onClose={onClose}>
        <header className={styles.header}>
            <div>
                <span className={styles.eyebrow}>
                    {t("footer.languagesDialog.eyebrow")}
                </span>
                <h2>{t("footer.languagesDialog.select")}</h2>
                <p>{t("footer.languagesDialog.description")}</p>
            </div>
        </header>

        <label className={styles.searchField}>
            <span className={styles.srOnly}>
                {t("footer.languagesDialog.search")}
            </span>
            <input
                type="search"
                value={query}
                placeholder={t("footer.languagesDialog.search")}
                onChange={event => setQuery(event.target.value)}
                autoFocus
            />
        </label>

        <div className={styles.languages}>
            {filteredLanguages.map(language => {
                const selected = selectedLanguage == language.id;

                return <button
                    key={language.id}
                    type="button"
                    className={`${styles.language} ${
                        selected ? styles.languageSelected : ""
                    }`}
                    aria-pressed={selected}
                    onClick={() => void setLanguage(language.id)}
                >
                    <img src={language.flag} alt="" aria-hidden="true" />
                    <span className={styles.languageCopy}>
                        <strong>{language.label}</strong>
                        <small>{language.id.toUpperCase()}</small>
                    </span>
                    {selected && <span className={styles.currentBadge}>
                        {t("footer.languagesDialog.current")}
                    </span>}
                </button>;
            })}
        </div>

        {filteredLanguages.length == 0 && <p className={styles.empty}>
            {t("footer.languagesDialog.noResults")}
        </p>}
    </Dialog>;
}

export default LanguagesDialog;
