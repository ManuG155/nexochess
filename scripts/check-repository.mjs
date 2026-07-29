import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const requiredFiles = ["LICENSE", "ATTRIBUTIONS.md", "SECURITY.md", ".env.example"];
const forbiddenPatterns = [
    /^\.env(?:\..+)?$/,
    /^.*\.zip$/i,
    /^git-diff.*\.patch$/i,
    /^git-status.*\.txt$/i,
    /^PATCH-(?:MANIFEST\.json|NOTES\.txt)$/i,
    /^V\d+-README\.txt$/i,
    /^wintrchess-openings-v2(?:\/|$)/i,
    /^wintrchess-review-movelist-v3-pack(?:\/|$)/i,
];
const allowedEnvironmentFile = ".env.example";
const maxFileSize = 95 * 1024 * 1024;

const secretPatterns = [
    ["Google OAuth client secret", /GOCSPX-[A-Za-z0-9_-]{20,}/g],
    ["Google API key", /AIza[0-9A-Za-z_-]{35}/g],
    ["GitHub token", /gh[pousr]_[A-Za-z0-9]{20,}/g],
    ["Brevo SMTP key", /xsmtpsib-[A-Za-z0-9_-]{20,}/g],
    ["AWS access key", /AKIA[0-9A-Z]{16}/g],
    ["Private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
    ["Credentialed MongoDB URI", /mongodb(?:\+srv)?:\/\/[^:\s/]+:[^@\s/]+@/g],
    [
        "Assigned application secret",
        /(?:AUTH_SECRET|SMTP_PASSWORD|GOOGLE_OAUTH_CLIENT_SECRET|INTERNAL_PASSWORD)[ \t]*=[ \t]*["']?(?!replace-|change-me|example|your-|<|\.{3}|$)[A-Za-z0-9_+\/=.-]{16,}/g,
    ],
];

function trackedFiles() {
    try {
        return execFileSync("git", ["ls-files", "-z"], { cwd: root, stdio: ["ignore", "pipe", "ignore"] })
            .toString("utf8")
            .split("\0")
            .filter(Boolean);
    } catch {
        return [];
    }
}

async function walk(directory, relative = "") {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const result = [];
    for (const entry of entries) {
        if ([".git", "node_modules", "dist", "coverage"].includes(entry.name)) continue;
        const nextRelative = relative ? `${relative}/${entry.name}` : entry.name;
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) result.push(...(await walk(absolute, nextRelative)));
        else result.push(nextRelative);
    }
    return result;
}

function isProbablyText(buffer) {
    const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
    return !sample.includes(0);
}

const tracked = trackedFiles();
const files = tracked.length > 0 ? tracked : await walk(root);
const errors = [];
const warnings = [];

for (const required of requiredFiles) {
    try {
        await fs.access(path.join(root, required));
    } catch {
        errors.push(`Missing required file: ${required}`);
    }
}

for (const file of files) {
    const normalized = file.replaceAll("\\", "/");
    const basename = path.posix.basename(normalized);

    if (normalized !== allowedEnvironmentFile && forbiddenPatterns.some((pattern) => pattern.test(normalized) || pattern.test(basename))) {
        errors.push(`Forbidden public-repository artefact: ${normalized}`);
    }

    const absolute = path.join(root, file);
    let stat;
    try {
        stat = await fs.stat(absolute);
    } catch {
        continue;
    }

    if (stat.size > maxFileSize) {
        errors.push(`File exceeds 95 MiB: ${normalized} (${(stat.size / 1024 / 1024).toFixed(1)} MiB)`);
    }

    if (stat.size > 2 * 1024 * 1024 || normalized === "scripts/check-repository.mjs") continue;

    const buffer = await fs.readFile(absolute);
    if (!isProbablyText(buffer)) continue;
    const text = buffer.toString("utf8");

    for (const [label, pattern] of secretPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(text)) errors.push(`${label} may be present in ${normalized}`);
    }
}

if (!files.includes(".env.example")) warnings.push(".env.example is not tracked yet.");
if (!files.includes("readme.md") && !files.includes("README.md")) warnings.push("No README is tracked.");

for (const warning of warnings) console.warn(`WARNING: ${warning}`);

if (errors.length > 0) {
    console.error(`Repository audit failed with ${errors.length} problem(s):`);
    for (const error of errors) console.error(`- ${error}`);
    console.error("Run scripts/prepare-public-repository.ps1 in preview mode before applying cleanup.");
    process.exit(1);
}

console.log(`Repository audit passed for ${files.length} file(s).`);
