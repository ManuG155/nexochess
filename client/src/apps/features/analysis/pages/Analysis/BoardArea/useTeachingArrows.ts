import { useMemo } from "react";
import { Chess, Move, PieceSymbol, Square } from "chess.js";

import { Classification } from "shared/constants/Classification";
import PieceColour from "shared/constants/PieceColour";
import {
    parseUciMove,
    setFenTurn
} from "shared/lib/utils/chess";
import { getTopEngineLine } from
    "shared/types/game/position/EngineLine";
import type { StateTreeNode } from
    "shared/types/game/position/StateTreeNode";

import SuggestionArrow from "@analysis/components/Board/SuggestionArrow";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";

const TEACHING_ARROW_COLOUR = "#f2a516";
const CENTRAL_SQUARES = new Set<Square>([
    "d4",
    "e4",
    "d5",
    "e5"
]);

const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 12
};

/*
 * Orange arrows are intentionally rare. They are a teaching overlay, not a
 * second move generator. Normal good/okay moves and inaccuracies must stay
 * visually quiet; the overlay is reserved for genuinely notable ideas.
 */
const IDEA_CLASSIFICATIONS = new Set<Classification>([
    Classification.BRILLIANT,
    Classification.CRITICAL,
    Classification.THEORY
]);

const PUNISHMENT_CLASSIFICATIONS = new Set<Classification>([
    Classification.MISTAKE,
    Classification.BLUNDER
]);

function teachingArrow(from: Square, to: Square): SuggestionArrow {
    return {
        from,
        to,
        colour: TEACHING_ARROW_COLOUR,
        overlayColour: TEACHING_ARROW_COLOUR
    };
}

function isCheck(move: Move) {
    return move.san.includes("+") || move.san.includes("#");
}

function isMate(move: Move) {
    return move.san.includes("#");
}

function isImmediatelyRecapturable(board: Chess, move: Move) {
    try {
        const continuation = new Chess(board.fen());
        continuation.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion
        });

        return (continuation.moves({ verbose: true }) as Move[])
            .some(reply => (
                reply.to == move.to
                && reply.captured != undefined
            ));
    } catch {
        return true;
    }
}

function isMeaningfulCapture(board: Chess, move: Move) {
    if (!move.captured) return false;

    const attackerValue = PIECE_VALUES[move.piece as PieceSymbol] || 0;
    const targetValue = PIECE_VALUES[move.captured as PieceSymbol] || 0;

    /*
     * Do not advertise things such as QxP when the queen is simply lost to a
     * recapture. That was the main source of misleading arrows in quiet moves.
     */
    if (
        targetValue < attackerValue
        && isImmediatelyRecapturable(board, move)
    ) {
        return false;
    }

    /*
     * A low-value capture by a much more valuable piece is usually noise even
     * when technically safe. Keep it only when it is forcing (check/mate).
     */
    return (
        targetValue >= attackerValue
        || targetValue >= PIECE_VALUES.n
        || isCheck(move)
    );
}

function punishmentArrow(node: StateTreeNode): SuggestionArrow[] {
    const uci = getTopEngineLine(node.state.engineLines)
        ?.moves.at(0)?.uci;

    if (!uci) return [];

    try {
        const board = new Chess(node.state.fen);
        const parsedMove = parseUciMove(uci);
        const move = board.move({
            from: parsedMove.from,
            to: parsedMove.to,
            promotion: parsedMove.promotion
        });

        const capturedValue = move.captured
            ? PIECE_VALUES[move.captured as PieceSymbol] || 0
            : 0;

        /*
         * A mistake should not produce an orange arrow just because Stockfish
         * prefers a quiet positional reply. Show the punishment only when the
         * first engine move is visibly forcing: check, mate, promotion or a
         * material hit worth at least a minor piece.
         */
        const clearPunishment = (
            isCheck(move)
            || move.promotion != undefined
            || capturedValue >= PIECE_VALUES.n
        );

        return clearPunishment
            ? [teachingArrow(move.from, move.to)]
            : [];
    } catch {
        return [];
    }
}

function moveScore(
    board: Chess,
    move: Move,
    classification: Classification,
    movedPiece: PieceSymbol
) {
    let score = 0;

    if (isMate(move)) {
        score += 120;
    } else if (isCheck(move)) {
        score += 55;
    }

    if (move.promotion) {
        score += 80;
    }

    if (move.captured) {
        if (!isMeaningfulCapture(board, move)) {
            return -1;
        }

        const targetValue = PIECE_VALUES[move.captured as PieceSymbol] || 0;
        score += 55 + targetValue * 8;
    }

    /*
     * Theory is the only case where an empty destination can be explanatory,
     * and even there we keep it to a developed knight pointing at a central
     * square. This captures useful opening ideas without drawing d4-d5 style
     * pawn arrows or arbitrary queen routes.
     */
    if (
        classification == Classification.THEORY
        && movedPiece == "n"
        && CENTRAL_SQUARES.has(move.to)
    ) {
        score += 34;
    }

    return score;
}

function ideaArrows(node: StateTreeNode): SuggestionArrow[] {
    const uci = node.state.move?.uci;
    const classification = node.state.classification;

    if (!uci || !classification || !IDEA_CLASSIFICATIONS.has(classification)) {
        return [];
    }

    const playedMove = parseUciMove(uci);
    const moverColour = node.state.moveColour || (
        node.parent
        && new Chess(node.parent.state.fen).turn() == "w"
            ? PieceColour.WHITE
            : PieceColour.BLACK
    );

    try {
        const board = new Chess(
            setFenTurn(node.state.fen, moverColour)
        );
        const movedPiece = board.get(playedMove.to)?.type;

        if (!movedPiece) return [];

        /*
         * A theoretical pawn move is not, by itself, a reason to draw its next
         * push. This specifically prevents opening arrows such as d4 -> d5.
         */
        if (
            classification == Classification.THEORY
            && movedPiece == "p"
        ) {
            return [];
        }

        const candidates = board.moves({
            square: playedMove.to,
            verbose: true
        }) as Move[];

        const minimumScore = classification == Classification.THEORY
            ? 30
            : 50;

        return candidates
            .map(move => ({
                move,
                score: moveScore(
                    board,
                    move,
                    classification,
                    movedPiece
                )
            }))
            .filter(candidate => candidate.score >= minimumScore)
            .sort((a, b) => b.score - a.score)
            .slice(0, 2)
            .map(candidate => teachingArrow(
                playedMove.to,
                candidate.move.to
            ));
    } catch {
        return [];
    }
}

function useTeachingArrows(): SuggestionArrow[] {
    const node = useAnalysisBoardStore(
        state => state.currentStateTreeNode
    );

    return useMemo(() => {
        const classification = node.state.classification;

        if (!classification) return [];

        if (PUNISHMENT_CLASSIFICATIONS.has(classification)) {
            return punishmentArrow(node);
        }

        return ideaArrows(node);
    }, [
        node.state.fen,
        node.state.move?.uci,
        node.state.moveColour,
        node.state.classification,
        node.state.engineLines
    ]);
}

export default useTeachingArrows;
