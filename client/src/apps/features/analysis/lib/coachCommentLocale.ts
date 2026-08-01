export type CoachCommentPiece = "p" | "n" | "b" | "r" | "q" | "k";
export type CoachCommentColour = "w" | "b";

export type CoachFeatureKey =
    | "check"
    | "promotion"
    | "castleKingside"
    | "castleQueenside"
    | "capture"
    | "develop"
    | "centre";

export type CoachDetailKey =
    | "lineWinsPiece"
    | "sacrificeWinsPiece"
    | "lineLosesPiece"
    | "bestLineWinsPiece"
    | "moveForcesMate"
    | "bestForcesMate"
    | "moveFeature"
    | "bestFeature"
    | "forcesReply"
    | "keepsAdvantage"
    | "keepsBalance"
    | "limitsDamage"
    | "alternativeKeepsPosition"
    | "bestAvoidsTactic"
    | "directWinsPiece";

interface CoachCommentLocale {
    pieces: Record<CoachCommentPiece, string>;
    sides: Record<CoachCommentColour, string>;
    features: Record<CoachFeatureKey, string>;
    details: Record<CoachDetailKey, string>;
}

const en: CoachCommentLocale = {
    pieces: {
        p: "a pawn",
        n: "a knight",
        b: "a bishop",
        r: "a rook",
        q: "the queen",
        k: "the king"
    },
    sides: {
        w: "White",
        b: "Black"
    },
    features: {
        check: "checks the king and forces a response",
        promotion: "promotes a pawn to {{piece}}",
        castleKingside: "castles kingside and secures the king",
        castleQueenside: "castles queenside and activates the rook",
        capture: "captures {{piece}}",
        develop: "develops {{piece}}",
        centre: "claims space in the centre"
    },
    details: {
        lineWinsPiece: "The point is concrete: after {{line}}, the sequence wins {{piece}}.",
        sacrificeWinsPiece: "{{side}} play {{move}}, a spectacular sacrifice. After {{line}}, {{sacrifice}} is given up, but the sequence wins {{piece}}.",
        lineLosesPiece: "It allows the tactical sequence {{line}}. At the end, {{piece}} is lost.",
        bestLineWinsPiece: "{{best}} was stronger: after {{line}}, it wins {{piece}}.",
        moveForcesMate: "{{move}} starts a forced mate in {{mate}}.",
        bestForcesMate: "{{best}} was stronger because it starts a forced mate in {{mate}}.",
        moveFeature: "The justification is that it {{feature}}.",
        bestFeature: "{{best}} was stronger because it {{feature}}.",
        forcesReply: "The main line continues with {{reply}}, and the move keeps the initiative.",
        keepsAdvantage: "It keeps the advantage without allowing counterplay.",
        keepsBalance: "It keeps the position balanced without creating a new weakness.",
        limitsDamage: "It is the most resilient defence and limits the damage.",
        alternativeKeepsPosition: "{{best}} kept the position together.",
        bestAvoidsTactic: "{{best}} avoided this tactic.",
        directWinsPiece: "{{move}} wins {{piece}} immediately."
    }
};

