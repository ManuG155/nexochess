import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const files = Object.fromEntries(await Promise.all(
    Object.entries({
        html: "client/public/apps/home.html",
        entry: "client/src/apps/home/index.tsx",
        component: "client/src/apps/home/Home.tsx",
        copy: "client/src/apps/home/copy.ts",
        styles: "client/src/apps/home/Home.module.css",
        webpack: "client/webpack.config.js",
        worker: "cloudflare/worker.mjs",
        indexing: "config/search-indexing.mjs",
        deployment: "scripts/verify-cloudflare-deployment.mjs"
    }).map(async ([name, path]) => [
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

requireFragments("html", "Homepage document metadata", [
    '<meta name="description"',
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    '<link rel="canonical" href="https://www.nexochess.com/">',
    '<script src="/home.bundle.js"></script>',
    '<title>NexoChess — Understand Every Move</title>'
]);

requireFragments("entry", "Homepage React entry", [
    'import Home from "./Home"',
    "<PageWrapper>",
    "<Home/>",
    "<I18nGate>",
    'import "@/i18n"',
    "removeDefaultConsentLink"
]);

requireFragments("component", "Homepage content", [
    '<main className={styles.home}>',
    '<h1 id="home-title">',
    'href="/analysis"',
    'href="/puzzles"',
    '{ icon: "analysis", href: "/analysis" }',
    '{ icon: "archive", href: "/archive" }',
    '{ icon: "puzzle", href: "/puzzles" }',
    '{ icon: "academy", href: "/academy" }',
    'aria-labelledby="features-title"',
    'aria-labelledby="process-title"',
    'aria-labelledby="proof-title"',
    'aria-labelledby="final-title"',
    'src="/img/nexochess-icon-white.png"',
    'alt=""',
    "6,057,356"
]);

for (const externalProtocol of ["http://", "https://", "javascript:"]) {
    assert.ok(
        !files.component.includes(externalProtocol),
        `Homepage component contains an unexpected external link: ${externalProtocol}`
    );
}

const expectedLanguages = [
    "en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"
];
for (const language of expectedLanguages) {
    assert.ok(
        files.copy.includes(`\n    ${language}: {`),
        `Homepage copy is missing language: ${language}`
    );
}
assert.ok(
    files.copy.includes("return copies[normalised] || copies.en"),
    "Homepage copy must fall back to English."
);
assert.ok(
    files.copy.includes("HOME_COPY_LANGUAGES"),
    "Homepage must expose its translated language inventory."
);

requireFragments("styles", "Homepage responsive and theme styles", [
    'html[data-theme="light"] .home',
    "@media (max-width: 1180px)",
    "@media (max-width: 760px)",
    "@media (prefers-reduced-motion: reduce)",
    ".primaryAction:focus-visible",
    ".featureCard:focus-visible"
]);

assert.ok(
    files.webpack.includes('home: "./src/apps/home/index.tsx"'),
    "Webpack must compile the homepage entry."
);
assert.ok(
    files.worker.includes('["/", "home.html"]'),
    "The Worker must render home.html at the root route."
);
assert.ok(
    !files.worker.includes('pathname === "/") {\n        return Response.redirect'),
    "The root route must not redirect to analysis."
);
assert.ok(
    files.indexing.includes('pathname: "/",\n        assetPath: "apps/home.html"'),
    "The canonical homepage must be part of the indexing policy."
);
assert.ok(
    files.deployment.includes('    "/",\n    "/analysis"'),
    "Remote deployment verification must request the homepage."
);
assert.ok(
    files.deployment.includes('assertJavaScript("/home.bundle.js")'),
    "Remote deployment verification must request the homepage bundle."
);

console.log(
    `Homepage verification passed: ${expectedLanguages.length} languages, `
    + "responsive themes, accessible landmarks, canonical root and functional routes."
);
