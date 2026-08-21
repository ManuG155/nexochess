import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import useSettingsStore from "@/stores/SettingsStore";
import { createCustomPieces } from "@/lib/chessAppearance";
import SuggestionArrowOverlay from "@analysis/components/Board/SuggestionArrowOverlay";

import { OpeningCatalogueEntry } from "./openingCatalogue";
import { fastPgnSanTokens } from "./courseDepth";
import { localizeOpeningName } from "./openingLocalization";
import { CourseProgressStore, findLessonProgress } from "./courseProgress";
import { RepertoireSide, inferSide } from "./courseV3Model";
import {
    loadOpeningPopularity,
    moveGames,
    moveShare,
    OpeningExplorerPosition
} from "./openingExplorerClient";
import * as styles from "./courseRepertoireNavigator.module.css";

interface Props {
    name: string;
    lines: OpeningCatalogueEntry[];
    progress: CourseProgressStore;
    preferredSide?: RepertoireSide;
    percent: number;
    language: string;
    title: string;
    loadingLabel: string;
    onOpen: (
        opening: OpeningCatalogueEntry,
        side?: RepertoireSide,
        startPractice?: boolean,
        blindPractice?: boolean
    ) => void;
    onAddToRepertoire: (
        opening: OpeningCatalogueEntry,
        side: RepertoireSide
    ) => void;
}

interface TreeNode {
    id: string;
    san: string;
    uci: string;
    ply: number;
    fen: string;
    positionKey: string;
    parent?: TreeNode;
    children: Map<string, TreeNode>;
    entries: OpeningCatalogueEntry[];
    descendantLines: number;
    representative?: OpeningCatalogueEntry;
}

interface TreeModel {
    root: TreeNode;
    byId: Map<string, TreeNode>;
    byPosition: Map<string, TreeNode[]>;
    entryNodes: Map<string, TreeNode>;
}

interface Copy {
    subtitle: string;
    fullscreen: string;
    exitFullscreen: string;
    search: string;
    matches: string;
    noResults: string;
    lines: string;
    current: string;
    courseStart: string;
    commonNext: string;
    commonHelp: string;
    games: string;
    loadingStats: string;
    noStats: string;
    explore: string;
    add: string;
    added: string;
    study: string;
    showMore: string;
    showLess: string;
    transposition: string;
    transpositionHelp: string;
    routes: string;
    zoom: string;
    zoomHint: string;
    courseCoverage: string;
    repertoirePrompt: string;
}

const COPY: Record<string, Copy> = {
    en: {
        subtitle: "Build your repertoire one position at a time. Forced moves are skipped automatically so you only stop where there is a real choice.",
        fullscreen: "Full screen",
        exitFullscreen: "Exit full screen",
        search: "Search variation, move or sequence…",
        matches: "matches",
        noResults: "No matching line in this course",
        lines: "course lines",
        current: "Current position",
        courseStart: "Course start",
        commonNext: "What is usually played here?",
        commonHelp: "Percentages are based on games in the Lichess opening-explorer sample, not on unique players.",
        games: "of Lichess games",
        loadingStats: "Loading move popularity…",
        noStats: "Live popularity is unavailable, so course coverage is shown instead.",
        explore: "Explore",
        add: "Add to repertoire",
        added: "Added",
        study: "Study line",
        showMore: "Show more",
        showLess: "Show fewer",
        transposition: "Transposition",
        transpositionHelp: "This same position is also reached through another route in the course.",
        routes: "routes reach this position",
        zoom: "Detail",
        zoomHint: "In full screen, use the mouse wheel to change how many continuations are visible.",
        courseCoverage: "course lines continue here",
        repertoirePrompt: "Choose what you actually want to prepare."
    },
    es: {
        subtitle: "Construye tu repertorio posición a posición. Las jugadas forzadas se saltan solas para que solo te detengas donde hay una decisión real.",
        fullscreen: "Pantalla completa",
        exitFullscreen: "Salir de pantalla completa",
        search: "Buscar variante, movimiento o secuencia…",
        matches: "coincidencias",
        noResults: "No hay líneas coincidentes en este curso",
        lines: "líneas del curso",
        current: "Posición actual",
        courseStart: "Inicio del curso",
        commonNext: "¿Qué se suele jugar aquí?",
        commonHelp: "Los porcentajes corresponden a partidas de la muestra del explorador de Lichess, no a jugadores únicos.",
        games: "de partidas de Lichess",
        loadingStats: "Cargando frecuencia de jugadas…",
        noStats: "La frecuencia en vivo no está disponible, así que se muestra la cobertura del curso.",
        explore: "Explorar",
        add: "Añadir al repertorio",
        added: "Añadida",
        study: "Estudiar línea",
        showMore: "Mostrar más",
        showLess: "Mostrar menos",
        transposition: "Transposición",
        transpositionHelp: "A esta misma posición también se llega por otra ruta del curso.",
        routes: "rutas llegan a esta posición",
        zoom: "Detalle",
        zoomHint: "En pantalla completa, usa la rueda para cambiar cuántas continuaciones se muestran.",
        courseCoverage: "líneas del curso continúan por aquí",
        repertoirePrompt: "Elige solo lo que de verdad quieras preparar."
    }
};

