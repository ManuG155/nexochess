import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = (...parts) => join(repositoryRoot, ...parts);
const read = (...parts) => readFile(path(...parts), "utf8");

const languages = ["en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"];
const cutoff = "2026-08-21T22:00:00.000Z";
const localStorageKey = "nexochess.release-note.v1.3.seen";

const [releaseCopy, releaseNotice, pageWrapper, packageJson] = await Promise.all([
    read("client", "src", "releases", "v1_3.ts"),
    read("client", "src", "components", "releases", "ReleaseNoticeV13", "index.tsx"),
    read("client", "src", "components", "layout", "PageWrapper", "index.tsx"),
    read("package.json")
]);

assert.ok(releaseCopy.includes(`V1_3_RELEASE_NOTE_CUTOFF = "${cutoff}"`));
assert.ok(releaseCopy.includes(`V1_3_RELEASE_NOTE_STORAGE_KEY = "${localStorageKey}"`));
assert.ok(releaseCopy.includes("now >= Date.parse(V1_3_RELEASE_NOTE_CUTOFF)"));

for (const language of languages) {
    assert.ok(releaseCopy.includes(`    ${language}: {`), `Missing v1.3 copy for ${language}.`);
}

for (const fragment of [
    "wasSeenLocally()",
    "markSeenLocally()",
    "if (!markSeenLocally()) return",
    "setVisible(true)",
    "Date.parse(V1_3_RELEASE_NOTE_CUTOFF) - Date.now()",
    "ariaLabelledBy={titleId}"
]) assert.ok(releaseNotice.includes(fragment), `Archived v1.3 notice is missing: ${fragment}`);

assert.ok(!releaseNotice.includes("/api/") && !releaseNotice.includes("credentials:"));
assert.ok(
    !pageWrapper.includes("<ReleaseNoticeV13/>"),
    "Expired v1.3 popup must remain archived and must not be mounted in the current shell."
);

const scripts = JSON.parse(packageJson).scripts;
assert.equal(scripts["verify:release-v1.3"], "node scripts/verify-release-v1.3.mjs");
assert.ok(scripts.check.includes("npm run verify:release-v1.3"));

console.log("Archived NexoChess v1.3 release safeguards passed.");
