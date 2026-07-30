import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import httpApi from "i18next-http-backend";

import LocalStorageKey from "@/constants/LocalStorageKey";

const supportedLanguages = [
    "en",
    "es",
    "fr",
    "de",
    "pt",
    "ru",
    "zh",
    "vi",
    "hi",
    "mr",
    "pl"
] as const;

type SupportedLanguage = typeof supportedLanguages[number];

const namespaces = [
    "common",
    "academy",
    "analysis",
    "settings",
    "otherPages",
    "helpCenter",
    "coach",
    "legal"
] as const;

function normaliseLanguage(value?: string | null): SupportedLanguage | null {
    if (!value) return null;

    const normalised = value
        .trim()
        .toLowerCase()
        .replace("_", "-");

    const baseLanguage = normalised.split("-")[0];

    return supportedLanguages.includes(baseLanguage as SupportedLanguage)
        ? baseLanguage as SupportedLanguage
        : null;
}

function getBrowserLanguages(): string[] {
    if (typeof navigator == "undefined") return [];

    const candidates = [
        ...(Array.isArray(navigator.languages) ? navigator.languages : []),
        navigator.language
    ];

    return candidates.filter((value): value is string => Boolean(value));
}

function detectBrowserLanguage(): SupportedLanguage {
    for (const candidate of getBrowserLanguages()) {
        const detected = normaliseLanguage(candidate);
        if (detected) return detected;
    }

    return "en";
}

function getInitialLanguage(): SupportedLanguage {
    if (typeof window == "undefined") return "en";

    /*
     * A manual selection always wins on later visits. On the first visit,
     * NexoChess follows the browser language automatically.
     */
    const saved = normaliseLanguage(
        localStorage.getItem(LocalStorageKey.PREFERRED_LANGUAGE)
    );

    return saved || detectBrowserLanguage();
}

function updateDocumentLanguage(language: string) {
    if (typeof document == "undefined") return;

    document.documentElement.lang = normaliseLanguage(language) || "en";
}

const initialLanguage = getInitialLanguage();
updateDocumentLanguage(initialLanguage);

/*
 * Suspense is deliberately disabled here. Translation namespaces are loaded
 * over HTTP; suspending during the synchronous "Analyse" click caused React
 * to replace the application with a blank screen while coach.json loaded.
 */
void i18next
    .use(initReactI18next)
    .use(httpApi)
    .init({
        lng: initialLanguage,
        fallbackLng: "en",
        supportedLngs: [...supportedLanguages],
        nonExplicitSupportedLngs: true,
        load: "languageOnly",
        ns: [...namespaces],
        defaultNS: "common",
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json"
        },
        interpolation: {
            escapeValue: false
        },
        returnEmptyString: false,
        react: {
            useSuspense: false
        }
    });

i18next.on("initialized", () => {
    updateDocumentLanguage(i18next.resolvedLanguage || i18next.language);
});

i18next.on("languageChanged", language => {
    const normalised = normaliseLanguage(language) || "en";

    if (typeof window != "undefined") {
        localStorage.setItem(
            LocalStorageKey.PREFERRED_LANGUAGE,
            normalised
        );
    }

    updateDocumentLanguage(normalised);
});

export {
    detectBrowserLanguage,
    normaliseLanguage,
    supportedLanguages
};

export default i18next;
