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

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const canonicalTemplate = '<link rel="canonical" href="${PAGE_CANONICAL}">';

function repositoryPath(...parts) {
    return join(repositoryRoot, ...parts);
}

async function readRepositoryFile(...parts) {
    return readFile(repositoryPath(...parts), "utf8");
}

function hasRobotsDirective(html, directive) {
    return new RegExp(
        `<meta\\s+name=["']robots["']\\s+content=["'][^"']*${directive}[^"']*["']`,
        "i"
    ).test(html);
}

function extractSitemapLocations(xml) {
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
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
const stagingConfiguration = JSON.parse(await readRepositoryFile("wrangler.jsonc"));
const productionConfigurationGenerator = await readRepositoryFile(
    "scripts",
    "prepare-cloudflare-production.mjs"
);

assert.equal(sourceRobots, renderRobotsTxt());
assert.equal(sourceSitemap, renderSitemapXml());
assert.deepEqual(
    extractSitemapLocations(sourceSitemap),
    INDEXABLE_PAGE_ROUTES.map(route => productionUrl(route.pathname)),
    "The sitemap must contain every and only canonical indexable page."
);
assert.ok(!sourceSitemap.includes("<changefreq>") && !sourceSitemap.includes("<priority>"));

const robotsDisallowPaths = extractRobotsDisallowPaths(sourceRobots);
assert.deepEqual(robotsDisallowPaths, [...TECHNICAL_ROBOTS_DISALLOW_PATHS]);
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

const uniqueAssets = new Set();
for (const route of INDEXABLE_PAGE_ROUTES) {
    if (uniqueAssets.has(route.assetPath)) continue;
    uniqueAssets.add(route.assetPath);

    const html = await readRepositoryFile("client", "public", route.assetPath);
    assert.ok(hasRobotsDirective(html, "index"), `${route.assetPath} must declare index.`);
    assert.equal(
        html.split(canonicalTemplate).length - 1,
        1,
        `${route.assetPath} must contain one central canonical placeholder.`
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
    assert.ok(hasRobotsDirective(html, "noindex"), `${documentPath} must declare noindex.`);
}

for (const fragment of [
    "getSearchIndexingPolicy",
    "X-Robots-Tag",
    "renderRobotsTxt",
    "renderSitemapXml",
    "getPageMetadataReplacements(localizedPathname)",
    "metadataFor(localizedPathname, pathname, languageRoute.language)",
    "env.NEXOCHESS_ENV"
]) {
    assert.ok(worker.includes(fragment), `Worker indexing control is missing: ${fragment}`);
}
assert.ok(!worker.includes("LEGAL_CANONICAL"));

assert.ok(
    buildScript.includes("renderRobotsTxt")
        && buildScript.includes("renderSitemapXml")
        && buildScript.includes('join(outputDirectory, "robots.txt")')
        && buildScript.includes('join(outputDirectory, "sitemap.xml")')
);

for (const pathname of ["/robots.txt", "/sitemap.xml"]) {
    assert.ok(stagingConfiguration.assets?.run_worker_first?.includes(pathname));
    assert.ok(productionConfigurationGenerator.includes(`"${pathname}"`));
}

const productionAnalysis = getSearchIndexingPolicy(productionUrl("/analysis"), {
    environment: PRODUCTION_ENVIRONMENT,
    contentType: "text/html; charset=utf-8"
});
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

const productionArchive = getSearchIndexingPolicy(productionUrl("/archive"), {
    environment: PRODUCTION_ENVIRONMENT,
    contentType: "text/html; charset=utf-8"
});
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

const productionError = getSearchIndexingPolicy(productionUrl("/missing-page"), {
    environment: PRODUCTION_ENVIRONMENT,
    responseStatus: 404,
    contentType: "text/html; charset=utf-8"
});
assert.equal(productionError.indexable, false);
assert.match(productionError.directive, /^noindex, nofollow/);

const productionApi = getSearchIndexingPolicy(productionUrl("/api/archive"), {
    environment: PRODUCTION_ENVIRONMENT,
    contentType: "application/json; charset=utf-8"
});
assert.equal(productionApi.indexable, false);
assert.match(productionApi.directive, /^noindex, nofollow/);

assert.equal(
    renderRobotsTxt({ indexingEnabled: false }),
    "User-agent: *\nDisallow: /\n"
);

console.log(
    `Verified search indexing policy: ${INDEXABLE_PAGE_ROUTES.length} indexable routes, `
    + `${NOINDEX_PAGE_RULES.length} noindex rules and centralized canonicals.`
);
