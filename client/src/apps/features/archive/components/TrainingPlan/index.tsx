import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Classification } from "shared/constants/Classification";
import PieceColour from "shared/constants/PieceColour";
import type { ArchivedGameMetadata, GameArchive } from "shared/types/game/ArchivedGame";
import { getNodeChain } from "shared/types/game/position/StateTreeNode";

import { getArchivedGame } from "@/lib/gameArchive";
import { currentLanguageHref } from "@/i18n/routing";
import { getPuzzleProfile } from "@/apps/features/puzzles/lib/progress";
import { loadLessonsProgress } from "@/apps/features/lessons/progress";
import { TOTAL_LESSONS } from "@/apps/features/lessons/curriculum";
import { getCoachTacticInsight } from "@analysis/lib/coachTacticInsight";

import * as styles from "./TrainingPlan.module.css";

type Colour = "white" | "black";
type Phase = "opening" | "middlegame" | "endgame";
type TacticKind = "fork" | "mate" | "sacrifice" | "tactic";
type WeaknessKind = "fork" | "mate" | "tactic" | "rookEndgame" | "endgame" | "middlegame" | "opening" | "side";
type ArchiveEntry = [string, ArchivedGameMetadata];

type DetailSummary = {
    loadedGames: number;
    seriousByPhase: Record<Phase, number>;
    tactics: Record<TacticKind, number>;
    rookEndgameErrors: number;
};

type Weakness = {
    id: string;
    kind: WeaknessKind;
    title: string;
    detail: string;
    evidence: string;
    score: number;
    href: string;
};

type PlanTask = {
    id: string;
    title: string;
    detail: string;
    count: number;
    unit: string;
    minutes: number;
    href: string;
};

interface Copy {
    eyebrow: string; title: string; subtitle: string; confidence: string;
    learning: string; low: string; medium: string; high: string; basedOn: string;
    weaknesses: string; noWeakness: string; evidence: string; plan: string; planSub: string;
    trainNow: string; train: string; open: string; totalMin: string; activities: string;
    fork: string; forkDetail: string; mate: string; mateDetail: string; tactic: string; tacticDetail: string;
    rook: string; rookDetail: string; endgame: string; endgameDetail: string; middle: string; middleDetail: string;
    sideWhite: string; sideBlack: string; sideDetail: string; openingDetail: string;
    seriousCases: string; games: string; accuracyGap: string;
    puzzles: string; positions: string; review: string; lesson: string;
    taskFork: string; taskMate: string; taskTactic: string; taskRook: string; taskEndgame: string;
    taskMiddle: string; taskOpening: string; taskSide: string; taskLesson: string;
    puzzleTask: string; repertoireTask: string; lessonTask: string;
    white: string; black: string; puzzleElo: string; lessonsDone: string;
}

