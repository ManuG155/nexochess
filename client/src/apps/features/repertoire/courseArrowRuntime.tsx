import React from "react";
import { Square } from "chess.js";
import { createRoot } from "react-dom/client";
import useSettingsStore from "@/stores/SettingsStore";

interface ManualArrow {
    from: Square;
    to: Square;
    colour: string;
}

interface Point {
    x: number;
    y: number;
}

let currentBoard: HTMLElement | null = null;
let overlayHost: HTMLDivElement | null = null;
let overlayRoot: ReturnType<typeof createRoot> | null = null;
let arrows: ManualArrow[] = [];
let start: Square | undefined;

function flipped(board: HTMLElement) {
    const oriented = board.closest("[data-board-orientation]") as HTMLElement | null;
    if (oriented?.dataset.boardOrientation) return oriented.dataset.boardOrientation == "black";
    const active = board.closest("section")?.querySelector("header button[data-active=\"true\"]") as HTMLElement | null;
    return Boolean(active?.parentElement && Array.from(active.parentElement.children).indexOf(active) == 1);
}

function square(board: HTMLElement, x: number, y: number): Square | undefined {
    const r = board.getBoundingClientRect();
    if (!r.width || !r.height) return undefined;
    const fx = Math.min(7, Math.max(0, Math.floor((x - r.left) / r.width * 8)));
    const ry = Math.min(7, Math.max(0, Math.floor((y - r.top) / r.height * 8)));
    const files = flipped(board) ? ["h", "g", "f", "e", "d", "c", "b", "a"] : ["a", "b", "c", "d", "e", "f", "g", "h"];
    const rank = flipped(board) ? ry + 1 : 8 - ry;
    return `${files[fx]}${rank}` as Square;
}

function squarePoint(name: Square, isFlipped: boolean): Point {
    const file = name.charCodeAt(0) - 97;
    const rank = Number(name[1]) - 1;
    return isFlipped
        ? { x: (7 - file) * 100 + 50, y: rank * 100 + 50 }
        : { x: file * 100 + 50, y: (7 - rank) * 100 + 50 };
}

function isKnightVector(from: Square, to: Square) {
    const fileDelta = Math.abs(from.charCodeAt(0) - to.charCodeAt(0));
    const rankDelta = Math.abs(Number(from[1]) - Number(to[1]));
    return (fileDelta == 2 && rankDelta == 1) || (fileDelta == 1 && rankDelta == 2);
}

function markerId(index: number) {
    return `repertoire-arrow-${index}`;
}

function ArrowLayer({ items, isFlipped }: { items: ManualArrow[]; isFlipped: boolean }) {
    return <svg viewBox="0 0 800 800" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
        <defs>{items.map((arrow, index) => <marker key={markerId(index)} id={markerId(index)} markerWidth="8" markerHeight="8" refX="5.7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L6,3 z" fill={arrow.colour}/></marker>)}</defs>
        {items.map((arrow, index) => {
            const from = squarePoint(arrow.from, isFlipped);
            const to = squarePoint(arrow.to, isFlipped);
            const common = {
                fill: "none",
                stroke: arrow.colour,
                strokeWidth: 13,
                strokeLinecap: "round" as const,
                strokeLinejoin: "round" as const,
                opacity: .84,
                markerEnd: `url(#${markerId(index)})`
            };
            if (!isKnightVector(arrow.from, arrow.to)) {
                return <line key={`${arrow.from}-${arrow.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} {...common}/>;
            }
            const dx = Math.abs(to.x - from.x);
            const dy = Math.abs(to.y - from.y);
            const elbow = dx > dy ? { x: to.x, y: from.y } : { x: from.x, y: to.y };
            return <polyline key={`${arrow.from}-${arrow.to}`} points={`${from.x},${from.y} ${elbow.x},${elbow.y} ${to.x},${to.y}`} {...common}/>;
        })}
    </svg>;
}

function draw() {
    if (!overlayRoot || !currentBoard) return;
    overlayRoot.render(<ArrowLayer items={arrows} isFlipped={flipped(currentBoard)}/>);
}

function down(event: MouseEvent) {
    if (event.button != 2 || !currentBoard) return;
    start = square(currentBoard, event.clientX, event.clientY);
    if (!start) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
}

function up(event: MouseEvent) {
    if (event.button != 2 || !currentBoard) return;
    const from = start;
    const to = square(currentBoard, event.clientX, event.clientY);
    start = undefined;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (!from || !to || from == to) return;
    const index = arrows.findIndex(arrow => arrow.from == from && arrow.to == to);
    if (index >= 0) arrows = arrows.filter((_, itemIndex) => itemIndex != index);
    else arrows = [...arrows, { from, to, colour: useSettingsStore.getState().settings.analysis.arrowStyle.manualColour }];
    draw();
}

function blockContextMenu(event: MouseEvent) {
    event.preventDefault();
}

export function refreshCourseArrowRuntime() {
    const board = document.getElementById("repertoire-course-board-v3")?.parentElement as HTMLElement | null;
    if (!board || board == currentBoard) {
        draw();
        return;
    }
    if (currentBoard) {
        currentBoard.removeEventListener("mousedown", down, true);
        currentBoard.removeEventListener("mouseup", up, true);
        currentBoard.removeEventListener("contextmenu", blockContextMenu, true);
    }
    overlayRoot?.unmount();
    overlayHost?.remove();
    arrows = [];
    currentBoard = board;
    board.style.position = "relative";
    overlayHost = document.createElement("div");
    Object.assign(overlayHost.style, { position: "absolute", inset: "0", pointerEvents: "none", zIndex: "12" });
    board.appendChild(overlayHost);
    overlayRoot = createRoot(overlayHost);
    board.addEventListener("mousedown", down, true);
    board.addEventListener("mouseup", up, true);
    board.addEventListener("contextmenu", blockContextMenu, true);
    draw();
}
