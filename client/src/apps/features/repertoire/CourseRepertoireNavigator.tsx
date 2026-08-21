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
import { loadOpeningPopularity, moveGames, moveShare, OpeningExplorerPosition } from "./openingExplorerClient";
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
    subtitle:string; fullscreen:string; exitFullscreen:string; search:string; matches:string; noResults:string;
    lines:string; current:string; courseStart:string; commonNext:string; commonHelp:string; games:string;
    loadingStats:string; noStats:string; explore:string; add:string; added:string; study:string; showMore:string;
    showLess:string; transposition:string; transpositionHelp:string; routes:string; zoom:string; zoomHint:string;
    popularPrompt:string; courseCoverage:string;
}

const COPY: Record<string, Copy> = {
    en:{subtitle:"Build your repertoire position by position. Forced moves are skipped automatically, so you only stop where there is a real choice.",fullscreen:"Full screen",exitFullscreen:"Exit full screen",search:"Search variation, move or sequence…",matches:"matches",noResults:"No matching line in this course",lines:"course lines",current:"Current position",courseStart:"Course start",commonNext:"What is usually played here?",commonHelp:"Percentages are based on games in the Lichess opening-explorer sample, not on unique players.",games:"of Lichess games",loadingStats:"Loading move popularity…",noStats:"Live popularity unavailable. Course coverage is shown instead.",explore:"Explore",add:"Add to my repertoire",added:"Added",study:"Study line",showMore:"Show more",showLess:"Show fewer",transposition:"Transposition",transpositionHelp:"This same position is also reached through another route in the course.",routes:"routes reach this position",zoom:"Detail",zoomHint:"In full screen, use the mouse wheel to change how many continuations are visible.",popularPrompt:"Choose only the continuations you actually want to prepare.",courseCoverage:"lines continue here"},
    es:{subtitle:"Construye tu repertorio posición a posición. Las jugadas forzadas se saltan solas para que solo te detengas donde hay una decisión real.",fullscreen:"Pantalla completa",exitFullscreen:"Salir de pantalla completa",search:"Buscar variante, movimiento o secuencia…",matches:"coincidencias",noResults:"No hay líneas coincidentes en este curso",lines:"líneas del curso",current:"Posición actual",courseStart:"Inicio del curso",commonNext:"¿Qué se suele jugar aquí?",commonHelp:"Los porcentajes corresponden a partidas de la muestra del explorador de Lichess, no a jugadores únicos.",games:"de partidas de Lichess",loadingStats:"Cargando frecuencia de jugadas…",noStats:"La frecuencia en vivo no está disponible. Se muestra la cobertura del curso.",explore:"Explorar",add:"Añadir a mi repertorio",added:"Añadida",study:"Estudiar línea",showMore:"Mostrar más",showLess:"Mostrar menos",transposition:"Transposición",transpositionHelp:"A esta misma posición también se llega por otra ruta del curso.",routes:"rutas llegan a esta posición",zoom:"Detalle",zoomHint:"En pantalla completa, usa la rueda para cambiar cuántas continuaciones se muestran.",popularPrompt:"Elige solo las continuaciones que de verdad quieras preparar.",courseCoverage:"líneas continúan por aquí"},
    fr:{subtitle:"Développez votre répertoire à partir de positions réelles. Explorez les suites les plus fréquentes, ajoutez celles qui vous intéressent et suivez les transpositions sans déployer tout l’arbre.",fullscreen:"Plein écran",exitFullscreen:"Quitter le plein écran",search:"Rechercher variante, coup ou séquence…",matches:"résultats",noResults:"Aucune ligne correspondante dans ce cours",lines:"lignes du cours",current:"Position actuelle",courseStart:"Début du cours",commonNext:"Suites les plus jouées",commonHelp:"Les pourcentages proviennent des parties de l’échantillon de l’explorateur Lichess, pas de joueurs uniques.",games:"des parties Lichess",loadingStats:"Chargement de la fréquence des coups…",noStats:"Fréquence en direct indisponible. La couverture du cours est affichée.",explore:"Explorer",add:"Ajouter à mon répertoire",added:"Ajoutée",study:"Étudier la ligne",showMore:"Afficher plus",showLess:"Afficher moins",transposition:"Transposition",transpositionHelp:"Cette position est aussi atteinte par une autre route du cours.",routes:"routes atteignent cette position",zoom:"Détail",zoomHint:"En plein écran, utilisez la molette pour changer le nombre de suites visibles.",popularPrompt:"Ajouter cette suite à votre répertoire ?",courseCoverage:"lignes continuent ici"},
    de:{subtitle:"Baue dein Repertoire aus echten Stellungen auf. Erkunde häufige Fortsetzungen, füge passende hinzu und folge Zugumstellungen, ohne den ganzen Baum zu öffnen.",fullscreen:"Vollbild",exitFullscreen:"Vollbild verlassen",search:"Variante, Zug oder Folge suchen…",matches:"Treffer",noResults:"Keine passende Linie in diesem Kurs",lines:"Kurslinien",current:"Aktuelle Stellung",courseStart:"Kursanfang",commonNext:"Häufigste Fortsetzungen",commonHelp:"Die Prozente basieren auf Partien der Lichess-Explorer-Stichprobe, nicht auf eindeutigen Spielern.",games:"der Lichess-Partien",loadingStats:"Zughäufigkeit wird geladen…",noStats:"Live-Häufigkeit nicht verfügbar. Stattdessen wird die Kursabdeckung gezeigt.",explore:"Erkunden",add:"Zu meinem Repertoire",added:"Hinzugefügt",study:"Linie lernen",showMore:"Mehr anzeigen",showLess:"Weniger anzeigen",transposition:"Zugumstellung",transpositionHelp:"Dieselbe Stellung wird im Kurs auch über einen anderen Weg erreicht.",routes:"Wege führen zu dieser Stellung",zoom:"Detail",zoomHint:"Im Vollbild ändert das Mausrad die Zahl sichtbarer Fortsetzungen.",popularPrompt:"Diese Fortsetzung ins Repertoire aufnehmen?",courseCoverage:"Linien gehen hier weiter"},
    pt:{subtitle:"Faça o repertório crescer a partir de posições reais. Explore as continuações mais comuns, adicione as que quiser e siga transposições sem abrir toda a árvore.",fullscreen:"Ecrã inteiro",exitFullscreen:"Sair do ecrã inteiro",search:"Pesquisar variante, lance ou sequência…",matches:"resultados",noResults:"Nenhuma linha correspondente neste curso",lines:"linhas do curso",current:"Posição atual",courseStart:"Início do curso",commonNext:"Continuações mais jogadas",commonHelp:"As percentagens usam partidas da amostra do explorador do Lichess, não jogadores únicos.",games:"das partidas do Lichess",loadingStats:"A carregar frequência dos lances…",noStats:"Frequência em direto indisponível. É mostrada a cobertura do curso.",explore:"Explorar",add:"Adicionar ao meu repertório",added:"Adicionada",study:"Estudar linha",showMore:"Mostrar mais",showLess:"Mostrar menos",transposition:"Transposição",transpositionHelp:"Esta posição também é alcançada por outra rota do curso.",routes:"rotas chegam a esta posição",zoom:"Detalhe",zoomHint:"Em ecrã inteiro, use a roda para alterar quantas continuações são mostradas.",popularPrompt:"Quer acrescentar esta continuação ao repertório?",courseCoverage:"linhas continuam aqui"},
    ru:{subtitle:"Расширяйте репертуар от реальных позиций: смотрите популярные продолжения, добавляйте нужные и учитывайте транспозиции без раскрытия всего дерева.",fullscreen:"Во весь экран",exitFullscreen:"Выйти из полноэкранного режима",search:"Поиск варианта, хода или последовательности…",matches:"совпадений",noResults:"В этом курсе совпадений нет",lines:"линий курса",current:"Текущая позиция",courseStart:"Начало курса",commonNext:"Самые частые продолжения",commonHelp:"Проценты рассчитаны по партиям выборки Lichess Explorer, а не по уникальным игрокам.",games:"партий Lichess",loadingStats:"Загрузка частоты ходов…",noStats:"Частота сейчас недоступна. Показано покрытие курса.",explore:"Открыть",add:"Добавить в репертуар",added:"Добавлено",study:"Изучить линию",showMore:"Показать ещё",showLess:"Показать меньше",transposition:"Транспозиция",transpositionHelp:"К этой позиции в курсе ведёт и другой путь.",routes:"маршрутов ведут к позиции",zoom:"Детали",zoomHint:"Во весь экран колесо меняет число видимых продолжений.",popularPrompt:"Добавить это продолжение в репертуар?",courseCoverage:"линий продолжаются здесь"},
    zh:{subtitle:"从真实局面逐步建立开局库。查看常见续着、加入想学的分支，并在不展开整棵树的情况下识别转置。",fullscreen:"全屏",exitFullscreen:"退出全屏",search:"搜索变例、走法或序列…",matches:"个结果",noResults:"本课程没有匹配路线",lines:"条课程线路",current:"当前局面",courseStart:"课程起点",commonNext:"最常见续着",commonHelp:"百分比来自 Lichess 开局探索器样本中的对局，并非独立棋手比例。",games:"的 Lichess 对局",loadingStats:"正在加载走法频率…",noStats:"实时频率不可用，改为显示课程覆盖度。",explore:"探索",add:"加入我的开局库",added:"已加入",study:"学习线路",showMore:"显示更多",showLess:"收起",transposition:"转置",transpositionHelp:"课程中的另一条路线也会到达同一局面。",routes:"条路线到达此局面",zoom:"细节",zoomHint:"全屏时滚轮切换可见续着数量。",popularPrompt:"要把这个续着加入你的开局库吗？",courseCoverage:"条线路从这里继续"},
    vi:{subtitle:"Xây repertoire từ các vị trí thực tế. Xem các tiếp diễn phổ biến, thêm nhánh bạn muốn và theo dõi chuyển thế mà không mở toàn bộ cây.",fullscreen:"Toàn màn hình",exitFullscreen:"Thoát toàn màn hình",search:"Tìm biến, nước đi hoặc chuỗi…",matches:"kết quả",noResults:"Không có dòng phù hợp trong khóa học",lines:"dòng khóa học",current:"Vị trí hiện tại",courseStart:"Đầu khóa học",commonNext:"Tiếp diễn phổ biến nhất",commonHelp:"Tỷ lệ dựa trên các ván trong mẫu Opening Explorer của Lichess, không phải số người chơi duy nhất.",games:"ván Lichess",loadingStats:"Đang tải tần suất nước đi…",noStats:"Không có tần suất trực tiếp. Đang hiển thị độ phủ của khóa học.",explore:"Khám phá",add:"Thêm vào repertoire",added:"Đã thêm",study:"Học dòng",showMore:"Hiện thêm",showLess:"Hiện ít hơn",transposition:"Chuyển thế",transpositionHelp:"Vị trí này cũng đạt được qua một đường khác trong khóa học.",routes:"đường đến vị trí này",zoom:"Chi tiết",zoomHint:"Ở toàn màn hình, dùng con lăn để đổi số tiếp diễn hiển thị.",popularPrompt:"Thêm tiếp diễn này vào repertoire?",courseCoverage:"dòng tiếp tục ở đây"},
    hi:{subtitle:"वास्तविक स्थितियों से अपना रिपर्टॉयर बढ़ाएँ। आम चालें देखें, मनचाही शाखाएँ जोड़ें और पूरा वृक्ष खोले बिना ट्रांसपोज़िशन समझें।",fullscreen:"पूर्ण स्क्रीन",exitFullscreen:"पूर्ण स्क्रीन से बाहर",search:"वेरिएशन, चाल या क्रम खोजें…",matches:"परिणाम",noResults:"इस कोर्स में कोई मिलती लाइन नहीं",lines:"कोर्स लाइनें",current:"मौजूदा स्थिति",courseStart:"कोर्स की शुरुआत",commonNext:"सबसे आम चालें",commonHelp:"प्रतिशत Lichess Explorer के नमूना खेलों पर आधारित हैं, अलग-अलग खिलाड़ियों पर नहीं।",games:"Lichess खेलों में",loadingStats:"चाल की आवृत्ति लोड हो रही है…",noStats:"लाइव आवृत्ति उपलब्ध नहीं। कोर्स कवरेज दिखाया जा रहा है।",explore:"देखें",add:"मेरे रिपर्टॉयर में जोड़ें",added:"जोड़ दिया",study:"लाइन सीखें",showMore:"और दिखाएँ",showLess:"कम दिखाएँ",transposition:"ट्रांसपोज़िशन",transpositionHelp:"इसी स्थिति तक कोर्स की दूसरी राह से भी पहुँचा जाता है।",routes:"रास्ते इस स्थिति तक",zoom:"विवरण",zoomHint:"पूर्ण स्क्रीन में व्हील से दिखने वाली चालों की संख्या बदलें।",popularPrompt:"यह चाल अपने रिपर्टॉयर में जोड़ें?",courseCoverage:"लाइनें यहाँ से जारी"},
    mr:{subtitle:"प्रत्यक्ष स्थितींमधून तुमचा रिपर्टॉयर वाढवा. सर्वाधिक खेळल्या जाणाऱ्या पुढच्या चाली पाहा, हव्या त्या शाखा जोडा आणि संपूर्ण झाड उघडल्याशिवाय ट्रान्सपोजिशन समजा.",fullscreen:"पूर्ण स्क्रीन",exitFullscreen:"पूर्ण स्क्रीनमधून बाहेर",search:"व्हेरिएशन, चाल किंवा क्रम शोधा…",matches:"निकाल",noResults:"या कोर्समध्ये जुळणारी लाईन नाही",lines:"कोर्स लाईन्स",current:"सध्याची स्थिती",courseStart:"कोर्सची सुरुवात",commonNext:"सर्वाधिक खेळल्या जाणाऱ्या चाली",commonHelp:"टक्केवारी Lichess Explorer च्या नमुना डावांवर आधारित आहे, वेगवेगळ्या खेळाडूंवर नाही.",games:"Lichess डावांमध्ये",loadingStats:"चालींची वारंवारता लोड होत आहे…",noStats:"थेट वारंवारता उपलब्ध नाही. कोर्स कव्हरेज दाखवले आहे.",explore:"पहा",add:"माझ्या रिपर्टॉयरमध्ये जोडा",added:"जोडले",study:"लाईन शिका",showMore:"आणखी दाखवा",showLess:"कमी दाखवा",transposition:"ट्रान्सपोजिशन",transpositionHelp:"हीच स्थिती कोर्समधील दुसऱ्या मार्गानेही येते.",routes:"मार्ग या स्थितीपर्यंत",zoom:"तपशील",zoomHint:"पूर्ण स्क्रीनमध्ये व्हीलने दिसणाऱ्या पुढच्या चालींची संख्या बदला.",popularPrompt:"ही पुढची चाल रिपर्टॉयरमध्ये जोडायची?",courseCoverage:"लाईन्स इथून पुढे जातात"},
    pl:{subtitle:"Rozwijaj repertuar z realnych pozycji. Oglądaj najczęstsze kontynuacje, dodawaj wybrane gałęzie i śledź transpozycje bez rozwijania całego drzewa.",fullscreen:"Pełny ekran",exitFullscreen:"Wyjdź z pełnego ekranu",search:"Szukaj wariantu, ruchu lub sekwencji…",matches:"wyników",noResults:"Brak pasującej linii w tym kursie",lines:"linii kursu",current:"Bieżąca pozycja",courseStart:"Początek kursu",commonNext:"Najczęstsze kontynuacje",commonHelp:"Procenty pochodzą z partii w próbce Lichess Opening Explorer, a nie z liczby unikalnych graczy.",games:"partii Lichess",loadingStats:"Ładowanie popularności ruchów…",noStats:"Popularność na żywo niedostępna. Pokazano pokrycie kursu.",explore:"Eksploruj",add:"Dodaj do repertuaru",added:"Dodano",study:"Ucz się linii",showMore:"Pokaż więcej",showLess:"Pokaż mniej",transposition:"Transpozycja",transpositionHelp:"Ta sama pozycja powstaje w kursie także inną drogą.",routes:"dróg prowadzi do tej pozycji",zoom:"Szczegóły",zoomHint:"Na pełnym ekranie kółko zmienia liczbę widocznych kontynuacji.",popularPrompt:"Dodać tę kontynuację do repertuaru?",courseCoverage:"linii biegnie dalej tędy"}
};

