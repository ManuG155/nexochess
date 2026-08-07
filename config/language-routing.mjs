import { productionUrl } from "./site.mjs";

export const DEFAULT_LANGUAGE_CODE = "en";
export const SUPPORTED_LANGUAGE_CODES = Object.freeze([
    "en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"
]);
export const PREFIXED_LANGUAGE_CODES = Object.freeze(
    SUPPORTED_LANGUAGE_CODES.filter(code => code !== DEFAULT_LANGUAGE_CODE)
);

export function normaliseLanguageCode(value) {
    if (!value) return null;
    const code = String(value).trim().toLowerCase().replaceAll("_", "-").split("-")[0];
    return SUPPORTED_LANGUAGE_CODES.includes(code) ? code : null;
}

export function normaliseLocalizedPathname(pathname) {
    const input = String(pathname || "/");
    let output = input.startsWith("/") ? input : `/${input}`;
    output = output.replace(/\/{2,}/g, "/");
    if (output.length > 1 && output.endsWith("/")) output = output.slice(0, -1);
    return output || "/";
}

function buildLocalizedPathname(basePathname, language) {
    if (language === DEFAULT_LANGUAGE_CODE) return basePathname;
    return basePathname === "/" ? `/${language}` : `/${language}${basePathname}`;
}

export function parseLocalizedPathname(pathname) {
    const normalized = normaliseLocalizedPathname(pathname);
    const segments = normalized.split("/").filter(Boolean);
    const first = normaliseLanguageCode(segments[0]);

    if (!first) {
        return Object.freeze({
            language: DEFAULT_LANGUAGE_CODE,
            basePathname: normalized,
            localizedPathname: normalized,
            explicitLanguage: false,
            explicitDefaultLanguage: false
        });
    }

    const basePathname = segments.length === 1
        ? "/"
        : `/${segments.slice(1).join("/")}`;

    return Object.freeze({
        language: first,
        basePathname,
        localizedPathname: buildLocalizedPathname(basePathname, first),
        explicitLanguage: true,
        explicitDefaultLanguage: first === DEFAULT_LANGUAGE_CODE
    });
}

export function localizePathname(pathname, language = DEFAULT_LANGUAGE_CODE) {
    const parsed = parseLocalizedPathname(pathname);
    const code = normaliseLanguageCode(language) || DEFAULT_LANGUAGE_CODE;
    return buildLocalizedPathname(parsed.basePathname, code);
}

export function localizedProductionUrl(pathname, language = DEFAULT_LANGUAGE_CODE) {
    return productionUrl(localizePathname(pathname, language));
}

export function getDefaultLanguageAliasRedirect(input) {
    const url = input instanceof URL ? new URL(input.toString()) : new URL(input);
    const parsed = parseLocalizedPathname(url.pathname);
    if (!parsed.explicitDefaultLanguage) return null;

    url.pathname = parsed.basePathname;
    return url.toString();
}
