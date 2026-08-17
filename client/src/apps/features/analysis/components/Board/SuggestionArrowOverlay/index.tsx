import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import useSettingsStore from "@/stores/SettingsStore";
import {
    subscribeToBoardPrimaryInteraction
} from "@/lib/boardAnnotations";

import SuggestionArrow from "../SuggestionArrow";
import * as styles from "./SuggestionArrowOverlay.module.css";

interface SuggestionArrowOverlayProps {
    arrows?: SuggestionArrow[];
    flipped?: boolean;
    boardPixelWidth?: number;
    shaftWidthPx?: number;
    headLengthPx?: number;
    headWidthPx?: number;
}

interface Point {
    x: number;
    y: number;
}

const BOARD_SIZE = 800;
const SQUARE_SIZE = BOARD_SIZE / 8;

function getSquareCenter(square: string, flipped = false): Point {
    const file = square.charCodeAt(0) - "a".charCodeAt(0);
    const rank = Number(square.charAt(1)) - 1;

    const xIndex = flipped ? 7 - file : file;
    const yIndex = flipped ? rank : 7 - rank;

    return {
        x: (xIndex + 0.5) * SQUARE_SIZE,
        y: (yIndex + 0.5) * SQUARE_SIZE
    };
}

function isKnightShape(start: Point, end: Point): boolean {
    const dx = Math.round(
        Math.abs(end.x - start.x) / SQUARE_SIZE
    );

    const dy = Math.round(
        Math.abs(end.y - start.y) / SQUARE_SIZE
    );

    return (
        (dx === 2 && dy === 1)
        || (dx === 1 && dy === 2)
    );
}

function getKnightCorner(start: Point, end: Point): Point {
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);

    // Primero recorremos el tramo largo.
    if (dx > dy) {
        return {
            x: end.x,
            y: start.y
        };
    }

    return {
        x: start.x,
        y: end.y
    };
}

function pointBeforeEnd(
    start: Point,
    end: Point,
    distance: number
): Point {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) return end;

    return {
        x: end.x - (dx / length) * distance,
        y: end.y - (dy / length) * distance
    };
}

function getUnitVector(from: Point, to: Point): Point {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) {
        return { x: 0, y: 0 };
    }

    return {
        x: dx / length,
        y: dy / length
    };
}

function getNormal(direction: Point): Point {
    return {
        x: -direction.y,
        y: direction.x
    };
}

function offsetPoint(
    point: Point,
    direction: Point,
    distance: number
): Point {
    return {
        x: point.x + direction.x * distance,
        y: point.y + direction.y * distance
    };
}

function lineIntersection(
    pointA: Point,
    directionA: Point,
    pointB: Point,
    directionB: Point
): Point {
    const denominator =
        directionA.x * directionB.y
        - directionA.y * directionB.x;

    if (Math.abs(denominator) < 0.0001) {
        return pointA;
    }

    const dx = pointB.x - pointA.x;
    const dy = pointB.y - pointA.y;

    const t = (
        dx * directionB.y
        - dy * directionB.x
    ) / denominator;

    return {
        x: pointA.x + directionA.x * t,
        y: pointA.y + directionA.y * t
    };
}

function pointsToPath(points: Point[]): string {
    if (!points.length) return "";

    return [
        `M ${points[0].x} ${points[0].y}`,
        ...points
            .slice(1)
            .map(point => `L ${point.x} ${point.y}`),
        "Z"
    ].join(" ");
}

function buildStraightArrowShape(
    start: Point,
    target: Point,
    shaftWidth: number,
    headLength: number,
    headWidth: number,
    targetOffset: number
): string {
    const direction = getUnitVector(start, target);
    const normal = getNormal(direction);

    const tip = pointBeforeEnd(
        start,
        target,
        targetOffset
    );

    const headBase = pointBeforeEnd(
        start,
        tip,
        headLength
    );

    const halfShaft = shaftWidth / 2;
    const halfHead = headWidth / 2;

    const startLeft = offsetPoint(
        start,
        normal,
        halfShaft
    );

    const startRight = offsetPoint(
        start,
        normal,
        -halfShaft
    );

    const neckLeft = offsetPoint(
        headBase,
        normal,
        halfShaft
    );

    const neckRight = offsetPoint(
        headBase,
        normal,
        -halfShaft
    );

    const headLeft = offsetPoint(
        headBase,
        normal,
        halfHead
    );

    const headRight = offsetPoint(
        headBase,
        normal,
        -halfHead
    );

    return pointsToPath([
        startLeft,
        neckLeft,
        headLeft,
        tip,
        headRight,
        neckRight,
        startRight
    ]);
}

