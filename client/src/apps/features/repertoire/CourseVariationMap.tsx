import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chess, Move } from "chess.js";

import { OpeningCatalogueEntry } from "./openingCatalogue";
import { localizeOpeningName } from "./openingLocalization";
import { CourseProgressStore, findLessonProgress } from "./courseProgress";
import { learnedDepth, pgnPlyCount } from "./courseDepth";
import { RepertoireSide } from "./courseV3Model";
import * as mapStyles from "./courseMap.module.css";

interface Props {
    name: string;
    lines: OpeningCatalogueEntry[];
    progress: CourseProgressStore;
    preferredSide?: RepertoireSide;
    recommendedItem?: OpeningCatalogueEntry;
    percent: number;
    language: string;
    title: string;
    fundamentalsLabel: string;
    loadingLabel: string;
    onOpen: (opening: OpeningCatalogueEntry, side?: RepertoireSide, startPractice?: boolean, blindPractice?: boolean) => void;
}

interface RawNode {
    id: string;
    san?: string;
    ply: number;
    children: Map<string, RawNode>;
    entries: OpeningCatalogueEntry[];
}

interface AtlasNode {
    id: string;
    label: string;
    depth: number;
    x: number;
    y: number;
    children: AtlasNode[];
    entries: OpeningCatalogueEntry[];
    descendantLines: number;
}

interface AtlasEdge {
    id: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    complete: boolean;
}

interface Atlas {
    nodes: AtlasNode[];
    edges: AtlasEdge[];
    width: number;
    height: number;
    rootX: number;
    rootY: number;
}

interface MapCopy {
    drag: string;
    center: string;
    zoomIn: string;
    zoomOut: string;
    fullscreen: string;
    exitFullscreen: string;
    start: string;
    routes: string;
    personal: string;
    learned: string;
    available: string;
}