const copy: Record<string, Copy> = {
    en: {
        eyebrow: "Personal coach", title: "Your weaknesses and training plan", subtitle: "NexoChess turns recurring patterns from your analysed games into a short, practical plan.", confidence: "Confidence",
        learning: "learning", low: "low", medium: "medium", high: "high", basedOn: "Based on {{count}} detailed games",
        weaknesses: "Your weaknesses", noWeakness: "No reliable weakness stands out yet. Analyse more games and this section will update automatically.", evidence: "Evidence", plan: "This week's plan", planSub: "A compact plan built only from patterns your data can support.",
        trainNow: "Train now", train: "Train", open: "Open", totalMin: "{{minutes}} min total", activities: "{{count}} activities",
        fork: "Forks", forkDetail: "Short fork tactics recur in your serious mistakes or missed chances.", mate: "Mating patterns", mateDetail: "Short forced mates recur around serious mistakes or misses.", tactic: "Tactical calculation", tacticDetail: "Short forcing combinations recur in your serious mistakes.",
        rook: "Rook endgames", rookDetail: "Several serious errors happen in queenless rook endgames.", endgame: "Endgames", endgameDetail: "Your serious errors are concentrated in the endgame.", middle: "Middlegame decisions", middleDetail: "Your serious errors are concentrated in the middlegame.",
        sideWhite: "Playing White", sideBlack: "Playing Black", sideDetail: "Your average accuracy is clearly lower with this colour.", openingDetail: "This recurring opening performs clearly below your overall accuracy.",
        seriousCases: "{{count}} serious cases", games: "{{count}} games", accuracyGap: "{{gap}} points below your average",
        puzzles: "puzzles", positions: "positions", review: "review", lesson: "lesson",
        taskFork: "Fork training", taskMate: "Mating-pattern training", taskTactic: "Forcing-move tactics", taskRook: "Rook-endgame practice", taskEndgame: "Endgame practice", taskMiddle: "Middlegame tactics", taskOpening: "Review {{opening}}", taskSide: "Review your {{side}} repertoire", taskLesson: "Reinforce with one lesson",
        puzzleTask: "Open Puzzles and choose the matching theme.", repertoireTask: "Use Repertoire to revisit the branch that is costing you accuracy.", lessonTask: "Complete one available lesson after the targeted work.",
        white: "White", black: "Black", puzzleElo: "Puzzle Elo {{elo}}", lessonsDone: "{{done}}/{{total}} lessons completed"
    },
    es: {
        eyebrow: "Entrenador personal", title: "Tus debilidades y plan de entrenamiento", subtitle: "NexoChess convierte patrones repetidos de tus partidas analizadas en un plan corto y práctico.", confidence: "Confianza",
        learning: "aprendiendo", low: "baja", medium: "media", high: "alta", basedOn: "Basado en {{count}} partidas detalladas",
        weaknesses: "Tus debilidades", noWeakness: "Todavía no destaca ninguna debilidad con suficiente fiabilidad. Analiza más partidas y esta sección se actualizará sola.", evidence: "Evidencia", plan: "Tu plan de esta semana", planSub: "Un plan compacto creado solo con patrones que tus datos permiten sostener.",
        trainNow: "Entrenar ahora", train: "Entrenar", open: "Abrir", totalMin: "{{minutes}} min en total", activities: "{{count}} actividades",
        fork: "Tenedores", forkDetail: "Se repiten tácticas cortas de tenedor en tus errores serios u oportunidades omitidas.", mate: "Patrones de mate", mateDetail: "Se repiten mates forzados cortos alrededor de tus errores u omisiones.", tactic: "Cálculo táctico", tacticDetail: "Se repiten combinaciones cortas y forzantes en tus errores serios.",
        rook: "Finales de torres", rookDetail: "Varios errores serios aparecen en finales sin damas y con torres.", endgame: "Finales", endgameDetail: "Tus errores serios se concentran en el final.", middle: "Decisiones de medio juego", middleDetail: "Tus errores serios se concentran en el medio juego.",
        sideWhite: "Jugando con blancas", sideBlack: "Jugando con negras", sideDetail: "Tu precisión media es claramente inferior con este color.", openingDetail: "Esta apertura recurrente rinde claramente por debajo de tu precisión global.",
        seriousCases: "{{count}} casos serios", games: "{{count}} partidas", accuracyGap: "{{gap}} puntos por debajo de tu media",
        puzzles: "puzzles", positions: "posiciones", review: "repaso", lesson: "lección",
        taskFork: "Entrenamiento de tenedores", taskMate: "Patrones de mate", taskTactic: "Tácticas forzantes", taskRook: "Práctica de finales de torres", taskEndgame: "Práctica de finales", taskMiddle: "Táctica de medio juego", taskOpening: "Repasar {{opening}}", taskSide: "Repasar tu repertorio con {{side}}", taskLesson: "Reforzar con una lección",
        puzzleTask: "Abre Puzzles y selecciona la temática correspondiente.", repertoireTask: "Usa Repertorio para revisar la rama que te está costando precisión.", lessonTask: "Completa una lección disponible después del trabajo específico.",
        white: "blancas", black: "negras", puzzleElo: "Elo de puzzles {{elo}}", lessonsDone: "{{done}}/{{total}} lecciones completadas"
    },
    fr: {
        eyebrow: "Coach personnel", title: "Vos faiblesses et votre plan d’entraînement", subtitle: "NexoChess transforme les tendances récurrentes de vos parties analysées en un plan court et pratique.", confidence: "Confiance", learning: "apprentissage", low: "faible", medium: "moyenne", high: "élevée", basedOn: "Basé sur {{count}} parties détaillées", weaknesses: "Vos faiblesses", noWeakness: "Aucune faiblesse fiable ne ressort encore. Analysez davantage de parties.", evidence: "Preuve", plan: "Votre plan de la semaine", planSub: "Un plan compact fondé uniquement sur vos données.", trainNow: "S’entraîner maintenant", train: "S’entraîner", open: "Ouvrir", totalMin: "{{minutes}} min au total", activities: "{{count}} activités", fork: "Fourchettes", forkDetail: "Les fourchettes reviennent dans vos erreurs sérieuses.", mate: "Motifs de mat", mateDetail: "Les mats forcés courts reviennent dans vos erreurs.", tactic: "Calcul tactique", tacticDetail: "Les combinaisons forcées reviennent dans vos erreurs.", rook: "Finales de tours", rookDetail: "Plusieurs erreurs surviennent dans les finales de tours sans dames.", endgame: "Finales", endgameDetail: "Vos erreurs se concentrent en finale.", middle: "Milieu de jeu", middleDetail: "Vos erreurs se concentrent au milieu de jeu.", sideWhite: "Avec les Blancs", sideBlack: "Avec les Noirs", sideDetail: "Votre précision moyenne est nettement plus basse avec cette couleur.", openingDetail: "Cette ouverture est nettement sous votre précision globale.", seriousCases: "{{count}} cas sérieux", games: "{{count}} parties", accuracyGap: "{{gap}} points sous votre moyenne", puzzles: "puzzles", positions: "positions", review: "révision", lesson: "leçon", taskFork: "Travailler les fourchettes", taskMate: "Motifs de mat", taskTactic: "Tactiques forcées", taskRook: "Finales de tours", taskEndgame: "Finales", taskMiddle: "Tactique de milieu de jeu", taskOpening: "Réviser {{opening}}", taskSide: "Réviser votre répertoire avec les {{side}}", taskLesson: "Renforcer avec une leçon", puzzleTask: "Ouvrez Puzzles et choisissez le thème correspondant.", repertoireTask: "Utilisez Répertoire pour revoir la branche concernée.", lessonTask: "Terminez une leçon après le travail ciblé.", white: "Blancs", black: "Noirs", puzzleElo: "Elo puzzles {{elo}}", lessonsDone: "{{done}}/{{total}} leçons terminées"
    },
    de: {
        eyebrow: "Persönlicher Coach", title: "Deine Schwächen und dein Trainingsplan", subtitle: "NexoChess macht aus wiederkehrenden Mustern deiner analysierten Partien einen kurzen Plan.", confidence: "Vertrauen", learning: "lernt", low: "niedrig", medium: "mittel", high: "hoch", basedOn: "Basierend auf {{count}} detaillierten Partien", weaknesses: "Deine Schwächen", noWeakness: "Noch sticht keine Schwäche zuverlässig hervor. Analysiere mehr Partien.", evidence: "Evidenz", plan: "Dein Wochenplan", planSub: "Ein kompakter Plan nur aus belastbaren Mustern.", trainNow: "Jetzt trainieren", train: "Trainieren", open: "Öffnen", totalMin: "{{minutes}} Min. gesamt", activities: "{{count}} Aktivitäten", fork: "Gabeln", forkDetail: "Gabeln tauchen wiederholt bei ernsten Fehlern auf.", mate: "Mattmotive", mateDetail: "Kurze erzwungene Mattideen tauchen wiederholt auf.", tactic: "Taktische Berechnung", tacticDetail: "Forcierte Kombinationen tauchen wiederholt auf.", rook: "Turmendspiele", rookDetail: "Mehrere Fehler passieren in damenlosen Turmendspielen.", endgame: "Endspiele", endgameDetail: "Deine Fehler häufen sich im Endspiel.", middle: "Mittelspiel", middleDetail: "Deine Fehler häufen sich im Mittelspiel.", sideWhite: "Mit Weiß", sideBlack: "Mit Schwarz", sideDetail: "Deine Genauigkeit ist mit dieser Farbe deutlich niedriger.", openingDetail: "Diese häufige Eröffnung liegt klar unter deinem Gesamtschnitt.", seriousCases: "{{count}} ernste Fälle", games: "{{count}} Partien", accuracyGap: "{{gap}} Punkte unter deinem Schnitt", puzzles: "Puzzles", positions: "Positionen", review: "Wiederholung", lesson: "Lektion", taskFork: "Gabeltraining", taskMate: "Mattmotive", taskTactic: "Forcierte Taktik", taskRook: "Turmendspiele", taskEndgame: "Endspieltraining", taskMiddle: "Mittelspieltaktik", taskOpening: "{{opening}} wiederholen", taskSide: "Repertoire mit {{side}} wiederholen", taskLesson: "Mit einer Lektion festigen", puzzleTask: "Öffne Puzzles und wähle das passende Thema.", repertoireTask: "Nutze Repertoire für die problematische Variante.", lessonTask: "Absolviere danach eine Lektion.", white: "Weiß", black: "Schwarz", puzzleElo: "Puzzle-Elo {{elo}}", lessonsDone: "{{done}}/{{total}} Lektionen abgeschlossen"
    },
    pt: {
        eyebrow: "Treinador pessoal", title: "As tuas fraquezas e plano de treino", subtitle: "O NexoChess transforma padrões recorrentes das partidas analisadas num plano curto e prático.", confidence: "Confiança", learning: "a aprender", low: "baixa", medium: "média", high: "alta", basedOn: "Baseado em {{count}} partidas detalhadas", weaknesses: "As tuas fraquezas", noWeakness: "Ainda não existe uma fraqueza suficientemente fiável. Analisa mais partidas.", evidence: "Evidência", plan: "O teu plano desta semana", planSub: "Um plano compacto baseado apenas nos teus dados.", trainNow: "Treinar agora", train: "Treinar", open: "Abrir", totalMin: "{{minutes}} min no total", activities: "{{count}} atividades", fork: "Garfos", forkDetail: "Garfos repetem-se nos teus erros sérios.", mate: "Padrões de mate", mateDetail: "Mates forçados curtos repetem-se nos teus erros.", tactic: "Cálculo tático", tacticDetail: "Combinações forçadas repetem-se nos teus erros.", rook: "Finais de torres", rookDetail: "Vários erros acontecem em finais de torres sem damas.", endgame: "Finais", endgameDetail: "Os teus erros concentram-se no final.", middle: "Meio-jogo", middleDetail: "Os teus erros concentram-se no meio-jogo.", sideWhite: "Com brancas", sideBlack: "Com pretas", sideDetail: "A tua precisão é claramente menor com esta cor.", openingDetail: "Esta abertura está abaixo da tua precisão global.", seriousCases: "{{count}} casos sérios", games: "{{count}} partidas", accuracyGap: "{{gap}} pontos abaixo da média", puzzles: "puzzles", positions: "posições", review: "revisão", lesson: "lição", taskFork: "Treino de garfos", taskMate: "Padrões de mate", taskTactic: "Táticas forçadas", taskRook: "Finais de torres", taskEndgame: "Treino de finais", taskMiddle: "Tática de meio-jogo", taskOpening: "Rever {{opening}}", taskSide: "Rever repertório com {{side}}", taskLesson: "Reforçar com uma lição", puzzleTask: "Abre Puzzles e escolhe o tema correspondente.", repertoireTask: "Usa Repertório para rever a variante problemática.", lessonTask: "Completa uma lição depois do treino específico.", white: "brancas", black: "pretas", puzzleElo: "Elo de puzzles {{elo}}", lessonsDone: "{{done}}/{{total}} lições concluídas"
    },
    ru: {
        eyebrow: "Личный тренер", title: "Ваши слабости и план тренировок", subtitle: "NexoChess превращает повторяющиеся закономерности из анализов в короткий практический план.", confidence: "Надёжность", learning: "обучение", low: "низкая", medium: "средняя", high: "высокая", basedOn: "На основе {{count}} подробных партий", weaknesses: "Ваши слабости", noWeakness: "Пока ни одна слабость не подтверждена достаточно надёжно.", evidence: "Основание", plan: "План на неделю", planSub: "Короткий план только по подтверждённым данным.", trainNow: "Начать тренировку", train: "Тренировать", open: "Открыть", totalMin: "Всего {{minutes}} мин", activities: "{{count}} заданий", fork: "Вилки", forkDetail: "Вилки регулярно встречаются среди серьёзных ошибок.", mate: "Матовые мотивы", mateDetail: "Короткие форсированные маты регулярно встречаются в ошибках.", tactic: "Тактический расчёт", tacticDetail: "Форсированные комбинации регулярно встречаются в ошибках.", rook: "Ладейные окончания", rookDetail: "Несколько ошибок происходят в ладейных окончаниях без ферзей.", endgame: "Окончания", endgameDetail: "Ошибки сосредоточены в окончаниях.", middle: "Миттельшпиль", middleDetail: "Ошибки сосредоточены в миттельшпиле.", sideWhite: "За белых", sideBlack: "За чёрных", sideDetail: "Точность заметно ниже этим цветом.", openingDetail: "Этот частый дебют заметно хуже общего уровня.", seriousCases: "{{count}} серьёзных случаев", games: "{{count}} партий", accuracyGap: "на {{gap}} пункта ниже среднего", puzzles: "задач", positions: "позиций", review: "повтор", lesson: "урок", taskFork: "Тренировка вилок", taskMate: "Матовые мотивы", taskTactic: "Форсированная тактика", taskRook: "Ладейные окончания", taskEndgame: "Тренировка окончаний", taskMiddle: "Тактика миттельшпиля", taskOpening: "Повторить {{opening}}", taskSide: "Повторить репертуар за {{side}}", taskLesson: "Закрепить уроком", puzzleTask: "Откройте Задачи и выберите нужную тему.", repertoireTask: "Используйте Репертуар для проблемной ветки.", lessonTask: "После тренировки завершите один урок.", white: "белых", black: "чёрных", puzzleElo: "Рейтинг задач {{elo}}", lessonsDone: "Уроки: {{done}}/{{total}}"
    },
    zh: {
        eyebrow: "个人教练", title: "你的弱点与训练计划", subtitle: "NexoChess 会把已分析对局中的重复模式转化为简短实用的训练计划。", confidence: "可信度", learning: "学习中", low: "低", medium: "中", high: "高", basedOn: "基于 {{count}} 盘详细对局", weaknesses: "你的弱点", noWeakness: "目前还没有足够可靠的弱点信号。请继续分析对局。", evidence: "依据", plan: "本周训练计划", planSub: "只使用现有数据能够支持的模式生成训练。", trainNow: "立即训练", train: "训练", open: "打开", totalMin: "共 {{minutes}} 分钟", activities: "{{count}} 项活动", fork: "双攻", forkDetail: "双攻在严重失误中反复出现。", mate: "将杀模式", mateDetail: "短程强制将杀在失误中反复出现。", tactic: "战术计算", tacticDetail: "强制组合在严重失误中反复出现。", rook: "车残局", rookDetail: "多次失误发生在无后车残局。", endgame: "残局", endgameDetail: "严重失误主要集中在残局。", middle: "中局", middleDetail: "严重失误主要集中在中局。", sideWhite: "执白", sideBlack: "执黑", sideDetail: "这个颜色下的平均准确率明显较低。", openingDetail: "这个常见开局明显低于总体准确率。", seriousCases: "{{count}} 次严重情况", games: "{{count}} 盘", accuracyGap: "低于平均 {{gap}} 点", puzzles: "题", positions: "局面", review: "复习", lesson: "课程", taskFork: "双攻训练", taskMate: "将杀模式", taskTactic: "强制战术", taskRook: "车残局训练", taskEndgame: "残局训练", taskMiddle: "中局战术", taskOpening: "复习 {{opening}}", taskSide: "复习{{side}}棋谱", taskLesson: "用一节课程巩固", puzzleTask: "打开战术题并选择对应主题。", repertoireTask: "用开局库复习问题分支。", lessonTask: "专项训练后完成一节课程。", white: "白方", black: "黑方", puzzleElo: "战术题等级分 {{elo}}", lessonsDone: "已完成 {{done}}/{{total}} 节课程"
    },
    vi: {
        eyebrow: "Huấn luyện viên cá nhân", title: "Điểm yếu và kế hoạch luyện tập", subtitle: "NexoChess biến các mẫu lặp lại trong ván đã phân tích thành kế hoạch ngắn, thực tế.", confidence: "Độ tin cậy", learning: "đang học", low: "thấp", medium: "vừa", high: "cao", basedOn: "Dựa trên {{count}} ván chi tiết", weaknesses: "Điểm yếu của bạn", noWeakness: "Chưa có điểm yếu nào đủ đáng tin cậy. Hãy phân tích thêm ván.", evidence: "Bằng chứng", plan: "Kế hoạch tuần này", planSub: "Kế hoạch gọn chỉ dựa trên dữ liệu thực.", trainNow: "Luyện ngay", train: "Luyện", open: "Mở", totalMin: "Tổng {{minutes}} phút", activities: "{{count}} hoạt động", fork: "Đòn chĩa", forkDetail: "Đòn chĩa lặp lại trong lỗi nghiêm trọng.", mate: "Mẫu chiếu hết", mateDetail: "Chuỗi chiếu hết ngắn lặp lại trong lỗi.", tactic: "Tính toán chiến thuật", tacticDetail: "Tổ hợp cưỡng bức lặp lại trong lỗi.", rook: "Tàn cuộc xe", rookDetail: "Nhiều lỗi xảy ra trong tàn cuộc xe không hậu.", endgame: "Tàn cuộc", endgameDetail: "Lỗi tập trung ở tàn cuộc.", middle: "Trung cuộc", middleDetail: "Lỗi tập trung ở trung cuộc.", sideWhite: "Cầm Trắng", sideBlack: "Cầm Đen", sideDetail: "Độ chính xác thấp hơn rõ rệt với màu này.", openingDetail: "Khai cuộc thường gặp này thấp hơn độ chính xác tổng thể.", seriousCases: "{{count}} trường hợp nghiêm trọng", games: "{{count}} ván", accuracyGap: "thấp hơn trung bình {{gap}} điểm", puzzles: "bài", positions: "thế cờ", review: "ôn tập", lesson: "bài học", taskFork: "Luyện đòn chĩa", taskMate: "Mẫu chiếu hết", taskTactic: "Chiến thuật cưỡng bức", taskRook: "Tàn cuộc xe", taskEndgame: "Luyện tàn cuộc", taskMiddle: "Chiến thuật trung cuộc", taskOpening: "Ôn {{opening}}", taskSide: "Ôn repertoire khi cầm {{side}}", taskLesson: "Củng cố bằng một bài học", puzzleTask: "Mở Puzzles và chọn chủ đề tương ứng.", repertoireTask: "Dùng Repertoire để ôn nhánh có vấn đề.", lessonTask: "Hoàn thành một bài học sau phần luyện mục tiêu.", white: "Trắng", black: "Đen", puzzleElo: "Elo puzzle {{elo}}", lessonsDone: "Đã hoàn thành {{done}}/{{total}} bài học"
    },
    hi: {
        eyebrow: "निजी कोच", title: "आपकी कमजोरियाँ और प्रशिक्षण योजना", subtitle: "NexoChess आपकी विश्लेषित बाज़ियों के दोहराते पैटर्न से छोटा व्यावहारिक प्लान बनाता है।", confidence: "विश्वसनीयता", learning: "सीख रहे हैं", low: "कम", medium: "मध्यम", high: "उच्च", basedOn: "{{count}} विस्तृत बाज़ियों पर आधारित", weaknesses: "आपकी कमजोरियाँ", noWeakness: "अभी कोई कमजोरी पर्याप्त भरोसे के साथ नहीं दिख रही। और बाज़ियाँ विश्लेषित करें।", evidence: "आधार", plan: "इस सप्ताह की योजना", planSub: "केवल वास्तविक डेटा से समर्थित छोटा अभ्यास सेट।", trainNow: "अभी अभ्यास करें", train: "अभ्यास", open: "खोलें", totalMin: "कुल {{minutes}} मिनट", activities: "{{count}} गतिविधियाँ", fork: "फोर्क", forkDetail: "फोर्क गंभीर गलतियों में बार-बार दिख रहे हैं।", mate: "मात के पैटर्न", mateDetail: "छोटी मजबूर मात बार-बार दिखती हैं।", tactic: "रणनीतिक गणना", tacticDetail: "मजबूर रणनीतियाँ बार-बार दिखती हैं।", rook: "रूक एंडगेम", rookDetail: "कई गलतियाँ बिना रानी वाले रूक एंडगेम में हो रही हैं।", endgame: "एंडगेम", endgameDetail: "गंभीर गलतियाँ एंडगेम में केंद्रित हैं।", middle: "मिडिलगेम", middleDetail: "गंभीर गलतियाँ मिडिलगेम में केंद्रित हैं।", sideWhite: "सफेद से", sideBlack: "काले से", sideDetail: "इस रंग से औसत सटीकता साफ़ तौर पर कम है।", openingDetail: "यह बार-बार आने वाली ओपनिंग कुल सटीकता से नीचे है।", seriousCases: "{{count}} गंभीर मामले", games: "{{count}} बाज़ियाँ", accuracyGap: "औसत से {{gap}} अंक कम", puzzles: "पज़ल", positions: "स्थितियाँ", review: "दोहराव", lesson: "पाठ", taskFork: "फोर्क अभ्यास", taskMate: "मात पैटर्न", taskTactic: "मजबूर रणनीतियाँ", taskRook: "रूक एंडगेम", taskEndgame: "एंडगेम अभ्यास", taskMiddle: "मिडिलगेम रणनीति", taskOpening: "{{opening}} दोहराएँ", taskSide: "{{side}} से रिपर्टोयर दोहराएँ", taskLesson: "एक पाठ से मजबूत करें", puzzleTask: "Puzzles खोलें और संबंधित थीम चुनें।", repertoireTask: "Repertoire में समस्या वाली शाखा दोहराएँ।", lessonTask: "लक्षित अभ्यास के बाद एक पाठ पूरा करें।", white: "सफेद", black: "काले", puzzleElo: "पज़ल Elo {{elo}}", lessonsDone: "{{done}}/{{total}} पाठ पूरे"
    },
    mr: {
        eyebrow: "वैयक्तिक प्रशिक्षक", title: "तुमच्या कमकुवत बाजू आणि प्रशिक्षण योजना", subtitle: "NexoChess विश्लेषित डावांतील पुनरावृत्तीच्या नमुन्यांपासून छोटा व्यावहारिक आराखडा तयार करते.", confidence: "विश्वास", learning: "शिकत आहे", low: "कमी", medium: "मध्यम", high: "उच्च", basedOn: "{{count}} सविस्तर डावांवर आधारित", weaknesses: "तुमच्या कमकुवत बाजू", noWeakness: "अजून कोणतीही कमजोरी पुरेशा विश्वासाने दिसत नाही. अधिक डाव विश्लेषित करा.", evidence: "पुरावा", plan: "या आठवड्याची योजना", planSub: "फक्त उपलब्ध डेटाने समर्थित छोटा सराव संच.", trainNow: "आता सराव करा", train: "सराव", open: "उघडा", totalMin: "एकूण {{minutes}} मिनिटे", activities: "{{count}} उपक्रम", fork: "फोर्क", forkDetail: "फोर्क गंभीर चुका जवळ वारंवार दिसतात.", mate: "मात नमुने", mateDetail: "लहान सक्तीच्या मात कल्पना वारंवार दिसतात.", tactic: "डावपेच गणना", tacticDetail: "सक्तीच्या संयोजना वारंवार दिसतात.", rook: "रूक एंडगेम", rookDetail: "राणी नसलेल्या रूक एंडगेममध्ये अनेक चुका होतात.", endgame: "एंडगेम", endgameDetail: "गंभीर चुका एंडगेममध्ये केंद्रित आहेत.", middle: "मिडलगेंम", middleDetail: "गंभीर चुका मिडलगेंममध्ये केंद्रित आहेत.", sideWhite: "पांढऱ्यांनी", sideBlack: "काळ्यांनी", sideDetail: "या रंगाने सरासरी अचूकता कमी आहे.", openingDetail: "ही वारंवार येणारी ओपनिंग एकूण अचूकतेपेक्षा खाली आहे.", seriousCases: "{{count}} गंभीर प्रसंग", games: "{{count}} डाव", accuracyGap: "सरासरीपेक्षा {{gap}} गुण कमी", puzzles: "पझल", positions: "स्थिती", review: "पुनरावलोकन", lesson: "धडा", taskFork: "फोर्क सराव", taskMate: "मात नमुने", taskTactic: "सक्तीचे डावपेच", taskRook: "रूक एंडगेम", taskEndgame: "एंडगेम सराव", taskMiddle: "मिडलगेंम डावपेच", taskOpening: "{{opening}} पुनरावलोकन", taskSide: "{{side}} रिपर्टोयर पुनरावलोकन", taskLesson: "एका धड्याने मजबूत करा", puzzleTask: "Puzzles उघडा आणि संबंधित थीम निवडा.", repertoireTask: "Repertoire मध्ये समस्येची शाखा पुन्हा पाहा.", lessonTask: "लक्षित सरावानंतर एक धडा पूर्ण करा.", white: "पांढरे", black: "काळे", puzzleElo: "पझल Elo {{elo}}", lessonsDone: "{{done}}/{{total}} धडे पूर्ण"
    },
    pl: {
        eyebrow: "Osobisty trener", title: "Twoje słabości i plan treningowy", subtitle: "NexoChess zamienia powtarzające się wzorce z analizowanych partii w krótki, praktyczny plan.", confidence: "Pewność", learning: "uczenie", low: "niska", medium: "średnia", high: "wysoka", basedOn: "Na podstawie {{count}} szczegółowych partii", weaknesses: "Twoje słabości", noWeakness: "Na razie żadna słabość nie wyróżnia się wystarczająco wiarygodnie.", evidence: "Dowód", plan: "Plan na ten tydzień", planSub: "Kompaktowy plan oparty tylko na twoich danych.", trainNow: "Trenuj teraz", train: "Trenuj", open: "Otwórz", totalMin: "Łącznie {{minutes}} min", activities: "{{count}} aktywności", fork: "Widełki", forkDetail: "Widełki regularnie pojawiają się w poważnych błędach.", mate: "Motywy matowe", mateDetail: "Krótkie wymuszone maty regularnie pojawiają się w błędach.", tactic: "Liczenie taktyczne", tacticDetail: "Wymuszone kombinacje regularnie pojawiają się w błędach.", rook: "Końcówki wieżowe", rookDetail: "Kilka błędów występuje w bezhetmańskich końcówkach wieżowych.", endgame: "Końcówki", endgameDetail: "Poważne błędy skupiają się w końcówkach.", middle: "Gra środkowa", middleDetail: "Poważne błędy skupiają się w grze środkowej.", sideWhite: "Białymi", sideBlack: "Czarnymi", sideDetail: "Średnia dokładność jest wyraźnie niższa tym kolorem.", openingDetail: "Ten częsty debiut wypada poniżej ogólnej dokładności.", seriousCases: "{{count}} poważnych przypadków", games: "{{count}} partii", accuracyGap: "{{gap}} pkt poniżej średniej", puzzles: "zadań", positions: "pozycji", review: "powtórka", lesson: "lekcja", taskFork: "Trening widełek", taskMate: "Motywy matowe", taskTactic: "Wymuszona taktyka", taskRook: "Końcówki wieżowe", taskEndgame: "Trening końcówek", taskMiddle: "Taktyka gry środkowej", taskOpening: "Powtórz {{opening}}", taskSide: "Powtórz repertuar {{side}}", taskLesson: "Utrwal jedną lekcją", puzzleTask: "Otwórz Puzzles i wybierz odpowiedni motyw.", repertoireTask: "W Repertuarze powtórz problematyczną gałąź.", lessonTask: "Po ćwiczeniu ukończ jedną lekcję.", white: "białymi", black: "czarnymi", puzzleElo: "Elo zadań {{elo}}", lessonsDone: "Ukończono {{done}}/{{total}} lekcji"
    }
};