const es: CoachCommentLocale = {
    pieces: {
        p: "un peón",
        n: "un caballo",
        b: "un alfil",
        r: "una torre",
        q: "la dama",
        k: "el rey"
    },
    sides: {
        w: "Las blancas",
        b: "Las negras"
    },
    features: {
        check: "da jaque y obliga al rey a responder",
        promotion: "corona un peón en {{piece}}",
        castleKingside: "enroca corto y pone al rey a salvo",
        castleQueenside: "enroca largo y activa la torre",
        capture: "captura {{piece}}",
        develop: "desarrolla {{piece}}",
        centre: "gana espacio en el centro"
    },
    details: {
        lineWinsPiece: "La idea es concreta: tras {{line}}, la secuencia termina ganando {{piece}}.",
        sacrificeWinsPiece: "{{side}} juegan {{move}}, un sacrificio espectacular. Tras {{line}}, se entrega {{sacrifice}}, pero la secuencia termina ganando {{piece}}.",
        lineLosesPiece: "Permite la secuencia táctica {{line}}. Al final se pierde {{piece}}.",
        bestLineWinsPiece: "{{best}} era más fuerte: tras {{line}}, permite ganar {{piece}}.",
        moveForcesMate: "{{move}} inicia un mate forzado en {{mate}}.",
        bestForcesMate: "{{best}} era más fuerte porque inicia un mate forzado en {{mate}}.",
        moveFeature: "La justificación es que {{feature}}.",
        bestFeature: "{{best}} era más fuerte porque {{feature}}.",
        forcesReply: "La línea principal continúa con {{reply}}, y la jugada mantiene la iniciativa.",
        keepsAdvantage: "Mantiene la ventaja sin permitir contrajuego.",
        keepsBalance: "Mantiene el equilibrio sin crear una debilidad nueva.",
        limitsDamage: "Es la defensa más resistente y limita el daño.",
        alternativeKeepsPosition: "{{best}} mantenía la posición unida.",
        bestAvoidsTactic: "{{best}} evitaba esta táctica.",
        directWinsPiece: "{{move}} gana {{piece}} de inmediato."
    }
};

const fr: CoachCommentLocale = {
    pieces: {
        p: "un pion",
        n: "un cavalier",
        b: "un fou",
        r: "une tour",
        q: "la dame",
        k: "le roi"
    },
    sides: {
        w: "Les Blancs",
        b: "Les Noirs"
    },
    features: {
        check: "met le roi en échec et force une réponse",
        promotion: "promeut un pion en {{piece}}",
        castleKingside: "roque du côté roi et met le roi à l’abri",
        castleQueenside: "roque du côté dame et active la tour",
        capture: "capture {{piece}}",
        develop: "développe {{piece}}",
        centre: "gagne de l’espace au centre"
    },
    details: {
        lineWinsPiece: "L’idée est concrète : après {{line}}, la séquence gagne {{piece}}.",
        sacrificeWinsPiece: "{{side}} jouent {{move}}, un sacrifice spectaculaire. Après {{line}}, {{sacrifice}} est donné, mais la séquence gagne {{piece}}.",
        lineLosesPiece: "Cela permet la séquence tactique {{line}}. À la fin, {{piece}} est perdu.",
        bestLineWinsPiece: "{{best}} était plus fort : après {{line}}, ce coup gagne {{piece}}.",
        moveForcesMate: "{{move}} lance un mat forcé en {{mate}}.",
        bestForcesMate: "{{best}} était plus fort car il lance un mat forcé en {{mate}}.",
        moveFeature: "La justification est qu’il {{feature}}.",
        bestFeature: "{{best}} était plus fort car il {{feature}}.",
        forcesReply: "La variante principale continue par {{reply}}, et le coup conserve l’initiative.",
        keepsAdvantage: "Il conserve l’avantage sans permettre de contre-jeu.",
        keepsBalance: "Il maintient l’équilibre sans créer de nouvelle faiblesse.",
        limitsDamage: "C’est la défense la plus tenace et elle limite les dégâts.",
        alternativeKeepsPosition: "{{best}} maintenait la position.",
        bestAvoidsTactic: "{{best}} évitait cette tactique.",
        directWinsPiece: "{{move}} gagne immédiatement {{piece}}."
    }
};

