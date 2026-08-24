import type { EndgameThemeId, EndgameTier } from "./types";

const STORAGE_KEY = "nexochess_endgame_lab_progress_v1";

export interface EndgameThemeProgress {
    attempts: number;
    solved: number;
    firstTry: number;
    downgrades: number;
    hints: number;
    lastPractisedAt?: string;
}

export interface EndgameLabProgress {
    version: 1;
    completedPositionIds: string[];
    themes: Partial<Record<EndgameThemeId, EndgameThemeProgress>>;
}

const EMPTY: EndgameLabProgress = {
    version: 1,
    completedPositionIds: [],
    themes: {}
};

export function loadEndgameLabProgress(): EndgameLabProgress {
    if (typeof localStorage == "undefined") return EMPTY;

    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "");
        if (parsed?.version != 1) return EMPTY;

        const completedPositionIds: string[] = Array.isArray(parsed.completedPositionIds)
            ? parsed.completedPositionIds.filter(
                (id: unknown): id is string => typeof id == "string"
            )
            : [];

        return {
            version: 1,
            completedPositionIds: [...new Set<string>(completedPositionIds)],
            themes: parsed.themes && typeof parsed.themes == "object"
                ? parsed.themes
                : {}
        };
    } catch {
        return EMPTY;
    }
}

function persist(progress: EndgameLabProgress) {
    if (typeof localStorage != "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
    return progress;
}

function currentTheme(
    progress: EndgameLabProgress,
    theme: EndgameThemeId
): EndgameThemeProgress {
    return progress.themes[theme] || {
        attempts: 0,
        solved: 0,
        firstTry: 0,
        downgrades: 0,
        hints: 0
    };
}

export function registerEndgameAttempt(
    progress: EndgameLabProgress,
    theme: EndgameThemeId
) {
    const row = currentTheme(progress, theme);
    return persist({
        ...progress,
        themes: {
            ...progress.themes,
            [theme]: {
                ...row,
                attempts: row.attempts + 1,
                lastPractisedAt: new Date().toISOString()
            }
        }
    });
}

export function registerEndgameHint(
    progress: EndgameLabProgress,
    theme: EndgameThemeId
) {
    const row = currentTheme(progress, theme);
    return persist({
        ...progress,
        themes: {
            ...progress.themes,
            [theme]: {
                ...row,
                hints: row.hints + 1,
                lastPractisedAt: new Date().toISOString()
            }
        }
    });
}

export function registerEndgameDowngrade(
    progress: EndgameLabProgress,
    theme: EndgameThemeId
) {
    const row = currentTheme(progress, theme);
    return persist({
        ...progress,
        themes: {
            ...progress.themes,
            [theme]: {
                ...row,
                downgrades: row.downgrades + 1,
                lastPractisedAt: new Date().toISOString()
            }
        }
    });
}

export function registerEndgameSolved(
    progress: EndgameLabProgress,
    theme: EndgameThemeId,
    positionId: string,
    firstTry: boolean
) {
    const row = currentTheme(progress, theme);
    const firstCompletion = !progress.completedPositionIds.includes(positionId);
    return persist({
        ...progress,
        completedPositionIds: firstCompletion
            ? [...progress.completedPositionIds, positionId]
            : progress.completedPositionIds,
        themes: {
            ...progress.themes,
            [theme]: {
                ...row,
                solved: row.solved + 1,
                firstTry: row.firstTry + (firstTry ? 1 : 0),
                lastPractisedAt: new Date().toISOString()
            }
        }
    });
}

export function themeMastery(
    progress: EndgameLabProgress,
    theme: EndgameThemeId
) {
    const row = progress.themes[theme];
    if (!row?.attempts) return 0;

    const solveRate = Math.min(1, row.solved / row.attempts);
    const firstTryRate = row.solved
        ? Math.min(1, row.firstTry / row.solved)
        : 0;
    const downgradePenalty = Math.min(0.35, row.downgrades / row.attempts * 0.35);
    const hintPenalty = Math.min(0.2, row.hints / row.attempts * 0.15);

    return Math.max(0, Math.min(100, Math.round(
        (solveRate * 0.65 + firstTryRate * 0.35 - downgradePenalty - hintPenalty) * 100
    )));
}

export function tierMastery(
    progress: EndgameLabProgress,
    tier: EndgameTier,
    themeIds: EndgameThemeId[]
) {
    void tier;
    const attempted = themeIds.filter(id => (progress.themes[id]?.attempts || 0) > 0);
    if (!attempted.length) return 0;
    return Math.round(
        attempted.reduce((sum, id) => sum + themeMastery(progress, id), 0)
        / attempted.length
    );
}