const ARROW_COLOURS = ["#5b9ed6", "#5cad83", "#d2a54d", "#9b82c5", "#c97762"];
const NORMAL_LIMIT = 5, MORE_STEP = 5, SEARCH_LIMIT = 10;

function entryKey(entry: OpeningCatalogueEntry) { return `${entry.eco}|${entry.name}|${entry.pgn}`; }
function positionKey(fen: string) { return fen.split(" ").slice(0, 4).join(" "); }
function createNode(id:string,san:string,uci:string,ply:number,fen:string,parent?:TreeNode):TreeNode{return{id,san,uci,ply,fen,positionKey:positionKey(fen),parent,children:new Map(),entries:[],descendantLines:0};}

function buildModel(lines: OpeningCatalogueEntry[]): TreeModel {
    const board0 = new Chess();
    const root = createNode("root", "", "", -1, board0.fen());
    const byId = new Map<string, TreeNode>([[root.id, root]]);
    const byPosition = new Map<string, TreeNode[]>([[root.positionKey, [root]]]);
    const entryNodes = new Map<string, TreeNode>();
    for (const entry of lines) {
        const sans = fastPgnSanTokens(entry.pgn); if (!sans.length) continue;
        const board = new Chess(); let node = root;
        for (let ply = 0; ply < sans.length; ply++) {
            let move; try { move = board.move(sans[ply]); } catch { break; } if (!move) break;
            const uci = `${move.from}${move.to}${move.promotion || ""}`; let child = node.children.get(uci);
            if (!child) {
                child = createNode(`${node.id}/${uci}:${ply}`, move.san, uci, ply, board.fen(), node);
                node.children.set(uci, child); byId.set(child.id, child);
                const routes = byPosition.get(child.positionKey) || []; routes.push(child); byPosition.set(child.positionKey, routes);
            }
            node = child;
        }
        node.entries.push(entry); entryNodes.set(entryKey(entry), node);
    }
    function annotate(node:TreeNode):number{let total=node.entries.length,representative=node.entries[0],best=-1;for(const child of node.children.values()){total+=annotate(child);if(child.descendantLines>best&&child.representative){best=child.descendantLines;if(!representative)representative=child.representative;}}node.descendantLines=total;node.representative=representative;return total;}
    annotate(root); return { root, byId, byPosition, entryNodes };
}

