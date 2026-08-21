export type OpeningLang = "en" | "es" | "fr" | "de" | "pt" | "ru" | "zh" | "vi" | "hi" | "mr" | "pl";

type ExactMap = Record<string, string>;

/*
 * The main localizer already translates known families and standard opening
 * descriptors. This pass deliberately works on complete tokens/segments only.
 * Never replace substrings here: that was the source of forms such as
 * "Gambitoo" and of half-translated word order such as "Czech Defensa".
 */
const EXACT: Record<OpeningLang, ExactMap> = {
    en: {},
    es: {
        "Danish Gambito": "Gambito danés",
        "Danish Gambito Aceptado": "Gambito danés aceptado",
        "Danish Gambito Aceptada": "Gambito danés aceptado",
        "Scotch Gambito": "Gambito escocés",
        "Center Partida": "Apertura del centro",
        "Center Partida Aceptado": "Apertura del centro aceptada",
        "Center Partida Aceptada": "Apertura del centro aceptada",
        "Czech Defensa": "Defensa checa",
        "Canard Apertura": "Apertura Canard"
    },
    fr: {
        "Danish Gambit": "Gambit danois",
        "Danish Gambit Accepté": "Gambit danois accepté",
        "Danish Gambit Acceptée": "Gambit danois accepté",
        "Scotch Gambit": "Gambit écossais",
        "Center Partie": "Partie du centre",
        "Center Partie Accepté": "Partie du centre acceptée",
        "Center Partie Acceptée": "Partie du centre acceptée",
        "Czech Défense": "Défense tchèque",
        "Canard Ouverture": "Ouverture Canard"
    },
    de: {
        "Danish Gambit": "Dänisches Gambit",
        "Danish Gambit Angenommen": "Angenommenes Dänisches Gambit",
        "Scotch Gambit": "Schottisches Gambit",
        "Center Partie": "Zentrumsspiel",
        "Center Partie Angenommen": "Angenommenes Zentrumsspiel",
        "Czech Verteidigung": "Tschechische Verteidigung",
        "Canard Eröffnung": "Canard-Eröffnung"
    },
    pt: {
        "Danish Gambito": "Gambito dinamarquês",
        "Danish Gambito Aceito": "Gambito dinamarquês aceito",
        "Danish Gambito Aceita": "Gambito dinamarquês aceito",
        "Scotch Gambito": "Gambito escocês",
        "Center Partida": "Jogo do centro",
        "Center Partida Aceito": "Jogo do centro aceito",
        "Center Partida Aceita": "Jogo do centro aceito",
        "Czech Defesa": "Defesa tcheca",
        "Canard Abertura": "Abertura Canard"
    },
    ru: {
        "Danish Гамбит": "Датский гамбит",
        "Danish Гамбит Принятый": "Принятый датский гамбит",
        "Scotch Гамбит": "Шотландский гамбит",
        "Center Партия": "Центральная партия",
        "Center Партия Принятый": "Принятая центральная партия",
        "Czech Защита": "Чешская защита",
        "Canard Дебют": "Дебют Канар"
    },
    zh: {
        "Danish 弃兵": "丹麦弃兵",
        "Danish 弃兵 接受型": "丹麦弃兵接受型",
        "Danish 弃兵 接受": "丹麦弃兵接受型",
        "Scotch 弃兵": "苏格兰弃兵",
        "Center 开局": "中心开局",
        "Center 开局 接受型": "中心开局接受型",
        "Center 开局 接受": "中心开局接受型",
        "Czech 防御": "捷克防御",
        "Canard 开局": "Canard 开局"
    },
    vi: {
        "Danish Gambit": "Gambit Đan Mạch",
        "Danish Gambit Chấp nhận": "Gambit Đan Mạch chấp nhận",
        "Scotch Gambit": "Gambit Scotland",
        "Center Ván cờ": "Ván cờ Trung tâm",
        "Center Ván cờ Chấp nhận": "Ván cờ Trung tâm chấp nhận",
        "Czech Phòng thủ": "Phòng thủ Séc",
        "Canard Khai cuộc": "Khai cuộc Canard"
    },
    hi: {
        "Danish गैम्बिट": "डैनिश गैम्बिट",
        "Scotch गैम्बिट": "स्कॉच गैम्बिट",
        "Center गेम": "सेंटर गेम",
        "Czech डिफेंस": "चेक डिफेंस",
        "Canard ओपनिंग": "कैनार्ड ओपनिंग"
    },
    mr: {
        "Danish गॅम्बिट": "डॅनिश गँबिट",
        "Scotch गॅम्बिट": "स्कॉच गँबिट",
        "Center गेम": "सेंटर गेम",
        "Czech डिफेन्स": "झेक बचाव",
        "Canard ओपनिंग": "कॅनार्ड ओपनिंग"
    },
    pl: {
        "Danish Gambit": "Gambit duński",
        "Danish Gambit Przyjęty": "Przyjęty gambit duński",
        "Scotch Gambit": "Gambit szkocki",
        "Center Partia": "Debiut centralny",
        "Center Partia Przyjęty": "Przyjęty debiut centralny",
        "Czech Obrona": "Obrona czeska",
        "Canard Debiut": "Debiut Canard"
    }
};

