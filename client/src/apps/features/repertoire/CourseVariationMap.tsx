import React, { useEffect, useMemo, useRef, useState } from "react";

import { OpeningCatalogueEntry } from "./openingCatalogue";
import { fastPgnSanTokens } from "./courseDepth";
import { localizeOpeningName } from "./openingLocalization";
import { CourseProgressStore, findLessonProgress } from "./courseProgress";
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

interface FocusNode {
    id: string;
    san: string;
    ply: number;
    parent?: FocusNode;
    children: Map<string, FocusNode>;
    entries: OpeningCatalogueEntry[];
    descendantLines: number;
    representative?: OpeningCatalogueEntry;
}

interface FocusModel {
    root: FocusNode;
    byId: Map<string, FocusNode>;
    entryNodes: Map<string, FocusNode>;
}

interface Segment {
    nodes: FocusNode[];
    end: FocusNode;
}

interface Copy {
    subtitle: string;
    fullscreen: string;
    exitFullscreen: string;
    search: string;
    searchResults: string;
    noResults: string;
    alternatives: string;
    lines: string;
    study: string;
    main: string;
    zoom: string;
    zoomHint: string;
    root: string;
    branch: string;
}

const COPY: Record<string, Copy> = {
    en: { subtitle: "Follow one branch at a time. The tree only shows the context you need.", fullscreen: "Full screen", exitFullscreen: "Exit full screen", search: "Search variation, move or sequence…", searchResults: "matches", noResults: "No matching line in this course", alternatives: "alternatives", lines: "lines", study: "Study line", main: "Course path", zoom: "Detail", zoomHint: "In full screen, use the mouse wheel to change the level of detail.", root: "Course", branch: "Branch" },
    es: { subtitle: "Sigue una rama cada vez. El árbol solo muestra el contexto que necesitas.", fullscreen: "Pantalla completa", exitFullscreen: "Salir de pantalla completa", search: "Buscar variante, movimiento o secuencia…", searchResults: "coincidencias", noResults: "No hay líneas coincidentes en este curso", alternatives: "alternativas", lines: "líneas", study: "Estudiar línea", main: "Ruta del curso", zoom: "Detalle", zoomHint: "En pantalla completa, usa la rueda para cambiar el nivel de detalle.", root: "Curso", branch: "Rama" },
    fr: { subtitle: "Suivez une branche à la fois. L’arbre n’affiche que le contexte utile.", fullscreen: "Plein écran", exitFullscreen: "Quitter le plein écran", search: "Rechercher variante, coup ou séquence…", searchResults: "résultats", noResults: "Aucune ligne correspondante dans ce cours", alternatives: "alternatives", lines: "lignes", study: "Étudier la ligne", main: "Parcours du cours", zoom: "Détail", zoomHint: "En plein écran, utilisez la molette pour changer le niveau de détail.", root: "Cours", branch: "Branche" },
    de: { subtitle: "Folge jeweils einem Zweig. Der Baum zeigt nur den nötigen Kontext.", fullscreen: "Vollbild", exitFullscreen: "Vollbild verlassen", search: "Variante, Zug oder Folge suchen…", searchResults: "Treffer", noResults: "Keine passende Linie in diesem Kurs", alternatives: "Alternativen", lines: "Linien", study: "Linie lernen", main: "Kursweg", zoom: "Detail", zoomHint: "Im Vollbild ändert das Mausrad die Detailstufe.", root: "Kurs", branch: "Zweig" },
    pt: { subtitle: "Siga um ramo de cada vez. A árvore mostra apenas o contexto necessário.", fullscreen: "Ecrã inteiro", exitFullscreen: "Sair do ecrã inteiro", search: "Pesquisar variante, lance ou sequência…", searchResults: "resultados", noResults: "Nenhuma linha correspondente neste curso", alternatives: "alternativas", lines: "linhas", study: "Estudar linha", main: "Rota do curso", zoom: "Detalhe", zoomHint: "Em ecrã inteiro, use a roda para alterar o nível de detalhe.", root: "Curso", branch: "Ramo" },
    ru: { subtitle: "Изучайте по одной ветке. Дерево показывает только нужный контекст.", fullscreen: "Во весь экран", exitFullscreen: "Выйти из полноэкранного режима", search: "Поиск варианта, хода или последовательности…", searchResults: "совпадений", noResults: "В этом курсе совпадений нет", alternatives: "альтернатив", lines: "линий", study: "Изучить линию", main: "Маршрут курса", zoom: "Детали", zoomHint: "В полноэкранном режиме колесо меняет уровень детализации.", root: "Курс", branch: "Ветка" },
    zh: { subtitle: "一次专注一个分支。树只显示当前需要的上下文。", fullscreen: "全屏", exitFullscreen: "退出全屏", search: "搜索变例、走法或走法序列…", searchResults: "个结果", noResults: "本课程没有匹配路线", alternatives: "个其他选择", lines: "条路线", study: "学习路线", main: "课程路径", zoom: "细节", zoomHint: "全屏时使用鼠标滚轮切换细节层级。", root: "课程", branch: "分支" },
    vi: { subtitle: "Theo từng nhánh một. Cây chỉ hiển thị ngữ cảnh bạn cần.", fullscreen: "Toàn màn hình", exitFullscreen: "Thoát toàn màn hình", search: "Tìm biến, nước đi hoặc chuỗi…", searchResults: "kết quả", noResults: "Không có dòng phù hợp trong khóa học", alternatives: "lựa chọn khác", lines: "dòng", study: "Học dòng", main: "Lộ trình khóa học", zoom: "Chi tiết", zoomHint: "Ở toàn màn hình, dùng con lăn để đổi mức chi tiết.", root: "Khóa học", branch: "Nhánh" },
    hi: { subtitle: "एक समय में एक शाखा देखें। वृक्ष केवल आवश्यक संदर्भ दिखाता है।", fullscreen: "पूर्ण स्क्रीन", exitFullscreen: "पूर्ण स्क्रीन से बाहर", search: "वेरिएशन, चाल या क्रम खोजें…", searchResults: "परिणाम", noResults: "इस कोर्स में कोई मिलती लाइन नहीं", alternatives: "विकल्प", lines: "लाइनें", study: "लाइन पढ़ें", main: "कोर्स पथ", zoom: "विवरण", zoomHint: "पूर्ण स्क्रीन में व्हील से विवरण स्तर बदलें।", root: "कोर्स", branch: "शाखा" },
    mr: { subtitle: "एका वेळी एक फांदी पाहा. झाड फक्त आवश्यक संदर्भ दाखवते.", fullscreen: "पूर्ण स्क्रीन", exitFullscreen: "पूर्ण स्क्रीनमधून बाहेर", search: "व्हेरिएशन, चाल किंवा क्रम शोधा…", searchResults: "निकाल", noResults: "या कोर्समध्ये जुळणारी लाईन नाही", alternatives: "पर्याय", lines: "लाईन्स", study: "लाईन शिका", main: "कोर्स मार्ग", zoom: "तपशील", zoomHint: "पूर्ण स्क्रीनमध्ये व्हीलने तपशीलाची पातळी बदला.", root: "कोर्स", branch: "फांदी" },
    pl: { subtitle: "Podążaj jedną gałęzią naraz. Drzewo pokazuje tylko potrzebny kontekst.", fullscreen: "Pełny ekran", exitFullscreen: "Wyjdź z pełnego ekranu", search: "Szukaj wariantu, ruchu lub sekwencji…", searchResults: "wyników", noResults: "Brak pasującej linii w tym kursie", alternatives: "alternatyw", lines: "linie", study: "Ucz się linii", main: "Ścieżka kursu", zoom: "Szczegóły", zoomHint: "Na pełnym ekranie kółko myszy zmienia poziom szczegółów.", root: "Kurs", branch: "Gałąź" }
};

