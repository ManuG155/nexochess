import React, { useState } from "react";

export interface BoardThemePreset {
    name: string;
    label: string;
    light: string;
    dark: string;
}

export interface PieceThemePreset {
    name: string;
    label: string;
}

export const boardThemePresets: BoardThemePreset[] = [
    { name: "walnut", label: "Walnut", light: "#f0d9b5", dark: "#b58863" },
    { name: "green", label: "Green", light: "#eeeed2", dark: "#769656" },
    { name: "blue", label: "Blue", light: "#dee3e6", dark: "#8ca2ad" },
    { name: "slate", label: "Slate", light: "#d6d8dc", dark: "#6d7a8c" },
    { name: "ice", label: "Ice", light: "#e8f0f3", dark: "#8fb3c6" },
    { name: "sand", label: "Sand", light: "#f3dfc0", dark: "#c28d57" },
    { name: "rose", label: "Rose", light: "#f2d7dc", dark: "#b86d78" },
    { name: "purple", label: "Purple", light: "#ddd6f0", dark: "#8068a9" },
    { name: "charcoal", label: "Charcoal", light: "#d2d2d2", dark: "#5a5a5a" },
    { name: "ocean", label: "Ocean", light: "#d9edf5", dark: "#5d8ba8" },
    { name: "mint", label: "Mint", light: "#e0efe6", dark: "#6a9b80" },
    { name: "orange", label: "Orange", light: "#f7d9b0", dark: "#c8783d" }
];

/*
 * Standard, non-event piece sets exposed by Lichess.
 * We intentionally avoid event/sponsor-specific assets.
 *
 * Chess.com's Neo artwork is not bundled here because it is proprietary.
 * These sets are open alternatives and can be swapped without changing
 * the selector architecture.
 */
export const pieceThemePresets: PieceThemePreset[] = [
    { name: "cburnett", label: "Cburnett" },
    { name: "merida", label: "Merida" },
    { name: "alpha", label: "Alpha" },
    { name: "pirouetti", label: "Pirouetti" },
    { name: "chessnut", label: "Chessnut" },
    { name: "chess7", label: "Chess7" },
    { name: "reillycraig", label: "Reilly Craig" },
    { name: "companion", label: "Companion" },
    { name: "riohacha", label: "Riohacha" },
    { name: "kosal", label: "Kosal" },
    { name: "leipzig", label: "Leipzig" },
    { name: "fantasy", label: "Fantasy" },
    { name: "spatial", label: "Spatial" }
];

const PIECE_CODES = [
    "wK", "wQ", "wR", "wB", "wN", "wP",
    "bK", "bQ", "bR", "bB", "bN", "bP"
] as const;

export type PieceCode = typeof PIECE_CODES[number];

const PIECE_FALLBACKS: Record<PieceCode, string> = {
    wK: "♔",
    wQ: "♕",
    wR: "♖",
    wB: "♗",
    wN: "♘",
    wP: "♙",
    bK: "♚",
    bQ: "♛",
    bR: "♜",
    bB: "♝",
    bN: "♞",
    bP: "♟"
};

export function normalisePieceTheme(theme?: string) {
    return pieceThemePresets.some(option => option.name == theme)
        ? theme!
        : "cburnett";
}

export function getPieceAssetUrl(
    theme: string,
    piece: PieceCode
) {
    const safeTheme = normalisePieceTheme(theme);

    return (
        "https://lichess1.org/assets/piece/"
        + `${safeTheme}/${piece}.svg`
    );
}

interface PieceAssetProps {
    theme: string;
    piece: PieceCode;
    size: number | string;
}

/*
 * The Unicode glyph sits underneath the SVG as a graceful fallback.
 * If the remote SVG cannot load, onError hides the broken <img> so the
 * user never sees the browser's missing-image icon again.
 */
export function PieceAsset({
    theme,
    piece,
    size
}: PieceAssetProps) {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <span
            aria-hidden="true"
            style={{
                position: "relative",
                display: "inline-grid",
                placeItems: "center",
                width: size,
                height: size,
                lineHeight: 1,
                userSelect: "none",
                pointerEvents: "none"
            }}
        >
            {imageFailed ? (
                <span
                    style={{
                        fontSize: typeof size == "number"
                            ? Math.round(size * 0.82)
                            : "0.82em",
                        lineHeight: 1
                    }}
                >
                    {PIECE_FALLBACKS[piece]}
                </span>
            ) : (
                <img
                    src={getPieceAssetUrl(theme, piece)}
                    alt=""
                    draggable={false}
                    onError={() => setImageFailed(true)}
                    style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        userSelect: "none",
                        pointerEvents: "none"
                    }}
                />
            )}
        </span>
    );
}

export function createCustomPieces(theme: string) {
    const safeTheme = normalisePieceTheme(theme);

    return Object.fromEntries(
        PIECE_CODES.map(piece => [
            piece,
            ({ squareWidth }: { squareWidth: number }) => (
                <PieceAsset
                    theme={safeTheme}
                    piece={piece}
                    size={squareWidth}
                />
            )
        ])
    );
}
