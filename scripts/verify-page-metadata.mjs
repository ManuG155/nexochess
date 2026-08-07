import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    INDEXABLE_PAGE_METADATA,
    getIndexablePageMetadata,
    getPageMetadataReplacements
} from "../config/page-metadata.mjs";
import { INDEXABLE_PAGE_ROUTES } from "../config/search-indexing.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(condition, message) {
    if (!condition) failures.push(message);
}

function countOccurrences(content, fragment) {
    return content.split(fragment).length - 1;
}

const routePaths = INDEXABLE_PAGE_ROUTES.map(route => route.pathname);
const metadataPaths = Object.keys(INDEXABLE_PAGE_METADATA);
assert(routePaths.length === metadataPaths.length, "Metadata route count must match the indexable route count.");
for (const pathname of routePaths) assert(metadataPaths.includes(pathname), `Missing metadata for ${pathname}.`);
for (const pathname of metadataPaths) assert(routePaths.includes(pathname), `Metadata exists for non-indexable route ${pathname}.`);

const titlesByLanguage = new Map();
const descriptionsByLanguage = new Map();

for (const route of INDEXABLE_PAGE_ROUTES) {
    const metadata = getIndexablePageMetadata(route.pathname);
    assert(metadata, `Metadata lookup failed for ${route.pathname}.`);
    if (!metadata) continue;

    const { title, description } = metadata;
    const replacements = getPageMetadataReplacements(route.pathname);
    assert(title.length >= 20 && title.length <= 60, `${route.pathname} title length is ${title.length}.`);
    assert(description.length >= 110 && description.length <= 160, `${route.pathname} description length is ${description.length}.`);
    assert(title.includes("NexoChess"), `${route.pathname} title must include NexoChess.`);
    assert(!/[<>\n\r]/.test(title) && !/[<>\n\r]/.test(description), `${route.pathname} metadata contains unsafe characters.`);
    assert(!/lichess/i.test(description), `${route.pathname} description must not promote third-party branding.`);
    assert(replacements.PAGE_TITLE === title, `${route.pathname} PAGE_TITLE mismatch.`);
    assert(replacements.PAGE_DESCRIPTION === description, `${route.pathname} PAGE_DESCRIPTION mismatch.`);
    assert(replacements.PAGE_LANGUAGE === route.language, `${route.pathname} PAGE_LANGUAGE mismatch.`);
    assert(metadata.language === route.language, `${route.pathname} metadata language mismatch.`);
    assert(metadata.basePathname === route.basePathname, `${route.pathname} base route mismatch.`);

    const titleKey = `${route.language}:${title.trim().toLowerCase()}`;
    const descriptionKey = `${route.language}:${description.trim().toLowerCase()}`;
    assert(!titlesByLanguage.has(titleKey), `${route.pathname} duplicates the title used by ${titlesByLanguage.get(titleKey)} in ${route.language}.`);
    assert(!descriptionsByLanguage.has(descriptionKey), `${route.pathname} duplicates the description used by ${descriptionsByLanguage.get(descriptionKey)} in ${route.language}.`);
    titlesByLanguage.set(titleKey, route.pathname);
    descriptionsByLanguage.set(descriptionKey, route.pathname);

    const html = await readFile(path.join(repositoryRoot, "client/public", route.assetPath), "utf8");
    assert(countOccurrences(html, "<title>${PAGE_TITLE}</title>") === 1, `${route.assetPath} must contain one PAGE_TITLE.`);
    assert(countOccurrences(html, '<meta name="description" content="${PAGE_DESCRIPTION}">') === 1, `${route.assetPath} must contain one PAGE_DESCRIPTION.`);
    assert(countOccurrences(html, '<html lang="${PAGE_LANGUAGE}">') === 1, `${route.assetPath} must contain one PAGE_LANGUAGE.`);

    const rendered = html
        .replaceAll("${PAGE_TITLE}", title)
        .replaceAll("${PAGE_DESCRIPTION}", description)
        .replaceAll("${PAGE_LANGUAGE}", route.language);
    assert(rendered.includes(`<title>${title}</title>`));
    assert(rendered.includes(`<meta name="description" content="${description}">`));
    assert(rendered.includes(`<html lang="${route.language}">`));
}

const worker = await readFile(path.join(repositoryRoot, "cloudflare/worker.mjs"), "utf8");
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

console.log(`Verified page metadata and HTML language values for ${routePaths.length} localized routes.`);