const ARROW_COLOURS = [
    "#5b9ed6",
    "#5cad83",
    "#d2a54d",
    "#9b82c5",
    "#c97762"
];
const NORMAL_LIMIT = 5;
const MORE_STEP = 5;
const SEARCH_LIMIT = 10;

function copyFor(language: string) {
    return COPY[language.split("-")[0].toLowerCase()] || COPY.en;
}

function entryKey(entry: OpeningCatalogueEntry) {
    return `${entry.eco}|${entry.name}|${entry.pgn}`;
}

function positionKey(fen: string) {
    return fen.split(" ").slice(0, 4).join(" ");
}

function createNode(
    id: string,
    san: string,
    uci: string,
    ply: number,
    fen: string,
    parent?: TreeNode
): TreeNode {
    return {
        id,
        san,
        uci,
        ply,
        fen,
        positionKey: positionKey(fen),
        parent,
        children: new Map(),
        entries: [],
        descendantLines: 0
    };
}

function buildModel(lines: OpeningCatalogueEntry[]): TreeModel {
    const board0 = new Chess();
    const root = createNode("root", "", "", -1, board0.fen());
    const byId = new Map<string, TreeNode>([[root.id, root]]);
    const byPosition = new Map<string, TreeNode[]>([[root.positionKey, [root]]]);
    const entryNodes = new Map<string, TreeNode>();

    for (const entry of lines) {
        const sans = fastPgnSanTokens(entry.pgn);
        if (!sans.length) continue;

        const board = new Chess();
        let node = root;

        for (let ply = 0; ply < sans.length; ply++) {
            let move;
            try {
                move = board.move(sans[ply]);
            } catch {
                break;
            }
            if (!move) break;

            const uci = `${move.from}${move.to}${move.promotion || ""}`;
            let child = node.children.get(uci);

            if (!child) {
                child = createNode(
                    `${node.id}/${uci}:${ply}`,
                    move.san,
                    uci,
                    ply,
                    board.fen(),
                    node
                );
                node.children.set(uci, child);
                byId.set(child.id, child);
                const routes = byPosition.get(child.positionKey) || [];
                routes.push(child);
                byPosition.set(child.positionKey, routes);
            }
            node = child;
        }

        node.entries.push(entry);
        entryNodes.set(entryKey(entry), node);
    }

    function annotate(node: TreeNode): number {
        let total = node.entries.length;
        let representative = node.entries[0];
        let best = -1;

        for (const child of node.children.values()) {
            total += annotate(child);
            if (child.descendantLines > best && child.representative) {
                best = child.descendantLines;
                if (!representative) representative = child.representative;
            }
        }

        node.descendantLines = total;
        node.representative = representative;
        return total;
    }

    annotate(root);
    return { root, byId, byPosition, entryNodes };
}

