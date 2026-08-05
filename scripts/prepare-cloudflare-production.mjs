import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
    PRODUCTION_APEX_HOST,
    PRODUCTION_CANONICAL_HOST,
    PRODUCTION_CANONICAL_ORIGIN,
    normaliseOrigin
} from "../config/site.mjs";

const DEFAULT_WORKER_NAME = "nexochess-production";
const DEFAULT_DATABASE_NAME = "nexochess-production";
const OUTPUT_FILE = resolve("wrangler.production.local.jsonc");

function readArgument(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name) {
    return process.argv.includes(name);
}

const databaseId = readArgument("--database-id")
    || process.env.NEXOCHESS_PRODUCTION_D1_ID;
const databaseName = readArgument("--database-name")
    || process.env.NEXOCHESS_PRODUCTION_D1_NAME
    || DEFAULT_DATABASE_NAME;
const workerName = readArgument("--worker-name")
    || process.env.NEXOCHESS_PRODUCTION_WORKER
    || DEFAULT_WORKER_NAME;
const origin = normaliseOrigin(
    readArgument("--origin")
    || process.env.NEXOCHESS_PRODUCTION_ORIGIN
    || PRODUCTION_CANONICAL_ORIGIN
);
const attachDomains = hasFlag("--attach-domains")
    || process.env.NEXOCHESS_ATTACH_PRODUCTION_DOMAINS === "1";

if (!databaseId) {
    throw new Error(
        "Missing --database-id or NEXOCHESS_PRODUCTION_D1_ID."
    );
}

if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(databaseId)) {
    throw new Error("The production D1 database ID is not a valid UUID.");
}

if (origin !== PRODUCTION_CANONICAL_ORIGIN) {
    throw new Error(
        `Production origin is fixed to ${PRODUCTION_CANONICAL_ORIGIN}.`
    );
}

const configuration = {
    $schema: "node_modules/wrangler/config-schema.json",
    name: workerName,
    main: "cloudflare/worker.mjs",
    compatibility_date: "2026-08-02",
    compatibility_flags: ["nodejs_compat"],
    workers_dev: false,
    preview_urls: false,
    assets: {
        directory: "./cloudflare-dist",
        binding: "ASSETS",
        html_handling: "none",
        not_found_handling: "none",
        run_worker_first: [
            "/",
            "/robots.txt",
            "/sitemap.xml",
            "/analysis",
            "/archive",
            "/academy",
            "/puzzles",
            "/settings*",
            "/signin",
            "/signup",
            "/auth/*",
            "/terms",
            "/privacy",
            "/source",
            "/help",
            "/news*",
            "/api/*"
        ]
    },
    d1_databases: [
        {
            binding: "DB",
            database_name: databaseName,
            database_id: databaseId
        }
    ],
    vars: {
        NEXOCHESS_ENV: "production",
        NEXOCHESS_ORIGIN: origin,
        EMAIL_FROM_NAME: "NexoChess",
        EMAIL_FROM_ADDRESS: "contact@nexochess.com",
        EMAIL_REPLY_TO: "contact@nexochess.com"
    },
    ...(attachDomains
        ? {
            routes: [
                {
                    pattern: PRODUCTION_CANONICAL_HOST,
                    custom_domain: true
                },
                {
                    pattern: PRODUCTION_APEX_HOST,
                    custom_domain: true
                }
            ]
        }
        : {})
};

await writeFile(
    OUTPUT_FILE,
    `${JSON.stringify(configuration, null, 4)}\n`,
    "utf8"
);

console.log(`Prepared ${OUTPUT_FILE}`);
console.log(`Worker: ${workerName}`);
console.log(`D1: ${databaseName} (${databaseId})`);
console.log(`Origin: ${origin}`);
console.log("workers.dev: disabled");
console.log("Preview URLs: disabled");
console.log(`Custom domains: ${attachDomains ? "enabled" : "disabled"}`);
