export type CurriculumTone = "ice" | "indigo" | "copper" | "jade";

export interface CurriculumLesson {
    id: string;
    titleIndex: number;
    titleEn?: string;
    titleEs?: string;
    symbol: string;
    practiceCount: number;
    playable?: boolean;
    brilliant?: boolean;
}

export interface CurriculumLevel {
    id: string;
    tone: CurriculumTone;
    titleKey: string;
    kickerKey: string;
    descriptionKey: string;
    lessons: CurriculumLesson[];
}

const lesson = (
    id: string,
    titleIndex: number,
    symbol: string,
    practiceCount: number,
    extras: Omit<Partial<CurriculumLesson>, "id" | "titleIndex" | "symbol" | "practiceCount"> = {}
): CurriculumLesson => ({ id, titleIndex, symbol, practiceCount, ...extras });

export const curriculumLevels: CurriculumLevel[] = [
    {
        id: "first-contact",
        tone: "ice",
        kickerKey: "levels.firstContact.kicker",
        titleKey: "levels.firstContact.title",
        descriptionKey: "levels.firstContact.description",
        lessons: [
            lesson("first-contact.board", 6, "▦", 5),
            lesson("first-contact.sides", -1, "◐", 4, { titleEn: "White and black", titleEs: "Blancas y negras" }),
            lesson("first-contact.rook", 0, "♜", 8, { playable: true }),
            lesson("first-contact.bishop", 1, "♝", 7),
            lesson("first-contact.queen", 2, "♛", 8),
            lesson("first-contact.king", 3, "♚", 7),
            lesson("first-contact.knight", 4, "♞", 8),
            lesson("first-contact.pawn", 5, "♟", 8),
            lesson("first-contact.white-first", -1, "①", 4, { titleEn: "White moves first", titleEs: "Las blancas empiezan" }),
            lesson("first-contact.turns", 7, "↻", 4),
            lesson("first-contact.capture", 8, "×", 7),
            lesson("first-contact.capture-optional", -1, "○", 4, { titleEn: "Captures are optional", titleEs: "No estás obligado a capturar" }),
            lesson("first-contact.blocking", 9, "▥", 6),
            lesson("first-contact.knight-jumps", -1, "⌁", 6, { titleEn: "The knight jumps", titleEs: "El caballo salta" }),
            lesson("first-contact.check", 10, "+", 6),
            lesson("first-contact.king-safety-rule", -1, "♔", 6, { titleEn: "The king cannot move into check", titleEs: "El rey no puede entrar en jaque" }),
            lesson("first-contact.escape-check", 11, "↗", 7),
            lesson("first-contact.checkmate", 12, "#", 8),
            lesson("first-contact.mate-vs-stalemate", -1, "≠", 6, { titleEn: "Checkmate or stalemate", titleEs: "Mate o ahogado" }),
            lesson("first-contact.setup", 13, "◇", 8)
        ]
    },
    {
        id: "beginner",
        tone: "indigo",
        kickerKey: "levels.beginner.kicker",
        titleKey: "levels.beginner.title",
        descriptionKey: "levels.beginner.description",
        lessons: [
            lesson("beginner.guided-game", 14, "▶", 10),
            lesson("beginner.piece-values", 15, "9", 6),
            lesson("beginner.attacked", 20, "!", 6),
            lesson("beginner.defended", 21, "◉", 6),
            lesson("beginner.loose", 22, "○", 7),
            lesson("beginner.trades", 23, "⇄", 6),
            lesson("beginner.castling", 16, "♔", 6),
            lesson("beginner.promotion", 17, "↑", 6),
            lesson("beginner.en-passant", 18, "↘", 5),
            lesson("beginner.draws", 19, "=", 6),
            lesson("beginner.centre", 24, "◎", 7),
            lesson("beginner.development", 25, "↗", 7),
            lesson("beginner.king-safety", 26, "♔", 7),
            lesson("beginner.queen-early", 27, "♛", 5),
            lesson("beginner.finish-development", 28, "✓", 6),
            lesson("beginner.connect-rooks", -1, "♜", 5, { titleEn: "Connect your rooks", titleEs: "Conecta las torres" }),
            lesson("beginner.opening-plan", -1, "⌖", 7, { titleEn: "Your first opening plan", titleEs: "Tu primer plan de apertura" }),
            lesson("beginner.threat-awareness", -1, "?", 7, { titleEn: "Spot the threat", titleEs: "Detecta la amenaza" }),
            lesson("beginner.sportsmanship", -1, "⚑", 4, { titleEn: "Sportsmanship and ending a game", titleEs: "Deportividad y terminar una partida" }),
            lesson("beginner.checkpoint", -1, "★", 10, { titleEn: "Beginner checkpoint", titleEs: "Checkpoint de principiante" })
        ]
    },
    {
        id: "intermediate",
        tone: "copper",
        kickerKey: "levels.intermediate.kicker",
        titleKey: "levels.intermediate.title",
        descriptionKey: "levels.intermediate.description",
        lessons: [
            lesson("intermediate.threats", 29, "!", 7),
            lesson("intermediate.cct", 30, "☰", 8),
            lesson("intermediate.double-attack", -1, "⑂", 7, { titleEn: "Double attack", titleEs: "Ataque doble" }),
            lesson("intermediate.fork", 31, "♞", 8),
            lesson("intermediate.pin", 32, "│", 8),
            lesson("intermediate.skewer", 33, "⇢", 8),
            lesson("intermediate.discovered-attack", 34, "✦", 8),
            lesson("intermediate.discovered-check", -1, "+", 7, { titleEn: "Discovered check", titleEs: "Jaque descubierto" }),
            lesson("intermediate.remove-defender", 35, "×", 8),
            lesson("intermediate.overload", 36, "≋", 7),
            lesson("intermediate.deflection", -1, "↝", 7, { titleEn: "Deflection", titleEs: "Desviación" }),
            lesson("intermediate.attraction", -1, "◎", 7, { titleEn: "Attraction", titleEs: "Atracción" }),
            lesson("intermediate.interference", -1, "╳", 6, { titleEn: "Interference", titleEs: "Interferencia" }),
            lesson("intermediate.xray", -1, "◇", 6, { titleEn: "X-ray attack", titleEs: "Rayos X" }),
            lesson("intermediate.trapped-piece", 37, "□", 7),
            lesson("intermediate.back-rank", -1, "▰", 8, { titleEn: "Back-rank mate", titleEs: "Mate del pasillo" }),
            lesson("intermediate.ladder-mate", -1, "⇈", 7, { titleEn: "Ladder mate", titleEs: "Mate de escalera" }),
            lesson("intermediate.smothered-mate", -1, "♞", 7, { titleEn: "Smothered mate", titleEs: "Mate de la coz" }),
            lesson("intermediate.mating-net", -1, "#", 8, { titleEn: "Simple mating nets", titleEs: "Redes de mate sencillas" }),
            lesson("intermediate.checkpoint", -1, "★", 10, { titleEn: "Tactical checkpoint", titleEs: "Checkpoint táctico" })
        ]
    },
    {
        id: "ready",
        tone: "jade",
        kickerKey: "levels.ready.kicker",
        titleKey: "levels.ready.title",
        descriptionKey: "levels.ready.description",
        lessons: [
            lesson("intermediate.activity", 39, "↗", 6),
            lesson("intermediate.open-files", 40, "║", 6),
            lesson("intermediate.weak-squares", 41, "◌", 6),
            lesson("intermediate.passed-pawn", 42, "♙", 7),
            lesson("intermediate.worst-piece", 43, "↟", 6),
            lesson("ready.simplify", 44, "⇄", 6),
            lesson("ready.active-king", 45, "♔", 6),
            lesson("ready.square-rule", 46, "□", 7),
            lesson("ready.opposition", 47, "↔", 8),
            lesson("ready.distant-opposition", -1, "⇆", 6, { titleEn: "Distant opposition", titleEs: "Oposición a distancia" }),
            lesson("ready.key-squares", -1, "⌗", 7, { titleEn: "Key pawn squares", titleEs: "Casillas clave del peón" }),
            lesson("ready.king-queen-mate", 48, "♕", 8),
            lesson("ready.king-rook-mate", 49, "♜", 8),
            lesson("ready.pawn-endings", 50, "♙", 8),
            lesson("ready.outside-passer", -1, "♙", 6, { titleEn: "Outside passed pawn", titleEs: "Peón pasado alejado" }),
            lesson("ready.sacrifice-open-king", -1, "✦", 6, { titleEn: "Sacrifice to open the king", titleEs: "Sacrificio para abrir al rey", brilliant: true }),
            lesson("ready.sacrifice-deflection", -1, "✦", 6, { titleEn: "Deflection sacrifice", titleEs: "Sacrificio de desviación", brilliant: true }),
            lesson("ready.sacrifice-mate", -1, "!!", 7, { titleEn: "Mating sacrifice", titleEs: "Sacrificio para dar mate", brilliant: true }),
            lesson("ready.blunder-check", 55, "✓", 8),
            lesson("ready.final-checkpoint", 57, "★", 10)
        ]
    }
];

export const curriculumLessons = curriculumLevels.flatMap(level => (
    level.lessons.map(lessonEntry => ({
        ...lessonEntry,
        levelId: level.id,
        tone: level.tone
    }))
));

for (const item of curriculumLessons) {
    if (item.practiceCount < 4 || item.practiceCount > 10) {
        throw new Error(`Lesson ${item.id} must have between 4 and 10 practice positions.`);
    }
}

export const FIRST_LESSON_ID = curriculumLessons[0].id;
export const TOTAL_LESSONS = curriculumLessons.length;

export function getCurriculumLesson(id: string) {
    return curriculumLessons.find(item => item.id == id);
}

export function getNextCurriculumLesson(id: string) {
    const index = curriculumLessons.findIndex(item => item.id == id);
    if (index < 0) return undefined;
    return curriculumLessons[index + 1];
}
