import { Chess } from "chess.js";
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, "..");
const OUTPUT_PATH = resolve(
    PROJECT_ROOT,
    "shared/src/resources/openings.json"
);

const SOURCES = ["a", "b", "c", "d", "e"].map(
    volume =>
        `https://raw.githubusercontent.com/lichess-org/chess-openings/master/${volume}.tsv`
);

function normalizeFen(fen) {
    const fields = fen.trim().split(/\s+/);

    if (fields.length < 4) {
        throw new Error(`Invalid FEN: ${fen}`);
    }

    // EPD-like key: board + side to move + castling + en-passant.
    // Move counters are deliberately ignored.
    return fields.slice(0, 4).join(" ");
}

function openingFamily(name) {
    return name.split(":", 1)[0].trim();
}

function tokenizeMainline(pgn) {
    return pgn
        .replace(/\{[^}]*\}/g, " ")
        .replace(/\([^)]*\)/g, " ")
        .replace(/\$\d+/g, " ")
        .split(/\s+/)
        .map(token => token.trim())
        .filter(Boolean)
        .map(token => token.replace(/^\d+\.(?:\.\.)?/, ""))
        .filter(token => token.length > 0)
        .filter(token => !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token));
}

function parseTsv(text) {
    const lines = text
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .filter(Boolean);

    if (lines.length === 0) {
        return [];
    }

    const header = lines[0].split("\t");
    const ecoIndex = header.indexOf("eco");
    const nameIndex = header.indexOf("name");
    const pgnIndex = header.indexOf("pgn");

    if (ecoIndex < 0 || nameIndex < 0 || pgnIndex < 0) {
        throw new Error("Unexpected lichess chess-openings TSV header");
    }

    return lines.slice(1).map(line => {
        const fields = line.split("\t");

        return {
            eco: fields[ecoIndex]?.trim() ?? "",
            name: fields[nameIndex]?.trim() ?? "",
            pgn: fields[pgnIndex]?.trim() ?? ""
        };
    }).filter(row => row.name && row.pgn);
}

async function fetchSource(url) {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "WintrChess-opening-database-generator"
        }
    });

    if (!response.ok) {
        throw new Error(
            `Could not download ${url}: ${response.status} ${response.statusText}`
        );
    }

    return parseTsv(await response.text());
}

function addVote(votes, key, name) {
    let names = votes.get(key);

    if (!names) {
        names = new Map();
        votes.set(key, names);
    }

    names.set(name, (names.get(name) ?? 0) + 1);
}

function chooseVotedName(names) {
    return [...names.entries()]
        .sort((a, b) => {
            const countDifference = b[1] - a[1];

            if (countDifference !== 0) {
                return countDifference;
            }

            // On a tie prefer the shorter, more generic family label.
            return a[0].length - b[0].length;
        })[0][0];
}

async function main() {
    console.log("Downloading current lichess-org/chess-openings data...");

    const sourceRows = (
        await Promise.all(SOURCES.map(fetchSource))
    ).flat();

    console.log(`Loaded ${sourceRows.length} named opening lines.`);

    // Exact named positions always win over inferred prefix names.
    const exactNames = new Map();

    // Prefix positions are populated by voting on the opening family.
    // This fills the holes that made WintrChess stop calling theory too early.
    const prefixVotes = new Map();

    let parsedLines = 0;
    let skippedLines = 0;

    for (const row of sourceRows) {
        const chess = new Chess();
        const tokens = tokenizeMainline(row.pgn);
        const positions = [];

        try {
            for (const token of tokens) {
                const move = chess.move(token, { strict: false });

                if (!move) {
                    throw new Error(`Illegal SAN token: ${token}`);
                }

                positions.push(normalizeFen(chess.fen()));
            }
        } catch (error) {
            skippedLines++;
            console.warn(
                `Skipping ${row.eco} ${row.name}: ${error instanceof Error ? error.message : error}`
            );
            continue;
        }

        if (positions.length === 0) {
            skippedLines++;
            continue;
        }

        parsedLines++;

        const family = openingFamily(row.name);

        for (const key of positions) {
            addVote(prefixVotes, key, family);
        }

        const finalKey = positions.at(-1);
        const existingExactName = exactNames.get(finalKey);

        // Some transpositions can lead to the same final position under
        // multiple labels. Prefer the more specific descriptive name.
        if (
            !existingExactName
            || row.name.length > existingExactName.length
        ) {
            exactNames.set(finalKey, row.name);
        }
    }

    const database = {};

    for (const [key, names] of prefixVotes) {
        database[key] = chooseVotedName(names);
    }

    for (const [key, name] of exactNames) {
        database[key] = name;
    }

    const sortedDatabase = Object.fromEntries(
        Object.entries(database).sort(([a], [b]) => a.localeCompare(b))
    );

    await writeFile(
        OUTPUT_PATH,
        `${JSON.stringify(sortedDatabase, null, 4)}\n`,
        "utf8"
    );

    console.log(`Parsed lines: ${parsedLines}`);
    console.log(`Skipped lines: ${skippedLines}`);
    console.log(`Generated positions: ${Object.keys(sortedDatabase).length}`);
    console.log(`Wrote: ${OUTPUT_PATH}`);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
