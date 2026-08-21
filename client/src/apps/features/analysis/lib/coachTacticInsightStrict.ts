import { Chess, Move, PieceSymbol } from "chess.js";

import { Classification } from "shared/constants/Classification";
import { getTopEngineLine } from "shared/types/game/position/EngineLine";
import type { StateTreeNode } from
    "shared/types/game/position/StateTreeNode";

import {
    getCoachTacticInsight as getLegacyCoachTacticInsight
} from "./coachTacticInsight";
import type {
    CoachTacticInsight
} from "./coachTacticInsight";


type CoachCommentColour = "w" | "b";
type TacticKind = "fork" | "tactic" | "sacrifice" | "mate";

interface ParsedTacticalLine {
    starter: CoachCommentColour;
    moves: Move[];
    firstMoveCapturedValue: number;
    firstMovePieceValue: number;
    firstMoveLostIndex?: number;
    delayedTargetIndex?: number;
    delayedTargetValue: number;
    materialWon: number;
    materialLost: number;
    fork: boolean;
    forcedMate: boolean;
    forcingPlies: number;
    longestQuietRun: number;
}

interface TacticCopy {
    labels: Record<TacticKind, string>;
    strongMovePrefix: string;
    showSequence: string;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 100
};

/*
 * Coach buttons are teaching aids, not engine-PV viewers. Keep material
 * combinations short enough to be recognisable over the board, while still
 * allowing a little more room for a genuinely forced mate.
 */
const MAX_HUMAN_TACTIC_PLIES = 6;
const MAX_HUMAN_MATE_PLIES = 8;

const STRONG_CLASSIFICATIONS = new Set<Classification>([
    Classification.BRILLIANT,
    Classification.CRITICAL,
    Classification.BEST,
    Classification.EXCELLENT
]);

const COPIES: Record<string, TacticCopy> = {
    en: {
        labels: { fork: "fork", tactic: "tactic", sacrifice: "sacrifice", mate: "mate" },
        strongMovePrefix: "This move has a concrete idea:",
        showSequence: "Show the sequence on the board"
    },
    es: {
        labels: { fork: "tenedor", tactic: "táctica", sacrifice: "sacrificio", mate: "mate" },
        strongMovePrefix: "Esta jugada tiene una idea concreta:",
        showSequence: "Mostrar la secuencia en el tablero"
    },
    fr: {
        labels: { fork: "fourchette", tactic: "tactique", sacrifice: "sacrifice", mate: "mat" },
        strongMovePrefix: "Ce coup a une idée concrète :",
        showSequence: "Afficher la séquence sur l’échiquier"
    },
    de: {
        labels: { fork: "Gabel", tactic: "Taktik", sacrifice: "Opfer", mate: "Matt" },
        strongMovePrefix: "Dieser Zug hat eine konkrete Idee:",
        showSequence: "Variante auf dem Brett zeigen"
    },
    pt: {
        labels: { fork: "garfo", tactic: "tática", sacrifice: "sacrifício", mate: "mate" },
        strongMovePrefix: "Este lance tem uma ideia concreta:",
        showSequence: "Mostrar a sequência no tabuleiro"
    },
    ru: {
        labels: { fork: "вилка", tactic: "тактика", sacrifice: "жертва", mate: "мат" },
        strongMovePrefix: "У этого хода есть конкретная идея:",
        showSequence: "Показать вариант на доске"
    },
    zh: {
        labels: { fork: "双攻", tactic: "战术", sacrifice: "弃子", mate: "将杀" },
        strongMovePrefix: "这步棋有一个明确的战术意图：",
        showSequence: "在棋盘上演示变化"
    },
    vi: {
        labels: { fork: "chĩa", tactic: "chiến thuật", sacrifice: "thí quân", mate: "chiếu hết" },
        strongMovePrefix: "Nước đi này có một ý tưởng cụ thể:",
        showSequence: "Hiển thị chuỗi nước đi trên bàn cờ"
    },
    hi: {
        labels: { fork: "फोर्क", tactic: "रणनीति", sacrifice: "बलिदान", mate: "मात" },
        strongMovePrefix: "इस चाल के पीछे एक स्पष्ट विचार है:",
        showSequence: "चालों की श्रृंखला बोर्ड पर दिखाएँ"
    },
    mr: {
        labels: { fork: "फोर्क", tactic: "डावपेच", sacrifice: "बलिदान", mate: "मात" },
        strongMovePrefix: "या चालीमागे एक स्पष्ट कल्पना आहे:",
        showSequence: "चालींची मालिका पटावर दाखवा"
    },
    pl: {
        labels: { fork: "widełki", tactic: "taktyka", sacrifice: "ofiara", mate: "mat" },
        strongMovePrefix: "Ten ruch ma konkretny pomysł:",
        showSequence: "Pokaż wariant na szachownicy"
    }
};

