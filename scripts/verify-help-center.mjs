import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const paths = {
    page: "client/src/apps/footer/helpCenter/pages/HelpCenter/index.tsx",
    completion: "client/src/apps/footer/helpCenter/pages/HelpCenter/HelpCompletion.tsx",
    content: "client/src/apps/footer/helpCenter/pages/HelpCenter/helpCompletionContent.ts",
    styles: "client/src/apps/footer/helpCenter/pages/HelpCenter/HelpCenterCompletion.module.css"
};

const files = Object.fromEntries(await Promise.all(
    Object.entries(paths).map(async ([name, path]) => [
        name,
        await readFile(resolve(path), "utf8")
    ])
));

function requireFragments(name, description, fragments) {
    for (const fragment of fragments) {
        assert.ok(
            files[name].includes(fragment),
            `${description} is missing: ${fragment}`
        );
    }
}

requireFragments("page", "Help Center integration", [
    'import HelpCompletion from "./HelpCompletion"',
    "<HelpCompletion contactUrl={contactUrl}/>",
    'href="/faq"',
    'id="contact"'
]);

requireFragments("completion", "Completed help content", [
    'id="help-guides"',
    'id="troubleshooting"',
    "copy.guides.map",
    "copy.issues.map",
    "copy.supportChecklist.map",
    'target="_blank"',
    'rel="noreferrer"'
]);

for (const route of ["/analysis", "/archive", "/puzzles", "/settings"]) {
    assert.ok(
        files.content.includes(`href: "${route}"`),
        `Help guide is missing route: ${route}`
    );
}

const expectedLanguages = [
    "en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"
];

for (const language of expectedLanguages) {
    assert.ok(
        files.content.includes(`\n    ${language}: {`),
        `Completed Help Center copy is missing language: ${language}`
    );
}

assert.ok(
    files.content.includes("HELP_COMPLETION_LANGUAGES"),
    "Help content must expose its translated language inventory."
);
assert.ok(
    files.content.includes("return copies[normalised] || copies.en"),
    "Help content must fall back to English."
);

const guideIds = ["analysis", "archive", "puzzles", "account"];
const issueIds = ["import", "analysis", "archive", "account"];

for (const id of guideIds) {
    const occurrences = files.content.split(`id: "${id}"`).length - 1;
    assert.ok(
        occurrences >= expectedLanguages.length,
        `Guide ${id} is not present in every language.`
    );
}

for (const id of issueIds) {
    const occurrences = files.content.split(`id: "${id}"`).length - 1;
    assert.ok(
        occurrences >= expectedLanguages.length,
        `Troubleshooting item ${id} is not present in every language.`
    );
}

requireFragments("styles", "Help Center responsive and theme styles", [
    'html[data-theme="light"] .library',
    "@media (max-width: 980px)",
    "@media (max-width: 760px)",
    "@media (max-width: 520px)",
    "@media (prefers-reduced-motion: reduce)",
    ".guideAction:focus-visible",
    ".issue summary:focus-visible"
]);

for (const frozenPath of [
    "client/src/apps/home/Home.tsx",
    "client/src/apps/about/About.tsx",
    "client/src/apps/faq/Faq.tsx"
]) {
    assert.ok(
        !files.page.includes(frozenPath)
            && !files.completion.includes(frozenPath)
            && !files.content.includes(frozenPath),
        `Completed Help Center must not depend on frozen page: ${frozenPath}`
    );
}

console.log(
    `Help Center verification passed: ${expectedLanguages.length} languages, `
    + `${guideIds.length} practical guides, ${issueIds.length} troubleshooting items, `
    + "responsive themes, keyboard focus and safe support guidance."
);
