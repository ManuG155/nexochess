import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Chess } from "chess.js";

import useSettingsStore from "@/stores/SettingsStore";
import {
    PieceAsset,
    PieceCode
} from "@/lib/chessAppearance";

import * as styles from "./MiniBoard.module.css";

interface MiniBoardProps {
    fen: string;
    highlightSquare?: string;
    markerSquare?: string;
    markerImage?: string;
}

function MiniBoard({
    fen,
    highlightSquare,
    markerSquare,
    markerImage
}: MiniBoardProps) {
    const { t } = useTranslation("otherPages");
    const boardColours = useSettingsStore(
        state => state.settings.themes.board
    );

    const pieceTheme = useSettingsStore(
        state => state.settings.themes.piece
    );

    const squares = useMemo(() => {
        try {
            return new Chess(fen).board().flat();
        } catch {
            return new Chess().board().flat();
        }
    }, [fen]);

    return (
        <div
            className={styles.board}
            aria-label={t("archive.card.finalPosition")}
        >
            {squares.map((piece, index) => {
                const rank = Math.floor(index / 8);
                const file = index % 8;
                const light = (rank + file) % 2 == 0;
                const square = `${"abcdefgh"[file]}${8 - rank}`;
                const highlighted = square == highlightSquare;
                const marked = square == markerSquare && markerImage;

                return (
                    <div
                        className={styles.square}
                        key={index}
                        style={{
                            backgroundColor: light
                                ? boardColours.lightSquareColour
                                : boardColours.darkSquareColour,
                            boxShadow: highlighted
                                ? "inset 0 0 0 3px rgba(27, 170, 166, 0.95)"
                                : undefined
                        }}
                    >
                        {piece && (
                            <PieceAsset
                                theme={pieceTheme}
                                piece={(
                                    piece.color
                                    + piece.type.toUpperCase()
                                ) as PieceCode}
                                size="92%"
                            />
                        )}
                        {marked && (
                            <img
                                className={styles.marker}
                                src={markerImage}
                                alt="!!"
                                aria-hidden="true"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default MiniBoard;
