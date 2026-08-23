import type { CoarseOutcome, EndgameThemeId, EndgameTier } from "./types";

export interface EndgameCopy {
    accessTitle: string;
    accessSubtitle: string;
    accessCta: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    backLessons: string;
    chooseLevel: string;
    levelPositions: (count: number) => string;
    mastery: string;
    themes: Record<EndgameThemeId, string>;
    tiers: Record<EndgameTier, { title: string; description: string }>;
    customTitle: string;
    customSubtitle: string;
    customPlaceholder: string;
    customCta: string;
    invalidFen: string;
    tooManyPieces: string;
    exactBadge: string;
    exactDescription: string;
    selectTheme: string;
    backLevels: string;
    backThemes: string;
    position: (current: number, total: number) => string;
    objective: Record<CoarseOutcome, string>;
    probing: string;
    yourTurn: string;
    opponentTurn: string;
    reset: string;
    hint: string;
    bestMove: (move: string) => string;
    next: string;
    retry: string;
    maintainedWin: string;
    maintainedDraw: string;
    lostWinToDraw: string;
    lostWinToLoss: string;
    lostDraw: string;
    checkmate: string;
    drawReached: string;
    positionFinished: string;
    tablebaseUnavailable: string;
    completed: string;
    firstTry: string;
    noPreload: string;
}

const themeEn: Record<EndgameThemeId, string> = {
    "basic-mates": "Basic checkmates",
    "pawn-square": "Rule of the square",
    opposition: "Opposition",
    "key-squares": "Key squares",
    "rook-pawn": "Rook-pawn endings",
    "pawn-race": "Pawn races",
    lucena: "Lucena position",
    philidor: "Philidor defence",
    "rook-behind-pawn": "Rook behind the passed pawn",
    "active-rook": "Active rook defence",
    "minor-piece-pawns": "Minor-piece endings",
    "queen-vs-pawn": "Queen versus advanced pawn",
    "rook-cutoff": "Cutting off the king",
    "side-checks": "Side checks",
    "rook-two-pawns": "Complex rook endings",
    triangulation: "Triangulation and zugzwang",
    fortress: "Fortresses",
    "queen-rook": "Queen versus rook"
};

const themeEs: Record<EndgameThemeId, string> = {
    "basic-mates": "Mates básicos",
    "pawn-square": "Regla del cuadrado",
    opposition: "Oposición",
    "key-squares": "Casillas clave",
    "rook-pawn": "Finales con peón de torre",
    "pawn-race": "Carreras de peones",
    lucena: "Posición de Lucena",
    philidor: "Defensa de Philidor",
    "rook-behind-pawn": "Torre detrás del peón pasado",
    "active-rook": "Defensa activa con torre",
    "minor-piece-pawns": "Finales de piezas menores",
    "queen-vs-pawn": "Dama contra peón avanzado",
    "rook-cutoff": "Cortar al rey",
    "side-checks": "Jaques laterales",
    "rook-two-pawns": "Finales complejos de torres",
    triangulation: "Triangulación y zugzwang",
    fortress: "Fortalezas",
    "queen-rook": "Dama contra torre"
};

