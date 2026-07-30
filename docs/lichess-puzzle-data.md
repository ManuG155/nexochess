# Lichess puzzle data in NexoChess

## Permitted source

NexoChess imports the official downloadable
[Lichess Puzzle Database](https://database.lichess.org/#puzzles). Lichess
publishes its database exports under the Creative Commons CC0 1.0 Universal
public-domain dedication and explicitly permits downloading, modification,
redistribution, publication and commercial use.

The import path is deliberately independent from the interactive Lichess
website:

- no page scraping;
- no iframe or copied Lichess interface;
- no per-puzzle request to Lichess;
- no use of a user account or access token;
- no suggestion of affiliation, sponsorship or endorsement.

The Lichess name appears only to identify the source. NexoChess does not
package the Lichess logo.

## Data interpretation

The export columns used by NexoChess are:

- `PuzzleId`
- `FEN`
- `Moves`
- `Rating`
- `Popularity`
- `Themes`
- `GameUrl`
- `OpeningTags`

The FEN is the position before the opponent's final setup move. NexoChess
plays the first UCI move before showing the board, and the solution begins with
the second move in the row. Theme and opening selectors come directly from the
two corresponding export columns.

## Rebuilding the package

Download the current `.csv.zst` file from the official database page, record
its SHA-256 locally, decompress it as a stream and run:

```bash
node scripts/build-lichess-puzzle-pack.mjs \
  lichess_db_puzzle.csv \
  client/public/data/lichess-puzzles.json \
  50000
```

The importer rejects incomplete rows and positions below the configured
popularity threshold. Its stratified reservoirs preserve every observed
theme across rating bands and at least one good representative for every
observed opening tag before filling the rest of the package.

The generated JSON records the source URL, CC0 identifier, source SHA-256 when
provided through `LICHESS_SOURCE_SHA256`, generation time and the
theme/opening coverage. It should be rebuilt from the official export, never
from scraped pages or unofficial mirrors.

## Release check

Before production:

1. record and compare the source file's SHA-256 during the build pipeline;
2. validate every included FEN and UCI line with `chess.js`;
3. confirm the package metadata still says `CC0-1.0`;
4. keep the source and non-affiliation notice visible;
5. re-check the current Lichess database page and Terms of Service if the
   ingestion method changes.

This document records the data provenance and technical safeguards. It is not
a substitute for professional legal advice if NexoChess later changes how it
uses Lichess services or branding.
