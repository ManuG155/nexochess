export type SiteTourStepKey =
    | "logo"
    | "academy"
    | "lessons"
    | "analysis"
    | "engine"
    | "archive"
    | "statistics"
    | "puzzles"
    | "repertoire"
    | "support"
    | "settings"
    | "help"
    | "language"
    | "contact"
    | "consent"
    | "about"
    | "terms"
    | "privacy"
    | "source";

interface StepCopy {
    title: string;
    body: string;
}

export interface SiteTourCopy {
    open: string;
    close: string;
    kicker: string;
    back: string;
    next: string;
    finish: string;
    step: (current: number, total: number) => string;
    steps: Record<SiteTourStepKey, StepCopy>;
}

type StaticCopy = Omit<SiteTourCopy, "step"> & {
    stepLabel: string;
};

const en: StaticCopy = {
    open: "Open NexoChess tour",
    close: "Close tour",
    kicker: "NexoChess tour",
    back: "Back",
    next: "Next",
    finish: "Finish",
    stepLabel: "Step",
    steps: {
        logo: { title: "NexoChess", body: "The logo is your quick return to Analysis. The whole platform is organised around analysing, learning, training and measuring your chess." },
        academy: { title: "Academy", body: "Learn the foundations: notation, piece movement, values, move classifications, evaluation and short interactive challenges." },
        lessons: { title: "Lessons", body: "Follow a guided interactive path from fundamentals to stronger concepts. Lessons include playable exercises, and the Endgame Laboratory adds basic, intermediate and advanced endgames." },
        analysis: { title: "Analysis", body: "Import a game or position and review it with Stockfish 17. NexoChess classifies moves, estimates accuracy and performance, explains mistakes and lets you review the game move by move." },
        engine: { title: "Duel", body: "Choose a Stockfish level and your colour, then play a full game. You receive live move feedback and can analyse the finished game afterwards." },
        archive: { title: "Archive", body: "Your saved analysed games live here. Reopen previous reviews, keep useful games organised and return to them without importing them again." },
        statistics: { title: "Statistics", body: "See the bigger picture: accuracy trends, phases, openings, colour performance, puzzle rating, lessons, detected weaknesses and your training plan." },
        puzzles: { title: "Puzzles", body: "Build a practice session by theme and difficulty. You can use rated training, hints and solutions while NexoChess tracks your puzzle rating and progress." },
        repertoire: { title: "Repertoire", body: "Study and organise openings in an interactive repertoire. Explore branches, practise lines and build a personal opening map. Repertoire has its own dedicated tutorial inside." },
        support: { title: "Support NexoChess", body: "This optional link opens the NexoChess Ko-fi page. Supporting the project is voluntary; no chess feature is locked behind a donation." },
        settings: { title: "Settings", body: "Personalise the board, pieces, coordinates, coach, appearance and analysis behaviour. This is where NexoChess adapts to how you prefer to use it." },
        help: { title: "Help Center", body: "Open practical guides and troubleshooting without guessing how a feature works. Use it whenever you need a more detailed explanation than this tour." },
        language: { title: "Language", body: "Switch NexoChess between its supported languages. The interface, learning content and public pages follow your selected language." },
        contact: { title: "Contact", body: "Open a prepared message to contact@nexochess.com for questions, feedback or problems that need direct attention." },
        consent: { title: "Privacy choices", body: "Review or change your cookie and data-consent choices at any time. You do not need to hunt through browser settings to change them." },
        about: { title: "About NexoChess", body: "Read what the project is, why it exists and how the platform is intended to help players learn and improve." },
        terms: { title: "Terms of Service", body: "The terms explain the rules for using NexoChess, the service boundaries and the conditions that apply when you use the platform." },
        privacy: { title: "Privacy Policy", body: "See what data NexoChess uses, why it is needed, how it is handled and what privacy choices are available to you." },
        source: { title: "Open source", body: "NexoChess publishes its source and licence information here so you can inspect the project and understand the software it is built on." }
    }
};

