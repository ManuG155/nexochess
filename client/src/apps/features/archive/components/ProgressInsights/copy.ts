const en = {
    title: "Progress",
    subtitle: "Turn your analysed games and training into useful patterns.",
    periods: ["7 days", "30 days", "90 days", "1 year", "All"],
    games: "Games",
    accuracy: "Average accuracy",
    puzzleElo: "Puzzle Elo",
    lessons: "Lessons",
    gameForm: "Your game",
    accuracyTrend: "Accuracy over time",
    noAccuracy: "Analyse and save more games to build this chart.",
    errors: "Errors by phase",
    sample: "detailed games sampled",
    opening: "Opening",
    middlegame: "Middlegame",
    endgame: "Endgame",
    mistakes: "Mistakes",
    misses: "Misses",
    blunders: "Blunders",
    blundersPerGame: "Blunders / game",
    sides: "White vs black",
    white: "White",
    black: "Black",
    performance: "Performance",
    results: "Results",
    noSide: "Not enough games from one recurring username yet.",
    openings: "Your openings",
    openingHint: "Most played openings in this period",
    played: "games",
    score: "score",
    unknownOpening: "Unknown opening",
    training: "Training",
    attempts: "rated attempts",
    correct: "correct",
    bestStreak: "best streak",
    completed: "completed",
    duel: "Duelo vs Stockfish",
    wins: "W",
    draws: "D",
    losses: "L",
    noDuel: "No completed Duelo games detected in this period.",
    focus: "What to work on",
    detailLoading: "Reading recent analysed games…",
    totalLabel: "lifetime",
    profile: "Detected player",
    profileFallback: "Archive overview",
    detailLimited: "Detailed error breakdown uses the most recent 36 games in the selected period.",
    actionPuzzles: "Train puzzles",
    actionLessons: "Continue lessons",
    actionAnalysis: "Analyse a game",
    improvePhase: "Most of your serious errors are appearing in",
    weakerSide: "Your lower-accuracy side is",
    bestOpening: "Your strongest recurring opening is",
    empty: "There is not enough archived data for this period yet."
};

type ProgressCopy = typeof en;

const es: ProgressCopy = {
    title: "Progreso",
    subtitle: "Convierte tus partidas analizadas y tu entrenamiento en patrones útiles.",
    periods: ["7 días", "30 días", "90 días", "1 año", "Todo"],
    games: "Partidas",
    accuracy: "Precisión media",
    puzzleElo: "Elo de puzzles",
    lessons: "Lecciones",
    gameForm: "Tu juego",
    accuracyTrend: "Evolución de precisión",
    noAccuracy: "Analiza y guarda más partidas para construir esta gráfica.",
    errors: "Errores por fase",
    sample: "partidas detalladas analizadas",
    opening: "Apertura",
    middlegame: "Medio juego",
    endgame: "Final",
    mistakes: "Errores",
    misses: "Omisiones",
    blunders: "Errores graves",
    blundersPerGame: "Graves / partida",
    sides: "Blancas vs negras",
    white: "Blancas",
    black: "Negras",
    performance: "Rendimiento",
    results: "Resultados",
    noSide: "Todavía no hay suficientes partidas de un mismo usuario recurrente.",
    openings: "Tus aperturas",
    openingHint: "Aperturas más jugadas en este periodo",
    played: "partidas",
    score: "resultado",
    unknownOpening: "Apertura desconocida",
    training: "Entrenamiento",
    attempts: "intentos evaluados",
    correct: "acierto",
    bestStreak: "mejor racha",
    completed: "completadas",
    duel: "Duelo contra Stockfish",
    wins: "V",
    draws: "T",
    losses: "D",
    noDuel: "No se detectan partidas de Duelo terminadas en este periodo.",
    focus: "Qué te conviene trabajar",
    detailLoading: "Leyendo las últimas partidas analizadas…",
    totalLabel: "total",
    profile: "Jugador detectado",
    profileFallback: "Resumen del Archivo",
    detailLimited: "El desglose detallado usa como máximo las 36 partidas más recientes del periodo.",
    actionPuzzles: "Entrenar puzzles",
    actionLessons: "Continuar lecciones",
    actionAnalysis: "Analizar partida",
    improvePhase: "La mayoría de tus errores serios aparecen en",
    weakerSide: "Tu lado con menor precisión es",
    bestOpening: "Tu apertura recurrente más sólida es",
    empty: "Todavía no hay suficientes datos archivados para este periodo."
};

