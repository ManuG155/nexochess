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
    puzzleHistoryNote: string;
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
    planCta: "Open training plan",
    puzzleHistoryNote: "This section shows the puzzle data NexoChess currently stores. Theme trends will become reliable once per-attempt history exists; data that was never stored is not reconstructed."
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
    planCta: "Abrir plan de entrenamiento",
    puzzleHistoryNote: "Aquí se muestran los datos que NexoChess guarda actualmente de Puzzles. Las tendencias por temática serán fiables cuando exista historial temporal por intento; no se reconstruyen datos que nunca se almacenaron."
};

const fr: StatisticsCopy = {
    nav: "Statistiques", eyebrow: "Votre jeu, connecté", title: "Statistiques", subtitle: "Transformez vos parties analysées et votre entraînement en une vision claire de votre jeu et de vos progrès.", sample: "Échantillon", loading: "Chargement des statistiques…", loadingDetails: (done, total) => `Lecture des parties détaillées ${done}/${total}…`, noGames: "Analysez ou enregistrez d’abord quelques parties. Les statistiques se construiront depuis vos Archives.",
    tabs: { overview: "Résumé", games: "Parties", openings: "Ouvertures", puzzles: "Puzzles", training: "Entraînement", brilliants: "Coups brillants" },
    samples: { "10": "10 dernières", "20": "20 dernières", "50": "50 dernières", "100": "100 dernières", "7d": "7 jours", "30d": "30 jours", "90d": "90 jours", "365d": "1 an", all: "Tout" },
    metrics: { games: "Parties", accuracy: "Précision moyenne", score: "Score", performance: "Performance", moves: "Coups", mistakes: "Erreurs", misses: "Occasions manquées", blunders: "Gaffes", brilliants: "Brillants", perGame: "par partie", per100: "pour 100 coups", white: "Blancs", black: "Noirs", wins: "Victoires", draws: "Nulles", losses: "Défaites", opening: "Ouverture", middlegame: "Milieu de jeu", endgame: "Finale", bestGame: "Meilleure partie", worstGame: "Précision la plus basse", currentRating: "Elo actuel", attempts: "Tentatives évaluées", correct: "Réussite", currentStreak: "Série actuelle", bestStreak: "Meilleure série", lessons: "Leçons", duel: "Duel Stockfish", completed: "terminées" },
    sections: { snapshot: "Vue d’ensemble", accuracyTrend: "Évolution de la précision", colour: "Blancs vs Noirs", errorsByPhase: "Où surviennent les erreurs sérieuses", quality: "Qualité des coups", openings: "Performance par ouverture", puzzleSummary: "Entraînement de puzzles", trainingSummary: "Activité d’entraînement", brilliants: "Vos coups brillants", brilliantsSub: "Tous les !! trouvés dans les parties analysées de l’échantillon. Ouvrez-en un pour revenir à la position exacte.", noBrilliants: "Aucun coup brillant trouvé dans cet échantillon.", detailedCoverage: "Couverture détaillée", plan: "Transformer le diagnostic en entraînement" },
    openGame: "Ouvrir la partie", viewBrilliant: "Voir le coup brillant", unknownOpening: "Ouverture inconnue", unknownOpponent: "Adversaire", planCta: "Ouvrir le plan d’entraînement", puzzleHistoryNote: "Cette section affiche les données de puzzles que NexoChess conserve actuellement. Les tendances par thème deviendront fiables lorsqu’un historique par tentative existera ; les données jamais enregistrées ne sont pas reconstruites."
};

