import type { SupportedLanguage } from "@/i18n/routing";

export const V1_4_RELEASE_VERSION = "v1.4";
export const V1_4_RELEASE_NOTE_STORAGE_KEY = "nexochess.release-note.v1.4.seen";
export const V1_4_RELEASE_NOTE_ENDPOINT = "/api/account/release-notes/v1.4";

// Keep the notice available through 27 August 2026 at 23:59 in mainland
// Spain (CEST), then remove it automatically before 28 August begins.
export const V1_4_RELEASE_NOTE_CUTOFF = "2026-08-27T21:59:59.999Z";

export interface ReleaseNoteV1_4Copy {
    title: string;
    intro: string;
    changes: readonly string[];
    closing: string;
    confirm: string;
    close: string;
}

export const V1_4_RELEASE_NOTE_COPY: Record<SupportedLanguage, ReleaseNoteV1_4Copy> = {
    en: {
        title: "What's new in NexoChess 1.4",
        intro: "NexoChess 1.4 connects analysis, history and training much more tightly, while adding new ways to study endgames and understand the whole platform.",
        changes: [
            "Statistics is now a full section with filters for recent games and time periods, accuracy trends, White/Black comparison, errors by phase, opening performance, puzzle and training data, plus a gallery of every brilliant move that jumps back to the exact game position.",
            "Archive can turn repeated mistakes into an automatic training plan, while every analysed game now has Conclusions with a decisive moment, the most important pattern and a concrete recommendation linked to the relevant position.",
            "The new Endgame Laboratory inside Lessons covers fundamental, intermediate and advanced endings with 72 starting positions, exact tablebase feedback for positions of up to seven pieces, custom FEN loading, hints, retry after losing the theoretical result and persistent mastery by topic.",
            "Repertoire has been rebuilt around a fast compact decision tree with move popularity, transpositions, search, fullscreen study, semantic zoom and progressive expansion instead of extremely long branches.",
            "Analysis feedback is stricter and more coherent: tactical buttons follow the engine line, coach explanations avoid misleading sequences, and Brilliant is reserved for genuine sound sacrifices or exceptional drawing resources. Ordinary pawn sacrifices are not Brilliant.",
            "Puzzles is now focused on thematic practice with a cleaner setup and filters, while several Analysis controls and loading paths were simplified to keep the experience responsive.",
            "A new optional NexoChess tutorial explains the purpose of the main sections and controls without forcing you to enter them. The ? launcher stays fixed and only highlights the element being explained."
        ],
        closing: "Thanks for using NexoChess. This release is focused on helping every analysed game become useful training.",
        confirm: "Got it",
        close: "Close"
    },
    es: {
        title: "Novedades de NexoChess 1.4",
        intro: "NexoChess 1.4 conecta mucho mejor el análisis, el historial y el entrenamiento, y añade nuevas formas de estudiar finales y entender toda la plataforma.",
        changes: [
            "Estadísticas es ahora una sección completa con filtros por partidas recientes y periodos, evolución de precisión, comparación blancas/negras, errores por fase, rendimiento por apertura, datos de puzzles y entrenamiento, y una galería de todos tus brillantes que vuelve a la posición exacta de la partida.",
            "Archivo puede convertir errores repetidos en un plan de entrenamiento automático, y cada partida analizada incorpora Conclusiones con el momento decisivo, el patrón más importante y una recomendación concreta enlazada a la posición correspondiente.",
            "El nuevo Laboratorio de finales dentro de Lecciones cubre finales fundamentales, intermedios y avanzados con 72 posiciones iniciales, feedback exacto mediante tablebases hasta siete piezas, carga de FEN, pistas, reintento tras perder el resultado teórico y dominio persistente por temática.",
            "Repertorio se ha reconstruido alrededor de un árbol de decisiones rápido y compacto con popularidad de jugadas, transposiciones, búsqueda, pantalla completa, zoom semántico y expansión progresiva en lugar de ramas kilométricas.",
            "El feedback del Análisis es más estricto y coherente: los botones tácticos siguen la variante del motor, el entrenador evita secuencias engañosas y Brillante queda reservado para sacrificios reales y correctos o recursos excepcionales que salvan tablas. Los sacrificios normales de peón no son Brillantes.",
            "Puzzles queda centrado en práctica temática con una configuración y filtros más limpios, y se han simplificado varios controles y rutas de carga del Análisis para mantener una experiencia ágil.",
            "Un nuevo tutorial opcional explica para qué sirve cada sección y los controles principales sin obligarte a entrar en ellos. El ? permanece fijo y solo se encuadra el elemento que se está explicando."
        ],
        closing: "Gracias por usar NexoChess. Esta versión está pensada para que cada partida analizada termine convirtiéndose en entrenamiento útil.",
        confirm: "Vale",
        close: "Cerrar"
    },
    fr: {
        title: "Nouveautés de NexoChess 1.4",
        intro: "NexoChess 1.4 relie beaucoup mieux l'analyse, l'historique et l'entraînement, tout en ajoutant de nouvelles façons d'étudier les finales et de comprendre la plateforme.",
        changes: [
            "Statistiques devient une section complète avec filtres par parties récentes et périodes, évolution de la précision, comparaison Blancs/Noirs, erreurs par phase, résultats d'ouverture, données de puzzles et d'entraînement, ainsi qu'une galerie de tous les coups brillants reliée à la position exacte.",
            "Les Archives peuvent transformer les erreurs répétées en plan d'entraînement automatique, et chaque partie analysée possède désormais des Conclusions avec le moment décisif, le motif principal et une recommandation concrète liée à la position concernée.",
            "Le nouveau Laboratoire de finales dans Leçons couvre les finales fondamentales, intermédiaires et avancées avec 72 positions, un retour exact par tablebases jusqu'à sept pièces, le chargement FEN, des indices, la reprise après perte du résultat théorique et une maîtrise persistante par thème.",
            "Le Répertoire a été reconstruit autour d'un arbre de décisions rapide et compact avec popularité des coups, transpositions, recherche, plein écran, zoom sémantique et développement progressif des branches.",
            "Le retour d'Analyse est plus strict et cohérent : les boutons tactiques suivent la variante moteur, le coach évite les séquences trompeuses et Brilliant est réservé aux vrais sacrifices corrects ou aux ressources exceptionnelles qui sauvent la nulle. Les sacrifices ordinaires de pion ne sont pas Brilliant.",
            "Puzzles se concentre désormais sur l'entraînement thématique avec une configuration plus claire, tandis que plusieurs contrôles et chemins de chargement d'Analyse ont été simplifiés pour préserver la réactivité.",
            "Un nouveau tutoriel facultatif explique le rôle des principales sections et commandes sans vous obliger à y entrer. Le bouton ? reste fixe et seul l'élément expliqué est mis en évidence."
        ],
        closing: "Merci d'utiliser NexoChess. Cette version cherche à transformer chaque partie analysée en entraînement utile.",
        confirm: "Compris",
        close: "Fermer"
    },
    de: {
        title: "Neu in NexoChess 1.4",
        intro: "NexoChess 1.4 verbindet Analyse, Verlauf und Training deutlich enger und ergänzt neue Möglichkeiten, Endspiele und die gesamte Plattform zu verstehen.",
        changes: [
            "Statistiken ist jetzt ein eigener Bereich mit Filtern für letzte Partien und Zeiträume, Genauigkeitsverlauf, Weiß/Schwarz-Vergleich, Fehlern nach Partiephase, Eröffnungsleistung, Puzzle- und Trainingsdaten sowie einer Galerie aller brillanten Züge mit Sprung zur exakten Stellung.",
            "Das Archiv kann wiederkehrende Fehler in einen automatischen Trainingsplan umwandeln. Jede analysierte Partie enthält außerdem Schlussfolgerungen mit Wendepunkt, wichtigstem Muster und konkreter Empfehlung zur entsprechenden Stellung.",
            "Das neue Endspiel-Labor in Lektionen deckt grundlegende, mittlere und fortgeschrittene Endspiele mit 72 Startstellungen ab, bietet exaktes Tablebase-Feedback bis sieben Steine, FEN-Import, Hinweise, Wiederholung nach Verlust des theoretischen Ergebnisses und dauerhafte Themenbeherrschung.",
            "Das Repertoire wurde als schneller kompakter Entscheidungsbaum mit Zugpopularität, Transpositionen, Suche, Vollbild, semantischem Zoom und schrittweisem Aufklappen neu aufgebaut.",
            "Das Analyse-Feedback ist strenger und konsistenter: Taktik-Schaltflächen folgen der Engine-Variante, Coach-Texte vermeiden irreführende Folgen und Brilliant bleibt echten korrekten Opfern oder außergewöhnlichen Remis-Ressourcen vorbehalten. Normale Bauernopfer sind nicht Brilliant.",
            "Puzzles konzentriert sich nun auf thematisches Training mit klarerer Konfiguration; außerdem wurden mehrere Analyse-Steuerungen und Ladepfade vereinfacht, damit die Oberfläche schnell bleibt.",
            "Ein neues optionales Tutorial erklärt die wichtigsten Bereiche und Bedienelemente, ohne dass man sie öffnen muss. Das ? bleibt fest und nur das erklärte Element wird hervorgehoben."
        ],
        closing: "Danke, dass du NexoChess nutzt. Diese Version soll aus jeder analysierten Partie verwertbares Training machen.",
        confirm: "Alles klar",
        close: "Schließen"
    },
    pt: {
        title: "Novidades do NexoChess 1.4",
        intro: "O NexoChess 1.4 liga muito melhor análise, histórico e treino, além de acrescentar novas formas de estudar finais e compreender toda a plataforma.",
        changes: [
            "Estatísticas é agora uma secção completa com filtros por partidas recentes e períodos, evolução da precisão, comparação Brancas/Pretas, erros por fase, desempenho por abertura, dados de puzzles e treino e uma galeria de todos os lances brilhantes que abre a posição exata.",
            "O Arquivo pode transformar erros repetidos num plano de treino automático, e cada partida analisada passa a ter Conclusões com o momento decisivo, o padrão mais importante e uma recomendação concreta ligada à posição correspondente.",
            "O novo Laboratório de finais dentro de Lições cobre finais fundamentais, intermédios e avançados com 72 posições iniciais, feedback exato por tablebases até sete peças, carregamento de FEN, pistas, repetição após perder o resultado teórico e domínio persistente por tema.",
            "O Repertório foi reconstruído à volta de uma árvore de decisões rápida e compacta com popularidade de lances, transposições, pesquisa, ecrã inteiro, zoom semântico e expansão progressiva.",
            "O feedback da Análise está mais rigoroso e coerente: os botões táticos seguem a variante do motor, o treinador evita sequências enganadoras e Brilhante fica reservado a sacrifícios reais e corretos ou recursos excecionais que salvam o empate. Sacrifícios normais de peão não são Brilhantes.",
            "Puzzles fica centrado em treino temático com configuração e filtros mais limpos, e vários controlos e caminhos de carregamento da Análise foram simplificados para manter a experiência rápida.",
            "Um novo tutorial opcional explica para que serve cada secção e os principais controlos sem obrigar a entrar neles. O ? fica sempre fixo e apenas o elemento explicado é destacado."
        ],
        closing: "Obrigado por usares o NexoChess. Esta versão foi pensada para transformar cada partida analisada em treino útil.",
        confirm: "Entendido",
        close: "Fechar"
    },
    ru: {
        title: "Что нового в NexoChess 1.4",
        intro: "NexoChess 1.4 теснее связывает анализ, историю партий и тренировку, а также добавляет новые способы изучения эндшпиля и всей платформы.",
        changes: [
            "Статистика стала отдельным полноценным разделом: фильтры по последним партиям и периодам, динамика точности, сравнение игры белыми и чёрными, ошибки по стадиям, результаты дебютов, данные задач и тренировок, а также галерея всех блестящих ходов с переходом к точной позиции.",
            "Архив может превращать повторяющиеся ошибки в автоматический план тренировок, а у каждой проанализированной партии появились Выводы с решающим моментом, главным шаблоном ошибки и конкретной рекомендацией, привязанной к позиции.",
            "Новая Лаборатория эндшпиля в Уроках охватывает базовый, средний и продвинутый уровни: 72 стартовые позиции, точная проверка tablebase до семи фигур, загрузка FEN, подсказки, повтор после потери теоретического результата и постоянная оценка освоения тем.",
            "Репертуар перестроен вокруг быстрого компактного дерева решений с популярностью ходов, транспозициями, поиском, полноэкранным режимом, семантическим масштабированием и постепенным раскрытием ветвей.",
            "Обратная связь Анализа стала строже и последовательнее: тактические кнопки следуют варианту движка, комментарии тренера не показывают вводящие в заблуждение последовательности, а Brilliant даётся только за настоящие корректные жертвы или исключительные ресурсы для спасения ничьей. Обычные жертвы пешки не считаются Brilliant.",
            "Puzzles теперь сосредоточен на тематической практике с более чистой настройкой и фильтрами, а несколько элементов и путей загрузки Анализа упрощены для сохранения быстрого интерфейса.",
            "Новый необязательный учебный тур кратко объясняет назначение основных разделов и элементов управления без необходимости заходить в них. Кнопка ? остаётся на месте, а подсвечивается только объясняемый элемент."
        ],
        closing: "Спасибо, что пользуетесь NexoChess. Цель этой версии — превращать каждую разобранную партию в полезную тренировку.",
        confirm: "Понятно",
        close: "Закрыть"
    },
    zh: {
        title: "NexoChess 1.4 更新内容",
        intro: "NexoChess 1.4 更紧密地连接了复盘、历史数据与训练，并新增了系统学习残局和理解整个平台的方式。",
        changes: [
            "统计现已成为独立完整的页面，可按最近对局或时间范围筛选，查看准确率趋势、白黑方对比、各阶段错误、开局表现、战术题与训练数据，并通过精彩着法画廊直接返回对应对局的准确位置。",
            "存档现在可以把重复错误转化为自动训练计划；每盘已分析对局也新增了“结论”，展示决定性时刻、最重要的错误模式和直接关联到棋盘位置的具体建议。",
            "课程中的新残局实验室覆盖基础、中级和高级残局，首批包含 72 个位置；七子以内使用 tablebase 给出精确反馈，并支持 FEN 导入、提示、理论结果下降后的重试以及按主题保存掌握度。",
            "开局库已重构为快速紧凑的决策树，支持走法流行度、转位、搜索、全屏学习、语义缩放和逐步展开分支，避免超长线路。",
            "复盘反馈更加严格一致：战术按钮遵循引擎主变，教练说明避免误导性的连续着法，Brilliant 只保留给真正正确的牺牲或极少数挽救和棋的资源。普通弃兵不会被判为 Brilliant。",
            "战术题现在专注于按主题训练，配置与筛选更加清晰；同时简化了若干复盘控件与加载路径，以保持界面响应速度。",
            "新增可选的 NexoChess 全站教程，无需进入各功能即可简要了解主要页面与控件。? 按钮始终固定，只高亮当前讲解的元素。"
        ],
        closing: "感谢你使用 NexoChess。1.4 的重点是让每一盘复盘都能真正转化为有效训练。",
        confirm: "知道了",
        close: "关闭"
    },
    vi: {
        title: "Có gì mới trong NexoChess 1.4",
        intro: "NexoChess 1.4 kết nối chặt chẽ hơn giữa phân tích, lịch sử và luyện tập, đồng thời bổ sung cách mới để học tàn cuộc và hiểu toàn bộ nền tảng.",
        changes: [
            "Thống kê giờ là một khu vực hoàn chỉnh với bộ lọc theo các ván gần đây hoặc khoảng thời gian, xu hướng độ chính xác, so sánh Trắng/Đen, lỗi theo giai đoạn, hiệu suất khai cuộc, dữ liệu puzzle và luyện tập, cùng thư viện mọi nước đi xuất sắc để quay lại đúng vị trí trong ván.",
            "Kho lưu trữ có thể biến lỗi lặp lại thành kế hoạch luyện tập tự động, còn mỗi ván đã phân tích có thêm Kết luận với thời điểm quyết định, mẫu lỗi quan trọng nhất và khuyến nghị cụ thể liên kết tới đúng vị trí.",
            "Phòng thí nghiệm tàn cuộc mới trong Bài học bao gồm cấp cơ bản, trung cấp và nâng cao với 72 vị trí ban đầu, phản hồi tablebase chính xác tới bảy quân, nhập FEN, gợi ý, thử lại sau khi làm mất kết quả lý thuyết và lưu mức độ thành thạo theo chủ đề.",
            "Kho khai cuộc được xây dựng lại thành cây quyết định nhanh và gọn với độ phổ biến nước đi, chuyển vị, tìm kiếm, toàn màn hình, zoom ngữ nghĩa và mở rộng nhánh dần dần.",
            "Phản hồi Phân tích nghiêm ngặt và nhất quán hơn: nút chiến thuật bám theo biến của động cơ, lời huấn luyện tránh chuỗi gây hiểu nhầm, còn Brilliant chỉ dành cho hy sinh thực sự đúng hoặc tài nguyên đặc biệt cứu hòa. Hy sinh tốt thông thường không được xem là Brilliant.",
            "Puzzles giờ tập trung vào luyện tập theo chủ đề với phần thiết lập và bộ lọc gọn hơn; một số điều khiển và đường tải của Phân tích cũng được đơn giản hóa để giữ trải nghiệm nhanh.",
            "Hướng dẫn NexoChess mới là tùy chọn, giải thích ngắn gọn mục đích của các khu vực và điều khiển chính mà không bắt bạn phải mở chúng. Nút ? luôn đứng yên và chỉ phần đang được giải thích mới được làm nổi bật."
        ],
        closing: "Cảm ơn bạn đã dùng NexoChess. Bản 1.4 tập trung vào việc biến mỗi ván đã phân tích thành luyện tập hữu ích.",
        confirm: "Đã hiểu",
        close: "Đóng"
    },
    hi: {
        title: "NexoChess 1.4 में नया क्या है",
        intro: "NexoChess 1.4 विश्लेषण, इतिहास और प्रशिक्षण को कहीं बेहतर ढंग से जोड़ता है और एंडगेम व पूरी साइट को समझने के नए तरीके जोड़ता है।",
        changes: [
            "Statistics अब एक पूर्ण अलग सेक्शन है: हाल की बाज़ियों या समय के फ़िल्टर, सटीकता का रुझान, सफेद/काले से तुलना, खेल के चरण के अनुसार गलतियाँ, ओपनिंग प्रदर्शन, puzzle व training डेटा और सभी Brilliant चालों की गैलरी जो सीधे उसी स्थिति पर ले जाती है।",
            "Archive बार-बार होने वाली गलतियों को स्वतः training plan में बदल सकता है, और हर विश्लेषित बाज़ी में अब Conclusions हैं: निर्णायक क्षण, सबसे महत्वपूर्ण पैटर्न और संबंधित स्थिति से जुड़ी ठोस सलाह।",
            "Lessons के अंदर नया Endgame Laboratory बुनियादी, मध्यम और उन्नत एंडगेम को 72 शुरुआती स्थितियों के साथ कवर करता है; सात मोहरों तक tablebase से सटीक feedback, FEN लोड, hints, सैद्धांतिक परिणाम बिगाड़ने पर retry और विषयवार mastery सेव होती है।",
            "Repertoire को तेज़ और कॉम्पैक्ट decision tree के रूप में दोबारा बनाया गया है, जिसमें move popularity, transpositions, search, fullscreen study, semantic zoom और शाखाओं का धीरे-धीरे विस्तार शामिल है।",
            "Analysis feedback अधिक सख्त और संगत है: tactical buttons engine line का पालन करते हैं, coach भ्रामक चाल-श्रृंखलाएँ नहीं देता और Brilliant केवल सही वास्तविक sacrifices या असाधारण draw-saving resources के लिए है। सामान्य pawn sacrifices Brilliant नहीं हैं।",
            "Puzzles अब साफ़ setup और filters के साथ thematic practice पर केंद्रित है, और तेज़ अनुभव बनाए रखने के लिए Analysis के कुछ controls व loading paths सरल किए गए हैं।",
            "नया वैकल्पिक NexoChess tutorial मुख्य sections और controls का उद्देश्य बिना उनमें प्रवेश कराए समझाता है। ? स्थिर रहता है और केवल समझाया जा रहा तत्व highlight होता है।"
        ],
        closing: "NexoChess का उपयोग करने के लिए धन्यवाद। 1.4 का लक्ष्य हर विश्लेषित बाज़ी को उपयोगी प्रशिक्षण में बदलना है।",
        confirm: "ठीक है",
        close: "बंद करें"
    },
    mr: {
        title: "NexoChess 1.4 मध्ये नवीन काय आहे",
        intro: "NexoChess 1.4 विश्लेषण, इतिहास आणि प्रशिक्षण अधिक घट्ट जोडते आणि एंडगेम तसेच संपूर्ण प्लॅटफॉर्म समजून घेण्यासाठी नवे मार्ग देते.",
        changes: [
            "Statistics आता स्वतंत्र आणि पूर्ण विभाग आहे: अलीकडील डाव किंवा कालावधीचे फिल्टर, accuracy trend, पांढरे/काळे तुलना, टप्प्यानुसार चुका, opening performance, puzzle व training डेटा आणि प्रत्येक Brilliant चालीची गॅलरी जी थेट त्या स्थितीकडे नेते.",
            "Archive पुनरावृत्ती होणाऱ्या चुका आपोआप training plan मध्ये बदलू शकते, आणि प्रत्येक विश्लेषित डावात आता Conclusions आहेत: निर्णायक क्षण, सर्वात महत्त्वाचा pattern आणि संबंधित स्थितीशी जोडलेली ठोस शिफारस.",
            "Lessons मधील नवे Endgame Laboratory मूलभूत, मध्यम आणि प्रगत एंडगेम 72 सुरुवातीच्या स्थितींमधून शिकवते; सात मोहरांपर्यंत tablebase चे अचूक feedback, FEN load, hints, सैद्धांतिक निकाल गमावल्यानंतर retry आणि विषयानुसार mastery जतन केली जाते.",
            "Repertoire जलद आणि compact decision tree म्हणून पुन्हा बांधले आहे, ज्यात move popularity, transpositions, search, fullscreen study, semantic zoom आणि शाखांचे क्रमिक विस्तार आहे.",
            "Analysis feedback अधिक कडक आणि सुसंगत आहे: tactical buttons engine line पाळतात, coach दिशाभूल करणाऱ्या चाल-श्रृंखला टाळतो आणि Brilliant फक्त खरे व योग्य sacrifices किंवा विलक्षण draw-saving resources साठी राखीव आहे. सामान्य pawn sacrifices Brilliant नाहीत.",
            "Puzzles आता स्वच्छ setup आणि filters सह thematic practice वर केंद्रित आहे; वेगवान अनुभव राखण्यासाठी Analysis मधील काही controls व loading paths साधे केले आहेत.",
            "नवा ऐच्छिक NexoChess tutorial मुख्य विभाग आणि controls कशासाठी आहेत हे त्यात प्रवेश करायला न लावता सांगतो. ? स्थिर राहतो आणि फक्त समजावला जाणारा घटक highlight होतो."
        ],
        closing: "NexoChess वापरल्याबद्दल धन्यवाद. 1.4 मध्ये प्रत्येक विश्लेषित डाव उपयुक्त प्रशिक्षणात बदलणे हे मुख्य उद्दिष्ट आहे.",
        confirm: "ठीक आहे",
        close: "बंद करा"
    },
    pl: {
        title: "Co nowego w NexoChess 1.4",
        intro: "NexoChess 1.4 znacznie mocniej łączy analizę, historię i trening oraz dodaje nowe sposoby nauki końcówek i poznawania całej platformy.",
        changes: [
            "Statystyki są teraz pełną osobną sekcją z filtrami ostatnich partii i okresów, trendem dokładności, porównaniem białe/czarne, błędami według fazy, wynikami debiutów, danymi z zadań i treningu oraz galerią wszystkich genialnych ruchów prowadzącą do dokładnej pozycji.",
            "Archiwum potrafi zamieniać powtarzające się błędy w automatyczny plan treningowy, a każda przeanalizowana partia ma teraz Wnioski z momentem przełomowym, najważniejszym wzorcem i konkretną rekomendacją połączoną z odpowiednią pozycją.",
            "Nowe Laboratorium końcówek w Lekcjach obejmuje poziom podstawowy, średni i zaawansowany z 72 pozycjami startowymi, dokładną oceną tablebase do siedmiu bierek, wczytywaniem FEN, podpowiedziami, ponowną próbą po utracie wyniku teoretycznego i zapisem opanowania tematów.",
            "Repertuar przebudowano jako szybkie kompaktowe drzewo decyzji z popularnością ruchów, transpozycjami, wyszukiwaniem, pełnym ekranem, zoomem semantycznym i stopniowym rozwijaniem gałęzi.",
            "Informacje zwrotne w Analizie są bardziej rygorystyczne i spójne: przyciski taktyczne trzymają się wariantu silnika, trener unika mylących sekwencji, a Brilliant jest zarezerwowane dla prawdziwych poprawnych poświęceń lub wyjątkowych zasobów ratujących remis. Zwykłe poświęcenia pionka nie są Brilliant.",
            "Puzzles skupia się teraz na treningu tematycznym z czystszą konfiguracją i filtrami, a część kontrolek i ścieżek ładowania Analizy uproszczono, aby zachować szybkość interfejsu.",
            "Nowy opcjonalny samouczek NexoChess krótko wyjaśnia przeznaczenie głównych sekcji i kontrolek bez zmuszania do ich otwierania. ? pozostaje nieruchomy, a podświetlany jest tylko omawiany element."
        ],
        closing: "Dziękujemy za korzystanie z NexoChess. Wersja 1.4 koncentruje się na zamianie każdej przeanalizowanej partii w użyteczny trening.",
        confirm: "Rozumiem",
        close: "Zamknij"
    }
};

export function releaseNoteV1_4HasExpired(now = Date.now()): boolean {
    return now >= Date.parse(V1_4_RELEASE_NOTE_CUTOFF);
}
