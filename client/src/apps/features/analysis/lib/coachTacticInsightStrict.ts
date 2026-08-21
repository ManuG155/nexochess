import { Chess, Move, PieceSymbol } from "chess.js";

import { Classification } from "shared/constants/Classification";
import { getTopEngineLine } from "shared/types/game/position/EngineLine";

import {
    CoachTacticInsight,
    getCoachTacticInsight as getLegacyCoachTacticInsight
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

const LABELS: Record<string, Record<TacticKind, string>> = {
    en: { fork: "fork", tactic: "tactic", sacrifice: "sacrifice", mate: "mate" },
    es: { fork: "tenedor", tactic: "táctica", sacrifice: "sacrificio", mate: "mate" },
    fr: { fork: "fourchette", tactic: "tactique", sacrifice: "sacrifice", mate: "mat" },
    de: { fork: "Gabel", tactic: "Taktik", sacrifice: "Opfer", mate: "Matt" },
    pt: { fork: "garfo", tactic: "tática", sacrifice: "sacrifício", mate: "mate" },
    ru: { fork: "вилка", tactic: "тактика", sacrifice: "жертва", mate: "мат" },
    zh: { fork: "双攻", tactic: "战术", sacrifice: "弃子", mate: "将杀" },
    vi: { fork: "chĩa", tactic: "chiến thuật", sacrifice: "thí quân", mate: "chiếu hết" },
    hi: { fork: "फोर्क", tactic: "रणनीति", sacrifice: "बलिदान", mate: "मात" },
    mr: { fork: "फोर्क", tactic: "डावपेच", sacrifice: "बलिदान", mate: "मात" },
    pl: { fork: "widełki", tactic: "taktyka", sacrifice: "ofiara", mate: "mat" }
};

function normaliseLanguage(language?: string) {
    return language?.toLowerCase().replace("_", "-").split("-")[0] || "en";
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

function lineForcesMate(
    startFen: string,
    evaluation: { type: string; value: number } | undefined
): boolean {
    if (!evaluation || evaluation.type != "mate") return false;

    const starter = new Chess(startFen).turn();
    const mateForWhite = evaluation.value > 0;
    return mateForWhite == (starter == "w");
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
        ),
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
    node: Parameters<typeof getLegacyCoachTacticInsight>[0],
    classification: Classification | undefined,
    language?: string
): CoachTacticInsight | undefined {
    const legacy = getLegacyCoachTacticInsight(
        node,
        classification,
        language
    );

    if (!legacy) return;

    const parsed = parseLine(legacy);
    if (!parsed) return;

    const kind = classifyHumanTactic(parsed, classification);
    if (!kind) return;

    const languageKey = normaliseLanguage(language);
    const labels = LABELS[languageKey] || LABELS.en;

    return {
        ...legacy,
        label: labels[kind]
    };
}
