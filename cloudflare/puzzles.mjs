const CATEGORY_THEMES = {
    checkmate: [
        "mate", "mateIn1", "mateIn2", "mateIn3", "mateIn4", "mateIn5",
        "anastasiaMate", "arabianMate", "backRankMate", "balestraMate",
        "blindSwineMate", "bodenMate", "cornerMate", "doubleBishopMate",
        "dovetailMate", "epauletteMate", "hookMate", "killBoxMate",
        "morphysMate", "operaMate", "pillsburysMate", "smotheredMate",
        "swallowstailMate", "triangleMate", "vukovicMate"
    ],
    tactics: [
        "advancedPawn", "attraction", "capturingDefender", "castling",
        "clearance", "collinearMove", "deflection", "discoveredAttack",
        "discoveredCheck", "doubleCheck", "enPassant", "fork",
        "hangingPiece", "interference", "intermezzo", "pin", "promotion",
        "quietMove", "sacrifice", "skewer", "trappedPiece",
        "underPromotion", "xRayAttack", "zugzwang"
    ],
    attack: [
        "attackingF2F7", "exposedKing", "kingsideAttack", "queensideAttack"
    ],
    defense: ["defensiveMove", "equality"],
    advantage: ["advantage", "crushing", "equality"],
    endgame: [
        "endgame", "bishopEndgame", "knightEndgame", "pawnEndgame",
        "queenEndgame", "queenRookEndgame", "rookEndgame", "advancedPawn",
        "promotion", "underPromotion", "zugzwang"
    ],
    phase: ["opening", "middlegame", "endgame"],
    length: ["oneMove", "short", "long", "veryLong"],
    master: ["master", "masterVsMaster", "superGM"]
};

const VALID_CATEGORIES = new Set([
    "all", "checkmate", "tactics", "attack", "defense", "advantage",
    "endgame", "opening", "phase", "length", "master"
]);

const VALID_DIFFICULTIES = new Set([
    "adaptive", "beginner", "intermediate", "advanced", "expert"
]);

function queryString(value) {
    return typeof value === "string" ? value : undefined;
}

function boundedInteger(value, fallback, minimum, maximum) {
    const parsed = Number.parseInt(queryString(value) || "", 10);

    if (!Number.isFinite(parsed)) return fallback;

    return Math.min(maximum, Math.max(minimum, parsed));
}

function sanitiseIdentifier(value) {
    const identifier = queryString(value);

    if (
        !identifier
        || identifier.length > 180
        || !/^[\w:+.-]+$/u.test(identifier)
    ) return;

    return identifier;
}