const fr: ProgressCopy = {
    title: "Progression", subtitle: "Transformez vos parties analysées et votre entraînement en tendances utiles.", periods: ["7 jours", "30 jours", "90 jours", "1 an", "Tout"],
    games: "Parties", accuracy: "Précision moyenne", puzzleElo: "Elo puzzles", lessons: "Leçons", gameForm: "Votre jeu", accuracyTrend: "Évolution de la précision", noAccuracy: "Analysez et sauvegardez davantage de parties pour construire ce graphique.",
    errors: "Erreurs par phase", sample: "parties détaillées analysées", opening: "Ouverture", middlegame: "Milieu de partie", endgame: "Finale", mistakes: "Erreurs", misses: "Occasions manquées", blunders: "Gaffes", blundersPerGame: "Gaffes / partie",
    sides: "Blancs vs noirs", white: "Blancs", black: "Noirs", performance: "Performance", results: "Résultats", noSide: "Pas encore assez de parties avec un même nom d’utilisateur récurrent.", openings: "Vos ouvertures", openingHint: "Ouvertures les plus jouées sur cette période", played: "parties", score: "score", unknownOpening: "Ouverture inconnue",
    training: "Entraînement", attempts: "essais classés", correct: "réussite", bestStreak: "meilleure série", completed: "terminées", duel: "Duel contre Stockfish", wins: "V", draws: "N", losses: "D", noDuel: "Aucune partie de Duel terminée détectée sur cette période.",
    focus: "À travailler", detailLoading: "Lecture des parties analysées récentes…", totalLabel: "total", profile: "Joueur détecté", profileFallback: "Vue d’ensemble de l’Archive", detailLimited: "Le détail des erreurs utilise au maximum les 36 parties les plus récentes de la période.", actionPuzzles: "Entraîner les puzzles", actionLessons: "Continuer les leçons", actionAnalysis: "Analyser une partie", improvePhase: "La plupart de vos erreurs sérieuses apparaissent en", weakerSide: "Votre côté le moins précis est", bestOpening: "Votre ouverture récurrente la plus solide est", empty: "Il n’y a pas encore assez de données archivées pour cette période."
};

const de: ProgressCopy = {
    title: "Fortschritt", subtitle: "Mache aus analysierten Partien und Training nützliche Muster.", periods: ["7 Tage", "30 Tage", "90 Tage", "1 Jahr", "Gesamt"], games: "Partien", accuracy: "Ø Genauigkeit", puzzleElo: "Puzzle-Elo", lessons: "Lektionen", gameForm: "Dein Spiel", accuracyTrend: "Genauigkeit im Verlauf", noAccuracy: "Analysiere und speichere mehr Partien, um diese Grafik aufzubauen.", errors: "Fehler nach Phase", sample: "detailliert ausgewertete Partien", opening: "Eröffnung", middlegame: "Mittelspiel", endgame: "Endspiel", mistakes: "Fehler", misses: "Verpasste Chancen", blunders: "Patzer", blundersPerGame: "Patzer / Partie", sides: "Weiß vs Schwarz", white: "Weiß", black: "Schwarz", performance: "Leistung", results: "Ergebnisse", noSide: "Noch nicht genug Partien eines wiederkehrenden Benutzernamens.", openings: "Deine Eröffnungen", openingHint: "Meistgespielte Eröffnungen in diesem Zeitraum", played: "Partien", score: "Punkte", unknownOpening: "Unbekannte Eröffnung", training: "Training", attempts: "gewertete Versuche", correct: "richtig", bestStreak: "beste Serie", completed: "abgeschlossen", duel: "Duell gegen Stockfish", wins: "S", draws: "R", losses: "N", noDuel: "In diesem Zeitraum wurden keine beendeten Duell-Partien erkannt.", focus: "Woran du arbeiten solltest", detailLoading: "Letzte analysierte Partien werden gelesen…", totalLabel: "gesamt", profile: "Erkannter Spieler", profileFallback: "Archivübersicht", detailLimited: "Die detaillierte Fehleranalyse nutzt höchstens die 36 neuesten Partien des Zeitraums.", actionPuzzles: "Puzzles trainieren", actionLessons: "Lektionen fortsetzen", actionAnalysis: "Partie analysieren", improvePhase: "Die meisten schweren Fehler passieren im", weakerSide: "Deine Seite mit geringerer Genauigkeit ist", bestOpening: "Deine stärkste regelmäßig gespielte Eröffnung ist", empty: "Für diesen Zeitraum gibt es noch nicht genug Archivdaten."
};

