import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    onConsentSettingsRequested,
    readConsentPreferences,
    saveConsentPreferences
} from "@/lib/consent";

import { getConsentCopy } from "./copy";
import * as styles from "./CookieConsent.module.css";

type ConsentView = "hidden" | "banner" | "settings";

function CookieConsent() {
    const { i18n } = useTranslation();
    const copy = useMemo(
        () => getConsentCopy(i18n.resolvedLanguage || i18n.language),
        [i18n.resolvedLanguage, i18n.language]
    );
    const headingRef = useRef<HTMLHeadingElement>(null);
    const [view, setView] = useState<ConsentView>("hidden");
    const [hasSavedChoice, setHasSavedChoice] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [advertising, setAdvertising] = useState(false);

    useEffect(() => {
        const saved = readConsentPreferences();

        if (saved) {
            setAnalytics(saved.analytics);
            setAdvertising(saved.advertising);
            setHasSavedChoice(true);
        } else {
            setView("banner");
        }

        return onConsentSettingsRequested(() => {
            const current = readConsentPreferences();
            setAnalytics(current?.analytics || false);
            setAdvertising(current?.advertising || false);
            setHasSavedChoice(Boolean(current));
            setView("settings");
        });
    }, []);

    useEffect(() => {
        if (view != "hidden") {
            window.setTimeout(() => headingRef.current?.focus(), 0);
        }
    }, [view]);

    function persist(nextAnalytics: boolean, nextAdvertising: boolean) {
        saveConsentPreferences({
            analytics: nextAnalytics,
            advertising: nextAdvertising
        });
        setAnalytics(nextAnalytics);
        setAdvertising(nextAdvertising);
        setHasSavedChoice(true);
        setView("hidden");
    }

    if (view == "hidden") return null;

    const settingsOpen = view == "settings";

    return <div
        className={settingsOpen ? styles.backdrop : styles.bannerLayer}
        data-cookie-consent
    >
        <section
            className={settingsOpen ? styles.dialog : styles.banner}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-consent-title"
            aria-describedby="cookie-consent-description"
        >
            <div className={styles.headingRow}>
                <div>
                    <span className={styles.eyebrow}>NexoChess</span>
                    <h2
                        id="cookie-consent-title"
                        ref={headingRef}
                        tabIndex={-1}
                    >
                        {settingsOpen ? copy.settingsTitle : copy.title}
                    </h2>
                </div>

                {settingsOpen && hasSavedChoice && <button
                    type="button"
                    className={styles.closeButton}
                    aria-label={copy.close}
                    onClick={() => setView("hidden")}
                >
                    ×
                </button>}
            </div>

            <p id="cookie-consent-description" className={styles.description}>
                {settingsOpen ? copy.settingsDescription : copy.description}
            </p>

            {settingsOpen && <div className={styles.categories}>
                <div className={styles.category}>
                    <div>
                        <strong>{copy.essentialTitle}</strong>
                        <p>{copy.essentialDescription}</p>
                    </div>
                    <span className={styles.alwaysActive}>
                        {copy.alwaysActive}
                    </span>
                </div>

                <label className={styles.category}>
                    <div>
                        <strong>{copy.analyticsTitle}</strong>
                        <p>{copy.analyticsDescription}</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={analytics}
                        onChange={event => setAnalytics(event.target.checked)}
                    />
                </label>

                <label className={styles.category}>
                    <div>
                        <strong>{copy.advertisingTitle}</strong>
                        <p>{copy.advertisingDescription}</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={advertising}
                        onChange={event => setAdvertising(event.target.checked)}
                    />
                </label>
            </div>}

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={() => persist(false, false)}
                >
                    {copy.rejectOptional}
                </button>

                {!settingsOpen && <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={() => setView("settings")}
                >
                    {copy.configure}
                </button>}

                {settingsOpen && <button
                    type="button"
                    className={styles.primaryAction}
                    onClick={() => persist(analytics, advertising)}
                >
                    {copy.saveSelection}
                </button>}

                <button
                    type="button"
                    className={styles.primaryAction}
                    onClick={() => persist(true, true)}
                >
                    {copy.acceptAll}
                </button>
            </div>

            <a className={styles.privacyLink} href="/privacy">
                {copy.privacyPolicy}
            </a>
        </section>
    </div>;
}

export default CookieConsent;
