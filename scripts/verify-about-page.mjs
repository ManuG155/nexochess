import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const files = Object.fromEntries(await Promise.all(
    Object.entries({
        html: "client/public/apps/about.html",
        entry: "client/src/apps/about/index.tsx",
        component: "client/src/apps/about/About.tsx",
        copy: "client/src/apps/about/copy.ts",
        styles: "client/src/apps/about/About.module.css",
        navigationCopy: "client/src/lib/aboutNavigation.ts",
        footer: "client/src/components/layout/Footer/index.tsx",
        webpack: "client/webpack.config.js",
        worker: "cloudflare/worker.mjs",
        indexing: "config/search-indexing.mjs",
        sitemap: "client/public/sitemap.xml",
        deployment: "scripts/verify-cloudflare-deployment.mjs",
        packageJson: "package.json",
        ci: ".github/workflows/ci.yml"
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

requireFragments("html", "About document metadata", [
    '<meta name="description"',
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    '<link rel="canonical" href="https://www.nexochess.com/about">',
    '<script src="/about.bundle.js"></script>',
    "<title>About NexoChess</title>"
]);

requireFragments("entry", "About React entry", [
    'import About from "./About"',
    "<PageWrapper>",
    "<About/>",
    "<I18nGate>",
    'import "@/i18n"',
    "removeDefaultConsentLink"
]);

requireFragments("component", "About page content", [
    '<main className={styles.about}>',
    '<h1 id="about-title">',
    'href="/analysis"',
    'href="/puzzles"',
    'href="/source"',
    'href="https://github.com/ManuG155/nexochess"',
    'rel="noreferrer"',
    'aria-labelledby="mission-title"',
    'aria-labelledby="principles-title"',
    'aria-labelledby="independence-title"',
    'aria-labelledby="creator-title"',
    'src="/img/nexochess-icon-white.png"',
    'alt=""',
    "6,057,356",
    "Stockfish 17"
]);

requireFragments("copy", "About project identity", [
    "Manuel García Villaescusa",
    "GPL-3.0",
    "Stockfish"
]);

for (const forbiddenPlatform of ["Chess.com", "Lichess"]) {
    assert.ok(
        !files.component.includes(forbiddenPlatform)
            && !files.copy.includes(forbiddenPlatform),
        `About page contains unnecessary third-party branding: ${forbiddenPlatform}`
    );
}

const expectedLanguages = [
    "en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"
];

for (const language of expectedLanguages) {
    assert.ok(
        files.copy.includes(`\n    ${language}: {`),
        `About copy is missing language: ${language}`
    );
    assert.ok(
        files.navigationCopy.includes(`\n    ${language}:`),
        `About navigation copy is missing language: ${language}`
    );
}

assert.ok(
    files.copy.includes("return copies[normalised] || copies.en"),
    "About copy must fall back to English."
);
assert.ok(
    files.copy.includes("ABOUT_COPY_LANGUAGES"),
    "About page must expose its translated language inventory."
);
assert.ok(
    files.navigationCopy.includes("ABOUT_NAVIGATION_LANGUAGES"),
    "About navigation must expose its translated language inventory."
);

requireFragments("styles", "About responsive and theme styles", [
    'html[data-theme="light"] .about',
    "@media (max-width: 1120px)",
    "@media (max-width: 760px)",
    "@media (prefers-reduced-motion: reduce)",
    ".primaryAction:focus-visible",
    ".sourceAction:focus-visible"
]);

assert.ok(
    files.footer.includes('href="/about"')
        && files.footer.includes("getAboutNavigationLabel"),
    "The footer must link to the translated About page."
);
assert.ok(
    files.webpack.includes('about: "./src/apps/about/index.tsx"'),
    "Webpack must compile the About entry."
);
assert.ok(
    files.worker.includes('["/about", "about.html"]'),
    "The Worker must render about.html at /about."
);
assert.ok(
    files.indexing.includes(
        'pathname: "/about",\n        assetPath: "apps/about.html"'
    ),
    "The About page must be part of the central indexing policy."
);
assert.ok(
    files.sitemap.includes(
        "<loc>https://www.nexochess.com/about</loc>"
    ),
    "The static sitemap must contain the About page."
);
assert.ok(
    files.deployment.includes('    "/about",')
        && files.deployment.includes(
            'assertJavaScript("/about.bundle.js")'
        ),
    "Remote deployment verification must request the About page and bundle."
);
assert.ok(
    files.packageJson.includes(
        '"verify:about": "node scripts/verify-about-page.mjs"'
    ),
    "package.json must expose the About verification."
);
assert.ok(
    files.ci.includes("Verify About NexoChess page")
        && files.ci.includes("npm run verify:about")
        && files.ci.includes(
            "node --check scripts/verify-about-page.mjs"
        ),
    "CI must execute and syntax-check the About verification."
);

for (const frozenHomepageFile of [
    "client/src/apps/home/Home.tsx",
    "client/src/apps/home/Home.module.css",
    "client/src/apps/home/HomePreviewFix.module.css",
    "client/src/apps/home/copy.ts",
    "client/public/apps/home.html"
]) {
    assert.ok(
        !files.component.includes(frozenHomepageFile),
        `About page must not depend on the frozen homepage: ${frozenHomepageFile}`
    );
}

console.log(
    `About page verification passed: ${expectedLanguages.length} languages, `
    + "public canonical route, responsive themes, accessible landmarks, "
    + "independent project information and deployment coverage."
);