const pt: ProgressCopy = {
    title: "Progresso", subtitle: "Transforme as partidas analisadas e o treino em padrões úteis.", periods: ["7 dias", "30 dias", "90 dias", "1 ano", "Tudo"], games: "Partidas", accuracy: "Precisão média", puzzleElo: "Elo de puzzles", lessons: "Lições", gameForm: "O teu jogo", accuracyTrend: "Evolução da precisão", noAccuracy: "Analisa e guarda mais partidas para construir este gráfico.", errors: "Erros por fase", sample: "partidas detalhadas analisadas", opening: "Abertura", middlegame: "Meio-jogo", endgame: "Final", mistakes: "Erros", misses: "Omissões", blunders: "Erros graves", blundersPerGame: "Graves / partida", sides: "Brancas vs pretas", white: "Brancas", black: "Pretas", performance: "Desempenho", results: "Resultados", noSide: "Ainda não há partidas suficientes de um mesmo utilizador recorrente.", openings: "As tuas aberturas", openingHint: "Aberturas mais jogadas neste período", played: "partidas", score: "resultado", unknownOpening: "Abertura desconhecida", training: "Treino", attempts: "tentativas avaliadas", correct: "acerto", bestStreak: "melhor série", completed: "concluídas", duel: "Duelo contra Stockfish", wins: "V", draws: "E", losses: "D", noDuel: "Não foram detetadas partidas de Duelo concluídas neste período.", focus: "O que deves trabalhar", detailLoading: "A ler as partidas analisadas mais recentes…", totalLabel: "total", profile: "Jogador detetado", profileFallback: "Resumo do Arquivo", detailLimited: "O detalhe de erros usa no máximo as 36 partidas mais recentes do período.", actionPuzzles: "Treinar puzzles", actionLessons: "Continuar lições", actionAnalysis: "Analisar partida", improvePhase: "A maioria dos teus erros sérios aparece no", weakerSide: "O teu lado com menor precisão é", bestOpening: "A tua abertura recorrente mais sólida é", empty: "Ainda não existem dados arquivados suficientes para este período."
};

const ru: ProgressCopy = {
    title: "Прогресс", subtitle: "Превращайте анализ партий и тренировки в полезные закономерности.", periods: ["7 дней", "30 дней", "90 дней", "1 год", "Всё"], games: "Партии", accuracy: "Средняя точность", puzzleElo: "Рейтинг задач", lessons: "Уроки", gameForm: "Ваша игра", accuracyTrend: "Динамика точности", noAccuracy: "Проанализируйте и сохраните больше партий, чтобы построить график.", errors: "Ошибки по стадиям", sample: "детально разобранных партий", opening: "Дебют", middlegame: "Миттельшпиль", endgame: "Эндшпиль", mistakes: "Ошибки", misses: "Упущения", blunders: "Грубые ошибки", blundersPerGame: "Грубых / партия", sides: "Белые vs чёрные", white: "Белые", black: "Чёрные", performance: "Перформанс", results: "Результаты", noSide: "Пока недостаточно партий с одним повторяющимся именем пользователя.", openings: "Ваши дебюты", openingHint: "Самые частые дебюты за период", played: "партий", score: "результат", unknownOpening: "Неизвестный дебют", training: "Тренировка", attempts: "рейтинговых попыток", correct: "успех", bestStreak: "лучшая серия", completed: "завершено", duel: "Дуэль со Stockfish", wins: "В", draws: "Н", losses: "П", noDuel: "За этот период завершённые дуэли не обнаружены.", focus: "Над чем работать", detailLoading: "Читаем последние проанализированные партии…", totalLabel: "всего", profile: "Определённый игрок", profileFallback: "Обзор архива", detailLimited: "Подробный разбор ошибок использует максимум 36 последних партий периода.", actionPuzzles: "Тренировать задачи", actionLessons: "Продолжить уроки", actionAnalysis: "Анализировать партию", improvePhase: "Большинство серьёзных ошибок происходит на стадии", weakerSide: "Сторона с меньшей точностью —", bestOpening: "Ваш самый стабильный повторяющийся дебют —", empty: "Для этого периода пока недостаточно архивных данных."
};

