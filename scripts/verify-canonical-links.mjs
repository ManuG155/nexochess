import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
    INDEXABLE_PAGE_METADATA,
    getPageMetadataReplacements
} from "../config/page-metadata.mjs";
import {
    INDEXABLE_PAGE_ROUTES,
    getSearchIndexingPolicy
} from "../config/search-indexing.mjs";
import { SITEMAP_ENTRIES } from "../config/sitemap.mjs";
import {
    PRODUCTION_CANONICAL_ORIGIN,
    PRODUCTION_ENVIRONMENT,
    productionUrl
} from "../config/site.mjs";
import { getStructuredData } from "../config/structured-data.mjs";

const repositoryRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    ".."
);
const canonicalTemplateTag =
    '<link rel="canonical" href="${PAGE_CANONICAL}">';

function repositoryPath(...parts) {
    return join(repositoryRoot, ...parts);
}

function countMatches(content, pattern) {
    return [...content.matchAll(pattern)].length;
}

function renderTemplate(content, replacements) {
    let rendered = content;

    for (const [key, value] of Object.entries(replacements)) {
        rendered = rendered.replaceAll("${" + key + "}", String(value));
    }

    return rendered;
}

function canonicalFromHtml(html) {
    const matches = [...html.matchAll(
        /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']\s*\/?>/gi
    )];

    assert.equal(
        matches.length,
        1,
        "Rendered HTML must contain exactly one canonical link element."
    );

    return matches[0][1];
}

const canonicalUrls = new Set();
const routePathnames = INDEXABLE_PAGE_ROUTES.map(route => route.pathname);
const sitemapByPathname = new Map(
    SITEMAP_ENTRIES.map(entry => [entry.pathname, entry.url])
);
const homeDescription = INDEXABLE_PAGE_METADATA["/"].description;

assert.deepEqual(
    Object.keys(INDEXABLE_PAGE_METADATA),
    routePathnames,
    "Canonical metadata must cover the indexable routes in their stable order."
);
assert.equal(
    sitemapByPathname.size,
    INDEXABLE_PAGE_ROUTES.length,
    "The sitemap and canonical route registries must contain the same number of pages."
);

