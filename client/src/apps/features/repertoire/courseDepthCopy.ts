const COPY = {
    en: {
        depth: "Theory depth",
        learned: "{learned}/{available} moves learned",
        newTheory: "New theory: moves {from}–{to}",
        available: "{remaining} more moves available",
        complete: "Full available line learned",
        deepen: "Deepen +{count}",
        deepenBody: "Add the next small block, then reconnect it with everything you already know.",
        partial: "Continue deeper",
        review: "Review learned depth"
    },
    es: {
        depth: "Profundidad teórica",
        learned: "{learned}/{available} jugadas aprendidas",
        newTheory: "Teoría nueva: jugadas {from}–{to}",
        available: "Quedan {remaining} jugadas por profundizar",
        complete: "Línea teórica disponible completada",
        deepen: "Profundizar +{count}",
        deepenBody: "Añade el siguiente bloque corto y después únelo con todo lo que ya sabes.",
        partial: "Seguir profundizando",
        review: "Repasar profundidad aprendida"
    },
    fr: {
        depth: "Profondeur théorique",
        learned: "{learned}/{available} coups appris",
        newTheory: "Nouvelle théorie : coups {from}–{to}",
        available: "Encore {remaining} coups à approfondir",
        complete: "Ligne théorique disponible terminée",
        deepen: "Approfondir +{count}",
        deepenBody: "Ajoutez le prochain petit bloc, puis reliez-le à tout ce que vous connaissez déjà.",
        partial: "Continuer à approfondir",
        review: "Réviser la profondeur apprise"
    },
    de: {
        depth: "Theorietiefe",
        learned: "{learned}/{available} Züge gelernt",
        newTheory: "Neue Theorie: Züge {from}–{to}",
        available: "Noch {remaining} Züge verfügbar",
        complete: "Verfügbare Theorielinie abgeschlossen",
        deepen: "+{count} vertiefen",
        deepenBody: "Lerne den nächsten kurzen Block und verbinde ihn danach mit allem, was du schon kannst.",
        partial: "Weiter vertiefen",
        review: "Gelernte Tiefe wiederholen"
    },
    pt: {
        depth: "Profundidade teórica",
        learned: "{learned}/{available} lances aprendidos",
        newTheory: "Nova teoria: lances {from}–{to}",
        available: "Faltam {remaining} lances para aprofundar",
        complete: "Linha teórica disponível concluída",
        deepen: "Aprofundar +{count}",
        deepenBody: "Adicione o próximo bloco curto e depois ligue-o a tudo o que já sabe.",
        partial: "Continuar a aprofundar",
        review: "Rever profundidade aprendida"
    },
    ru: {
        depth: "Глубина теории",
        learned: "Изучено ходов: {learned}/{available}",
        newTheory: "Новая теория: ходы {from}–{to}",
        available: "Ещё {remaining} ходов для углубления",
        complete: "Доступная теоретическая линия изучена полностью",
        deepen: "Углубить +{count}",
        deepenBody: "Добавьте следующий короткий блок, затем соедините его со всем, что уже знаете.",
        partial: "Углубить дальше",
        review: "Повторить изученную глубину"
    },
    zh: {
        depth: "理论深度",
        learned: "已学 {learned}/{available} 回合",
        newTheory: "新理论：第 {from}–{to} 回合",
        available: "还有 {remaining} 回合可继续深入",
        complete: "已学完整条可用理论线路",
        deepen: "深入 +{count}",
        deepenBody: "先加入下一个短小片段，再把它与已经掌握的内容连起来。",
        partial: "继续深入",
        review: "复习已学深度"
    },
    vi: {
        depth: "Độ sâu lý thuyết",
        learned: "Đã học {learned}/{available} nước",
        newTheory: "Lý thuyết mới: nước {from}–{to}",
        available: "Còn {remaining} nước để đào sâu",
        complete: "Đã học hết dòng lý thuyết hiện có",
        deepen: "Đào sâu +{count}",
        deepenBody: "Thêm một đoạn ngắn tiếp theo rồi nối nó với toàn bộ phần bạn đã biết.",
        partial: "Tiếp tục đào sâu",
        review: "Ôn độ sâu đã học"
    },
    hi: {
        depth: "सैद्धांतिक गहराई",
        learned: "{learned}/{available} चालें सीखी गईं",
        newTheory: "नई थ्योरी: चालें {from}–{to}",
        available: "और {remaining} चालें गहराई में उपलब्ध हैं",
        complete: "उपलब्ध पूरी थ्योरी लाइन सीख ली गई",
        deepen: "+{count} और गहराई",
        deepenBody: "अगला छोटा भाग जोड़ें, फिर उसे पहले से सीखी हुई पूरी लाइन से जोड़ें।",
        partial: "और गहराई में जाएँ",
        review: "सीखी हुई गहराई दोहराएँ"
    },
    mr: {
        depth: "सैद्धांतिक खोली",
        learned: "{learned}/{available} चाली शिकल्या",
        newTheory: "नवी थिअरी: चाली {from}–{to}",
        available: "आणखी {remaining} चाली खोलात उपलब्ध",
        complete: "उपलब्ध पूर्ण थिअरी लाइन शिकली",
        deepen: "+{count} खोलात जा",
        deepenBody: "पुढचा छोटा भाग जोडा आणि मग तो आधी शिकलेल्या संपूर्ण लाइनशी जोडा.",
        partial: "आणखी खोलात जा",
        review: "शिकलेली खोली पुन्हा सराव करा"
    },
    pl: {
        depth: "Głębokość teorii",
        learned: "Nauczono {learned}/{available} ruchów",
        newTheory: "Nowa teoria: ruchy {from}–{to}",
        available: "Pozostało {remaining} ruchów do pogłębienia",
        complete: "Cała dostępna linia teoretyczna opanowana",
        deepen: "Pogłęb +{count}",
        deepenBody: "Dodaj kolejny krótki blok, a potem połącz go ze wszystkim, co już znasz.",
        partial: "Pogłębiaj dalej",
        review: "Powtórz opanowaną głębokość"
    }
} as const;

type Copy = typeof COPY.en;

export function courseDepthCopy(language: string): Copy {
    const base = (language || "en").toLowerCase().split("-")[0] as keyof typeof COPY;
    return (COPY[base] || COPY.en) as Copy;
}

export function formatDepthCopy(text: string, values: Record<string, string | number>) {
    return Object.entries(values).reduce(
        (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
        text
    );
}
