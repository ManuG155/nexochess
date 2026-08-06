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
    }).map(async ([name, path]) => [name, await readFile(resolve(path), "utf8")])
));

function requireFragments(name, description, fragments) {
    for (const fragment of fragments) {
        assert.ok(files[name].includes(fragment), `${description} is missing: ${fragment}`);
    }
}

requireFragments("html", "About document metadata", [
    '<meta name="description" content="${PAGE_DESCRIPTION}">',
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    '<link rel="canonical" href="${PAGE_CANONICAL}">',
    '<script type="application/ld+json">${STRUCTURED_DATA_JSON}</script>',
    '<script src="/about.bundle.js"></script>',
    '<title>${PAGE_TITLE}</title>'
]);
requireFragments("entry", "About React entry", [
    'import About from "./About"', "<PageWrapper>", "<About/>", "<I18nGate>",
    'import "@/i18n"', "removeDefaultConsentLink"
]);
requireFragments("component", "About page content", [
    '<main className={styles.about}>', '<h1 id="about-title">',
    'href="/analysis"', 'href="/puzzles"', 'href="/source"',
    'href="https://github.com/ManuG155/nexochess"', 'rel="noreferrer"',
    'aria-labelledby="mission-title"', 'aria-labelledby="principles-title"',
    'aria-labelledby="independence-title"', 'aria-labelledby="creator-title"',
    "6,057,356", "Stockfish 17"
]);
requireFragments("copy", "About identity", ["Manuel García Villaescusa", "GPL-3.0", "Stockfish"]);
for (const platform of ["Chess.com", "Lichess"]) {
    assert.ok(!files.component.includes(platform) && !files.copy.includes(platform));
}
for (const language of ["en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"]) {
    assert.ok(files.copy.includes(`\n    ${language}: {`), `Missing About language ${language}.`);
    assert.ok(files.navigationCopy.includes(`\n    ${language}:`), `Missing About navigation language ${language}.`);
}
requireFragments("copy", "About copy registry", ["return copies[normalised] || copies.en", "ABOUT_COPY_LANGUAGES"]);
assert.ok(files.navigationCopy.includes("ABOUT_NAVIGATION_LANGUAGES"));
requireFragments("styles", "About responsive styles", [
    'html[data-theme="light"] .about', "@media (max-width: 1120px)",
    "@media (max-width: 760px)", "@media (prefers-reduced-motion: reduce)",
    ".primaryAction:focus-visible", ".sourceAction:focus-visible"
]);
assert.ok(files.footer.includes('href="/about"') && files.footer.includes("getAboutNavigationLabel"));
assert.ok(files.webpack.includes('about: "./src/apps/about/index.tsx"'));
assert.ok(files.worker.includes('["/about", "about.html"]'));
assert.ok(files.indexing.includes('pathname: "/about",\n        assetPath: "apps/about.html"'));
assert.ok(files.sitemap.includes("<loc>https://www.nexochess.com/about</loc>"));
assert.ok(files.deployment.includes('    "/about",') && files.deployment.includes('assertJavaScript("/about.bundle.js")'));
assert.ok(files.packageJson.includes('"verify:about": "node scripts/verify-about-page.mjs"'));
assert.ok(files.ci.includes("Verify About NexoChess page") && files.ci.includes("npm run verify:about"));

console.log("About verification passed with centralized canonical metadata and eleven languages.");
