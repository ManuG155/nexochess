import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

import useSettingsStore from "@/stores/SettingsStore";
import { createCustomPieces } from "@/lib/chessAppearance";
import SuggestionArrowOverlay from "@analysis/components/Board/SuggestionArrowOverlay";

import { OpeningCatalogueEntry } from "./openingCatalogue";
import { fastPgnSanTokens } from "./courseDepth";
import { localizeOpeningName } from "./openingLocalization";
import { CourseProgressStore, findLessonProgress } from "./courseProgress";
import { RepertoireSide, inferSide } from "./courseV3Model";
import { loadOpeningPopularity, moveGames, moveShare, OpeningExplorerMove, OpeningExplorerPosition } from "./openingExplorerClient";
import * as styles from "./courseRepertoireTree.module.css";

interface Props {
    name: string;
    lines: OpeningCatalogueEntry[];
    progress: CourseProgressStore;
    preferredSide?: RepertoireSide;
    percent: number;
    language: string;
    title: string;
    loadingLabel: string;
    onOpen: (opening: OpeningCatalogueEntry, side?: RepertoireSide, startPractice?: boolean, blindPractice?: boolean) => void;
    onAddToRepertoire: (opening: OpeningCatalogueEntry, side: RepertoireSide) => void;
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
    sample: string;
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
    popularPrompt: string;
    courseCoverage: string;
}

