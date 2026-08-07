import {
    onConsentChanged,
    readConsentPreferences,
    type ConsentPreferences
} from "@/lib/consent";

const ANALYTICS_META_NAME = "nexochess-analytics-measurement-id";
const ENVIRONMENT_META_NAME = "nexochess-environment";
const GOOGLE_TAG_SCRIPT_ID = "nexochess-google-analytics";
const PRODUCTION_ENVIRONMENT = "production";
const PENDING_AUTH_STORAGE_KEY = "nexochess-analytics-pending-auth-v1";
const PENDING_AUTH_MAX_AGE_MS = 10 * 60 * 1000;

type Gtag = (...args: unknown[]) => void;
type AnalyticsWindow = Window & typeof globalThis & { gtag?: Gtag };

type AnalysisFailureReason = "request_failed" | "missing_result";
type PuzzleSource = "archive" | "lichess";
type ShareMethod = "native" | "pgn_download";
type AuthFlow = "login" | "signup";
type AuthMethod = "email" | "google";

type AnalyticsEvent =
    | { name: "analysis_started" }
    | { name: "analysis_completed" }
    | {
        name: "analysis_failed";
        failureReason: AnalysisFailureReason;
    }
    | {
        name: "puzzle_started";
        puzzleSource: PuzzleSource;
    }
    | {
        name: "puzzle_solved";
        puzzleSource: PuzzleSource;
    }
    | {
        name: "puzzle_failed";
        puzzleSource: PuzzleSource;
    }
    | {
        name: "game_shared";
        shareMethod: ShareMethod;
    }
    | {
        name: "signup_completed";
        authMethod: AuthMethod;
    }
    | {
        name: "login_completed";
        authMethod: AuthMethod;
    };

interface PendingAuthAnalytics {
    flow: AuthFlow;
    method: AuthMethod;
    createdAt: number;
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
    target.gtag ||= function (..._args: unknown[]) {
        target.dataLayer.push(arguments);
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

function analyticsEligible() {
    return Boolean(
        readRuntimeMeasurementId()
        && readConsentPreferences()?.analytics === true
    );
}

function emitAnalyticsEvent(event: AnalyticsEvent) {
    if (!analyticsEligible()) return false;

    const measurementId = readRuntimeMeasurementId();
    if (!measurementId) return false;

    loadGoogleAnalytics(measurementId);

    const parameters: Record<string, string> = {};

    switch (event.name) {
        case "analysis_failed":
            parameters.failure_reason = event.failureReason;
            break;
        case "puzzle_started":
        case "puzzle_solved":
        case "puzzle_failed":
            parameters.puzzle_source = event.puzzleSource;
            break;
        case "game_shared":
            parameters.share_method = event.shareMethod;
            break;
        case "signup_completed":
        case "login_completed":
            parameters.auth_method = event.authMethod;
            break;
    }

    ensureGtag()("event", event.name, parameters);
    return true;
}

function isAuthFlow(value: unknown): value is AuthFlow {
    return value === "login" || value === "signup";
}

function isAuthMethod(value: unknown): value is AuthMethod {
    return value === "email" || value === "google";
}

function isPuzzleSource(value: unknown): value is PuzzleSource {
    return value === "archive" || value === "lichess";
}

function readPendingAuthAnalytics(): PendingAuthAnalytics | null {
    if (typeof window == "undefined") return null;

    try {
        const stored = window.sessionStorage.getItem(PENDING_AUTH_STORAGE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored) as Partial<PendingAuthAnalytics>;
        const flow = parsed.flow;
        const method = parsed.method;
        const createdAt = parsed.createdAt;

        if (
            !isAuthFlow(flow)
            || !isAuthMethod(method)
            || typeof createdAt != "number"
            || !Number.isFinite(createdAt)
            || Date.now() - createdAt > PENDING_AUTH_MAX_AGE_MS
            || createdAt > Date.now() + 5_000
        ) {
            clearPendingAuthAnalytics();
            return null;
        }

        return { flow, method, createdAt };
    } catch {
        clearPendingAuthAnalytics();
        return null;
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

export function trackAnalysisStarted() {
    return emitAnalyticsEvent({ name: "analysis_started" });
}

export function trackAnalysisCompleted() {
    return emitAnalyticsEvent({ name: "analysis_completed" });
}

export function trackAnalysisFailed(reason: AnalysisFailureReason) {
    return emitAnalyticsEvent({
        name: "analysis_failed",
        failureReason: reason
    });
}

export function trackPuzzleStarted(source: unknown) {
    if (!isPuzzleSource(source)) return false;

    return emitAnalyticsEvent({
        name: "puzzle_started",
        puzzleSource: source
    });
}

export function trackPuzzleSolved(source: PuzzleSource) {
    return emitAnalyticsEvent({
        name: "puzzle_solved",
        puzzleSource: source
    });
}

export function trackPuzzleFailed(source: PuzzleSource) {
    return emitAnalyticsEvent({
        name: "puzzle_failed",
        puzzleSource: source
    });
}

export function trackGameShared(method: ShareMethod) {
    return emitAnalyticsEvent({
        name: "game_shared",
        shareMethod: method
    });
}

export function markPendingAuthAnalytics(
    flow: AuthFlow,
    method: AuthMethod
) {
    if (typeof window == "undefined") return;

    clearPendingAuthAnalytics();
    if (!analyticsEligible()) return;

    const pending: PendingAuthAnalytics = {
        flow,
        method,
        createdAt: Date.now()
    };

    try {
        window.sessionStorage.setItem(
            PENDING_AUTH_STORAGE_KEY,
            JSON.stringify(pending)
        );
    } catch {
        // Analytics must never interfere with authentication.
    }
}

export function clearPendingAuthAnalytics() {
    if (typeof window == "undefined") return;

    try {
        window.sessionStorage.removeItem(PENDING_AUTH_STORAGE_KEY);
    } catch {
        // Analytics must never interfere with authentication.
    }
}

export function completePendingAuthAnalytics(authenticated: boolean) {
    const pending = readPendingAuthAnalytics();
    if (!pending) return false;

    clearPendingAuthAnalytics();
    if (!authenticated || !analyticsEligible()) return false;

    return emitAnalyticsEvent({
        name: pending.flow === "signup"
            ? "signup_completed"
            : "login_completed",
        authMethod: pending.method
    });
}