const NORMAL_BRANCH_LIMIT = 4;
const FULLSCREEN_LIMITS = [3, 5, 8, 10];
const SEGMENT_LIMITS = [1, 4, 7, 14];
const SEARCH_LIMIT = 12;

function entryKey(entry: OpeningCatalogueEntry) {
    return `${entry.eco}|${entry.name}|${entry.pgn}`;
}

function createNode(id: string, san = "", ply = -1, parent?: FocusNode): FocusNode {
    return { id, san, ply, parent, children: new Map<string, FocusNode>(), entries: [], descendantLines: 0 };
}

function buildModel(lines: OpeningCatalogueEntry[]): FocusModel {
    const root = createNode("root");
    const byId = new Map<string, FocusNode>([[root.id, root]]);
    const entryNodes = new Map<string, FocusNode>();

    for (const entry of lines) {
        const sans = fastPgnSanTokens(entry.pgn);
        if (!sans.length) continue;
        let node = root;
        sans.forEach((san, ply) => {
            const key = san;
            let child = node.children.get(key);
            if (!child) {
                child = createNode(`${node.id}/${encodeURIComponent(key)}:${ply}`, san, ply, node);
                node.children.set(key, child);
                byId.set(child.id, child);
            }
            node = child;
        });
        node.entries.push(entry);
        entryNodes.set(entryKey(entry), node);
    }

    function annotate(node: FocusNode): number {
        let total = node.entries.length;
        let bestEntry = node.entries[0];
        let bestChildCount = -1;
        for (const child of node.children.values()) {
            total += annotate(child);
            if (child.descendantLines > bestChildCount && child.representative) {
                bestChildCount = child.descendantLines;
                if (!bestEntry) bestEntry = child.representative;
            }
        }
        node.descendantLines = total;
        node.representative = bestEntry;
        return total;
    }
    annotate(root);
    return { root, byId, entryNodes };
}

