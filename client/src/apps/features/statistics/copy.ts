export interface StatisticsCopy {
    nav: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    sample: string;
    loading: string;
    loadingDetails: (done: number, total: number) => string;
    noGames: string;
    tabs: {
        overview: string;
        games: string;
        openings: string;
        puzzles: string;
        training: string;
        brilliants: string;
    };
    samples: Record<string, string>;
    metrics: {
        games: string;
        accuracy: string;
        score: string;
        performance: string;
        moves: string;
        mistakes: string;
        misses: string;
        blunders: string;
        brilliants: string;
        perGame: string;
        per100: string;
        white: string;
        black: string;
        wins: string;
        draws: string;
        losses: string;
        opening: string;
        middlegame: string;
        endgame: string;
        bestGame: string;
        worstGame: string;
        currentRating: string;
        attempts: string;
        correct: string;
        currentStreak: string;
        bestStreak: string;
        lessons: string;
        duel: string;
        completed: string;
    };
    sections: {
        snapshot: string;
        accuracyTrend: string;
        colour: string;
        errorsByPhase: string;
        quality: string;
        openings: string;
        puzzleSummary: string;
        trainingSummary: string;
        brilliants: string;
        brilliantsSub: string;
        noBrilliants: string;
        detailedCoverage: string;
        plan: string;
    };
    openGame: string;
    viewBrilliant: string;
    unknownOpening: string;
    unknownOpponent: string;
    planCta: string;
}

const en: StatisticsCopy = {
    nav: "Statistics",
    eyebrow: "Your chess, connected",
    title: "Statistics",
    subtitle: "Turn your analysed games and training history into a clear picture of how you play and improve.",
    sample: "Sample",
    loading: "Loading statistics…",
    loadingDetails: (done, total) => `Reading detailed games ${done}/${total}…`,
    noGames: "Analyse or save some games first. Statistics will build themselves from your Archive.",
    tabs: { overview: "Overview", games: "Games", openings: "Openings", puzzles: "Puzzles", training: "Training", brilliants: "Brilliants" },
    samples: { "10": "Last 10", "20": "Last 20", "50": "Last 50", "100": "Last 100", "7d": "7 days", "30d": "30 days", "90d": "90 days", "365d": "1 year", all: "All" },
    metrics: { games: "Games", accuracy: "Average accuracy", score: "Score", performance: "Performance", moves: "Moves", mistakes: "Mistakes", misses: "Misses", blunders: "Blunders", brilliants: "Brilliants", perGame: "per game", per100: "per 100 moves", white: "White", black: "Black", wins: "Wins", draws: "Draws", losses: "Losses", opening: "Opening", middlegame: "Middlegame", endgame: "Endgame", bestGame: "Best game", worstGame: "Lowest accuracy", currentRating: "Current rating", attempts: "Rated attempts", correct: "Accuracy", currentStreak: "Current streak", bestStreak: "Best streak", lessons: "Lessons", duel: "Stockfish duel", completed: "completed" },
    sections: { snapshot: "Snapshot", accuracyTrend: "Accuracy trend", colour: "White vs Black", errorsByPhase: "Where the serious errors happen", quality: "Move quality", openings: "Opening performance", puzzleSummary: "Puzzle training", trainingSummary: "Training activity", brilliants: "Your brilliant moves", brilliantsSub: "Every !! found in the selected analysed games. Open one to return to the exact position.", noBrilliants: "No brilliant moves were found in this sample.", detailedCoverage: "Detailed game coverage", plan: "Turn the diagnosis into training" },
    openGame: "Open game",
    viewBrilliant: "View brilliant",
    unknownOpening: "Unknown opening",
    unknownOpponent: "Opponent",
    planCta: "Open training plan"
};

