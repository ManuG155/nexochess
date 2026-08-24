import React, { useEffect, useState } from "react";

import Dialog from "@/components/common/Dialog";
import { parseLanguagePathname } from "@/i18n/routing";
import {
    V1_4_RELEASE_NOTE_COPY,
    V1_4_RELEASE_NOTE_CUTOFF,
    V1_4_RELEASE_NOTE_ENDPOINT,
    V1_4_RELEASE_NOTE_STORAGE_KEY,
    V1_4_RELEASE_VERSION,
    releaseNoteV1_4HasExpired
} from "@/releases/v1_4";

import * as styles from "./ReleaseNoticeV14.module.css";

function wasSeenLocally(): boolean {
    try {
        return localStorage.getItem(V1_4_RELEASE_NOTE_STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

function markSeenLocally() {
    try {
        localStorage.setItem(V1_4_RELEASE_NOTE_STORAGE_KEY, "1");
    } catch {
        // A blocked localStorage must not break the application shell.
    }
}

async function markSeenForAccount(): Promise<boolean> {
    try {
        const response = await fetch(V1_4_RELEASE_NOTE_ENDPOINT, {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: "{}"
        });

        return response.ok;
    } catch {
        return false;
    }
}

function ReleaseNoticeV14() {
    const [visible, setVisible] = useState(false);
    const language = parseLanguagePathname(window.location.pathname).language;
    const copy = V1_4_RELEASE_NOTE_COPY[language] || V1_4_RELEASE_NOTE_COPY.en;

    useEffect(() => {
        let cancelled = false;

        async function initialise() {
            if (releaseNoteV1_4HasExpired()) return;

            const localSeen = wasSeenLocally();

            let response: Response;
            try {
                response = await fetch(V1_4_RELEASE_NOTE_ENDPOINT, {
                    credentials: "same-origin",
                    headers: { "Accept": "application/json" }
                });
            } catch {
                // When account state cannot be determined, avoid risking a
                // duplicate account-scoped notice.
                return;
            }

            if (cancelled || releaseNoteV1_4HasExpired()) return;

            if (response.status === 401) {
                if (localSeen) return;

                // Anonymous users see the notice at most once per browser/device.
                // Persist before rendering so reloads cannot display it twice.
                markSeenLocally();
                if (!cancelled && !releaseNoteV1_4HasExpired()) setVisible(true);
                return;
            }

            if (!response.ok) return;

            let accountSeen = true;
            try {
                const payload = await response.json() as { seen?: boolean };
                accountSeen = payload.seen !== false;
            } catch {
                return;
            }

            if (accountSeen) {
                markSeenLocally();
                return;
            }

            if (localSeen) {
                // This device already saw v1.4 anonymously. Synchronise the
                // marker to the account without showing the popup again.
                await markSeenForAccount();
                return;
            }

            // Persist the account marker before rendering. If it cannot be
            // persisted, skip the popup instead of violating once-per-account.
            if (!await markSeenForAccount()) return;
            if (cancelled || releaseNoteV1_4HasExpired()) return;

            markSeenLocally();
            setVisible(true);
        }

        void initialise();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const remaining = Date.parse(V1_4_RELEASE_NOTE_CUTOFF) - Date.now();
        if (remaining <= 0) {
            setVisible(false);
            return;
        }

        const timeout = window.setTimeout(() => setVisible(false), remaining);
        return () => window.clearTimeout(timeout);
    }, []);

    if (!visible) return null;

    const titleId = "nexochess-v1-4-release-title";
    const dismiss = () => setVisible(false);

    return <Dialog
        className={styles.dialog}
        onClose={dismiss}
        ariaLabelledBy={titleId}
    >
        <div className={styles.content}>
            <p className={styles.eyebrow}>{V1_4_RELEASE_VERSION}</p>
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

export default ReleaseNoticeV14;
