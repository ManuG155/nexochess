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
    descendantLines: number;
}

interface AtlasNode {
    id: string;
    rawId: string;
    label: string;
    depth: number;
    x: number;
    y: number;
    children: AtlasNode[];
    entries: OpeningCatalogueEntry[];
    descendantLines: number;
    principal: boolean;
    collapsed: boolean;
}

interface AtlasEdge {
    id: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    complete: boolean;
    principal: boolean;
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
    mainLine: string;
    expand: string;
}

const MAP_COPY: Record<string, MapCopy> = {
    en: { drag: "Drag to explore. Scroll moves the page; Alt + scroll zooms the map.", center: "Center map", zoomIn: "Zoom in", zoomOut: "Zoom out", fullscreen: "Full screen", exitFullscreen: "Exit full screen", start: "Start", routes: "lines", personal: "Personal", learned: "Learned", available: "Available", mainLine: "Main line", expand: "Open branch" },
    es: { drag: "Arrastra para explorar. La rueda desplaza la página; Alt + rueda hace zoom en el mapa.", center: "Centrar mapa", zoomIn: "Acercar", zoomOut: "Alejar", fullscreen: "Pantalla completa", exitFullscreen: "Salir de pantalla completa", start: "Inicio", routes: "líneas", personal: "Personal", learned: "Aprendida", available: "Disponible", mainLine: "Principal", expand: "Abrir rama" },
    fr: { drag: "Faites glisser pour explorer. La molette fait défiler la page ; Alt + molette zoome sur la carte.", center: "Centrer la carte", zoomIn: "Zoom avant", zoomOut: "Zoom arrière", fullscreen: "Plein écran", exitFullscreen: "Quitter le plein écran", start: "Début", routes: "lignes", personal: "Personnel", learned: "Apprise", available: "Disponible", mainLine: "Principale", expand: "Ouvrir la branche" },
    de: { drag: "Zum Erkunden ziehen. Das Mausrad scrollt die Seite; Alt + Mausrad zoomt die Karte.", center: "Karte zentrieren", zoomIn: "Vergrößern", zoomOut: "Verkleinern", fullscreen: "Vollbild", exitFullscreen: "Vollbild verlassen", start: "Start", routes: "Linien", personal: "Persönlich", learned: "Gelernt", available: "Verfügbar", mainLine: "Hauptlinie", expand: "Zweig öffnen" },
    pt: { drag: "Arraste para explorar. A roda desloca a página; Alt + roda amplia o mapa.", center: "Centrar mapa", zoomIn: "Ampliar", zoomOut: "Reduzir", fullscreen: "Ecrã inteiro", exitFullscreen: "Sair do ecrã inteiro", start: "Início", routes: "linhas", personal: "Pessoal", learned: "Aprendida", available: "Disponível", mainLine: "Principal", expand: "Abrir ramo" },
    ru: { drag: "Перетаскивайте карту. Колесо прокручивает страницу; Alt + колесо масштабирует карту.", center: "Центрировать", zoomIn: "Приблизить", zoomOut: "Отдалить", fullscreen: "Во весь экран", exitFullscreen: "Выйти из полноэкранного режима", start: "Начало", routes: "линий", personal: "Личная", learned: "Изучена", available: "Доступна", mainLine: "Главная", expand: "Открыть ветку" },
    zh: { drag: "拖动地图浏览。滚轮滚动页面；Alt + 滚轮缩放地图。", center: "居中地图", zoomIn: "放大", zoomOut: "缩小", fullscreen: "全屏", exitFullscreen: "退出全屏", start: "开始", routes: "条路线", personal: "个人", learned: "已学习", available: "可学习", mainLine: "主线", expand: "展开分支" },
    vi: { drag: "Kéo để khám phá. Con lăn cuộn trang; Alt + con lăn thu phóng bản đồ.", center: "Căn giữa", zoomIn: "Phóng to", zoomOut: "Thu nhỏ", fullscreen: "Toàn màn hình", exitFullscreen: "Thoát toàn màn hình", start: "Bắt đầu", routes: "dòng", personal: "Cá nhân", learned: "Đã học", available: "Có sẵn", mainLine: "Tuyến chính", expand: "Mở nhánh" },
    hi: { drag: "देखने के लिए खींचें। व्हील पेज स्क्रॉल करता है; Alt + व्हील मानचित्र ज़ूम करता है।", center: "मानचित्र केंद्रित करें", zoomIn: "ज़ूम इन", zoomOut: "ज़ूम आउट", fullscreen: "पूर्ण स्क्रीन", exitFullscreen: "पूर्ण स्क्रीन से बाहर निकलें", start: "शुरुआत", routes: "लाइनें", personal: "निजी", learned: "सीखी", available: "उपलब्ध", mainLine: "मुख्य लाइन", expand: "शाखा खोलें" },
    mr: { drag: "पाहण्यासाठी ड्रॅग करा. व्हील पेज स्क्रोल करते; Alt + व्हील नकाशा झूम करते.", center: "नकाशा मध्यभागी", zoomIn: "झूम इन", zoomOut: "झूम आउट", fullscreen: "पूर्ण स्क्रीन", exitFullscreen: "पूर्ण स्क्रीनमधून बाहेर", start: "सुरुवात", routes: "लाईन्स", personal: "वैयक्तिक", learned: "शिकलेली", available: "उपलब्ध", mainLine: "मुख्य लाईन", expand: "फांदी उघडा" },
    pl: { drag: "Przeciągaj, aby przeglądać. Kółko przewija stronę; Alt + kółko powiększa mapę.", center: "Wyśrodkuj mapę", zoomIn: "Powiększ", zoomOut: "Pomniejsz", fullscreen: "Pełny ekran", exitFullscreen: "Wyjdź z pełnego ekranu", start: "Start", routes: "linie", personal: "Własna", learned: "Nauczona", available: "Dostępna", mainLine: "Główna", expand: "Otwórz gałąź" }
};