for (const route of INDEXABLE_PAGE_ROUTES) {
    const metadata = INDEXABLE_PAGE_METADATA[route.pathname];
    const replacements = getPageMetadataReplacements(route.pathname);
    const expectedCanonical = productionUrl(route.pathname);
    const canonicalUrl = new URL(expectedCanonical);

    assert.equal(
        metadata.canonicalUrl,
        expectedCanonical,
        `${route.pathname} metadata has an incorrect canonical URL.`
    );
    assert.equal(
        replacements.PAGE_CANONICAL,
        expectedCanonical,
        `${route.pathname} does not expose its canonical replacement.`
    );
    assert.equal(
        metadata.openGraph.url,
        expectedCanonical,
        `${route.pathname} Open Graph URL must match its canonical URL.`
    );
    assert.equal(
        replacements.OPEN_GRAPH_URL,
        expectedCanonical,
        `${route.pathname} rendered Open Graph URL must match its canonical URL.`
    );
    assert.equal(
        sitemapByPathname.get(route.pathname),
        expectedCanonical,
        `${route.pathname} sitemap URL must match its canonical URL.`
    );

    assert.equal(canonicalUrl.origin, PRODUCTION_CANONICAL_ORIGIN);
    assert.equal(canonicalUrl.protocol, "https:");
    assert.equal(canonicalUrl.username, "");
    assert.equal(canonicalUrl.password, "");
    assert.equal(canonicalUrl.search, "");
    assert.equal(canonicalUrl.hash, "");
    assert.equal(canonicalUrl.pathname, route.pathname);
    assert.ok(
        route.pathname === "/" || !canonicalUrl.pathname.endsWith("/"),
        `${route.pathname} canonical URL must not have a trailing slash.`
    );
    assert.ok(
        !canonicalUrls.has(expectedCanonical),
        `${route.pathname} duplicates another canonical URL.`
    );
    canonicalUrls.add(expectedCanonical);

    const templatePath = repositoryPath("client", "public", route.assetPath);
    const template = await readFile(templatePath, "utf8");
    const headStart = template.indexOf("<head>");
    const headEnd = template.indexOf("</head>");
    const canonicalPosition = template.indexOf(canonicalTemplateTag);

    assert.notEqual(headStart, -1, `${route.assetPath} is missing <head>.`);
    assert.notEqual(headEnd, -1, `${route.assetPath} is missing </head>.`);
    assert.ok(
        canonicalPosition > headStart && canonicalPosition < headEnd,
        `${route.assetPath} canonical element must be inside <head>.`
    );
    assert.equal(
        template.split(canonicalTemplateTag).length - 1,
        1,
        `${route.assetPath} must contain exactly one central canonical placeholder.`
    );
    assert.equal(
        countMatches(template, /rel=["']canonical["']/gi),
        1,
        `${route.assetPath} must declare exactly one canonical relation.`
    );
    assert.ok(
        !/<link\s+rel=["']canonical["'][^>]+href=["']https?:\/\//i.test(template),
        `${route.assetPath} must not hard-code a canonical URL outside the central registry.`
    );

    const rendered = renderTemplate(template, replacements);
    assert.ok(
        !rendered.includes("${PAGE_CANONICAL}"),
        `${route.pathname} leaves the canonical placeholder unresolved.`
    );
    assert.equal(
        canonicalFromHtml(rendered),
        expectedCanonical,
        `${route.pathname} renders an incorrect canonical element.`
    );

    const structuredData = getStructuredData(
        route.pathname,
        metadata,
        homeDescription
    );
    const webpage = structuredData["@graph"].find(node => (
        node.url === expectedCanonical
        && String(node["@id"]).endsWith("#webpage")
    ));
    assert.ok(
        webpage,
        `${route.pathname} structured data must identify the same canonical webpage.`
    );

    const parameterizedPolicy = getSearchIndexingPolicy(
        `${expectedCanonical}?utm_source=canonical-audit`,
        {
            environment: PRODUCTION_ENVIRONMENT,
            responseStatus: 200,
            contentType: "text/html; charset=utf-8"
        }
    );
    assert.equal(parameterizedPolicy.indexable, false);
    assert.match(parameterizedPolicy.directive, /^noindex, follow/);
    assert.equal(
        parameterizedPolicy.canonicalUrl,
        expectedCanonical,
        `${route.pathname} parameterized states must consolidate into the clean URL.`
    );

    if (route.pathname !== "/") {
        const trailingSlashPolicy = getSearchIndexingPolicy(
            `${expectedCanonical}/`,
            {
                environment: PRODUCTION_ENVIRONMENT,
                responseStatus: 200,
                contentType: "text/html; charset=utf-8"
            }
        );
        assert.equal(
            trailingSlashPolicy.canonicalUrl,
            expectedCanonical,
            `${route.pathname}/ must consolidate into the non-trailing-slash URL.`
        );
    }
}

assert.equal(
    canonicalUrls.size,
    INDEXABLE_PAGE_ROUTES.length,
    "Every indexable route must have one unique canonical URL."
);

const legalTemplate = await readFile(
    repositoryPath("client", "public", "apps", "footer", "legal.html"),
    "utf8"
);
assert.ok(
    !legalTemplate.includes("${LEGAL_CANONICAL}"),
    "The shared legal template must use the central PAGE_CANONICAL replacement."
);
for (const pathname of ["/terms", "/privacy", "/source"]) {
    assert.equal(
        canonicalFromHtml(renderTemplate(
            legalTemplate,
            getPageMetadataReplacements(pathname)
        )),
        productionUrl(pathname),
        `The shared legal template renders an incorrect canonical for ${pathname}.`
    );
}

const worker = await readFile(
    repositoryPath("cloudflare", "worker.mjs"),
    "utf8"
);
assert.ok(
    worker.includes("getPageMetadataReplacements(pathname)")
        && worker.includes("metadataFor(pathname)"),
    "The Worker must render canonical replacements from the central page metadata registry."
);
assert.ok(
    !/headers\.set\(["']Link["'][\s\S]{0,200}rel=["']canonical/i.test(worker),
    "HTML pages must use one canonical mechanism instead of a duplicate HTTP Link header."
);

console.log(
    `Verified ${canonicalUrls.size} unique canonical URLs across HTML, `
    + "Open Graph, Schema.org, sitemap and parameterized route policies."
);
