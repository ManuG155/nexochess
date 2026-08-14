import React from "react";
import { createRoot } from "react-dom/client";
import useSettingsStore from "@/stores/SettingsStore";
import SuggestionArrowOverlay from "@analysis/components/Board/SuggestionArrowOverlay";

let currentBoard: HTMLElement | null = null;
let overlayHost: HTMLDivElement | null = null;
let overlayRoot: ReturnType<typeof createRoot> | null = null;
let arrows: Array<{from:string;to:string;colour:string}> = [];
let start: string | undefined;

function flipped(board: HTMLElement) {
    const active = board.closest("section")?.querySelector("header button[data-active=\"true\"]") as HTMLElement | null;
    return Boolean(active?.parentElement && Array.from(active.parentElement.children).indexOf(active) == 1);
}

function square(board: HTMLElement, x: number, y: number) {
    const r = board.getBoundingClientRect();
    if (!r.width || !r.height) return undefined;
    const fx = Math.min(7, Math.max(0, Math.floor((x-r.left)/r.width*8)));
    const ry = Math.min(7, Math.max(0, Math.floor((y-r.top)/r.height*8)));
    const files = flipped(board) ? ["h","g","f","e","d","c","b","a"] : ["a","b","c","d","e","f","g","h"];
    const rank = flipped(board) ? ry+1 : 8-ry;
    return `${files[fx]}${rank}`;
}

function draw() {
    if (!overlayRoot || !currentBoard) return;
    overlayRoot.render(<SuggestionArrowOverlay arrows={arrows} flipped={flipped(currentBoard)}/>);
}

function down(event: MouseEvent) {
    if (event.button != 2 || !currentBoard) return;
    start = square(currentBoard,event.clientX,event.clientY);
    if (!start) return;
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
}

function up(event: MouseEvent) {
    if (event.button != 2 || !currentBoard) return;
    const from=start; const to=square(currentBoard,event.clientX,event.clientY); start=undefined;
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
    if (!from || !to || from==to) return;
    const index=arrows.findIndex(a=>a.from==from&&a.to==to);
    if(index>=0) arrows=arrows.filter((_,i)=>i!=index);
    else arrows=[...arrows,{from,to,colour:useSettingsStore.getState().settings.analysis.arrowStyle.manualColour}];
    draw();
}

export function refreshCourseArrowRuntime() {
    const board=document.getElementById("repertoire-course-board-v3")?.parentElement as HTMLElement|null;
    if(!board || board==currentBoard){draw();return;}
    if(currentBoard){currentBoard.removeEventListener("mousedown",down,true);currentBoard.removeEventListener("mouseup",up,true);}
    overlayRoot?.unmount(); overlayHost?.remove(); arrows=[]; currentBoard=board;
    board.style.position="relative";
    overlayHost=document.createElement("div"); Object.assign(overlayHost.style,{position:"absolute",inset:"0",pointerEvents:"none",zIndex:"12"}); board.appendChild(overlayHost);
    overlayRoot=createRoot(overlayHost); board.addEventListener("mousedown",down,true); board.addEventListener("mouseup",up,true); board.addEventListener("contextmenu",e=>e.preventDefault(),true); draw();
}
