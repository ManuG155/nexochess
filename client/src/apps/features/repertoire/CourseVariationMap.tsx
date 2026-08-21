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
    lines: string;
    linesInBranch: string;
    study: string;
    main: string;
    zoom: string;
    zoomHint: string;
    root: string;
    branch: string;
    current: string;
    choose: string;
    chooseHint: string;
    recommended: string;
    lineReady: string;
    showMore: string;
    showLess: string;
    exactLine: string;
}

const COPY: Record<string, Copy> = {
    en: { subtitle: "Choose one decision at a time. Nothing opens a lesson until you explicitly press Study line.", fullscreen: "Full screen", exitFullscreen: "Exit full screen", search: "Search variation, move or sequence…", searchResults: "matches", noResults: "No matching line in this course", lines: "lines", linesInBranch: "lines in this branch", study: "Study this line", main: "Course path", zoom: "Detail", zoomHint: "In full screen, use the mouse wheel to change the level of detail.", root: "Course start", branch: "Current branch", current: "You are here", choose: "Choose the next continuation", chooseHint: "Each card is one branch. Open it to narrow the tree; studying starts only from the blue button when an exact line is selected.", recommended: "Recommended next", lineReady: "Line selected", showMore: "Show more", showLess: "Show fewer", exactLine: "Exact study line" },
    es: { subtitle: "Elige una decisión cada vez. Ninguna tarjeta abre una lección hasta que pulses Estudiar esta línea.", fullscreen: "Pantalla completa", exitFullscreen: "Salir de pantalla completa", search: "Buscar variante, movimiento o secuencia…", searchResults: "coincidencias", noResults: "No hay líneas coincidentes en este curso", lines: "líneas", linesInBranch: "líneas en esta rama", study: "Estudiar esta línea", main: "Ruta del curso", zoom: "Detalle", zoomHint: "En pantalla completa, usa la rueda para cambiar el nivel de detalle.", root: "Inicio del curso", branch: "Rama actual", current: "Estás aquí", choose: "Elige la siguiente continuación", chooseHint: "Cada tarjeta es una rama. Ábrela para acotar el árbol; el estudio solo empieza con el botón azul cuando hayas llegado a una línea concreta.", recommended: "Siguiente recomendada", lineReady: "Línea seleccionada", showMore: "Mostrar más", showLess: "Mostrar menos", exactLine: "Línea concreta de estudio" },
    fr: { subtitle: "Choisissez une décision à la fois. Aucune carte n’ouvre une leçon avant d’appuyer sur Étudier cette ligne.", fullscreen: "Plein écran", exitFullscreen: "Quitter le plein écran", search: "Rechercher variante, coup ou séquence…", searchResults: "résultats", noResults: "Aucune ligne correspondante dans ce cours", lines: "lignes", linesInBranch: "lignes dans cette branche", study: "Étudier cette ligne", main: "Parcours du cours", zoom: "Détail", zoomHint: "En plein écran, utilisez la molette pour changer le niveau de détail.", root: "Début du cours", branch: "Branche actuelle", current: "Vous êtes ici", choose: "Choisissez la suite", chooseHint: "Chaque carte est une branche. Ouvrez-la pour réduire l’arbre ; l’étude ne commence qu’avec le bouton bleu lorsqu’une ligne précise est sélectionnée.", recommended: "Suite recommandée", lineReady: "Ligne sélectionnée", showMore: "Afficher plus", showLess: "Afficher moins", exactLine: "Ligne d’étude précise" },
    de: { subtitle: "Wähle jeweils eine Entscheidung. Eine Lektion startet erst, wenn du ausdrücklich Linie lernen drückst.", fullscreen: "Vollbild", exitFullscreen: "Vollbild verlassen", search: "Variante, Zug oder Folge suchen…", searchResults: "Treffer", noResults: "Keine passende Linie in diesem Kurs", lines: "Linien", linesInBranch: "Linien in diesem Zweig", study: "Diese Linie lernen", main: "Kursweg", zoom: "Detail", zoomHint: "Im Vollbild ändert das Mausrad die Detailstufe.", root: "Kursanfang", branch: "Aktueller Zweig", current: "Du bist hier", choose: "Nächste Fortsetzung wählen", chooseHint: "Jede Karte ist ein Zweig. Öffne sie, um den Baum einzugrenzen; gelernt wird erst über den blauen Button bei einer konkreten Linie.", recommended: "Empfohlener nächster Schritt", lineReady: "Linie ausgewählt", showMore: "Mehr anzeigen", showLess: "Weniger anzeigen", exactLine: "Konkrete Lernlinie" },
    pt: { subtitle: "Escolha uma decisão de cada vez. Nenhum cartão abre uma lição até premir Estudar esta linha.", fullscreen: "Ecrã inteiro", exitFullscreen: "Sair do ecrã inteiro", search: "Pesquisar variante, lance ou sequência…", searchResults: "resultados", noResults: "Nenhuma linha correspondente neste curso", lines: "linhas", linesInBranch: "linhas neste ramo", study: "Estudar esta linha", main: "Rota do curso", zoom: "Detalhe", zoomHint: "Em ecrã inteiro, use a roda para alterar o nível de detalhe.", root: "Início do curso", branch: "Ramo atual", current: "Está aqui", choose: "Escolha a próxima continuação", chooseHint: "Cada cartão é um ramo. Abra-o para reduzir a árvore; o estudo só começa no botão azul quando chegar a uma linha concreta.", recommended: "Próxima recomendada", lineReady: "Linha selecionada", showMore: "Mostrar mais", showLess: "Mostrar menos", exactLine: "Linha concreta de estudo" },
    ru: { subtitle: "Выбирайте по одному решению. Урок не откроется, пока вы явно не нажмёте Изучить эту линию.", fullscreen: "Во весь экран", exitFullscreen: "Выйти из полноэкранного режима", search: "Поиск варианта, хода или последовательности…", searchResults: "совпадений", noResults: "В этом курсе совпадений нет", lines: "линий", linesInBranch: "линий в этой ветке", study: "Изучить эту линию", main: "Маршрут курса", zoom: "Детали", zoomHint: "В полноэкранном режиме колесо меняет уровень детализации.", root: "Начало курса", branch: "Текущая ветка", current: "Вы здесь", choose: "Выберите следующее продолжение", chooseHint: "Каждая карточка — одна ветка. Открывайте её, чтобы сузить дерево; обучение запускается только синей кнопкой после выбора конкретной линии.", recommended: "Рекомендуется дальше", lineReady: "Линия выбрана", showMore: "Показать ещё", showLess: "Показать меньше", exactLine: "Конкретная учебная линия" },
    zh: { subtitle: "每次只做一个选择。只有明确点击“学习此线路”才会进入课程。", fullscreen: "全屏", exitFullscreen: "退出全屏", search: "搜索变例、走法或走法序列…", searchResults: "个结果", noResults: "本课程没有匹配路线", lines: "条路线", linesInBranch: "条路线在此分支", study: "学习此线路", main: "课程路径", zoom: "细节", zoomHint: "全屏时使用鼠标滚轮切换细节层级。", root: "课程起点", branch: "当前分支", current: "当前位置", choose: "选择下一步分支", chooseHint: "每张卡片代表一个分支。打开它继续缩小范围；只有选中具体线路后，蓝色按钮才会开始学习。", recommended: "推荐下一步", lineReady: "已选择线路", showMore: "显示更多", showLess: "收起", exactLine: "具体学习线路" },
    vi: { subtitle: "Chọn từng quyết định một. Bài học chỉ mở khi bạn bấm rõ ràng Học dòng này.", fullscreen: "Toàn màn hình", exitFullscreen: "Thoát toàn màn hình", search: "Tìm biến, nước đi hoặc chuỗi…", searchResults: "kết quả", noResults: "Không có dòng phù hợp trong khóa học", lines: "dòng", linesInBranch: "dòng trong nhánh này", study: "Học dòng này", main: "Lộ trình khóa học", zoom: "Chi tiết", zoomHint: "Ở toàn màn hình, dùng con lăn để đổi mức chi tiết.", root: "Đầu khóa học", branch: "Nhánh hiện tại", current: "Bạn đang ở đây", choose: "Chọn tiếp diễn tiếp theo", chooseHint: "Mỗi thẻ là một nhánh. Mở nó để thu hẹp cây; chỉ nút xanh mới bắt đầu học khi đã chọn một dòng cụ thể.", recommended: "Tiếp theo được đề xuất", lineReady: "Đã chọn dòng", showMore: "Hiện thêm", showLess: "Hiện ít hơn", exactLine: "Dòng học cụ thể" },
    hi: { subtitle: "एक बार में एक निर्णय चुनें। पाठ तभी खुलेगा जब आप साफ़ तौर पर यह लाइन पढ़ें दबाएँगे।", fullscreen: "पूर्ण स्क्रीन", exitFullscreen: "पूर्ण स्क्रीन से बाहर", search: "वेरिएशन, चाल या क्रम खोजें…", searchResults: "परिणाम", noResults: "इस कोर्स में कोई मिलती लाइन नहीं", lines: "लाइनें", linesInBranch: "इस शाखा में लाइनें", study: "यह लाइन पढ़ें", main: "कोर्स पथ", zoom: "विवरण", zoomHint: "पूर्ण स्क्रीन में व्हील से विवरण स्तर बदलें।", root: "कोर्स की शुरुआत", branch: "मौजूदा शाखा", current: "आप यहाँ हैं", choose: "अगला रास्ता चुनें", chooseHint: "हर कार्ड एक शाखा है। ट्री को छोटा करने के लिए उसे खोलें; किसी ठोस लाइन पर पहुँचने के बाद ही नीला बटन अध्ययन शुरू करता है।", recommended: "अगला सुझाया गया", lineReady: "लाइन चुनी गई", showMore: "और दिखाएँ", showLess: "कम दिखाएँ", exactLine: "ठोस अध्ययन लाइन" },
    mr: { subtitle: "एका वेळी एक निर्णय निवडा. तुम्ही स्पष्टपणे ही लाईन शिका दाबेपर्यंत धडा उघडत नाही.", fullscreen: "पूर्ण स्क्रीन", exitFullscreen: "पूर्ण स्क्रीनमधून बाहेर", search: "व्हेरिएशन, चाल किंवा क्रम शोधा…", searchResults: "निकाल", noResults: "या कोर्समध्ये जुळणारी लाईन नाही", lines: "लाईन्स", linesInBranch: "या फांदीतील लाईन्स", study: "ही लाईन शिका", main: "कोर्स मार्ग", zoom: "तपशील", zoomHint: "पूर्ण स्क्रीनमध्ये व्हीलने तपशीलाची पातळी बदला.", root: "कोर्सची सुरुवात", branch: "सध्याची फांदी", current: "तुम्ही येथे आहात", choose: "पुढची फांदी निवडा", chooseHint: "प्रत्येक कार्ड एक फांदी आहे. ट्री कमी करण्यासाठी ती उघडा; ठराविक लाईन निवडल्यानंतरच निळे बटण अभ्यास सुरू करते.", recommended: "पुढील शिफारस", lineReady: "लाईन निवडली", showMore: "आणखी दाखवा", showLess: "कमी दाखवा", exactLine: "ठराविक अभ्यास लाईन" },
    pl: { subtitle: "Wybieraj jedną decyzję naraz. Lekcja otworzy się dopiero po wyraźnym kliknięciu Ucz się tej linii.", fullscreen: "Pełny ekran", exitFullscreen: "Wyjdź z pełnego ekranu", search: "Szukaj wariantu, ruchu lub sekwencji…", searchResults: "wyników", noResults: "Brak pasującej linii w tym kursie", lines: "linie", linesInBranch: "linii w tej gałęzi", study: "Ucz się tej linii", main: "Ścieżka kursu", zoom: "Szczegóły", zoomHint: "Na pełnym ekranie kółko myszy zmienia poziom szczegółów.", root: "Początek kursu", branch: "Bieżąca gałąź", current: "Jesteś tutaj", choose: "Wybierz następną kontynuację", chooseHint: "Każda karta to jedna gałąź. Otwórz ją, aby zawęzić drzewo; nauka zaczyna się dopiero niebieskim przyciskiem po wybraniu konkretnej linii.", recommended: "Następny polecany", lineReady: "Linia wybrana", showMore: "Pokaż więcej", showLess: "Pokaż mniej", exactLine: "Konkretna linia do nauki" }
};