const es: StaticCopy = {
    open: "Abrir tutorial de NexoChess",
    close: "Cerrar tutorial",
    kicker: "Tutorial de NexoChess",
    back: "Atrás",
    next: "Siguiente",
    finish: "Terminar",
    stepLabel: "Paso",
    steps: {
        logo: { title: "NexoChess", body: "El logo es el acceso rápido para volver a Análisis. Toda la plataforma gira alrededor de analizar, aprender, entrenar y medir tu ajedrez." },
        academy: { title: "Academia", body: "Aprende las bases: notación, movimiento de las piezas, valores, clasificaciones de jugadas, evaluación y pequeños retos interactivos." },
        lessons: { title: "Lecciones", body: "Sigue un recorrido interactivo guiado desde los fundamentos hasta conceptos más fuertes. Incluye ejercicios jugables y el Laboratorio de finales con niveles básico, intermedio y avanzado." },
        analysis: { title: "Análisis", body: "Importa una partida o posición y revísala con Stockfish 17. NexoChess clasifica jugadas, estima precisión y rendimiento, explica errores y permite revisar la partida movimiento a movimiento." },
        engine: { title: "Duelo", body: "Elige el nivel de Stockfish y tu color y juega una partida completa. Recibes feedback de tus jugadas en directo y puedes analizar la partida al terminar." },
        archive: { title: "Archivo", body: "Aquí quedan tus partidas analizadas guardadas. Puedes reabrir revisiones anteriores, conservar partidas útiles y volver a ellas sin importarlas otra vez." },
        statistics: { title: "Estadísticas", body: "Aquí ves la imagen completa: evolución de precisión, fases, aperturas, rendimiento por color, Elo de puzzles, lecciones, debilidades detectadas y tu plan de entrenamiento." },
        puzzles: { title: "Puzzles", body: "Monta una sesión por temática y dificultad. Puedes activar entrenamiento evaluado, pistas y solución mientras NexoChess registra tu Elo y progreso de puzzles." },
        repertoire: { title: "Repertorio", body: "Estudia y organiza aperturas en un repertorio interactivo. Explora variantes, practica líneas y construye tu propio mapa de aperturas. Dentro tiene su tutorial específico." },
        support: { title: "Apoyar NexoChess", body: "Este enlace opcional abre el Ko-fi de NexoChess. Apoyar el proyecto es totalmente voluntario; ninguna función de ajedrez está bloqueada por una donación." },
        settings: { title: "Ajustes", body: "Personaliza tablero, piezas, coordenadas, entrenador, apariencia y comportamiento del análisis. Aquí adaptas NexoChess a tu forma de usarlo." },
        help: { title: "Centro de ayuda", body: "Encontrarás guías prácticas y soluciones a problemas sin tener que adivinar cómo funciona una función. Úsalo cuando necesites más detalle que en este tutorial." },
        language: { title: "Idioma", body: "Cambia NexoChess entre los idiomas disponibles. La interfaz, el contenido formativo y las páginas públicas siguen el idioma que elijas." },
        contact: { title: "Contacto", body: "Abre un mensaje preparado para contact@nexochess.com si tienes preguntas, feedback o un problema que necesite atención directa." },
        consent: { title: "Opciones de privacidad", body: "Consulta o cambia en cualquier momento tus preferencias de cookies y consentimiento de datos. No necesitas buscar estas opciones en el navegador." },
        about: { title: "Sobre NexoChess", body: "Explica qué es el proyecto, por qué existe y cómo está pensada la plataforma para ayudar a aprender y mejorar." },
        terms: { title: "Términos y condiciones", body: "Aquí se explican las reglas de uso de NexoChess, los límites del servicio y las condiciones que se aplican al utilizar la plataforma." },
        privacy: { title: "Política de privacidad", body: "Consulta qué datos utiliza NexoChess, por qué son necesarios, cómo se gestionan y qué opciones de privacidad tienes." },
        source: { title: "Código abierto", body: "Aquí puedes consultar el código y la información de licencia de NexoChess para saber cómo está construido el proyecto." }
    }
};

const fr: StaticCopy = {
    open: "Ouvrir la visite NexoChess", close: "Fermer la visite", kicker: "Visite NexoChess", back: "Retour", next: "Suivant", finish: "Terminer", stepLabel: "Étape",
    steps: {
        logo: { title: "NexoChess", body: "Le logo permet de revenir rapidement à Analyse. La plateforme est organisée autour de l'analyse, de l'apprentissage, de l'entraînement et du suivi de votre jeu." },
        academy: { title: "Académie", body: "Apprenez les bases : notation, déplacement des pièces, valeurs, classification des coups, évaluation et petits défis interactifs." },
        lessons: { title: "Leçons", body: "Suivez un parcours interactif guidé, des bases aux notions plus avancées, avec exercices jouables et Laboratoire de finales du niveau débutant au niveau avancé." },
        analysis: { title: "Analyse", body: "Importez une partie ou une position et révisez-la avec Stockfish 17 : classification des coups, précision, performance, explication des erreurs et révision coup par coup." },
        engine: { title: "Duel", body: "Choisissez le niveau de Stockfish et votre couleur, jouez une partie complète, recevez un retour en direct puis analysez la partie terminée." },
        archive: { title: "Archive", body: "Retrouvez vos parties analysées enregistrées, rouvrez d'anciennes révisions et revenez-y sans devoir les importer de nouveau." },
        statistics: { title: "Statistiques", body: "Suivez précision, phases, ouvertures, résultats par couleur, Elo des puzzles, leçons, faiblesses détectées et plan d'entraînement." },
        puzzles: { title: "Puzzles", body: "Créez une séance par thème et difficulté, avec mode classé, indices et solution, pendant que NexoChess suit votre Elo et vos progrès." },
        repertoire: { title: "Répertoire", body: "Étudiez et organisez vos ouvertures, explorez les variantes et entraînez vos lignes. Le Répertoire possède son propre tutoriel détaillé." },
        support: { title: "Soutenir NexoChess", body: "Ce lien facultatif ouvre Ko-fi. Le soutien est volontaire et aucune fonction d'échecs n'est réservée aux donateurs." },
        settings: { title: "Paramètres", body: "Personnalisez l'échiquier, les pièces, les coordonnées, l'entraîneur, l'apparence et le comportement de l'analyse." },
        help: { title: "Centre d'aide", body: "Consultez des guides pratiques et le dépannage lorsque vous avez besoin de plus de détails que dans cette visite." },
        language: { title: "Langue", body: "Changez la langue de NexoChess. L'interface, le contenu pédagogique et les pages publiques suivent votre choix." },
        contact: { title: "Contact", body: "Ouvrez un message préparé vers contact@nexochess.com pour toute question, remarque ou problème." },
        consent: { title: "Choix de confidentialité", body: "Consultez ou modifiez à tout moment vos choix de cookies et de consentement aux données." },
        about: { title: "À propos", body: "Découvrez le projet NexoChess, sa raison d'être et la manière dont il vise à aider les joueurs à progresser." },
        terms: { title: "Conditions d'utilisation", body: "Les conditions expliquent les règles d'utilisation, les limites du service et les conditions applicables à la plateforme." },
        privacy: { title: "Politique de confidentialité", body: "Découvrez quelles données sont utilisées, pourquoi, comment elles sont traitées et quels choix de confidentialité sont disponibles." },
        source: { title: "Code source", body: "Consultez le code et les informations de licence de NexoChess afin de comprendre comment le projet est construit." }
    }
};

