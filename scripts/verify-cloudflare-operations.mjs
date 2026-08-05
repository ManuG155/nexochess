import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const operations = await readFile(
    resolve("scripts", "cloudflare-operations.mjs"),
    "utf8"
);
const verifier = await readFile(
    resolve("scripts", "verify-cloudflare-deployment.mjs"),
    "utf8"
);
const packageJson = JSON.parse(await readFile(resolve("package.json"), "utf8"));
const gitignore = await readFile(resolve(".gitignore"), "utf8");
const runbook = await readFile(
    resolve("docs", "operations", "DEPLOYMENT_AND_RECOVERY.md"),
    "utf8"
);
const workflow = await readFile(
    resolve(".github", "workflows", "deploy-staging.yml"),
    "utf8"
);

for (const fragment of [
    "ensureCleanRepository",
    "ensureBranch",
    "captureRecoveryPoint",
    "time-travel",
    "verifyConfiguration",
    "REQUIRED_SECRETS",
    "--confirm-production",
    "DEPLOY-NEXOCHESS-PRODUCTION",
    "RESTORE-NEXOCHESS-PRODUCTION",
    "ROLLBACK-NEXOCHESS-PRODUCTION",
    "--execute",
    ".nexochess-backup",
    "verify-cloudflare-deployment.mjs"
]) {
    assert.ok(
        operations.includes(fragment),
        `Operations safety control is missing: ${fragment}`
    );
}

assert.ok(
    operations.indexOf("captureRecoveryPoint(")
        < operations.indexOf('"wrangler",\n        "deploy"'),
    "A D1 recovery point must be captured before Worker deployment."
);
assert.ok(
    operations.includes("Worker rollback completed and verified. D1 was not modified."),
    "The Worker/D1 rollback distinction must remain explicit."
);
assert.ok(
    operations.includes("D1 export can temporarily block database requests"),
    "D1 export downtime warning is missing."
);

for (const fragment of [
    "frame-ancestors 'none'",
    "x-content-type-options",
    "/auth/account/get-session",
    "/api/account/profile",
    "/api/public/profile/%E0%A4%A",
    "EXPECTED_PUZZLES",
    "AbortSignal.timeout"
]) {
    assert.ok(
        verifier.includes(fragment),
        `Deployment smoke test is missing: ${fragment}`
    );
}

for (const script of [
    "deploy:staging",
    "deploy:production",
    "backup:d1:staging",
    "backup:d1:production",
    "recovery:staging",
    "recovery:production",
    "config:staging",
    "config:production",
    "monitor:staging",
    "monitor:production",
    "verify:operations"
]) {
    assert.equal(
        typeof packageJson.scripts?.[script],
        "string",
        `Missing package script: ${script}`
    );
}

assert.ok(
    packageJson.scripts.check.includes("verify:operations"),
    "The operations verification must run as part of npm run check."
);
assert.match(gitignore, /^\/\.nexochess-backup\/$/m);

for (const heading of [
    "# NexoChess deployment and recovery runbook",
    "## Staging deployment",
    "## Production release",
    "## D1 recovery",
    "## Worker rollback",
    "## Configuration custody",
    "## Monitoring"
]) {
    assert.ok(runbook.includes(heading), `Runbook section is missing: ${heading}`);
}
assert.ok(runbook.includes("Time Travel"));
assert.ok(runbook.includes("password manager"));
assert.ok(runbook.includes("never commit"));

assert.ok(workflow.includes("branches: [develop]"));
assert.ok(workflow.includes("ENABLE_STAGING_DEPLOY"));
assert.ok(workflow.includes("CLOUDFLARE_API_TOKEN"));
assert.ok(workflow.includes("CLOUDFLARE_ACCOUNT_ID"));
assert.ok(workflow.includes("deploy --environment staging --ci"));
assert.ok(!workflow.includes("production"));

console.log("Cloudflare deployment and recovery verification passed.");
