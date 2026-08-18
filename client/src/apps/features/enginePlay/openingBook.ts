const OPENING_LINES: string[][] = [
    // Open games: Ruy Lopez, Italian, Scotch and Four Knights.
    ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6", "b5a4", "g8f6", "e1g1", "f8e7", "f1e1", "b7b5", "a4b3", "d7d6", "c2c3", "e8g8"],
    ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "c2c3", "g8f6", "d2d4", "e5d4", "c3d4", "c5b4", "b1c3", "f6e4"],
    ["e2e4", "e7e5", "g1f3", "b8c6", "d2d4", "e5d4", "f3d4", "g8f6", "b1c3", "f8b4", "d4c6", "b7c6"],
    ["e2e4", "e7e5", "g1f3", "b8c6", "b1c3", "g8f6", "f1b5", "f8b4", "e1g1", "e8g8"],
    ["e2e4", "e7e5", "f1c4", "g8f6", "d2d3", "f8c5", "g1f3", "d7d6", "e1g1", "e8g8"],

    // Sicilian families.
    ["e2e4", "c7c5", "g1f3", "d7d6", "d2d4", "c5d4", "f3d4", "g8f6", "b1c3", "a7a6", "c1e3", "e7e5"],
    ["e2e4", "c7c5", "g1f3", "b8c6", "d2d4", "c5d4", "f3d4", "g8f6", "b1c3", "e7e5", "d4b5", "d7d6"],
    ["e2e4", "c7c5", "g1f3", "e7e6", "d2d4", "c5d4", "f3d4", "b8c6", "b1c3", "d8c7"],
    ["e2e4", "c7c5", "c2c3", "g8f6", "e4e5", "f6d5", "d2d4", "c5d4", "g1f3"],

    // French, Caro-Kann, Scandinavian, Pirc and Modern.
    ["e2e4", "e7e6", "d2d4", "d7d5", "b1c3", "g8f6", "e4e5", "f6d7", "f2f4", "c7c5", "g1f3", "b8c6"],
    ["e2e4", "e7e6", "d2d4", "d7d5", "e4d5", "e6d5", "g1f3", "g8f6", "f1d3"],
    ["e2e4", "c7c6", "d2d4", "d7d5", "b1c3", "d5e4", "c3e4", "c8f5", "e4g3", "f5g6"],
    ["e2e4", "c7c6", "d2d4", "d7d5", "e4e5", "c8f5", "g1f3", "e7e6"],
    ["e2e4", "d7d5", "e4d5", "d8d5", "b1c3", "d5d8", "d2d4", "g8f6"],
    ["e2e4", "d7d6", "d2d4", "g8f6", "b1c3", "g7g6", "g1f3", "f8g7", "f1e2", "e8g8"],
    ["e2e4", "g7g6", "d2d4", "f8g7", "b1c3", "d7d6", "f2f4", "g8f6"],
    ["e2e4", "g8f6", "e4e5", "f6d5", "d2d4", "d7d6", "g1f3"],

    // Queen's pawn openings: QGD, Slav, King's Indian, Nimzo and Queen's Indian.
    ["d2d4", "d7d5", "c2c4", "e7e6", "b1c3", "g8f6", "c1g5", "f8e7", "g1f3", "e8g8", "e2e3", "b8d7"],
    ["d2d4", "d7d5", "c2c4", "c7c6", "g1f3", "g8f6", "b1c3", "d5c4", "a2a4", "c8f5"],
    ["d2d4", "g8f6", "c2c4", "g7g6", "b1c3", "f8g7", "e2e4", "d7d6", "g1f3", "e8g8", "f1e2", "e7e5"],
    ["d2d4", "g8f6", "c2c4", "e7e6", "b1c3", "f8b4", "e2e3", "e8g8", "f1d3", "d7d5"],
    ["d2d4", "g8f6", "c2c4", "e7e6", "g1f3", "b7b6", "g2g3", "c8b7", "f1g2", "f8e7"],
    ["d2d4", "d7d5", "g1f3", "g8f6", "e2e3", "e7e6", "f1d3", "c7c5", "e1g1"],
    ["d2d4", "f7f5", "g2g3", "g8f6", "f1g2", "g7g6", "g1f3", "f8g7", "e1g1", "e8g8"],

    // English and Reti structures.
    ["c2c4", "e7e5", "b1c3", "g8f6", "g2g3", "d7d5", "c4d5", "f6d5", "f1g2", "d5b6"],
    ["c2c4", "c7c5", "b1c3", "b8c6", "g2g3", "g7g6", "f1g2", "f8g7", "g1f3"],
    ["c2c4", "e7e6", "g1f3", "d7d5", "d2d4", "g8f6", "b1c3"],
    ["g1f3", "d7d5", "g2g3", "g8f6", "f1g2", "e7e6", "e1g1", "f8e7", "d2d4", "e8g8"],
    ["g1f3", "g8f6", "c2c4", "g7g6", "b1c3", "f8g7", "d2d4", "e8g8"],

    // A few sound first-move transpositions so the book does not collapse after a normal choice.
    ["e2e4", "e7e5", "b1c3", "g8f6", "g1f3", "b8c6"],
    ["d2d4", "g8f6", "g1f3", "d7d5", "c2c4", "e7e6"],
    ["c2c4", "g8f6", "b1c3", "e7e5", "g2g3", "d7d5"],
    ["g1f3", "d7d5", "d2d4", "g8f6", "c2c4", "e7e6"]
];

const theoryBook = new Map<string, string[]>();

for (const line of OPENING_LINES) {
    for (let index = 0; index < line.length; index += 1) {
        const key = line.slice(0, index).join(" ");
        const nextMove = line[index];
        const existing = theoryBook.get(key) || [];
        if (!existing.includes(nextMove)) theoryBook.set(key, [...existing, nextMove]);
    }
}

function normaliseUci(uci: string) {
    return uci.trim().toLowerCase();
}

export function getTheoryMoves(history: readonly string[]) {
    const key = history.map(normaliseUci).join(" ");
    return theoryBook.get(key) || [];
}

export function isTheoryMove(history: readonly string[], uci: string) {
    return getTheoryMoves(history).includes(normaliseUci(uci));
}