const de: StaticCopy = {
    open: "NexoChess-Tour öffnen", close: "Tour schließen", kicker: "NexoChess-Tour", back: "Zurück", next: "Weiter", finish: "Beenden", stepLabel: "Schritt",
    steps: {
        logo: { title: "NexoChess", body: "Über das Logo kommst du schnell zurück zur Analyse. Die Plattform verbindet Analyse, Lernen, Training und Fortschrittsmessung." },
        academy: { title: "Akademie", body: "Lerne die Grundlagen: Notation, Figurenbewegung, Werte, Zugklassifikationen, Bewertung und kurze interaktive Aufgaben." },
        lessons: { title: "Lektionen", body: "Folge einem geführten interaktiven Lernpfad von den Grundlagen bis zu stärkeren Konzepten, inklusive spielbarer Übungen und Endspiellabor." },
        analysis: { title: "Analyse", body: "Importiere eine Partie oder Stellung und prüfe sie mit Stockfish 17: Zugklassifikation, Genauigkeit, Leistung, Fehlererklärungen und Zug-für-Zug-Review." },
        engine: { title: "Duell", body: "Wähle Stockfish-Stärke und Farbe, spiele eine vollständige Partie, erhalte Live-Feedback und analysiere die Partie anschließend." },
        archive: { title: "Archiv", body: "Hier liegen gespeicherte Analysen. Öffne frühere Reviews erneut und kehre zu wichtigen Partien zurück, ohne sie neu zu importieren." },
        statistics: { title: "Statistiken", body: "Sieh Genauigkeitstrends, Spielphasen, Eröffnungen, Farbperformance, Puzzle-Elo, Lektionen, erkannte Schwächen und Trainingsplan." },
        puzzles: { title: "Puzzles", body: "Stelle Training nach Thema und Schwierigkeit zusammen. Bewertetes Training, Hinweise und Lösung sind verfügbar; NexoChess verfolgt Elo und Fortschritt." },
        repertoire: { title: "Repertoire", body: "Lerne und organisiere Eröffnungen, erkunde Varianten und trainiere Linien. Das Repertoire hat ein eigenes ausführliches Tutorial." },
        support: { title: "NexoChess unterstützen", body: "Der optionale Link öffnet Ko-fi. Unterstützung ist freiwillig; keine Schachfunktion ist an eine Spende gebunden." },
        settings: { title: "Einstellungen", body: "Passe Brett, Figuren, Koordinaten, Trainer, Darstellung und Analyseverhalten an deine Vorlieben an." },
        help: { title: "Hilfe-Center", body: "Hier findest du praktische Anleitungen und Problemlösungen, wenn diese kurze Tour nicht genug Details bietet." },
        language: { title: "Sprache", body: "Wechsle die Sprache von NexoChess. Oberfläche, Lerninhalte und öffentliche Seiten folgen deiner Auswahl." },
        contact: { title: "Kontakt", body: "Öffne eine vorbereitete Nachricht an contact@nexochess.com für Fragen, Feedback oder Probleme." },
        consent: { title: "Datenschutzoptionen", body: "Prüfe oder ändere jederzeit deine Cookie- und Dateneinwilligungen direkt in NexoChess." },
        about: { title: "Über NexoChess", body: "Erfahre, was das Projekt ist, warum es existiert und wie es Spielern beim Lernen und Verbessern helfen soll." },
        terms: { title: "Nutzungsbedingungen", body: "Hier stehen die Regeln der Nutzung, Grenzen des Dienstes und Bedingungen für die Verwendung von NexoChess." },
        privacy: { title: "Datenschutzerklärung", body: "Hier erfährst du, welche Daten genutzt werden, warum, wie sie behandelt werden und welche Datenschutzoptionen du hast." },
        source: { title: "Open Source", body: "Sieh dir Quellcode und Lizenzinformationen an und erfahre, wie NexoChess aufgebaut ist." }
    }
};