const NODE_WIDTH = 148;
const NODE_HALF = NODE_WIDTH / 2;
const ROOT_HALF = 31;
const FIRST_X = 150;
const X_STEP = 158;
const FIRST_Y = 46;
const Y_STEP = 56;
const DEFAULT_SCALE = .94;
const MIN_SCALE = .5;
const MAX_SCALE = 1.5;
const PRINCIPAL_MAX_PLY = 9;
const COLLAPSE_BRANCH_OVER = 6;
const COMPRESS_MOVES = 3;

function newRawNode(id: string, ply = -1, san?: string): RawNode {
    return { id, ply, san, children: new Map<string, RawNode>(), entries: [], descendantLines: 0 };
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

function moveKey(move: Move) {
    return `${move.from}${move.to}${move.promotion || ""}`;
}

function buildRawTree(lines: OpeningCatalogueEntry[]) {
    const root = newRawNode("root");
    for (const entry of lines) {
        const moves = parsedMoves(entry);
        if (!moves.length) continue;
        let node = root;
        moves.forEach((move, ply) => {
            const key = moveKey(move);
            let child = node.children.get(key);
            if (!child) {
                child = newRawNode(`${node.id}/${key}`, ply, move.san);
                node.children.set(key, child);
            }
            node = child;
        });
        node.entries.push(entry);
    }
    annotateDescendants(root);
    return root;
}

function annotateDescendants(node: RawNode): number {
    let total = node.entries.length;
    node.children.forEach(child => { total += annotateDescendants(child); });
    node.descendantLines = total;
    return total;
}

function moveLabel(items: Array<{ san: string; ply: number }>) {
    return items.map((item, index) => {
        const number = Math.floor(item.ply / 2) + 1;
        if (item.ply % 2 == 0) return `${number}.${item.san}`;
        const previous = items[index - 1];
        return previous && previous.ply == item.ply - 1 ? item.san : `${number}...${item.san}`;
    }).join(" ");
}

function principalPath(root: RawNode) {
    const ids = new Set<string>();
    let cursor = root;
    while (cursor.children.size) {
        const child = Array.from(cursor.children.values()).sort((a, b) => (
            b.descendantLines - a.descendantLines
            || (a.san || "").localeCompare(b.san || "")
        ))[0];
        if (!child) break;
        ids.add(child.id);
        cursor = child;
        if (child.ply >= PRINCIPAL_MAX_PLY) break;
    }
    return ids;
}

function pathForEntry(root: RawNode, entry?: OpeningCatalogueEntry) {
    const ids = new Set<string>();
    if (!entry) return ids;
    let cursor = root;
    for (const move of parsedMoves(entry)) {
        const child = cursor.children.get(moveKey(move));
        if (!child) break;
        ids.add(child.id);
        cursor = child;
    }
    return ids;
}

function orderChildren(children: RawNode[], principalIds: Set<string>) {
    const main = children.find(child => principalIds.has(child.id));
    const others = children
        .filter(child => child != main)
        .sort((a, b) => b.descendantLines - a.descendantLines || (a.san || "").localeCompare(b.san || ""));
    if (!main) return others;
    const split = Math.ceil(others.length / 2);
    return [...others.slice(0, split), main, ...others.slice(split)];
}

function displayNode(
    raw: RawNode,
    depth: number,
    principalIds: Set<string>,
    expanded: Set<string>,
    forcedOpen: Set<string>
): AtlasNode {
    const principal = principalIds.has(raw.id);
    const collapsed = !principal
        && raw.descendantLines > COLLAPSE_BRANCH_OVER
        && !expanded.has(raw.id)
        && !forcedOpen.has(raw.id);

    if (collapsed) {
        return {
            id: `collapsed:${raw.id}`,
            rawId: raw.id,
            label: moveLabel([{ san: raw.san || "", ply: raw.ply }]),
            depth,
            x: 0,
            y: 0,
            children: [],
            entries: raw.entries,
            descendantLines: raw.descendantLines,
            principal: false,
            collapsed: true
        };
    }

    let cursor = raw;
    const segment: Array<{ san: string; ply: number }> = [{ san: raw.san || "", ply: raw.ply }];
    while (cursor.entries.length == 0 && cursor.children.size == 1 && segment.length < COMPRESS_MOVES) {
        const child = Array.from(cursor.children.values())[0];
        if (principalIds.has(cursor.id) != principalIds.has(child.id)) break;
        cursor = child;
        segment.push({ san: child.san || "", ply: child.ply });
    }

    const children = orderChildren(Array.from(cursor.children.values()), principalIds)
        .map(child => displayNode(child, depth + 1, principalIds, expanded, forcedOpen));

    return {
        id: cursor.id,
        rawId: raw.id,
        label: moveLabel(segment),
        depth,
        x: 0,
        y: 0,
        children,
        entries: cursor.entries,
        descendantLines: cursor.descendantLines,
        principal,
        collapsed: false
    };
}

function entryKey(entry: OpeningCatalogueEntry) {
    return `${entry.eco}|${entry.name}|${entry.pgn}`;
}

function buildAtlas(
    lines: OpeningCatalogueEntry[],
    completeKeys: Set<string>,
    expanded: Set<string>,
    recommendedItem?: OpeningCatalogueEntry
): Atlas {
    const root = buildRawTree(lines);
    const principalIds = principalPath(root);
    const forcedOpen = pathForEntry(root, recommendedItem);
    const roots = orderChildren(Array.from(root.children.values()), principalIds)
        .map(child => displayNode(child, 0, principalIds, expanded, forcedOpen));

    let nextY = FIRST_Y;
    let maxDepth = 0;
    const flat: AtlasNode[] = [];

    const place = (node: AtlasNode) => {
        maxDepth = Math.max(maxDepth, node.depth);
        node.x = FIRST_X + node.depth * X_STEP;
        node.children.forEach(place);
        const principalChild = node.children.find(child => child.principal);
        if (principalChild) {
            node.y = principalChild.y;
        } else if (node.children.length) {
            node.y = (node.children[0].y + node.children[node.children.length - 1].y) / 2;
        } else {
            node.y = nextY;
            nextY += Y_STEP;
        }
        flat.push(node);
    };

    roots.forEach(place);
    const principalRoot = roots.find(node => node.principal);
    const rootY = principalRoot?.y ?? (roots.length ? (roots[0].y + roots[roots.length - 1].y) / 2 : FIRST_Y);
    const rootX = 45;
    const edges: AtlasEdge[] = [];

    const collectEdges = (node: AtlasNode, parentX: number, parentY: number, parentPrincipal: boolean) => {
        const complete = node.entries.length > 0 && node.entries.some(entry => completeKeys.has(entryKey(entry)));
        edges.push({
            id: `${parentX}:${parentY}>${node.id}`,
            fromX: parentX,
            fromY: parentY,
            toX: node.x,
            toY: node.y,
            complete,
            principal: node.principal && parentPrincipal
        });
        node.children.forEach(child => collectEdges(child, node.x, node.y, node.principal && parentPrincipal));
    };

    roots.forEach(node => collectEdges(node, rootX, rootY, true));
    return {
        nodes: flat,
        edges,
        width: Math.max(430, FIRST_X + maxDepth * X_STEP + NODE_HALF + 24),
        height: Math.max(250, nextY + 24),
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
    const [pan, setPan] = useState({ x: 20, y: 12 });
    const [scale, setScale] = useState(DEFAULT_SCALE);
    const [dragging, setDragging] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [expandedBranches, setExpandedBranches] = useState<Set<string>>(() => new Set());

    const lineStates = useMemo(() => lines.map(item => {
        const itemProgress = findLessonProgress(progress, item);
        const availablePly = pgnPlyCount(item.pgn);
        const learnedPly = learnedDepth(itemProgress, availablePly);
        return { item, progress: itemProgress, complete: availablePly > 0 && learnedPly >= availablePly };
    }), [lines, progress]);
    const stateByKey = useMemo(() => new Map(lineStates.map(state => [entryKey(state.item), state])), [lineStates]);
    const completeKeys = useMemo(() => new Set(lineStates.filter(state => state.complete).map(state => entryKey(state.item))), [lineStates]);
    const atlas = useMemo(() => buildAtlas(lines, completeKeys, expandedBranches, recommendedItem), [lines, completeKeys, expandedBranches, recommendedItem]);

    function centerMap(nextScale = scale) {
        const viewport = viewportRef.current;
        if (!viewport) return;
        setPan({ x: 18, y: viewport.clientHeight / 2 - atlas.rootY * nextScale });
    }

    useEffect(() => {
        setExpandedBranches(new Set());
        const id = window.requestAnimationFrame(() => centerMap(DEFAULT_SCALE));
        return () => window.cancelAnimationFrame(id);
    }, [name]);

    useEffect(() => {
        const id = window.requestAnimationFrame(() => centerMap(DEFAULT_SCALE));
        return () => window.cancelAnimationFrame(id);
    }, [atlas.rootY]);

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

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        const onWheel = (event: WheelEvent) => {
            if (!event.altKey) return;
            event.preventDefault();
            const delta = event.deltaY < 0 ? .09 : -.09;
            zoomTo(scale + delta, event.clientX, event.clientY);
        };
        viewport.addEventListener("wheel", onWheel, { passive: false });
        return () => viewport.removeEventListener("wheel", onWheel);
    }, [scale, pan.x, pan.y]);

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

    function expandBranch(rawId: string) {
        setExpandedBranches(previous => {
            const next = new Set(previous);
            next.add(rawId);
            return next;
        });
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
        >
            <div className={mapStyles.mapCanvas} style={{ width: atlas.width, height: atlas.height, transform: `translate3d(${pan.x}px,${pan.y}px,0) scale(${scale})` }}>
                <svg className={mapStyles.mapEdges} width={atlas.width} height={atlas.height} aria-hidden="true">
                    {atlas.edges.map(edge => {
                        const startX = edge.fromX + (edge.fromX == atlas.rootX ? ROOT_HALF : NODE_HALF);
                        const endX = edge.toX - NODE_HALF;
                        const middle = (startX + endX) / 2;
                        return <path key={edge.id} className={mapStyles.mapEdge} data-complete={edge.complete} data-principal={edge.principal} d={`M ${startX} ${edge.fromY} C ${middle} ${edge.fromY}, ${middle} ${edge.toY}, ${endX} ${edge.toY}`}/>;
                    })}
                </svg>
                <div className={mapStyles.mapStart} style={{ left: atlas.rootX, top: atlas.rootY }}>{copy.start}</div>
                {atlas.nodes.map(node => {
                    const entry = chooseEntry(node);
                    const state = entry ? stateByKey.get(entryKey(entry)) : undefined;
                    const isRecommended = Boolean(recommendedItem && node.entries.includes(recommendedItem));
                    const isPersonal = node.entries.some(item => item.eco == "USR");
                    const isComplete = Boolean(node.entries.length && node.entries.every(item => stateByKey.get(entryKey(item))?.complete));
                    const displayName = node.collapsed
                        ? `${node.descendantLines} ${copy.routes}`
                        : entry
                            ? entry.eco == "USR"
                                ? entry.name
                                : entry.name == name
                                    ? fundamentalsLabel
                                    : localizeOpeningName(entry.name, language)
                            : `${node.descendantLines} ${copy.routes}`;
                    const badge = node.collapsed
                        ? `+${node.descendantLines}`
                        : isPersonal
                            ? copy.personal
                            : isComplete
                                ? "✓"
                                : isRecommended
                                    ? "★"
                                    : node.principal
                                        ? copy.mainLine
                                        : node.entries.length
                                            ? copy.available
                                            : node.descendantLines;
                    const clickable = node.collapsed || Boolean(entry);
                    return <button
                        type="button"
                        key={node.id}
                        className={mapStyles.mapNode}
                        data-clickable={clickable}
                        data-recommended={isRecommended}
                        data-complete={isComplete}
                        data-personal={isPersonal}
                        data-principal={node.principal}
                        data-collapsed={node.collapsed}
                        style={{ left: node.x, top: node.y, width: NODE_WIDTH }}
                        disabled={!clickable}
                        onClick={() => {
                            if (node.collapsed) {
                                expandBranch(node.rawId);
                                return;
                            }
                            if (entry) onOpen(entry, state?.progress?.side || preferredSide, Boolean(state?.progress && state.complete), Boolean(state?.progress && state.complete));
                        }}
                        title={node.collapsed ? `${copy.expand}: ${node.descendantLines} ${copy.routes}` : entry ? `${localizeOpeningName(entry.name, language)} · ${entry.pgn}` : node.label}
                    >
                        <span className={mapStyles.mapNodeTop}><strong className={mapStyles.mapMove}>{node.label}</strong><span className={mapStyles.mapBadge}>{badge}</span></span>
                        <span className={mapStyles.mapMeta}><span>{displayName}</span>{!node.collapsed && node.descendantLines > 1 && <span>{node.descendantLines} {copy.routes}</span>}</span>
                    </button>;
                })}
            </div>
            <span className={mapStyles.mapHint}>{copy.drag}</span>
        </div> : <div className={mapStyles.mapEmpty}>{loadingLabel}</div>}
        <div className={mapStyles.mapLegend}>
            <span><i className={mapStyles.legendDot}/>{copy.available}</span>
            <span><i className={mapStyles.legendDot} data-kind="main"/>{copy.mainLine}</span>
            <span><i className={mapStyles.legendDot} data-kind="learned"/>{copy.learned}</span>
            <span><i className={mapStyles.legendDot} data-kind="personal"/>{copy.personal}</span>
        </div>
    </div>;
}

export default CourseVariationMap;
