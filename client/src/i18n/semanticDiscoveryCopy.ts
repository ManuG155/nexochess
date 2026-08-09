import { normaliseLanguage, SupportedLanguage } from "@/i18n";

interface SemanticCardCopy {
    title: string;
    description: string;
}

interface SemanticPageCopy {
    eyebrow: string;
    title: string;
    description: string;
    cards: [SemanticCardCopy, SemanticCardCopy, SemanticCardCopy];
    topicsTitle: string;
    topics: string[];
    relatedAction: string;
    helpAction: string;
}

interface SemanticDiscoveryCopy {
    analysis: SemanticPageCopy;
    puzzles: SemanticPageCopy;
}

const copies: Record<SupportedLanguage, SemanticDiscoveryCopy> = {
    en: {
        analysis: {
            eyebrow: "Chess analysis",
            title: "Analyse and review chess games with Stockfish 17",
            description: "Use NexoChess to analyse chess games online for free. Import a PGN, start from a FEN or load a public game, then review the evaluation, move quality, accuracy, mistakes and best alternatives.",
            cards: [
                { title: "Every move, explained", description: "Review brilliant moves, best moves, inaccuracies, mistakes, misses and blunders alongside the engine evaluation." },
                { title: "PGN, FEN and public games", description: "Paste or upload a PGN, analyse a FEN position or load a public game from a supported chess platform." },
                { title: "Stockfish 17 in the browser", description: "Follow the evaluation, best move and continuations without installing a desktop chess engine." }
            ],
            topicsTitle: "What you can review",
            topics: ["Accuracy", "Best move", "Engine evaluation", "Opening", "Middlegame", "Endgame", "Inaccuracies", "Mistakes", "Blunders", "Brilliant moves", "Best continuations", "Game rating"],
            relatedAction: "Train with chess puzzles",
            helpAction: "Analysis help"
        },
        puzzles: {
            eyebrow: "Chess tactics training",
            title: "Chess puzzles and tactical problems for focused practice",
            description: "Train with more than six million chess positions. Filter puzzles by theme and difficulty, or turn mistakes from your analysed games into practice with hints and full solutions when you need them.",
            cards: [
                { title: "Tactics by theme", description: "Practise checkmates, forks, pins, skewers, sacrifices, discovered attacks, promotions and many other tactical patterns." },
                { title: "Openings and endgames", description: "Train opening positions and endgames with pawns, knights, bishops, rooks and queens at a difficulty that fits your level." },
                { title: "Hints and solutions", description: "Ask for a hint, reveal the full line and review each position until the tactical idea is clear." }
            ],
            topicsTitle: "Tactical themes you can train",
            topics: ["Checkmate", "Mate in 1", "Mate in 2", "Mate in 3+", "Fork", "Pin", "Skewer", "Discovered attack", "Sacrifice", "Promotion", "En passant", "Zugzwang", "Endgames", "Openings", "Defense", "One-move problems"],
            relatedAction: "Analyse a chess game",
            helpAction: "Puzzle help"
        }
    },
    es: {
        analysis: {
            eyebrow: "Análisis de ajedrez",
            title: "Analiza y revisa partidas de ajedrez con Stockfish 17",
            description: "Usa NexoChess para analizar partidas de ajedrez online gratis. Importa un PGN, parte de una FEN o carga una partida pública y revisa la evaluación, la calidad de las jugadas, la precisión, los errores y las mejores alternativas.",
            cards: [
                { title: "Cada jugada, explicada", description: "Revisa jugadas brillantes, mejores jugadas, imprecisiones, errores, omisiones y errores graves junto a la evaluación del motor." },
                { title: "PGN, FEN y partidas públicas", description: "Pega o sube un PGN, analiza una posición FEN o carga una partida pública desde una plataforma de ajedrez compatible." },
                { title: "Stockfish 17 en el navegador", description: "Sigue la evaluación, la mejor jugada y las continuaciones sin instalar un motor de ajedrez de escritorio." }
            ],
            topicsTitle: "Qué puedes revisar",
            topics: ["Precisión", "Mejor jugada", "Evaluación del motor", "Apertura", "Medio juego", "Final", "Imprecisiones", "Errores", "Errores graves", "Jugadas brillantes", "Mejores continuaciones", "Valoración de la partida"],
            relatedAction: "Entrenar con puzzles de ajedrez",
            helpAction: "Ayuda de análisis"
        },
        puzzles: {
            eyebrow: "Entrenamiento de táctica",
            title: "Puzzles y problemas de ajedrez para entrenar táctica",
            description: "Entrena con más de seis millones de posiciones de ajedrez. Filtra puzzles por tema y dificultad o convierte errores de tus partidas analizadas en entrenamiento, con pistas y soluciones completas cuando las necesites.",
            cards: [
                { title: "Táctica por tema", description: "Practica jaques mate, dobles ataques, clavadas, enfiladas, sacrificios, ataques descubiertos, promociones y muchos otros patrones tácticos." },
                { title: "Aperturas y finales", description: "Entrena posiciones de apertura y finales de peones, caballos, alfiles, torres y damas con una dificultad adaptada a tu nivel." },
                { title: "Pistas y soluciones", description: "Pide una pista, revela la línea completa y revisa cada posición hasta comprender la idea táctica." }
            ],
            topicsTitle: "Temas tácticos que puedes entrenar",
            topics: ["Jaque mate", "Mate en 1", "Mate en 2", "Mate en 3+", "Doble ataque", "Clavada", "Enfilada", "Ataque descubierto", "Sacrificio", "Promoción", "Captura al paso", "Zugzwang", "Finales", "Aperturas", "Defensa", "Problemas de una jugada"],
            relatedAction: "Analizar una partida de ajedrez",
            helpAction: "Ayuda de puzzles"
        }
    },
    fr: {
        analysis: {
            eyebrow: "Analyse d’échecs",
            title: "Analysez et révisez vos parties d’échecs avec Stockfish 17",
            description: "Analysez gratuitement vos parties d’échecs en ligne avec NexoChess. Importez un PGN, partez d’une FEN ou chargez une partie publique pour revoir l’évaluation, la qualité des coups, la précision, les erreurs et les meilleures alternatives.",
            cards: [
                { title: "Chaque coup expliqué", description: "Revoyez coups brillants, meilleurs coups, imprécisions, erreurs, occasions manquées et gaffes avec l’évaluation du moteur." },
                { title: "PGN, FEN et parties publiques", description: "Collez ou importez un PGN, analysez une position FEN ou chargez une partie publique depuis une plateforme compatible." },
                { title: "Stockfish 17 dans le navigateur", description: "Suivez l’évaluation, le meilleur coup et les continuations sans installer de moteur sur votre ordinateur." }
            ],
            topicsTitle: "Ce que vous pouvez réviser",
            topics: ["Précision", "Meilleur coup", "Évaluation", "Ouverture", "Milieu de partie", "Finale", "Imprécisions", "Erreurs", "Gaffes", "Coups brillants", "Meilleures variantes", "Évaluation de la partie"],
            relatedAction: "S’entraîner avec des puzzles",
            helpAction: "Aide sur l’analyse"
        },
        puzzles: {
            eyebrow: "Entraînement tactique",
            title: "Puzzles et problèmes d’échecs pour travailler la tactique",
            description: "Entraînez-vous avec plus de six millions de positions. Filtrez les puzzles par thème et difficulté ou transformez les erreurs de vos parties analysées en exercices, avec indices et solutions complètes si nécessaire.",
            cards: [
                { title: "Tactique par thème", description: "Travaillez les mats, fourchettes, clouages, enfilades, sacrifices, attaques à la découverte, promotions et de nombreux autres motifs." },
                { title: "Ouvertures et finales", description: "Entraînez des positions d’ouverture et des finales de pions, cavaliers, fous, tours et dames selon votre niveau." },
                { title: "Indices et solutions", description: "Demandez un indice, affichez la variante complète et révisez chaque position jusqu’à comprendre l’idée tactique." }
            ],
            topicsTitle: "Thèmes tactiques à entraîner",
            topics: ["Échec et mat", "Mat en 1", "Mat en 2", "Mat en 3+", "Fourchette", "Clouage", "Enfilade", "Attaque à la découverte", "Sacrifice", "Promotion", "Prise en passant", "Zugzwang", "Finales", "Ouvertures", "Défense", "Problèmes en un coup"],
            relatedAction: "Analyser une partie d’échecs",
            helpAction: "Aide sur les puzzles"
        }
    },
    de: {
        analysis: {
            eyebrow: "Schachanalyse",
            title: "Schachpartien mit Stockfish 17 analysieren und auswerten",
            description: "Analysiere Schachpartien mit NexoChess kostenlos online. Importiere ein PGN, starte aus einer FEN oder lade eine öffentliche Partie und prüfe Bewertung, Zugqualität, Genauigkeit, Fehler und bessere Alternativen.",
            cards: [
                { title: "Jeden Zug verstehen", description: "Prüfe brillante Züge, beste Züge, Ungenauigkeiten, Fehler, verpasste Chancen und Patzer zusammen mit der Engine-Bewertung." },
                { title: "PGN, FEN und öffentliche Partien", description: "Füge ein PGN ein oder lade es hoch, analysiere eine FEN-Stellung oder lade eine öffentliche Partie von einer unterstützten Plattform." },
                { title: "Stockfish 17 im Browser", description: "Verfolge Bewertung, besten Zug und Fortsetzungen, ohne eine Desktop-Engine zu installieren." }
            ],
            topicsTitle: "Was du auswerten kannst",
            topics: ["Genauigkeit", "Bester Zug", "Engine-Bewertung", "Eröffnung", "Mittelspiel", "Endspiel", "Ungenauigkeiten", "Fehler", "Patzer", "Brillante Züge", "Beste Fortsetzungen", "Partiebewertung"],
            relatedAction: "Schachaufgaben trainieren",
            helpAction: "Hilfe zur Analyse"
        },
        puzzles: {
            eyebrow: "Schachtaktik-Training",
            title: "Schachaufgaben und taktische Probleme gezielt trainieren",
            description: "Trainiere mit mehr als sechs Millionen Schachstellungen. Filtere Aufgaben nach Thema und Schwierigkeit oder verwandle Fehler aus analysierten Partien in Training, bei Bedarf mit Hinweisen und vollständigen Lösungen.",
            cards: [
                { title: "Taktik nach Thema", description: "Übe Mattmotive, Gabeln, Fesselungen, Spieße, Opfer, Abzugsangriffe, Umwandlungen und viele weitere taktische Muster." },
                { title: "Eröffnungen und Endspiele", description: "Trainiere Eröffnungsstellungen und Bauern-, Springer-, Läufer-, Turm- und Damenendspiele passend zu deinem Niveau." },
                { title: "Hinweise und Lösungen", description: "Nutze einen Hinweis, zeige die komplette Variante und wiederhole jede Stellung, bis die taktische Idee klar ist." }
            ],
            topicsTitle: "Taktische Themen zum Trainieren",
            topics: ["Schachmatt", "Matt in 1", "Matt in 2", "Matt in 3+", "Gabel", "Fesselung", "Spieß", "Abzugsangriff", "Opfer", "Umwandlung", "En passant", "Zugzwang", "Endspiele", "Eröffnungen", "Verteidigung", "Ein-Zug-Aufgaben"],
            relatedAction: "Schachpartie analysieren",
            helpAction: "Hilfe zu Schachaufgaben"
        }
    },
    pt: {
        analysis: {
            eyebrow: "Análise de xadrez",
            title: "Analise e reveja partidas de xadrez com Stockfish 17",
            description: "Use o NexoChess para analisar partidas de xadrez online grátis. Importe um PGN, comece por uma FEN ou carregue uma partida pública e reveja avaliação, qualidade dos lances, precisão, erros e melhores alternativas.",
            cards: [
                { title: "Cada lance explicado", description: "Reveja lances brilhantes, melhores lances, imprecisões, erros, oportunidades perdidas e erros graves junto com a avaliação do motor." },
                { title: "PGN, FEN e partidas públicas", description: "Cole ou envie um PGN, analise uma posição FEN ou carregue uma partida pública de uma plataforma compatível." },
                { title: "Stockfish 17 no navegador", description: "Acompanhe a avaliação, o melhor lance e as continuações sem instalar um motor de xadrez no computador." }
            ],
            topicsTitle: "O que pode rever",
            topics: ["Precisão", "Melhor lance", "Avaliação do motor", "Abertura", "Meio-jogo", "Final", "Imprecisões", "Erros", "Erros graves", "Lances brilhantes", "Melhores continuações", "Avaliação da partida"],
            relatedAction: "Treinar com puzzles de xadrez",
            helpAction: "Ajuda de análise"
        },
        puzzles: {
            eyebrow: "Treino de tática",
            title: "Puzzles e problemas de xadrez para treinar tática",
            description: "Treine com mais de seis milhões de posições de xadrez. Filtre puzzles por tema e dificuldade ou transforme erros das suas partidas analisadas em treino, com dicas e soluções completas quando precisar.",
            cards: [
                { title: "Tática por tema", description: "Pratique xeques-mate, garfos, cravadas, espetadas, sacrifícios, ataques descobertos, promoções e muitos outros padrões táticos." },
                { title: "Aberturas e finais", description: "Treine posições de abertura e finais de peões, cavalos, bispos, torres e damas numa dificuldade adequada ao seu nível." },
                { title: "Dicas e soluções", description: "Peça uma dica, revele a linha completa e reveja cada posição até compreender a ideia tática." }
            ],
            topicsTitle: "Temas táticos que pode treinar",
            topics: ["Xeque-mate", "Mate em 1", "Mate em 2", "Mate em 3+", "Garfo", "Cravada", "Espetada", "Ataque descoberto", "Sacrifício", "Promoção", "En passant", "Zugzwang", "Finais", "Aberturas", "Defesa", "Problemas de um lance"],
            relatedAction: "Analisar uma partida de xadrez",
            helpAction: "Ajuda de puzzles"
        }
    },
    ru: {
        analysis: {
            eyebrow: "Анализ шахмат",
            title: "Анализируйте и разбирайте шахматные партии со Stockfish 17",
            description: "Бесплатно анализируйте шахматные партии онлайн в NexoChess. Импортируйте PGN, начните с FEN или загрузите открытую партию и изучите оценку, качество ходов, точность, ошибки и лучшие альтернативы.",
            cards: [
                { title: "Разбор каждого хода", description: "Изучайте блестящие и лучшие ходы, неточности, ошибки, упущенные возможности и зевки вместе с оценкой движка." },
                { title: "PGN, FEN и открытые партии", description: "Вставьте или загрузите PGN, проанализируйте позицию FEN или загрузите открытую партию с поддерживаемой платформы." },
                { title: "Stockfish 17 в браузере", description: "Следите за оценкой, лучшим ходом и продолжениями без установки шахматного движка на компьютер." }
            ],
            topicsTitle: "Что можно разобрать",
            topics: ["Точность", "Лучший ход", "Оценка движка", "Дебют", "Миттельшпиль", "Эндшпиль", "Неточности", "Ошибки", "Зевки", "Блестящие ходы", "Лучшие продолжения", "Оценка партии"],
            relatedAction: "Тренироваться на шахматных задачах",
            helpAction: "Помощь по анализу"
        },
        puzzles: {
            eyebrow: "Тренировка шахматной тактики",
            title: "Шахматные задачи и тактические упражнения",
            description: "Тренируйтесь на более чем шести миллионах шахматных позиций. Фильтруйте задачи по теме и сложности или превращайте ошибки из разобранных партий в тренировку с подсказками и полными решениями.",
            cards: [
                { title: "Тактика по темам", description: "Отрабатывайте матовые мотивы, вилки, связки, сквозные удары, жертвы, вскрытые нападения, превращения и другие тактические идеи." },
                { title: "Дебюты и эндшпили", description: "Тренируйте дебютные позиции и пешечные, коневые, слоновые, ладейные и ферзевые эндшпили на подходящем уровне." },
                { title: "Подсказки и решения", description: "Используйте подсказку, откройте полную линию и повторяйте позицию, пока тактическая идея не станет понятной." }
            ],
            topicsTitle: "Тактические темы для тренировки",
            topics: ["Мат", "Мат в 1", "Мат в 2", "Мат в 3+", "Вилка", "Связка", "Сквозной удар", "Вскрытое нападение", "Жертва", "Превращение", "Взятие на проходе", "Цугцванг", "Эндшпили", "Дебюты", "Защита", "Задачи в один ход"],
            relatedAction: "Анализировать шахматную партию",
            helpAction: "Помощь по задачам"
        }
    },
    zh: {
        analysis: {
            eyebrow: "国际象棋分析",
            title: "使用 Stockfish 17 分析并复盘国际象棋棋局",
            description: "使用 NexoChess 免费在线分析国际象棋棋局。导入 PGN、从 FEN 局面开始或加载公开棋局，然后查看评估、走法质量、准确率、错误和更好的选择。",
            cards: [
                { title: "逐步复盘每一步", description: "结合引擎评估查看妙手、最佳走法、不准确、错误、错失机会和严重错误。" },
                { title: "PGN、FEN 和公开棋局", description: "粘贴或上传 PGN、分析 FEN 局面，或从受支持的平台加载公开棋局。" },
                { title: "浏览器中的 Stockfish 17", description: "无需安装桌面国际象棋引擎即可查看评估、最佳走法和后续变化。" }
            ],
            topicsTitle: "可以复盘的内容",
            topics: ["准确率", "最佳走法", "引擎评估", "开局", "中局", "残局", "不准确", "错误", "严重错误", "妙手", "最佳续着", "棋局评分"],
            relatedAction: "训练国际象棋谜题",
            helpAction: "分析帮助"
        },
        puzzles: {
            eyebrow: "国际象棋战术训练",
            title: "国际象棋谜题和战术问题训练",
            description: "使用超过六百万个国际象棋局面进行训练。按主题和难度筛选谜题，或把已分析棋局中的错误转化为练习，并在需要时使用提示和完整解答。",
            cards: [
                { title: "按主题训练战术", description: "练习将杀、双攻、牵制、串击、弃子、闪击、升变以及许多其他战术模式。" },
                { title: "开局和残局", description: "训练开局局面以及兵、马、象、车和后的残局，并选择适合自己水平的难度。" },
                { title: "提示和解答", description: "请求提示、查看完整变化，并逐个复盘局面，直到理解战术核心。" }
            ],
            topicsTitle: "可以训练的战术主题",
            topics: ["将杀", "一步将杀", "两步将杀", "三步以上将杀", "双攻", "牵制", "串击", "闪击", "弃子", "升变", "吃过路兵", "楚茨文克", "残局", "开局", "防守", "一步问题"],
            relatedAction: "分析国际象棋棋局",
            helpAction: "谜题帮助"
        }
    },
    vi: {
        analysis: {
            eyebrow: "Phân tích cờ vua",
            title: "Phân tích và xem lại ván cờ với Stockfish 17",
            description: "Dùng NexoChess để phân tích ván cờ trực tuyến miễn phí. Nhập PGN, bắt đầu từ FEN hoặc tải một ván công khai rồi xem đánh giá, chất lượng nước đi, độ chính xác, sai lầm và phương án tốt hơn.",
            cards: [
                { title: "Hiểu từng nước đi", description: "Xem lại nước xuất sắc, nước tốt nhất, thiếu chính xác, sai lầm, cơ hội bị bỏ lỡ và lỗi nghiêm trọng cùng đánh giá của động cơ." },
                { title: "PGN, FEN và ván công khai", description: "Dán hoặc tải PGN, phân tích một thế FEN hoặc tải ván công khai từ nền tảng được hỗ trợ." },
                { title: "Stockfish 17 trong trình duyệt", description: "Theo dõi đánh giá, nước tốt nhất và các biến mà không cần cài động cơ cờ vua trên máy tính." }
            ],
            topicsTitle: "Những gì bạn có thể xem lại",
            topics: ["Độ chính xác", "Nước tốt nhất", "Đánh giá động cơ", "Khai cuộc", "Trung cuộc", "Tàn cuộc", "Thiếu chính xác", "Sai lầm", "Lỗi nghiêm trọng", "Nước xuất sắc", "Tiếp diễn tốt nhất", "Đánh giá ván"],
            relatedAction: "Luyện bài tập cờ vua",
            helpAction: "Trợ giúp phân tích"
        },
        puzzles: {
            eyebrow: "Luyện chiến thuật cờ vua",
            title: "Bài tập và vấn đề cờ vua để luyện chiến thuật",
            description: "Luyện với hơn sáu triệu thế cờ. Lọc bài tập theo chủ đề và độ khó hoặc biến sai lầm từ các ván đã phân tích thành bài luyện, kèm gợi ý và lời giải đầy đủ khi cần.",
            cards: [
                { title: "Chiến thuật theo chủ đề", description: "Luyện chiếu hết, đòn đôi, ghim quân, xiên quân, thí quân, tấn công mở, phong cấp và nhiều mẫu chiến thuật khác." },
                { title: "Khai cuộc và tàn cuộc", description: "Luyện các thế khai cuộc và tàn cuộc tốt, mã, tượng, xe và hậu với độ khó phù hợp trình độ." },
                { title: "Gợi ý và lời giải", description: "Dùng gợi ý, mở toàn bộ biến và xem lại từng thế cho đến khi hiểu rõ ý tưởng chiến thuật." }
            ],
            topicsTitle: "Chủ đề chiến thuật có thể luyện",
            topics: ["Chiếu hết", "Chiếu hết trong 1", "Chiếu hết trong 2", "Chiếu hết trong 3+", "Đòn đôi", "Ghim quân", "Xiên quân", "Tấn công mở", "Thí quân", "Phong cấp", "Bắt tốt qua đường", "Zugzwang", "Tàn cuộc", "Khai cuộc", "Phòng thủ", "Bài một nước"],
            relatedAction: "Phân tích một ván cờ",
            helpAction: "Trợ giúp bài tập"
        }
    },
    hi: {
        analysis: {
            eyebrow: "शतरंज विश्लेषण",
            title: "Stockfish 17 से शतरंज बाज़ियों का विश्लेषण और समीक्षा करें",
            description: "NexoChess से शतरंज बाज़ियों का ऑनलाइन मुफ़्त विश्लेषण करें। PGN आयात करें, FEN स्थिति से शुरू करें या सार्वजनिक बाज़ी लोड करके मूल्यांकन, चाल की गुणवत्ता, सटीकता, गलतियाँ और बेहतर विकल्प देखें।",
            cards: [
                { title: "हर चाल की समीक्षा", description: "इंजन मूल्यांकन के साथ ब्रिलियंट, सर्वोत्तम, अशुद्ध, गलत, छूटी हुई और ब्लंडर चालें देखें।" },
                { title: "PGN, FEN और सार्वजनिक बाज़ियाँ", description: "PGN पेस्ट या अपलोड करें, FEN स्थिति का विश्लेषण करें या समर्थित प्लेटफ़ॉर्म से सार्वजनिक बाज़ी लोड करें।" },
                { title: "ब्राउज़र में Stockfish 17", description: "डेस्कटॉप इंजन इंस्टॉल किए बिना मूल्यांकन, सर्वोत्तम चाल और आगे की लाइनें देखें।" }
            ],
            topicsTitle: "क्या समीक्षा कर सकते हैं",
            topics: ["सटीकता", "सर्वोत्तम चाल", "इंजन मूल्यांकन", "ओपनिंग", "मिडिलगेम", "एंडगेम", "अशुद्धियाँ", "गलतियाँ", "ब्लंडर", "ब्रिलियंट चालें", "सर्वोत्तम लाइनें", "बाज़ी रेटिंग"],
            relatedAction: "शतरंज पहेलियों से प्रशिक्षण",
            helpAction: "विश्लेषण सहायता"
        },
        puzzles: {
            eyebrow: "शतरंज रणनीति प्रशिक्षण",
            title: "रणनीति अभ्यास के लिए शतरंज पहेलियाँ और समस्याएँ",
            description: "साठ लाख से अधिक शतरंज स्थितियों के साथ प्रशिक्षण करें। पहेलियों को विषय और कठिनाई से फ़िल्टर करें या अपनी विश्लेषित बाज़ियों की गलतियों को अभ्यास में बदलें, ज़रूरत पर संकेत और पूरा समाधान देखें।",
            cards: [
                { title: "विषय के अनुसार रणनीति", description: "शह-मात, फोर्क, पिन, स्क्यूअर, बलिदान, डिस्कवर्ड अटैक, प्रमोशन और कई अन्य पैटर्न का अभ्यास करें।" },
                { title: "ओपनिंग और एंडगेम", description: "अपने स्तर के अनुसार ओपनिंग स्थितियाँ और प्यादा, घोड़ा, ऊँट, हाथी व वज़ीर के एंडगेम अभ्यास करें।" },
                { title: "संकेत और समाधान", description: "संकेत लें, पूरी लाइन खोलें और हर स्थिति की समीक्षा करें जब तक रणनीतिक विचार स्पष्ट न हो जाए।" }
            ],
            topicsTitle: "रणनीतिक विषय जिनका अभ्यास कर सकते हैं",
            topics: ["शह-मात", "1 चाल में मात", "2 चाल में मात", "3+ चाल में मात", "फोर्क", "पिन", "स्क्यूअर", "डिस्कवर्ड अटैक", "बलिदान", "प्रमोशन", "एन पासां", "ज़ुगज़्वांग", "एंडगेम", "ओपनिंग", "रक्षा", "एक चाल की समस्या"],
            relatedAction: "शतरंज बाज़ी का विश्लेषण करें",
            helpAction: "पहेली सहायता"
        }
    },
    mr: {
        analysis: {
            eyebrow: "बुद्धिबळ विश्लेषण",
            title: "Stockfish 17 सह बुद्धिबळ डावांचे विश्लेषण आणि पुनरावलोकन करा",
            description: "NexoChess वापरून बुद्धिबळ डावांचे ऑनलाइन मोफत विश्लेषण करा. PGN आयात करा, FEN स्थितीपासून सुरू करा किंवा सार्वजनिक डाव लोड करून मूल्यमापन, चालींची गुणवत्ता, अचूकता, चुका आणि चांगले पर्याय तपासा.",
            cards: [
                { title: "प्रत्येक चालीचे पुनरावलोकन", description: "इंजिन मूल्यमापनासह ब्रिलियंट, सर्वोत्तम, अचूक नसलेल्या, चुकीच्या, चुकलेल्या संधी आणि गंभीर चुका तपासा." },
                { title: "PGN, FEN आणि सार्वजनिक डाव", description: "PGN पेस्ट किंवा अपलोड करा, FEN स्थितीचे विश्लेषण करा किंवा समर्थित प्लॅटफॉर्मवरून सार्वजनिक डाव लोड करा." },
                { title: "ब्राउझरमध्ये Stockfish 17", description: "डेस्कटॉप इंजिन इन्स्टॉल न करता मूल्यमापन, सर्वोत्तम चाल आणि पुढील ओळी पाहा." }
            ],
            topicsTitle: "काय पुनरावलोकन करता येते",
            topics: ["अचूकता", "सर्वोत्तम चाल", "इंजिन मूल्यमापन", "ओपनिंग", "मिडलगेम", "एंडगेम", "अचूक नसलेल्या चाली", "चुका", "गंभीर चुका", "ब्रिलियंट चाली", "सर्वोत्तम ओळी", "डाव रेटिंग"],
            relatedAction: "बुद्धिबळ पझल प्रशिक्षण",
            helpAction: "विश्लेषण मदत"
        },
        puzzles: {
            eyebrow: "बुद्धिबळ डावपेच प्रशिक्षण",
            title: "डावपेच सरावासाठी बुद्धिबळ पझल आणि समस्या",
            description: "साठ लाखांहून अधिक बुद्धिबळ स्थितींवर प्रशिक्षण करा. पझल विषय आणि कठीणतेनुसार फिल्टर करा किंवा विश्लेषित डावांतील चुका सरावात बदला; गरजेनुसार सूचना आणि पूर्ण उपाय पाहा.",
            cards: [
                { title: "विषयानुसार डावपेच", description: "शह-मात, फोर्क, पिन, स्क्यूअर, बलिदान, डिस्कव्हर्ड अटॅक, प्रमोशन आणि इतर अनेक डावपेचांचा सराव करा." },
                { title: "ओपनिंग आणि एंडगेम", description: "आपल्या स्तरानुसार ओपनिंग स्थिती आणि प्यादा, घोडा, उंट, हत्ती व वजीर एंडगेमचा सराव करा." },
                { title: "सूचना आणि उपाय", description: "सूचना घ्या, पूर्ण ओळ उघडा आणि डावपेचाची कल्पना स्पष्ट होईपर्यंत प्रत्येक स्थितीचे पुनरावलोकन करा." }
            ],
            topicsTitle: "सरावासाठी डावपेच विषय",
            topics: ["शह-मात", "1 चालीत मात", "2 चालीत मात", "3+ चालीत मात", "फोर्क", "पिन", "स्क्यूअर", "डिस्कव्हर्ड अटॅक", "बलिदान", "प्रमोशन", "एन पासां", "झुगझवांग", "एंडगेम", "ओपनिंग", "बचाव", "एक चालीची समस्या"],
            relatedAction: "बुद्धिबळ डावाचे विश्लेषण करा",
            helpAction: "पझल मदत"
        }
    },
    pl: {
        analysis: {
            eyebrow: "Analiza szachowa",
            title: "Analizuj i przeglądaj partie szachowe ze Stockfishem 17",
            description: "Analizuj partie szachowe online za darmo w NexoChess. Zaimportuj PGN, zacznij od pozycji FEN lub wczytaj publiczną partię, a następnie sprawdź ocenę, jakość ruchów, dokładność, błędy i lepsze alternatywy.",
            cards: [
                { title: "Każdy ruch wyjaśniony", description: "Przeglądaj błyskotliwe i najlepsze ruchy, niedokładności, błędy, przeoczenia i poważne błędy razem z oceną silnika." },
                { title: "PGN, FEN i publiczne partie", description: "Wklej lub prześlij PGN, analizuj pozycję FEN albo wczytaj publiczną partię z obsługiwanej platformy." },
                { title: "Stockfish 17 w przeglądarce", description: "Śledź ocenę, najlepszy ruch i kontynuacje bez instalowania silnika szachowego na komputerze." }
            ],
            topicsTitle: "Co możesz przeglądać",
            topics: ["Dokładność", "Najlepszy ruch", "Ocena silnika", "Debiut", "Gra środkowa", "Końcówka", "Niedokładności", "Błędy", "Poważne błędy", "Błyskotliwe ruchy", "Najlepsze kontynuacje", "Ocena partii"],
            relatedAction: "Trenuj zadania szachowe",
            helpAction: "Pomoc dotycząca analizy"
        },
        puzzles: {
            eyebrow: "Trening taktyki szachowej",
            title: "Zadania i problemy szachowe do treningu taktycznego",
            description: "Trenuj na ponad sześciu milionach pozycji szachowych. Filtruj zadania według tematu i trudności albo zamieniaj błędy z przeanalizowanych partii w trening z podpowiedziami i pełnymi rozwiązaniami.",
            cards: [
                { title: "Taktyka według tematu", description: "Ćwicz maty, widełki, związania, szpile, ofiary, ataki z odsłony, promocje i wiele innych motywów taktycznych." },
                { title: "Debiuty i końcówki", description: "Trenuj pozycje debiutowe oraz końcówki pionowe, skoczkowe, gońcowe, wieżowe i hetmańskie na odpowiednim poziomie." },
                { title: "Podpowiedzi i rozwiązania", description: "Skorzystaj z podpowiedzi, pokaż pełny wariant i przeglądaj pozycję, aż zrozumiesz ideę taktyczną." }
            ],
            topicsTitle: "Motywy taktyczne do treningu",
            topics: ["Mat", "Mat w 1", "Mat w 2", "Mat w 3+", "Widełki", "Związanie", "Szpila", "Atak z odsłony", "Ofiara", "Promocja", "En passant", "Zugzwang", "Końcówki", "Debiuty", "Obrona", "Zadania na jeden ruch"],
            relatedAction: "Analizuj partię szachową",
            helpAction: "Pomoc dotycząca zadań"
        }
    }
};

function getSemanticDiscoveryCopy(language?: string): SemanticDiscoveryCopy {
    const normalised = normaliseLanguage(language || "en") || "en";
    return copies[normalised];
}

export { getSemanticDiscoveryCopy };
export type { SemanticPageCopy };