const de: StatisticsCopy = {
    nav: "Statistiken", eyebrow: "Dein Schach im Zusammenhang", title: "Statistiken", subtitle: "Verbinde analysierte Partien und Training zu einem klaren Bild deiner Spielweise und Entwicklung.", sample: "Auswahl", loading: "Statistiken werden geladen…", loadingDetails: (done, total) => `Detaillierte Partien werden gelesen ${done}/${total}…`, noGames: "Analysiere oder speichere zuerst einige Partien. Die Statistiken entstehen automatisch aus deinem Archiv.",
    tabs: { overview: "Übersicht", games: "Partien", openings: "Eröffnungen", puzzles: "Puzzles", training: "Training", brilliants: "Brillante Züge" },
    samples: { "10": "Letzte 10", "20": "Letzte 20", "50": "Letzte 50", "100": "Letzte 100", "7d": "7 Tage", "30d": "30 Tage", "90d": "90 Tage", "365d": "1 Jahr", all: "Alle" },
    metrics: { games: "Partien", accuracy: "Ø Genauigkeit", score: "Punktquote", performance: "Performance", moves: "Züge", mistakes: "Fehler", misses: "Verpasste Chancen", blunders: "Patzer", brilliants: "Brillante", perGame: "pro Partie", per100: "pro 100 Züge", white: "Weiß", black: "Schwarz", wins: "Siege", draws: "Remis", losses: "Niederlagen", opening: "Eröffnung", middlegame: "Mittelspiel", endgame: "Endspiel", bestGame: "Beste Partie", worstGame: "Niedrigste Genauigkeit", currentRating: "Aktuelles Elo", attempts: "Gewertete Versuche", correct: "Trefferquote", currentStreak: "Aktuelle Serie", bestStreak: "Beste Serie", lessons: "Lektionen", duel: "Stockfish-Duell", completed: "abgeschlossen" },
    sections: { snapshot: "Überblick", accuracyTrend: "Genauigkeitsverlauf", colour: "Weiß vs Schwarz", errorsByPhase: "Wo schwere Fehler passieren", quality: "Zugqualität", openings: "Eröffnungsleistung", puzzleSummary: "Puzzle-Training", trainingSummary: "Trainingsaktivität", brilliants: "Deine brillanten Züge", brilliantsSub: "Alle !! aus den analysierten Partien der Auswahl. Öffne einen Zug, um direkt zur exakten Stellung zurückzukehren.", noBrilliants: "In dieser Auswahl wurden keine brillanten Züge gefunden.", detailedCoverage: "Detaillierte Abdeckung", plan: "Aus der Diagnose Training machen" },
    openGame: "Partie öffnen", viewBrilliant: "Brillanten Zug ansehen", unknownOpening: "Unbekannte Eröffnung", unknownOpponent: "Gegner", planCta: "Trainingsplan öffnen", puzzleHistoryNote: "Hier werden die Puzzle-Daten angezeigt, die NexoChess derzeit speichert. Themen-Trends werden zuverlässig, sobald ein Verlauf pro Versuch vorhanden ist; nie gespeicherte Daten werden nicht rekonstruiert."
};

const pt: StatisticsCopy = {
    nav: "Estatísticas", eyebrow: "O teu xadrez, ligado", title: "Estatísticas", subtitle: "Transforma as partidas analisadas e o treino numa visão clara de como jogas e evoluis.", sample: "Amostra", loading: "A carregar estatísticas…", loadingDetails: (done, total) => `A ler partidas detalhadas ${done}/${total}…`, noGames: "Analisa ou guarda algumas partidas primeiro. As estatísticas serão criadas automaticamente a partir do Arquivo.",
    tabs: { overview: "Resumo", games: "Partidas", openings: "Aberturas", puzzles: "Puzzles", training: "Treino", brilliants: "Brilhantes" },
    samples: { "10": "Últimas 10", "20": "Últimas 20", "50": "Últimas 50", "100": "Últimas 100", "7d": "7 dias", "30d": "30 dias", "90d": "90 dias", "365d": "1 ano", all: "Tudo" },
    metrics: { games: "Partidas", accuracy: "Precisão média", score: "Pontuação", performance: "Desempenho", moves: "Lances", mistakes: "Erros", misses: "Omissões", blunders: "Erros graves", brilliants: "Brilhantes", perGame: "por partida", per100: "por 100 lances", white: "Brancas", black: "Pretas", wins: "Vitórias", draws: "Empates", losses: "Derrotas", opening: "Abertura", middlegame: "Meio-jogo", endgame: "Final", bestGame: "Melhor partida", worstGame: "Menor precisão", currentRating: "Elo atual", attempts: "Tentativas avaliadas", correct: "Acerto", currentStreak: "Sequência atual", bestStreak: "Melhor sequência", lessons: "Lições", duel: "Duelo Stockfish", completed: "concluídas" },
    sections: { snapshot: "Resumo", accuracyTrend: "Evolução da precisão", colour: "Brancas vs Pretas", errorsByPhase: "Onde acontecem os erros sérios", quality: "Qualidade dos lances", openings: "Desempenho por abertura", puzzleSummary: "Treino de puzzles", trainingSummary: "Atividade de treino", brilliants: "Os teus lances brilhantes", brilliantsSub: "Todos os !! encontrados nas partidas analisadas da amostra. Abre um para voltar exatamente à posição.", noBrilliants: "Não foram encontrados lances brilhantes nesta amostra.", detailedCoverage: "Cobertura detalhada", plan: "Transforma o diagnóstico em treino" },
    openGame: "Abrir partida", viewBrilliant: "Ver brilhante", unknownOpening: "Abertura desconhecida", unknownOpponent: "Adversário", planCta: "Abrir plano de treino", puzzleHistoryNote: "Aqui aparecem os dados de Puzzles que o NexoChess guarda atualmente. As tendências por tema serão fiáveis quando existir histórico por tentativa; dados que nunca foram guardados não são reconstruídos."
};

