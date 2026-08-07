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
const DEFAULT_ANALYTICS_MEASUREMENT_ID = "G-V4227TJCDB";
const OUTPUT_FILE = resolve("wrangler.production.local.jsonc");
const ANALYTICS_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/i;

function readArgument(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
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
const analyticsMeasurementId = (
    readArgument("--analytics-measurement-id")
    || process.env.NEXOCHESS_GA_MEASUREMENT_ID
    || DEFAULT_ANALYTICS_MEASUREMENT_ID
).trim().toUpperCase();

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

if (!ANALYTICS_MEASUREMENT_ID_PATTERN.test(analyticsMeasurementId)) {
    throw new Error(
        "Missing or invalid --analytics-measurement-id / NEXOCHESS_GA_MEASUREMENT_ID (expected G-...)."
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
    routes: [
        {
            pattern: `${PRODUCTION_CANONICAL_HOST}/*`,
            zone_name: PRODUCTION_APEX_HOST
        },
        {
            pattern: `${PRODUCTION_APEX_HOST}/*`,
            zone_name: PRODUCTION_APEX_HOST
        }
    ],
    assets: {
        directory: "./cloudflare-dist",
        binding: "ASSETS",
        html_handling: "none",
        not_found_handling: "none",
        run_worker_first: [
            "/",
            "/*.bundle.js",
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
        GOOGLE_ANALYTICS_MEASUREMENT_ID: analyticsMeasurementId,
        EMAIL_FROM_NAME: "NexoChess",
        EMAIL_FROM_ADDRESS: "contact@nexochess.com",
        EMAIL_REPLY_TO: "contact@nexochess.com"
    }
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
console.log(`Analytics: ${analyticsMeasurementId}`);
console.log("workers.dev: disabled");
console.log("Preview URLs: disabled");
console.log(`Worker routes: ${PRODUCTION_CANONICAL_HOST}/*, ${PRODUCTION_APEX_HOST}/*`);
console.log("Existing proxied DNS records are preserved; production does not use Custom Domains.");
