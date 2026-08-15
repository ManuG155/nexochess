import type { Square } from "chess.js";

import type { CurriculumLesson } from "./curriculum";

export type PracticePrompt =
    | "moveTarget"
    | "findMove"
    | "selectConcept"
    | "selectMover"
    | "selectTarget"
    | "choose";

export type PracticeChoice =
    | "yes"
    | "no"
    | "white"
    | "black"
    | "one"
    | "three"
    | "five"
    | "nine"
    | "draw"
    | "stalemate"
    | "checkmate"
    | "continue"
    | "resign"
    | "offerDraw";

export interface PracticeMove {
    from: Square;
    to: Square;
}

interface PracticeBase {
    id: string;
    fen: string;
    prompt: PracticePrompt;
    focusSquares?: Square[];
    arrows?: Array<[Square, Square]>;
    brilliant?: boolean;
}

export interface MovePractice extends PracticeBase {
    kind: "move";
    expected: PracticeMove;
    accepted?: PracticeMove[];
    revealTarget?: boolean;
}

export interface SelectPractice extends PracticeBase {
    kind: "select";
    acceptedSquares: Square[];
}

export interface ChoicePractice extends PracticeBase {
    kind: "choice";
    choices: PracticeChoice[];
    correctChoice: PracticeChoice;
}

export type PracticePosition = MovePractice | SelectPractice | ChoicePractice;

export interface PracticeLesson {
    lessonId: string;
    positions: PracticePosition[];
}

type PieceCode = "K" | "Q" | "R" | "B" | "N" | "P" | "k" | "q" | "r" | "b" | "n" | "p";
type PieceMap = Partial<Record<Square, PieceCode>>;
type TransformName = "identity" | "mirrorFiles" | "mirrorRanks" | "rotate180";

interface FenOptions {
    turn?: "w" | "b";
    castling?: string;
    ep?: string;
}

const FILES = "abcdefgh";
const ALL_SQUARES: Square[] = Array.from({ length: 64 }, (_, index) => {
    const file = FILES[index % 8];
    const rank = Math.floor(index / 8) + 1;
    return `${file}${rank}` as Square;
});

function square(file: number, rank: number): Square {
    return `${FILES[file]}${rank}` as Square;
}

function makeFen(pieces: PieceMap, options: FenOptions = {}) {
    const ranks: string[] = [];

    for (let rank = 8; rank >= 1; rank -= 1) {
        let empty = 0;
        let row = "";

        for (let file = 0; file < 8; file += 1) {
            const piece = pieces[square(file, rank)];
            if (!piece) {
                empty += 1;
                continue;
            }

            if (empty) {
                row += String(empty);
                empty = 0;
            }
            row += piece;
        }

        if (empty) row += String(empty);
        ranks.push(row);
    }

    return `${ranks.join("/")} ${options.turn || "w"} ${options.castling || "-"} ${options.ep || "-"} 0 1`;
}

function baseKings(extra: PieceMap = {}): PieceMap {
    return { a1: "K", h8: "k", ...extra };
}

function transformSquare(value: Square, transform: TransformName): Square {
    const file = FILES.indexOf(value[0]);
    const rank = Number(value[1]);

    if (transform == "mirrorFiles") return square(7 - file, rank);
    if (transform == "mirrorRanks") return square(file, 9 - rank);
    if (transform == "rotate180") return square(7 - file, 9 - rank);
    return value;
}

function transformPieces(pieces: PieceMap, transform: TransformName): PieceMap {
    const output: PieceMap = {};
    Object.entries(pieces).forEach(([key, piece]) => {
        output[transformSquare(key as Square, transform)] = piece;
    });
    return output;
}

function transformMove(move: PracticeMove, transform: TransformName): PracticeMove {
    return {
        from: transformSquare(move.from, transform),
        to: transformSquare(move.to, transform)
    };
}

function moveSeed(
    id: string,
    pieces: PieceMap,
    expected: PracticeMove,
    prompt: PracticePrompt = "findMove",
    extras: Partial<Omit<MovePractice, "id" | "fen" | "kind" | "expected" | "prompt">> = {},
    options: FenOptions = {}
): MovePractice {
    return {
        id,
        kind: "move",
        fen: makeFen(pieces, options),
        prompt,
        expected,
        ...extras
    };
}

function selectSeed(
    id: string,
    pieces: PieceMap,
    acceptedSquares: Square[],
    prompt: PracticePrompt = "selectConcept",
    extras: Partial<Omit<SelectPractice, "id" | "fen" | "kind" | "acceptedSquares" | "prompt">> = {},
    options: FenOptions = {}
): SelectPractice {
    return {
        id,
        kind: "select",
        fen: makeFen(pieces, options),
        prompt,
        acceptedSquares,
        ...extras
    };
}

function choiceSeed(
    id: string,
    pieces: PieceMap,
    choices: PracticeChoice[],
    correctChoice: PracticeChoice,
    extras: Partial<Omit<ChoicePractice, "id" | "fen" | "kind" | "choices" | "correctChoice" | "prompt">> = {},
    options: FenOptions = {}
): ChoicePractice {
    return {
        id,
        kind: "choice",
        fen: makeFen(pieces, options),
        prompt: "choose",
        choices,
        correctChoice,
        ...extras
    };
}

