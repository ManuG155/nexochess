import type { LegalDocumentCopy, LegalSection } from "../../components/LegalDocument";

type AdvertisingPrivacyPatch = {
    updated: string;
    plainSummary: string;
    dataBullet: string;
    purposeBullet: string;
    browserStorageParagraph: string;
    providerBullet: string;
    retentionParagraph: string;
    rightsParagraph: string;
};

const patches: Record<string, AdvertisingPrivacyPatch> = {
    en: {
        updated: "Last updated: 10 August 2026",
        plainSummary: "Analysis can remain in your browser. Optional accounts add necessary authentication and cloud storage. With your choices, NexoChess can use Google Analytics 4 for aggregate measurement and Google AdSense infrastructure for consent management and, when ad placements are enabled, advertising. In the EEA, United Kingdom and Switzerland, the Google-certified CMP manages the applicable advertising and analytics choices.",
        dataBullet: "Advertising and consent data: when the Google AdSense infrastructure applies, Google may process consent signals, IP/network information, browser and device information and advertising identifiers or cookies according to the user's choices and Google's policies. NexoChess does not intentionally send chess-game content or NexoChess account identifiers for ad personalisation.",
        purposeBullet: "Measure aggregate website use through Google Analytics 4 after Analytics consent and finance NexoChess through Google AdSense when advertising placements are enabled. In regions covered by the European regulations message, advertising and Analytics purposes follow the choices recorded by Google's certified CMP.",
        browserStorageParagraph: "Strictly necessary authentication storage remains independent from optional measurement and advertising. In the EEA, United Kingdom and Switzerland, Google's certified CMP records the applicable consent choices and communicates Google Consent Mode signals. Google Analytics is kept in basic consent mode by NexoChess and is not loaded until Analytics storage is granted. Google AdSense may use cookies or similar storage when permitted by the applicable choice and law.",
        providerBullet: "Google: optional Google Analytics 4 measurement and Google AdSense advertising/consent infrastructure. In the EEA, United Kingdom and Switzerland, NexoChess uses Google's certified CMP and Google Consent Mode for the relevant Analytics and advertising purposes. Google Signals remains disabled in the NexoChess GA4 integration.",
        retentionParagraph: "Google Analytics and advertising/consent data are retained according to the settings and controls applicable to the relevant Google services. You can change or withdraw optional consent at any time from NexoChess privacy and cookie settings; where the Google CMP applies, that action reopens Google's European regulations message.",
        rightsParagraph: "Where Google's certified CMP applies, you can reopen it from NexoChess privacy and cookie settings to consent, refuse or manage the available purposes. Withdrawing consent does not affect processing already carried out lawfully before withdrawal."
    },
    es: {
        updated: "Última actualización: 10 de agosto de 2026",
        plainSummary: "El análisis puede permanecer en tu navegador. Las cuentas opcionales añaden autenticación necesaria y almacenamiento en la nube. Según tus elecciones, NexoChess puede usar Google Analytics 4 para medición agregada y la infraestructura de Google AdSense para gestionar el consentimiento y, cuando se habiliten emplazamientos, mostrar publicidad. En el EEE, Reino Unido y Suiza, la CMP certificada de Google gestiona las elecciones aplicables de publicidad y analítica.",
        dataBullet: "Datos de publicidad y consentimiento: cuando se utiliza la infraestructura de Google AdSense, Google puede tratar señales de consentimiento, información de IP/red, navegador y dispositivo e identificadores publicitarios o cookies según las elecciones del usuario y las políticas de Google. NexoChess no envía intencionadamente contenido de partidas ni identificadores de cuenta de NexoChess para personalización publicitaria.",
        purposeBullet: "Medir de forma agregada el uso de la web mediante Google Analytics 4 tras el consentimiento de Analítica y financiar NexoChess mediante Google AdSense cuando se habiliten emplazamientos publicitarios. En las regiones cubiertas por el mensaje de normativa europea, las finalidades publicitarias y de Analítica siguen las elecciones registradas por la CMP certificada de Google.",
        browserStorageParagraph: "El almacenamiento de autenticación estrictamente necesario es independiente de la medición y publicidad opcionales. En el EEE, Reino Unido y Suiza, la CMP certificada de Google registra las elecciones aplicables y comunica señales de Google Consent Mode. NexoChess mantiene Google Analytics en modo de consentimiento básico y no lo carga hasta que se concede el almacenamiento de Analítica. Google AdSense puede utilizar cookies o almacenamiento similar cuando lo permita la elección y la normativa aplicables.",
        providerBullet: "Google: Google Analytics 4 opcional y la infraestructura de publicidad/consentimiento de Google AdSense. En el EEE, Reino Unido y Suiza, NexoChess utiliza la CMP certificada de Google y Google Consent Mode para las finalidades relevantes de Analítica y publicidad. Google Signals permanece desactivado en la integración GA4 de NexoChess.",
        retentionParagraph: "Los datos de Google Analytics y los datos de publicidad/consentimiento se conservan según la configuración y los controles aplicables de los servicios de Google correspondientes. Puedes cambiar o retirar el consentimiento opcional en cualquier momento desde los ajustes de privacidad y cookies de NexoChess; cuando aplique la CMP de Google, esa acción vuelve a abrir el mensaje de normativa europea de Google.",
        rightsParagraph: "Cuando aplique la CMP certificada de Google, puedes volver a abrirla desde los ajustes de privacidad y cookies de NexoChess para consentir, rechazar o gestionar las finalidades disponibles. Retirar el consentimiento no afecta al tratamiento realizado lícitamente antes de retirarlo."
    },
    fr: {
        updated: "Dernière mise à jour : 10 août 2026",
        plainSummary: "L’analyse peut rester dans votre navigateur. Les comptes facultatifs ajoutent l’authentification nécessaire et le stockage cloud. Selon vos choix, NexoChess peut utiliser Google Analytics 4 pour la mesure agrégée et l’infrastructure Google AdSense pour gérer le consentement et, lorsque des emplacements sont activés, la publicité. Dans l’EEE, au Royaume-Uni et en Suisse, la CMP Google certifiée gère les choix applicables aux statistiques et à la publicité.",
        dataBullet: "Données de publicité et de consentement : lorsque l’infrastructure Google AdSense s’applique, Google peut traiter les signaux de consentement, les informations IP/réseau, le navigateur et l’appareil ainsi que des identifiants publicitaires ou cookies selon les choix de l’utilisateur et les règles de Google. NexoChess n’envoie pas intentionnellement le contenu des parties ni les identifiants de compte NexoChess pour la personnalisation publicitaire.",
        purposeBullet: "Mesurer l’utilisation agrégée avec Google Analytics 4 après consentement aux statistiques et financer NexoChess avec Google AdSense lorsque des emplacements publicitaires sont activés. Dans les régions couvertes par le message de réglementation européenne, les finalités publicitaires et statistiques suivent les choix enregistrés par la CMP Google certifiée.",
        browserStorageParagraph: "Le stockage d’authentification strictement nécessaire reste indépendant des mesures et publicités facultatives. Dans l’EEE, au Royaume-Uni et en Suisse, la CMP Google certifiée enregistre les choix applicables et communique les signaux Google Consent Mode. NexoChess maintient Google Analytics en mode de consentement basique et ne le charge pas avant l’autorisation du stockage Analytics. Google AdSense peut utiliser des cookies ou un stockage similaire lorsque le choix et la loi applicables l’autorisent.",
        providerBullet: "Google : mesure facultative via Google Analytics 4 et infrastructure de publicité/consentement Google AdSense. Dans l’EEE, au Royaume-Uni et en Suisse, NexoChess utilise la CMP Google certifiée et Google Consent Mode pour les finalités statistiques et publicitaires concernées. Google Signals reste désactivé dans l’intégration GA4 de NexoChess.",
        retentionParagraph: "Les données Google Analytics et de publicité/consentement sont conservées selon les paramètres et contrôles des services Google concernés. Vous pouvez modifier ou retirer votre consentement facultatif à tout moment dans les réglages de confidentialité et de cookies de NexoChess ; lorsque la CMP Google s’applique, cette action rouvre le message européen de Google.",
        rightsParagraph: "Lorsque la CMP Google certifiée s’applique, vous pouvez la rouvrir depuis les réglages de confidentialité et de cookies de NexoChess afin de consentir, refuser ou gérer les finalités disponibles. Le retrait n’affecte pas les traitements effectués légalement avant celui-ci."
    },
    de: {
        updated: "Zuletzt aktualisiert: 10. August 2026",
        plainSummary: "Die Analyse kann in Ihrem Browser verbleiben. Optionale Konten ergänzen notwendige Authentifizierung und Cloud-Speicherung. Abhängig von Ihrer Auswahl kann NexoChess Google Analytics 4 für aggregierte Messungen und die Google-AdSense-Infrastruktur für Einwilligungsverwaltung und – sobald Werbeplätze aktiviert werden – Werbung verwenden. Im EWR, Vereinigten Königreich und in der Schweiz verwaltet die zertifizierte Google-CMP die relevanten Analyse- und Werbeentscheidungen.",
        dataBullet: "Werbe- und Einwilligungsdaten: Wenn die Google-AdSense-Infrastruktur eingesetzt wird, kann Google Einwilligungssignale, IP-/Netzwerkinformationen, Browser- und Geräteinformationen sowie Werbekennungen oder Cookies entsprechend der Nutzerwahl und den Google-Richtlinien verarbeiten. NexoChess übermittelt nicht absichtlich Schachpartien oder NexoChess-Kontokennungen zur Werbepersonalisierung.",
        purposeBullet: "Aggregierte Websitenutzung nach Analyse-Einwilligung mit Google Analytics 4 messen und NexoChess über Google AdSense finanzieren, sobald Werbeplätze aktiviert sind. In Regionen mit dem europäischen Regelungsmeldungsdialog folgen Analyse- und Werbezwecke den von der zertifizierten Google-CMP gespeicherten Entscheidungen.",
        browserStorageParagraph: "Unbedingt erforderlicher Authentifizierungsspeicher bleibt von optionaler Messung und Werbung getrennt. Im EWR, Vereinigten Königreich und in der Schweiz speichert die zertifizierte Google-CMP die relevanten Entscheidungen und übermittelt Google-Consent-Mode-Signale. NexoChess verwendet Google Analytics im Basic Consent Mode und lädt es erst, wenn Analytics-Speicherung erlaubt ist. Google AdSense kann Cookies oder ähnlichen Speicher verwenden, soweit Auswahl und Recht dies erlauben.",
        providerBullet: "Google: optionale Messung mit Google Analytics 4 sowie Google-AdSense-Infrastruktur für Werbung und Einwilligung. Im EWR, Vereinigten Königreich und in der Schweiz verwendet NexoChess die zertifizierte Google-CMP und Google Consent Mode für relevante Analyse- und Werbezwecke. Google Signals bleibt in der NexoChess-GA4-Integration deaktiviert.",
        retentionParagraph: "Google-Analytics- sowie Werbe-/Einwilligungsdaten werden nach den Einstellungen und Kontrollen der jeweiligen Google-Dienste aufbewahrt. Optionale Einwilligungen können jederzeit über die Datenschutz- und Cookie-Einstellungen von NexoChess geändert oder widerrufen werden; wo die Google-CMP gilt, öffnet dies die europäische Google-Meldung erneut.",
        rightsParagraph: "Wo die zertifizierte Google-CMP gilt, können Sie sie über die Datenschutz- und Cookie-Einstellungen von NexoChess erneut öffnen, um zuzustimmen, abzulehnen oder Zwecke zu verwalten. Ein Widerruf berührt nicht die Rechtmäßigkeit früherer Verarbeitung."
    },
    pt: {
        updated: "Última atualização: 10 de agosto de 2026",
        plainSummary: "A análise pode permanecer no navegador. As contas opcionais acrescentam autenticação necessária e armazenamento na nuvem. Conforme as suas escolhas, o NexoChess pode usar o Google Analytics 4 para medição agregada e a infraestrutura Google AdSense para gerir consentimento e, quando forem ativados espaços, publicidade. No EEE, Reino Unido e Suíça, a CMP certificada da Google gere as escolhas aplicáveis de analítica e publicidade.",
        dataBullet: "Dados de publicidade e consentimento: quando se aplica a infraestrutura Google AdSense, a Google pode tratar sinais de consentimento, informação de IP/rede, navegador e dispositivo e identificadores publicitários ou cookies segundo as escolhas do utilizador e as políticas da Google. O NexoChess não envia intencionalmente conteúdo de partidas nem identificadores de conta NexoChess para personalização publicitária.",
        purposeBullet: "Medir a utilização agregada através do Google Analytics 4 após consentimento de Analítica e financiar o NexoChess através do Google AdSense quando forem ativados espaços publicitários. Nas regiões abrangidas pela mensagem europeia, as finalidades de Analítica e publicidade seguem as escolhas registadas pela CMP certificada da Google.",
        browserStorageParagraph: "O armazenamento de autenticação estritamente necessário permanece separado da medição e publicidade opcionais. No EEE, Reino Unido e Suíça, a CMP certificada da Google regista as escolhas aplicáveis e comunica sinais do Google Consent Mode. O NexoChess mantém o Google Analytics em modo de consentimento básico e não o carrega até ser concedido o armazenamento de Analítica. O Google AdSense pode usar cookies ou armazenamento semelhante quando permitido pela escolha e legislação aplicáveis.",
        providerBullet: "Google: Google Analytics 4 opcional e infraestrutura de publicidade/consentimento Google AdSense. No EEE, Reino Unido e Suíça, o NexoChess utiliza a CMP certificada da Google e Google Consent Mode para as finalidades relevantes de Analítica e publicidade. Google Signals permanece desativado na integração GA4 do NexoChess.",
        retentionParagraph: "Os dados de Google Analytics e de publicidade/consentimento são conservados segundo as definições e controlos aplicáveis dos respetivos serviços Google. Pode alterar ou retirar consentimento opcional a qualquer momento nas definições de privacidade e cookies do NexoChess; quando a CMP Google se aplica, esta ação reabre a mensagem europeia da Google.",
        rightsParagraph: "Quando se aplica a CMP certificada da Google, pode reabri-la nas definições de privacidade e cookies do NexoChess para consentir, recusar ou gerir as finalidades disponíveis. A retirada não afeta o tratamento realizado licitamente antes dela."
    },
    ru: {
        updated: "Последнее обновление: 10 августа 2026 г.",
        plainSummary: "Анализ может оставаться в браузере. Необязательная учётная запись добавляет необходимую аутентификацию и облачное хранение. В зависимости от вашего выбора NexoChess может использовать Google Analytics 4 для агрегированных измерений и инфраструктуру Google AdSense для управления согласием и, после включения рекламных мест, рекламы. В ЕЭЗ, Великобритании и Швейцарии соответствующими решениями управляет сертифицированная CMP Google.",
        dataBullet: "Данные рекламы и согласия: при использовании инфраструктуры Google AdSense Google может обрабатывать сигналы согласия, IP/сетевые данные, сведения о браузере и устройстве, рекламные идентификаторы или cookies в соответствии с выбором пользователя и политиками Google. NexoChess намеренно не передаёт содержимое шахматных партий или идентификаторы аккаунта NexoChess для персонализации рекламы.",
        purposeBullet: "Измерять агрегированное использование сайта через Google Analytics 4 после согласия на Аналитику и финансировать NexoChess через Google AdSense после включения рекламных мест. В регионах действия европейского сообщения цели Аналитики и рекламы следуют решениям, зарегистрированным сертифицированной CMP Google.",
        browserStorageParagraph: "Строго необходимое хранилище аутентификации отделено от необязательных измерений и рекламы. В ЕЭЗ, Великобритании и Швейцарии сертифицированная CMP Google сохраняет применимые решения и передаёт сигналы Google Consent Mode. NexoChess использует Google Analytics в базовом режиме согласия и не загружает его до разрешения analytics_storage. Google AdSense может использовать cookies или аналогичное хранилище, когда это разрешено выбором и законом.",
        providerBullet: "Google: необязательные измерения Google Analytics 4 и инфраструктура Google AdSense для рекламы/согласия. В ЕЭЗ, Великобритании и Швейцарии NexoChess использует сертифицированную CMP Google и Google Consent Mode для соответствующих целей Аналитики и рекламы. Google Signals остаётся отключённым в интеграции GA4 NexoChess.",
        retentionParagraph: "Данные Google Analytics и данные рекламы/согласия хранятся согласно настройкам и механизмам соответствующих сервисов Google. Необязательное согласие можно изменить или отозвать в любое время в настройках конфиденциальности и cookies NexoChess; где применяется CMP Google, это повторно открывает европейское сообщение Google.",
        rightsParagraph: "Где применяется сертифицированная CMP Google, её можно повторно открыть из настроек конфиденциальности и cookies NexoChess, чтобы согласиться, отказаться или управлять целями. Отзыв не влияет на законность обработки до отзыва."
    },
    zh: {
        updated: "最后更新：2026年8月10日",
        plainSummary: "分析可以保留在浏览器中。可选账户会增加必要的身份验证和云端存储。根据你的选择，NexoChess 可使用 Google Analytics 4 进行汇总统计，并使用 Google AdSense 基础设施管理同意以及在启用广告位后展示广告。在欧洲经济区、英国和瑞士，相关分析和广告选择由 Google 认证的 CMP 管理。",
        dataBullet: "广告与同意数据：使用 Google AdSense 基础设施时，Google 可根据用户选择及其政策处理同意信号、IP/网络信息、浏览器和设备信息以及广告标识符或 Cookie。NexoChess 不会有意将棋局内容或 NexoChess 账户标识符发送用于广告个性化。",
        purposeBullet: "在获得分析同意后通过 Google Analytics 4 衡量网站的汇总使用情况，并在启用广告位后通过 Google AdSense 为 NexoChess 提供资金。在适用欧洲法规消息的地区，分析和广告用途遵循 Google 认证 CMP 记录的选择。",
        browserStorageParagraph: "严格必要的身份验证存储与可选统计和广告相互独立。在欧洲经济区、英国和瑞士，Google 认证 CMP 记录适用选择并传递 Google Consent Mode 信号。NexoChess 对 Google Analytics 使用基本同意模式，在 analytics_storage 获得许可前不会加载 Analytics。Google AdSense 可在用户选择和适用法律允许时使用 Cookie 或类似存储。",
        providerBullet: "Google：可选的 Google Analytics 4 统计以及 Google AdSense 广告/同意基础设施。在欧洲经济区、英国和瑞士，NexoChess 使用 Google 认证 CMP 和 Google Consent Mode 管理相关分析与广告用途。NexoChess 的 GA4 集成仍关闭 Google Signals。",
        retentionParagraph: "Google Analytics 与广告/同意数据按照相应 Google 服务的设置和控制保留。你可随时从 NexoChess 的隐私和 Cookie 设置更改或撤回可选同意；适用 Google CMP 时，该操作会重新打开 Google 的欧洲法规消息。",
        rightsParagraph: "适用 Google 认证 CMP 时，你可以从 NexoChess 的隐私和 Cookie 设置重新打开它，以同意、拒绝或管理可用用途。撤回同意不影响撤回前依法进行的处理。"
    },
    vi: {
        updated: "Cập nhật lần cuối: 10 tháng 8 năm 2026",
        plainSummary: "Phân tích có thể lưu trong trình duyệt. Tài khoản tùy chọn bổ sung xác thực cần thiết và lưu trữ đám mây. Tùy lựa chọn của bạn, NexoChess có thể dùng Google Analytics 4 để đo lường tổng hợp và hạ tầng Google AdSense để quản lý sự đồng ý và, khi vị trí quảng cáo được bật, hiển thị quảng cáo. Tại EEA, Vương quốc Anh và Thụy Sĩ, CMP được Google chứng nhận quản lý các lựa chọn phân tích và quảng cáo áp dụng.",
        dataBullet: "Dữ liệu quảng cáo và sự đồng ý: khi hạ tầng Google AdSense được sử dụng, Google có thể xử lý tín hiệu đồng ý, thông tin IP/mạng, trình duyệt và thiết bị cùng mã định danh quảng cáo hoặc cookie theo lựa chọn của người dùng và chính sách Google. NexoChess không cố ý gửi nội dung ván cờ hay mã định danh tài khoản NexoChess để cá nhân hóa quảng cáo.",
        purposeBullet: "Đo lường tổng hợp việc sử dụng trang bằng Google Analytics 4 sau khi có sự đồng ý Phân tích và tài trợ NexoChess bằng Google AdSense khi các vị trí quảng cáo được bật. Ở các khu vực thuộc thông báo quy định Châu Âu, mục đích Phân tích và quảng cáo tuân theo lựa chọn do CMP được Google chứng nhận ghi nhận.",
        browserStorageParagraph: "Lưu trữ xác thực thực sự cần thiết độc lập với đo lường và quảng cáo tùy chọn. Tại EEA, Vương quốc Anh và Thụy Sĩ, CMP được Google chứng nhận ghi lại lựa chọn áp dụng và truyền tín hiệu Google Consent Mode. NexoChess giữ Google Analytics ở chế độ đồng ý cơ bản và không tải Analytics cho đến khi analytics_storage được cấp. Google AdSense có thể dùng cookie hoặc lưu trữ tương tự khi lựa chọn và pháp luật áp dụng cho phép.",
        providerBullet: "Google: đo lường Google Analytics 4 tùy chọn và hạ tầng quảng cáo/đồng ý Google AdSense. Tại EEA, Vương quốc Anh và Thụy Sĩ, NexoChess dùng CMP được Google chứng nhận và Google Consent Mode cho các mục đích Phân tích và quảng cáo liên quan. Google Signals vẫn bị tắt trong tích hợp GA4 của NexoChess.",
        retentionParagraph: "Dữ liệu Google Analytics và quảng cáo/đồng ý được lưu theo cài đặt và kiểm soát của các dịch vụ Google tương ứng. Bạn có thể thay đổi hoặc rút lại sự đồng ý tùy chọn bất cứ lúc nào trong cài đặt quyền riêng tư và cookie của NexoChess; khi Google CMP áp dụng, thao tác này mở lại thông báo quy định Châu Âu của Google.",
        rightsParagraph: "Khi CMP được Google chứng nhận áp dụng, bạn có thể mở lại từ cài đặt quyền riêng tư và cookie của NexoChess để đồng ý, từ chối hoặc quản lý các mục đích có sẵn. Việc rút lại không ảnh hưởng xử lý hợp pháp đã thực hiện trước đó."
    },
    hi: {
        updated: "अंतिम अपडेट: 10 अगस्त 2026",
        plainSummary: "विश्लेषण आपके ब्राउज़र में रह सकता है। वैकल्पिक खाते आवश्यक प्रमाणीकरण और क्लाउड स्टोरेज जोड़ते हैं। आपकी पसंद के अनुसार NexoChess समेकित मापन के लिए Google Analytics 4 और सहमति प्रबंधन तथा विज्ञापन स्थान सक्षम होने पर विज्ञापन के लिए Google AdSense अवसंरचना का उपयोग कर सकता है। EEA, यूनाइटेड किंगडम और स्विट्ज़रलैंड में लागू विश्लेषण और विज्ञापन विकल्प Google-प्रमाणित CMP द्वारा प्रबंधित होते हैं।",
        dataBullet: "विज्ञापन और सहमति डेटा: Google AdSense अवसंरचना लागू होने पर Google उपयोगकर्ता की पसंद और Google नीतियों के अनुसार सहमति संकेत, IP/नेटवर्क जानकारी, ब्राउज़र व डिवाइस जानकारी और विज्ञापन पहचानकर्ता या cookies संसाधित कर सकता है। NexoChess विज्ञापन वैयक्तिकरण के लिए जानबूझकर शतरंज की बाजियों की सामग्री या NexoChess खाता पहचानकर्ता नहीं भेजता।",
        purposeBullet: "Analytics सहमति के बाद Google Analytics 4 से वेबसाइट उपयोग का समेकित मापन करना और विज्ञापन स्थान सक्षम होने पर Google AdSense से NexoChess को वित्तपोषित करना। यूरोपीय विनियमन संदेश वाले क्षेत्रों में Analytics और विज्ञापन उद्देश्य Google-प्रमाणित CMP में दर्ज विकल्पों का पालन करते हैं।",
        browserStorageParagraph: "कड़ाई से आवश्यक प्रमाणीकरण स्टोरेज वैकल्पिक मापन और विज्ञापन से अलग रहता है। EEA, यूनाइटेड किंगडम और स्विट्ज़रलैंड में Google-प्रमाणित CMP लागू विकल्प दर्ज करता है और Google Consent Mode संकेत भेजता है। NexoChess Google Analytics को basic consent mode में रखता है और analytics_storage की अनुमति मिलने तक उसे लोड नहीं करता। Google AdSense लागू पसंद और कानून की अनुमति पर cookies या समान स्टोरेज का उपयोग कर सकता है।",
        providerBullet: "Google: वैकल्पिक Google Analytics 4 मापन और Google AdSense विज्ञापन/सहमति अवसंरचना। EEA, यूनाइटेड किंगडम और स्विट्ज़रलैंड में NexoChess संबंधित Analytics और विज्ञापन उद्देश्यों के लिए Google-प्रमाणित CMP और Google Consent Mode का उपयोग करता है। NexoChess GA4 में Google Signals बंद रहता है।",
        retentionParagraph: "Google Analytics तथा विज्ञापन/सहमति डेटा संबंधित Google सेवाओं की सेटिंग और नियंत्रणों के अनुसार रखा जाता है। आप NexoChess की privacy और cookie settings से कभी भी वैकल्पिक सहमति बदल या वापस ले सकते हैं; Google CMP लागू होने पर यह Google का यूरोपीय संदेश फिर खोलता है।",
        rightsParagraph: "जहाँ Google-प्रमाणित CMP लागू है, आप NexoChess की privacy और cookie settings से उसे फिर खोलकर सहमति दे, अस्वीकार या उपलब्ध उद्देश्यों को प्रबंधित कर सकते हैं। सहमति वापस लेना पहले हुए वैध प्रसंस्करण को प्रभावित नहीं करता।"
    },
    mr: {
        updated: "शेवटचे अद्यतन: 10 ऑगस्ट 2026",
        plainSummary: "विश्लेषण तुमच्या ब्राउझरमध्ये राहू शकते. ऐच्छिक खाते आवश्यक प्रमाणीकरण आणि क्लाउड स्टोरेज जोडते. तुमच्या निवडीनुसार NexoChess एकत्रित मापनासाठी Google Analytics 4 आणि संमती व्यवस्थापनासाठी तसेच जाहिरात जागा सुरू झाल्यावर जाहिरातींसाठी Google AdSense पायाभूत सुविधा वापरू शकते. EEA, युनायटेड किंगडम आणि स्वित्झर्लंडमध्ये लागू Analytics आणि जाहिरात निवडी Google-प्रमाणित CMP व्यवस्थापित करते.",
        dataBullet: "जाहिरात व संमती डेटा: Google AdSense पायाभूत सुविधा लागू असताना Google वापरकर्त्याच्या निवडी आणि Google धोरणांनुसार संमती संकेत, IP/नेटवर्क माहिती, ब्राउझर व डिव्हाइस माहिती आणि जाहिरात ओळखकर्ता किंवा cookies प्रक्रिया करू शकते. NexoChess जाहिरात वैयक्तिकीकरणासाठी जाणूनबुजून बुद्धिबळ सामन्यांचा मजकूर किंवा NexoChess खाते ओळखकर्ता पाठवत नाही.",
        purposeBullet: "Analytics संमतीनंतर Google Analytics 4 द्वारे वेबसाइटचा एकत्रित वापर मोजणे आणि जाहिरात जागा सुरू झाल्यावर Google AdSense द्वारे NexoChess ला निधी देणे. युरोपीय नियम संदेश लागू असलेल्या प्रदेशांत Analytics व जाहिरात उद्देश Google-प्रमाणित CMP मध्ये नोंदवलेल्या निवडींचे पालन करतात.",
        browserStorageParagraph: "काटेकोरपणे आवश्यक प्रमाणीकरण स्टोरेज ऐच्छिक मापन व जाहिरातींपासून स्वतंत्र राहते. EEA, युनायटेड किंगडम आणि स्वित्झर्लंडमध्ये Google-प्रमाणित CMP लागू निवडी नोंदवते आणि Google Consent Mode संकेत पाठवते. NexoChess Google Analytics basic consent mode मध्ये ठेवते आणि analytics_storage मंजूर होईपर्यंत ते लोड करत नाही. लागू निवड व कायदा परवानगी देतात तेव्हा Google AdSense cookies किंवा तत्सम स्टोरेज वापरू शकते.",
        providerBullet: "Google: ऐच्छिक Google Analytics 4 मापन आणि Google AdSense जाहिरात/संमती पायाभूत सुविधा. EEA, युनायटेड किंगडम आणि स्वित्झर्लंडमध्ये NexoChess संबंधित Analytics व जाहिरात उद्देशांसाठी Google-प्रमाणित CMP आणि Google Consent Mode वापरते. NexoChess GA4 मध्ये Google Signals बंद राहते.",
        retentionParagraph: "Google Analytics आणि जाहिरात/संमती डेटा संबंधित Google सेवांच्या सेटिंग्ज व नियंत्रणांनुसार ठेवला जातो. तुम्ही NexoChess privacy आणि cookie settings मधून कधीही ऐच्छिक संमती बदलू किंवा मागे घेऊ शकता; Google CMP लागू असेल तर ही क्रिया Google चा युरोपीय संदेश पुन्हा उघडते.",
        rightsParagraph: "Google-प्रमाणित CMP लागू असेल तेथे तुम्ही NexoChess privacy आणि cookie settings मधून ती पुन्हा उघडून संमती देऊ, नाकारू किंवा उपलब्ध उद्देश व्यवस्थापित करू शकता. संमती मागे घेण्यापूर्वी झालेल्या कायदेशीर प्रक्रियेवर त्याचा परिणाम होत नाही."
    },
    pl: {
        updated: "Ostatnia aktualizacja: 10 sierpnia 2026",
        plainSummary: "Analiza może pozostać w przeglądarce. Opcjonalne konta dodają niezbędne uwierzytelnianie i przechowywanie w chmurze. Zależnie od Twoich wyborów NexoChess może używać Google Analytics 4 do pomiarów zagregowanych oraz infrastruktury Google AdSense do zarządzania zgodą i, po włączeniu miejsc reklamowych, wyświetlania reklam. W EOG, Wielkiej Brytanii i Szwajcarii odpowiednimi wyborami analitycznymi i reklamowymi zarządza certyfikowana CMP Google.",
        dataBullet: "Dane reklamowe i zgody: gdy stosowana jest infrastruktura Google AdSense, Google może przetwarzać sygnały zgody, informacje IP/sieciowe, dane przeglądarki i urządzenia oraz identyfikatory reklamowe lub pliki cookie zgodnie z wyborem użytkownika i zasadami Google. NexoChess nie przekazuje celowo treści partii szachowych ani identyfikatorów kont NexoChess do personalizacji reklam.",
        purposeBullet: "Mierzyć zagregowane użycie witryny za pomocą Google Analytics 4 po zgodzie na Analitykę i finansować NexoChess przez Google AdSense po włączeniu miejsc reklamowych. W regionach objętych europejskim komunikatem cele Analityki i reklamy wynikają z wyborów zapisanych przez certyfikowaną CMP Google.",
        browserStorageParagraph: "Ściśle niezbędna pamięć uwierzytelniania pozostaje oddzielona od opcjonalnych pomiarów i reklam. W EOG, Wielkiej Brytanii i Szwajcarii certyfikowana CMP Google zapisuje odpowiednie wybory i przekazuje sygnały Google Consent Mode. NexoChess utrzymuje Google Analytics w podstawowym trybie zgody i nie ładuje go do czasu udzielenia zgody na analytics_storage. Google AdSense może używać plików cookie lub podobnej pamięci, gdy pozwalają na to wybór użytkownika i prawo.",
        providerBullet: "Google: opcjonalne pomiary Google Analytics 4 oraz infrastruktura reklamowa/zgody Google AdSense. W EOG, Wielkiej Brytanii i Szwajcarii NexoChess korzysta z certyfikowanej CMP Google i Google Consent Mode dla odpowiednich celów Analityki i reklamy. Google Signals pozostaje wyłączone w integracji GA4 NexoChess.",
        retentionParagraph: "Dane Google Analytics oraz dane reklamowe/zgody są przechowywane zgodnie z ustawieniami i mechanizmami właściwych usług Google. Opcjonalną zgodę możesz w każdej chwili zmienić lub wycofać w ustawieniach prywatności i plików cookie NexoChess; tam, gdzie działa CMP Google, otwiera to ponownie europejski komunikat Google.",
        rightsParagraph: "Tam, gdzie działa certyfikowana CMP Google, możesz otworzyć ją ponownie z ustawień prywatności i plików cookie NexoChess, aby wyrazić zgodę, odmówić lub zarządzać dostępnymi celami. Wycofanie zgody nie wpływa na zgodność z prawem wcześniejszego przetwarzania."
    }
};

