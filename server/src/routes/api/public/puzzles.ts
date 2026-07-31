import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Filter } from "mongodb";
import mongoose from "mongoose";

import Collection from "@/constants/Collection";

interface PuzzleDocument {
    _id: string;
    fen: string;
    moves: string[];
    rating: number;
    popularity: number;
    themes: string[];
    openingTags: string[];
    gameUrl?: string;
    randomKey: number;
}

interface CatalogueItem {
    value: string;
    count: number;
}

interface PuzzleCatalogueDocument {
    _id: string;
    count: number;
    themes: CatalogueItem[];
    openingTags: CatalogueItem[];
    importedAt: string;
    sourceSha256?: string;
}

const categoryThemes = {
    checkmate: [
        "mate",
        "mateIn1",
        "mateIn2",
        "mateIn3",
        "mateIn4",
        "mateIn5",
        "anastasiaMate",
        "arabianMate",
        "backRankMate",
        "balestraMate",
        "blindSwineMate",
        "bodenMate",
        "cornerMate",
        "doubleBishopMate",
        "dovetailMate",
        "epauletteMate",
        "hookMate",
        "killBoxMate",
        "morphysMate",
        "operaMate",
        "pillsburysMate",
        "smotheredMate",
        "swallowstailMate",
        "triangleMate",
        "vukovicMate"
    ],
    tactics: [
        "advancedPawn",
        "attraction",
        "capturingDefender",
        "castling",
        "clearance",
        "collinearMove",
        "deflection",
        "discoveredAttack",
        "discoveredCheck",
        "doubleCheck",
        "enPassant",
        "fork",
        "hangingPiece",
        "interference",
        "intermezzo",
        "pin",
        "promotion",
        "quietMove",
        "sacrifice",
        "skewer",
        "trappedPiece",
        "underPromotion",
        "xRayAttack",
        "zugzwang"
    ],
    attack: [
        "attackingF2F7",
        "exposedKing",
        "kingsideAttack",
        "queensideAttack"
    ],
    defense: [
        "defensiveMove",
        "equality"
    ],
    advantage: [
        "advantage",
        "crushing",
        "equality"
    ],
    endgame: [
        "endgame",
        "bishopEndgame",
        "knightEndgame",
        "pawnEndgame",
        "queenEndgame",
        "queenRookEndgame",
        "rookEndgame",
        "advancedPawn",
        "promotion",
        "underPromotion",
        "zugzwang"
    ],
    phase: [
        "opening",
        "middlegame",
        "endgame"
    ],
    length: [
        "oneMove",
        "short",
        "long",
        "veryLong"
    ],
    master: [
        "master",
        "masterVsMaster",
        "superGM"
    ]
} as const;

type FilterCategory = keyof typeof categoryThemes | "all" | "opening";

const validCategories = new Set<FilterCategory>([
    "all",
    "checkmate",
    "tactics",
    "attack",
    "defense",
    "advantage",
    "endgame",
    "opening",
    "phase",
    "length",
    "master"
]);

const router = Router();

function queryString(value: unknown) {
    return typeof value == "string" ? value : undefined;
}

function boundedInteger(
    value: unknown,
    fallback: number,
    minimum: number,
    maximum: number
) {
    const parsed = Number.parseInt(queryString(value) || "", 10);

    if (!Number.isFinite(parsed)) return fallback;

    return Math.min(maximum, Math.max(minimum, parsed));
}

function sanitiseIdentifier(value: unknown) {
    const identifier = queryString(value);

    if (
        !identifier
        || identifier.length > 180
        || !/^[\w:+.-]+$/u.test(identifier)
    ) return;

    return identifier;
}

function addDifficultyFilter(
    filter: Filter<PuzzleDocument>,
    difficulty: string | undefined,
    rating: number,
    attempts: number
) {
    switch (difficulty) {
        case "adaptive":
            if (attempts >= 12) {
                filter.rating = {
                    $gte: rating - 300,
                    $lte: rating + 300
                };
            }
            break;
        case "beginner":
            filter.rating = { $lt: 1200 };
            break;
        case "intermediate":
            filter.rating = { $gte: 1200, $lt: 1800 };
            break;
        case "advanced":
            filter.rating = { $gte: 1800, $lt: 2200 };
            break;
        case "expert":
            filter.rating = { $gte: 2200 };
            break;
        default:
            filter.rating = {
                $gte: rating - 300,
                $lte: rating + 300
            };
    }
}

