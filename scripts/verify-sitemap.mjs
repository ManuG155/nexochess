import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
    INDEXABLE_PAGE_ROUTES,
    NOINDEX_PAGE_RULES,
    ROBOTS_TXT_POLICIES,
    TECHNICAL_ROBOTS_DISALLOW_PATHS,
    getSearchIndexingPolicy,
    renderRobotsTxt
} from "../config/search-indexing.mjs";
import {
    SITEMAP_ENTRIES,
    SITEMAP_FILENAME,
    SITEMAP_MEDIA_TYPE,
    SITEMAP_NAMESPACE,
    SITEMAP_PATHNAME,
    SITEMAP_POLICY,
    SITEMAP_PROTOCOL_LIMITS,
    renderSitemapXml
} from "../config/sitemap.mjs";
import {
    PRODUCTION_CANONICAL_HOST,
    PRODUCTION_CANONICAL_ORIGIN,
    PRODUCTION_ENVIRONMENT,
    productionUrl
} from "../config/site.mjs";

const repositoryRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    ".."
);

function repositoryPath(...parts) {
    return join(repositoryRoot, ...parts);
}

function countOccurrences(content, fragment) {
    return content.split(fragment).length - 1;
}

function decodeXml(value) {
    return value
        .replaceAll("&apos;", "'")
        .replaceAll("&quot;", "\"")
        .replaceAll("&gt;", ">")
        .replaceAll("&lt;", "<")
        .replaceAll("&amp;", "&");
}

function extractUrlBlocks(xml) {
    return [...xml.matchAll(/<url>\s*([\s\S]*?)\s*<\/url>/g)]
        .map(match => match[1]);
}

function extractLocations(xml) {
    return extractUrlBlocks(xml).map((block, index) => {
        const matches = [...block.matchAll(/<loc>([\s\S]*?)<\/loc>/g)];

        assert.equal(
            matches.length,
            1,
            `Sitemap URL entry ${index + 1} must contain exactly one loc element.`
        );

        const residualMarkup = block
            .replace(/<loc>[\s\S]*?<\/loc>/g, "")
            .trim();

        assert.equal(
            residualMarkup,
            "",
            `Sitemap URL entry ${index + 1} contains unsupported elements.`
        );

        return decodeXml(matches[0][1].trim());
    });
}

function isBlockedByTechnicalPath(pathname) {
    return TECHNICAL_ROBOTS_DISALLOW_PATHS.some(path => (
        path.endsWith("/")
            ? pathname.startsWith(path)
            : pathname === path
    ));
}

const sourcePath = repositoryPath("client", "public", SITEMAP_FILENAME);
const sourceBytes = await readFile(sourcePath);
const sourceXml = sourceBytes.toString("utf8");
const generatedXml = renderSitemapXml();

assert.equal(
    sourceXml,
    generatedXml,
    "The committed sitemap.xml must exactly match the central generator."
);
assert.ok(
    !sourceBytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])),
    "sitemap.xml must not contain a UTF-8 byte-order mark."
);
assert.ok(
    !sourceXml.includes("\r"),
    "sitemap.xml must use LF line endings."
);
assert.ok(
    sourceXml.endsWith("\n"),
    "sitemap.xml must end with a newline."
);
assert.ok(
    sourceBytes.length <= SITEMAP_PROTOCOL_LIMITS.maxUncompressedBytes,
    "sitemap.xml exceeds the uncompressed sitemap protocol size limit."
);
assert.equal(
    sourceXml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n'),
    true,
    "sitemap.xml must begin with the UTF-8 XML declaration."
);
assert.equal(
    countOccurrences(
        sourceXml,
        `<urlset xmlns="${SITEMAP_NAMESPACE}">`
    ),
    1,
    "sitemap.xml must contain one standard sitemap urlset root."
);
assert.equal(
    countOccurrences(sourceXml, "</urlset>"),
    1,
    "sitemap.xml must contain one closing urlset element."
);
assert.ok(
    !/<!DOCTYPE|<!ENTITY|<script|<html/i.test(sourceXml),
    "sitemap.xml must not contain a doctype, entities, scripts or HTML markup."
);

