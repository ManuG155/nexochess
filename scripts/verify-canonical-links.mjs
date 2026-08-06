import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
    BASE_PAGE_METADATA,
    INDEXABLE_PAGE_METADATA,
    getPageMetadataReplacements
} from "../config/page-metadata.mjs";
import { INDEXABLE_PAGE_ROUTES, getSearchIndexingPolicy } from "../config/search-indexing.mjs";
import { SITEMAP_ENTRIES } from "../config/sitemap.mjs";
import { PRODUCTION_CANONICAL_ORIGIN, PRODUCTION_ENVIRONMENT, productionUrl } from "../config/site.mjs";
import { getStructuredData } from "../config/structured-data.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const canonicalTemplateTag = '<link rel="canonical" href="${PAGE_CANONICAL}">';

function repositoryPath(...parts) {
    return join(repositoryRoot, ...parts);
}

function renderTemplate(content, replacements) {
    let rendered = content;
    for (const [key, value] of Object.entries(replacements)) {
        rendered = rendered.replaceAll("${" + key + "}", String(value));
    }
    return rendered;
}

function canonicalFromHtml(html) {
    const matches = [...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']\s*\/?>/gi)];
    assert.equal(matches.length, 1, "Rendered HTML must contain exactly one canonical link.");
    return matches[0][1];
}

const canonicalUrls = new Set();
const routePathnames = INDEXABLE_PAGE_ROUTES.map(route => route.pathname);
const sitemapByPathname = new Map(SITEMAP_ENTRIES.map(entry => [entry.pathname, entry.url]));
assert.deepEqual(Object.keys(INDEXABLE_PAGE_METADATA), routePathnames);
assert.equal(sitemapByPathname.size, INDEXABLE_PAGE_ROUTES.length);

for (const route of INDEXABLE_PAGE_ROUTES) {
    const metadata = INDEXABLE_PAGE_METADATA[route.pathname];
    const replacements = getPageMetadataReplacements(route.pathname);
    const expectedCanonical = productionUrl(route.pathname);
    const canonicalUrl = new URL(expectedCanonical);

    assert.equal(metadata.canonicalUrl, expectedCanonical);
    assert.equal(replacements.PAGE_CANONICAL, expectedCanonical);
    assert.equal(metadata.openGraph.url, expectedCanonical);
    assert.equal(replacements.OPEN_GRAPH_URL, expectedCanonical);
    assert.equal(sitemapByPathname.get(route.pathname), expectedCanonical);
    assert.equal(canonicalUrl.origin, PRODUCTION_CANONICAL_ORIGIN);
    assert.equal(canonicalUrl.protocol, "https:");
    assert.equal(canonicalUrl.search, "");
    assert.equal(canonicalUrl.hash, "");
    assert.equal(canonicalUrl.pathname, route.pathname);
    assert.ok(route.pathname === "/" || !canonicalUrl.pathname.endsWith("/"));
    assert.ok(!canonicalUrls.has(expectedCanonical), `Duplicate canonical ${expectedCanonical}.`);
    canonicalUrls.add(expectedCanonical);

    const template = await readFile(repositoryPath("client", "public", route.assetPath), "utf8");
    assert.equal(template.split(canonicalTemplateTag).length - 1, 1, `${route.assetPath} canonical placeholder mismatch.`);
    assert.equal([...template.matchAll(/rel=["']canonical["']/gi)].length, 1);
    assert.ok(!/<link\s+rel=["']canonical["'][^>]+href=["']https?:\/\//i.test(template));

    const rendered = renderTemplate(template, replacements);
    assert.equal(canonicalFromHtml(rendered), expectedCanonical);
    assert.ok(!rendered.includes("${PAGE_CANONICAL}"));

    const structuredData = getStructuredData(
        route.pathname,
        metadata,
        BASE_PAGE_METADATA["/"].description
    );
    const webpage = structuredData["@graph"].find(node => (
        node.url === expectedCanonical && String(node["@id"]).endsWith("#webpage")
    ));
    assert.ok(webpage, `${route.pathname} structured data canonical mismatch.`);

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
    assert.equal(parameterizedPolicy.canonicalUrl, expectedCanonical);
}

assert.equal(canonicalUrls.size, INDEXABLE_PAGE_ROUTES.length);

const legalTemplate = await readFile(repositoryPath("client", "public", "apps", "footer", "legal.html"), "utf8");
for (const route of INDEXABLE_PAGE_ROUTES.filter(item => ["/terms", "/privacy", "/source"].includes(item.basePathname))) {
    assert.equal(
        canonicalFromHtml(renderTemplate(legalTemplate, getPageMetadataReplacements(route.pathname))),
        productionUrl(route.pathname)
    );
}

const worker = await readFile(repositoryPath("cloudflare", "worker.mjs"), "utf8");
assert.ok(worker.includes("getPageMetadataReplacements(localizedPathname)"));
assert.ok(worker.includes("metadataFor(localizedPathname, pathname, languageRoute.language)"));
assert.ok(!/headers\.set\(["']Link["'][\s\S]{0,200}rel=["']canonical/i.test(worker));

console.log(`Verified ${canonicalUrls.size} canonical URLs across HTML, Open Graph, Schema.org and sitemap.`);
