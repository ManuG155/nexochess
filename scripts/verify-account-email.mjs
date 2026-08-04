import { buildAccountEmail } from "../cloudflare/email.mjs";

const locales = [
    "en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"
];
const types = [
    "verifyAccount",
    "resetPassword",
    "approveEmailChange"
];
const actionUrl = "https://example.com/auth/action?token=test-token";
const newEmail = "new-address@example.com";

for (const locale of locales) {
    const request = new Request("https://example.com", {
        headers: { "x-nexochess-language": locale }
    });

    for (const type of types) {
        const email = buildAccountEmail({
            request,
            type,
            url: actionUrl,
            newEmail
        });

        if (!email.subject.trim()) {
            throw new Error(`${locale}/${type} has an empty subject.`);
        }

        if (!email.htmlContent.includes(actionUrl)) {
            throw new Error(`${locale}/${type} HTML is missing the action URL.`);
        }

        if (!email.textContent.includes(actionUrl)) {
            throw new Error(`${locale}/${type} text is missing the action URL.`);
        }

        if (email.htmlContent.includes("{{") || email.textContent.includes("{{")) {
            throw new Error(`${locale}/${type} contains an unresolved variable.`);
        }
    }
}

let rejectedUnsafeUrl = false;
try {
    buildAccountEmail({
        request: new Request("https://example.com"),
        type: "resetPassword",
        url: "javascript:alert(1)"
    });
} catch {
    rejectedUnsafeUrl = true;
}

if (!rejectedUnsafeUrl) {
    throw new Error("Account email templates accepted an unsafe action URL.");
}

console.log(`Verified ${locales.length * types.length} account email variants.`);
