import React, { useMemo } from "react";
import { Chess } from "chess.js";
import { useTranslation } from "react-i18next";

import PieceColour from "shared/constants/PieceColour";
import { Classification } from "shared/constants/Classification";
import {
    getNodeChain,
    type StateTreeNode
} from "shared/types/game/position/StateTreeNode";
import { getTopEngineLine } from "shared/types/game/position/EngineLine";
import { getExpectedPointsLoss } from "shared/lib/reporter/expectedPoints";

import useAnalysisGameStore from "@analysis/stores/AnalysisGameStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";
import { getCoachTacticInsight } from "@analysis/lib/coachTacticInsight";
import { useAuthedProfile } from "@/hooks/api/useProfile";
import { currentLanguageHref } from "@/i18n/routing";

import * as styles from "./GameConclusions.module.css";

type Phase = "opening" | "middlegame" | "endgame";

type Copy = {
    title: string;
    subtitle: string;
    decisive: string;
    pattern: string;
    recommendation: string;
    viewPosition: string;
    practice: string;
    noData: string;
    opening: string;
    middlegame: string;
    endgame: string;
    moveTurned: (move: string, loss: number) => string;
    moveWasKey: (move: string) => string;
    repeatedTactic: (label: string, count: number) => string;
    singleTactic: (label: string) => string;
    phasePattern: (phase: string, count: number) => string;
    tacticAdvice: (label: string) => string;
    openingAdvice: string;
    middlegameAdvice: string;
    endgameAdvice: string;
};

