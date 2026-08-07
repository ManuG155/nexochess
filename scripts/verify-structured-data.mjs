import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { INDEXABLE_PAGE_METADATA, BASE_PAGE_METADATA } from "../config/page-metadata.mjs";
import { INDEXABLE_PAGE_ROUTES } from "../config/search-indexing.mjs";
import {
    FAQ_STRUCTURED_DATA_ITEMS,
    STRUCTURED_DATA_IDS,
    STRUCTURED_DATA_LANGUAGE_CODES,
    getStructuredData,
    getStructuredDataReplacements,
    serializeStructuredData
} from "../config/structured-data.mjs";
import { productionUrl } from "../config/site.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const jsonLdTemplate = '<script type="application/ld+json">${STRUCTURED_DATA_JSON}</script>';

function assert(condition, message) {
    if (!condition) failures.push(message);
}

function findNode(graph, type) {
    return graph.find(node => node["@type"] === type);
}

function renderTemplate(content, replacements) {
    let output = content;
    for (const [key, value] of Object.entries(replacements)) {
        output = output.replaceAll("${" + key + "}", String(value));
    }
    return output;
}

const helpCenter = JSON.parse(await readFile(
    path.join(repositoryRoot, "client/public/locales/en/helpCenter.json"),
    "utf8"
));
const visibleFaqItems = [
    helpCenter.faq.account,
    helpCenter.faq.archive,
    helpCenter.faq.engine,
    helpCenter.faq.languages,
    helpCenter.faq.privacy
];

assert(STRUCTURED_DATA_LANGUAGE_CODES.length === 11, "Structured data must declare eleven languages.");
assert(new Set(STRUCTURED_DATA_LANGUAGE_CODES).size === 11, "Structured data language codes must be unique.");
for (const [index, item] of FAQ_STRUCTURED_DATA_ITEMS.entries()) {
    assert(visibleFaqItems[index]?.question === item.question, `FAQ question ${index + 1} mismatch.`);
    assert(visibleFaqItems[index]?.answer === item.answer, `FAQ answer ${index + 1} mismatch.`);
}

for (const route of INDEXABLE_PAGE_ROUTES) {
    const metadata = INDEXABLE_PAGE_METADATA[route.pathname];
    const homeDescription = BASE_PAGE_METADATA["/"].description;
    const structuredData = getStructuredData(route.pathname, metadata, homeDescription);
    const serialized = serializeStructuredData(route.pathname, metadata, homeDescription);
    const replacements = getStructuredDataReplacements(route.pathname, metadata, homeDescription);

    assert(structuredData, `Missing structured data for ${route.pathname}.`);
    if (!structuredData) continue;
    assert(structuredData["@context"] === "https://schema.org", `${route.pathname} context mismatch.`);
    assert(Array.isArray(structuredData["@graph"]) && structuredData["@graph"].length === 5, `${route.pathname} graph must have five nodes.`);

    const graph = structuredData["@graph"];
    const image = findNode(graph, "ImageObject");
    const organization = findNode(graph, "Organization");
    const website = findNode(graph, "WebSite");
    const application = findNode(graph, "SoftwareApplication");
    const page = graph.find(node => String(node["@id"]).endsWith("#webpage"));

    assert(image?.["@id"] === STRUCTURED_DATA_IDS.image, `${route.pathname} image entity mismatch.`);
    assert(image?.url === productionUrl("/img/nexochess.png") && image?.width === 1000 && image?.height === 333, `${route.pathname} image data mismatch.`);
    assert(organization?.["@id"] === STRUCTURED_DATA_IDS.organization && organization?.name === "NexoChess", `${route.pathname} organization mismatch.`);
    assert(organization?.email === "contact@nexochess.com", `${route.pathname} contact mismatch.`);
    assert(!("address" in organization) && !("telephone" in organization), `${route.pathname} invents organization data.`);
    assert(website?.["@id"] === STRUCTURED_DATA_IDS.website && website?.url === productionUrl("/"), `${route.pathname} website mismatch.`);
    assert(Array.isArray(website?.inLanguage) && website.inLanguage.length === 11, `${route.pathname} website language inventory mismatch.`);
    assert(application?.["@id"] === STRUCTURED_DATA_IDS.application && application?.isAccessibleForFree === true, `${route.pathname} application mismatch.`);
    assert(application?.offers?.price === "0" && application?.offers?.priceCurrency === "EUR", `${route.pathname} offer mismatch.`);

    assert(page, `${route.pathname} is missing WebPage data.`);
    if (page) {
        assert(page["@id"] === `${metadata.canonicalUrl}#webpage`, `${route.pathname} WebPage id mismatch.`);
        assert(page.url === metadata.canonicalUrl, `${route.pathname} WebPage URL mismatch.`);
        assert(page.name === metadata.title && page.description === metadata.description, `${route.pathname} page metadata mismatch.`);
        assert(page.inLanguage === route.language, `${route.pathname} must declare ${route.language}.`);

        if (route.basePathname === "/about") {
            assert(page["@type"] === "AboutPage", `${route.pathname} must use AboutPage.`);
        } else if (route.basePathname === "/faq") {
            assert(page["@type"] === "FAQPage" && page.mainEntity?.length === FAQ_STRUCTURED_DATA_ITEMS.length, `${route.pathname} FAQ schema mismatch.`);
        } else {
            assert(page["@type"] === "WebPage", `${route.pathname} must use WebPage.`);
        }
    }

    assert(replacements.STRUCTURED_DATA_JSON === serialized, `${route.pathname} replacement mismatch.`);
    assert(serialized.length > 500 && !serialized.includes("</script") && !serialized.includes("${"), `${route.pathname} unsafe JSON-LD.`);
    try {
        JSON.parse(serialized);
    } catch (error) {
        failures.push(`${route.pathname} invalid JSON-LD: ${error.message}`);
    }

    const html = await readFile(path.join(repositoryRoot, "client/public", route.assetPath), "utf8");
    assert(html.split(jsonLdTemplate).length - 1 === 1, `${route.assetPath} must contain one JSON-LD placeholder.`);
    const rendered = renderTemplate(html, { ...replacements, PAGE_LANGUAGE: route.language });
    assert(rendered.includes(`<script type="application/ld+json">${serialized}</script>`), `${route.pathname} JSON-LD was not rendered.`);
}

if (failures.length) {
    console.error("Structured data verification failed:\n");
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
}

console.log(`Verified Schema.org data for ${INDEXABLE_PAGE_ROUTES.length} localized routes in eleven languages.`);