const COPY: Record<string, Copy> = {
    en: { subtitle: "Grow your repertoire from real positions. Explore the most common continuations, add the ones you want, and follow transpositions without opening the whole tree at once.", fullscreen: "Full screen", exitFullscreen: "Exit full screen", search: "Search variation, move or sequence…", matches: "matches", noResults: "No matching line in this course", lines: "course lines", current: "Current position", courseStart: "Course start", commonNext: "Most common continuations", commonHelp: "Percentages are based on games in the Lichess opening-explorer sample, not on unique players.", games: "of Lichess games", sample: "sample games", loadingStats: "Loading move popularity…", noStats: "Live popularity unavailable. Course coverage is shown instead.", explore: "Explore", add: "Add to my repertoire", added: "Added", study: "Study line", showMore: "Show more", showLess: "Show fewer", transposition: "Transposition", transpositionHelp: "This same position is also reached through another route in the course.", routes: "routes reach this position", zoom: "Detail", zoomHint: "In full screen, use the mouse wheel to change semantic detail.", popularPrompt: "Want to grow your repertoire with this continuation?", courseCoverage: "lines continue here" },
    es: { subtitle: "Haz crecer tu repertorio desde posiciones reales. Explora las continuaciones más habituales, añade las que quieras y sigue las transposiciones sin desplegar todo el árbol de golpe.", fullscreen: "Pantalla completa", exitFullscreen: "Salir de pantalla completa", search: "Buscar variante, movimiento o secuencia…", matches: "coincidencias", noResults: "No hay líneas coincidentes en este curso", lines: "líneas del curso", current: "Posición actual", courseStart: "Inicio del curso", commonNext: "Continuaciones más jugadas", commonHelp: "Los porcentajes corresponden a partidas de la muestra del explorador de Lichess, no a jugadores únicos.", games: "de partidas de Lichess", sample: "partidas de muestra", loadingStats: "Cargando frecuencia de jugadas…", noStats: "La frecuencia en vivo no está disponible. Se muestra la cobertura del curso.", explore: "Explorar", add: "Añadir a mi repertorio", added: "Añadida", study: "Estudiar línea", showMore: "Mostrar más", showLess: "Mostrar menos", transposition: "Transposición", transpositionHelp: "A esta misma posición también se llega por otra ruta del curso.", routes: "rutas llegan a esta posición", zoom: "Detalle", zoomHint: "En pantalla completa, usa la rueda para cambiar el nivel de detalle semántico.", popularPrompt: "¿Quieres hacer crecer tu repertorio con esta continuación?", courseCoverage: "líneas continúan por aquí" },
    fr: { subtitle: "Développez votre répertoire à partir de positions réelles. Explorez les suites les plus fréquentes, ajoutez celles qui vous intéressent et suivez les transpositions sans déployer tout l’arbre.", fullscreen: "Plein écran", exitFullscreen: "Quitter le plein écran", search: "Rechercher variante, coup ou séquence…", matches: "résultats", noResults: "Aucune ligne correspondante dans ce cours", lines: "lignes du cours", current: "Position actuelle", courseStart: "Début du cours", commonNext: "Suites les plus jouées", commonHelp: "Les pourcentages proviennent des parties de l’échantillon de l’explorateur Lichess, pas de joueurs uniques.", games: "des parties Lichess", sample: "parties de l’échantillon", loadingStats: "Chargement de la fréquence des coups…", noStats: "Fréquence en direct indisponible. La couverture du cours est affichée.", explore: "Explorer", add: "Ajouter à mon répertoire", added: "Ajoutée", study: "Étudier la ligne", showMore: "Afficher plus", showLess: "Afficher moins", transposition: "Transposition", transpositionHelp: "Cette position est aussi atteinte par une autre route du cours.", routes: "routes atteignent cette position", zoom: "Détail", zoomHint: "En plein écran, la molette change le niveau de détail sémantique.", popularPrompt: "Ajouter cette suite à votre répertoire ?", courseCoverage: "lignes continuent ici" },
    de: { subtitle: "Baue dein Repertoire aus echten Stellungen auf. Erkunde häufige Fortsetzungen, füge passende hinzu und folge Zugumstellungen, ohne den ganzen Baum zu öffnen.", fullscreen: "Vollbild", exitFullscreen: "Vollbild verlassen", search: "Variante, Zug oder Folge suchen…", matches: "Treffer", noResults: "Keine passende Linie in diesem Kurs", lines: "Kurslinien", current: "Aktuelle Stellung", courseStart: "Kursanfang", commonNext: "Häufigste Fortsetzungen", commonHelp: "Die Prozente basieren auf Partien der Lichess-Explorer-Stichprobe, nicht auf eindeutigen Spielern.", games: "der Lichess-Partien", sample: "Stichprobenpartien", loadingStats: "Zughäufigkeit wird geladen…", noStats: "Live-Häufigkeit nicht verfügbar. Stattdessen wird die Kursabdeckung gezeigt.", explore: "Erkunden", add: "Zu meinem Repertoire", added: "Hinzugefügt", study: "Linie lernen", showMore: "Mehr anzeigen", showLess: "Weniger anzeigen", transposition: "Zugumstellung", transpositionHelp: "Dieselbe Stellung wird im Kurs auch über einen anderen Weg erreicht.", routes: "Wege führen zu dieser Stellung", zoom: "Detail", zoomHint: "Im Vollbild ändert das Mausrad die semantische Detailstufe.", popularPrompt: "Diese Fortsetzung ins Repertoire aufnehmen?", courseCoverage: "Linien gehen hier weiter" },
    pt: { subtitle: "Faça o repertório crescer a partir de posições reais. Explore as continuações mais comuns, adicione as que quiser e siga transposições sem abrir toda a árvore.", fullscreen: "Ecrã inteiro", exitFullscreen: "Sair do ecrã inteiro", search: "Pesquisar variante, lance ou sequência…", matches: "resultados", noResults: "Nenhuma linha correspondente neste curso", lines: "linhas do curso", current: "Posição atual", courseStart: "Início do curso", commonNext: "Continuações mais jogadas", commonHelp: "As percentagens usam partidas da amostra do explorador do Lichess, não jogadores únicos.", games: "das partidas do Lichess", sample: "partidas da amostra", loadingStats: "A carregar frequência dos lances…", noStats: "Frequência em direto indisponível. É mostrada a cobertura do curso.", explore: "Explorar", add: "Adicionar ao meu repertório", added: "Adicionada", study: "Estudar linha", showMore: "Mostrar mais", showLess: "Mostrar menos", transposition: "Transposição", transpositionHelp: "Esta posição também é alcançada por outra rota do curso.", routes: "rotas chegam a esta posição", zoom: "Detalhe", zoomHint: "Em ecrã inteiro, use a roda para mudar o detalhe semântico.", popularPrompt: "Quer acrescentar esta continuação ao repertório?", courseCoverage: "linhas continuam aqui" },
    ru: { subtitle: "Расширяйте репертуар от реальных позиций: смотрите популярные продолжения, добавляйте нужные и учитывайте транспозиции без раскрытия всего дерева.", fullscreen: "Во весь экран", exitFullscreen: "Выйти из полноэкранного режима", search: "Поиск варианта, хода или последовательности…", matches: "совпадений", noResults: "В этом курсе совпадений нет", lines: "линий курса", current: "Текущая позиция", courseStart: "Начало курса", commonNext: "Самые частые продолжения", commonHelp: "Проценты рассчитаны по партиям выборки Lichess Explorer, а не по уникальным игрокам.", games: "партий Lichess", sample: "партий в выборке", loadingStats: "Загрузка частоты ходов…", noStats: "Частота сейчас недоступна. Показано покрытие курса.", explore: "Открыть", add: "Добавить в репертуар", added: "Добавлено", study: "Изучить линию", showMore: "Показать ещё", showLess: "Показать меньше", transposition: "Транспозиция", transpositionHelp: "К этой позиции в курсе ведёт и другой путь.", routes: "маршрутов ведут к позиции", zoom: "Детали", zoomHint: "Во весь экран колесо меняет семантический уровень деталей.", popularPrompt: "Добавить это продолжение в репертуар?", courseCoverage: "линий продолжаются здесь" },
    zh: { subtitle: "从真实局面逐步建立开局库。查看常见续着、加入想学的分支，并在不展开整棵树的情况下识别转置。", fullscreen: "全屏", exitFullscreen: "退出全屏", search: "搜索变例、走法或序列…", matches: "个结果", noResults: "本课程没有匹配路线", lines: "条课程线路", current: "当前局面", courseStart: "课程起点", commonNext: "最常见续着", commonHelp: "百分比来自 Lichess 开局探索器样本中的对局，并非独立棋手比例。", games: "的 Lichess 对局", sample: "盘样本对局", loadingStats: "正在加载走法频率…", noStats: "实时频率不可用，改为显示课程覆盖度。", explore: "探索", add: "加入我的开局库", added: "已加入", study: "学习线路", showMore: "显示更多", showLess: "收起", transposition: "转置", transpositionHelp: "课程中的另一条路线也会到达同一局面。", routes: "条路线到达此局面", zoom: "细节", zoomHint: "全屏时滚轮切换语义细节层级。", popularPrompt: "要把这个续着加入你的开局库吗？", courseCoverage: "条线路从这里继续" },
    vi: { subtitle: "Xây repertoire từ các vị trí thực tế. Xem các tiếp diễn phổ biến, thêm nhánh bạn muốn và theo dõi chuyển thế mà không mở toàn bộ cây.", fullscreen: "Toàn màn hình", exitFullscreen: "Thoát toàn màn hình", search: "Tìm biến, nước đi hoặc chuỗi…", matches: "kết quả", noResults: "Không có dòng phù hợp trong khóa học", lines: "dòng khóa học", current: "Vị trí hiện tại", courseStart: "Đầu khóa học", commonNext: "Tiếp diễn phổ biến nhất", commonHelp: "Tỷ lệ dựa trên các ván trong mẫu Opening Explorer của Lichess, không phải số người chơi duy nhất.", games: "ván Lichess", sample: "ván trong mẫu", loadingStats: "Đang tải tần suất nước đi…", noStats: "Không có tần suất trực tiếp. Đang hiển thị độ phủ của khóa học.", explore: "Khám phá", add: "Thêm vào repertoire", added: "Đã thêm", study: "Học dòng", showMore: "Hiện thêm", showLess: "Hiện ít hơn", transposition: "Chuyển thế", transpositionHelp: "Vị trí này cũng đạt được qua một đường khác trong khóa học.", routes: "đường đến vị trí này", zoom: "Chi tiết", zoomHint: "Ở toàn màn hình, dùng con lăn để đổi mức chi tiết ngữ nghĩa.", popularPrompt: "Thêm tiếp diễn này vào repertoire?", courseCoverage: "dòng tiếp tục ở đây" },
    hi: { subtitle: "वास्तविक स्थितियों से अपना रिपर्टॉयर बढ़ाएँ। आम चालें देखें, मनचाही शाखाएँ जोड़ें और पूरा वृक्ष खोले बिना ट्रांसपोज़िशन समझें।", fullscreen: "पूर्ण स्क्रीन", exitFullscreen: "पूर्ण स्क्रीन से बाहर", search: "वेरिएशन, चाल या क्रम खोजें…", matches: "परिणाम", noResults: "इस कोर्स में कोई मिलती लाइन नहीं", lines: "कोर्स लाइनें", current: "मौजूदा स्थिति", courseStart: "कोर्स की शुरुआत", commonNext: "सबसे आम चालें", commonHelp: "प्रतिशत Lichess Explorer के नमूना खेलों पर आधारित हैं, अलग-अलग खिलाड़ियों पर नहीं।", games: "Lichess खेलों में", sample: "नमूना खेल", loadingStats: "चाल की आवृत्ति लोड हो रही है…", noStats: "लाइव आवृत्ति उपलब्ध नहीं। कोर्स कवरेज दिखाया जा रहा है।", explore: "देखें", add: "मेरे रिपर्टॉयर में जोड़ें", added: "जोड़ दिया", study: "लाइन सीखें", showMore: "और दिखाएँ", showLess: "कम दिखाएँ", transposition: "ट्रांसपोज़िशन", transpositionHelp: "इसी स्थिति तक कोर्स की दूसरी राह से भी पहुँचा जाता है।", routes: "रास्ते इस स्थिति तक", zoom: "विवरण", zoomHint: "पूर्ण स्क्रीन में व्हील से अर्थपूर्ण विवरण स्तर बदलें।", popularPrompt: "यह चाल अपने रिपर्टॉयर में जोड़ें?", courseCoverage: "लाइनें यहाँ से जारी" },
    mr: { subtitle: "प्रत्यक्ष स्थितींमधून तुमचा रिपर्टॉयर वाढवा. सर्वाधिक खेळल्या जाणाऱ्या पुढच्या चाली पाहा, हव्या त्या शाखा जोडा आणि संपूर्ण झाड उघडल्याशिवाय ट्रान्सपोजिशन समजा.", fullscreen: "पूर्ण स्क्रीन", exitFullscreen: "पूर्ण स्क्रीनमधून बाहेर", search: "व्हेरिएशन, चाल किंवा क्रम शोधा…", matches: "निकाल", noResults: "या कोर्समध्ये जुळणारी लाईन नाही", lines: "कोर्स लाईन्स", current: "सध्याची स्थिती", courseStart: "कोर्सची सुरुवात", commonNext: "सर्वाधिक खेळल्या जाणाऱ्या चाली", commonHelp: "टक्केवारी Lichess Explorer च्या नमुना डावांवर आधारित आहे, वेगवेगळ्या खेळाडूंवर नाही.", games: "Lichess डावांमध्ये", sample: "नमुना डाव", loadingStats: "चालींची वारंवारता लोड होत आहे…", noStats: "थेट वारंवारता उपलब्ध नाही. कोर्स कव्हरेज दाखवले आहे.", explore: "पहा", add: "माझ्या रिपर्टॉयरमध्ये जोडा", added: "जोडले", study: "लाईन शिका", showMore: "आणखी दाखवा", showLess: "कमी दाखवा", transposition: "ट्रान्सपोजिशन", transpositionHelp: "हीच स्थिती कोर्समधील दुसऱ्या मार्गानेही येते.", routes: "मार्ग या स्थितीपर्यंत", zoom: "तपशील", zoomHint: "पूर्ण स्क्रीनमध्ये व्हीलने अर्थपूर्ण तपशील बदला.", popularPrompt: "ही पुढची चाल रिपर्टॉयरमध्ये जोडायची?", courseCoverage: "लाईन्स इथून पुढे जातात" },
    pl: { subtitle: "Rozwijaj repertuar z realnych pozycji. Oglądaj najczęstsze kontynuacje, dodawaj wybrane gałęzie i śledź transpozycje bez rozwijania całego drzewa.", fullscreen: "Pełny ekran", exitFullscreen: "Wyjdź z pełnego ekranu", search: "Szukaj wariantu, ruchu lub sekwencji…", matches: "wyników", noResults: "Brak pasującej linii w tym kursie", lines: "linii kursu", current: "Bieżąca pozycja", courseStart: "Początek kursu", commonNext: "Najczęstsze kontynuacje", commonHelp: "Procenty pochodzą z partii w próbce Lichess Opening Explorer, a nie z liczby unikalnych graczy.", games: "partii Lichess", sample: "partii w próbce", loadingStats: "Ładowanie popularności ruchów…", noStats: "Popularność na żywo niedostępna. Pokazano pokrycie kursu.", explore: "Eksploruj", add: "Dodaj do repertuaru", added: "Dodano", study: "Ucz się linii", showMore: "Pokaż więcej", showLess: "Pokaż mniej", transposition: "Transpozycja", transpositionHelp: "Ta sama pozycja powstaje w kursie także inną drogą.", routes: "dróg prowadzi do tej pozycji", zoom: "Szczegóły", zoomHint: "Na pełnym ekranie kółko zmienia semantyczny poziom szczegółów.", popularPrompt: "Dodać tę kontynuację do repertuaru?", courseCoverage: "linii biegnie dalej tędy" }
};

