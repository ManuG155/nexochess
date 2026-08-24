# NexoChess third-party notices and attribution

This document records the known upstream projects, datasets, services and third-party resources used by NexoChess. It is not a substitute for the licence text distributed with each dependency or asset.

## NexoChess and WintrChess

NexoChess is a modified version of **WintrChess**, originally created by **WintrCat**.

- Upstream source: https://github.com/WintrCat/wintrchess
- Upstream licence: GNU General Public License v3.0
- NexoChess licence: GNU General Public License v3.0

NexoChess includes substantial interface, product, infrastructure and branding changes. It remains a derivative work of the upstream GPL-licensed codebase. Original copyright notices and repository history must not be misrepresented or removed from distributed source code.

NexoChess is independent from WintrCat and is not the official WintrChess service.

## Stockfish and Stockfish.js

The browser engine files in `client/public/engines/` identify themselves as **Stockfish.js 17** and are licensed under GPL v3.

- Stockfish source: https://github.com/official-stockfish/Stockfish
- Stockfish.js source: https://github.com/nmrugg/stockfish.js
- Licence: GNU General Public License v3.0

The JavaScript header credits Chess.com, LLC for the Stockfish.js build and credits the Stockfish contributors and neural-network authors.

### Corresponding-source requirement

Public distributions of NexoChess that ship GPL-covered Stockfish/Stockfish.js binaries must make the corresponding source and required licence information available for the exact distributed build. See `legal/STOCKFISH-SOURCE.txt` for the repository's current corresponding-source notice.

## Chess opening data

The generated opening database uses data from `lichess-org/chess-openings`.

- Source: https://github.com/lichess-org/chess-openings
- Licence/dedication: CC0 1.0 / public-domain dedication

The dataset is an aggregated collection of chess opening names. Its upstream project asks users to recognise the curation effort even though the data is released into the public domain.

## Lichess puzzle data

The tactics trainer uses positions from the [Lichess Puzzle Database](https://database.lichess.org/#puzzles), released under the Creative Commons CC0 1.0 Universal public-domain dedication.

The official database page permits publication, modification and redistribution under that public-domain dedication. NexoChess applies the first UCI move in each row as the opponent's setup move before presenting the puzzle, as required by the published database format. The remaining moves form the solution. Theme and opening filters are derived from the `Themes` and `OpeningTags` columns in that export.

The packaged data is generated from the downloadable database export. The application does not scrape lichess.org, proxy its puzzle trainer or make a request to Lichess whenever a user starts a puzzle. The Lichess name is used only to identify the data source; no Lichess visual identity is required for the trainer. NexoChess is not affiliated with or endorsed by Lichess.

The upstream puzzle-theme vocabulary is also published as CC0 in `lichess-org/lila/translation/source/puzzleTheme.xml`. NexoChess uses its own interface, grouping and wording around those public-domain theme identifiers.

## Lichess tablebase service

The Endgame Laboratory can probe the public Lichess tablebase endpoint for eligible chess positions with up to seven pieces:

- Service endpoint used by the client: `https://tablebase.lichess.ovh/standard`
- Purpose: exact tablebase category/move information for supported standard-chess positions

NexoChess does not bundle the complete Syzygy tablebase files in this repository. Requests are made only when a supported endgame position needs exact feedback, and the client queues/caches requests and handles temporary rate limits or network failures.

The service name and endpoint are documented here for transparency and attribution. NexoChess is not affiliated with or endorsed by Lichess.

## Package dependencies

JavaScript and TypeScript dependencies are declared in the root and workspace `package.json` files and resolved in `package-lock.json`. Each package remains subject to its own licence terms. Release maintenance should continue to review dependency licences rather than assuming every npm package uses the same licence as NexoChess.

## Fonts

The repository currently includes local copies of the following font families:

- JetBrains Mono
- Noto Sans
- Nunito
- Roboto Slab

The relevant upstream licence/copyright terms remain applicable to each family. Font files should not be redistributed separately from the project without checking those terms.

## Provider and platform marks

The repository contains images or references associated with services such as Google, GitHub, Chess.com, Lichess, Instagram and YouTube. Their names and logos are trademarks of their respective owners. Their inclusion does not imply endorsement, partnership or affiliation with NexoChess.

Provider logos must be used according to the provider's applicable branding requirements. Open-source licensing of the surrounding application does not grant ownership of third-party trademarks.

## Asset provenance

NexoChess contains original project artwork as well as legacy/upstream and third-party-compatible assets. Asset provenance and redistribution rights should remain documented and reviewed when assets are replaced or newly introduced, especially for:

- coach illustrations and animations;
- classification and result icons;
- board-piece artwork and interface icons;
- flags and time-control images;
- notification and move audio;
- Help Center images and animated media;
- legacy social, donation and promotional graphics.

Assets without a confirmed redistribution right should not be added to public distributions.

## No affiliation

NexoChess is not affiliated with, endorsed by or sponsored by WintrCat, Chess.com, Lichess, Google, GitHub, Stockfish or any other third-party service mentioned in the application unless a written agreement explicitly states otherwise.
