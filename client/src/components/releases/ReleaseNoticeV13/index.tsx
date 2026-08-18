import React, { useEffect, useState } from "react";

import Dialog from "@/components/common/Dialog";
import { parseLanguagePathname } from "@/i18n/routing";
import {
    V1_3_RELEASE_NOTE_COPY,
    V1_3_RELEASE_NOTE_CUTOFF,
    V1_3_RELEASE_NOTE_STORAGE_KEY,
    V1_3_RELEASE_VERSION,
    releaseNoteV1_3HasExpired
} from "@/releases/v1_3";

import * as styles from "./ReleaseNoticeV13.module.css";

function wasSeenLocally(): boolean {
    try {
        return localStorage.getItem(V1_3_RELEASE_NOTE_STORAGE_KEY) === "1";
    } catch {
        return true;
    }
}

function markSeenLocally(): boolean {
    try {
        localStorage.setItem(V1_3_RELEASE_NOTE_STORAGE_KEY, "1");
        return localStorage.getItem(V1_3_RELEASE_NOTE_STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

function ReleaseNoticeV13() {
    const [visible, setVisible] = useState(false);
    const language = parseLanguagePathname(window.location.pathname).language;
    const copy = V1_3_RELEASE_NOTE_COPY[language] || V1_3_RELEASE_NOTE_COPY.en;

    useEffect(() => {
        if (releaseNoteV1_3HasExpired() || wasSeenLocally()) return;

        // Device/browser-local by design, matching the v1.2 behaviour.
        // Persist before rendering so reloads and navigation cannot show it twice.
        if (!markSeenLocally()) return;
        if (!releaseNoteV1_3HasExpired()) setVisible(true);
    }, []);

    useEffect(() => {
        const remaining = Date.parse(V1_3_RELEASE_NOTE_CUTOFF) - Date.now();
        if (remaining <= 0) {
            setVisible(false);
            return;
        }

        const timeout = window.setTimeout(() => setVisible(false), remaining);
        return () => window.clearTimeout(timeout);
    }, []);

    if (!visible) return null;

    const titleId = "nexochess-v1-3-release-title";
    const dismiss = () => setVisible(false);

    return <Dialog
        className={styles.dialog}
        onClose={dismiss}
        ariaLabelledBy={titleId}
    >
        <div className={styles.content}>
            <p className={styles.eyebrow}>{V1_3_RELEASE_VERSION}</p>
            <h2 id={titleId} className={styles.title}>{copy.title}</h2>
            <p className={styles.intro}>{copy.intro}</p>
            <ul className={styles.changes}>
                {copy.changes.map(change => <li key={change}>{change}</li>)}
            </ul>
            <p className={styles.closing}>{copy.closing}</p>
            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.confirm}
                    onClick={dismiss}
                >
                    {copy.confirm}
                </button>
                <button
                    type="button"
                    className={styles.close}
                    onClick={dismiss}
                >
                    {copy.close}
                </button>
            </div>
        </div>
    </Dialog>;
}

export default ReleaseNoticeV13;