const ARROW_COLOURS = ["#58a6ff", "#4fcf8f", "#f2c14e", "#b98cff", "#f08c6c"];
const NORMAL_LIMIT = 5;
const MORE_STEP = 5;
const SEARCH_LIMIT = 10;

function entryKey(entry: OpeningCatalogueEntry) {
    return `${entry.eco}|${entry.name}|${entry.pgn}`;
}

function positionKey(fen: string) {
    return fen.split(" ").slice(0, 4).join(" ");
}

function createNode(id: string, san: string, uci: string, ply: number, fen: string, parent?: TreeNode): TreeNode {
    return { id, san, uci, ply, fen, positionKey: positionKey(fen), parent, children: new Map(), entries: [], descendantLines: 0 };
}

function buildModel(lines: OpeningCatalogueEntry[]): TreeModel {
    const rootBoard = new Chess();
    const root = createNode("root", "", "", -1, rootBoard.fen());
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
            try { move = board.move(sans[ply]); } catch { break; }
            if (!move) break;
            const uci = `${move.from}${move.to}${move.promotion || ""}`;
            let child = node.children.get(uci);
            if (!child) {
                child = createNode(`${node.id}/${uci}:${ply}`, move.san, uci, ply, board.fen(), node);
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
        return previous && previous.ply == node.ply - 1 ? node.san : `${number}...${node.san}`;
    }).join(" ");
}

