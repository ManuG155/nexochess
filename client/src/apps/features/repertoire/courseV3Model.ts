import { Chess, Move } from "chess.js";
import { OpeningCatalogueEntry } from "./openingCatalogue";
import { LessonProgress } from "./courseProgress";

export type RepertoireSide = "white" | "black";

export function courseMoves(opening?: OpeningCatalogueEntry) {
    if (!opening) return [] as Move[];
    try {
        const board = new Chess();
        board.loadPgn(opening.pgn);
        return board.history({ verbose: true });
    } catch {
        return [] as Move[];
    }
}

export function fenAt(moves: Move[], step: number) {
    const board = new Chess();
    for (const move of moves.slice(0, step)) {
        board.move({ from: move.from, to: move.to, ...(move.promotion ? { promotion: move.promotion } : {}) });
    }
    return board.fen();
}

export function inferSide(opening: OpeningCatalogueEntry): RepertoireSide {
    return /defen|counter|indian|sicilian|french|caro|scandinavian|pirc|modern|dutch|benoni|benko|slav/i.test(opening.family) ? "black" : "white";
}

export function openingFromProgress(progress: LessonProgress): OpeningCatalogueEntry {
    return { eco: progress.eco, name: progress.openingName, pgn: progress.pgn, family: progress.family };
}

export function dueLabel(progress: LessonProgress) {
    const due = new Date(progress.dueAt);
    return Number.isFinite(due.getTime()) ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(due) : "";
}
