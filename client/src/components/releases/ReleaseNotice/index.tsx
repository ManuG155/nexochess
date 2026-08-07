import React, { useEffect, useState } from "react";

import Dialog from "@/components/common/Dialog";
import { parseLanguagePathname } from "@/i18n/routing";
import {
    V1_1_RELEASE_NOTE_COPY,
    V1_1_RELEASE_NOTE_CUTOFF,
    V1_1_RELEASE_NOTE_ENDPOINT,
    V1_1_RELEASE_NOTE_STORAGE_KEY,
    V1_1_RELEASE_VERSION,
    releaseNoteV1_1HasExpired
} from "@/releases/v1_1";

import * as styles from "./ReleaseNotice.module.css";

function wasSeenLocally(): boolean {
    try {
        return localStorage.getItem(V1_1_RELEASE_NOTE_STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

function markSeenLocally() {
    try {
        localStorage.setItem(V1_1_RELEASE_NOTE_STORAGE_KEY, "1");
    } catch {
        // A blocked localStorage must not break the application shell.
    }
}

async function markSeenForAccount(): Promise<boolean> {
    try {
        const response = await fetch(V1_1_RELEASE_NOTE_ENDPOINT, {
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

function ReleaseNotice() {
    const [visible, setVisible] = useState(false);
    const language = parseLanguagePathname(window.location.pathname).language;
    const copy = V1_1_RELEASE_NOTE_COPY[language] || V1_1_RELEASE_NOTE_COPY.en;

    useEffect(() => {
        let cancelled = false;

        async function initialise() {
            if (releaseNoteV1_1HasExpired()) return;

            const localSeen = wasSeenLocally();

            let response: Response;
            try {
                response = await fetch(V1_1_RELEASE_NOTE_ENDPOINT, {
                    credentials: "same-origin",
                    headers: { "Accept": "application/json" }
                });
            } catch {
                // If account state cannot be determined, do not risk showing a
                // supposedly one-time account notice more than once.
                return;
            }

            if (cancelled || releaseNoteV1_1HasExpired()) return;

            if (response.status === 401) {
                if (localSeen) return;

                // Anonymous visitors are local-only. Mark before rendering so
                // reload/navigation cannot show the same release twice.
                markSeenLocally();
                if (!cancelled && !releaseNoteV1_1HasExpired()) setVisible(true);
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
                // The browser already saw the note anonymously. Synchronise that
                // fact to the signed-in account without displaying it again.
                await markSeenForAccount();
                return;
            }

            // Persist the account marker before rendering. If persistence fails,
            // skip the notice rather than violating the one-time-per-user rule.
            if (!await markSeenForAccount()) return;
            if (cancelled || releaseNoteV1_1HasExpired()) return;

            markSeenLocally();
            setVisible(true);
        }

        void initialise();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const remaining = Date.parse(V1_1_RELEASE_NOTE_CUTOFF) - Date.now();
        if (remaining <= 0) {
            setVisible(false);
            return;
        }

        const timeout = window.setTimeout(() => setVisible(false), remaining);
        return () => window.clearTimeout(timeout);
    }, []);

    if (!visible) return null;

    const titleId = "nexochess-v1-1-release-title";

    return <Dialog
        className={styles.dialog}
        onClose={() => setVisible(false)}
        ariaLabelledBy={titleId}
    >
        <div className={styles.content}>
            <p className={styles.eyebrow}>{V1_1_RELEASE_VERSION}</p>
            <h2 id={titleId} className={styles.title}>{copy.title}</h2>
            <p className={styles.intro}>{copy.intro}</p>
            <ul className={styles.changes}>
                {copy.changes.map(change => <li key={change}>{change}</li>)}
            </ul>
            <p className={styles.closing}>{copy.closing}</p>
            <button
                type="button"
                className={styles.dismiss}
                onClick={() => setVisible(false)}
            >
                {copy.dismiss}
            </button>
        </div>
    </Dialog>;
}

export default ReleaseNotice;
