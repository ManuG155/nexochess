import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    INDEXABLE_PAGE_METADATA,
    getLocalizedBasePageMetadata
} from "../config/page-metadata.mjs";
import { localizePathname } from "../config/language-routing.mjs";
import { INDEXABLE_PAGE_ROUTES } from "../config/search-indexing.mjs";
import {
    FAQ_STRUCTURED_DATA_ITEMS,
    FAQ_STRUCTURED_DATA_ITEMS_BY_LANGUAGE,
    STRUCTURED_DATA_IDS,
    STRUCTURED_DATA_LANGUAGE_CODES,
    getFaqStructuredDataItems,
    getStructuredData,
    getStructuredDataReplacements,
    serializeStructuredData
} from "../config/structured-data.mjs";
import { productionUrl } from "../config/site.mjs";

const repositoryRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
);
const failures = [];
const jsonLdTemplate =
    '<script type="application/ld+json">${STRUCTURED_DATA_JSON}</script>';
const faqKeys = ["account", "archive", "engine", "languages", "privacy"];
const brandAlternateNames = ["Nexo Chess", "nexochess.com"];
const officialProfiles = [
    "https://github.com/ManuG155/nexochess",
    "https://ko-fi.com/nexochess"
];

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

function hasAll(values, expected) {
    return Array.isArray(values)
        && expected.every(value => values.includes(value));
}

assert(
    STRUCTURED_DATA_LANGUAGE_CODES.length === 11,
    "Structured data must declare eleven languages."
);
assert(
    new Set(STRUCTURED_DATA_LANGUAGE_CODES).size === 11,
    "Structured data language codes must be unique."
);
assert(
    FAQ_STRUCTURED_DATA_ITEMS
        === FAQ_STRUCTURED_DATA_ITEMS_BY_LANGUAGE.en,
    "The compatibility FAQ export must point to the English items."
);

for (const language of STRUCTURED_DATA_LANGUAGE_CODES) {
    const helpCenter = JSON.parse(await readFile(
        path.join(
            repositoryRoot,
            `client/public/locales/${language}/helpCenter.json`
        ),
        "utf8"
    ));
    const visibleFaqItems = faqKeys.map(key => helpCenter.faq[key]);
    const structuredFaqItems = getFaqStructuredDataItems(language);

    assert(
        structuredFaqItems.length === visibleFaqItems.length,
        `${language} FAQ structured-data count mismatch.`
    );

    for (const [index, item] of structuredFaqItems.entries()) {
        assert(
            visibleFaqItems[index]?.question === item.question,
            `${language} FAQ question ${index + 1} mismatch.`
        );
        assert(
            visibleFaqItems[index]?.answer === item.answer,
            `${language} FAQ answer ${index + 1} mismatch.`
        );
    }
}