function transformPractice(position: PracticePosition, transform: TransformName, suffix: string): PracticePosition {
    if (transform == "identity") return { ...position, id: `${position.id}-${suffix}` };

    const fenParts = position.fen.split(" ");
    const pieceMap: PieceMap = {};
    const ranks = fenParts[0].split("/");

    ranks.forEach((row, rowIndex) => {
        let file = 0;
        for (const char of row) {
            if (/\d/.test(char)) {
                file += Number(char);
            } else {
                pieceMap[square(file, 8 - rowIndex)] = char as PieceCode;
                file += 1;
            }
        }
    });

    const transformedPieces = transformPieces(pieceMap, transform);
    const transformedFen = makeFen(transformedPieces, { turn: fenParts[1] as "w" | "b" });
    const common = {
        ...position,
        id: `${position.id}-${suffix}`,
        fen: transformedFen,
        focusSquares: position.focusSquares?.map(value => transformSquare(value, transform)),
        arrows: position.arrows?.map(([from, to]) => [
            transformSquare(from, transform),
            transformSquare(to, transform)
        ] as [Square, Square])
    };

    if (position.kind == "move") {
        return {
            ...common,
            kind: "move",
            expected: transformMove(position.expected, transform),
            accepted: position.accepted?.map(move => transformMove(move, transform))
        };
    }

    if (position.kind == "select") {
        return {
            ...common,
            kind: "select",
            acceptedSquares: position.acceptedSquares.map(value => transformSquare(value, transform))
        };
    }

    return common as ChoicePractice;
}

function expand(
    seeds: PracticePosition[],
    count: number,
    transforms: TransformName[] = ["identity", "mirrorFiles", "mirrorRanks", "rotate180"]
) {
    const output: PracticePosition[] = [];
    let round = 0;

    while (output.length < count) {
        for (const transform of transforms) {
            for (const seed of seeds) {
                if (output.length >= count) break;
                output.push(transformPractice(seed, transform, `${round}-${transform}`));
            }
            if (output.length >= count) break;
        }
        round += 1;
    }

    return output;
}

function pieceMovement(piece: PieceCode, count: number) {
    const config: Record<string, Array<[Square, Square]>> = {
        R: [["d4", "g4"], ["d4", "d7"]],
        B: [["d4", "g7"], ["d4", "a1"]],
        Q: [["d4", "h4"], ["d4", "g7"]],
        K: [["d4", "e5"], ["d4", "c3"]],
        N: [["d4", "f5"], ["d4", "b5"]]
    };

    const moves = config[piece] || config.R;
    const seeds = moves.map(([from, to], index) => moveSeed(
        `piece-${piece}-${index}`,
        baseKings({ [from]: piece } as PieceMap),
        { from, to },
        "moveTarget",
        { revealTarget: true, focusSquares: [from, to], arrows: [[from, to]] }
    ));

    return expand(seeds, count);
}

function pawnMovement(count: number) {
    const seeds: PracticePosition[] = [
        moveSeed("pawn-one", baseKings({ e2: "P" }), { from: "e2", to: "e3" }, "moveTarget", { revealTarget: true, focusSquares: ["e2", "e3"] }),
        moveSeed("pawn-two", baseKings({ d2: "P" }), { from: "d2", to: "d4" }, "moveTarget", { revealTarget: true, focusSquares: ["d2", "d4"] }),
        moveSeed("pawn-capture", baseKings({ c4: "P", d5: "p" }), { from: "c4", to: "d5" }, "moveTarget", { revealTarget: true, focusSquares: ["c4", "d5"] }),
        moveSeed("pawn-right", baseKings({ f5: "P", g6: "p" }), { from: "f5", to: "g6" }, "moveTarget", { revealTarget: true, focusSquares: ["f5", "g6"] })
    ];
    return expand(seeds, count, ["identity", "mirrorFiles"]);
}

function boardBasics(id: string, count: number): PracticePosition[] {
    if (id.endsWith(".board")) {
        const targets: Square[] = ["a1", "h8", "d4", "e5", "a8", "h1", "c6", "f2"];
        return targets.slice(0, count).map((target, index) => selectSeed(
            `board-${index}`,
            baseKings(),
            [target],
            "selectTarget",
            { focusSquares: [target] }
        ));
    }

    if (id.endsWith(".sides") || id.endsWith(".white-first")) {
        const whiteSquares: Square[] = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1", "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"];
        const start: PieceMap = {
            a1: "R", b1: "N", c1: "B", d1: "Q", e1: "K", f1: "B", g1: "N", h1: "R",
            a2: "P", b2: "P", c2: "P", d2: "P", e2: "P", f2: "P", g2: "P", h2: "P",
            a7: "p", b7: "p", c7: "p", d7: "p", e7: "p", f7: "p", g7: "p", h7: "p",
            a8: "r", b8: "n", c8: "b", d8: "q", e8: "k", f8: "b", g8: "n", h8: "r"
        };
        return Array.from({ length: count }, (_, index) => selectSeed(
            `sides-${index}`,
            start,
            whiteSquares,
            "selectMover"
        ));
    }

    if (id.endsWith(".turns")) {
        const seeds = [
            selectSeed("turn-white", baseKings({ c3: "N", f6: "n" }), ["a1", "c3"], "selectMover"),
            selectSeed("turn-black", baseKings({ c3: "N", f6: "n" }), ["h8", "f6"], "selectMover", {}, { turn: "b" })
        ];
        return expand(seeds, count, ["identity", "mirrorFiles"]);
    }

    if (id.endsWith("capture-optional")) {
        const seeds = [
            moveSeed("optional-one", baseKings({ d4: "R", d7: "p" }), { from: "d4", to: "g4" }, "moveTarget", { revealTarget: true }),
            moveSeed("optional-two", baseKings({ c4: "B", f7: "p" }), { from: "c4", to: "e2" }, "moveTarget", { revealTarget: true })
        ];
        return expand(seeds, count);
    }

    if (id.endsWith(".setup")) {
        const targets: Array<[Square, PieceCode]> = [["e1", "K"], ["d1", "Q"], ["a1", "R"], ["b1", "N"], ["c1", "B"], ["e2", "P"]];
        return Array.from({ length: count }, (_, index) => {
            const [target, piece] = targets[index % targets.length];
            return selectSeed(`setup-${index}`, baseKings({ [target]: piece } as PieceMap), [target], "selectConcept", { focusSquares: [target] });
        });
    }

    return [];
}

