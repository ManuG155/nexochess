# NexoChess third-party notices and attribution

This document records the known upstream projects and third-party resources used by NexoChess. It is not a substitute for the license text included with each dependency or asset.

## NexoChess and WintrChess

NexoChess is a modified version of **WintrChess**, originally created by **WintrCat**.

- Upstream source: https://github.com/WintrCat/wintrchess
- Upstream license: GNU General Public License v3.0
- NexoChess license: GNU General Public License v3.0

NexoChess includes substantial interface, product and branding changes. It remains a derivative work of the upstream GPL-licensed codebase. The original copyright notices and repository history must not be misrepresented or removed from distributed source code.

NexoChess is independent from WintrCat and is not the official WintrChess service.

## Stockfish and Stockfish.js

The browser engine files in `client/public/engines/` identify themselves as **Stockfish.js 17** and are licensed under GPL v3.

- Stockfish source: https://github.com/official-stockfish/Stockfish
- Stockfish.js source: https://github.com/nmrugg/stockfish.js
- License: GNU General Public License v3.0

The JavaScript header credits Chess.com, LLC for the Stockfish.js build and credits the Stockfish contributors and neural-network authors.

### Release requirement

Before the public launch, NexoChess must provide users with the corresponding source code and build information for the exact Stockfish/Stockfish.js binaries distributed by the website. Merely shipping minified JavaScript and WebAssembly files is not sufficient documentation of the corresponding source.

## Chess opening data

The generated opening database uses data from `lichess-org/chess-openings`.

- Source: https://github.com/lichess-org/chess-openings
- License/dedication: CC0 1.0 / public domain dedication

The dataset is an aggregated collection of chess opening names. Its upstream project asks users to recognise the curation effort even though the data is released into the public domain.

## Lichess puzzle data

The tactics trainer uses positions from the
[Lichess Puzzle Database](https://database.lichess.org/#puzzles), released
under the Creative Commons CC0 1.0 Universal public-domain dedication.

NexoChess applies the first UCI move in each row as the opponent's setup move
before presenting the puzzle, as required by the published database format.
The remaining moves form the solution. NexoChess is not affiliated with or
endorsed by Lichess.

## Package dependencies

JavaScript and TypeScript dependencies are declared in the root and workspace `package.json` files and resolved in `package-lock.json`. Each package remains subject to its own license terms. A production release should generate and review a dependency-license report rather than assuming every npm package uses the same license as NexoChess.

## Fonts

The repository currently includes local copies of the following font families:

- JetBrains Mono
- Noto Sans
- Nunito
- Roboto Slab

Before launch, the relevant font license files and copyright notices should be added alongside the distributed font files or to a dedicated third-party license directory.

## Provider and platform marks

The repository contains images or references associated with services such as Google, GitHub, Chess.com, Lichess, Instagram and YouTube. Their names and logos are trademarks of their respective owners. Their inclusion does not imply endorsement, partnership or affiliation with NexoChess.

Provider logos must be used according to each provider's current branding requirements. Open-source licensing of the surrounding application does not grant ownership of third-party trademarks.

## Asset provenance review required before launch

The following asset groups require a recorded source, author and license before the public release unless they were created entirely for NexoChess by the project owner:

- coach illustrations and animations;
- classification and result icons;
- board-piece artwork and interface icons;
- flags and time-control images;
- notification and move audio;
- help-centre images and animated media;
- legacy social, donation and promotional graphics.

Assets without a confirmed redistribution right should be replaced, removed or separately licensed before launch.

## No affiliation

NexoChess is not affiliated with, endorsed by or sponsored by WintrCat, Chess.com, Lichess, Google, GitHub, Stockfish or any other third-party service mentioned in the application unless a future written agreement states otherwise.