const es: StatisticsCopy = {
    nav: "Estadísticas",
    eyebrow: "Tu ajedrez, conectado",
    title: "Estadísticas",
    subtitle: "Convierte tus partidas analizadas y tu entrenamiento en una imagen clara de cómo juegas y cómo mejoras.",
    sample: "Muestra",
    loading: "Cargando estadísticas…",
    loadingDetails: (done, total) => `Leyendo partidas detalladas ${done}/${total}…`,
    noGames: "Analiza o guarda algunas partidas primero. Las estadísticas se construirán automáticamente desde tu Archivo.",
    tabs: { overview: "Resumen", games: "Partidas", openings: "Aperturas", puzzles: "Puzzles", training: "Entrenamiento", brilliants: "Brillantes" },
    samples: { "10": "Últimas 10", "20": "Últimas 20", "50": "Últimas 50", "100": "Últimas 100", "7d": "7 días", "30d": "30 días", "90d": "90 días", "365d": "1 año", all: "Todo" },
    metrics: { games: "Partidas", accuracy: "Precisión media", score: "Puntuación", performance: "Rendimiento", moves: "Movimientos", mistakes: "Errores", misses: "Omisiones", blunders: "Errores graves", brilliants: "Brillantes", perGame: "por partida", per100: "por 100 movimientos", white: "Blancas", black: "Negras", wins: "Victorias", draws: "Tablas", losses: "Derrotas", opening: "Apertura", middlegame: "Medio juego", endgame: "Final", bestGame: "Mejor partida", worstGame: "Menor precisión", currentRating: "Elo actual", attempts: "Intentos evaluados", correct: "Acierto", currentStreak: "Racha actual", bestStreak: "Mejor racha", lessons: "Lecciones", duel: "Duelo Stockfish", completed: "completadas" },
    sections: { snapshot: "Radiografía", accuracyTrend: "Evolución de precisión", colour: "Blancas vs negras", errorsByPhase: "Dónde ocurren los errores serios", quality: "Calidad de movimientos", openings: "Rendimiento por apertura", puzzleSummary: "Entrenamiento de puzzles", trainingSummary: "Actividad de entrenamiento", brilliants: "Tus movimientos brillantes", brilliantsSub: "Todos los !! encontrados en las partidas analizadas de la muestra. Pulsa uno para volver exactamente a esa posición.", noBrilliants: "No se han encontrado movimientos brillantes en esta muestra.", detailedCoverage: "Cobertura detallada", plan: "Convierte el diagnóstico en entrenamiento" },
    openGame: "Abrir partida",
    viewBrilliant: "Ver brillante",
    unknownOpening: "Apertura desconocida",
    unknownOpponent: "Rival",
    planCta: "Abrir plan de entrenamiento"
};

const simple = (base: StatisticsCopy, values: Partial<StatisticsCopy>): StatisticsCopy => ({
    ...base,
    ...values,
    tabs: { ...base.tabs, ...(values.tabs || {}) },
    samples: { ...base.samples, ...(values.samples || {}) },
    metrics: { ...base.metrics, ...(values.metrics || {}) },
    sections: { ...base.sections, ...(values.sections || {}) }
});

