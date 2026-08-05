# NexoChess deployment and recovery runbook

This is the single operational procedure for the Cloudflare deployment of NexoChess.
Do not deploy with ad-hoc Wrangler commands when the repository commands below are available.

```text
feature branch -> develop -> staging -> explicit approval -> master -> production
```

Production must never be deployed from `develop`, and staging must never be deployed from
`master`.

## Operating principles

- `develop` is the only branch allowed to deploy `nexochess-staging`.
- `master` is the only branch allowed to deploy `nexochess-production`.
- Every deployment runs repository checks and a full Cloudflare build.
- Every deployment captures a D1 Time Travel bookmark before changing the Worker.
- Every deployment runs a remote smoke test after publishing.
- Worker rollback and D1 restore are separate operations.
- Operational records and SQL exports live in `.nexochess-backup/` and must never commit to Git.
- Secret values must never appear in the repository, deployment records, screenshots or chat.
- On Windows, operations must be launched through the npm scripts. They preload the portable
  command shim that runs npm and Wrangler through Node instead of invoking `.cmd` files
  directly.

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

The operations command validates only their names. Cloudflare does not expose their values
after creation.

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
5. Verifies pages, security headers, authentication, API behaviour and puzzle data.
6. Saves the Worker version and recovery-point path locally.

Local records are stored under:

```text
.nexochess-backup/recovery-points/staging/
.nexochess-backup/deployments/staging/
```

## Automated staging deployment

`.github/workflows/deploy-staging.yml` can deploy an accepted push to `develop` without the
developer computer. It remains disabled until the repository variable below is enabled:

```text
ENABLE_STAGING_DEPLOY=true
```

The `staging` GitHub environment must contain scoped values for:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

Use a limited API token, never the Cloudflare Global API Key.

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

The command refuses to run from any branch other than `master` and refuses production
without the exact confirmation phrase.

If `wrangler.production.local.jsonc` does not exist, expose the production D1 identifier only
in the local process environment before running the command:

```powershell
$env:NEXOCHESS_PRODUCTION_D1_ID="<production-d1-id>"
```

The generated file is local-only and ignored by Git.

## D1 automatic protection

Cloudflare D1 Time Travel is the primary short-term point-in-time recovery mechanism. It can
restore a database to a timestamp or bookmark within the retention period available on the
Cloudflare plan.

Capture a recovery point without deploying:

```powershell
npm run recovery:staging
npm run recovery:production -- --confirm-production BACKUP-NEXOCHESS-PRODUCTION
```

A recovery-point record contains the bookmark, timestamp, Git branch and commit, Worker and
D1 names, configuration hash and required secret names. It never contains secret values.

## Full D1 export

A full SQL export is useful for encrypted offline custody beyond the Time Travel retention
window. Export can temporarily block D1 requests, so run it during low traffic.

```powershell
npm run backup:d1:staging
npm run backup:d1:production -- --confirm-production BACKUP-NEXOCHESS-PRODUCTION
```

Exports and SHA-256 metadata are written under:

```text
.nexochess-backup/d1/<environment>/
```

SQL exports can contain accounts, Archive data and other personal data. Store long-term
copies on encrypted storage. Never commit, email or attach an unencrypted export.

## D1 recovery

A restore overwrites the selected D1 database in place. Review the bookmark or timestamp
before execution. Omitting `--execute` intentionally fails safely.

Restore staging by bookmark:

```powershell
npm run restore:d1:staging -- --bookmark <bookmark> --execute
```

Restore staging by RFC3339 timestamp:

```powershell
npm run restore:d1:staging -- --timestamp 2026-08-05T08:30:00Z --execute
```

Production additionally requires the explicit phrase:

```powershell
npm run restore:d1:production -- `
  --bookmark <bookmark> `
  --execute `
  --confirm-production RESTORE-NEXOCHESS-PRODUCTION
```

Before restoring, the command captures the current bookmark as an undo point. After the
restore, the remote smoke test must pass.

## Worker rollback

A Worker rollback changes code and bindings but does not restore D1 data. Review the recent
versions, choose the exact version ID and then run:

```powershell
npm run rollback:staging -- --version <version-id> --execute
```

Production additionally requires:

```powershell
npm run rollback:production -- `
  --version <version-id> `
  --execute `
  --confirm-production ROLLBACK-NEXOCHESS-PRODUCTION
```

The command records the current D1 bookmark, rolls the Worker back and runs the remote smoke
test. When an old Worker expects a different database schema, coordinate the code rollback
with a separately reviewed D1 restore.

## Configuration custody

Create a non-secret configuration snapshot with:

```powershell
npm run config:staging
npm run config:production
```

Keep actual credentials in a password manager under separate staging and production entries.
The secure inventory should contain:

```text
Cloudflare account ID
Cloudflare scoped API token
AUTH_SECRET
Google OAuth client ID and secret
Brevo API key
Production D1 database ID
Recovery contact and ownership details
```

Maintain at least two independent encrypted copies. Repository files, GitHub issues, terminal
screenshots and chat are not a password manager.

## Monitoring

Run the complete remote smoke test at any time:

```powershell
npm run monitor:staging
npm run monitor:production
```

The monitor checks the main HTML applications, JavaScript delivery, defensive headers,
anonymous Better Auth behaviour, protected API isolation, malformed public API routes and the
complete puzzle catalogue. A deployment is not successful until this test passes.

## Incident sequence

When a deployment fails:

1. Stop further deployments.
2. Record the failing Worker version, Git commit and D1 bookmark.
3. Determine whether the fault is code, configuration or data.
4. Roll back only the Worker when data is healthy.
5. Restore D1 only when the data itself is damaged or incompatible.
6. Run the remote monitor.
7. Document the incident and the exact recovery point used.

Do not delete Workers, D1 databases, bindings, DNS records or OAuth clients as a rollback
strategy.

## Official references

- D1 Time Travel: https://developers.cloudflare.com/d1/reference/time-travel/
- D1 import and export: https://developers.cloudflare.com/d1/best-practices/import-export-data/
- Worker versions and deployments: https://developers.cloudflare.com/workers/versions-and-deployments/
- Worker rollbacks: https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/
- Node.js child processes on Windows: https://nodejs.org/api/child_process.html
- npm exec and npx: https://docs.npmjs.com/cli/commands/npx/
