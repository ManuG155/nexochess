import { createHash } from "node:crypto";
import {
    appendFile,
    mkdir,
    readFile,
    readdir,
    rm,
    stat,
    writeFile
} from "node:fs/promises";
import { createReadStream } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { createInterface } from "node:readline";
import { MongoClient } from "mongodb";

const DATA_PACK_SIZE = 5_000;
const INDEX_SHARD_SIZE = 100_000;
const BUFFER_FLUSH_BYTES = 64 * 1024;
const MAX_STATIC_FILES = 19_000;
const MAX_STATIC_FILE_BYTES = 24 * 1024 * 1024;

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

const CATEGORY_THEME_SETS = Object.fromEntries(
    Object.entries(CATEGORY_THEMES)
        .map(([category, themes]) => [category, new Set(themes)])
);

function readArguments() {
    const output = process.argv[2];

    if (!output) {
        console.error(
            "Usage: node scripts/export-puzzles-static.mjs <output-directory>"
        );
        process.exit(1);
    }

    return { output: resolve(output) };
}

function difficultyBucket(rating) {
    if (rating < 1200) return "beginner";
    if (rating < 1800) return "intermediate";
    if (rating < 2200) return "advanced";
    return "expert";
}

function hashFilterKey(key) {
    return createHash("sha1").update(key).digest("hex");
}

function categoriesFor(puzzle) {
    const categories = new Set();
    const themes = new Set(puzzle.themes || []);

    for (const [category, categoryThemes] of Object.entries(
        CATEGORY_THEME_SETS
    )) {
        for (const theme of themes) {
            if (categoryThemes.has(theme)) {
                categories.add(category);
                break;
            }
        }
    }

    if (
        themes.has("opening")
        || (puzzle.openingTags || []).length > 0
    ) {
        categories.add("opening");
    }

    return [...categories];
}

function compactPuzzle(document) {
    return [
        String(document._id),
        document.fen,
        document.moves,
        document.rating,
        document.popularity || 0,
        document.themes || [],
        document.openingTags || [],
        document.gameUrl || null
    ];
}

async function writeJsonChecked(path, value) {
    const data = JSON.stringify(value);
    const bytes = Buffer.byteLength(data);

    if (bytes > MAX_STATIC_FILE_BYTES) {
        throw new Error(
            `Static file exceeds 24 MiB: ${path} (${bytes} bytes)`
        );
    }

    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);

    return bytes;
}

class BufferedIndexWriter {
    constructor(tempDirectory) {
        this.tempDirectory = tempDirectory;
        this.buffers = new Map();
        this.pendingWrites = new Map();
        this.filterMetadata = new Map();
    }

    register(key, ordinal) {
        const hash = hashFilterKey(key);
        const currentMetadata = this.filterMetadata.get(key) || {
            key,
            hash,
            count: 0
        };

        currentMetadata.count += 1;
        this.filterMetadata.set(key, currentMetadata);

        const line = `${ordinal}\n`;
        const nextBuffer = `${this.buffers.get(key) || ""}${line}`;

        if (Buffer.byteLength(nextBuffer) >= BUFFER_FLUSH_BYTES) {
            this.buffers.set(key, "");
            this.enqueue(key, hash, nextBuffer);
        } else {
            this.buffers.set(key, nextBuffer);
        }
    }

    enqueue(key, hash, chunk) {
        const path = join(this.tempDirectory, `${hash}.txt`);
        const previous = this.pendingWrites.get(key) || Promise.resolve();
        const next = previous.then(() => appendFile(path, chunk));

        this.pendingWrites.set(key, next);
    }

    async flush() {
        for (const [key, chunk] of this.buffers) {
            if (!chunk) continue;

            const metadata = this.filterMetadata.get(key);
            this.enqueue(key, metadata.hash, chunk);
            this.buffers.set(key, "");
        }

        await Promise.all(this.pendingWrites.values());
    }
}

