import type { TFunction } from "i18next";
import { Chess, Move } from "chess.js";

import { Classification } from "shared/constants/Classification";
import type { EngineLine } from "shared/types/game/position/EngineLine";
import { getTopEngineLine } from "shared/types/game/position/EngineLine";
import type {
    StateTreeNode
} from "shared/types/game/position/StateTreeNode";

import type { CoachId } from "./coach";
import { getDynamicCoachComment } from "./coachComment";
import {
    CoachCommentColour,
    formatCoachDetail,
    formatCoachFeature,
    getCoachPieceName,
    getCoachSideName
} from "./coachCommentLocale";

const pieceValues: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 100
};

const COMMENT_LIMIT = 520;
const MAX_LINE_PLIES = 12;
const MAX_VISIBLE_LINE_MOVES = 6;

interface LineInsight {
    moves: Move[];
    sanMoves: string[];
    materialWon: number;
    materialLost: number;
    targetPiece?: string;
    targetIndex?: number;
    lostPiece?: string;
    lostIndex?: number;
    sacrificedPiece?: string;
    mateForMover?: number;
}

interface DetailedMoveContext {
    playedSan?: string;
    playedMove?: Move;
    moverColour?: CoachCommentColour;
    bestSan?: string;
    bestMove?: Move;
    replySan?: string;
    evaluationLoss?: number;
    mateAllowed?: number;
    afterEvaluation?: number;
    bestLine?: LineInsight;
    afterLine?: LineInsight;
}

interface DetailResult {
    text: string;
    standalone?: boolean;
}

function sentence(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) return "";
    if (/[.!?。！？]$/.test(trimmed)) return trimmed;

    return `${trimmed}.`;
}

function fitComment(...parts: Array<string | undefined>): string {
    const sentences = parts
        .filter((part): part is string => Boolean(part?.trim()))
        .map(sentence);
    const full = sentences.join(" ");

    if (full.length <= COMMENT_LIMIT) return full;

    for (let count = sentences.length - 1; count > 0; count -= 1) {
        const shorter = sentences.slice(0, count).join(" ");
        if (shorter.length <= COMMENT_LIMIT) return shorter;
    }

    const available = full.slice(0, COMMENT_LIMIT - 1).trimEnd();
    const lastSpace = available.lastIndexOf(" ");
    const clipped = lastSpace > 80
        ? available.slice(0, lastSpace)
        : available;

    return `${clipped}…`;
}

function moveFromPosition(
    fen: string,
    notation: string | undefined
): Move | undefined {
    if (!notation) return;

    try {
        return new Chess(fen).move(notation);
    } catch {
        return;
    }
}

function evaluationForMover(
    evaluation: {
        type: string;
        value: number;
    } | undefined,
    moverColour: CoachCommentColour
): number | undefined {
    if (!evaluation || evaluation.type != "centipawn") return;

    const whiteValue = evaluation.value / 100;
    return moverColour == "w" ? whiteValue : -whiteValue;
}

function mateForMover(
    line: EngineLine | undefined,
    moverColour: CoachCommentColour
): number | undefined {
    if (!line || line.evaluation.type != "mate") return;

    const mateForWhite = line.evaluation.value > 0;
    if (mateForWhite != (moverColour == "w")) return;

    return Math.abs(line.evaluation.value);
}

