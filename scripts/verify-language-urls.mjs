import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
    DEFAULT_LANGUAGE_CODE,
    PREFIXED_LANGUAGE_CODES,
    SUPPORTED_LANGUAGE_CODES,
    getDefaultLanguageAliasRedirect,
    localizePathname,
    localizedProductionUrl,
    parseLocalizedPathname
} from "../config/language-routing.mjs";
import {
    BASE_INDEXABLE_PAGE_ROUTES,
    INDEXABLE_PAGE_ROUTES,
    getIndexablePageRoute,
    getSearchIndexingPolicy
} from "../config/search-indexing.mjs";
import {
    INDEXABLE_PAGE_METADATA,
    getLocalizedBasePageMetadata,
    getPageMetadataReplacements
} from "../config/page-metadata.mjs";
import { SITEMAP_ENTRIES } from "../config/sitemap.mjs";
import { PRODUCTION_ENVIRONMENT, productionUrl } from "../config/site.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function repositoryPath(...parts) {
    return join(repositoryRoot, ...parts);
}

assert.equal(DEFAULT_LANGUAGE_CODE, "en");
assert.deepEqual(SUPPORTED_LANGUAGE_CODES, [
    "en", "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"
]);
assert.deepEqual(PREFIXED_LANGUAGE_CODES, [
    "es", "fr", "de", "pt", "ru", "zh", "vi", "hi", "mr", "pl"
]);
assert.equal(new Set(SUPPORTED_LANGUAGE_CODES).size, 11);
assert.equal(INDEXABLE_PAGE_ROUTES.length, BASE_INDEXABLE_PAGE_ROUTES.length * 11);
assert.equal(INDEXABLE_PAGE_ROUTES.length, 121);
assert.equal(SITEMAP_ENTRIES.length, 121);

const expectedRoutes = [];
for (const language of SUPPORTED_LANGUAGE_CODES) {
    for (const baseRoute of BASE_INDEXABLE_PAGE_ROUTES) {
        const pathname = localizePathname(baseRoute.pathname, language);
        expectedRoutes.push(pathname);
        const route = getIndexablePageRoute(pathname);

        assert.ok(route, `Missing localized route ${pathname}.`);
        assert.equal(route.language, language);
        assert.equal(route.basePathname, baseRoute.pathname);
        assert.equal(route.assetPath, baseRoute.assetPath);
        assert.equal(route.pathname, pathname);
        assert.equal(
            localizedProductionUrl(baseRoute.pathname, language),
            productionUrl(pathname)
        );

        const parsed = parseLocalizedPathname(pathname);
        assert.equal(parsed.language, language);
        assert.equal(parsed.basePathname, baseRoute.pathname);
        assert.equal(parsed.localizedPathname, pathname);

        const policy = getSearchIndexingPolicy(productionUrl(pathname), {
            environment: PRODUCTION_ENVIRONMENT,
            responseStatus: 200,
            contentType: "text/html; charset=utf-8"
        });
        assert.equal(policy.indexable, true, `${pathname} must be indexable.`);
        assert.equal(policy.canonicalUrl, productionUrl(pathname));

        const metadata = INDEXABLE_PAGE_METADATA[pathname];
        const localizedBaseMetadata = getLocalizedBasePageMetadata(
            language,
            baseRoute.pathname
        );
        assert.ok(metadata, `Missing metadata for ${pathname}.`);
        assert.ok(localizedBaseMetadata, `Missing localized SEO metadata for ${pathname}.`);
        assert.equal(metadata.language, language);
        assert.equal(metadata.basePathname, baseRoute.pathname);
        assert.equal(metadata.canonicalUrl, productionUrl(pathname));
        assert.equal(metadata.title, localizedBaseMetadata.title);
        assert.equal(metadata.description, localizedBaseMetadata.description);

        const replacements = getPageMetadataReplacements(pathname);
        assert.equal(replacements.PAGE_LANGUAGE, language);
        assert.equal(replacements.PAGE_CANONICAL, productionUrl(pathname));
        assert.equal(replacements.OPEN_GRAPH_URL, productionUrl(pathname));

        const template = await readFile(
            repositoryPath("client", "public", baseRoute.assetPath),
            "utf8"
        );
        assert.ok(template.includes('<html lang="${PAGE_LANGUAGE}">'));
        assert.ok(!template.includes("hreflang="), "hreflang belongs to step 29.");
    }
}

