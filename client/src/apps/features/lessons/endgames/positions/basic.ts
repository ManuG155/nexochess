import type { EndgamePosition } from "../types";

const positions: EndgamePosition[] = [
    { id: "basic-mates-1", tier: "basic", theme: "basic-mates", fen: "8/8/8/8/8/4K3/6Q1/7k w - - 0 1" },
    { id: "basic-mates-2", tier: "basic", theme: "basic-mates", fen: "8/8/8/8/2K5/8/1Q6/k7 w - - 0 1" },
    { id: "basic-mates-3", tier: "basic", theme: "basic-mates", fen: "8/8/8/8/8/4K3/6R1/7k w - - 0 1" },
    { id: "basic-mates-4", tier: "basic", theme: "basic-mates", fen: "8/8/8/8/2K5/8/1R6/k7 w - - 0 1" },

    { id: "pawn-square-1", tier: "basic", theme: "pawn-square", fen: "8/8/8/8/4k3/8/P7/4K3 w - - 0 1" },
    { id: "pawn-square-2", tier: "basic", theme: "pawn-square", fen: "8/8/8/8/2k5/8/7P/4K3 w - - 0 1" },
    { id: "pawn-square-3", tier: "basic", theme: "pawn-square", fen: "4k3/p7/8/4K3/8/8/8/8 b - - 0 1" },
    { id: "pawn-square-4", tier: "basic", theme: "pawn-square", fen: "4k3/7p/8/2K5/8/8/8/8 b - - 0 1" },

    { id: "opposition-1", tier: "basic", theme: "opposition", fen: "8/8/4k3/8/4P3/4K3/8/8 w - - 0 1" },
    { id: "opposition-2", tier: "basic", theme: "opposition", fen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1" },
    { id: "opposition-3", tier: "basic", theme: "opposition", fen: "8/8/3k4/8/3P4/3K4/8/8 w - - 0 1" },
    { id: "opposition-4", tier: "basic", theme: "opposition", fen: "8/8/8/3k4/8/3K4/3P4/8 w - - 0 1" },

    { id: "key-squares-1", tier: "basic", theme: "key-squares", fen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1" },
    { id: "key-squares-2", tier: "basic", theme: "key-squares", fen: "8/8/5k2/8/5P2/5K2/8/8 w - - 0 1" },
    { id: "key-squares-3", tier: "basic", theme: "key-squares", fen: "8/8/2k5/8/2P5/2K5/8/8 w - - 0 1" },
    { id: "key-squares-4", tier: "basic", theme: "key-squares", fen: "8/8/8/2k5/8/2K5/2P5/8 w - - 0 1" },

    { id: "rook-pawn-1", tier: "basic", theme: "rook-pawn", fen: "8/8/8/8/8/k7/P7/K7 w - - 0 1" },
    { id: "rook-pawn-2", tier: "basic", theme: "rook-pawn", fen: "8/8/8/8/8/1k6/P7/K7 w - - 0 1" },
    { id: "rook-pawn-3", tier: "basic", theme: "rook-pawn", fen: "8/8/8/8/8/6k1/7P/6K1 w - - 0 1" },
    { id: "rook-pawn-4", tier: "basic", theme: "rook-pawn", fen: "8/8/8/8/8/5k2/7P/6K1 w - - 0 1" },

    { id: "pawn-race-1", tier: "basic", theme: "pawn-race", fen: "8/8/8/8/4k3/8/P6p/4K3 w - - 0 1" },
    { id: "pawn-race-2", tier: "basic", theme: "pawn-race", fen: "8/8/8/8/3k4/8/1P4p1/4K3 w - - 0 1" },
    { id: "pawn-race-3", tier: "basic", theme: "pawn-race", fen: "4k3/p6P/8/8/3K4/8/8/8 b - - 0 1" },
    { id: "pawn-race-4", tier: "basic", theme: "pawn-race", fen: "4k3/1p4P1/8/8/3K4/8/8/8 b - - 0 1" }
];

export default positions;
