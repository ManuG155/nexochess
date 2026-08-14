import { parse } from "@mliebelt/pgn-parser";

export interface ImportedMove {
    san: string;
    note: string;
}

export interface ImportedPgnLine {
    moves: ImportedMove[];
}

interface ParsedMove {
    notation?: {
        notation?: string;
    };
    commentMove?: string;
    commentAfter?: string;
    variations?: ParsedMove[][];
}

interface ParsedGame {
    tags?: Record<string, string>;
    moves?: ParsedMove[];
}

function cleanNote(...parts: Array<string | undefined>) {
    return parts
        .map(part => part?.trim())
        .filter((part): part is string => Boolean(part))
        .join("\n\n");
}

function expandMoves(
    moves: ParsedMove[],
    prefix: ImportedMove[] = []
): ImportedPgnLine[] {
    let current = [...prefix];
    const alternatives: ImportedPgnLine[] = [];

    for (const move of moves) {
        for (const variation of move.variations || []) {
            alternatives.push(...expandMoves(variation, current));
        }

        const san = move.notation?.notation?.trim();
        if (!san) continue;

        current = [
            ...current,
            {
                san,
                note: cleanNote(move.commentMove, move.commentAfter)
            }
        ];
    }

    return current.length > 0
        ? [{ moves: current }, ...alternatives]
        : alternatives;
}

function deduplicate(lines: ImportedPgnLine[]) {
    const seen = new Set<string>();
    return lines.filter(line => {
        const key = line.moves.map(move => move.san).join(" ");
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export function parsePgnRepertoire(content: string): ImportedPgnLine[] {
    const input = content.trim();
    if (!input) return [];

    try {
        const parsed = parse(input, { startRule: "games" }) as ParsedGame[];
        const games = Array.isArray(parsed) ? parsed : [];
        return deduplicate(games.flatMap(game => expandMoves(game.moves || [])));
    } catch {
        try {
            const parsed = parse(input, { startRule: "game" }) as ParsedGame;
            return deduplicate(expandMoves(parsed.moves || []));
        } catch {
            return [];
        }
    }
}