const zh: ProgressCopy = {
    title: "进度", subtitle: "把已分析的对局和训练转化为有用的规律。", periods: ["7天", "30天", "90天", "1年", "全部"], games: "对局", accuracy: "平均准确率", puzzleElo: "题目等级分", lessons: "课程", gameForm: "你的棋局", accuracyTrend: "准确率变化", noAccuracy: "分析并保存更多对局后即可生成图表。", errors: "各阶段失误", sample: "盘详细分析对局", opening: "开局", middlegame: "中局", endgame: "残局", mistakes: "错误", misses: "错失机会", blunders: "严重错误", blundersPerGame: "严重错误 / 局", sides: "白棋 vs 黑棋", white: "白棋", black: "黑棋", performance: "表现等级分", results: "结果", noSide: "目前还没有足够多来自同一常用用户名的对局。", openings: "你的开局", openingHint: "本时段最常使用的开局", played: "局", score: "得分率", unknownOpening: "未知开局", training: "训练", attempts: "次计分尝试", correct: "正确率", bestStreak: "最佳连胜", completed: "已完成", duel: "对战 Stockfish", wins: "胜", draws: "和", losses: "负", noDuel: "本时段未检测到已完成的对战。", focus: "接下来该练什么", detailLoading: "正在读取最近分析的对局…", totalLabel: "总计", profile: "识别到的棋手", profileFallback: "档案概览", detailLimited: "详细失误统计最多使用本时段最近的36盘对局。", actionPuzzles: "训练题目", actionLessons: "继续课程", actionAnalysis: "分析对局", improvePhase: "你的严重错误主要出现在", weakerSide: "准确率较低的一方是", bestOpening: "你最稳定的常用开局是", empty: "本时段还没有足够的档案数据。"
};

const vi: ProgressCopy = {
    title: "Tiến bộ", subtitle: "Biến các ván đã phân tích và việc luyện tập thành những xu hướng hữu ích.", periods: ["7 ngày", "30 ngày", "90 ngày", "1 năm", "Tất cả"], games: "Ván đấu", accuracy: "Độ chính xác TB", puzzleElo: "Elo puzzle", lessons: "Bài học", gameForm: "Lối chơi của bạn", accuracyTrend: "Độ chính xác theo thời gian", noAccuracy: "Phân tích và lưu thêm ván để tạo biểu đồ này.", errors: "Lỗi theo giai đoạn", sample: "ván được phân tích chi tiết", opening: "Khai cuộc", middlegame: "Trung cuộc", endgame: "Tàn cuộc", mistakes: "Sai lầm", misses: "Bỏ lỡ", blunders: "Sai lầm nghiêm trọng", blundersPerGame: "Nghiêm trọng / ván", sides: "Trắng vs đen", white: "Trắng", black: "Đen", performance: "Hiệu suất", results: "Kết quả", noSide: "Chưa đủ ván từ một tên người dùng lặp lại.", openings: "Khai cuộc của bạn", openingHint: "Khai cuộc được chơi nhiều nhất trong giai đoạn này", played: "ván", score: "điểm", unknownOpening: "Khai cuộc chưa rõ", training: "Luyện tập", attempts: "lần có xếp hạng", correct: "đúng", bestStreak: "chuỗi tốt nhất", completed: "đã hoàn thành", duel: "Đấu Stockfish", wins: "T", draws: "H", losses: "B", noDuel: "Không phát hiện ván Đấu nào đã hoàn thành trong giai đoạn này.", focus: "Nên luyện gì", detailLoading: "Đang đọc các ván phân tích gần đây…", totalLabel: "tổng", profile: "Người chơi phát hiện", profileFallback: "Tổng quan Lưu trữ", detailLimited: "Phân tích lỗi chi tiết dùng tối đa 36 ván gần nhất của giai đoạn.", actionPuzzles: "Luyện puzzle", actionLessons: "Tiếp tục bài học", actionAnalysis: "Phân tích ván", improvePhase: "Phần lớn lỗi nghiêm trọng của bạn xuất hiện ở", weakerSide: "Bên có độ chính xác thấp hơn là", bestOpening: "Khai cuộc thường dùng ổn định nhất của bạn là", empty: "Chưa có đủ dữ liệu lưu trữ cho giai đoạn này."
};