const MAP_COPY: Record<string, MapCopy> = {
    en: { drag: "Drag to explore. Scroll moves the page; Alt + scroll zooms the map.", center: "Center map", zoomIn: "Zoom in", zoomOut: "Zoom out", fullscreen: "Full screen", exitFullscreen: "Exit full screen", start: "Start", routes: "lines", personal: "Personal", learned: "Learned", available: "Available" },
    es: { drag: "Arrastra para explorar. La rueda desplaza la página; Alt + rueda hace zoom en el mapa.", center: "Centrar mapa", zoomIn: "Acercar", zoomOut: "Alejar", fullscreen: "Pantalla completa", exitFullscreen: "Salir de pantalla completa", start: "Inicio", routes: "líneas", personal: "Personal", learned: "Aprendida", available: "Disponible" },
    fr: { drag: "Faites glisser pour explorer. La molette fait défiler la page ; Alt + molette zoome sur la carte.", center: "Centrer la carte", zoomIn: "Zoom avant", zoomOut: "Zoom arrière", fullscreen: "Plein écran", exitFullscreen: "Quitter le plein écran", start: "Début", routes: "lignes", personal: "Personnel", learned: "Apprise", available: "Disponible" },
    de: { drag: "Zum Erkunden ziehen. Das Mausrad scrollt die Seite; Alt + Mausrad zoomt die Karte.", center: "Karte zentrieren", zoomIn: "Vergrößern", zoomOut: "Verkleinern", fullscreen: "Vollbild", exitFullscreen: "Vollbild verlassen", start: "Start", routes: "Linien", personal: "Persönlich", learned: "Gelernt", available: "Verfügbar" },
    pt: { drag: "Arraste para explorar. A roda desloca a página; Alt + roda amplia o mapa.", center: "Centrar mapa", zoomIn: "Ampliar", zoomOut: "Reduzir", fullscreen: "Ecrã inteiro", exitFullscreen: "Sair do ecrã inteiro", start: "Início", routes: "linhas", personal: "Pessoal", learned: "Aprendida", available: "Disponível" },
    ru: { drag: "Перетаскивайте карту. Колесо прокручивает страницу; Alt + колесо масштабирует карту.", center: "Центрировать", zoomIn: "Приблизить", zoomOut: "Отдалить", fullscreen: "Во весь экран", exitFullscreen: "Выйти из полноэкранного режима", start: "Начало", routes: "линий", personal: "Личная", learned: "Изучена", available: "Доступна" },
    zh: { drag: "拖动地图浏览。滚轮滚动页面；Alt + 滚轮缩放地图。", center: "居中地图", zoomIn: "放大", zoomOut: "缩小", fullscreen: "全屏", exitFullscreen: "退出全屏", start: "开始", routes: "条路线", personal: "个人", learned: "已学习", available: "可学习" },
    vi: { drag: "Kéo để khám phá. Con lăn cuộn trang; Alt + con lăn thu phóng bản đồ.", center: "Căn giữa", zoomIn: "Phóng to", zoomOut: "Thu nhỏ", fullscreen: "Toàn màn hình", exitFullscreen: "Thoát toàn màn hình", start: "Bắt đầu", routes: "dòng", personal: "Cá nhân", learned: "Đã học", available: "Có sẵn" },
    hi: { drag: "देखने के लिए खींचें। व्हील पेज स्क्रॉल करता है; Alt + व्हील मानचित्र ज़ूम करता है।", center: "मानचित्र केंद्रित करें", zoomIn: "ज़ूम इन", zoomOut: "ज़ूम आउट", fullscreen: "पूर्ण स्क्रीन", exitFullscreen: "पूर्ण स्क्रीन से बाहर निकलें", start: "शुरुआत", routes: "लाइनें", personal: "निजी", learned: "सीखी", available: "उपलब्ध" },
    mr: { drag: "पाहण्यासाठी ड्रॅग करा. व्हील पेज स्क्रोल करते; Alt + व्हील नकाशा झूम करते.", center: "नकाशा मध्यभागी", zoomIn: "झूम इन", zoomOut: "झूम आउट", fullscreen: "पूर्ण स्क्रीन", exitFullscreen: "पूर्ण स्क्रीनमधून बाहेर", start: "सुरुवात", routes: "लाईन्स", personal: "वैयक्तिक", learned: "शिकलेली", available: "उपलब्ध" },
    pl: { drag: "Przeciągaj, aby przeglądać. Kółko przewija stronę; Alt + kółko powiększa mapę.", center: "Wyśrodkuj mapę", zoomIn: "Powiększ", zoomOut: "Pomniejsz", fullscreen: "Pełny ekran", exitFullscreen: "Wyjdź z pełnego ekranu", start: "Start", routes: "linie", personal: "Własna", learned: "Nauczona", available: "Dostępna" }
};

const NODE_WIDTH = 164;
const NODE_HALF = NODE_WIDTH / 2;
const ROOT_HALF = 34;
const FIRST_X = 164;
const X_STEP = 184;
const FIRST_Y = 50;
const Y_STEP = 70;
const DEFAULT_SCALE = .86;
const MIN_SCALE = .56;
const MAX_SCALE = 1.4;

function newRawNode(id: string, ply = -1, san?: string): RawNode {
    return { id, ply, san, children: new Map<string, RawNode>(), entries: [] };
}

function parsedMoves(entry: OpeningCatalogueEntry) {
    try {
        const board = new Chess();
        board.loadPgn(entry.pgn);
        return board.history({ verbose: true });
    } catch {
        return [] as Move[];
    }
}

function buildRawTree(lines: OpeningCatalogueEntry[]) {
    const root = newRawNode("root");
    for (const entry of lines) {
        const moves = parsedMoves(entry);
        if (!moves.length) continue;
        let node = root;
        moves.forEach((move, ply) => {
            const key = `${move.from}${move.to}${move.promotion || ""}`;
            let child = node.children.get(key);
            if (!child) {
                child = newRawNode(`${node.id}/${key}`, ply, move.san);
                node.children.set(key, child);
            }
            node = child;
        });
        node.entries.push(entry);
    }
    return root;
}

function moveLabel(items: Array<{ san: string; ply: number }>) {
    return items.map((item, index) => {
        const number = Math.floor(item.ply / 2) + 1;
        if (item.ply % 2 == 0) return `${number}.${item.san}`;
        const previous = items[index - 1];
        return previous && previous.ply == item.ply - 1 ? item.san : `${number}...${item.san}`;
    }).join(" ");
}