const pt: StaticCopy = {
    open: "Abrir guia do NexoChess", close: "Fechar guia", kicker: "Guia do NexoChess", back: "Voltar", next: "Seguinte", finish: "Terminar", stepLabel: "Passo",
    steps: {
        logo: { title: "NexoChess", body: "O logótipo é o atalho para voltar à Análise. A plataforma junta análise, aprendizagem, treino e medição do progresso." },
        academy: { title: "Academia", body: "Aprende as bases: notação, movimento das peças, valores, classificação de jogadas, avaliação e pequenos desafios interativos." },
        lessons: { title: "Lições", body: "Segue um percurso interativo guiado dos fundamentos a conceitos mais fortes, com exercícios jogáveis e Laboratório de finais básico, intermédio e avançado." },
        analysis: { title: "Análise", body: "Importa uma partida ou posição e revê-a com Stockfish 17: classificação de jogadas, precisão, desempenho, explicação de erros e revisão lance a lance." },
        engine: { title: "Duelo", body: "Escolhe o nível do Stockfish e a tua cor, joga uma partida completa, recebe feedback em direto e analisa a partida no fim." },
        archive: { title: "Arquivo", body: "Guarda e reabre partidas analisadas para voltares às revisões importantes sem teres de as importar novamente." },
        statistics: { title: "Estatísticas", body: "Consulta tendências de precisão, fases, aberturas, desempenho por cor, Elo de puzzles, lições, fraquezas e plano de treino." },
        puzzles: { title: "Puzzles", body: "Cria sessões por tema e dificuldade, com treino classificado, pistas e solução, enquanto o NexoChess acompanha o teu Elo e progresso." },
        repertoire: { title: "Repertório", body: "Estuda e organiza aberturas, explora variantes e pratica linhas. O Repertório tem o seu próprio tutorial detalhado." },
        support: { title: "Apoiar NexoChess", body: "Este link opcional abre o Ko-fi. O apoio é voluntário e nenhuma função de xadrez fica bloqueada por uma doação." },
        settings: { title: "Definições", body: "Personaliza tabuleiro, peças, coordenadas, treinador, aparência e comportamento da análise." },
        help: { title: "Centro de ajuda", body: "Consulta guias práticos e resolução de problemas quando precisares de mais detalhe do que neste guia." },
        language: { title: "Idioma", body: "Muda o idioma do NexoChess. A interface, o conteúdo de aprendizagem e as páginas públicas seguem a tua escolha." },
        contact: { title: "Contacto", body: "Abre uma mensagem preparada para contact@nexochess.com para perguntas, feedback ou problemas." },
        consent: { title: "Opções de privacidade", body: "Revê ou altera a qualquer momento as tuas escolhas de cookies e consentimento de dados." },
        about: { title: "Sobre o NexoChess", body: "Descobre o que é o projeto, porque existe e como foi pensado para ajudar jogadores a melhorar." },
        terms: { title: "Termos de serviço", body: "Os termos explicam regras de utilização, limites do serviço e condições aplicáveis ao uso do NexoChess." },
        privacy: { title: "Política de privacidade", body: "Consulta que dados são usados, porquê, como são tratados e que opções de privacidade tens." },
        source: { title: "Código aberto", body: "Consulta o código-fonte e a licença do NexoChess para perceber como o projeto é construído." }
    }
};

const ru: StaticCopy = {
    open: "Открыть обзор NexoChess", close: "Закрыть обзор", kicker: "Обзор NexoChess", back: "Назад", next: "Далее", finish: "Готово", stepLabel: "Шаг",
    steps: {
        logo: { title: "NexoChess", body: "Логотип быстро возвращает в раздел анализа. Платформа объединяет анализ, обучение, тренировку и отслеживание прогресса." },
        academy: { title: "Академия", body: "Изучайте основы: нотацию, ходы фигур, ценность фигур, классификацию ходов, оценку позиции и короткие интерактивные задания." },
        lessons: { title: "Уроки", body: "Проходите интерактивный путь от основ к более сильным темам, выполняйте упражнения и тренируйте базовые, средние и продвинутые эндшпили." },
        analysis: { title: "Анализ", body: "Импортируйте партию или позицию и проверяйте её Stockfish 17: классификация ходов, точность, оценка силы игры, объяснение ошибок и пошаговый разбор." },
        engine: { title: "Дуэль", body: "Выберите силу Stockfish и цвет, сыграйте полную партию, получайте обратную связь по ходам и затем анализируйте результат." },
        archive: { title: "Архив", body: "Здесь хранятся сохранённые разборы. Открывайте старые партии снова без повторного импорта." },
        statistics: { title: "Статистика", body: "Смотрите динамику точности, стадии игры, дебюты, результаты за цвета, рейтинг задач, уроки, найденные слабости и план тренировки." },
        puzzles: { title: "Задачи", body: "Настраивайте тренировку по теме и сложности, используйте рейтинговый режим, подсказки и решение, а NexoChess отслеживает рейтинг и прогресс." },
        repertoire: { title: "Репертуар", body: "Изучайте и организуйте дебюты, просматривайте варианты и тренируйте линии. Внутри Репертуара есть отдельный подробный учебник." },
        support: { title: "Поддержать NexoChess", body: "Необязательная ссылка ведёт на Ko-fi. Поддержка добровольна, никакие шахматные функции не требуют пожертвования." },
        settings: { title: "Настройки", body: "Настройте доску, фигуры, координаты, тренера, внешний вид и параметры анализа под себя." },
        help: { title: "Центр помощи", body: "Здесь есть практические инструкции и решения проблем, если краткого обзора недостаточно." },
        language: { title: "Язык", body: "Меняйте язык NexoChess. Интерфейс, учебный контент и публичные страницы используют выбранный язык." },
        contact: { title: "Связаться", body: "Откройте подготовленное письмо на contact@nexochess.com для вопросов, отзывов или сообщений о проблемах." },
        consent: { title: "Настройки приватности", body: "В любой момент просматривайте и изменяйте согласия на cookies и обработку данных." },
        about: { title: "О NexoChess", body: "Узнайте, что представляет собой проект, зачем он создан и как помогает шахматистам развиваться." },
        terms: { title: "Условия использования", body: "Здесь описаны правила использования NexoChess, границы сервиса и применимые условия." },
        privacy: { title: "Политика конфиденциальности", body: "Узнайте, какие данные используются, зачем, как они обрабатываются и какие настройки приватности доступны." },
        source: { title: "Открытый код", body: "Просмотрите исходный код и сведения о лицензии, чтобы понять, как устроен NexoChess." }
    }
};

