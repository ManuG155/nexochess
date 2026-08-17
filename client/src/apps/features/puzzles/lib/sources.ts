import { Chess } from "chess.js";

import { Classification } from "shared/constants/Classification";
import {
    getNodeChain
} from "shared/types/game/position/StateTreeNode";
import {
    getTopEngineLine
} from "shared/types/game/position/EngineLine";

import {
    getArchivedGame,
    getArchivedGames
} from "@/lib/gameArchive";
import { trackPuzzleStarted } from "@/lib/analytics";

import {
    LichessPuzzleRecord,
    PuzzleCatalogue,
    PuzzleDifficulty,
    PuzzleProfile,
    PuzzleStaticFilter,
    PuzzleThemeSelection,
    TrainingPuzzle
} from "../types";
import { CALIBRATION_ATTEMPTS } from "./progress";
import { puzzleMatchesThemeSelection } from "./themeCatalogue";

const negativeClassifications = new Set<Classification>([
    Classification.MISTAKE,
    Classification.MISS,
    Classification.BLUNDER
]);

const ARCHIVE_CONCURRENCY = 6;
const ARCHIVE_REQUEST_TIMEOUT_MS = 20_000;
const STATIC_PUZZLE_ORIGIN =
    "https://nexochess-puzzle-data-staging.manuel-garcia-villaescusa.workers.dev";
const STATIC_PUZZLE_ATTEMPTS = 24;

const staticJsonRequests = new Map<string, Promise<unknown>>();
let catalogueRequest: Promise<PuzzleCatalogue> | undefined;

export interface ArchivePuzzleLibrary {
    puzzles: TrainingPuzzle[];
    analysedGameCount: number;
}

function withTimeout<T>(
    promise: Promise<T>,
    milliseconds: number,
    message: string
) {
    return new Promise<T>((resolve, reject) => {
        let settled = false;
        const timeout = window.setTimeout(() => {
            if (settled) return;

            settled = true;
            reject(new Error(message));
        }, milliseconds);

        promise.then(value => {
            if (settled) return;

            settled = true;
            window.clearTimeout(timeout);
            resolve(value);
        }).catch(error => {
            if (settled) return;

            settled = true;
            window.clearTimeout(timeout);
            reject(error);
        });
    });
}

async function loadStaticJson<T>(path: string): Promise<T> {
    const normalisedPath = path.replace(/^\/+/, "");
    const cached = staticJsonRequests.get(normalisedPath);

    if (cached) return cached as Promise<T>;

    const request = fetch(
        `${STATIC_PUZZLE_ORIGIN}/${normalisedPath}`,
        { cache: "force-cache" }
    ).then(async response => {
        if (!response.ok) {
            throw new Error(
                `Unable to load static puzzle data (${response.status}).`
            );
        }

        return await response.json() as T;
    });

    staticJsonRequests.set(normalisedPath, request);

    try {
        return await request;
    } catch (error) {
        staticJsonRequests.delete(normalisedPath);
        throw error;
    }
}

function randomIndex(length: number) {
    if (!Number.isInteger(length) || length <= 0) return 0;

    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);

    return randomValues[0] % length;
}

function validateSolution(fen: string, moves: string[]) {
    const board = new Chess(fen);
    const validMoves: string[] = [];

    for (const uci of moves) {
        try {
            board.move(uci);
            validMoves.push(uci);
        } catch {
            break;
        }
    }

    /*
     * Finish after the solver's move. Seven plies provide enough context
     * without turning a tactic into a full-game memorisation exercise.
     */
    const trimmed = validMoves.slice(0, 7);

    if (trimmed.length % 2 == 0) {
        trimmed.pop();
    }

    return trimmed;
}

function createArchivePuzzleId(
    fingerprint: string,
    nodeId: string
) {
    return `archive:${fingerprint}:${nodeId}`;
}

