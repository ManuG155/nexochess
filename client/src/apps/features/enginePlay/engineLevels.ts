export interface EngineLevel {
    elo: number;
    skill: number;
    depth: number;
    timeMs: number;
    labelKey: string;
}

const labels = [
    "initiation",
    "beginner",
    "novice",
    "club",
    "competent",
    "intermediate",
    "advanced",
    "expert",
    "candidate",
    "master",
    "grandmaster",
    "elite"
] as const;

export const ENGINE_LEVELS: EngineLevel[] = labels.map((labelKey, index) => {
    const elo = 250 + index * 250;
    const skill = Math.round(index / (labels.length - 1) * 20);

    return {
        elo,
        skill,
        depth: 5 + Math.round(index / (labels.length - 1) * 10),
        timeMs: 120 + Math.round(index / (labels.length - 1) * 680),
        labelKey
    };
});

export function getEngineLevel(elo: number) {
    return ENGINE_LEVELS.find(level => level.elo == elo) || ENGINE_LEVELS[3];
}