const DETAIL_GAME_LIMIT = 24;
const GENERIC_NAMES = new Set(["white", "black", "you", "tu", "tú", "vous", "du", "sie", "você", "voce", "ты", "你", "bạn", "ban", "आप", "तुम्ही", "ty"]);
const COACH_NAMES = new Set(["foxy", "fog", "cybe", "max_rooks", "max rooks"]);

function languageCopy(language: string): Copy {
    const key = language.toLowerCase().replace("_", "-").split("-")[0];
    return copy[key] || copy.en;
}

function normaliseName(value?: string) {
    return (value || "").trim().toLowerCase();
}

function entryTimestamp(game: ArchivedGameMetadata) {
    const value = game.date || game.archiveSummary?.savedAt;
    const timestamp = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(timestamp) ? timestamp : 0;
}

function average(values: Array<number | null | undefined>) {
    const valid = values.filter((value): value is number => typeof value == "number" && Number.isFinite(value));
    return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : undefined;
}

function inferPrimaryUsername(entries: ArchiveEntry[]) {
    const counts = new Map<string, number>();
    for (const [, game] of entries) {
        for (const colour of ["white", "black"] as const) {
            const name = normaliseName(game.players[colour].username);
            if (!name || GENERIC_NAMES.has(name) || COACH_NAMES.has(name)) continue;
            counts.set(name, (counts.get(name) || 0) + 1);
        }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

function playerSide(game: ArchivedGameMetadata, username?: string): Colour | undefined {
    if (!username) return undefined;
    if (normaliseName(game.players.white.username) == username) return "white";
    if (normaliseName(game.players.black.username) == username) return "black";
}

function phaseFor(ply: number, fen: string): Phase {
    if (ply <= 20) return "opening";
    const board = fen.split(" ")[0] || "";
    const values: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 };
    let material = 0;
    for (const char of board.toLowerCase()) material += values[char] || 0;
    return material <= 26 ? "endgame" : "middlegame";
}

function isRookEndgame(fen: string) {
    const board = fen.split(" ")[0] || "";
    if (!/[rR]/.test(board) || /[qQ]/.test(board)) return false;
    const values: Record<string, number> = { r: 5, b: 3, n: 3, p: 1 };
    let material = 0;
    for (const char of board.toLowerCase()) material += values[char] || 0;
    return material <= 30;
}

function serious(classification?: Classification) {
    return classification == Classification.MISTAKE || classification == Classification.MISS || classification == Classification.BLUNDER;
}

function scoreForResult(result: string | undefined, side: Colour) {
    if (result == "1/2-1/2") return 0.5;
    if ((result == "1-0" && side == "white") || (result == "0-1" && side == "black")) return 1;
    if ((result == "0-1" && side == "white") || (result == "1-0" && side == "black")) return 0;
    return undefined;
}

function TrainingPlan({ archive }: { archive: GameArchive }) {
    const { i18n } = useTranslation();
    const c = languageCopy(i18n.resolvedLanguage || i18n.language || "en");
    const allEntries = useMemo<ArchiveEntry[]>(() => Object.entries(archive).sort((a, b) => entryTimestamp(b[1]) - entryTimestamp(a[1])), [archive]);
    const primaryUsername = useMemo(() => inferPrimaryUsername(allEntries), [allEntries]);
    const personalEntries = useMemo(() => allEntries.filter(([, game]) => Boolean(playerSide(game, primaryUsername))), [allEntries, primaryUsername]);
    const recentEntries = useMemo(() => personalEntries.slice(0, DETAIL_GAME_LIMIT), [personalEntries]);
    const [details, setDetails] = useState<DetailSummary>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        if (!primaryUsername || recentEntries.length == 0) {
            setDetails({ loadedGames: 0, seriousByPhase: { opening: 0, middlegame: 0, endgame: 0 }, tactics: { fork: 0, mate: 0, sacrifice: 0, tactic: 0 }, rookEndgameErrors: 0 });
            return undefined;
        }
        setLoading(true);
        setDetails(undefined);
        void Promise.all(recentEntries.map(async ([id, metadata]) => {
            try {
                const response = await getArchivedGame(id);
                return response.game ? { game: response.game, side: playerSide(metadata, primaryUsername) } : undefined;
            } catch {
                return undefined;
            }
        })).then(items => {
            if (cancelled) return;
            const summary: DetailSummary = { loadedGames: 0, seriousByPhase: { opening: 0, middlegame: 0, endgame: 0 }, tactics: { fork: 0, mate: 0, sacrifice: 0, tactic: 0 }, rookEndgameErrors: 0 };
            for (const item of items) {
                if (!item?.side) continue;
                summary.loadedGames += 1;
                const targetColour = item.side == "white" ? PieceColour.WHITE : PieceColour.BLACK;
                getNodeChain(item.game.stateTree).slice(1).forEach((node, index) => {
                    if (node.state.moveColour != targetColour || !serious(node.state.classification)) return;
                    const phase = phaseFor(index + 1, node.state.fen);
                    summary.seriousByPhase[phase] += 1;
                    if (phase == "endgame" && isRookEndgame(node.state.fen)) summary.rookEndgameErrors += 1;
                    const label = getCoachTacticInsight(node, node.state.classification, "en")?.label as TacticKind | undefined;
                    if (label && label in summary.tactics) summary.tactics[label] += 1;
                });
            }
            setDetails(summary);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [primaryUsername, recentEntries]);

    const personalStats = useMemo(() => personalEntries.map(([, game]) => {
        const side = playerSide(game, primaryUsername)!;
        return { game, side, accuracy: game.archiveSummary?.[side].accuracy, score: scoreForResult(game.archiveSummary?.result, side) };
    }), [personalEntries, primaryUsername]);

    const overallAccuracy = average(personalStats.map(item => item.accuracy));
    const sideStats = (side: Colour) => {
        const rows = personalStats.filter(item => item.side == side);
        return { count: rows.length, accuracy: average(rows.map(item => item.accuracy)) };
    };
    const whiteStats = sideStats("white");
    const blackStats = sideStats("black");

    const weakOpening = useMemo(() => {
        if (overallAccuracy == undefined) return undefined;
        const grouped = new Map<string, { count: number; accuracies: number[]; scores: number[] }>();
        for (const row of personalStats) {
            const name = row.game.archiveSummary?.opening;
            if (!name) continue;
            const group = grouped.get(name) || { count: 0, accuracies: [], scores: [] };
            group.count += 1;
            if (typeof row.accuracy == "number") group.accuracies.push(row.accuracy);
            if (typeof row.score == "number") group.scores.push(row.score);
            grouped.set(name, group);
        }
        return [...grouped.entries()].map(([name, value]) => ({ name, count: value.count, accuracy: average(value.accuracies), score: average(value.scores) }))
            .filter(row => row.count >= 3 && row.accuracy != undefined)
            .map(row => ({ ...row, gap: overallAccuracy - row.accuracy! }))
            .filter(row => row.gap >= 5 || (row.count >= 4 && row.score != undefined && row.score < 0.4))
            .sort((a, b) => b.gap * b.count - a.gap * a.count)[0];
    }, [overallAccuracy, personalStats]);

    const weaknesses = useMemo<Weakness[]>(() => {
        if (!details) return [];
        const out: Weakness[] = [];
        const puzzleHref = currentLanguageHref("/puzzles");
        const repertoireHref = currentLanguageHref("/repertoire");
        const addTactic = (id: "fork" | "mate" | "tactic", count: number, threshold: number, title: string, detail: string) => {
            if (count >= threshold) out.push({ id, kind: id, title, detail, evidence: c.seriousCases.replace("{{count}}", String(count)), score: count * 4, href: puzzleHref });
        };
        addTactic("fork", details.tactics.fork, 2, c.fork, c.forkDetail);
        addTactic("mate", details.tactics.mate, 2, c.mate, c.mateDetail);
        addTactic("tactic", details.tactics.tactic + details.tactics.sacrifice, 3, c.tactic, c.tacticDetail);

        if (details.rookEndgameErrors >= 2) out.push({ id: "rook", kind: "rookEndgame", title: c.rook, detail: c.rookDetail, evidence: c.seriousCases.replace("{{count}}", String(details.rookEndgameErrors)), score: details.rookEndgameErrors * 4.5, href: puzzleHref });

        const phases = Object.entries(details.seriousByPhase) as Array<[Phase, number]>;
        const total = phases.reduce((sum, [, count]) => sum + count, 0);
        const strongest = phases.sort((a, b) => b[1] - a[1])[0];
        if (strongest && strongest[1] >= 4 && strongest[1] / Math.max(1, total) >= 0.42) {
            if (strongest[0] == "endgame" && details.rookEndgameErrors < 2) out.push({ id: "endgame", kind: "endgame", title: c.endgame, detail: c.endgameDetail, evidence: c.seriousCases.replace("{{count}}", String(strongest[1])), score: strongest[1] * 2.8, href: puzzleHref });
            if (strongest[0] == "middlegame") out.push({ id: "middle", kind: "middlegame", title: c.middle, detail: c.middleDetail, evidence: c.seriousCases.replace("{{count}}", String(strongest[1])), score: strongest[1] * 2.5, href: puzzleHref });
        }

        if (whiteStats.count >= 4 && blackStats.count >= 4 && whiteStats.accuracy != undefined && blackStats.accuracy != undefined) {
            const gap = Math.abs(whiteStats.accuracy - blackStats.accuracy);
            if (gap >= 5) {
                const side: Colour = whiteStats.accuracy < blackStats.accuracy ? "white" : "black";
                out.push({ id: `side-${side}`, kind: "side", title: side == "white" ? c.sideWhite : c.sideBlack, detail: c.sideDetail, evidence: c.accuracyGap.replace("{{gap}}", gap.toFixed(1)), score: gap * 1.8, href: repertoireHref });
            }
        }

        if (weakOpening) out.push({ id: `opening-${weakOpening.name}`, kind: "opening", title: weakOpening.name, detail: c.openingDetail, evidence: `${c.games.replace("{{count}}", String(weakOpening.count))} · ${c.accuracyGap.replace("{{gap}}", weakOpening.gap.toFixed(1))}`, score: weakOpening.gap * Math.min(6, weakOpening.count), href: repertoireHref });
        return out.sort((a, b) => b.score - a.score).slice(0, 4);
    }, [blackStats.accuracy, blackStats.count, c, details, weakOpening, whiteStats.accuracy, whiteStats.count]);

    const lessonProgress = useMemo(() => loadLessonsProgress(), [archive]);
    const puzzleProfile = useMemo(() => getPuzzleProfile(), [archive]);
    const tasks = useMemo<PlanTask[]>(() => {
        const rows = weaknesses.slice(0, 3).map(weakness => {
            if (weakness.kind == "fork") return { id: weakness.id, title: c.taskFork, detail: c.puzzleTask, count: 8, unit: c.puzzles, minutes: 12, href: weakness.href };
            if (weakness.kind == "mate") return { id: weakness.id, title: c.taskMate, detail: c.puzzleTask, count: 6, unit: c.puzzles, minutes: 10, href: weakness.href };
            if (weakness.kind == "tactic") return { id: weakness.id, title: c.taskTactic, detail: c.puzzleTask, count: 8, unit: c.puzzles, minutes: 12, href: weakness.href };
            if (weakness.kind == "rookEndgame") return { id: weakness.id, title: c.taskRook, detail: c.puzzleTask, count: 5, unit: c.positions, minutes: 15, href: weakness.href };
            if (weakness.kind == "endgame") return { id: weakness.id, title: c.taskEndgame, detail: c.puzzleTask, count: 6, unit: c.positions, minutes: 15, href: weakness.href };
            if (weakness.kind == "middlegame") return { id: weakness.id, title: c.taskMiddle, detail: c.puzzleTask, count: 6, unit: c.puzzles, minutes: 12, href: weakness.href };
            if (weakness.kind == "opening") return { id: weakness.id, title: c.taskOpening.replace("{{opening}}", weakness.title), detail: c.repertoireTask, count: 1, unit: c.review, minutes: 8, href: weakness.href };
            const side = weakness.id.endsWith("white") ? c.white : c.black;
            return { id: weakness.id, title: c.taskSide.replace("{{side}}", side), detail: c.repertoireTask, count: 1, unit: c.review, minutes: 8, href: weakness.href };
        });
        if (rows.length && lessonProgress.completedLessonIds.length < TOTAL_LESSONS) rows.push({ id: "lesson", title: c.taskLesson, detail: c.lessonTask, count: 1, unit: c.lesson, minutes: 10, href: currentLanguageHref("/lessons") });
        return rows;
    }, [c, lessonProgress.completedLessonIds.length, weaknesses]);

    const confidence = !details || details.loadedGames < 5 ? c.learning : details.loadedGames >= 18 ? c.high : details.loadedGames >= 10 ? c.medium : c.low;
    const totalActivities = tasks.reduce((sum, task) => sum + task.count, 0);
    const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);

    return <section className={styles.planShell}>
        <header className={styles.hero}>
            <div><span className={styles.eyebrow}>{c.eyebrow}</span><h2>{c.title}</h2><p>{c.subtitle}</p></div>
            <div className={styles.contextChips}>
                <span>{c.confidence}: <b>{confidence}</b></span>
                <span>{c.puzzleElo.replace("{{elo}}", String(puzzleProfile.rating))}</span>
                <span>{c.lessonsDone.replace("{{done}}", String(lessonProgress.completedLessonIds.length)).replace("{{total}}", String(TOTAL_LESSONS))}</span>
            </div>
        </header>

        {loading && <div className={styles.loadingLine}>{c.basedOn.replace("{{count}}", "…")}</div>}
        {!loading && details && details.loadedGames < 5 && <div className={styles.learningCard}><strong>{c.title}</strong><p>{c.noWeakness}</p><span>{c.basedOn.replace("{{count}}", String(details.loadedGames))}</span></div>}

        <div className={styles.sectionHeader}><div><span className={styles.eyebrow}>{c.evidence}</span><h3>{c.weaknesses}</h3></div>{details && <small>{c.basedOn.replace("{{count}}", String(details.loadedGames))}</small>}</div>
        {weaknesses.length ? <div className={styles.weaknessGrid}>{weaknesses.map((weakness, index) => <article className={styles.weaknessCard} key={weakness.id}><div className={styles.rank}>{index + 1}</div><div className={styles.weaknessBody}><h4>{weakness.title}</h4><p>{weakness.detail}</p><span>{c.evidence}: <b>{weakness.evidence}</b></span></div><a href={weakness.href}>{c.train} →</a></article>)}</div> : !loading && <div className={styles.empty}>{c.noWeakness}</div>}

        <section className={styles.weekPlan}>
            <div className={styles.planHeading}><div><span className={styles.eyebrow}>{c.plan}</span><h3>{c.plan}</h3><p>{c.planSub}</p></div><div className={styles.planSummary}><strong>{c.activities.replace("{{count}}", String(totalActivities))}</strong><span>{c.totalMin.replace("{{minutes}}", String(totalMinutes))}</span></div></div>
            {tasks.length ? <><div className={styles.taskList}>{tasks.map((task, index) => <article className={styles.taskRow} key={task.id}><span className={styles.taskNumber}>{index + 1}</span><div><strong>{task.title}</strong><p>{task.detail}</p></div><div className={styles.taskAmount}><b>{task.count}</b><span>{task.unit}</span></div><a href={task.href}>{c.open} →</a></article>)}</div><a className={styles.trainNow} href={tasks[0].href}>{c.trainNow} →</a></> : <div className={styles.empty}>{c.noWeakness}</div>}
        </section>
    </section>;
}

export default TrainingPlan;
