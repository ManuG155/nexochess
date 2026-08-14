import React, { useEffect, useRef, useState } from "react";
import { Square } from "chess.js";

import SuggestionArrowOverlay from "@analysis/components/Board/SuggestionArrowOverlay";

type Orientation = "white" | "black";
type ManualArrow = [Square, Square, string];

interface Props {
    children: React.ReactNode;
    orientation: Orientation;
    colour: string;
    resetKey?: string;
}

function RepertoireManualArrowBoard({ children, orientation, colour, resetKey }: Props) {
    const shellRef = useRef<HTMLDivElement | null>(null);
    const arrowStartRef = useRef<Square>();
    const [arrows, setArrows] = useState<ManualArrow[]>([]);

    useEffect(() => {
        setArrows([]);
        arrowStartRef.current = undefined;
    }, [resetKey, orientation]);

    function pointerSquare(clientX: number, clientY: number) {
        const rect = shellRef.current?.getBoundingClientRect();
        if (!rect || rect.width <= 0 || rect.height <= 0) return undefined;

        const fileIndex = Math.min(7, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * 8)));
        const rankIndex = Math.min(7, Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * 8)));
        const normalFiles = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const files = orientation == "black" ? [...normalFiles].reverse() : normalFiles;
        const rank = orientation == "black" ? rankIndex + 1 : 8 - rankIndex;
        return `${files[fileIndex]}${rank}` as Square;
    }

    function beginArrow(event: React.MouseEvent<HTMLDivElement>) {
        if (event.button != 2) return;
        const square = pointerSquare(event.clientX, event.clientY);
        if (!square) return;
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        arrowStartRef.current = square;
    }

    function finishArrow(event: React.MouseEvent<HTMLDivElement>) {
        if (event.button != 2) return;
        const from = arrowStartRef.current;
        const to = pointerSquare(event.clientX, event.clientY);
        arrowStartRef.current = undefined;
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        if (!from || !to || from == to) return;

        setArrows(previous => {
            const existing = previous.findIndex(([start, end]) => start == from && end == to);
            if (existing >= 0) return previous.filter((_, index) => index != existing);
            return [...previous, [from, to, colour]];
        });
    }

    return <div
        ref={shellRef}
        style={{ position: "relative", width: "100%", height: "100%" }}
        onMouseDownCapture={beginArrow}
        onMouseUpCapture={finishArrow}
        onContextMenu={event => event.preventDefault()}
    >
        {children}
        {arrows.length > 0 && <SuggestionArrowOverlay
            arrows={arrows.map(([from, to, arrowColour]) => ({ from, to, colour: arrowColour }))}
            flipped={orientation == "black"}
        />}
    </div>;
}

export default RepertoireManualArrowBoard;
