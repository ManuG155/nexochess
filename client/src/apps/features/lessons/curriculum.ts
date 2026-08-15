export type CurriculumTone = "cyan" | "green" | "amber" | "violet";

export interface CurriculumLesson {
    id: string;
    titleIndex: number;
    symbol: string;
    playable?: boolean;
}

export interface CurriculumLevel {
    id: string;
    tone: CurriculumTone;
    titleKey: string;
    kickerKey: string;
    descriptionKey: string;
    decorations: string[];
    lessons: CurriculumLesson[];
}

export const curriculumLevels: CurriculumLevel[] = [
    {
        id: "first-contact",
        tone: "cyan",
        kickerKey: "levels.firstContact.kicker",
        titleKey: "levels.firstContact.title",
        descriptionKey: "levels.firstContact.description",
        decorations: ["♜", "♞", "◫", "+"],
        lessons: [
            { id: "first-contact.rook", titleIndex: 0, symbol: "♜", playable: true },
            { id: "first-contact.bishop", titleIndex: 1, symbol: "♝" },
            { id: "first-contact.queen", titleIndex: 2, symbol: "♛" },
            { id: "first-contact.king", titleIndex: 3, symbol: "♚" },
            { id: "first-contact.knight", titleIndex: 4, symbol: "♞" },
            { id: "first-contact.pawn", titleIndex: 5, symbol: "♟" },
            { id: "first-contact.board", titleIndex: 6, symbol: "◫" },
            { id: "first-contact.turns", titleIndex: 7, symbol: "↻" },
            { id: "first-contact.capture", titleIndex: 8, symbol: "×" },
            { id: "first-contact.blocking", titleIndex: 9, symbol: "↥" },
            { id: "first-contact.check", titleIndex: 10, symbol: "+" },
            { id: "first-contact.escape-check", titleIndex: 11, symbol: "↗" },
            { id: "first-contact.checkmate", titleIndex: 12, symbol: "#" },
            { id: "first-contact.setup", titleIndex: 13, symbol: "◇" }
        ]
    },
    {
        id: "beginner",
        tone: "green",
        kickerKey: "levels.beginner.kicker",
        titleKey: "levels.beginner.title",
        descriptionKey: "levels.beginner.description",
        decorations: ["♙", "♔", "◎", "⇄"],
        lessons: [
            { id: "beginner.guided-game", titleIndex: 14, symbol: "▶" },
            { id: "beginner.piece-values", titleIndex: 15, symbol: "9" },
            { id: "beginner.castling", titleIndex: 16, symbol: "♔" },
            { id: "beginner.promotion", titleIndex: 17, symbol: "↑" },
            { id: "beginner.en-passant", titleIndex: 18, symbol: "↘" },
            { id: "beginner.draws", titleIndex: 19, symbol: "=" },
            { id: "beginner.attacked", titleIndex: 20, symbol: "!" },
            { id: "beginner.defended", titleIndex: 21, symbol: "◉" },
            { id: "beginner.loose", titleIndex: 22, symbol: "○" },
            { id: "beginner.trades", titleIndex: 23, symbol: "⇄" },
            { id: "beginner.centre", titleIndex: 24, symbol: "◎" },
            { id: "beginner.development", titleIndex: 25, symbol: "↗" },
            { id: "beginner.king-safety", titleIndex: 26, symbol: "♔" },
            { id: "beginner.queen-early", titleIndex: 27, symbol: "♛" },
            { id: "beginner.finish-development", titleIndex: 28, symbol: "✓" }
        ]
    },
    {
        id: "intermediate",
        tone: "amber",
        kickerKey: "levels.intermediate.kicker",
        titleKey: "levels.intermediate.title",
        descriptionKey: "levels.intermediate.description",
        decorations: ["✦", "#", "♞", "⇢"],
        lessons: [
            { id: "intermediate.threats", titleIndex: 29, symbol: "!" },
            { id: "intermediate.cct", titleIndex: 30, symbol: "☰" },
            { id: "intermediate.fork", titleIndex: 31, symbol: "⑂" },
            { id: "intermediate.pin", titleIndex: 32, symbol: "│" },
            { id: "intermediate.skewer", titleIndex: 33, symbol: "⇢" },
            { id: "intermediate.discovered-attack", titleIndex: 34, symbol: "✦" },
            { id: "intermediate.remove-defender", titleIndex: 35, symbol: "×" },
            { id: "intermediate.overload", titleIndex: 36, symbol: "≋" },
            { id: "intermediate.trapped-piece", titleIndex: 37, symbol: "□" },
            { id: "intermediate.mating-patterns", titleIndex: 38, symbol: "#" },
            { id: "intermediate.activity", titleIndex: 39, symbol: "↗" },
            { id: "intermediate.open-files", titleIndex: 40, symbol: "║" },
            { id: "intermediate.weak-squares", titleIndex: 41, symbol: "◌" },
            { id: "intermediate.passed-pawn", titleIndex: 42, symbol: "♙" },
            { id: "intermediate.worst-piece", titleIndex: 43, symbol: "↟" }
        ]
    },
    {
        id: "ready",
        tone: "violet",
        kickerKey: "levels.ready.kicker",
        titleKey: "levels.ready.title",
        descriptionKey: "levels.ready.description",
        decorations: ["♔", "♕", "✓", "★"],
        lessons: [
            { id: "ready.simplify", titleIndex: 44, symbol: "⇄" },
            { id: "ready.active-king", titleIndex: 45, symbol: "♔" },
            { id: "ready.square-rule", titleIndex: 46, symbol: "□" },
            { id: "ready.opposition", titleIndex: 47, symbol: "↔" },
            { id: "ready.king-queen-mate", titleIndex: 48, symbol: "♕" },
            { id: "ready.king-rook-mate", titleIndex: 49, symbol: "♜" },
            { id: "ready.pawn-endings", titleIndex: 50, symbol: "♙" },
            { id: "ready.opponent-threat", titleIndex: 51, symbol: "?" },
            { id: "ready.loose-check", titleIndex: 52, symbol: "○" },
            { id: "ready.calculate-one", titleIndex: 53, symbol: "1" },
            { id: "ready.calculate-two", titleIndex: 54, symbol: "2" },
            { id: "ready.blunder-check", titleIndex: 55, symbol: "✓" },
            { id: "ready.mixed", titleIndex: 56, symbol: "◆" },
            { id: "ready.final-checkpoint", titleIndex: 57, symbol: "★" }
        ]
    }
];

export const curriculumLessons = curriculumLevels.flatMap(level => (
    level.lessons.map(lesson => ({
        ...lesson,
        levelId: level.id,
        tone: level.tone
    }))
));

export const FIRST_LESSON_ID = curriculumLessons[0].id;
export const TOTAL_LESSONS = curriculumLessons.length;

export function getCurriculumLesson(id: string) {
    return curriculumLessons.find(lesson => lesson.id == id);
}

export function getNextCurriculumLesson(id: string) {
    const index = curriculumLessons.findIndex(lesson => lesson.id == id);
    if (index < 0) return undefined;
    return curriculumLessons[index + 1];
}
