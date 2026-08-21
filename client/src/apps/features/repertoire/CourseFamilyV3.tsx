import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chess, Move } from "chess.js";
import { useTranslation } from "react-i18next";

import { OpeningCatalogueEntry } from "./openingCatalogue";
import { localizeOpeningName } from "./openingLocalization";
import { CourseProgressStore, findLessonProgress } from "./courseProgress";
import { RepertoireSide } from "./courseV3Model";
import { learnedDepth, pgnPlyCount } from "./courseDepth";
import * as styles from "./courseV3.module.css";
import * as mapStyles from "./courseMap.module.css";

interface Props {
    name: string;
    lines: OpeningCatalogueEntry[];
    progress: CourseProgressStore;
    preferredSide?: RepertoireSide;
    onBack: () => void;
    onOpen: (opening: OpeningCatalogueEntry, side?: RepertoireSide, startPractice?: boolean, blindPractice?: boolean) => void;
    onReviewFamily: (lines: OpeningCatalogueEntry[]) => void;
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
    start: string;
    routes: string;
    personal: string;
    learned: string;
    available: string;
}

const MAP_COPY: Record<string, MapCopy> = {
    en: { drag: "Drag the map to explore. The mouse wheel keeps scrolling the page.", center: "Center map", zoomIn: "Zoom in", zoomOut: "Zoom out", start: "Start", routes: "lines", personal: "Personal", learned: "Learned", available: "Available" },
    es: { drag: "Arrastra el mapa para explorar. La rueda del ratón sigue desplazando la página.", center: "Centrar mapa", zoomIn: "Acercar", zoomOut: "Alejar", start: "Inicio", routes: "líneas", personal: "Personal", learned: "Aprendida", available: "Disponible" },
    fr: { drag: "Faites glisser la carte pour explorer. La molette continue de faire défiler la page.", center: "Centrer la carte", zoomIn: "Zoom avant", zoomOut: "Zoom arrière", start: "Début", routes: "lignes", personal: "Personnel", learned: "Apprise", available: "Disponible" },
    de: { drag: "Ziehe die Karte zum Erkunden. Das Mausrad scrollt weiterhin die Seite.", center: "Karte zentrieren", zoomIn: "Vergrößern", zoomOut: "Verkleinern", start: "Start", routes: "Linien", personal: "Persönlich", learned: "Gelernt", available: "Verfügbar" },
    pt: { drag: "Arraste o mapa para explorar. A roda do rato continua a deslocar a página.", center: "Centrar mapa", zoomIn: "Ampliar", zoomOut: "Reduzir", start: "Início", routes: "linhas", personal: "Pessoal", learned: "Aprendida", available: "Disponível" },
    ru: { drag: "Перетаскивайте карту для навигации. Колесо мыши прокручивает страницу.", center: "Центрировать", zoomIn: "Приблизить", zoomOut: "Отдалить", start: "Начало", routes: "линий", personal: "Личная", learned: "Изучена", available: "Доступна" },
    zh: { drag: "拖动地图进行浏览。鼠标滚轮仍用于滚动页面。", center: "居中地图", zoomIn: "放大", zoomOut: "缩小", start: "开始", routes: "条路线", personal: "个人", learned: "已学习", available: "可学习" },
    vi: { drag: "Kéo bản đồ để khám phá. Con lăn chuột vẫn cuộn trang.", center: "Căn giữa", zoomIn: "Phóng to", zoomOut: "Thu nhỏ", start: "Bắt đầu", routes: "dòng", personal: "Cá nhân", learned: "Đã học", available: "Có sẵn" },
    hi: { drag: "देखने के लिए मानचित्र खींचें। माउस व्हील पेज को ही स्क्रॉल करता रहेगा।", center: "मानचित्र केंद्रित करें", zoomIn: "ज़ूम इन", zoomOut: "ज़ूम आउट", start: "शुरुआत", routes: "लाइनें", personal: "निजी", learned: "सीखी", available: "उपलब्ध" },
    mr: { drag: "पाहण्यासाठी नकाशा ड्रॅग करा. माउस व्हील पेज स्क्रोल करत राहील.", center: "नकाशा मध्यभागी", zoomIn: "झूम इन", zoomOut: "झूम आउट", start: "सुरुवात", routes: "लाईन्स", personal: "वैयक्तिक", learned: "शिकलेली", available: "उपलब्ध" },
    pl: { drag: "Przeciągaj mapę, aby ją przeglądać. Kółko myszy nadal przewija stronę.", center: "Wyśrodkuj mapę", zoomIn: "Powiększ", zoomOut: "Pomniejsz", start: "Start", routes: "linie", personal: "Własna", learned: "Nauczona", available: "Dostępna" }
};

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