const DESCRIPTORS: Record<OpeningLang, Record<string, string>> = {
    en: {},
    es: { Danish: "danés", Scotch: "escocés", Czech: "checa", Center: "del centro", Kingside: "del flanco de rey", Queenside: "del flanco de dama", "Queen's Indian": "india de dama", "Pseudo Queen's Indian": "pseudoindia de dama" },
    fr: { Danish: "danois", Scotch: "écossais", Czech: "tchèque", Center: "du centre", Kingside: "aile roi", Queenside: "aile dame", "Queen's Indian": "ouest-indienne", "Pseudo Queen's Indian": "pseudo-ouest-indienne" },
    de: { Danish: "Dänisch", Scotch: "Schottisch", Czech: "Tschechisch", Center: "Zentrum", Kingside: "Königsflügel", Queenside: "Damenflügel", "Queen's Indian": "Damenindisch", "Pseudo Queen's Indian": "Pseudo-Damenindisch" },
    pt: { Danish: "dinamarquês", Scotch: "escocês", Czech: "tcheca", Center: "do centro", Kingside: "da ala do rei", Queenside: "da ala da dama", "Queen's Indian": "índia da dama", "Pseudo Queen's Indian": "pseudoíndia da dama" },
    ru: { Danish: "датский", Scotch: "шотландский", Czech: "чешская", Center: "центральная", Kingside: "королевский фланг", Queenside: "ферзевый фланг", "Queen's Indian": "новоиндийская", "Pseudo Queen's Indian": "псевдоновоиндийская" },
    zh: { Danish: "丹麦", Scotch: "苏格兰", Czech: "捷克", Center: "中心", Kingside: "王翼", Queenside: "后翼", "Queen's Indian": "后翼印度", "Pseudo Queen's Indian": "伪后翼印度" },
    vi: { Danish: "Đan Mạch", Scotch: "Scotland", Czech: "Séc", Center: "Trung tâm", Kingside: "cánh vua", Queenside: "cánh hậu", "Queen's Indian": "Ấn Độ Hậu", "Pseudo Queen's Indian": "giả Ấn Độ Hậu" },
    hi: { Danish: "डैनिश", Scotch: "स्कॉच", Czech: "चेक", Center: "सेंटर", Kingside: "किंगसाइड", Queenside: "क्वीनसाइड", "Queen's Indian": "क्वीन्स इंडियन", "Pseudo Queen's Indian": "स्यूडो क्वीन्स इंडियन" },
    mr: { Danish: "डॅनिश", Scotch: "स्कॉच", Czech: "झेक", Center: "मध्य", Kingside: "किंगसाइड", Queenside: "क्वीनसाइड", "Queen's Indian": "क्वीन्स इंडियन", "Pseudo Queen's Indian": "स्यूडो क्वीन्स इंडियन" },
    pl: { Danish: "duński", Scotch: "szkocki", Czech: "czeska", Center: "centralny", Kingside: "skrzydło królewskie", Queenside: "skrzydło hetmańskie", "Queen's Indian": "hetmańsko-indyjska", "Pseudo Queen's Indian": "pseudohetmańsko-indyjska" }
};

