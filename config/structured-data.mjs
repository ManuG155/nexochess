import { productionUrl } from "./site.mjs";

export const STRUCTURED_DATA_LANGUAGE_CODES = Object.freeze([
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
]);

export const STRUCTURED_DATA_IDS = Object.freeze({
    image: productionUrl("/#primaryimage"),
    organization: productionUrl("/#organization"),
    website: productionUrl("/#website"),
    application: productionUrl("/#software")
});

export const FAQ_STRUCTURED_DATA_ITEMS = Object.freeze([
    Object.freeze({
        question: "Do I need an account to analyse games?",
        answer: "No. You can analyse games and use the local Archive without creating an account. An account is only needed for optional synchronisation across devices."
    }),
    Object.freeze({
        question: "Where are my analyses saved?",
        answer: "Guest analyses are stored in the current browser. When you sign in, compatible data can also be associated with your account for cross-device access."
    }),
    Object.freeze({
        question: "Which chess engine does NexoChess use?",
        answer: "NexoChess uses Stockfish 17 to evaluate positions and produce the engine lines used by the review."
    }),
    Object.freeze({
        question: "How is the language selected?",
        answer: "On the first visit, NexoChess follows your browser language when it is supported. You can change it manually at any time in Appearance settings."
    }),
    Object.freeze({
        question: "Is an account required to keep my local games?",
        answer: "No. The local Archive works without an account. Signing in is optional and is intended for synchronisation and account features."
    })
]);

const PAGE_SCHEMA_TYPES = Object.freeze({
    "/": "WebPage",
    "/about": "AboutPage",
    "/faq": "FAQPage",
    "/analysis": "WebPage",
    "/academy": "WebPage",
    "/puzzles": "WebPage",
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
        description: homeDescription,
        publisher: reference(STRUCTURED_DATA_IDS.organization),
        inLanguage: STRUCTURED_DATA_LANGUAGE_CODES
    });
}

function createApplication(homeDescription) {
    return Object.freeze({
        "@type": "SoftwareApplication",
        "@id": STRUCTURED_DATA_IDS.application,
        name: "NexoChess",
        url: productionUrl("/"),
        description: homeDescription,
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "Chess analysis and training",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and a modern web browser.",
        image: reference(STRUCTURED_DATA_IDS.image),
        publisher: reference(STRUCTURED_DATA_IDS.organization),
        isAccessibleForFree: true,
        inLanguage: STRUCTURED_DATA_LANGUAGE_CODES,
        offers: Object.freeze({
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR"
        }),
        softwareHelp: reference(productionUrl("/help#webpage")),
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

function createFaqQuestions() {
    return FAQ_STRUCTURED_DATA_ITEMS.map(item => Object.freeze({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: Object.freeze({
            "@type": "Answer",
            text: item.answer
        })
    }));
}

function createWebPage(pathname, metadata) {
    const url = productionUrl(pathname);
    const page = {
        "@type": PAGE_SCHEMA_TYPES[pathname],
        "@id": `${url}#webpage`,
        url,
        name: metadata.title,
        description: metadata.description,
        isPartOf: reference(STRUCTURED_DATA_IDS.website),
        about: reference(STRUCTURED_DATA_IDS.application),
        publisher: reference(STRUCTURED_DATA_IDS.organization),
        primaryImageOfPage: reference(STRUCTURED_DATA_IDS.image),
        inLanguage: "en"
    };

    if (pathname === "/about") {
        page.mainEntity = reference(STRUCTURED_DATA_IDS.organization);
    } else if (pathname === "/faq") {
        page.mainEntity = Object.freeze(createFaqQuestions());
    } else if (FEATURE_PAGE_PATHS.has(pathname)) {
        page.mainEntity = reference(STRUCTURED_DATA_IDS.application);
    }

    return Object.freeze(page);
}

export function getStructuredData(pathname, metadata, homeDescription) {
    if (!metadata || !PAGE_SCHEMA_TYPES[pathname]) return null;

    return Object.freeze({
        "@context": "https://schema.org",
        "@graph": Object.freeze([
            createImageObject(),
            createOrganization(),
            createWebsite(homeDescription),
            createApplication(homeDescription),
            createWebPage(pathname, metadata)
        ])
    });
}

export function serializeStructuredData(pathname, metadata, homeDescription) {
    const structuredData = getStructuredData(pathname, metadata, homeDescription);

    if (!structuredData) return "";

    return JSON.stringify(structuredData)
        .replaceAll("&", "\\u0026")
        .replaceAll("<", "\\u003c")
        .replaceAll(">", "\\u003e");
}

export function getStructuredDataReplacements(pathname, metadata, homeDescription) {
    const serialized = serializeStructuredData(pathname, metadata, homeDescription);

    return serialized
        ? { STRUCTURED_DATA_JSON: serialized }
        : {};
}