const hi: ProgressCopy = {
    title: "प्रगति", subtitle: "विश्लेषित बाज़ियों और अभ्यास को उपयोगी पैटर्न में बदलें।", periods: ["7 दिन", "30 दिन", "90 दिन", "1 वर्ष", "सभी"], games: "बाज़ियाँ", accuracy: "औसत सटीकता", puzzleElo: "पज़ल Elo", lessons: "पाठ", gameForm: "आपका खेल", accuracyTrend: "समय के साथ सटीकता", noAccuracy: "यह ग्राफ बनाने के लिए और बाज़ियाँ विश्लेषित व सेव करें।", errors: "चरण के अनुसार त्रुटियाँ", sample: "विस्तृत बाज़ियाँ", opening: "ओपनिंग", middlegame: "मिडिलगेम", endgame: "एंडगेम", mistakes: "गलतियाँ", misses: "चूके मौके", blunders: "गंभीर गलतियाँ", blundersPerGame: "गंभीर / बाज़ी", sides: "सफेद vs काला", white: "सफेद", black: "काला", performance: "प्रदर्शन", results: "परिणाम", noSide: "अभी एक ही नियमित उपयोगकर्ता नाम की पर्याप्त बाज़ियाँ नहीं हैं।", openings: "आपकी ओपनिंग", openingHint: "इस अवधि में सबसे अधिक खेली गई ओपनिंग", played: "बाज़ियाँ", score: "स्कोर", unknownOpening: "अज्ञात ओपनिंग", training: "अभ्यास", attempts: "रेटेड प्रयास", correct: "सही", bestStreak: "सर्वश्रेष्ठ स्ट्रीक", completed: "पूर्ण", duel: "Stockfish के विरुद्ध द्वंद्व", wins: "जी", draws: "ड्रा", losses: "हा", noDuel: "इस अवधि में कोई पूर्ण द्वंद्व नहीं मिला।", focus: "किस पर काम करें", detailLoading: "हाल की विश्लेषित बाज़ियाँ पढ़ी जा रही हैं…", totalLabel: "कुल", profile: "पहचाना गया खिलाड़ी", profileFallback: "आर्काइव सारांश", detailLimited: "विस्तृत त्रुटि विश्लेषण अवधि की अधिकतम 36 हाल की बाज़ियाँ उपयोग करता है।", actionPuzzles: "पज़ल अभ्यास", actionLessons: "पाठ जारी रखें", actionAnalysis: "बाज़ी विश्लेषित करें", improvePhase: "आपकी अधिकतर गंभीर गलतियाँ इस चरण में आ रही हैं", weakerSide: "कम सटीकता वाला पक्ष है", bestOpening: "आपकी सबसे मजबूत नियमित ओपनिंग है", empty: "इस अवधि के लिए अभी पर्याप्त आर्काइव डेटा नहीं है।"
};