export async function loadArchivePuzzleLibrary():
    Promise<ArchivePuzzleLibrary> {
    const archiveResponse = await withTimeout(
        getArchivedGames(),
        ARCHIVE_REQUEST_TIMEOUT_MS,
        "The game archive took too long to respond."
    );
    const archive = archiveResponse.games || {};
    const puzzles: TrainingPuzzle[] = [];
    const entries = Object.entries(archive);
    let nextEntryIndex = 0;

    async function loadNextGames() {
        while (nextEntryIndex < entries.length) {
            const entryIndex = nextEntryIndex++;
            const [gameId, metadata] = entries[entryIndex];
            let response:
                Awaited<ReturnType<typeof getArchivedGame>>
                | undefined;

            try {
                response = await withTimeout(
                    getArchivedGame(gameId),
                    ARCHIVE_REQUEST_TIMEOUT_MS,
                    `Archived game ${gameId} took too long to respond.`
                );
            } catch {
                continue;
            }

            if (!response?.game) continue;

            const game = response.game;
            const chain = getNodeChain(game.stateTree);
            const fingerprint =
                game.archiveSummary?.fingerprint
                || metadata.archiveSummary?.fingerprint
                || gameId;

            for (let index = 1; index < chain.length; index++) {
                const node = chain[index];
                const classification = node.state.classification;

                if (
                    !classification
                    || !negativeClassifications.has(classification)
                ) continue;

                const line = getTopEngineLine(node.state.engineLines);
                if (!line?.moves.length) continue;

                const solution = validateSolution(
                    node.state.fen,
                    line.moves.map(move => move.uci)
                );

                if (solution.length == 0) continue;

                const board = new Chess(node.state.fen);
                const solver = board.turn() == "w" ? "white" : "black";
                const whiteName = game.players.white.username || "White";
                const blackName = game.players.black.username || "Black";

                puzzles.push({
                    id: createArchivePuzzleId(fingerprint, node.id),
                    source: "archive",
                    startFen: node.state.fen,
                    previousFen: node.parent?.state.fen,
                    solution,
                    solver,
                    evaluation: line.evaluation,
                    themes: [classification],
                    openingTags: [],
                    classification,
                    badMove: node.state.move?.san,
                    gameLabel: `${whiteName} — ${blackName}`,
                    moveNumber: Math.ceil(index / 2)
                });
            }
        }
    }

    await Promise.all(
        Array.from(
            {
                length: Math.min(
                    ARCHIVE_CONCURRENCY,
                    entries.length
                )
            },
            loadNextGames
        )
    );

    return {
        puzzles,
        analysedGameCount: entries.length
    };
}

export async function loadArchivePuzzles(): Promise<TrainingPuzzle[]> {
    const library = await loadArchivePuzzleLibrary();

    return library.puzzles;
}

export function normaliseLichessPuzzle(
    record: LichessPuzzleRecord
): TrainingPuzzle | null {
    try {
        const board = new Chess(record.fen);
        board.move(record.moves[0]);

        const startFen = board.fen();
        const solution = validateSolution(
            startFen,
            record.moves.slice(1)
        );

        if (solution.length == 0) return null;

        const solver = board.turn() == "w" ? "white" : "black";
        const puzzle: TrainingPuzzle = {
            id: `lichess:${record.id}`,
            source: "lichess",
            startFen,
            previousFen: record.fen,
            solution,
            solver,
            evaluation: {
                type: "centipawn",
                value: 0
            },
            rating: record.rating,
            themes: record.themes,
            openingTags: record.openingTags || [],
            gameUrl: record.gameUrl
        };

        trackPuzzleStarted("lichess");
        return puzzle;
    } catch {
        return null;
    }
}

function validateCatalogue(catalogue: PuzzleCatalogue) {
    if (
        !Number.isFinite(catalogue.count)
        || catalogue.count <= 0
        || !Array.isArray(catalogue.themes)
        || !Array.isArray(catalogue.openingTags)
        || !Number.isInteger(catalogue.dataPackSize)
        || (catalogue.dataPackSize || 0) <= 0
        || !Array.isArray(catalogue.dataPacks)
        || catalogue.dataPacks.length == 0
        || !catalogue.filters
        || typeof catalogue.filters != "object"
    ) {
        throw new Error("The static puzzle catalogue is empty or malformed.");
    }

    return catalogue;
}

export async function loadPuzzleCatalogue() {
    if (!catalogueRequest) {
        catalogueRequest = loadStaticJson<PuzzleCatalogue>(
            "catalogue.json"
        ).then(validateCatalogue);
    }

    try {
        return await catalogueRequest;
    } catch (error) {
        catalogueRequest = undefined;
        throw error;
    }
}

function matchesDifficulty(
    puzzle: { rating?: number },
    difficulty: PuzzleDifficulty,
    profile: PuzzleProfile
) {
    if (!puzzle.rating) return true;

    switch (difficulty) {
        case "adaptive":
            if (profile.attempts < CALIBRATION_ATTEMPTS) return true;

            return (
                puzzle.rating >= profile.rating - 300
                && puzzle.rating <= profile.rating + 300
            );
        case "beginner":
            return puzzle.rating < 1200;
        case "intermediate":
            return puzzle.rating >= 1200 && puzzle.rating < 1800;
        case "advanced":
            return puzzle.rating >= 1800 && puzzle.rating < 2200;
        case "expert":
            return puzzle.rating >= 2200;
    }
}

