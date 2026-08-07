import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
    SUPPORTED_LANGUAGE_CODES,
    localizePathname,
    parseLocalizedPathname
} from "../config/language-routing.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const legalEntry = await readFile(
    join(repositoryRoot, "client", "src", "apps", "footer", "legal", "index.tsx"),
    "utf8"
);

const LEGAL_ROUTES = ["/privacy", "/terms", "/source"];

assert.ok(
    legalEntry.includes('parseLanguagePathname(window.location.pathname)'),
    "Legal pages must strip the localized URL prefix before choosing the document."
);
assert.ok(
    !legalEntry.includes("<Routes>"),
    "Legal pages must not rely on exact unprefixed React Router paths."
);

for (const route of LEGAL_ROUTES) {
    assert.ok(
        legalEntry.includes(`case "${route}":`),
        `Legal entry is missing the ${route} document mapping.`
    );

    for (const language of SUPPORTED_LANGUAGE_CODES) {
        const localizedPathname = localizePathname(route, language);
        const parsed = parseLocalizedPathname(localizedPathname);
        assert.equal(
            parsed.basePathname,
            route,
            `${localizedPathname} must resolve to ${route}.`
        );
    }
}

assert.equal(
    LEGAL_ROUTES.length * SUPPORTED_LANGUAGE_CODES.length,
    33,
    "Expected 33 legal route/language combinations."
);

console.log(
    "Localized legal page verification passed: privacy, terms and source resolve in all 11 languages."
);
