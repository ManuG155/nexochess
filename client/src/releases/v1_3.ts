import type { SupportedLanguage } from "@/i18n/routing";

export const V1_3_RELEASE_VERSION = "v1.3";
export const V1_3_RELEASE_NOTE_STORAGE_KEY = "nexochess.release-note.v1.3.seen";

// 22 August 2026 at 00:00 in mainland Spain (CEST).
// This keeps the notice available through 21 August at 23:59:59 local time.
export const V1_3_RELEASE_NOTE_CUTOFF = "2026-08-21T22:00:00.000Z";

export interface ReleaseNoteV1_3Copy {
    title: string;
    intro: string;
    changes: readonly string[];
    closing: string;
    confirm: string;
    close: string;
}

export const V1_3_RELEASE_NOTE_COPY: Record<SupportedLanguage, ReleaseNoteV1_3Copy> = {
    en: {
        title: "What's new in NexoChess 1.3",
        intro: "This release makes NexoChess more complete as a learning tool, adds a new way to play and brings a major mobile and tablet overhaul.",
        changes: [
            "Lessons is now a full playable learning path with 80 guided lessons, realistic positions and coach-led practice.",
            "Duel lets you play against Stockfish at selectable Elo levels, with live move feedback, retry/continue on serious mistakes, Undo/Redo and saved unfinished games.",
            "Analysis is more pedagogical: tactical ideas can be opened as playable engine lines, key ideas use selective teaching arrows, and manual board annotations now clear naturally on a tap or click.",
            "Mobile and tablet layouts have been rebuilt across Analysis, Puzzles, Archive, Repertoire, Lessons, Duel and the rest of the main interface, with touch-friendly controls and dedicated mobile review flows.",
            "Puzzles created from your own games now focus on mistakes, misses and blunders instead of inaccuracies. A compact Ko-fi support button has also been added to the navigation bar."
        ],
        closing: "Thanks for using NexoChess and helping us keep improving it.",
        confirm: "Got it",
        close: "Close"
    },
    es: {
        title: "Novedades de NexoChess 1.3",
        intro: "Esta versión hace que NexoChess sea una herramienta de aprendizaje más completa, añade una nueva forma de jugar y estrena una gran optimización para móvil y tablet.",
        changes: [
            "Lecciones es ahora un recorrido jugable completo con 80 lecciones guiadas, posiciones realistas y práctica dirigida por tu entrenador.",
            "Duelo te permite jugar contra Stockfish con distintos niveles de Elo, feedback de jugadas en directo, reintento o continuación tras errores graves, Deshacer/Rehacer y partidas sin terminar guardadas.",
            "El Análisis es más pedagógico: las ideas tácticas pueden abrirse como variantes jugables del motor, las ideas clave usan flechas didácticas selectivas y las anotaciones manuales del tablero se limpian de forma natural con un toque o clic.",
            "La interfaz para móvil y tablet se ha reconstruido en Análisis, Puzzles, Archivo, Repertorio, Lecciones, Duelo y el resto de secciones principales, con controles táctiles y flujos de revisión específicos para móvil.",
            "Los puzzles creados desde tus propias partidas ahora se centran en errores, omisiones y errores graves, excluyendo las imprecisiones. También se ha añadido un botón compacto de Ko-fi en la barra de navegación."
        ],
        closing: "Gracias por usar NexoChess y ayudarnos a seguir mejorándolo.",
        confirm: "Vale",
        close: "Cerrar"
    },
    fr: {
        title: "Nouveautés de NexoChess 1.3",
        intro: "Cette version rend NexoChess plus complet pour apprendre, ajoute une nouvelle façon de jouer et apporte une importante refonte mobile et tablette.",
        changes: [
            "Les Leçons forment désormais un parcours jouable complet avec 80 leçons guidées, des positions réalistes et un entraînement mené par votre coach.",
            "Duel permet de jouer contre Stockfish à plusieurs niveaux Elo, avec retour en direct, possibilité de rejouer ou continuer après une grosse erreur, Annuler/Rétablir et sauvegarde des parties inachevées.",
            "L'Analyse devient plus pédagogique : les idées tactiques s'ouvrent comme des variantes jouables du moteur, les idées importantes utilisent des flèches didactiques sélectives et les annotations manuelles s'effacent naturellement d'un toucher ou d'un clic.",
            "Les interfaces mobile et tablette ont été repensées dans Analyse, Puzzles, Archives, Répertoire, Leçons, Duel et le reste de l'interface principale, avec des contrôles tactiles et un flux de révision dédié au mobile.",
            "Les puzzles créés depuis vos parties se concentrent maintenant sur les erreurs, occasions manquées et grosses erreurs, sans utiliser les imprécisions. Un bouton Ko-fi compact a aussi été ajouté à la barre de navigation."
        ],
        closing: "Merci d'utiliser NexoChess et de nous aider à l'améliorer.",
        confirm: "Compris",
        close: "Fermer"
    },
    de: {
        title: "Neu in NexoChess 1.3",
        intro: "Diese Version macht NexoChess als Lernwerkzeug vollständiger, ergänzt eine neue Spielmöglichkeit und bringt eine große Überarbeitung für Mobilgeräte und Tablets.",
        changes: [
            "Lessons ist jetzt ein vollständig spielbarer Lernpfad mit 80 geführten Lektionen, realistischen Stellungen und coach-geführtem Training.",
            "Duel ermöglicht Partien gegen Stockfish auf wählbaren Elo-Stufen, mit Live-Zugfeedback, Wiederholen oder Fortsetzen nach schweren Fehlern, Rückgängig/Wiederholen und gespeicherten unfertigen Partien.",
            "Analysis ist lehrreicher: Taktische Ideen lassen sich als spielbare Engine-Varianten öffnen, wichtige Ideen erhalten gezielte Lehrpfeile und manuelle Brettmarkierungen verschwinden natürlich nach Tippen oder Klicken.",
            "Die Mobil- und Tablet-Oberflächen wurden für Analysis, Puzzles, Archive, Repertoire, Lessons, Duel und die übrigen Hauptbereiche neu aufgebaut, mit touchfreundlichen Bedienelementen und eigenen mobilen Review-Abläufen.",
            "Puzzles aus eigenen Partien konzentrieren sich nun auf Fehler, verpasste Chancen und grobe Fehler statt auf Ungenauigkeiten. Zusätzlich gibt es einen kompakten Ko-fi-Button in der Navigation."
        ],
        closing: "Danke, dass du NexoChess nutzt und uns beim Verbessern hilfst.",
        confirm: "Alles klar",
        close: "Schließen"
    },
    pt: {
        title: "Novidades do NexoChess 1.3",
        intro: "Esta versão torna o NexoChess uma ferramenta de aprendizagem mais completa, acrescenta uma nova forma de jogar e traz uma grande otimização para telemóvel e tablet.",
        changes: [
            "As Lições são agora um percurso jogável completo com 80 lições guiadas, posições realistas e prática orientada pelo treinador.",
            "O Duelo permite jogar contra o Stockfish em vários níveis de Elo, com feedback em direto, repetir ou continuar após erros graves, Desfazer/Refazer e partidas inacabadas guardadas.",
            "A Análise está mais pedagógica: ideias táticas podem abrir-se como variantes jogáveis do motor, as ideias-chave usam setas didáticas seletivas e as anotações manuais desaparecem naturalmente com um toque ou clique.",
            "A interface para telemóvel e tablet foi reconstruída em Análise, Puzzles, Arquivo, Repertório, Lições, Duelo e nas restantes áreas principais, com controlos táteis e fluxos de revisão próprios para móvel.",
            "Os puzzles criados a partir das tuas partidas passam a focar erros, omissões e erros graves em vez de imprecisões. Também foi adicionado um botão compacto do Ko-fi à barra de navegação."
        ],
        closing: "Obrigado por usares o NexoChess e por nos ajudares a melhorá-lo.",
        confirm: "Entendido",
        close: "Fechar"
    },
    ru: {
        title: "Что нового в NexoChess 1.3",
        intro: "Эта версия делает NexoChess более полноценным инструментом для обучения, добавляет новый режим игры и значительно улучшает работу на телефонах и планшетах.",
        changes: [
            "Lessons теперь представляет собой полноценный игровой путь из 80 уроков с реалистичными позициями и практикой под руководством тренера.",
            "Duel позволяет играть против Stockfish на разных уровнях Elo, получать оценку ходов в реальном времени, переигрывать или продолжать после серьёзных ошибок, использовать отмену/повтор и сохранять незавершённые партии.",
            "Analysis стал более обучающим: тактические идеи открываются как игровые варианты движка, ключевые идеи отмечаются выборочными обучающими стрелками, а ручные пометки на доске естественно очищаются после касания или клика.",
            "Интерфейс для телефонов и планшетов переработан в Analysis, Puzzles, Archive, Repertoire, Lessons, Duel и других основных разделах: добавлены удобные сенсорные элементы и отдельные мобильные сценарии разбора.",
            "Puzzles из ваших партий теперь строятся на ошибках, упущениях и грубых ошибках, а не на неточностях. В навигацию также добавлена компактная кнопка Ko-fi."
        ],
        closing: "Спасибо, что пользуетесь NexoChess и помогаете нам становиться лучше.",
        confirm: "Понятно",
        close: "Закрыть"
    },
    zh: {
        title: "NexoChess 1.3 更新内容",
        intro: "本次版本让 NexoChess 成为更完整的学习工具，新增了对弈方式，并大幅优化了手机和平板体验。",
        changes: [
            "Lessons 现已成为完整可玩的学习路线，包含 80 节引导课程、真实棋局位置以及教练陪练。",
            "Duel 允许你在不同 Elo 难度下与 Stockfish 对弈，并提供实时走法反馈、严重失误后的重试或继续、撤销/重做以及未完成对局保存。",
            "Analysis 更具教学性：战术主题可以作为可播放的引擎变化展开，关键思路会使用精选教学箭头，手动画线和标记也会在点击或触摸后自然清除。",
            "Analysis、Puzzles、Archive、Repertoire、Lessons、Duel 以及其他主要页面的手机和平板布局已重新构建，加入更适合触控的操作和专门的移动端复盘流程。",
            "从个人对局生成的 Puzzles 现在只关注错误、错失机会和严重错误，不再使用轻微不精准。导航栏中也新增了紧凑的 Ko-fi 支持按钮。"
        ],
        closing: "感谢你使用 NexoChess，并帮助我们继续改进。",
        confirm: "知道了",
        close: "关闭"
    },
    vi: {
        title: "Có gì mới trong NexoChess 1.3",
        intro: "Phiên bản này biến NexoChess thành công cụ học tập hoàn thiện hơn, bổ sung cách chơi mới và nâng cấp lớn cho điện thoại và máy tính bảng.",
        changes: [
            "Lessons giờ là một lộ trình học có thể chơi đầy đủ với 80 bài hướng dẫn, thế cờ thực tế và luyện tập cùng huấn luyện viên.",
            "Duel cho phép chơi với Stockfish ở nhiều mức Elo, có phản hồi nước đi trực tiếp, chơi lại hoặc tiếp tục sau lỗi nghiêm trọng, Hoàn tác/Làm lại và lưu ván chưa kết thúc.",
            "Analysis mang tính sư phạm hơn: ý tưởng chiến thuật có thể mở thành biến động cơ để phát lại, các ý tưởng quan trọng dùng mũi tên giảng dạy chọn lọc và ghi chú thủ công trên bàn cờ tự xóa khi chạm hoặc nhấp.",
            "Giao diện điện thoại và máy tính bảng đã được xây dựng lại cho Analysis, Puzzles, Archive, Repertoire, Lessons, Duel và các khu vực chính khác, với điều khiển thân thiện cảm ứng và luồng review riêng cho di động.",
            "Puzzles tạo từ ván của bạn giờ tập trung vào lỗi, bỏ lỡ và lỗi nặng thay vì những nước chưa chính xác. Thanh điều hướng cũng có thêm nút Ko-fi nhỏ gọn."
        ],
        closing: "Cảm ơn bạn đã dùng NexoChess và giúp chúng tôi tiếp tục cải thiện.",
        confirm: "Đã hiểu",
        close: "Đóng"
    },
    hi: {
        title: "NexoChess 1.3 में नया क्या है",
        intro: "यह संस्करण NexoChess को अधिक पूर्ण सीखने का साधन बनाता है, खेलने का नया तरीका जोड़ता है और मोबाइल व टैबलेट अनुभव को बड़े स्तर पर बेहतर करता है।",
        changes: [
            "Lessons अब 80 निर्देशित पाठों, वास्तविक स्थितियों और कोच-आधारित अभ्यास के साथ पूरी तरह खेलने योग्य सीखने की यात्रा है।",
            "Duel में अलग-अलग Elo स्तरों पर Stockfish के खिलाफ खेल सकते हैं, लाइव चाल प्रतिक्रिया, बड़ी गलती के बाद दोबारा कोशिश या जारी रखने, Undo/Redo और अधूरी गेम सेव करने की सुविधा है।",
            "Analysis अब अधिक शिक्षाप्रद है: सामरिक विचार खेलने योग्य इंजन लाइनों के रूप में खुलते हैं, मुख्य विचारों पर चुनिंदा शिक्षण तीर दिखते हैं और हाथ से बनाई गई बोर्ड टिप्पणियाँ टैप या क्लिक पर स्वाभाविक रूप से साफ हो जाती हैं।",
            "Analysis, Puzzles, Archive, Repertoire, Lessons, Duel और अन्य मुख्य हिस्सों के मोबाइल व टैबलेट लेआउट दोबारा बनाए गए हैं, टच-अनुकूल नियंत्रण और मोबाइल के लिए विशेष review flow के साथ।",
            "आपकी गेम से बने Puzzles अब inaccuracies के बजाय mistakes, misses और blunders पर केंद्रित हैं। नेविगेशन बार में एक छोटा Ko-fi support button भी जोड़ा गया है।"
        ],
        closing: "NexoChess का उपयोग करने और इसे बेहतर बनाने में हमारी मदद करने के लिए धन्यवाद।",
        confirm: "ठीक है",
        close: "बंद करें"
    },
    mr: {
        title: "NexoChess 1.3 मध्ये नवीन काय आहे",
        intro: "ही आवृत्ती NexoChess ला अधिक संपूर्ण शिकण्याचे साधन बनवते, खेळण्याचा नवा मार्ग जोडते आणि मोबाईल व टॅबलेट अनुभवात मोठी सुधारणा करते.",
        changes: [
            "Lessons आता 80 मार्गदर्शित धडे, वास्तववादी स्थिती आणि प्रशिक्षकासोबत सराव असलेला पूर्णपणे खेळता येणारा शिक्षणमार्ग आहे.",
            "Duel मध्ये निवडक Elo स्तरांवर Stockfish विरुद्ध खेळता येते, थेट चाल अभिप्राय, गंभीर चुकीनंतर पुन्हा प्रयत्न किंवा पुढे जाणे, Undo/Redo आणि अपूर्ण खेळ जतन करण्याची सुविधा आहे.",
            "Analysis अधिक शिकवणारा झाला आहे: सामरिक कल्पना खेळता येणाऱ्या इंजिन लाईन्स म्हणून उघडतात, महत्त्वाच्या कल्पनांसाठी निवडक शिकवणी बाण दिसतात आणि हाताने केलेल्या बोर्ड नोंदी टॅप किंवा क्लिकवर सहज साफ होतात.",
            "Analysis, Puzzles, Archive, Repertoire, Lessons, Duel आणि इतर मुख्य भागांसाठी मोबाईल व टॅबलेट लेआउट पुन्हा बांधले आहेत, टच-अनुकूल नियंत्रण आणि मोबाईलसाठी स्वतंत्र review flow सह.",
            "तुमच्या खेळांवरून तयार होणारे Puzzles आता inaccuracies ऐवजी mistakes, misses आणि blunders वर लक्ष केंद्रित करतात. नेव्हिगेशन बारमध्ये छोटा Ko-fi support button देखील जोडला आहे."
        ],
        closing: "NexoChess वापरल्याबद्दल आणि ते सुधारण्यास मदत केल्याबद्दल धन्यवाद.",
        confirm: "ठीक आहे",
        close: "बंद करा"
    },
    pl: {
        title: "Co nowego w NexoChess 1.3",
        intro: "Ta wersja rozwija NexoChess jako narzędzie do nauki, dodaje nowy sposób gry i przynosi dużą przebudowę interfejsu na telefonach i tabletach.",
        changes: [
            "Lessons to teraz pełna grywalna ścieżka nauki z 80 prowadzonymi lekcjami, realistycznymi pozycjami i treningiem z trenerem.",
            "Duel pozwala grać ze Stockfishem na wybranych poziomach Elo, z oceną ruchów na żywo, opcją ponowienia lub kontynuacji po poważnym błędzie, Cofnij/Ponów i zapisem niedokończonych partii.",
            "Analysis jest bardziej dydaktyczny: motywy taktyczne można otwierać jako grywalne warianty silnika, kluczowe pomysły dostają selektywne strzałki edukacyjne, a ręczne adnotacje na szachownicy znikają naturalnie po dotknięciu lub kliknięciu.",
            "Układy mobilne i tabletowe przebudowano w Analysis, Puzzles, Archive, Repertoire, Lessons, Duel i pozostałych głównych obszarach, z wygodnymi kontrolkami dotykowymi i osobnym mobilnym przepływem przeglądu partii.",
            "Puzzles tworzone z własnych partii skupiają się teraz na błędach, przeoczeniach i poważnych błędach zamiast na niedokładnościach. Do paska nawigacji dodano też kompaktowy przycisk Ko-fi."
        ],
        closing: "Dziękujemy za korzystanie z NexoChess i pomoc w jego dalszym ulepszaniu.",
        confirm: "Rozumiem",
        close: "Zamknij"
    }
};

export function releaseNoteV1_3HasExpired(now = Date.now()): boolean {
    return now >= Date.parse(V1_3_RELEASE_NOTE_CUTOFF);
}