const ru: StatisticsCopy = {
    nav: "Статистика", eyebrow: "Вся ваша шахматная история", title: "Статистика", subtitle: "Объедините анализ партий и тренировки, чтобы видеть ясную картину своей игры и прогресса.", sample: "Выборка", loading: "Загрузка статистики…", loadingDetails: (done, total) => `Чтение подробных партий ${done}/${total}…`, noGames: "Сначала проанализируйте или сохраните несколько партий. Статистика построится из Архива автоматически.",
    tabs: { overview: "Обзор", games: "Партии", openings: "Дебюты", puzzles: "Задачи", training: "Тренировка", brilliants: "Блестящие" },
    samples: { "10": "Последние 10", "20": "Последние 20", "50": "Последние 50", "100": "Последние 100", "7d": "7 дней", "30d": "30 дней", "90d": "90 дней", "365d": "1 год", all: "Все" },
    metrics: { games: "Партии", accuracy: "Средняя точность", score: "Результат", performance: "Перформанс", moves: "Ходы", mistakes: "Ошибки", misses: "Упущения", blunders: "Грубые ошибки", brilliants: "Блестящие", perGame: "за партию", per100: "на 100 ходов", white: "Белые", black: "Чёрные", wins: "Победы", draws: "Ничьи", losses: "Поражения", opening: "Дебют", middlegame: "Миттельшпиль", endgame: "Эндшпиль", bestGame: "Лучшая партия", worstGame: "Самая низкая точность", currentRating: "Текущий Elo", attempts: "Рейтинговые попытки", correct: "Точность", currentStreak: "Текущая серия", bestStreak: "Лучшая серия", lessons: "Уроки", duel: "Дуэль со Stockfish", completed: "пройдено" },
    sections: { snapshot: "Сводка", accuracyTrend: "Динамика точности", colour: "Белые vs чёрные", errorsByPhase: "Где происходят серьёзные ошибки", quality: "Качество ходов", openings: "Результаты по дебютам", puzzleSummary: "Тренировка задач", trainingSummary: "Тренировочная активность", brilliants: "Ваши блестящие ходы", brilliantsSub: "Все !! из выбранных проанализированных партий. Откройте ход, чтобы перейти к точной позиции.", noBrilliants: "В этой выборке блестящих ходов не найдено.", detailedCoverage: "Подробное покрытие", plan: "Превратить диагноз в тренировку" },
    openGame: "Открыть партию", viewBrilliant: "Посмотреть блестящий ход", unknownOpening: "Неизвестный дебют", unknownOpponent: "Соперник", planCta: "Открыть план тренировок", puzzleHistoryNote: "Здесь показаны данные задач, которые NexoChess сохраняет сейчас. Тренды по темам станут надёжными после появления истории каждой попытки; данные, которые никогда не сохранялись, не восстанавливаются."
};

