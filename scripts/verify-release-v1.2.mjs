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

const [
    releaseCopy,
    releaseNotice,
    pageWrapper,
    releaseDocument,
    readme,
    packageJson
] = await Promise.all([
    read("client", "src", "releases", "v1_2.ts"),
    read("client", "src", "components", "releases", "ReleaseNoticeV12", "index.tsx"),
    read("client", "src", "components", "layout", "PageWrapper", "index.tsx"),
    read("docs", "releases", "v1.2.md"),
    read("README.md"),
    read("package.json")
]);

assert.ok(releaseCopy.includes(`V1_2_RELEASE_NOTE_CUTOFF = "${cutoff}"`));
assert.equal(Date.parse(cutoff), Date.parse("2026-08-16T17:00:00Z"));
assert.ok(releaseCopy.includes(`V1_2_RELEASE_NOTE_STORAGE_KEY = "${localStorageKey}"`));
assert.ok(releaseCopy.includes("now >= Date.parse(V1_2_RELEASE_NOTE_CUTOFF)"));

for (const language of languages) {
    assert.ok(
        releaseCopy.includes(`    ${language}: {`),
        `Missing v1.2 release-note copy for ${language}.`
    );
    assert.ok(
        releaseDocument.includes(`(${language})`),
        `Missing v1.2 repository release notes for ${language}.`
    );
}

for (const fragment of [
    "wasSeenLocally()",
    "markSeenLocally()",
    "if (!markSeenLocally()) return",
    "setVisible(true)",
    "Date.parse(V1_2_RELEASE_NOTE_CUTOFF) - Date.now()",
    "window.setTimeout(() => setVisible(false), remaining)",
    "ariaLabelledBy={titleId}",
    "{copy.confirm}",
    "{copy.close}"
]) {
    assert.ok(releaseNotice.includes(fragment), `v1.2 release notice is missing: ${fragment}`);
}

assert.ok(
    !releaseNotice.includes("/api/") && !releaseNotice.includes("credentials:"),
    "The v1.2 notice must remain browser/device-local and independent of account state."
);
assert.ok(
    releaseNotice.indexOf("markSeenLocally()") < releaseNotice.lastIndexOf("setVisible(true)"),
    "The local seen marker must be persisted before the notice is rendered."
);

assert.ok(
    pageWrapper.includes('lazy(() => import("@/components/releases/ReleaseNoticeV12"))'),
    "The v1.2 release notice must be loaded globally and lazily."
);
assert.ok(pageWrapper.includes("<ReleaseNoticeV12/>"));

assert.ok(releaseDocument.includes("# NexoChess v1.2 — Release notes"));
assert.ok(releaseDocument.includes("Release date: 14 August 2026."));
assert.ok(readme.includes("Repertoire tools for creating or importing opening lines"));
assert.ok(readme.includes("Redesigned thematic puzzle training"));
assert.ok(
    !readme.includes("nexochess-staging.manuel-garcia-villaescusa.workers.dev"),
    "README must not publish the staging preparation URL."
);

const scripts = JSON.parse(packageJson).scripts;
assert.equal(scripts["verify:release-v1.2"], "node scripts/verify-release-v1.2.mjs");
assert.ok(
    scripts.check.includes("npm run verify:release-v1.2"),
    "The v1.2 release audit must run in the main check pipeline."
);

console.log(
    "NexoChess v1.2 release verification passed: 11 localized notes, "
    + "one-time browser/device persistence and the 16 August 17:00 UTC cutoff are wired."
);