function filterKeysForPuzzle(puzzle) {
    const bucket = difficultyBucket(puzzle.rating);
    const keys = new Set([`all|${bucket}`]);

    for (const theme of puzzle.themes || []) {
        keys.add(`theme:${theme}|${bucket}`);
    }

    for (const category of categoriesFor(puzzle)) {
        keys.add(`category:${category}|${bucket}`);
    }

    for (const opening of puzzle.openingTags || []) {
        keys.add(`opening:${opening}|${bucket}`);
    }

    return [...keys];
}

async function writeDataPack(outputDirectory, packIndex, records) {
    const filename = `${String(packIndex).padStart(5, "0")}.json`;
    const relativePath = `data/${filename}`;
    const absolutePath = join(outputDirectory, relativePath);
    const bytes = await writeJsonChecked(absolutePath, records);

    return {
        path: relativePath,
        count: records.length,
        bytes
    };
}

async function writeIndexShards(
    outputDirectory,
    tempDirectory,
    metadata
) {
    const inputPath = join(tempDirectory, `${metadata.hash}.txt`);
    const lines = createInterface({
        input: createReadStream(inputPath),
        crlfDelay: Infinity
    });
    const shards = [];
    let current = [];
    let shardIndex = 0;

    async function flushShard() {
        if (current.length === 0) return;

        const filename = `${String(shardIndex).padStart(4, "0")}.json`;
        const relativePath = `indexes/${metadata.hash}/${filename}`;
        const absolutePath = join(outputDirectory, relativePath);
        const bytes = await writeJsonChecked(absolutePath, current);

        shards.push({
            path: relativePath,
            count: current.length,
            bytes
        });
        current = [];
        shardIndex += 1;
    }

    for await (const line of lines) {
        if (!line) continue;

        current.push(Number.parseInt(line, 10));

        if (current.length >= INDEX_SHARD_SIZE) {
            await flushShard();
        }
    }

    await flushShard();

    return {
        count: metadata.count,
        shards
    };
}

async function listFilesRecursively(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const path = join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...await listFilesRecursively(path));
        } else if (entry.isFile()) {
            files.push(path);
        }
    }

    return files;
}

async function validateOutput(outputDirectory) {
    const files = await listFilesRecursively(outputDirectory);

    if (files.length > MAX_STATIC_FILES) {
        throw new Error(
            `Static export contains ${files.length} files; the safety limit is `
            + `${MAX_STATIC_FILES}. Nothing should be deployed.`
        );
    }

    let largest;

    for (const path of files) {
        const details = await stat(path);

        if (details.size > MAX_STATIC_FILE_BYTES) {
            throw new Error(
                `Static export contains an oversized file: ${path}`
            );
        }

        if (!largest || details.size > largest.size) {
            largest = { path, size: details.size };
        }
    }

    return {
        fileCount: files.length,
        largestFile: largest
    };
}