const zh: StatisticsCopy = {
    nav: "统计", eyebrow: "连接你的棋局数据", title: "统计", subtitle: "把已分析对局和训练历史整合成清晰的棋风与进步画像。", sample: "样本", loading: "正在加载统计…", loadingDetails: (done, total) => `正在读取详细对局 ${done}/${total}…`, noGames: "请先分析或保存一些对局。统计会自动从你的存档中生成。",
    tabs: { overview: "总览", games: "对局", openings: "开局", puzzles: "战术题", training: "训练", brilliants: "精彩着法" },
    samples: { "10": "最近 10 局", "20": "最近 20 局", "50": "最近 50 局", "100": "最近 100 局", "7d": "7 天", "30d": "30 天", "90d": "90 天", "365d": "1 年", all: "全部" },
    metrics: { games: "对局", accuracy: "平均准确率", score: "得分率", performance: "表现分", moves: "着法", mistakes: "错误", misses: "错失机会", blunders: "严重错误", brilliants: "精彩着法", perGame: "每局", per100: "每 100 着", white: "白方", black: "黑方", wins: "胜", draws: "和", losses: "负", opening: "开局", middlegame: "中局", endgame: "残局", bestGame: "最佳对局", worstGame: "最低准确率", currentRating: "当前 Elo", attempts: "计分尝试", correct: "正确率", currentStreak: "当前连胜", bestStreak: "最佳连胜", lessons: "课程", duel: "Stockfish 对弈", completed: "已完成" },
    sections: { snapshot: "概览", accuracyTrend: "准确率趋势", colour: "白方 vs 黑方", errorsByPhase: "严重错误发生在哪个阶段", quality: "着法质量", openings: "开局表现", puzzleSummary: "战术题训练", trainingSummary: "训练活动", brilliants: "你的精彩着法", brilliantsSub: "所选已分析对局中全部 !!。点击任意一项可回到准确局面。", noBrilliants: "该样本中没有发现精彩着法。", detailedCoverage: "详细覆盖", plan: "把诊断转化为训练" },
    openGame: "打开对局", viewBrilliant: "查看精彩着法", unknownOpening: "未知开局", unknownOpponent: "对手", planCta: "打开训练计划", puzzleHistoryNote: "这里显示 NexoChess 目前实际保存的战术题数据。按主题的趋势需要逐次尝试历史后才会可靠；从未保存的数据不会被虚构或重建。"
};