assert.deepEqual(
    INDEXABLE_PAGE_ROUTES.map(route => route.pathname),
    expectedRoutes,
    "Localized route order must be stable: English first, then each supported language."
);
assert.deepEqual(
    SITEMAP_ENTRIES.map(entry => entry.pathname),
    expectedRoutes,
    "The sitemap must contain every localized route."
);

for (const baseRoute of BASE_INDEXABLE_PAGE_ROUTES) {
    assert.equal(localizePathname(baseRoute.pathname, "en"), baseRoute.pathname);
    const englishAlias = baseRoute.pathname === "/"
        ? "/en"
        : `/en${baseRoute.pathname}`;
    const source = `https://www.nexochess.com${englishAlias}?source=test#section`;
    const redirect = getDefaultLanguageAliasRedirect(source);
    const expected = `https://www.nexochess.com${baseRoute.pathname === "/" ? "/" : baseRoute.pathname}?source=test#section`;
    assert.equal(redirect, expected, `${englishAlias} must redirect to unprefixed English.`);

    const policy = getSearchIndexingPolicy(source, {
        environment: PRODUCTION_ENVIRONMENT,
        responseStatus: 308,
        contentType: "text/html; charset=utf-8"
    });
    assert.equal(policy.indexable, false);
    assert.equal(policy.canonicalUrl, productionUrl(baseRoute.pathname));
}

assert.equal(parseLocalizedPathname("/es/analysis/").localizedPathname, "/es/analysis");
assert.equal(parseLocalizedPathname("/analysis").language, "en");
assert.equal(parseLocalizedPathname("/it/analysis").explicitLanguage, false);
assert.equal(getDefaultLanguageAliasRedirect("https://www.nexochess.com/es/analysis"), null);

const worker = await readFile(repositoryPath("cloudflare", "worker.mjs"), "utf8");
for (const fragment of [
    "parseLocalizedPathname(rawPathname)",
    "getDefaultLanguageAliasRedirect(url)",
    "localizePathname(\"/analysis\", languageRoute.language)",
    "metadataFor(localizedPathname, pathname, languageRoute.language)",
    "PAGE_LANGUAGE: language"
]) {
    assert.ok(worker.includes(fragment), `Worker language routing is missing: ${fragment}`);
}

const clientRouting = await readFile(repositoryPath("client", "src", "i18n", "routing.ts"), "utf8");
const clientI18n = await readFile(repositoryPath("client", "src", "i18n", "index.ts"), "utf8");
const languageDialog = await readFile(
    repositoryPath("client", "src", "components", "settings", "LanguagesDialog", "index.tsx"),
    "utf8"
);
const navigationBar = await readFile(
    repositoryPath("client", "src", "components", "layout", "NavigationBar", "index.tsx"),
    "utf8"
);

for (const fragment of [
    "getUrlLanguage", "localizePathname", "localizeHref",
    "navigateToLanguage", "installLocalizedLinkRouting", "MutationObserver"
]) {
    assert.ok(clientRouting.includes(fragment), `Client language routing is missing: ${fragment}`);
}
assert.ok(clientI18n.includes("const urlLanguage = getUrlLanguage(window.location.pathname)"));
assert.ok(clientI18n.includes("installLocalizedLinkRouting"));
assert.ok(languageDialog.includes("navigateToLanguage(language)"));
assert.ok(navigationBar.includes("parseLanguagePathname(location.pathname).basePathname"));

console.log(
    `Verified ${INDEXABLE_PAGE_ROUTES.length} language URLs: `
    + "unprefixed English plus ten prefixed language variants for every public page."
);
