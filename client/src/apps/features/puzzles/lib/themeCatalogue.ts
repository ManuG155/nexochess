import {
    PuzzleThemeCategory,
    PuzzleThemeSelection
} from "../types";

interface PuzzleThemeData {
    themes: string[];
    openingTags?: string[];
}

export const puzzleThemeCategories: PuzzleThemeCategory[] = [
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
];

const categoryThemes: Record<
    Exclude<PuzzleThemeCategory, "all" | "opening">,
    readonly string[]
> = {
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
};

const englishThemeLabels: Record<string, string> = {
    advancedPawn: "Advanced pawn",
    advantage: "Gain an advantage",
    anastasiaMate: "Anastasia's mate",
    arabianMate: "Arabian mate",
    attackingF2F7: "Attack f2 or f7",
    attraction: "Attraction",
    backRankMate: "Back-rank mate",
    balestraMate: "Balestra mate",
    blindSwineMate: "Blind swine mate",
    bishopEndgame: "Bishop endgame",
    bodenMate: "Boden's mate",
    capturingDefender: "Capture the defender",
    castling: "Castling",
    clearance: "Clearance",
    collinearMove: "Collinear move",
    cornerMate: "Corner mate",
    crushing: "Crushing advantage",
    defensiveMove: "Defensive move",
    deflection: "Deflection",
    discoveredAttack: "Discovered attack",
    discoveredCheck: "Discovered check",
    doubleBishopMate: "Double-bishop mate",
    doubleCheck: "Double check",
    dovetailMate: "Dovetail mate",
    endgame: "Any endgame",
    enPassant: "En passant",
    epauletteMate: "Epaulette mate",
    equality: "Recover equality",
    exposedKing: "Exposed king",
    fork: "Fork",
    hangingPiece: "Hanging piece",
    hookMate: "Hook mate",
    interference: "Interference",
    intermezzo: "Intermezzo",
    killBoxMate: "Kill-box mate",
    kingsideAttack: "Kingside attack",
    knightEndgame: "Knight endgame",
    long: "Three-move puzzle",
    master: "Master game",
    masterVsMaster: "Master vs master",
    mate: "Any checkmate",
    mateIn1: "Mate in 1",
    mateIn2: "Mate in 2",
    mateIn3: "Mate in 3",
    mateIn4: "Mate in 4",
    mateIn5: "Mate in 5 or more",
    middlegame: "Middlegame",
    morphysMate: "Morphy's mate",
    oneMove: "One-move puzzle",
    opening: "Opening phase",
    operaMate: "Opera mate",
    pawnEndgame: "Pawn endgame",
    pillsburysMate: "Pillsbury's mate",
    pin: "Pin",
    promotion: "Promotion",
    queenEndgame: "Queen endgame",
    queenRookEndgame: "Queen and rook endgame",
    queensideAttack: "Queenside attack",
    quietMove: "Quiet move",
    rookEndgame: "Rook endgame",
    sacrifice: "Sacrifice",
    short: "Two-move puzzle",
    skewer: "Skewer",
    smotheredMate: "Smothered mate",
    superGM: "Super-GM game",
    swallowstailMate: "Swallow's-tail mate",
    trappedPiece: "Trapped piece",
    triangleMate: "Triangle mate",
    underPromotion: "Underpromotion",
    veryLong: "Four moves or more",
    vukovicMate: "Vuković mate",
    xRayAttack: "X-ray attack",
    zugzwang: "Zugzwang"
};

