# Contributing to NexoChess

Thank you for helping improve NexoChess.

## Branch model

NexoChess keeps two long-lived branches:

- `develop` is the integration and staging branch.
- `master` is the explicitly approved public-release and production branch.

Normal work must branch from `develop` and return through a pull request to `develop`. Feature work must not be pushed directly to `master`, and production deployment must not be run from `develop`.

Typical flow:

```text
develop
→ focused feature/fix branch
→ pull request to develop
→ CI + CodeQL
→ merge to develop
→ staging validation
→ explicit release approval
→ promotion to master
→ production deployment
```

## Before starting

1. Open or locate an issue describing the change when appropriate.
2. Create a focused branch such as `feature/import-preview` or `fix/google-login` from current `develop`.
3. Keep unrelated formatting and refactors out of the same change.
4. Never commit `.env`, credentials, user data, D1 exports, local production config or generated puzzle packages.
5. Check whether the task touches a deliberately stable product subsystem before changing shared chess logic.

## Local verification

For a complete verification run:

```sh
npm ci
npm run check
npm run build
```

Useful targeted checks include:

```sh
npm run check:translations
npm run check:repository
npm run check:lessons
npm run check:endgames
npm run check:puzzles
npm run verify:security
npm run verify:public-api
npm run verify:release-v1.4
npm run check -w client
npm run check -w server
```

GitHub CI and CodeQL remain authoritative before merge.

## Product invariants

The following areas must not be changed incidentally or as a side effect of unrelated UI work. A pull request touching them should explicitly explain why the behaviour is being changed and how regressions were checked:

- coach identities, artwork and visual actions;
- board geometry, coordinates and board interaction behaviour;
- evaluation/rating semantics;
- move classification and move-quality rules;
- accuracy calculation;
- NexoChess branding/logo assets;
- authentication and account-isolation behaviour;
- Archive ownership and guest/cloud persistence semantics;
- public/shareable archived-game access rules;
- puzzle-source licensing/provenance and generated-data boundaries;
- deployment, backup and production-branch safeguards.

A product request may intentionally change one of these areas, but unrelated pull requests should preserve them.

## Translation requirements

Visible product copy should use the translation system or an explicitly localized copy map. When adding or changing user-facing text:

- provide copy for all supported locales where that feature is localized;
- preserve interpolation variables such as `{{username}}`;
- run `npm run check:translations`;
- do not rely on English fallback for normal interface content;
- verify layout with both short and long translations where practical.

NexoChess currently supports English, Spanish, French, German, Portuguese, Russian, Chinese, Vietnamese, Hindi, Marathi and Polish.

## Performance requirements

NexoChess intentionally avoids loading large optional datasets and feature bundles at initial page load. New work should preserve that model:

- prefer lazy imports for optional heavy interfaces;
- split large training catalogues by the part the user actually selects;
- do not embed the full puzzle database in the application bundle;
- batch expensive Archive/statistics reads rather than requesting every detailed game at once;
- avoid introducing blocking third-party requests on critical product paths.

## Privacy and persistence

Changes involving authentication, analytics, release-note state, Archive, puzzle progress or other persisted user data must document:

- whether data is local, account-backed or public;
- the exact API/storage path involved;
- whether the change affects guest users;
- how access remains scoped to the authenticated user where required;
- whether new personal data is introduced.

Do not include real user data in tests or examples.

## Pull requests

A pull request should explain:

- what changed and why;
- how it was tested;
- whether it affects authentication, persistence, privacy, licensing or public indexing;
- whether it touches shared analysis/classification behaviour;
- whether it changes deployment or Cloudflare/D1 configuration.

Temporary branches should be deleted after merge or abandonment. Keep `develop` and `master` as the only permanent branches.
