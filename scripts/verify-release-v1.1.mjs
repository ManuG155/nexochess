import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = (...parts) => join(repositoryRoot, ...parts);
const read = (...parts) => readFile(path(...parts), "utf8");

const languages = ["en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"];
const cutoff = "2026-08-09T22:00:00.000Z";
const endpoint = "/api/account/release-notes/v1.1";
const localStorageKey = "nexochess.release-note.v1.1.seen";

const [releaseCopy, releaseNotice, pageWrapper, cloudflareApi, cloudflareAuth, releaseDocument, packageJson] = await Promise.all([
    read("client", "src", "releases", "v1_1.ts"),
    read("client", "src", "components", "releases", "ReleaseNotice", "index.tsx"),
    read("client", "src", "components", "layout", "PageWrapper", "index.tsx"),
    read("cloudflare", "api.mjs"),
    read("cloudflare", "auth.mjs"),
    read("docs", "releases", "v1.1.md"),
    read("package.json")
]);

assert.ok(releaseCopy.includes(`V1_1_RELEASE_NOTE_CUTOFF = "${cutoff}"`));
assert.equal(Date.parse(cutoff), Date.parse("2026-08-10T00:00:00+02:00"));
assert.ok(releaseCopy.includes(`V1_1_RELEASE_NOTE_STORAGE_KEY = "${localStorageKey}"`));
assert.ok(releaseCopy.includes(`V1_1_RELEASE_NOTE_ENDPOINT = "${endpoint}"`));
assert.ok(releaseCopy.includes("now >= Date.parse(V1_1_RELEASE_NOTE_CUTOFF)"));

for (const language of languages) {
    assert.ok(releaseCopy.includes(`    ${language}: {`), `Missing v1.1 copy for ${language}.`);
    assert.ok(releaseDocument.includes(`(${language})`), `Missing v1.1 release notes for ${language}.`);
}

for (const fragment of [
    "wasSeenLocally()",
    "markSeenLocally()",
    "markSeenForAccount()",
    "response.status === 401",
    "if (!await markSeenForAccount()) return",
    "Date.parse(V1_1_RELEASE_NOTE_CUTOFF) - Date.now()",
    "ariaLabelledBy={titleId}"
]) assert.ok(releaseNotice.includes(fragment), `Archived v1.1 notice is missing: ${fragment}`);

assert.ok(cloudflareApi.includes('new Set(["v1.1", "v1.4"])'));
assert.ok(cloudflareApi.includes('const prefix = "/api/account/release-notes/"'));
assert.ok(cloudflareApi.includes("getReleaseNoteState"));
assert.ok(cloudflareApi.includes("markReleaseNoteSeen"));
assert.ok(cloudflareApi.includes("ON CONFLICT(user_id, version) DO NOTHING"));
assert.ok(
    !pageWrapper.includes("<ReleaseNotice/>"),
    "Expired v1.1 popup must remain archived and must not be mounted in the current shell."
);

assert.ok(cloudflareAuth.includes("const SCHEMA_VERSION = 2"));
assert.ok(cloudflareAuth.includes("CREATE TABLE IF NOT EXISTS release_note_views"));
assert.ok(cloudflareAuth.includes("PRIMARY KEY (user_id, version)"));
assert.ok(releaseDocument.includes("# NexoChess v1.1 — Release notes"));

const scripts = JSON.parse(packageJson).scripts;
assert.equal(scripts["verify:release-v1.1"], "node scripts/verify-release-v1.1.mjs");
assert.ok(scripts.check.includes("npm run verify:release-v1.1"));

console.log("Archived NexoChess v1.1 release safeguards passed.");
