import i18next from "@/i18n";

import type {
    PuzzleCatalogue,
    PuzzleThemeCategory,
    PuzzleThemeSelection
} from "../types";

interface PuzzleThemeData {
    themes: string[];
    openingTags?: string[];
}

export const puzzleThemeCategories: PuzzleThemeCategory[] = [
    "all",
    "checkmate",
    "tactics",
    "attack",
    "defense",
    "advantage",
    "endgame",
    "opening",
    "phase",
    "length",
    "master"
];

const categoryThemes: Record<
    Exclude<PuzzleThemeCategory, "all" | "opening">,
    readonly string[]
> = {
    checkmate: [
        "mate",
        "mateIn1",
        "mateIn2",
        "mateIn3",
        "mateIn4",
        "mateIn5",
        "anastasiaMate",
        "arabianMate",
        "backRankMate",
        "balestraMate",
        "blindSwineMate",
        "bodenMate",
        "cornerMate",
        "doubleBishopMate",
        "dovetailMate",
        "epauletteMate",
        "hookMate",
        "killBoxMate",
        "morphysMate",
        "operaMate",
        "pillsburysMate",
        "smotheredMate",
        "swallowstailMate",
        "triangleMate",
        "vukovicMate"
    ],
    tactics: [
        "advancedPawn",
        "attraction",
        "capturingDefender",
        "castling",
        "clearance",
        "collinearMove",
        "deflection",
        "discoveredAttack",
        "discoveredCheck",
        "doubleCheck",
        "enPassant",
        "fork",
        "hangingPiece",
        "interference",
        "intermezzo",
        "pin",
        "promotion",
        "quietMove",
        "sacrifice",
        "skewer",
        "trappedPiece",
        "underPromotion",
        "xRayAttack",
        "zugzwang"
    ],
    attack: [
        "attackingF2F7",
        "exposedKing",
        "kingsideAttack",
        "queensideAttack"
    ],
    defense: [
        "defensiveMove",
        "equality"
    ],
    advantage: [
        "advantage",
        "crushing",
        "equality"
    ],
    endgame: [
        "endgame",
        "bishopEndgame",
        "knightEndgame",
        "pawnEndgame",
        "queenEndgame",
        "queenRookEndgame",
        "rookEndgame",
        "advancedPawn",
        "promotion",
        "underPromotion",
        "zugzwang"
    ],
    phase: [
        "opening",
        "middlegame",
        "endgame"
    ],
    length: [
        "oneMove",
        "short",
        "long",
        "veryLong"
    ],
    master: [
        "master",
        "masterVsMaster",
        "superGM"
    ]
};

type PuzzleLanguage =
    | "de"
    | "en"
    | "es"
    | "fr"
    | "hi"
    | "mr"
    | "pl"
    | "pt"
    | "ru"
    | "vi"
    | "zh";

const supportedPuzzleLanguages = new Set<PuzzleLanguage>([
    "de", "en", "es", "fr", "hi", "mr", "pl", "pt", "ru", "vi", "zh"
]);

function normalisePuzzleLanguage(language?: string): PuzzleLanguage {
    const base = language?.toLocaleLowerCase().split("-")[0] as
        PuzzleLanguage | undefined;

    return base && supportedPuzzleLanguages.has(base) ? base : "en";
}