const de: CoachCommentLocale = {
    pieces: {
        p: "einen Bauern",
        n: "einen Springer",
        b: "einen Läufer",
        r: "einen Turm",
        q: "die Dame",
        k: "den König"
    },
    sides: {
        w: "Weiß",
        b: "Schwarz"
    },
    features: {
        check: "gibt Schach und erzwingt eine Antwort",
        promotion: "wandelt einen Bauern in {{piece}} um",
        castleKingside: "rochiert kurz und bringt den König in Sicherheit",
        castleQueenside: "rochiert lang und aktiviert den Turm",
        capture: "schlägt {{piece}}",
        develop: "entwickelt {{piece}}",
        centre: "gewinnt Raum im Zentrum"
    },
    details: {
        lineWinsPiece: "Die Idee ist konkret: Nach {{line}} gewinnt die Folge {{piece}}.",
        sacrificeWinsPiece: "{{side}} spielt {{move}}, ein spektakuläres Opfer. Nach {{line}} wird {{sacrifice}} gegeben, doch die Folge gewinnt {{piece}}.",
        lineLosesPiece: "Das erlaubt die taktische Folge {{line}}. Am Ende geht {{piece}} verloren.",
        bestLineWinsPiece: "{{best}} war stärker: Nach {{line}} gewinnt der Zug {{piece}}.",
        moveForcesMate: "{{move}} leitet ein erzwungenes Matt in {{mate}} ein.",
        bestForcesMate: "{{best}} war stärker, weil der Zug ein erzwungenes Matt in {{mate}} einleitet.",
        moveFeature: "Die Begründung ist, dass der Zug {{feature}}.",
        bestFeature: "{{best}} war stärker, weil der Zug {{feature}}.",
        forcesReply: "Die Hauptvariante geht mit {{reply}} weiter, und der Zug behält die Initiative.",
        keepsAdvantage: "Der Zug hält den Vorteil, ohne Gegenspiel zuzulassen.",
        keepsBalance: "Der Zug hält die Stellung im Gleichgewicht, ohne eine neue Schwäche zu schaffen.",
        limitsDamage: "Das ist die zäheste Verteidigung und begrenzt den Schaden.",
        alternativeKeepsPosition: "{{best}} hielt die Stellung zusammen.",
        bestAvoidsTactic: "{{best}} vermied diese Taktik.",
        directWinsPiece: "{{move}} gewinnt sofort {{piece}}."
    }
};

const pt: CoachCommentLocale = {
    pieces: {
        p: "um peão",
        n: "um cavalo",
        b: "um bispo",
        r: "uma torre",
        q: "a dama",
        k: "o rei"
    },
    sides: {
        w: "As brancas",
        b: "As pretas"
    },
    features: {
        check: "dá xeque e obriga o rei a responder",
        promotion: "promove um peão a {{piece}}",
        castleKingside: "faz roque pequeno e protege o rei",
        castleQueenside: "faz roque grande e ativa a torre",
        capture: "captura {{piece}}",
        develop: "desenvolve {{piece}}",
        centre: "ganha espaço no centro"
    },
    details: {
        lineWinsPiece: "A ideia é concreta: depois de {{line}}, a sequência termina ganhando {{piece}}.",
        sacrificeWinsPiece: "{{side}} jogam {{move}}, um sacrifício espetacular. Depois de {{line}}, entrega-se {{sacrifice}}, mas a sequência termina ganhando {{piece}}.",
        lineLosesPiece: "Isso permite a sequência tática {{line}}. No fim, perde-se {{piece}}.",
        bestLineWinsPiece: "{{best}} era mais forte: depois de {{line}}, permite ganhar {{piece}}.",
        moveForcesMate: "{{move}} inicia um mate forçado em {{mate}}.",
        bestForcesMate: "{{best}} era mais forte porque inicia um mate forçado em {{mate}}.",
        moveFeature: "A justificação é que {{feature}}.",
        bestFeature: "{{best}} era mais forte porque {{feature}}.",
        forcesReply: "A linha principal continua com {{reply}}, e o lance mantém a iniciativa.",
        keepsAdvantage: "Mantém a vantagem sem permitir contrajogo.",
        keepsBalance: "Mantém o equilíbrio sem criar uma nova fraqueza.",
        limitsDamage: "É a defesa mais resistente e limita o dano.",
        alternativeKeepsPosition: "{{best}} mantinha a posição unida.",
        bestAvoidsTactic: "{{best}} evitava esta tática.",
        directWinsPiece: "{{move}} ganha {{piece}} imediatamente."
    }
};