function descendantCount(node: RawNode): number {
    let total = node.entries.length;
    node.children.forEach(child => { total += descendantCount(child); });
    return total;
}

function compressedNode(raw: RawNode, depth: number): AtlasNode {
    let cursor = raw;
    const segment: Array<{ san: string; ply: number }> = [{ san: raw.san || "", ply: raw.ply }];
    while (cursor.entries.length == 0 && cursor.children.size == 1 && segment.length < 4) {
        const child = Array.from(cursor.children.values())[0];
        cursor = child;
        segment.push({ san: child.san || "", ply: child.ply });
    }
    const children = Array.from(cursor.children.values())
        .sort((a, b) => (a.san || "").localeCompare(b.san || ""))
        .map(child => compressedNode(child, depth + 1));
    return {
        id: cursor.id,
        label: moveLabel(segment),
        depth,
        x: 0,
        y: 0,
        children,
        entries: cursor.entries,
        descendantLines: descendantCount(cursor)
    };
}

function entryKey(entry: OpeningCatalogueEntry) {
    return `${entry.eco}|${entry.name}|${entry.pgn}`;
}

function buildAtlas(lines: OpeningCatalogueEntry[], completeKeys: Set<string>): Atlas {
    const root = buildRawTree(lines);
    const roots = Array.from(root.children.values())
        .sort((a, b) => (a.san || "").localeCompare(b.san || ""))
        .map(child => compressedNode(child, 0));
    let nextY = FIRST_Y;
    let maxDepth = 0;
    const flat: AtlasNode[] = [];

    const place = (node: AtlasNode) => {
        maxDepth = Math.max(maxDepth, node.depth);
        node.x = FIRST_X + node.depth * X_STEP;
        node.children.forEach(place);
        if (node.children.length) {
            node.y = (node.children[0].y + node.children[node.children.length - 1].y) / 2;
        } else {
            node.y = nextY;
            nextY += Y_STEP;
        }
        flat.push(node);
    };

    roots.forEach(place);
    const rootY = roots.length ? (roots[0].y + roots[roots.length - 1].y) / 2 : FIRST_Y;
    const rootX = 48;
    const edges: AtlasEdge[] = [];

    const collectEdges = (node: AtlasNode, parentX: number, parentY: number) => {
        const complete = node.entries.length > 0 && node.entries.some(entry => completeKeys.has(entryKey(entry)));
        edges.push({ id: `${parentX}:${parentY}>${node.id}`, fromX: parentX, fromY: parentY, toX: node.x, toY: node.y, complete });
        node.children.forEach(child => collectEdges(child, node.x, node.y));
    };

    roots.forEach(node => collectEdges(node, rootX, rootY));
    return {
        nodes: flat,
        edges,
        width: Math.max(460, FIRST_X + maxDepth * X_STEP + NODE_HALF + 34),
        height: Math.max(280, nextY + 28),
        rootX,
        rootY
    };
}

function clampScale(value: number) {
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, Number(value.toFixed(3))));
}