const vi: StatisticsCopy = {
    nav: "Thống kê", eyebrow: "Kết nối dữ liệu cờ vua của bạn", title: "Thống kê", subtitle: "Biến các ván đã phân tích và lịch sử luyện tập thành bức tranh rõ ràng về cách bạn chơi và tiến bộ.", sample: "Mẫu", loading: "Đang tải thống kê…", loadingDetails: (done, total) => `Đang đọc ván chi tiết ${done}/${total}…`, noGames: "Hãy phân tích hoặc lưu một vài ván trước. Thống kê sẽ tự xây dựng từ Kho lưu trữ.",
    tabs: { overview: "Tổng quan", games: "Ván đấu", openings: "Khai cuộc", puzzles: "Bài tập", training: "Luyện tập", brilliants: "Nước xuất sắc" },
    samples: { "10": "10 ván gần nhất", "20": "20 ván gần nhất", "50": "50 ván gần nhất", "100": "100 ván gần nhất", "7d": "7 ngày", "30d": "30 ngày", "90d": "90 ngày", "365d": "1 năm", all: "Tất cả" },
    metrics: { games: "Ván đấu", accuracy: "Độ chính xác TB", score: "Điểm số", performance: "Hiệu suất", moves: "Nước đi", mistakes: "Sai lầm", misses: "Bỏ lỡ", blunders: "Sai lầm nghiêm trọng", brilliants: "Xuất sắc", perGame: "mỗi ván", per100: "mỗi 100 nước", white: "Trắng", black: "Đen", wins: "Thắng", draws: "Hòa", losses: "Thua", opening: "Khai cuộc", middlegame: "Trung cuộc", endgame: "Tàn cuộc", bestGame: "Ván tốt nhất", worstGame: "Độ chính xác thấp nhất", currentRating: "Elo hiện tại", attempts: "Lượt có xếp hạng", correct: "Tỷ lệ đúng", currentStreak: "Chuỗi hiện tại", bestStreak: "Chuỗi tốt nhất", lessons: "Bài học", duel: "Đấu Stockfish", completed: "đã hoàn thành" },
    sections: { snapshot: "Tổng quan", accuracyTrend: "Xu hướng độ chính xác", colour: "Trắng vs Đen", errorsByPhase: "Sai lầm nghiêm trọng xuất hiện ở đâu", quality: "Chất lượng nước đi", openings: "Hiệu suất khai cuộc", puzzleSummary: "Luyện bài tập", trainingSummary: "Hoạt động luyện tập", brilliants: "Các nước xuất sắc của bạn", brilliantsSub: "Mọi !! trong các ván đã phân tích thuộc mẫu đã chọn. Mở một nước để quay lại đúng vị trí đó.", noBrilliants: "Không tìm thấy nước xuất sắc trong mẫu này.", detailedCoverage: "Phạm vi chi tiết", plan: "Biến chẩn đoán thành luyện tập" },
    openGame: "Mở ván", viewBrilliant: "Xem nước xuất sắc", unknownOpening: "Khai cuộc chưa rõ", unknownOpponent: "Đối thủ", planCta: "Mở kế hoạch luyện tập", puzzleHistoryNote: "Phần này hiển thị dữ liệu Bài tập mà NexoChess hiện đang lưu. Xu hướng theo chủ đề sẽ đáng tin khi có lịch sử từng lượt thử; dữ liệu chưa từng được lưu sẽ không được dựng lại."
};

const hi: StatisticsCopy = {
    nav: "आँकड़े", eyebrow: "आपका शतरंज, एक साथ", title: "आँकड़े", subtitle: "विश्लेषित बाज़ियों और अभ्यास को आपकी खेल शैली और प्रगति की साफ़ तस्वीर में बदलें।", sample: "नमूना", loading: "आँकड़े लोड हो रहे हैं…", loadingDetails: (done, total) => `विस्तृत बाज़ियाँ पढ़ी जा रही हैं ${done}/${total}…`, noGames: "पहले कुछ बाज़ियाँ विश्लेषित या सहेजें। आँकड़े आपके आर्काइव से अपने आप बनेंगे।",
    tabs: { overview: "सारांश", games: "बाज़ियाँ", openings: "ओपनिंग", puzzles: "पज़ल", training: "अभ्यास", brilliants: "ब्रिलियंट" },
    samples: { "10": "पिछली 10", "20": "पिछली 20", "50": "पिछली 50", "100": "पिछली 100", "7d": "7 दिन", "30d": "30 दिन", "90d": "90 दिन", "365d": "1 वर्ष", all: "सभी" },
    metrics: { games: "बाज़ियाँ", accuracy: "औसत सटीकता", score: "स्कोर", performance: "प्रदर्शन", moves: "चालें", mistakes: "गलतियाँ", misses: "चूके मौके", blunders: "गंभीर गलतियाँ", brilliants: "ब्रिलियंट", perGame: "प्रति बाज़ी", per100: "प्रति 100 चाल", white: "सफेद", black: "काले", wins: "जीत", draws: "ड्रॉ", losses: "हार", opening: "ओपनिंग", middlegame: "मिडिलगेम", endgame: "एंडगेम", bestGame: "सर्वश्रेष्ठ बाज़ी", worstGame: "सबसे कम सटीकता", currentRating: "वर्तमान Elo", attempts: "रेटेड प्रयास", correct: "सही प्रतिशत", currentStreak: "वर्तमान स्ट्रीक", bestStreak: "सर्वश्रेष्ठ स्ट्रीक", lessons: "पाठ", duel: "Stockfish मुकाबला", completed: "पूरे" },
    sections: { snapshot: "सारांश", accuracyTrend: "सटीकता का रुझान", colour: "सफेद vs काले", errorsByPhase: "गंभीर गलतियाँ कहाँ होती हैं", quality: "चाल की गुणवत्ता", openings: "ओपनिंग प्रदर्शन", puzzleSummary: "पज़ल अभ्यास", trainingSummary: "अभ्यास गतिविधि", brilliants: "आपकी ब्रिलियंट चालें", brilliantsSub: "चुनी हुई विश्लेषित बाज़ियों में मिले सभी !!। किसी एक को खोलकर ठीक उसी स्थिति पर लौटें।", noBrilliants: "इस नमूने में कोई ब्रिलियंट चाल नहीं मिली।", detailedCoverage: "विस्तृत कवरेज", plan: "निदान को अभ्यास में बदलें" },
    openGame: "बाज़ी खोलें", viewBrilliant: "ब्रिलियंट देखें", unknownOpening: "अज्ञात ओपनिंग", unknownOpponent: "प्रतिद्वंद्वी", planCta: "प्रशिक्षण योजना खोलें", puzzleHistoryNote: "यहाँ वही पज़ल डेटा दिखता है जिसे NexoChess अभी सहेजता है। विषयवार रुझान तब भरोसेमंद होंगे जब हर प्रयास का इतिहास उपलब्ध होगा; जो डेटा कभी सहेजा ही नहीं गया उसे बनाया नहीं जाता।"
};

