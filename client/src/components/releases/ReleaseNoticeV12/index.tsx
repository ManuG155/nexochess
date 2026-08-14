import React, { useEffect, useState } from "react";

import Dialog from "@/components/common/Dialog";
import { parseLanguagePathname } from "@/i18n/routing";
import {
    V1_2_RELEASE_NOTE_COPY,
    V1_2_RELEASE_NOTE_CUTOFF,
    V1_2_RELEASE_NOTE_STORAGE_KEY,
    V1_2_RELEASE_VERSION,
    releaseNoteV1_2HasExpired
} from "@/releases/v1_2";

import * as styles from "./ReleaseNoticeV12.module.css";

function wasSeenLocally(): boolean {
    try {
        return localStorage.getItem(V1_2_RELEASE_NOTE_STORAGE_KEY) === "1";
    } catch {
        return true;
    }
}

function markSeenLocally(): boolean {
    try {
        localStorage.setItem(V1_2_RELEASE_NOTE_STORAGE_KEY, "1");
        return localStorage.getItem(V1_2_RELEASE_NOTE_STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

function ReleaseNoticeV12() {
    const [visible, setVisible] = useState(false);
    const language = parseLanguagePathname(window.location.pathname).language;
    const copy = V1_2_RELEASE_NOTE_COPY[language] || V1_2_RELEASE_NOTE_COPY.en;

    useEffect(() => {
        if (releaseNoteV1_2HasExpired() || wasSeenLocally()) return;

        // This notice is deliberately device/browser-local, independent of
        // account state. Persist before rendering so navigation, reloads,
        // sign-in or sign-out cannot make it appear twice on the same browser.
        if (!markSeenLocally()) return;
        if (!releaseNoteV1_2HasExpired()) setVisible(true);
    }, []);

    useEffect(() => {
        const remaining = Date.parse(V1_2_RELEASE_NOTE_CUTOFF) - Date.now();
        if (remaining <= 0) {
            setVisible(false);
            return;
        }

        const timeout = window.setTimeout(() => setVisible(false), remaining);
        return () => window.clearTimeout(timeout);
    }, []);

    if (!visible) return null;

    const titleId = "nexochess-v1-2-release-title";
    const dismiss = () => setVisible(false);

    return <Dialog
        className={styles.dialog}
        onClose={dismiss}
        ariaLabelledBy={titleId}
    >
        <div className={styles.content}>
            <p className={styles.eyebrow}>{V1_2_RELEASE_VERSION}</p>
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

export default ReleaseNoticeV12;
