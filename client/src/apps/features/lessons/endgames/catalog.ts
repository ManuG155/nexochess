import type { EndgamePosition, EndgameTheme, EndgameTier } from "./types";

export const ENDGAME_THEMES: EndgameTheme[] = [
    { id: "basic-mates", tier: "basic", symbol: "♜", count: 4 },
    { id: "pawn-square", tier: "basic", symbol: "□", count: 4 },
    { id: "opposition", tier: "basic", symbol: "↔", count: 4 },
    { id: "key-squares", tier: "basic", symbol: "◆", count: 4 },
    { id: "rook-pawn", tier: "basic", symbol: "♙", count: 4 },
    { id: "pawn-race", tier: "basic", symbol: "⇢", count: 4 },

    { id: "lucena", tier: "intermediate", symbol: "⊔", count: 4 },
    { id: "philidor", tier: "intermediate", symbol: "⊣", count: 4 },
    { id: "rook-behind-pawn", tier: "intermediate", symbol: "♖", count: 4 },
    { id: "active-rook", tier: "intermediate", symbol: "↗", count: 4 },
    { id: "minor-piece-pawns", tier: "intermediate", symbol: "♘", count: 4 },
    { id: "queen-vs-pawn", tier: "intermediate", symbol: "♕", count: 4 },

    { id: "rook-cutoff", tier: "advanced", symbol: "┫", count: 4 },
    { id: "side-checks", tier: "advanced", symbol: "↔", count: 4 },
    { id: "rook-two-pawns", tier: "advanced", symbol: "♜", count: 4 },
    { id: "triangulation", tier: "advanced", symbol: "△", count: 4 },
    { id: "fortress", tier: "advanced", symbol: "▣", count: 4 },
    { id: "queen-rook", tier: "advanced", symbol: "♛", count: 4 }
];

export const ENDGAME_TIERS: EndgameTier[] = [
    "basic",
    "intermediate",
    "advanced"
];

export async function loadEndgamePositions(
    tier: EndgameTier
): Promise<EndgamePosition[]> {
    if (tier == "basic") {
        return (await import("./positions/basic")).default;
    }
    if (tier == "intermediate") {
        return (await import("./positions/intermediate")).default;
    }
    return (await import("./positions/advanced")).default;
}