const copies: Record<string, Copy> = {
    en: {
        title: "Things to learn from this game", subtitle: "NexoChess picks the moments that are most worth revisiting.", decisive: "Decisive moment", pattern: "Key pattern", recommendation: "What to work on", viewPosition: "View position", practice: "Practice", noData: "There is not enough evaluated information yet to build useful conclusions for this game.", opening: "opening", middlegame: "middlegame", endgame: "endgame",
        moveTurned: (move, loss) => `${move} was the biggest turning point, reducing expected result by about ${loss}% .`.replace("% .", "%."),
        moveWasKey: move => `${move} was the most important negative turning point detected in the game.`,
        repeatedTactic: (label, count) => `${label} is the clearest recurring tactical pattern: it appears in ${count} important moments.`,
        singleTactic: label => `The most important concrete tactical idea was a ${label}.`,
        phasePattern: (phase, count) => `The most important mistakes are concentrated in the ${phase}: ${count} relevant moments.`,
        tacticAdvice: label => `Train ${label} positions and, before moving, scan checks, captures and forcing threats.`,
        openingAdvice: "Review the opening line and compare your choice with the main alternatives before the position becomes tactical.",
        middlegameAdvice: "Prioritise short calculation exercises and identify the opponent's forcing moves before committing to a plan.",
        endgameAdvice: "Prioritise endgame technique and calculate forcing king, pawn and rook moves before simplifying."
    },
    es: {
        title: "Cosas que aprender de esta partida", subtitle: "NexoChess selecciona los momentos que más merece la pena revisar.", decisive: "Momento decisivo", pattern: "Patrón clave", recommendation: "Qué trabajar", viewPosition: "Ver posición", practice: "Practicar", noData: "Todavía no hay suficiente información evaluada para generar conclusiones útiles de esta partida.", opening: "apertura", middlegame: "medio juego", endgame: "final",
        moveTurned: (move, loss) => `${move} fue el mayor punto de inflexión y redujo aproximadamente un ${loss}% tu expectativa de resultado.`,
        moveWasKey: move => `${move} fue el punto de inflexión negativo más importante detectado en la partida.`,
        repeatedTactic: (label, count) => `${label} es el patrón táctico más repetido: aparece en ${count} momentos importantes.`,
        singleTactic: label => `La idea táctica concreta más importante fue ${label}.`,
        phasePattern: (phase, count) => `Los errores más importantes se concentran en el ${phase}: ${count} momentos relevantes.`,
        tacticAdvice: label => `Practica posiciones de ${label} y, antes de mover, revisa jaques, capturas y amenazas forzantes.`,
        openingAdvice: "Repasa la línea de apertura y compara tu elección con las alternativas principales antes de que la posición se vuelva táctica.",
        middlegameAdvice: "Prioriza cálculo corto y revisa las jugadas forzantes del rival antes de comprometerte con un plan.",
        endgameAdvice: "Prioriza técnica de finales y calcula primero jugadas forzantes de rey, peones y torres antes de simplificar."
    },
    fr: {
        title: "Ce qu’il faut retenir de cette partie", subtitle: "NexoChess sélectionne les moments qui méritent le plus d’être revus.", decisive: "Moment décisif", pattern: "Motif clé", recommendation: "À travailler", viewPosition: "Voir la position", practice: "S’entraîner", noData: "Pas encore assez d’informations évaluées pour produire des conclusions utiles.", opening: "ouverture", middlegame: "milieu de jeu", endgame: "finale",
        moveTurned: (move, loss) => `${move} a été le principal tournant, avec environ ${loss}% de perte d’espérance de résultat.`, moveWasKey: move => `${move} a été le tournant négatif le plus important de la partie.`, repeatedTactic: (label, count) => `${label} est le motif tactique récurrent le plus net : ${count} moments importants.`, singleTactic: label => `L’idée tactique concrète la plus importante était ${label}.`, phasePattern: (phase, count) => `Les erreurs les plus importantes se concentrent en ${phase} : ${count} moments.`, tacticAdvice: label => `Travaillez des positions de ${label} et vérifiez échecs, prises et menaces forcées avant de jouer.`, openingAdvice: "Revoyez la ligne d’ouverture et les principales alternatives.", middlegameAdvice: "Privilégiez le calcul court et les coups forcés adverses avant de choisir un plan.", endgameAdvice: "Privilégiez la technique de finale et les coups forcés avant de simplifier."
    },
    de: {
        title: "Was du aus dieser Partie lernen kannst", subtitle: "NexoChess hebt die Momente hervor, die sich wirklich zu überprüfen lohnen.", decisive: "Entscheidender Moment", pattern: "Schlüsselmuster", recommendation: "Daran arbeiten", viewPosition: "Position ansehen", practice: "Trainieren", noData: "Noch nicht genug ausgewertete Informationen für sinnvolle Schlussfolgerungen.", opening: "Eröffnung", middlegame: "Mittelspiel", endgame: "Endspiel",
        moveTurned: (move, loss) => `${move} war der größte Wendepunkt und kostete ungefähr ${loss}% Ergebniserwartung.`, moveWasKey: move => `${move} war der wichtigste negative Wendepunkt der Partie.`, repeatedTactic: (label, count) => `${label} ist das deutlichste wiederkehrende taktische Muster: ${count} wichtige Momente.`, singleTactic: label => `Die wichtigste konkrete taktische Idee war ${label}.`, phasePattern: (phase, count) => `Die wichtigsten Fehler häufen sich im ${phase}: ${count} relevante Momente.`, tacticAdvice: label => `Trainiere ${label}-Stellungen und prüfe vor jedem Zug Schachs, Schlagzüge und forcierte Drohungen.`, openingAdvice: "Überprüfe die Eröffnungsvariante und die wichtigsten Alternativen.", middlegameAdvice: "Trainiere kurze Berechnung und prüfe gegnerische Zwangszüge vor dem eigenen Plan.", endgameAdvice: "Trainiere Endspieltechnik und berechne forcierte König-, Bauern- und Turmzüge zuerst."
    },
    pt: {
        title: "O que aprender desta partida", subtitle: "O NexoChess destaca os momentos que mais vale a pena rever.", decisive: "Momento decisivo", pattern: "Padrão-chave", recommendation: "O que treinar", viewPosition: "Ver posição", practice: "Treinar", noData: "Ainda não há informação avaliada suficiente para conclusões úteis.", opening: "abertura", middlegame: "meio-jogo", endgame: "final",
        moveTurned: (move, loss) => `${move} foi o maior ponto de viragem e reduziu em cerca de ${loss}% a expectativa de resultado.`, moveWasKey: move => `${move} foi o ponto de viragem negativo mais importante da partida.`, repeatedTactic: (label, count) => `${label} é o padrão tático recorrente mais claro: aparece em ${count} momentos importantes.`, singleTactic: label => `A ideia tática concreta mais importante foi ${label}.`, phasePattern: (phase, count) => `Os erros mais importantes concentram-se no ${phase}: ${count} momentos relevantes.`, tacticAdvice: label => `Treina posições de ${label} e verifica xeques, capturas e ameaças forçadas antes de jogar.`, openingAdvice: "Revê a linha de abertura e as alternativas principais.", middlegameAdvice: "Prioriza cálculo curto e as jogadas forçadas do adversário.", endgameAdvice: "Prioriza técnica de finais e jogadas forçadas antes de simplificar."
    },
    ru: {
        title: "Что вынести из этой партии", subtitle: "NexoChess выделяет моменты, которые полезнее всего пересмотреть.", decisive: "Решающий момент", pattern: "Ключевой мотив", recommendation: "Что тренировать", viewPosition: "Показать позицию", practice: "Тренировать", noData: "Пока недостаточно оценённых данных для полезных выводов.", opening: "дебюте", middlegame: "миттельшпиле", endgame: "эндшпиле",
        moveTurned: (move, loss) => `${move} стал главным переломом и снизил ожидаемый результат примерно на ${loss}%.`, moveWasKey: move => `${move} был главным негативным переломом партии.`, repeatedTactic: (label, count) => `${label} — самый заметный повторяющийся тактический мотив: ${count} важных эпизода.`, singleTactic: label => `Самой важной конкретной тактической идеей был мотив «${label}».`, phasePattern: (phase, count) => `Самые важные ошибки сосредоточены в ${phase}: ${count} эпизода.`, tacticAdvice: label => `Тренируй позиции на «${label}» и перед ходом проверяй шахи, взятия и форсированные угрозы.`, openingAdvice: "Повтори дебютную линию и основные альтернативы.", middlegameAdvice: "Тренируй короткий расчёт и сначала проверяй форсированные ходы соперника.", endgameAdvice: "Сделай упор на технику эндшпиля и форсированные ходы перед упрощением."
    },
    zh: {
        title: "这盘棋值得学到什么", subtitle: "NexoChess 会挑出最值得回看的关键时刻。", decisive: "决定性时刻", pattern: "关键模式", recommendation: "接下来练什么", viewPosition: "查看局面", practice: "训练", noData: "目前还没有足够的评估信息生成有用结论。", opening: "开局", middlegame: "中局", endgame: "残局",
        moveTurned: (move, loss) => `${move} 是全局最大的转折点，预期结果大约下降了 ${loss}%。`, moveWasKey: move => `${move} 是本局检测到的最重要负面转折点。`, repeatedTactic: (label, count) => `${label} 是最明显的重复战术模式，共出现在 ${count} 个关键时刻。`, singleTactic: label => `本局最重要的具体战术主题是${label}。`, phasePattern: (phase, count) => `最重要的失误集中在${phase}，共 ${count} 个关键时刻。`, tacticAdvice: label => `练习${label}局面，并在落子前先检查将军、吃子和强制威胁。`, openingAdvice: "复习这条开局线路并比较主要选择。", middlegameAdvice: "优先训练短计算，并先检查对手的强制着法。", endgameAdvice: "优先训练残局技术，简化前先计算王、兵和车的强制着法。"
    },
    vi: {
        title: "Điều cần rút ra từ ván này", subtitle: "NexoChess chọn những thời điểm đáng xem lại nhất.", decisive: "Thời điểm quyết định", pattern: "Mẫu hình chính", recommendation: "Nên luyện gì", viewPosition: "Xem thế cờ", practice: "Luyện tập", noData: "Chưa có đủ dữ liệu đánh giá để tạo kết luận hữu ích.", opening: "khai cuộc", middlegame: "trung cuộc", endgame: "tàn cuộc",
        moveTurned: (move, loss) => `${move} là bước ngoặt lớn nhất, làm giảm khoảng ${loss}% kỳ vọng kết quả.`, moveWasKey: move => `${move} là bước ngoặt tiêu cực quan trọng nhất của ván.`, repeatedTactic: (label, count) => `${label} là mẫu chiến thuật lặp lại rõ nhất: xuất hiện ở ${count} thời điểm quan trọng.`, singleTactic: label => `Ý tưởng chiến thuật cụ thể quan trọng nhất là ${label}.`, phasePattern: (phase, count) => `Các lỗi quan trọng tập trung ở ${phase}: ${count} thời điểm.`, tacticAdvice: label => `Luyện các thế ${label} và kiểm tra chiếu, bắt quân, đe doạ cưỡng bức trước khi đi.`, openingAdvice: "Ôn lại nhánh khai cuộc và các lựa chọn chính.", middlegameAdvice: "Ưu tiên tính toán ngắn và nước cưỡng bức của đối thủ.", endgameAdvice: "Ưu tiên kỹ thuật tàn cuộc và nước cưỡng bức trước khi đơn giản hoá."
    },
    hi: {
        title: "इस बाज़ी से क्या सीखें", subtitle: "NexoChess उन पलों को चुनता है जिन्हें दोबारा देखना सबसे उपयोगी है।", decisive: "निर्णायक क्षण", pattern: "मुख्य पैटर्न", recommendation: "क्या अभ्यास करें", viewPosition: "स्थिति देखें", practice: "अभ्यास", noData: "उपयोगी निष्कर्षों के लिए अभी पर्याप्त मूल्यांकित जानकारी नहीं है।", opening: "ओपनिंग", middlegame: "मिडिलगेम", endgame: "एंडगेम",
        moveTurned: (move, loss) => `${move} सबसे बड़ा मोड़ था और अपेक्षित परिणाम लगभग ${loss}% घटा।`, moveWasKey: move => `${move} बाज़ी का सबसे महत्वपूर्ण नकारात्मक मोड़ था।`, repeatedTactic: (label, count) => `${label} सबसे साफ़ दोहराया गया सामरिक पैटर्न है: ${count} महत्वपूर्ण मौके।`, singleTactic: label => `सबसे महत्वपूर्ण ठोस सामरिक विचार ${label} था।`, phasePattern: (phase, count) => `मुख्य गलतियाँ ${phase} में केंद्रित हैं: ${count} महत्वपूर्ण मौके।`, tacticAdvice: label => `${label} स्थितियों का अभ्यास करें और चाल से पहले चेक, कैप्चर और मजबूर धमकियाँ देखें।`, openingAdvice: "ओपनिंग लाइन और मुख्य विकल्पों को दोहराएँ।", middlegameAdvice: "छोटी गणना और प्रतिद्वंद्वी की मजबूर चालों को प्राथमिकता दें।", endgameAdvice: "एंडगेम तकनीक और मजबूर चालों को सरल करने से पहले जाँचें।"
    },
    mr: {
        title: "या डावातून काय शिकायचे", subtitle: "NexoChess पुन्हा पाहण्यास सर्वात उपयुक्त क्षण निवडतो.", decisive: "निर्णायक क्षण", pattern: "मुख्य नमुना", recommendation: "कशावर काम करायचे", viewPosition: "स्थिती पहा", practice: "सराव", noData: "उपयुक्त निष्कर्षांसाठी अजून पुरेशी मूल्यमापन माहिती नाही.", opening: "ओपनिंग", middlegame: "मिडलगेम", endgame: "एंडगेम",
        moveTurned: (move, loss) => `${move} हा सर्वात मोठा टर्निंग पॉइंट होता आणि अपेक्षित निकाल सुमारे ${loss}% कमी झाला.`, moveWasKey: move => `${move} हा डावातील सर्वात महत्त्वाचा नकारात्मक टर्निंग पॉइंट होता.`, repeatedTactic: (label, count) => `${label} हा सर्वात स्पष्ट पुनरावृत्ती होणारा डावपेच आहे: ${count} महत्त्वाचे क्षण.`, singleTactic: label => `सर्वात महत्त्वाची ठोस डावपेची कल्पना ${label} होती.`, phasePattern: (phase, count) => `महत्त्वाच्या चुका ${phase} मध्ये जास्त आहेत: ${count} क्षण.`, tacticAdvice: label => `${label} स्थितींचा सराव करा आणि चालण्यापूर्वी चेक, कॅप्चर व जबरदस्तीच्या धमक्या तपासा.`, openingAdvice: "ओपनिंग लाईन आणि मुख्य पर्याय पुन्हा पहा.", middlegameAdvice: "लहान गणना आणि प्रतिस्पर्ध्याच्या जबरदस्तीच्या चालींना प्राधान्य द्या.", endgameAdvice: "एंडगेम तंत्र आणि जबरदस्तीच्या चाली आधी मोजा."
    },
    pl: {
        title: "Czego nauczyć się z tej partii", subtitle: "NexoChess wybiera momenty, do których najbardziej warto wrócić.", decisive: "Decydujący moment", pattern: "Kluczowy motyw", recommendation: "Co trenować", viewPosition: "Pokaż pozycję", practice: "Trenuj", noData: "Brakuje jeszcze wystarczających danych z analizy, aby stworzyć użyteczne wnioski.", opening: "debiucie", middlegame: "grze środkowej", endgame: "końcówce",
        moveTurned: (move, loss) => `${move} było największym punktem zwrotnym i obniżyło oczekiwany wynik o około ${loss}%.`, moveWasKey: move => `${move} było najważniejszym negatywnym punktem zwrotnym partii.`, repeatedTactic: (label, count) => `${label} to najwyraźniejszy powtarzający się motyw taktyczny: ${count} ważne momenty.`, singleTactic: label => `Najważniejszym konkretnym motywem taktycznym było ${label}.`, phasePattern: (phase, count) => `Najważniejsze błędy skupiają się w ${phase}: ${count} istotne momenty.`, tacticAdvice: label => `Trenuj pozycje typu ${label} i przed ruchem sprawdzaj szachy, bicia oraz wymuszające groźby.`, openingAdvice: "Powtórz wariant debiutowy i główne alternatywy.", middlegameAdvice: "Skup się na krótkim liczeniu i wymuszających ruchach przeciwnika.", endgameAdvice: "Skup się na technice końcówek i ruchach wymuszających przed uproszczeniem."
    }
};