function normalize(value: string) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/[^\p{L}\p{N}+#=.-]+/gu, " ").trim();
}

function routeEntry(node: TreeNode, family: string, language: string): OpeningCatalogueEntry | undefined {
    const representative = node.entries[0] || node.representative;
    if (!representative) return undefined;
    const board = new Chess();
    for (const step of pathNodes(node)) {
        try { board.move(step.san); } catch { return undefined; }
    }
    return {
        eco: representative.eco,
        family,
        name: localizeOpeningName(representative.name, language),
        pgn: board.pgn()
    };
}

function exactStudyEntry(node: TreeNode, progress: CourseProgressStore) {
    if (!node.entries.length) return undefined;
    return node.entries.find(entry => !findLessonProgress(progress, entry)) || node.entries[0];
}

function branchName(node: TreeNode, language: string, fallback: string) {
    return node.representative ? localizeOpeningName(node.representative.name, language) : fallback;
}

function explorerMoveFor(node: TreeNode, explorer: OpeningExplorerPosition | null | undefined) {
    return explorer?.moves.find(move => move.uci == node.uci);
}

function connectorPath(index: number, count: number) {
    const childX = (index + .5) * (1000 / count);
    return `M500 0 C500 24 ${childX} 24 ${childX} 52`;
}

function CourseRepertoireTree({ name, lines, progress, preferredSide, percent, language, title, loadingLabel, onOpen, onAddToRepertoire }: Props) {
    const lang = language.split("-")[0].toLowerCase();
    const copy = COPY[lang] || COPY.en;
    const settings = useSettingsStore(state => state.settings);
    const pieces = useMemo(() => createCustomPieces(settings.themes.piece), [settings.themes.piece]);
    const model = useMemo(() => buildModel(lines), [lines]);
    const cardRef = useRef<HTMLDivElement>(null);
    const wheelCarry = useRef(0);
    const [focusId, setFocusId] = useState("root");
    const [query, setQuery] = useState("");
    const [extraVisible, setExtraVisible] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);
    const [semanticLevel, setSemanticLevel] = useState(1);
    const [explorer, setExplorer] = useState<OpeningExplorerPosition | null | undefined>(undefined);
    const [added, setAdded] = useState<Set<string>>(() => new Set());

    const focus = model.byId.get(focusId) || model.root;
    const currentPath = pathNodes(focus);
    const routesHere = (model.byPosition.get(focus.positionKey) || []).filter(node => node.id != focus.id);
    const effectiveLevel = fullscreen ? semanticLevel : 1;

    useEffect(() => {
        setFocusId("root");
        setQuery("");
        setExtraVisible(0);
        setSemanticLevel(1);
    }, [name]);

    useEffect(() => {
        let active = true;
        setExplorer(undefined);
        void loadOpeningPopularity(focus.fen).then(value => { if (active) setExplorer(value); });
        return () => { active = false; };
    }, [focus.fen]);

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
            if (Math.abs(wheelCarry.current) < 36) return;
            const direction = wheelCarry.current < 0 ? 1 : -1;
            wheelCarry.current = 0;
            setSemanticLevel(level => Math.max(0, Math.min(3, level + direction)));
        };
        card.addEventListener("wheel", onWheel, { passive: false });
        return () => card.removeEventListener("wheel", onWheel);
    }, [fullscreen]);

    const branchRecords = useMemo(() => Array.from(focus.children.values()).map(node => {
        const liveMove = explorerMoveFor(node, explorer);
        return { node, liveMove, share: moveShare(explorer || null, liveMove), games: moveGames(liveMove) };
    }).sort((a, b) => {
        if (a.share != null || b.share != null) return (b.share || 0) - (a.share || 0) || b.node.descendantLines - a.node.descendantLines;
        return b.node.descendantLines - a.node.descendantLines || a.node.san.localeCompare(b.node.san);
    }), [explorer, focus]);

    const levelBonus = effectiveLevel == 0 ? -2 : effectiveLevel == 2 ? 2 : effectiveLevel == 3 ? 5 : 0;
    const visibleCount = Math.max(3, Math.min(branchRecords.length, NORMAL_LIMIT + levelBonus + extraVisible));
    const visibleBranches = branchRecords.slice(0, visibleCount);
    const hiddenCount = Math.max(0, branchRecords.length - visibleCount);

    const normalizedQuery = normalize(query);
    const searchMatches = useMemo(() => {
        if (!normalizedQuery) return [] as Array<{ entry: OpeningCatalogueEntry; node: TreeNode }>;
        const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
        return lines.flatMap(entry => {
            const node = model.entryNodes.get(entryKey(entry));
            if (!node) return [];
            const localized = localizeOpeningName(entry.name, language);
            const moves = moveLabel(pathNodes(node));
            const haystack = normalize(`${entry.name} ${localized} ${moves}`);
            return haystack.includes(normalizedQuery) || tokens.every(token => haystack.includes(token)) ? [{ entry, node }] : [];
        });
    }, [language, lines, model, normalizedQuery]);

    const arrows = visibleBranches.slice(0, 5).flatMap((record, index) => {
        if (record.node.uci.length < 4) return [];
        return [{
            from: record.node.uci.slice(0, 2),
            to: record.node.uci.slice(2, 4),
            colour: ARROW_COLOURS[index],
            overlayColour: ARROW_COLOURS[index]
        }];
    });

    const exact = exactStudyEntry(focus, progress);
    const top = visibleBranches[0];
    const topShare = top?.share;
    const boardOrientation = preferredSide == "black" ? "black" : "white";

    function focusNode(node: TreeNode) {
        setFocusId(node.id);
        setExtraVisible(0);
        setQuery("");
    }

    function addBranch(node: TreeNode) {
        const entry = routeEntry(node, name, language);
        if (!entry) return;
        const side = preferredSide || inferSide(node.representative || entry);
        onAddToRepertoire(entry, side);
        setAdded(previous => new Set(previous).add(node.id));
    }

    async function toggleFullscreen() {
        const card = cardRef.current;
        if (!card) return;
        try {
            if (document.fullscreenElement == card) await document.exitFullscreen();
            else await card.requestFullscreen();
        } catch {
            // Full screen is an enhancement; the tree remains usable without it.
        }
    }

    const currentTitle = focus == model.root ? localizeOpeningName(name, language) : branchName(focus, language, focus.san);

    return <div ref={cardRef} className={styles.card} data-repertoire-tour="focus-tree">
        <header className={styles.header}>
            <div><strong>{title}</strong><span>{copy.subtitle}</span></div>
            <div className={styles.headerActions}>
                <b>{percent}% · {lines.length} {copy.lines}</b>
                {fullscreen && <div className={styles.zoomControls} aria-label={copy.zoom}>
                    <button type="button" onClick={() => setSemanticLevel(level => Math.max(0, level - 1))} disabled={semanticLevel == 0}>−</button>
                    <span>{copy.zoom} {semanticLevel + 1}/4</span>
                    <button type="button" onClick={() => setSemanticLevel(level => Math.min(3, level + 1))} disabled={semanticLevel == 3}>+</button>
                </div>}
                <button type="button" className={styles.fullscreenButton} data-repertoire-tour="focus-fullscreen" onClick={toggleFullscreen} aria-label={fullscreen ? copy.exitFullscreen : copy.fullscreen} title={fullscreen ? copy.exitFullscreen : copy.fullscreen}>
                    {fullscreen ? "↙" : "⛶"}
                </button>
            </div>
        </header>
        <div className={styles.progress}><i style={{ width: `${percent}%` }}/></div>

        <div className={styles.search} data-repertoire-tour="focus-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder={copy.search}/>
            {normalizedQuery && <b>{searchMatches.length} {copy.matches}</b>}
        </div>
        {normalizedQuery && <div className={styles.searchResults}>
            {searchMatches.length == 0 && <p>{copy.noResults}</p>}
            {searchMatches.slice(0, SEARCH_LIMIT).map(match => <button type="button" key={entryKey(match.entry)} onClick={() => focusNode(match.node)}>
                <span><strong>{localizeOpeningName(match.entry.name, language)}</strong><small>{moveLabel(pathNodes(match.node).slice(-6))}</small></span><em>{match.entry.eco}</em>
            </button>)}
        </div>}

        <nav className={styles.breadcrumb} aria-label={copy.current}>
            <button type="button" data-current={focus == model.root} onClick={() => focusNode(model.root)}>{localizeOpeningName(name, language)}</button>
            {currentPath.map(node => <React.Fragment key={node.id}><span>›</span><button type="button" data-current={node.id == focus.id} onClick={() => focusNode(node)}>{moveLabel([node])}</button></React.Fragment>)}
        </nav>

        <main className={styles.workspace} data-level={effectiveLevel}>
            <section className={styles.boardPanel}>
                <div className={styles.boardHeading}>
                    <span>{copy.current}</span>
                    <strong>{currentTitle}</strong>
                    <small>{currentPath.length ? moveLabel(currentPath.slice(-8)) : copy.courseStart}</small>
                </div>
                <div className={styles.boardWrap}>
                    <Chessboard id="repertoire-course-tree-board" position={focus.fen} boardOrientation={boardOrientation} arePiecesDraggable={false} customPieces={pieces} customDarkSquareStyle={{ backgroundColor: settings.themes.board.darkSquareColour }} customLightSquareStyle={{ backgroundColor: settings.themes.board.lightSquareColour }} showBoardNotation={settings.themes.board.coordinates == "inside"}/>
                    <SuggestionArrowOverlay arrows={arrows} flipped={boardOrientation == "black"}/>
                </div>
                <div className={styles.positionMeta}>
                    {explorer === undefined ? <span>{copy.loadingStats}</span> : explorer === null ? <span>{copy.noStats}</span> : <span>{copy.commonHelp}</span>}
                </div>
            </section>

            <section className={styles.treePanel}>
                <div className={styles.currentNode}>
                    <span>{copy.current}</span>
                    <strong>{currentPath.length ? moveLabel(currentPath.slice(-4)) : currentTitle}</strong>
                    <small>{focus.descendantLines} {copy.courseCoverage}</small>
                    {routesHere.length > 0 && <em>↔ {copy.transposition} · {routesHere.length + 1} {copy.routes}</em>}
                </div>

                {routesHere.length > 0 && <div className={styles.transpositions}>
                    <div><strong>↔ {copy.transposition}</strong><span>{copy.transpositionHelp}</span></div>
                    <div>{routesHere.slice(0, 3).map(route => <button type="button" key={route.id} onClick={() => focusNode(route)}>{moveLabel(pathNodes(route).slice(-5))}</button>)}</div>
                </div>}

                {top && <div className={styles.prompt}>
                    <span>{copy.commonNext}</span>
                    <strong>{topShare != null ? `${Math.round(topShare)}% ${copy.games}: ${moveLabel([top.node])}` : `${moveLabel([top.node])} · ${top.node.descendantLines} ${copy.courseCoverage}`}</strong>
                    <p>{copy.popularPrompt}</p>
                </div>}

                {visibleBranches.length > 0 && <div className={styles.treeFan}>
                    <svg className={styles.connectors} viewBox="0 0 1000 52" preserveAspectRatio="none" aria-hidden="true">
                        {visibleBranches.map((record, index) => <path key={record.node.id} d={connectorPath(index, visibleBranches.length)}/>)}
                    </svg>
                    <div className={styles.children} style={{ gridTemplateColumns: `repeat(${visibleBranches.length}, minmax(0, 1fr))` }} data-repertoire-tour="focus-branches">
                        {visibleBranches.map((record, index) => {
                            const node = record.node;
                            const routeCount = model.byPosition.get(node.positionKey)?.length || 1;
                            const liveText = record.share != null ? `${Math.round(record.share)}% ${copy.games}` : `${node.descendantLines} ${copy.courseCoverage}`;
                            const studyEntry = exactStudyEntry(node, progress);
                            return <article key={node.id} className={styles.branchCard} style={{ "--branch-colour": ARROW_COLOURS[index % ARROW_COLOURS.length] } as React.CSSProperties}>
                                <div className={styles.branchTop}><span>{moveLabel([node])}</span><b>{liveText}</b></div>
                                <strong>{branchName(node, language, node.san)}</strong>
                                <small>{node.descendantLines} {copy.lines}</small>
                                {routeCount > 1 && <em>↔ {copy.transposition} · {routeCount}</em>}
                                <div className={styles.branchActions}>
                                    <button type="button" onClick={() => focusNode(node)}>{copy.explore}</button>
                                    <button type="button" data-primary disabled={added.has(node.id)} onClick={() => addBranch(node)}>{added.has(node.id) ? `✓ ${copy.added}` : `＋ ${copy.add}`}</button>
                                    {studyEntry && <button type="button" data-study onClick={() => {
                                        const itemProgress = findLessonProgress(progress, studyEntry);
                                        onOpen(studyEntry, itemProgress?.side || preferredSide, Boolean(itemProgress), Boolean(itemProgress));
                                    }}>{copy.study}</button>}
                                </div>
                            </article>;
                        })}
                    </div>
                </div>}

                {hiddenCount > 0 && <button type="button" className={styles.moreButton} onClick={() => setExtraVisible(value => value + MORE_STEP)}>＋ {copy.showMore} ({hiddenCount})</button>}
                {extraVisible > 0 && <button type="button" className={styles.lessButton} onClick={() => setExtraVisible(0)}>↑ {copy.showLess}</button>}
                {!model.root.descendantLines && <div className={styles.empty}>{loadingLabel}</div>}
                {exact && <div className={styles.exactLine}>
                    <span>{localizeOpeningName(exact.name, language)}</span>
                    <button type="button" onClick={() => {
                        const itemProgress = findLessonProgress(progress, exact);
                        onOpen(exact, itemProgress?.side || preferredSide, Boolean(itemProgress), Boolean(itemProgress));
                    }}>{copy.study} →</button>
                </div>}
            </section>
        </main>
        {fullscreen && <footer className={styles.fullscreenHint}>{copy.zoomHint}</footer>}
    </div>;
}

export default CourseRepertoireTree;
