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
type WeaknessKind = TacticKind | "rookEndgame" | "endgame" | "middlegame" | "opening" | "side";
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
    action: string;
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

const DETAIL_GAME_LIMIT = 24;
const GENERIC_NAMES = new Set([
    "white", "black", "you", "tu", "tú", "vous", "du", "sie", "você",
    "voce", "ты", "你", "bạn", "ban", "आप", "तुम्ही", "ty"
]);
const COACH_NAMES = new Set(["foxy", "fog", "cybe", "max_rooks", "max rooks"]);

const copy = {
    en: {
        tab: "Training plan", eyebrow: "Personal coach", title: "Your weaknesses and training plan",
        subtitle: "NexoChess turns recurring patterns from your analysed games into a short, practical plan.",
        learning: "Still learning your game", learningDetail: "Analyse a few more games so the recommendations are based on repeated patterns, not one-off mistakes.",
        confidence: "Confidence", confidenceLow: "low", confidenceMedium: "medium", confidenceHigh: "high", confidenceLearning: "learning",
        basedOn: "Based on {{count}} detailed games", weaknesses: "Your weaknesses", noWeakness: "No reliable weakness stands out yet. Keep analysing games and this section will update automatically.",
        evidence: "Evidence", train: "Train", plan: "This week's plan", planSubtitle: "A compact set of activities built from the strongest signals we can actually support with your data.",
        trainNow: "Train now", totalTime: "{{minutes}} min total", activities: "{{count}} activities", open: "Open",
        fork: "Forks", forkDetail: "You are repeatedly allowing or missing short fork tactics.",
        mate: "Mating patterns", mateDetail: "Short forced mating ideas are appearing in your serious mistakes or missed chances.",
        sacrifice: "Sacrificial tactics", sacrificeDetail: "Concrete sacrificial sequences are recurring around your serious errors.",
        tactic: "Tactical calculation", tacticDetail: "Short forcing combinations are recurring in your serious mistakes or misses.",
        rookEndgame: "Rook endgames", rookEndgameDetail: "A meaningful share of your serious errors is happening in queenless rook endgames.",
        endgame: "Endgames", endgameDetail: "Your serious errors are concentrated late in the game.",
        middlegame: "Middlegame decisions", middlegameDetail: "Your serious errors are concentrated in the middlegame.",
        sideWhite: "Playing White", sideBlack: "Playing Black", sideDetail: "Your average accuracy is materially lower on this side.",
        openingDetail: "This recurring opening is performing clearly below your overall accuracy.",
        errorsFound: "{{count}} serious occurrences", gamesFound: "{{count}} games", accuracyGap: "{{gap}} points below your average",
        puzzles: "puzzles", positions: "positions", review: "review", lesson: "lesson",
        taskFork: "Fork training", taskMate: "Mating-pattern training", taskSacrifice: "Sacrifice calculation", taskTactic: "Forcing-move tactics",
        taskRook: "Rook-endgame practice", taskEndgame: "Endgame practice", taskMiddle: "Middlegame tactics", taskOpening: "Review {{opening}}", taskSide: "Review your {{side}} repertoire", taskLesson: "Reinforce with one lesson",
        taskPuzzleDetail: "Open Puzzles and select the matching theme.", taskOpeningDetail: "Use Repertoire to revisit the branch that is costing you accuracy.", taskLessonDetail: "Complete one available lesson after the targeted work.",
        white: "White", black: "Black", puzzleElo: "Puzzle Elo {{elo}}", lessonsDone: "{{done}}/{{total}} lessons completed"
    },
    es: {
        tab: "Plan de entrenamiento", eyebrow: "Entrenador personal", title: "Tus debilidades y plan de entrenamiento",
        subtitle: "NexoChess convierte patrones repetidos de tus partidas analizadas en un plan corto y práctico.",
        learning: "Todavía estamos aprendiendo cómo juegas", learningDetail: "Analiza algunas partidas más para que las recomendaciones se basen en patrones repetidos y no en errores aislados.",
        confidence: "Confianza", confidenceLow: "baja", confidenceMedium: "media", confidenceHigh: "alta", confidenceLearning: "aprendiendo",
        basedOn: "Basado en {{count}} partidas detalladas", weaknesses: "Tus debilidades", noWeakness: "Todavía no destaca ninguna debilidad con suficiente fiabilidad. Sigue analizando partidas y esta sección se actualizará sola.",
        evidence: "Evidencia", train: "Entrenar", plan: "Tu plan de esta semana", planSubtitle: "Un conjunto compacto de actividades creado solo con señales que tus datos permiten sostener.",
        trainNow: "Entrenar ahora", totalTime: "{{minutes}} min en total", activities: "{{count}} actividades", open: "Abrir",
        fork: "Tenedores", forkDetail: "Estás permitiendo u omitiendo de forma repetida tácticas cortas de tenedor.",
        mate: "Patrones de mate", mateDetail: "Aparecen mates forzados cortos alrededor de tus errores graves u oportunidades omitidas.",
        sacrifice: "Tácticas de sacrificio", sacrificeDetail: "Se repiten secuencias concretas de sacrificio alrededor de tus errores serios.",
        tactic: "Cálculo táctico", tacticDetail: "Se repiten combinaciones cortas y forzantes en tus errores u omisiones importantes.",
        rookEndgame: "Finales de torres", rookEndgameDetail: "Una parte relevante de tus errores serios aparece en finales sin damas y con torres.",
        endgame: "Finales", endgameDetail: "Tus errores serios se concentran en la fase final de la partida.",
        middlegame: "Decisiones de medio juego", middlegameDetail: "Tus errores serios se concentran en el medio juego.",
        sideWhite: "Jugando con blancas", sideBlack: "Jugando con negras", sideDetail: "Tu precisión media es claramente inferior con este color.",
        openingDetail: "Esta apertura recurrente rinde claramente por debajo de tu precisión global.",
        errorsFound: "{{count}} casos serios", gamesFound: "{{count}} partidas", accuracyGap: "{{gap}} puntos por debajo de tu media",
        puzzles: "puzzles", positions: "posiciones", review: "repaso", lesson: "lección",
        taskFork: "Entrenamiento de tenedores", taskMate: "Patrones de mate", taskSacrifice: "Cálculo de sacrificios", taskTactic: "Tácticas forzantes",
        taskRook: "Práctica de finales de torres", taskEndgame: "Práctica de finales", taskMiddle: "Táctica de medio juego", taskOpening: "Repasar {{opening}}", taskSide: "Repasar tu repertorio con {{side}}", taskLesson: "Reforzar con una lección",
        taskPuzzleDetail: "Abre Puzzles y selecciona la temática correspondiente.", taskOpeningDetail: "Usa Repertorio para revisar la rama que te está costando precisión.", taskLessonDetail: "Completa una lección disponible después del trabajo específico.",
        white: "blancas", black: "negras", puzzleElo: "Elo de puzzles {{elo}}", lessonsDone: "{{done}}/{{total}} lecciones completadas"
    },
    fr: {
        tab: "Plan d’entraînement", eyebrow: "Coach personnel", title: "Vos faiblesses et votre plan d’entraînement", subtitle: "NexoChess transforme les tendances récurrentes de vos parties analysées en un plan court et pratique.", learning: "Nous apprenons encore votre jeu", learningDetail: "Analysez encore quelques parties pour baser les recommandations sur des tendances répétées.", confidence: "Confiance", confidenceLow: "faible", confidenceMedium: "moyenne", confidenceHigh: "élevée", confidenceLearning: "apprentissage", basedOn: "Basé sur {{count}} parties détaillées", weaknesses: "Vos faiblesses", noWeakness: "Aucune faiblesse fiable ne ressort encore.", evidence: "Preuve", train: "S’entraîner", plan: "Votre plan de la semaine", planSubtitle: "Des activités compactes basées uniquement sur vos données disponibles.", trainNow: "S’entraîner maintenant", totalTime: "{{minutes}} min au total", activities: "{{count}} activités", open: "Ouvrir", fork: "Fourchettes", forkDetail: "Les fourchettes reviennent dans vos erreurs ou occasions manquées.", mate: "Motifs de mat", mateDetail: "Des mats forcés courts reviennent dans vos erreurs.", sacrifice: "Sacrifices tactiques", sacrificeDetail: "Des séquences de sacrifice concrètes reviennent dans vos erreurs.", tactic: "Calcul tactique", tacticDetail: "Des combinaisons forcées courtes reviennent dans vos erreurs.", rookEndgame: "Finales de tours", rookEndgameDetail: "Plusieurs erreurs sérieuses surviennent dans des finales de tours sans dames.", endgame: "Finales", endgameDetail: "Vos erreurs sérieuses se concentrent en finale.", middlegame: "Milieu de jeu", middlegameDetail: "Vos erreurs sérieuses se concentrent au milieu de jeu.", sideWhite: "Avec les Blancs", sideBlack: "Avec les Noirs", sideDetail: "Votre précision moyenne est nettement plus basse avec cette couleur.", openingDetail: "Cette ouverture récurrente est nettement sous votre précision globale.", errorsFound: "{{count}} cas sérieux", gamesFound: "{{count}} parties", accuracyGap: "{{gap}} points sous votre moyenne", puzzles: "puzzles", positions: "positions", review: "révision", lesson: "leçon", taskFork: "Travailler les fourchettes", taskMate: "Motifs de mat", taskSacrifice: "Calcul des sacrifices", taskTactic: "Tactiques forcées", taskRook: "Finales de tours", taskEndgame: "Finales", taskMiddle: "Tactique de milieu de jeu", taskOpening: "Réviser {{opening}}", taskSide: "Réviser votre répertoire avec les {{side}}", taskLesson: "Renforcer avec une leçon", taskPuzzleDetail: "Ouvrez Puzzles et choisissez le thème correspondant.", taskOpeningDetail: "Utilisez Répertoire pour revoir la branche concernée.", taskLessonDetail: "Terminez une leçon disponible après le travail ciblé.", white: "Blancs", black: "Noirs", puzzleElo: "Elo puzzles {{elo}}", lessonsDone: "{{done}}/{{total}} leçons terminées"
    },
    de: {
        tab: "Trainingsplan", eyebrow: "Persönlicher Coach", title: "Deine Schwächen und dein Trainingsplan", subtitle: "NexoChess macht aus wiederkehrenden Mustern deiner analysierten Partien einen kurzen, praktischen Plan.", learning: "Wir lernen dein Spiel noch kennen", learningDetail: "Analysiere noch einige Partien, damit Empfehlungen auf wiederkehrenden Mustern beruhen.", confidence: "Vertrauen", confidenceLow: "niedrig", confidenceMedium: "mittel", confidenceHigh: "hoch", confidenceLearning: "lernt", basedOn: "Basierend auf {{count}} detaillierten Partien", weaknesses: "Deine Schwächen", noWeakness: "Noch sticht keine Schwäche zuverlässig hervor.", evidence: "Evidenz", train: "Trainieren", plan: "Dein Wochenplan", planSubtitle: "Kompakte Übungen, die nur auf belastbaren Signalen aus deinen Daten beruhen.", trainNow: "Jetzt trainieren", totalTime: "{{minutes}} Min. gesamt", activities: "{{count}} Aktivitäten", open: "Öffnen", fork: "Gabeln", forkDetail: "Kurze Gabeltaktiken tauchen wiederholt bei Fehlern oder verpassten Chancen auf.", mate: "Mattmotive", mateDetail: "Kurze erzwungene Mattideen tauchen wiederholt auf.", sacrifice: "Opfertaktik", sacrificeDetail: "Konkrete Opferfolgen tauchen wiederholt bei ernsten Fehlern auf.", tactic: "Taktische Berechnung", tacticDetail: "Kurze forcierte Kombinationen tauchen wiederholt auf.", rookEndgame: "Turmendspiele", rookEndgameDetail: "Mehrere ernste Fehler passieren in damenlosen Turmendspielen.", endgame: "Endspiele", endgameDetail: "Deine ernsten Fehler häufen sich im Endspiel.", middlegame: "Mittelspiel", middlegameDetail: "Deine ernsten Fehler häufen sich im Mittelspiel.", sideWhite: "Mit Weiß", sideBlack: "Mit Schwarz", sideDetail: "Deine durchschnittliche Genauigkeit ist mit dieser Farbe deutlich niedriger.", openingDetail: "Diese häufige Eröffnung liegt klar unter deiner Gesamtgenauigkeit.", errorsFound: "{{count}} ernste Fälle", gamesFound: "{{count}} Partien", accuracyGap: "{{gap}} Punkte unter deinem Schnitt", puzzles: "Puzzles", positions: "Positionen", review: "Wiederholung", lesson: "Lektion", taskFork: "Gabeltraining", taskMate: "Mattmotive", taskSacrifice: "Opferberechnung", taskTactic: "Forcierte Taktik", taskRook: "Turmendspiele", taskEndgame: "Endspieltraining", taskMiddle: "Mittelspieltaktik", taskOpening: "{{opening}} wiederholen", taskSide: "Repertoire mit {{side}} wiederholen", taskLesson: "Mit einer Lektion festigen", taskPuzzleDetail: "Öffne Puzzles und wähle das passende Thema.", taskOpeningDetail: "Nutze Repertoire, um die problematische Variante zu wiederholen.", taskLessonDetail: "Absolviere danach eine verfügbare Lektion.", white: "Weiß", black: "Schwarz", puzzleElo: "Puzzle-Elo {{elo}}", lessonsDone: "{{done}}/{{total}} Lektionen abgeschlossen"
    },
    pt: {
        tab: "Plano de treino", eyebrow: "Treinador pessoal", title: "As tuas fraquezas e plano de treino", subtitle: "O NexoChess transforma padrões recorrentes das tuas partidas analisadas num plano curto e prático.", learning: "Ainda estamos a aprender o teu jogo", learningDetail: "Analisa mais algumas partidas para basear as recomendações em padrões repetidos.", confidence: "Confiança", confidenceLow: "baixa", confidenceMedium: "média", confidenceHigh: "alta", confidenceLearning: "a aprender", basedOn: "Baseado em {{count}} partidas detalhadas", weaknesses: "As tuas fraquezas", noWeakness: "Ainda não existe uma fraqueza suficientemente fiável.", evidence: "Evidência", train: "Treinar", plan: "O teu plano desta semana", planSubtitle: "Atividades compactas baseadas apenas nos sinais que os teus dados suportam.", trainNow: "Treinar agora", totalTime: "{{minutes}} min no total", activities: "{{count}} atividades", open: "Abrir", fork: "Garfo", forkDetail: "Táticas curtas de garfo aparecem repetidamente nos teus erros.", mate: "Padrões de mate", mateDetail: "Ideias curtas de mate forçado aparecem nos teus erros.", sacrifice: "Sacrifícios táticos", sacrificeDetail: "Sequências concretas de sacrifício repetem-se nos teus erros.", tactic: "Cálculo tático", tacticDetail: "Combinações curtas e forçadas repetem-se nos teus erros.", rookEndgame: "Finais de torres", rookEndgameDetail: "Vários erros sérios acontecem em finais de torres sem damas.", endgame: "Finais", endgameDetail: "Os teus erros sérios concentram-se no final.", middlegame: "Meio-jogo", middlegameDetail: "Os teus erros sérios concentram-se no meio-jogo.", sideWhite: "Com brancas", sideBlack: "Com pretas", sideDetail: "A tua precisão média é claramente menor com esta cor.", openingDetail: "Esta abertura recorrente está claramente abaixo da tua precisão global.", errorsFound: "{{count}} casos sérios", gamesFound: "{{count}} partidas", accuracyGap: "{{gap}} pontos abaixo da tua média", puzzles: "puzzles", positions: "posições", review: "revisão", lesson: "lição", taskFork: "Treino de garfos", taskMate: "Padrões de mate", taskSacrifice: "Cálculo de sacrifícios", taskTactic: "Táticas forçadas", taskRook: "Finais de torres", taskEndgame: "Treino de finais", taskMiddle: "Tática de meio-jogo", taskOpening: "Rever {{opening}}", taskSide: "Rever repertório com {{side}}", taskLesson: "Reforçar com uma lição", taskPuzzleDetail: "Abre Puzzles e escolhe o tema correspondente.", taskOpeningDetail: "Usa Repertório para rever a variante problemática.", taskLessonDetail: "Completa uma lição disponível depois do trabalho específico.", white: "brancas", black: "pretas", puzzleElo: "Elo de puzzles {{elo}}", lessonsDone: "{{done}}/{{total}} lições concluídas"
    },
    ru: {
        tab: "План тренировок", eyebrow: "Личный тренер", title: "Ваши слабости и план тренировок", subtitle: "NexoChess превращает повторяющиеся закономерности из ваших анализов в короткий практический план.", learning: "Мы ещё изучаем вашу игру", learningDetail: "Проанализируйте ещё несколько партий, чтобы рекомендации опирались на повторяющиеся закономерности.", confidence: "Надёжность", confidenceLow: "низкая", confidenceMedium: "средняя", confidenceHigh: "высокая", confidenceLearning: "обучение", basedOn: "На основе {{count}} подробных партий", weaknesses: "Ваши слабости", noWeakness: "Пока ни одна слабость не подтверждена достаточно надёжно.", evidence: "Основание", train: "Тренировать", plan: "План на неделю", planSubtitle: "Короткий набор упражнений только по подтверждённым данным.", trainNow: "Начать тренировку", totalTime: "Всего {{minutes}} мин", activities: "{{count}} заданий", open: "Открыть", fork: "Вилки", forkDetail: "Вилки регулярно встречаются среди серьёзных ошибок и упущений.", mate: "Матовые мотивы", mateDetail: "Короткие форсированные маты регулярно встречаются в ошибках.", sacrifice: "Жертвенная тактика", sacrificeDetail: "Конкретные жертвенные варианты регулярно встречаются в ошибках.", tactic: "Тактический расчёт", tacticDetail: "Короткие форсированные комбинации регулярно встречаются в ошибках.", rookEndgame: "Ладейные окончания", rookEndgameDetail: "Несколько серьёзных ошибок происходят в ладейных окончаниях без ферзей.", endgame: "Окончания", endgameDetail: "Серьёзные ошибки сосредоточены в окончаниях.", middlegame: "Миттельшпиль", middlegameDetail: "Серьёзные ошибки сосредоточены в миттельшпиле.", sideWhite: "За белых", sideBlack: "За чёрных", sideDetail: "Средняя точность заметно ниже этим цветом.", openingDetail: "Эта частая дебютная схема заметно хуже вашей общей точности.", errorsFound: "{{count}} серьёзных случаев", gamesFound: "{{count}} партий", accuracyGap: "на {{gap}} пункта ниже среднего", puzzles: "задач", positions: "позиций", review: "повтор", lesson: "урок", taskFork: "Тренировка вилок", taskMate: "Матовые мотивы", taskSacrifice: "Расчёт жертв", taskTactic: "Форсированная тактика", taskRook: "Ладейные окончания", taskEndgame: "Тренировка окончаний", taskMiddle: "Тактика миттельшпиля", taskOpening: "Повторить {{opening}}", taskSide: "Повторить репертуар за {{side}}", taskLesson: "Закрепить уроком", taskPuzzleDetail: "Откройте Задачи и выберите нужную тему.", taskOpeningDetail: "Используйте Репертуар для повторения проблемной ветки.", taskLessonDetail: "После целевой тренировки завершите один доступный урок.", white: "белых", black: "чёрных", puzzleElo: "Рейтинг задач {{elo}}", lessonsDone: "Уроки: {{done}}/{{total}}"
    },
    zh: {
        tab: "训练计划", eyebrow: "个人教练", title: "你的弱点与训练计划", subtitle: "NexoChess 会把已分析对局中的重复模式转化为简短实用的训练计划。", learning: "仍在了解你的棋风", learningDetail: "再分析一些对局，让建议建立在重复模式而不是单次失误上。", confidence: "可信度", confidenceLow: "低", confidenceMedium: "中", confidenceHigh: "高", confidenceLearning: "学习中", basedOn: "基于 {{count}} 盘详细对局", weaknesses: "你的弱点", noWeakness: "目前还没有足够可靠的弱点信号。", evidence: "依据", train: "训练", plan: "本周训练计划", planSubtitle: "只使用现有数据能够支持的信号生成精简训练。", trainNow: "立即训练", totalTime: "共 {{minutes}} 分钟", activities: "{{count}} 项活动", open: "打开", fork: "双攻", forkDetail: "你的严重失误或错失机会中反复出现双攻。", mate: "将杀模式", mateDetail: "短程强制将杀在你的严重失误中反复出现。", sacrifice: "弃子战术", sacrificeDetail: "具体弃子组合在你的严重失误附近反复出现。", tactic: "战术计算", tacticDetail: "短而强制的组合在你的严重失误中反复出现。", rookEndgame: "车兵残局", rookEndgameDetail: "多次严重失误发生在无后且有车的残局。", endgame: "残局", endgameDetail: "严重失误主要集中在残局。", middlegame: "中局决策", middlegameDetail: "严重失误主要集中在中局。", sideWhite: "执白", sideBlack: "执黑", sideDetail: "这个颜色下的平均准确率明显较低。", openingDetail: "这个常见开局的表现明显低于你的总体准确率。", errorsFound: "{{count}} 次严重情况", gamesFound: "{{count}} 盘", accuracyGap: "低于平均 {{gap}} 点", puzzles: "题", positions: "局面", review: "复习", lesson: "课程", taskFork: "双攻训练", taskMate: "将杀模式", taskSacrifice: "弃子计算", taskTactic: "强制战术", taskRook: "车残局训练", taskEndgame: "残局训练", taskMiddle: "中局战术", taskOpening: "复习 {{opening}}", taskSide: "复习{{side}}棋谱", taskLesson: "用一节课程巩固", taskPuzzleDetail: "打开战术题并选择对应主题。", taskOpeningDetail: "用开局库复习正在降低准确率的分支。", taskLessonDetail: "完成针对训练后，再完成一节可用课程。", white: "白方", black: "黑方", puzzleElo: "战术题等级分 {{elo}}", lessonsDone: "已完成 {{done}}/{{total}} 节课程"
    },
    vi: {
        tab: "Kế hoạch luyện tập", eyebrow: "Huấn luyện viên cá nhân", title: "Điểm yếu và kế hoạch luyện tập", subtitle: "NexoChess biến các mẫu lặp lại trong ván đã phân tích thành kế hoạch ngắn, thực tế.", learning: "Vẫn đang học cách bạn chơi", learningDetail: "Hãy phân tích thêm vài ván để khuyến nghị dựa trên mẫu lặp lại.", confidence: "Độ tin cậy", confidenceLow: "thấp", confidenceMedium: "vừa", confidenceHigh: "cao", confidenceLearning: "đang học", basedOn: "Dựa trên {{count}} ván chi tiết", weaknesses: "Điểm yếu của bạn", noWeakness: "Chưa có điểm yếu nào đủ đáng tin cậy.", evidence: "Bằng chứng", train: "Luyện", plan: "Kế hoạch tuần này", planSubtitle: "Các hoạt động ngắn chỉ dựa trên tín hiệu dữ liệu thực sự hỗ trợ.", trainNow: "Luyện ngay", totalTime: "Tổng {{minutes}} phút", activities: "{{count}} hoạt động", open: "Mở", fork: "Đòn chĩa", forkDetail: "Đòn chĩa lặp lại trong các lỗi nghiêm trọng hoặc cơ hội bị bỏ lỡ.", mate: "Mẫu chiếu hết", mateDetail: "Các chuỗi chiếu hết ngắn lặp lại trong lỗi nghiêm trọng.", sacrifice: "Thí quân chiến thuật", sacrificeDetail: "Các chuỗi thí quân cụ thể lặp lại trong lỗi nghiêm trọng.", tactic: "Tính toán chiến thuật", tacticDetail: "Các tổ hợp cưỡng bức ngắn lặp lại trong lỗi nghiêm trọng.", rookEndgame: "Tàn cuộc xe", rookEndgameDetail: "Nhiều lỗi nghiêm trọng xảy ra trong tàn cuộc xe không hậu.", endgame: "Tàn cuộc", endgameDetail: "Lỗi nghiêm trọng tập trung ở tàn cuộc.", middlegame: "Trung cuộc", middlegameDetail: "Lỗi nghiêm trọng tập trung ở trung cuộc.", sideWhite: "Cầm Trắng", sideBlack: "Cầm Đen", sideDetail: "Độ chính xác trung bình thấp hơn rõ rệt với màu này.", openingDetail: "Khai cuộc thường gặp này thấp hơn rõ rệt so với độ chính xác tổng thể.", errorsFound: "{{count}} trường hợp nghiêm trọng", gamesFound: "{{count}} ván", accuracyGap: "thấp hơn trung bình {{gap}} điểm", puzzles: "bài", positions: "thế cờ", review: "ôn tập", lesson: "bài học", taskFork: "Luyện đòn chĩa", taskMate: "Mẫu chiếu hết", taskSacrifice: "Tính thí quân", taskTactic: "Chiến thuật cưỡng bức", taskRook: "Tàn cuộc xe", taskEndgame: "Luyện tàn cuộc", taskMiddle: "Chiến thuật trung cuộc", taskOpening: "Ôn {{opening}}", taskSide: "Ôn repertoire khi cầm {{side}}", taskLesson: "Củng cố bằng một bài học", taskPuzzleDetail: "Mở Puzzles và chọn chủ đề tương ứng.", taskOpeningDetail: "Dùng Repertoire để ôn nhánh đang làm giảm độ chính xác.", taskLessonDetail: "Hoàn thành một bài học sau phần luyện tập mục tiêu.", white: "Trắng", black: "Đen", puzzleElo: "Elo puzzle {{elo}}", lessonsDone: "Đã hoàn thành {{done}}/{{total}} bài học"
    },
    hi: {
        tab: "प्रशिक्षण योजना", eyebrow: "निजी कोच", title: "आपकी कमजोरियाँ और प्रशिक्षण योजना", subtitle: "NexoChess आपकी विश्लेषित बाज़ियों के दोहराते पैटर्न से छोटा व्यावहारिक प्लान बनाता है।", learning: "अभी आपकी शैली सीख रहे हैं", learningDetail: "कुछ और बाज़ियाँ विश्लेषित करें ताकि सुझाव दोहराए पैटर्न पर आधारित हों।", confidence: "विश्वसनीयता", confidenceLow: "कम", confidenceMedium: "मध्यम", confidenceHigh: "उच्च", confidenceLearning: "सीख रहे हैं", basedOn: "{{count}} विस्तृत बाज़ियों पर आधारित", weaknesses: "आपकी कमजोरियाँ", noWeakness: "अभी कोई कमजोरी पर्याप्त भरोसे के साथ नहीं दिख रही।", evidence: "आधार", train: "अभ्यास", plan: "इस सप्ताह की योजना", planSubtitle: "केवल आपके वास्तविक डेटा से समर्थित संकेतों पर आधारित छोटा अभ्यास सेट।", trainNow: "अभी अभ्यास करें", totalTime: "कुल {{minutes}} मिनट", activities: "{{count}} गतिविधियाँ", open: "खोलें", fork: "फोर्क", forkDetail: "गंभीर गलतियों या छूटे मौकों में फोर्क बार-बार दिख रहे हैं।", mate: "मात के पैटर्न", mateDetail: "छोटी मजबूर मात की चालें गंभीर गलतियों में बार-बार दिखती हैं।", sacrifice: "बलिदान की रणनीति", sacrificeDetail: "ठोस बलिदान क्रम गंभीर गलतियों के आसपास बार-बार दिखते हैं।", tactic: "रणनीतिक गणना", tacticDetail: "छोटी मजबूर रणनीतियाँ गंभीर गलतियों में बार-बार दिखती हैं।", rookEndgame: "रूक एंडगेम", rookEndgameDetail: "कई गंभीर गलतियाँ बिना रानी वाले रूक एंडगेम में हो रही हैं।", endgame: "एंडगेम", endgameDetail: "गंभीर गलतियाँ एंडगेम में केंद्रित हैं।", middlegame: "मिडिलगेम", middlegameDetail: "गंभीर गलतियाँ मिडिलगेम में केंद्रित हैं।", sideWhite: "सफेद से", sideBlack: "काले से", sideDetail: "इस रंग से आपकी औसत सटीकता साफ़ तौर पर कम है।", openingDetail: "यह बार-बार आने वाली ओपनिंग आपकी कुल सटीकता से नीचे है।", errorsFound: "{{count}} गंभीर मामले", gamesFound: "{{count}} बाज़ियाँ", accuracyGap: "औसत से {{gap}} अंक कम", puzzles: "पज़ल", positions: "स्थितियाँ", review: "दोहराव", lesson: "पाठ", taskFork: "फोर्क अभ्यास", taskMate: "मात पैटर्न", taskSacrifice: "बलिदान गणना", taskTactic: "मजबूर रणनीतियाँ", taskRook: "रूक एंडगेम", taskEndgame: "एंडगेम अभ्यास", taskMiddle: "मिडिलगेम रणनीति", taskOpening: "{{opening}} दोहराएँ", taskSide: "{{side}} से अपना रिपर्टोयर दोहराएँ", taskLesson: "एक पाठ से मजबूत करें", taskPuzzleDetail: "Puzzles खोलें और संबंधित थीम चुनें।", taskOpeningDetail: "Repertoire में समस्या वाली शाखा दोहराएँ।", taskLessonDetail: "लक्षित अभ्यास के बाद एक उपलब्ध पाठ पूरा करें।", white: "सफेद", black: "काले", puzzleElo: "पज़ल Elo {{elo}}", lessonsDone: "{{done}}/{{total}} पाठ पूरे"
    },
    mr: {
        tab: "प्रशिक्षण योजना", eyebrow: "वैयक्तिक प्रशिक्षक", title: "तुमच्या कमकुवत बाजू आणि प्रशिक्षण योजना", subtitle: "NexoChess विश्लेषित डावांतील पुनरावृत्तीच्या नमुन्यांपासून छोटा व्यावहारिक आराखडा तयार करते.", learning: "अजून तुमचा खेळ समजून घेत आहोत", learningDetail: "शिफारसी पुनरावृत्तीच्या नमुन्यांवर आधारित राहाव्यात म्हणून आणखी काही डाव विश्लेषित करा.", confidence: "विश्वास", confidenceLow: "कमी", confidenceMedium: "मध्यम", confidenceHigh: "उच्च", confidenceLearning: "शिकत आहे", basedOn: "{{count}} सविस्तर डावांवर आधारित", weaknesses: "तुमच्या कमकुवत बाजू", noWeakness: "अजून कोणतीही कमजोरी पुरेशा विश्वासाने दिसत नाही.", evidence: "पुरावा", train: "सराव", plan: "या आठवड्याची योजना", planSubtitle: "फक्त उपलब्ध डेटाने समर्थित संकेतांवर आधारित छोटा सराव संच.", trainNow: "आता सराव करा", totalTime: "एकूण {{minutes}} मिनिटे", activities: "{{count}} उपक्रम", open: "उघडा", fork: "फोर्क", forkDetail: "गंभीर चुका किंवा चुकलेल्या संधींमध्ये फोर्क वारंवार दिसतात.", mate: "मात नमुने", mateDetail: "लहान सक्तीच्या मात कल्पना गंभीर चुका जवळ वारंवार दिसतात.", sacrifice: "बलिदान डावपेच", sacrificeDetail: "ठोस बलिदान क्रम गंभीर चुका जवळ वारंवार दिसतात.", tactic: "डावपेच गणना", tacticDetail: "लहान सक्तीच्या संयोजना गंभीर चुका जवळ वारंवार दिसतात.", rookEndgame: "रूक एंडगेम", rookEndgameDetail: "राणी नसलेल्या रूक एंडगेममध्ये अनेक गंभीर चुका होतात.", endgame: "एंडगेम", endgameDetail: "गंभीर चुका एंडगेममध्ये केंद्रित आहेत.", middlegame: "मिडलगेंम", middlegameDetail: "गंभीर चुका मिडलगेंममध्ये केंद्रित आहेत.", sideWhite: "पांढऱ्यांनी", sideBlack: "काळ्यांनी", sideDetail: "या रंगाने तुमची सरासरी अचूकता स्पष्टपणे कमी आहे.", openingDetail: "ही वारंवार येणारी ओपनिंग तुमच्या एकूण अचूकतेपेक्षा खाली आहे.", errorsFound: "{{count}} गंभीर प्रसंग", gamesFound: "{{count}} डाव", accuracyGap: "सरासरीपेक्षा {{gap}} गुण कमी", puzzles: "पझल", positions: "स्थिती", review: "पुनरावलोकन", lesson: "धडा", taskFork: "फोर्क सराव", taskMate: "मात नमुने", taskSacrifice: "बलिदान गणना", taskTactic: "सक्तीचे डावपेच", taskRook: "रूक एंडगेम", taskEndgame: "एंडगेम सराव", taskMiddle: "मिडलगेंम डावपेच", taskOpening: "{{opening}} पुनरावलोकन", taskSide: "{{side}} रिपर्टोयर पुनरावलोकन", taskLesson: "एका धड्याने मजबूत करा", taskPuzzleDetail: "Puzzles उघडा आणि संबंधित थीम निवडा.", taskOpeningDetail: "Repertoire मध्ये समस्येची शाखा पुन्हा पाहा.", taskLessonDetail: "लक्षित सरावानंतर एक उपलब्ध धडा पूर्ण करा.", white: "पांढरे", black: "काळे", puzzleElo: "पझल Elo {{elo}}", lessonsDone: "{{done}}/{{total}} धडे पूर्ण"
    },
    pl: {
        tab: "Plan treningowy", eyebrow: "Osobisty trener", title: "Twoje słabości i plan treningowy", subtitle: "NexoChess zamienia powtarzające się wzorce z analizowanych partii w krótki, praktyczny plan.", learning: "Wciąż poznajemy twoją grę", learningDetail: "Przeanalizuj jeszcze kilka partii, aby zalecenia opierały się na powtarzalnych wzorcach.", confidence: "Pewność", confidenceLow: "niska", confidenceMedium: "średnia", confidenceHigh: "wysoka", confidenceLearning: "uczenie", basedOn: "Na podstawie {{count}} szczegółowych partii", weaknesses: "Twoje słabości", noWeakness: "Na razie żadna słabość nie wyróżnia się wystarczająco wiarygodnie.", evidence: "Dowód", train: "Trenuj", plan: "Plan na ten tydzień", planSubtitle: "Kompaktowy zestaw ćwiczeń oparty tylko na sygnałach wspartych twoimi danymi.", trainNow: "Trenuj teraz", totalTime: "Łącznie {{minutes}} min", activities: "{{count}} aktywności", open: "Otwórz", fork: "Widełki", forkDetail: "Widełki regularnie pojawiają się w poważnych błędach lub przeoczonych szansach.", mate: "Motywy matowe", mateDetail: "Krótkie wymuszone maty regularnie pojawiają się w poważnych błędach.", sacrifice: "Taktyka poświęceń", sacrificeDetail: "Konkretne sekwencje poświęceń regularnie pojawiają się przy poważnych błędach.", tactic: "Liczenie taktyczne", tacticDetail: "Krótkie wymuszone kombinacje regularnie pojawiają się w poważnych błędach.", rookEndgame: "Końcówki wieżowe", rookEndgameDetail: "Kilka poważnych błędów występuje w bezhetmańskich końcówkach wieżowych.", endgame: "Końcówki", endgameDetail: "Poważne błędy skupiają się w końcówkach.", middlegame: "Gra środkowa", middlegameDetail: "Poważne błędy skupiają się w grze środkowej.", sideWhite: "Białymi", sideBlack: "Czarnymi", sideDetail: "Średnia dokładność jest wyraźnie niższa tym kolorem.", openingDetail: "Ten częsty debiut wypada wyraźnie poniżej twojej ogólnej dokładności.", errorsFound: "{{count}} poważnych przypadków", gamesFound: "{{count}} partii", accuracyGap: "{{gap}} pkt poniżej średniej", puzzles: "zadań", positions: "pozycji", review: "powtórka", lesson: "lekcja", taskFork: "Trening widełek", taskMate: "Motywy matowe", taskSacrifice: "Liczenie poświęceń", taskTactic: "Wymuszona taktyka", taskRook: "Końcówki wieżowe", taskEndgame: "Trening końcówek", taskMiddle: "Taktyka gry środkowej", taskOpening: "Powtórz {{opening}}", taskSide: "Powtórz repertuar {{side}}", taskLesson: "Utrwal jedną lekcją", taskPuzzleDetail: "Otwórz Puzzles i wybierz odpowiedni motyw.", taskOpeningDetail: "W Repertuarze powtórz problematyczną gałąź.", taskLessonDetail: "Po ćwiczeniu docelowym ukończ jedną dostępną lekcję.", white: "białymi", black: "czarnymi", puzzleElo: "Elo zadań {{elo}}", lessonsDone: "Ukończono {{done}}/{{total}} lekcji"
    }
} as const;

