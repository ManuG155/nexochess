import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { INDEXABLE_PAGE_METADATA } from "../config/page-metadata.mjs";
import { INDEXABLE_PAGE_ROUTES } from "../config/search-indexing.mjs";
import {
    FAQ_STRUCTURED_DATA_ITEMS,
    STRUCTURED_DATA_IDS,
    STRUCTURED_DATA_LANGUAGE_CODES,
    getStructuredData,
    getStructuredDataReplacements,
    serializeStructuredData
} from "../config/structured-data.mjs";
import {
    PRODUCTION_CANONICAL_ORIGIN,
    productionUrl
} from "../config/site.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const failures = [];
const jsonLdTemplate =
    '<script type="application/ld+json">${STRUCTURED_DATA_JSON}</script>';

function assert(condition, message) {
    if (!condition) failures.push(message);
}

function countOccurrences(content, fragment) {
    return content.split(fragment).length - 1;
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

const helpCenterPath = path.join(
    repositoryRoot,
    "client/public/locales/en/helpCenter.json"
);
const helpCenter = JSON.parse(await readFile(helpCenterPath, "utf8"));
const visibleFaqItems = [
    helpCenter.faq.account,
    helpCenter.faq.archive,
    helpCenter.faq.engine,
    helpCenter.faq.languages,
    helpCenter.faq.privacy
];

assert(
    STRUCTURED_DATA_LANGUAGE_CODES.length === 11,
    "Structured data must declare all eleven supported languages."
);
assert(
    new Set(STRUCTURED_DATA_LANGUAGE_CODES).size
        === STRUCTURED_DATA_LANGUAGE_CODES.length,
    "Structured data language codes must be unique."
);

for (const [index, item] of FAQ_STRUCTURED_DATA_ITEMS.entries()) {
    const visible = visibleFaqItems[index];

    assert(
        visible?.question === item.question,
        `FAQ question ${index + 1} does not match the visible English content.`
    );
    assert(
        visible?.answer === item.answer,
        `FAQ answer ${index + 1} does not match the visible English content.`
    );
}

for (const route of INDEXABLE_PAGE_ROUTES) {
    const { pathname, assetPath } = route;
    const metadata = INDEXABLE_PAGE_METADATA[pathname];
    const homeDescription = INDEXABLE_PAGE_METADATA["/"].description;
    const structuredData = getStructuredData(pathname, metadata, homeDescription);
    const serialized = serializeStructuredData(pathname, metadata, homeDescription);
    const replacements = getStructuredDataReplacements(
        pathname,
        metadata,
        homeDescription
    );

    assert(structuredData, `Missing structured data for ${pathname}.`);
    if (!structuredData) continue;

    assert(
        structuredData["@context"] === "https://schema.org",
        `${pathname} must use the canonical Schema.org context.`
    );
    assert(
        Array.isArray(structuredData["@graph"])
            && structuredData["@graph"].length === 5,
        `${pathname} must expose the complete five-node graph.`
    );

    const graph = structuredData["@graph"];
    const image = findNode(graph, "ImageObject");
    const organization = findNode(graph, "Organization");
    const website = findNode(graph, "WebSite");
    const application = findNode(graph, "SoftwareApplication");
    const page = graph.find(node => String(node["@id"]).endsWith("#webpage"));

    assert(image?.["@id"] === STRUCTURED_DATA_IDS.image,
        `${pathname} is missing the canonical image entity.`);
    assert(
        image?.url === productionUrl("/img/nexochess.png")
            && image?.contentUrl === productionUrl("/img/nexochess.png"),
        `${pathname} uses a non-canonical structured-data image.`
    );
    assert(
        image?.width === 1000 && image?.height === 333,
        `${pathname} image dimensions do not match the official asset.`
    );

    assert(
        organization?.["@id"] === STRUCTURED_DATA_IDS.organization
            && organization?.name === "NexoChess"
            && organization?.url === productionUrl("/"),
        `${pathname} has invalid publisher identity data.`
    );
    assert(
        organization?.email === "contact@nexochess.com",
        `${pathname} must use the public NexoChess contact address.`
    );
    assert(
        !("address" in organization)
            && !("telephone" in organization)
            && !("legalName" in organization),
        `${pathname} must not invent legal, postal or telephone details.`
    );

    assert(
        website?.["@id"] === STRUCTURED_DATA_IDS.website
            && website?.url === productionUrl("/")
            && website?.publisher?.["@id"] === STRUCTURED_DATA_IDS.organization,
        `${pathname} has invalid WebSite data.`
    );
    assert(
        Array.isArray(website?.inLanguage)
            && website.inLanguage.length === 11,
        `${pathname} WebSite data must declare eleven languages.`
    );

    assert(
        application?.["@id"] === STRUCTURED_DATA_IDS.application
            && application?.name === "NexoChess"
            && application?.applicationCategory === "EducationalApplication",
        `${pathname} has invalid SoftwareApplication data.`
    );
    assert(
        application?.offers?.["@type"] === "Offer"
            && application.offers.price === "0"
            && application.offers.priceCurrency === "EUR",
        `${pathname} must describe the currently free web application truthfully.`
    );
    assert(
        application?.isAccessibleForFree === true
            && application?.operatingSystem === "Any",
        `${pathname} has invalid access or operating-system data.`
    );
    assert(
        !("aggregateRating" in application)
            && !("review" in application)
            && !("downloadUrl" in application),
        `${pathname} must not invent ratings, reviews or downloads.`
    );

    assert(page, `${pathname} is missing its WebPage entity.`);
    if (page) {
        assert(
            page["@id"] === `${productionUrl(pathname)}#webpage`,
            `${pathname} has an invalid WebPage identifier.`
        );
        assert(
            page.url === productionUrl(pathname),
            `${pathname} has a non-canonical WebPage URL.`
        );
        assert(
            page.name === metadata.title
                && page.description === metadata.description,
            `${pathname} structured data disagrees with its page metadata.`
        );
        assert(
            page.isPartOf?.["@id"] === STRUCTURED_DATA_IDS.website
                && page.about?.["@id"] === STRUCTURED_DATA_IDS.application
                && page.publisher?.["@id"] === STRUCTURED_DATA_IDS.organization,
            `${pathname} has broken graph references.`
        );
        assert(
            page.inLanguage === "en",
            `${pathname} must remain English until localized URLs are introduced.`
        );
    }

    if (pathname === "/about") {
        assert(
            page?.["@type"] === "AboutPage"
                && page?.mainEntity?.["@id"] === STRUCTURED_DATA_IDS.organization,
            "The About page must identify NexoChess as its main entity."
        );
    } else if (pathname === "/faq") {
        assert(
            page?.["@type"] === "FAQPage"
                && Array.isArray(page?.mainEntity)
                && page.mainEntity.length === FAQ_STRUCTURED_DATA_ITEMS.length,
            "The FAQ page must expose its five visible questions."
        );

        for (const [index, question] of (page?.mainEntity || []).entries()) {
            const expected = FAQ_STRUCTURED_DATA_ITEMS[index];

            assert(
                question["@type"] === "Question"
                    && question.name === expected.question,
                `FAQ structured question ${index + 1} is invalid.`
            );
            assert(
                question.acceptedAnswer?.["@type"] === "Answer"
                    && question.acceptedAnswer.text === expected.answer,
                `FAQ structured answer ${index + 1} is invalid.`
            );
        }
    } else {
        assert(
            page?.["@type"] === "WebPage",
            `${pathname} must use the WebPage schema type.`
        );
    }

    assert(
        replacements.STRUCTURED_DATA_JSON === serialized,
        `${pathname} returns an inconsistent structured-data replacement.`
    );
    assert(
        serialized.length > 500
            && !serialized.includes("</script")
            && !serialized.includes("${"),
        `${pathname} serialized JSON-LD is unsafe or incomplete.`
    );

    let parsed;

    try {
        parsed = JSON.parse(serialized);
    } catch (error) {
        failures.push(`${pathname} serialized JSON-LD is invalid: ${error.message}`);
    }

    assert(
        parsed?.["@context"] === "https://schema.org",
        `${pathname} serialized JSON-LD cannot be parsed back correctly.`
    );

    const assetFullPath = path.join(
        repositoryRoot,
        "client/public",
        assetPath
    );
    const html = await readFile(assetFullPath, "utf8");

    assert(
        countOccurrences(html, jsonLdTemplate) === 1,
        `${assetPath} must contain exactly one JSON-LD placeholder script.`
    );

    const rendered = renderTemplate(html, replacements);

    assert(
        !rendered.includes("${STRUCTURED_DATA_JSON}"),
        `${pathname} leaves the JSON-LD placeholder unresolved.`
    );
    assert(
        rendered.includes(
            `<script type="application/ld+json">${serialized}</script>`
        ),
        `${pathname} does not render its JSON-LD graph into the page head.`
    );

    const url = new URL(page.url);
    assert(
        url.origin === PRODUCTION_CANONICAL_ORIGIN,
        `${pathname} structured data targets a non-production origin.`
    );
}

assert(
    getStructuredData("/archive", null, null) === null
        && serializeStructuredData("/archive", null, null) === ""
        && Object.keys(
            getStructuredDataReplacements("/archive", null, null)
        ).length === 0,
    "Non-indexable routes must not receive public structured data."
);

if (failures.length > 0) {
    console.error("Structured data verification failed:\n");

    for (const failure of failures) {
        console.error(`- ${failure}`);
    }

    process.exit(1);
}

console.log(
    `Verified truthful Schema.org JSON-LD for ${INDEXABLE_PAGE_ROUTES.length} `
    + "indexable NexoChess routes, including five visible FAQ questions."
);