const mr: StatisticsCopy = {
    nav: "आकडेवारी", eyebrow: "तुमचा बुद्धिबळ डेटा एकत्र", title: "आकडेवारी", subtitle: "विश्लेषित डाव आणि सरावातून तुमच्या खेळाचे आणि प्रगतीचे स्पष्ट चित्र तयार करा.", sample: "नमुना", loading: "आकडेवारी लोड होत आहे…", loadingDetails: (done, total) => `तपशीलवार डाव वाचत आहोत ${done}/${total}…`, noGames: "प्रथम काही डाव विश्लेषित करा किंवा जतन करा. आकडेवारी तुमच्या संग्रहातून आपोआप तयार होईल.",
    tabs: { overview: "सारांश", games: "डाव", openings: "ओपनिंग", puzzles: "पझल", training: "सराव", brilliants: "ब्रिलियंट" },
    samples: { "10": "शेवटचे 10", "20": "शेवटचे 20", "50": "शेवटचे 50", "100": "शेवटचे 100", "7d": "7 दिवस", "30d": "30 दिवस", "90d": "90 दिवस", "365d": "1 वर्ष", all: "सर्व" },
    metrics: { games: "डाव", accuracy: "सरासरी अचूकता", score: "स्कोअर", performance: "कामगिरी", moves: "चाली", mistakes: "चुका", misses: "हुकलेल्या संधी", blunders: "गंभीर चुका", brilliants: "ब्रिलियंट", perGame: "प्रति डाव", per100: "प्रति 100 चाली", white: "पांढरे", black: "काळे", wins: "विजय", draws: "बरोबरी", losses: "पराभव", opening: "ओपनिंग", middlegame: "मिडलगेम", endgame: "एंडगेम", bestGame: "सर्वोत्तम डाव", worstGame: "सर्वात कमी अचूकता", currentRating: "सध्याचा Elo", attempts: "रेटेड प्रयत्न", correct: "यशाचे प्रमाण", currentStreak: "सध्याची सलग मालिका", bestStreak: "सर्वोत्तम मालिका", lessons: "धडे", duel: "Stockfish सामना", completed: "पूर्ण" },
    sections: { snapshot: "सारांश", accuracyTrend: "अचूकतेचा कल", colour: "पांढरे vs काळे", errorsByPhase: "गंभीर चुका कुठे होतात", quality: "चालींची गुणवत्ता", openings: "ओपनिंग कामगिरी", puzzleSummary: "पझल सराव", trainingSummary: "सराव क्रियाकलाप", brilliants: "तुमच्या ब्रिलियंट चाली", brilliantsSub: "निवडलेल्या विश्लेषित डावांतील सर्व !!. एखादी चाल उघडून नेमक्या स्थितीवर परत जा.", noBrilliants: "या नमुन्यात ब्रिलियंट चाल सापडली नाही.", detailedCoverage: "तपशीलवार कव्हरेज", plan: "निदानाचे सरावात रूपांतर करा" },
    openGame: "डाव उघडा", viewBrilliant: "ब्रिलियंट पाहा", unknownOpening: "अज्ञात ओपनिंग", unknownOpponent: "प्रतिस्पर्धी", planCta: "प्रशिक्षण योजना उघडा", puzzleHistoryNote: "येथे NexoChess सध्या जतन करत असलेला पझल डेटा दाखवला जातो. प्रत्येक प्रयत्नाचा इतिहास उपलब्ध झाल्यावर विषयानुसार कल विश्वासार्ह होईल; कधीही जतन न केलेला डेटा पुन्हा तयार केला जात नाही."
};

