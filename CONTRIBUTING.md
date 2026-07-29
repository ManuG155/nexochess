# Contributing to NexoChess

Thank you for helping improve NexoChess.

## Before starting

1. Open or locate an issue describing the change.
2. Create a focused branch such as `feature/import-preview` or `fix/google-login`.
3. Keep unrelated formatting and refactors out of the same change.
4. Never commit `.env`, credentials, user data or local database exports.

## Local verification

Run:

```sh
npm ci
npm run check:translations
npm run check:repository
npm run check -w client
npm run check -w server
npm run build
```

## Protected product areas

The following areas must not be modified incidentally. Changes require an issue that explicitly authorises that subsystem:

- coaches and their visual actions;
- board configuration and coordinates;
- evaluation rating and game rating;
- move classification and move quality;
- accuracy calculation;
- the NexoChess logo;
- existing product buttons;
- the Archive structure and guest access behaviour.

Translations may change coach text, but must not change coach images, animation timing, classification logic or analysis behaviour.

## Translation requirements

Every visible string must use the translation system. When adding a key:

- add it to every supported locale;
- preserve interpolation variables such as `{{username}}`;
- run `npm run check:translations`;
- do not rely on English fallback for normal interface content.

## Pull requests

A pull request should explain what changed, why it changed, how it was tested and whether it touches authentication, persistence, privacy, licensing or a protected product area.
