# Contributing to NexoChess

NexoChess is a modified GPL-3.0 project based on WintrChess. Contributions must preserve the upstream attribution, the GPL license and the independent NexoChess identity.

## Protected subsystems

The following areas are mature and intentionally frozen. Do not change them incidentally or as part of unrelated cleanup. A modification requires an explicitly approved task that names the affected subsystem:

- coaches and coach actions;
- board configuration;
- board coordinates;
- evaluation rating;
- game rating;
- move classification and move quality;
- accuracy calculation;
- the NexoChess logo;
- existing buttons;
- the current Archive structure and its no-account access.

When a requested change touches a protected area indirectly, work around it or raise the conflict before modifying it.

## Code style

The project uses TypeScript across the client, server and shared workspaces. Match the surrounding code and run the available checks before submitting changes.

```sh
npm run check -w client
npm run check -w server
npm run lint
```

Use external imports first, followed by `shared` and local project imports, component types/styles and finally asset imports.

Prefer functions and interfaces over classes unless a class is clearly justified by the surrounding architecture.

## Change scope

Keep pull requests focused. Avoid formatting unrelated files or combining a visual redesign, data migration and backend refactor in one change.

Any change involving persistent identifiers must include a migration plan. This includes:

- cookies;
- `localStorage` and IndexedDB keys;
- authentication cookie prefixes;
- database names and collections;
- Docker project and volume names.

See [`brand-migration.md`](brand-migration.md).

## Commits and pull requests

Use conventional commit-style messages where practical:

```text
feat(fe): add language preference persistence
fix(be): validate production callback origin
docs: document third-party engine source
```

Suggested scopes:

- `fe`: client/frontend
- `be`: server/backend
- `sh`: shared logic
- `docs`: documentation and release notices

## Licensing

Contributors agree that their contributions are distributed under GPL-3.0 as part of NexoChess. Do not add code, datasets, fonts, media or generated binaries unless their source and redistribution terms are known and compatible.

Any new third-party component must be recorded in `ATTRIBUTIONS.md` or in an appropriate generated dependency notice.

## Privacy and security

Changes that collect, transmit or store user information must document:

- what data is processed;
- why it is needed;
- where it is stored;
- how long it is retained;
- how a user can delete or export it;
- what security controls protect it.

Do not publish credentials, OAuth secrets, private keys, database dumps or user data in commits, issues or screenshots. Critical vulnerabilities should be reported privately through the repository's security-advisory mechanism once the public repository is created.
