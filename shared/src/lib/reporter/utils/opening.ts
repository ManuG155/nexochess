import openings from "@/resources/openings.json" with { type: "json" };

const openingsDatabase = openings as Record<string, string>;

/**
 * Normalize a FEN to the EPD-like position key used by the generated
 * opening database.
 *
 * We intentionally keep:
 * - piece placement
 * - side to move
 * - castling rights
 * - en-passant square
 *
 * We intentionally discard halfmove/fullmove counters.
 *
 * This avoids the collisions caused by the old WintrChess database,
 * which keyed positions only by piece placement.
 */
export function getOpeningPositionKey(
    fen: string
) {
    const fields = fen
        .trim()
        .split(/\s+/);

    if (
        fields.length < 4
    ) {
        return undefined;
    }

    return fields
        .slice(0, 4)
        .join(" ");
}

export function getOpeningName(
    fen: string
) {
    const key =
        getOpeningPositionKey(
            fen
        );

    if (
        !key
    ) {
        return undefined;
    }

    return openingsDatabase[
        key
    ];
}
