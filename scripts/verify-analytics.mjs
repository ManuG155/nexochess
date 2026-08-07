import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const analytics = await readFile(
    resolve("client", "src", "lib", "analytics.ts"),
    "utf8"
);
const consent = await readFile(
    resolve("client", "src", "lib", "consent.ts"),
    "utf8"
);
const pageWrapper = await readFile(
    resolve("client", "src", "components", "layout", "PageWrapper", "index.tsx"),
    "utf8"
);
const privacyPage = await readFile(
    resolve(
        "client", "src", "apps", "footer", "legal", "pages",
        "PrivacyPolicy", "index.tsx"
    ),
    "utf8"
);
const privacyAnalyticsRevision = await readFile(
    resolve(
        "client", "src", "apps", "footer", "legal", "pages",
        "PrivacyPolicy", "analyticsPrivacyRevision.ts"
    ),
    "utf8"
);
const worker = await readFile(resolve("cloudflare", "worker.mjs"), "utf8");
const stagingWrangler = await readFile(resolve("wrangler.jsonc"), "utf8");
const productionPreparer = await readFile(
    resolve("scripts", "prepare-cloudflare-production.mjs"),
    "utf8"
);
const ci = await readFile(resolve(".github", "workflows", "ci.yml"), "utf8");
const packageJson = JSON.parse(await readFile(resolve("package.json"), "utf8"));

for (const fragment of [
    'const PRODUCTION_ENVIRONMENT = "production"',
    "environment !== PRODUCTION_ENVIRONMENT",
    "preferences?.analytics === true",
    "https://www.googletagmanager.com/gtag/js?id=",
    'gtag("consent", "default", consentState(false))',
    'gtag("consent", "update", consentState(true))',
    'analytics_storage: analytics ? "granted" : "denied"',
    'ad_storage: "denied"',
    'ad_user_data: "denied"',
    'ad_personalization: "denied"',
    "allow_google_signals: false",
    "allow_ad_personalization_signals: false"
]) {
    assert.ok(analytics.includes(fragment), `Analytics safeguard is missing: ${fragment}`);
}

assert.ok(
    !analytics.includes('gtag("event"'),
    "Step 32 must not configure product events; those belong to Step 33."
);
assert.ok(
    consent.includes("export function onConsentChanged"),
    "Consent changes must be observable by the analytics layer."
);
assert.ok(
    pageWrapper.includes("initialiseAnalytics")
        && pageWrapper.includes("useEffect(() => initialiseAnalytics(), [])"),
    "Analytics must initialise once from the global page shell."
);

for (const fragment of [
    "GOOGLE_ANALYTICS_MEASUREMENT_ID",
    'meta name="nexochess-environment"',
    'meta name="nexochess-analytics-measurement-id"',
    "if (!isProduction(env)) return environmentMeta"
]) {
    assert.ok(worker.includes(fragment), `Worker analytics runtime metadata is missing: ${fragment}`);
}

assert.ok(
    !stagingWrangler.includes("GOOGLE_ANALYTICS_MEASUREMENT_ID"),
    "Staging must not receive a production Analytics measurement ID."
);
for (const fragment of [
    "NEXOCHESS_GA_MEASUREMENT_ID",
    "--analytics-measurement-id",
    "ANALYTICS_MEASUREMENT_ID_PATTERN",
    "GOOGLE_ANALYTICS_MEASUREMENT_ID: analyticsMeasurementId"
]) {
    assert.ok(
        productionPreparer.includes(fragment),
        `Production analytics configuration is missing: ${fragment}`
    );
}

assert.ok(
    privacyPage.includes("applyAnalyticsPrivacyRevision"),
    "The Privacy Policy must apply the GA4-specific revision."
);
for (const language of ["en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"]) {
    assert.match(
        privacyAnalyticsRevision,
        new RegExp(`\\n\\s{4}${language}: \\{`),
        `Missing GA4 privacy revision for language: ${language}`
    );
}
for (const fragment of [
    "Google Analytics 4",
    "_ga",
    "_ga_<container-id>",
    "providerBullet",
    "retentionParagraph",
    "dataBullet",
    "purposeBullet"
]) {
    assert.ok(
        privacyAnalyticsRevision.includes(fragment),
        `GA4 Privacy Policy disclosure is missing: ${fragment}`
    );
}

assert.equal(
    packageJson.scripts?.["verify:analytics"],
    "node scripts/verify-analytics.mjs",
    "Missing verify:analytics package script."
);
assert.ok(
    packageJson.scripts.check.includes("verify:analytics"),
    "Analytics verification must run as part of npm run check."
);
assert.ok(ci.includes("Verify privacy-first analytics installation"));
assert.ok(ci.includes("npm run verify:analytics"));
assert.ok(ci.includes("--analytics-measurement-id G-NEXOCHESSTEST"));

console.log("Analytics installation verification passed.");
console.log("GA4 is production-only, consent-gated, advertising-disabled and disclosed in 11 languages for Step 32.");
