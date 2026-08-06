export interface AboutPrincipleCopy {
    title: string;
    description: string;
}

export interface AboutCopy {
    eyebrow: string;
    title: string;
    introduction: string;
    primaryAction: string;
    secondaryAction: string;
    identityLabel: string;
    identityTitle: string;
    identityDescription: string;
    freeLabel: string;
    openSourceLabel: string;
    independentLabel: string;
    puzzleMetric: string;
    languageMetric: string;
    engineMetric: string;
    missionEyebrow: string;
    missionTitle: string;
    missionParagraphs: [string, string];
    principlesEyebrow: string;
    principlesTitle: string;
    principles: [
        AboutPrincipleCopy,
        AboutPrincipleCopy,
        AboutPrincipleCopy,
        AboutPrincipleCopy
    ];
    independenceEyebrow: string;
    independenceTitle: string;
    independenceDescription: string;
    independenceNote: string;
    sourceAction: string;
    creatorEyebrow: string;
    creatorTitle: string;
    creatorDescription: string;
    creatorLocation: string;
    finalTitle: string;
    finalDescription: string;
    finalPrimaryAction: string;
    finalSecondaryAction: string;
}

const copies: Record<string, AboutCopy> = {
    en: {
        eyebrow: "About NexoChess",
        title: "Built to turn chess analysis into useful learning.",
        introduction: "NexoChess is a free web application for reviewing games, understanding mistakes with Stockfish and practising the patterns that appear on the board.",
        primaryAction: "Analyse a game",
        secondaryAction: "Explore the source",
        identityLabel: "The project",
        identityTitle: "One connected place to review, practise and improve",
        identityDescription: "Analysis, saved games, focused puzzles and learning tools share the same clear NexoChess experience.",
        freeLabel: "Free to use",
        openSourceLabel: "Open source",
        independentLabel: "Independent",
        puzzleMetric: "puzzles available",
        languageMetric: "interface languages",
        engineMetric: "analysis engine",
        missionEyebrow: "Why it exists",
        missionTitle: "An engine score should be the beginning of the explanation, not the end.",
        missionParagraphs: [
            "Chess engines can identify the strongest move, but players still need to understand what changed, why a decision mattered and what idea they can use in the next game.",
            "NexoChess connects analysis and training so that a reviewed mistake can become a position to revisit instead of just another red number."
        ],
        principlesEyebrow: "Project principles",
        principlesTitle: "Clear decisions guide every part of NexoChess",
        principles: [
            {
                title: "Understandable",
                description: "Information is organised to help players follow the game without hiding the important details."
            },
            {
                title: "Useful",
                description: "Every tool should help review a decision, practise a pattern or return to a lesson."
            },
            {
                title: "Accessible",
                description: "NexoChess runs in the browser, supports light and dark themes and is available in eleven languages."
            },
            {
                title: "Responsible",
                description: "Security, privacy, licences and operational recovery are treated as product requirements."
            }
        ],
        independenceEyebrow: "Independent and open",
        independenceTitle: "NexoChess is its own project",
        independenceDescription: "The application is independently developed and is not affiliated with, sponsored by or endorsed by third-party chess platforms.",
        independenceNote: "Its source code is public under GPL-3.0, with licence and attribution information kept available inside the application and repository.",
        sourceAction: "View source code and licences",
        creatorEyebrow: "Created and maintained by",
        creatorTitle: "Manuel García Villaescusa",
        creatorDescription: "NexoChess is developed as an independent project with a simple objective: make serious chess review clearer, more practical and available to more players.",
        creatorLocation: "Developed in Spain",
        finalTitle: "The project starts with your games",
        finalDescription: "Bring a position you want to understand and use NexoChess to turn it into a concrete lesson.",
        finalPrimaryAction: "Start analysing",
        finalSecondaryAction: "Train puzzles"
    },
    es: {
        eyebrow: "Sobre NexoChess",
        title: "Creado para convertir el análisis de ajedrez en aprendizaje útil.",
        introduction: "NexoChess es una aplicación web gratuita para revisar partidas, comprender errores con Stockfish y practicar los patrones que aparecen sobre el tablero.",
        primaryAction: "Analizar una partida",
        secondaryAction: "Explorar el código",
        identityLabel: "El proyecto",
        identityTitle: "Un mismo lugar para revisar, practicar y mejorar",
        identityDescription: "El análisis, las partidas guardadas, los puzzles y las herramientas de aprendizaje forman una experiencia NexoChess clara y conectada.",
        freeLabel: "Uso gratuito",
        openSourceLabel: "Código abierto",
        independentLabel: "Independiente",
        puzzleMetric: "puzzles disponibles",
        languageMetric: "idiomas de interfaz",
        engineMetric: "motor de análisis",
        missionEyebrow: "Por qué existe",
        missionTitle: "La evaluación de un motor debe ser el principio de la explicación, no el final.",
        missionParagraphs: [
            "Los motores de ajedrez pueden encontrar la mejor jugada, pero el jugador todavía necesita entender qué cambió, por qué importó una decisión y qué idea puede aplicar en la siguiente partida.",
            "NexoChess conecta análisis y entrenamiento para que un error revisado pueda convertirse en una posición que merece la pena volver a practicar, y no solo en otro número rojo."
        ],
        principlesEyebrow: "Principios del proyecto",
        principlesTitle: "Decisiones claras guían cada parte de NexoChess",
        principles: [
            {
                title: "Comprensible",
                description: "La información se organiza para seguir la partida sin ocultar los detalles importantes."
            },
            {
                title: "Útil",
                description: "Cada herramienta debe servir para revisar una decisión, practicar un patrón o recuperar una lección."
            },
            {
                title: "Accesible",
                description: "NexoChess funciona en el navegador, admite tema claro y oscuro y está disponible en once idiomas."
            },
            {
                title: "Responsable",
                description: "La seguridad, la privacidad, las licencias y la recuperación operativa se tratan como requisitos del producto."
            }
        ],
        independenceEyebrow: "Independiente y abierto",
        independenceTitle: "NexoChess es un proyecto propio",
        independenceDescription: "La aplicación se desarrolla de forma independiente y no está afiliada, patrocinada ni respaldada por plataformas de ajedrez de terceros.",
        independenceNote: "Su código fuente es público bajo GPL-3.0 y la información de licencias y atribuciones permanece disponible en la aplicación y el repositorio.",
        sourceAction: "Ver código fuente y licencias",
        creatorEyebrow: "Creado y mantenido por",
        creatorTitle: "Manuel García Villaescusa",
        creatorDescription: "NexoChess se desarrolla como un proyecto independiente con un objetivo sencillo: hacer que la revisión seria de partidas sea más clara, práctica y accesible para más jugadores.",
        creatorLocation: "Desarrollado en España",
        finalTitle: "El proyecto empieza con tus partidas",
        finalDescription: "Trae una posición que quieras comprender y utiliza NexoChess para convertirla en una lección concreta.",
        finalPrimaryAction: "Empezar a analizar",
        finalSecondaryAction: "Entrenar puzzles"
    },
    fr: {
        eyebrow: "À propos de NexoChess",
        title: "Conçu pour transformer l’analyse d’échecs en apprentissage utile.",
        introduction: "NexoChess est une application web gratuite pour revoir ses parties, comprendre ses erreurs avec Stockfish et travailler les motifs rencontrés sur l’échiquier.",
        primaryAction: "Analyser une partie",
        secondaryAction: "Explorer le code",
        identityLabel: "Le projet",
        identityTitle: "Un même espace pour analyser, s’entraîner et progresser",
        identityDescription: "Analyse, parties enregistrées, puzzles ciblés et outils pédagogiques partagent une expérience NexoChess claire et cohérente.",
        freeLabel: "Utilisation gratuite",
        openSourceLabel: "Code source ouvert",
        independentLabel: "Indépendant",
        puzzleMetric: "puzzles disponibles",
        languageMetric: "langues d’interface",
        engineMetric: "moteur d’analyse",
        missionEyebrow: "Pourquoi il existe",
        missionTitle: "L’évaluation d’un moteur doit ouvrir l’explication, pas la conclure.",
        missionParagraphs: [
            "Un moteur peut trouver le meilleur coup, mais le joueur doit encore comprendre ce qui a changé, pourquoi une décision comptait et quelle idée réutiliser lors de la prochaine partie.",
            "NexoChess relie analyse et entraînement afin qu’une erreur revue devienne une position à retravailler, plutôt qu’un simple chiffre rouge."
        ],
        principlesEyebrow: "Principes du projet",
        principlesTitle: "Des choix clairs guident chaque partie de NexoChess",
        principles: [
            {
                title: "Compréhensible",
                description: "Les informations sont organisées pour suivre la partie sans masquer les détails importants."
            },
            {
                title: "Utile",
                description: "Chaque outil doit permettre d’examiner une décision, de travailler un motif ou de retrouver une leçon."
            },
            {
                title: "Accessible",
                description: "NexoChess fonctionne dans le navigateur, propose les thèmes clair et sombre et existe en onze langues."
            },
            {
                title: "Responsable",
                description: "Sécurité, confidentialité, licences et reprise opérationnelle sont traitées comme des exigences du produit."
            }
        ],
        independenceEyebrow: "Indépendant et ouvert",
        independenceTitle: "NexoChess est un projet autonome",
        independenceDescription: "L’application est développée indépendamment et n’est ni affiliée, ni sponsorisée, ni approuvée par des plateformes d’échecs tierces.",
        independenceNote: "Son code source est public sous licence GPL-3.0, et les licences ainsi que les attributions restent accessibles dans l’application et le dépôt.",
        sourceAction: "Voir le code source et les licences",
        creatorEyebrow: "Créé et maintenu par",
        creatorTitle: "Manuel García Villaescusa",
        creatorDescription: "NexoChess est développé comme un projet indépendant avec un objectif simple : rendre l’analyse sérieuse des parties plus claire, plus pratique et accessible à davantage de joueurs.",
        creatorLocation: "Développé en Espagne",
        finalTitle: "Le projet commence avec vos parties",
        finalDescription: "Ajoutez une position que vous souhaitez comprendre et transformez-la avec NexoChess en leçon concrète.",
        finalPrimaryAction: "Commencer l’analyse",
        finalSecondaryAction: "Résoudre des puzzles"
    },
    de: {
        eyebrow: "Über NexoChess",
        title: "Entwickelt, um Schachanalyse in nützliches Lernen zu verwandeln.",
        introduction: "NexoChess ist eine kostenlose Webanwendung, mit der du Partien auswertest, Fehler mit Stockfish verstehst und typische Muster vom Brett trainierst.",
        primaryAction: "Partie analysieren",
        secondaryAction: "Quellcode ansehen",
        identityLabel: "Das Projekt",
        identityTitle: "Ein verbundener Ort zum Auswerten, Trainieren und Verbessern",
        identityDescription: "Analyse, gespeicherte Partien, gezielte Aufgaben und Lernwerkzeuge bilden gemeinsam eine klare NexoChess-Erfahrung.",
        freeLabel: "Kostenlos nutzbar",
        openSourceLabel: "Open Source",
        independentLabel: "Unabhängig",
        puzzleMetric: "verfügbare Aufgaben",
        languageMetric: "Oberflächensprachen",
        engineMetric: "Analyse-Engine",
        missionEyebrow: "Warum es NexoChess gibt",
        missionTitle: "Eine Engine-Bewertung sollte der Anfang der Erklärung sein, nicht ihr Ende.",
        missionParagraphs: [
            "Schachengines finden den stärksten Zug, doch Spieler müssen weiterhin verstehen, was sich verändert hat, warum eine Entscheidung wichtig war und welche Idee sie in der nächsten Partie nutzen können.",
            "NexoChess verbindet Analyse und Training, damit ein untersuchter Fehler zu einer Position wird, die man erneut übt, statt nur zu einer weiteren roten Zahl."
        ],
        principlesEyebrow: "Projektprinzipien",
        principlesTitle: "Klare Entscheidungen bestimmen jeden Teil von NexoChess",
        principles: [
            {
                title: "Verständlich",
                description: "Informationen sind so geordnet, dass man der Partie folgen kann, ohne wichtige Details zu verlieren."
            },
            {
                title: "Nützlich",
                description: "Jedes Werkzeug soll helfen, eine Entscheidung zu prüfen, ein Muster zu trainieren oder eine Lektion wiederzufinden."
            },
            {
                title: "Zugänglich",
                description: "NexoChess läuft im Browser, unterstützt helle und dunkle Darstellung und ist in elf Sprachen verfügbar."
            },
            {
                title: "Verantwortungsvoll",
                description: "Sicherheit, Datenschutz, Lizenzen und Wiederherstellung werden als Produktanforderungen behandelt."
            }
        ],
        independenceEyebrow: "Unabhängig und offen",
        independenceTitle: "NexoChess ist ein eigenständiges Projekt",
        independenceDescription: "Die Anwendung wird unabhängig entwickelt und ist mit keinen externen Schachplattformen verbunden, von ihnen gesponsert oder empfohlen.",
        independenceNote: "Der Quellcode ist unter GPL-3.0 öffentlich. Lizenz- und Quellenhinweise bleiben in der Anwendung und im Repository zugänglich.",
        sourceAction: "Quellcode und Lizenzen ansehen",
        creatorEyebrow: "Erstellt und gepflegt von",
        creatorTitle: "Manuel García Villaescusa",
        creatorDescription: "NexoChess wird als unabhängiges Projekt mit einem einfachen Ziel entwickelt: ernsthafte Partieanalyse klarer, praktischer und für mehr Spieler verfügbar zu machen.",
        creatorLocation: "Entwickelt in Spanien",
        finalTitle: "Das Projekt beginnt mit deinen Partien",
        finalDescription: "Bringe eine Position mit, die du verstehen möchtest, und mache daraus mit NexoChess eine konkrete Lektion.",
        finalPrimaryAction: "Analyse starten",
        finalSecondaryAction: "Aufgaben trainieren"
    },
    pt: {
        eyebrow: "Sobre o NexoChess",
        title: "Criado para transformar análise de xadrez em aprendizagem útil.",
        introduction: "O NexoChess é uma aplicação web gratuita para rever partidas, compreender erros com o Stockfish e praticar os padrões que aparecem no tabuleiro.",
        primaryAction: "Analisar uma partida",
        secondaryAction: "Explorar o código",
        identityLabel: "O projeto",
        identityTitle: "Um único espaço para rever, praticar e melhorar",
        identityDescription: "Análise, partidas guardadas, puzzles direcionados e ferramentas de aprendizagem partilham a mesma experiência clara do NexoChess.",
        freeLabel: "Utilização gratuita",
        openSourceLabel: "Código aberto",
        independentLabel: "Independente",
        puzzleMetric: "puzzles disponíveis",
        languageMetric: "idiomas da interface",
        engineMetric: "motor de análise",
        missionEyebrow: "Porque existe",
        missionTitle: "A avaliação de um motor deve iniciar a explicação, não terminá-la.",
        missionParagraphs: [
            "Os motores de xadrez encontram a melhor jogada, mas o jogador ainda precisa de perceber o que mudou, porque uma decisão foi importante e que ideia pode usar na partida seguinte.",
            "O NexoChess liga análise e treino para que um erro revisto se transforme numa posição a praticar novamente, e não apenas noutro número vermelho."
        ],
        principlesEyebrow: "Princípios do projeto",
        principlesTitle: "Decisões claras orientam cada parte do NexoChess",
        principles: [
            {
                title: "Compreensível",
                description: "A informação é organizada para acompanhar a partida sem esconder os detalhes importantes."
            },
            {
                title: "Útil",
                description: "Cada ferramenta deve ajudar a rever uma decisão, praticar um padrão ou recuperar uma lição."
            },
            {
                title: "Acessível",
                description: "O NexoChess funciona no navegador, inclui temas claro e escuro e está disponível em onze idiomas."
            },
            {
                title: "Responsável",
                description: "Segurança, privacidade, licenças e recuperação operacional são tratados como requisitos do produto."
            }
        ],
        independenceEyebrow: "Independente e aberto",
        independenceTitle: "O NexoChess é um projeto próprio",
        independenceDescription: "A aplicação é desenvolvida de forma independente e não é afiliada, patrocinada nem apoiada por plataformas de xadrez de terceiros.",
        independenceNote: "O código-fonte é público sob GPL-3.0 e as informações de licenças e atribuições permanecem disponíveis na aplicação e no repositório.",
        sourceAction: "Ver código-fonte e licenças",
        creatorEyebrow: "Criado e mantido por",
        creatorTitle: "Manuel García Villaescusa",
        creatorDescription: "O NexoChess é desenvolvido como um projeto independente com um objetivo simples: tornar a revisão séria de partidas mais clara, prática e acessível a mais jogadores.",
        creatorLocation: "Desenvolvido em Espanha",
        finalTitle: "O projeto começa com as tuas partidas",
        finalDescription: "Traz uma posição que queiras compreender e usa o NexoChess para a transformar numa lição concreta.",
        finalPrimaryAction: "Começar a analisar",
        finalSecondaryAction: "Treinar puzzles"
    },
    ru: {
        eyebrow: "О NexoChess",
        title: "Создан, чтобы превращать шахматный анализ в полезное обучение.",
        introduction: "NexoChess — бесплатное веб-приложение для разбора партий, понимания ошибок с помощью Stockfish и тренировки мотивов, возникающих на доске.",
        primaryAction: "Разобрать партию",
        secondaryAction: "Посмотреть исходный код",
        identityLabel: "Проект",
        identityTitle: "Единое пространство для разбора, практики и роста",
        identityDescription: "Анализ, сохранённые партии, тематические задачи и учебные инструменты объединены в понятной среде NexoChess.",
        freeLabel: "Бесплатно",
        openSourceLabel: "Открытый код",
        independentLabel: "Независимый проект",
        puzzleMetric: "доступных задач",
        languageMetric: "языков интерфейса",
        engineMetric: "движок анализа",
        missionEyebrow: "Зачем он создан",
        missionTitle: "Оценка движка должна начинать объяснение, а не заканчивать его.",
        missionParagraphs: [
            "Шахматный движок может найти сильнейший ход, но игроку всё равно нужно понять, что изменилось, почему решение было важным и какую идею можно применить в следующей партии.",
            "NexoChess связывает анализ и тренировку, чтобы разобранная ошибка превращалась в позицию для повторной практики, а не оставалась очередной красной цифрой."
        ],
        principlesEyebrow: "Принципы проекта",
        principlesTitle: "Каждую часть NexoChess определяют ясные решения",
        principles: [
            {
                title: "Понятность",
                description: "Информация организована так, чтобы следить за партией и не терять важные детали."
            },
            {
                title: "Практичность",
                description: "Каждый инструмент должен помогать разбирать решение, тренировать мотив или возвращаться к уроку."
            },
            {
                title: "Доступность",
                description: "NexoChess работает в браузере, поддерживает светлую и тёмную темы и доступен на одиннадцати языках."
            },
            {
                title: "Ответственность",
                description: "Безопасность, конфиденциальность, лицензии и восстановление считаются требованиями к продукту."
            }
        ],
        independenceEyebrow: "Независимый и открытый",
        independenceTitle: "NexoChess — самостоятельный проект",
        independenceDescription: "Приложение разрабатывается независимо и не связано, не спонсируется и не поддерживается сторонними шахматными платформами.",
        independenceNote: "Исходный код открыт по лицензии GPL-3.0, а сведения о лицензиях и источниках доступны в приложении и репозитории.",
        sourceAction: "Исходный код и лицензии",
        creatorEyebrow: "Создатель и разработчик",
        creatorTitle: "Manuel García Villaescusa",
        creatorDescription: "NexoChess развивается как независимый проект с простой целью: сделать серьёзный разбор партий понятнее, практичнее и доступнее большему числу игроков.",
        creatorLocation: "Разработано в Испании",
        finalTitle: "Проект начинается с ваших партий",
        finalDescription: "Добавьте позицию, которую хотите понять, и превратите её с помощью NexoChess в конкретный урок.",
        finalPrimaryAction: "Начать анализ",
        finalSecondaryAction: "Решать задачи"
    },
    zh: {
        eyebrow: "关于 NexoChess",
        title: "让棋局分析真正转化为有用的学习。",
        introduction: "NexoChess 是一款免费的网页应用，可用于复盘棋局、借助 Stockfish 理解错误，并练习实战中出现的典型模式。",
        primaryAction: "分析棋局",
        secondaryAction: "查看源代码",
        identityLabel: "项目",
        identityTitle: "在同一个空间中复盘、练习并进步",
        identityDescription: "棋局分析、已保存对局、专项谜题与学习工具共同构成清晰连贯的 NexoChess 体验。",
        freeLabel: "免费使用",
        openSourceLabel: "开源",
        independentLabel: "独立项目",
        puzzleMetric: "道可用谜题",
        languageMetric: "种界面语言",
        engineMetric: "分析引擎",
        missionEyebrow: "为何创建",
        missionTitle: "引擎评估应当是解释的起点，而不是终点。",
        missionParagraphs: [
            "国际象棋引擎可以找出最强着法，但棋手仍需要理解局面发生了什么变化、某个决定为何重要，以及下一盘棋可以复用什么思路。",
            "NexoChess 将分析与训练连接起来，让复盘过的错误变成值得再次练习的局面，而不只是另一个红色数字。"
        ],
        principlesEyebrow: "项目原则",
        principlesTitle: "清晰的取舍贯穿 NexoChess 的每个部分",
        principles: [
            {
                title: "易于理解",
                description: "信息经过合理组织，让棋手能够跟随棋局，同时保留关键细节。"
            },
            {
                title: "真正有用",
                description: "每项工具都应帮助复盘决定、练习模式或重新回顾一堂课。"
            },
            {
                title: "便于使用",
                description: "NexoChess 可直接在浏览器中运行，支持明暗主题，并提供十一种语言。"
            },
            {
                title: "负责任",
                description: "安全、隐私、许可证与运行恢复能力都被视为产品要求。"
            }
        ],
        independenceEyebrow: "独立且开放",
        independenceTitle: "NexoChess 是独立项目",
        independenceDescription: "本应用独立开发，不隶属于任何第三方国际象棋平台，也未获得其赞助或背书。",
        independenceNote: "源代码依据 GPL-3.0 公开，许可证与署名信息可在应用及代码仓库中查阅。",
        sourceAction: "查看源代码与许可证",
        creatorEyebrow: "创建与维护者",
        creatorTitle: "Manuel García Villaescusa",
        creatorDescription: "NexoChess 作为独立项目持续开发，目标很简单：让严肃的棋局复盘更清晰、更实用，并服务更多棋手。",
        creatorLocation: "在西班牙开发",
        finalTitle: "这个项目从你的棋局开始",
        finalDescription: "带来一个你想弄懂的局面，用 NexoChess 将它转化为具体的学习收获。",
        finalPrimaryAction: "开始分析",
        finalSecondaryAction: "练习谜题"
    },
    vi: {
        eyebrow: "Giới thiệu NexoChess",
        title: "Được xây dựng để biến phân tích cờ vua thành việc học hữu ích.",
        introduction: "NexoChess là ứng dụng web miễn phí để xem lại ván đấu, hiểu sai lầm với Stockfish và luyện các mẫu thế thường xuất hiện trên bàn cờ.",
        primaryAction: "Phân tích một ván",
        secondaryAction: "Xem mã nguồn",
        identityLabel: "Dự án",
        identityTitle: "Một không gian thống nhất để xem lại, luyện tập và tiến bộ",
        identityDescription: "Phân tích, ván đã lưu, bài tập có mục tiêu và công cụ học tập cùng tạo nên trải nghiệm NexoChess rõ ràng, liền mạch.",
        freeLabel: "Sử dụng miễn phí",
        openSourceLabel: "Mã nguồn mở",
        independentLabel: "Độc lập",
        puzzleMetric: "bài tập có sẵn",
        languageMetric: "ngôn ngữ giao diện",
        engineMetric: "bộ máy phân tích",
        missionEyebrow: "Vì sao dự án tồn tại",
        missionTitle: "Điểm đánh giá của máy nên mở đầu lời giải thích, không phải kết thúc nó.",
        missionParagraphs: [
            "Máy cờ có thể tìm nước mạnh nhất, nhưng người chơi vẫn cần hiểu điều gì đã thay đổi, vì sao một quyết định quan trọng và ý tưởng nào có thể dùng ở ván tiếp theo.",
            "NexoChess nối phân tích với luyện tập để một sai lầm đã xem lại trở thành thế cờ đáng luyện lại, thay vì chỉ là một con số màu đỏ."
        ],
        principlesEyebrow: "Nguyên tắc dự án",
        principlesTitle: "Những lựa chọn rõ ràng định hướng mọi phần của NexoChess",
        principles: [
            {
                title: "Dễ hiểu",
                description: "Thông tin được sắp xếp để người chơi theo dõi ván đấu mà không mất các chi tiết quan trọng."
            },
            {
                title: "Hữu ích",
                description: "Mỗi công cụ phải giúp xem lại quyết định, luyện một mẫu thế hoặc quay lại bài học."
            },
            {
                title: "Dễ tiếp cận",
                description: "NexoChess chạy trên trình duyệt, hỗ trợ giao diện sáng và tối, đồng thời có mười một ngôn ngữ."
            },
            {
                title: "Có trách nhiệm",
                description: "Bảo mật, quyền riêng tư, giấy phép và khả năng khôi phục vận hành đều là yêu cầu của sản phẩm."
            }
        ],
        independenceEyebrow: "Độc lập và cởi mở",
        independenceTitle: "NexoChess là một dự án riêng",
        independenceDescription: "Ứng dụng được phát triển độc lập, không liên kết, được tài trợ hay được xác nhận bởi các nền tảng cờ vua bên thứ ba.",
        independenceNote: "Mã nguồn được công khai theo GPL-3.0; thông tin giấy phép và ghi công luôn có trong ứng dụng và kho mã.",
        sourceAction: "Xem mã nguồn và giấy phép",
        creatorEyebrow: "Được tạo và duy trì bởi",
        creatorTitle: "Manuel García Villaescusa",
        creatorDescription: "NexoChess được phát triển như một dự án độc lập với mục tiêu đơn giản: giúp việc xem lại ván cờ nghiêm túc trở nên rõ ràng, thực tế và đến được với nhiều người chơi hơn.",
        creatorLocation: "Phát triển tại Tây Ban Nha",
        finalTitle: "Dự án bắt đầu từ những ván cờ của bạn",
        finalDescription: "Hãy đưa vào một thế cờ bạn muốn hiểu và dùng NexoChess để biến nó thành một bài học cụ thể.",
        finalPrimaryAction: "Bắt đầu phân tích",
        finalSecondaryAction: "Luyện bài tập"
    },
    hi: {
        eyebrow: "NexoChess के बारे में",
        title: "शतरंज विश्लेषण को उपयोगी सीख में बदलने के लिए बनाया गया।",
        introduction: "NexoChess एक निःशुल्क वेब ऐप है, जहाँ आप बाज़ियों की समीक्षा कर सकते हैं, Stockfish की मदद से गलतियाँ समझ सकते हैं और बोर्ड पर आने वाले पैटर्न का अभ्यास कर सकते हैं।",
        primaryAction: "बाज़ी का विश्लेषण करें",
        secondaryAction: "स्रोत कोड देखें",
        identityLabel: "परियोजना",
        identityTitle: "समीक्षा, अभ्यास और सुधार के लिए एक जुड़ा हुआ स्थान",
        identityDescription: "विश्लेषण, सहेजी गई बाज़ियाँ, केंद्रित पज़ल और सीखने के साधन मिलकर एक स्पष्ट NexoChess अनुभव बनाते हैं।",
        freeLabel: "निःशुल्क उपयोग",
        openSourceLabel: "ओपन सोर्स",
        independentLabel: "स्वतंत्र",
        puzzleMetric: "उपलब्ध पज़ल",
        languageMetric: "इंटरफ़ेस भाषाएँ",
        engineMetric: "विश्लेषण इंजन",
        missionEyebrow: "यह क्यों बनाया गया",
        missionTitle: "इंजन का मूल्यांकन समझाने की शुरुआत होना चाहिए, अंत नहीं।",
        missionParagraphs: [
            "शतरंज इंजन सबसे मजबूत चाल खोज सकता है, लेकिन खिलाड़ी को फिर भी समझना होता है कि क्या बदला, कोई निर्णय क्यों महत्वपूर्ण था और अगली बाज़ी में कौन-सा विचार काम आ सकता है।",
            "NexoChess विश्लेषण और अभ्यास को जोड़ता है, ताकि समीक्षा की गई गलती सिर्फ एक और लाल संख्या न रहे, बल्कि दोबारा अभ्यास करने लायक स्थिति बने।"
        ],
        principlesEyebrow: "परियोजना के सिद्धांत",
        principlesTitle: "स्पष्ट निर्णय NexoChess के हर हिस्से का मार्गदर्शन करते हैं",
        principles: [
            {
                title: "समझने योग्य",
                description: "जानकारी इस तरह व्यवस्थित है कि खिलाड़ी महत्वपूर्ण विवरण खोए बिना बाज़ी का क्रम समझ सके।"
            },
            {
                title: "उपयोगी",
                description: "हर साधन किसी निर्णय की समीक्षा, पैटर्न के अभ्यास या सीखी बात पर लौटने में मदद करे।"
            },
            {
                title: "सुलभ",
                description: "NexoChess ब्राउज़र में चलता है, हल्की और गहरी थीम देता है और ग्यारह भाषाओं में उपलब्ध है।"
            },
            {
                title: "जिम्मेदार",
                description: "सुरक्षा, गोपनीयता, लाइसेंस और संचालन की पुनर्प्राप्ति को उत्पाद की आवश्यकताएँ माना जाता है।"
            }
        ],
        independenceEyebrow: "स्वतंत्र और खुला",
        independenceTitle: "NexoChess एक स्वतंत्र परियोजना है",
        independenceDescription: "यह ऐप स्वतंत्र रूप से विकसित किया गया है और किसी तीसरे पक्ष के शतरंज मंच से संबद्ध, प्रायोजित या समर्थित नहीं है।",
        independenceNote: "इसका स्रोत कोड GPL-3.0 के तहत सार्वजनिक है और लाइसेंस व श्रेय संबंधी जानकारी ऐप तथा रिपॉज़िटरी में उपलब्ध रहती है।",
        sourceAction: "स्रोत कोड और लाइसेंस देखें",
        creatorEyebrow: "निर्माता और अनुरक्षक",
        creatorTitle: "Manuel García Villaescusa",
        creatorDescription: "NexoChess एक स्वतंत्र परियोजना के रूप में एक सरल लक्ष्य के साथ विकसित किया जाता है: गंभीर बाज़ी समीक्षा को अधिक स्पष्ट, व्यावहारिक और अधिक खिलाड़ियों के लिए उपलब्ध बनाना।",
        creatorLocation: "स्पेन में विकसित",
        finalTitle: "यह परियोजना आपकी बाज़ियों से शुरू होती है",
        finalDescription: "जिस स्थिति को आप समझना चाहते हैं, उसे लाएँ और NexoChess के साथ उसे एक ठोस सीख में बदलें।",
        finalPrimaryAction: "विश्लेषण शुरू करें",
        finalSecondaryAction: "पज़ल अभ्यास करें"
    },
    mr: {
        eyebrow: "NexoChess विषयी",
        title: "बुद्धिबळ विश्लेषणाला उपयुक्त शिक्षणात बदलण्यासाठी तयार केलेले.",
        introduction: "NexoChess हे मोफत वेब अॅप आहे. त्यातून डावांचा आढावा घेता येतो, Stockfish च्या मदतीने चुका समजतात आणि पटावर दिसणाऱ्या नमुन्यांचा सराव करता येतो.",
        primaryAction: "डावाचे विश्लेषण करा",
        secondaryAction: "स्रोत कोड पाहा",
        identityLabel: "प्रकल्प",
        identityTitle: "आढावा, सराव आणि प्रगतीसाठी एकसंध जागा",
        identityDescription: "विश्लेषण, जतन केलेले डाव, लक्ष केंद्रित पझल आणि शिकण्याची साधने मिळून स्पष्ट NexoChess अनुभव तयार होतो.",
        freeLabel: "मोफत वापर",
        openSourceLabel: "मुक्त स्रोत",
        independentLabel: "स्वतंत्र",
        puzzleMetric: "उपलब्ध पझल",
        languageMetric: "इंटरफेस भाषा",
        engineMetric: "विश्लेषण इंजिन",
        missionEyebrow: "हा प्रकल्प का आहे",
        missionTitle: "इंजिनचे मूल्यमापन हे स्पष्टीकरणाची सुरुवात असावी, शेवट नाही.",
        missionParagraphs: [
            "बुद्धिबळ इंजिन सर्वोत्तम चाल शोधू शकते, पण खेळाडूला काय बदलले, एखादा निर्णय का महत्त्वाचा होता आणि पुढच्या डावात कोणती कल्पना वापरता येईल हे समजणे आवश्यक असते.",
            "NexoChess विश्लेषण आणि सराव जोडते, त्यामुळे पाहिलेली चूक फक्त आणखी एक लाल आकडा राहत नाही; ती पुन्हा सराव करण्याची स्थिती बनते."
        ],
        principlesEyebrow: "प्रकल्पाची तत्त्वे",
        principlesTitle: "स्पष्ट निर्णय NexoChess च्या प्रत्येक भागाला दिशा देतात",
        principles: [
            {
                title: "समजण्यास सोपे",
                description: "महत्त्वाचे तपशील न लपवता डावाचा क्रम समजेल अशा पद्धतीने माहिती मांडली जाते."
            },
            {
                title: "उपयुक्त",
                description: "प्रत्येक साधन निर्णयाचा आढावा, नमुन्याचा सराव किंवा शिकलेल्या धड्याकडे परतण्यास मदत करते."
            },
            {
                title: "सुलभ",
                description: "NexoChess ब्राउझरमध्ये चालते, उजळ आणि गडद थीम देते आणि अकरा भाषांमध्ये उपलब्ध आहे."
            },
            {
                title: "जबाबदार",
                description: "सुरक्षा, गोपनीयता, परवाने आणि कार्यपद्धतीची पुनर्प्राप्ती ही उत्पादनाची आवश्यकताच मानली जाते."
            }
        ],
        independenceEyebrow: "स्वतंत्र आणि खुले",
        independenceTitle: "NexoChess हा स्वतंत्र प्रकल्प आहे",
        independenceDescription: "हे अॅप स्वतंत्रपणे विकसित केले जाते आणि कोणत्याही तृतीय-पक्ष बुद्धिबळ मंचाशी संलग्न, प्रायोजित किंवा समर्थित नाही.",
        independenceNote: "याचा स्रोत कोड GPL-3.0 अंतर्गत सार्वजनिक आहे आणि परवाना व श्रेयाची माहिती अॅप व रिपॉझिटरीमध्ये उपलब्ध असते.",
        sourceAction: "स्रोत कोड आणि परवाने पाहा",
        creatorEyebrow: "निर्माता आणि देखभालकर्ता",
        creatorTitle: "Manuel García Villaescusa",
        creatorDescription: "NexoChess हा स्वतंत्र प्रकल्प एका सोप्या उद्देशाने विकसित केला जातो: गंभीर डाव-पुनरावलोकन अधिक स्पष्ट, व्यावहारिक आणि अधिक खेळाडूंना उपलब्ध करणे.",
        creatorLocation: "स्पेनमध्ये विकसित",
        finalTitle: "हा प्रकल्प तुमच्या डावांपासून सुरू होतो",
        finalDescription: "जी स्थिती समजून घ्यायची आहे ती आणा आणि NexoChess च्या मदतीने तिला ठोस धड्यात बदला.",
        finalPrimaryAction: "विश्लेषण सुरू करा",
        finalSecondaryAction: "पझल सोडवा"
    },
    pl: {
        eyebrow: "O NexoChess",
        title: "Stworzony, aby zamieniać analizę szachową w użyteczną naukę.",
        introduction: "NexoChess to bezpłatna aplikacja internetowa do przeglądania partii, rozumienia błędów z pomocą Stockfisha i ćwiczenia motywów pojawiających się na szachownicy.",
        primaryAction: "Przeanalizuj partię",
        secondaryAction: "Zobacz kod źródłowy",
        identityLabel: "Projekt",
        identityTitle: "Jedno spójne miejsce do analizy, ćwiczeń i rozwoju",
        identityDescription: "Analiza, zapisane partie, ukierunkowane zadania i narzędzia edukacyjne tworzą razem przejrzyste środowisko NexoChess.",
        freeLabel: "Bezpłatny",
        openSourceLabel: "Otwarte źródła",
        independentLabel: "Niezależny",
        puzzleMetric: "dostępnych zadań",
        languageMetric: "języków interfejsu",
        engineMetric: "silnik analizy",
        missionEyebrow: "Dlaczego powstał",
        missionTitle: "Ocena silnika powinna rozpoczynać wyjaśnienie, a nie je kończyć.",
        missionParagraphs: [
            "Silnik szachowy może znaleźć najsilniejszy ruch, ale gracz nadal musi zrozumieć, co się zmieniło, dlaczego decyzja była ważna i jaką ideę wykorzystać w następnej partii.",
            "NexoChess łączy analizę z treningiem, aby omówiony błąd stał się pozycją wartą ponownego przećwiczenia, a nie tylko kolejną czerwoną liczbą."
        ],
        principlesEyebrow: "Zasady projektu",
        principlesTitle: "Jasne decyzje kierują każdym elementem NexoChess",
        principles: [
            {
                title: "Zrozumiały",
                description: "Informacje są uporządkowane tak, aby śledzić partię bez ukrywania ważnych szczegółów."
            },
            {
                title: "Użyteczny",
                description: "Każde narzędzie ma pomagać przeanalizować decyzję, ćwiczyć motyw lub wrócić do lekcji."
            },
            {
                title: "Dostępny",
                description: "NexoChess działa w przeglądarce, obsługuje jasny i ciemny motyw oraz jest dostępny w jedenastu językach."
            },
            {
                title: "Odpowiedzialny",
                description: "Bezpieczeństwo, prywatność, licencje i odtwarzanie działania są traktowane jako wymagania produktu."
            }
        ],
        independenceEyebrow: "Niezależny i otwarty",
        independenceTitle: "NexoChess jest samodzielnym projektem",
        independenceDescription: "Aplikacja jest rozwijana niezależnie i nie jest powiązana, sponsorowana ani wspierana przez zewnętrzne platformy szachowe.",
        independenceNote: "Kod źródłowy jest publiczny na licencji GPL-3.0, a informacje o licencjach i atrybucjach są dostępne w aplikacji oraz repozytorium.",
        sourceAction: "Zobacz kod źródłowy i licencje",
        creatorEyebrow: "Twórca i opiekun",
        creatorTitle: "Manuel García Villaescusa",
        creatorDescription: "NexoChess jest rozwijany jako niezależny projekt z prostym celem: uczynić rzetelną analizę partii bardziej przejrzystą, praktyczną i dostępną dla większej liczby graczy.",
        creatorLocation: "Rozwijany w Hiszpanii",
        finalTitle: "Projekt zaczyna się od twoich partii",
        finalDescription: "Dodaj pozycję, którą chcesz zrozumieć, i zamień ją z NexoChess w konkretną lekcję.",
        finalPrimaryAction: "Rozpocznij analizę",
        finalSecondaryAction: "Trenuj zadania"
    }
};

export function getAboutCopy(language?: string | null): AboutCopy {
    const normalised = String(language || "en")
        .trim()
        .toLowerCase()
        .replace("_", "-")
        .split("-")[0];

    return copies[normalised] || copies.en;
}

export const ABOUT_COPY_LANGUAGES = Object.freeze(Object.keys(copies));