const zh: StaticCopy = {
    open: "打开 NexoChess 导览", close: "关闭导览", kicker: "NexoChess 导览", back: "上一步", next: "下一步", finish: "完成", stepLabel: "步骤",
    steps: {
        logo: { title: "NexoChess", body: "点击标志可快速返回分析。整个平台围绕对局分析、学习、训练和进步统计展开。" },
        academy: { title: "学院", body: "学习基础内容：记谱、棋子走法、子力价值、着法分类、局面评估以及简短的互动挑战。" },
        lessons: { title: "课程", body: "按照互动学习路径从基础逐步进阶，完成可操作练习，并在残局实验室训练基础、中级和高级残局。" },
        analysis: { title: "分析", body: "导入对局或局面并使用 Stockfish 17 复盘。NexoChess 会分类着法、估算准确率和表现、解释错误并逐步复盘。" },
        engine: { title: "对战", body: "选择 Stockfish 强度和执棋颜色，完成一盘对局，实时获得着法反馈，并可在结束后直接分析。" },
        archive: { title: "档案", body: "保存并重新打开已分析的对局，无需再次导入就能回到重要复盘。" },
        statistics: { title: "统计", body: "查看准确率趋势、各阶段表现、开局、执白执黑表现、题目等级分、课程、弱点和训练计划。" },
        puzzles: { title: "战术题", body: "按主题和难度创建训练，使用计分模式、提示和答案，同时让 NexoChess 记录题目等级分与进度。" },
        repertoire: { title: "开局库", body: "学习并整理开局，浏览分支并训练线路。开局库内部有独立的详细教程。" },
        support: { title: "支持 NexoChess", body: "此可选链接会打开 Ko-fi。支持完全自愿，任何棋类功能都不会因未捐赠而被锁定。" },
        settings: { title: "设置", body: "自定义棋盘、棋子、坐标、教练、外观以及分析行为。" },
        help: { title: "帮助中心", body: "当本导览不够详细时，可在这里查看实用指南和故障排除。" },
        language: { title: "语言", body: "切换 NexoChess 的语言。界面、学习内容和公开页面都会使用你选择的语言。" },
        contact: { title: "联系", body: "为问题、反馈或故障打开一封预先填写到 contact@nexochess.com 的邮件。" },
        consent: { title: "隐私选择", body: "你可以随时查看或修改 Cookie 和数据同意选项。" },
        about: { title: "关于 NexoChess", body: "了解项目是什么、为什么存在，以及它如何帮助棋手学习和提高。" },
        terms: { title: "服务条款", body: "查看使用 NexoChess 的规则、服务边界和适用条件。" },
        privacy: { title: "隐私政策", body: "了解 NexoChess 使用哪些数据、为什么需要、如何处理以及你有哪些隐私选择。" },
        source: { title: "开源", body: "查看 NexoChess 的源代码和许可证信息，了解项目是如何构建的。" }
    }
};

