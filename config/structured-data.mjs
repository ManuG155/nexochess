import helpCenterEn from "../client/public/locales/en/helpCenter.json" with { type: "json" };
import helpCenterEs from "../client/public/locales/es/helpCenter.json" with { type: "json" };
import helpCenterFr from "../client/public/locales/fr/helpCenter.json" with { type: "json" };
import helpCenterDe from "../client/public/locales/de/helpCenter.json" with { type: "json" };
import helpCenterPt from "../client/public/locales/pt/helpCenter.json" with { type: "json" };
import helpCenterRu from "../client/public/locales/ru/helpCenter.json" with { type: "json" };
import helpCenterZh from "../client/public/locales/zh/helpCenter.json" with { type: "json" };
import helpCenterVi from "../client/public/locales/vi/helpCenter.json" with { type: "json" };
import helpCenterHi from "../client/public/locales/hi/helpCenter.json" with { type: "json" };
import helpCenterMr from "../client/public/locales/mr/helpCenter.json" with { type: "json" };
import helpCenterPl from "../client/public/locales/pl/helpCenter.json" with { type: "json" };

import {
    SUPPORTED_LANGUAGE_CODES,
    localizePathname,
    parseLocalizedPathname
} from "./language-routing.mjs";
import { productionUrl } from "./site.mjs";

export const STRUCTURED_DATA_LANGUAGE_CODES = SUPPORTED_LANGUAGE_CODES;

export const STRUCTURED_DATA_IDS = Object.freeze({
    image: productionUrl("/#primaryimage"),
    organization: productionUrl("/#organization"),
    website: productionUrl("/#website"),
    application: productionUrl("/#software")
});

const HELP_CENTER_CONTENT = Object.freeze({
    en: helpCenterEn,
    es: helpCenterEs,
    fr: helpCenterFr,
    de: helpCenterDe,
    pt: helpCenterPt,
    ru: helpCenterRu,
    zh: helpCenterZh,
    vi: helpCenterVi,
    hi: helpCenterHi,
    mr: helpCenterMr,
    pl: helpCenterPl
});

const FAQ_KEYS = Object.freeze([
    "account",
    "archive",
    "engine",
    "languages",
    "privacy"
]);

function freezeFaqItems(content) {
    return Object.freeze(FAQ_KEYS.map(key => Object.freeze({
        question: content.faq[key].question,
        answer: content.faq[key].answer
    })));
}

export const FAQ_STRUCTURED_DATA_ITEMS_BY_LANGUAGE = Object.freeze(
    Object.fromEntries(SUPPORTED_LANGUAGE_CODES.map(language => [
        language,
        freezeFaqItems(HELP_CENTER_CONTENT[language])
    ]))
);

export const FAQ_STRUCTURED_DATA_ITEMS =
    FAQ_STRUCTURED_DATA_ITEMS_BY_LANGUAGE.en;

export function getFaqStructuredDataItems(language) {
    return FAQ_STRUCTURED_DATA_ITEMS_BY_LANGUAGE[language]
        || FAQ_STRUCTURED_DATA_ITEMS_BY_LANGUAGE.en;
}

const PAGE_SCHEMA_TYPES = Object.freeze({
    "/": "WebPage",
    "/about": "AboutPage",
    "/faq": "FAQPage",
    "/analysis": "WebPage",
    "/academy": "WebPage",
    "/puzzles": "WebPage",
    "/guides": "CollectionPage",
    "/help": "WebPage",
    "/terms": "WebPage",
    "/privacy": "WebPage",
    "/source": "WebPage"
});

const FEATURE_PAGE_PATHS = new Set([
    "/",
    "/analysis",
    "/academy",
    "/puzzles",
    "/help"
]);

function reference(id) {
    return Object.freeze({ "@id": id });
}

function createImageObject() {
    return Object.freeze({
        "@type": "ImageObject",
        "@id": STRUCTURED_DATA_IDS.image,
        url: productionUrl("/img/nexochess.png"),
        contentUrl: productionUrl("/img/nexochess.png"),
        width: 1000,
        height: 333,
        caption: "NexoChess"
    });
}

