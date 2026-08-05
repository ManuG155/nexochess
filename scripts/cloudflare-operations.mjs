import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
    mkdir,
    readFile,
    stat,
    writeFile
} from "node:fs/promises";
import { basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(".");
const BACKUP_ROOT = resolve(ROOT, ".nexochess-backup");
const REQUIRED_SECRETS = [
    "AUTH_SECRET",
    "BREVO_API_KEY",
    "GOOGLE_OAUTH_CLIENT_ID",
    "GOOGLE_OAUTH_CLIENT_SECRET"
];
const ENVIRONMENTS = {
    staging: {
        branch: "develop",
        buildScript: "build:cloudflare",
        configPath: resolve(ROOT, "wrangler.jsonc"),
        databaseName: "nexochess-puzzles-staging",
        environmentName: "staging",
        origin: "https://nexochess-staging.manuel-garcia-villaescusa.workers.dev",
        workerName: "nexochess-staging"
    },
    production: {
        branch: "master",
        buildScript: "build:cloudflare:production",
        configPath: resolve(ROOT, "wrangler.production.local.jsonc"),
        databaseName: "nexochess-production",
        environmentName: "production",
        origin: "https://www.nexochess.com",
        workerName: "nexochess-production"
    }
};

const command = process.argv[2];
const environmentName = argument("--environment");
const environment = ENVIRONMENTS[environmentName];
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function argument(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name) {
    return process.argv.includes(name);
}

function fail(message) {
    throw new Error(message);
}

function timestamp() {
    return new Date().toISOString().replaceAll(":", "-").replace(".", "-");
}

function run(executable, args, options = {}) {
    const result = spawnSync(executable, args, {
        cwd: ROOT,
        encoding: "utf8",
        stdio: options.capture ? "pipe" : "inherit",
        env: process.env
    });

    if (options.capture) {
        if (result.stdout) process.stdout.write(result.stdout);
        if (result.stderr) process.stderr.write(result.stderr);
    }

    if (result.error) throw result.error;
    if (result.status !== 0 && !options.allowFailure) {
        fail(`${executable} ${args.join(" ")} failed with exit code ${result.status}.`);
    }

    return {
        status: result.status,
        stdout: result.stdout || "",
        stderr: result.stderr || ""
    };
}

function capture(executable, args, options = {}) {
    return run(executable, args, { ...options, capture: true }).stdout.trim();
}

function git(...args) {
    return capture("git", args);
}

function currentBranch() {
    const actionsBranch = process.env.GITHUB_HEAD_REF
        || process.env.GITHUB_REF_NAME;
    if (hasFlag("--ci") && actionsBranch) return actionsBranch;
    return git("rev-parse", "--abbrev-ref", "HEAD");
}

function currentCommit() {
    return git("rev-parse", "HEAD");
}

function shortCommit() {
    return git("rev-parse", "--short=12", "HEAD");
}

function ensureEnvironment() {
    if (!environment) {
        fail("Use --environment staging or --environment production.");
    }
}

function ensureBranch() {
    const branch = currentBranch();
    if (branch !== environment.branch) {
        fail(
            `${environmentName} operations must run from ${environment.branch}; current branch: ${branch}.`
        );
    }
}

function ensureCleanRepository() {
    if (hasFlag("--ci")) return;
    const status = git("status", "--porcelain");
    if (status) {
        fail("The repository has uncommitted changes. Commit or discard them before deploying.");
    }
}

function ensureProductionConfirmation(action) {
    if (environmentName !== "production") return;
    const expected = `${action}-NEXOCHESS-PRODUCTION`;
    const supplied = argument("--confirm-production");
    if (supplied !== expected) {
        fail(`Production requires --confirm-production ${expected}.`);
    }
}

async function ensureProductionConfiguration() {
    if (environmentName !== "production" || existsSync(environment.configPath)) return;

    const databaseId = process.env.NEXOCHESS_PRODUCTION_D1_ID;
    if (!databaseId) {
        fail(
            "wrangler.production.local.jsonc is missing. Set NEXOCHESS_PRODUCTION_D1_ID or run prepare:cloudflare:production first."
        );
    }

    run("node", [
        "scripts/prepare-cloudflare-production.mjs",
        "--database-id",
        databaseId,
        "--origin",
        environment.origin
    ]);
}

async function readConfiguration() {
    await ensureProductionConfiguration();
    if (!existsSync(environment.configPath)) {
        fail(`Missing Wrangler configuration: ${environment.configPath}`);
    }

    const raw = await readFile(environment.configPath, "utf8");
    let configuration;
    try {
        configuration = JSON.parse(raw);
    } catch {
        fail(`${basename(environment.configPath)} must contain valid JSON.`);
    }

    return { configuration, raw };
}

function sha256(content) {
    return createHash("sha256").update(content).digest("hex");
}

async function verifyConfiguration({ checkRemoteSecrets = true } = {}) {
    ensureEnvironment();
    const { configuration, raw } = await readConfiguration();
    const database = configuration.d1_databases?.find(value => value.binding === "DB");

    if (configuration.name !== environment.workerName) {
        fail(`Expected Worker ${environment.workerName}; found ${configuration.name}.`);
    }
    if (database?.database_name !== environment.databaseName) {
        fail(`Expected D1 ${environment.databaseName}; found ${database?.database_name || "none"}.`);
    }
    if (configuration.vars?.NEXOCHESS_ENV !== environment.environmentName) {
        fail("NEXOCHESS_ENV does not match the selected environment.");
    }
    if (configuration.vars?.NEXOCHESS_ORIGIN !== environment.origin) {
        fail(`Expected origin ${environment.origin}.`);
    }

    let secretNames = [];
    if (checkRemoteSecrets) {
        const secretOutput = capture(npxCommand, [
            "wrangler",
            "secret",
            "list",
            "--config",
            environment.configPath
        ]);
        secretNames = REQUIRED_SECRETS.filter(name => secretOutput.includes(name));
        const missing = REQUIRED_SECRETS.filter(name => !secretNames.includes(name));
        if (missing.length > 0) {
            fail(`Missing Worker secrets: ${missing.join(", ")}.`);
        }
    }

    return {
        configurationHash: sha256(raw),
        databaseId: database?.database_id,
        databaseName: database.database_name,
        origin: configuration.vars.NEXOCHESS_ORIGIN,
        secretNames,
        workerName: configuration.name
    };
}

async function writeJson(path, value) {
    await mkdir(resolve(path, ".."), { recursive: true });
    await writeFile(path, `${JSON.stringify(value, null, 4)}\n`, "utf8");
}

async function captureRecoveryPoint(reason) {
    const configuration = await verifyConfiguration();
    const output = capture(npxCommand, [
        "wrangler",
        "d1",
        "time-travel",
        "info",
        environment.databaseName,
        "--config",
        environment.configPath
    ]);
    const bookmark = output.match(/bookmark is ['"]([^'"]+)['"]/i)?.[1]
        || output.match(/bookmark[=: ]+([0-9a-f-]{20,})/i)?.[1];

    if (!bookmark) {
        fail("Wrangler did not return a D1 Time Travel bookmark.");
    }

    const createdAt = new Date().toISOString();
    const path = resolve(
        BACKUP_ROOT,
        "recovery-points",
        environmentName,
        `${timestamp()}.json`
    );
    const record = {
        bookmark,
        configuration,
        createdAt,
        environment: environmentName,
        git: {
            branch: currentBranch(),
            commit: currentCommit()
        },
        reason
    };

    await writeJson(path, record);
    console.log(`Recovery point saved: ${path}`);
    console.log(`D1 bookmark: ${bookmark}`);
    return { bookmark, path, record };
}

async function exportDatabase() {
    ensureEnvironment();
    ensureProductionConfirmation("BACKUP");
    await verifyConfiguration();

    const createdAt = new Date().toISOString();
    const directory = resolve(BACKUP_ROOT, "d1", environmentName);
    const filename = `${timestamp()}.sql`;
    const outputPath = resolve(directory, filename);
    await mkdir(directory, { recursive: true });

    console.warn("D1 export can temporarily block database requests. Run it during low traffic.");
    run(npxCommand, [
        "wrangler",
        "d1",
        "export",
        environment.databaseName,
        "--remote",
        "--skip-confirmation",
        `--output=${outputPath}`,
        "--config",
        environment.configPath
    ]);

    const sql = await readFile(outputPath);
    const metadataPath = `${outputPath}.json`;
    await writeJson(metadataPath, {
        bytes: (await stat(outputPath)).size,
        createdAt,
        environment: environmentName,
        file: filename,
        gitCommit: currentCommit(),
        sha256: sha256(sql)
    });

    console.log(`D1 export created: ${outputPath}`);
    console.log(`Metadata created: ${metadataPath}`);
}

async function verifyDeployment() {
    run("node", [
        "scripts/verify-cloudflare-deployment.mjs",
        "--environment",
        environmentName
    ]);
}

async function deploy() {
    ensureEnvironment();
    ensureBranch();
    ensureCleanRepository();
    ensureProductionConfirmation("DEPLOY");
    await verifyConfiguration();

    run(npmCommand, ["run", "check"]);
    run(npmCommand, ["run", environment.buildScript]);

    const recoveryPoint = await captureRecoveryPoint(
        `Before ${environmentName} deployment of ${currentCommit()}`
    );
    const message = `${environmentName} ${currentCommit()}`;
    const tag = `git-${shortCommit()}`;
    const deployment = run(npxCommand, [
        "wrangler",
        "deploy",
        "--config",
        environment.configPath,
        "--message",
        message,
        "--tag",
        tag
    ], { capture: true });

    await verifyDeployment();

    const versionId = deployment.stdout.match(/Current Version ID:\s*([0-9a-f-]+)/i)?.[1]
        || deployment.stdout.match(/Version ID:\s*([0-9a-f-]+)/i)?.[1]
        || null;
    const recordPath = resolve(
        BACKUP_ROOT,
        "deployments",
        environmentName,
        `${timestamp()}.json`
    );
    await writeJson(recordPath, {
        createdAt: new Date().toISOString(),
        environment: environmentName,
        git: {
            branch: currentBranch(),
            commit: currentCommit()
        },
        recoveryPoint: recoveryPoint.path,
        tag,
        versionId
    });

    console.log(`Deployment record saved: ${recordPath}`);
    console.log(`${environmentName} deployment verified successfully.`);
}

async function restoreDatabase() {
    ensureEnvironment();
    ensureProductionConfirmation("RESTORE");
    const bookmark = argument("--bookmark");
    const restoreTimestamp = argument("--timestamp");
    if (Boolean(bookmark) === Boolean(restoreTimestamp)) {
        fail("Provide exactly one of --bookmark or --timestamp.");
    }
    if (!hasFlag("--execute")) {
        fail("Restore is destructive. Add --execute after reviewing the target point.");
    }

    await verifyConfiguration();
    const undoPoint = await captureRecoveryPoint(
        `Undo point before restoring ${environmentName}`
    );
    const target = bookmark
        ? `--bookmark=${bookmark}`
        : `--timestamp=${restoreTimestamp}`;

    console.warn(`Undo bookmark: ${undoPoint.bookmark}`);
    run(npxCommand, [
        "wrangler",
        "d1",
        "time-travel",
        "restore",
        environment.databaseName,
        target,
        "--config",
        environment.configPath
    ]);

    await verifyDeployment();
    console.log("D1 restore completed and the application smoke test passed.");
}

async function rollbackWorker() {
    ensureEnvironment();
    ensureProductionConfirmation("ROLLBACK");
    const versionId = argument("--version");
    if (!versionId) {
        run(npxCommand, [
            "wrangler",
            "versions",
            "list",
            "--config",
            environment.configPath
        ]);
        fail("Choose a version and run again with --version <VERSION_ID>.");
    }
    if (!/^[0-9a-f-]{20,}$/i.test(versionId)) {
        fail("The Worker version ID is invalid.");
    }
    if (!hasFlag("--execute")) {
        fail("Rollback changes live traffic. Add --execute after reviewing the version.");
    }

    await verifyConfiguration();
    await captureRecoveryPoint(
        `D1 state when rolling ${environmentName} Worker back to ${versionId}`
    );
    run(npxCommand, [
        "wrangler",
        "rollback",
        versionId,
        "--config",
        environment.configPath,
        "--message",
        `Rollback ${environmentName} to ${versionId}`
    ]);
    await verifyDeployment();
    console.log("Worker rollback completed and verified. D1 was not modified.");
}

async function snapshotConfiguration() {
    ensureEnvironment();
    const configuration = await verifyConfiguration();
    const point = await captureRecoveryPoint("Manual configuration snapshot");
    console.log("Configuration inventory contains names and hashes only, never secret values.");
    console.log(`Snapshot: ${point.path}`);
    return configuration;
}

function usage() {
    console.log(`
NexoChess Cloudflare operations

Commands:
  deploy           Validate, test, capture D1 bookmark, deploy and verify.
  backup           Export D1 schema and data to .nexochess-backup/.
  recovery-point   Save the current D1 bookmark and non-secret config inventory.
  restore          Restore D1 by bookmark or timestamp; requires --execute.
  rollback         Roll back the Worker by version; requires --execute.
  verify-config    Validate Worker, D1, origin and secret names.
  monitor          Run the remote smoke test.

Required:
  --environment staging|production

Production confirmation:
  --confirm-production DEPLOY-NEXOCHESS-PRODUCTION
  --confirm-production BACKUP-NEXOCHESS-PRODUCTION
  --confirm-production RESTORE-NEXOCHESS-PRODUCTION
  --confirm-production ROLLBACK-NEXOCHESS-PRODUCTION
`);
}

try {
    ensureEnvironment();

    if (command === "deploy") await deploy();
    else if (command === "backup") await exportDatabase();
    else if (command === "recovery-point") {
        ensureProductionConfirmation("BACKUP");
        await captureRecoveryPoint("Manual recovery point");
    } else if (command === "restore") await restoreDatabase();
    else if (command === "rollback") await rollbackWorker();
    else if (command === "verify-config") {
        console.log(await verifyConfiguration());
    } else if (command === "snapshot-config") await snapshotConfiguration();
    else if (command === "monitor") await verifyDeployment();
    else {
        usage();
        process.exitCode = 1;
    }
} catch (error) {
    console.error(`\nOPERATIONS ERROR: ${error.message}`);
    process.exitCode = 1;
}
