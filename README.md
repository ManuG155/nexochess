# NexoChess

[![CI](https://github.com/ManuG155/nexochess/actions/workflows/ci.yml/badge.svg)](https://github.com/ManuG155/nexochess/actions/workflows/ci.yml)
[![CodeQL](https://github.com/ManuG155/nexochess/actions/workflows/codeql.yml/badge.svg)](https://github.com/ManuG155/nexochess/actions/workflows/codeql.yml)
[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)
![Release](https://img.shields.io/badge/release-v1.4-4f8fe8.svg)

**NexoChess** is a free, open-source chess learning and analysis platform. It combines Stockfish-powered game review with guided lessons, endgame training, puzzle practice, opening repertoires, play against Stockfish, historical statistics and personalised training guidance. The main product works without an account; signing in adds cloud persistence and account-specific data.

- Website: **https://www.nexochess.com**
- Source: **https://github.com/ManuG155/nexochess**
- Release line: **[v1.4](docs/releases/v1.4.md)**
- Release history: **[docs/releases](docs/releases/README.md)**
- Contact: **contact@nexochess.com**

NexoChess is an independent project. It is not affiliated with, sponsored by or endorsed by Chess.com, Lichess, Stockfish or any other third-party service mentioned by the application.

## NexoChess v1.4

v1.4 connects individual game review with historical diagnosis and targeted training. It also adds a dedicated Statistics center, the Endgame Laboratory and a contextual tutorial while keeping heavy datasets and optional tools progressively loaded.

Highlights:

- **Statistics:** first-class historical analysis with game/time filters, accuracy evolution, White/Black comparison, errors by phase, opening performance, puzzle/training summaries and a Brilliant-move gallery linked to exact archived positions.
- **Conclusions:** deterministic per-game takeaways identify the decisive moment, the most important error/pattern and a concrete training recommendation, with direct jumps back to the relevant review position.
- **Automatic training plan:** Archive detects recurring weaknesses conservatively across recent analysed games and turns them into actionable tasks.
- **Endgame Laboratory:** 72 playable fundamental, intermediate and advanced positions, exact tablebase W/D/L feedback where supported, custom FEN loading, hints, retry and mastery by theme.
- **Repertoire:** compact study trees with progressive expansion, transpositions, search, move popularity, fullscreen study and semantic zoom for large opening courses.
- **Stricter Analysis feedback:** tactical explanations follow engine lines more consistently and Brilliant is reserved for genuine sound sacrifices or exceptional drawing resources rather than ordinary pawn sacrifices.
- **Guided tutorial:** an optional fixed-`?` tour explains the main areas and controls without forcing users to navigate away from their current section.
- **Performance-first loading:** Statistics details, Endgame Laboratory packs, the tutorial and the multi-million-position puzzle catalogue are not all downloaded at initial page load.

See the complete **[v1.4 release notes](docs/releases/v1.4.md)**.

## Product map

| Area | Purpose |
| --- | --- |
| **Academy** | Entry point for structured learning resources and the educational side of NexoChess. |
| **Lessons** | 80 guided, playable lessons plus access to the Endgame Laboratory. |
| **Analysis** | Import a PGN, FEN or supported public game, run Stockfish 17, review every move and extract deterministic Conclusions. |
| **Duel** | Play directly against Stockfish at selectable Elo levels with live feedback and saved unfinished games. |
| **Archive** | Store analysed games and generate an automatic training plan from repeated weaknesses. |
| **Statistics** | Aggregate recent or historical performance: accuracy, errors, phases, colours, openings, puzzles, training and Brilliant moves. |
| **Puzzles** | Train thematic positions or positions generated from mistakes, misses and blunders found in analysed games. |
| **Repertoire** | Build/import opening lines, study large opening trees and practise guided opening courses. |

The contextual `?` tutorial explains these areas inside the product. Repertoire keeps its own specialised tutorial.

## Main capabilities

### Analysis and review

- PGN and FEN import plus public Chess.com and Lichess game import.
- In-browser analysis using Stockfish 17.
- Evaluation, best lines, move classification, accuracy and estimated playing strength.
- Game summary, move-by-move review and deterministic per-game Conclusions.
- Interactive tactical explanations and playable alternative engine lines.
- Selective teaching arrows for important tactical and strategic ideas.
- Four selectable coaches with translated feedback.
- Shareable analysed games and public profiles.

### Learning and training

- 80 guided playable Lessons.
- Endgame Laboratory covering fundamental, intermediate and advanced endgames.
- Exact Syzygy-style tablebase W/D/L feedback for supported positions with up to seven pieces.
- Custom FEN endgame practice.
- Duel mode against Stockfish with selectable Elo, live feedback, retry/continue and saved unfinished games.
- Automatic training plans derived from repeated weaknesses in analysed games.
- Repertoire tools for creating/importing opening lines and studying large compact decision trees.

### Puzzles

- Puzzles generated from analysed mistakes, misses and blunders.
- Thematic training with multi-theme and difficulty filters.
- Puzzle rating, attempts and streak tracking.
- Open puzzle catalogue containing **6,057,356 positions**, distributed separately from the main application bundle.

### Statistics and history

- Recent-game and time-window samples.
- Average accuracy and accuracy evolution.
- White/Black performance splits.
- Mistakes, misses and blunders per game and per 100 player moves.
- Error distribution and accuracy by opening, middlegame and endgame.
- Opening frequency, score, accuracy and estimated performance.
- Puzzle and training summaries using only data NexoChess actually stores.
- Brilliant-move gallery linked to the exact archived game and ply.

### Accounts, privacy and interface

- Guest use without an account for the main chess workflows.
- Google OAuth and email/password accounts.
- Verification, password recovery and account email flows.
- Local persistence for guest-compatible data and D1-backed persistence for signed-in account data.
- Light and dark appearance.
- Responsive desktop, tablet and mobile layouts with touch-friendly controls.
- Interface support for **11 languages**: English, Spanish, French, German, Portuguese, Russian, Chinese, Vietnamese, Hindi, Marathi and Polish.
- Privacy controls, legal pages, Help Center and contact flows.

## Architecture

NexoChess is deployed primarily on Cloudflare:

```text
Browser
├── React + TypeScript interface
├── Stockfish.js + WebAssembly analysis
├── progressively loaded training/data chunks
└── relative application and API requests

Cloudflare
├── Worker routing and security headers
├── Workers Static Assets
├── Better Auth
├── D1: accounts, sessions, Archive, release-note state and puzzle progress
└── separate static puzzle-data Workers

External chess data/services
├── Lichess CC0 puzzle dataset (preprocessed into NexoChess static packages)
└── Lichess tablebase API for exact supported endgame probes
```

### Application stack

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

The legacy Node/Express workspace remains in the repository for compatibility and shared tooling, but the hosted NexoChess application does not require a persistent local Node server.

## Repository layout

```text
client/                 React application, public assets and browser integrations
cloudflare/             Worker, authentication, API and email integration
config/                 Shared environment, routing and canonical-domain configuration
server/                 Legacy/server workspace and supporting tooling
shared/                 Shared chess analysis and reporting logic
scripts/                Build, verification, import and operational scripts
puzzle-data-worker/     Static puzzle catalogue Worker configuration
docs/operations/        Deployment, recovery and canonical-domain runbooks
docs/releases/          Versioned release notes and release history
legal/                  Corresponding-source and licence notices
```

The complete puzzle database, generated static puzzle packages, D1 exports, local production configuration and secret files are intentionally excluded from Git.

## Branch and release model

NexoChess keeps two long-lived branches:

- `develop` — integration branch for feature work, CI/CodeQL validation and staging.
- `master` — explicitly approved public release branch and production source.

Normal changes follow:

```text
feature/fix branch
→ pull request to develop
→ CI + CodeQL
→ merge to develop
→ staging deployment and validation
→ explicit release approval
→ promotion to master
→ production deployment
→ version tag
```

Feature work must not be pushed directly to `master`, and production deployment must not be performed from `develop`.

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

A focused pull request should:

- branch from `develop`;
- contain one coherent change;
- keep visible copy translated across all supported locales;
- preserve authentication, persistence, privacy and licensing constraints;
- pass repository checks, client/server type-checking, CI and CodeQL;
- avoid committing `.env`, credentials, database exports, generated puzzle packages or local production configuration.

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for contribution requirements.

## Staging operations

After authenticating Wrangler and configuring the required staging secrets, the controlled deployment command is:

```bash
npm run deploy:staging
```

This command verifies repository state, runs safeguards, builds the application, records a D1 recovery point, deploys staging and performs a remote smoke test.

Useful non-deployment checks:

```bash
npm run monitor:staging
npm run recovery:staging
npm run verify:canonical
npm run verify:security
npm run verify:public-api
npm run verify:release-v1.4
```

Production deployment is intentionally separate, restricted to `master` and protected by an explicit confirmation phrase. See **[Deployment and recovery](docs/operations/DEPLOYMENT_AND_RECOVERY.md)**.

## Configuration and secrets

Worker secrets are stored in Cloudflare and must never be committed. Expected secret names are:

```text
AUTH_SECRET
BREVO_API_KEY
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
```

Only the names belong in documentation. Secret values must remain in the appropriate password manager and platform secret stores.

Environment/configuration notes:

- `.env.example` documents supported local variables without real credentials.
- `wrangler.jsonc` configures staging.
- `wrangler.production.local.jsonc` is generated locally for production and is ignored by Git.

## Security and recovery

Repository safeguards include:

- CI and CodeQL checks;
- dependency auditing;
- committed-secret/credential-pattern checks;
- defensive HTTP headers;
- same-origin and content-type validation for API mutations;
- Better Auth rate limiting;
- public API and D1 user-isolation tests;
- D1 Time Travel recovery-point handling;
- Worker rollback and remote smoke-test tooling;
- dedicated release safeguards for versioned release messaging.

Security reports must follow **[SECURITY.md](SECURITY.md)** rather than public issues containing sensitive details.

Operational documentation:

- [Deployment and recovery](docs/operations/DEPLOYMENT_AND_RECOVERY.md)
- [Canonical domain](docs/operations/CANONICAL_DOMAIN.md)

## Puzzle and tablebase data

NexoChess uses the open Lichess puzzle database under **CC0 1.0**. The dataset is exported into compact static packages and indexes so the browser loads only the catalogue, the required filter index and the selected package rather than millions of positions at startup.

The Endgame Laboratory probes the public Lichess tablebase service for eligible positions instead of bundling multi-gigabyte tablebase files into the web application. Requests are queued, cached in-session and protected with timeout/rate-limit handling.

See **[ATTRIBUTIONS.md](ATTRIBUTIONS.md)** for third-party source and licensing notes.

## Licensing and attribution

NexoChess is distributed under the **GNU General Public License v3.0**.

Important notices:

- [GPL-3.0 licence](LICENSE)
- [Attributions](ATTRIBUTIONS.md)
- [Stockfish corresponding-source notice](legal/STOCKFISH-SOURCE.txt)

NexoChess is based on and substantially modifies the GPL-licensed WintrChess project. Stockfish remains licensed under GPL-3.0. Third-party resources and puzzle-data terms are documented in the attribution files and in the application's source/licence page.

## Release history

- **[v1.4](docs/releases/v1.4.md)** — Statistics, Conclusions, automatic training plan, Endgame Laboratory, compact Repertoire study tree and contextual tutorial.
- **[v1.3](docs/releases/v1.3.md)** — 80 Lessons, Duel, pedagogical Analysis improvements and major mobile/tablet redesign.
- **[v1.2](docs/releases/v1.2.md)** — Repertoire, redesigned Puzzles and reliability/interface improvements.
- **[v1.1](docs/releases/v1.1.md)** — public pages, multilingual SEO foundations, privacy/analytics, Help Center and accessibility work.
- **v1.0** — first public NexoChess production version.

See **[CHANGELOG.md](CHANGELOG.md)** for the concise changelog.

## Contact

For support, privacy requests, legal questions or responsible security contact:

**contact@nexochess.com**
