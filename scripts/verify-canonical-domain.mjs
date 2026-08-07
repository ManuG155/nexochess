import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

import { getPageMetadataReplacements } from "../config/page-metadata.mjs";
import {
    PERMANENT_CANONICAL_REDIRECT_STATUS,
    PRODUCTION_APEX_HOST,
    PRODUCTION_CANONICAL_HOST,
    PRODUCTION_CANONICAL_ORIGIN,
    PRODUCTION_ENVIRONMENT,
    PRODUCTION_WORKER_HOST,
    STAGING_ENVIRONMENT,
    STAGING_ORIGIN,
    getProductionCanonicalRedirect,
    normaliseOrigin,
    productionUrl,
    resolveApplicationOrigin
} from "../config/site.mjs";

const ROOT = resolve(".");

function assertThrows(action, fragment) {
    assert.throws(action, error => (
        error instanceof Error && error.message.includes(fragment)
    ));
}

async function listFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) files.push(...await listFiles(path));
        else if (entry.isFile()) files.push(path);
    }

    return files;
}

assert.equal(PRODUCTION_CANONICAL_ORIGIN, "https://www.nexochess.com");
assert.equal(PRODUCTION_CANONICAL_HOST, "www.nexochess.com");
assert.equal(PRODUCTION_APEX_HOST, "nexochess.com");
assert.equal(PERMANENT_CANONICAL_REDIRECT_STATUS, 308);
assert.equal(productionUrl("/analysis"), "https://www.nexochess.com/analysis");
assert.equal(
    productionUrl("/analysis", "?game=abc%201"),
    "https://www.nexochess.com/analysis?game=abc%201"
);
assert.equal(
    productionUrl("/auth/account/callback/google"),
    "https://www.nexochess.com/auth/account/callback/google"
);
assertThrows(
    () => productionUrl("https://example.com/analysis"),
    "external origin"
);

assert.equal(normaliseOrigin("https://www.nexochess.com/"), PRODUCTION_CANONICAL_ORIGIN);
assertThrows(() => normaliseOrigin("http://www.nexochess.com"), "HTTPS");
assertThrows(() => normaliseOrigin("https://www.nexochess.com/path"), "paths");
assertThrows(() => normaliseOrigin("https://user@example.com"), "credentials");

const productionEnv = {
    NEXOCHESS_ENV: PRODUCTION_ENVIRONMENT,
    NEXOCHESS_ORIGIN: PRODUCTION_CANONICAL_ORIGIN
};
const stagingEnv = {
    NEXOCHESS_ENV: STAGING_ENVIRONMENT,
    NEXOCHESS_ORIGIN: STAGING_ORIGIN
};

assert.equal(
    resolveApplicationOrigin("https://nexochess.com/signin", productionEnv),
    PRODUCTION_CANONICAL_ORIGIN
);
assert.equal(
    resolveApplicationOrigin(`${STAGING_ORIGIN}/signin`, stagingEnv),
    STAGING_ORIGIN
);
assertThrows(
    () => resolveApplicationOrigin(
        `https://${PRODUCTION_WORKER_HOST}/signin`,
        {
            NEXOCHESS_ENV: PRODUCTION_ENVIRONMENT,
            NEXOCHESS_ORIGIN: `https://${PRODUCTION_WORKER_HOST}`
        }
    ),
    "must be https://www.nexochess.com"
);

for (const [source, expected] of [
    [
        "https://nexochess.com/analysis?game=shared-123",
        "https://www.nexochess.com/analysis?game=shared-123"
    ],
    [
        "http://www.nexochess.com/privacy?from=footer",
        "https://www.nexochess.com/privacy?from=footer"
    ],
    [
        `https://${PRODUCTION_WORKER_HOST}/auth/account/callback/google?code=test`,
        "https://www.nexochess.com/auth/account/callback/google?code=test"
    ]
]) {
    assert.equal(
        getProductionCanonicalRedirect(source, productionEnv),
        expected
    );
}

assert.equal(
    getProductionCanonicalRedirect(
        "https://www.nexochess.com/analysis?game=shared-123",
        productionEnv
    ),
    null
);
assert.equal(
    getProductionCanonicalRedirect(`${STAGING_ORIGIN}/analysis`, stagingEnv),
    null
);
assert.equal(
    getProductionCanonicalRedirect("https://example.com/analysis", productionEnv),
    null
);

