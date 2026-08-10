import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(".");
const clientSource = join(root, "client", "src");
const expectedLanguages = [
    "en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"
];

async function collectSourceFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const path = join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...await collectSourceFiles(path));
        } else if ([".ts", ".tsx"].includes(extname(entry.name))) {
            files.push(path);
        }
    }

    return files;
}

function assertContains(content, fragment, description) {
    if (!content.includes(fragment)) {
        throw new Error(`${description} is missing: ${fragment}`);
    }
}

const pageWrapper = await readFile(
    join(clientSource, "components", "layout", "PageWrapper", "index.tsx"),
    "utf8"
);
const consentManager = await readFile(
    join(clientSource, "lib", "consent.ts"),
    "utf8"
);
const googleConsent = await readFile(
    join(clientSource, "lib", "googleConsent.ts"),
    "utf8"
);
const analytics = await readFile(
    join(clientSource, "lib", "analytics.ts"),
    "utf8"
);
const consentUi = await readFile(
    join(clientSource, "components", "privacy", "CookieConsent", "index.tsx"),
    "utf8"
);
const consentCopy = await readFile(
    join(clientSource, "components", "privacy", "CookieConsent", "copy.ts"),
    "utf8"
);
const advertisingPrivacyRevision = await readFile(
    join(
        clientSource,
        "apps",
        "footer",
        "legal",
        "pages",
        "PrivacyPolicy",
        "advertisingPrivacyRevision.ts"
    ),
    "utf8"
);
const worker = await readFile(join(root, "cloudflare", "worker.mjs"), "utf8");
const contactHelpers = await readFile(
    join(clientSource, "lib", "contact.ts"),
    "utf8"
);
const footer = await readFile(
    join(clientSource, "components", "layout", "Footer", "index.tsx"),
    "utf8"
);
const helpCenter = await readFile(
    join(
        clientSource,
        "apps",
        "footer",
        "helpCenter",
        "pages",
        "HelpCenter",
        "index.tsx"
    ),
    "utf8"
);
const legalDocument = await readFile(
    join(
        clientSource,
        "apps",
        "footer",
        "legal",
        "components",
        "LegalDocument",
        "index.tsx"
    ),
    "utf8"
);

assertContains(pageWrapper, "<CookieConsent/>", "Global cookie consent");
assertContains(consentManager, "nexochess.cookie-consent.v1", "Consent storage");
assertContains(consentManager, "analytics", "Analytics consent category");
assertContains(consentManager, "advertising", "Advertising consent category");
assertContains(
    consentManager,
    "requestGooglePrivacySettings",
    "Google CMP privacy-settings bridge"
);
assertContains(googleConsent, "CONSENT_API_READY", "Google CMP API readiness");
assertContains(
    googleConsent,
    "CONSENT_MODE_DATA_READY",
    "Google Consent Mode readiness"
);
assertContains(googleConsent, "getGoogleConsentModeValues", "Consent Mode values");
assertContains(googleConsent, "showRevocationMessage", "Google CMP revocation");
assertContains(googleConsent, 'tcfApi("addEventListener", 0', "TCF jurisdiction detection");
assertContains(
    consentUi,
    "googlePrivacy.applies !== false",
    "Single-CMP display guard"
);
assertContains(
    analytics,
    "effectiveConsent()",
    "Effective Google/custom analytics consent"
);
assertContains(
    analytics,
    "initialiseGooglePrivacyMessaging",
    "Analytics Google CMP initialisation"
);
assertContains(
    worker,
    "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    "Production AdSense/CMP tag"
);
assertContains(
    advertisingPrivacyRevision,
    "Google AdSense",
    "Advertising privacy disclosure"
);
assertContains(contactHelpers, 'fs: "0"', "Compact Gmail composer");
assertContains(footer, "manageDataConsent", "Persistent footer consent control");
assertContains(footer, "createGmailComposeUrl", "Footer Gmail contact");
assertContains(helpCenter, "createGmailComposeUrl", "Help-center Gmail contact");
assertContains(legalDocument, "createGmailComposeUrl", "Legal Gmail contact");
assertContains(legalDocument, "data-consent-settings", "Privacy consent control");

for (const language of expectedLanguages) {
    if (!new RegExp(`\\n\\s{4}${language}: \\{`).test(consentCopy)) {
        throw new Error(`Missing consent copy for language: ${language}`);
    }
    if (!new RegExp(`\\n\\s{4}${language}: \\{`).test(advertisingPrivacyRevision)) {
        throw new Error(`Missing advertising privacy copy for language: ${language}`);
    }
}

const sourceFiles = await collectSourceFiles(clientSource);
const obsoleteContactLinks = [];

for (const path of sourceFiles) {
    if (path.endsWith(join("lib", "contact.ts"))) continue;

    const content = await readFile(path, "utf8");

    if (content.includes("mailto:contact@nexochess.com")) {
        obsoleteContactLinks.push(relative(root, path));
    }
}

if (obsoleteContactLinks.length > 0) {
    throw new Error(
        "Direct contact mailto links remain outside the central fallback:\n"
        + obsoleteContactLinks.map(path => `- ${path}`).join("\n")
    );
}

console.log("Consent and contact verification passed.");
console.log(`Consent languages: ${expectedLanguages.length}`);
console.log(`Client source files scanned: ${sourceFiles.length}`);
