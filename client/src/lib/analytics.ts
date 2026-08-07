import {
    onConsentChanged,
    readConsentPreferences,
    type ConsentPreferences
} from "@/lib/consent";

const ANALYTICS_META_NAME = "nexochess-analytics-measurement-id";
const ENVIRONMENT_META_NAME = "nexochess-environment";
const GOOGLE_TAG_SCRIPT_ID = "nexochess-google-analytics";
const PRODUCTION_ENVIRONMENT = "production";

interface AnalyticsWindow extends Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
}

let activeMeasurementId: string | null = null;
let stopConsentListener: (() => void) | null = null;

function analyticsWindow() {
    return window as AnalyticsWindow;
}

function readRuntimeMeasurementId() {
    if (typeof document == "undefined") return null;

    const environment = document.querySelector<HTMLMetaElement>(
        `meta[name="${ENVIRONMENT_META_NAME}"]`
    )?.content;
    if (environment !== PRODUCTION_ENVIRONMENT) return null;

    const measurementId = document.querySelector<HTMLMetaElement>(
        `meta[name="${ANALYTICS_META_NAME}"]`
    )?.content.trim().toUpperCase();

    return measurementId && /^G-[A-Z0-9]+$/.test(measurementId)
        ? measurementId
        : null;
}

function ensureGtag() {
    const target = analyticsWindow();
    target.dataLayer ||= [];
    target.gtag ||= (...args: unknown[]) => {
        target.dataLayer?.push(args);
    };
    return target.gtag;
}

function consentState(analytics: boolean) {
    return {
        analytics_storage: analytics ? "granted" : "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
    } as const;
}

function updateLoadedTagConsent(analytics: boolean) {
    if (!activeMeasurementId) return;
    ensureGtag()("consent", "update", consentState(analytics));
}

function loadGoogleAnalytics(measurementId: string) {
    if (activeMeasurementId === measurementId) {
        updateLoadedTagConsent(true);
        return;
    }

    const gtag = ensureGtag();
    gtag("consent", "default", consentState(false));
    gtag("consent", "update", consentState(true));
    gtag("js", new Date());
    gtag("config", measurementId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false
    });

    const existingScript = document.getElementById(GOOGLE_TAG_SCRIPT_ID);
    if (!existingScript) {
        const script = document.createElement("script");
        script.id = GOOGLE_TAG_SCRIPT_ID;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        document.head.appendChild(script);
    }

    activeMeasurementId = measurementId;
}

function applyPreferences(preferences: ConsentPreferences | null) {
    const measurementId = readRuntimeMeasurementId();
    if (!measurementId) return;

    if (preferences?.analytics === true) {
        loadGoogleAnalytics(measurementId);
    } else {
        updateLoadedTagConsent(false);
    }
}

export function initialiseAnalytics() {
    if (typeof window == "undefined" || typeof document == "undefined") {
        return () => undefined;
    }

    applyPreferences(readConsentPreferences());

    stopConsentListener?.();
    stopConsentListener = onConsentChanged(preferences => {
        applyPreferences(preferences);
    });

    return () => {
        stopConsentListener?.();
        stopConsentListener = null;
    };
}