function moveLabel(nodes: FocusNode[]) {
    return nodes.map((node, index) => {
        const number = Math.floor(node.ply / 2) + 1;
        if (node.ply % 2 == 0) return `${number}.${node.san}`;
        const previous = nodes[index - 1];
        return previous && previous.ply == node.ply - 1 ? node.san : `${number}...${node.san}`;
    }).join(" ");
}

function sanPath(node: FocusNode) {
    const path: FocusNode[] = [];
    let cursor: FocusNode | undefined = node;
    while (cursor && cursor.parent) {
        path.push(cursor);
        cursor = cursor.parent;
    }
    return path.reverse();
}

function segmentFrom(start: FocusNode, maximum: number): Segment {
    const nodes: FocusNode[] = start.parent ? [start] : [];
    let end = start;
    while (end.children.size == 1 && nodes.length < maximum) {
        const child = Array.from(end.children.values())[0];
        nodes.push(child);
        end = child;
    }
    return { nodes, end };
}

function isAncestor(ancestor: FocusNode, node?: FocusNode) {
    let cursor = node;
    while (cursor) {
        if (cursor == ancestor) return true;
        cursor = cursor.parent;
    }
    return false;
}

function normalizeSearch(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}+#=.-]+/gu, " ")
        .trim();
}

function branchName(node: FocusNode, family: string, language: string, fundamentalsLabel: string) {
    const entry = node.representative;
    if (!entry) return "";
    if (entry.name == family) return fundamentalsLabel;
    return localizeOpeningName(entry.name, language);
}

function pickEntry(node: FocusNode, progress: CourseProgressStore) {
    const candidates = node.entries.length ? node.entries : node.representative ? [node.representative] : [];
    return candidates.find(entry => !findLessonProgress(progress, entry)) || candidates[0];
}

function breadcrumbNodes(root: FocusNode, focus: FocusNode) {
    const path = sanPath(focus);
    const result: FocusNode[] = [root];
    path.forEach(node => {
        if (node == focus || (node.parent && node.parent.children.size > 1)) result.push(node);
    });
    return result;
}