function analyseLine(
    fen: string,
    line: EngineLine | undefined,
    moverColour: CoachCommentColour
): LineInsight | undefined {
    if (!line?.moves.length) return;

    const board = new Chess(fen);
    const moves: Move[] = [];
    let materialWon = 0;
    let materialLost = 0;
    let targetPiece: string | undefined;
    let targetIndex: number | undefined;
    let lostPiece: string | undefined;
    let lostIndex: number | undefined;
    let trackedSquare: string | undefined;
    let trackedPiece: string | undefined;
    let sacrificedPiece: string | undefined;

    for (
        let index = 0;
        index < Math.min(line.moves.length, MAX_LINE_PLIES);
        index += 1
    ) {
        let move: Move;

        try {
            move = board.move(line.moves[index].uci);
        } catch {
            break;
        }

        moves.push(move);

        if (move.captured) {
            const value = pieceValues[move.captured] || 0;

            if (move.color == moverColour) {
                materialWon += value;

                if (
                    !targetPiece
                    || value > (pieceValues[targetPiece] || 0)
                ) {
                    targetPiece = move.captured;
                    targetIndex = index;
                }
            } else {
                materialLost += value;

                if (
                    !lostPiece
                    || value > (pieceValues[lostPiece] || 0)
                ) {
                    lostPiece = move.captured;
                    lostIndex = index;
                }
            }
        }

        if (index == 0 && move.color == moverColour) {
            trackedSquare = move.to;
            trackedPiece = move.piece;
            continue;
        }

        if (
            trackedSquare
            && trackedPiece
            && move.color != moverColour
            && move.to == trackedSquare
            && move.captured == trackedPiece
        ) {
            sacrificedPiece = trackedPiece;
            trackedSquare = undefined;
            trackedPiece = undefined;
            continue;
        }

        if (
            trackedSquare
            && move.color == moverColour
            && move.from == trackedSquare
        ) {
            trackedSquare = move.to;
        }
    }

    if (moves.length == 0) return;

    return {
        moves,
        sanMoves: moves.map(move => move.san),
        materialWon,
        materialLost,
        targetPiece,
        targetIndex,
        lostPiece,
        lostIndex,
        sacrificedPiece,
        mateForMover: mateForMover(line, moverColour)
    };
}

function getPlayedMove(node: StateTreeNode): Move | undefined {
    if (!node.parent || !node.state.move) return;

    return moveFromPosition(
        node.parent.state.fen,
        node.state.move.uci || node.state.move.san
    );
}

function getEvaluationLoss(
    beforeLine: EngineLine | undefined,
    afterLine: EngineLine | undefined,
    moverColour: CoachCommentColour
): number | undefined {
    const before = evaluationForMover(beforeLine?.evaluation, moverColour);
    const after = evaluationForMover(afterLine?.evaluation, moverColour);

    if (before == undefined || after == undefined) return;

    return Math.max(0, before - after);
}

function getAllowedMate(
    afterLine: EngineLine | undefined,
    moverColour: CoachCommentColour
): number | undefined {
    if (!afterLine || afterLine.evaluation.type != "mate") return;

    const mateForWhite = afterLine.evaluation.value > 0;
    if (mateForWhite == (moverColour == "w")) return;

    return Math.abs(afterLine.evaluation.value);
}

function createContext(node: StateTreeNode): DetailedMoveContext {
    const playedMove = getPlayedMove(node);
    const moverColour = playedMove?.color as CoachCommentColour | undefined;
    const playedSan = playedMove?.san || node.state.move?.san;

    if (!node.parent || !playedMove || !moverColour) {
        return {
            playedSan,
            playedMove,
            moverColour
        };
    }

    const beforeLine = getTopEngineLine(node.parent.state.engineLines);
    const afterLine = getTopEngineLine(node.state.engineLines);
    const bestMove = moveFromPosition(
        node.parent.state.fen,
        beforeLine?.moves.at(0)?.uci
    );
    const replyMove = moveFromPosition(
        node.state.fen,
        afterLine?.moves.at(0)?.uci
    );

    return {
        playedSan,
        playedMove,
        moverColour,
        bestSan: bestMove?.san,
        bestMove,
        replySan: replyMove?.san,
        evaluationLoss: getEvaluationLoss(
            beforeLine,
            afterLine,
            moverColour
        ),
        mateAllowed: getAllowedMate(afterLine, moverColour),
        afterEvaluation: evaluationForMover(
            afterLine?.evaluation,
            moverColour
        ),
        bestLine: analyseLine(
            node.parent.state.fen,
            beforeLine,
            moverColour
        ),
        afterLine: analyseLine(
            node.state.fen,
            afterLine,
            moverColour
        )
    };
}

function decisiveWonPiece(line: LineInsight | undefined): string | undefined {
    if (!line?.targetPiece) return;

    const targetValue = pieceValues[line.targetPiece] || 0;
    const net = line.materialWon - line.materialLost;

    if (net >= 0.75) return line.targetPiece;
    if (targetValue >= 5 && targetValue > line.materialLost) {
        return line.targetPiece;
    }

    return;
}

function decisiveLostPiece(line: LineInsight | undefined): string | undefined {
    if (!line?.lostPiece) return;

    const lostValue = pieceValues[line.lostPiece] || 0;
    const net = line.materialLost - line.materialWon;

    if (net >= 0.75) return line.lostPiece;
    if (lostValue >= 5 && lostValue > line.materialWon) {
        return line.lostPiece;
    }

    return;
}

