import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chess } from "chess.js";

import useSettingsStore from "@/stores/SettingsStore";
import { classificationColours, classificationImages } from "@analysis/constants/classifications";
import { Classification } from "shared/constants/Classification";

import { analyseRepertoirePosition, evaluateRepertoireMove, RepertoireEngineResult, RepertoireMoveQuality } from "./repertoireEngine";
import { habitAtFen, positionHabitChangeEvent, readPositionHabits, PositionHabit } from "./playerPositionHabits";
import * as styles from "./repertoireEngine.module.css";

type Lang = "en" | "es" | "fr" | "de" | "pt" | "ru" | "zh" | "vi" | "hi" | "mr" | "pl";

const COPY: Record<Lang, {
    eyebrow: string; title: string; intro: string; analyse: string; analysing: string; best: string; line: string; add: string; added: string;
    yourGames: string; usually: string; fromGames: string; quality: string; noHabit: string; error: string; coachBest: string; coachHabitGood: string; coachHabitBad: string;
    labels: Record<Classification, string>;
}> = {
    en: { eyebrow:"STOCKFISH 17", title:"Engine recommendation", intro:"Check the current position without leaving your repertoire.", analyse:"Ask Stockfish", analysing:"Analysing…", best:"Best move", line:"Suggested continuation", add:"Add this line", added:"Line added", yourGames:"Your recent games", usually:"Here you usually play", fromGames:"observed games", quality:"Estimated quality", noHabit:"No imported-game habit is available for this exact position.", error:"Stockfish could not analyse this position.", coachBest:"This is the engine's first choice. Study the idea behind the continuation, not only the move.", coachHabitGood:"Your usual move is close to the engine choice here; the important part is knowing the continuation.", coachHabitBad:"Your usual move concedes more than the engine choice here. This is a useful position to add and rehearse.", labels:{ brilliant:"Brilliant", critical:"Critical", best:"Best", excellent:"Excellent", okay:"Okay", inaccuracy:"Inaccuracy", mistake:"Mistake", miss:"Miss", blunder:"Blunder", theory:"Theory", forced:"Forced", risky:"Risky" } },
    es: { eyebrow:"STOCKFISH 17", title:"Recomendación del motor", intro:"Consulta la posición actual sin salir de tu repertorio.", analyse:"Consultar Stockfish", analysing:"Analizando…", best:"Mejor jugada", line:"Continuación recomendada", add:"Añadir esta línea", added:"Línea añadida", yourGames:"Tus partidas recientes", usually:"Aquí sueles jugar", fromGames:"partidas observadas", quality:"Calidad estimada", noHabit:"No hay un hábito importado para esta posición exacta.", error:"Stockfish no ha podido analizar esta posición.", coachBest:"Es la primera opción del motor. Estudia la idea de la continuación, no memorices solo la jugada.", coachHabitGood:"Tu jugada habitual está cerca de la elección del motor; aquí importa sobre todo conocer la continuación.", coachHabitBad:"Tu jugada habitual cede más que la elección del motor. Esta posición merece guardarse y repetirse.", labels:{ brilliant:"Brillante", critical:"Crítica", best:"Mejor", excellent:"Excelente", okay:"Correcta", inaccuracy:"Imprecisión", mistake:"Error", miss:"Oportunidad perdida", blunder:"Grave error", theory:"Teoría", forced:"Forzada", risky:"Arriesgada" } },
    fr: { eyebrow:"STOCKFISH 17", title:"Recommandation du moteur", intro:"Analysez la position actuelle sans quitter votre répertoire.", analyse:"Consulter Stockfish", analysing:"Analyse…", best:"Meilleur coup", line:"Suite recommandée", add:"Ajouter cette ligne", added:"Ligne ajoutée", yourGames:"Vos parties récentes", usually:"Ici, vous jouez habituellement", fromGames:"parties observées", quality:"Qualité estimée", noHabit:"Aucune habitude importée n'est disponible pour cette position exacte.", error:"Stockfish n'a pas pu analyser cette position.", coachBest:"C'est le premier choix du moteur. Étudiez l'idée de la suite, pas seulement le coup.", coachHabitGood:"Votre coup habituel est proche du choix du moteur ; l'essentiel est de connaître la suite.", coachHabitBad:"Votre coup habituel concède davantage que le choix du moteur. Cette position mérite d'être enregistrée et répétée.", labels:{ brilliant:"Brillant", critical:"Critique", best:"Meilleur", excellent:"Excellent", okay:"Correct", inaccuracy:"Imprécision", mistake:"Erreur", miss:"Occasion manquée", blunder:"Gaffe", theory:"Théorie", forced:"Forcé", risky:"Risqué" } },
    de: { eyebrow:"STOCKFISH 17", title:"Engine-Empfehlung", intro:"Analysiere die aktuelle Stellung direkt im Repertoire.", analyse:"Stockfish fragen", analysing:"Analyse…", best:"Bester Zug", line:"Empfohlene Fortsetzung", add:"Diese Variante hinzufügen", added:"Variante hinzugefügt", yourGames:"Deine letzten Partien", usually:"Hier spielst du meistens", fromGames:"beobachtete Partien", quality:"Geschätzte Qualität", noHabit:"Für diese genaue Stellung gibt es keine importierte Gewohnheit.", error:"Stockfish konnte diese Stellung nicht analysieren.", coachBest:"Das ist die erste Wahl der Engine. Lerne die Idee der Fortsetzung, nicht nur den Zug.", coachHabitGood:"Dein üblicher Zug liegt nahe an der Engine-Wahl; wichtig ist hier vor allem die Fortsetzung.", coachHabitBad:"Dein üblicher Zug gibt mehr preis als die Engine-Wahl. Diese Stellung solltest du speichern und wiederholen.", labels:{ brilliant:"Brillant", critical:"Kritisch", best:"Am besten", excellent:"Ausgezeichnet", okay:"In Ordnung", inaccuracy:"Ungenauigkeit", mistake:"Fehler", miss:"Verpasste Chance", blunder:"Patzer", theory:"Theorie", forced:"Erzwungen", risky:"Riskant" } },
    pt: { eyebrow:"STOCKFISH 17", title:"Recomendação do motor", intro:"Analise a posição atual sem sair do repertório.", analyse:"Consultar Stockfish", analysing:"Analisando…", best:"Melhor lance", line:"Continuação recomendada", add:"Adicionar esta linha", added:"Linha adicionada", yourGames:"Suas partidas recentes", usually:"Aqui você costuma jogar", fromGames:"partidas observadas", quality:"Qualidade estimada", noHabit:"Não há hábito importado para esta posição exata.", error:"O Stockfish não conseguiu analisar esta posição.", coachBest:"Esta é a primeira escolha do motor. Estude a ideia da continuação, não apenas o lance.", coachHabitGood:"Seu lance habitual está perto da escolha do motor; aqui importa conhecer a continuação.", coachHabitBad:"Seu lance habitual cede mais que a escolha do motor. Vale guardar e repetir esta posição.", labels:{ brilliant:"Brilhante", critical:"Crítico", best:"Melhor", excellent:"Excelente", okay:"Correto", inaccuracy:"Imprecisão", mistake:"Erro", miss:"Oportunidade perdida", blunder:"Erro grave", theory:"Teoria", forced:"Forçado", risky:"Arriscado" } },
    ru: { eyebrow:"STOCKFISH 17", title:"Рекомендация движка", intro:"Проверьте текущую позицию, не выходя из репертуара.", analyse:"Спросить Stockfish", analysing:"Анализ…", best:"Лучший ход", line:"Рекомендуемое продолжение", add:"Добавить вариант", added:"Вариант добавлен", yourGames:"Ваши недавние партии", usually:"В этой позиции вы обычно играете", fromGames:"проанализированных партий", quality:"Оценка качества", noHabit:"Для этой точной позиции нет данных из импортированных партий.", error:"Stockfish не смог проанализировать эту позицию.", coachBest:"Это первый выбор движка. Изучайте идею продолжения, а не только сам ход.", coachHabitGood:"Ваш обычный ход близок к выбору движка; здесь важнее знать продолжение.", coachHabitBad:"Ваш обычный ход уступает выбору движка. Эту позицию полезно сохранить и повторять.", labels:{ brilliant:"Блестящий", critical:"Критический", best:"Лучший", excellent:"Отличный", okay:"Нормальный", inaccuracy:"Неточность", mistake:"Ошибка", miss:"Упущенная возможность", blunder:"Грубая ошибка", theory:"Теория", forced:"Вынужденный", risky:"Рискованный" } },
    zh: { eyebrow:"STOCKFISH 17", title:"引擎建议", intro:"无需离开你的开局库即可分析当前局面。", analyse:"询问 Stockfish", analysing:"分析中…", best:"最佳着法", line:"推荐后续", add:"添加此线路", added:"线路已添加", yourGames:"你的近期对局", usually:"你在这里通常会走", fromGames:"盘已观察对局", quality:"估计质量", noHabit:"该精确局面暂无导入对局习惯数据。", error:"Stockfish 无法分析该局面。", coachBest:"这是引擎的首选。重点理解后续思路，而不只是记住这一着。", coachHabitGood:"你的常用着法与引擎选择接近；这里更重要的是掌握后续。", coachHabitBad:"你的常用着法比引擎选择损失更多。这个局面值得保存并反复训练。", labels:{ brilliant:"妙着", critical:"关键", best:"最佳", excellent:"优秀", okay:"不错", inaccuracy:"不准确", mistake:"错误", miss:"错失机会", blunder:"严重失误", theory:"理论", forced:"唯一", risky:"冒险" } },
    vi: { eyebrow:"STOCKFISH 17", title:"Gợi ý của máy", intro:"Kiểm tra thế cờ hiện tại ngay trong kho khai cuộc.", analyse:"Hỏi Stockfish", analysing:"Đang phân tích…", best:"Nước tốt nhất", line:"Biến tiếp diễn đề xuất", add:"Thêm biến này", added:"Đã thêm biến", yourGames:"Các ván gần đây của bạn", usually:"Ở đây bạn thường đi", fromGames:"ván đã quan sát", quality:"Chất lượng ước tính", noHabit:"Không có dữ liệu thói quen đã nhập cho chính xác thế cờ này.", error:"Stockfish không thể phân tích thế cờ này.", coachBest:"Đây là lựa chọn số một của máy. Hãy học ý tưởng của biến tiếp diễn, không chỉ nhớ nước đi.", coachHabitGood:"Nước bạn thường chơi khá gần lựa chọn của máy; điều quan trọng là biết biến tiếp diễn.", coachHabitBad:"Nước bạn thường chơi mất nhiều hơn lựa chọn của máy. Đây là thế cờ nên lưu và ôn lại.", labels:{ brilliant:"Xuất sắc", critical:"Then chốt", best:"Tốt nhất", excellent:"Rất tốt", okay:"Ổn", inaccuracy:"Thiếu chính xác", mistake:"Sai lầm", miss:"Bỏ lỡ", blunder:"Sai lầm nghiêm trọng", theory:"Lý thuyết", forced:"Bắt buộc", risky:"Mạo hiểm" } },
    hi: { eyebrow:"STOCKFISH 17", title:"इंजन की सिफारिश", intro:"अपने रेपर्टरी से बाहर निकले बिना मौजूदा स्थिति जाँचें।", analyse:"Stockfish से पूछें", analysing:"विश्लेषण हो रहा है…", best:"सर्वश्रेष्ठ चाल", line:"सुझाई गई अगली चालें", add:"यह लाइन जोड़ें", added:"लाइन जोड़ दी गई", yourGames:"आपकी हाल की बाजियाँ", usually:"यहाँ आप आम तौर पर चलते हैं", fromGames:"देखी गई बाजियाँ", quality:"अनुमानित गुणवत्ता", noHabit:"इस सटीक स्थिति के लिए आयातित बाजियों का डेटा उपलब्ध नहीं है।", error:"Stockfish इस स्थिति का विश्लेषण नहीं कर सका।", coachBest:"यह इंजन की पहली पसंद है। केवल चाल नहीं, आगे की योजना को भी समझें।", coachHabitGood:"आपकी सामान्य चाल इंजन की पसंद के करीब है; यहाँ आगे की लाइन जानना अधिक महत्वपूर्ण है।", coachHabitBad:"आपकी सामान्य चाल इंजन की पसंद से अधिक नुकसान देती है। इस स्थिति को सहेजकर दोहराना उपयोगी होगा।", labels:{ brilliant:"शानदार", critical:"महत्वपूर्ण", best:"सर्वश्रेष्ठ", excellent:"उत्कृष्ट", okay:"ठीक", inaccuracy:"अशुद्धि", mistake:"गलती", miss:"मौका चूका", blunder:"भारी गलती", theory:"सिद्धांत", forced:"अनिवार्य", risky:"जोखिमपूर्ण" } },
    mr: { eyebrow:"STOCKFISH 17", title:"इंजिनची शिफारस", intro:"तुमच्या रेपर्टरीतून बाहेर न पडता सध्याची स्थिती तपासा.", analyse:"Stockfish ला विचारा", analysing:"विश्लेषण सुरू आहे…", best:"सर्वोत्तम चाल", line:"सुचवलेली पुढील चाल", add:"ही लाईन जोडा", added:"लाईन जोडली", yourGames:"तुमचे अलीकडील सामने", usually:"इथे तुम्ही सहसा खेळता", fromGames:"पाहिलेले सामने", quality:"अंदाजे गुणवत्ता", noHabit:"या अचूक स्थितीसाठी आयात केलेल्या सामन्यांचा डेटा उपलब्ध नाही.", error:"Stockfish या स्थितीचे विश्लेषण करू शकला नाही.", coachBest:"ही इंजिनची पहिली पसंती आहे. फक्त चाल नव्हे तर पुढील कल्पनाही समजून घ्या.", coachHabitGood:"तुमची नेहमीची चाल इंजिनच्या निवडीजवळ आहे; पुढील लाईन जाणून घेणे महत्त्वाचे आहे.", coachHabitBad:"तुमची नेहमीची चाल इंजिनच्या निवडीपेक्षा जास्त नुकसान करते. ही स्थिती जतन करून सराव करणे उपयुक्त आहे.", labels:{ brilliant:"अप्रतिम", critical:"निर्णायक", best:"सर्वोत्तम", excellent:"उत्कृष्ट", okay:"ठीक", inaccuracy:"अचूकतेचा अभाव", mistake:"चूक", miss:"संधी गमावली", blunder:"मोठी चूक", theory:"सिद्धांत", forced:"अनिवार्य", risky:"धोकादायक" } },
    pl: { eyebrow:"STOCKFISH 17", title:"Rekomendacja silnika", intro:"Sprawdź bieżącą pozycję bez opuszczania repertuaru.", analyse:"Zapytaj Stockfisha", analysing:"Analiza…", best:"Najlepszy ruch", line:"Zalecana kontynuacja", add:"Dodaj ten wariant", added:"Wariant dodany", yourGames:"Twoje ostatnie partie", usually:"Tutaj zwykle grasz", fromGames:"zaobserwowanych partii", quality:"Szacowana jakość", noHabit:"Dla tej dokładnej pozycji nie ma danych z zaimportowanych partii.", error:"Stockfish nie zdołał przeanalizować tej pozycji.", coachBest:"To pierwszy wybór silnika. Ucz się idei kontynuacji, a nie tylko samego ruchu.", coachHabitGood:"Twój zwykły ruch jest blisko wyboru silnika; najważniejsze jest poznanie dalszej kontynuacji.", coachHabitBad:"Twój zwykły ruch oddaje więcej niż wybór silnika. Warto zapisać tę pozycję i ją powtarzać.", labels:{ brilliant:"Genialny", critical:"Krytyczny", best:"Najlepszy", excellent:"Doskonały", okay:"Poprawny", inaccuracy:"Niedokładność", mistake:"Błąd", miss:"Niewykorzystana szansa", blunder:"Poważny błąd", theory:"Teoria", forced:"Wymuszony", risky:"Ryzykowny" } }
};

