import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Chess } from "chess.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const positionFiles = [
    "client/src/apps/features/lessons/endgames/positions/basic.ts",
    "client/src/apps/features/lessons/endgames/positions/intermediate.ts",
    "client/src/apps/features/lessons/endgames/positions/advanced.ts"
];

const expectedThemes = new Map([
    ["basic", new Set([
        "basic-mates", "pawn-square", "opposition", "key-squares", "rook-pawn", "pawn-race"
    ])],
    ["intermediate", new Set([
        "lucena", "philidor", "rook-behind-pawn", "active-rook", "minor-piece-pawns", "queen-vs-pawn"
    ])],
    ["advanced", new Set([
        "rook-cutoff", "side-checks", "rook-two-pawns", "triangulation", "fortress", "queen-rook"
    ])]
]);

const positions = [];
const rowPattern = /\{\s*id:\s*"([^"]+)",\s*tier:\s*"([^"]+)",\s*theme:\s*"([^"]+)",\s*fen:\s*"([^"]+)"\s*\}/g;

for (const relativePath of positionFiles) {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    for (const match of source.matchAll(rowPattern)) {
        positions.push({
            id: match[1],
            tier: match[2],
            theme: match[3],
            fen: match[4],
            file: relativePath
        });
    }
}

const failures = [];
const ids = new Set();
const themeCounts = new Map();

if (positions.length !== 72) {
    failures.push(`Expected exactly 72 curated endgame positions, found ${positions.length}.`);
}

for (const position of positions) {
    if (ids.has(position.id)) failures.push(`Duplicate position id: ${position.id}`);
    ids.add(position.id);

    const themes = expectedThemes.get(position.tier);
    if (!themes?.has(position.theme)) {
        failures.push(`Unexpected tier/theme pair for ${position.id}: ${position.tier}/${position.theme}`);
    }

    const key = `${position.tier}/${position.theme}`;
    themeCounts.set(key, (themeCounts.get(key) || 0) + 1);

    try {
        const board = new Chess(position.fen);
        const pieceCount = board.board().flat().filter(Boolean).length;
        if (pieceCount < 2 || pieceCount > 7) {
            failures.push(`${position.id} has ${pieceCount} pieces; tablebase exercises must have 2-7.`);
        }
    } catch (error) {
        failures.push(`${position.id} has invalid FEN: ${position.fen} (${error instanceof Error ? error.message : error})`);
    }
}

for (const [tier, themes] of expectedThemes) {
    for (const theme of themes) {
        const count = themeCounts.get(`${tier}/${theme}`) || 0;
        if (count !== 4) failures.push(`${tier}/${theme} must contain 4 positions, found ${count}.`);
    }
}

if (failures.length) {
    console.error("Endgame Laboratory audit failed:");
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
}

console.log(`Endgame Laboratory audit passed: ${positions.length} legal positions across 18 themes and 3 lazy-loaded tiers.`);