const vi: StaticCopy = {
    open: "Mở hướng dẫn NexoChess", close: "Đóng hướng dẫn", kicker: "Hướng dẫn NexoChess", back: "Quay lại", next: "Tiếp", finish: "Hoàn tất", stepLabel: "Bước",
    steps: {
        logo: { title: "NexoChess", body: "Logo là lối tắt quay về Phân tích. Toàn bộ nền tảng xoay quanh phân tích, học, luyện tập và đo tiến bộ cờ vua." },
        academy: { title: "Học viện", body: "Học nền tảng: ký hiệu, cách đi quân, giá trị quân, phân loại nước đi, đánh giá thế cờ và các thử thách tương tác ngắn." },
        lessons: { title: "Bài học", body: "Theo lộ trình tương tác từ cơ bản đến nâng cao, với bài tập có thể chơi và Phòng thí nghiệm tàn cuộc ở nhiều cấp độ." },
        analysis: { title: "Phân tích", body: "Nhập ván cờ hoặc thế cờ và xem lại bằng Stockfish 17: phân loại nước đi, độ chính xác, hiệu suất, giải thích sai lầm và duyệt từng nước." },
        engine: { title: "Đấu máy", body: "Chọn cấp độ Stockfish và màu quân, chơi trọn ván, nhận phản hồi trực tiếp rồi phân tích ván cờ sau khi kết thúc." },
        archive: { title: "Lưu trữ", body: "Lưu và mở lại các ván đã phân tích để quay về các lần xem lại quan trọng mà không cần nhập lại." },
        statistics: { title: "Thống kê", body: "Xem xu hướng độ chính xác, giai đoạn ván cờ, khai cuộc, hiệu suất theo màu, Elo puzzle, bài học, điểm yếu và kế hoạch luyện tập." },
        puzzles: { title: "Puzzle", body: "Tạo buổi luyện theo chủ đề và độ khó, dùng chế độ tính điểm, gợi ý và lời giải trong khi NexoChess theo dõi Elo và tiến độ." },
        repertoire: { title: "Khai cuộc", body: "Học và tổ chức khai cuộc, khám phá nhánh và luyện các biến. Repertoire có hướng dẫn riêng ở bên trong." },
        support: { title: "Ủng hộ NexoChess", body: "Liên kết tùy chọn này mở Ko-fi. Việc ủng hộ là tự nguyện; không có tính năng cờ vua nào bị khóa vì không quyên góp." },
        settings: { title: "Cài đặt", body: "Tùy chỉnh bàn cờ, quân cờ, tọa độ, huấn luyện viên, giao diện và cách hoạt động của phân tích." },
        help: { title: "Trung tâm trợ giúp", body: "Xem hướng dẫn thực tế và xử lý sự cố khi bạn cần chi tiết hơn phần giới thiệu ngắn này." },
        language: { title: "Ngôn ngữ", body: "Đổi ngôn ngữ NexoChess. Giao diện, nội dung học và các trang công khai sẽ theo lựa chọn của bạn." },
        contact: { title: "Liên hệ", body: "Mở email đã chuẩn bị tới contact@nexochess.com cho câu hỏi, phản hồi hoặc sự cố." },
        consent: { title: "Lựa chọn riêng tư", body: "Xem hoặc thay đổi bất cứ lúc nào lựa chọn cookie và đồng ý dữ liệu của bạn." },
        about: { title: "Giới thiệu NexoChess", body: "Tìm hiểu dự án là gì, vì sao tồn tại và cách nền tảng giúp người chơi học và tiến bộ." },
        terms: { title: "Điều khoản sử dụng", body: "Đọc quy tắc sử dụng NexoChess, giới hạn dịch vụ và các điều kiện áp dụng." },
        privacy: { title: "Chính sách riêng tư", body: "Xem dữ liệu nào được dùng, vì sao cần, cách xử lý và các lựa chọn quyền riêng tư của bạn." },
        source: { title: "Mã nguồn mở", body: "Xem mã nguồn và thông tin giấy phép để hiểu NexoChess được xây dựng như thế nào." }
    }
};

const hi: StaticCopy = {
    open: "NexoChess टूर खोलें", close: "टूर बंद करें", kicker: "NexoChess टूर", back: "पीछे", next: "आगे", finish: "समाप्त", stepLabel: "चरण",
    steps: {
        logo: { title: "NexoChess", body: "लोगो से आप जल्दी विश्लेषण पर लौटते हैं। पूरा प्लेटफ़ॉर्म विश्लेषण, सीखने, अभ्यास और प्रगति मापने के लिए बना है।" },
        academy: { title: "अकादमी", body: "बुनियाद सीखें: नोटेशन, मोहरों की चाल, मूल्य, चाल वर्गीकरण, स्थिति मूल्यांकन और छोटे इंटरैक्टिव अभ्यास।" },
        lessons: { title: "पाठ", body: "बुनियादी से मजबूत अवधारणाओं तक निर्देशित इंटरैक्टिव मार्ग पर चलें, खेलने योग्य अभ्यास और अलग-अलग स्तरों का एंडगेम लैब शामिल है।" },
        analysis: { title: "विश्लेषण", body: "गेम या पोज़िशन आयात करें और Stockfish 17 से समीक्षा करें: चाल वर्गीकरण, सटीकता, प्रदर्शन, गलती की व्याख्या और चाल-दर-चाल समीक्षा।" },
        engine: { title: "द्वंद्व", body: "Stockfish का स्तर और अपना रंग चुनें, पूरी बाज़ी खेलें, लाइव फीडबैक लें और बाद में बाज़ी का विश्लेषण करें।" },
        archive: { title: "अभिलेख", body: "विश्लेषित बाज़ियों को सहेजें और दोबारा खोलें ताकि महत्वपूर्ण समीक्षा फिर से आयात किए बिना देख सकें।" },
        statistics: { title: "आँकड़े", body: "सटीकता रुझान, चरण, ओपनिंग, रंग के अनुसार प्रदर्शन, puzzle Elo, पाठ, पहचानी गई कमजोरियाँ और प्रशिक्षण योजना देखें।" },
        puzzles: { title: "पज़ल", body: "थीम और कठिनाई से अभ्यास सत्र बनाएं; रेटेड मोड, संकेत और समाधान के साथ NexoChess Elo और प्रगति ट्रैक करता है।" },
        repertoire: { title: "रेपर्टोयर", body: "ओपनिंग सीखें और व्यवस्थित करें, शाखाएँ देखें और लाइनें अभ्यास करें। इसके अंदर अपना विस्तृत ट्यूटोरियल है।" },
        support: { title: "NexoChess का समर्थन", body: "यह वैकल्पिक लिंक Ko-fi खोलता है। समर्थन स्वैच्छिक है; कोई शतरंज सुविधा दान के पीछे बंद नहीं है।" },
        settings: { title: "सेटिंग्स", body: "बोर्ड, मोहरे, निर्देशांक, कोच, रूप और विश्लेषण व्यवहार को अपनी पसंद के अनुसार बदलें।" },
        help: { title: "सहायता केंद्र", body: "जब इस छोटे टूर से अधिक जानकारी चाहिए, व्यावहारिक गाइड और समस्या समाधान यहां मिलते हैं।" },
        language: { title: "भाषा", body: "NexoChess की भाषा बदलें। इंटरफ़ेस, सीखने की सामग्री और सार्वजनिक पेज आपकी चुनी भाषा का पालन करते हैं।" },
        contact: { title: "संपर्क", body: "प्रश्न, प्रतिक्रिया या समस्या के लिए contact@nexochess.com पर तैयार ईमेल खोलें।" },
        consent: { title: "गोपनीयता विकल्प", body: "कुकी और डेटा सहमति विकल्प कभी भी देखें या बदलें।" },
        about: { title: "NexoChess के बारे में", body: "जानें कि परियोजना क्या है, क्यों बनी है और खिलाड़ियों को सीखने व सुधारने में कैसे मदद करती है।" },
        terms: { title: "सेवा की शर्तें", body: "NexoChess उपयोग के नियम, सेवा की सीमाएँ और लागू शर्तें यहां समझाई गई हैं।" },
        privacy: { title: "गोपनीयता नीति", body: "देखें कौन-सा डेटा उपयोग होता है, क्यों, कैसे संभाला जाता है और आपके पास कौन-से गोपनीयता विकल्प हैं।" },
        source: { title: "ओपन सोर्स", body: "NexoChess का स्रोत और लाइसेंस जानकारी देखें और समझें कि परियोजना कैसे बनाई गई है।" }
    }
};