function langCode(value: string): Lang {
    const short = value.split("-")[0].toLowerCase() as Lang;
    return short in COPY ? short : "en";
}

function evaluationText(result: RepertoireEngineResult) {
    if (result.evaluation.type == "mate") return `M${Math.abs(result.evaluation.value)}`;
    return `${result.evaluation.value >= 0 ? "+" : ""}${(result.evaluation.value / 100).toFixed(2)}`;
}

interface Props {
    fen: string;
    onAddLine?: (pvUci: string[], suggestedName: string) => void;
    onRecommendation?: (bestUci?: string) => void;
    className?: string;
}

function RepertoireEngineInsight({ fen, onAddLine, onRecommendation, className }: Props) {
    const { i18n } = useTranslation();
    const settings = useSettingsStore(state => state.settings);
    const copy = COPY[langCode(i18n.resolvedLanguage || i18n.language || "en")];
    const [result, setResult] = useState<RepertoireEngineResult>();
    const [quality, setQuality] = useState<RepertoireMoveQuality>();
    const [habit, setHabit] = useState<PositionHabit>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [added, setAdded] = useState(false);
    const habitualMove = habit?.moves[0];

    const refreshHabit = () => setHabit(habitAtFen(fen, readPositionHabits()));
    useEffect(() => {
        setResult(undefined); setQuality(undefined); setError(false); setAdded(false); onRecommendation?.(undefined); refreshHabit();
    }, [fen]);
    useEffect(() => {
        const event = positionHabitChangeEvent();
        const listener = () => refreshHabit();
        window.addEventListener(event, listener);
        return () => window.removeEventListener(event, listener);
    }, [fen]);

    async function analyse() {
        setLoading(true); setError(false); setQuality(undefined); setAdded(false);
        try {
            const next = await analyseRepertoirePosition(fen);
            setResult(next); onRecommendation?.(next.bestUci);
            if (habitualMove) {
                try { setQuality(await evaluateRepertoireMove(fen, habitualMove.uci, next)); } catch { setQuality(undefined); }
            }
        } catch {
            setError(true); setResult(undefined); onRecommendation?.(undefined);
        } finally {
            setLoading(false);
        }
    }

    const coachText = useMemo(() => {
        if (!result) return "";
        if (!quality || !habitualMove) return copy.coachBest;
        return quality.classification == Classification.BEST || quality.classification == Classification.EXCELLENT || quality.classification == Classification.OKAY
            ? copy.coachHabitGood
            : copy.coachHabitBad;
    }, [result, quality, habitualMove, copy]);

    return <section className={`${styles.engineCard} ${className || ""}`}>
        <div className={styles.engineHeader}><div><span>{copy.eyebrow}</span><strong>{copy.title}</strong></div>{result && <b>{evaluationText(result)}</b>}</div>
        {!result && !loading && <><p>{copy.intro}</p><button type="button" className={styles.primary} onClick={analyse}>{copy.analyse}</button></>}
        {loading && <div className={styles.loading}>{copy.analysing}</div>}
        {error && <><p className={styles.error}>{copy.error}</p><button type="button" onClick={analyse}>{copy.analyse}</button></>}
        {result && !loading && <>
            <div className={styles.bestMove}><span>{copy.best}</span><strong>{result.bestSan}</strong></div>
            <div className={styles.pv}><span>{copy.line}</span><p>{result.pvSan.join(" ")}</p></div>
            {onAddLine && <button type="button" className={styles.primary} disabled={added} onClick={() => { onAddLine(result.pvUci, `Stockfish · ${result.bestSan}`); setAdded(true); }}>{added ? copy.added : copy.add}</button>}
            <div className={styles.habitBlock}>
                <span>{copy.yourGames}</span>
                {habitualMove ? <><p>{copy.usually} <strong>{habitualMove.san}</strong> · {habitualMove.count}/{habit?.total} {copy.fromGames}</p>{quality && <div className={styles.quality} style={{ color: classificationColours[quality.classification] }}><img src={classificationImages[quality.classification]} alt=""/><strong>{copy.labels[quality.classification]}</strong><small>{copy.quality}{quality.lossCp > 0 ? ` · −${quality.lossCp} cp` : ""}</small></div>}</> : <p>{copy.noHabit}</p>}
            </div>
            {settings.coach.enabled && <div className={styles.coachComment}><span>♟</span><p>{coachText}</p></div>}
        </>}
    </section>;
}

export default RepertoireEngineInsight;
