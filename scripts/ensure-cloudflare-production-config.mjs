import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const CONFIG_PATH = resolve("wrangler.production.local.jsonc");
const PREPARER_PATH = resolve("scripts", "prepare-cloudflare-production.mjs");
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function databaseIdFromExistingConfig() {
    if (!existsSync(CONFIG_PATH)) return null;

    let configuration;
    try {
        configuration = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
    } catch {
        throw new Error(
            "wrangler.production.local.jsonc is invalid JSON. Restore it or set NEXOCHESS_PRODUCTION_D1_ID."
        );
    }

    return configuration.d1_databases
        ?.find(value => value?.binding === "DB")
        ?.database_id
        || null;
}

const databaseId = process.env.NEXOCHESS_PRODUCTION_D1_ID
    || await databaseIdFromExistingConfig();

if (!databaseId) {
    throw new Error(
        "Production D1 ID is unavailable. Set NEXOCHESS_PRODUCTION_D1_ID or keep a valid wrangler.production.local.jsonc."
    );
}

if (!UUID_PATTERN.test(databaseId)) {
    throw new Error("The production D1 database ID is not a valid UUID.");
}

const result = spawnSync(
    process.execPath,
    [PREPARER_PATH, "--database-id", databaseId],
    {
        cwd: resolve("."),
        env: process.env,
        stdio: "inherit"
    }
);

if (result.error) throw result.error;
if (result.status !== 0) {
    throw new Error(
        `Production Wrangler configuration refresh failed with exit code ${result.status}.`
    );
}

console.log("Production Wrangler configuration refreshed from the repository source of truth.");