function humaniseIdentifier(value: string) {
    return value
        .replaceAll("_", " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, letter => letter.toUpperCase())
        .replace(/\bKings\b/g, "King's")
        .replace(/\bQueens\b/g, "Queen's")
        .replace(/\bBishops\b/g, "Bishop's")
        .replace(/\bBirds\b/g, "Bird's")
        .replace(/\bAlekhines\b/g, "Alekhine's")
        .replace(/\bPhilidors\b/g, "Philidor's")
        .replace(/\bPetrovs\b/g, "Petrov's")
        .replace(/\bOwens\b/g, "Owen's");
}

const exactOpeningNames: Partial<
    Record<PuzzleLanguage, Record<string, string>>
> = {
    es: {
        Ruy_Lopez: "Apertura española",
        Sicilian_Defense: "Defensa siciliana",
        French_Defense: "Defensa francesa",
        Scandinavian_Defense: "Defensa escandinava",
        Dutch_Defense: "Defensa holandesa",
        English_Opening: "Apertura inglesa",
        Italian_Game: "Apertura italiana",
        Scotch_Game: "Apertura escocesa",
        Vienna_Game: "Apertura vienesa",
        Four_Knights_Game: "Apertura de los cuatro caballos",
        Three_Knights_Opening: "Apertura de los tres caballos",
        Bishops_Opening: "Apertura del alfil",
        Queens_Gambit: "Gambito de dama",
        Kings_Gambit: "Gambito de rey",
        Kings_Indian_Defense: "Defensa india de rey",
        Kings_Indian_Attack: "Ataque indio de rey",
        Queens_Indian_Defense: "Defensa india de dama",
        Kings_Pawn_Game: "Apertura de peón de rey",
        Kings_Pawn_Opening: "Apertura de peón de rey",
        Queens_Pawn_Game: "Apertura de peón de dama",
        Center_Game: "Apertura del centro",
        Petrov_Defense: "Defensa Petrov",
        Petrovs_Defense: "Defensa Petrov",
        Russian_Game: "Defensa rusa",
        Caro_Kann_Defense: "Defensa Caro-Kann",
        Alekhine_Defense: "Defensa Alekhine",
        Nimzo_Indian_Defense: "Defensa nimzoindia",
        Bogo_Indian_Defense: "Defensa bogoindia",
        Old_Indian_Defense: "Defensa india antigua",
        Grunfeld_Defense: "Defensa Grünfeld",
        Modern_Defense: "Defensa moderna",
        London_System: "Sistema Londres",
        Catalan_Opening: "Apertura catalana",
        Slav_Defense: "Defensa eslava",
        Semi_Slav_Defense: "Defensa semieslava"
    },
    pt: {
        Ruy_Lopez: "Abertura espanhola",
        Sicilian_Defense: "Defesa siciliana",
        French_Defense: "Defesa francesa",
        Scandinavian_Defense: "Defesa escandinava",
        Dutch_Defense: "Defesa holandesa",
        English_Opening: "Abertura inglesa",
        Italian_Game: "Abertura italiana",
        Scotch_Game: "Abertura escocesa",
        Vienna_Game: "Abertura vienense",
        Four_Knights_Game: "Abertura dos quatro cavalos",
        Three_Knights_Opening: "Abertura dos três cavalos",
        Bishops_Opening: "Abertura do bispo",
        Queens_Gambit: "Gambito da dama",
        Kings_Gambit: "Gambito do rei",
        Kings_Indian_Defense: "Defesa índia do rei",
        Kings_Indian_Attack: "Ataque índio do rei",
        Queens_Indian_Defense: "Defesa índia da dama",
        Kings_Pawn_Game: "Abertura do peão do rei",
        Kings_Pawn_Opening: "Abertura do peão do rei",
        Queens_Pawn_Game: "Abertura do peão da dama",
        Center_Game: "Abertura do centro",
        Petrov_Defense: "Defesa Petrov",
        Petrovs_Defense: "Defesa Petrov",
        Russian_Game: "Defesa russa",
        Caro_Kann_Defense: "Defesa Caro-Kann",
        Alekhine_Defense: "Defesa Alekhine",
        Nimzo_Indian_Defense: "Defesa nimzoíndia",
        Bogo_Indian_Defense: "Defesa bogoíndia",
        Old_Indian_Defense: "Defesa índia antiga",
        Grunfeld_Defense: "Defesa Grünfeld",
        Modern_Defense: "Defesa moderna",
        London_System: "Sistema Londres",
        Catalan_Opening: "Abertura catalã",
        Slav_Defense: "Defesa eslava",
        Semi_Slav_Defense: "Defesa semieslava"
    },
    fr: {
        Ruy_Lopez: "Partie espagnole",
        Sicilian_Defense: "Défense sicilienne",
        French_Defense: "Défense française",
        Scandinavian_Defense: "Défense scandinave",
        Dutch_Defense: "Défense hollandaise",
        English_Opening: "Ouverture anglaise",
        Italian_Game: "Partie italienne",
        Scotch_Game: "Partie écossaise",
        Vienna_Game: "Partie viennoise",
        Four_Knights_Game: "Partie des quatre cavaliers",
        Three_Knights_Opening: "Ouverture des trois cavaliers",
        Bishops_Opening: "Ouverture du fou",
        Queens_Gambit: "Gambit dame",
        Kings_Gambit: "Gambit du roi",
        Kings_Indian_Defense: "Défense est-indienne",
        Kings_Indian_Attack: "Attaque est-indienne",
        Queens_Indian_Defense: "Défense ouest-indienne",
        Kings_Pawn_Game: "Ouverture du pion roi",
        Kings_Pawn_Opening: "Ouverture du pion roi",
        Queens_Pawn_Game: "Ouverture du pion dame",
        Center_Game: "Partie du centre",
        Russian_Game: "Défense russe",
        Caro_Kann_Defense: "Défense Caro-Kann",
        Alekhine_Defense: "Défense Alekhine",
        Nimzo_Indian_Defense: "Défense nimzo-indienne",
        Bogo_Indian_Defense: "Défense bogo-indienne",
        Old_Indian_Defense: "Défense vieille-indienne",
        Modern_Defense: "Défense moderne",
        London_System: "Système de Londres",
        Catalan_Opening: "Ouverture catalane",
        Slav_Defense: "Défense slave",
        Semi_Slav_Defense: "Défense semi-slave"
    },
    de: {
        Ruy_Lopez: "Spanische Partie",
        Sicilian_Defense: "Sizilianische Verteidigung",
        French_Defense: "Französische Verteidigung",
        Scandinavian_Defense: "Skandinavische Verteidigung",
        Dutch_Defense: "Holländische Verteidigung",
        English_Opening: "Englische Eröffnung",
        Italian_Game: "Italienische Partie",
        Scotch_Game: "Schottische Partie",
        Vienna_Game: "Wiener Partie",
        Four_Knights_Game: "Vierspringerspiel",
        Three_Knights_Opening: "Dreispringerspiel",
        Bishops_Opening: "Läuferspiel",
        Queens_Gambit: "Damengambit",
        Kings_Gambit: "Königsgambit",
        Kings_Indian_Defense: "Königsindische Verteidigung",
        Kings_Indian_Attack: "Königsindischer Angriff",
        Queens_Indian_Defense: "Damenindische Verteidigung",
        Kings_Pawn_Game: "Königsbauernspiel",
        Kings_Pawn_Opening: "Königsbauernspiel",
        Queens_Pawn_Game: "Damenbauernspiel",
        Center_Game: "Mittelgambit",
        Russian_Game: "Russische Verteidigung",
        Caro_Kann_Defense: "Caro-Kann-Verteidigung",
        Alekhine_Defense: "Aljechin-Verteidigung",
        Nimzo_Indian_Defense: "Nimzoindische Verteidigung",
        Bogo_Indian_Defense: "Bogoindische Verteidigung",
        Old_Indian_Defense: "Altindische Verteidigung",
        Modern_Defense: "Moderne Verteidigung",
        London_System: "Londoner System",
        Catalan_Opening: "Katalanische Eröffnung",
        Slav_Defense: "Slawische Verteidigung",
        Semi_Slav_Defense: "Halbslawische Verteidigung"
    },
    ru: {
        Ruy_Lopez: "Испанская партия",
        Sicilian_Defense: "Сицилианская защита",
        French_Defense: "Французская защита",
        Scandinavian_Defense: "Скандинавская защита",
        Dutch_Defense: "Голландская защита",
        English_Opening: "Английское начало",
        Italian_Game: "Итальянская партия",
        Scotch_Game: "Шотландская партия",
        Vienna_Game: "Венская партия",
        Four_Knights_Game: "Дебют четырёх коней",
        Three_Knights_Opening: "Дебют трёх коней",
        Bishops_Opening: "Дебют слона",
        Queens_Gambit: "Ферзевый гамбит",
        Kings_Gambit: "Королевский гамбит",
        Kings_Indian_Defense: "Староиндийская защита",
        Kings_Indian_Attack: "Староиндийское начало",
        Queens_Indian_Defense: "Новоиндийская защита",
        Kings_Pawn_Game: "Дебют королевской пешки",
        Kings_Pawn_Opening: "Дебют королевской пешки",
        Queens_Pawn_Game: "Дебют ферзевой пешки",
        Center_Game: "Центральный дебют",
        Russian_Game: "Русская партия",
        Caro_Kann_Defense: "Защита Каро — Канн",
        Alekhine_Defense: "Защита Алехина",
        Nimzo_Indian_Defense: "Защита Нимцовича",
        Bogo_Indian_Defense: "Защита Боголюбова",
        Old_Indian_Defense: "Староиндийская защита",
        Grunfeld_Defense: "Защита Грюнфельда",
        Modern_Defense: "Современная защита",
        London_System: "Лондонская система",
        Catalan_Opening: "Каталонское начало",
        Slav_Defense: "Славянская защита",
        Semi_Slav_Defense: "Меранская система"
    },
    pl: {
        Ruy_Lopez: "Partia hiszpańska",
        Sicilian_Defense: "Obrona sycylijska",
        French_Defense: "Obrona francuska",
        Scandinavian_Defense: "Obrona skandynawska",
        Dutch_Defense: "Obrona holenderska",
        English_Opening: "Otwarcie angielskie",
        Italian_Game: "Partia włoska",
        Scotch_Game: "Partia szkocka",
        Vienna_Game: "Partia wiedeńska",
        Four_Knights_Game: "Debiut czterech skoczków",
        Three_Knights_Opening: "Debiut trzech skoczków",
        Bishops_Opening: "Debiut gońca",
        Queens_Gambit: "Gambit hetmański",
        Kings_Gambit: "Gambit królewski",
        Kings_Indian_Defense: "Obrona królewsko-indyjska",
        Kings_Indian_Attack: "Atak królewsko-indyjski",
        Queens_Indian_Defense: "Obrona hetmańsko-indyjska",
        Kings_Pawn_Game: "Debiut pionem królewskim",
        Kings_Pawn_Opening: "Debiut pionem królewskim",
        Queens_Pawn_Game: "Debiut pionem hetmańskim",
        Center_Game: "Debiut centralny",
        Russian_Game: "Partia rosyjska",
        Caro_Kann_Defense: "Obrona Caro-Kann",
        Alekhine_Defense: "Obrona Alechina",
        Nimzo_Indian_Defense: "Obrona Nimzo-indyjska",
        Bogo_Indian_Defense: "Obrona Bogo-indyjska",
        Old_Indian_Defense: "Obrona staroindyjska",
        Modern_Defense: "Obrona nowoczesna",
        London_System: "System londyński",
        Catalan_Opening: "Otwarcie katalońskie",
        Slav_Defense: "Obrona słowiańska",
        Semi_Slav_Defense: "Obrona półsłowiańska"
    },
    vi: {
        Ruy_Lopez: "Khai cuộc Tây Ban Nha",
        Sicilian_Defense: "Phòng thủ Sicilia",
        French_Defense: "Phòng thủ Pháp",
        Scandinavian_Defense: "Phòng thủ Scandinavia",
        Dutch_Defense: "Phòng thủ Hà Lan",
        English_Opening: "Khai cuộc Anh",
        Italian_Game: "Khai cuộc Ý",
        Scotch_Game: "Khai cuộc Scotland",
        Vienna_Game: "Khai cuộc Vienna",
        Four_Knights_Game: "Khai cuộc bốn mã",
        Three_Knights_Opening: "Khai cuộc ba mã",
        Bishops_Opening: "Khai cuộc tượng",
        Queens_Gambit: "Gambit hậu",
        Kings_Gambit: "Gambit vua",
        Kings_Indian_Defense: "Phòng thủ Ấn Độ cánh vua",
        Kings_Indian_Attack: "Tấn công Ấn Độ cánh vua",
        Queens_Indian_Defense: "Phòng thủ Ấn Độ cánh hậu",
        Kings_Pawn_Game: "Khai cuộc tốt vua",
        Kings_Pawn_Opening: "Khai cuộc tốt vua",
        Queens_Pawn_Game: "Khai cuộc tốt hậu",
        Center_Game: "Khai cuộc trung tâm",
        Russian_Game: "Phòng thủ Nga",
        Caro_Kann_Defense: "Phòng thủ Caro-Kann",
        Alekhine_Defense: "Phòng thủ Alekhine",
        Nimzo_Indian_Defense: "Phòng thủ Nimzo-Ấn Độ",
        Bogo_Indian_Defense: "Phòng thủ Bogo-Ấn Độ",
        Old_Indian_Defense: "Phòng thủ Ấn Độ cổ",
        Modern_Defense: "Phòng thủ hiện đại",
        London_System: "Hệ thống London",
        Catalan_Opening: "Khai cuộc Catalan",
        Slav_Defense: "Phòng thủ Slav",
        Semi_Slav_Defense: "Phòng thủ bán Slav"
    },
    zh: {
        Ruy_Lopez: "西班牙开局",
        Sicilian_Defense: "西西里防御",
        French_Defense: "法兰西防御",
        Scandinavian_Defense: "斯堪的纳维亚防御",
        Dutch_Defense: "荷兰防御",
        English_Opening: "英格兰开局",
        Italian_Game: "意大利开局",
        Scotch_Game: "苏格兰开局",
        Vienna_Game: "维也纳开局",
        Four_Knights_Game: "四马开局",
        Three_Knights_Opening: "三马开局",
        Bishops_Opening: "象开局",
        Queens_Gambit: "后翼弃兵",
        Kings_Gambit: "王翼弃兵",
        Kings_Indian_Defense: "王翼印度防御",
        Kings_Indian_Attack: "王翼印度进攻",
        Queens_Indian_Defense: "后翼印度防御",
        Kings_Pawn_Game: "王兵开局",
        Kings_Pawn_Opening: "王兵开局",
        Queens_Pawn_Game: "后兵开局",
        Center_Game: "中心开局",
        Russian_Game: "俄罗斯防御",
        Caro_Kann_Defense: "卡罗-康防御",
        Alekhine_Defense: "阿廖欣防御",
        Nimzo_Indian_Defense: "尼姆佐印度防御",
        Bogo_Indian_Defense: "博戈印度防御",
        Old_Indian_Defense: "古印度防御",
        Modern_Defense: "现代防御",
        London_System: "伦敦体系",
        Catalan_Opening: "卡塔兰开局",
        Slav_Defense: "斯拉夫防御",
        Semi_Slav_Defense: "半斯拉夫防御"
    },
    hi: {
        Ruy_Lopez: "स्पैनिश ओपनिंग",
        Sicilian_Defense: "सिसिलियन रक्षा",
        French_Defense: "फ्रेंच रक्षा",
        Scandinavian_Defense: "स्कैंडिनेवियन रक्षा",
        Dutch_Defense: "डच रक्षा",
        English_Opening: "इंग्लिश ओपनिंग",
        Italian_Game: "इटैलियन ओपनिंग",
        Scotch_Game: "स्कॉच ओपनिंग",
        Vienna_Game: "वियना ओपनिंग",
        Four_Knights_Game: "चार घोड़ों की ओपनिंग",
        Three_Knights_Opening: "तीन घोड़ों की ओपनिंग",
        Bishops_Opening: "ऊँट की ओपनिंग",
        Queens_Gambit: "वज़ीर का गैम्बिट",
        Kings_Gambit: "राजा का गैम्बिट",
        Kings_Indian_Defense: "किंग्स इंडियन रक्षा",
        Kings_Indian_Attack: "किंग्स इंडियन आक्रमण",
        Queens_Indian_Defense: "क्वीन्स इंडियन रक्षा",
        Kings_Pawn_Game: "राजा के प्यादे की ओपनिंग",
        Kings_Pawn_Opening: "राजा के प्यादे की ओपनिंग",
        Queens_Pawn_Game: "वज़ीर के प्यादे की ओपनिंग",
        Center_Game: "केंद्र की ओपनिंग",
        Russian_Game: "रूसी रक्षा",
        Caro_Kann_Defense: "कारो-कान रक्षा",
        Alekhine_Defense: "अलेखिन रक्षा",
        Nimzo_Indian_Defense: "निम्ज़ो-इंडियन रक्षा",
        Bogo_Indian_Defense: "बोगो-इंडियन रक्षा",
        Old_Indian_Defense: "ओल्ड इंडियन रक्षा",
        Modern_Defense: "आधुनिक रक्षा",
        London_System: "लंदन प्रणाली",
        Catalan_Opening: "कैटलन ओपनिंग",
        Slav_Defense: "स्लाव रक्षा",
        Semi_Slav_Defense: "सेमी-स्लाव रक्षा"
    },
    mr: {
        Ruy_Lopez: "स्पॅनिश ओपनिंग",
        Sicilian_Defense: "सिसिलियन बचाव",
        French_Defense: "फ्रेंच बचाव",
        Scandinavian_Defense: "स्कँडिनेव्हियन बचाव",
        Dutch_Defense: "डच बचाव",
        English_Opening: "इंग्लिश ओपनिंग",
        Italian_Game: "इटालियन ओपनिंग",
        Scotch_Game: "स्कॉच ओपनिंग",
        Vienna_Game: "व्हिएन्ना ओपनिंग",
        Four_Knights_Game: "चार घोड्यांची ओपनिंग",
        Three_Knights_Opening: "तीन घोड्यांची ओपनिंग",
        Bishops_Opening: "उंटाची ओपनिंग",
        Queens_Gambit: "वजीराचा गॅम्बिट",
        Kings_Gambit: "राजाचा गॅम्बिट",
        Kings_Indian_Defense: "किंग्स इंडियन बचाव",
        Kings_Indian_Attack: "किंग्स इंडियन हल्ला",
        Queens_Indian_Defense: "क्वीन्स इंडियन बचाव",
        Kings_Pawn_Game: "राजाच्या प्याद्याची ओपनिंग",
        Kings_Pawn_Opening: "राजाच्या प्याद्याची ओपनिंग",
        Queens_Pawn_Game: "वजीराच्या प्याद्याची ओपनिंग",
        Center_Game: "मध्य ओपनिंग",
        Russian_Game: "रशियन बचाव",
        Caro_Kann_Defense: "कारो-कान बचाव",
        Alekhine_Defense: "अलेखिन बचाव",
        Nimzo_Indian_Defense: "निम्झो-इंडियन बचाव",
        Bogo_Indian_Defense: "बोगो-इंडियन बचाव",
        Old_Indian_Defense: "ओल्ड इंडियन बचाव",
        Modern_Defense: "आधुनिक बचाव",
        London_System: "लंडन प्रणाली",
        Catalan_Opening: "कॅटलन ओपनिंग",
        Slav_Defense: "स्लाव बचाव",
        Semi_Slav_Defense: "सेमी-स्लाव बचाव"
    }
};

interface OpeningGrammar {
    accepted: string;
    attack: (name: string) => string;
    countergambit: (name: string) => string;
    declined: string;
    defense: (name: string) => string;
    game: (name: string) => string;
    gambit: (name: string) => string;
    opening: (name: string) => string;
    system: (name: string) => string;
}

const openingGrammar: Record<PuzzleLanguage, OpeningGrammar> = {
    en: {
        accepted: "Accepted", declined: "Declined",
        attack: name => `${name} Attack`,
        countergambit: name => `${name} Countergambit`,
        defense: name => `${name} Defense`,
        game: name => `${name} Game`,
        gambit: name => `${name} Gambit`,
        opening: name => `${name} Opening`,
        system: name => `${name} System`
    },
    es: {
        accepted: "aceptado", declined: "rechazado",
        attack: name => `Ataque ${name}`,
        countergambit: name => `Contragambito ${name}`,
        defense: name => `Defensa ${name}`,
        game: name => `Apertura ${name}`,
        gambit: name => `Gambito ${name}`,
        opening: name => `Apertura ${name}`,
        system: name => `Sistema ${name}`
    },
    pt: {
        accepted: "aceite", declined: "recusado",
        attack: name => `Ataque ${name}`,
        countergambit: name => `Contragambito ${name}`,
        defense: name => `Defesa ${name}`,
        game: name => `Abertura ${name}`,
        gambit: name => `Gambito ${name}`,
        opening: name => `Abertura ${name}`,
        system: name => `Sistema ${name}`
    },
    fr: {
        accepted: "accepté", declined: "refusé",
        attack: name => `Attaque ${name}`,
        countergambit: name => `Contre-gambit ${name}`,
        defense: name => `Défense ${name}`,
        game: name => `Partie ${name}`,
        gambit: name => `Gambit ${name}`,
        opening: name => `Ouverture ${name}`,
        system: name => `Système ${name}`
    },
    de: {
        accepted: "angenommen", declined: "abgelehnt",
        attack: name => `${name}-Angriff`,
        countergambit: name => `${name}-Gegengambit`,
        defense: name => `${name}-Verteidigung`,
        game: name => `${name}-Partie`,
        gambit: name => `${name}-Gambit`,
        opening: name => `${name}-Eröffnung`,
        system: name => `${name}-System`
    },
    ru: {
        accepted: "принятый", declined: "отказанный",
        attack: name => `Атака ${name}`,
        countergambit: name => `Контргамбит ${name}`,
        defense: name => `Защита ${name}`,
        game: name => `Партия ${name}`,
        gambit: name => `Гамбит ${name}`,
        opening: name => `Дебют ${name}`,
        system: name => `Система ${name}`
    },
    pl: {
        accepted: "przyjęty", declined: "odrzucony",
        attack: name => `Atak ${name}`,
        countergambit: name => `Kontrgambit ${name}`,
        defense: name => `Obrona ${name}`,
        game: name => `Partia ${name}`,
        gambit: name => `Gambit ${name}`,
        opening: name => `Otwarcie ${name}`,
        system: name => `System ${name}`
    },
    vi: {
        accepted: "chấp nhận", declined: "từ chối",
        attack: name => `Tấn công ${name}`,
        countergambit: name => `Phản gambit ${name}`,
        defense: name => `Phòng thủ ${name}`,
        game: name => `Khai cuộc ${name}`,
        gambit: name => `Gambit ${name}`,
        opening: name => `Khai cuộc ${name}`,
        system: name => `Hệ thống ${name}`
    },
    zh: {
        accepted: "接受", declined: "拒绝",
        attack: name => `${name}进攻`,
        countergambit: name => `${name}反弃兵`,
        defense: name => `${name}防御`,
        game: name => `${name}开局`,
        gambit: name => `${name}弃兵`,
        opening: name => `${name}开局`,
        system: name => `${name}体系`
    },
    hi: {
        accepted: "स्वीकृत", declined: "अस्वीकृत",
        attack: name => `${name} आक्रमण`,
        countergambit: name => `${name} काउंटर गैम्बिट`,
        defense: name => `${name} रक्षा`,
        game: name => `${name} ओपनिंग`,
        gambit: name => `${name} गैम्बिट`,
        opening: name => `${name} ओपनिंग`,
        system: name => `${name} प्रणाली`
    },
    mr: {
        accepted: "स्वीकारलेला", declined: "नाकारलेला",
        attack: name => `${name} हल्ला`,
        countergambit: name => `${name} काउंटर गॅम्बिट`,
        defense: name => `${name} बचाव`,
        game: name => `${name} ओपनिंग`,
        gambit: name => `${name} गॅम्बिट`,
        opening: name => `${name} ओपनिंग`,
        system: name => `${name} प्रणाली`
    }
};

function localiseOpeningBase(name: string, language: PuzzleLanguage) {
    const replacements: Partial<Record<PuzzleLanguage, Record<string, string>>> = {
        es: { English: "inglesa", French: "francesa", Sicilian: "siciliana", Scandinavian: "escandinava", Dutch: "holandesa", Italian: "italiana", Danish: "danés", Latvian: "letón", Hungarian: "húngara", Polish: "polaca", Czech: "checa", Mexican: "mexicana", Modern: "moderna", Indian: "india", Old: "antigua", East: "oriental", "King's": "de rey", "Queen's": "de dama", "Bishop's": "del alfil" },
        pt: { English: "inglesa", French: "francesa", Sicilian: "siciliana", Scandinavian: "escandinava", Dutch: "holandesa", Italian: "italiana", Danish: "dinamarquês", Latvian: "letão", Hungarian: "húngara", Polish: "polaca", Czech: "checa", Mexican: "mexicana", Modern: "moderna", Indian: "índia", Old: "antiga", East: "oriental", "King's": "do rei", "Queen's": "da dama", "Bishop's": "do bispo" },
        fr: { English: "anglaise", French: "française", Sicilian: "sicilienne", Scandinavian: "scandinave", Dutch: "hollandaise", Italian: "italienne", Danish: "danois", Latvian: "letton", Hungarian: "hongroise", Polish: "polonaise", Czech: "tchèque", Mexican: "mexicaine", Modern: "moderne", Indian: "indienne", Old: "ancienne", East: "orientale", "King's": "du roi", "Queen's": "de la dame", "Bishop's": "du fou" },
        de: { English: "Englisch", French: "Französisch", Sicilian: "Sizilianisch", Scandinavian: "Skandinavisch", Dutch: "Holländisch", Italian: "Italienisch", Danish: "Dänisch", Latvian: "Lettisch", Hungarian: "Ungarisch", Polish: "Polnisch", Czech: "Tschechisch", Mexican: "Mexikanisch", Modern: "Modern", Indian: "Indisch", Old: "Alt", East: "Ost", "King's": "Königs", "Queen's": "Damen", "Bishop's": "Läufer" },
        ru: { English: "английская", French: "французская", Sicilian: "сицилианская", Scandinavian: "скандинавская", Dutch: "голландская", Italian: "итальянская", Danish: "датский", Latvian: "латышский", Hungarian: "венгерская", Polish: "польская", Czech: "чешская", Mexican: "мексиканская", Modern: "современная", Indian: "индийская", Old: "старая", East: "восточная", "King's": "королевский", "Queen's": "ферзевый", "Bishop's": "слоновый" },
        pl: { English: "angielska", French: "francuska", Sicilian: "sycylijska", Scandinavian: "skandynawska", Dutch: "holenderska", Italian: "włoska", Danish: "duński", Latvian: "łotewski", Hungarian: "węgierska", Polish: "polska", Czech: "czeska", Mexican: "meksykańska", Modern: "nowoczesna", Indian: "indyjska", Old: "stara", East: "wschodnia", "King's": "królewski", "Queen's": "hetmański", "Bishop's": "gońca" },
        vi: { English: "Anh", French: "Pháp", Sicilian: "Sicilia", Scandinavian: "Scandinavia", Dutch: "Hà Lan", Italian: "Ý", Danish: "Đan Mạch", Latvian: "Latvia", Hungarian: "Hungary", Polish: "Ba Lan", Czech: "Séc", Mexican: "Mexico", Modern: "hiện đại", Indian: "Ấn Độ", Old: "cổ", East: "phía Đông", "King's": "cánh vua", "Queen's": "cánh hậu", "Bishop's": "tượng" },
        zh: { English: "英格兰", French: "法兰西", Sicilian: "西西里", Scandinavian: "斯堪的纳维亚", Dutch: "荷兰", Italian: "意大利", Danish: "丹麦", Latvian: "拉脱维亚", Hungarian: "匈牙利", Polish: "波兰", Czech: "捷克", Mexican: "墨西哥", Modern: "现代", Indian: "印度", Old: "古", East: "东印度", "King's": "王翼", "Queen's": "后翼", "Bishop's": "象" },
        hi: { English: "इंग्लिश", French: "फ्रेंच", Sicilian: "सिसिलियन", Scandinavian: "स्कैंडिनेवियन", Dutch: "डच", Italian: "इटैलियन", Danish: "डेनिश", Latvian: "लातवियन", Hungarian: "हंगेरियन", Polish: "पोलिश", Czech: "चेक", Mexican: "मेक्सिकन", Modern: "आधुनिक", Indian: "इंडियन", Old: "ओल्ड", East: "ईस्ट", "King's": "किंग्स", "Queen's": "क्वीन्स", "Bishop's": "बिशप्स" },
        mr: { English: "इंग्लिश", French: "फ्रेंच", Sicilian: "सिसिलियन", Scandinavian: "स्कँडिनेव्हियन", Dutch: "डच", Italian: "इटालियन", Danish: "डॅनिश", Latvian: "लात्वियन", Hungarian: "हंगेरियन", Polish: "पोलिश", Czech: "चेक", Mexican: "मेक्सिकन", Modern: "आधुनिक", Indian: "इंडियन", Old: "ओल्ड", East: "ईस्ट", "King's": "किंग्स", "Queen's": "क्वीन्स", "Bishop's": "बिशप्स" }
    };

    const words = replacements[language];
    if (!words) return name;

    return name.split(" ").map(word => words[word] || word).join(" ");
}

function applyOpeningGrammar(value: string, language: PuzzleLanguage) {
    const grammar = openingGrammar[language];
    let name = humaniseIdentifier(value);
    let qualifier = "";

    if (name.endsWith(" Accepted")) {
        name = name.slice(0, -9);
        qualifier = grammar.accepted;
    } else if (name.endsWith(" Declined")) {
        name = name.slice(0, -9);
        qualifier = grammar.declined;
    }

    const descriptors: Array<[string, keyof Pick<OpeningGrammar,
        "attack" | "countergambit" | "defense" | "game" | "gambit" |
        "opening" | "system">]> = [
        [" Countergambit", "countergambit"],
        [" Defense", "defense"],
        [" Opening", "opening"],
        [" Attack", "attack"],
        [" Gambit", "gambit"],
        [" Game", "game"],
        [" System", "system"]
    ];

    let translated = localiseOpeningBase(name, language);

    for (const [suffix, formatter] of descriptors) {
        if (!name.endsWith(suffix)) continue;

        const base = localiseOpeningBase(
            name.slice(0, -suffix.length),
            language
        );
        translated = grammar[formatter](base);
        break;
    }

    return qualifier ? `${translated} — ${qualifier}` : translated;
}

export interface PuzzleFilterOption {
    kind: "theme" | "opening";
    value: string;
    count: number;
}

export function formatPuzzleTheme(
    value: string,
    language = i18next.resolvedLanguage || i18next.language || "en"
) {
    const translate = i18next.getFixedT(
        normalisePuzzleLanguage(language),
        "puzzles"
    );

    return translate(`themeLabels.${value}`, {
        defaultValue: humaniseIdentifier(value)
    });
}

export function formatOpeningTag(
    value: string,
    language = i18next.resolvedLanguage || i18next.language || "en"
) {
    const resolvedLanguage = normalisePuzzleLanguage(language);
    const exact = exactOpeningNames[resolvedLanguage]?.[value];

    return exact || applyOpeningGrammar(value, resolvedLanguage);
}

function isMainOpeningTag(
    value: string,
    availableTags: ReadonlySet<string>
) {
    const parts = value.split("_");

    /*
     * Lichess stores opening tags hierarchically. A puzzle from the Cochrane
     * Gambit, for example, includes both `Russian_Game` and
     * `Russian_Game_Cochrane_Gambit`. Only expose the shortest available
     * ancestor: selecting it still matches every line below that opening.
     */
    for (let length = 1; length < parts.length; length++) {
        if (availableTags.has(parts.slice(0, length).join("_"))) {
            return false;
        }
    }

    return true;
}

export function puzzleMatchesCategory(
    puzzle: PuzzleThemeData,
    category: PuzzleThemeCategory
) {
    if (category == "all") return true;

    if (category == "opening") {
        return puzzle.themes.includes("opening")
            || Boolean(puzzle.openingTags?.length);
    }

    return categoryThemes[category].some(theme => (
        puzzle.themes.includes(theme)
    ));
}

export function puzzleMatchesThemeSelection(
    puzzle: PuzzleThemeData,
    selection: PuzzleThemeSelection
) {
    if (selection.kind == "opening" && selection.value) {
        return puzzle.openingTags?.includes(selection.value) || false;
    }

    if (selection.kind == "theme" && selection.value) {
        return puzzle.themes.includes(selection.value);
    }

    return puzzleMatchesCategory(puzzle, selection.category);
}

export function getPuzzleFilterOptions(
    catalogue: PuzzleCatalogue | undefined,
    category: PuzzleThemeCategory
): PuzzleFilterOption[] {
    if (!catalogue || category == "all") return [];

    if (category == "opening") {
        const availableTags = new Set(
            catalogue.openingTags.map(({ value }) => value)
        );

        return catalogue.openingTags
            .filter(({ value }) => (
                isMainOpeningTag(value, availableTags)
            ))
            .map(({ value, count }) => ({
                kind: "opening" as const,
                value,
                count
            }))
            .sort((left, right) => (
                right.count - left.count
                || formatOpeningTag(left.value)
                    .localeCompare(formatOpeningTag(right.value))
            ));
    }

    const counts = new Map(
        catalogue.themes.map(item => [item.value, item.count])
    );

    categoryThemes[category].forEach(theme => {
        if (!counts.has(theme)) counts.set(theme, 0);
    });

    return categoryThemes[category]
        .map(value => ({
            kind: "theme" as const,
            value,
            count: counts.get(value) || 0
        }))
        .filter(option => option.count > 0)
        .sort((left, right) => (
            right.count - left.count
            || left.value.localeCompare(right.value)
        ));
}

export function getVisiblePuzzleThemes(puzzle: PuzzleThemeData) {
    const hiddenThemes = new Set([
        "advantage",
        "crushing",
        "master",
        "masterVsMaster",
        "middlegame",
        "oneMove",
        "opening",
        "short",
        "long",
        "superGM",
        "veryLong"
    ]);

    return puzzle.themes
        .filter(theme => !hiddenThemes.has(theme))
        .slice(0, 3);
}