const ru: CoachCommentLocale = {
    pieces: {
        p: "пешку",
        n: "коня",
        b: "слона",
        r: "ладью",
        q: "ферзя",
        k: "короля"
    },
    sides: {
        w: "Белые",
        b: "Чёрные"
    },
    features: {
        check: "даёт шах и вынуждает ответ",
        promotion: "превращает пешку в {{piece}}",
        castleKingside: "рокирует в короткую сторону и прячет короля",
        castleQueenside: "рокирует в длинную сторону и вводит ладью в игру",
        capture: "забирает {{piece}}",
        develop: "развивает {{piece}}",
        centre: "захватывает пространство в центре"
    },
    details: {
        lineWinsPiece: "Идея конкретна: после {{line}} комбинация выигрывает {{piece}}.",
        sacrificeWinsPiece: "{{side}} играют {{move}} — эффектную жертву. После {{line}} отдаётся {{sacrifice}}, но комбинация выигрывает {{piece}}.",
        lineLosesPiece: "Это допускает тактическую последовательность {{line}}. В итоге теряется {{piece}}.",
        bestLineWinsPiece: "{{best}} было сильнее: после {{line}} этот ход выигрывает {{piece}}.",
        moveForcesMate: "{{move}} начинает форсированный мат в {{mate}} ходов.",
        bestForcesMate: "{{best}} было сильнее, потому что начинает форсированный мат в {{mate}} ходов.",
        moveFeature: "Обоснование в том, что ход {{feature}}.",
        bestFeature: "{{best}} было сильнее, потому что ход {{feature}}.",
        forcesReply: "Главная линия продолжается ходом {{reply}}, а инициатива сохраняется.",
        keepsAdvantage: "Ход сохраняет преимущество и не даёт контригры.",
        keepsBalance: "Ход сохраняет равновесие и не создаёт новой слабости.",
        limitsDamage: "Это самая упорная защита, которая ограничивает ущерб.",
        alternativeKeepsPosition: "{{best}} удерживало позицию.",
        bestAvoidsTactic: "{{best}} избегало этой тактики.",
        directWinsPiece: "{{move}} сразу выигрывает {{piece}}."
    }
};

const zh: CoachCommentLocale = {
    pieces: {
        p: "一个兵",
        n: "一匹马",
        b: "一个象",
        r: "一辆车",
        q: "后",
        k: "王"
    },
    sides: {
        w: "白方",
        b: "黑方"
    },
    features: {
        check: "将军并迫使对手应对",
        promotion: "把兵升变为{{piece}}",
        castleKingside: "王翼易位并让王更安全",
        castleQueenside: "后翼易位并激活车",
        capture: "吃掉{{piece}}",
        develop: "发展{{piece}}",
        centre: "在中心取得空间"
    },
    details: {
        lineWinsPiece: "思路很具体：在{{line}}之后，这个组合将赢得{{piece}}。",
        sacrificeWinsPiece: "{{side}}走出{{move}}，这是一次精彩的弃子。在{{line}}之后，{{sacrifice}}被牺牲，但组合最终赢得{{piece}}。",
        lineLosesPiece: "这允许战术序列{{line}}。最终会丢掉{{piece}}。",
        bestLineWinsPiece: "{{best}}更强：在{{line}}之后可以赢得{{piece}}。",
        moveForcesMate: "{{move}}开始一个{{mate}}步的强制将杀。",
        bestForcesMate: "{{best}}更强，因为它开始一个{{mate}}步的强制将杀。",
        moveFeature: "理由是它{{feature}}。",
        bestFeature: "{{best}}更强，因为它{{feature}}。",
        forcesReply: "主变化以{{reply}}继续，这步棋保持了主动权。",
        keepsAdvantage: "它保持优势，不给对手反击机会。",
        keepsBalance: "它保持局面平衡，也没有制造新的弱点。",
        limitsDamage: "这是最顽强的防守，能够限制损失。",
        alternativeKeepsPosition: "{{best}}能够维持局面。",
        bestAvoidsTactic: "{{best}}避开了这个战术。",
        directWinsPiece: "{{move}}立即赢得{{piece}}。"
    }
};