function CourseVariationMap({ name, lines, progress, preferredSide, recommendedItem, percent, language, title, fundamentalsLabel, loadingLabel, onOpen }: Props) {
    const lang = language.split("-")[0].toLowerCase();
    const copy = COPY[lang] || COPY.en;
    const cardRef = useRef<HTMLDivElement>(null);
    const wheelCarry = useRef(0);
    const model = useMemo(() => buildModel(lines), [lines]);
    const [focusId, setFocusId] = useState("root");
    const [showAlternatives, setShowAlternatives] = useState(false);
    const [query, setQuery] = useState("");
    const [fullscreen, setFullscreen] = useState(false);
    const [semanticLevel, setSemanticLevel] = useState(1);

    useEffect(() => {
        setFocusId("root");
        setShowAlternatives(false);
        setQuery("");
        setSemanticLevel(1);
    }, [name]);

    useEffect(() => {
        const onChange = () => setFullscreen(document.fullscreenElement == cardRef.current);
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    useEffect(() => {
        const card = cardRef.current;
        if (!card || !fullscreen) return;
        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            wheelCarry.current += event.deltaY;
            if (Math.abs(wheelCarry.current) < 38) return;
            const direction = wheelCarry.current < 0 ? 1 : -1;
            wheelCarry.current = 0;
            setSemanticLevel(level => Math.max(0, Math.min(3, level + direction)));
        };
        card.addEventListener("wheel", onWheel, { passive: false });
        return () => card.removeEventListener("wheel", onWheel);
    }, [fullscreen]);

    const focus = model.byId.get(focusId) || model.root;
    const effectiveLevel = fullscreen ? semanticLevel : 1;
    const stem = segmentFrom(focus, SEGMENT_LIMITS[effectiveLevel]);
    const anchor = stem.end;
    const recommendedNode = recommendedItem ? model.entryNodes.get(entryKey(recommendedItem)) : undefined;

    const branches = useMemo(() => Array.from(anchor.children.values()).sort((a, b) => {
        const aRecommended = isAncestor(a, recommendedNode) ? 1 : 0;
        const bRecommended = isAncestor(b, recommendedNode) ? 1 : 0;
        return bRecommended - aRecommended
            || b.descendantLines - a.descendantLines
            || a.san.localeCompare(b.san);
    }), [anchor, recommendedNode]);

    const branchLimit = fullscreen ? FULLSCREEN_LIMITS[effectiveLevel] : NORMAL_BRANCH_LIMIT;
    const visibleBranches = showAlternatives ? branches.slice(0, 10) : branches.slice(0, branchLimit);
    const hiddenCount = Math.max(0, branches.length - visibleBranches.length);
    const crumbs = breadcrumbNodes(model.root, focus);
    const directEntry = pickEntry(anchor, progress);

    const normalizedQuery = normalizeSearch(query);
    const searchMatches = useMemo(() => {
        if (!normalizedQuery) return [] as Array<{ entry: OpeningCatalogueEntry; node: FocusNode; sans: string[] }>;
        const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
        const matches: Array<{ entry: OpeningCatalogueEntry; node: FocusNode; sans: string[] }> = [];
        for (const entry of lines) {
            const node = model.entryNodes.get(entryKey(entry));
            if (!node) continue;
            const sans = fastPgnSanTokens(entry.pgn);
            const localized = localizeOpeningName(entry.name, language);
            const haystack = normalizeSearch(`${entry.name} ${localized} ${sans.join(" ")}`);
            if (haystack.includes(normalizedQuery) || tokens.every(token => haystack.includes(token))) {
                matches.push({ entry, node, sans });
            }
        }
        return matches;
    }, [language, lines, model, normalizedQuery]);

    function focusSearchResult(node: FocusNode) {
        let target = node;
        while (target.parent && target.parent != model.root && target.parent.children.size == 1) target = target.parent;
        setFocusId(target.id);
        setShowAlternatives(false);
        setQuery("");
    }

    function openBranch(node: FocusNode) {
        const branch = segmentFrom(node, SEGMENT_LIMITS[effectiveLevel]);
        if (branch.end.children.size == 0 && branch.end.descendantLines == 1) {
            const entry = pickEntry(branch.end, progress);
            if (entry) {
                const itemProgress = findLessonProgress(progress, entry);
                onOpen(entry, itemProgress?.side || preferredSide, Boolean(itemProgress), Boolean(itemProgress));
                return;
            }
        }
        setFocusId(branch.end.id);
        setShowAlternatives(false);
    }

    async function toggleFullscreen() {
        const card = cardRef.current;
        if (!card) return;
        try {
            if (document.fullscreenElement == card) await document.exitFullscreen();
            else await card.requestFullscreen();
        } catch {
            // Full screen is optional; the focused tree remains fully usable.
        }
    }

    const currentName = branchName(anchor, name, language, fundamentalsLabel) || localizeOpeningName(name, language);
    const fullPathEntry = anchor.representative;
    const fullPath = fullPathEntry ? fastPgnSanTokens(fullPathEntry.pgn) : [];

    return <div ref={cardRef} className={mapStyles.mapCard} data-repertoire-tour="focus-tree">
        <div className={mapStyles.mapHead}>
            <div className={mapStyles.mapHeadText}>
                <strong>{title}</strong>
                <span>{copy.subtitle}</span>
            </div>
            <div className={mapStyles.mapHeadRight}>
                <span className={mapStyles.mapProgress}>{percent}% · {lines.length} {copy.lines}</span>
                {fullscreen && <div className={mapStyles.semanticControls} aria-label={copy.zoom}>
                    <button type="button" onClick={() => setSemanticLevel(level => Math.max(0, level - 1))} disabled={semanticLevel == 0}>−</button>
                    <span>{copy.zoom} {semanticLevel + 1}/4</span>
                    <button type="button" onClick={() => setSemanticLevel(level => Math.min(3, level + 1))} disabled={semanticLevel == 3}>+</button>
                </div>}
                <button type="button" className={mapStyles.fullscreenButton} data-repertoire-tour="focus-fullscreen" onClick={toggleFullscreen} title={fullscreen ? copy.exitFullscreen : copy.fullscreen} aria-label={fullscreen ? copy.exitFullscreen : copy.fullscreen}>
                    {fullscreen
                        ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"/></svg>
                        : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6"/></svg>}
                </button>
            </div>
        </div>

        <div className={mapStyles.mapTrack}><i style={{ width: `${percent}%` }}/></div>

        <div className={mapStyles.searchWrap} data-repertoire-tour="focus-search">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder={copy.search}/>
            {normalizedQuery && <span>{searchMatches.length} {copy.searchResults}</span>}
        </div>

        {normalizedQuery && <div className={mapStyles.searchResults}>
            {searchMatches.length == 0 && <p>{copy.noResults}</p>}
            {searchMatches.slice(0, SEARCH_LIMIT).map(match => <button type="button" key={entryKey(match.entry)} onClick={() => focusSearchResult(match.node)}>
                <span><strong>{localizeOpeningName(match.entry.name, language)}</strong><small>{moveLabel(sanPath(match.node).slice(-8))}</small></span>
                <em>{match.entry.eco}</em>
            </button>)}
            {searchMatches.length > SEARCH_LIMIT && <small className={mapStyles.moreMatches}>+{searchMatches.length - SEARCH_LIMIT} {copy.searchResults}</small>}
        </div>}

        <nav className={mapStyles.breadcrumb} data-repertoire-tour="focus-breadcrumb" aria-label={copy.main}>
            {crumbs.map((node, index) => <React.Fragment key={node.id}>
                {index > 0 && <span>›</span>}
                <button type="button" data-current={node == focus} onClick={() => { setFocusId(node.id); setShowAlternatives(false); }}>
                    {node == model.root ? localizeOpeningName(name, language) : moveLabel([node])}
                </button>
            </React.Fragment>)}
        </nav>

        <section className={mapStyles.focusViewport} data-level={effectiveLevel}>
            <div className={mapStyles.currentNode}>
                <span>{focus == model.root ? copy.root : copy.branch}</span>
                <strong>{currentName}</strong>
                {effectiveLevel > 0 && stem.nodes.length > 0 && <p>{moveLabel(stem.nodes)}</p>}
                <small>{anchor.descendantLines} {copy.lines}</small>
                {anchor.children.size == 0 && directEntry && <button type="button" className={mapStyles.studyButton} onClick={() => {
                    const itemProgress = findLessonProgress(progress, directEntry);
                    onOpen(directEntry, itemProgress?.side || preferredSide, Boolean(itemProgress), Boolean(itemProgress));
                }}>{copy.study}</button>}
            </div>

            {effectiveLevel == 3 && fullPath.length > 0 && <div className={mapStyles.fullPath}>
                <span>{copy.main}</span>
                <p>{fullPath.map((san, ply) => moveLabel([{ ...anchor, san, ply }])).join(" ")}</p>
            </div>}

            {branches.length > 0 && <>
                <div className={mapStyles.treeStem} aria-hidden="true"/>
                <div className={mapStyles.branchGrid} data-repertoire-tour="focus-branches">
                    {visibleBranches.map(branch => {
                        const preview = segmentFrom(branch, SEGMENT_LIMITS[effectiveLevel]);
                        const title = branchName(preview.end, name, language, fundamentalsLabel) || branchName(branch, name, language, fundamentalsLabel);
                        const recommended = Boolean(recommendedNode && isAncestor(branch, recommendedNode));
                        return <button type="button" key={branch.id} className={mapStyles.branchCard} data-recommended={recommended} data-repertoire-tour={recommended ? "focus-branch" : undefined} onClick={() => openBranch(branch)}>
                            <span className={mapStyles.branchMove}>{effectiveLevel == 0 ? moveLabel([branch]) : moveLabel(preview.nodes)}</span>
                            {title && <strong>{title}</strong>}
                            <small>{branch.descendantLines} {copy.lines}{recommended ? ` · ${copy.main}` : ""}</small>
                        </button>;
                    })}
                    {hiddenCount > 0 && <button type="button" className={mapStyles.alternativesButton} onClick={() => setShowAlternatives(true)}>+ {hiddenCount} {copy.alternatives}</button>}
                    {showAlternatives && branches.length > 10 && <button type="button" className={mapStyles.alternativesButton} onClick={() => setShowAlternatives(false)}>− {copy.alternatives}</button>}
                </div>
            </>}
        </section>

        {fullscreen && <div className={mapStyles.fullscreenHint}>{copy.zoomHint}</div>}
        {!model.root.descendantLines && <div className={mapStyles.mapEmpty}>{loadingLabel}</div>}
    </div>;
}

export default CourseVariationMap;
