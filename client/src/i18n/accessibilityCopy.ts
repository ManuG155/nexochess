import { normaliseLanguage, SupportedLanguage } from "@/i18n";

interface AccessibilityCopy {
    skipToContent: string;
    copyToClipboard: string;
}

const copies: Record<SupportedLanguage, AccessibilityCopy> = {
    en: {
        skipToContent: "Skip to main content",
        copyToClipboard: "Copy to clipboard"
    },
    es: {
        skipToContent: "Saltar al contenido principal",
        copyToClipboard: "Copiar al portapapeles"
    },
    fr: {
        skipToContent: "Aller au contenu principal",
        copyToClipboard: "Copier dans le presse-papiers"
    },
    de: {
        skipToContent: "Zum Hauptinhalt springen",
        copyToClipboard: "In die Zwischenablage kopieren"
    },
    pt: {
        skipToContent: "Saltar para o conteúdo principal",
        copyToClipboard: "Copiar para a área de transferência"
    },
    ru: {
        skipToContent: "Перейти к основному содержимому",
        copyToClipboard: "Скопировать в буфер обмена"
    },
    zh: {
        skipToContent: "跳到主要内容",
        copyToClipboard: "复制到剪贴板"
    },
    vi: {
        skipToContent: "Chuyển đến nội dung chính",
        copyToClipboard: "Sao chép vào bộ nhớ tạm"
    },
    hi: {
        skipToContent: "मुख्य सामग्री पर जाएँ",
        copyToClipboard: "क्लिपबोर्ड पर कॉपी करें"
    },
    mr: {
        skipToContent: "मुख्य मजकुरावर जा",
        copyToClipboard: "क्लिपबोर्डवर कॉपी करा"
    },
    pl: {
        skipToContent: "Przejdź do głównej treści",
        copyToClipboard: "Kopiuj do schowka"
    }
};

function getAccessibilityCopy(language?: string): AccessibilityCopy {
    const normalised = normaliseLanguage(language || "en") || "en";
    return copies[normalised];
}

export { getAccessibilityCopy };
