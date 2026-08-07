import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    HREFLANG_LANGUAGE_CODES,
    HREFLANG_X_DEFAULT,
    getHreflangAlternates,
    renderHreflangLinks
} from "../config/hreflang.mjs";
import {
    DEFAULT_LANGUAGE_CODE,
    SUPPORTED_LANGUAGE_CODES,
    localizePathname
} from "../config/language-routing.mjs";
import {
    INDEXABLE_PAGE_METADATA,
    getPageMetadataReplacements
} from "../config/page-metadata.mjs";
import { INDEXABLE_PAGE_ROUTES } from "../config/search-indexing.mjs";
import {
    PRODUCTION_CANONICAL_ORIGIN,
    productionUrl
} from "../config/site.mjs";

const repositoryRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    ".."
);
const placeholder = "${HREFLANG_LINKS}";
const expectedCodes = [...SUPPORTED_LANGUAGE_CODES, HREFLANG_X_DEFAULT];
const signaturesByBasePathname = new Map();
const metadataByCanonical = new Map(
    Object.values(INDEXABLE_PAGE_METADATA).map(metadata => [
        metadata.canonicalUrl,
        metadata
    ])
);

function renderTemplate(template, replacements) {
    let output = template;
    for (const [key, value] of Object.entries(replacements)) {
        output = output.replaceAll("${" + key + "}", String(value));
    }
    return output;
}

function extractAlternateLinks(html) {
    return [...html.matchAll(
        /<link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["']\s*\/?>/gi
    )].map(match => ({ hreflang: match[1], href: match[2] }));
}

assert.deepEqual(
    HREFLANG_LANGUAGE_CODES,
    SUPPORTED_LANGUAGE_CODES,
    "hreflang must use the exact supported-language inventory."
);
assert.equal(DEFAULT_LANGUAGE_CODE, "en");
assert.equal(HREFLANG_X_DEFAULT, "x-default");
assert.equal(new Set(expectedCodes).size, 12);

for (const route of INDEXABLE_PAGE_ROUTES) {
    const metadata = INDEXABLE_PAGE_METADATA[route.pathname];
    const replacements = getPageMetadataReplacements(route.pathname);
    const alternates = getHreflangAlternates(route.pathname);
    const codes = alternates.map(item => item.hreflang);
    const hrefs = alternates.map(item => item.href);

    assert(metadata, `Missing metadata for ${route.pathname}.`);
    assert.equal(alternates.length, 12, `${route.pathname} must expose 12 alternates.`);
    assert.deepEqual(codes, expectedCodes, `${route.pathname} hreflang order mismatch.`);
    assert.equal(new Set(codes).size, 12, `${route.pathname} duplicates a hreflang code.`);
    assert.equal(new Set(hrefs).size, 11, `${route.pathname} must expose 11 language URLs plus an x-default alias.`);

    for (const alternate of alternates) {
        const url = new URL(alternate.href);
        assert.equal(url.origin, PRODUCTION_CANONICAL_ORIGIN);
        assert.equal(url.protocol, "https:");
        assert.equal(url.search, "");
        assert.equal(url.hash, "");
        assert.ok(
            alternate.hreflang === HREFLANG_X_DEFAULT
                || /^[a-z]{2}$/.test(alternate.hreflang),
            `${route.pathname} uses an invalid hreflang code.`
        );
    }

    const self = alternates.find(item => item.hreflang === route.language);
    assert.equal(self?.href, metadata.canonicalUrl, `${route.pathname} lacks a self-reference.`);

    const englishUrl = productionUrl(
        localizePathname(route.basePathname, DEFAULT_LANGUAGE_CODE)
    );
    assert.equal(
        alternates.find(item => item.hreflang === HREFLANG_X_DEFAULT)?.href,
        englishUrl,
        `${route.pathname} x-default must use the stable English URL.`
    );

    for (const alternate of alternates.filter(item => item.hreflang !== HREFLANG_X_DEFAULT)) {
        const targetMetadata = metadataByCanonical.get(alternate.href);
        assert(targetMetadata, `${route.pathname} points to an unknown alternate ${alternate.href}.`);
        assert.equal(
            targetMetadata?.basePathname,
            route.basePathname,
            `${route.pathname} links to a different page family.`
        );
    }

    const signature = JSON.stringify(alternates);
    const previous = signaturesByBasePathname.get(route.basePathname);
    if (previous) {
        assert.equal(
            signature,
            previous,
            `${route.pathname} does not return the reciprocal set used by its siblings.`
        );
    } else {
        signaturesByBasePathname.set(route.basePathname, signature);
    }

    assert.equal(
        replacements.HREFLANG_LINKS,
        renderHreflangLinks(route.pathname),
        `${route.pathname} replacement mismatch.`
    );

    const template = await readFile(
        path.join(repositoryRoot, "client/public", route.assetPath),
        "utf8"
    );
    assert.equal(
        template.split(placeholder).length - 1,
        1,
        `${route.assetPath} must contain exactly one hreflang placeholder.`
    );
    const headStart = template.indexOf("<head>");
    const headEnd = template.indexOf("</head>");
    const placeholderPosition = template.indexOf(placeholder);
    assert.ok(
        placeholderPosition > headStart && placeholderPosition < headEnd,
        `${route.assetPath} hreflang placeholder must be inside head.`
    );
    assert.equal(
        extractAlternateLinks(template).length,
        0,
        `${route.assetPath} must not hard-code alternate links.`
    );

    const rendered = renderTemplate(template, replacements);
    assert.ok(!rendered.includes(placeholder));
    assert.deepEqual(
        extractAlternateLinks(rendered),
        alternates,
        `${route.pathname} rendered alternate set mismatch.`
    );
}

assert.equal(signaturesByBasePathname.size, 10);

const sitemap = await readFile(
    path.join(repositoryRoot, "client/public/sitemap.xml"),
    "utf8"
);
assert.ok(
    !/(?:hreflang|xhtml:link)/i.test(sitemap),
    "hreflang must use one HTML mechanism rather than duplicate sitemap annotations."
);

const worker = await readFile(
    path.join(repositoryRoot, "cloudflare/worker.mjs"),
    "utf8"
);
assert.ok(
    worker.includes("getPageMetadataReplacements(localizedPathname)"),
    "The Worker must render the central hreflang replacement."
);
assert.ok(
    !/headers\.set\(["']Link["'][\s\S]{0,300}hreflang/i.test(worker),
    "The Worker must not duplicate hreflang through HTTP Link headers."
);

console.log(
    "Verified reciprocal HTML hreflang clusters for 110 localized URLs "
    + "across 10 page families, including self-references and x-default."
);