const forbiddenElements = [
    "lastmod",
    "changefreq",
    "priority",
    "image:image",
    "video:video",
    "news:news",
    "xhtml:link"
];

for (const element of forbiddenElements) {
    assert.equal(
        sourceXml.includes(`<${element}`),
        false,
        `${element} must not be emitted before trustworthy data or hreflang exists.`
    );
}

const urlBlocks = extractUrlBlocks(sourceXml);
const actualLocations = extractLocations(sourceXml);
const expectedLocations = SITEMAP_ENTRIES.map(entry => entry.url);

assert.ok(
    urlBlocks.length > 0,
    "sitemap.xml must contain at least one public URL."
);
assert.ok(
    urlBlocks.length <= SITEMAP_PROTOCOL_LIMITS.maxUrls,
    "sitemap.xml exceeds the sitemap protocol URL limit."
);
assert.equal(
    countOccurrences(sourceXml, "<url>"),
    urlBlocks.length,
    "Every sitemap url element must be structurally valid."
);
assert.deepEqual(
    actualLocations,
    expectedLocations,
    "sitemap.xml must contain every and only canonical indexable route in stable order."
);
assert.equal(
    new Set(actualLocations).size,
    actualLocations.length,
    "sitemap.xml must not contain duplicate URLs."
);
assert.equal(
    SITEMAP_ENTRIES.length,
    INDEXABLE_PAGE_ROUTES.length,
    "Every indexable route must have one sitemap entry."
);
assert.deepEqual(
    SITEMAP_ENTRIES.map(entry => entry.pathname),
    INDEXABLE_PAGE_ROUTES.map(route => route.pathname),
    "Sitemap entry paths must stay aligned with the central indexable route list."
);

for (const entry of SITEMAP_ENTRIES) {
    const url = new URL(entry.url);

    assert.equal(url.protocol, "https:", `${entry.url} must use HTTPS.`);
    assert.equal(
        url.origin,
        PRODUCTION_CANONICAL_ORIGIN,
        `${entry.url} must use the canonical production origin.`
    );
    assert.equal(
        url.hostname,
        PRODUCTION_CANONICAL_HOST,
        `${entry.url} must use the canonical production hostname.`
    );
    assert.equal(url.username, "", `${entry.url} must not contain credentials.`);
    assert.equal(url.password, "", `${entry.url} must not contain credentials.`);
    assert.equal(url.port, "", `${entry.url} must not contain a custom port.`);
    assert.equal(url.search, "", `${entry.url} must not contain query parameters.`);
    assert.equal(url.hash, "", `${entry.url} must not contain a fragment.`);
    assert.equal(
        url.pathname,
        entry.pathname,
        `${entry.url} must preserve its canonical pathname.`
    );
    assert.ok(
        entry.pathname === "/" || !entry.pathname.endsWith("/"),
        `${entry.url} must not use a duplicate trailing-slash variant.`
    );
    assert.equal(
        isBlockedByTechnicalPath(entry.pathname),
        false,
        `${entry.pathname} is a technical path and cannot appear in the sitemap.`
    );

    const noindexRule = NOINDEX_PAGE_RULES.find(rule => (
        entry.pathname === rule.pathname
        || entry.pathname.startsWith(`${rule.pathname}/`)
    ));
    assert.equal(
        noindexRule,
        undefined,
        `${entry.pathname} has a noindex rule and cannot appear in the sitemap.`
    );

    const policy = getSearchIndexingPolicy(entry.url, {
        environment: PRODUCTION_ENVIRONMENT,
        responseStatus: 200,
        contentType: "text/html; charset=utf-8"
    });

    assert.equal(
        policy.indexable,
        true,
        `${entry.url} is not considered indexable by the central policy.`
    );
    assert.equal(
        policy.canonicalUrl,
        entry.url,
        `${entry.url} does not match its central canonical URL.`
    );

    const route = INDEXABLE_PAGE_ROUTES.find(candidate => (
        candidate.pathname === entry.pathname
    ));
    assert.ok(route, `Missing route definition for ${entry.pathname}.`);
    await access(repositoryPath("client", "public", route.assetPath));
}