function formatLine(
    line: LineInsight,
    decisiveIndex: number | undefined,
    skipFirst: boolean = false
): string {
    const start = skipFirst ? 1 : 0;
    const finalIndex = decisiveIndex ?? Math.min(
        line.sanMoves.length - 1,
        start + MAX_VISIBLE_LINE_MOVES - 1
    );

    if (finalIndex < start) {
        return line.sanMoves[0] || "";
    }

    const visibleCount = finalIndex - start + 1;

    if (visibleCount <= MAX_VISIBLE_LINE_MOVES) {
        return line.sanMoves.slice(start, finalIndex + 1).join(" ");
    }

    return [
        ...line.sanMoves.slice(start, start + MAX_VISIBLE_LINE_MOVES - 2),
        "…",
        line.sanMoves[finalIndex]
    ].join(" ");
}

function isDevelopmentMove(move: Move | undefined): boolean {
    if (!move || (move.piece != "n" && move.piece != "b")) return false;

    return new Set([
        "b1", "g1", "c1", "f1",
        "b8", "g8", "c8", "f8"
    ]).has(move.from);
}

function describeFeature(
    move: Move | undefined,
    language: string | undefined
): string | undefined {
    if (!move || move.san.includes("#")) return;

    if (move.san.includes("+")) {
        return formatCoachFeature(language, "check");
    }

    if (move.promotion) {
        return formatCoachFeature(language, "promotion", {
            piece: getCoachPieceName(language, move.promotion)
        });
    }

    if (move.san == "O-O") {
        return formatCoachFeature(language, "castleKingside");
    }

    if (move.san == "O-O-O") {
        return formatCoachFeature(language, "castleQueenside");
    }

    if (move.captured) {
        return formatCoachFeature(language, "capture", {
            piece: getCoachPieceName(language, move.captured)
        });
    }

    if (isDevelopmentMove(move)) {
        return formatCoachFeature(language, "develop", {
            piece: getCoachPieceName(language, move.piece)
        });
    }

    if (
        move.piece == "p"
        && ["d4", "e4", "d5", "e5"].includes(move.to)
    ) {
        return formatCoachFeature(language, "centre");
    }

    return;
}

function positiveDetail(
    context: DetailedMoveContext,
    language: string | undefined
): DetailResult | undefined {
    if (!context.playedSan || !context.moverColour) return;

    const line = context.bestSan == context.playedSan
        ? context.bestLine
        : context.afterLine;

    if (line?.mateForMover != undefined) {
        return {
            text: formatCoachDetail(language, "moveForcesMate", {
                move: context.playedSan,
                mate: line.mateForMover
            })
        };
    }

    const target = decisiveWonPiece(line);

    if (line && target) {
        const targetName = getCoachPieceName(language, target);
        const targetIndex = line.targetIndex;
        const lineStartsWithMove = line.sanMoves[0] == context.playedSan;

        if (
            line.sacrificedPiece
            && line.materialWon > line.materialLost
        ) {
            const continuation = formatLine(
                line,
                targetIndex,
                lineStartsWithMove
            );

            return {
                standalone: true,
                text: formatCoachDetail(language, "sacrificeWinsPiece", {
                    side: getCoachSideName(
                        language,
                        context.moverColour
                    ),
                    move: context.playedSan,
                    line: continuation || context.playedSan,
                    sacrifice: getCoachPieceName(
                        language,
                        line.sacrificedPiece
                    ),
                    piece: targetName
                })
            };
        }

        if (targetIndex == 0 && lineStartsWithMove) {
            return {
                text: formatCoachDetail(language, "directWinsPiece", {
                    move: context.playedSan,
                    piece: targetName
                })
            };
        }

        return {
            text: formatCoachDetail(language, "lineWinsPiece", {
                line: formatLine(line, targetIndex, lineStartsWithMove),
                piece: targetName
            })
        };
    }

    const feature = describeFeature(context.playedMove, language);

    if (feature) {
        return {
            text: formatCoachDetail(language, "moveFeature", {
                feature
            })
        };
    }

    if ((context.afterEvaluation || 0) >= 1.25) {
        return {
            text: formatCoachDetail(language, "keepsAdvantage")
        };
    }

    if ((context.afterEvaluation || 0) <= -1.25) {
        return {
            text: formatCoachDetail(language, "limitsDamage")
        };
    }

    if (context.afterEvaluation != undefined) {
        return {
            text: formatCoachDetail(language, "keepsBalance")
        };
    }

    if (context.replySan) {
        return {
            text: formatCoachDetail(language, "forcesReply", {
                reply: context.replySan
            })
        };
    }

    return;
}