function normaliseLanguage(language?: string) {
    return language?.toLowerCase().replace("_", "-").split("-")[0] || "en";
}

function getCopy(language?: string): TacticCopy {
    return COPIES[normaliseLanguage(language)] || COPIES.en;
}

function pieceValue(piece: PieceSymbol | undefined): number {
    return piece ? PIECE_VALUES[piece] || 0 : 0;
}

function forceTurn(fen: string, colour: CoachCommentColour) {
    const parts = fen.split(" ");
    parts[1] = colour;
    parts[3] = "-";
    return parts.join(" ");
}

function moveCreatesFork(
    fen: string,
    firstMove: Move,
    starter: CoachCommentColour
): boolean {
    try {
        const board = new Chess(fen);
        const played = board.move(firstMove.lan || firstMove.san);
        const attackerBoard = new Chess(forceTurn(board.fen(), starter));
        const captures = attackerBoard.moves({
            square: played.to,
            verbose: true
        }) as Move[];
        const valuableTargets = captures.filter(move =>
            pieceValue(move.captured as PieceSymbol | undefined) >= 3
        ).length;
        const checkingTarget = /[+#]/.test(played.san) ? 1 : 0;

        return valuableTargets + checkingTarget >= 2;
    } catch {
        return false;
    }
}

function evaluationMatesForColour(
    evaluation: { type: string; value: number } | undefined,
    colour: CoachCommentColour
): boolean {
    if (!evaluation || evaluation.type != "mate") return false;

    const mateForWhite = evaluation.value > 0;
    return mateForWhite == (colour == "w");
}

function lineForcesMate(
    startFen: string,
    evaluation: { type: string; value: number } | undefined
): boolean {
    return evaluationMatesForColour(
        evaluation,
        new Chess(startFen).turn() as CoachCommentColour
    );
}

function playedUci(node: StateTreeNode): string | undefined {
    if (node.state.move?.uci) return node.state.move.uci;
    if (!node.parent || !node.state.move?.san) return;

    try {
        return new Chess(node.parent.state.fen).move(node.state.move.san).lan;
    } catch {
        return;
    }
}

function strongMoveCandidate(
    node: StateTreeNode,
    classification: Classification | undefined,
    language?: string
): CoachTacticInsight | undefined {
    if (
        !classification
        || !STRONG_CLASSIFICATIONS.has(classification)
        || !node.parent
    ) return;

    const firstUci = playedUci(node);
    if (!firstUci) return;

    const continuation = getTopEngineLine(node.state.engineLines);
    if (!continuation?.moves.length) return;

    const mover = new Chess(node.parent.state.fen).turn() as CoachCommentColour;
    const isMate = evaluationMatesForColour(
        continuation.evaluation,
        mover
    );
    const maxPlies = isMate
        ? MAX_HUMAN_MATE_PLIES
        : MAX_HUMAN_TACTIC_PLIES;
    const uciMoves = [
        firstUci,
        ...continuation.moves
            .slice(0, Math.max(0, maxPlies - 1))
            .map(move => move.uci)
    ];
    const copy = getCopy(language);

    return {
        startNode: node.parent,
        uciMoves,
        prefix: copy.strongMovePrefix,
        label: copy.labels.tactic,
        suffix: ".",
        actionTitle: copy.showSequence
    };
}

function parseLine(insight: CoachTacticInsight): ParsedTacticalLine | undefined {
    const board = new Chess(insight.startNode.state.fen);
    const starter = board.turn() as CoachCommentColour;
    const moves: Move[] = [];
    let firstMovePieceValue = 0;
    let firstMoveCapturedValue = 0;
    let firstMoveLostIndex: number | undefined;
    let trackedSquare: string | undefined;
    let trackedPiece: PieceSymbol | undefined;
    let materialWon = 0;
    let materialLost = 0;
    let delayedTargetIndex: number | undefined;
    let delayedTargetValue = 0;
    let forcingPlies = 0;
    let quietRun = 0;
    let longestQuietRun = 0;

    for (let index = 0; index < insight.uciMoves.length; index += 1) {
        let move: Move;

        try {
            move = board.move(insight.uciMoves[index]);
        } catch {
            return;
        }

        moves.push(move);

        const capturedValue = pieceValue(
            move.captured as PieceSymbol | undefined
        );

        if (move.captured || move.promotion || /[+#]/.test(move.san)) {
            forcingPlies += 1;
            quietRun = 0;
        } else {
            quietRun += 1;
            longestQuietRun = Math.max(longestQuietRun, quietRun);
        }

        if (index == 0) {
            trackedSquare = move.to;
            trackedPiece = move.piece as PieceSymbol;
            firstMovePieceValue = pieceValue(trackedPiece);
            firstMoveCapturedValue = capturedValue;
        }

        if (move.captured) {
            if (move.color == starter) {
                materialWon += capturedValue;

                if (index > 0 && capturedValue > delayedTargetValue) {
                    delayedTargetIndex = index;
                    delayedTargetValue = capturedValue;
                }
            } else {
                materialLost += capturedValue;
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
            firstMoveLostIndex = index;
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

    const topLine = getTopEngineLine(insight.startNode.state.engineLines);

    if (moves.length == 0) return;

    return {
        starter,
        moves,
        firstMoveCapturedValue,
        firstMovePieceValue,
        firstMoveLostIndex,
        delayedTargetIndex,
        delayedTargetValue,
        materialWon,
        materialLost,
        fork: moveCreatesFork(
            insight.startNode.state.fen,
            moves[0],
            starter
        ),
        forcedMate: lineForcesMate(
            insight.startNode.state.fen,
            topLine?.evaluation
        ) || board.isCheckmate(),
        forcingPlies,
        longestQuietRun
    };
}

function isRealSacrifice(line: ParsedTacticalLine): boolean {
    if (line.firstMoveLostIndex == undefined) return false;

    /*
     * Capturing a queen with a bishop and then losing that bishop is a
     * favourable exchange, not a sacrifice. A sacrifice must actually put
     * more value at risk than the first move immediately takes back.
     */
    const realInvestment =
        line.firstMovePieceValue > line.firstMoveCapturedValue;
    const concreteCompensation =
        line.forcedMate
        || line.materialWon - line.materialLost >= 1;

    return realInvestment
        && concreteCompensation
        && line.firstMoveLostIndex <= 4;
}

function classifyHumanTactic(
    line: ParsedTacticalLine,
    classification: Classification | undefined
): TacticKind | undefined {
    const plies = line.moves.length;
    const netMaterial = line.materialWon - line.materialLost;
    const firstMove = line.moves[0];
    const firstMoveForcing = Boolean(
        firstMove.captured
        || firstMove.promotion
        || /[+#]/.test(firstMove.san)
    );

    if (line.forcedMate) {
        return plies <= MAX_HUMAN_MATE_PLIES ? "mate" : undefined;
    }

    if (plies > MAX_HUMAN_TACTIC_PLIES || line.longestQuietRun > 2) {
        return;
    }

    if (
        line.fork
        && line.delayedTargetValue >= 3
        && netMaterial >= 1
        && (line.delayedTargetIndex ?? 99) <= 4
    ) {
        return "fork";
    }

    if (isRealSacrifice(line)) {
        return "sacrifice";
    }

    /*
     * Generic "tactic" is deliberately not a catch-all. The gain has to
     * happen after the first move, be material enough to matter, and the PV
     * must stay concrete. A piece that is already hanging is simply a direct
     * capture and must not become a tactical button.
     */
    const concreteDelayedGain =
        line.delayedTargetValue >= 3
        && (line.delayedTargetIndex ?? 99) <= 4
        && netMaterial >= 2;
    const forcingEnough =
        line.forcingPlies >= 2
        && (firstMoveForcing || line.forcingPlies >= 3);

    if (!concreteDelayedGain || !forcingEnough) return;

    /*
     * Misses get the strictest filter. If the first move itself is quiet and
     * there is no named motif, a deep engine continuation is not presented as
     * a human tactical omission.
     */
    if (
        classification == Classification.MISS
        && !firstMoveForcing
    ) return;

    return "tactic";
}

export function getStrictCoachTacticInsight(
    node: StateTreeNode,
    classification: Classification | undefined,
    language?: string
): CoachTacticInsight | undefined {
    const candidate = strongMoveCandidate(
        node,
        classification,
        language
    ) || getLegacyCoachTacticInsight(
        node,
        classification,
        language
    );

    if (!candidate) return;

    const parsed = parseLine(candidate);
    if (!parsed) return;

    const kind = classifyHumanTactic(parsed, classification);
    if (!kind) return;

    return {
        ...candidate,
        label: getCopy(language).labels[kind]
    };
}
