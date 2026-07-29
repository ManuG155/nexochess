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
}

function MiniBoard({ fen }: MiniBoardProps) {
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

                return (
                    <div
                        className={styles.square}
                        key={index}
                        style={{
                            backgroundColor: light
                                ? boardColours.lightSquareColour
                                : boardColours.darkSquareColour
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
                    </div>
                );
            })}
        </div>
    );
}

export default MiniBoard;
