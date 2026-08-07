import type { SupportedLanguage } from "@/i18n/routing";

export const V1_1_RELEASE_VERSION = "v1.1";
export const V1_1_RELEASE_NOTE_STORAGE_KEY = "nexochess.release-note.v1.1.seen";

// 10 August 2026 00:00 in mainland Spain (CEST, UTC+02:00).
export const V1_1_RELEASE_NOTE_CUTOFF = "2026-08-09T22:00:00.000Z";
export const V1_1_RELEASE_NOTE_ENDPOINT = "/api/account/release-notes/v1.1";

export interface ReleaseNoteCopy {
    title: string;
    intro: string;
    changes: readonly string[];
    closing: string;
    dismiss: string;
}

export const V1_1_RELEASE_NOTE_COPY: Record<SupportedLanguage, ReleaseNoteCopy> = {
    en: {
        title: "NexoChess 1.1",
        intro: "A new version focused on making NexoChess more complete, accessible and reliable.",
        changes: [
            "Public pages and localized URLs are now available in 11 languages.",
            "Privacy controls, cookie consent and privacy-first analytics are integrated.",
            "Accessibility, loading performance, Help, FAQ, About NexoChess and legal pages have been improved.",
            "Analysis, Settings, deployment and navigation received important stability fixes."
        ],
        closing: "Thanks for using NexoChess and helping us improve it.",
        dismiss: "Got it"
    },
    es: {
        title: "NexoChess 1.1",
        intro: "Una nueva versión centrada en hacer NexoChess más completo, accesible y fiable.",
        changes: [
            "Las páginas públicas y las URLs localizadas ya están disponibles en 11 idiomas.",
            "Se han integrado controles de privacidad, consentimiento de cookies y analítica respetuosa con la privacidad.",
            "Se han mejorado la accesibilidad, el rendimiento de carga, Ayuda, FAQ, Sobre NexoChess y las páginas legales.",
            "Análisis, Ajustes, el despliegue y la navegación han recibido correcciones importantes de estabilidad."
        ],
        closing: "Gracias por usar NexoChess y ayudarnos a mejorarlo.",
        dismiss: "Entendido"
    },
    fr: {
        title: "NexoChess 1.1",
        intro: "Une nouvelle version conçue pour rendre NexoChess plus complet, accessible et fiable.",
        changes: [
            "Les pages publiques et les URL localisées sont désormais disponibles en 11 langues.",
            "Les contrôles de confidentialité, le consentement aux cookies et une analyse respectueuse de la vie privée sont intégrés.",
            "L’accessibilité, les performances de chargement, l’Aide, la FAQ, À propos de NexoChess et les pages juridiques ont été améliorées.",
            "Analyse, Paramètres, le déploiement et la navigation ont reçu d’importants correctifs de stabilité."
        ],
        closing: "Merci d’utiliser NexoChess et de nous aider à l’améliorer.",
        dismiss: "Compris"
    },
    de: {
        title: "NexoChess 1.1",
        intro: "Eine neue Version mit dem Ziel, NexoChess vollständiger, zugänglicher und zuverlässiger zu machen.",
        changes: [
            "Öffentliche Seiten und lokalisierte URLs sind jetzt in 11 Sprachen verfügbar.",
            "Datenschutzkontrollen, Cookie-Einwilligung und datenschutzorientierte Analyse sind integriert.",
            "Barrierefreiheit, Ladeleistung, Hilfe, FAQ, Über NexoChess und rechtliche Seiten wurden verbessert.",
            "Analyse, Einstellungen, Bereitstellung und Navigation haben wichtige Stabilitätskorrekturen erhalten."
        ],
        closing: "Danke, dass du NexoChess nutzt und uns hilfst, es zu verbessern.",
        dismiss: "Verstanden"
    },
    pt: {
        title: "NexoChess 1.1",
        intro: "Uma nova versão focada em tornar o NexoChess mais completo, acessível e fiável.",
        changes: [
            "As páginas públicas e os URLs localizados estão agora disponíveis em 11 idiomas.",
            "Foram integrados controlos de privacidade, consentimento de cookies e análise orientada para a privacidade.",
            "A acessibilidade, o desempenho de carregamento, Ajuda, FAQ, Sobre o NexoChess e as páginas legais foram melhorados.",
            "Análise, Definições, implementação e navegação receberam correções importantes de estabilidade."
        ],
        closing: "Obrigado por usar o NexoChess e por nos ajudar a melhorá-lo.",
        dismiss: "Entendido"
    },
    ru: {
        title: "NexoChess 1.1",
        intro: "Новая версия делает NexoChess более полным, доступным и надёжным.",
        changes: [
            "Публичные страницы и локализованные URL теперь доступны на 11 языках.",
            "Добавлены настройки конфиденциальности, согласие на cookies и аналитика с приоритетом приватности.",
            "Улучшены доступность, скорость загрузки, разделы Помощь, FAQ, О NexoChess и юридические страницы.",
            "Анализ, Настройки, развёртывание и навигация получили важные исправления стабильности."
        ],
        closing: "Спасибо, что пользуетесь NexoChess и помогаете нам становиться лучше.",
        dismiss: "Понятно"
    },
    zh: {
        title: "NexoChess 1.1",
        intro: "新版本致力于让 NexoChess 更完整、更易用、更可靠。",
        changes: [
            "公共页面和本地化网址现已支持 11 种语言。",
            "已集成隐私控制、Cookie 同意管理和以隐私为先的分析功能。",
            "无障碍体验、加载性能、帮助、FAQ、关于 NexoChess 和法律页面均已改进。",
            "分析、设置、部署和导航获得了重要的稳定性修复。"
        ],
        closing: "感谢你使用 NexoChess，并帮助我们不断改进。",
        dismiss: "知道了"
    },
    vi: {
        title: "NexoChess 1.1",
        intro: "Phiên bản mới tập trung giúp NexoChess đầy đủ, dễ tiếp cận và đáng tin cậy hơn.",
        changes: [
            "Các trang công khai và URL được bản địa hóa hiện có sẵn bằng 11 ngôn ngữ.",
            "Đã tích hợp kiểm soát quyền riêng tư, đồng ý cookie và phân tích ưu tiên quyền riêng tư.",
            "Khả năng tiếp cận, hiệu năng tải, Trợ giúp, FAQ, Giới thiệu NexoChess và các trang pháp lý đã được cải thiện.",
            "Phân tích, Cài đặt, triển khai và điều hướng đã nhận được các bản sửa lỗi ổn định quan trọng."
        ],
        closing: "Cảm ơn bạn đã sử dụng NexoChess và giúp chúng tôi cải thiện.",
        dismiss: "Đã hiểu"
    },
    hi: {
        title: "NexoChess 1.1",
        intro: "यह नया संस्करण NexoChess को अधिक पूर्ण, सुलभ और विश्वसनीय बनाने पर केंद्रित है।",
        changes: [
            "सार्वजनिक पेज और स्थानीयकृत URL अब 11 भाषाओं में उपलब्ध हैं।",
            "गोपनीयता नियंत्रण, कुकी सहमति और गोपनीयता-केंद्रित एनालिटिक्स जोड़े गए हैं।",
            "सुलभता, लोडिंग प्रदर्शन, सहायता, FAQ, NexoChess के बारे में और कानूनी पेज बेहतर किए गए हैं।",
            "विश्लेषण, सेटिंग्स, डिप्लॉयमेंट और नेविगेशन में महत्वपूर्ण स्थिरता सुधार किए गए हैं।"
        ],
        closing: "NexoChess का उपयोग करने और इसे बेहतर बनाने में हमारी मदद करने के लिए धन्यवाद।",
        dismiss: "समझ गया"
    },
    mr: {
        title: "NexoChess 1.1",
        intro: "ही नवीन आवृत्ती NexoChess अधिक संपूर्ण, सुलभ आणि विश्वासार्ह करण्यावर केंद्रित आहे.",
        changes: [
            "सार्वजनिक पृष्ठे आणि स्थानिकीकरण केलेले URL आता 11 भाषांमध्ये उपलब्ध आहेत.",
            "गोपनीयता नियंत्रणे, कुकी संमती आणि गोपनीयता-केंद्रित विश्लेषण समाविष्ट केले आहे.",
            "सुलभता, लोडिंग कार्यक्षमता, मदत, FAQ, NexoChess विषयी आणि कायदेशीर पृष्ठे सुधारली आहेत.",
            "विश्लेषण, सेटिंग्ज, डिप्लॉयमेंट आणि नेव्हिगेशनमध्ये महत्त्वाच्या स्थिरता सुधारणा केल्या आहेत."
        ],
        closing: "NexoChess वापरल्याबद्दल आणि ते सुधारण्यास मदत केल्याबद्दल धन्यवाद.",
        dismiss: "समजले"
    },
    pl: {
        title: "NexoChess 1.1",
        intro: "Nowa wersja skupia się na tym, aby NexoChess był bardziej kompletny, dostępny i niezawodny.",
        changes: [
            "Publiczne strony i zlokalizowane adresy URL są teraz dostępne w 11 językach.",
            "Zintegrowano ustawienia prywatności, zgodę na pliki cookie i analitykę stawiającą prywatność na pierwszym miejscu.",
            "Ulepszono dostępność, szybkość ładowania, Pomoc, FAQ, O NexoChess oraz strony prawne.",
            "Analiza, Ustawienia, wdrażanie i nawigacja otrzymały ważne poprawki stabilności."
        ],
        closing: "Dziękujemy za korzystanie z NexoChess i pomoc w jego ulepszaniu.",
        dismiss: "Rozumiem"
    }
};

export function releaseNoteV1_1HasExpired(now = Date.now()): boolean {
    return now >= Date.parse(V1_1_RELEASE_NOTE_CUTOFF);
}
