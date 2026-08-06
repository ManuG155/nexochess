export interface HomeFeatureCopy {
    title: string;
    description: string;
    action: string;
}

export interface HomeStepCopy {
    title: string;
    description: string;
}

export interface HomeCopy {
    eyebrow: string;
    title: string;
    introduction: string;
    primaryAction: string;
    secondaryAction: string;
    badges: [string, string, string];
    previewLabel: string;
    previewTitle: string;
    previewStatus: string;
    previewBestMove: string;
    previewKeyMoment: string;
    previewAccuracy: string;
    featuresEyebrow: string;
    featuresTitle: string;
    featuresIntroduction: string;
    features: [
        HomeFeatureCopy,
        HomeFeatureCopy,
        HomeFeatureCopy,
        HomeFeatureCopy
    ];
    processEyebrow: string;
    processTitle: string;
    steps: [HomeStepCopy, HomeStepCopy, HomeStepCopy];
    proofEyebrow: string;
    proofTitle: string;
    proofDescription: string;
    puzzleStat: string;
    languageStat: string;
    accessStat: string;
    finalTitle: string;
    finalDescription: string;
    finalAction: string;
}

const copies: Record<string, HomeCopy> = {
    en: {
        eyebrow: "Your chess, explained",
        title: "Understand every move. Improve every game.",
        introduction: "NexoChess turns your games into clear, practical lessons. Analyse key moments, revisit your decisions and train the patterns that matter.",
        primaryAction: "Analyse a game",
        secondaryAction: "Train with puzzles",
        badges: ["Free to use", "No installation", "11 languages"],
        previewLabel: "Game review",
        previewTitle: "A position becomes a lesson",
        previewStatus: "Analysis complete",
        previewBestMove: "Best move",
        previewKeyMoment: "Key moment",
        previewAccuracy: "Accuracy",
        featuresEyebrow: "One place to improve",
        featuresTitle: "From your last game to your next breakthrough",
        featuresIntroduction: "Move naturally between analysis, saved games, focused practice and learning material without leaving the same NexoChess experience.",
        features: [
            {
                title: "Analysis",
                description: "Import a game, review every move and understand where the position changed.",
                action: "Open analysis"
            },
            {
                title: "Archive",
                description: "Keep analysed games close and return to the moments worth studying.",
                action: "View archive"
            },
            {
                title: "Puzzles",
                description: "Train by theme and difficulty with a catalogue of more than six million positions.",
                action: "Start training"
            },
            {
                title: "Academy",
                description: "Explore structured learning material and strengthen the ideas behind your moves.",
                action: "Enter academy"
            }
        ],
        processEyebrow: "Simple by design",
        processTitle: "A useful review in three steps",
        steps: [
            {
                title: "Bring your game",
                description: "Paste or import the game you want to understand."
            },
            {
                title: "Review the turning points",
                description: "Follow the evaluation, move quality and explanations at your own pace."
            },
            {
                title: "Turn mistakes into training",
                description: "Revisit the ideas and practise related positions in Puzzles."
            }
        ],
        proofEyebrow: "Built for regular practice",
        proofTitle: "Everything is ready when the game ends",
        proofDescription: "Open NexoChess in the browser, review without installing software and continue in the language and appearance that suit you.",
        puzzleStat: "6M+ puzzles",
        languageStat: "11 languages",
        accessStat: "Browser based",
        finalTitle: "Your next game can teach you more",
        finalDescription: "Start with the position you are still thinking about and turn it into a clear plan for improvement.",
        finalAction: "Review my game"
    },
    es: {
        eyebrow: "Tu ajedrez, explicado",
        title: "Entiende cada jugada. Mejora en cada partida.",
        introduction: "NexoChess convierte tus partidas en lecciones claras y prácticas. Analiza los momentos clave, revisa tus decisiones y entrena los patrones que de verdad importan.",
        primaryAction: "Analizar una partida",
        secondaryAction: "Entrenar puzzles",
        badges: ["Uso gratuito", "Sin instalar nada", "11 idiomas"],
        previewLabel: "Revisión de partida",
        previewTitle: "Una posición se convierte en una lección",
        previewStatus: "Análisis completado",
        previewBestMove: "Mejor jugada",
        previewKeyMoment: "Momento clave",
        previewAccuracy: "Precisión",
        featuresEyebrow: "Un solo lugar para mejorar",
        featuresTitle: "De tu última partida a tu próximo avance",
        featuresIntroduction: "Pasa del análisis a tus partidas guardadas, el entrenamiento y el aprendizaje sin salir de la misma experiencia NexoChess.",
        features: [
            {
                title: "Análisis",
                description: "Importa una partida, revisa cada movimiento y entiende dónde cambió la posición.",
                action: "Abrir análisis"
            },
            {
                title: "Archivo",
                description: "Conserva tus partidas analizadas y vuelve a los momentos que merece la pena estudiar.",
                action: "Ver archivo"
            },
            {
                title: "Puzzles",
                description: "Entrena por tema y dificultad con un catálogo de más de seis millones de posiciones.",
                action: "Empezar a entrenar"
            },
            {
                title: "Academia",
                description: "Explora contenido de aprendizaje estructurado y refuerza las ideas detrás de tus jugadas.",
                action: "Entrar en Academia"
            }
        ],
        processEyebrow: "Sencillo a propósito",
        processTitle: "Una revisión útil en tres pasos",
        steps: [
            {
                title: "Trae tu partida",
                description: "Pega o importa la partida que quieres comprender."
            },
            {
                title: "Revisa los puntos de giro",
                description: "Sigue la evaluación, la calidad de las jugadas y las explicaciones a tu ritmo."
            },
            {
                title: "Convierte los errores en entrenamiento",
                description: "Repasa las ideas y practica posiciones relacionadas en Puzzles."
            }
        ],
        proofEyebrow: "Preparado para entrenar a diario",
        proofTitle: "Todo listo cuando termina la partida",
        proofDescription: "Abre NexoChess en el navegador, revisa sin instalar programas y continúa con el idioma y la apariencia que prefieras.",
        puzzleStat: "Más de 6 M de puzzles",
        languageStat: "11 idiomas",
        accessStat: "Desde el navegador",
        finalTitle: "Tu próxima partida puede enseñarte más",
        finalDescription: "Empieza por esa posición en la que sigues pensando y conviértela en un plan claro de mejora.",
        finalAction: "Revisar mi partida"
    },
    fr: {
        eyebrow: "Vos parties, enfin expliquées",
        title: "Comprenez chaque coup. Progressez à chaque partie.",
        introduction: "NexoChess transforme vos parties en leçons claires et concrètes. Analysez les moments clés, revenez sur vos décisions et entraînez les motifs qui comptent vraiment.",
        primaryAction: "Analyser une partie",
        secondaryAction: "Résoudre des puzzles",
        badges: ["Utilisation gratuite", "Aucune installation", "11 langues"],
        previewLabel: "Analyse de partie",
        previewTitle: "Une position devient une leçon",
        previewStatus: "Analyse terminée",
        previewBestMove: "Meilleur coup",
        previewKeyMoment: "Moment clé",
        previewAccuracy: "Précision",
        featuresEyebrow: "Un seul espace pour progresser",
        featuresTitle: "De votre dernière partie à votre prochain déclic",
        featuresIntroduction: "Passez naturellement de l’analyse aux parties sauvegardées, à l’entraînement ciblé et aux contenus pédagogiques dans une seule expérience NexoChess.",
        features: [
            { title: "Analyse", description: "Importez une partie, examinez chaque coup et comprenez où la position a basculé.", action: "Ouvrir l’analyse" },
            { title: "Archives", description: "Gardez vos parties analysées et retrouvez les moments qui méritent d’être étudiés.", action: "Voir les archives" },
            { title: "Puzzles", description: "Entraînez-vous par thème et difficulté avec plus de six millions de positions.", action: "Commencer l’entraînement" },
            { title: "Académie", description: "Explorez des contenus structurés et renforcez les idées derrière vos coups.", action: "Entrer dans l’Académie" }
        ],
        processEyebrow: "Pensé pour rester simple",
        processTitle: "Une analyse utile en trois étapes",
        steps: [
            { title: "Ajoutez votre partie", description: "Collez ou importez la partie que vous souhaitez comprendre." },
            { title: "Étudiez les tournants", description: "Suivez l’évaluation, la qualité des coups et les explications à votre rythme." },
            { title: "Transformez les erreurs en entraînement", description: "Revenez sur les idées et entraînez des positions liées dans Puzzles." }
        ],
        proofEyebrow: "Conçu pour une pratique régulière",
        proofTitle: "Tout est prêt dès que la partie se termine",
        proofDescription: "Ouvrez NexoChess dans votre navigateur, analysez sans installer de logiciel et continuez dans la langue et le thème qui vous conviennent.",
        puzzleStat: "Plus de 6 M de puzzles",
        languageStat: "11 langues",
        accessStat: "Dans le navigateur",
        finalTitle: "Votre prochaine partie peut vous apprendre davantage",
        finalDescription: "Commencez par la position à laquelle vous pensez encore et transformez-la en un plan de progression clair.",
        finalAction: "Analyser ma partie"
    },
    de: {
        eyebrow: "Dein Schach, verständlich erklärt",
        title: "Verstehe jeden Zug. Werde mit jeder Partie besser.",
        introduction: "NexoChess macht aus deinen Partien klare, praktische Lektionen. Analysiere Schlüsselmomente, überprüfe deine Entscheidungen und trainiere die wichtigen Muster.",
        primaryAction: "Partie analysieren",
        secondaryAction: "Puzzles trainieren",
        badges: ["Kostenlos nutzbar", "Keine Installation", "11 Sprachen"],
        previewLabel: "Partieanalyse",
        previewTitle: "Eine Stellung wird zur Lektion",
        previewStatus: "Analyse abgeschlossen",
        previewBestMove: "Bester Zug",
        previewKeyMoment: "Schlüsselmoment",
        previewAccuracy: "Genauigkeit",
        featuresEyebrow: "Alles an einem Ort",
        featuresTitle: "Von der letzten Partie zum nächsten Fortschritt",
        featuresIntroduction: "Wechsle nahtlos zwischen Analyse, gespeicherten Partien, gezieltem Training und Lerninhalten innerhalb von NexoChess.",
        features: [
            { title: "Analyse", description: "Importiere eine Partie, prüfe jeden Zug und erkenne, wo sich die Stellung verändert hat.", action: "Analyse öffnen" },
            { title: "Archiv", description: "Bewahre analysierte Partien auf und kehre zu den wichtigen Momenten zurück.", action: "Archiv ansehen" },
            { title: "Puzzles", description: "Trainiere nach Thema und Schwierigkeit mit mehr als sechs Millionen Stellungen.", action: "Training starten" },
            { title: "Akademie", description: "Entdecke strukturierte Lerninhalte und vertiefe die Ideen hinter deinen Zügen.", action: "Akademie öffnen" }
        ],
        processEyebrow: "Bewusst einfach",
        processTitle: "Eine hilfreiche Analyse in drei Schritten",
        steps: [
            { title: "Partie hinzufügen", description: "Füge die Partie ein oder importiere sie, um sie zu verstehen." },
            { title: "Wendepunkte untersuchen", description: "Verfolge Bewertung, Zugqualität und Erklärungen in deinem Tempo." },
            { title: "Fehler in Training verwandeln", description: "Wiederhole die Ideen und übe passende Stellungen in Puzzles." }
        ],
        proofEyebrow: "Für regelmäßiges Training",
        proofTitle: "Bereit, sobald die Partie vorbei ist",
        proofDescription: "Öffne NexoChess im Browser, analysiere ohne Installation und nutze deine bevorzugte Sprache und Darstellung.",
        puzzleStat: "Über 6 Mio. Puzzles",
        languageStat: "11 Sprachen",
        accessStat: "Im Browser",
        finalTitle: "Deine nächste Partie kann dir mehr beibringen",
        finalDescription: "Beginne mit der Stellung, die dich noch beschäftigt, und mache daraus einen klaren Verbesserungsplan.",
        finalAction: "Meine Partie prüfen"
    },
    pt: {
        eyebrow: "O seu xadrez, explicado",
        title: "Entenda cada lance. Melhore a cada partida.",
        introduction: "O NexoChess transforma as suas partidas em lições claras e práticas. Analise os momentos decisivos, reveja as suas escolhas e treine os padrões mais importantes.",
        primaryAction: "Analisar uma partida",
        secondaryAction: "Treinar puzzles",
        badges: ["Uso gratuito", "Sem instalação", "11 idiomas"],
        previewLabel: "Revisão da partida",
        previewTitle: "Uma posição torna-se uma lição",
        previewStatus: "Análise concluída",
        previewBestMove: "Melhor lance",
        previewKeyMoment: "Momento-chave",
        previewAccuracy: "Precisão",
        featuresEyebrow: "Um só lugar para evoluir",
        featuresTitle: "Da última partida ao próximo avanço",
        featuresIntroduction: "Passe naturalmente da análise para as partidas guardadas, o treino focado e os conteúdos de aprendizagem dentro da mesma experiência NexoChess.",
        features: [
            { title: "Análise", description: "Importe uma partida, reveja cada lance e entenda onde a posição mudou.", action: "Abrir análise" },
            { title: "Arquivo", description: "Guarde partidas analisadas e volte aos momentos que merecem estudo.", action: "Ver arquivo" },
            { title: "Puzzles", description: "Treine por tema e dificuldade com mais de seis milhões de posições.", action: "Começar a treinar" },
            { title: "Academia", description: "Explore conteúdos estruturados e fortaleça as ideias por trás dos seus lances.", action: "Entrar na Academia" }
        ],
        processEyebrow: "Simples por escolha",
        processTitle: "Uma revisão útil em três passos",
        steps: [
            { title: "Traga a sua partida", description: "Cole ou importe a partida que deseja compreender." },
            { title: "Reveja os pontos de viragem", description: "Acompanhe a avaliação, a qualidade dos lances e as explicações ao seu ritmo." },
            { title: "Transforme erros em treino", description: "Reveja as ideias e pratique posições relacionadas em Puzzles." }
        ],
        proofEyebrow: "Feito para treino regular",
        proofTitle: "Tudo pronto quando a partida termina",
        proofDescription: "Abra o NexoChess no navegador, reveja sem instalar programas e continue no idioma e tema que preferir.",
        puzzleStat: "Mais de 6 M de puzzles",
        languageStat: "11 idiomas",
        accessStat: "No navegador",
        finalTitle: "A sua próxima partida pode ensinar mais",
        finalDescription: "Comece pela posição em que ainda está a pensar e transforme-a num plano claro de melhoria.",
        finalAction: "Rever a minha partida"
    },
    ru: {
        eyebrow: "Ваши партии — с понятными объяснениями",
        title: "Понимайте каждый ход. Улучшайте каждую партию.",
        introduction: "NexoChess превращает партии в понятные практические уроки. Анализируйте ключевые моменты, пересматривайте решения и тренируйте действительно важные схемы.",
        primaryAction: "Разобрать партию",
        secondaryAction: "Решать задачи",
        badges: ["Бесплатно", "Без установки", "11 языков"],
        previewLabel: "Разбор партии",
        previewTitle: "Позиция становится уроком",
        previewStatus: "Анализ завершён",
        previewBestMove: "Лучший ход",
        previewKeyMoment: "Ключевой момент",
        previewAccuracy: "Точность",
        featuresEyebrow: "Всё для роста в одном месте",
        featuresTitle: "От последней партии к следующему прогрессу",
        featuresIntroduction: "Переходите от анализа к сохранённым партиям, тренировкам и учебным материалам, не покидая NexoChess.",
        features: [
            { title: "Анализ", description: "Импортируйте партию, изучите каждый ход и поймите, где изменилась позиция.", action: "Открыть анализ" },
            { title: "Архив", description: "Храните разобранные партии и возвращайтесь к важным моментам.", action: "Открыть архив" },
            { title: "Задачи", description: "Тренируйтесь по темам и сложности на базе более шести миллионов позиций.", action: "Начать тренировку" },
            { title: "Академия", description: "Изучайте структурированные материалы и укрепляйте идеи, стоящие за ходами.", action: "Открыть Академию" }
        ],
        processEyebrow: "Продуманная простота",
        processTitle: "Полезный разбор за три шага",
        steps: [
            { title: "Добавьте партию", description: "Вставьте или импортируйте партию, которую хотите понять." },
            { title: "Изучите переломные моменты", description: "Следите за оценкой, качеством ходов и объяснениями в удобном темпе." },
            { title: "Превратите ошибки в тренировку", description: "Повторите идеи и потренируйте похожие позиции в разделе задач." }
        ],
        proofEyebrow: "Для регулярных занятий",
        proofTitle: "Всё готово сразу после партии",
        proofDescription: "Откройте NexoChess в браузере, анализируйте без установки программ и выберите удобный язык и оформление.",
        puzzleStat: "Более 6 млн задач",
        languageStat: "11 языков",
        accessStat: "В браузере",
        finalTitle: "Следующая партия может научить большему",
        finalDescription: "Начните с позиции, о которой всё ещё думаете, и превратите её в понятный план развития.",
        finalAction: "Разобрать мою партию"
    },
    zh: {
        eyebrow: "让每盘棋都清晰可懂",
        title: "理解每一步，在每盘棋中进步。",
        introduction: "NexoChess 将你的对局变成清晰、实用的课程。分析关键时刻，回顾决策，并训练真正重要的棋型。",
        primaryAction: "分析对局",
        secondaryAction: "训练谜题",
        badges: ["免费使用", "无需安装", "支持 11 种语言"],
        previewLabel: "对局复盘",
        previewTitle: "让一个局面成为一堂课",
        previewStatus: "分析完成",
        previewBestMove: "最佳着法",
        previewKeyMoment: "关键时刻",
        previewAccuracy: "准确率",
        featuresEyebrow: "一个地方，持续进步",
        featuresTitle: "从上一盘棋走向下一次突破",
        featuresIntroduction: "在同一个 NexoChess 体验中，自然切换分析、已保存对局、专项训练和学习内容。",
        features: [
            { title: "分析", description: "导入对局，逐步复盘，并理解局势从哪里开始改变。", action: "打开分析" },
            { title: "档案", description: "保存已分析的对局，随时回到值得研究的时刻。", action: "查看档案" },
            { title: "谜题", description: "按主题和难度训练，使用超过六百万个局面。", action: "开始训练" },
            { title: "学院", description: "探索结构化学习内容，巩固每一步背后的思路。", action: "进入学院" }
        ],
        processEyebrow: "有意保持简单",
        processTitle: "三步完成有效复盘",
        steps: [
            { title: "添加你的对局", description: "粘贴或导入你想理解的对局。" },
            { title: "检查转折点", description: "按自己的节奏查看评估、着法质量和解释。" },
            { title: "把错误变成训练", description: "回顾相关思路，并在谜题中练习类似局面。" }
        ],
        proofEyebrow: "为日常训练而准备",
        proofTitle: "对局结束，复盘随即开始",
        proofDescription: "在浏览器中打开 NexoChess，无需安装软件，并使用适合你的语言和外观。",
        puzzleStat: "600 万+谜题",
        languageStat: "11 种语言",
        accessStat: "浏览器直接使用",
        finalTitle: "下一盘棋可以教会你更多",
        finalDescription: "从那个仍让你思考的局面开始，把它变成清晰的提升计划。",
        finalAction: "复盘我的对局"
    },
    vi: {
        eyebrow: "Ván cờ của bạn, được giải thích rõ ràng",
        title: "Hiểu từng nước đi. Tiến bộ qua từng ván.",
        introduction: "NexoChess biến các ván đấu thành những bài học rõ ràng và thực tế. Phân tích thời điểm then chốt, xem lại quyết định và luyện những mẫu hình quan trọng.",
        primaryAction: "Phân tích ván đấu",
        secondaryAction: "Luyện câu đố",
        badges: ["Sử dụng miễn phí", "Không cần cài đặt", "11 ngôn ngữ"],
        previewLabel: "Xem lại ván đấu",
        previewTitle: "Một thế cờ trở thành bài học",
        previewStatus: "Đã phân tích xong",
        previewBestMove: "Nước đi tốt nhất",
        previewKeyMoment: "Thời điểm then chốt",
        previewAccuracy: "Độ chính xác",
        featuresEyebrow: "Một nơi để tiến bộ",
        featuresTitle: "Từ ván đấu gần nhất đến bước tiến tiếp theo",
        featuresIntroduction: "Chuyển liền mạch giữa phân tích, ván đã lưu, luyện tập có mục tiêu và nội dung học trong cùng trải nghiệm NexoChess.",
        features: [
            { title: "Phân tích", description: "Nhập ván đấu, xem lại từng nước và hiểu vị trí đã thay đổi ở đâu.", action: "Mở phân tích" },
            { title: "Kho lưu trữ", description: "Giữ các ván đã phân tích và quay lại những thời điểm đáng học.", action: "Xem kho lưu trữ" },
            { title: "Câu đố", description: "Luyện theo chủ đề và độ khó với hơn sáu triệu thế cờ.", action: "Bắt đầu luyện" },
            { title: "Học viện", description: "Khám phá nội dung có cấu trúc và củng cố ý tưởng phía sau các nước đi.", action: "Vào Học viện" }
        ],
        processEyebrow: "Đơn giản có chủ đích",
        processTitle: "Một lần xem lại hữu ích trong ba bước",
        steps: [
            { title: "Đưa ván đấu vào", description: "Dán hoặc nhập ván đấu bạn muốn hiểu." },
            { title: "Xem các bước ngoặt", description: "Theo dõi đánh giá, chất lượng nước đi và giải thích theo tốc độ của bạn." },
            { title: "Biến sai lầm thành luyện tập", description: "Ôn lại ý tưởng và luyện các thế cờ liên quan trong Câu đố." }
        ],
        proofEyebrow: "Sẵn sàng cho việc luyện tập thường xuyên",
        proofTitle: "Mọi thứ sẵn sàng khi ván đấu kết thúc",
        proofDescription: "Mở NexoChess trong trình duyệt, xem lại mà không cần cài phần mềm và dùng ngôn ngữ cùng giao diện phù hợp với bạn.",
        puzzleStat: "Hơn 6 triệu câu đố",
        languageStat: "11 ngôn ngữ",
        accessStat: "Trên trình duyệt",
        finalTitle: "Ván tiếp theo có thể dạy bạn nhiều hơn",
        finalDescription: "Bắt đầu từ thế cờ bạn vẫn còn suy nghĩ và biến nó thành kế hoạch tiến bộ rõ ràng.",
        finalAction: "Xem lại ván của tôi"
    },
    hi: {
        eyebrow: "आपका शतरंज, साफ़ तरीके से समझाया गया",
        title: "हर चाल समझें। हर खेल के साथ बेहतर बनें।",
        introduction: "NexoChess आपकी बाज़ियों को स्पष्ट और व्यावहारिक सीख में बदलता है। अहम पलों का विश्लेषण करें, अपने फैसलों को दोबारा देखें और ज़रूरी पैटर्न का अभ्यास करें।",
        primaryAction: "बाज़ी का विश्लेषण करें",
        secondaryAction: "पज़ल अभ्यास करें",
        badges: ["मुफ़्त उपयोग", "इंस्टॉलेशन नहीं", "11 भाषाएँ"],
        previewLabel: "बाज़ी समीक्षा",
        previewTitle: "एक स्थिति से एक सीख",
        previewStatus: "विश्लेषण पूरा हुआ",
        previewBestMove: "सर्वश्रेष्ठ चाल",
        previewKeyMoment: "अहम पल",
        previewAccuracy: "सटीकता",
        featuresEyebrow: "सुधार के लिए एक ही जगह",
        featuresTitle: "पिछली बाज़ी से अगली उपलब्धि तक",
        featuresIntroduction: "एक ही NexoChess अनुभव में विश्लेषण, सुरक्षित बाज़ियाँ, केंद्रित अभ्यास और सीखने की सामग्री के बीच आसानी से जाएँ।",
        features: [
            { title: "विश्लेषण", description: "बाज़ी आयात करें, हर चाल देखें और समझें कि स्थिति कहाँ बदली।", action: "विश्लेषण खोलें" },
            { title: "आर्काइव", description: "विश्लेषित बाज़ियाँ सहेजें और सीखने योग्य पलों पर वापस जाएँ।", action: "आर्काइव देखें" },
            { title: "पज़ल", description: "छह मिलियन से अधिक स्थितियों के साथ विषय और कठिनाई के अनुसार अभ्यास करें।", action: "अभ्यास शुरू करें" },
            { title: "अकादमी", description: "व्यवस्थित सामग्री देखें और अपनी चालों के पीछे के विचार मजबूत करें।", action: "अकादमी खोलें" }
        ],
        processEyebrow: "जानबूझकर सरल",
        processTitle: "तीन चरणों में उपयोगी समीक्षा",
        steps: [
            { title: "अपनी बाज़ी जोड़ें", description: "जिस बाज़ी को समझना है उसे पेस्ट या आयात करें।" },
            { title: "निर्णायक पलों को देखें", description: "अपने हिसाब से मूल्यांकन, चाल की गुणवत्ता और व्याख्या देखें।" },
            { title: "गलतियों को अभ्यास में बदलें", description: "विचारों को दोहराएँ और पज़ल में संबंधित स्थितियों का अभ्यास करें।" }
        ],
        proofEyebrow: "नियमित अभ्यास के लिए तैयार",
        proofTitle: "बाज़ी खत्म होते ही सब तैयार",
        proofDescription: "ब्राउज़र में NexoChess खोलें, बिना सॉफ़्टवेयर इंस्टॉल किए समीक्षा करें और अपनी पसंद की भाषा व रूप चुनें।",
        puzzleStat: "60 लाख+ पज़ल",
        languageStat: "11 भाषाएँ",
        accessStat: "ब्राउज़र आधारित",
        finalTitle: "आपकी अगली बाज़ी आपको और सिखा सकती है",
        finalDescription: "उस स्थिति से शुरू करें जिसके बारे में आप अभी भी सोच रहे हैं और उसे सुधार की स्पष्ट योजना में बदलें।",
        finalAction: "मेरी बाज़ी की समीक्षा करें"
    },
    mr: {
        eyebrow: "तुमचा बुद्धिबळ खेळ, स्पष्टपणे समजावलेला",
        title: "प्रत्येक चाल समजा. प्रत्येक डावासोबत प्रगती करा.",
        introduction: "NexoChess तुमच्या डावांना स्पष्ट आणि उपयुक्त धड्यांमध्ये बदलते. महत्त्वाचे क्षण तपासा, निर्णय पुन्हा पाहा आणि आवश्यक नमुन्यांचा सराव करा.",
        primaryAction: "डावाचे विश्लेषण करा",
        secondaryAction: "पझल्सचा सराव करा",
        badges: ["मोफत वापर", "इन्स्टॉलेशन नाही", "11 भाषा"],
        previewLabel: "डावाचा आढावा",
        previewTitle: "एका स्थितीतून एक धडा",
        previewStatus: "विश्लेषण पूर्ण",
        previewBestMove: "सर्वोत्तम चाल",
        previewKeyMoment: "महत्त्वाचा क्षण",
        previewAccuracy: "अचूकता",
        featuresEyebrow: "प्रगतीसाठी एकच जागा",
        featuresTitle: "मागील डावापासून पुढील प्रगतीपर्यंत",
        featuresIntroduction: "एकाच NexoChess अनुभवात विश्लेषण, जतन केलेले डाव, लक्षपूर्वक सराव आणि शिकण्याचे साहित्य सहज वापरा.",
        features: [
            { title: "विश्लेषण", description: "डाव आयात करा, प्रत्येक चाल तपासा आणि स्थिती कुठे बदलली ते समजा.", action: "विश्लेषण उघडा" },
            { title: "संग्रह", description: "विश्लेषित डाव जतन करा आणि अभ्यास करण्यासारख्या क्षणांकडे पुन्हा या.", action: "संग्रह पाहा" },
            { title: "पझल्स", description: "साठ लाखांहून अधिक स्थितींमधून विषय आणि अवघडीनुसार सराव करा.", action: "सराव सुरू करा" },
            { title: "अकादमी", description: "रचनाबद्ध साहित्य पाहा आणि चालींमागील कल्पना मजबूत करा.", action: "अकादमी उघडा" }
        ],
        processEyebrow: "जाणीवपूर्वक सोपे",
        processTitle: "तीन टप्प्यांत उपयुक्त आढावा",
        steps: [
            { title: "तुमचा डाव जोडा", description: "समजून घ्यायचा डाव पेस्ट किंवा आयात करा." },
            { title: "निर्णायक क्षण तपासा", description: "मूल्यांकन, चालींची गुणवत्ता आणि स्पष्टीकरणे तुमच्या गतीने पाहा." },
            { title: "चुका सरावात बदला", description: "कल्पना पुन्हा पाहा आणि पझल्समध्ये संबंधित स्थितींचा सराव करा." }
        ],
        proofEyebrow: "नियमित सरावासाठी तयार",
        proofTitle: "डाव संपताच सर्व काही तयार",
        proofDescription: "ब्राउझरमध्ये NexoChess उघडा, कोणतेही सॉफ्टवेअर न बसवता आढावा घ्या आणि पसंतीची भाषा व रूप वापरा.",
        puzzleStat: "60 लाख+ पझल्स",
        languageStat: "11 भाषा",
        accessStat: "ब्राउझरवर आधारित",
        finalTitle: "तुमचा पुढचा डाव अधिक शिकवू शकतो",
        finalDescription: "ज्या स्थितीचा अजून विचार करत आहात तिथून सुरुवात करा आणि तिला सुधारणेच्या स्पष्ट योजनेत बदला.",
        finalAction: "माझ्या डावाचा आढावा घ्या"
    },
    pl: {
        eyebrow: "Twoje szachy, jasno wyjaśnione",
        title: "Zrozum każdy ruch. Rozwijaj się z każdą partią.",
        introduction: "NexoChess zamienia partie w jasne, praktyczne lekcje. Analizuj kluczowe momenty, wracaj do decyzji i ćwicz wzorce, które naprawdę mają znaczenie.",
        primaryAction: "Przeanalizuj partię",
        secondaryAction: "Trenuj zadania",
        badges: ["Bezpłatne użycie", "Bez instalacji", "11 języków"],
        previewLabel: "Analiza partii",
        previewTitle: "Pozycja staje się lekcją",
        previewStatus: "Analiza zakończona",
        previewBestMove: "Najlepszy ruch",
        previewKeyMoment: "Kluczowy moment",
        previewAccuracy: "Dokładność",
        featuresEyebrow: "Jedno miejsce do rozwoju",
        featuresTitle: "Od ostatniej partii do kolejnego przełomu",
        featuresIntroduction: "Płynnie przechodź między analizą, zapisanymi partiami, ukierunkowanym treningiem i materiałami edukacyjnymi w NexoChess.",
        features: [
            { title: "Analiza", description: "Zaimportuj partię, przejrzyj każdy ruch i zobacz, gdzie zmieniła się pozycja.", action: "Otwórz analizę" },
            { title: "Archiwum", description: "Zachowuj przeanalizowane partie i wracaj do momentów wartych nauki.", action: "Zobacz archiwum" },
            { title: "Zadania", description: "Trenuj według motywu i poziomu na bazie ponad sześciu milionów pozycji.", action: "Rozpocznij trening" },
            { title: "Akademia", description: "Poznawaj uporządkowane materiały i wzmacniaj idee stojące za ruchami.", action: "Wejdź do Akademii" }
        ],
        processEyebrow: "Celowo proste",
        processTitle: "Przydatna analiza w trzech krokach",
        steps: [
            { title: "Dodaj swoją partię", description: "Wklej lub zaimportuj partię, którą chcesz zrozumieć." },
            { title: "Przejrzyj punkty zwrotne", description: "Śledź ocenę, jakość ruchów i wyjaśnienia we własnym tempie." },
            { title: "Zamień błędy w trening", description: "Wróć do idei i ćwicz podobne pozycje w Zadaniach." }
        ],
        proofEyebrow: "Do regularnego treningu",
        proofTitle: "Wszystko gotowe po zakończeniu partii",
        proofDescription: "Otwórz NexoChess w przeglądarce, analizuj bez instalowania programu i korzystaj z wybranego języka oraz wyglądu.",
        puzzleStat: "Ponad 6 mln zadań",
        languageStat: "11 języków",
        accessStat: "W przeglądarce",
        finalTitle: "Następna partia może nauczyć Cię więcej",
        finalDescription: "Zacznij od pozycji, o której nadal myślisz, i zamień ją w jasny plan rozwoju.",
        finalAction: "Przeanalizuj moją partię"
    }
};

export function getHomeCopy(language?: string | null): HomeCopy {
    const normalised = String(language || "en")
        .trim()
        .toLowerCase()
        .replace("_", "-")
        .split("-")[0];

    return copies[normalised] || copies.en;
}

export const HOME_COPY_LANGUAGES = Object.freeze(Object.keys(copies));
