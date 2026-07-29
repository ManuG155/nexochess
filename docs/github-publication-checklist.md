# GitHub publication checklist

This checklist is for the first public NexoChess repository.

## 1. Preserve the upstream relationship

Keep the existing WintrChess history when possible. The expected remotes are:

```text
origin   your public NexoChess repository
upstream https://github.com/WintrCat/wintrchess.git
```

Do not rewrite authorship to imply that the upstream code was created by NexoChess.

## 2. Clean local artefacts

Preview the cleanup:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\prepare-public-repository.ps1
```

Apply it only after reviewing the list:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\prepare-public-repository.ps1 -Apply
```

The script moves known ZIP files, patches and review copies to a timestamped backup folder outside the repository. It does not delete them.

## 3. Audit the repository

```powershell
npm run check:translations
npm run check:repository
npm run check -w client
npm run check -w server
npm run build
```

Also run:

```powershell
git status
git ls-files .env
git log --all -- .env
```

The real `.env` must never be tracked.

## 4. Rotate exposed credentials

Before the first public push and before production deployment, rotate:

- `AUTH_SECRET`;
- the exposed Google OAuth client secret;
- the Brevo SMTP key used for production;
- any internal administration password;
- any database credentials that have been shared or reused.

Use separate Google OAuth clients and SMTP keys for local development and production.

## 5. Public repository settings

Enable:

- dependency graph;
- Dependabot alerts and security updates;
- secret scanning and push protection where available;
- CodeQL code scanning;
- a `main` branch ruleset requiring the CI status check;
- protection against force pushes and branch deletion.

Do not require an external approval while the repository has only one maintainer, or the maintainer may be unable to merge their own pull requests.

## 6. Repository metadata

Recommended values:

```text
Name: nexochess
Description: Free, multilingual chess game analysis powered by Stockfish 17.
Website: https://www.nexochess.com
Topics: chess, stockfish, game-analysis, typescript, react, open-source
License: GPL-3.0
```

## 7. Source-code link

Set the production environment variable after the repository exists:

```env
SOURCE_CODE_URL=https://github.com/YOUR_USERNAME/nexochess
```

The deployed version must point to the corresponding NexoChess source, not only to the WintrChess upstream repository.

## 8. First release

Create the first pre-release only after CI passes and the deployment has been tested:

```text
v0.9.0-beta.1
```

Attach release notes describing known limitations, supported browsers and the upstream GPL attribution.