const en: EndgameCopy = {
    accessTitle: "Endgame laboratory",
    accessSubtitle: "Playable endgames with exact tablebase feedback, from fundamentals to advanced technique.",
    accessCta: "Open laboratory",
    eyebrow: "Practical endgame training",
    title: "Endgame laboratory",
    subtitle: "Learn, defend and convert real endgames. Exact tablebases verify every move whenever the position has seven pieces or fewer.",
    backLessons: "Back to lessons",
    chooseLevel: "Choose a level",
    levelPositions: count => `${count} positions`,
    mastery: "Mastery",
    themes: themeEn,
    tiers: {
        basic: { title: "Fundamentals", description: "Essential mates, king-and-pawn technique, opposition and pawn races." },
        intermediate: { title: "Intermediate", description: "Lucena, Philidor, active rooks and practical minor-piece endings." },
        advanced: { title: "Advanced", description: "Technical rook endings, fortresses, triangulation and heavy-piece precision." }
    },
    customTitle: "Load a position",
    customSubtitle: "Paste a FEN with up to seven pieces and practise it with exact feedback.",
    customPlaceholder: "Paste FEN…",
    customCta: "Practise position",
    invalidFen: "That FEN is not a valid chess position.",
    tooManyPieces: "Exact feedback currently supports positions with seven pieces or fewer.",
    exactBadge: "Exact tablebase",
    exactDescription: "No engine estimate: the result is mathematically known.",
    selectTheme: "Choose a theme",
    backLevels: "Levels",
    backThemes: "Themes",
    position: (current, total) => `Position ${current}/${total}`,
    objective: { win: "Convert the win", draw: "Hold the draw", loss: "Find the best defence" },
    probing: "Checking exact result…",
    yourTurn: "Your turn",
    opponentTurn: "Tablebase is replying…",
    reset: "Reset",
    hint: "Hint",
    bestMove: move => `Best move: ${move}`,
    next: "Next position",
    retry: "Try again",
    maintainedWin: "Correct. The position is still winning.",
    maintainedDraw: "Correct. You keep the draw.",
    lostWinToDraw: "You let the win escape. The position is now a draw.",
    lostWinToLoss: "This move turns a winning position into a loss.",
    lostDraw: "The position was a draw, but this move loses.",
    checkmate: "Checkmate. Converted perfectly.",
    drawReached: "Draw secured.",
    positionFinished: "Position finished.",
    tablebaseUnavailable: "Exact tablebase feedback is temporarily unavailable. You can reset or try another position.",
    completed: "Completed",
    firstTry: "First try",
    noPreload: "Positions are loaded only when you choose a level, keeping Lessons fast."
};

const es: EndgameCopy = {
    accessTitle: "Laboratorio de finales",
    accessSubtitle: "Finales jugables con feedback exacto de tablebases, desde fundamentos hasta técnica avanzada.",
    accessCta: "Abrir laboratorio",
    eyebrow: "Entrenamiento práctico de finales",
    title: "Laboratorio de finales",
    subtitle: "Aprende, defiende y convierte finales reales. Las tablebases verifican cada jugada con exactitud cuando hay siete piezas o menos.",
    backLessons: "Volver a Lecciones",
    chooseLevel: "Elige un nivel",
    levelPositions: count => `${count} posiciones`,
    mastery: "Dominio",
    themes: themeEs,
    tiers: {
        basic: { title: "Fundamentos", description: "Mates esenciales, rey y peón, oposición, casillas clave y carreras de peones." },
        intermediate: { title: "Intermedio", description: "Lucena, Philidor, torres activas y finales prácticos de piezas menores." },
        advanced: { title: "Avanzado", description: "Finales técnicos de torres, fortalezas, triangulación y precisión con piezas mayores." }
    },
    customTitle: "Cargar posición",
    customSubtitle: "Pega un FEN de hasta siete piezas y practícalo con feedback exacto.",
    customPlaceholder: "Pega un FEN…",
    customCta: "Practicar posición",
    invalidFen: "Ese FEN no representa una posición de ajedrez válida.",
    tooManyPieces: "El feedback exacto admite por ahora posiciones de siete piezas o menos.",
    exactBadge: "Tablebase exacta",
    exactDescription: "No es una estimación de motor: el resultado se conoce matemáticamente.",
    selectTheme: "Elige un tema",
    backLevels: "Niveles",
    backThemes: "Temas",
    position: (current, total) => `Posición ${current}/${total}`,
    objective: { win: "Convierte la victoria", draw: "Mantén las tablas", loss: "Encuentra la mejor defensa" },
    probing: "Comprobando resultado exacto…",
    yourTurn: "Tu turno",
    opponentTurn: "La tablebase está respondiendo…",
    reset: "Reiniciar",
    hint: "Pista",
    bestMove: move => `Mejor jugada: ${move}`,
    next: "Siguiente posición",
    retry: "Intentarlo de nuevo",
    maintainedWin: "Correcto. La posición sigue ganada.",
    maintainedDraw: "Correcto. Mantienes las tablas.",
    lostWinToDraw: "Has dejado escapar la victoria. Ahora la posición es tablas.",
    lostWinToLoss: "Esta jugada convierte una posición ganada en perdida.",
    lostDraw: "La posición era tablas, pero esta jugada pierde.",
    checkmate: "Jaque mate. Conversión perfecta.",
    drawReached: "Tablas aseguradas.",
    positionFinished: "Posición terminada.",
    tablebaseUnavailable: "El feedback exacto no está disponible temporalmente. Puedes reiniciar o probar otra posición.",
    completed: "Completada",
    firstTry: "Al primer intento",
    noPreload: "Las posiciones solo se cargan cuando eliges un nivel, para que Lecciones siga cargando rápido."
};

