import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import PieceColour from "shared/constants/PieceColour";

import useSettingsStore from "@/stores/SettingsStore";
import { createCustomPieces } from "@/lib/chessAppearance";
import EvaluationBar from "@analysis/components/EvaluationBar";

import { Repertoire, RepertoireNode } from "./repertoireStore";
import useRepertoireEvaluation from "./useRepertoireEvaluation";
import * as styles from "./index.module.css";
import * as polish from "./manualPolish.module.css";

interface Props {
    repertoire: Repertoire;
    node: RepertoireNode;
    childCount: number;
    canForward: boolean;
    onMove: (from: string, to: string) => boolean;
    onStart: () => void;
    onBack: () => void;
    onForward: () => void;
}

function getSquareStyles(
    fen: string,
    selected: Square | undefined,
    legalMoveHints: boolean
): NonNullable<React.ComponentProps<typeof Chessboard>["customSquareStyles"]> {
    const result: NonNullable<
        React.ComponentProps<typeof Chessboard>["customSquareStyles"]
    > = {};
    if (!selected) return result;
    result[selected] = {
        boxShadow: "inset 0 0 0 4px rgba(96,151,255,.92)"
    };
    if (!legalMoveHints) return result;
    const board = new Chess(fen);
    board.moves({ square: selected, verbose: true }).forEach(move => {
        result[move.to] = board.get(move.to)
            ? { boxShadow: "inset 0 0 0 5px rgba(18,24,34,.34)" }
            : {
                backgroundImage:
                    "radial-gradient(circle, rgba(18,24,34,.42) 0 16%, transparent 17%)"
            };
    });
    return result;
}

export default function RepertoireBoardV2({
    repertoire,
    node,
    childCount,
    canForward,
    onMove,
    onStart,
    onBack,
    onForward
}: Props) {
    const { t } = useTranslation("repertoire");
    const settings = useSettingsStore(state => state.settings);
    const customPieces = useMemo(
        () => createCustomPieces(settings.themes.piece),
        [settings.themes.piece]
    );
    const [flipped, setFlipped] = useState(false);
    const [selectedSquare, setSelectedSquare] = useState<Square>();
    const evaluation = useRepertoireEvaluation(
        node.fen,
        settings.analysis.engine.enabled
    );
    const game = new Chess(node.fen);
    const turnColour = game.turn();
    const turnText = turnColour == "w" ? t("side.white") : t("side.black");
    const moveColour = turnColour == "w" ? PieceColour.WHITE : PieceColour.BLACK;
    const orientation = flipped
        ? (repertoire.side == "white" ? "black" : "white")
        : repertoire.side;

    function play(from: string, to: string) {
        const ok = onMove(from, to);
        if (ok) setSelectedSquare(undefined);
        return ok;
    }

    function onSquareClick(squareName: string) {
        const square = squareName as Square;
        const current = new Chess(node.fen);
        if (!selectedSquare) {
            const piece = current.get(square);
            if (piece && piece.color == current.turn()) setSelectedSquare(square);
            return;
        }
        if (selectedSquare == square) {
            setSelectedSquare(undefined);
            return;
        }
        if (!play(selectedSquare, square)) {
            const piece = current.get(square);
            setSelectedSquare(
                piece && piece.color == current.turn() ? square : undefined
            );
        }
    }

    const squareStyles = getSquareStyles(
        node.fen,
        selectedSquare,
        settings.themes.board.legalMoveHints
    );

    return <section className={styles.boardColumn}>
        <div className={styles.turnHint}>
            <span>{t("editor.position", {
                move: Math.floor(node.ply / 2) + 1
            })}</span>
            <strong>{t("editor.toMove", { side: turnText })}</strong>
        </div>
        <div className={`${styles.boardStage} ${polish.boardStage}`}>
            {settings.analysis.engine.enabled && <EvaluationBar
                className={styles.evaluationBar}
                evaluation={evaluation}
                moveColour={moveColour}
                flipped={orientation == "black"}
            />}
            <div className={styles.boardWrap}>
                <Chessboard
                    id="repertoire-board-v2"
                    position={node.fen}
                    boardOrientation={orientation}
                    onPieceDrop={(source, destination) => play(source, destination)}
                    onPieceDragBegin={(_piece, source) => setSelectedSquare(source as Square)}
                    onPieceDragEnd={() => setSelectedSquare(undefined)}
                    onSquareClick={onSquareClick}
                    customBoardStyle={{
                        borderRadius: "8px",
                        boxShadow: "0 18px 45px rgba(0,0,0,.24)"
                    }}
                    customDarkSquareStyle={{
                        backgroundColor: settings.themes.board.darkSquareColour
                    }}
                    customLightSquareStyle={{
                        backgroundColor: settings.themes.board.lightSquareColour
                    }}
                    customSquareStyles={squareStyles}
                    customPieces={customPieces}
                    showBoardNotation={settings.themes.board.coordinates == "inside"}
                    snapToCursor
                    arePiecesDraggable
                />
            </div>
        </div>
        <div className={`${styles.boardControls} ${polish.boardControls}`}>
            <button type="button" onClick={onStart} disabled={!node.parentId && node.ply == 0}>
                |← <span>{t("editor.start")}</span>
            </button>
            <button type="button" onClick={onBack} disabled={!node.parentId}>
                ← <span>{t("editor.previous")}</span>
            </button>
            <button
                type="button"
                onClick={onForward}
                disabled={!canForward || childCount == 0}
            >
                <span>{t("editor.next")}</span> →
            </button>
            <button type="button" onClick={() => setFlipped(value => !value)}>
                ↻ <span>{t("editor.flip")}</span>
            </button>
        </div>
        <p className={`${styles.boardTip} ${polish.boardTip}`}>
            {repertoire.side == "black" && node.ply == 0
                ? t("editor.blackFirstHint")
                : t("editor.moveHint")}
        </p>
    </section>;
}
