import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import httpApi from "i18next-http-backend";

import LocalStorageKey from "@/constants/LocalStorageKey";
import {
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
    SupportedLanguage,
    getUrlLanguage,
    installLocalizedLinkRouting,
    normaliseSupportedLanguage,
    refreshLocalizedLinks
} from "./routing";

const namespaces = [
    "common", "academy", "lessons", "lessonsCatalog", "lessonsPractice",
    "enginePlay", "puzzles", "repertoire", "repertoireCourse", "analysis", "settings",
    "otherPages", "helpCenter", "coach", "legal", "guides"
] as const;

function getBrowserLanguages(): string[] {
    if (typeof navigator == "undefined") return [];
    return [
        ...(Array.isArray(navigator.languages) ? navigator.languages : []),
        navigator.language
    ].filter((value): value is string => Boolean(value));
}

function detectBrowserLanguage(): SupportedLanguage {
    for (const candidate of getBrowserLanguages()) {
        const detected = normaliseSupportedLanguage(candidate);
        if (detected) return detected;
    }
    return DEFAULT_LANGUAGE;
}

function getInitialLanguage(): SupportedLanguage {
    if (typeof window == "undefined") return DEFAULT_LANGUAGE;
    const urlLanguage = getUrlLanguage(window.location.pathname);
    if (urlLanguage) return urlLanguage;

    const saved = normaliseSupportedLanguage(
        localStorage.getItem(LocalStorageKey.PREFERRED_LANGUAGE)
    );
    return saved || detectBrowserLanguage();
}

function updateDocumentLanguage(language: string) {
    if (typeof document == "undefined") return;
    document.documentElement.lang = normaliseSupportedLanguage(language) || DEFAULT_LANGUAGE;
}

const initialLanguage = getInitialLanguage();
updateDocumentLanguage(initialLanguage);
installLocalizedLinkRouting(() => (
    normaliseSupportedLanguage(i18next.resolvedLanguage || i18next.language)
    || initialLanguage
));

void i18next
    .use(initReactI18next)
    .use(httpApi)
    .init({
        lng: initialLanguage,
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: [...SUPPORTED_LANGUAGES],
        nonExplicitSupportedLngs: true,
        load: "languageOnly",
        ns: [...namespaces],
        defaultNS: "common",
        backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
        interpolation: { escapeValue: false },
        returnEmptyString: false,
        react: { useSuspense: false }
    });

i18next.on("initialized", () => {
    updateDocumentLanguage(i18next.resolvedLanguage || i18next.language);
    refreshLocalizedLinks();
});

i18next.on("languageChanged", language => {
    const normalised = normaliseSupportedLanguage(language) || DEFAULT_LANGUAGE;
    if (typeof window != "undefined") {
        localStorage.setItem(LocalStorageKey.PREFERRED_LANGUAGE, normalised);
    }
    updateDocumentLanguage(normalised);
    refreshLocalizedLinks();
});

export {
    detectBrowserLanguage,
    normaliseSupportedLanguage as normaliseLanguage,
    SUPPORTED_LANGUAGES as supportedLanguages
};
export type { SupportedLanguage };
export default i18next;