type Copy = typeof copy.en;

function normaliseLanguage(language: string): keyof typeof copy {
    const key = language.toLowerCase().replace("_", "-").split("-")[0] as keyof typeof copy;
    return key in copy ? key : "en";
}

function normaliseName(value?: string) {
    return (value || "").trim().toLowerCase();
}

function entryTimestamp(game: ArchivedGameMetadata) {
    const value = game.date || game.archiveSummary?.savedAt;
    const timestamp = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(timestamp) ? timestamp : 0;
}

function average(values: Array<number | undefined>) {
    const valid = values.filter((value): value is number => typeof value == "number" && Number.isFinite(value));
    if (!valid.length) return undefined;
    return valid.reduce((sum, value) => sum + value, 0) / valid.length;
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
    return classification == Classification.MISTAKE
        || classification == Classification.MISS
        || classification == Classification.BLUNDER;
}

function scoreForResult(result: string | undefined, side: Colour) {
    if (result == "1/2-1/2") return 0.5;
    if ((result == "1-0" && side == "white") || (result == "0-1" && side == "black")) return 1;
    if ((result == "0-1" && side == "white") || (result == "1-0" && side == "black")) return 0;
    return undefined;
}

function TrainingPlan({ archive }: { archive: GameArchive }) {
    const { i18n } = useTranslation();
    const c = copy[normaliseLanguage(i18n.resolvedLanguage || i18n.language || "en")] as Copy;
    const allEntries = useMemo<ArchiveEntry[]>(() => (
        Object.entries(archive).sort((a, b) => entryTimestamp(b[1]) - entryTimestamp(a[1]))
    ), [archive]);
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
                if (!response.game) return undefined;
                return { game: response.game, side: playerSide(metadata, primaryUsername) };
            } catch {
                return undefined;
            }
        })).then(items => {
            if (cancelled) return;
            const summary: DetailSummary = {
                loadedGames: 0,
                seriousByPhase: { opening: 0, middlegame: 0, endgame: 0 },
                tactics: { fork: 0, mate: 0, sacrifice: 0, tactic: 0 },
                rookEndgameErrors: 0
            };

            for (const item of items) {
                if (!item?.side) continue;
                summary.loadedGames += 1;
                const targetColour = item.side == "white" ? PieceColour.WHITE : PieceColour.BLACK;
                const chain = getNodeChain(item.game.stateTree).slice(1);
                chain.forEach((node, index) => {
                    if (node.state.moveColour != targetColour || !serious(node.state.classification)) return;
                    const phase = phaseFor(index + 1, node.state.fen);
                    summary.seriousByPhase[phase] += 1;
                    if (phase == "endgame" && isRookEndgame(node.state.fen)) summary.rookEndgameErrors += 1;

                    const insight = getCoachTacticInsight(node, node.state.classification, "en");
                    const label = insight?.label as TacticKind | undefined;
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
        return {
            game,
            side,
            accuracy: game.archiveSummary?.[side].accuracy,
            score: scoreForResult(game.archiveSummary?.result, side)
        };
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
        return [...grouped.entries()]
            .map(([name, value]) => ({
                name,
                count: value.count,
                accuracy: average(value.accuracies),
                score: average(value.scores)
            }))
            .filter(row => row.count >= 3 && row.accuracy != undefined)
            .map(row => ({ ...row, gap: overallAccuracy - row.accuracy! }))
            .filter(row => row.gap >= 5 || (row.count >= 4 && row.score != undefined && row.score < 0.4))
            .sort((a, b) => b.gap * b.count - a.gap * a.count)[0];
    }, [overallAccuracy, personalStats]);

    const weaknesses = useMemo<Weakness[]>(() => {
        if (!details) return [];
        const result: Weakness[] = [];
        const puzzleHref = currentLanguageHref("/puzzles");
        const repertoireHref = currentLanguageHref("/repertoire");

        const tacticMeta: Array<[TacticKind, string, string, number]> = [
            ["fork", c.fork, c.forkDetail, 2],
            ["mate", c.mate, c.mateDetail, 2],
            ["sacrifice", c.sacrifice, c.sacrificeDetail, 2],
            ["tactic", c.tactic, c.tacticDetail, 3]
        ];
        tacticMeta.forEach(([kind, title, detail, threshold]) => {
            const count = details.tactics[kind];
            if (count < threshold) return;
            result.push({ id: kind, kind, title, detail, evidence: c.errorsFound.replace("{{count}}", String(count)), score: count * 4, href: puzzleHref, action: c.train });
        });

        if (details.rookEndgameErrors >= 2) {
            result.push({ id: "rook-endgame", kind: "rookEndgame", title: c.rookEndgame, detail: c.rookEndgameDetail, evidence: c.errorsFound.replace("{{count}}", String(details.rookEndgameErrors)), score: details.rookEndgameErrors * 4.5, href: puzzleHref, action: c.train });
        }

        const phaseEntries = Object.entries(details.seriousByPhase) as Array<[Phase, number]>;
        const totalSerious = phaseEntries.reduce((sum, [, count]) => sum + count, 0);
        const strongestPhase = phaseEntries.sort((a, b) => b[1] - a[1])[0];
        if (strongestPhase && strongestPhase[1] >= 4 && strongestPhase[1] / Math.max(1, totalSerious) >= 0.42) {
            const [phase, count] = strongestPhase;
            if (phase == "endgame" && details.rookEndgameErrors < 2) {
                result.push({ id: "endgame", kind: "endgame", title: c.endgame, detail: c.endgameDetail, evidence: c.errorsFound.replace("{{count}}", String(count)), score: count * 2.8, href: puzzleHref, action: c.train });
            }
            if (phase == "middlegame") {
                result.push({ id: "middlegame", kind: "middlegame", title: c.middlegame, detail: c.middlegameDetail, evidence: c.errorsFound.replace("{{count}}", String(count)), score: count * 2.5, href: puzzleHref, action: c.train });
            }
        }

        if (whiteStats.count >= 4 && blackStats.count >= 4 && whiteStats.accuracy != undefined && blackStats.accuracy != undefined) {
            const difference = Math.abs(whiteStats.accuracy - blackStats.accuracy);
            if (difference >= 5) {
                const weakSide: Colour = whiteStats.accuracy < blackStats.accuracy ? "white" : "black";
                result.push({
                    id: `side-${weakSide}`, kind: "side", title: weakSide == "white" ? c.sideWhite : c.sideBlack,
                    detail: c.sideDetail,
                    evidence: c.accuracyGap.replace("{{gap}}", difference.toFixed(1)),
                    score: difference * 1.8,
                    href: repertoireHref,
                    action: c.train
                });
            }
        }

        if (weakOpening) {
            result.push({
                id: `opening-${weakOpening.name}`, kind: "opening", title: weakOpening.name, detail: c.openingDetail,
                evidence: `${c.gamesFound.replace("{{count}}", String(weakOpening.count))} · ${c.accuracyGap.replace("{{gap}}", weakOpening.gap.toFixed(1))}`,
                score: weakOpening.gap * Math.min(6, weakOpening.count), href: repertoireHref, action: c.train
            });
        }

        return result.sort((a, b) => b.score - a.score).slice(0, 4);
    }, [blackStats.accuracy, blackStats.count, c, details, weakOpening, whiteStats.accuracy, whiteStats.count]);

    const lessonProgress = useMemo(() => loadLessonsProgress(), [archive]);
    const puzzleProfile = useMemo(() => getPuzzleProfile(), [archive]);

    const tasks = useMemo<PlanTask[]>(() => {
        const taskRows: PlanTask[] = weaknesses.slice(0, 3).map(weakness => {
            if (weakness.kind == "fork") return { id: weakness.id, title: c.taskFork, detail: c.taskPuzzleDetail, count: 8, unit: c.puzzles, minutes: 12, href: weakness.href };
            if (weakness.kind == "mate") return { id: weakness.id, title: c.taskMate, detail: c.taskPuzzleDetail, count: 6, unit: c.puzzles, minutes: 10, href: weakness.href };
            if (weakness.kind == "sacrifice") return { id: weakness.id, title: c.taskSacrifice, detail: c.taskPuzzleDetail, count: 6, unit: c.puzzles, minutes: 12, href: weakness.href };
            if (weakness.kind == "tactic") return { id: weakness.id, title: c.taskTactic, detail: c.taskPuzzleDetail, count: 8, unit: c.puzzles, minutes: 12, href: weakness.href };
            if (weakness.kind == "rookEndgame") return { id: weakness.id, title: c.taskRook, detail: c.taskPuzzleDetail, count: 5, unit: c.positions, minutes: 15, href: weakness.href };
            if (weakness.kind == "endgame") return { id: weakness.id, title: c.taskEndgame, detail: c.taskPuzzleDetail, count: 6, unit: c.positions, minutes: 15, href: weakness.href };
            if (weakness.kind == "middlegame") return { id: weakness.id, title: c.taskMiddle, detail: c.taskPuzzleDetail, count: 6, unit: c.puzzles, minutes: 12, href: weakness.href };
            if (weakness.kind == "opening") return { id: weakness.id, title: c.taskOpening.replace("{{opening}}", weakness.title), detail: c.taskOpeningDetail, count: 1, unit: c.review, minutes: 8, href: weakness.href };
            const sideWord = weakness.id.endsWith("white") ? c.white : c.black;
            return { id: weakness.id, title: c.taskSide.replace("{{side}}", sideWord), detail: c.taskOpeningDetail, count: 1, unit: c.review, minutes: 8, href: weakness.href };
        });

        if (taskRows.length && lessonProgress.completedLessonIds.length < TOTAL_LESSONS) {
            taskRows.push({ id: "lesson", title: c.taskLesson, detail: c.taskLessonDetail, count: 1, unit: c.lesson, minutes: 10, href: currentLanguageHref("/lessons") });
        }
        return taskRows;
    }, [c, lessonProgress.completedLessonIds.length, weaknesses]);

    const confidence = details?.loadedGames == null
        ? c.confidenceLearning
        : details.loadedGames >= 18
            ? c.confidenceHigh
            : details.loadedGames >= 10
                ? c.confidenceMedium
                : details.loadedGames >= 5
                    ? c.confidenceLow
                    : c.confidenceLearning;
    const totalActivities = tasks.reduce((sum, task) => sum + task.count, 0);
    const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);

    return <section className={styles.planShell}>
        <header className={styles.hero}>
            <div>
                <span className={styles.eyebrow}>{c.eyebrow}</span>
                <h2>{c.title}</h2>
                <p>{c.subtitle}</p>
            </div>
            <div className={styles.contextChips}>
                <span>{c.confidence}: <b>{confidence}</b></span>
                <span>{c.puzzleElo.replace("{{elo}}", String(puzzleProfile.rating))}</span>
                <span>{c.lessonsDone.replace("{{done}}", String(lessonProgress.completedLessonIds.length)).replace("{{total}}", String(TOTAL_LESSONS))}</span>
            </div>
        </header>

        {loading && <div className={styles.loadingLine}>{c.basedOn.replace("{{count}}", "…")}</div>}

        {!loading && details && details.loadedGames < 5 && (
            <div className={styles.learningCard}>
                <strong>{c.learning}</strong>
                <p>{c.learningDetail}</p>
                <span>{c.basedOn.replace("{{count}}", String(details.loadedGames))}</span>
            </div>
        )}

        <div className={styles.sectionHeader}>
            <div>
                <span className={styles.eyebrow}>{c.evidence}</span>
                <h3>{c.weaknesses}</h3>
            </div>
            {details && <small>{c.basedOn.replace("{{count}}", String(details.loadedGames))}</small>}
        </div>

        {weaknesses.length > 0 ? (
            <div className={styles.weaknessGrid}>
                {weaknesses.map((weakness, index) => (
                    <article className={styles.weaknessCard} key={weakness.id}>
                        <div className={styles.rank}>{index + 1}</div>
                        <div className={styles.weaknessBody}>
                            <h4>{weakness.title}</h4>
                            <p>{weakness.detail}</p>
                            <span>{c.evidence}: <b>{weakness.evidence}</b></span>
                        </div>
                        <a href={weakness.href}>{weakness.action} →</a>
                    </article>
                ))}
            </div>
        ) : !loading && (
            <div className={styles.empty}>{c.noWeakness}</div>
        )}

        <section className={styles.weekPlan}>
            <div className={styles.planHeading}>
                <div>
                    <span className={styles.eyebrow}>{c.plan}</span>
                    <h3>{c.plan}</h3>
                    <p>{c.planSubtitle}</p>
                </div>
                <div className={styles.planSummary}>
                    <strong>{c.activities.replace("{{count}}", String(totalActivities))}</strong>
                    <span>{c.totalTime.replace("{{minutes}}", String(totalMinutes))}</span>
                </div>
            </div>

            {tasks.length > 0 ? (
                <>
                    <div className={styles.taskList}>
                        {tasks.map((task, index) => (
                            <article key={task.id} className={styles.taskRow}>
                                <span className={styles.taskNumber}>{index + 1}</span>
                                <div>
                                    <strong>{task.title}</strong>
                                    <p>{task.detail}</p>
                                </div>
                                <div className={styles.taskAmount}>
                                    <b>{task.count}</b>
                                    <span>{task.unit}</span>
                                </div>
                                <a href={task.href}>{c.open} →</a>
                            </article>
                        ))}
                    </div>
                    <a className={styles.trainNow} href={tasks[0].href}>{c.trainNow} →</a>
                </>
            ) : (
                <div className={styles.empty}>{c.noWeakness}</div>
            )}
        </section>
    </section>;
}

export { copy as trainingPlanCopy };
export default TrainingPlan;
