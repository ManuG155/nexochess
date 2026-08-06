import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    INDEXABLE_PAGE_METADATA,
    getIndexablePageMetadata,
    getPageMetadataReplacements
} from "../config/page-metadata.mjs";
import { INDEXABLE_PAGE_ROUTES } from "../config/search-indexing.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const failures = [];

function assert(condition, message) {
    if (!condition) failures.push(message);
}

function countOccurrences(content, fragment) {
    return content.split(fragment).length - 1;
}

function normalise(value) {
    return String(value).trim().toLowerCase();
}

const routePaths = INDEXABLE_PAGE_ROUTES.map(route => route.pathname);
const metadataPaths = Object.keys(INDEXABLE_PAGE_METADATA);

assert(
    routePaths.length === metadataPaths.length,
    "Metadata route count must match the indexable route count."
);

for (const pathname of routePaths) {
    assert(
        metadataPaths.includes(pathname),
        `Missing title and meta description for ${pathname}.`
    );
}

for (const pathname of metadataPaths) {
    assert(
        routePaths.includes(pathname),
        `Metadata exists for non-indexable route ${pathname}.`
    );
}

const titles = new Map();
const descriptions = new Map();

for (const route of INDEXABLE_PAGE_ROUTES) {
    const metadata = getIndexablePageMetadata(route.pathname);

    assert(metadata, `Metadata lookup failed for ${route.pathname}.`);
    if (!metadata) continue;

    const { title, description } = metadata;
    const replacements = getPageMetadataReplacements(route.pathname);

    assert(
        title.length >= 20 && title.length <= 60,
        `${route.pathname} title must contain between 20 and 60 characters; received ${title.length}.`
    );
    assert(
        description.length >= 110 && description.length <= 160,
        `${route.pathname} description must contain between 110 and 160 characters; received ${description.length}.`
    );
    assert(
        title.includes("NexoChess"),
        `${route.pathname} title must include the NexoChess brand.`
    );
    assert(
        !/[<>\n\r]/.test(title),
        `${route.pathname} title contains unsafe HTML characters.`
    );
    assert(
        !/[<>\n\r]/.test(description),
        `${route.pathname} description contains unsafe HTML characters.`
    );
    assert(
        !/lichess/i.test(description),
        `${route.pathname} description must not expose third-party attribution outside the legal page.`
    );
    assert(
        replacements.PAGE_TITLE === title,
        `${route.pathname} PAGE_TITLE replacement does not match the metadata source.`
    );
    assert(
        replacements.PAGE_DESCRIPTION === description,
        `${route.pathname} PAGE_DESCRIPTION replacement does not match the metadata source.`
    );

    const titleKey = normalise(title);
    const descriptionKey = normalise(description);

    assert(
        !titles.has(titleKey),
        `${route.pathname} duplicates the title used by ${titles.get(titleKey)}.`
    );
    assert(
        !descriptions.has(descriptionKey),
        `${route.pathname} duplicates the description used by ${descriptions.get(descriptionKey)}.`
    );

    titles.set(titleKey, route.pathname);
    descriptions.set(descriptionKey, route.pathname);

    const assetPath = path.join(
        repositoryRoot,
        "client/public",
        route.assetPath
    );
    const html = await readFile(assetPath, "utf8");

    assert(
        countOccurrences(html, "<title>${PAGE_TITLE}</title>") === 1,
        `${route.assetPath} must contain one PAGE_TITLE placeholder.`
    );
    assert(
        countOccurrences(
            html,
            '<meta name="description" content="${PAGE_DESCRIPTION}">'
        ) === 1,
        `${route.assetPath} must contain one PAGE_DESCRIPTION placeholder.`
    );

    const rendered = html
        .replaceAll("${PAGE_TITLE}", title)
        .replaceAll("${PAGE_DESCRIPTION}", description);

    assert(
        rendered.includes(`<title>${title}</title>`),
        `${route.pathname} title was not rendered into its HTML asset.`
    );
    assert(
        rendered.includes(`<meta name="description" content="${description}">`),
        `${route.pathname} description was not rendered into its HTML asset.`
    );
    assert(
        !rendered.includes("${PAGE_TITLE}")
            && !rendered.includes("${PAGE_DESCRIPTION}"),
        `${route.pathname} leaves an unresolved page metadata placeholder.`
    );
}

const worker = await readFile(
    path.join(repositoryRoot, "cloudflare/worker.mjs"),
    "utf8"
);

assert(
    worker.includes(
        'import { getPageMetadataReplacements } from "../config/page-metadata.mjs";'
    ),
    "Cloudflare Worker must import the central page metadata source."
);
assert(
    worker.includes("...getPageMetadataReplacements(pathname)"),
    "Cloudflare Worker must inject route-specific page metadata."
);
assert(
    worker.includes("metadataFor(pathname)"),
    "Cloudflare Worker must pass route metadata to rendered pages."
);

if (failures.length > 0) {
    console.error("Page metadata verification failed:\n");

    for (const failure of failures) {
        console.error(`- ${failure}`);
    }

    process.exit(1);
}

console.log(
    `Verified unique titles and meta descriptions for ${routePaths.length} indexable NexoChess routes.`
);