for (const route of INDEXABLE_PAGE_ROUTES) {
    const metadata = INDEXABLE_PAGE_METADATA[route.pathname];
    const homeDescription = getLocalizedBasePageMetadata(
        route.language,
        "/"
    ).description;
    const structuredData = getStructuredData(
        route.pathname,
        metadata,
        homeDescription
    );
    const serialized = serializeStructuredData(
        route.pathname,
        metadata,
        homeDescription
    );
    const replacements = getStructuredDataReplacements(
        route.pathname,
        metadata,
        homeDescription
    );

    assert(structuredData, `Missing structured data for ${route.pathname}.`);
    if (!structuredData) continue;

    assert(
        structuredData["@context"] === "https://schema.org",
        `${route.pathname} context mismatch.`
    );
    assert(
        Array.isArray(structuredData["@graph"])
            && structuredData["@graph"].length === 5,
        `${route.pathname} graph must have five nodes.`
    );

    const graph = structuredData["@graph"];
    const image = findNode(graph, "ImageObject");
    const organization = findNode(graph, "Organization");
    const website = findNode(graph, "WebSite");
    const application = findNode(graph, "SoftwareApplication");
    const page = graph.find(node => (
        String(node["@id"]).endsWith("#webpage")
    ));

    assert(
        image?.["@id"] === STRUCTURED_DATA_IDS.image,
        `${route.pathname} image entity mismatch.`
    );
    assert(
        image?.url === productionUrl("/img/nexochess.png")
            && image?.width === 1000
            && image?.height === 333,
        `${route.pathname} image data mismatch.`
    );
    assert(
        organization?.["@id"] === STRUCTURED_DATA_IDS.organization
            && organization?.name === "NexoChess",
        `${route.pathname} organization mismatch.`
    );
    assert(
        hasAll(organization?.alternateName, brandAlternateNames),
        `${route.pathname} organization brand aliases mismatch.`
    );
    assert(
        hasAll(organization?.sameAs, officialProfiles),
        `${route.pathname} organization official profiles mismatch.`
    );
    assert(
        organization?.email === "contact@nexochess.com",
        `${route.pathname} contact mismatch.`
    );
    assert(
        !("address" in organization) && !("telephone" in organization),
        `${route.pathname} invents organization data.`
    );
    assert(
        website?.["@id"] === STRUCTURED_DATA_IDS.website
            && website?.url === productionUrl("/")
            && website?.name === "NexoChess",
        `${route.pathname} website mismatch.`
    );
    assert(
        hasAll(website?.alternateName, brandAlternateNames),
        `${route.pathname} website brand aliases mismatch.`
    );
    assert(
        website?.description === homeDescription,
        `${route.pathname} WebSite description is not localized.`
    );
    assert(
        Array.isArray(website?.inLanguage)
            && website.inLanguage.length === 11,
        `${route.pathname} website language inventory mismatch.`
    );
    assert(
        application?.["@id"] === STRUCTURED_DATA_IDS.application
            && application?.name === "NexoChess"
            && application?.isAccessibleForFree === true,
        `${route.pathname} application mismatch.`
    );
    assert(
        hasAll(application?.alternateName, brandAlternateNames)
            && application?.softwareVersion === "1.3",
        `${route.pathname} application brand/version mismatch.`
    );
    assert(
        application?.description === homeDescription,
        `${route.pathname} application description is not localized.`
    );
    assert(
        application?.offers?.price === "0"
            && application?.offers?.priceCurrency === "EUR",
        `${route.pathname} offer mismatch.`
    );
    assert(
        application?.softwareHelp?.["@id"] === productionUrl(
            `${localizePathname("/help", route.language)}#webpage`
        ),
        `${route.pathname} software-help URL is not localized.`
    );

    assert(page, `${route.pathname} is missing WebPage data.`);
    if (page) {
        assert(
            page["@id"] === `${metadata.canonicalUrl}#webpage`,
            `${route.pathname} WebPage id mismatch.`
        );
        assert(
            page.url === metadata.canonicalUrl,
            `${route.pathname} WebPage URL mismatch.`
        );
        assert(
            page.name === metadata.title
                && page.description === metadata.description,
            `${route.pathname} page metadata mismatch.`
        );
        assert(
            page.inLanguage === route.language,
            `${route.pathname} must declare ${route.language}.`
        );

        if (route.basePathname === "/about") {
            assert(
                page["@type"] === "AboutPage",
                `${route.pathname} must use AboutPage.`
            );
        } else if (route.basePathname === "/faq") {
            const expectedItems = getFaqStructuredDataItems(route.language);
            assert(
                page["@type"] === "FAQPage"
                    && page.mainEntity?.length === expectedItems.length,
                `${route.pathname} FAQ schema mismatch.`
            );

            for (const [index, question] of (page.mainEntity || []).entries()) {
                const expected = expectedItems[index];
                assert(
                    question.name === expected.question,
                    `${route.pathname} FAQ question ${index + 1} is not localized.`
                );
                assert(
                    question.acceptedAnswer?.text === expected.answer,
                    `${route.pathname} FAQ answer ${index + 1} is not localized.`
                );
            }
        } else {
            assert(
                page["@type"] === "WebPage",
                `${route.pathname} must use WebPage.`
            );
        }
    }

    assert(
        replacements.STRUCTURED_DATA_JSON === serialized,
        `${route.pathname} replacement mismatch.`
    );
    assert(
        serialized.length > 500
            && !serialized.includes("</script")
            && !serialized.includes("${"),
        `${route.pathname} unsafe JSON-LD.`
    );

    try {
        JSON.parse(serialized);
    } catch (error) {
        failures.push(`${route.pathname} invalid JSON-LD: ${error.message}`);
    }

    const template = await readFile(
        path.join(
            repositoryRoot,
            "client/public",
            route.assetPath
        ),
        "utf8"
    );
    assert(
        template.includes(jsonLdTemplate),
        `${route.assetPath} is missing the JSON-LD placeholder.`
    );
    const rendered = renderTemplate(template, replacements);
    assert(
        rendered.includes(`<script type="application/ld+json">${serialized}</script>`),
        `${route.pathname} JSON-LD was not rendered into HTML.`
    );
}

if (failures.length) {
    console.error("Structured data verification failed:\n");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
} else {
    console.log(
        `Verified Schema.org structured data for ${INDEXABLE_PAGE_ROUTES.length} localized routes.`
    );
}
