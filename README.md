# NexoChess

[![CI](https://github.com/ManuG155/nexochess/actions/workflows/ci.yml/badge.svg)](https://github.com/ManuG155/nexochess/actions/workflows/ci.yml)
[![CodeQL](https://github.com/ManuG155/nexochess/actions/workflows/codeql.yml/badge.svg)](https://github.com/ManuG155/nexochess/actions/workflows/codeql.yml)
[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)

**NexoChess** is a free web application for analysing chess games, reviewing mistakes with Stockfish, training with puzzles and tracking progress.

- Public website: **https://www.nexochess.com**
- Source code: **https://github.com/ManuG155/nexochess**
- Contact: **contact@nexochess.com**

NexoChess is an independent project. It is not affiliated with, sponsored by or endorsed by Chess.com or lichess.org.

## Environments and branches

| Environment | Branch | Address | Purpose |
| --- | --- | --- | --- |
| Production | `master` | https://www.nexochess.com | Public and explicitly approved releases |
| Staging | `develop` | https://nexochess-staging.manuel-garcia-villaescusa.workers.dev | Integration and validation before production |

A change merged into `develop` does not alter the public website. Production changes require a reviewed promotion to `master` and a separate authorised Cloudflare deployment.

NexoChess no longer depends on a persistent application running on `localhost` or on the developer's computer. Local commands are used for installation, checks and builds; application validation is performed against the hosted staging environment.

## Main features

- PGN import and Chess.com game import.
- In-browser Stockfish analysis.
- Evaluation, move classification, accuracy and estimated playing strength.
- Game summary and move-by-move review.
- Four selectable coaches with translated feedback.
- Local Archive without an account and cloud synchronisation for signed-in users.
- Google OAuth and email/password accounts.
- Email verification and password recovery.
- Public profiles and shareable analysed games.
- Puzzles generated from analysed mistakes.
- Thematic and difficulty-filtered puzzle training.
- Puzzle progress, streaks and rating.
- Light and dark appearance.
- Support for 11 interface languages.
- Terms, privacy, licence, help and contact pages.

The complete open puzzle catalogue contains **6,057,356 positions** and is distributed independently from the main application bundle.

## Hosted architecture

The public application runs primarily on Cloudflare:

```text
Browser
├── React + TypeScript interface
├── Stockfish.js + WebAssembly analysis
└── Same-origin application and API requests

Cloudflare
├── Worker routing and HTTP responses
├── Workers Static Assets
├── Better Auth
├── D1: accounts, sessions, Archive and puzzle progress
└── Separate static puzzle-data Workers
```

### Main technologies

- React
- TypeScript
- Webpack
- CSS Modules and global CSS
- i18next
- chess.js
- Stockfish.js 17
- Cloudflare Workers and Static Assets
- Cloudflare D1
- Better Auth
- Google OAuth
- Brevo transactional email

The repository still contains a Node/Express workspace for shared tooling and historical compatibility, but the hosted application does not require the old local server to remain online.

## Repository structure

```text
client/                 Browser application and public assets
cloudflare/             Worker, authentication, API and email integration
server/                 Server workspace and supporting tooling
shared/                 Shared chess analysis and reporting logic
scripts/                Build, verification, import and deployment utilities
puzzle-data-worker/     Static puzzle catalogue Worker
legal/                  Licence and corresponding-source notices
```

The complete puzzle database, generated static puzzle packages, D1 exports, local production configuration and secret files are intentionally excluded from Git.

## Requirements

- Node.js 22
- npm
- Git
- Wrangler authentication for Cloudflare operations

Install dependencies:

```bash
npm ci
```

Run repository checks:

```bash
npm run check
```

Build all workspaces:

```bash
npm run build
```

Prepare the staging Cloudflare bundle without deploying:

```bash
npm run build:cloudflare
```

Prepare the production bundle without deploying:

```bash
npm run build:cloudflare:production
```

The repository does not define `localhost` as an official NexoChess environment.

## Development workflow

Normal development follows this sequence:

```text
work branch
→ pull request to develop
→ CI and CodeQL
→ merge into develop
→ staging validation
→ explicit release approval
→ promotion to master
→ production deployment
```

Repository rules:

- Do not push feature work directly to `master`.
- Do not deploy production from `develop`.
- Do not mix staging and production databases or credentials.
- Do not commit `.env`, secret values, D1 exports or generated puzzle packages.
- Delete temporary branches when their pull request is merged or discarded.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution requirements. The latest integration and operations work is maintained on the [`develop`](https://github.com/ManuG155/nexochess/tree/develop) branch until the next authorised production release.

## Configuration and secrets

Worker secrets are stored by Cloudflare and must never be committed. Expected names include:

```text
AUTH_SECRET
BREVO_API_KEY
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
```

Only secret names belong in documentation. Values must remain in the appropriate password manager and platform secret stores.

Relevant files:

- `.env.example` documents supported variables without real credentials.
- `wrangler.jsonc` configures staging.
- `wrangler.production.local.jsonc` is generated locally for production and ignored by Git.

## Security

The repository includes:

- GitHub Actions CI.
- CodeQL analysis.
- Translation and repository-content audits.
- Dependency auditing and Dependabot.
- Cloudflare Worker dry-run builds for staging and production.
- Public security reporting guidance.

Sensitive reports should follow [SECURITY.md](SECURITY.md), rather than being posted in a public issue.

## Puzzle data

NexoChess uses the open lichess.org puzzle database under **CC0 1.0**. The positions are exported into compact static packages and indexes so the browser loads only the catalogue, the required filter index and the selected puzzle package.

The generated multi-million-position dataset is not stored in this repository.

## Licence and attribution

NexoChess is distributed under the **GNU General Public License v3.0**.

- [GPL-3.0 licence](LICENSE)
- [Attributions](ATTRIBUTIONS.md)
- [Stockfish corresponding-source notice](legal/STOCKFISH-SOURCE.txt)

NexoChess is based on and substantially modifies the GPL-licensed WintrChess project. Stockfish remains licensed under GPL-3.0. Third-party resources and puzzle-data terms are documented in the attribution files and in the application's source and licence page.

## Contact

For support, privacy requests, legal questions or responsible security contact:

**contact@nexochess.com**