function createPuzzleFilter(
    category: FilterCategory,
    kind: string | undefined,
    value: string | undefined,
    difficulty: string | undefined,
    rating: number,
    attempts: number,
    excludedIds: string[]
) {
    const filter: Filter<PuzzleDocument> = {};

    if (excludedIds.length > 0) {
        filter._id = { $nin: excludedIds };
    }

    if (kind == "theme" && value) {
        filter.themes = value;
    } else if (kind == "opening" && value) {
        filter.openingTags = value;
    } else if (category == "opening") {
        filter.$or = [
            { themes: "opening" },
            { "openingTags.0": { $exists: true } }
        ];
    } else if (category != "all") {
        filter.themes = { $in: [...categoryThemes[category]] };
    }

    addDifficultyFilter(
        filter,
        difficulty,
        rating,
        attempts
    );

    return filter;
}

router.get("/puzzles/catalogue", async (req, res) => {
    const database = mongoose.connection.db;
    if (!database) {
        return res
            .status(StatusCodes.SERVICE_UNAVAILABLE)
            .json({ error: "Puzzle database is unavailable." });
    }

    const catalogue = await database
        .collection<PuzzleCatalogueDocument>(Collection.PUZZLE_METADATA)
        .findOne({ _id: "catalogue" });

    if (!catalogue) {
        return res
            .status(StatusCodes.SERVICE_UNAVAILABLE)
            .json({ error: "Puzzle database has not been imported yet." });
    }

    res.json({
        count: catalogue.count,
        themes: catalogue.themes,
        openingTags: catalogue.openingTags,
        importedAt: catalogue.importedAt
    });
});

router.get("/puzzles/next", async (req, res) => {
    const database = mongoose.connection.db;
    if (!database) {
        return res
            .status(StatusCodes.SERVICE_UNAVAILABLE)
            .json({ error: "Puzzle database is unavailable." });
    }

    const requestedCategory = queryString(req.query.category) || "all";
    if (!validCategories.has(requestedCategory as FilterCategory)) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: "Invalid puzzle category." });
    }

    const kind = queryString(req.query.kind);
    const value = sanitiseIdentifier(req.query.value);
    if (
        (kind && kind != "theme" && kind != "opening")
        || (kind && !value)
    ) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: "Invalid puzzle filter." });
    }

    const excludedIds = (queryString(req.query.exclude) || "")
        .split(",")
        .map(id => id.replace(/^lichess:/, ""))
        .filter(id => /^[\w-]{1,32}$/u.test(id))
        .slice(0, 120);
    const rating = boundedInteger(req.query.rating, 1500, 600, 3000);
    const attempts = boundedInteger(req.query.attempts, 0, 0, 1_000_000);
    const filter = createPuzzleFilter(
        requestedCategory as FilterCategory,
        kind,
        value,
        queryString(req.query.difficulty),
        rating,
        attempts,
        excludedIds
    );
    const randomKey = Math.random();
    const puzzles = database.collection<PuzzleDocument>(Collection.PUZZLES);
    const projection = {
        fen: 1,
        moves: 1,
        rating: 1,
        popularity: 1,
        themes: 1,
        openingTags: 1,
        gameUrl: 1
    };

    let puzzle = await puzzles.findOne(
        {
            ...filter,
            randomKey: { $gte: randomKey }
        },
        {
            sort: { randomKey: 1 },
            projection
        }
    );

    if (!puzzle) {
        puzzle = await puzzles.findOne(
            {
                ...filter,
                randomKey: { $lt: randomKey }
            },
            {
                sort: { randomKey: 1 },
                projection
            }
        );
    }

    if (!puzzle) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .json({ error: "No puzzle matches these filters." });
    }

    res.json({
        puzzle: {
            id: puzzle._id,
            fen: puzzle.fen,
            moves: puzzle.moves,
            rating: puzzle.rating,
            popularity: puzzle.popularity,
            themes: puzzle.themes,
            openingTags: puzzle.openingTags,
            gameUrl: puzzle.gameUrl
        }
    });
});

export default router;
