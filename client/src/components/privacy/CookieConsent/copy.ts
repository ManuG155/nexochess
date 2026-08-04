export interface ConsentCopy {
    title: string;
    description: string;
    acceptAll: string;
    rejectOptional: string;
    configure: string;
    settingsTitle: string;
    settingsDescription: string;
    essentialTitle: string;
    essentialDescription: string;
    alwaysActive: string;
    analyticsTitle: string;
    analyticsDescription: string;
    advertisingTitle: string;
    advertisingDescription: string;
    saveSelection: string;
    privacyPolicy: string;
    close: string;
    footerAction: string;
}

const copies: Record<string, ConsentCopy> = {
    en: {
        title: "Your privacy choices",
        description: "NexoChess uses essential storage to keep the service working. Analytics and advertising remain disabled unless you choose to allow them.",
        acceptAll: "Accept all",
        rejectOptional: "Reject optional",
        configure: "Configure",
        settingsTitle: "Cookie settings",
        settingsDescription: "Choose which optional categories NexoChess may use. You can change this decision at any time.",
        essentialTitle: "Essential",
        essentialDescription: "Required for security, sign-in, preferences and core site operation.",
        alwaysActive: "Always active",
        analyticsTitle: "Analytics",
        analyticsDescription: "Helps measure general use and improve the service without sending chess positions, PGN files or private account content.",
        advertisingTitle: "Advertising",
        advertisingDescription: "Allows advertising technologies when they are introduced. They are currently inactive.",
        saveSelection: "Save selection",
        privacyPolicy: "Privacy policy",
        close: "Close",
        footerAction: "Cookie settings"
    },
    es: {
        title: "Tus opciones de privacidad",
        description: "NexoChess utiliza almacenamiento esencial para que el servicio funcione. La analítica y la publicidad permanecen desactivadas salvo que decidas permitirlas.",
        acceptAll: "Aceptar todo",
        rejectOptional: "Rechazar opcionales",
        configure: "Configurar",
        settingsTitle: "Configuración de cookies",
        settingsDescription: "Elige qué categorías opcionales puede utilizar NexoChess. Puedes cambiar esta decisión en cualquier momento.",
        essentialTitle: "Esenciales",
        essentialDescription: "Necesarias para seguridad, inicio de sesión, preferencias y funcionamiento básico de la web.",
        alwaysActive: "Siempre activas",
        analyticsTitle: "Analíticas",
        analyticsDescription: "Ayudan a medir el uso general y mejorar el servicio sin enviar posiciones, archivos PGN ni contenido privado de la cuenta.",
        advertisingTitle: "Publicitarias",
        advertisingDescription: "Permiten tecnologías publicitarias cuando se incorporen. Actualmente están inactivas.",
        saveSelection: "Guardar selección",
        privacyPolicy: "Política de privacidad",
        close: "Cerrar",
        footerAction: "Configurar cookies"
    },
    fr: {
        title: "Vos choix de confidentialité",
        description: "NexoChess utilise un stockage essentiel au fonctionnement du service. L’analyse et la publicité restent désactivées sans votre accord.",
        acceptAll: "Tout accepter",
        rejectOptional: "Refuser l’optionnel",
        configure: "Configurer",
        settingsTitle: "Paramètres des cookies",
        settingsDescription: "Choisissez les catégories facultatives autorisées. Vous pourrez modifier ce choix à tout moment.",
        essentialTitle: "Essentiels",
        essentialDescription: "Nécessaires à la sécurité, à la connexion, aux préférences et au fonctionnement du site.",
        alwaysActive: "Toujours actifs",
        analyticsTitle: "Analyse",
        analyticsDescription: "Aide à mesurer l’utilisation générale sans envoyer de positions, de PGN ni de contenu privé.",
        advertisingTitle: "Publicité",
        advertisingDescription: "Autorise les technologies publicitaires lorsqu’elles seront ajoutées. Elles sont actuellement inactives.",
        saveSelection: "Enregistrer",
        privacyPolicy: "Politique de confidentialité",
        close: "Fermer",
        footerAction: "Paramètres des cookies"
    },
    de: {
        title: "Deine Datenschutzauswahl",
        description: "NexoChess verwendet notwendige Speicherung für den Betrieb. Analyse und Werbung bleiben ohne deine Zustimmung deaktiviert.",
        acceptAll: "Alle akzeptieren",
        rejectOptional: "Optionale ablehnen",
        configure: "Konfigurieren",
        settingsTitle: "Cookie-Einstellungen",
        settingsDescription: "Wähle optionale Kategorien. Du kannst diese Entscheidung jederzeit ändern.",
        essentialTitle: "Notwendig",
        essentialDescription: "Erforderlich für Sicherheit, Anmeldung, Einstellungen und den grundlegenden Betrieb.",
        alwaysActive: "Immer aktiv",
        analyticsTitle: "Analyse",
        analyticsDescription: "Hilft bei der allgemeinen Nutzungsmessung, ohne Stellungen, PGN-Dateien oder private Kontoinhalte zu senden.",
        advertisingTitle: "Werbung",
        advertisingDescription: "Erlaubt Werbetechnologien, sobald sie eingeführt werden. Derzeit sind sie inaktiv.",
        saveSelection: "Auswahl speichern",
        privacyPolicy: "Datenschutzerklärung",
        close: "Schließen",
        footerAction: "Cookie-Einstellungen"
    },
    pt: {
        title: "As tuas opções de privacidade",
        description: "O NexoChess usa armazenamento essencial para funcionar. A análise e a publicidade permanecem desativadas sem a tua autorização.",
        acceptAll: "Aceitar tudo",
        rejectOptional: "Rejeitar opcionais",
        configure: "Configurar",
        settingsTitle: "Definições de cookies",
        settingsDescription: "Escolhe as categorias opcionais permitidas. Podes alterar esta decisão a qualquer momento.",
        essentialTitle: "Essenciais",
        essentialDescription: "Necessárias para segurança, início de sessão, preferências e funcionamento básico.",
        alwaysActive: "Sempre ativas",
        analyticsTitle: "Analítica",
        analyticsDescription: "Ajuda a medir a utilização geral sem enviar posições, PGN ou conteúdo privado da conta.",
        advertisingTitle: "Publicidade",
        advertisingDescription: "Permite tecnologias publicitárias quando forem introduzidas. Estão atualmente inativas.",
        saveSelection: "Guardar seleção",
        privacyPolicy: "Política de privacidade",
        close: "Fechar",
        footerAction: "Configurar cookies"
    },
    ru: {
        title: "Настройки конфиденциальности",
        description: "NexoChess использует обязательное хранилище для работы сервиса. Аналитика и реклама отключены без вашего согласия.",
        acceptAll: "Принять всё",
        rejectOptional: "Отклонить необязательное",
        configure: "Настроить",
        settingsTitle: "Настройки cookie",
        settingsDescription: "Выберите необязательные категории. Решение можно изменить в любое время.",
        essentialTitle: "Обязательные",
        essentialDescription: "Нужны для безопасности, входа, настроек и основной работы сайта.",
        alwaysActive: "Всегда активны",
        analyticsTitle: "Аналитика",
        analyticsDescription: "Помогает оценивать общее использование без отправки позиций, PGN и личных данных аккаунта.",
        advertisingTitle: "Реклама",
        advertisingDescription: "Разрешает рекламные технологии после их внедрения. Сейчас они неактивны.",
        saveSelection: "Сохранить выбор",
        privacyPolicy: "Политика конфиденциальности",
        close: "Закрыть",
        footerAction: "Настройки cookie"
    },
    zh: {
        title: "隐私选项",
        description: "NexoChess 使用必要存储来维持服务运行。除非你同意，否则分析和广告功能保持关闭。",
        acceptAll: "全部接受",
        rejectOptional: "拒绝可选项",
        configure: "设置",
        settingsTitle: "Cookie 设置",
        settingsDescription: "选择允许的可选类别。你可以随时更改决定。",
        essentialTitle: "必要",
        essentialDescription: "用于安全、登录、偏好设置和网站基本运行。",
        alwaysActive: "始终启用",
        analyticsTitle: "分析",
        analyticsDescription: "帮助了解总体使用情况，不会发送棋局、PGN 或账户私密内容。",
        advertisingTitle: "广告",
        advertisingDescription: "在未来启用广告技术。目前尚未启用。",
        saveSelection: "保存选择",
        privacyPolicy: "隐私政策",
        close: "关闭",
        footerAction: "Cookie 设置"
    },
    vi: {
        title: "Lựa chọn quyền riêng tư",
        description: "NexoChess dùng bộ nhớ thiết yếu để dịch vụ hoạt động. Phân tích và quảng cáo sẽ tắt nếu bạn chưa đồng ý.",
        acceptAll: "Chấp nhận tất cả",
        rejectOptional: "Từ chối tùy chọn",
        configure: "Thiết lập",
        settingsTitle: "Cài đặt cookie",
        settingsDescription: "Chọn các danh mục tùy chọn. Bạn có thể thay đổi quyết định bất cứ lúc nào.",
        essentialTitle: "Thiết yếu",
        essentialDescription: "Cần cho bảo mật, đăng nhập, tùy chọn và hoạt động cơ bản của trang.",
        alwaysActive: "Luôn bật",
        analyticsTitle: "Phân tích",
        analyticsDescription: "Giúp đo mức sử dụng chung mà không gửi thế cờ, PGN hay nội dung tài khoản riêng tư.",
        advertisingTitle: "Quảng cáo",
        advertisingDescription: "Cho phép công nghệ quảng cáo khi được bổ sung. Hiện đang tắt.",
        saveSelection: "Lưu lựa chọn",
        privacyPolicy: "Chính sách quyền riêng tư",
        close: "Đóng",
        footerAction: "Cài đặt cookie"
    },
    hi: {
        title: "आपकी गोपनीयता पसंद",
        description: "NexoChess सेवा चलाने के लिए आवश्यक स्टोरेज उपयोग करता है। आपकी अनुमति के बिना विश्लेषण और विज्ञापन बंद रहते हैं।",
        acceptAll: "सभी स्वीकार करें",
        rejectOptional: "वैकल्पिक अस्वीकार करें",
        configure: "सेटिंग्स",
        settingsTitle: "कुकी सेटिंग्स",
        settingsDescription: "वैकल्पिक श्रेणियाँ चुनें। निर्णय कभी भी बदला जा सकता है।",
        essentialTitle: "आवश्यक",
        essentialDescription: "सुरक्षा, साइन-इन, प्राथमिकताओं और वेबसाइट के मूल संचालन के लिए जरूरी।",
        alwaysActive: "हमेशा सक्रिय",
        analyticsTitle: "विश्लेषण",
        analyticsDescription: "पोज़िशन, PGN या निजी खाता सामग्री भेजे बिना सामान्य उपयोग मापने में मदद करता है।",
        advertisingTitle: "विज्ञापन",
        advertisingDescription: "भविष्य में जोड़ी जाने वाली विज्ञापन तकनीकों की अनुमति देता है। अभी निष्क्रिय है।",
        saveSelection: "चयन सहेजें",
        privacyPolicy: "गोपनीयता नीति",
        close: "बंद करें",
        footerAction: "कुकी सेटिंग्स"
    },
    mr: {
        title: "तुमचे गोपनीयता पर्याय",
        description: "NexoChess सेवा चालण्यासाठी आवश्यक साठवण वापरते. तुमच्या संमतीशिवाय विश्लेषण आणि जाहिरात बंद राहतात.",
        acceptAll: "सर्व स्वीकारा",
        rejectOptional: "पर्यायी नाकारा",
        configure: "सेटिंग्ज",
        settingsTitle: "कुकी सेटिंग्ज",
        settingsDescription: "पर्यायी श्रेणी निवडा. हा निर्णय कधीही बदलता येतो.",
        essentialTitle: "आवश्यक",
        essentialDescription: "सुरक्षा, साइन-इन, प्राधान्ये आणि वेबसाइटच्या मूलभूत कार्यासाठी आवश्यक.",
        alwaysActive: "नेहमी सक्रिय",
        analyticsTitle: "विश्लेषण",
        analyticsDescription: "स्थिती, PGN किंवा खासगी खाते मजकूर न पाठवता सामान्य वापर मोजण्यास मदत करते.",
        advertisingTitle: "जाहिरात",
        advertisingDescription: "भविष्यातील जाहिरात तंत्रज्ञानाला परवानगी देते. सध्या निष्क्रिय आहे.",
        saveSelection: "निवड जतन करा",
        privacyPolicy: "गोपनीयता धोरण",
        close: "बंद करा",
        footerAction: "कुकी सेटिंग्ज"
    },
    pl: {
        title: "Twoje wybory prywatności",
        description: "NexoChess używa niezbędnego zapisu do działania usługi. Analityka i reklamy pozostają wyłączone bez Twojej zgody.",
        acceptAll: "Zaakceptuj wszystko",
        rejectOptional: "Odrzuć opcjonalne",
        configure: "Konfiguruj",
        settingsTitle: "Ustawienia plików cookie",
        settingsDescription: "Wybierz opcjonalne kategorie. Decyzję możesz zmienić w dowolnym momencie.",
        essentialTitle: "Niezbędne",
        essentialDescription: "Wymagane do bezpieczeństwa, logowania, preferencji i podstawowego działania strony.",
        alwaysActive: "Zawsze aktywne",
        analyticsTitle: "Analityka",
        analyticsDescription: "Pomaga mierzyć ogólne użycie bez wysyłania pozycji, PGN ani prywatnej zawartości konta.",
        advertisingTitle: "Reklamy",
        advertisingDescription: "Pozwala na technologie reklamowe po ich wdrożeniu. Obecnie są nieaktywne.",
        saveSelection: "Zapisz wybór",
        privacyPolicy: "Polityka prywatności",
        close: "Zamknij",
        footerAction: "Ustawienia cookie"
    }
};

export function getConsentCopy(language: string) {
    const normalised = language.toLowerCase().split("-")[0];
    return copies[normalised] || copies.en;
}