const copies: Record<string, StatisticsCopy> = {
    en,
    es,
    fr: simple(en, { nav: "Statistiques", eyebrow: "Votre jeu, connecté", title: "Statistiques", subtitle: "Transformez vos parties analysées et votre entraînement en une vision claire de votre jeu et de vos progrès.", sample: "Échantillon", tabs: { overview: "Résumé", games: "Parties", openings: "Ouvertures", puzzles: "Puzzles", training: "Entraînement", brilliants: "Coups brillants" }, sections: { brilliants: "Vos coups brillants", openings: "Performance par ouverture", colour: "Blancs vs Noirs" }, planCta: "Ouvrir le plan d’entraînement" }),
    de: simple(en, { nav: "Statistiken", eyebrow: "Dein Schach im Zusammenhang", title: "Statistiken", subtitle: "Verbinde analysierte Partien und Training zu einem klaren Bild deiner Entwicklung.", sample: "Auswahl", tabs: { overview: "Übersicht", games: "Partien", openings: "Eröffnungen", puzzles: "Puzzles", training: "Training", brilliants: "Brillante Züge" }, sections: { brilliants: "Deine brillanten Züge", openings: "Eröffnungsleistung", colour: "Weiß vs Schwarz" }, planCta: "Trainingsplan öffnen" }),
    pt: simple(en, { nav: "Estatísticas", eyebrow: "O teu xadrez, ligado", title: "Estatísticas", subtitle: "Transforma as partidas analisadas e o treino numa visão clara do teu jogo e progresso.", sample: "Amostra", tabs: { overview: "Resumo", games: "Partidas", openings: "Aberturas", puzzles: "Puzzles", training: "Treino", brilliants: "Brilhantes" }, sections: { brilliants: "Os teus lances brilhantes", openings: "Desempenho por abertura", colour: "Brancas vs Pretas" }, planCta: "Abrir plano de treino" }),
    ru: simple(en, { nav: "Статистика", eyebrow: "Вся ваша шахматная история", title: "Статистика", subtitle: "Объедините анализ партий и тренировки, чтобы видеть реальные тенденции игры.", sample: "Выборка", tabs: { overview: "Обзор", games: "Партии", openings: "Дебюты", puzzles: "Задачи", training: "Тренировка", brilliants: "Блестящие" }, sections: { brilliants: "Ваши блестящие ходы", openings: "Результаты по дебютам", colour: "Белые и чёрные" }, planCta: "Открыть план тренировок" }),
    zh: simple(en, { nav: "统计", eyebrow: "连接你的棋局数据", title: "统计", subtitle: "把已分析对局和训练历史整合成清晰的进步画像。", sample: "样本", tabs: { overview: "总览", games: "对局", openings: "开局", puzzles: "战术题", training: "训练", brilliants: "精彩着法" }, sections: { brilliants: "你的精彩着法", openings: "开局表现", colour: "白方 vs 黑方" }, planCta: "打开训练计划" }),
    vi: simple(en, { nav: "Thống kê", eyebrow: "Kết nối dữ liệu cờ vua của bạn", title: "Thống kê", subtitle: "Biến các ván đã phân tích và lịch sử luyện tập thành bức tranh rõ ràng về tiến bộ của bạn.", sample: "Mẫu", tabs: { overview: "Tổng quan", games: "Ván đấu", openings: "Khai cuộc", puzzles: "Bài tập", training: "Luyện tập", brilliants: "Nước xuất sắc" }, sections: { brilliants: "Các nước xuất sắc của bạn", openings: "Hiệu suất khai cuộc", colour: "Trắng vs Đen" }, planCta: "Mở kế hoạch luyện tập" }),
    hi: simple(en, { nav: "आँकड़े", eyebrow: "आपका शतरंज, एक साथ", title: "आँकड़े", subtitle: "विश्लेषित बाज़ियों और अभ्यास को आपकी प्रगति की साफ़ तस्वीर में बदलें।", sample: "नमूना", tabs: { overview: "सारांश", games: "बाज़ियाँ", openings: "ओपनिंग", puzzles: "पज़ल", training: "अभ्यास", brilliants: "ब्रिलियंट" }, sections: { brilliants: "आपकी ब्रिलियंट चालें", openings: "ओपनिंग प्रदर्शन", colour: "सफेद vs काले" }, planCta: "प्रशिक्षण योजना खोलें" }),
    mr: simple(en, { nav: "आकडेवारी", eyebrow: "तुमचा बुद्धिबळ डेटा एकत्र", title: "आकडेवारी", subtitle: "विश्लेषित डाव आणि सरावातून तुमच्या प्रगतीचे स्पष्ट चित्र तयार करा.", sample: "नमुना", tabs: { overview: "सारांश", games: "डाव", openings: "ओपनिंग", puzzles: "पझल", training: "सराव", brilliants: "ब्रिलियंट" }, sections: { brilliants: "तुमच्या ब्रिलियंट चाली", openings: "ओपनिंग कामगिरी", colour: "पांढरे vs काळे" }, planCta: "प्रशिक्षण योजना उघडा" }),
    pl: simple(en, { nav: "Statystyki", eyebrow: "Twoje szachy w jednym miejscu", title: "Statystyki", subtitle: "Połącz przeanalizowane partie i trening w czytelny obraz swojej gry i postępów.", sample: "Próbka", tabs: { overview: "Podsumowanie", games: "Partie", openings: "Debiuty", puzzles: "Zadania", training: "Trening", brilliants: "Genialne ruchy" }, sections: { brilliants: "Twoje genialne ruchy", openings: "Wyniki debiutowe", colour: "Białe vs czarne" }, planCta: "Otwórz plan treningowy" })
};

export function getStatisticsCopy(language?: string) {
    const key = (language || "en").toLowerCase().replace("_", "-").split("-")[0];
    return copies[key] || en;
}