function captureAndBlocking(id: string, count: number): PracticePosition[] {
    if (id.endsWith(".capture")) {
        const seeds = [
            moveSeed("capture-rook", baseKings({ a1: "R", a6: "p" }), { from: "a1", to: "a6" }, "moveTarget", { revealTarget: true }),
            moveSeed("capture-bishop", baseKings({ c2: "B", f5: "p" }), { from: "c2", to: "f5" }, "moveTarget", { revealTarget: true }),
            moveSeed("capture-knight", baseKings({ d4: "N", f5: "p" }), { from: "d4", to: "f5" }, "moveTarget", { revealTarget: true })
        ];
        return expand(seeds, count);
    }

    if (id.endsWith(".blocking")) {
        const seeds = [
            selectSeed("blocked-rook", baseKings({ a1: "R", a3: "P", a6: "p" }), ["a3"], "selectConcept", { focusSquares: ["a1", "a3", "a6"] }),
            selectSeed("blocked-bishop", baseKings({ c1: "B", d2: "P", g5: "p" }), ["d2"], "selectConcept", { focusSquares: ["c1", "d2", "g5"] })
        ];
        return expand(seeds, count);
    }

    if (id.endsWith("knight-jumps")) {
        const seeds = [
            moveSeed("jump-one", baseKings({ d4: "N", d5: "P", e4: "P", c4: "P" }), { from: "d4", to: "f5" }, "moveTarget", { revealTarget: true }),
            moveSeed("jump-two", baseKings({ e4: "N", e5: "P", d4: "P", f4: "P" }), { from: "e4", to: "c5" }, "moveTarget", { revealTarget: true })
        ];
        return expand(seeds, count);
    }

    return [];
}

function checkRules(id: string, count: number): PracticePosition[] {
    if (id.endsWith(".check")) {
        const seeds = [
            moveSeed("check-rook", baseKings({ e2: "R", e8: "k", h1: "K" }), { from: "e2", to: "e7" }, "findMove"),
            moveSeed("check-bishop", { a1: "K", h8: "k", c4: "B" }, { from: "c4", to: "g8" }, "findMove")
        ];
        return expand(seeds, count, ["identity", "mirrorFiles"]);
    }

    if (id.endsWith("king-safety-rule")) {
        const seeds = [
            selectSeed("unsafe-one", { a1: "K", h8: "k", d4: "K", d8: "r" }, ["d5", "d3"], "selectConcept", { focusSquares: ["d4", "d8"] }),
            selectSeed("unsafe-two", { a1: "K", h8: "k", e4: "K", h4: "r" }, ["f4"], "selectConcept", { focusSquares: ["e4", "h4"] })
        ];
        return expand(seeds, count, ["identity", "mirrorFiles"]);
    }

    if (id.endsWith("escape-check")) {
        const seeds = [
            moveSeed("escape-rook", { a1: "K", a8: "r", h8: "k" }, { from: "a1", to: "b1" }, "findMove"),
            moveSeed("escape-bishop", { e1: "K", b4: "b", h8: "k" }, { from: "e1", to: "f1" }, "findMove")
        ];
        return expand(seeds, count, ["identity", "mirrorFiles"]);
    }

    if (id.endsWith(".checkmate")) {
        const seeds = [
            moveSeed("mate-back", { a1: "K", e1: "R", g8: "k", f7: "p", g7: "p", h7: "p" }, { from: "e1", to: "e8" }, "findMove"),
            moveSeed("mate-queen", { f6: "K", g6: "Q", h8: "k", g7: "p", h7: "p" }, { from: "g6", to: "g7" }, "findMove")
        ];
        return expand(seeds, count, ["identity", "mirrorFiles"]);
    }

    if (id.endsWith("mate-vs-stalemate")) {
        const mate = { f6: "K", g7: "Q", h8: "k" } as PieceMap;
        const stalemate = { f7: "K", g6: "Q", h8: "k" } as PieceMap;
        const seeds: PracticePosition[] = [
            choiceSeed("mate-state", mate, ["checkmate", "stalemate"], "checkmate", {}, { turn: "b" }),
            choiceSeed("stalemate-state", stalemate, ["checkmate", "stalemate"], "stalemate", {}, { turn: "b" })
        ];
        return expand(seeds, count, ["identity", "mirrorFiles"]);
    }

    return [];
}