export function filterPuzzles(
    puzzles: TrainingPuzzle[],
    completed: Set<string>,
    theme: PuzzleThemeSelection,
    difficulty: PuzzleDifficulty,
    profile: PuzzleProfile
) {
    return puzzles.filter(puzzle => (
        !completed.has(puzzle.id)
        && puzzleMatchesThemeSelection(puzzle, theme)
        && matchesDifficulty(puzzle, difficulty, profile)
    ));
}

function staticDifficultyBucket(
    difficulty: PuzzleDifficulty,
    profile: PuzzleProfile
): Exclude<PuzzleDifficulty, "adaptive"> {
    if (difficulty != "adaptive") return difficulty;

    const rating = Number.isFinite(profile.rating)
        ? profile.rating
        : 1500;

    if (rating < 1200) return "beginner";
    if (rating < 1800) return "intermediate";
    if (rating < 2200) return "advanced";

    return "expert";
}

function staticFilterKey(
    theme: PuzzleThemeSelection,
    bucket: Exclude<PuzzleDifficulty, "adaptive">
) {
    if (theme.kind == "theme" && theme.value) {
        return `theme:${theme.value}|${bucket}`;
    }

    if (theme.kind == "opening" && theme.value) {
        return `opening:${theme.value}|${bucket}`;
    }

    if (theme.category != "all") {
        return `category:${theme.category}|${bucket}`;
    }

    return `all|${bucket}`;
}

function selectOrdinal(
    filter: PuzzleStaticFilter,
    position: number
) {
    let offset = position;

    for (const shard of filter.shards) {
        if (offset < shard.count) {
            return {
                shard,
                offset
            };
        }

        offset -= shard.count;
    }
}

function unpackStaticPuzzle(value: unknown): LichessPuzzleRecord | undefined {
    if (!Array.isArray(value) || value.length < 7) return;

    const [
        id,
        fen,
        moves,
        rating,
        popularity,
        themes,
        openingTags,
        gameUrl
    ] = value;

    if (
        typeof id != "string"
        || typeof fen != "string"
        || !Array.isArray(moves)
        || !moves.every(move => typeof move == "string")
        || !Number.isFinite(rating)
        || !Array.isArray(themes)
        || !themes.every(theme => typeof theme == "string")
        || !Array.isArray(openingTags)
        || !openingTags.every(tag => typeof tag == "string")
    ) return;

    return {
        id,
        fen,
        moves,
        rating,
        popularity: Number.isFinite(popularity) ? popularity : 0,
        themes,
        openingTags,
        gameUrl: typeof gameUrl == "string" ? gameUrl : undefined
    };
}

export async function loadNextLichessPuzzleRecord(
    completed: Set<string>,
    theme: PuzzleThemeSelection,
    difficulty: PuzzleDifficulty,
    profile: PuzzleProfile
) {
    const catalogue = await loadPuzzleCatalogue();
    const dataPackSize = catalogue.dataPackSize;
    const dataPacks = catalogue.dataPacks;
    const filters = catalogue.filters;

    if (!dataPackSize || !dataPacks || !filters) {
        throw new Error("The static puzzle catalogue is incomplete.");
    }

    const bucket = staticDifficultyBucket(difficulty, profile);
    const filter = filters[staticFilterKey(theme, bucket)];

    if (!filter || filter.count <= 0 || filter.shards.length == 0) {
        return;
    }

    for (let attempt = 0; attempt < STATIC_PUZZLE_ATTEMPTS; attempt++) {
        const selected = selectOrdinal(
            filter,
            randomIndex(filter.count)
        );

        if (!selected) continue;

        const shardValues = await loadStaticJson<unknown>(
            selected.shard.path
        );

        if (!Array.isArray(shardValues)) {
            throw new Error("A static puzzle index is malformed.");
        }

        const ordinal = shardValues[selected.offset];

        if (!Number.isInteger(ordinal) || ordinal < 0) continue;

        const packIndex = Math.floor(ordinal / dataPackSize);
        const packOffset = ordinal % dataPackSize;
        const packReference = dataPacks[packIndex];

        if (!packReference) continue;

        const pack = await loadStaticJson<unknown>(packReference.path);

        if (!Array.isArray(pack)) {
            throw new Error("A static puzzle data pack is malformed.");
        }

        const puzzle = unpackStaticPuzzle(pack[packOffset]);

        if (!puzzle || completed.has(`lichess:${puzzle.id}`)) continue;

        return puzzle;
    }
}

export function pickRandomPuzzle<T>(puzzles: T[]) {
    if (puzzles.length == 0) return;

    const selected = puzzles[randomIndex(puzzles.length)];

    if (selected && typeof selected == "object" && "source" in selected) {
        const source = (selected as { source?: unknown }).source;

        if (source == "archive" || source == "lichess") {
            trackPuzzleStarted(source);
        }
    }

    return selected;
}
