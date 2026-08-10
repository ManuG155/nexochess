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
const googleConsent = await readFile(
    resolve("client", "src", "lib", "googleConsent.ts"),
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
const privacyAdvertisingRevision = await readFile(
    resolve(
        "client", "src", "apps", "footer", "legal", "pages",
        "PrivacyPolicy", "advertisingPrivacyRevision.ts"
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
    "effectiveConsent()",
    "googlePrivacy.applies === true",
    "https://www.googletagmanager.com/gtag/js?id=",
    'gtag("consent", "default", consentState({',
    'analytics_storage: consent.analytics ? "granted" : "denied"',
    'ad_storage: consent.advertising ? "granted" : "denied"',
    'ad_user_data: consent.advertising ? "granted" : "denied"',
    'ad_personalization: consent.advertising ? "granted" : "denied"',
    "allow_google_signals: false",
    "allow_ad_personalization_signals: false"
]) {
    assert.ok(analytics.includes(fragment), `Analytics safeguard is missing: ${fragment}`);
}

for (const fragment of [
    "CONSENT_API_READY",
    "CONSENT_MODE_DATA_READY",
    "getGoogleConsentModeValues",
    "analyticsStoragePurposeConsentStatus",
    "showRevocationMessage"
]) {
    assert.ok(
        googleConsent.includes(fragment),
        `Google CMP integration is missing: ${fragment}`
    );
}

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
    "if (!isProduction(env)) return environmentMeta",
    "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
]) {
    assert.ok(worker.includes(fragment), `Worker analytics/CMP metadata is missing: ${fragment}`);
}

assert.ok(
    !stagingWrangler.includes("GOOGLE_ANALYTICS_MEASUREMENT_ID"),
    "Staging must not receive a production Analytics measurement ID."
);
for (const fragment of [
    'DEFAULT_ANALYTICS_MEASUREMENT_ID = "G-V4227TJCDB"',
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
assert.ok(
    privacyPage.includes("applyAdvertisingPrivacyRevision"),
    "The Privacy Policy must apply the AdSense/CMP-specific revision."
);
for (const language of ["en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"]) {
    assert.match(
        privacyAnalyticsRevision,
        new RegExp(`\\n\\s{4}${language}: \\{`),
        `Missing GA4 privacy revision for language: ${language}`
    );
    assert.match(
        privacyAdvertisingRevision,
        new RegExp(`\\n\\s{4}${language}: \\{`),
        `Missing AdSense/CMP privacy revision for language: ${language}`
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
for (const fragment of [
    "Google AdSense",
    "Google Consent Mode",
    "providerBullet",
    "rightsParagraph"
]) {
    assert.ok(
        privacyAdvertisingRevision.includes(fragment),
        `AdSense/CMP Privacy Policy disclosure is missing: ${fragment}`
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
assert.ok(!ci.includes("G-NEXOCHESSTEST"));

console.log("Analytics installation verification passed.");
console.log("GA4 remains production-only and basic-consent-gated; Google CMP supplies the effective EEA/UK/CH consent state while the NexoChess CMP remains the fallback elsewhere.");
