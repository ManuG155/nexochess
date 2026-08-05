# NexoChess deployment and recovery runbook

This is the single operational procedure for the Cloudflare deployment of NexoChess.
Do not deploy with ad-hoc Wrangler commands when the commands below are available.

The current release flow is:

```text
feature branch -> develop -> staging -> explicit approval -> master -> production
```

Production must never be deployed from `develop`, and staging must never be deployed
from `master`.

## Operating principles

- `develop` is the only branch allowed to deploy `nexochess-staging`.
- `master` is the only branch allowed to deploy `nexochess-production`.
- Every deployment runs repository checks and a full Cloudflare build.
- Every deployment captures a D1 Time Travel bookmark before changing the Worker.
- Every deployment runs a remote smoke test after publishing.
- Worker rollback and D1 restore are separate operations.
- Operational records and SQL exports live in `.nexochess-backup/` and must never commit to Git.
- Secret values must never appear in the repository, deployment records, screenshots or chat.

## Prerequisites

Install dependencies and authenticate Wrangler:

```powershell
npm ci
npx wrangler whoami
```

The selected Worker must contain these encrypted secrets:

```text
AUTH_SECRET
BREVO_API_KEY
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
```

The operations command validates only their names. Cloudflare does not expose the secret
values after creation.

## Staging deployment

Run from the `nexochess-develop` worktree:

```powershell
cd C:\Users\manue\OneDrive\Documentos\proyectos\chess\nexochess-develop
git checkout develop
git pull --ff-only
git status
npm run deploy:staging
```

The command stops if the branch is not `develop`, the repository is dirty, the Wrangler
configuration is inconsistent, or a required Worker secret is missing. It then:

1. Runs the complete repository check.
2. Builds the staging assets.
3. Saves the current D1 Time Travel bookmark and non-secret configuration inventory.
4. Deploys the Worker with the Git commit as its message and tag.
5. Verifies pages, security headers, authentication, protected API behaviour and puzzle data.
6. Saves the Worker version and recovery-point path locally.

Local records are stored under:

```text
.nexochess-backup/recovery-points/staging/
.nexochess-backup/deployments/staging/
```

## Automated staging deployment

`.github/workflows/deploy-staging.yml` can deploy every accepted push to `develop` without
using the developer computer. It is disabled by default.

Create these GitHub Actions secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

The API token should have only the permissions required to deploy the staging Worker, read
its secrets and read the staging D1 Time Travel bookmark. Do not use the Global API Key.

Then create this repository variable:

```text
ENABLE_STAGING_DEPLOY=true
```

Until that variable is enabled, pushes to `develop` do not deploy. The workflow can also be
started manually with `workflow_dispatch`.

## Production release

Production remains a manual, explicitly approved operation. Run only from the `master`
worktree after staging has been accepted and the release PR has been merged:

```powershell
cd C:\Users\manue\OneDrive\Documentos\proyectos\chess\wintrchess
git checkout master
git pull --ff-only
git status
npm run deploy:production -- --confirm-production DEPLOY-NEXOCHESS-PRODUCTION
```

The command refuses to run from any branch other than `master`. It also refuses production
without the exact confirmation phrase.

If `wrangler.production.local.jsonc` does not exist, provide the production D1 identifier in
the local environment before running the command:

```powershell
$env:NEXOCHESS_PRODUCTION_D1_ID="<production-d1-id>"
```

The generated file is local-only and is ignored by Git.

## D1 automatic protection

Cloudflare D1 Time Travel is the primary short-term backup and point-in-time recovery
mechanism. It is always enabled on supported production D1 databases. It allows restoring
the database to a timestamp or bookmark within the retention period supplied by the
Cloudflare plan.

Capture an additional named local recovery point without deploying:

```powershell
npm run recovery:staging
```

For production:

```powershell
npm run recovery:production -- --confirm-production BACKUP-NEXOCHESS-PRODUCTION
```

A recovery-point record contains:

- the D1 bookmark;
- the timestamp;
- the Git branch and commit;
- the Worker and D1 names;
- the configuration hash;
- required secret names, never values.

