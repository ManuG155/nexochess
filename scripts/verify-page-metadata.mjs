import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    INDEXABLE_PAGE_METADATA,
    LOCALIZED_PAGE_METADATA,
    OPEN_GRAPH_LOCALES,
    SEO_DOCUMENTS,
    SEO_PAGE_KEYS,
    getIndexablePageMetadata,
    getPageMetadataReplacements
} from "../config/page-metadata.mjs";
import { SUPPORTED_LANGUAGE_CODES } from "../config/language-routing.mjs";
import {
    BASE_INDEXABLE_PAGE_ROUTES,
    INDEXABLE_PAGE_ROUTES
} from "../config/search-indexing.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const basePaths = BASE_INDEXABLE_PAGE_ROUTES.map(route => route.pathname);
const seoKeys = Object.values(SEO_PAGE_KEYS);

function assert(condition, message) {
    if (!condition) failures.push(message);
}

function count(content, fragment) {
    return content.split(fragment).length - 1;
}

function normalise(value) {
    return String(value).trim().toLocaleLowerCase();
}

function validateLength(language, pathname, title, description) {
    const compact = language === "zh";
    const titleRange = compact ? [10, 45] : [20, 75];
    const descriptionRange = compact ? [35, 110] : [80, 210];

    assert(
        title.length >= titleRange[0] && title.length <= titleRange[1],
        `${language}${pathname} title length ${title.length} is outside ${titleRange.join("–")}.`
    );
    assert(
        description.length >= descriptionRange[0]
            && description.length <= descriptionRange[1],
        `${language}${pathname} description length ${description.length} is outside ${descriptionRange.join("–")}.`
    );
}

assert(SUPPORTED_LANGUAGE_CODES.length === 11, "Eleven languages are required.");
assert(basePaths.length === 11, "Eleven public base pages are required.");
assert(INDEXABLE_PAGE_ROUTES.length === 121, "Exactly 121 localized routes are required.");
assert(Object.keys(INDEXABLE_PAGE_METADATA).length === 121, "Metadata must cover all 121 routes.");
assert(Object.keys(LOCALIZED_PAGE_METADATA).length === 11, "Localized metadata must cover eleven languages.");
assert(Object.keys(SEO_DOCUMENTS).length === 11, "Eleven seo.json documents are required.");
assert(Object.keys(SEO_PAGE_KEYS).length === 11 && new Set(seoKeys).size === 11,
    "SEO page keys must describe eleven unique pages.");
assert(Object.keys(OPEN_GRAPH_LOCALES).length === 11
    && new Set(Object.values(OPEN_GRAPH_LOCALES)).size === 11,
    "Open Graph locales must cover eleven unique locales.");

for (const language of SUPPORTED_LANGUAGE_CODES) {
    const document = SEO_DOCUMENTS[language];
    const pages = LOCALIZED_PAGE_METADATA[language];
    const documentKeys = Object.keys(document || {});
    const pagePaths = Object.keys(pages || {});
    const titles = new Set();
    const descriptions = new Set();

    assert(document && pages, `${language} SEO metadata is missing.`);
    if (!document || !pages) continue;

    assert(documentKeys.length === 11
        && seoKeys.every(key => documentKeys.includes(key))
        && documentKeys.every(key => seoKeys.includes(key)),
    `${language}/seo.json must contain exactly the eleven page keys.`);
    assert(pagePaths.length === 11
        && basePaths.every(pathname => pagePaths.includes(pathname)),
    `${language} normalized metadata must cover eleven pages.`);
    assert(/^[a-z]{2}_[A-Z]{2}$/.test(OPEN_GRAPH_LOCALES[language]),
        `${language} Open Graph locale is invalid.`);

    for (const pathname of basePaths) {
        const item = pages[pathname];
        assert(item, `${language}${pathname} metadata is missing.`);
        if (!item) continue;

        const { title, description } = item;
        validateLength(language, pathname, title, description);
        assert(title.includes("NexoChess"), `${language}${pathname} title must include NexoChess.`);
        assert(!/[<>"\n\r]/.test(`${title}${description}`),
            `${language}${pathname} contains unsafe HTML attribute characters.`);
        assert(!/(?:lichess|chess\.com|chessigma)/i.test(`${title} ${description}`),
            `${language}${pathname} contains third-party chess branding.`);
        assert(!titles.has(normalise(title)), `${language}${pathname} duplicates a title.`);
        assert(!descriptions.has(normalise(description)), `${language}${pathname} duplicates a description.`);
        titles.add(normalise(title));
        descriptions.add(normalise(description));

        if (language !== "en") {
            const english = LOCALIZED_PAGE_METADATA.en[pathname];
            assert(title !== english.title, `${language}${pathname} title remains English.`);
            assert(description !== english.description, `${language}${pathname} description remains English.`);
        }
    }
}

for (const route of INDEXABLE_PAGE_ROUTES) {
    const metadata = getIndexablePageMetadata(route.pathname);
    const expected = LOCALIZED_PAGE_METADATA[route.language]?.[route.basePathname];
    const replacements = getPageMetadataReplacements(route.pathname);

    assert(metadata && expected, `${route.pathname} metadata lookup failed.`);
    if (!metadata || !expected) continue;

    assert(metadata.title === expected.title && metadata.description === expected.description,
        `${route.pathname} does not use its localized seo.json entry.`);
    assert(metadata.language === route.language && metadata.basePathname === route.basePathname,
        `${route.pathname} route identity is inconsistent.`);
    assert(metadata.openGraph.locale === OPEN_GRAPH_LOCALES[route.language],
        `${route.pathname} Open Graph locale is incorrect.`);
    assert(metadata.openGraph.title === metadata.title
        && metadata.openGraph.description === metadata.description
        && metadata.twitter.title === metadata.title
        && metadata.twitter.description === metadata.description,
    `${route.pathname} social metadata is not localized.`);
    assert(replacements.PAGE_TITLE === metadata.title
        && replacements.PAGE_DESCRIPTION === metadata.description
        && replacements.PAGE_LANGUAGE === route.language
        && replacements.OPEN_GRAPH_LOCALE === OPEN_GRAPH_LOCALES[route.language],
    `${route.pathname} rendered replacements are inconsistent.`);

    const html = await readFile(path.join(root, "client/public", route.assetPath), "utf8");
    assert(count(html, "<title>${PAGE_TITLE}</title>") === 1,
        `${route.assetPath} must contain one PAGE_TITLE placeholder.`);
    assert(count(html, '<meta name="description" content="${PAGE_DESCRIPTION}">') === 1,
        `${route.assetPath} must contain one PAGE_DESCRIPTION placeholder.`);
    assert(count(html, '<html lang="${PAGE_LANGUAGE}">') === 1,
        `${route.assetPath} must contain one PAGE_LANGUAGE placeholder.`);
}

const worker = await readFile(path.join(root, "cloudflare/worker.mjs"), "utf8");
for (const fragment of [
    'import { getPageMetadataReplacements } from "../config/page-metadata.mjs";',
    "getPageMetadataReplacements(localizedPathname)",
    "metadataFor(localizedPathname, pathname, languageRoute.language)"
]) {
    assert(worker.includes(fragment), `Worker metadata integration is missing: ${fragment}`);
}

if (failures.length) {
    console.error("Page metadata verification failed:\n");
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
}

console.log("Verified 121 localized titles, descriptions, social metadata and HTML languages.");