function beginnerRules(id: string, count: number): PracticePosition[] {
    if (id.endsWith("piece-values")) {
        const seeds: PracticePosition[] = [
            choiceSeed("value-queen", baseKings({ d4: "Q" }), ["three", "five", "nine"], "nine"),
            choiceSeed("value-rook", baseKings({ d4: "R" }), ["three", "five", "nine"], "five"),
            choiceSeed("value-bishop", baseKings({ d4: "B" }), ["one", "three", "five"], "three"),
            choiceSeed("value-pawn", baseKings({ d4: "P" }), ["one", "three", "five"], "one")
        ];
        return expand(seeds, count, ["identity", "mirrorFiles"]);
    }

    if (id.endsWith(".attacked")) {
        const seeds = [
            selectSeed("attacked-rook", baseKings({ d4: "R", d8: "r" }), ["d4"], "selectConcept"),
            selectSeed("attacked-knight", baseKings({ e4: "N", b7: "b" }), ["e4"], "selectConcept")
        ];
        return expand(seeds, count);
    }

    if (id.endsWith(".defended")) {
        const seeds = [
            selectSeed("defended-knight", baseKings({ d4: "N", c2: "B", h4: "r" }), ["d4"], "selectConcept"),
            selectSeed("defended-rook", baseKings({ d4: "R", d2: "Q", h4: "r" }), ["d4"], "selectConcept")
        ];
        return expand(seeds, count);
    }

    if (id.endsWith(".loose")) {
        const seeds = [
            selectSeed("loose-bishop", baseKings({ d4: "B", h4: "r", c2: "P" }), ["d4"], "selectConcept"),
            selectSeed("loose-knight", baseKings({ e5: "N", a5: "r", h2: "P" }), ["e5"], "selectConcept")
        ];
        return expand(seeds, count);
    }

    if (id.endsWith(".trades")) {
        const seeds = [
            moveSeed("trade-queen", baseKings({ d1: "Q", d8: "q" }), { from: "d1", to: "d8" }, "findMove"),
            moveSeed("trade-rook", baseKings({ a1: "R", a8: "r" }), { from: "a1", to: "a8" }, "findMove")
        ];
        return expand(seeds, count);
    }

    if (id.endsWith(".castling")) {
        const seeds: PracticePosition[] = [
            moveSeed("castle-king", { e1: "K", h1: "R", e8: "k", h8: "r" }, { from: "e1", to: "g1" }, "findMove", {}, { castling: "Kk" }),
            moveSeed("castle-queen", { a1: "R", e1: "K", a8: "r", e8: "k" }, { from: "e1", to: "c1" }, "findMove", {}, { castling: "Qq" })
        ];
        return expand(seeds, count, ["identity"]);
    }

    if (id.endsWith(".promotion")) {
        const seeds = [
            moveSeed("promote-a", { h1: "K", h8: "k", a7: "P" }, { from: "a7", to: "a8" }, "findMove"),
            moveSeed("promote-f", { a1: "K", a8: "k", f7: "P" }, { from: "f7", to: "f8" }, "findMove")
        ];
        return expand(seeds, count, ["identity", "mirrorFiles"]);
    }

    if (id.endsWith("en-passant")) {
        const seeds: PracticePosition[] = [
            moveSeed("ep-left", { a1: "K", h8: "k", e5: "P", d5: "p" }, { from: "e5", to: "d6" }, "findMove", {}, { ep: "d6" }),
            moveSeed("ep-right", { a1: "K", h8: "k", d5: "P", e5: "p" }, { from: "d5", to: "e6" }, "findMove", {}, { ep: "e6" })
        ];
        return expand(seeds, count, ["identity"]);
    }

    if (id.endsWith(".draws")) {
        const seeds: PracticePosition[] = [
            choiceSeed("draw-stalemate", { f7: "K", g6: "Q", h8: "k" }, ["draw", "checkmate", "continue"], "draw", {}, { turn: "b" }),
            choiceSeed("draw-material", { a1: "K", h8: "k" }, ["draw", "continue"], "draw")
        ];
        return expand(seeds, count, ["identity", "mirrorFiles"]);
    }

    if (id.endsWith("sportsmanship")) {
        const seeds: PracticePosition[] = [
            choiceSeed("sport-lost", { a1: "K", h8: "k", h7: "q", g7: "r" }, ["continue", "resign", "offerDraw"], "resign"),
            choiceSeed("sport-equal", { a1: "K", h8: "k", d4: "P", e5: "p" }, ["continue", "resign", "offerDraw"], "continue")
        ];
        return expand(seeds, count, ["identity", "mirrorFiles"]);
    }

    return [];
}

