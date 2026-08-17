import { Chess, Move, PieceSymbol } from "chess.js";

import { Classification } from "shared/constants/Classification";
import { getTopEngineLine } from "shared/types/game/position/EngineLine";
import type { StateTreeNode } from
    "shared/types/game/position/StateTreeNode";

import {
    CoachCommentColour,
    getCoachPieceName,
    getCoachSideName
} from "./coachCommentLocale";


type TacticKind = "fork" | "tactic" | "sacrifice" | "mate";

export interface CoachTacticInsight {
    startNode: StateTreeNode;
    uciMoves: string[];
    prefix: string;
    label: string;
    suffix: string;
    actionTitle: string;
}

interface AnalysedLine {
    uciMoves: string[];
    starter: CoachCommentColour;
    targetPiece?: PieceSymbol;
    targetIndex?: number;
    materialWon: number;
    materialLost: number;
    firstMove?: Move;
    firstMoveSacrificed: boolean;
    fork: boolean;
    matesForStarter: boolean;
}

interface TacticCopy {
    labels: Record<TacticKind, string>;
    showSequence: string;
    allowsMaterial: (side: string, piece: string) => string;
    missedMaterial: (piece: string) => string;
    allowsMate: (side: string) => string;
    missedMate: string;
}

const pieceValues: Record<PieceSymbol, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 100
};

const MAX_SEQUENCE_PLIES = 10;