const mr: ProgressCopy = {
    title: "प्रगती", subtitle: "विश्लेषित डाव आणि सराव उपयुक्त पॅटर्नमध्ये बदला.", periods: ["7 दिवस", "30 दिवस", "90 दिवस", "1 वर्ष", "सर्व"], games: "डाव", accuracy: "सरासरी अचूकता", puzzleElo: "पझल Elo", lessons: "धडे", gameForm: "तुमचा खेळ", accuracyTrend: "अचूकतेतील बदल", noAccuracy: "हा आलेख तयार करण्यासाठी आणखी डाव विश्लेषित करून जतन करा.", errors: "टप्प्यानुसार चुका", sample: "तपशीलवार डाव", opening: "ओपनिंग", middlegame: "मिडलगेम", endgame: "एंडगेम", mistakes: "चुका", misses: "संधी चुकल्या", blunders: "गंभीर चुका", blundersPerGame: "गंभीर / डाव", sides: "पांढरे vs काळे", white: "पांढरे", black: "काळे", performance: "कामगिरी", results: "निकाल", noSide: "एका नियमित वापरकर्तानावाचे पुरेसे डाव अजून नाहीत.", openings: "तुमच्या ओपनिंग", openingHint: "या कालावधीत सर्वाधिक खेळलेल्या ओपनिंग", played: "डाव", score: "स्कोअर", unknownOpening: "अज्ञात ओपनिंग", training: "सराव", attempts: "रेटेड प्रयत्न", correct: "बरोबर", bestStreak: "सर्वोत्तम मालिका", completed: "पूर्ण", duel: "Stockfish विरुद्ध द्वंद्व", wins: "वि", draws: "ब", losses: "प", noDuel: "या कालावधीत पूर्ण झालेले द्वंद्व आढळले नाहीत.", focus: "कशावर काम करावे", detailLoading: "अलीकडील विश्लेषित डाव वाचत आहोत…", totalLabel: "एकूण", profile: "ओळखलेला खेळाडू", profileFallback: "आर्काइव्ह सारांश", detailLimited: "तपशीलवार चुका विश्लेषणात कालावधीतील जास्तीत जास्त 36 अलीकडील डाव वापरले जातात.", actionPuzzles: "पझल सराव", actionLessons: "धडे सुरू ठेवा", actionAnalysis: "डाव विश्लेषित करा", improvePhase: "तुमच्या बहुतेक गंभीर चुका या टप्प्यात होतात", weakerSide: "कमी अचूकतेचा रंग आहे", bestOpening: "तुमची सर्वात मजबूत नियमित ओपनिंग आहे", empty: "या कालावधीसाठी अजून पुरेसा आर्काइव्ह डेटा नाही."
};

const pl: ProgressCopy = {
    title: "Postęp", subtitle: "Zamień przeanalizowane partie i trening w użyteczne wzorce.", periods: ["7 dni", "30 dni", "90 dni", "1 rok", "Wszystko"], games: "Partie", accuracy: "Śr. dokładność", puzzleElo: "Elo zadań", lessons: "Lekcje", gameForm: "Twoja gra", accuracyTrend: "Zmiana dokładności", noAccuracy: "Przeanalizuj i zapisz więcej partii, aby zbudować ten wykres.", errors: "Błędy według fazy", sample: "szczegółowo przeanalizowanych partii", opening: "Debiut", middlegame: "Gra środkowa", endgame: "Końcówka", mistakes: "Błędy", misses: "Przeoczenia", blunders: "Poważne błędy", blundersPerGame: "Poważne / partię", sides: "Białe vs czarne", white: "Białe", black: "Czarne", performance: "Performance", results: "Wyniki", noSide: "Nie ma jeszcze dość partii jednego powtarzającego się użytkownika.", openings: "Twoje debiuty", openingHint: "Najczęściej grane debiuty w tym okresie", played: "partii", score: "wynik", unknownOpening: "Nieznany debiut", training: "Trening", attempts: "prób rankingowych", correct: "poprawnych", bestStreak: "najlepsza seria", completed: "ukończone", duel: "Pojedynek ze Stockfishem", wins: "W", draws: "R", losses: "P", noDuel: "W tym okresie nie wykryto zakończonych pojedynków.", focus: "Nad czym pracować", detailLoading: "Czytanie ostatnio analizowanych partii…", totalLabel: "łącznie", profile: "Wykryty gracz", profileFallback: "Podsumowanie Archiwum", detailLimited: "Szczegółowy podział błędów używa maksymalnie 36 najnowszych partii z okresu.", actionPuzzles: "Trenuj zadania", actionLessons: "Kontynuuj lekcje", actionAnalysis: "Analizuj partię", improvePhase: "Większość poważnych błędów pojawia się w", weakerSide: "Strona z niższą dokładnością to", bestOpening: "Twój najsolidniejszy regularny debiut to", empty: "Dla tego okresu nie ma jeszcze wystarczających danych archiwalnych."
};

const COPIES: Record<string, ProgressCopy> = { en, es, fr, de, pt, ru, zh, vi, hi, mr, pl };

export function getProgressCopy(language?: string) {
    const code = (language || "en").toLowerCase().split("-")[0];
    return COPIES[code] || en;
}