function pathNodes(node:TreeNode){const result:TreeNode[]=[];let cursor:TreeNode|undefined=node;while(cursor?.parent){result.push(cursor);cursor=cursor.parent;}return result.reverse();}
function moveLabel(nodes:TreeNode[]){return nodes.map((node,index)=>{const number=Math.floor(node.ply/2)+1;if(node.ply%2==0)return `${number}.${node.san}`;const previous=nodes[index-1];return previous&&previous.ply==node.ply-1?node.san:`${number}...${node.san}`;}).join(" ");}
function normalize(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().replace(/[^\p{L}\p{N}+#=.-]+/gu," ").trim();}
function exactStudyEntry(node:TreeNode,progress:CourseProgressStore){return node.entries.find(entry=>!findLessonProgress(progress,entry))||node.entries[0];}
function branchName(node:TreeNode,language:string,fallback:string){return node.representative?localizeOpeningName(node.representative.name,language):fallback;}
function explorerMoveFor(node:TreeNode,explorer:OpeningExplorerPosition|null|undefined){return explorer?.moves.find(move=>move.uci==node.uci);}
function routeEntry(node:TreeNode,family:string):OpeningCatalogueEntry|undefined{const representative=node.entries[0]||node.representative;if(!representative)return;const board=new Chess();for(const step of pathNodes(node)){try{board.move(step.san);}catch{return;}}return{eco:representative.eco,family,name:representative.name,pgn:board.pgn()};}
function collapseForced(node:TreeNode){let cursor=node;while(cursor.entries.length==0&&cursor.children.size==1){const child=Array.from(cursor.children.values())[0];if(!child||child.descendantLines!=cursor.descendantLines)break;cursor=child;}return cursor;}

function CourseRepertoireNavigator({name,lines,progress,preferredSide,percent,language,title,loadingLabel,onOpen,onAddToRepertoire}:Props){
    const lang=language.split("-")[0].toLowerCase(),copy=COPY[lang]||COPY.en;
    const settings=useSettingsStore(state=>state.settings),pieces=useMemo(()=>createCustomPieces(settings.themes.piece),[settings.themes.piece]);
    const model=useMemo(()=>buildModel(lines),[lines]),cardRef=useRef<HTMLDivElement>(null),wheelCarry=useRef(0);
    const initialFocus=useMemo(()=>collapseForced(model.root),[model]);
    const[focusId,setFocusId]=useState(initialFocus.id),[query,setQuery]=useState(""),[extraVisible,setExtraVisible]=useState(0),[fullscreen,setFullscreen]=useState(false),[semanticLevel,setSemanticLevel]=useState(1),[explorer,setExplorer]=useState<OpeningExplorerPosition|null|undefined>(),[added,setAdded]=useState<Set<string>>(()=>new Set()),[hoveredId,setHoveredId]=useState<string>();
    const focus=model.byId.get(focusId)||initialFocus,currentPath=pathNodes(focus),routesHere=(model.byPosition.get(focus.positionKey)||[]).filter(node=>node.id!=focus.id),effectiveLevel=fullscreen?semanticLevel:1;

    useEffect(()=>{setFocusId(collapseForced(model.root).id);setQuery("");setExtraVisible(0);setSemanticLevel(1);setHoveredId(undefined);},[model,name]);
    useEffect(()=>{let active=true;setExplorer(undefined);void loadOpeningPopularity(focus.fen).then(value=>{if(active)setExplorer(value);});return()=>{active=false;};},[focus.fen]);
    useEffect(()=>{const onChange=()=>setFullscreen(document.fullscreenElement==cardRef.current);document.addEventListener("fullscreenchange",onChange);return()=>document.removeEventListener("fullscreenchange",onChange);},[]);
    useEffect(()=>{const card=cardRef.current;if(!card||!fullscreen)return;const onWheel=(event:WheelEvent)=>{event.preventDefault();wheelCarry.current+=event.deltaY;if(Math.abs(wheelCarry.current)<36)return;const direction=wheelCarry.current<0?1:-1;wheelCarry.current=0;setSemanticLevel(level=>Math.max(0,Math.min(3,level+direction)));};card.addEventListener("wheel",onWheel,{passive:false});return()=>card.removeEventListener("wheel",onWheel);},[fullscreen]);

    const records=useMemo(()=>Array.from(focus.children.values()).map(node=>{const live=explorerMoveFor(node,explorer);return{node,share:moveShare(explorer||null,live),games:moveGames(live)};}).sort((a,b)=>a.share!=null||b.share!=null?(b.share||0)-(a.share||0)||b.node.descendantLines-a.node.descendantLines:b.node.descendantLines-a.node.descendantLines||a.node.san.localeCompare(b.node.san)),[explorer,focus]);
    const bonus=effectiveLevel==0?-2:effectiveLevel==2?2:effectiveLevel==3?5:0,visibleCount=Math.max(Math.min(records.length,3),Math.min(records.length,NORMAL_LIMIT+bonus+extraVisible)),visible=records.slice(0,visibleCount),hidden=Math.max(0,records.length-visibleCount),maxCoverage=Math.max(1,...records.map(record=>record.node.descendantLines));
    const normalizedQuery=normalize(query);
    const searchMatches=useMemo(()=>{if(!normalizedQuery)return[] as Array<{entry:OpeningCatalogueEntry;node:TreeNode}>;const tokens=normalizedQuery.split(/\s+/).filter(Boolean);return lines.flatMap(entry=>{const node=model.entryNodes.get(entryKey(entry));if(!node)return[];const haystack=normalize(`${entry.name} ${localizeOpeningName(entry.name,language)} ${moveLabel(pathNodes(node))}`);return haystack.includes(normalizedQuery)||tokens.every(token=>haystack.includes(token))?[{entry,node}]:[];});},[language,lines,model,normalizedQuery]);
    const arrowRecords=hoveredId?visible.filter(record=>record.node.id==hoveredId):visible.slice(0,3);
    const arrows=arrowRecords.flatMap(record=>{const index=Math.max(0,visible.findIndex(item=>item.node.id==record.node.id));return record.node.uci.length<4?[]:[{from:record.node.uci.slice(0,2) as Square,to:record.node.uci.slice(2,4) as Square,colour:ARROW_COLOURS[index%ARROW_COLOURS.length],overlayColour:ARROW_COLOURS[index%ARROW_COLOURS.length]}];});
    const exact=exactStudyEntry(focus,progress),boardOrientation:RepertoireSide=preferredSide=="black"?"black":"white",currentTitle=focus==model.root?localizeOpeningName(name,language):branchName(focus,language,focus.san);

    function focusNode(node:TreeNode,collapse=true){const target=collapse?collapseForced(node):node;setFocusId(target.id);setExtraVisible(0);setQuery("");setHoveredId(undefined);}
    function addBranch(node:TreeNode){const entry=routeEntry(node,name);if(!entry)return;onAddToRepertoire(entry,preferredSide||inferSide(node.representative||entry));setAdded(previous=>new Set(previous).add(node.id));}
    async function toggleFullscreen(){const card=cardRef.current;if(!card)return;try{if(document.fullscreenElement==card)await document.exitFullscreen();else await card.requestFullscreen();}catch{/* optional enhancement */}}
    function study(entry:OpeningCatalogueEntry){const itemProgress=findLessonProgress(progress,entry);onOpen(entry,itemProgress?.side||preferredSide,Boolean(itemProgress),Boolean(itemProgress));}

    return <div ref={cardRef} className={styles.card} data-repertoire-tour="focus-tree">
        <header className={styles.header}><div><strong>{title}</strong><span>{copy.subtitle}</span></div><div className={styles.headerActions}><b>{percent}% · {lines.length} {copy.lines}</b>{fullscreen&&<div className={styles.zoomControls}><button type="button" onClick={()=>setSemanticLevel(level=>Math.max(0,level-1))} disabled={semanticLevel==0}>−</button><span>{copy.zoom} {semanticLevel+1}/4</span><button type="button" onClick={()=>setSemanticLevel(level=>Math.min(3,level+1))} disabled={semanticLevel==3}>+</button></div>}<button type="button" className={styles.fullscreenButton} data-repertoire-tour="focus-fullscreen" onClick={toggleFullscreen} aria-label={fullscreen?copy.exitFullscreen:copy.fullscreen} title={fullscreen?copy.exitFullscreen:copy.fullscreen}>{fullscreen?"↙":"⛶"}</button></div></header>
        <div className={styles.progress}><i style={{width:`${percent}%`}}/></div>
        <div className={styles.search} data-repertoire-tour="focus-search"><span aria-hidden="true">⌕</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder={copy.search}/>{normalizedQuery&&<b>{searchMatches.length} {copy.matches}</b>}</div>
        {normalizedQuery&&<div className={styles.searchResults}>{searchMatches.length==0&&<p>{copy.noResults}</p>}{searchMatches.slice(0,SEARCH_LIMIT).map(match=><button type="button" key={entryKey(match.entry)} onClick={()=>focusNode(match.node)}><span><strong>{localizeOpeningName(match.entry.name,language)}</strong><small>{moveLabel(pathNodes(match.node).slice(-6))}</small></span><em>{match.entry.eco}</em></button>)}</div>}
        <nav className={styles.breadcrumb} aria-label={copy.current}><button type="button" data-current={focus==model.root} onClick={()=>focusNode(model.root)}>{localizeOpeningName(name,language)}</button>{currentPath.map(node=><React.Fragment key={node.id}><span>›</span><button type="button" data-current={node.id==focus.id} onClick={()=>focusNode(node,false)}>{moveLabel([node])}</button></React.Fragment>)}</nav>
        <main className={styles.workspace} data-level={effectiveLevel}>
            <section className={styles.boardPanel}><div className={styles.boardHeading}><span>{copy.current}</span><strong>{currentTitle}</strong><small>{currentPath.length?moveLabel(currentPath.slice(-8)):copy.courseStart}</small></div><div className={styles.boardWrap}><Chessboard id="repertoire-course-navigator-board" position={focus.fen} boardOrientation={boardOrientation} arePiecesDraggable={false} customPieces={pieces} customDarkSquareStyle={{backgroundColor:settings.themes.board.darkSquareColour}} customLightSquareStyle={{backgroundColor:settings.themes.board.lightSquareColour}} showBoardNotation={settings.themes.board.coordinates=="inside"}/><SuggestionArrowOverlay arrows={arrows} flipped={boardOrientation=="black"} shaftWidthPx={14} headLengthPx={30} headWidthPx={34}/></div><div className={styles.positionMeta}>{explorer===undefined?<span>{copy.loadingStats}</span>:explorer===null?<span>{copy.noStats}</span>:<span>{copy.commonHelp}</span>}</div></section>
            <section className={styles.decisionPanel}>
                <header className={styles.decisionHeader}><div><span>{copy.commonNext}</span><h3>{currentPath.length?moveLabel(currentPath.slice(-4)):localizeOpeningName(name,language)}</h3><p>{copy.popularPrompt}</p></div><strong>{focus.descendantLines} {copy.courseCoverage}</strong></header>
                {routesHere.length>0&&<div className={styles.transpositions}><div><strong>↔ {copy.transposition}</strong><span>{copy.transpositionHelp}</span></div><div>{routesHere.slice(0,3).map(route=><button type="button" key={route.id} onClick={()=>focusNode(route,false)}>{moveLabel(pathNodes(route).slice(-5))}</button>)}</div></div>}
                {visible.length>0&&<div className={styles.moveList} data-repertoire-tour="focus-branches">{visible.map((record,index)=>{const node=record.node,studyEntry=exactStudyEntry(node,progress),routeCount=model.byPosition.get(node.positionKey)?.length||1,share=record.share,metricValue=share!=null?`${Math.round(share)}%`:`${node.descendantLines}`,metricLabel=share!=null?copy.games:copy.lines,barWidth=share!=null?Math.max(3,Math.min(100,share)):Math.max(3,node.descendantLines/maxCoverage*100),colour=ARROW_COLOURS[index%ARROW_COLOURS.length];return <article key={node.id} className={styles.moveRow} data-hovered={hoveredId==node.id} onMouseEnter={()=>setHoveredId(node.id)} onMouseLeave={()=>setHoveredId(undefined)} style={{"--move-colour":colour} as React.CSSProperties}><div className={styles.moveAccent}/><div className={styles.moveIdentity}><strong>{moveLabel([node])}</strong><span>{branchName(node,language,node.san)}</span>{routeCount>1&&<em>↔ {copy.transposition} · {routeCount}</em>}</div><div className={styles.moveMetric}><div><strong>{metricValue}</strong><small>{metricLabel}</small></div><i><b style={{width:`${barWidth}%`}}/></i>{share!=null&&record.games>0&&<small>{record.games.toLocaleString()}</small>}</div><div className={styles.moveActions}><button type="button" onClick={()=>focusNode(node)}>{copy.explore} →</button><button type="button" data-primary disabled={added.has(node.id)} onClick={()=>addBranch(node)}>{added.has(node.id)?`✓ ${copy.added}`:`＋ ${copy.add}`}</button>{studyEntry&&<button type="button" data-study onClick={()=>study(studyEntry)}>{copy.study}</button>}</div></article>;})}</div>}
                <div className={styles.listControls}>{hidden>0&&<button type="button" onClick={()=>setExtraVisible(value=>value+MORE_STEP)}>＋ {copy.showMore} ({hidden})</button>}{extraVisible>0&&<button type="button" onClick={()=>setExtraVisible(0)}>↑ {copy.showLess}</button>}</div>
                {!model.root.descendantLines&&<div className={styles.empty}>{loadingLabel}</div>}
                {exact&&<div className={styles.exactLine}><span>{localizeOpeningName(exact.name,language)}</span><button type="button" data-repertoire-tour="study-next" onClick={()=>study(exact)}>{copy.study} →</button></div>}
            </section>
        </main>
        {fullscreen&&<footer className={styles.fullscreenHint}>{copy.zoomHint}</footer>}
    </div>;
}

export default CourseRepertoireNavigator;
