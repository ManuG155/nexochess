import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
    INDEXABLE_PAGE_ROUTES,
    NOINDEX_PAGE_RULES,
    ROBOTS_TXT_POLICIES,
    TECHNICAL_ROBOTS_DISALLOW_PATHS,
    renderRobotsTxt
} from "../config/search-indexing.mjs";
import {
    PRODUCTION_CANONICAL_ORIGIN,
    productionUrl
} from "../config/site.mjs";

const repositoryRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    ".."
);

function repositoryPath(...parts) {
    return join(repositoryRoot, ...parts);
}

function parseDirectives(content) {
    return content
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"))
        .map(line => {
            const separator = line.indexOf(":");
            assert.notEqual(
                separator,
                -1,
                `Invalid robots.txt line without a colon: ${line}`
            );

            return {
                name: line.slice(0, separator).trim().toLowerCase(),
                value: line.slice(separator + 1).trim()
            };
        });
}

function valuesFor(directives, name) {
    return directives
        .filter(directive => directive.name === name)
        .map(directive => directive.value);
}

function blocksPath(disallowPath, pathname) {
    if (disallowPath === "/") return true;
    if (disallowPath.endsWith("/")) return pathname.startsWith(disallowPath);
    return pathname === disallowPath;
}

const sourceRobotsPath = repositoryPath("client", "public", "robots.txt");
const sourceRobots = await readFile(sourceRobotsPath, "utf8");
const sourceBytes = await readFile(sourceRobotsPath);
const productionRobots = renderRobotsTxt();
const nonProductionRobots = renderRobotsTxt({ indexingEnabled: false });

assert.equal(
    sourceRobots,
    productionRobots,
    "The committed robots.txt must exactly match the central production policy."
);
assert.ok(
    !sourceBytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])),
    "robots.txt must not contain a UTF-8 byte-order mark."
);
assert.ok(
    !sourceRobots.includes("\r"),
    "robots.txt must use LF line endings."
);
assert.ok(
    sourceRobots.endsWith("\n"),
    "robots.txt must end with a newline."
);
assert.ok(
    sourceBytes.length < 500 * 1024,
    "robots.txt must stay below the 500 KiB crawler processing limit."
);

const productionDirectives = parseDirectives(productionRobots);
const nonProductionDirectives = parseDirectives(nonProductionRobots);

assert.deepEqual(
    valuesFor(productionDirectives, "user-agent"),
    [ROBOTS_TXT_POLICIES.production.userAgent],
    "Production robots.txt must contain one wildcard user-agent group."
);
assert.deepEqual(
    valuesFor(productionDirectives, "allow"),
    [...ROBOTS_TXT_POLICIES.production.allowPaths],
    "Production robots.txt must explicitly allow the public site."
);
assert.deepEqual(
    valuesFor(productionDirectives, "disallow"),
    [...TECHNICAL_ROBOTS_DISALLOW_PATHS],
    "Production robots.txt must block only the declared technical paths."
);
assert.deepEqual(
    valuesFor(productionDirectives, "sitemap"),
    [productionUrl("/sitemap.xml")],
    "Production robots.txt must advertise the canonical sitemap exactly once."
);

for (const directive of productionDirectives) {
    assert.ok(
        ["user-agent", "allow", "disallow", "sitemap"].includes(directive.name),
        `Unsupported production robots.txt directive: ${directive.name}`
    );
}

for (const path of TECHNICAL_ROBOTS_DISALLOW_PATHS) {
    assert.ok(path.startsWith("/"), `Disallow path must be absolute: ${path}`);
    assert.ok(!/[?#*$]/.test(path), `Disallow path must stay simple: ${path}`);
}

const productionDisallowPaths = valuesFor(productionDirectives, "disallow");
for (const route of INDEXABLE_PAGE_ROUTES) {
    assert.ok(
        !productionDisallowPaths.some(path => blocksPath(path, route.pathname)),
        `${route.pathname} must remain crawlable in production.`
    );
}

for (const rule of NOINDEX_PAGE_RULES) {
    assert.ok(
        !productionDisallowPaths.some(path => blocksPath(path, rule.pathname)),
        `${rule.pathname} must remain crawlable so its noindex directive can be read.`
    );
}

const sitemapUrl = new URL(valuesFor(productionDirectives, "sitemap")[0]);
assert.equal(
    sitemapUrl.origin,
    PRODUCTION_CANONICAL_ORIGIN,
    "The advertised sitemap must use the canonical production origin."
);
assert.equal(sitemapUrl.protocol, "https:");
assert.equal(sitemapUrl.search, "");
assert.equal(sitemapUrl.hash, "");

assert.deepEqual(
    valuesFor(nonProductionDirectives, "user-agent"),
    [ROBOTS_TXT_POLICIES.nonProduction.userAgent],
    "Non-production robots.txt must contain one wildcard user-agent group."
);
assert.deepEqual(
    valuesFor(nonProductionDirectives, "allow"),
    [],
    "Non-production robots.txt must not contain allow rules."
);
assert.deepEqual(
    valuesFor(nonProductionDirectives, "disallow"),
    ["/"],
    "Non-production robots.txt must block the complete host."
);
assert.deepEqual(
    valuesFor(nonProductionDirectives, "sitemap"),
    [],
    "Non-production robots.txt must not advertise the production sitemap."
);
assert.equal(
    nonProductionRobots,
    "User-agent: *\nDisallow: /\n",
    "Non-production robots.txt must remain minimal and deterministic."
);

const forbiddenDirectives = ["crawl-delay", "host", "noindex"];
for (const directive of forbiddenDirectives) {
    assert.ok(
        !productionDirectives.some(item => item.name === directive)
            && !nonProductionDirectives.some(item => item.name === directive),
        `robots.txt must not use unsupported or unnecessary ${directive} directives.`
    );
}

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
    worker.includes('rawPathname === "/robots.txt"')
        && worker.includes("renderRobotsTxt({ indexingEnabled })")
        && worker.includes('"text/plain; charset=utf-8"'),
    "The Worker must serve environment-aware robots.txt as UTF-8 plain text."
);
assert.ok(
    buildScript.includes("renderRobotsTxt()")
        && buildScript.includes('join(outputDirectory, "robots.txt")'),
    "The Cloudflare build must regenerate the production robots.txt."
);
assert.ok(
    stagingConfiguration.assets?.run_worker_first?.includes("/robots.txt"),
    "Staging must route robots.txt through the Worker before static assets."
);
assert.ok(
    productionConfigurationGenerator.includes('"/robots.txt"'),
    "The generated production configuration must route robots.txt through the Worker."
);

console.log(
    `Verified robots.txt: ${INDEXABLE_PAGE_ROUTES.length} public routes crawlable, `
    + `${TECHNICAL_ROBOTS_DISALLOW_PATHS.length} technical paths blocked, `
    + "non-production hosts fully blocked."
);
