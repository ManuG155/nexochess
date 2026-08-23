# NexoChess release history

This directory contains versioned release notes for the public NexoChess release line.

## Current release line

### [v1.4](v1.4.md) — 23 August 2026

Historical diagnosis and targeted training become first-class product areas:

- Statistics center;
- per-game Conclusions;
- automatic Training plan;
- Brilliant-move gallery;
- Endgame Laboratory with 72 positions and supported tablebase feedback;
- compact Repertoire study-tree redesign;
- contextual whole-site tutorial;
- progressive/lazy loading work for heavier features.

## Previous releases

### [v1.3](v1.3.md) — 18 August 2026

- 80 guided Lessons;
- Duel against Stockfish;
- more pedagogical Analysis;
- playable tactical variations;
- major mobile/tablet redesign;
- stricter training-puzzle generation from serious errors.

### [v1.2](v1.2.md) — 14 August 2026

- Repertoire section;
- redesigned Puzzles setup and training flow;
- multi-theme puzzle selection;
- navigation, reliability and search-presentation improvements.

### [v1.1](v1.1.md) — 7 August 2026

- public pages and multilingual routing/metadata foundations;
- About, FAQ and completed Help Center;
- privacy controls and consent-gated analytics;
- accessibility safeguards;
- deployment/recovery and release safeguards.

### v1.0 — 2 August 2026

First public NexoChess production version.

## Branch/release policy

Version work is integrated into `develop`, validated by CI and CodeQL and tested on staging. A release reaches `master` and production only after explicit approval. Version tags are created from the final approved release commit.

The repository-level concise history is maintained in [`CHANGELOG.md`](../../CHANGELOG.md).
