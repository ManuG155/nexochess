# Changelog

All notable changes to NexoChess will be documented in this file.

The project follows semantic versioning once the first stable release is published.

## [Unreleased]

## [1.1] - 2026-08-07

### Added

- Public NexoChess pages, canonical metadata and localized URLs across 11 languages.
- About NexoChess, FAQ and completed Help Center pages.
- Privacy controls, cookie consent and consent-gated Google Analytics 4.
- Privacy-limited product events for analysis, puzzles, sharing and authentication.
- Accessibility safeguards for keyboard navigation, focus management and assistive copy.
- A temporary, localized v1.1 release note shown once per account or local browser before 10 August 2026.

### Changed

- Improved loading performance and static-asset caching.
- Improved readability across Help, legal pages, Settings and secondary interfaces.
- Improved staging/production deployment verification and recovery controls.

### Fixed

- Localized Analysis and Settings routes now render correctly.
- Localized legal pages resolve correctly instead of rendering an empty content area.
- Several navigation, cache and deployment regressions detected during the release candidate process.

### Security and privacy

- GA4 loads only in production after analytics consent.
- Google advertising storage, Signals and ad personalization remain disabled.
- Repository secret checks, CodeQL and deployment safety checks remain part of CI.

Full localized v1.1 notes are available in `docs/releases/v1.1.md`.

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
