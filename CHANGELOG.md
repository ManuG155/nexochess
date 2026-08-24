# Changelog

All notable changes to NexoChess are documented here. The project follows semantic versioning for public releases.

## [Unreleased]

- Final search-indexing, sitemap and Search Console troubleshooting remains a separate operational pass after the v1.4 product work.

## [1.4] - 2026-08-24

### Added

- First-class **Statistics** section with recent-game/time filters, accuracy evolution, White/Black comparisons, errors by phase, opening performance, puzzle/training summaries and historical aggregates.
- **Brilliant-move gallery** with compact board previews linked to the exact archived game and ply.
- Deterministic per-game **Conclusions** alongside Review: decisive moment, principal error/pattern and a concrete recommendation.
- Automatic **Training plan** in Archive based on recurring weaknesses across analysed games.
- **Endgame Laboratory** inside Lessons with 72 fundamental, intermediate and advanced positions, custom FEN practice and theme mastery.
- Exact tablebase W/D/L feedback for supported endgame positions with up to seven pieces.
- Optional contextual **NexoChess tutorial** launched from a fixed `?` control on eligible section menus.
- Local/account-aware v1.4 release notice with an automatic 27 August 2026 23:59 CEST cutoff.

### Changed

- Progress was removed from Archive and expanded into the dedicated Statistics center.
- Repertoire received a compact decision-tree redesign with progressive expansion, transpositions, search, move popularity, fullscreen study and semantic zoom.
- Detailed Statistics and Endgame Laboratory position packs use progressive/lazy loading to protect initial page speed.
- Analysis tactical explanations follow engine lines more consistently.
- Brilliant classification is stricter: ordinary pawn sacrifices are excluded, while genuine sound sacrifices and exceptional drawing resources remain eligible.
- Guided tutorial positioning was refined so the launcher stays fixed and only the target frame/callout follows the highlighted UI.
- The malformed Settings gear introduced during tutorial work was restored to the correct icon geometry.

### Reliability and safeguards

- Added a dedicated v1.4 release verification to the main CI pipeline.
- Endgame Laboratory content has repository checks for legal FEN structure, piece-count limits and catalogue distribution.
- CI, CodeQL, client/server type-checking and Cloudflare dry-run builds remain required before integration.

Full notes: `docs/releases/v1.4.md`.

## [1.3] - 2026-08-18

### Added

- 80 guided, playable Lessons with realistic positions and coach-led practice.
- Duel mode against Stockfish with selectable Elo levels, live move feedback, retry/continue, Undo/Redo and saved unfinished games.
- Playable engine-backed tactical variations from Analysis commentary.
- Selective teaching arrows and improved manual board annotations.
- Compact Ko-fi support action in the navigation bar.

### Changed

- Major responsive/mobile/tablet redesign across Analysis, Puzzles, Archive, Repertoire, Lessons, Duel and other primary areas.
- Puzzles generated from analysed games now focus on mistakes, misses and blunders instead of ordinary inaccuracies.

Full notes: `docs/releases/v1.3.md`.

## [1.2] - 2026-08-14

### Added

- Repertoire section for creating or importing opening lines, studying them move by move and practising guided opening courses.
- Multi-theme puzzle selection and a redesigned puzzle setup/training flow.

### Changed

- Navigation, interface details, reliability and search presentation received smaller improvements.

Full localized notes: `docs/releases/v1.2.md`.

## [1.1] - 2026-08-07

### Added

- Public NexoChess pages, canonical metadata and localized URLs across 11 languages.
- About NexoChess, FAQ and completed Help Center pages.
- Privacy controls, cookie consent and consent-gated Google Analytics 4.
- Privacy-limited product events for analysis, puzzles, sharing and authentication.
- Accessibility safeguards for keyboard navigation, focus management and assistive copy.
- A temporary localized v1.1 release note shown once per account or local browser before 10 August 2026.

### Changed

- Improved loading performance and static-asset caching.
- Improved readability across Help, legal pages, Settings and secondary interfaces.
- Improved staging/production deployment verification and recovery controls.

### Fixed

- Localized Analysis and Settings routes render correctly.
- Localized legal pages resolve correctly instead of rendering an empty content area.
- Several navigation, cache and deployment regressions detected during the release-candidate process.

### Security and privacy

- GA4 loads only in production after analytics consent.
- Google advertising storage, Signals and ad personalization remain disabled.
- Repository secret checks, CodeQL and deployment safety checks remain part of CI.

Full localized notes: `docs/releases/v1.1.md`.

## [1.0] - 2026-08-02

First public NexoChess production version.

### Added

- NexoChess branding and public identity.
- Optional accounts with Google and email authentication.
- Transactional account emails from `contact@nexochess.com`.
- Multilingual interface and coach commentary.
- Redesigned game import, Help Center, legal pages and source-code information.

### Changed

- Complete redesign of the original WintrChess interface.
- Guest Archive remains usable without an account.

### Security

- Repository hygiene, secret checks and automated GitHub security workflows.
