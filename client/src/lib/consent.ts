import {
    getGooglePrivacyState,
    requestGooglePrivacySettings
} from "@/lib/googleConsent";

export type OptionalConsentCategory = "analytics" | "advertising";

export interface ConsentPreferences {
    version: 1;
    essential: true;
    analytics: boolean;
    advertising: boolean;
    updatedAt: string;
}

const CONSENT_VERSION = 1 as const;
const CONSENT_STORAGE_KEY = "nexochess.cookie-consent.v1";
const CONSENT_OPEN_EVENT = "nexochess:open-consent-settings";
const CONSENT_CHANGE_EVENT = "nexochess:consent-changed";

function isConsentPreferences(value: unknown): value is ConsentPreferences {
    if (!value || typeof value != "object") return false;

    const candidate = value as Partial<ConsentPreferences>;

    return candidate.version === CONSENT_VERSION
        && candidate.essential === true
        && typeof candidate.analytics == "boolean"
        && typeof candidate.advertising == "boolean"
        && typeof candidate.updatedAt == "string";
}

export function readConsentPreferences(): ConsentPreferences | null {
    if (typeof window == "undefined") return null;

    try {
        const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
        if (!stored) return null;

        const parsed: unknown = JSON.parse(stored);
        return isConsentPreferences(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

export function saveConsentPreferences(
    preferences: Pick<ConsentPreferences, "analytics" | "advertising">
) {
    const next: ConsentPreferences = {
        version: CONSENT_VERSION,
        essential: true,
        analytics: preferences.analytics,
        advertising: preferences.advertising,
        updatedAt: new Date().toISOString()
    };

    if (typeof window != "undefined") {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent<ConsentPreferences>(
            CONSENT_CHANGE_EVENT,
            { detail: next }
        ));
    }

    return next;
}

export function hasConsent(category: OptionalConsentCategory) {
    return readConsentPreferences()?.[category] === true;
}

export function manageDataConsent() {
    if (typeof window == "undefined") return;

    if (
        getGooglePrivacyState().applies === true
        && requestGooglePrivacySettings()
    ) return;

    window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

export function onConsentSettingsRequested(listener: () => void) {
    if (typeof window == "undefined") return () => undefined;

    window.addEventListener(CONSENT_OPEN_EVENT, listener);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, listener);
}

export function onConsentChanged(
    listener: (preferences: ConsentPreferences) => void
) {
    if (typeof window == "undefined") return () => undefined;

    const handleChange = (event: Event) => {
        const preferences = (event as CustomEvent<unknown>).detail;
        if (isConsentPreferences(preferences)) listener(preferences);
    };

    window.addEventListener(CONSENT_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handleChange);
}

/**
 * Compatibilidad con código histórico. La CMP actual no debe eliminar
 * controles de revocación proporcionados por una CMP certificada.
 */
export function removeDefaultConsentLink() {
    // Deliberadamente vacío.
}
