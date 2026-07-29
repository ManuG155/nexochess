# Asset and license audit

Every asset distributed by NexoChess needs a known origin and redistribution right before the public release.

Use one row per asset family. Replace `Pending` with verified information and attach the relevant license file where required.

| Asset family | Repository path | Origin or author | License or permission | Modified | Redistribution confirmed | Action |
|---|---|---|---|---|---|---|
| NexoChess logo | `client/public/...` | NexoChess owner | Project-owned | Yes | Pending | Record original source files |
| Coach illustrations | `client/public/...` | Pending | Pending | Yes | Pending | Verify ownership or replace |
| Coach animations | `client/public/...` | Pending | Pending | Yes | Pending | Verify ownership or replace |
| Move classification icons | `client/public/...` | Pending | Pending | Unknown | Pending | Identify source |
| Chess pieces and boards | `client/public/...` | Pending | Pending | Unknown | Pending | Identify each theme |
| Interface icons | Source dependencies/assets | Pending | Pending | Unknown | Pending | Check icon-library license |
| Flags | Locale assets | Pending | Pending | No | Pending | Record source and license |
| Fonts | `client/public/fonts/` | Font authors | Pending | No | Pending | Add font license files |
| Sounds | `client/public/audio/` | Pending | Pending | Unknown | Pending | Identify source |
| Stockfish.js/WASM | `client/public/engines/` | Stockfish/Stockfish.js contributors | GPL-3.0 | Build-specific | Pending | Publish corresponding source/build info |
| Opening data | Generated resource | lichess-org/chess-openings | CC0-1.0 | Generated | Yes | Preserve attribution note |
| Provider logos | Authentication/import assets | Respective trademark owners | Brand guidelines | No | Pending | Verify permitted usage |

An asset marked `Pending` is a release blocker unless it is removed, replaced or separately licensed.