## Full D1 export

A full SQL export is useful for offline custody or testing beyond the Time Travel retention
window. Export can temporarily block requests to D1, so run it during low traffic and do not
make it part of every deployment.

Staging:

```powershell
npm run backup:d1:staging
```

Production:

```powershell
npm run backup:d1:production -- --confirm-production BACKUP-NEXOCHESS-PRODUCTION
```

The export and a SHA-256 metadata file are written to:

```text
.nexochess-backup/d1/<environment>/
```

SQL exports can contain account and Archive data. Move long-term copies to an encrypted
volume or encrypted backup service. Never commit, email or attach an unencrypted export.

## D1 recovery

A restore overwrites the selected D1 database in place. Review the target timestamp or
bookmark before execution.

Previewing the command without `--execute` intentionally fails safely. To restore staging by
bookmark:

```powershell
node scripts/cloudflare-operations.mjs restore `
  --environment staging `
  --bookmark <bookmark> `
  --execute
```

To restore by RFC3339 timestamp:

```powershell
node scripts/cloudflare-operations.mjs restore `
  --environment staging `
  --timestamp 2026-08-05T08:30:00Z `
  --execute
```

Production additionally requires:

```text
--confirm-production RESTORE-NEXOCHESS-PRODUCTION
```

Before restoring, the command captures the current bookmark as an undo point. Wrangler then
asks for its own destructive-operation confirmation. After restoration, the remote smoke test
must pass. Keep the undo bookmark printed by both NexoChess and Wrangler.

## Worker rollback

A Worker rollback changes code and bindings but does not restore D1 data. Review recent
versions first:

```powershell
npx wrangler versions list --config .\wrangler.jsonc
```

Rollback staging:

```powershell
node scripts/cloudflare-operations.mjs rollback `
  --environment staging `
  --version <version-id> `
  --execute
```

Production additionally requires:

```text
--confirm-production ROLLBACK-NEXOCHESS-PRODUCTION
```

The command records the current D1 bookmark, performs the Worker rollback and runs the remote
smoke test. If the old Worker expects a different database schema, coordinate the Worker
rollback with a separately reviewed D1 restore.

## Configuration custody

Create a non-secret configuration snapshot:

```powershell
npm run config:staging
```

The snapshot stores configuration names, hashes, Git information and the current D1
bookmark. It never stores secret values.

Keep the actual secret values in a password manager under separate staging and production
entries. The secure inventory should contain:

```text
Cloudflare account ID
Cloudflare scoped API token
AUTH_SECRET
Google OAuth client ID and secret
Brevo API key
Production D1 database ID
Recovery contact and ownership details
```

At least two independent encrypted copies should exist. Repository files, GitHub issues,
terminal screenshots and chat are not a password manager.

## Monitoring

Run the full remote smoke test at any time:

```powershell
npm run monitor:staging
npm run monitor:production
```

The monitor checks:

- the main HTML applications;
- JavaScript delivery;
- defensive HTTP headers;
- anonymous Better Auth behaviour;
- protected API isolation;
- malformed and unknown public API routes;
- the complete puzzle catalogue.

The staging deployment workflow executes the same monitor after publishing. A deployment is
not considered successful until this smoke test passes.

## Incident sequence

When a deployment fails:

1. Stop further deployments.
2. Record the failing Worker version, Git commit and D1 bookmark.
3. Determine whether the fault is code, configuration or data.
4. Roll back only the Worker when data is healthy.
5. Restore D1 only when data itself is damaged or incompatible.
6. Run the remote monitor.
7. Document the incident and the exact recovery point used.

Do not delete Workers, D1 databases, bindings, DNS records or OAuth clients as a rollback
strategy.

## Official references

- D1 Time Travel: https://developers.cloudflare.com/d1/reference/time-travel/
- D1 import and export: https://developers.cloudflare.com/d1/best-practices/import-export-data/
- Worker versions and deployments: https://developers.cloudflare.com/workers/versions-and-deployments/
- Worker rollbacks: https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/