function cloneSection(section: LegalSection | undefined): LegalSection | undefined {
    if (!section) return undefined;
    return {
        ...section,
        paragraphs: section.paragraphs ? [...section.paragraphs] : undefined,
        bullets: section.bullets ? [...section.bullets] : undefined
    };
}

function normaliseLanguage(language: string) {
    return language.toLowerCase().split("-")[0];
}

export function applyAdvertisingPrivacyRevision(
    copy: LegalDocumentCopy,
    language: string
): LegalDocumentCopy {
    const patch = patches[normaliseLanguage(language)] || patches.en;
    const sections = { ...(copy.sections || {}) };

    const dataCollected = cloneSection(sections.dataCollected);
    if (dataCollected) {
        dataCollected.bullets = [
            ...(dataCollected.bullets || []),
            patch.dataBullet
        ];
        sections.dataCollected = dataCollected;
    }

    const purposes = cloneSection(sections.purposes);
    if (purposes) {
        const bullets = purposes.bullets || [];
        purposes.bullets = bullets.length > 0
            ? [...bullets.slice(0, -1), patch.purposeBullet]
            : [patch.purposeBullet];
        sections.purposes = purposes;
    }

    const browserStorage = cloneSection(sections.browserStorage);
    if (browserStorage) {
        const paragraphs = browserStorage.paragraphs || [];
        browserStorage.paragraphs = paragraphs.length > 0
            ? [...paragraphs.slice(0, -1), patch.browserStorageParagraph]
            : [patch.browserStorageParagraph];
        sections.browserStorage = browserStorage;
    }

    const providers = cloneSection(sections.providers);
    if (providers) {
        const bullets = providers.bullets || [];
        providers.bullets = bullets.length >= 2
            ? [...bullets.slice(0, -2), patch.providerBullet, ...bullets.slice(-1)]
            : [...bullets, patch.providerBullet];
        sections.providers = providers;
    }

    const retention = cloneSection(sections.retention);
    if (retention) {
        const paragraphs = retention.paragraphs || [];
        retention.paragraphs = paragraphs.length > 0
            ? [...paragraphs.slice(0, -1), patch.retentionParagraph]
            : [patch.retentionParagraph];
        sections.retention = retention;
    }

    const rights = cloneSection(sections.rights);
    if (rights) {
        rights.paragraphs = [
            ...(rights.paragraphs || []),
            patch.rightsParagraph
        ];
        sections.rights = rights;
    }

    return {
        ...copy,
        updated: patch.updated,
        plainSummary: patch.plainSummary,
        sections
    };
}
