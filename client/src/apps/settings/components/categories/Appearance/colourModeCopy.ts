export interface ColourModeCopy {
    title: string;
    description: string;
    dark: string;
    light: string;
}

const copy: Record<string, ColourModeCopy> = {
    en: {
        title: "Interface theme",
        description: "Choose the light or dark appearance for all NexoChess pages. The chessboard keeps its own selected colours.",
        dark: "Dark",
        light: "Light"
    },
    es: {
        title: "Tema de la interfaz",
        description: "Elige el aspecto claro u oscuro para todas las páginas de NexoChess. El tablero conserva sus colores seleccionados.",
        dark: "Oscuro",
        light: "Claro"
    },
    fr: {
        title: "Thème de l’interface",
        description: "Choisissez l’apparence claire ou sombre pour toutes les pages de NexoChess. L’échiquier conserve ses propres couleurs.",
        dark: "Sombre",
        light: "Clair"
    },
    de: {
        title: "Oberflächendesign",
        description: "Wähle für alle NexoChess-Seiten ein helles oder dunkles Erscheinungsbild. Das Schachbrett behält seine gewählten Farben.",
        dark: "Dunkel",
        light: "Hell"
    },
    pt: {
        title: "Tema da interface",
        description: "Escolha o aspeto claro ou escuro para todas as páginas do NexoChess. O tabuleiro mantém as cores selecionadas.",
        dark: "Escuro",
        light: "Claro"
    },
    ru: {
        title: "Тема интерфейса",
        description: "Выберите светлое или тёмное оформление для всех страниц NexoChess. Шахматная доска сохранит выбранные цвета.",
        dark: "Тёмная",
        light: "Светлая"
    },
    zh: {
        title: "界面主题",
        description: "为所有 NexoChess 页面选择浅色或深色外观。棋盘会保留已选择的颜色。",
        dark: "深色",
        light: "浅色"
    },
    vi: {
        title: "Giao diện",
        description: "Chọn giao diện sáng hoặc tối cho tất cả các trang NexoChess. Bàn cờ vẫn giữ màu đã chọn.",
        dark: "Tối",
        light: "Sáng"
    },
    hi: {
        title: "इंटरफ़ेस थीम",
        description: "सभी NexoChess पेजों के लिए हल्का या गहरा रूप चुनें। शतरंज बोर्ड अपने चुने हुए रंग बनाए रखेगा।",
        dark: "गहरा",
        light: "हल्का"
    },
    mr: {
        title: "इंटरफेस थीम",
        description: "सर्व NexoChess पानांसाठी उजळ किंवा गडद रूप निवडा. बुद्धिबळाचा पट निवडलेले रंग कायम ठेवेल.",
        dark: "गडद",
        light: "उजळ"
    },
    pl: {
        title: "Motyw interfejsu",
        description: "Wybierz jasny lub ciemny wygląd wszystkich stron NexoChess. Szachownica zachowa wybrane kolory.",
        dark: "Ciemny",
        light: "Jasny"
    }
};

export function getColourModeCopy(language: string): ColourModeCopy {
    const normalisedLanguage = language.toLowerCase().split("-").at(0) || "en";
    return copy[normalisedLanguage] || copy.en;
}
