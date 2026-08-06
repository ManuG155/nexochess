import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    INDEXABLE_PAGE_METADATA,
    OPEN_GRAPH_DEFAULTS,
    OPEN_GRAPH_IMAGE_METADATA,
    TWITTER_CARD_DEFAULTS,
    getPageMetadataReplacements
} from "../config/page-metadata.mjs";
import { INDEXABLE_PAGE_ROUTES } from "../config/search-indexing.mjs";
import {
    PRODUCTION_CANONICAL_ORIGIN,
    productionUrl
} from "../config/site.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const failures = [];

const templateTags = Object.freeze([
    '<meta property="og:type" content="${OPEN_GRAPH_TYPE}">',
    '<meta property="og:site_name" content="${OPEN_GRAPH_SITE_NAME}">',
    '<meta property="og:locale" content="${OPEN_GRAPH_LOCALE}">',
    '<meta property="og:title" content="${OPEN_GRAPH_TITLE}">',
    '<meta property="og:description" content="${OPEN_GRAPH_DESCRIPTION}">',
    '<meta property="og:url" content="${OPEN_GRAPH_URL}">',
    '<meta property="og:image" content="${OPEN_GRAPH_IMAGE}">',
    '<meta property="og:image:secure_url" content="${OPEN_GRAPH_IMAGE_SECURE_URL}">',
    '<meta property="og:image:type" content="${OPEN_GRAPH_IMAGE_TYPE}">',
    '<meta property="og:image:width" content="${OPEN_GRAPH_IMAGE_WIDTH}">',
    '<meta property="og:image:height" content="${OPEN_GRAPH_IMAGE_HEIGHT}">',
    '<meta property="og:image:alt" content="${OPEN_GRAPH_IMAGE_ALT}">',
    '<meta name="twitter:card" content="${TWITTER_CARD}">',
    '<meta name="twitter:title" content="${TWITTER_TITLE}">',
    '<meta name="twitter:description" content="${TWITTER_DESCRIPTION}">',
    '<meta name="twitter:image" content="${TWITTER_IMAGE}">',
    '<meta name="twitter:image:alt" content="${TWITTER_IMAGE_ALT}">'
]);

const replacementKeys = Object.freeze([
    "OPEN_GRAPH_TYPE",
    "OPEN_GRAPH_SITE_NAME",
    "OPEN_GRAPH_LOCALE",
    "OPEN_GRAPH_TITLE",
    "OPEN_GRAPH_DESCRIPTION",
    "OPEN_GRAPH_URL",
    "OPEN_GRAPH_IMAGE",
    "OPEN_GRAPH_IMAGE_SECURE_URL",
    "OPEN_GRAPH_IMAGE_TYPE",
    "OPEN_GRAPH_IMAGE_WIDTH",
    "OPEN_GRAPH_IMAGE_HEIGHT",
    "OPEN_GRAPH_IMAGE_ALT",
    "TWITTER_CARD",
    "TWITTER_TITLE",
    "TWITTER_DESCRIPTION",
    "TWITTER_IMAGE",
    "TWITTER_IMAGE_ALT"
]);

function assert(condition, message) {
    if (!condition) failures.push(message);
}

function countOccurrences(content, fragment) {
    return content.split(fragment).length - 1;
}

function renderTemplate(content, replacements) {
    let rendered = content;

    for (const [key, value] of Object.entries(replacements)) {
        rendered = rendered.replaceAll("${" + key + "}", String(value));
    }

    return rendered;
}

function renderedTag(attribute, key, value) {
    return `<meta ${attribute}="${key}" content="${value}">`;
}

assert(
    OPEN_GRAPH_DEFAULTS.type === "website",
    "Open Graph pages must use the website object type."
);
assert(
    OPEN_GRAPH_DEFAULTS.siteName === "NexoChess",
    "Open Graph site_name must preserve the NexoChess brand."
);
assert(
    /^[a-z]{2}_[A-Z]{2}$/.test(OPEN_GRAPH_DEFAULTS.locale),
    "Open Graph locale must use language_TERRITORY format."
);
assert(
    TWITTER_CARD_DEFAULTS.card === "summary_large_image",
    "Twitter cards must use the large image format."
);

const expectedImageUrl = productionUrl("/img/nexochess.png");
assert(
    OPEN_GRAPH_IMAGE_METADATA.url === expectedImageUrl,
    "Open Graph image must use the canonical production URL."
);
assert(
    OPEN_GRAPH_IMAGE_METADATA.secureUrl === expectedImageUrl,
    "Open Graph secure image URL must match the HTTPS image URL."
);
assert(
    OPEN_GRAPH_IMAGE_METADATA.type === "image/png",
    "Open Graph image type must be image/png."
);
assert(
    OPEN_GRAPH_IMAGE_METADATA.width === 1000
        && OPEN_GRAPH_IMAGE_METADATA.height === 333,
    "Open Graph image metadata must match the existing NexoChess social image."
);
assert(
    OPEN_GRAPH_IMAGE_METADATA.alt === "NexoChess",
    "Open Graph image alt text must preserve the NexoChess brand."
);

const socialUrls = new Map();