const vi: CoachCommentLocale = {
    pieces: {
        p: "một tốt",
        n: "một mã",
        b: "một tượng",
        r: "một xe",
        q: "hậu",
        k: "vua"
    },
    sides: {
        w: "Trắng",
        b: "Đen"
    },
    features: {
        check: "chiếu vua và buộc đối thủ phải đáp lại",
        promotion: "phong cấp tốt thành {{piece}}",
        castleKingside: "nhập thành cánh vua và đưa vua vào an toàn",
        castleQueenside: "nhập thành cánh hậu và kích hoạt xe",
        capture: "bắt {{piece}}",
        develop: "phát triển {{piece}}",
        centre: "chiếm không gian ở trung tâm"
    },
    details: {
        lineWinsPiece: "Ý tưởng rất cụ thể: sau {{line}}, chuỗi nước đi giành được {{piece}}.",
        sacrificeWinsPiece: "{{side}} chơi {{move}}, một đòn thí quân ngoạn mục. Sau {{line}}, {{sacrifice}} bị thí, nhưng chuỗi nước đi giành được {{piece}}.",
        lineLosesPiece: "Nước này cho phép chuỗi chiến thuật {{line}}. Cuối cùng, {{piece}} bị mất.",
        bestLineWinsPiece: "{{best}} mạnh hơn: sau {{line}}, nước này giành được {{piece}}.",
        moveForcesMate: "{{move}} bắt đầu một thế chiếu hết bắt buộc trong {{mate}} nước.",
        bestForcesMate: "{{best}} mạnh hơn vì bắt đầu một thế chiếu hết bắt buộc trong {{mate}} nước.",
        moveFeature: "Lý do là nước đi {{feature}}.",
        bestFeature: "{{best}} mạnh hơn vì nước đi {{feature}}.",
        forcesReply: "Biến chính tiếp tục với {{reply}}, và nước đi vẫn giữ quyền chủ động.",
        keepsAdvantage: "Nước đi giữ lợi thế mà không cho đối thủ phản công.",
        keepsBalance: "Nước đi giữ cân bằng mà không tạo thêm điểm yếu.",
        limitsDamage: "Đây là cách phòng thủ bền bỉ nhất và hạn chế thiệt hại.",
        alternativeKeepsPosition: "{{best}} giữ được thế trận.",
        bestAvoidsTactic: "{{best}} tránh được đòn chiến thuật này.",
        directWinsPiece: "{{move}} lập tức giành được {{piece}}."
    }
};

