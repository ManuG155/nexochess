import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = resolve(".");

function assertContains(content, fragment, description) {
    if (!content.includes(fragment)) {
        throw new Error(`${description} is missing: ${fragment}`);
    }
}

function assertAbsent(content, fragment, description) {
    if (content.includes(fragment)) {
        throw new Error(`${description} must not be present: ${fragment}`);
    }
}

const worker = await readFile(resolve(root, "cloudflare", "worker.mjs"), "utf8");
const auth = await readFile(resolve(root, "cloudflare", "auth.mjs"), "utf8");

for (const [fragment, description] of [
    ["Content-Security-Policy", "Content Security Policy"],
    ["frame-ancestors 'none'", "Framing protection"],
    ["X-Content-Type-Options", "MIME-sniffing protection"],
    ["X-Frame-Options", "Legacy framing protection"],
    ["Referrer-Policy", "Referrer policy"],
    ["Permissions-Policy", "Browser capability policy"],
    ["Strict-Transport-Security", "Production HSTS"],
    ["validMutationOrigin", "Mutation origin validation"],
    ["Sec-Fetch-Site", "Fetch Metadata validation"],
    ["application/json", "JSON mutation requirement"],
    ["secureResponse(await handleRequest", "Global response hardening"]
]) {
    assertContains(worker, fragment, description);
}

for (const [fragment, description] of [
    ["rateLimit", "Authentication rate limiting"],
    ["enabled: true", "Explicit rate-limit activation"],
    ["cf-connecting-ip", "Trusted Cloudflare client IP"],
    ["trustedOrigins: [origin]", "Authentication origin allowlist"]
]) {
    assertContains(auth, fragment, description);
}

assertAbsent(auth, "disableCSRFCheck", "CSRF bypass");
assertAbsent(auth, "disableOriginCheck", "Origin-check bypass");
assertAbsent(auth, "trustedProxyHeaders: true", "Dynamic proxy-origin trust");

const { stdout } = await execFileAsync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
});

const trackedFiles = stdout.split("\0").filter(Boolean);
const blockedSecretFiles = trackedFiles.filter(path => {
    const normalised = path.replaceAll("\\", "/");
    const name = normalised.split("/").at(-1) || "";

    if (name === ".env.example") return false;

    return name === ".env"
        || name.startsWith(".env.")
        || /\.(?:pem|p12|pfx|key)$/i.test(name)
        || name === "wrangler.production.local.jsonc";
});

if (blockedSecretFiles.length > 0) {
    throw new Error(
        "Secret-bearing files are tracked:\n"
        + blockedSecretFiles.map(path => `- ${path}`).join("\n")
    );
}

const textExtensions = new Set([
    "", ".cjs", ".css", ".html", ".js", ".json", ".jsonc", ".jsx",
    ".md", ".mjs", ".scss", ".sh", ".ts", ".tsx", ".txt", ".yml", ".yaml"
]);
const secretPatterns = [
    { name: "Brevo API key", regex: /xkeysib-[A-Za-z0-9_-]{20,}/g },
    { name: "Google OAuth client secret", regex: /GOCSPX-[A-Za-z0-9_-]{20,}/g },
    {
        name: "Private key",
        regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g
    }
];
const findings = [];

for (const path of trackedFiles) {
    if (!textExtensions.has(extname(path).toLowerCase())) continue;

    let content;
    try {
        content = await readFile(resolve(root, path), "utf8");
    } catch {
        continue;
    }

    for (const pattern of secretPatterns) {
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(content)) {
            findings.push(`${pattern.name}: ${path}`);
        }
    }
}

if (findings.length > 0) {
    throw new Error(
        "Possible credentials are committed:\n"
        + findings.map(value => `- ${value}`).join("\n")
    );
}

console.log("Security hardening verification passed.");
console.log(`Tracked files checked for credentials: ${trackedFiles.length}`);