const worker = await readFile(resolve(ROOT, "cloudflare", "worker.mjs"), "utf8");
const auth = await readFile(resolve(ROOT, "cloudflare", "auth.mjs"), "utf8");
const productionGenerator = await readFile(
    resolve(ROOT, "scripts", "prepare-cloudflare-production.mjs"),
    "utf8"
);
const operations = await readFile(
    resolve(ROOT, "scripts", "cloudflare-operations.mjs"),
    "utf8"
);
const environmentExample = await readFile(resolve(ROOT, ".env.example"), "utf8");
const canonicalRunbook = await readFile(
    resolve(ROOT, "docs", "operations", "CANONICAL_DOMAIN.md"),
    "utf8"
);
const stagingConfiguration = JSON.parse(
    await readFile(resolve(ROOT, "wrangler.jsonc"), "utf8")
);
const archivePage = await readFile(
    resolve(
        ROOT,
        "client",
        "src",
        "apps",
        "features",
        "archive",
        "pages",
        "Archive",
        "index.tsx"
    ),
    "utf8"
);
const archiveLibrary = await readFile(
    resolve(ROOT, "client", "src", "lib", "gameArchive.ts"),
    "utf8"
);

for (const fragment of [
    "getProductionCanonicalRedirect",
    "PERMANENT_CANONICAL_REDIRECT_STATUS",
    "getPageMetadataReplacements(localizedPathname)",
    "productionUrl(\"/signin\")"
]) {
    assert.ok(worker.includes(fragment), `Worker canonical control is missing: ${fragment}`);
}
assert.equal(
    getPageMetadataReplacements("/privacy").PAGE_CANONICAL,
    productionUrl("/privacy"),
    "Privacy canonical must be resolved by the centralized page metadata registry."
);
assert.ok(!worker.includes('url.hostname !== "nexochess.com"'));
assert.ok(!worker.includes('canonicalUrl.hostname = "www.nexochess.com"'));

assert.ok(auth.includes("resolveApplicationOrigin(request.url, env)"));
assert.ok(auth.includes("baseURL: `${origin}${AUTH_PATH}`"));
assert.ok(auth.includes("trustedOrigins: [origin]"));
assert.ok(!auth.includes("new URL(request.url).origin"));

assert.ok(productionGenerator.includes("PRODUCTION_CANONICAL_ORIGIN"));
assert.ok(productionGenerator.includes("workers_dev: false"));
assert.ok(productionGenerator.includes("preview_urls: false"));
assert.ok(productionGenerator.includes("Production origin is fixed"));

assert.equal(stagingConfiguration.workers_dev, true);
assert.equal(stagingConfiguration.preview_urls, false);
assert.equal(stagingConfiguration.vars.NEXOCHESS_ENV, STAGING_ENVIRONMENT);
assert.equal(stagingConfiguration.vars.NEXOCHESS_ORIGIN, STAGING_ORIGIN);

for (const fragment of [
    `origin: "${PRODUCTION_CANONICAL_ORIGIN}"`,
    `origin: "${STAGING_ORIGIN}"`
]) {
    assert.ok(
        operations.includes(fragment),
        `Operational environment registry is inconsistent: ${fragment}`
    );
}

for (const fragment of [
    `# ORIGIN=${PRODUCTION_CANONICAL_ORIGIN}`,
    `# ${PRODUCTION_CANONICAL_ORIGIN}/auth/account/callback/google`
]) {
    assert.ok(
        environmentExample.includes(fragment),
        `.env.example is inconsistent: ${fragment}`
    );
}

for (const fragment of [
    "# NexoChess canonical domain",
    PRODUCTION_CANONICAL_ORIGIN,
    "308 Permanent Redirect",
    '"workers_dev": false',
    '"preview_urls": false',
    STAGING_ORIGIN,
    "/auth/account/callback/google",
    "does not alter DNS"
]) {
    assert.ok(
        canonicalRunbook.includes(fragment),
        `Canonical-domain runbook is incomplete: ${fragment}`
    );
}

assert.ok(
    archivePage.includes("location.href = `/analysis?game=${encodeURIComponent(id)}`"),
    "Archive navigation must remain relative to the active environment."
);
assert.ok(
    archiveLibrary.includes('fetch(`/api/public/archived-game?id=${gameId}`)'),
    "Shared-game API requests must remain same-origin."
);

const publicFiles = await listFiles(resolve(ROOT, "client", "public"));
const clientSourceFiles = await listFiles(resolve(ROOT, "client", "src"));
const publicFacingFiles = [...publicFiles, ...clientSourceFiles].filter(path => (
    [".html", ".js", ".jsx", ".ts", ".tsx"].includes(extname(path).toLowerCase())
));
const forbiddenReferences = [];

for (const path of publicFacingFiles) {
    const content = await readFile(path, "utf8");

    for (const forbidden of [
        "http://nexochess.com",
        "http://www.nexochess.com",
        "https://nexochess.com",
        `https://${PRODUCTION_WORKER_HOST}`
    ]) {
        if (content.includes(forbidden)) {
            forbiddenReferences.push(`${relative(ROOT, path)}: ${forbidden}`);
        }
    }
}

assert.deepEqual(
    forbiddenReferences,
    [],
    `Public client files contain non-canonical production URLs:\n${forbiddenReferences.join("\n")}`
);

console.log("Canonical domain verification passed.");
console.log(`Canonical origin: ${PRODUCTION_CANONICAL_ORIGIN}`);
console.log(`Public-facing files checked: ${publicFacingFiles.length}`);