function languageKey(language?: string) {
    const key = (language || "en").toLowerCase().split("-")[0];
    return copies[key] ? key : "en";
}

function severity(classification?: Classification) {
    switch (classification) {
        case Classification.BLUNDER: return 4;
        case Classification.MISS: return 3.5;
        case Classification.MISTAKE: return 3;
        case Classification.INACCURACY: return 1.5;
        default: return 0;
    }
}

function expectedPointsLoss(node: StateTreeNode) {
    if (!node.parent || !node.state.moveColour) return null;
    const before = getTopEngineLine(node.parent.state.engineLines);
    const after = getTopEngineLine(node.state.engineLines);
    if (!before || !after) return null;

    return Math.max(0, Math.min(1, getExpectedPointsLoss(
        before.evaluation,
        after.evaluation,
        node.state.moveColour
    )));
}

function getPhase(node: StateTreeNode, ply: number): Phase {
    const board = new Chess(node.state.fen);
    let nonPawnMaterial = 0;
    let queens = 0;
    let pieces = 0;

    for (const row of board.board()) {
        for (const piece of row) {
            if (!piece) continue;
            pieces += 1;
            if (piece.type == "q") queens += 1;
            if (piece.type == "n" || piece.type == "b") nonPawnMaterial += 3;
            if (piece.type == "r") nonPawnMaterial += 5;
            if (piece.type == "q") nonPawnMaterial += 9;
        }
    }

    if (pieces <= 10 || (queens == 0 && nonPawnMaterial <= 16)) return "endgame";
    if (ply <= 20 || node.state.opening) return "opening";
    return "middlegame";
}