function createOrganization() {
    return Object.freeze({
        "@type": "Organization",
        "@id": STRUCTURED_DATA_IDS.organization,
        name: "NexoChess",
        alternateName: "Nexo Chess",
        url: productionUrl("/"),
        logo: reference(STRUCTURED_DATA_IDS.image),
        email: "contact@nexochess.com",
        sameAs: Object.freeze([
            "https://github.com/ManuG155/nexochess"
        ]),
        contactPoint: Object.freeze({
            "@type": "ContactPoint",
            contactType: "technical support",
            email: "contact@nexochess.com",
            availableLanguage: STRUCTURED_DATA_LANGUAGE_CODES
        })
    });
}

function createWebsite(homeDescription) {
    return Object.freeze({
        "@type": "WebSite",
        "@id": STRUCTURED_DATA_IDS.website,
        url: productionUrl("/"),
        name: "NexoChess",
        alternateName: Object.freeze([
            "Nexo Chess",
            "nexochess.com"
        ]),
        description: homeDescription,
        publisher: reference(STRUCTURED_DATA_IDS.organization),
        inLanguage: STRUCTURED_DATA_LANGUAGE_CODES
    });
}

function createApplication(homeDescription, language) {
    return Object.freeze({
        "@type": "SoftwareApplication",
        "@id": STRUCTURED_DATA_IDS.application,
        name: "NexoChess",
        alternateName: "Nexo Chess",
        url: productionUrl("/"),
        description: homeDescription,
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "Chess analysis and training",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and a modern web browser.",
        softwareVersion: "1.1",
        image: reference(STRUCTURED_DATA_IDS.image),
        publisher: reference(STRUCTURED_DATA_IDS.organization),
        isAccessibleForFree: true,
        inLanguage: STRUCTURED_DATA_LANGUAGE_CODES,
        offers: Object.freeze({
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR"
        }),
        softwareHelp: reference(productionUrl(
            `${localizePathname("/help", language)}#webpage`
        )),
        featureList: Object.freeze([
            "Chess game analysis",
            "Move-by-move review",
            "Saved game archive",
            "Chess puzzles and tactics training",
            "Interactive chess lessons",
            "Interface available in eleven languages"
        ])
    });
}

function createFaqQuestions(language) {
    return getFaqStructuredDataItems(language).map(item => Object.freeze({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: Object.freeze({
            "@type": "Answer",
            text: item.answer
        })
    }));
}

function createWebPage(pathname, metadata) {
    const parsed = parseLocalizedPathname(pathname);
    const basePathname = parsed.basePathname;
    const url = metadata.canonicalUrl;
    const page = {
        "@type": PAGE_SCHEMA_TYPES[basePathname],
        "@id": `${url}#webpage`,
        url,
        name: metadata.title,
        description: metadata.description,
        isPartOf: reference(STRUCTURED_DATA_IDS.website),
        about: reference(STRUCTURED_DATA_IDS.application),
        publisher: reference(STRUCTURED_DATA_IDS.organization),
        primaryImageOfPage: reference(STRUCTURED_DATA_IDS.image),
        inLanguage: parsed.language
    };

    if (basePathname === "/about") {
        page.mainEntity = reference(STRUCTURED_DATA_IDS.organization);
    } else if (basePathname === "/faq") {
        page.mainEntity = Object.freeze(createFaqQuestions(parsed.language));
    } else if (FEATURE_PAGE_PATHS.has(basePathname)) {
        page.mainEntity = reference(STRUCTURED_DATA_IDS.application);
    }

    return Object.freeze(page);
}

export function getStructuredData(pathname, metadata, homeDescription) {
    const basePathname = parseLocalizedPathname(pathname).basePathname;
    if (!metadata || !PAGE_SCHEMA_TYPES[basePathname]) return null;

    return Object.freeze({
        "@context": "https://schema.org",
        "@graph": Object.freeze([
            createImageObject(),
            createOrganization(),
            createWebsite(homeDescription),
            createApplication(
                homeDescription,
                parseLocalizedPathname(pathname).language
            ),
            createWebPage(pathname, metadata)
        ])
    });
}

export function serializeStructuredData(pathname, metadata, homeDescription) {
    const structuredData = getStructuredData(
        pathname,
        metadata,
        homeDescription
    );
    if (!structuredData) return "";

    return JSON.stringify(structuredData)
        .replaceAll("&", "\\u0026")
        .replaceAll("<", "\\u003c")
        .replaceAll(">", "\\u003e");
}

export function getStructuredDataReplacements(
    pathname,
    metadata,
    homeDescription
) {
    const serialized = serializeStructuredData(
        pathname,
        metadata,
        homeDescription
    );

    return serialized
        ? { STRUCTURED_DATA_JSON: serialized }
        : {};
}
