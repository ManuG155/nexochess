import { createHash } from "node:crypto";
import {
    access,
    cp,
    mkdir,
    readFile,
    readdir,
    rm,
    writeFile
} from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
    SEARCH_FAVICON_FILENAME,
    SEARCH_FAVICON_SOURCE_PATH,
    applySearchFaviconLink,
    applySearchFaviconManifest,
    renderSearchFaviconSvg
} from "../config/favicon.mjs";
import {
    renderRobotsTxt,
    renderSitemapXml
} from "../config/search-indexing.mjs";

const DEFAULT_STATIC_PUZZLE_ORIGIN =
    "https://nexochess-puzzle-data-staging.manuel-garcia-villaescusa.workers.dev";

const repositoryRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    ".."
);
const clientPublic = join(repositoryRoot, "client", "public");
const clientBundles = join(repositoryRoot, "client", "dist");
const outputDirectory = join(repositoryRoot, "cloudflare-dist");

function readArgument(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

function normaliseOrigin(value) {
    const url = new URL(value);

    if (url.protocol !== "https:") {
        throw new Error("The static puzzle origin must use HTTPS.");
    }

    url.pathname = "";
    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, "");
}

const staticPuzzleOrigin = normaliseOrigin(
    readArgument("--puzzle-origin")
    || process.env.NEXOCHESS_PUZZLE_ORIGIN
    || DEFAULT_STATIC_PUZZLE_ORIGIN
);

async function assertDirectory(path, description) {
    try {
        await access(path);
    } catch {
        throw new Error(`${description} does not exist: ${path}`);
    }
}

async function findHtmlFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const filepath = join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...await findHtmlFiles(filepath));
        } else if (entry.isFile() && entry.name.endsWith(".html")) {
            files.push(filepath);
        }
    }

    return files;
}

async function configureStaticPuzzleOrigin() {
    const bundlePath = join(outputDirectory, "puzzles.bundle.js");
    const bundle = await readFile(bundlePath, "utf8");
    const occurrences = bundle.split(DEFAULT_STATIC_PUZZLE_ORIGIN).length - 1;

    if (occurrences == 0) {
        throw new Error(
            "The puzzles bundle does not contain the expected staging origin."
        );
    }

    if (staticPuzzleOrigin == DEFAULT_STATIC_PUZZLE_ORIGIN) {
        return occurrences;
    }

    await writeFile(
        bundlePath,
        bundle.replaceAll(DEFAULT_STATIC_PUZZLE_ORIGIN, staticPuzzleOrigin),
        "utf8"
    );

    return occurrences;
}

async function configureSearchFavicon() {
    const sourcePath = join(clientPublic, SEARCH_FAVICON_SOURCE_PATH);
    const sourceIcon = await readFile(sourcePath);
    const pngSignature = sourceIcon.subarray(0, 8).toString("hex");

    if (pngSignature !== "89504e470d0a1a0a") {
        throw new Error(
            `Search favicon source must be a PNG: ${SEARCH_FAVICON_SOURCE_PATH}`
        );
    }

    await writeFile(
        join(outputDirectory, SEARCH_FAVICON_FILENAME),
        renderSearchFaviconSvg(sourceIcon.toString("base64")),
        "utf8"
    );

    const manifestPath = join(outputDirectory, "manifest.webmanifest");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    await writeFile(
        manifestPath,
        `${JSON.stringify(applySearchFaviconManifest(manifest), null, 4)}\n`,
        "utf8"
    );

    return {
        source: SEARCH_FAVICON_SOURCE_PATH,
        output: SEARCH_FAVICON_FILENAME
    };
}

async function versionEntryBundles(html) {
    const pattern = /(<script\s+[^>]*src=["']\/)([^"'?]+\.bundle\.js)(?:\?[^"']*)?(["'][^>]*><\/script>)/gi;
    const matches = [...html.matchAll(pattern)];
    let output = html;

    for (const match of matches) {
        const [fullMatch, prefix, bundleName, suffix] = match;
        const bundlePath = join(outputDirectory, bundleName);

        try {
            const bundle = await readFile(bundlePath);
            const version = createHash("sha256")
                .update(bundle)
                .digest("hex")
                .slice(0, 12);

            output = output.replace(
                fullMatch,
                `${prefix}${bundleName}?v=${version}${suffix}`
            );
        } catch {
            console.warn(`Bundle referenced by HTML was not built: ${bundleName}`);
        }
    }

    return output;
}

await assertDirectory(clientPublic, "Client public directory");
await assertDirectory(clientBundles, "Client bundle directory");

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await cp(clientPublic, outputDirectory, { recursive: true });
await cp(clientBundles, outputDirectory, { recursive: true });

await writeFile(
    join(outputDirectory, "robots.txt"),
    renderRobotsTxt(),
    "utf8"
);
await writeFile(
    join(outputDirectory, "sitemap.xml"),
    renderSitemapXml(),
    "utf8"
);

const searchFavicon = await configureSearchFavicon();
const puzzleOriginReplacements = await configureStaticPuzzleOrigin();
const htmlFiles = await findHtmlFiles(join(outputDirectory, "apps"));

for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    const faviconHtml = applySearchFaviconLink(html);
    await writeFile(htmlFile, await versionEntryBundles(faviconHtml), "utf8");
}

const buildManifest = {
    generatedAt: new Date().toISOString(),
    puzzleDataOrigin: staticPuzzleOrigin,
    puzzleOriginReplacements,
    searchFavicon,
    searchIndexingFiles: ["robots.txt", "sitemap.xml"],
    htmlFiles: htmlFiles.map(filepath => (
        relative(outputDirectory, filepath).replaceAll("\\", "/")
    ))
};

await writeFile(
    join(outputDirectory, "cloudflare-build.json"),
    `${JSON.stringify(buildManifest, null, 2)}\n`,
    "utf8"
);

console.log(
    `Prepared ${htmlFiles.length} HTML applications in ${outputDirectory}`
);
console.log(`Static puzzle origin: ${staticPuzzleOrigin}`);
console.log(`Search favicon: /${SEARCH_FAVICON_FILENAME}`);
