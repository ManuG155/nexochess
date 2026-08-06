import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
    INDEXABLE_PAGE_ROUTES,
    NOINDEX_PAGE_RULES,
    TECHNICAL_ROBOTS_DISALLOW_PATHS,
    getSearchIndexingPolicy,
    renderRobotsTxt,
    renderSitemapXml
} from "../config/search-indexing.mjs";
import {
    PRODUCTION_ENVIRONMENT,
    STAGING_ENVIRONMENT,
    productionUrl
} from "../config/site.mjs";

const repositoryRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    ".."
);

function repositoryPath(...parts) {
    return join(repositoryRoot, ...parts);
}

async function readRepositoryFile(...parts) {
    return readFile(repositoryPath(...parts), "utf8");
}

function hasRobotsDirective(html, directive) {
    const expression = new RegExp(
        `<meta\\s+name=["']robots["']\\s+content=["'][^"']*${directive}[^"']*["']`,
        "i"
    );

    return expression.test(html);
}

function hasCanonical(html, canonicalUrl) {
    return html.includes(
        `<link rel="canonical" href="${canonicalUrl}">`
    );
}

function extractSitemapLocations(xml) {
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map(match => match[1]);
}

function extractRobotsDisallowPaths(robots) {
    return robots
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.startsWith("Disallow:"))
        .map(line => line.slice("Disallow:".length).trim());
}

const sourceRobots = await readRepositoryFile("client", "public", "robots.txt");
const sourceSitemap = await readRepositoryFile("client", "public", "sitemap.xml");
const worker = await readRepositoryFile("cloudflare", "worker.mjs");
const buildScript = await readRepositoryFile("scripts", "build-cloudflare.mjs");
const stagingConfiguration = JSON.parse(
    await readRepositoryFile("wrangler.jsonc")
);
const productionConfigurationGenerator = await readRepositoryFile(
    "scripts",
    "prepare-cloudflare-production.mjs"
);

assert.equal(
    sourceRobots,
    renderRobotsTxt(),
    "client/public/robots.txt must be generated from the central policy."
);
assert.equal(
    sourceSitemap,
    renderSitemapXml(),
    "client/public/sitemap.xml must be generated from the central policy."
);

const expectedSitemapLocations = INDEXABLE_PAGE_ROUTES.map(route => (
    productionUrl(route.pathname)
));
const actualSitemapLocations = extractSitemapLocations(sourceSitemap);

assert.deepEqual(
    actualSitemapLocations,
    expectedSitemapLocations,
    "The sitemap must contain every and only canonical indexable page."
);
assert.ok(
    !sourceSitemap.includes("<changefreq>")
        && !sourceSitemap.includes("<priority>"),
    "The sitemap must not contain manually maintained freshness hints."
);

const robotsDisallowPaths = extractRobotsDisallowPaths(sourceRobots);
assert.deepEqual(
    robotsDisallowPaths,
    [...TECHNICAL_ROBOTS_DISALLOW_PATHS],
    "robots.txt must block only the centrally declared technical paths."
);

for (const rule of NOINDEX_PAGE_RULES) {
    assert.ok(
        !robotsDisallowPaths.some(path => (
            rule.pathname === path
            || rule.pathname.startsWith(path)
            || path.startsWith(`${rule.pathname}/`)
        )),
        `${rule.pathname} must remain crawlable so crawlers can read noindex.`
    );
}

const directIndexableHtmlRoutes = INDEXABLE_PAGE_ROUTES.filter(route => (
    route.assetPath !== "apps/footer/legal.html"
));

for (const route of directIndexableHtmlRoutes) {
    const html = await readRepositoryFile("client", "public", route.assetPath);

    assert.ok(
        hasRobotsDirective(html, "index"),
        `${route.assetPath} must declare index, follow.`
    );
    assert.ok(
        hasCanonical(html, productionUrl(route.pathname)),
        `${route.assetPath} must use its production canonical URL.`
    );
}

const legalHtml = await readRepositoryFile(
    "client",
    "public",
    "apps",
    "footer",
    "legal.html"
);
assert.ok(
    hasRobotsDirective(legalHtml, "index"),
    "The legal document shell must be indexable."
);
assert.ok(
    legalHtml.includes("${LEGAL_CANONICAL}"),
    "The legal document shell must receive its canonical from the Worker."
);