function pathNodes(node: TreeNode) {
    const result: TreeNode[] = [];
    let cursor: TreeNode | undefined = node;

    while (cursor?.parent) {
        result.push(cursor);
        cursor = cursor.parent;
    }

    return result.reverse();
}

function moveLabel(nodes: TreeNode[]) {
    return nodes.map((node, index) => {
        const number = Math.floor(node.ply / 2) + 1;
        if (node.ply % 2 == 0) return `${number}.${node.san}`;
        const previous = nodes[index - 1];
        return previous && previous.ply == node.ply - 1
            ? node.san
            : `${number}...${node.san}`;
    }).join(" ");
}

function normalize(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}+#=.-]+/gu, " ")
        .trim();
}

function exactStudyEntry(node: TreeNode, progress: CourseProgressStore) {
    return node.entries.find(entry => !findLessonProgress(progress, entry))
        || node.entries[0];
}

function branchName(node: TreeNode, language: string, fallback: string) {
    return node.representative
        ? localizeOpeningName(node.representative.name, language)
        : fallback;
}

function explorerMoveFor(
    node: TreeNode,
    explorer: OpeningExplorerPosition | null | undefined
) {
    return explorer?.moves.find(move => move.uci == node.uci);
}

function routeEntry(node: TreeNode, family: string): OpeningCatalogueEntry | undefined {
    const representative = node.entries[0] || node.representative;
    if (!representative) return;

    const board = new Chess();
    for (const step of pathNodes(node)) {
        try {
            board.move(step.san);
        } catch {
            return;
        }
    }

    return {
        eco: representative.eco,
        family,
        name: representative.name,
        pgn: board.pgn()
    };
}

function collapseForced(node: TreeNode) {
    let cursor = node;

    while (cursor.entries.length == 0 && cursor.children.size == 1) {
        const child = Array.from(cursor.children.values())[0];
        if (!child || child.descendantLines != cursor.descendantLines) break;
        cursor = child;
    }

    return cursor;
}