function bestAlternativeDetail(
    context: DetailedMoveContext,
    language: string | undefined,
    avoidsTactic: boolean = false
): string | undefined {
    if (!context.bestSan || context.bestSan == context.playedSan) return;

    const line = context.bestLine;

    if (line?.mateForMover != undefined) {
        return formatCoachDetail(language, "bestForcesMate", {
            best: context.bestSan,
            mate: line.mateForMover
        });
    }

    const target = decisiveWonPiece(line);

    if (line && target) {
        if (line.targetIndex == 0) {
            return formatCoachDetail(language, "directWinsPiece", {
                move: context.bestSan,
                piece: getCoachPieceName(language, target)
            });
        }

        return formatCoachDetail(language, "bestLineWinsPiece", {
            best: context.bestSan,
            line: formatLine(line, line.targetIndex, true),
            piece: getCoachPieceName(language, target)
        });
    }

    const feature = describeFeature(context.bestMove, language);

    if (feature) {
        return formatCoachDetail(language, "bestFeature", {
            best: context.bestSan,
            feature
        });
    }

    return formatCoachDetail(
        language,
        avoidsTactic ? "bestAvoidsTactic" : "alternativeKeepsPosition",
        { best: context.bestSan }
    );
}

function missedOpportunityDetail(
    context: DetailedMoveContext,
    language: string | undefined
): string | undefined {
    return bestAlternativeDetail(context, language);
}

function negativeDetail(
    context: DetailedMoveContext,
    language: string | undefined
): string | undefined {
    const alternative = bestAlternativeDetail(context, language, true);

    if (context.mateAllowed != undefined) {
        return fitComment(
            context.bestSan
                ? formatCoachDetail(language, "bestAvoidsTactic", {
                    best: context.bestSan
                })
                : undefined,
            context.bestSan
                ? undefined
                : formatCoachDetail(language, "limitsDamage")
        );
    }

    const lostPiece = decisiveLostPiece(context.afterLine);

    if (context.afterLine && lostPiece) {
        return fitComment(
            formatCoachDetail(language, "lineLosesPiece", {
                line: formatLine(
                    context.afterLine,
                    context.afterLine.lostIndex
                ),
                piece: getCoachPieceName(language, lostPiece)
            }),
            alternative
        );
    }

    if (alternative) return alternative;

    if (
        context.evaluationLoss != undefined
        && context.evaluationLoss >= 0.75
    ) {
        return formatCoachDetail(language, "limitsDamage");
    }

    return;
}

function classificationPrimary(
    context: DetailedMoveContext,
    classification: Classification,
    t: TFunction
): string {
    return t(`dynamic.classifications.${classification}`, {
        move: context.playedSan || ""
    });
}

export function getDetailedCoachComment(
    node: StateTreeNode,
    classification: Classification | undefined,
    coachId: CoachId,
    t: TFunction,
    language?: string
): string {
    if (
        !classification
        || classification == Classification.THEORY
    ) {
        return getDynamicCoachComment(
            node,
            classification,
            coachId,
            t
        );
    }

    const context = createContext(node);

    if (!context.playedSan) {
        return getDynamicCoachComment(
            node,
            classification,
            coachId,
            t
        );
    }

    const primary = classificationPrimary(context, classification, t);

    if (classification == Classification.FORCED) {
        return fitComment(primary);
    }

    if (classification == Classification.MISS) {
        return fitComment(
            primary,
            missedOpportunityDetail(context, language)
        );
    }

    if (
        classification == Classification.INACCURACY
        || classification == Classification.MISTAKE
        || classification == Classification.BLUNDER
        || classification == Classification.RISKY
    ) {
        if (context.mateAllowed != undefined) {
            return fitComment(
                primary,
                t("dynamic.mateAllowed", {
                    mate: context.mateAllowed
                }),
                bestAlternativeDetail(context, language, true)
            );
        }

        return fitComment(
            primary,
            negativeDetail(context, language)
        );
    }

    const detail = positiveDetail(context, language);

    if (
        classification == Classification.BRILLIANT
        && detail?.standalone
    ) {
        return fitComment(detail.text);
    }

    return fitComment(primary, detail?.text);
}