const copies: Record<string, TacticCopy> = {
    en: {
        labels: {
            fork: "fork",
            tactic: "tactic",
            sacrifice: "sacrifice",
            mate: "mate"
        },
        showSequence: "Show the sequence on the board",
        allowsMaterial: (side, piece) =>
            `${side} can win ${piece} after this move: `,
        missedMaterial: piece =>
            `There was a chance to win ${piece}: `,
        allowsMate: side =>
            `${side} can force mate after this move: `,
        missedMate: "There was a forced mating sequence here: "
    },
    es: {
        labels: {
            fork: "tenedor",
            tactic: "táctica",
            sacrifice: "sacrificio",
            mate: "mate"
        },
        showSequence: "Mostrar la secuencia en el tablero",
        allowsMaterial: (side, piece) =>
            `${side} pueden ganar ${piece} después de este movimiento: `,
        missedMaterial: piece =>
            `Había una oportunidad de ganar ${piece}: `,
        allowsMate: side =>
            `${side} pueden forzar mate después de este movimiento: `,
        missedMate: "Aquí había una secuencia de mate forzado: "
    },
    fr: {
        labels: {
            fork: "fourchette",
            tactic: "tactique",
            sacrifice: "sacrifice",
            mate: "mat"
        },
        showSequence: "Afficher la séquence sur l’échiquier",
        allowsMaterial: (side, piece) =>
            `${side} peuvent gagner ${piece} après ce coup : `,
        missedMaterial: piece =>
            `Il y avait une occasion de gagner ${piece} : `,
        allowsMate: side =>
            `${side} peuvent forcer le mat après ce coup : `,
        missedMate: "Il y avait ici une séquence de mat forcé : "
    },
    de: {
        labels: {
            fork: "Gabel",
            tactic: "Taktik",
            sacrifice: "Opfer",
            mate: "Matt"
        },
        showSequence: "Variante auf dem Brett zeigen",
        allowsMaterial: (side, piece) =>
            `${side} kann nach diesem Zug ${piece} gewinnen: `,
        missedMaterial: piece =>
            `Hier gab es die Chance, ${piece} zu gewinnen: `,
        allowsMate: side =>
            `${side} kann nach diesem Zug Matt erzwingen: `,
        missedMate: "Hier gab es eine erzwungene Mattfolge: "
    },
    pt: {
        labels: {
            fork: "garfo",
            tactic: "tática",
            sacrifice: "sacrifício",
            mate: "mate"
        },
        showSequence: "Mostrar a sequência no tabuleiro",
        allowsMaterial: (side, piece) =>
            `${side} podem ganhar ${piece} depois deste lance: `,
        missedMaterial: piece =>
            `Havia uma oportunidade de ganhar ${piece}: `,
        allowsMate: side =>
            `${side} podem forçar mate depois deste lance: `,
        missedMate: "Havia aqui uma sequência de mate forçado: "
    },
    ru: {
        labels: {
            fork: "вилка",
            tactic: "тактика",
            sacrifice: "жертва",
            mate: "мат"
        },
        showSequence: "Показать вариант на доске",
        allowsMaterial: (side, piece) =>
            `${side} могут выиграть ${piece} после этого хода: `,
        missedMaterial: piece =>
            `Здесь была возможность выиграть ${piece}: `,
        allowsMate: side =>
            `${side} могут форсировать мат после этого хода: `,
        missedMate: "Здесь была форсированная матовая последовательность: "
    },
    zh: {
        labels: {
            fork: "双攻",
            tactic: "战术",
            sacrifice: "弃子",
            mate: "将杀"
        },
        showSequence: "在棋盘上演示变化",
        allowsMaterial: (side, piece) =>
            `这步棋后，${side}可以赢得${piece}：`,
        missedMaterial: piece =>
            `这里原本有机会赢得${piece}：`,
        allowsMate: side =>
            `这步棋后，${side}可以强制将杀：`,
        missedMate: "这里原本有一条强制将杀路线："
    },
    vi: {
        labels: {
            fork: "chĩa",
            tactic: "chiến thuật",
            sacrifice: "thí quân",
            mate: "chiếu hết"
        },
        showSequence: "Hiển thị chuỗi nước đi trên bàn cờ",
        allowsMaterial: (side, piece) =>
            `Sau nước đi này, ${side} có thể thắng ${piece}: `,
        missedMaterial: piece =>
            `Có cơ hội thắng ${piece} ở đây: `,
        allowsMate: side =>
            `Sau nước đi này, ${side} có thể ép chiếu hết: `,
        missedMate: "Có một chuỗi chiếu hết bắt buộc ở đây: "
    },
    hi: {
        labels: {
            fork: "फोर्क",
            tactic: "रणनीति",
            sacrifice: "बलिदान",
            mate: "मात"
        },
        showSequence: "चालों की श्रृंखला बोर्ड पर दिखाएँ",
        allowsMaterial: (side, piece) =>
            `इस चाल के बाद ${side} ${piece} जीत सकते हैं: `,
        missedMaterial: piece =>
            `यहाँ ${piece} जीतने का मौका था: `,
        allowsMate: side =>
            `इस चाल के बाद ${side} जबरन मात कर सकते हैं: `,
        missedMate: "यहाँ जबरन मात की एक श्रृंखला थी: "
    },
    mr: {
        labels: {
            fork: "फोर्क",
            tactic: "डावपेच",
            sacrifice: "बलिदान",
            mate: "मात"
        },
        showSequence: "चालींची मालिका पटावर दाखवा",
        allowsMaterial: (side, piece) =>
            `या चाली नंतर ${side} ${piece} जिंकू शकतात: `,
        missedMaterial: piece =>
            `इथे ${piece} जिंकण्याची संधी होती: `,
        allowsMate: side =>
            `या चाली नंतर ${side} सक्तीचा मात करू शकतात: `,
        missedMate: "इथे सक्तीच्या माताची मालिका होती: "
    },
    pl: {
        labels: {
            fork: "widełki",
            tactic: "taktyka",
            sacrifice: "ofiara",
            mate: "mat"
        },
        showSequence: "Pokaż wariant na szachownicy",
        allowsMaterial: (side, piece) =>
            `${side} mogą po tym ruchu wygrać ${piece}: `,
        missedMaterial: piece =>
            `Była tu szansa, aby wygrać ${piece}: `,
        allowsMate: side =>
            `${side} mogą po tym ruchu wymusić mata: `,
        missedMate: "Była tu wymuszona sekwencja matowa: "
    }
};

function normaliseLanguage(language?: string) {
    return language?.toLowerCase().replace("_", "-").split("-")[0] || "en";
}

function mateForColour(
    evaluation: { type: string; value: number },
    colour: CoachCommentColour
) {
    if (evaluation.type != "mate") return false;

    return (evaluation.value > 0) == (colour == "w");
}

function forceTurn(fen: string, colour: CoachCommentColour) {
    const parts = fen.split(" ");
    parts[1] = colour;
    parts[3] = "-";
    return parts.join(" ");
}

