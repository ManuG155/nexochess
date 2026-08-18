import seoEn from "../client/public/locales/en/seo.json" with { type: "json" };
import seoEs from "../client/public/locales/es/seo.json" with { type: "json" };
import seoFr from "../client/public/locales/fr/seo.json" with { type: "json" };
import seoDe from "../client/public/locales/de/seo.json" with { type: "json" };
import seoPt from "../client/public/locales/pt/seo.json" with { type: "json" };
import seoRu from "../client/public/locales/ru/seo.json" with { type: "json" };
import seoZh from "../client/public/locales/zh/seo.json" with { type: "json" };
import seoVi from "../client/public/locales/vi/seo.json" with { type: "json" };
import seoHi from "../client/public/locales/hi/seo.json" with { type: "json" };
import seoMr from "../client/public/locales/mr/seo.json" with { type: "json" };
import seoPl from "../client/public/locales/pl/seo.json" with { type: "json" };

import { getHreflangReplacements } from "./hreflang.mjs";
import { INDEXABLE_PAGE_ROUTES } from "./search-indexing.mjs";
import { getStructuredDataReplacements } from "./structured-data.mjs";
import { productionUrl } from "./site.mjs";

export const OPEN_GRAPH_IMAGE_METADATA = Object.freeze({
    url: productionUrl("/img/nexochess.png"),
    secureUrl: productionUrl("/img/nexochess.png"),
    type: "image/png",
    width: 1000,
    height: 333,
    alt: "NexoChess"
});

export const OPEN_GRAPH_LOCALES = Object.freeze({
    en: "en_US",
    es: "es_ES",
    fr: "fr_FR",
    de: "de_DE",
    pt: "pt_PT",
    ru: "ru_RU",
    zh: "zh_CN",
    vi: "vi_VN",
    hi: "hi_IN",
    mr: "mr_IN",
    pl: "pl_PL"
});

export const OPEN_GRAPH_DEFAULTS = Object.freeze({
    type: "website",
    siteName: "NexoChess",
    locale: OPEN_GRAPH_LOCALES.en,
    image: OPEN_GRAPH_IMAGE_METADATA
});

export const TWITTER_CARD_DEFAULTS = Object.freeze({
    card: "summary_large_image",
    image: OPEN_GRAPH_IMAGE_METADATA
});

export const SEO_PAGE_KEYS = Object.freeze({
    "/": "home",
    "/about": "about",
    "/faq": "faq",
    "/analysis": "analysis",
    "/engine": "engine",
    "/academy": "academy",
    "/lessons": "lessons",
    "/puzzles": "puzzles",
    "/repertoire": "repertoire",
    "/guides": "guides",
    "/help": "help",
    "/terms": "terms",
    "/privacy": "privacy",
    "/source": "source"
});

export const SEO_DOCUMENTS = Object.freeze({
    en: seoEn,
    es: seoEs,
    fr: seoFr,
    de: seoDe,
    pt: seoPt,
    ru: seoRu,
    zh: seoZh,
    vi: seoVi,
    hi: seoHi,
    mr: seoMr,
    pl: seoPl
});

function createLocalizedPageSet(document) {
    return Object.freeze(Object.fromEntries(
        Object.entries(SEO_PAGE_KEYS).map(([pathname, key]) => {
            const item = document[key];

            if (!item || typeof item.title !== "string"
                || typeof item.description !== "string") {
                throw new Error(`Missing SEO metadata entry: ${key}.`);
            }

            return [pathname, Object.freeze({
                title: item.title,
                description: item.description
            })];
        })
    ));
}

export const LOCALIZED_PAGE_METADATA = Object.freeze(Object.fromEntries(
    Object.entries(SEO_DOCUMENTS).map(([language, document]) => [
        language,
        createLocalizedPageSet(document)
    ])
));

export const BASE_PAGE_METADATA = LOCALIZED_PAGE_METADATA.en;

export function getLocalizedBasePageMetadata(language, basePathname) {
    const localizedPages = LOCALIZED_PAGE_METADATA[language]
        || LOCALIZED_PAGE_METADATA.en;

    return localizedPages[basePathname]
        || LOCALIZED_PAGE_METADATA.en[basePathname]
        || null;
}

function createPageMetadata(route) {
    const base = getLocalizedBasePageMetadata(
        route.language,
        route.basePathname
    );
    const canonicalUrl = productionUrl(route.pathname);
    const locale = OPEN_GRAPH_LOCALES[route.language]
        || OPEN_GRAPH_LOCALES.en;
    const openGraph = Object.freeze({
        type: OPEN_GRAPH_DEFAULTS.type,
        siteName: OPEN_GRAPH_DEFAULTS.siteName,
        locale,
        title: base.title,
        description: base.description,
        url: canonicalUrl,
        image: OPEN_GRAPH_DEFAULTS.image
    });
    const twitter = Object.freeze({
        card: TWITTER_CARD_DEFAULTS.card,
        title: base.title,
        description: base.description,
        image: TWITTER_CARD_DEFAULTS.image
    });

    return Object.freeze({
        title: base.title,
        description: base.description,
        canonicalUrl,
        language: route.language,
        basePathname: route.basePathname,
        openGraph,
        twitter
    });
}

export const INDEXABLE_PAGE_METADATA = Object.freeze(Object.fromEntries(
    INDEXABLE_PAGE_ROUTES.map(route => [
        route.pathname,
        createPageMetadata(route)
    ])
));

export function getIndexablePageMetadata(pathname) {
    return INDEXABLE_PAGE_METADATA[pathname] || null;
}

export function getPageMetadataReplacements(pathname) {
    const metadata = getIndexablePageMetadata(pathname);
    if (!metadata) return {};

    const homeMetadata = getLocalizedBasePageMetadata(
        metadata.language,
        "/"
    );

    return {
        PAGE_TITLE: metadata.title,
        PAGE_DESCRIPTION: metadata.description,
        PAGE_CANONICAL: metadata.canonicalUrl,
        PAGE_LANGUAGE: metadata.language,
        OPEN_GRAPH_TYPE: metadata.openGraph.type,
        OPEN_GRAPH_SITE_NAME: metadata.openGraph.siteName,
        OPEN_GRAPH_LOCALE: metadata.openGraph.locale,
        OPEN_GRAPH_TITLE: metadata.openGraph.title,
        OPEN_GRAPH_DESCRIPTION: metadata.openGraph.description,
        OPEN_GRAPH_URL: metadata.openGraph.url,
        OPEN_GRAPH_IMAGE: metadata.openGraph.image.url,
        OPEN_GRAPH_IMAGE_SECURE_URL: metadata.openGraph.image.secureUrl,
        OPEN_GRAPH_IMAGE_TYPE: metadata.openGraph.image.type,
        OPEN_GRAPH_IMAGE_WIDTH: String(metadata.openGraph.image.width),
        OPEN_GRAPH_IMAGE_HEIGHT: String(metadata.openGraph.image.height),
        OPEN_GRAPH_IMAGE_ALT: metadata.openGraph.image.alt,
        TWITTER_CARD: metadata.twitter.card,
        TWITTER_TITLE: metadata.twitter.title,
        TWITTER_DESCRIPTION: metadata.twitter.description,
        TWITTER_IMAGE: metadata.twitter.image.url,
        TWITTER_IMAGE_ALT: metadata.twitter.image.alt,
        ...getHreflangReplacements(pathname),
        ...getStructuredDataReplacements(
            pathname,
            metadata,
            homeMetadata.description
        )
    };
}