function CourseVariationMap({ name, lines, progress, preferredSide, recommendedItem, percent, language, title, fundamentalsLabel, loadingLabel, onOpen }: Props) {
    const lang = language.split("-")[0].toLowerCase();
    const copy = MAP_COPY[lang] || MAP_COPY.en;
    const cardRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ pointerId: number; x: number; y: number; panX: number; panY: number }>();
    const [pan, setPan] = useState({ x: 24, y: 16 });
    const [scale, setScale] = useState(DEFAULT_SCALE);
    const [dragging, setDragging] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    const lineStates = useMemo(() => lines.map(item => {
        const itemProgress = findLessonProgress(progress, item);
        const availablePly = pgnPlyCount(item.pgn);
        const learnedPly = learnedDepth(itemProgress, availablePly);
        return { item, progress: itemProgress, complete: availablePly > 0 && learnedPly >= availablePly };
    }), [lines, progress]);
    const stateByKey = useMemo(() => new Map(lineStates.map(state => [entryKey(state.item), state])), [lineStates]);
    const completeKeys = useMemo(() => new Set(lineStates.filter(state => state.complete).map(state => entryKey(state.item))), [lineStates]);
    const atlas = useMemo(() => buildAtlas(lines, completeKeys), [lines, completeKeys]);

    function centerMap(nextScale = scale) {
        const viewport = viewportRef.current;
        if (!viewport) return;
        setPan({ x: 22, y: viewport.clientHeight / 2 - atlas.rootY * nextScale });
    }

    useEffect(() => {
        const id = window.requestAnimationFrame(() => centerMap(DEFAULT_SCALE));
        return () => window.cancelAnimationFrame(id);
    }, [name, atlas.rootY]);

    useEffect(() => {
        const onFullscreenChange = () => {
            const active = document.fullscreenElement == cardRef.current;
            setFullscreen(active);
            window.requestAnimationFrame(() => centerMap(scale));
        };
        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
    }, [atlas.rootY, scale]);

    function zoomTo(nextScale: number, clientX?: number, clientY?: number) {
        const next = clampScale(nextScale);
        const viewport = viewportRef.current;
        if (viewport && clientX != undefined && clientY != undefined) {
            const rect = viewport.getBoundingClientRect();
            const localX = clientX - rect.left;
            const localY = clientY - rect.top;
            const worldX = (localX - pan.x) / scale;
            const worldY = (localY - pan.y) / scale;
            setPan({ x: localX - worldX * next, y: localY - worldY * next });
        }
        setScale(next);
    }

    function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
        if (event.button != 0 || (event.target as HTMLElement).closest("button")) return;
        dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
    }

    function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
        const drag = dragRef.current;
        if (!drag || drag.pointerId != event.pointerId) return;
        setPan({ x: drag.panX + event.clientX - drag.x, y: drag.panY + event.clientY - drag.y });
    }

    function pointerEnd(event: React.PointerEvent<HTMLDivElement>) {
        if (dragRef.current?.pointerId != event.pointerId) return;
        dragRef.current = undefined;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        setDragging(false);
    }

    function wheel(event: React.WheelEvent<HTMLDivElement>) {
        if (!event.altKey) return;
        event.preventDefault();
        const delta = event.deltaY < 0 ? .08 : -.08;
        zoomTo(scale + delta, event.clientX, event.clientY);
    }

    async function toggleFullscreen() {
        const card = cardRef.current;
        if (!card) return;
        try {
            if (document.fullscreenElement == card) await document.exitFullscreen();
            else await card.requestFullscreen();
        } catch {
            // Fullscreen is progressive enhancement; the map stays usable.
        }
    }

    function chooseEntry(node: AtlasNode) {
        if (!node.entries.length) return undefined;
        if (recommendedItem && node.entries.includes(recommendedItem)) return recommendedItem;
        return node.entries.find(entry => !stateByKey.get(entryKey(entry))?.complete)
            || node.entries.find(entry => entry.eco == "USR")
            || node.entries[0];
    }

    return <div ref={cardRef} className={mapStyles.mapCard}>
        <div className={mapStyles.mapHead}>
            <div className={mapStyles.mapHeadText}><strong>{title}</strong><span>{copy.drag}</span></div>
            <div className={mapStyles.mapHeadRight}>
                <span className={mapStyles.mapProgress}>{percent}% · {lines.length} {copy.routes}</span>
                <div className={mapStyles.mapControls}>
                    <button type="button" onClick={() => zoomTo(scale - .1)} title={copy.zoomOut} aria-label={copy.zoomOut}>−</button>
                    <button type="button" onClick={() => { setScale(DEFAULT_SCALE); centerMap(DEFAULT_SCALE); }} title={copy.center} aria-label={copy.center}>⌾</button>
                    <button type="button" onClick={() => zoomTo(scale + .1)} title={copy.zoomIn} aria-label={copy.zoomIn}>+</button>
                    <button type="button" className={mapStyles.fullscreenButton} onClick={toggleFullscreen} title={fullscreen ? copy.exitFullscreen : copy.fullscreen} aria-label={fullscreen ? copy.exitFullscreen : copy.fullscreen}>
                        {fullscreen
                            ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"/></svg>
                            : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6"/></svg>}
                    </button>
                </div>
            </div>
        </div>
        <div className={mapStyles.mapTrack}><i style={{ width: `${percent}%` }}/></div>
        {atlas.nodes.length ? <div
            ref={viewportRef}
            className={mapStyles.mapViewport}
            data-dragging={dragging}
            data-repertoire-tour="lesson-list"
            tabIndex={0}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={pointerEnd}
            onPointerCancel={pointerEnd}
            onWheel={wheel}
        >
            <div className={mapStyles.mapCanvas} style={{ width: atlas.width, height: atlas.height, transform: `translate3d(${pan.x}px,${pan.y}px,0) scale(${scale})` }}>
                <svg className={mapStyles.mapEdges} width={atlas.width} height={atlas.height} aria-hidden="true">
                    {atlas.edges.map(edge => {
                        const startX = edge.fromX + (edge.fromX == atlas.rootX ? ROOT_HALF : NODE_HALF);
                        const endX = edge.toX - NODE_HALF;
                        const middle = (startX + endX) / 2;
                        return <path key={edge.id} className={mapStyles.mapEdge} data-complete={edge.complete} d={`M ${startX} ${edge.fromY} C ${middle} ${edge.fromY}, ${middle} ${edge.toY}, ${endX} ${edge.toY}`}/>;
                    })}
                </svg>
                <div className={mapStyles.mapStart} style={{ left: atlas.rootX, top: atlas.rootY }}>{copy.start}</div>
                {atlas.nodes.map(node => {
                    const entry = chooseEntry(node);
                    const state = entry ? stateByKey.get(entryKey(entry)) : undefined;
                    const isRecommended = Boolean(recommendedItem && node.entries.includes(recommendedItem));
                    const isPersonal = node.entries.some(item => item.eco == "USR");
                    const isComplete = Boolean(node.entries.length && node.entries.every(item => stateByKey.get(entryKey(item))?.complete));
                    const displayName = entry
                        ? entry.eco == "USR"
                            ? entry.name
                            : entry.name == name
                                ? fundamentalsLabel
                                : localizeOpeningName(entry.name, language)
                        : `${node.descendantLines} ${copy.routes}`;
                    const badge = isPersonal ? copy.personal : isComplete ? "✓" : isRecommended ? "★" : node.entries.length ? copy.available : node.descendantLines;
                    return <button
                        type="button"
                        key={node.id}
                        className={mapStyles.mapNode}
                        data-clickable={Boolean(entry)}
                        data-recommended={isRecommended}
                        data-complete={isComplete}
                        data-personal={isPersonal}
                        style={{ left: node.x, top: node.y, width: NODE_WIDTH }}
                        disabled={!entry}
                        onClick={() => entry && onOpen(entry, state?.progress?.side || preferredSide, Boolean(state?.progress && state.complete), Boolean(state?.progress && state.complete))}
                        title={entry ? `${localizeOpeningName(entry.name, language)} · ${entry.pgn}` : node.label}
                    >
                        <span className={mapStyles.mapNodeTop}><strong className={mapStyles.mapMove}>{node.label}</strong><span className={mapStyles.mapBadge}>{badge}</span></span>
                        <span className={mapStyles.mapMeta}><span>{displayName}</span>{node.descendantLines > 1 && <span>{node.descendantLines} {copy.routes}</span>}</span>
                    </button>;
                })}
            </div>
            <span className={mapStyles.mapHint}>{copy.drag}</span>
        </div> : <div className={mapStyles.mapEmpty}>{loadingLabel}</div>}
        <div className={mapStyles.mapLegend}>
            <span><i className={mapStyles.legendDot}/>{copy.available}</span>
            <span><i className={mapStyles.legendDot} data-kind="learned"/>{copy.learned}</span>
            <span><i className={mapStyles.legendDot} data-kind="personal"/>{copy.personal}</span>
        </div>
    </div>;
}

export default CourseVariationMap;
