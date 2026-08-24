import type { EndgamePosition } from "../types";

const positions: EndgamePosition[] = [
    { id: "rook-cutoff-1", tier: "advanced", theme: "rook-cutoff", fen: "8/5k2/8/4P3/8/3K4/8/R5r1 w - - 0 1" },
    { id: "rook-cutoff-2", tier: "advanced", theme: "rook-cutoff", fen: "8/2k5/8/3P4/8/4K3/8/1R5r w - - 0 1" },
    { id: "rook-cutoff-3", tier: "advanced", theme: "rook-cutoff", fen: "8/5k2/5p2/4P3/8/3K4/8/R5r1 w - - 0 1" },
    { id: "rook-cutoff-4", tier: "advanced", theme: "rook-cutoff", fen: "8/2k5/2p5/3P4/8/4K3/8/1R5r w - - 0 1" },

    { id: "side-checks-1", tier: "advanced", theme: "side-checks", fen: "8/6k1/5p2/6P1/8/4K3/8/R6r w - - 0 1" },
    { id: "side-checks-2", tier: "advanced", theme: "side-checks", fen: "8/1k6/2p5/1P6/8/3K4/8/r6R w - - 0 1" },
    { id: "side-checks-3", tier: "advanced", theme: "side-checks", fen: "8/6k1/5p2/6P1/5P2/4K3/8/R6r w - - 0 1" },
    { id: "side-checks-4", tier: "advanced", theme: "side-checks", fen: "8/1k6/2p5/1P6/2P5/3K4/8/r6R w - - 0 1" },

    { id: "rook-two-pawns-1", tier: "advanced", theme: "rook-two-pawns", fen: "8/5k2/6p1/4P3/5P2/8/4K3/r6R w - - 0 1" },
    { id: "rook-two-pawns-2", tier: "advanced", theme: "rook-two-pawns", fen: "8/2k5/1p6/3P4/2P5/8/3K4/R6r w - - 0 1" },
    { id: "rook-two-pawns-3", tier: "advanced", theme: "rook-two-pawns", fen: "8/5k2/6p1/5P2/4P3/8/4K3/R6r w - - 0 1" },
    { id: "rook-two-pawns-4", tier: "advanced", theme: "rook-two-pawns", fen: "8/2k5/1p6/2P5/3P4/8/3K4/r6R w - - 0 1" },

    { id: "triangulation-1", tier: "advanced", theme: "triangulation", fen: "8/8/4k3/3p4/3P4/4K3/8/8 w - - 0 1" },
    { id: "triangulation-2", tier: "advanced", theme: "triangulation", fen: "8/8/3k4/4p3/4P3/3K4/8/8 w - - 0 1" },
    { id: "triangulation-3", tier: "advanced", theme: "triangulation", fen: "8/8/4k3/2pp4/2PP4/4K3/8/8 w - - 0 1" },
    { id: "triangulation-4", tier: "advanced", theme: "triangulation", fen: "8/8/3k4/4pp2/4PP2/3K4/8/8 w - - 0 1" },

    { id: "fortress-1", tier: "advanced", theme: "fortress", fen: "7k/7P/6K1/8/8/8/8/5B2 w - - 0 1" },
    { id: "fortress-2", tier: "advanced", theme: "fortress", fen: "k7/P7/1K6/8/8/8/8/2B5 w - - 0 1" },
    { id: "fortress-3", tier: "advanced", theme: "fortress", fen: "7k/7P/5K2/8/8/8/8/5B2 w - - 0 1" },
    { id: "fortress-4", tier: "advanced", theme: "fortress", fen: "k7/P7/2K5/8/8/8/8/2B5 w - - 0 1" },

    { id: "queen-rook-1", tier: "advanced", theme: "queen-rook", fen: "8/5k2/8/8/8/8/4K2Q/6r1 w - - 0 1" },
    { id: "queen-rook-2", tier: "advanced", theme: "queen-rook", fen: "8/2k5/8/8/8/8/3K4/Qr6 w - - 0 1" },
    { id: "queen-rook-3", tier: "advanced", theme: "queen-rook", fen: "8/5k2/6p1/8/8/8/4K2Q/6r1 w - - 0 1" },
    { id: "queen-rook-4", tier: "advanced", theme: "queen-rook", fen: "8/2k5/1p6/8/8/8/3K4/Qr6 w - - 0 1" }
];

export default positions;