const pl: StatisticsCopy = {
    nav: "Statystyki", eyebrow: "Twoje szachy w jednym miejscu", title: "Statystyki", subtitle: "Połącz przeanalizowane partie i trening w czytelny obraz swojej gry i postępów.", sample: "Próbka", loading: "Ładowanie statystyk…", loadingDetails: (done, total) => `Wczytywanie szczegółowych partii ${done}/${total}…`, noGames: "Najpierw przeanalizuj lub zapisz kilka partii. Statystyki zbudują się automatycznie z Archiwum.",
    tabs: { overview: "Podsumowanie", games: "Partie", openings: "Debiuty", puzzles: "Zadania", training: "Trening", brilliants: "Genialne ruchy" },
    samples: { "10": "Ostatnie 10", "20": "Ostatnie 20", "50": "Ostatnie 50", "100": "Ostatnie 100", "7d": "7 dni", "30d": "30 dni", "90d": "90 dni", "365d": "1 rok", all: "Wszystkie" },
    metrics: { games: "Partie", accuracy: "Średnia dokładność", score: "Wynik", performance: "Performance", moves: "Ruchy", mistakes: "Błędy", misses: "Przeoczenia", blunders: "Poważne błędy", brilliants: "Genialne", perGame: "na partię", per100: "na 100 ruchów", white: "Białe", black: "Czarne", wins: "Wygrane", draws: "Remisy", losses: "Porażki", opening: "Debiut", middlegame: "Gra środkowa", endgame: "Końcówka", bestGame: "Najlepsza partia", worstGame: "Najniższa dokładność", currentRating: "Aktualne Elo", attempts: "Ocenione próby", correct: "Skuteczność", currentStreak: "Aktualna seria", bestStreak: "Najlepsza seria", lessons: "Lekcje", duel: "Pojedynek ze Stockfishem", completed: "ukończone" },
    sections: { snapshot: "Podsumowanie", accuracyTrend: "Trend dokładności", colour: "Białe vs czarne", errorsByPhase: "Gdzie pojawiają się poważne błędy", quality: "Jakość ruchów", openings: "Wyniki debiutowe", puzzleSummary: "Trening zadań", trainingSummary: "Aktywność treningowa", brilliants: "Twoje genialne ruchy", brilliantsSub: "Wszystkie !! znalezione w wybranych przeanalizowanych partiach. Otwórz ruch, aby wrócić do dokładnej pozycji.", noBrilliants: "W tej próbce nie znaleziono genialnych ruchów.", detailedCoverage: "Szczegółowe pokrycie", plan: "Zamień diagnozę w trening" },
    openGame: "Otwórz partię", viewBrilliant: "Zobacz genialny ruch", unknownOpening: "Nieznany debiut", unknownOpponent: "Przeciwnik", planCta: "Otwórz plan treningowy", puzzleHistoryNote: "Ta sekcja pokazuje dane zadań, które NexoChess obecnie zapisuje. Trendy tematyczne będą wiarygodne po zapisaniu historii każdej próby; dane, których nigdy nie zapisano, nie są odtwarzane."
};

const copies: Record<string, StatisticsCopy> = {
    en, es, fr, de, pt, ru, zh, vi, hi, mr, pl
};

export function getStatisticsCopy(language?: string) {
    const key = (language || "en").toLowerCase().replace("_", "-").split("-")[0];
    return copies[key] || en;
}
