import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const preparer = await readFile(
    resolve("scripts", "prepare-cloudflare-production.mjs"),
    "utf8"
);
const refresher = await readFile(
    resolve("scripts", "ensure-cloudflare-production-config.mjs"),
    "utf8"
);
const packageJson = JSON.parse(await readFile(resolve("package.json"), "utf8"));

for (const fragment of [
    'pattern: `${PRODUCTION_CANONICAL_HOST}/*`',
    'pattern: `${PRODUCTION_APEX_HOST}/*`',
    "zone_name: PRODUCTION_APEX_HOST",
    '"/*.bundle.js"',
    'DEFAULT_ANALYTICS_MEASUREMENT_ID = "G-V4227TJCDB"'
]) {
    assert.ok(
        preparer.includes(fragment),
        `Production Wrangler generator is missing: ${fragment}`
    );
}

assert.ok(
    !preparer.includes("custom_domain"),
    "Production must preserve the existing proxied DNS records and use Workers Routes, not Custom Domains."
);
assert.ok(
    !preparer.includes("--attach-domains"),
    "The obsolete production Custom Domain switch must not return."
);

for (const fragment of [
    "wrangler.production.local.jsonc",
    "NEXOCHESS_PRODUCTION_D1_ID",
    "d1_databases",
    "prepare-cloudflare-production.mjs"
]) {
    assert.ok(
        refresher.includes(fragment),
        `Production configuration refresher is missing: ${fragment}`
    );
}

for (const script of [
    "deploy:production",
    "backup:d1:production",
    "recovery:production",
    "restore:d1:production",
    "rollback:production",
    "config:production"
]) {
    assert.ok(
        packageJson.scripts?.[script]?.startsWith(
            "npm run ensure:cloudflare:production && "
        ),
        `${script} must refresh the ignored production Wrangler file before operating.`
    );
}

assert.equal(
    packageJson.scripts?.["ensure:cloudflare:production"],
    "node scripts/ensure-cloudflare-production-config.mjs"
);
assert.equal(
    packageJson.scripts?.["verify:production-routing"],
    "node scripts/verify-production-routing.mjs"
);
assert.ok(
    packageJson.scripts?.check?.includes("verify:production-routing"),
    "Production routing verification must run as part of npm run check."
);

console.log(
    "Production routing verification passed: existing DNS is preserved, Workers Routes are canonical, and local Wrangler config auto-refreshes."
);