function parseJsonArray(value) {
    try {
        const parsed = JSON.parse(value || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function randomKey() {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0];
}

function addDifficultyFilter(clauses, bindings, difficulty, rating, attempts) {
    switch (difficulty) {
        case "adaptive":
            if (attempts >= 12) {
                clauses.push("p.rating BETWEEN ? AND ?");
                bindings.push(rating - 300, rating + 300);
            }
            break;
        case "beginner":
            clauses.push("p.rating < ?");
            bindings.push(1200);
            break;
        case "intermediate":
            clauses.push("p.rating >= ? AND p.rating < ?");
            bindings.push(1200, 1800);
            break;
        case "advanced":
            clauses.push("p.rating >= ? AND p.rating < ?");
            bindings.push(1800, 2200);
            break;
        case "expert":
            clauses.push("p.rating >= ?");
            bindings.push(2200);
            break;
    }
}

function createPuzzleQuery({
    category,
    kind,
    value,
    difficulty,
    rating,
    attempts,
    excludedIds,
    threshold,
    wrap
}) {
    let from = "puzzles p";
    const clauses = [];
    const bindings = [];

    if (kind === "theme") {
        from += " JOIN puzzle_themes filter ON filter.puzzle_id = p.id";
        clauses.push("filter.theme = ?");
        bindings.push(value);
    } else if (kind === "opening") {
        from += " JOIN puzzle_openings filter ON filter.puzzle_id = p.id";
        clauses.push("filter.opening_tag = ?");
        bindings.push(value);
    } else if (category === "opening") {
        clauses.push("p.opening_available = 1");
    } else if (category !== "all") {
        from += " JOIN puzzle_themes filter ON filter.puzzle_id = p.id";
        clauses.push(
            "filter.theme IN (SELECT value FROM json_each(?))"
        );
        bindings.push(JSON.stringify(CATEGORY_THEMES[category] || []));
    }

    addDifficultyFilter(
        clauses,
        bindings,
        difficulty,
        rating,
        attempts
    );

    if (excludedIds.length > 0) {
        clauses.push(
            "p.id NOT IN (SELECT value FROM json_each(?))"
        );
        bindings.push(JSON.stringify(excludedIds));
    }

    clauses.push(wrap ? "p.random_key < ?" : "p.random_key >= ?");
    bindings.push(threshold);

    const sql = `
        SELECT DISTINCT
            p.id,
            p.fen,
            p.moves_json AS movesJson,
            p.rating,
            p.popularity,
            p.themes_json AS themesJson,
            p.opening_tags_json AS openingTagsJson,
            p.game_url AS gameUrl,
            p.random_key AS randomKey
        FROM ${from}
        WHERE ${clauses.join(" AND ")}
        ORDER BY p.random_key ASC
        LIMIT 1
    `;

    return { sql, bindings };
}

async function findPuzzle(database, filters) {
    const threshold = randomKey();

    for (const wrap of [false, true]) {
        const { sql, bindings } = createPuzzleQuery({
            ...filters,
            threshold,
            wrap
        });
        const puzzle = await database.prepare(sql).bind(...bindings).first();

        if (puzzle) return puzzle;
    }
}

async function catalogue(database, json) {
    const [metadata, themesResult, openingsResult] = await Promise.all([
        database.prepare(`
            SELECT count, imported_at AS importedAt
            FROM puzzle_catalogue
            WHERE id = 1
        `).first(),
        database.prepare(`
            SELECT value, count
            FROM puzzle_theme_counts
            ORDER BY count DESC, value ASC
        `).all(),
        database.prepare(`
            SELECT value, count
            FROM puzzle_opening_counts
            ORDER BY count DESC, value ASC
        `).all()
    ]);

    if (!metadata) {
        return json({ error: "Puzzle database has not been imported yet." }, 503);
    }

    return json({
        count: metadata.count,
        themes: themesResult.results || [],
        openingTags: openingsResult.results || [],
        importedAt: metadata.importedAt
    });
}

async function nextPuzzle(request, database, json) {
    const url = new URL(request.url);
    const requestedCategory = url.searchParams.get("category") || "all";
    const difficulty = url.searchParams.get("difficulty") || "adaptive";

    if (!VALID_CATEGORIES.has(requestedCategory)) {
        return json({ error: "Invalid puzzle category." }, 400);
    }

    if (!VALID_DIFFICULTIES.has(difficulty)) {
        return json({ error: "Invalid puzzle difficulty." }, 400);
    }

    const kind = url.searchParams.get("kind") || undefined;
    const value = sanitiseIdentifier(url.searchParams.get("value") || undefined);

    if (
        (kind && kind !== "theme" && kind !== "opening")
        || (kind && !value)
    ) {
        return json({ error: "Invalid puzzle filter." }, 400);
    }

    const excludedIds = (url.searchParams.get("exclude") || "")
        .split(",")
        .map(id => id.replace(/^lichess:/, ""))
        .filter(id => /^[\w-]{1,32}$/u.test(id))
        .slice(-120);
    const rating = boundedInteger(
        url.searchParams.get("rating"),
        1500,
        600,
        3000
    );
    const attempts = boundedInteger(
        url.searchParams.get("attempts"),
        0,
        0,
        1_000_000
    );

    const puzzle = await findPuzzle(database, {
        category: requestedCategory,
        kind,
        value,
        difficulty,
        rating,
        attempts,
        excludedIds
    });

    if (!puzzle) {
        return json({ error: "No puzzle matches these filters." }, 404);
    }

    return json({
        puzzle: {
            id: puzzle.id,
            fen: puzzle.fen,
            moves: parseJsonArray(puzzle.movesJson),
            rating: puzzle.rating,
            popularity: puzzle.popularity,
            themes: parseJsonArray(puzzle.themesJson),
            openingTags: parseJsonArray(puzzle.openingTagsJson),
            ...(puzzle.gameUrl ? { gameUrl: puzzle.gameUrl } : {})
        }
    });
}

export async function handlePuzzleRequest(request, env, pathname, json) {
    const database = env.PUZZLES_DB;

    if (!database) {
        return json({
            error: "The Cloudflare puzzle database is not bound yet."
        }, 503);
    }

    try {
        if (pathname === "/api/public/puzzles/catalogue") {
            return catalogue(database, json);
        }

        if (pathname === "/api/public/puzzles/next") {
            return nextPuzzle(request, database, json);
        }
    } catch (error) {
        console.error("Puzzle database request failed.", error);
        return json({ error: "Puzzle database is temporarily unavailable." }, 503);
    }

    return json({ error: "Puzzle endpoint not found." }, 404);
}