function openingPractice(id: string, count: number): PracticePosition[] {
    const initial: PieceMap = {
        a1: "R", b1: "N", c1: "B", d1: "Q", e1: "K", f1: "B", g1: "N", h1: "R",
        a2: "P", b2: "P", c2: "P", d2: "P", e2: "P", f2: "P", g2: "P", h2: "P",
        a7: "p", b7: "p", c7: "p", d7: "p", e7: "p", f7: "p", g7: "p", h7: "p",
        a8: "r", b8: "n", c8: "b", d8: "q", e8: "k", f8: "b", g8: "n", h8: "r"
    };

    const exact: Record<string, PracticePosition[]> = {
        "beginner.guided-game": [
            moveSeed("guided-e4", initial, { from: "e2", to: "e4" }, "findMove"),
            moveSeed("guided-nf3", { ...initial, e2: undefined, e4: "P", e7: undefined, e5: "p" }, { from: "g1", to: "f3" }, "findMove"),
            moveSeed("guided-bc4", { a1: "R", e1: "K", h1: "R", d1: "Q", f1: "B", b1: "N", g1: "N", a2: "P", b2: "P", c2: "P", d2: "P", e4: "P", f2: "P", g2: "P", h2: "P", a8: "r", e8: "k", h8: "r", d8: "q", a7: "p", b7: "p", c7: "p", d7: "p", e5: "p", f7: "p", g7: "p", h7: "p" }, { from: "f1", to: "c4" }, "findMove")
        ],
        "beginner.centre": [
            moveSeed("centre-e", initial, { from: "e2", to: "e4" }, "findMove"),
            moveSeed("centre-d", initial, { from: "d2", to: "d4" }, "findMove")
        ],
        "beginner.development": [
            moveSeed("dev-knight", initial, { from: "g1", to: "f3" }, "findMove"),
            moveSeed("dev-bishop", { ...initial, e2: undefined, e4: "P" }, { from: "f1", to: "c4" }, "findMove")
        ],
        "beginner.king-safety": [
            moveSeed("safe-castle", { e1: "K", h1: "R", f2: "P", g2: "P", h2: "P", e8: "k" }, { from: "e1", to: "g1" }, "findMove", {}, { castling: "K" }),
            moveSeed("safe-pawn", baseKings({ g2: "P", h2: "P", g8: "r" }), { from: "g2", to: "g3" }, "findMove")
        ],
        "beginner.queen-early": [
            selectSeed("queen-early", initial, ["d1"], "selectConcept"),
            selectSeed("queen-exposed", baseKings({ d4: "Q", c6: "n", f6: "n" }), ["d4"], "selectConcept")
        ],
        "beginner.finish-development": [
            moveSeed("finish-knight", { a1: "R", b1: "N", c1: "B", d1: "Q", e1: "K", f1: "B", h1: "R", a2: "P", b2: "P", c2: "P", d2: "P", e4: "P", f2: "P", g2: "P", h2: "P", h8: "k" }, { from: "b1", to: "c3" }, "findMove"),
            moveSeed("finish-bishop", { a1: "R", c1: "B", d1: "Q", e1: "K", h1: "R", a2: "P", b2: "P", c2: "P", d2: "P", e4: "P", f2: "P", g2: "P", h2: "P", h8: "k" }, { from: "c1", to: "f4" }, "findMove")
        ],
        "beginner.connect-rooks": [
            moveSeed("connect-q", { a1: "R", d1: "Q", e1: "K", h1: "R", h8: "k" }, { from: "d1", to: "d2" }, "findMove"),
            moveSeed("connect-k", { a1: "R", e1: "K", h1: "R", h8: "k" }, { from: "e1", to: "f2" }, "findMove")
        ],
        "beginner.opening-plan": [
            moveSeed("plan-centre", initial, { from: "e2", to: "e4" }, "findMove"),
            moveSeed("plan-dev", { ...initial, e2: undefined, e4: "P", e7: undefined, e5: "p" }, { from: "g1", to: "f3" }, "findMove")
        ],
        "beginner.threat-awareness": [
            selectSeed("threat-queen", baseKings({ d1: "Q", b4: "q", c3: "N" }), ["d1"], "selectConcept"),
            selectSeed("threat-rook", baseKings({ a1: "R", a8: "q", a3: "P" }), ["a3"], "selectConcept")
        ]
    };

    const seeds = exact[id];
    if (!seeds) return [];
    return expand(seeds, count, ["identity", "mirrorFiles"]);
}

