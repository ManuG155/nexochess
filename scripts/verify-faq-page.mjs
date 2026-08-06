import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const paths = {
    html: "client/public/apps/faq.html",
    entry: "client/src/apps/faq/index.tsx",
    component: "client/src/apps/faq/Faq.tsx",
    styles: "client/src/apps/faq/Faq.module.css",
    help: "client/src/apps/footer/helpCenter/pages/HelpCenter/index.tsx",
    webpack: "client/webpack.config.js",
    worker: "cloudflare/worker.mjs",
    indexing: "config/search-indexing.mjs",
    sitemap: "client/public/sitemap.xml",
    deployment: "scripts/verify-cloudflare-deployment.mjs"
};

const files = Object.fromEntries(await Promise.all(
    Object.entries(paths).map(async ([name, path]) => [
        name,
        await readFile(resolve(path), "utf8")
    ])
));

function includes(name, fragment, message) {
    assert.ok(files[name].includes(fragment), message || `${name} is missing ${fragment}`);
}

includes("html", 'href="https://www.nexochess.com/faq"');
includes("html", '<script src="/faq.bundle.js"></script>');
includes("entry", 'import Faq from "./Faq"');
includes("entry", "<Faq/>");
includes("component", 'useTranslation("helpCenter")');
includes("component", '<main className={styles.faq}>');
includes("component", 'href="/analysis"');
includes("component", 'href="/help"');
includes("component", 'href="/help#contact"');
includes("component", "faqItems.map");
includes("styles", "@media (max-width: 840px)");
includes("styles", ".question summary:focus-visible");
includes("help", 'href="/faq"', "The Help Center must visibly link to /faq.");
includes("webpack", 'faq: "./src/apps/faq/index.tsx"');
includes("worker", '["/faq", "faq.html"]');
includes("indexing", 'pathname: "/faq"');
includes("indexing", 'assetPath: "apps/faq.html"');
includes("sitemap", "<loc>https://www.nexochess.com/faq</loc>");
includes("deployment", '    "/faq",');
includes("deployment", 'assertJavaScript("/faq.bundle.js")');

for (const item of ["account", "archive", "engine", "languages", "privacy"]) {
    includes("component", `"${item}"`);
}

console.log(
    "FAQ verification passed: public route, visible Help Center access, "
    + "translated content reuse, responsive layout and deployment coverage."
);
