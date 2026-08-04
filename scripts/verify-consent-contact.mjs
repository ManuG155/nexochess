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
const consentCopy = await readFile(
    join(clientSource, "components", "privacy", "CookieConsent", "copy.ts"),
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
assertContains(footer, "manageDataConsent", "Persistent footer consent control");
assertContains(footer, "createGmailComposeUrl", "Footer Gmail contact");
assertContains(helpCenter, "createGmailComposeUrl", "Help-center Gmail contact");
assertContains(legalDocument, "createGmailComposeUrl", "Legal Gmail contact");
assertContains(legalDocument, "data-consent-settings", "Privacy consent control");

for (const language of expectedLanguages) {
    if (!new RegExp(`\\n\\s{4}${language}: \\{`).test(consentCopy)) {
        throw new Error(`Missing consent copy for language: ${language}`);
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
