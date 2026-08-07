import {
    DEFAULT_LANGUAGE_CODE,
    SUPPORTED_LANGUAGE_CODES,
    localizePathname,
    parseLocalizedPathname
} from "./language-routing.mjs";
import { productionUrl } from "./site.mjs";

export const HREFLANG_LANGUAGE_CODES = SUPPORTED_LANGUAGE_CODES;
export const HREFLANG_X_DEFAULT = "x-default";

function createAlternate(hreflang, href) {
    return Object.freeze({ hreflang, href });
}

export function getHreflangAlternates(pathname) {
    const { basePathname } = parseLocalizedPathname(pathname);
    const languageAlternates = HREFLANG_LANGUAGE_CODES.map(language => (
        createAlternate(
            language,
            productionUrl(localizePathname(basePathname, language))
        )
    ));

    return Object.freeze([
        ...languageAlternates,
        createAlternate(
            HREFLANG_X_DEFAULT,
            productionUrl(localizePathname(basePathname, DEFAULT_LANGUAGE_CODE))
        )
    ]);
}

export function renderHreflangLinks(pathname) {
    return getHreflangAlternates(pathname)
        .map(({ hreflang, href }) => (
            `<link rel="alternate" hreflang="${hreflang}" href="${href}">`
        ))
        .join("\n    ");
}

export function getHreflangReplacements(pathname) {
    return { HREFLANG_LINKS: renderHreflangLinks(pathname) };
}
