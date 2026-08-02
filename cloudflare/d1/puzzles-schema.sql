DROP TABLE IF EXISTS puzzle_opening_counts;
DROP TABLE IF EXISTS puzzle_theme_counts;
DROP TABLE IF EXISTS puzzle_openings;
DROP TABLE IF EXISTS puzzle_themes;
DROP TABLE IF EXISTS puzzles;
DROP TABLE IF EXISTS puzzle_catalogue;

CREATE TABLE puzzle_catalogue (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    count INTEGER NOT NULL,
    imported_at TEXT NOT NULL,
    source_sha256 TEXT
);

CREATE TABLE puzzles (
    id TEXT PRIMARY KEY,
    fen TEXT NOT NULL,
    moves_json TEXT NOT NULL,
    rating INTEGER NOT NULL,
    popularity INTEGER NOT NULL,
    themes_json TEXT NOT NULL,
    opening_tags_json TEXT NOT NULL,
    game_url TEXT,
    random_key INTEGER NOT NULL,
    opening_available INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE puzzle_themes (
    puzzle_id TEXT NOT NULL,
    theme TEXT NOT NULL,
    PRIMARY KEY (puzzle_id, theme),
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE
);

CREATE TABLE puzzle_openings (
    puzzle_id TEXT NOT NULL,
    opening_tag TEXT NOT NULL,
    PRIMARY KEY (puzzle_id, opening_tag),
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE
);

CREATE TABLE puzzle_theme_counts (
    value TEXT PRIMARY KEY,
    count INTEGER NOT NULL
);

CREATE TABLE puzzle_opening_counts (
    value TEXT PRIMARY KEY,
    count INTEGER NOT NULL
);