function buildKnightArrowShape(
    start: Point,
    target: Point,
    shaftWidth: number,
    headLength: number,
    headWidth: number,
    targetOffset: number
): string {
    const corner = getKnightCorner(start, target);

    const firstDirection = getUnitVector(
        start,
        corner
    );

    const secondDirection = getUnitVector(
        corner,
        target
    );

    const firstNormal = getNormal(firstDirection);
    const secondNormal = getNormal(secondDirection);

    const tip = pointBeforeEnd(
        corner,
        target,
        targetOffset
    );

    const headBase = pointBeforeEnd(
        corner,
        tip,
        headLength
    );

    const halfShaft = shaftWidth / 2;
    const halfHead = headWidth / 2;

    const startLeft = offsetPoint(
        start,
        firstNormal,
        halfShaft
    );

    const startRight = offsetPoint(
        start,
        firstNormal,
        -halfShaft
    );

    // Intersecciones de los dos bordes del cuerpo
    // en la esquina de 90 grados.
    const cornerLeft = lineIntersection(
        offsetPoint(corner, firstNormal, halfShaft),
        firstDirection,
        offsetPoint(corner, secondNormal, halfShaft),
        secondDirection
    );

    const cornerRight = lineIntersection(
        offsetPoint(corner, firstNormal, -halfShaft),
        firstDirection,
        offsetPoint(corner, secondNormal, -halfShaft),
        secondDirection
    );

    const neckLeft = offsetPoint(
        headBase,
        secondNormal,
        halfShaft
    );

    const neckRight = offsetPoint(
        headBase,
        secondNormal,
        -halfShaft
    );

    const headLeft = offsetPoint(
        headBase,
        secondNormal,
        halfHead
    );

    const headRight = offsetPoint(
        headBase,
        secondNormal,
        -halfHead
    );

    return pointsToPath([
        startLeft,
        cornerLeft,
        neckLeft,
        headLeft,
        tip,
        headRight,
        neckRight,
        cornerRight,
        startRight
    ]);
}

function getArrowKey(arrow: SuggestionArrow) {
    return `${arrow.from}-${arrow.to}-${arrow.colour}`;
}

function SuggestionArrowOverlay({
    arrows = [],
    flipped = false,
    boardPixelWidth = BOARD_SIZE,
    shaftWidthPx,
    headLengthPx,
    headWidthPx
}: SuggestionArrowOverlayProps) {
    const manualArrowColour = useSettingsStore(
        state => state.settings.analysis.arrowStyle.manualColour
    );

    const manualArrowKeys = useMemo(
        () => new Set(
            arrows
                .filter(arrow => arrow.colour == manualArrowColour)
                .map(getArrowKey)
        ),
        [ arrows, manualArrowColour ]
    );

    const [
        hiddenManualArrowKeys,
        setHiddenManualArrowKeys
    ] = useState<Set<string>>(() => new Set());

    /*
     * Las flechas manuales son una capa propia de NexoChess en Analysis y
     * Puzzles. react-chessboard ya limpia sus flechas internas al hacer clic,
     * pero esta capa externa no conocía ese gesto. Guardamos las anotaciones
     * ocultadas para que no reaparezcan por un render ajeno; una flecha nueva
     * sí aparece normalmente.
     */
    useEffect(() => (
        subscribeToBoardPrimaryInteraction(() => {
            if (!manualArrowKeys.size) return;

            setHiddenManualArrowKeys(previous => {
                const next = new Set(previous);

                for (const key of manualArrowKeys) {
                    next.add(key);
                }

                return next;
            });
        })
    ), [ manualArrowKeys ]);

    useEffect(() => {
        setHiddenManualArrowKeys(previous => {
            const next = new Set(
                [ ...previous ].filter(key => manualArrowKeys.has(key))
            );

            if (
                next.size == previous.size
                && [ ...next ].every(key => previous.has(key))
            ) {
                return previous;
            }

            return next;
        });
    }, [ manualArrowKeys ]);

    const visibleArrows = arrows.filter(arrow => (
        arrow.colour != manualArrowColour
        || !hiddenManualArrowKeys.has(getArrowKey(arrow))
    ));

    const safeBoardWidth = boardPixelWidth > 0
        ? boardPixelWidth
        : BOARD_SIZE;

    const scale = BOARD_SIZE / safeBoardWidth;

    // Misma referencia de grosor que usábamos antes.
    const defaultShaftWidthPx = safeBoardWidth / 40;

    const shaftWidth = (
        shaftWidthPx ?? defaultShaftWidthPx
    ) * scale;

    const headLength = (
        headLengthPx ?? defaultShaftWidthPx * 2
    ) * scale;

    const headWidth = (
        headWidthPx ?? defaultShaftWidthPx * 2.5
    ) * scale;

    const targetOffset =
        (safeBoardWidth / 32) * scale;

    return (
        <svg
            className={styles.overlay}
            viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
        >
            {visibleArrows.map((arrow, index) => {
                const start = getSquareCenter(
                    arrow.from,
                    flipped
                );

                const target = getSquareCenter(
                    arrow.to,
                    flipped
                );

                const path = isKnightShape(start, target)
                    ? buildKnightArrowShape(
                        start,
                        target,
                        shaftWidth,
                        headLength,
                        headWidth,
                        targetOffset
                    )
                    : buildStraightArrowShape(
                        start,
                        target,
                        shaftWidth,
                        headLength,
                        headWidth,
                        targetOffset
                    );

                return (
                    <path
                        key={`${arrow.from}-${arrow.to}-${index}`}
                        d={path}
                        fill={arrow.colour}
                        fillOpacity="0.65"
                    />
                );
            })}
        </svg>
    );
}

export default SuggestionArrowOverlay;