const mr: StaticCopy = {
    open: "NexoChess फेरफटका उघडा", close: "फेरफटका बंद करा", kicker: "NexoChess फेरफटका", back: "मागे", next: "पुढे", finish: "पूर्ण", stepLabel: "पायरी",
    steps: {
        logo: { title: "NexoChess", body: "लोगोमधून विश्लेषण विभागात पटकन परत जाता येते. संपूर्ण प्लॅटफॉर्म विश्लेषण, शिकणे, सराव आणि प्रगती मोजणे याभोवती बांधलेला आहे." },
        academy: { title: "अकादमी", body: "मूलभूत गोष्टी शिका: नोटेशन, मोहर्‍यांच्या चाली, मूल्ये, चाल वर्गीकरण, स्थितीचे मूल्यमापन आणि छोटे परस्परसंवादी सराव." },
        lessons: { title: "धडे", body: "मूलभूत ते प्रगत संकल्पनांपर्यंत मार्गदर्शित सराव करा; खेळता येणारे व्यायाम आणि विविध स्तरांचे एंडगेम लॅब यात आहेत." },
        analysis: { title: "विश्लेषण", body: "डाव किंवा स्थिती आयात करून Stockfish 17 ने तपासा: चाल वर्गीकरण, अचूकता, कामगिरी, चुका समजावणे आणि प्रत्येक चालीनुसार पुनरावलोकन." },
        engine: { title: "द्वंद्व", body: "Stockfish ची ताकद आणि रंग निवडा, पूर्ण डाव खेळा, थेट फीडबॅक घ्या आणि नंतर डावाचे विश्लेषण करा." },
        archive: { title: "संग्रह", body: "विश्लेषित डाव जतन करा आणि पुन्हा उघडा, त्यामुळे महत्त्वाचे पुनरावलोकन पुन्हा आयात न करता पाहता येते." },
        statistics: { title: "आकडेवारी", body: "अचूकतेची प्रवृत्ती, टप्पे, ओपनिंग, रंगानुसार कामगिरी, puzzle Elo, धडे, आढळलेल्या कमकुवत बाजू आणि प्रशिक्षण योजना पाहा." },
        puzzles: { title: "पझल", body: "विषय आणि अवघडपणानुसार सराव तयार करा; रेटेड मोड, सूचना आणि उत्तरांसह NexoChess Elo व प्रगती नोंदवतो." },
        repertoire: { title: "रेपर्टोयर", body: "ओपनिंग शिका व मांडून ठेवा, फांद्या पाहा आणि लाईन्सचा सराव करा. यासाठी आत स्वतंत्र सविस्तर ट्यूटोरियल आहे." },
        support: { title: "NexoChess ला पाठिंबा", body: "हा ऐच्छिक दुवा Ko-fi उघडतो. पाठिंबा पूर्णपणे स्वेच्छेचा आहे; कोणतेही बुद्धिबळ फिचर देणगीमागे बंद नाही." },
        settings: { title: "सेटिंग्ज", body: "बोर्ड, मोहरे, निर्देशांक, प्रशिक्षक, स्वरूप आणि विश्लेषण वर्तन आपल्या आवडीनुसार बदला." },
        help: { title: "मदत केंद्र", body: "या छोट्या फेरफटक्यापेक्षा अधिक माहिती हवी असल्यास येथे मार्गदर्शक आणि समस्या सोडवण्याची माहिती मिळते." },
        language: { title: "भाषा", body: "NexoChess ची भाषा बदला. इंटरफेस, शिक्षण सामग्री आणि सार्वजनिक पाने निवडलेल्या भाषेनुसार बदलतात." },
        contact: { title: "संपर्क", body: "प्रश्न, अभिप्राय किंवा अडचणीसाठी contact@nexochess.com वर तयार ईमेल उघडा." },
        consent: { title: "गोपनीयता पर्याय", body: "कुकी आणि डेटा संमतीचे पर्याय कधीही पाहा किंवा बदला." },
        about: { title: "NexoChess बद्दल", body: "हा प्रकल्प काय आहे, का तयार केला आहे आणि खेळाडूंना सुधारण्यात कसा मदत करतो ते जाणून घ्या." },
        terms: { title: "सेवा अटी", body: "NexoChess वापरण्याचे नियम, सेवेच्या मर्यादा आणि लागू अटी येथे दिल्या आहेत." },
        privacy: { title: "गोपनीयता धोरण", body: "कोणता डेटा वापरला जातो, का, कसा हाताळला जातो आणि तुमचे गोपनीयता पर्याय कोणते आहेत ते पाहा." },
        source: { title: "मुक्त स्रोत", body: "NexoChess चा स्रोतकोड आणि परवाना माहिती पाहून प्रकल्प कसा तयार केला आहे ते समजा." }
    }
};