const NORMAL_BRANCH_LIMIT = 5;
const FULLSCREEN_LIMITS = [4, 6, 9, 12];
const SEGMENT_LIMITS = [1, 4, 7, 14];
const MORE_STEP = 8;
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
            let child = node.children.get(san);
            if (!child) {
                child = createNode(`${node.id}/${encodeURIComponent(san)}:${ply}`, san, ply, node);
                node.children.set(san, child);
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
    while (end.children.size == 1 && nodes.length < maximum && end.entries.length == 0) {
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

function exactEntry(node: FocusNode, progress: CourseProgressStore) {
    if (!node.entries.length) return undefined;
    return node.entries.find(entry => !findLessonProgress(progress, entry)) || node.entries[0];
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
    const [extraVisible, setExtraVisible] = useState(0);
    const [query, setQuery] = useState("");
    const [fullscreen, setFullscreen] = useState(false);
    const [semanticLevel, setSemanticLevel] = useState(1);

    useEffect(() => {
        setFocusId("root");
        setExtraVisible(0);
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

    const baseLimit = fullscreen ? FULLSCREEN_LIMITS[effectiveLevel] : NORMAL_BRANCH_LIMIT;
    const visibleCount = Math.min(branches.length, baseLimit + extraVisible);
    const visibleBranches = branches.slice(0, visibleCount);
    const hiddenCount = Math.max(0, branches.length - visibleCount);
    const crumbs = breadcrumbNodes(model.root, focus);
    const studyEntry = exactEntry(anchor, progress);

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

    function changeFocus(node: FocusNode) {
        setFocusId(node.id);
        setExtraVisible(0);
    }

    function focusSearchResult(node: FocusNode) {
        changeFocus(node);
        setQuery("");
    }

    function openBranch(node: FocusNode) {
        const branch = segmentFrom(node, SEGMENT_LIMITS[effectiveLevel]);
        changeFocus(branch.end);
    }

    function startStudy(entry: OpeningCatalogueEntry) {
        const itemProgress = findLessonProgress(progress, entry);
        onOpen(entry, itemProgress?.side || preferredSide, Boolean(itemProgress), Boolean(itemProgress));
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
    const fullPathEntry = studyEntry || anchor.representative;
    const fullPath = fullPathEntry ? fastPgnSanTokens(fullPathEntry.pgn) : [];
    const currentMoves = sanPath(anchor);

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
                <button type="button" data-current={node == focus} onClick={() => changeFocus(node)}>
                    {node == model.root ? localizeOpeningName(name, language) : moveLabel([node])}
                </button>
            </React.Fragment>)}
        </nav>

        <section className={mapStyles.focusViewport} data-level={effectiveLevel}>
            <div className={mapStyles.currentNode} data-ready={Boolean(studyEntry)}>
                <div className={mapStyles.currentEyebrow}>
                    <span>{focus == model.root ? copy.root : copy.branch}</span>
                    <em>{copy.current}</em>
                </div>
                <strong>{currentName}</strong>
                {currentMoves.length > 0 && <p>{moveLabel(currentMoves.slice(-Math.max(4, SEGMENT_LIMITS[effectiveLevel])))}</p>}
                <small>{anchor.descendantLines} {copy.lines}{anchor.descendantLines != 1 ? "" : ""}</small>
            </div>

            {studyEntry && <div className={mapStyles.lineReady} data-repertoire-tour="focus-study">
                <div>
                    <span>✓ {copy.lineReady}</span>
                    <strong>{localizeOpeningName(studyEntry.name, language)}</strong>
                    <small>{copy.exactLine}</small>
                </div>
                <button type="button" className={mapStyles.studyButton} onClick={() => startStudy(studyEntry)}>{copy.study}<b>→</b></button>
            </div>}

            {effectiveLevel == 3 && fullPath.length > 0 && <div className={mapStyles.fullPath}>
                <span>{copy.main}</span>
                <p>{fullPath.map((san, ply) => moveLabel([{ ...anchor, san, ply }])).join(" ")}</p>
            </div>}

            {branches.length > 0 && <div className={mapStyles.branchSection}>
                <div className={mapStyles.decisionHeader}>
                    <span>{copy.choose}</span>
                    <p>{copy.chooseHint}</p>
                </div>
                <div className={mapStyles.branchList} data-repertoire-tour="focus-branches">
                    {visibleBranches.map(branch => {
                        const preview = segmentFrom(branch, SEGMENT_LIMITS[effectiveLevel]);
                        const branchTitle = branchName(preview.end, name, language, fundamentalsLabel) || branchName(branch, name, language, fundamentalsLabel);
                        const recommended = Boolean(recommendedNode && isAncestor(branch, recommendedNode));
                        return <div className={mapStyles.branchRow} key={branch.id}>
                            <button type="button" className={mapStyles.branchCard} data-recommended={recommended} data-repertoire-tour={recommended ? "focus-branch" : undefined} onClick={() => openBranch(branch)}>
                                <span className={mapStyles.branchCardCopy}>
                                    <span className={mapStyles.branchCardTop}>
                                        <span className={mapStyles.branchMove}>{effectiveLevel == 0 ? moveLabel([branch]) : moveLabel(preview.nodes)}</span>
                                        {recommended && <em>{copy.recommended}</em>}
                                    </span>
                                    {branchTitle && <strong>{branchTitle}</strong>}
                                    <small>{branch.descendantLines} {copy.linesInBranch}</small>
                                </span>
                                <b className={mapStyles.branchArrow} aria-hidden="true">→</b>
                            </button>
                        </div>;
                    })}
                    {hiddenCount > 0 && <div className={mapStyles.branchRow}>
                        <button type="button" className={mapStyles.alternativesButton} onClick={() => setExtraVisible(value => value + MORE_STEP)}>
                            <strong>+ {Math.min(MORE_STEP, hiddenCount)} {copy.showMore}</strong>
                            <small>{hiddenCount} {copy.linesInBranch}</small>
                        </button>
                    </div>}
                    {extraVisible > 0 && <div className={mapStyles.branchRow}>
                        <button type="button" className={mapStyles.showLessButton} onClick={() => setExtraVisible(0)}>↑ {copy.showLess}</button>
                    </div>}
                </div>
            </div>}
        </section>

        {fullscreen && <div className={mapStyles.fullscreenHint}>{copy.zoomHint}</div>}
        {!model.root.descendantLines && <div className={mapStyles.mapEmpty}>{loadingLabel}</div>}
    </div>;
}

export default CourseVariationMap;
