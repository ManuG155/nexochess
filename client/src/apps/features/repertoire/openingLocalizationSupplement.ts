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
        "Center Partie": "Partie du centre",
        "Center Partie Accepté": "Partie du centre acceptée",
        "Center Partie Acceptée": "Partie du centre acceptée",
        "Czech Défense": "Défense tchèque",
        "Canard Ouverture": "Ouverture Canard"
    },
    de: {
        "Danish Gambit": "Dänisches Gambit",
        "Danish Gambit Angenommen": "Angenommenes Dänisches Gambit",
        "Center Partie": "Zentrumsspiel",
        "Center Partie Angenommen": "Angenommenes Zentrumsspiel",
        "Czech Verteidigung": "Tschechische Verteidigung",
        "Canard Eröffnung": "Canard-Eröffnung"
    },
    pt: {
        "Danish Gambito": "Gambito dinamarquês",
        "Danish Gambito Aceito": "Gambito dinamarquês aceito",
        "Danish Gambito Aceita": "Gambito dinamarquês aceito",
        "Center Partida": "Jogo do centro",
        "Center Partida Aceito": "Jogo do centro aceito",
        "Center Partida Aceita": "Jogo do centro aceito",
        "Czech Defesa": "Defesa tcheca",
        "Canard Abertura": "Abertura Canard"
    },
    ru: {
        "Danish Гамбит": "Датский гамбит",
        "Danish Гамбит Принятый": "Принятый датский гамбит",
        "Center Партия": "Центральная партия",
        "Center Партия Принятый": "Принятая центральная партия",
        "Czech Защита": "Чешская защита",
        "Canard Дебют": "Дебют Канар"
    },
    zh: {
        "Danish 弃兵": "丹麦弃兵",
        "Danish 弃兵 接受型": "丹麦弃兵接受型",
        "Danish 弃兵 接受": "丹麦弃兵接受型",
        "Center 开局": "中心开局",
        "Center 开局 接受型": "中心开局接受型",
        "Center 开局 接受": "中心开局接受型",
        "Czech 防御": "捷克防御",
        "Canard 开局": "Canard 开局"
    },
    vi: {
        "Danish Gambit": "Gambit Đan Mạch",
        "Danish Gambit Chấp nhận": "Gambit Đan Mạch chấp nhận",
        "Center Ván cờ": "Ván cờ Trung tâm",
        "Center Ván cờ Chấp nhận": "Ván cờ Trung tâm chấp nhận",
        "Czech Phòng thủ": "Phòng thủ Séc",
        "Canard Khai cuộc": "Khai cuộc Canard"
    },
    hi: {
        "Danish गैम्बिट": "डैनिश गैम्बिट",
        "Center गेम": "सेंटर गेम",
        "Czech डिफेंस": "चेक डिफेंस",
        "Canard ओपनिंग": "कैनार्ड ओपनिंग"
    },
    mr: {
        "Danish गॅम्बिट": "डॅनिश गँबिट",
        "Center गेम": "सेंटर गेम",
        "Czech डिफेन्स": "झेक बचाव",
        "Canard ओपनिंग": "कॅनार्ड ओपनिंग"
    },
    pl: {
        "Danish Gambit": "Gambit duński",
        "Danish Gambit Przyjęty": "Przyjęty gambit duński",
        "Center Partia": "Debiut centralny",
        "Center Partia Przyjęty": "Przyjęty debiut centralny",
        "Czech Obrona": "Obrona czeska",
        "Canard Debiut": "Debiut Canard"
    }
};

const DESCRIPTORS: Record<OpeningLang, Record<string, string>> = {
    en: {},
    es: { Danish: "danés", Czech: "checa", Center: "del centro" },
    fr: { Danish: "danois", Czech: "tchèque", Center: "du centre" },
    de: { Danish: "Dänisch", Czech: "Tschechisch", Center: "Zentrum" },
    pt: { Danish: "dinamarquês", Czech: "tcheca", Center: "do centro" },
    ru: { Danish: "датский", Czech: "чешская", Center: "центральная" },
    zh: { Danish: "丹麦", Czech: "捷克", Center: "中心" },
    vi: { Danish: "Đan Mạch", Czech: "Séc", Center: "Trung tâm" },
    hi: { Danish: "डैनिश", Czech: "चेक", Center: "सेंटर" },
    mr: { Danish: "डॅनिश", Czech: "झेक", Center: "मध्य" },
    pl: { Danish: "duński", Czech: "czeska", Center: "centralny" }
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

function polishSegment(segment: string, lang: OpeningLang) {
    const exact = EXACT[lang][segment];
    if (exact) return exact;

    let out = segment;
    if (lang == "es") {
        for (const noun of ["Gambito", "Defensa", "Apertura", "Ataque", "Sistema", "Partida"]) out = prefixTrailing(out, noun, lang);
    } else if (lang == "fr") {
        for (const noun of ["Gambit", "Défense", "Ouverture", "Attaque", "Système", "Partie"]) out = prefixTrailing(out, noun, lang);
    } else if (lang == "de") {
        for (const noun of ["Gambit", "Verteidigung", "Eröffnung", "Angriff", "System"]) out = hyphenateTrailing(out, noun, lang);
    } else if (lang == "pt") {
        for (const noun of ["Gambito", "Defesa", "Abertura", "Ataque", "Sistema", "Partida"]) out = prefixTrailing(out, noun, lang);
    } else if (lang == "ru") {
        for (const noun of ["Гамбит", "Защита", "Дебют", "Атака", "Система", "Партия"]) out = prefixTrailing(out, noun, lang);
    } else if (lang == "vi") {
        for (const noun of ["Gambit", "Phòng thủ", "Khai cuộc", "Tấn công", "Hệ thống", "Ván cờ"]) out = prefixTrailing(out, noun, lang);
    } else if (lang == "pl") {
        for (const noun of ["Gambit", "Obrona", "Debiut", "Atak", "System", "Partia"]) out = prefixTrailing(out, noun, lang);
    } else if (lang == "zh") {
        for (const [from, to] of Object.entries(DESCRIPTORS.zh)) {
            out = out.replace(new RegExp(`\\b${escaped(from)}\\b`, "g"), to);
        }
    }
    return EXACT[lang][out] || out;
}

export function applyOpeningSupplement(value: string, lang: OpeningLang) {
    if (lang == "en" || !value) return value;
    return value.split(":").map(part => polishSegment(part.trim(), lang)).join(": ");
}