for (const route of INDEXABLE_PAGE_ROUTES) {
    const metadata = INDEXABLE_PAGE_METADATA[route.pathname];
    const replacements = getPageMetadataReplacements(route.pathname);

    assert(metadata, `Missing social metadata for ${route.pathname}.`);
    if (!metadata) continue;

    assert(
        metadata.openGraph.title === metadata.title
            && metadata.twitter.title === metadata.title,
        `${route.pathname} social titles must match the canonical page title.`
    );
    assert(
        metadata.openGraph.description === metadata.description
            && metadata.twitter.description === metadata.description,
        `${route.pathname} social descriptions must match the canonical page description.`
    );
    assert(
        metadata.openGraph.url === productionUrl(route.pathname),
        `${route.pathname} Open Graph URL is not canonical.`
    );
    assert(
        metadata.openGraph.image === OPEN_GRAPH_IMAGE_METADATA
            && metadata.twitter.image === OPEN_GRAPH_IMAGE_METADATA,
        `${route.pathname} must use the central social image definition.`
    );
    assert(
        !/(?:lichess|chess\.com|chessigma)/i.test(
            `${metadata.openGraph.title} ${metadata.openGraph.description}`
        ),
        `${route.pathname} social metadata must not imitate or promote third-party chess brands.`
    );

    const socialUrl = new URL(metadata.openGraph.url);
    assert(
        socialUrl.origin === PRODUCTION_CANONICAL_ORIGIN,
        `${route.pathname} Open Graph URL targets a non-canonical origin.`
    );
    assert(
        !socialUrls.has(metadata.openGraph.url),
        `${route.pathname} duplicates the Open Graph URL used by ${socialUrls.get(metadata.openGraph.url)}.`
    );
    socialUrls.set(metadata.openGraph.url, route.pathname);

    for (const key of replacementKeys) {
        assert(
            typeof replacements[key] === "string" && replacements[key].length > 0,
            `${route.pathname} is missing the ${key} replacement.`
        );
        assert(
            !/[<>"\n\r]/.test(replacements[key]),
            `${route.pathname} replacement ${key} contains unsafe HTML characters.`
        );
    }

    const assetPath = path.join(repositoryRoot, "client/public", route.assetPath);
    const html = await readFile(assetPath, "utf8");

    for (const tag of templateTags) {
        assert(
            countOccurrences(html, tag) === 1,
            `${route.assetPath} must contain exactly one ${tag}.`
        );
    }

    const rendered = renderTemplate(html, replacements);

    assert(
        !rendered.includes("${OPEN_GRAPH_")
            && !rendered.includes("${TWITTER_"),
        `${route.pathname} leaves unresolved social metadata placeholders.`
    );

    const expectedRenderedTags = [
        renderedTag("property", "og:type", metadata.openGraph.type),
        renderedTag("property", "og:site_name", metadata.openGraph.siteName),
        renderedTag("property", "og:locale", metadata.openGraph.locale),
        renderedTag("property", "og:title", metadata.openGraph.title),
        renderedTag("property", "og:description", metadata.openGraph.description),
        renderedTag("property", "og:url", metadata.openGraph.url),
        renderedTag("property", "og:image", metadata.openGraph.image.url),
        renderedTag(
            "property",
            "og:image:secure_url",
            metadata.openGraph.image.secureUrl
        ),
        renderedTag("property", "og:image:type", metadata.openGraph.image.type),
        renderedTag(
            "property",
            "og:image:width",
            String(metadata.openGraph.image.width)
        ),
        renderedTag(
            "property",
            "og:image:height",
            String(metadata.openGraph.image.height)
        ),
        renderedTag("property", "og:image:alt", metadata.openGraph.image.alt),
        renderedTag("name", "twitter:card", metadata.twitter.card),
        renderedTag("name", "twitter:title", metadata.twitter.title),
        renderedTag(
            "name",
            "twitter:description",
            metadata.twitter.description
        ),
        renderedTag("name", "twitter:image", metadata.twitter.image.url),
        renderedTag("name", "twitter:image:alt", metadata.twitter.image.alt)
    ];

    for (const tag of expectedRenderedTags) {
        assert(
            rendered.includes(tag),
            `${route.pathname} did not render social tag: ${tag}`
        );
    }
}

const imagePath = path.join(
    repositoryRoot,
    "client/public/img/nexochess.png"
);
const image = await readFile(imagePath);
const pngSignature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]);

assert(
    image.subarray(0, pngSignature.length).equals(pngSignature),
    "Open Graph image must be a valid PNG file."
);

if (image.length >= 24) {
    const width = image.readUInt32BE(16);
    const height = image.readUInt32BE(20);

    assert(
        width === OPEN_GRAPH_IMAGE_METADATA.width
            && height === OPEN_GRAPH_IMAGE_METADATA.height,
        `Open Graph image dimensions ${width}x${height} do not match the metadata.`
    );
    assert(
        width >= 600 && height >= 300,
        `Open Graph image dimensions ${width}x${height} are too small for a rich preview.`
    );
}

assert(
    image.length >= 10_000 && image.length <= 5_000_000,
    `Open Graph image size ${image.length} bytes must be between 10 KB and 5 MB.`
);

if (failures.length > 0) {
    console.error("Open Graph verification failed:\n");

    for (const failure of failures) {
        console.error(`- ${failure}`);
    }

    process.exit(1);
}

console.log(
    `Verified Open Graph and Twitter cards for ${INDEXABLE_PAGE_ROUTES.length} `
    + "indexable NexoChess routes with one canonical social image."
);
