# Security policy

## Supported versions

Security fixes are developed on the current `develop` line and promoted to the latest approved public release on `master`.

| Branch / release | Support |
| --- | --- |
| Latest public release on `master` | Supported |
| Current integration line on `develop` | Supported for incoming fixes and pre-release validation |
| Older tagged/public versions | Best effort only; users should move to the latest release |

NexoChess does not use a permanent `main` release branch.

## Reporting a vulnerability

Do **not** open a public GitHub issue for a suspected security vulnerability.

Send a private report to **contact@nexochess.com** with:

- a clear description of the issue;
- the affected URL, route or component;
- reproducible steps or a proof of concept;
- the expected impact;
- any suggested mitigation;
- whether the report contains personal data or credentials.

Do not include real passwords, session cookies, OAuth secrets or personal data belonging to other users. Use a temporary test account whenever possible.

We will acknowledge a credible report as soon as reasonably possible, investigate it and coordinate a fix before public disclosure where appropriate.

## Scope

Relevant reports include, for example:

- authentication bypass or account takeover;
- cross-account access to private Archive, puzzle progress or other D1-backed user data;
- privilege escalation;
- injection vulnerabilities;
- leaked secrets or unsafe environment/configuration handling;
- unsafe handling of imported PGN/FEN or other user-controlled content;
- bypasses of same-origin/content-type mutation guards;
- exposure of private account fields through public-profile/share APIs;
- vulnerabilities in Cloudflare Worker routing, authentication or deployment/recovery controls.

General feature requests, visual bugs, chess-evaluation disagreements and translation errors should use the normal GitHub issue templates instead.

## Current safeguards

The repository includes automated checks for:

- CodeQL analysis;
- dependency vulnerabilities at the configured audit threshold;
- committed credential/secret patterns;
- public API and D1 account isolation;
- security headers and mutation-origin/content-type validation;
- production routing and deployment controls;
- account/release-note persistence boundaries;
- client/server type-checking and production builds.

These controls reduce risk but do not replace responsible vulnerability reporting or manual review.

## Disclosure and testing

Please avoid destructive testing against production, denial-of-service behaviour, high-volume automated probing or accessing data that does not belong to your test account. If a proof of concept could affect other users or service availability, describe the approach first instead of executing it against production.
