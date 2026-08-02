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

const repositoryRoot = resolve(
    dirname(fileURLToPath(import.meta.url)),
    ".."
);
const clientPublic = join(repositoryRoot, "client", "public");
const clientBundles = join(repositoryRoot, "client", "dist");
const outputDirectory = join(repositoryRoot, "cloudflare-dist");

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

const htmlFiles = await findHtmlFiles(join(outputDirectory, "apps"));
for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    await writeFile(htmlFile, await versionEntryBundles(html), "utf8");
}

const buildManifest = {
    generatedAt: new Date().toISOString(),
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
