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

export const OPEN_GRAPH_DEFAULTS = Object.freeze({
    type: "website",
    siteName: "NexoChess",
    locale: "en_US",
    image: OPEN_GRAPH_IMAGE_METADATA
});

export const TWITTER_CARD_DEFAULTS = Object.freeze({
    card: "summary_large_image",
    image: OPEN_GRAPH_IMAGE_METADATA
});

export const BASE_PAGE_METADATA = Object.freeze({
    "/": Object.freeze({
        title: "NexoChess — Understand Every Move",
        description: "Analyse your chess games, understand every critical move, revisit saved reviews and train with more than six million puzzles in NexoChess."
    }),
    "/about": Object.freeze({
        title: "About NexoChess — Independent Chess Tools",
        description: "Learn why NexoChess exists, how its independent chess tools are built and which principles guide its analysis, training and open-source development."
    }),
    "/faq": Object.freeze({
        title: "NexoChess FAQ — Accounts, Analysis and Privacy",
        description: "Find clear answers about NexoChess accounts, chess analysis, saved games, puzzles, supported languages, privacy and other common questions."
    }),
    "/analysis": Object.freeze({
        title: "Free Chess Game Analysis with Stockfish — NexoChess",
        description: "Analyse chess games with Stockfish, review critical moments, move classifications, accuracy and estimated performance in a clear interactive board."
    }),
    "/academy": Object.freeze({
        title: "NexoChess Academy — Learn Chess Notation",
        description: "Learn chess notation, piece movement and NexoChess move classifications through short interactive lessons designed for practical understanding."
    }),
    "/puzzles": Object.freeze({
        title: "Chess Puzzles and Tactics Training — NexoChess",
        description: "Train chess tactics with puzzles created from your analysed games or filtered by theme and difficulty from a database of more than six million positions."
    }),
    "/help": Object.freeze({
        title: "NexoChess Help Center — Guides and Troubleshooting",
        description: "Learn how to analyse games, use the Archive, train with puzzles, manage your account and solve common NexoChess problems with practical guides."
    }),
    "/terms": Object.freeze({
        title: "NexoChess Terms of Service",
        description: "Read the terms that govern access to NexoChess, its chess analysis, accounts, saved games, puzzles and other available services."
    }),
    "/privacy": Object.freeze({
        title: "NexoChess Privacy Policy",
        description: "Learn what data NexoChess processes, why it is used, how account and browser information is handled and which privacy choices are available."
    }),
    "/source": Object.freeze({
        title: "NexoChess Source Code and Licences",
        description: "Review the NexoChess source code, open-source licences, third-party components, chess engine information and required data attributions."
    })
});

function createPageMetadata(route) {
    const base = BASE_PAGE_METADATA[route.basePathname];
    const canonicalUrl = productionUrl(route.pathname);
    const openGraph = Object.freeze({
        type: OPEN_GRAPH_DEFAULTS.type,
        siteName: OPEN_GRAPH_DEFAULTS.siteName,
        locale: OPEN_GRAPH_DEFAULTS.locale,
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
    INDEXABLE_PAGE_ROUTES.map(route => [route.pathname, createPageMetadata(route)])
));

export function getIndexablePageMetadata(pathname) {
    return INDEXABLE_PAGE_METADATA[pathname] || null;
}

export function getPageMetadataReplacements(pathname) {
    const metadata = getIndexablePageMetadata(pathname);
    if (!metadata) return {};

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
        ...getStructuredDataReplacements(
            pathname,
            metadata,
            BASE_PAGE_METADATA["/"].description
        )
    };
}