function firstMoveCreatesFork(
    fen: string,
    firstMove: Move | undefined,
    starter: CoachCommentColour
) {
    if (!firstMove) return false;

    try {
        const board = new Chess(fen);
        const move = board.move(firstMove.lan || firstMove.san);
        const attackerBoard = new Chess(forceTurn(board.fen(), starter));
        const captures = attackerBoard.moves({
            square: move.to,
            verbose: true
        }).filter(candidate => candidate.captured);
        const valuableTargets = captures.filter(candidate =>
            pieceValues[candidate.captured as PieceSymbol] >= 3
        ).length;
        const checkingTarget = /[+#]/.test(move.san) ? 1 : 0;

        return valuableTargets + checkingTarget >= 2;
    } catch {
        return false;
    }
}

function analyseLine(
    startNode: StateTreeNode,
    line: ReturnType<typeof getTopEngineLine>
): AnalysedLine | undefined {
    if (!line?.moves.length) return;

    const board = new Chess(startNode.state.fen);
    const starter = board.turn() as CoachCommentColour;
    const uciMoves: string[] = [];
    let materialWon = 0;
    let materialLost = 0;
    let targetPiece: PieceSymbol | undefined;
    let targetIndex: number | undefined;
    let firstMove: Move | undefined;
    let trackedSquare: string | undefined;
    let trackedPiece: PieceSymbol | undefined;
    let firstMoveSacrificed = false;

    for (
        let index = 0;
        index < Math.min(line.moves.length, MAX_SEQUENCE_PLIES);
        index += 1
    ) {
        let move: Move;

        try {
            move = board.move(line.moves[index].uci);
        } catch {
            break;
        }

        uciMoves.push(line.moves[index].uci);

        if (index == 0) {
            firstMove = move;
            trackedSquare = move.to;
            trackedPiece = move.piece as PieceSymbol;
        }

        if (move.captured) {
            const captured = move.captured as PieceSymbol;
            const value = pieceValues[captured] || 0;

            if (move.color == starter) {
                materialWon += value;

                if (
                    !targetPiece
                    || value > pieceValues[targetPiece]
                ) {
                    targetPiece = captured;
                    targetIndex = index;
                }
            } else {
                materialLost += value;
            }
        }

        if (
            index > 0
            && trackedSquare
            && trackedPiece
            && move.color != starter
            && move.to == trackedSquare
            && move.captured == trackedPiece
        ) {
            firstMoveSacrificed = true;
            trackedSquare = undefined;
            trackedPiece = undefined;
        } else if (
            trackedSquare
            && move.color == starter
            && move.from == trackedSquare
        ) {
            trackedSquare = move.to;
        }
    }

    if (uciMoves.length == 0) return;

    return {
        uciMoves,
        starter,
        targetPiece,
        targetIndex,
        materialWon,
        materialLost,
        firstMove,
        firstMoveSacrificed,
        fork: firstMoveCreatesFork(
            startNode.state.fen,
            firstMove,
            starter
        ),
        matesForStarter: mateForColour(line.evaluation, starter)
    };
}

function getKind(line: AnalysedLine): TacticKind {
    if (line.matesForStarter) return "mate";
    if (line.fork) return "fork";
    if (
        line.firstMoveSacrificed
        && line.materialWon > line.materialLost
    ) return "sacrifice";

    return "tactic";
}

function trimSequence(line: AnalysedLine) {
    if (line.matesForStarter) return line.uciMoves;

    const finalIndex = line.targetIndex ?? Math.min(line.uciMoves.length - 1, 5);
    return line.uciMoves.slice(0, finalIndex + 1);
}

export function getCoachTacticInsight(
    node: StateTreeNode,
    classification: Classification | undefined,
    language?: string
): CoachTacticInsight | undefined {
    if (!node.parent || !node.state.move) return;

    if (
        classification != Classification.MISTAKE
        && classification != Classification.BLUNDER
        && classification != Classification.MISS
    ) return;

    const missedOpportunity = classification == Classification.MISS;
    const startNode = missedOpportunity ? node.parent : node;
    const line = getTopEngineLine(startNode.state.engineLines);
    const analysed = analyseLine(startNode, line);

    if (!analysed) return;

    const netMaterial = analysed.materialWon - analysed.materialLost;
    const hasMaterialTactic = Boolean(
        analysed.targetPiece
        && netMaterial >= 0.75
    );

    if (!analysed.matesForStarter && !hasMaterialTactic) return;

    const languageKey = normaliseLanguage(language);
    const copy = copies[languageKey] || copies.en;
    const kind = getKind(analysed);
    const side = getCoachSideName(language, analysed.starter);
    const piece = analysed.targetPiece
        ? getCoachPieceName(language, analysed.targetPiece)
        : "";

    const prefix = analysed.matesForStarter
        ? (
            missedOpportunity
                ? copy.missedMate
                : copy.allowsMate(side)
        )
        : (
            missedOpportunity
                ? copy.missedMaterial(piece)
                : copy.allowsMaterial(side, piece)
        );

    return {
        startNode,
        uciMoves: trimSequence(analysed),
        prefix,
        label: copy.labels[kind],
        suffix: ".",
        actionTitle: copy.showSequence
    };
}
