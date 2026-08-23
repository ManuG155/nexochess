# NexoChess

[![CI](https://github.com/ManuG155/nexochess/actions/workflows/ci.yml/badge.svg)](https://github.com/ManuG155/nexochess/actions/workflows/ci.yml)
[![CodeQL](https://github.com/ManuG155/nexochess/actions/workflows/codeql.yml/badge.svg)](https://github.com/ManuG155/nexochess/actions/workflows/codeql.yml)
[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)
![Release](https://img.shields.io/badge/release-v1.4-4f8fe8.svg)

**NexoChess** is a free, open-source chess learning and analysis web application with Stockfish-powered game review, guided lessons, endgame training, play against Stockfish, opening repertoires, puzzle training, historical statistics and personalised training guidance. It works without an account and is designed for desktop, tablet and mobile.

- Public website: **https://www.nexochess.com**
- Source code: **https://github.com/ManuG155/nexochess**
- Current release: **[v1.4](docs/releases/v1.4.md)**
- Contact: **contact@nexochess.com**

NexoChess is an independent project. It is not affiliated with, sponsored by or endorsed by Chess.com or lichess.org.

## Current release — v1.4

NexoChess v1.4 connects individual game review with historical diagnosis and targeted training, while adding a dedicated Statistics center, an Endgame Laboratory and an optional guided tour of the platform.

Highlights:

- **Statistics:** a first-class section with game/time filters, accuracy evolution, White/Black comparison, errors by phase, opening performance, puzzle/training data and a gallery of brilliant moves linked to their exact archived positions.
- **Conclusions:** each analysed game can identify its decisive moment, most important error or pattern and a concrete recommendation, with direct jumps back to the relevant review position.
- **Automatic training plan:** Archive detects recurring weaknesses conservatively across recent analysed games and turns them into short actionable training tasks.
- **Endgame Laboratory:** 72 playable fundamental, intermediate and advanced positions, exact tablebase W/D/L feedback where supported, custom FEN loading, hints, retry and mastery by theme.
- **Repertoire redesign:** a faster compact decision tree with progressive expansion, move popularity, transpositions, search, fullscreen study and semantic zoom for large opening courses.
- **Stricter Analysis feedback:** tactical explanations follow engine lines more consistently and Brilliant is reserved for genuine sound sacrifices or exceptional drawing resources rather than ordinary pawn sacrifices.
- **Guided tutorial:** an optional fixed-`?` tour briefly explains the main sections and controls without forcing the user to navigate away.
- **Performance-first loading:** Statistics details, Endgame Laboratory packs and other heavier features are loaded progressively or lazily rather than inflating every initial page load.

See the complete [v1.4 release notes](docs/releases/v1.4.md).

## Project status

NexoChess uses two long-lived branches with deliberately different roles:

- `master` contains explicitly approved public releases.
- `develop` is used for integration, validation and subsequent development work.

A release promotion aligns `master` with the tested `develop` commit without removing `develop`. New work then continues on `develop` through normal pull requests.

The project no longer depends on a persistent application running on `localhost` or on the developer's computer. Local commands are used for installation, checks and builds; release validation is performed before production promotion.

## Main features

- PGN and FEN import plus public Chess.com and Lichess game import.
- In-browser analysis using Stockfish 17.
- Evaluation, move classification, accuracy and estimated playing strength.
- Game summary, move-by-move review and deterministic per-game Conclusions.
- Interactive tactical explanations and playable alternative engine lines.
- Selective teaching arrows for important tactical and strategic ideas.
- Four selectable coaches with translated feedback.
- 80 guided playable Lessons.
- Endgame Laboratory with fundamental, intermediate and advanced practice, tablebase feedback and custom FEN loading.
- Duel mode against Stockfish with selectable Elo, live feedback and saved unfinished games.
- Local Archive without an account and cloud synchronisation for signed-in users.
- Automatic training plans derived from repeated weaknesses in analysed games.
- Dedicated Statistics center for game, opening, puzzle and training history.
- Brilliant-move gallery linked to the exact archived game and move.
- Google OAuth and email/password accounts.
- Verification, password recovery and account email flows.
- Public profiles and shareable analysed games.
- Repertoire tools for creating or importing opening lines, studying compact decision trees and practising guided opening courses.
- Puzzles generated from analysed mistakes, misses and blunders.
- Thematic puzzle training with multi-theme and difficulty filters.
- Puzzle rating, attempts and streak tracking.
- Optional contextual tutorial explaining the main NexoChess sections and controls.
- Responsive desktop, tablet and mobile layouts with touch-friendly controls.
- Light and dark appearance.
- Interface support for 11 languages.
- Legal, privacy, licence, help and contact pages.

The open puzzle catalogue currently contains **6,057,356 positions** and is distributed separately from the main application bundle.

## Current architecture

NexoChess is deployed primarily on Cloudflare:

```text
Browser
├── React + TypeScript interface
├── Stockfish.js + WebAssembly analysis
└── Relative application and API requests

Cloudflare
├── Worker routing and security headers
├── Workers Static Assets
├── Better Auth
├── D1: accounts, sessions, Archive and puzzle progress
└── Separate static puzzle-data Workers
```

### Application

- React
- TypeScript
- CSS Modules and global CSS
- Webpack
- i18next
- chess.js
- Stockfish.js 17

### Cloud services

- Cloudflare Workers
- Cloudflare Workers Static Assets
- Cloudflare D1
- Better Auth
- Google OAuth
- Brevo transactional email

The legacy Node/Express workspace remains in the repository for compatibility and shared tooling, but the hosted NexoChess application does not require the old local server to remain online.

## Repository layout

```text
client/                 React application, public assets and browser integrations
cloudflare/             Worker, authentication, API and email integration
config/                 Shared environment and canonical-domain configuration
server/                 Legacy/server workspace and supporting tooling
shared/                 Shared chess analysis and reporting logic
scripts/                Build, verification, import and operational scripts
puzzle-data-worker/     Static puzzle catalogue Worker configuration
docs/operations/        Deployment, recovery and canonical-domain runbooks
docs/releases/          Release notes and release-level documentation
legal/                  Corresponding-source and licence notices
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

Run the complete repository verification:

```bash
npm run check
```

Build every workspace:

```bash
npm run build
```

Prepare the Cloudflare staging bundle without deploying it:

```bash
npm run build:cloudflare
```

## Development workflow

All normal work follows this sequence:

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

Rules:

- Do not push feature work directly to `master`.
- Do not deploy production from `develop`.
- Do not mix staging and production credentials or databases.
- Do not commit `.env`, Wrangler secrets, database exports or generated puzzle packages.
- Delete temporary branches after their pull request is merged or discarded.
- GitHub Actions removes merged and explicitly obsolete remote branches while preserving `master`, `develop` and every branch with an open pull request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution requirements.

## Staging operations

After authenticating Wrangler and configuring the required staging secrets, the controlled deployment command is:

```bash
npm run deploy:staging
```

This command verifies the branch and repository state, runs checks, builds the application, records a D1 recovery point, deploys staging and performs a remote smoke test.

Useful non-deployment checks:

```bash
npm run monitor:staging
npm run recovery:staging
npm run verify:canonical
npm run verify:security
npm run verify:public-api
```

Production deployment is intentionally separate, restricted to `master` and protected by an explicit confirmation phrase. See [the deployment and recovery runbook](docs/operations/DEPLOYMENT_AND_RECOVERY.md).

## Configuration and secrets

Worker secrets are stored in Cloudflare and must never be committed. Expected secret names are:

```text
AUTH_SECRET
BREVO_API_KEY
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
```

Only the names belong in documentation. Secret values must remain in the appropriate password manager and platform secret stores.

Environment templates and generated local configuration:

- `.env.example` documents supported local variables without real credentials.
- `wrangler.jsonc` configures staging.
- `wrangler.production.local.jsonc` is generated locally for production and is ignored by Git.

## Security and recovery

The repository includes:

- CI and CodeQL checks.
- Dependency auditing.
- Detection of committed credential patterns.
- Defensive HTTP headers.
- Same-origin and content-type validation for API mutations.
- Better Auth rate limiting.
- Public API and D1 user-isolation tests.
- D1 Time Travel recovery-point handling.
- Worker rollback and remote smoke-test tooling.

Security reports should follow [SECURITY.md](SECURITY.md), not public issues containing sensitive details.

Operational documentation:

- [Deployment and recovery](docs/operations/DEPLOYMENT_AND_RECOVERY.md)
- [Canonical domain](docs/operations/CANONICAL_DOMAIN.md)

## Puzzle data

NexoChess uses the open lichess.org puzzle database under **CC0 1.0**. The data is exported into compact static packages and indexes so the browser loads only the catalogue, the required filter index and the selected puzzle package.

The generated multi-million-position dataset is not stored in this Git repository.

## Licensing and attribution

NexoChess is distributed under the **GNU General Public License v3.0**.

Important notices:

- [GPL-3.0 licence](LICENSE)
- [Attributions](ATTRIBUTIONS.md)
- [Stockfish corresponding-source notice](legal/STOCKFISH-SOURCE.txt)

NexoChess is based on and substantially modifies the GPL-licensed WintrChess project. Stockfish remains licensed under GPL-3.0. Third-party resources and puzzle-data terms are documented in the attribution files and in the application's source/licence page.

## Contact

For support, privacy requests, legal questions or responsible security contact:

**contact@nexochess.com**