function formatMove(node: StateTreeNode, ply: number) {
    const san = node.state.move?.san || "—";
    const move = Math.ceil(ply / 2);
    return ply % 2 == 0
        ? `${move}...${san}`
        : `${move}.${san}`;
}

function GameConclusions({ onSelectNode }: { onSelectNode: (node: StateTreeNode) => void }) {
    const { i18n } = useTranslation();
    const analysisGame = useAnalysisGameStore(state => state.analysisGame);
    const boardFlipped = useAnalysisBoardStore(state => state.boardFlipped);
    const { profile } = useAuthedProfile();

    const result = useMemo(() => {
        const copy = copies[languageKey(i18n.language)];
        const chain = getNodeChain(analysisGame.stateTree).filter(node => node.state.move);
        if (!chain.length) return { copy, conclusions: [] as Array<{ title: string; body: string; meta: string; node: StateTreeNode; practice?: boolean }> };

        const whiteName = analysisGame.players.white.username?.toLowerCase();
        const blackName = analysisGame.players.black.username?.toLowerCase();
        const profileName = profile?.username?.toLowerCase();
        let focusColour: PieceColour | undefined;

        if (profileName && whiteName == profileName) focusColour = PieceColour.WHITE;
        else if (profileName && blackName == profileName) focusColour = PieceColour.BLACK;
        else focusColour = boardFlipped ? PieceColour.BLACK : PieceColour.WHITE;

        const indexed = chain.map((node, index) => ({
            node,
            ply: index + 1,
            loss: expectedPointsLoss(node),
            phase: getPhase(node, index + 1)
        }));

        const ownMoves = indexed.filter(item => item.node.state.moveColour == focusColour);
        const candidates = ownMoves.length ? ownMoves : indexed;
        const decisive = [...candidates].sort((a, b) => {
            const aScore = (a.loss ?? 0) * 10 + severity(a.node.state.classification);
            const bScore = (b.loss ?? 0) * 10 + severity(b.node.state.classification);
            return bScore - aScore;
        })[0];

        if (!decisive || ((decisive.loss ?? 0) == 0 && severity(decisive.node.state.classification) == 0)) {
            return { copy, conclusions: [] };
        }

        const serious = candidates.filter(item => severity(item.node.state.classification) >= 3);
        const tacticBuckets = new Map<string, { count: number; node: StateTreeNode; score: number }>();

        for (const item of serious) {
            const insight = getCoachTacticInsight(
                item.node,
                item.node.state.classification,
                i18n.language
            );
            if (!insight) continue;
            const current = tacticBuckets.get(insight.label);
            const score = severity(item.node.state.classification) + (item.loss ?? 0) * 10;
            tacticBuckets.set(insight.label, {
                count: (current?.count || 0) + 1,
                node: !current || score > current.score ? item.node : current.node,
                score: Math.max(score, current?.score || 0)
            });
        }

        const tactic = [...tacticBuckets.entries()].sort((a, b) => (
            b[1].count - a[1].count || b[1].score - a[1].score
        ))[0];

        const phaseCounts: Record<Phase, { count: number; node: StateTreeNode | null; score: number }> = {
            opening: { count: 0, node: null, score: 0 },
            middlegame: { count: 0, node: null, score: 0 },
            endgame: { count: 0, node: null, score: 0 }
        };

        for (const item of serious) {
            const bucket = phaseCounts[item.phase];
            bucket.count += 1;
            const score = severity(item.node.state.classification) + (item.loss ?? 0) * 10;
            if (!bucket.node || score > bucket.score) {
                bucket.node = item.node;
                bucket.score = score;
            }
        }

        const phaseEntry = (Object.entries(phaseCounts) as Array<[Phase, typeof phaseCounts[Phase]]>)
            .sort((a, b) => b[1].count - a[1].count || b[1].score - a[1].score)[0];

        const decisiveMove = formatMove(decisive.node, decisive.ply);
        const decisiveBody = decisive.loss != null && decisive.loss >= 0.01
            ? copy.moveTurned(decisiveMove, Math.round(decisive.loss * 100))
            : copy.moveWasKey(decisiveMove);

        const conclusions: Array<{ title: string; body: string; meta: string; node: StateTreeNode; practice?: boolean }> = [{
            title: copy.decisive,
            body: decisiveBody,
            meta: copy[decisive.phase],
            node: decisive.node
        }];

        if (tactic) {
            const [label, data] = tactic;
            const tacticItem = indexed.find(item => item.node == data.node) || decisive;
            conclusions.push({
                title: copy.pattern,
                body: data.count >= 2
                    ? copy.repeatedTactic(label, data.count)
                    : copy.singleTactic(label),
                meta: `${label} · ${copy[tacticItem.phase]}`,
                node: data.node
            });
            conclusions.push({
                title: copy.recommendation,
                body: copy.tacticAdvice(label),
                meta: label,
                node: data.node,
                practice: true
            });
        } else {
            const [phase, data] = phaseEntry;
            const patternNode = data.node || decisive.node;
            conclusions.push({
                title: copy.pattern,
                body: copy.phasePattern(copy[phase], Math.max(1, data.count)),
                meta: copy[phase],
                node: patternNode
            });
            conclusions.push({
                title: copy.recommendation,
                body: phase == "opening"
                    ? copy.openingAdvice
                    : phase == "endgame"
                        ? copy.endgameAdvice
                        : copy.middlegameAdvice,
                meta: copy[phase],
                node: patternNode,
                practice: phase != "opening"
            });
        }

        return { copy, conclusions };
    }, [analysisGame, boardFlipped, i18n.language, profile?.username]);

    return (
        <div className={styles.shell}>
            <header className={styles.heading}>
                <span className={styles.eyebrow}>{result.copy.title}</span>
                <p>{result.copy.subtitle}</p>
            </header>

            {result.conclusions.length == 0 ? (
                <div className={styles.empty}>{result.copy.noData}</div>
            ) : (
                <div className={styles.cards}>
                    {result.conclusions.map((item, index) => (
                        <article className={styles.card} key={`${item.title}-${index}`}>
                            <div className={styles.cardTopline}>
                                <span className={styles.cardTitle}>{item.title}</span>
                                <span className={styles.meta}>{item.meta}</span>
                            </div>
                            <p className={styles.body}>{item.body}</p>
                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={styles.positionButton}
                                    onClick={() => onSelectNode(item.node)}
                                >
                                    {result.copy.viewPosition}
                                    <span aria-hidden="true">→</span>
                                </button>
                                {item.practice && (
                                    <a
                                        className={styles.practiceLink}
                                        href={currentLanguageHref("/puzzles")}
                                    >
                                        {result.copy.practice}
                                    </a>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GameConclusions;