function buildAtlas(lines: OpeningCatalogueEntry[], completeKeys: Set<string>): Atlas {
    const root = buildRawTree(lines);
    const roots = Array.from(root.children.values())
        .sort((a, b) => (a.san || "").localeCompare(b.san || ""))
        .map(child => compressedNode(child, 0));
    let nextY = 72;
    let maxDepth = 0;
    const flat: AtlasNode[] = [];
    const place = (node: AtlasNode) => {
        maxDepth = Math.max(maxDepth, node.depth);
        node.x = 218 + node.depth * 220;
        node.children.forEach(place);
        if (node.children.length) {
            node.y = (node.children[0].y + node.children[node.children.length - 1].y) / 2;
        } else {
            node.y = nextY;
            nextY += 88;
        }
        flat.push(node);
    };
    roots.forEach(place);
    const rootY = roots.length
        ? (roots[0].y + roots[roots.length - 1].y) / 2
        : 72;
    const rootX = 64;
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
        width: Math.max(520, 218 + (maxDepth + 1) * 220),
        height: Math.max(320, nextY + 20),
        rootX,
        rootY
    };
}

function entryKey(entry: OpeningCatalogueEntry) {
    return `${entry.eco}|${entry.name}|${entry.pgn}`;
}

function CourseFamilyV3({ name, lines, progress, preferredSide, onBack, onOpen, onReviewFamily }: Props) {
    const { t, i18n } = useTranslation("repertoire");
    const { t: tc } = useTranslation("repertoireCourse");
    const language = i18n.resolvedLanguage || i18n.language || "en";
    const lang = language.split("-")[0].toLowerCase();
    const copy = MAP_COPY[lang] || MAP_COPY.en;
    const viewportRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ pointerId: number; x: number; y: number; panX: number; panY: number }>();
    const [pan, setPan] = useState({ x: 28, y: 20 });
    const [scale, setScale] = useState(.92);
    const [dragging, setDragging] = useState(false);

    const lineStates = useMemo(() => lines.map(item => {
        const itemProgress = findLessonProgress(progress, item);
        const availablePly = pgnPlyCount(item.pgn);
        const learnedPly = learnedDepth(itemProgress, availablePly);
        return {
            item,
            progress: itemProgress,
            availablePly,
            learnedPly,
            complete: availablePly > 0 && learnedPly >= availablePly
        };
    }), [lines, progress]);
    const stateByKey = useMemo(() => new Map(lineStates.map(state => [entryKey(state.item), state])), [lineStates]);
    const completeKeys = useMemo(() => new Set(lineStates.filter(state => state.complete).map(state => entryKey(state.item))), [lineStates]);
    const learnedLines = lineStates.filter(state => state.learnedPly > 0).map(state => state.item);
    const completed = learnedLines.length;
    const firstNew = lineStates.findIndex(state => state.learnedPly == 0);
    const firstPartial = lineStates.findIndex(state => state.learnedPly > 0 && !state.complete);
    const recommended = firstNew >= 0 ? firstNew : firstPartial;
    const recommendedItem = recommended >= 0 ? lineStates[recommended]?.item : undefined;
    const depthScore = lineStates.reduce((sum, state) => sum + (state.availablePly ? state.learnedPly / state.availablePly : 0), 0);
    const percent = lineStates.length ? Math.round(depthScore / lineStates.length * 100) : 0;
    const localizedFamily = localizeOpeningName(name, language);
    const atlas = useMemo(() => buildAtlas(lines, completeKeys), [lines, completeKeys]);

    function studyNext() {
        const index = recommended >= 0 ? recommended : 0;
        const state = lineStates[index];
        if (!state) return;
        onOpen(state.item, state.progress?.side || preferredSide, Boolean(state.progress && state.complete), Boolean(state.progress && state.complete));
    }

    function centerMap(nextScale = scale) {
        const viewport = viewportRef.current;
        if (!viewport) return;
        setPan({ x: 28, y: viewport.clientHeight / 2 - atlas.rootY * nextScale });
    }

    useEffect(() => {
        const id = window.requestAnimationFrame(() => centerMap(.92));
        return () => window.cancelAnimationFrame(id);
    }, [name, atlas.rootY]);

    function zoom(delta: number) {
        const next = Math.max(.58, Math.min(1.22, Number((scale + delta).toFixed(2))));
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

    function chooseEntry(node: AtlasNode) {
        if (!node.entries.length) return undefined;
        if (recommendedItem && node.entries.includes(recommendedItem)) return recommendedItem;
        return node.entries.find(entry => !stateByKey.get(entryKey(entry))?.complete)
            || node.entries.find(entry => entry.eco == "USR")
            || node.entries[0];
    }

    return <section className={styles.browserShell}>
        <button className={styles.backToOpenings} onClick={onBack}>← {t("learn.allOpenings")}</button>
        <div className={styles.familyHero}>
            <div><span>{lines.find(item => item.eco != "USR")?.eco || lines[0]?.eco}</span><h2>{localizedFamily}</h2><p>{tc("path.intro")}</p></div>
            <div className={styles.familyHeroActions}>
                <div><strong>{completed}/{lines.length}</strong><span>{t("learn.linesLearned")}</span></div>
                <button type="button" data-repertoire-tour="study-next" onClick={studyNext} disabled={!lines.length}>{t("learn.study")}</button>
                <button type="button" onClick={() => onReviewFamily(learnedLines)} disabled={!learnedLines.length}>{t("modes.review")}</button>
            </div>
        </div>
        <div className={mapStyles.mapCard}>
            <div className={mapStyles.mapHead}>
                <div className={mapStyles.mapHeadText}><strong>{tc("path.title")}</strong><span>{copy.drag}</span></div>
                <div className={mapStyles.mapHeadRight}>
                    <span className={mapStyles.mapProgress}>{percent}% · {lines.length} {copy.routes}</span>
                    <div className={mapStyles.mapControls}>
                        <button type="button" onClick={() => zoom(-.1)} title={copy.zoomOut} aria-label={copy.zoomOut}>−</button>
                        <button type="button" onClick={() => { setScale(.92); centerMap(.92); }} title={copy.center} aria-label={copy.center}>⌾</button>
                        <button type="button" onClick={() => zoom(.1)} title={copy.zoomIn} aria-label={copy.zoomIn}>+</button>
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
                            const startX = edge.fromX + (edge.fromX == atlas.rootX ? 38 : 88);
                            const endX = edge.toX - 88;
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
                            ? entry.eco == "USR" ? entry.name : entry.name == name ? t("learn.fundamentals") : localizeOpeningName(entry.name, language)
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
                            style={{ left: node.x, top: node.y }}
                            disabled={!entry}
                            onClick={() => entry && onOpen(entry, state?.progress?.side || preferredSide, Boolean(state?.progress && state.complete), Boolean(state?.progress && state.complete))}
                            title={entry?.pgn || node.label}
                        >
                            <span className={mapStyles.mapNodeTop}><strong className={mapStyles.mapMove}>{node.label}</strong><span className={mapStyles.mapBadge}>{badge}</span></span>
                            <span className={mapStyles.mapMeta}><span>{displayName}</span>{node.descendantLines > 1 && <span>{node.descendantLines} {copy.routes}</span>}</span>
                        </button>;
                    })}
                </div>
                <span className={mapStyles.mapHint}>{copy.drag}</span>
            </div> : <div className={mapStyles.mapEmpty}>{t("learn.loading")}</div>}
            <div className={mapStyles.mapLegend}>
                <span><i className={mapStyles.legendDot}/>{copy.available}</span>
                <span><i className={mapStyles.legendDot} data-kind="learned"/>{copy.learned}</span>
                <span><i className={mapStyles.legendDot} data-kind="personal"/>{copy.personal}</span>
            </div>
        </div>
    </section>;
}

export default CourseFamilyV3;
