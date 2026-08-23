import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = (...parts) => join(repositoryRoot, ...parts);
const read = (...parts) => readFile(path(...parts), "utf8");

const languages = ["en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"];
const cutoff = "2026-08-27T21:59:59.999Z";
const localStorageKey = "nexochess.release-note.v1.4.seen";
const endpoint = "/api/account/release-notes/v1.4";

const [
    releaseCopy,
    releaseNotice,
    pageWrapper,
    cloudflareApi,
    readme,
    releaseDocument,
    navigationBar,
    packageJson
] = await Promise.all([
    read("client", "src", "releases", "v1_4.ts"),
    read("client", "src", "components", "releases", "ReleaseNoticeV14", "index.tsx"),
    read("client", "src", "components", "layout", "PageWrapper", "index.tsx"),
    read("cloudflare", "api.mjs"),
    read("README.md"),
    read("docs", "releases", "v1.4.md"),
    read("client", "src", "components", "layout", "NavigationBar", "index.tsx"),
    read("package.json")
]);

assert.ok(releaseCopy.includes(`V1_4_RELEASE_NOTE_CUTOFF = "${cutoff}"`));
assert.equal(Date.parse(cutoff), Date.parse("2026-08-27T21:59:59.999Z"));
assert.ok(releaseCopy.includes(`V1_4_RELEASE_NOTE_STORAGE_KEY = "${localStorageKey}"`));
assert.ok(releaseCopy.includes(`V1_4_RELEASE_NOTE_ENDPOINT = "${endpoint}"`));
assert.ok(releaseCopy.includes("now >= Date.parse(V1_4_RELEASE_NOTE_CUTOFF)"));

for (const language of languages) {
    assert.ok(
        releaseCopy.includes(`    ${language}: {`),
        `Missing v1.4 release-note copy for ${language}.`
    );
}

for (const fragment of [
    "wasSeenLocally()",
    "markSeenLocally()",
    "markSeenForAccount()",
    "credentials: \"same-origin\"",
    "setVisible(true)",
    "Date.parse(V1_4_RELEASE_NOTE_CUTOFF) - Date.now()",
    "window.setTimeout(() => setVisible(false), remaining)",
    "ariaLabelledBy={titleId}",
    "{copy.confirm}",
    "{copy.close}"
]) {
    assert.ok(releaseNotice.includes(fragment), `v1.4 release notice is missing: ${fragment}`);
}

assert.ok(
    releaseNotice.indexOf("if (!await markSeenForAccount()) return")
        < releaseNotice.lastIndexOf("setVisible(true)"),
    "The signed-in account marker must be persisted before the v1.4 popup renders."
);
assert.ok(
    releaseNotice.indexOf("markSeenLocally();")
        < releaseNotice.lastIndexOf("setVisible(true)"),
    "The device marker must be persisted before the v1.4 popup renders."
);

assert.ok(cloudflareApi.includes('new Set(["v1.1", "v1.4"])'));
assert.ok(cloudflareApi.includes('const prefix = "/api/account/release-notes/"'));
assert.ok(cloudflareApi.includes("releaseNoteVersion(pathname)"));
assert.ok(cloudflareApi.includes("getReleaseNoteState(request, env, auth, noteVersion)"));
assert.ok(cloudflareApi.includes("markReleaseNoteSeen(request, env, auth, noteVersion)"));
assert.ok(cloudflareApi.includes("ON CONFLICT(user_id, version) DO NOTHING"));

assert.ok(
    pageWrapper.includes('lazy(() => import("@/components/releases/ReleaseNoticeV14"))'),
    "The v1.4 notice must be loaded lazily."
);
assert.ok(pageWrapper.includes("<ReleaseNoticeV14/>"));
assert.ok(
    !pageWrapper.includes("<ReleaseNoticeV13/>")
        && !pageWrapper.includes("<ReleaseNoticeV12/>")
        && !pageWrapper.includes("<ReleaseNotice/>"),
    "Only the current v1.4 Home release popup should be mounted."
);
assert.ok(pageWrapper.includes('const releaseNoticesEnabled = routeName == "home"'));

assert.ok(readme.includes("release-v1.4"));
assert.ok(readme.includes("[v1.4](docs/releases/v1.4.md)"));
assert.ok(releaseDocument.includes("# NexoChess v1.4"));
assert.ok(releaseDocument.includes("72 playable positions"));
assert.ok(releaseDocument.includes("Statistics"));
assert.ok(releaseDocument.includes("Conclusions"));
assert.ok(releaseDocument.includes("guided NexoChess tutorial") || releaseDocument.includes("Guided NexoChess tutorial"));

const malformedGearFragments = [
    "l-.15-.09a2 2 0 0 0 .73-2.73",
    "l.22-.38a2 2 0 0 0 2.73-.73"
];
for (const fragment of malformedGearFragments) {
    assert.ok(!navigationBar.includes(fragment), `Malformed settings gear path remains: ${fragment}`);
}
assert.ok(
    navigationBar.includes('l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73'),
    "The corrected settings gear geometry is missing."
);

const scripts = JSON.parse(packageJson).scripts;
assert.equal(scripts["verify:release-v1.4"], "node scripts/verify-release-v1.4.mjs");
assert.ok(
    scripts.check.includes("npm run verify:release-v1.4"),
    "The v1.4 release audit must run in the main check pipeline."
);

console.log(
    "NexoChess v1.4 release verification passed: corrected settings gear, "
    + "11 localized release notes, once-per-device and once-per-account persistence, "
    + "27 August 23:59 CEST cutoff, README and release documentation are wired."
);
