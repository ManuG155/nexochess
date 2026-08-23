import type { EndgamePosition } from "../types";

const positions: EndgamePosition[] = [
    { id: "lucena-1", tier: "intermediate", theme: "lucena", fen: "2K5/2P3k1/8/8/8/8/r7/3R4 w - - 0 1" },
    { id: "lucena-2", tier: "intermediate", theme: "lucena", fen: "1K6/1P4k1/8/8/8/8/r7/3R4 w - - 0 1" },
    { id: "lucena-3", tier: "intermediate", theme: "lucena", fen: "5K2/5P2/3k4/8/8/8/7r/4R3 w - - 0 1" },
    { id: "lucena-4", tier: "intermediate", theme: "lucena", fen: "6K1/6P1/4k3/8/8/8/7r/4R3 w - - 0 1" },

    { id: "philidor-1", tier: "intermediate", theme: "philidor", fen: "8/R3k3/8/4K3/4P3/8/8/1r6 b - - 0 1" },
    { id: "philidor-2", tier: "intermediate", theme: "philidor", fen: "8/1R3k2/8/5K2/5P2/8/8/2r5 b - - 0 1" },
    { id: "philidor-3", tier: "intermediate", theme: "philidor", fen: "8/2R3k1/8/5K2/5P2/8/8/3r4 b - - 0 1" },
    { id: "philidor-4", tier: "intermediate", theme: "philidor", fen: "8/R4k2/8/4K3/4P3/8/8/2r5 b - - 0 1" },

    { id: "rook-behind-pawn-1", tier: "intermediate", theme: "rook-behind-pawn", fen: "8/5k2/8/4P3/8/8/4K3/r6R w - - 0 1" },
    { id: "rook-behind-pawn-2", tier: "intermediate", theme: "rook-behind-pawn", fen: "8/2k5/8/3P4/8/8/3K4/R6r w - - 0 1" },
    { id: "rook-behind-pawn-3", tier: "intermediate", theme: "rook-behind-pawn", fen: "8/5k2/6p1/8/8/8/4K2R/r7 w - - 0 1" },
    { id: "rook-behind-pawn-4", tier: "intermediate", theme: "rook-behind-pawn", fen: "8/2k5/1p6/8/8/8/R2K4/7r w - - 0 1" },

    { id: "active-rook-1", tier: "intermediate", theme: "active-rook", fen: "8/5k2/6p1/5p2/8/8/4K3/R6r w - - 0 1" },
    { id: "active-rook-2", tier: "intermediate", theme: "active-rook", fen: "8/2k5/1p6/2p5/8/8/3K4/r6R w - - 0 1" },
    { id: "active-rook-3", tier: "intermediate", theme: "active-rook", fen: "8/5k2/6p1/8/5P2/8/4K3/R6r w - - 0 1" },
    { id: "active-rook-4", tier: "intermediate", theme: "active-rook", fen: "8/2k5/1p6/8/2P5/8/3K4/r6R w - - 0 1" },

    { id: "minor-piece-pawns-1", tier: "intermediate", theme: "minor-piece-pawns", fen: "8/5k2/6p1/4P3/8/8/4K2B/6b1 w - - 0 1" },
    { id: "minor-piece-pawns-2", tier: "intermediate", theme: "minor-piece-pawns", fen: "8/5k2/6p1/4P3/8/8/4K2N/6n1 w - - 0 1" },
    { id: "minor-piece-pawns-3", tier: "intermediate", theme: "minor-piece-pawns", fen: "8/5k2/6p1/4P3/8/8/4K2B/6n1 w - - 0 1" },
    { id: "minor-piece-pawns-4", tier: "intermediate", theme: "minor-piece-pawns", fen: "8/5k2/6p1/4P3/8/8/4K2N/6b1 w - - 0 1" },

    { id: "queen-vs-pawn-1", tier: "intermediate", theme: "queen-vs-pawn", fen: "8/5k2/6p1/8/8/8/4K2Q/8 w - - 0 1" },
    { id: "queen-vs-pawn-2", tier: "intermediate", theme: "queen-vs-pawn", fen: "8/5k2/8/8/8/6p1/4K2Q/8 w - - 0 1" },
    { id: "queen-vs-pawn-3", tier: "intermediate", theme: "queen-vs-pawn", fen: "8/2k5/1p6/8/8/8/3K4/Q7 w - - 0 1" },
    { id: "queen-vs-pawn-4", tier: "intermediate", theme: "queen-vs-pawn", fen: "8/2k5/8/8/8/1p6/3K4/Q7 w - - 0 1" }
];

export default positions;
