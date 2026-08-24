import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = (...parts) => join(repositoryRoot, ...parts);
const read = (...parts) => readFile(path(...parts), "utf8");

const languages = ["en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"];
const cutoff = "2026-08-16T17:00:00.000Z";
const localStorageKey = "nexochess.release-note.v1.2.seen";

const [releaseCopy, releaseNotice, pageWrapper, releaseDocument, packageJson] = await Promise.all([
    read("client", "src", "releases", "v1_2.ts"),
    read("client", "src", "components", "releases", "ReleaseNoticeV12", "index.tsx"),
    read("client", "src", "components", "layout", "PageWrapper", "index.tsx"),
    read("docs", "releases", "v1.2.md"),
    read("package.json")
]);

assert.ok(releaseCopy.includes(`V1_2_RELEASE_NOTE_CUTOFF = "${cutoff}"`));
assert.ok(releaseCopy.includes(`V1_2_RELEASE_NOTE_STORAGE_KEY = "${localStorageKey}"`));
assert.ok(releaseCopy.includes("now >= Date.parse(V1_2_RELEASE_NOTE_CUTOFF)"));

for (const language of languages) {
    assert.ok(releaseCopy.includes(`    ${language}: {`), `Missing v1.2 copy for ${language}.`);
    assert.ok(releaseDocument.includes(`(${language})`), `Missing v1.2 release notes for ${language}.`);
}

for (const fragment of [
    "wasSeenLocally()",
    "markSeenLocally()",
    "if (!markSeenLocally()) return",
    "setVisible(true)",
    "Date.parse(V1_2_RELEASE_NOTE_CUTOFF) - Date.now()",
    "ariaLabelledBy={titleId}"
]) assert.ok(releaseNotice.includes(fragment), `Archived v1.2 notice is missing: ${fragment}`);

assert.ok(!releaseNotice.includes("/api/") && !releaseNotice.includes("credentials:"));
assert.ok(
    !pageWrapper.includes("<ReleaseNoticeV12/>"),
    "Expired v1.2 popup must remain archived and must not be mounted in the current shell."
);
assert.ok(releaseDocument.includes("# NexoChess v1.2 — Release notes"));

const scripts = JSON.parse(packageJson).scripts;
assert.equal(scripts["verify:release-v1.2"], "node scripts/verify-release-v1.2.mjs");
assert.ok(scripts.check.includes("npm run verify:release-v1.2"));

console.log("Archived NexoChess v1.2 release safeguards passed.");
