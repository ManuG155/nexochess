const ADSENSE_META_NAME = "google-adsense-account";
const GOOGLE_PRIVACY_CHANGE_EVENT = "nexochess:google-privacy-changed";
const GOOGLE_PRIVACY_FALLBACK_MS = 3000;

export type GoogleConsentDecision =
    | "unknown"
    | "granted"
    | "denied"
    | "not-applicable"
    | "not-configured";

export interface GooglePrivacyState {
    applies: boolean | null;
    analytics: GoogleConsentDecision;
    advertising: GoogleConsentDecision;
}

interface GoogleConsentModeValues {
    adStoragePurposeConsentStatus: number;
    adUserDataPurposeConsentStatus: number;
    adPersonalizationPurposeConsentStatus: number;
    analyticsStoragePurposeConsentStatus: number;
}

interface GoogleFcApi {
    callbackQueue: Array<Record<string, () => void>>;
    getGoogleConsentModeValues?: () => GoogleConsentModeValues;
    showRevocationMessage?: () => void;
}

type TcfApi = (
    command: string,
    version: number,
    callback: (data: { gdprApplies?: boolean } | null, success: boolean) => void
) => void;

type PrivacyRuntime = {
    googlefc?: GoogleFcApi;
    __tcfapi?: TcfApi;
};

let started = false;
let consentModeReady = false;
let fallbackTimer: number | null = null;
let currentState: GooglePrivacyState = {
    applies: null,
    analytics: "unknown",
    advertising: "unknown"
};

function privacyRuntime() {
    return window as unknown as PrivacyRuntime;
}

function hasGooglePublisherTag() {
    if (typeof document == "undefined") return false;
    return Boolean(document.querySelector<HTMLMetaElement>(
        `meta[name="${ADSENSE_META_NAME}"]`
    )?.content.trim());
}

function emitState(next: GooglePrivacyState) {
    if (
        currentState.applies === next.applies
        && currentState.analytics === next.analytics
        && currentState.advertising === next.advertising
    ) return;

    currentState = next;
    window.dispatchEvent(new CustomEvent<GooglePrivacyState>(
        GOOGLE_PRIVACY_CHANGE_EVENT,
        { detail: next }
    ));
}

function updateState(patch: Partial<GooglePrivacyState>) {
    emitState({ ...currentState, ...patch });
}

function mapConsentModeStatus(value: number): GoogleConsentDecision {
    switch (value) {
        case 1: return "granted";
        case 2: return "denied";
        case 3: return "not-applicable";
        case 4: return "not-configured";
        default: return "unknown";
    }
}

function combineAdvertising(values: GoogleConsentDecision[]) {
    if (values.every(value => value === "granted")) return "granted";
    if (values.some(value => value === "denied")) return "denied";
    if (values.every(value => value === "not-applicable")) {
        return "not-applicable";
    }
    if (values.some(value => value === "not-configured")) {
        return "not-configured";
    }
    return "unknown";
}

function readConsentModeValues() {
    const values = privacyRuntime().googlefc?.getGoogleConsentModeValues?.();
    if (!values) return;

    const adStorage = mapConsentModeStatus(values.adStoragePurposeConsentStatus);
    const adUserData = mapConsentModeStatus(values.adUserDataPurposeConsentStatus);
    const adPersonalization = mapConsentModeStatus(
        values.adPersonalizationPurposeConsentStatus
    );

    updateState({
        analytics: mapConsentModeStatus(
            values.analyticsStoragePurposeConsentStatus
        ),
        advertising: combineAdvertising([
            adStorage,
            adUserData,
            adPersonalization
        ])
    });
}

function queueGoogleCallback(key: string, callback: () => void) {
    const target = privacyRuntime();
    const googlefc = target.googlefc || { callbackQueue: [] };
    googlefc.callbackQueue ||= [];
    googlefc.callbackQueue.push({ [key]: callback });
    target.googlefc = googlefc;
}

function detectGdprApplicability() {
    const tcfApi = privacyRuntime().__tcfapi;
    if (!tcfApi) return;

    tcfApi("addEventListener", 0, (tcData, success) => {
        if (!success || typeof tcData?.gdprApplies != "boolean") return;

        if (fallbackTimer !== null) {
            window.clearTimeout(fallbackTimer);
            fallbackTimer = null;
        }

        updateState({ applies: tcData.gdprApplies });
        if (consentModeReady) readConsentModeValues();
    });
}

export function initialiseGooglePrivacyMessaging() {
    if (typeof window == "undefined" || typeof document == "undefined") {
        return;
    }
    if (started) return;
    started = true;

    if (!hasGooglePublisherTag()) {
        updateState({ applies: false });
        return;
    }

    queueGoogleCallback("CONSENT_API_READY", detectGdprApplicability);
    queueGoogleCallback("CONSENT_MODE_DATA_READY", () => {
        consentModeReady = true;
        readConsentModeValues();
    });
    queueGoogleCallback("CONSENT_DATA_READY", () => {
        if (consentModeReady) readConsentModeValues();
    });

    fallbackTimer = window.setTimeout(() => {
        fallbackTimer = null;
        if (currentState.applies === null) {
            updateState({ applies: false });
        }
    }, GOOGLE_PRIVACY_FALLBACK_MS);
}

export function getGooglePrivacyState() {
    return currentState;
}

export function onGooglePrivacyStateChanged(
    listener: (state: GooglePrivacyState) => void
) {
    if (typeof window == "undefined") return () => undefined;

    const handleChange = (event: Event) => {
        const next = (event as CustomEvent<GooglePrivacyState>).detail;
        if (next) listener(next);
    };

    window.addEventListener(GOOGLE_PRIVACY_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(
        GOOGLE_PRIVACY_CHANGE_EVENT,
        handleChange
    );
}

export function requestGooglePrivacySettings() {
    if (typeof window == "undefined" || currentState.applies !== true) {
        return false;
    }

    queueGoogleCallback("CONSENT_API_READY", () => {
        privacyRuntime().googlefc?.showRevocationMessage?.();
    });
    return true;
}
