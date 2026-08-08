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
        previewFix: "client/src/apps/home/HomePreviewFix.module.css",
        pageWrapper: "client/src/components/layout/PageWrapper/index.tsx",
        navigation: "client/src/components/layout/NavigationBar/index.tsx",
        routing: "client/src/i18n/routing.ts",
        webpack: "client/webpack.config.js",
        worker: "cloudflare/worker.mjs",
        indexing: "config/search-indexing.mjs",
        deployment: "scripts/verify-cloudflare-deployment.mjs"
    }).map(async ([name, path]) => [name, await readFile(resolve(path), "utf8")])
));

function requireFragments(name, description, fragments) {
    for (const fragment of fragments) {
        assert.ok(files[name].includes(fragment), `${description} is missing: ${fragment}`);
    }
}

requireFragments("html", "Homepage document metadata", [
    '<meta name="description" content="${PAGE_DESCRIPTION}">',
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    '<link rel="canonical" href="${PAGE_CANONICAL}">',
    '<script type="application/ld+json">${STRUCTURED_DATA_JSON}</script>',
    '<script src="/home.bundle.js"></script>',
    '<title>${PAGE_TITLE}</title>'
]);
requireFragments("entry", "Homepage React entry", [
    'import Home from "./Home"', "<PageWrapper>", "<Home/>", "<I18nGate>",
    'import "@/i18n"', "removeDefaultConsentLink"
]);
requireFragments("component", "Homepage content", [
    '<main className={styles.home}>', '<h1 id="home-title">',
    'href="/analysis"', 'href="/puzzles"',
    '{ icon: "archive", href: "/archive" }',
    'aria-labelledby="features-title"', 'aria-labelledby="process-title"',
    'aria-labelledby="proof-title"', 'aria-labelledby="final-title"',
    'src="/img/nexochess-icon-white.png"', "6,057,356"
]);
for (const protocol of ["http://", "https://", "javascript:"]) {
    assert.ok(!files.component.includes(protocol));
}
for (const language of ["en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"]) {
    assert.ok(files.copy.includes(`\n    ${language}: {`), `Missing homepage language ${language}.`);
}
requireFragments("copy", "Homepage copy registry", [
    "return copies[normalised] || copies.en", "HOME_COPY_LANGUAGES"
]);
requireFragments("styles", "Homepage responsive styles", [
    'html[data-theme="light"] .home', "@media (max-width: 1180px)",
    "@media (max-width: 760px)", "@media (prefers-reduced-motion: reduce)",
    ".primaryAction:focus-visible", ".featureCard:focus-visible"
]);
requireFragments("previewFix", "Homepage board geometry", [
    "grid-template-columns: repeat(8, minmax(0, 1fr))",
    "grid-template-rows: repeat(8, minmax(0, 1fr))",
    "aspect-ratio: 1 / 1", "overflow: hidden"
]);

/*
 * El logo y la navegación son destinos distintos. El antiguo parche de
 * recuperación buscaba el primer `header a[href="/analysis"]` y lo convertía
 * en `/home`; después de que el logo tuviera su propio `/home`, aquello pasó
 * a secuestrar precisamente el botón Análisis. Esta verificación impide que
 * vuelva a introducirse esa ambigüedad.
 */
requireFragments("navigation", "NexoChess header navigation", [
    'className={styles.logoLink}',
    'href="/home"',
    '<NavigationItem icon="analysis" url="/analysis" current={onAnalysisPage}>'
]);
assert.ok(
    !files.pageWrapper.includes('header a[href="/analysis"]')
    && !files.pageWrapper.includes('brandLink.setAttribute("href", "/home")'),
    "PageWrapper must never rewrite the Analysis navigation link into the homepage."
);

requireFragments("routing", "Localized homepage recovery access", [
    '"/", "/home", "/about"'
]);
requireFragments("worker", "Homepage cached redirect recovery", [
    '["/", "home.html"]',
    'async function renderHomepageRecovery(request, env, language)',
    'headers.set("Clear-Site-Data", \'"cache"\')',
    'cache:"reload"',
    'credentials:"same-origin"',
    'response.ok&&new URL(response.url,location.href).pathname===root',
    'if (pathname === "/home")',
    'history.replaceState(history.state'
]);
assert.ok(files.webpack.includes('home: "./src/apps/home/index.tsx"'));
assert.ok(files.indexing.includes('freezeRoute({ pathname: "/", assetPath: "apps/home.html" })'));
assert.ok(
    files.deployment.includes('    "/",')
    && files.deployment.includes(
        'assertJavaScript("/home.bundle.js?v=deployment-smoke-test", { immutable: true })'
    ),
    "Homepage deployment verification must check the versioned immutable bundle."
);

console.log("Homepage verification passed: canonical homepage recovery is preserved, the logo targets home, and the Analysis navigation remains independent in all localized shells.");