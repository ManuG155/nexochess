export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = [
    "en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const LOCALIZABLE_PATHS = new Set([
    "/", "/home", "/about", "/faq", "/analysis", "/archive", "/academy",
    "/puzzles", "/help", "/signin", "/signup", "/settings",
    "/terms", "/privacy", "/source"
]);

let activeLanguageProvider: (() => SupportedLanguage) | null = null;
let localizedLinkObserver: MutationObserver | null = null;

export function normaliseSupportedLanguage(value?: string | null): SupportedLanguage | null {
    if (!value) return null;
    const code = value.trim().toLowerCase().replace("_", "-").split("-")[0];
    return SUPPORTED_LANGUAGES.includes(code as SupportedLanguage)
        ? code as SupportedLanguage
        : null;
}

function normalisePathname(pathname: string): string {
    let output = pathname.startsWith("/") ? pathname : `/${pathname}`;
    output = output.replace(/\/{2,}/g, "/");
    if (output.length > 1 && output.endsWith("/")) output = output.slice(0, -1);
    return output || "/";
}

export function parseLanguagePathname(pathname: string): {
    language: SupportedLanguage;
    basePathname: string;
    explicitLanguage: boolean;
} {
    const normalized = normalisePathname(pathname);
    const segments = normalized.split("/").filter(Boolean);
    const language = normaliseSupportedLanguage(segments[0]);

    if (!language) {
        return {
            language: DEFAULT_LANGUAGE,
            basePathname: normalized,
            explicitLanguage: false
        };
    }

    return {
        language,
        basePathname: segments.length === 1
            ? "/"
            : `/${segments.slice(1).join("/")}`,
        explicitLanguage: true
    };
}

export function getLanguageRouterBasename(pathname: string): string | undefined {
    const parsed = parseLanguagePathname(pathname);

    return parsed.explicitLanguage
        ? `/${parsed.language}`
        : undefined;
}

export function getUrlLanguage(
    pathname = window.location.pathname
): SupportedLanguage | null {
    const parsed = parseLanguagePathname(pathname);

    return LOCALIZABLE_PATHS.has(parsed.basePathname)
        ? parsed.language
        : null;
}

export function localizePathname(
    pathname: string,
    language: SupportedLanguage
): string {
    const parsed = parseLanguagePathname(pathname);
    if (!LOCALIZABLE_PATHS.has(parsed.basePathname)) return parsed.basePathname;
    if (language === DEFAULT_LANGUAGE) return parsed.basePathname;

    return parsed.basePathname === "/"
        ? `/${language}`
        : `/${language}${parsed.basePathname}`;
}

export function localizeHref(
    href: string,
    language: SupportedLanguage
): string {
    if (typeof window == "undefined") return href;

    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return href;

    url.pathname = localizePathname(url.pathname, language);
    return `${url.pathname}${url.search}${url.hash}`;
}

export function currentLanguageHref(
    href: string,
    fallback: SupportedLanguage = DEFAULT_LANGUAGE
): string {
    return localizeHref(href, getUrlLanguage() || fallback);
}

export function navigateToLanguage(language: SupportedLanguage): boolean {
    if (typeof window == "undefined") return false;

    const target = localizeHref(
        `${window.location.pathname}${window.location.search}${window.location.hash}`,
        language
    );
    const current =
        `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (target === current) return false;
    window.location.assign(target);
    return true;
}

function localizeAnchor(
    anchor: HTMLAnchorElement,
    language: SupportedLanguage
) {
    const href = anchor.getAttribute("href");
    if (
        !href
        || href.startsWith("mailto:")
        || href.startsWith("tel:")
        || href.startsWith("javascript:")
    ) {
        return;
    }

    const localized = localizeHref(href, language);
    if (localized !== href) anchor.setAttribute("href", localized);
}

function refreshLinks(root: ParentNode = document) {
    if (!activeLanguageProvider || typeof document == "undefined") return;

    const language = activeLanguageProvider();
    root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach(anchor => (
        localizeAnchor(anchor, language)
    ));
}

export function refreshLocalizedLinks() {
    refreshLinks();
}

export function installLocalizedLinkRouting(
    getLanguage: () => SupportedLanguage
) {
    if (typeof window == "undefined" || typeof document == "undefined") return;
    activeLanguageProvider = getLanguage;

    const start = () => {
        refreshLinks();
        if (localizedLinkObserver) return;

        localizedLinkObserver = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (
                    mutation.type === "attributes"
                    && mutation.target instanceof HTMLAnchorElement
                ) {
                    localizeAnchor(
                        mutation.target,
                        activeLanguageProvider?.() || DEFAULT_LANGUAGE
                    );
                    continue;
                }

                mutation.addedNodes.forEach(node => {
                    if (!(node instanceof Element)) return;

                    if (node instanceof HTMLAnchorElement) {
                        localizeAnchor(
                            node,
                            activeLanguageProvider?.() || DEFAULT_LANGUAGE
                        );
                    }
                    refreshLinks(node);
                });
            }
        });
        localizedLinkObserver.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["href"]
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
}
