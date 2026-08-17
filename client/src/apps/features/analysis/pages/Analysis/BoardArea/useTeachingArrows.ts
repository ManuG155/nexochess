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

const IDEA_CLASSIFICATIONS = new Set<Classification>([
    Classification.BRILLIANT,
    Classification.CRITICAL,
    Classification.BEST,
    Classification.EXCELLENT,
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
        preserveColour: true
    };
}

function punishmentArrow(node: StateTreeNode): SuggestionArrow[] {
    const uci = getTopEngineLine(node.state.engineLines)
        ?.moves.at(0)?.uci;

    if (!uci) return [];

    const move = parseUciMove(uci);
    return [teachingArrow(move.from, move.to)];
}

function moveScore(move: Move, classification: Classification) {
    let score = 0;

    if (move.captured) {
        score += 50 + (PIECE_VALUES[move.captured as PieceSymbol] || 0) * 5;
    }

    if (move.san.includes("#")) {
        score += 90;
    } else if (move.san.includes("+")) {
        score += 32;
    }

    if (move.promotion) {
        score += 45;
    }

    if (CENTRAL_SQUARES.has(move.to)) {
        score += classification == Classification.THEORY ? 28 : 16;
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

        const candidates = board.moves({
            square: playedMove.to,
            verbose: true
        }) as Move[];

        const minimumScore = classification == Classification.THEORY
            ? 20
            : 28;

        return candidates
            .map(move => ({
                move,
                score: moveScore(move, classification)
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