function CourseRepertoireNavigator({
    name,
    lines,
    progress,
    preferredSide,
    percent,
    language,
    title,
    loadingLabel,
    onOpen,
    onAddToRepertoire
}: Props) {
    const copy = copyFor(language);
    const settings = useSettingsStore(state => state.settings);
    const pieces = useMemo(
        () => createCustomPieces(settings.themes.piece),
        [settings.themes.piece]
    );
    const model = useMemo(() => buildModel(lines), [lines]);
    const cardRef = useRef<HTMLDivElement>(null);
    const wheelCarry = useRef(0);
    const initialFocus = useMemo(() => collapseForced(model.root), [model]);

    const [focusId, setFocusId] = useState(initialFocus.id);
    const [query, setQuery] = useState("");
    const [extraVisible, setExtraVisible] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [semanticLevel, setSemanticLevel] = useState(1);
    const [explorer, setExplorer] = useState<OpeningExplorerPosition | null | undefined>();
    const [added, setAdded] = useState<Set<string>>(() => new Set());

    const focus = model.byId.get(focusId) || initialFocus;
    const currentPath = pathNodes(focus);
    const routesHere = (model.byPosition.get(focus.positionKey) || [])
        .filter(node => node.id != focus.id);
    const effectiveLevel = fullscreen ? semanticLevel : 1;

    useEffect(() => {
        setFocusId(collapseForced(model.root).id);
        setQuery("");
        setExtraVisible(0);
        setSemanticLevel(1);
    }, [model, name]);

    useEffect(() => {
        let active = true;
        setExplorer(undefined);
        void loadOpeningPopularity(focus.fen).then(value => {
            if (active) setExplorer(value);
        });
        return () => { active = false; };
    }, [focus.fen]);

    useEffect(() => {
        const onChange = () => setFullscreen(
            document.fullscreenElement == cardRef.current
        );
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    useEffect(() => {
        const card = cardRef.current;
        if (!card || !fullscreen) return;

        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            wheelCarry.current += event.deltaY;
            if (Math.abs(wheelCarry.current) < 36) return;
            const direction = wheelCarry.current < 0 ? 1 : -1;
            wheelCarry.current = 0;
            setSemanticLevel(level => Math.max(0, Math.min(3, level + direction)));
        };

        card.addEventListener("wheel", onWheel, { passive: false });
        return () => card.removeEventListener("wheel", onWheel);
    }, [fullscreen]);

    const records = useMemo(() => (
        Array.from(focus.children.values())
            .map(node => {
                const live = explorerMoveFor(node, explorer);
                return {
                    node,
                    share: moveShare(explorer || null, live),
                    games: moveGames(live)
                };
            })
            .sort((a, b) => (
                a.share != null || b.share != null
                    ? (b.share || 0) - (a.share || 0)
                        || b.node.descendantLines - a.node.descendantLines
                    : b.node.descendantLines - a.node.descendantLines
                        || a.node.san.localeCompare(b.node.san)
            ))
    ), [explorer, focus]);

    const levelBonus = effectiveLevel == 0
        ? -2
        : effectiveLevel == 2
            ? 2
            : effectiveLevel == 3
                ? 5
                : 0;
    const visibleCount = Math.max(
        Math.min(records.length, 3),
        Math.min(records.length, NORMAL_LIMIT + levelBonus + extraVisible)
    );
    const visible = records.slice(0, visibleCount);
    const hidden = Math.max(0, records.length - visibleCount);
    const maxCoverage = Math.max(1, ...records.map(record => record.node.descendantLines));

    const normalizedQuery = normalize(query);
    const searchMatches = useMemo(() => {
        if (!normalizedQuery) {
            return [] as Array<{ entry: OpeningCatalogueEntry; node: TreeNode }>;
        }

        const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
        return lines.flatMap(entry => {
            const node = model.entryNodes.get(entryKey(entry));
            if (!node) return [];
            const haystack = normalize(
                `${entry.name} ${localizeOpeningName(entry.name, language)} ${moveLabel(pathNodes(node))}`
            );
            return haystack.includes(normalizedQuery)
                || tokens.every(token => haystack.includes(token))
                ? [{ entry, node }]
                : [];
        });
    }, [language, lines, model, normalizedQuery]);

    const arrows = visible.slice(0, 4).flatMap((record, index) => (
        record.node.uci.length < 4
            ? []
            : [{
                from: record.node.uci.slice(0, 2) as Square,
                to: record.node.uci.slice(2, 4) as Square,
                colour: ARROW_COLOURS[index],
                overlayColour: ARROW_COLOURS[index]
            }]
    ));

    const exact = exactStudyEntry(focus, progress);
    const boardOrientation: RepertoireSide = preferredSide == "black"
        ? "black"
        : "white";
    const currentTitle = focus == model.root
        ? localizeOpeningName(name, language)
        : branchName(focus, language, focus.san);

    function focusNode(node: TreeNode, collapse = true) {
        const target = collapse ? collapseForced(node) : node;
        setFocusId(target.id);
        setExtraVisible(0);
        setQuery("");
    }

    function addBranch(node: TreeNode) {
        const entry = routeEntry(node, name);
        if (!entry) return;
        onAddToRepertoire(
            entry,
            preferredSide || inferSide(node.representative || entry)
        );
        setAdded(previous => new Set(previous).add(node.id));
    }

    async function toggleFullscreen() {
        const card = cardRef.current;
        if (!card) return;
        try {
            if (document.fullscreenElement == card) await document.exitFullscreen();
            else await card.requestFullscreen();
        } catch {
            // Fullscreen is optional enhancement.
        }
    }

    function study(entry: OpeningCatalogueEntry) {
        const itemProgress = findLessonProgress(progress, entry);
        onOpen(
            entry,
            itemProgress?.side || preferredSide,
            Boolean(itemProgress),
            Boolean(itemProgress)
        );
    }

    return <div
        ref={cardRef}
        className={styles.card}
        data-repertoire-tour="focus-tree"
    >
        <header className={styles.header}>
            <div>
                <strong>{title}</strong>
                <span>{copy.subtitle}</span>
            </div>
            <div className={styles.headerActions}>
                <b>{percent}% · {lines.length} {copy.lines}</b>
                {fullscreen && <div className={styles.zoomControls}>
                    <button
                        type="button"
                        onClick={() => setSemanticLevel(level => Math.max(0, level - 1))}
                        disabled={semanticLevel == 0}
                    >−</button>
                    <span>{copy.zoom} {semanticLevel + 1}/4</span>
                    <button
                        type="button"
                        onClick={() => setSemanticLevel(level => Math.min(3, level + 1))}
                        disabled={semanticLevel == 3}
                    >+</button>
                </div>}
                <button
                    type="button"
                    className={styles.fullscreenButton}
                    data-repertoire-tour="focus-fullscreen"
                    onClick={toggleFullscreen}
                    aria-label={fullscreen ? copy.exitFullscreen : copy.fullscreen}
                    title={fullscreen ? copy.exitFullscreen : copy.fullscreen}
                >{fullscreen ? "↙" : "⛶"}</button>
            </div>
        </header>

        <div className={styles.progress}>
            <i style={{ width: `${percent}%` }} />
        </div>

        <div className={styles.search} data-repertoire-tour="focus-search">
            <span aria-hidden="true">⌕</span>
            <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={copy.search}
            />
            {normalizedQuery && <b>{searchMatches.length} {copy.matches}</b>}
        </div>

        {normalizedQuery && <div className={styles.searchResults}>
            {searchMatches.length == 0 && <p>{copy.noResults}</p>}
            {searchMatches.slice(0, SEARCH_LIMIT).map(match => (
                <button
                    type="button"
                    key={entryKey(match.entry)}
                    onClick={() => focusNode(match.node)}
                >
                    <span>
                        <strong>{localizeOpeningName(match.entry.name, language)}</strong>
                        <small>{moveLabel(pathNodes(match.node).slice(-6))}</small>
                    </span>
                    <em>{match.entry.eco}</em>
                </button>
            ))}
        </div>}

        <nav className={styles.breadcrumb} aria-label={copy.current}>
            <button
                type="button"
                data-current={focus.id == initialFocus.id}
                onClick={() => focusNode(model.root)}
            >{localizeOpeningName(name, language)}</button>
            {currentPath.map(node => <React.Fragment key={node.id}>
                <span>›</span>
                <button
                    type="button"
                    data-current={node.id == focus.id}
                    onClick={() => focusNode(node, false)}
                >{moveLabel([node])}</button>
            </React.Fragment>)}
        </nav>

        <main className={styles.workspace} data-level={effectiveLevel}>
            <section className={styles.boardPanel}>
                <div className={styles.boardHeading}>
                    <span>{copy.current}</span>
                    <strong>{currentTitle}</strong>
                    <small>{
                        currentPath.length
                            ? moveLabel(currentPath.slice(-8))
                            : copy.courseStart
                    }</small>
                </div>
                <div className={styles.boardWrap}>
                    <Chessboard
                        id="repertoire-course-navigator-board"
                        position={focus.fen}
                        boardOrientation={boardOrientation}
                        arePiecesDraggable={false}
                        customPieces={pieces}
                        customDarkSquareStyle={{
                            backgroundColor: settings.themes.board.darkSquareColour
                        }}
                        customLightSquareStyle={{
                            backgroundColor: settings.themes.board.lightSquareColour
                        }}
                        showBoardNotation={settings.themes.board.coordinates == "inside"}
                    />
                    <SuggestionArrowOverlay
                        arrows={arrows}
                        flipped={boardOrientation == "black"}
                    />
                </div>
                <div className={styles.positionMeta}>
                    {explorer === undefined
                        ? <span>{copy.loadingStats}</span>
                        : explorer === null
                            ? <span>{copy.noStats}</span>
                            : <span>{copy.commonHelp}</span>}
                </div>
            </section>

            <section className={styles.decisionPanel}>
                <header className={styles.decisionHeader}>
                    <div>
                        <span>{copy.commonNext}</span>
                        <h3>{currentPath.length
                            ? moveLabel(currentPath.slice(-4))
                            : localizeOpeningName(name, language)}</h3>
                        <p>{copy.repertoirePrompt}</p>
                    </div>
                    <strong>{focus.descendantLines} {copy.courseCoverage}</strong>
                </header>

                {routesHere.length > 0 && <div className={styles.transpositions}>
                    <div>
                        <strong>↔ {copy.transposition}</strong>
                        <span>{copy.transpositionHelp}</span>
                    </div>
                    <div>
                        {routesHere.slice(0, 3).map(route => (
                            <button
                                type="button"
                                key={route.id}
                                onClick={() => focusNode(route, false)}
                            >{moveLabel(pathNodes(route).slice(-5))}</button>
                        ))}
                    </div>
                </div>}

                {visible.length > 0 && <div
                    className={styles.moveList}
                    data-repertoire-tour="focus-branches"
                >
                    {visible.map((record, index) => {
                        const node = record.node;
                        const studyEntry = exactStudyEntry(node, progress);
                        const routeCount = model.byPosition.get(node.positionKey)?.length || 1;
                        const share = record.share;
                        const metricValue = share != null
                            ? `${Math.round(share)}%`
                            : `${node.descendantLines}`;
                        const metricLabel = share != null
                            ? copy.games
                            : copy.lines;
                        const barWidth = share != null
                            ? Math.max(3, Math.min(100, share))
                            : Math.max(3, node.descendantLines / maxCoverage * 100);
                        const colour = ARROW_COLOURS[index % ARROW_COLOURS.length];

                        return <article
                            key={node.id}
                            className={styles.moveRow}
                            style={{ "--move-colour": colour } as React.CSSProperties}
                        >
                            <div className={styles.moveAccent} />
                            <div className={styles.moveIdentity}>
                                <strong>{moveLabel([node])}</strong>
                                <span>{branchName(node, language, node.san)}</span>
                                {routeCount > 1 && <em>
                                    ↔ {copy.transposition} · {routeCount}
                                </em>}
                            </div>
                            <div className={styles.moveMetric}>
                                <div>
                                    <strong>{metricValue}</strong>
                                    <small>{metricLabel}</small>
                                </div>
                                <i><b style={{ width: `${barWidth}%` }} /></i>
                                {share != null && record.games > 0 && <small>
                                    {record.games.toLocaleString()}
                                </small>}
                            </div>
                            <div className={styles.moveActions}>
                                <button
                                    type="button"
                                    onClick={() => focusNode(node)}
                                >{copy.explore} →</button>
                                <button
                                    type="button"
                                    data-primary
                                    disabled={added.has(node.id)}
                                    onClick={() => addBranch(node)}
                                >{added.has(node.id)
                                    ? `✓ ${copy.added}`
                                    : `＋ ${copy.add}`}</button>
                                {studyEntry && <button
                                    type="button"
                                    data-study
                                    onClick={() => study(studyEntry)}
                                >{copy.study}</button>}
                            </div>
                        </article>;
                    })}
                </div>}

                <div className={styles.listControls}>
                    {hidden > 0 && <button
                        type="button"
                        onClick={() => setExtraVisible(value => value + MORE_STEP)}
                    >＋ {copy.showMore} ({hidden})</button>}
                    {extraVisible > 0 && <button
                        type="button"
                        onClick={() => setExtraVisible(0)}
                    >↑ {copy.showLess}</button>}
                </div>

                {!model.root.descendantLines && <div className={styles.empty}>
                    {loadingLabel}
                </div>}

                {exact && <div className={styles.exactLine}>
                    <span>{localizeOpeningName(exact.name, language)}</span>
                    <button
                        type="button"
                        data-repertoire-tour="study-next"
                        onClick={() => study(exact)}
                    >{copy.study} →</button>
                </div>}
            </section>
        </main>

        {fullscreen && <footer className={styles.fullscreenHint}>
            {copy.zoomHint}
        </footer>}
    </div>;
}

export default CourseRepertoireNavigator;
