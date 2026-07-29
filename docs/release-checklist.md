# NexoChess release checklist

## Quality

- [ ] Client and server type checks pass.
- [ ] Production build passes.
- [ ] Translation audit passes for every locale.
- [ ] No raw translation keys appear during startup.
- [ ] Analysis does not produce a blank screen.
- [ ] Import works for PGN, FEN, Chess.com and Lichess.
- [ ] Account creation, Google login, email change, password reset and deletion are tested.
- [ ] Guest and signed-in Archive behaviour is tested.

## Security and privacy

- [ ] Repository audit passes.
- [ ] Exposed secrets have been rotated.
- [ ] Production secrets are stored outside GitHub source control.
- [ ] Analytics and advertisements remain disabled until a valid consent flow exists.
- [ ] Terms, Privacy, Help and source-code pages work in every supported language.
- [ ] `contact@nexochess.com` receives and sends mail correctly.

## Licensing

- [ ] GPL-3.0 license is present.
- [ ] WintrChess upstream attribution is present.
- [ ] The deployed source link points to the matching NexoChess version.
- [ ] Corresponding Stockfish.js/WASM source and build information are available.
- [ ] Asset-license audit has no unresolved release blockers.

## Deployment

- [ ] Staging deployment passes browser and mobile tests.
- [ ] Database backups and restore procedure are tested.
- [ ] HTTPS is active.
- [ ] `nexochess.com` redirects to `www.nexochess.com`.
- [ ] Google OAuth production origins and redirect URI are exact.
- [ ] Error logging does not expose secrets or personal data.
- [ ] A rollback procedure exists.