const WITH_WORD: Record<OpeningLang, string> = {
    en: "with", es: "con", fr: "avec", de: "mit", pt: "com", ru: "с", zh: "含", vi: "với", hi: "के साथ", mr: "सह", pl: "z"
};

function descriptor(value: string, lang: OpeningLang) {
    return DESCRIPTORS[lang][value] || value;
}

function escaped(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function prefixTrailing(segment: string, noun: string, lang: OpeningLang) {
    const match = segment.match(new RegExp(`^(.+?)\\s+${escaped(noun)}$`));
    if (!match) return segment;
    return `${noun} ${descriptor(match[1], lang)}`;
}

function hyphenateTrailing(segment: string, noun: string, lang: OpeningLang) {
    const match = segment.match(new RegExp(`^(.+?)\\s+${escaped(noun)}$`));
    if (!match) return segment;
    return `${descriptor(match[1], lang)}-${noun}`;
}

function translateWithSegment(segment: string, lang: OpeningLang) {
    const match = segment.match(/^with\s+(.+)$/i);
    if (!match) return segment;
    if (lang == "hi") return `${match[1]} ${WITH_WORD.hi}`;
    if (lang == "mr") return `${match[1]} ${WITH_WORD.mr}`;
    return `${WITH_WORD[lang]} ${match[1]}`;
}

function polishSegment(segment: string, lang: OpeningLang) {
    const exact = EXACT[lang][segment];
    if (exact) return exact;

    let out = translateWithSegment(segment, lang);
    if (lang == "es") {
        for (const noun of ["Gambito", "Defensa", "Apertura", "Ataque", "Sistema", "Partida", "Variante"]) out = prefixTrailing(out, noun, lang);
    } else if (lang == "fr") {
        for (const noun of ["Gambit", "Défense", "Ouverture", "Attaque", "Système", "Partie", "Variante"]) out = prefixTrailing(out, noun, lang);
    } else if (lang == "de") {
        for (const noun of ["Gambit", "Verteidigung", "Eröffnung", "Angriff", "System", "Variante"]) out = hyphenateTrailing(out, noun, lang);
    } else if (lang == "pt") {
        for (const noun of ["Gambito", "Defesa", "Abertura", "Ataque", "Sistema", "Partida", "Variante"]) out = prefixTrailing(out, noun, lang);
    } else if (lang == "ru") {
        for (const noun of ["Гамбит", "Защита", "Дебют", "Атака", "Система", "Партия", "Вариант"]) out = prefixTrailing(out, noun, lang);
    } else if (lang == "vi") {
        for (const noun of ["Gambit", "Phòng thủ", "Khai cuộc", "Tấn công", "Hệ thống", "Ván cờ", "Biến thể"]) out = prefixTrailing(out, noun, lang);
    } else if (lang == "pl") {
        for (const noun of ["Gambit", "Obrona", "Debiut", "Atak", "System", "Partia", "Wariant"]) out = prefixTrailing(out, noun, lang);
    } else if (lang == "zh") {
        for (const [from, to] of Object.entries(DESCRIPTORS.zh)) {
            out = out.replace(new RegExp(`\\b${escaped(from)}\\b`, "g"), to);
        }
    }
    return EXACT[lang][out] || out;
}

export function applyOpeningSupplement(value: string, lang: OpeningLang) {
    if (lang == "en" || !value) return value;
    return value
        .split(":")
        .map(part => part
            .split(",")
            .map(segment => polishSegment(segment.trim(), lang))
            .join(", "))
        .join(": ");
}
