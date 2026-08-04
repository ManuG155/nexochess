import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const DEFAULT_WORKER_NAME = "nexochess-production";
const DEFAULT_DATABASE_NAME = "nexochess-production";
const DEFAULT_PREVIEW_ORIGIN =
    "https://nexochess-production.manuel-garcia-villaescusa.workers.dev";
const OUTPUT_FILE = resolve("wrangler.production.local.jsonc");

function readArgument(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name) {
    return process.argv.includes(name);
}

function normaliseOrigin(value) {
    const url = new URL(value);

    if (url.protocol !== "https:") {
        throw new Error("The production origin must use HTTPS.");
    }

    url.pathname = "";
    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, "");
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
    || DEFAULT_PREVIEW_ORIGIN
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

const configuration = {
    $schema: "node_modules/wrangler/config-schema.json",
    name: workerName,
    main: "cloudflare/worker.mjs",
    compatibility_date: "2026-08-02",
    compatibility_flags: ["nodejs_compat"],
    workers_dev: true,
    assets: {
        directory: "./cloudflare-dist",
        binding: "ASSETS",
        html_handling: "none",
        not_found_handling: "none",
        run_worker_first: [
            "/",
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
                    pattern: "www.nexochess.com",
                    custom_domain: true
                },
                {
                    pattern: "nexochess.com",
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
console.log(`Custom domains: ${attachDomains ? "enabled" : "disabled"}`);