const hi: CoachCommentLocale = {
    pieces: {
        p: "एक प्यादा",
        n: "एक घोड़ा",
        b: "एक ऊँट",
        r: "एक हाथी",
        q: "वज़ीर",
        k: "राजा"
    },
    sides: {
        w: "सफ़ेद",
        b: "काले"
    },
    features: {
        check: "राजा को शह देता है और जवाब के लिए मजबूर करता है",
        promotion: "प्यादे को {{piece}} में पदोन्नत करता है",
        castleKingside: "किंग साइड कैसलिंग करके राजा को सुरक्षित करता है",
        castleQueenside: "क्वीन साइड कैसलिंग करके हाथी को सक्रिय करता है",
        capture: "{{piece}} को मारता है",
        develop: "{{piece}} को विकसित करता है",
        centre: "केंद्र में जगह हासिल करता है"
    },
    details: {
        lineWinsPiece: "विचार ठोस है: {{line}} के बाद यह क्रम {{piece}} जीतता है।",
        sacrificeWinsPiece: "{{side}} ने {{move}} खेला, एक शानदार बलिदान। {{line}} के बाद {{sacrifice}} दिया जाता है, लेकिन क्रम {{piece}} जीतता है।",
        lineLosesPiece: "यह {{line}} की सामरिक शृंखला की अनुमति देता है। अंत में {{piece}} खो जाता है।",
        bestLineWinsPiece: "{{best}} अधिक मजबूत था: {{line}} के बाद यह {{piece}} जीतता है।",
        moveForcesMate: "{{move}} {{mate}} चालों में मजबूर मात शुरू करता है।",
        bestForcesMate: "{{best}} अधिक मजबूत था क्योंकि यह {{mate}} चालों में मजबूर मात शुरू करता है।",
        moveFeature: "कारण यह है कि चाल {{feature}}।",
        bestFeature: "{{best}} अधिक मजबूत था क्योंकि चाल {{feature}}।",
        forcesReply: "मुख्य पंक्ति {{reply}} से जारी रहती है और चाल पहल बनाए रखती है।",
        keepsAdvantage: "यह प्रतिआक्रमण दिए बिना बढ़त बनाए रखता है।",
        keepsBalance: "यह नई कमजोरी बनाए बिना स्थिति को संतुलित रखता है।",
        limitsDamage: "यह सबसे दृढ़ बचाव है और नुकसान सीमित करता है।",
        alternativeKeepsPosition: "{{best}} स्थिति को संभाले रखता था।",
        bestAvoidsTactic: "{{best}} इस रणनीति से बचता था।",
        directWinsPiece: "{{move}} तुरंत {{piece}} जीतता है।"
    }
};

const mr: CoachCommentLocale = {
    pieces: {
        p: "एक प्यादा",
        n: "एक घोडा",
        b: "एक उंट",
        r: "एक हत्ती",
        q: "वजीर",
        k: "राजा"
    },
    sides: {
        w: "पांढऱ्या",
        b: "काळ्या"
    },
    features: {
        check: "राजाला शह देतो आणि उत्तर देण्यास भाग पाडतो",
        promotion: "प्याद्याचे {{piece}} मध्ये पदोन्नती करतो",
        castleKingside: "राजाच्या बाजूला कॅसलिंग करून राजाला सुरक्षित करतो",
        castleQueenside: "राणीच्या बाजूला कॅसलिंग करून हत्ती सक्रिय करतो",
        capture: "{{piece}} घेतो",
        develop: "{{piece}} विकसित करतो",
        centre: "मध्यभागी जागा मिळवतो"
    },
    details: {
        lineWinsPiece: "कल्पना ठोस आहे: {{line}} नंतर ही मालिका {{piece}} जिंकते.",
        sacrificeWinsPiece: "{{side}} {{move}} खेळतात, एक नेत्रदीपक बलिदान. {{line}} नंतर {{sacrifice}} दिला जातो, पण मालिका {{piece}} जिंकते.",
        lineLosesPiece: "यामुळे {{line}} ही डावपेचाची मालिका शक्य होते. शेवटी {{piece}} गमावला जातो.",
        bestLineWinsPiece: "{{best}} अधिक मजबूत होता: {{line}} नंतर तो {{piece}} जिंकतो.",
        moveForcesMate: "{{move}} {{mate}} चालींमध्ये सक्तीचा मात सुरू करतो.",
        bestForcesMate: "{{best}} अधिक मजबूत होता कारण तो {{mate}} चालींमध्ये सक्तीचा मात सुरू करतो.",
        moveFeature: "कारण ही चाल {{feature}}.",
        bestFeature: "{{best}} अधिक मजबूत होता कारण ही चाल {{feature}}.",
        forcesReply: "मुख्य चालक्रम {{reply}} ने पुढे जातो आणि चाल पुढाकार टिकवते.",
        keepsAdvantage: "ही चाल प्रतिहल्ला न देता आघाडी टिकवते.",
        keepsBalance: "ही चाल नवी कमकुवत जागा निर्माण न करता समतोल राखते.",
        limitsDamage: "हा सर्वात मजबूत बचाव आहे आणि नुकसान मर्यादित करतो.",
        alternativeKeepsPosition: "{{best}} स्थिती सांभाळून ठेवत होता.",
        bestAvoidsTactic: "{{best}} हा डावपेच टाळत होता.",
        directWinsPiece: "{{move}} लगेच {{piece}} जिंकतो."
    }
};