async function main() {
    const { output } = readArguments();
    const tempDirectory = join(output, ".index-source");
    const databaseUri = process.env.DATABASE_URI
        || "mongodb://database/wintrchess";
    const client = new MongoClient(databaseUri);

    await rm(output, { recursive: true, force: true });
    await mkdir(tempDirectory, { recursive: true });
    await client.connect();

    try {
        const database = client.db();
        const puzzles = database.collection("puzzles");
        const metadata = await database
            .collection("puzzleMetadata")
            .findOne({ _id: "catalogue" });
        const expectedCount = await puzzles.estimatedDocumentCount();

        if (expectedCount <= 0) {
            throw new Error("The MongoDB puzzle collection is empty.");
        }

        console.log(
            `Exporting ${expectedCount.toLocaleString("en-US")} puzzles `
            + "from MongoDB to static Cloudflare packs..."
        );

        const indexWriter = new BufferedIndexWriter(tempDirectory);
        const dataPacks = [];
        const themeCounts = new Map();
        const openingCounts = new Map();
        const cursor = puzzles.find({}, {
            projection: {
                fen: 1,
                moves: 1,
                rating: 1,
                popularity: 1,
                themes: 1,
                openingTags: 1,
                gameUrl: 1
            }
        }).sort({ _id: 1 }).batchSize(DATA_PACK_SIZE);
        let pack = [];
        let packIndex = 0;
        let ordinal = 0;

        for await (const puzzle of cursor) {
            pack.push(compactPuzzle(puzzle));

            for (const theme of puzzle.themes || []) {
                themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
            }

            for (const opening of puzzle.openingTags || []) {
                openingCounts.set(
                    opening,
                    (openingCounts.get(opening) || 0) + 1
                );
            }

            for (const key of filterKeysForPuzzle(puzzle)) {
                indexWriter.register(key, ordinal);
            }

            ordinal += 1;

            if (pack.length >= DATA_PACK_SIZE) {
                dataPacks.push(
                    await writeDataPack(output, packIndex, pack)
                );
                pack = [];
                packIndex += 1;
            }

            if (ordinal % 100_000 === 0) {
                console.log(
                    `${ordinal.toLocaleString("en-US")} puzzles exported...`
                );
            }
        }

        if (pack.length > 0) {
            dataPacks.push(
                await writeDataPack(output, packIndex, pack)
            );
        }

        await indexWriter.flush();

        const filters = {};
        let processedFilters = 0;

        for (const metadataEntry of indexWriter.filterMetadata.values()) {
            filters[metadataEntry.key] = await writeIndexShards(
                output,
                tempDirectory,
                metadataEntry
            );
            processedFilters += 1;

            if (processedFilters % 250 === 0) {
                console.log(
                    `${processedFilters.toLocaleString("en-US")} filter `
                    + "indexes generated..."
                );
            }
        }

        const sortCounts = counts => [...counts.entries()]
            .map(([value, count]) => ({ value, count }))
            .sort((left, right) => (
                right.count - left.count
                || left.value.localeCompare(right.value)
            ));

        const catalogue = {
            formatVersion: 1,
            source: "NexoChess MongoDB puzzle collection",
            sourceLicense: "CC0-1.0",
            sourceSha256: metadata?.sourceSha256,
            generatedAt: new Date().toISOString(),
            count: ordinal,
            dataPackSize: DATA_PACK_SIZE,
            indexShardSize: INDEX_SHARD_SIZE,
            dataPacks,
            filters,
            themes: sortCounts(themeCounts),
            openingTags: sortCounts(openingCounts)
        };

        await writeJsonChecked(join(output, "catalogue.json"), catalogue);
        await writeFile(join(output, "_headers"), `/*\n  Access-Control-Allow-Origin: *\n  Cache-Control: public, max-age=31536000, immutable\n\n/catalogue.json\n  Cache-Control: public, max-age=300\n`);
        await rm(tempDirectory, { recursive: true, force: true });

        const validation = await validateOutput(output);

        if (ordinal !== expectedCount) {
            throw new Error(
                `Exported ${ordinal} puzzles but MongoDB reported `
                + `${expectedCount}. Nothing should be deployed.`
            );
        }

        console.log("");
        console.log("STATIC PUZZLE EXPORT COMPLETED");
        console.log(`Puzzles: ${ordinal.toLocaleString("en-US")}`);
        console.log(`Data packs: ${dataPacks.length.toLocaleString("en-US")}`);
        console.log(
            `Filter indexes: ${processedFilters.toLocaleString("en-US")}`
        );
        console.log(`Files: ${validation.fileCount.toLocaleString("en-US")}`);
        console.log(
            `Largest file: ${validation.largestFile.path} `
            + `(${(validation.largestFile.size / 1024 / 1024).toFixed(2)} MiB)`
        );
        console.log(`Output: ${output}`);
    } finally {
        await client.close();
    }
}

await main();
