import type { SupportedLanguage } from "@/i18n/routing";

export const V1_2_RELEASE_VERSION = "v1.2";
export const V1_2_RELEASE_NOTE_STORAGE_KEY = "nexochess.release-note.v1.2.seen";

// 16 August 2026 at 17:00 GMT/UTC.
export const V1_2_RELEASE_NOTE_CUTOFF = "2026-08-16T17:00:00.000Z";

export interface ReleaseNoteV1_2Copy {
    title: string;
    intro: string;
    changes: readonly string[];
    closing: string;
    confirm: string;
    close: string;
}

export const V1_2_RELEASE_NOTE_COPY: Record<SupportedLanguage, ReleaseNoteV1_2Copy> = {
    en: {
        title: "What's new in NexoChess 1.2",
        intro: "This update adds new ways to prepare your openings and makes puzzle training clearer and more flexible.",
        changes: [
            "Repertoire is here: build or import your own opening lines, study them move by move and train with guided opening courses.",
            "Puzzles have been redesigned with a clearer setup, multiple theme selection and a more focused training flow.",
            "Navigation, interface details, reliability and search presentation received smaller improvements."
        ],
        closing: "Thanks for using NexoChess.",
        confirm: "Got it",
        close: "Close"
    },
    es: {
        title: "Novedades de NexoChess 1.2",
        intro: "Esta actualización añade nuevas formas de preparar tus aperturas y hace que el entrenamiento de puzzles sea más claro y flexible.",
        changes: [
            "Llega Repertorio: crea o importa tus propias líneas de apertura, estúdialas jugada a jugada y entrena con cursos guiados de aperturas.",
            "Puzzles se ha rediseñado con una configuración más clara, selección múltiple de temas y un flujo de entrenamiento más centrado.",
            "También hay pequeños ajustes de navegación, interfaz, estabilidad y presentación en buscadores."
        ],
        closing: "Gracias por usar NexoChess.",
        confirm: "Vale",
        close: "Cerrar"
    },
    fr: {
        title: "Nouveautés de NexoChess 1.2",
        intro: "Cette mise à jour ajoute de nouvelles façons de préparer vos ouvertures et rend l'entraînement aux puzzles plus clair et plus flexible.",
        changes: [
            "Le Répertoire arrive : créez ou importez vos propres variantes d'ouverture, étudiez-les coup par coup et entraînez-vous avec des cours guidés d'ouvertures.",
            "Les Puzzles ont été repensés avec une configuration plus claire, la sélection de plusieurs thèmes et un parcours d'entraînement plus ciblé.",
            "La navigation, certains détails d'interface, la fiabilité et la présentation dans les moteurs de recherche ont aussi reçu de petites améliorations."
        ],
        closing: "Merci d'utiliser NexoChess.",
        confirm: "Compris",
        close: "Fermer"
    },
    de: {
        title: "Neu in NexoChess 1.2",
        intro: "Dieses Update bietet neue Möglichkeiten zur Vorbereitung deiner Eröffnungen und macht das Puzzle-Training übersichtlicher und flexibler.",
        changes: [
            "Neu ist das Repertoire: Erstelle oder importiere eigene Eröffnungsvarianten, lerne sie Zug für Zug und trainiere mit geführten Eröffnungskursen.",
            "Puzzles wurden mit einer klareren Einrichtung, Mehrfachauswahl von Themen und einem fokussierteren Trainingsablauf neu gestaltet.",
            "Navigation, Oberflächendetails, Zuverlässigkeit und Darstellung in Suchmaschinen wurden ebenfalls in kleinen Punkten verbessert."
        ],
        closing: "Danke, dass du NexoChess nutzt.",
        confirm: "Alles klar",
        close: "Schließen"
    },
    pt: {
        title: "Novidades do NexoChess 1.2",
        intro: "Esta atualização acrescenta novas formas de preparar as tuas aberturas e torna o treino de puzzles mais claro e flexível.",
        changes: [
            "Chegou o Repertório: cria ou importa as tuas próprias linhas de abertura, estuda-as lance a lance e treina com cursos guiados de aberturas.",
            "Os Puzzles foram redesenhados com uma configuração mais clara, seleção múltipla de temas e um fluxo de treino mais focado.",
            "A navegação, alguns detalhes da interface, a fiabilidade e a apresentação nos motores de pesquisa também receberam pequenas melhorias."
        ],
        closing: "Obrigado por usares o NexoChess.",
        confirm: "Entendido",
        close: "Fechar"
    },
    ru: {
        title: "Что нового в NexoChess 1.2",
        intro: "Это обновление добавляет новые способы подготовки дебютов и делает тренировку задач понятнее и гибче.",
        changes: [
            "Появился Репертуар: создавайте или импортируйте свои дебютные варианты, изучайте их ход за ходом и тренируйтесь с пошаговыми курсами по дебютам.",
            "Раздел задач переработан: настройка стала понятнее, можно выбирать несколько тем, а тренировочный процесс стал более сфокусированным.",
            "Также внесены небольшие улучшения навигации, интерфейса, стабильности и отображения в поисковых системах."
        ],
        closing: "Спасибо, что пользуетесь NexoChess.",
        confirm: "Понятно",
        close: "Закрыть"
    },
    zh: {
        title: "NexoChess 1.2 更新内容",
        intro: "本次更新带来了更多开局准备方式，并让棋题训练更加清晰、灵活。",
        changes: [
            "全新“开局库”上线：你可以创建或导入自己的开局变化，逐步学习，并通过引导式开局课程进行训练。",
            "棋题界面经过重新设计，设置更清晰，可同时选择多个主题，训练流程也更加专注。",
            "导航、界面细节、稳定性以及搜索结果中的展示也进行了若干小幅改进。"
        ],
        closing: "感谢你使用 NexoChess。",
        confirm: "知道了",
        close: "关闭"
    },
    vi: {
        title: "Có gì mới trong NexoChess 1.2",
        intro: "Bản cập nhật này bổ sung những cách mới để chuẩn bị khai cuộc và giúp việc luyện puzzle rõ ràng, linh hoạt hơn.",
        changes: [
            "Đã có Repertoire: tạo hoặc nhập các biến khai cuộc của riêng bạn, học từng nước và luyện tập với các khóa khai cuộc có hướng dẫn.",
            "Puzzles được thiết kế lại với phần thiết lập rõ ràng hơn, chọn nhiều chủ đề cùng lúc và luồng luyện tập tập trung hơn.",
            "Điều hướng, chi tiết giao diện, độ ổn định và cách hiển thị trên công cụ tìm kiếm cũng có một số cải tiến nhỏ."
        ],
        closing: "Cảm ơn bạn đã sử dụng NexoChess.",
        confirm: "Đã hiểu",
        close: "Đóng"
    },
    hi: {
        title: "NexoChess 1.2 में नया क्या है",
        intro: "यह अपडेट ओपनिंग तैयार करने के नए तरीके जोड़ता है और पज़ल प्रशिक्षण को अधिक साफ़ और लचीला बनाता है।",
        changes: [
            "अब Repertoire उपलब्ध है: अपनी ओपनिंग लाइनें बनाएं या आयात करें, उन्हें चाल-दर-चाल पढ़ें और निर्देशित ओपनिंग कोर्स के साथ अभ्यास करें।",
            "Puzzles को अधिक साफ़ सेटअप, एक साथ कई थीम चुनने और अधिक केंद्रित प्रशिक्षण प्रवाह के साथ फिर से डिज़ाइन किया गया है।",
            "नेविगेशन, इंटरफ़ेस विवरण, विश्वसनीयता और खोज परिणामों में प्रस्तुति में भी छोटे सुधार किए गए हैं।"
        ],
        closing: "NexoChess का उपयोग करने के लिए धन्यवाद।",
        confirm: "ठीक है",
        close: "बंद करें"
    },
    mr: {
        title: "NexoChess 1.2 मध्ये नवीन काय आहे",
        intro: "या अद्यतनात ओपनिंगची तयारी करण्याचे नवे मार्ग जोडले आहेत आणि पझल प्रशिक्षण अधिक स्पष्ट व लवचिक केले आहे.",
        changes: [
            "आता Repertoire उपलब्ध आहे: स्वतःच्या ओपनिंग लाईन्स तयार करा किंवा आयात करा, त्या चालीनुसार शिका आणि मार्गदर्शित ओपनिंग कोर्ससह सराव करा.",
            "Puzzles अधिक स्पष्ट सेटअप, अनेक थीम एकाच वेळी निवडण्याची सुविधा आणि अधिक केंद्रित प्रशिक्षण प्रवाहासह पुन्हा डिझाइन केले आहेत.",
            "नेव्हिगेशन, इंटरफेस तपशील, विश्वासार्हता आणि शोध परिणामांतील सादरीकरणातही काही लहान सुधारणा केल्या आहेत."
        ],
        closing: "NexoChess वापरल्याबद्दल धन्यवाद.",
        confirm: "ठीक आहे",
        close: "बंद करा"
    },
    pl: {
        title: "Co nowego w NexoChess 1.2",
        intro: "Ta aktualizacja dodaje nowe sposoby przygotowywania debiutów i sprawia, że trening zadań jest czytelniejszy i bardziej elastyczny.",
        changes: [
            "Pojawił się Repertuar: twórz lub importuj własne warianty debiutowe, ucz się ich ruch po ruchu i trenuj z prowadzonymi kursami debiutowymi.",
            "Puzzles zostały przeprojektowane: konfiguracja jest czytelniejsza, można wybierać wiele motywów naraz, a trening jest bardziej skupiony.",
            "Wprowadzono też drobne usprawnienia nawigacji, interfejsu, niezawodności i prezentacji w wyszukiwarkach."
        ],
        closing: "Dziękujemy za korzystanie z NexoChess.",
        confirm: "Rozumiem",
        close: "Zamknij"
    }
};

export function releaseNoteV1_2HasExpired(now = Date.now()): boolean {
    return now >= Date.parse(V1_2_RELEASE_NOTE_CUTOFF);
}
