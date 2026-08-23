export type EndgameTier = "basic" | "intermediate" | "advanced";

export type EndgameThemeId =
    | "basic-mates"
    | "pawn-square"
    | "opposition"
    | "key-squares"
    | "rook-pawn"
    | "pawn-race"
    | "lucena"
    | "philidor"
    | "rook-behind-pawn"
    | "active-rook"
    | "minor-piece-pawns"
    | "queen-vs-pawn"
    | "rook-cutoff"
    | "side-checks"
    | "rook-two-pawns"
    | "triangulation"
    | "fortress"
    | "queen-rook";

export interface EndgamePosition {
    id: string;
    tier: EndgameTier;
    theme: EndgameThemeId;
    fen: string;
}

export interface EndgameTheme {
    id: EndgameThemeId;
    tier: EndgameTier;
    symbol: string;
    count: number;
}

export type TablebaseCategory =
    | "win"
    | "unknown"
    | "maybe-win"
    | "cursed-win"
    | "draw"
    | "blessed-loss"
    | "maybe-loss"
    | "loss";

export interface TablebaseMove {
    uci: string;
    san: string;
    category: TablebaseCategory;
    dtz?: number | null;
    precise_dtz?: number | null;
    dtm?: number | null;
}

export interface TablebaseProbe {
    category: TablebaseCategory;
    dtz?: number | null;
    precise_dtz?: number | null;
    dtm?: number | null;
    moves: TablebaseMove[];
}

export type CoarseOutcome = "win" | "draw" | "loss";
