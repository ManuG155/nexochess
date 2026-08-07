const labels: Record<string, string> = {
    en: "About NexoChess",
    es: "Sobre NexoChess",
    fr: "À propos de NexoChess",
    de: "Über NexoChess",
    pt: "Sobre o NexoChess",
    ru: "О NexoChess",
    zh: "关于 NexoChess",
    vi: "Giới thiệu NexoChess",
    hi: "NexoChess के बारे में",
    mr: "NexoChess विषयी",
    pl: "O NexoChess"
};

export function getAboutNavigationLabel(language?: string | null): string {
    const normalised = String(language || "en")
        .trim()
        .toLowerCase()
        .replace("_", "-")
        .split("-")[0];

    return labels[normalised] || labels.en;
}

export const ABOUT_NAVIGATION_LANGUAGES = Object.freeze(
    Object.keys(labels)
);