const spanishThemeLabels: Record<string, string> = {
    advancedPawn: "Peón avanzado",
    advantage: "Conseguir ventaja",
    anastasiaMate: "Mate de Anastasia",
    arabianMate: "Mate árabe",
    attackingF2F7: "Ataque a f2 o f7",
    attraction: "Atracción",
    backRankMate: "Mate del pasillo",
    balestraMate: "Mate de Balestra",
    blindSwineMate: "Mate de los cerdos ciegos",
    bishopEndgame: "Final de alfiles",
    bodenMate: "Mate de Boden",
    capturingDefender: "Capturar al defensor",
    castling: "Enroque",
    clearance: "Despeje",
    collinearMove: "Movimiento colineal",
    cornerMate: "Mate en la esquina",
    crushing: "Ventaja aplastante",
    defensiveMove: "Jugada defensiva",
    deflection: "Desviación",
    discoveredAttack: "Ataque descubierto",
    discoveredCheck: "Jaque descubierto",
    doubleBishopMate: "Mate de dos alfiles",
    doubleCheck: "Jaque doble",
    dovetailMate: "Mate de cola de milano",
    endgame: "Cualquier final",
    enPassant: "Captura al paso",
    epauletteMate: "Mate de las charreteras",
    equality: "Recuperar la igualdad",
    exposedKing: "Rey expuesto",
    fork: "Doble ataque",
    hangingPiece: "Pieza colgada",
    hookMate: "Mate del gancho",
    interference: "Interferencia",
    intermezzo: "Jugada intermedia",
    killBoxMate: "Mate de la caja",
    kingsideAttack: "Ataque en el flanco de rey",
    knightEndgame: "Final de caballos",
    long: "Problema de tres jugadas",
    master: "Partida de maestro",
    masterVsMaster: "Maestro contra maestro",
    mate: "Cualquier mate",
    mateIn1: "Mate en 1",
    mateIn2: "Mate en 2",
    mateIn3: "Mate en 3",
    mateIn4: "Mate en 4",
    mateIn5: "Mate en 5 o más",
    middlegame: "Medio juego",
    morphysMate: "Mate de Morphy",
    oneMove: "Problema de una jugada",
    opening: "Fase de apertura",
    operaMate: "Mate de la Ópera",
    pawnEndgame: "Final de peones",
    pillsburysMate: "Mate de Pillsbury",
    pin: "Clavada",
    promotion: "Promoción",
    queenEndgame: "Final de damas",
    queenRookEndgame: "Final de damas y torres",
    queensideAttack: "Ataque en el flanco de dama",
    quietMove: "Jugada tranquila",
    rookEndgame: "Final de torres",
    sacrifice: "Sacrificio",
    short: "Problema de dos jugadas",
    skewer: "Enfilada",
    smotheredMate: "Mate de la coz",
    superGM: "Partida de súper GM",
    swallowstailMate: "Mate de cola de golondrina",
    trappedPiece: "Pieza atrapada",
    triangleMate: "Mate del triángulo",
    underPromotion: "Subpromoción",
    veryLong: "Cuatro jugadas o más",
    vukovicMate: "Mate de Vuković",
    xRayAttack: "Ataque de rayos X",
    zugzwang: "Zugzwang"
};

export interface PuzzleFilterOption {
    kind: "theme" | "opening";
    value: string;
    count: number;
}

function humaniseIdentifier(value: string) {
    return value
        .replaceAll("_", " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

export function formatPuzzleTheme(value: string, language: string) {
    const labels = language.startsWith("es")
        ? spanishThemeLabels
        : englishThemeLabels;

    return labels[value] || englishThemeLabels[value]
        || humaniseIdentifier(value);
}

export function formatOpeningTag(value: string) {
    return humaniseIdentifier(value);
}

export function puzzleMatchesCategory(
    puzzle: PuzzleThemeData,
    category: PuzzleThemeCategory
) {
    if (category == "all") return true;

    if (category == "opening") {
        return puzzle.themes.includes("opening")
            || Boolean(puzzle.openingTags?.length);
    }

    return categoryThemes[category].some(theme => (
        puzzle.themes.includes(theme)
    ));
}

export function puzzleMatchesThemeSelection(
    puzzle: PuzzleThemeData,
    selection: PuzzleThemeSelection
) {
    if (selection.kind == "opening" && selection.value) {
        return puzzle.openingTags?.includes(selection.value) || false;
    }

    if (selection.kind == "theme" && selection.value) {
        return puzzle.themes.includes(selection.value);
    }

    return puzzleMatchesCategory(puzzle, selection.category);
}

export function getPuzzleFilterOptions(
    puzzles: PuzzleThemeData[],
    category: PuzzleThemeCategory
): PuzzleFilterOption[] {
    if (category == "all") return [];

    const counts = new Map<string, number>();

    if (category == "opening") {
        puzzles.forEach(puzzle => {
            puzzle.openingTags?.forEach(tag => {
                counts.set(tag, (counts.get(tag) || 0) + 1);
            });
        });

        return [...counts]
            .map(([value, count]) => ({
                kind: "opening" as const,
                value,
                count
            }))
            .sort((left, right) => (
                right.count - left.count
                || formatOpeningTag(left.value)
                    .localeCompare(formatOpeningTag(right.value))
            ));
    }

    categoryThemes[category].forEach(theme => {
        const count = puzzles.reduce(
            (total, puzzle) => total + (
                puzzle.themes.includes(theme) ? 1 : 0
            ),
            0
        );

        if (count > 0) counts.set(theme, count);
    });

    return [...counts]
        .map(([value, count]) => ({
            kind: "theme" as const,
            value,
            count
        }))
        .sort((left, right) => (
            right.count - left.count
            || left.value.localeCompare(right.value)
        ));
}

export function getVisiblePuzzleThemes(puzzle: PuzzleThemeData) {
    const hiddenThemes = new Set([
        "advantage",
        "crushing",
        "master",
        "masterVsMaster",
        "middlegame",
        "oneMove",
        "opening",
        "short",
        "long",
        "superGM",
        "veryLong"
    ]);

    return puzzle.themes
        .filter(theme => !hiddenThemes.has(theme))
        .slice(0, 3);
}