const pl: StaticCopy = {
    open: "Otwórz przewodnik NexoChess", close: "Zamknij przewodnik", kicker: "Przewodnik NexoChess", back: "Wstecz", next: "Dalej", finish: "Zakończ", stepLabel: "Krok",
    steps: {
        logo: { title: "NexoChess", body: "Logo szybko przenosi z powrotem do Analizy. Cała platforma łączy analizę, naukę, trening i mierzenie postępów." },
        academy: { title: "Akademia", body: "Poznaj podstawy: notację, ruchy figur, wartości, klasyfikacje ruchów, ocenę pozycji i krótkie interaktywne zadania." },
        lessons: { title: "Lekcje", body: "Przejdź prowadzoną ścieżkę od podstaw do mocniejszych koncepcji, z ćwiczeniami do rozegrania i Laboratorium końcówek na kilku poziomach." },
        analysis: { title: "Analiza", body: "Importuj partię lub pozycję i sprawdzaj ją Stockfishem 17: klasyfikacja ruchów, dokładność, wynik gry, wyjaśnienia błędów i przegląd ruch po ruchu." },
        engine: { title: "Pojedynek", body: "Wybierz siłę Stockfisha i kolor, rozegraj pełną partię, otrzymuj informacje zwrotne na żywo i przeanalizuj partię po zakończeniu." },
        archive: { title: "Archiwum", body: "Zapisuj i ponownie otwieraj przeanalizowane partie, aby wracać do ważnych analiz bez ponownego importowania." },
        statistics: { title: "Statystyki", body: "Śledź trendy dokładności, fazy gry, debiuty, wyniki kolorami, ranking zadań, lekcje, wykryte słabości i plan treningowy." },
        puzzles: { title: "Zadania", body: "Twórz trening według motywu i trudności, używaj trybu rankingowego, podpowiedzi i rozwiązania, a NexoChess śledzi Elo i postęp." },
        repertoire: { title: "Repertuar", body: "Ucz się i porządkuj debiuty, przeglądaj warianty i ćwicz linie. Repertuar ma własny szczegółowy samouczek." },
        support: { title: "Wesprzyj NexoChess", body: "Ten opcjonalny link otwiera Ko-fi. Wsparcie jest dobrowolne; żadna funkcja szachowa nie jest blokowana za darowizną." },
        settings: { title: "Ustawienia", body: "Dostosuj szachownicę, figury, współrzędne, trenera, wygląd i działanie analizy." },
        help: { title: "Centrum pomocy", body: "Znajdziesz tu praktyczne poradniki i rozwiązywanie problemów, gdy ten krótki przewodnik nie wystarcza." },
        language: { title: "Język", body: "Zmień język NexoChess. Interfejs, treści edukacyjne i strony publiczne używają wybranego języka." },
        contact: { title: "Kontakt", body: "Otwórz przygotowaną wiadomość do contact@nexochess.com w sprawie pytań, opinii lub problemów." },
        consent: { title: "Opcje prywatności", body: "W każdej chwili sprawdź lub zmień ustawienia plików cookie i zgód dotyczących danych." },
        about: { title: "O NexoChess", body: "Dowiedz się, czym jest projekt, dlaczego powstał i jak ma pomagać graczom w nauce i rozwoju." },
        terms: { title: "Warunki korzystania", body: "Warunki opisują zasady używania NexoChess, granice usługi i obowiązujące zasady." },
        privacy: { title: "Polityka prywatności", body: "Sprawdź, jakie dane są używane, dlaczego, jak są przetwarzane i jakie masz opcje prywatności." },
        source: { title: "Open source", body: "Zobacz kod źródłowy i informacje o licencji NexoChess, aby zrozumieć, jak projekt jest zbudowany." }
    }
};

const copies: Record<string, StaticCopy> = { en, es, fr, de, pt, ru, zh, vi, hi, mr, pl };

export function getSiteTourCopy(language?: string): SiteTourCopy {
    const code = (language || "en").toLowerCase().split("-")[0];
    const selected = copies[code] || en;
    return {
        ...selected,
        step: (current, total) => `${selected.stepLabel} ${current} / ${total}`
    };
}