for (const pathname of ["/terms", "/privacy", "/source"]) {
    assert.ok(
        worker.includes(`"${pathname}"`)
            && worker.includes(`productionUrl("${pathname}")`),
        `The Worker must inject metadata for ${pathname}.`
    );
}

const noindexDocuments = [
    "apps/features/archive.html",
    "apps/account/signin.html",
    "apps/account/profile.html",
    "apps/account/resetPassword.html",
    "apps/settings.html",
    "apps/internal.html",
    "apps/unfound.html"
];

for (const documentPath of noindexDocuments) {
    const html = await readRepositoryFile("client", "public", documentPath);

    assert.ok(
        hasRobotsDirective(html, "noindex"),
        `${documentPath} must declare noindex.`
    );
}

assert.ok(
    worker.includes("getSearchIndexingPolicy")
        && worker.includes("X-Robots-Tag")
        && worker.includes("renderRobotsTxt")
        && worker.includes("renderSitemapXml")
        && worker.includes("env.NEXOCHESS_ENV"),
    "The Worker must enforce the central policy and serve environment-aware SEO files."
);
assert.ok(
    buildScript.includes("renderRobotsTxt")
        && buildScript.includes("renderSitemapXml")
        && buildScript.includes('join(outputDirectory, "robots.txt")')
        && buildScript.includes('join(outputDirectory, "sitemap.xml")'),
    "The Cloudflare build must regenerate robots.txt and sitemap.xml."
);

const workerFirstSeoPaths = ["/robots.txt", "/sitemap.xml"];
for (const pathname of workerFirstSeoPaths) {
    assert.ok(
        stagingConfiguration.assets?.run_worker_first?.includes(pathname),
        `${pathname} must run through the staging Worker before Static Assets.`
    );
    assert.ok(
        productionConfigurationGenerator.includes(`"${pathname}"`),
        `${pathname} must run through the generated production Worker before Static Assets.`
    );
}

const productionAnalysis = getSearchIndexingPolicy(
    productionUrl("/analysis"),
    {
        environment: PRODUCTION_ENVIRONMENT,
        contentType: "text/html; charset=utf-8"
    }
);
assert.equal(productionAnalysis.indexable, true);
assert.match(productionAnalysis.directive, /^index, follow/);

const sharedAnalysis = getSearchIndexingPolicy(
    `${productionUrl("/analysis")}?game=public-game-id`,
    {
        environment: PRODUCTION_ENVIRONMENT,
        contentType: "text/html; charset=utf-8"
    }
);
assert.equal(sharedAnalysis.indexable, false);
assert.match(sharedAnalysis.directive, /^noindex, follow/);
assert.equal(sharedAnalysis.canonicalUrl, productionUrl("/analysis"));

const productionArchive = getSearchIndexingPolicy(
    productionUrl("/archive"),
    {
        environment: PRODUCTION_ENVIRONMENT,
        contentType: "text/html; charset=utf-8"
    }
);
assert.equal(productionArchive.indexable, false);
assert.match(productionArchive.directive, /^noindex, follow/);

const stagingAnalysis = getSearchIndexingPolicy(
    "https://nexochess-staging.manuel-garcia-villaescusa.workers.dev/analysis",
    {
        environment: STAGING_ENVIRONMENT,
        contentType: "text/html; charset=utf-8"
    }
);
assert.equal(stagingAnalysis.indexable, false);
assert.match(stagingAnalysis.directive, /^noindex, nofollow/);

const productionError = getSearchIndexingPolicy(
    productionUrl("/missing-page"),
    {
        environment: PRODUCTION_ENVIRONMENT,
        responseStatus: 404,
        contentType: "text/html; charset=utf-8"
    }
);
assert.equal(productionError.indexable, false);
assert.match(productionError.directive, /^noindex, nofollow/);

const productionApi = getSearchIndexingPolicy(
    productionUrl("/api/archive"),
    {
        environment: PRODUCTION_ENVIRONMENT,
        contentType: "application/json; charset=utf-8"
    }
);
assert.equal(productionApi.indexable, false);
assert.match(productionApi.directive, /^noindex, nofollow/);

const previewRobots = renderRobotsTxt({ indexingEnabled: false });
assert.equal(
    previewRobots,
    "User-agent: *\nDisallow: /\n",
    "Non-production robots.txt must block all crawling and omit the production sitemap."
);

console.log(
    `Verified search indexing policy: ${INDEXABLE_PAGE_ROUTES.length} indexable routes, ${NOINDEX_PAGE_RULES.length} noindex rules.`
);