function tacticPractice(id: string, count: number): PracticePosition[] {
    const seeds: Record<string, PracticePosition[]> = {
        "intermediate.threats": [
            selectSeed("threat-q", baseKings({ d4: "Q", d8: "r", h4: "b" }), ["d4"], "selectConcept"),
            selectSeed("threat-n", baseKings({ e5: "N", f7: "p", c6: "q" }), ["f7", "c6"], "selectConcept")
        ],
        "intermediate.cct": [
            moveSeed("cct-check", { a1: "K", h8: "k", e2: "R" }, { from: "e2", to: "e8" }, "findMove"),
            moveSeed("cct-capture", baseKings({ d4: "Q", d8: "r" }), { from: "d4", to: "d8" }, "findMove")
        ],
        "intermediate.double-attack": [
            moveSeed("double-q", baseKings({ d4: "Q", d8: "r", h4: "b" }), { from: "d4", to: "d8" }, "findMove"),
            moveSeed("double-n", { h1: "K", e8: "k", a8: "r", d5: "N" }, { from: "d5", to: "c7" }, "findMove")
        ],
        "intermediate.fork": [
            moveSeed("fork-n", { h1: "K", e8: "k", a8: "r", d5: "N" }, { from: "d5", to: "c7" }, "findMove"),
            moveSeed("fork-p", { a1: "K", h8: "k", d5: "P", c6: "n", e6: "b" }, { from: "d5", to: "d6" }, "findMove")
        ],
        "intermediate.pin": [
            selectSeed("pin-b", { a1: "K", e8: "k", b5: "B", c6: "n" }, ["c6"], "selectConcept", { focusSquares: ["b5", "c6", "e8"] }),
            selectSeed("pin-r", { h1: "K", e8: "k", e1: "R", e6: "n" }, ["e6"], "selectConcept", { focusSquares: ["e1", "e6", "e8"] })
        ],
        "intermediate.skewer": [
            selectSeed("skewer-r", { a1: "K", e7: "k", e8: "q", e1: "R" }, ["e8"], "selectConcept", { focusSquares: ["e1", "e7", "e8"] }, { turn: "b" }),
            selectSeed("skewer-b", { h1: "K", d6: "k", e7: "q", b4: "B" }, ["e7"], "selectConcept", { focusSquares: ["b4", "d6", "e7"] }, { turn: "b" })
        ],
        "intermediate.discovered-attack": [
            moveSeed("discover-b", baseKings({ g2: "B", f3: "N", b7: "r" }), { from: "f3", to: "e5" }, "findMove", { focusSquares: ["g2", "f3", "b7"] }),
            moveSeed("discover-r", baseKings({ d1: "R", d3: "B", d8: "q" }), { from: "d3", to: "g6" }, "findMove")
        ],
        "intermediate.discovered-check": [
            moveSeed("discover-check-b", { a1: "K", b7: "k", g2: "B", f3: "N" }, { from: "f3", to: "e5" }, "findMove", { focusSquares: ["g2", "f3", "b7"] }),
            moveSeed("discover-check-r", { a1: "K", d8: "k", d1: "R", d3: "B" }, { from: "d3", to: "g6" }, "findMove")
        ],
        "intermediate.remove-defender": [
            selectSeed("remove-def", baseKings({ d4: "Q", d7: "n", f6: "b", d8: "r" }), ["d7"], "selectConcept"),
            selectSeed("remove-def-two", baseKings({ c4: "B", f7: "p", g8: "r", e6: "n" }), ["f7"], "selectConcept")
        ],
        "intermediate.overload": [
            selectSeed("overload-q", baseKings({ d6: "q", d8: "r", h6: "p", d1: "R", h1: "Q" }), ["d6"], "selectConcept"),
            selectSeed("overload-b", baseKings({ e6: "b", c8: "r", h3: "p", e1: "R", h1: "Q" }), ["e6"], "selectConcept")
        ],
        "intermediate.deflection": [
            moveSeed("deflect-q", baseKings({ h5: "Q", h7: "r", g8: "k", f7: "p", g7: "p" }), { from: "h5", to: "h7" }, "findMove"),
            moveSeed("deflect-r", baseKings({ e1: "R", e7: "q", e8: "r" }), { from: "e1", to: "e7" }, "findMove")
        ],
        "intermediate.attraction": [
            moveSeed("attract-q", { a1: "K", g8: "k", h5: "Q", h7: "p", g7: "p" }, { from: "h5", to: "h7" }, "findMove"),
            moveSeed("attract-r", { a1: "K", e8: "k", e1: "R", e7: "p" }, { from: "e1", to: "e7" }, "findMove")
        ],
        "intermediate.interference": [
            moveSeed("interfere-b", baseKings({ c4: "B", d5: "R", h5: "q", d8: "r" }), { from: "c4", to: "d5" }, "findMove"),
            moveSeed("interfere-n", baseKings({ e4: "N", f6: "R", h6: "q", f8: "r" }), { from: "e4", to: "f6" }, "findMove")
        ],
        "intermediate.xray": [
            selectSeed("xray-q", baseKings({ d1: "R", d5: "n", d8: "q" }), ["d8"], "selectConcept", { focusSquares: ["d1", "d5", "d8"] }),
            selectSeed("xray-r", baseKings({ a1: "B", d4: "p", f6: "r" }), ["f6"], "selectConcept", { focusSquares: ["a1", "d4", "f6"] })
        ],
        "intermediate.trapped-piece": [
            selectSeed("trap-q", baseKings({ a8: "q", b7: "P", c6: "B", b5: "N" }), ["a8"], "selectConcept"),
            selectSeed("trap-r", baseKings({ h8: "r", h7: "p", g7: "P", f6: "B" }), ["h8"], "selectConcept")
        ],
        "intermediate.back-rank": [
            moveSeed("back-rank", { a1: "K", e1: "R", g8: "k", f7: "p", g7: "p", h7: "p" }, { from: "e1", to: "e8" }, "findMove"),
            moveSeed("back-rank-two", { h1: "K", d1: "R", b8: "k", a7: "p", b7: "p", c7: "p" }, { from: "d1", to: "d8" }, "findMove")
        ],
        "intermediate.ladder-mate": [
            moveSeed("ladder", { a1: "K", h8: "k", a7: "R", b6: "R" }, { from: "b6", to: "b8" }, "findMove"),
            moveSeed("ladder-two", { h1: "K", a8: "k", h7: "R", g6: "R" }, { from: "g6", to: "g8" }, "findMove")
        ],
        "intermediate.smothered-mate": [
            moveSeed("smothered", { a1: "K", h8: "k", g8: "r", g7: "p", h7: "p", d6: "N" }, { from: "d6", to: "f7" }, "findMove"),
            moveSeed("smothered-two", { h1: "K", a8: "k", b8: "r", a7: "p", b7: "p", e6: "N" }, { from: "e6", to: "c7" }, "findMove")
        ],
        "intermediate.mating-net": [
            moveSeed("net-q", { a1: "K", h8: "k", f6: "Q", g6: "R", g7: "p", h7: "p" }, { from: "g6", to: "g8" }, "findMove"),
            moveSeed("net-b", { h1: "K", a8: "k", c6: "B", b6: "R", a7: "p", b7: "p" }, { from: "b6", to: "b8" }, "findMove")
        ]
    };

    const selected = seeds[id];
    if (!selected) return [];
    return expand(selected, count, ["identity", "mirrorFiles"]);
}