function translated(base: EndgameCopy, patch: Partial<EndgameCopy>): EndgameCopy {
    return {
        ...base,
        ...patch,
        tiers: patch.tiers || base.tiers,
        themes: patch.themes || base.themes,
        objective: patch.objective || base.objective
    };
}

const copies: Record<string, EndgameCopy> = {
    en,
    es,
    fr: translated(en, {
        accessTitle: "Laboratoire de finales", accessSubtitle: "Finales jouables avec retour exact des tablebases, des bases à la technique avancée.", accessCta: "Ouvrir le laboratoire", eyebrow: "Entraînement pratique des finales", title: "Laboratoire de finales", subtitle: "Apprenez, défendez et convertissez des finales réelles avec un résultat exact jusqu’à sept pièces.", backLessons: "Retour aux leçons", chooseLevel: "Choisissez un niveau", mastery: "Maîtrise", customTitle: "Charger une position", customSubtitle: "Collez un FEN de sept pièces ou moins pour le travailler avec un retour exact.", customPlaceholder: "Collez un FEN…", customCta: "Travailler la position", invalidFen: "Ce FEN n’est pas une position valide.", tooManyPieces: "Le retour exact prend actuellement en charge jusqu’à sept pièces.", exactBadge: "Tablebase exacte", exactDescription: "Pas d’estimation moteur : le résultat est mathématiquement connu.", selectTheme: "Choisissez un thème", backLevels: "Niveaux", backThemes: "Thèmes", probing: "Vérification du résultat exact…", yourTurn: "À vous", opponentTurn: "La tablebase répond…", reset: "Recommencer", hint: "Indice", next: "Position suivante", retry: "Réessayer", maintainedWin: "Correct. La position reste gagnante.", maintainedDraw: "Correct. Vous conservez la nulle.", lostWinToDraw: "Le gain s’est échappé : la position est maintenant nulle.", lostWinToLoss: "Ce coup transforme une position gagnante en défaite.", lostDraw: "La position était nulle, mais ce coup perd.", checkmate: "Échec et mat. Conversion parfaite.", drawReached: "Nulle assurée.", positionFinished: "Position terminée.", tablebaseUnavailable: "La tablebase exacte est temporairement indisponible.", completed: "Terminée", firstTry: "Premier essai", noPreload: "Les positions ne sont chargées qu’après le choix d’un niveau pour garder les Leçons rapides."
    }),
    de: translated(en, {
        accessTitle: "Endspiel-Labor", accessSubtitle: "Spielbare Endspiele mit exaktem Tablebase-Feedback – von Grundlagen bis Fortgeschritten.", accessCta: "Labor öffnen", eyebrow: "Praktisches Endspieltraining", title: "Endspiel-Labor", subtitle: "Lerne, verteidige und verwandle echte Endspiele mit exakter Prüfung bei bis zu sieben Steinen.", backLessons: "Zurück zu Lektionen", chooseLevel: "Niveau wählen", mastery: "Beherrschung", customTitle: "Stellung laden", customSubtitle: "FEN mit höchstens sieben Steinen einfügen und exakt trainieren.", customPlaceholder: "FEN einfügen…", customCta: "Stellung trainieren", invalidFen: "Diese FEN ist keine gültige Schachstellung.", tooManyPieces: "Exaktes Feedback unterstützt derzeit höchstens sieben Steine.", exactBadge: "Exakte Tablebase", exactDescription: "Keine Engine-Schätzung: Das Ergebnis ist mathematisch bekannt.", selectTheme: "Thema wählen", backLevels: "Niveaus", backThemes: "Themen", probing: "Exaktes Ergebnis wird geprüft…", yourTurn: "Du bist am Zug", opponentTurn: "Tablebase antwortet…", reset: "Neu starten", hint: "Hinweis", next: "Nächste Stellung", retry: "Noch einmal", maintainedWin: "Richtig. Die Stellung bleibt gewonnen.", maintainedDraw: "Richtig. Das Remis bleibt erhalten.", lostWinToDraw: "Der Gewinn ist weg. Die Stellung ist jetzt remis.", lostWinToLoss: "Dieser Zug macht aus einer Gewinnstellung eine Verluststellung.", lostDraw: "Die Stellung war remis, aber dieser Zug verliert.", checkmate: "Schachmatt. Perfekt verwertet.", drawReached: "Remis gesichert.", positionFinished: "Stellung beendet.", tablebaseUnavailable: "Die exakte Tablebase ist vorübergehend nicht verfügbar.", completed: "Abgeschlossen", firstTry: "Erster Versuch", noPreload: "Stellungen werden erst nach der Niveauwahl geladen, damit Lektionen schnell bleiben."
    }),
    pt: translated(en, {
        accessTitle: "Laboratório de finais", accessSubtitle: "Finais jogáveis com feedback exato de tablebases, dos fundamentos à técnica avançada.", accessCta: "Abrir laboratório", eyebrow: "Treino prático de finais", title: "Laboratório de finais", subtitle: "Aprende, defende e converte finais reais com verificação exata até sete peças.", backLessons: "Voltar às lições", chooseLevel: "Escolhe um nível", mastery: "Domínio", customTitle: "Carregar posição", customSubtitle: "Cola um FEN com até sete peças e pratica com feedback exato.", customPlaceholder: "Cola um FEN…", customCta: "Praticar posição", invalidFen: "Esse FEN não é uma posição válida.", tooManyPieces: "O feedback exato suporta atualmente até sete peças.", exactBadge: "Tablebase exata", exactDescription: "Não é estimativa de motor: o resultado é matematicamente conhecido.", selectTheme: "Escolhe um tema", backLevels: "Níveis", backThemes: "Temas", probing: "A verificar resultado exato…", yourTurn: "A tua vez", opponentTurn: "A tablebase está a responder…", reset: "Reiniciar", hint: "Pista", next: "Próxima posição", retry: "Tentar novamente", maintainedWin: "Correto. A posição continua ganha.", maintainedDraw: "Correto. Manténs o empate.", lostWinToDraw: "Deixaste escapar a vitória. Agora é empate.", lostWinToLoss: "Este lance transforma uma posição ganha numa derrota.", lostDraw: "A posição era empate, mas este lance perde.", checkmate: "Xeque-mate. Conversão perfeita.", drawReached: "Empate assegurado.", positionFinished: "Posição terminada.", tablebaseUnavailable: "A tablebase exata está temporariamente indisponível.", completed: "Concluída", firstTry: "À primeira", noPreload: "As posições só carregam depois de escolheres um nível, mantendo Lições rápidas."
    }),
    ru: translated(en, {
        accessTitle: "Лаборатория эндшпиля", accessSubtitle: "Игровые эндшпили с точной проверкой tablebase — от основ до продвинутой техники.", accessCta: "Открыть лабораторию", eyebrow: "Практика эндшпиля", title: "Лаборатория эндшпиля", subtitle: "Учитесь выигрывать и защищать реальные эндшпили с точным результатом при семи фигурах и меньше.", backLessons: "Назад к урокам", chooseLevel: "Выберите уровень", mastery: "Освоение", customTitle: "Загрузить позицию", customSubtitle: "Вставьте FEN с семью фигурами или меньше для точной тренировки.", customPlaceholder: "Вставьте FEN…", customCta: "Тренировать позицию", invalidFen: "Некорректная позиция FEN.", tooManyPieces: "Точная проверка сейчас доступна для семи фигур или меньше.", exactBadge: "Точная tablebase", exactDescription: "Это не оценка движка: результат математически известен.", selectTheme: "Выберите тему", backLevels: "Уровни", backThemes: "Темы", probing: "Проверяем точный результат…", yourTurn: "Ваш ход", opponentTurn: "Tablebase отвечает…", reset: "Сбросить", hint: "Подсказка", next: "Следующая позиция", retry: "Попробовать снова", maintainedWin: "Верно. Позиция остаётся выигранной.", maintainedDraw: "Верно. Ничья сохраняется.", lostWinToDraw: "Победа упущена: теперь ничья.", lostWinToLoss: "Этот ход превращает выигрыш в поражение.", lostDraw: "Позиция была ничейной, но этот ход проигрывает.", checkmate: "Мат. Отличная реализация.", drawReached: "Ничья сохранена.", positionFinished: "Позиция завершена.", tablebaseUnavailable: "Точная tablebase временно недоступна.", completed: "Пройдено", firstTry: "С первой попытки", noPreload: "Позиции загружаются только после выбора уровня, поэтому Уроки остаются быстрыми."
    }),
    zh: translated(en, {
        accessTitle: "残局实验室", accessSubtitle: "可实战的残局训练，使用精确残局库反馈，从基础到高级技术。", accessCta: "打开实验室", eyebrow: "实战残局训练", title: "残局实验室", subtitle: "练习真实残局的转换与防守。七子以内由残局库给出数学精确结果。", backLessons: "返回课程", chooseLevel: "选择难度", mastery: "掌握度", customTitle: "载入局面", customSubtitle: "粘贴七子以内的 FEN，使用精确反馈练习。", customPlaceholder: "粘贴 FEN…", customCta: "练习局面", invalidFen: "该 FEN 不是有效棋局。", tooManyPieces: "精确反馈目前支持七子以内局面。", exactBadge: "精确残局库", exactDescription: "不是引擎估值：结果在数学上已知。", selectTheme: "选择主题", backLevels: "难度", backThemes: "主题", probing: "正在检查精确结果…", yourTurn: "轮到你", opponentTurn: "残局库正在应对…", reset: "重置", hint: "提示", next: "下一局面", retry: "再试一次", maintainedWin: "正确，局面仍然必胜。", maintainedDraw: "正确，你保持了和棋。", lostWinToDraw: "你错失了胜势，现在是和棋。", lostWinToLoss: "这一步把必胜局面变成了必败。", lostDraw: "原本可以和棋，但这一步会输。", checkmate: "将死，完美转换。", drawReached: "成功守和。", positionFinished: "局面结束。", tablebaseUnavailable: "精确残局库暂时不可用。", completed: "已完成", firstTry: "首次成功", noPreload: "局面只会在选择难度后加载，保证课程页面快速打开。"
    }),
    vi: translated(en, {
        accessTitle: "Phòng thí nghiệm tàn cuộc", accessSubtitle: "Tàn cuộc có thể chơi với phản hồi tablebase chính xác, từ cơ bản đến nâng cao.", accessCta: "Mở phòng luyện", eyebrow: "Luyện tàn cuộc thực chiến", title: "Phòng thí nghiệm tàn cuộc", subtitle: "Học cách chuyển hóa và phòng thủ tàn cuộc thật với kết quả chính xác khi có tối đa bảy quân.", backLessons: "Về bài học", chooseLevel: "Chọn cấp độ", mastery: "Mức thành thạo", customTitle: "Tải thế cờ", customSubtitle: "Dán FEN có tối đa bảy quân để luyện với phản hồi chính xác.", customPlaceholder: "Dán FEN…", customCta: "Luyện thế cờ", invalidFen: "FEN này không hợp lệ.", tooManyPieces: "Phản hồi chính xác hiện hỗ trợ tối đa bảy quân.", exactBadge: "Tablebase chính xác", exactDescription: "Không phải ước lượng engine: kết quả đã được biết chính xác.", selectTheme: "Chọn chủ đề", backLevels: "Cấp độ", backThemes: "Chủ đề", probing: "Đang kiểm tra kết quả…", yourTurn: "Lượt của bạn", opponentTurn: "Tablebase đang đáp lại…", reset: "Đặt lại", hint: "Gợi ý", next: "Thế tiếp theo", retry: "Thử lại", maintainedWin: "Đúng. Thế cờ vẫn thắng.", maintainedDraw: "Đúng. Bạn vẫn giữ hòa.", lostWinToDraw: "Bạn đã bỏ lỡ chiến thắng. Giờ thế cờ là hòa.", lostWinToLoss: "Nước này biến thế thắng thành thế thua.", lostDraw: "Thế cờ vốn hòa nhưng nước này sẽ thua.", checkmate: "Chiếu hết. Chuyển hóa hoàn hảo.", drawReached: "Đã giữ hòa.", positionFinished: "Thế cờ kết thúc.", tablebaseUnavailable: "Tablebase chính xác tạm thời không khả dụng.", completed: "Hoàn thành", firstTry: "Lần đầu", noPreload: "Các thế chỉ tải sau khi bạn chọn cấp độ để trang Bài học luôn nhanh."
    }),
    hi: translated(en, {
        accessTitle: "एंडगेम प्रयोगशाला", accessSubtitle: "बुनियादी से उन्नत स्तर तक सटीक टेबलbase फ़ीडबैक वाले खेलने योग्य एंडगेम।", accessCta: "प्रयोगशाला खोलें", eyebrow: "व्यावहारिक एंडगेम प्रशिक्षण", title: "एंडगेम प्रयोगशाला", subtitle: "सात या कम मोहरों वाली स्थितियों में गणितीय रूप से सटीक परिणाम के साथ एंडगेम जीतना और बचाना सीखें।", backLessons: "पाठों पर लौटें", chooseLevel: "स्तर चुनें", mastery: "दक्षता", customTitle: "स्थिति लोड करें", customSubtitle: "सात या कम मोहरों वाला FEN पेस्ट करके सटीक अभ्यास करें।", customPlaceholder: "FEN पेस्ट करें…", customCta: "स्थिति का अभ्यास", invalidFen: "यह FEN वैध शतरंज स्थिति नहीं है।", tooManyPieces: "सटीक फ़ीडबैक अभी सात या कम मोहरों तक समर्थित है।", exactBadge: "सटीक टेबलbase", exactDescription: "यह इंजन अनुमान नहीं है: परिणाम गणितीय रूप से ज्ञात है।", selectTheme: "विषय चुनें", backLevels: "स्तर", backThemes: "विषय", probing: "सटीक परिणाम जाँचा जा रहा है…", yourTurn: "आपकी चाल", opponentTurn: "टेबलbase जवाब दे रहा है…", reset: "रीसेट", hint: "संकेत", next: "अगली स्थिति", retry: "फिर कोशिश करें", maintainedWin: "सही। स्थिति अभी भी जीती हुई है।", maintainedDraw: "सही। ड्रॉ बना हुआ है।", lostWinToDraw: "जीत निकल गई। अब स्थिति ड्रॉ है।", lostWinToLoss: "यह चाल जीती हुई स्थिति को हार में बदल देती है।", lostDraw: "स्थिति ड्रॉ थी, लेकिन यह चाल हारती है।", checkmate: "चेकमेट। शानदार रूपांतरण।", drawReached: "ड्रॉ सुरक्षित।", positionFinished: "स्थिति समाप्त।", tablebaseUnavailable: "सटीक टेबलbase अस्थायी रूप से उपलब्ध नहीं है।", completed: "पूर्ण", firstTry: "पहली कोशिश", noPreload: "स्थितियाँ स्तर चुनने के बाद ही लोड होती हैं ताकि पाठ जल्दी खुलें।"
    }),
    mr: translated(en, {
        accessTitle: "एंडगेम प्रयोगशाळा", accessSubtitle: "मूलभूत ते प्रगत तंत्रापर्यंत अचूक tablebase अभिप्रायासह खेळता येणारे एंडगेम.", accessCta: "प्रयोगशाळा उघडा", eyebrow: "व्यावहारिक एंडगेम सराव", title: "एंडगेम प्रयोगशाळा", subtitle: "सात किंवा कमी मोहरे असताना गणिती अचूक निकालासह एंडगेम जिंकणे आणि बचाव करणे शिका.", backLessons: "धड्यांकडे परत", chooseLevel: "स्तर निवडा", mastery: "प्रभुत्व", customTitle: "स्थिती लोड करा", customSubtitle: "सात किंवा कमी मोहर्‍यांचा FEN पेस्ट करून अचूक सराव करा.", customPlaceholder: "FEN पेस्ट करा…", customCta: "स्थितीचा सराव", invalidFen: "हा FEN वैध बुद्धिबळ स्थिती नाही.", tooManyPieces: "अचूक अभिप्राय सध्या सात किंवा कमी मोहर्‍यांसाठी उपलब्ध आहे.", exactBadge: "अचूक tablebase", exactDescription: "हा इंजिन अंदाज नाही: निकाल गणितीरीत्या निश्चित आहे.", selectTheme: "विषय निवडा", backLevels: "स्तर", backThemes: "विषय", probing: "अचूक निकाल तपासत आहोत…", yourTurn: "तुमची चाल", opponentTurn: "Tablebase प्रतिसाद देत आहे…", reset: "रीसेट", hint: "सूचना", next: "पुढील स्थिती", retry: "पुन्हा प्रयत्न", maintainedWin: "बरोबर. स्थिती अजूनही जिंकलेली आहे.", maintainedDraw: "बरोबर. बरोबरी टिकली आहे.", lostWinToDraw: "विजय निसटला. आता स्थिती बरोबरीची आहे.", lostWinToLoss: "ही चाल जिंकलेली स्थिती पराभवात बदलते.", lostDraw: "स्थिती बरोबरीची होती, पण ही चाल हरते.", checkmate: "शह-मात. उत्कृष्ट रूपांतरण.", drawReached: "बरोबरी सुरक्षित.", positionFinished: "स्थिती पूर्ण.", tablebaseUnavailable: "अचूक tablebase सध्या उपलब्ध नाही.", completed: "पूर्ण", firstTry: "पहिल्याच प्रयत्नात", noPreload: "धडे जलद राहावेत म्हणून स्तर निवडल्यानंतरच स्थिती लोड होतात."
    }),
    pl: translated(en, {
        accessTitle: "Laboratorium końcówek", accessSubtitle: "Grywalne końcówki z dokładnym feedbackiem tablebase — od podstaw po technikę zaawansowaną.", accessCta: "Otwórz laboratorium", eyebrow: "Praktyczny trening końcówek", title: "Laboratorium końcówek", subtitle: "Ucz się wygrywać i bronić prawdziwe końcówki z matematycznie dokładnym wynikiem przy maksymalnie siedmiu bierkach.", backLessons: "Wróć do lekcji", chooseLevel: "Wybierz poziom", mastery: "Opanowanie", customTitle: "Wczytaj pozycję", customSubtitle: "Wklej FEN z maksymalnie siedmioma bierkami i ćwicz z dokładnym feedbackiem.", customPlaceholder: "Wklej FEN…", customCta: "Ćwicz pozycję", invalidFen: "Ten FEN nie opisuje poprawnej pozycji.", tooManyPieces: "Dokładny feedback obsługuje obecnie maksymalnie siedem bierek.", exactBadge: "Dokładna tablebase", exactDescription: "To nie ocena silnika: wynik jest matematycznie znany.", selectTheme: "Wybierz temat", backLevels: "Poziomy", backThemes: "Tematy", probing: "Sprawdzanie dokładnego wyniku…", yourTurn: "Twój ruch", opponentTurn: "Tablebase odpowiada…", reset: "Resetuj", hint: "Podpowiedź", next: "Następna pozycja", retry: "Spróbuj ponownie", maintainedWin: "Dobrze. Pozycja nadal jest wygrana.", maintainedDraw: "Dobrze. Utrzymujesz remis.", lostWinToDraw: "Wypuściłeś wygraną. Teraz jest remis.", lostWinToLoss: "Ten ruch zmienia wygraną pozycję w przegraną.", lostDraw: "Pozycja była remisowa, ale ten ruch przegrywa.", checkmate: "Mat. Perfekcyjna realizacja.", drawReached: "Remis uratowany.", positionFinished: "Pozycja zakończona.", tablebaseUnavailable: "Dokładna tablebase jest chwilowo niedostępna.", completed: "Ukończono", firstTry: "Za pierwszym razem", noPreload: "Pozycje są ładowane dopiero po wybraniu poziomu, dzięki czemu Lekcje pozostają szybkie."
    })
};

export function getEndgameCopy(language?: string) {
    const key = (language || "en").toLowerCase().replace("_", "-").split("-")[0];
    return copies[key] || en;
}