assert.equal(SITEMAP_POLICY.origin, PRODUCTION_CANONICAL_ORIGIN);
assert.equal(SITEMAP_POLICY.pathname, SITEMAP_PATHNAME);
assert.equal(SITEMAP_POLICY.filename, SITEMAP_FILENAME);
assert.equal(SITEMAP_POLICY.mediaType, SITEMAP_MEDIA_TYPE);
assert.equal(SITEMAP_POLICY.namespace, SITEMAP_NAMESPACE);
assert.equal(SITEMAP_POLICY.includeLastModified, false);
assert.equal(SITEMAP_POLICY.includeChangeFrequency, false);
assert.equal(SITEMAP_POLICY.includePriority, false);
assert.equal(SITEMAP_PATHNAME, "/sitemap.xml");
assert.equal(SITEMAP_FILENAME, "sitemap.xml");
assert.equal(SITEMAP_MEDIA_TYPE, "application/xml; charset=utf-8");
assert.equal(
    productionUrl(SITEMAP_PATHNAME),
    `${PRODUCTION_CANONICAL_ORIGIN}${SITEMAP_PATHNAME}`
);

assert.equal(
    ROBOTS_TXT_POLICIES.production.sitemapUrl,
    productionUrl(SITEMAP_PATHNAME),
    "Production robots.txt must advertise the canonical sitemap URL."
);
assert.equal(
    ROBOTS_TXT_POLICIES.nonProduction.sitemapUrl,
    null,
    "Non-production robots.txt must not advertise a production sitemap."
);
assert.equal(
    countOccurrences(
        renderRobotsTxt(),
        `Sitemap: ${productionUrl(SITEMAP_PATHNAME)}`
    ),
    1,
    "Production robots.txt must advertise the sitemap exactly once."
);
assert.equal(
    renderRobotsTxt({ indexingEnabled: false }).includes("Sitemap:"),
    false,
    "Non-production robots.txt must not advertise any sitemap."
);

const worker = await readFile(
    repositoryPath("cloudflare", "worker.mjs"),
    "utf8"
);
const buildScript = await readFile(
    repositoryPath("scripts", "build-cloudflare.mjs"),
    "utf8"
);
const stagingConfiguration = JSON.parse(
    await readFile(repositoryPath("wrangler.jsonc"), "utf8")
);
const productionConfigurationGenerator = await readFile(
    repositoryPath("scripts", "prepare-cloudflare-production.mjs"),
    "utf8"
);

assert.ok(
    worker.includes('rawPathname === "/sitemap.xml"')
        && worker.includes("renderSitemapXml()")
        && worker.includes('"application/xml; charset=utf-8"')
        && worker.includes("return indexingEnabled")
        && worker.includes('"Not Found\\n"')
        && worker.includes(", 404"),
    "The Worker must serve the production sitemap and return 404 outside production."
);
assert.ok(
    buildScript.includes("renderSitemapXml()")
        && buildScript.includes('join(outputDirectory, "sitemap.xml")')
        && buildScript.includes('searchIndexingFiles: ["robots.txt", "sitemap.xml"]'),
    "The Cloudflare build must regenerate and record sitemap.xml."
);
assert.ok(
    stagingConfiguration.assets?.run_worker_first?.includes(SITEMAP_PATHNAME),
    "Staging must route sitemap.xml through the Worker before static assets."
);
assert.ok(
    productionConfigurationGenerator.includes(`"${SITEMAP_PATHNAME}"`),
    "Production configuration must route sitemap.xml through the Worker."
);

assert.equal(
    /localhost|127\.0\.0\.1|workers\.dev|staging/i.test(sourceXml),
    false,
    "sitemap.xml must not expose local, staging or preview origins."
);

console.log(
    `Verified sitemap.xml: ${actualLocations.length} unique canonical HTTPS URLs, `
    + `${sourceBytes.length} bytes, production-only delivery.`
);