function strategyPractice(id: string, count: number): PracticePosition[] {
    const seeds: Record<string, PracticePosition[]> = {
        "intermediate.activity": [
            moveSeed("activity-r", baseKings({ a1: "R" }), { from: "a1", to: "a7" }, "findMove"),
            moveSeed("activity-b", baseKings({ c1: "B", d2: "P" }), { from: "c1", to: "g5" }, "findMove")
        ],
        "intermediate.open-files": [
            moveSeed("open-file-r", baseKings({ a1: "R", d1: "R", d8: "q" }), { from: "d1", to: "d7" }, "findMove"),
            selectSeed("open-file-select", baseKings({ a1: "R", d1: "R", a2: "P", a7: "p" }), ["d1"], "selectConcept")
        ],
        "intermediate.weak-squares": [
            selectSeed("weak-d5", baseKings({ c6: "p", e6: "p", d5: "N" }), ["d5"], "selectConcept"),
            selectSeed("weak-e5", baseKings({ d6: "p", f6: "p", e5: "N" }), ["e5"], "selectConcept")
        ],
        "intermediate.passed-pawn": [
            selectSeed("passer-d", baseKings({ d5: "P", a6: "p", h6: "p" }), ["d5"], "selectConcept"),
            selectSeed("passer-f", baseKings({ f5: "P", b6: "p", c6: "p" }), ["f5"], "selectConcept")
        ],
        "intermediate.worst-piece": [
            selectSeed("worst-b", baseKings({ a1: "R", c1: "B", f3: "N", d4: "P" }), ["c1"], "selectConcept"),
            selectSeed("worst-r", baseKings({ a1: "R", h1: "R", h2: "P", g2: "P" }), ["h1"], "selectConcept")
        ],
        "ready.simplify": [
            moveSeed("simplify-q", baseKings({ d1: "Q", d8: "q", a2: "R", h7: "r" }), { from: "d1", to: "d8" }, "findMove"),
            moveSeed("simplify-r", baseKings({ a1: "R", a8: "r", d4: "Q" }), { from: "a1", to: "a8" }, "findMove")
        ]
    };
    const selected = seeds[id];
    if (!selected) return [];
    return expand(selected, count, ["identity", "mirrorFiles"]);
}

function endgamePractice(id: string, count: number): PracticePosition[] {
    const seeds: Record<string, PracticePosition[]> = {
        "ready.active-king": [
            moveSeed("active-k", { a1: "K", h8: "k", d5: "P" }, { from: "a1", to: "b2" }, "findMove"),
            moveSeed("active-k-two", { h1: "K", a8: "k", e5: "P" }, { from: "h1", to: "g2" }, "findMove")
        ],
        "ready.square-rule": [
            selectSeed("square-rule", { a1: "K", h8: "k", e5: "p" }, ["e1", "e2", "f2", "g2", "h2", "f3", "g3", "h3", "g4", "h4", "h5"], "selectConcept"),
            selectSeed("square-rule-two", { h1: "K", a8: "k", d5: "p" }, ["a1", "b1", "c1", "d1", "a2", "b2", "c2", "a3", "b3", "a4"], "selectConcept")
        ],
        "ready.opposition": [
            moveSeed("opp-k", { e4: "K", e6: "k" }, { from: "e4", to: "e5" }, "findMove"),
            moveSeed("opp-k-two", { d4: "K", d6: "k" }, { from: "d4", to: "d5" }, "findMove")
        ],
        "ready.distant-opposition": [
            moveSeed("distant", { e2: "K", e8: "k" }, { from: "e2", to: "e3" }, "findMove"),
            moveSeed("distant-two", { d2: "K", d8: "k" }, { from: "d2", to: "d3" }, "findMove")
        ],
        "ready.key-squares": [
            selectSeed("key-e", { e4: "P", a1: "K", h8: "k" }, ["d6", "e6", "f6"], "selectConcept"),
            selectSeed("key-d", { d4: "P", a1: "K", h8: "k" }, ["c6", "d6", "e6"], "selectConcept")
        ],
        "ready.king-queen-mate": [
            moveSeed("kq-box", { f6: "K", e6: "Q", h8: "k" }, { from: "e6", to: "g6" }, "findMove"),
            moveSeed("kq-mate", { f6: "K", f7: "Q", h8: "k" }, { from: "f7", to: "g7" }, "findMove")
        ],
        "ready.king-rook-mate": [
            moveSeed("kr-box", { f6: "K", e6: "R", h8: "k" }, { from: "e6", to: "g6" }, "findMove"),
            moveSeed("kr-mate", { f6: "K", f7: "R", h8: "k" }, { from: "f7", to: "h7" }, "findMove")
        ],
        "ready.pawn-endings": [
            moveSeed("pawn-end-k", { e4: "K", e5: "P", e7: "k" }, { from: "e4", to: "d5" }, "findMove"),
            moveSeed("pawn-end-p", { e5: "K", e6: "P", e8: "k" }, { from: "e6", to: "e7" }, "findMove")
        ],
        "ready.outside-passer": [
            selectSeed("outside-a", { a5: "P", d5: "P", e6: "p", h8: "k", a1: "K" }, ["a5"], "selectConcept"),
            selectSeed("outside-h", { h5: "P", e5: "P", d6: "p", a8: "k", h1: "K" }, ["h5"], "selectConcept")
        ],
        "ready.blunder-check": [
            selectSeed("blunder-q", baseKings({ d4: "Q", d8: "r" }), ["d4"], "selectConcept"),
            selectSeed("blunder-n", baseKings({ e5: "N", b8: "b" }), ["e5"], "selectConcept")
        ]
    };
    const selected = seeds[id];
    if (!selected) return [];
    return expand(selected, count, ["identity", "mirrorFiles"]);
}