const pl: CoachCommentLocale = {
    pieces: {
        p: "piona",
        n: "skoczka",
        b: "gońca",
        r: "wieżę",
        q: "hetmana",
        k: "króla"
    },
    sides: {
        w: "Białe",
        b: "Czarne"
    },
    features: {
        check: "daje szacha i wymusza odpowiedź",
        promotion: "promuje piona na {{piece}}",
        castleKingside: "robi krótką roszadę i zabezpiecza króla",
        castleQueenside: "robi długą roszadę i aktywuje wieżę",
        capture: "bije {{piece}}",
        develop: "rozwija {{piece}}",
        centre: "zdobywa przestrzeń w centrum"
    },
    details: {
        lineWinsPiece: "Idea jest konkretna: po {{line}} sekwencja wygrywa {{piece}}.",
        sacrificeWinsPiece: "{{side}} grają {{move}}, efektowną ofiarę. Po {{line}} oddawany jest {{sacrifice}}, ale sekwencja wygrywa {{piece}}.",
        lineLosesPiece: "To dopuszcza taktyczną sekwencję {{line}}. Na końcu traci się {{piece}}.",
        bestLineWinsPiece: "{{best}} było silniejsze: po {{line}} wygrywa {{piece}}.",
        moveForcesMate: "{{move}} rozpoczyna wymuszonego mata w {{mate}} ruchach.",
        bestForcesMate: "{{best}} było silniejsze, ponieważ rozpoczyna wymuszonego mata w {{mate}} ruchach.",
        moveFeature: "Uzasadnienie jest takie, że ruch {{feature}}.",
        bestFeature: "{{best}} było silniejsze, ponieważ ruch {{feature}}.",
        forcesReply: "Główna linia trwa przez {{reply}}, a ruch zachowuje inicjatywę.",
        keepsAdvantage: "Ruch utrzymuje przewagę i nie pozwala na kontrgrę.",
        keepsBalance: "Ruch utrzymuje równowagę i nie tworzy nowej słabości.",
        limitsDamage: "To najbardziej wytrzymała obrona, która ogranicza straty.",
        alternativeKeepsPosition: "{{best}} utrzymywało pozycję w całości.",
        bestAvoidsTactic: "{{best}} unikało tej taktyki.",
        directWinsPiece: "{{move}} natychmiast wygrywa {{piece}}."
    }
};

const locales: Record<string, CoachCommentLocale> = {
    en,
    es,
    fr,
    de,
    pt,
    ru,
    zh,
    vi,
    hi,
    mr,
    pl
};

function normaliseLanguage(language?: string): string {
    return language?.toLowerCase().replace("_", "-").split("-")[0] || "en";
}

function formatTemplate(
    template: string,
    values: Record<string, string | number>
): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => (
        values[key] == undefined ? match : String(values[key])
    ));
}

export function getCoachPieceName(
    language: string | undefined,
    piece: string | undefined
): string {
    const locale = locales[normaliseLanguage(language)] || en;
    return locale.pieces[(piece || "p") as CoachCommentPiece] || "a piece";
}

export function getCoachSideName(
    language: string | undefined,
    colour: CoachCommentColour
): string {
    const locale = locales[normaliseLanguage(language)] || en;
    return locale.sides[colour];
}

export function formatCoachFeature(
    language: string | undefined,
    key: CoachFeatureKey,
    values: Record<string, string | number> = {}
): string {
    const locale = locales[normaliseLanguage(language)] || en;
    return formatTemplate(locale.features[key], values);
}

export function formatCoachDetail(
    language: string | undefined,
    key: CoachDetailKey,
    values: Record<string, string | number> = {}
): string {
    const locale = locales[normaliseLanguage(language)] || en;
    return formatTemplate(locale.details[key], values);
}