function sacrificePractice(id: string, count: number): PracticePosition[] {
    const seeds: Record<string, PracticePosition[]> = {
        "ready.sacrifice-open-king": [
            moveSeed("sac-open", { a1: "K", g8: "k", h5: "Q", h7: "p", g7: "p", e1: "R" }, { from: "h5", to: "h7" }, "findMove", { brilliant: true }),
            moveSeed("sac-open-two", { h1: "K", b8: "k", a5: "Q", a7: "p", b7: "p", d1: "R" }, { from: "a5", to: "a7" }, "findMove", { brilliant: true })
        ],
        "ready.sacrifice-deflection": [
            moveSeed("sac-deflect", baseKings({ e1: "R", e7: "q", e8: "r", h5: "Q" }), { from: "e1", to: "e7" }, "findMove", { brilliant: true }),
            moveSeed("sac-deflect-two", baseKings({ d1: "R", d7: "q", d8: "r", a5: "Q" }), { from: "d1", to: "d7" }, "findMove", { brilliant: true })
        ],
        "ready.sacrifice-mate": [
            moveSeed("sac-mate", { a1: "K", h8: "k", g8: "r", g7: "p", h7: "p", d6: "N", f5: "Q" }, { from: "f5", to: "h7" }, "findMove", { brilliant: true }),
            moveSeed("sac-mate-two", { h1: "K", a8: "k", b8: "r", a7: "p", b7: "p", e6: "N", c5: "Q" }, { from: "c5", to: "a7" }, "findMove", { brilliant: true })
        ]
    };
    const selected = seeds[id];
    if (!selected) return [];
    return expand(selected, count, ["identity", "mirrorFiles"]);
}

function checkpointPractice(id: string, count: number) {
    const mixed: PracticePosition[] = [
        ...pieceMovement("R", 2),
        ...pieceMovement("N", 2),
        ...tacticPractice("intermediate.fork", 2),
        ...tacticPractice("intermediate.pin", 2),
        ...endgamePractice("ready.opposition", 2)
    ];

    if (id == "beginner.checkpoint") {
        return [
            ...pieceMovement("B", 2),
            ...pawnMovement(2),
            ...openingPractice("beginner.development", 2),
            ...beginnerRules("beginner.attacked", 2),
            ...openingPractice("beginner.king-safety", 2)
        ].slice(0, count);
    }

    return mixed.slice(0, count);
}

function generalFallback(id: string, count: number) {
    const seeds = [
        selectSeed("fallback-one", baseKings({ d4: "Q", f5: "N", c6: "p" }), ["d4"], "selectConcept"),
        moveSeed("fallback-two", baseKings({ d4: "R" }), { from: "d4", to: "d7" }, "moveTarget", { revealTarget: true })
    ];
    return expand(seeds.map(seed => ({ ...seed, id: `${id}-${seed.id}` })), count);
}

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    const { id, practiceCount } = lesson;

    let positions: PracticePosition[] = [];

    positions = boardBasics(id, practiceCount);
    if (!positions.length && id == "first-contact.rook") positions = pieceMovement("R", practiceCount);
    if (!positions.length && id == "first-contact.bishop") positions = pieceMovement("B", practiceCount);
    if (!positions.length && id == "first-contact.queen") positions = pieceMovement("Q", practiceCount);
    if (!positions.length && id == "first-contact.king") positions = pieceMovement("K", practiceCount);
    if (!positions.length && id == "first-contact.knight") positions = pieceMovement("N", practiceCount);
    if (!positions.length && id == "first-contact.pawn") positions = pawnMovement(practiceCount);
    if (!positions.length) positions = captureAndBlocking(id, practiceCount);
    if (!positions.length) positions = checkRules(id, practiceCount);
    if (!positions.length) positions = beginnerRules(id, practiceCount);
    if (!positions.length) positions = openingPractice(id, practiceCount);
    if (!positions.length) positions = tacticPractice(id, practiceCount);
    if (!positions.length) positions = strategyPractice(id, practiceCount);
    if (!positions.length) positions = endgamePractice(id, practiceCount);
    if (!positions.length) positions = sacrificePractice(id, practiceCount);

    if (!positions.length && id.endsWith("checkpoint")) {
        positions = checkpointPractice(id, practiceCount);
    }

    if (!positions.length && id == "ready.final-checkpoint") {
        positions = checkpointPractice(id, practiceCount);
    }

    if (!positions.length) positions = generalFallback(id, practiceCount);

    return {
        lessonId: lesson.id,
        positions: positions.slice(0, practiceCount)
    };
}

export function legalSquaresForSelection(fen: string, colour: "w" | "b") {
    const ranks = fen.split(" ")[0].split("/");
    const squares: Square[] = [];

    ranks.forEach((row, rowIndex) => {
        let file = 0;
        for (const char of row) {
            if (/\d/.test(char)) {
                file += Number(char);
                continue;
            }

            const isWhite = char == char.toUpperCase();
            if ((colour == "w") == isWhite) squares.push(square(file, 8 - rowIndex));
            file += 1;
        }
    });

    return squares;
}

export { ALL_SQUARES };
