import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Chess, Square } from "chess.js";
import { useTranslation } from "react-i18next";

import SuggestionArrowOverlay from "@analysis/components/Board/SuggestionArrowOverlay";
import { getRepertoireTutorialCopy } from "./repertoireTutorialCopy";
import * as styles from "./repertoireTutorial.module.css";

type Experience = "beginner" | "basic" | "advanced";
type CoreStep = "welcome" | "learn" | "family" | "tree" | "search" | "fullscreen" | "line" | "move" | "reference" | "save" | "done";
type Microtip = "variants" | "stockfish" | "habit";

interface TutorialState {
    version: 1;
    experience?: Experience;
    completed: boolean;
    completedAt?: number;
    seen: Partial<Record<Microtip, boolean>>;
}

interface RectState { left:number; top:number; right:number; bottom:number; width:number; height:number; }
interface ArrowState { host:HTMLElement; from:Square; to:Square; flipped:boolean; }
interface Props { onResetWorkspace: () => void; }

interface NavigationCopy {
    treeTitle:string; treeBody:string;
    searchTitle:string; searchBody:string;
    fullscreenTitle:string; fullscreenBody:string;
}

const NAV_COPY:Record<string,NavigationCopy>={
    en:{treeTitle:"Navigate the focus tree",treeBody:"The tree no longer shows the whole opening at once. Follow one branch; forced sequences are compacted and only the next useful decisions appear.",searchTitle:"Find a branch instantly",searchBody:"Search by variation name, one move or a sequence. NexoChess focuses the matching part of the course instead of making you hunt through the tree.",fullscreenTitle:"Semantic zoom",fullscreenBody:"Full screen gives the tree the whole display. Only there, use the mouse wheel to move between overview, branches, moves and the full line."},
    es:{treeTitle:"Navega por el árbol de foco",treeBody:"El árbol ya no enseña toda la apertura a la vez. Sigue una rama: las secuencias sin decisiones se compactan y solo aparecen las siguientes decisiones útiles.",searchTitle:"Encuentra una rama al instante",searchBody:"Busca por nombre de variante, por una jugada o por una secuencia. NexoChess enfoca esa zona del curso sin obligarte a recorrer todo el árbol.",fullscreenTitle:"Zoom semántico",fullscreenBody:"La pantalla completa dedica toda la vista al árbol. Solo ahí, usa la rueda para pasar de vista general a ramas, jugadas y línea completa."},
    fr:{treeTitle:"Naviguez dans l’arbre focalisé",treeBody:"L’arbre n’affiche plus toute l’ouverture. Suivez une branche : les séquences forcées sont compactées et seules les décisions utiles apparaissent.",searchTitle:"Trouvez une branche immédiatement",searchBody:"Cherchez un nom de variante, un coup ou une séquence. NexoChess se place directement dans la bonne zone du cours.",fullscreenTitle:"Zoom sémantique",fullscreenBody:"Le plein écran réserve tout l’espace à l’arbre. Là seulement, la molette passe de la vue générale aux branches, coups et ligne complète."},
    de:{treeTitle:"Im Fokusbaum navigieren",treeBody:"Der Baum zeigt nicht mehr die ganze Eröffnung auf einmal. Folge einem Zweig; erzwungene Folgen werden komprimiert und nur relevante Entscheidungen angezeigt.",searchTitle:"Einen Zweig sofort finden",searchBody:"Suche nach Variantenname, Zug oder Zugfolge. NexoChess fokussiert direkt den passenden Bereich.",fullscreenTitle:"Semantischer Zoom",fullscreenBody:"Im Vollbild gehört die gesamte Ansicht dem Baum. Nur dort wechselt das Mausrad zwischen Übersicht, Zweigen, Zügen und vollständiger Linie."},
    pt:{treeTitle:"Navegue pela árvore focada",treeBody:"A árvore já não mostra toda a abertura de uma vez. Siga um ramo; sequências forçadas são compactadas e só aparecem decisões úteis.",searchTitle:"Encontre um ramo de imediato",searchBody:"Pesquise pelo nome da variante, por um lance ou por uma sequência. O NexoChess foca diretamente essa zona do curso.",fullscreenTitle:"Zoom semântico",fullscreenBody:"No ecrã inteiro, toda a vista fica dedicada à árvore. Só aí a roda alterna entre visão geral, ramos, lances e linha completa."},
    ru:{treeTitle:"Навигация по дереву фокуса",treeBody:"Дерево больше не показывает весь дебют сразу. Идите по одной ветке: вынужденные серии сжимаются, остаются только полезные решения.",searchTitle:"Мгновенный поиск ветки",searchBody:"Ищите по названию варианта, ходу или последовательности. NexoChess сразу сфокусируется на нужной части курса.",fullscreenTitle:"Семантический масштаб",fullscreenBody:"Во весь экран дерево занимает всю область. Только там колесо переключает обзор, ветки, ходы и полную линию."},
    zh:{treeTitle:"使用聚焦树导航",treeBody:"树不再一次显示整个开局。每次沿一个分支前进；无分叉的序列会被压缩，只显示有用的下一步选择。",searchTitle:"立即找到分支",searchBody:"可按变例名、单步或走法序列搜索。NexoChess 会直接聚焦到课程中的对应位置。",fullscreenTitle:"语义缩放",fullscreenBody:"全屏时整个画面都用于树。只有在全屏中，滚轮才会在总览、分支、走法和完整线路之间切换。"},
    vi:{treeTitle:"Điều hướng cây tập trung",treeBody:"Cây không còn hiển thị toàn bộ khai cuộc cùng lúc. Đi theo từng nhánh; chuỗi bắt buộc được gom lại và chỉ các quyết định hữu ích mới hiện ra.",searchTitle:"Tìm nhánh ngay lập tức",searchBody:"Tìm theo tên biến, một nước đi hoặc chuỗi nước đi. NexoChess sẽ tập trung đúng phần của khóa học.",fullscreenTitle:"Thu phóng ngữ nghĩa",fullscreenBody:"Toàn màn hình dành toàn bộ không gian cho cây. Chỉ ở đó, con lăn chuyển giữa tổng quan, nhánh, nước đi và toàn bộ dòng."},
    hi:{treeTitle:"फोकस ट्री में नेविगेट करें",treeBody:"अब पूरा ओपनिंग ट्री एक साथ नहीं दिखता। एक शाखा पर चलें; मजबूर क्रम संक्षिप्त होते हैं और केवल उपयोगी अगले निर्णय दिखते हैं।",searchTitle:"शाखा तुरंत खोजें",searchBody:"वेरिएशन नाम, चाल या चालों के क्रम से खोजें। NexoChess सीधे उसी हिस्से पर फोकस करेगा।",fullscreenTitle:"सिमैंटिक ज़ूम",fullscreenBody:"पूर्ण स्क्रीन में पूरा स्थान ट्री का होता है। केवल वहाँ व्हील से ओवरव्यू, शाखा, चाल और पूरी लाइन के स्तर बदलते हैं।"},
    mr:{treeTitle:"फोकस ट्रीमध्ये नेव्हिगेट करा",treeBody:"आता संपूर्ण ओपनिंग एकाच वेळी दिसत नाही. एका फांदीने पुढे जा; सक्तीचे क्रम संक्षिप्त होतात आणि फक्त उपयुक्त निर्णय दिसतात.",searchTitle:"फांदी लगेच शोधा",searchBody:"व्हेरिएशनचे नाव, चाल किंवा चालांचा क्रम शोधा. NexoChess थेट त्या भागावर लक्ष केंद्रित करेल.",fullscreenTitle:"सिमॅंटिक झूम",fullscreenBody:"पूर्ण स्क्रीनमध्ये संपूर्ण जागा ट्रीसाठी असते. फक्त तिथे व्हीलने आढावा, फांद्या, चाली आणि पूर्ण लाईन यांमध्ये बदला."},
    pl:{treeTitle:"Nawiguj po drzewie skupienia",treeBody:"Drzewo nie pokazuje już całego debiutu naraz. Idź jedną gałęzią; wymuszone sekwencje są zwijane, a widoczne zostają użyteczne decyzje.",searchTitle:"Znajdź gałąź od razu",searchBody:"Szukaj nazwy wariantu, ruchu lub sekwencji. NexoChess ustawi fokus dokładnie na właściwym miejscu kursu.",fullscreenTitle:"Zoom semantyczny",fullscreenBody:"Pełny ekran oddaje całą przestrzeń drzewu. Tylko tam kółko przełącza między przeglądem, gałęziami, ruchami i pełną linią."}
};

const STORAGE_KEY = "nexochess:repertoire:tutorial:v1";
const DEFAULT_STATE: TutorialState = { version: 1, completed: false, seen: {} };

function readState():TutorialState {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<TutorialState> | null;
        if (!parsed || parsed.version != 1) return DEFAULT_STATE;
        return { version: 1, experience: parsed.experience, completed: Boolean(parsed.completed), completedAt: parsed.completedAt, seen: parsed.seen || {} };
    } catch {
        return DEFAULT_STATE;
    }
}

function selectorFor(step:CoreStep|null,microtip:Microtip|null){
    if (microtip == "variants") return '[data-repertoire-tour="variants"]';
    if (microtip == "stockfish") return '[data-repertoire-tour="stockfish"]';
    if (microtip == "habit") return '[data-repertoire-tour="personal-habit"]';
    if (step == "learn") return '[data-repertoire-tour="mode-learn"]';
    if (step == "family") return '[data-repertoire-tour="family-grid"] button';
    if (step == "tree") return '[data-repertoire-tour="focus-tree"]';
    if (step == "search") return '[data-repertoire-tour="focus-search"]';
    if (step == "fullscreen") return '[data-repertoire-tour="focus-fullscreen"]';
    if (step == "line") return '[data-repertoire-tour="study-next"]';
    if (step == "move") return '[data-repertoire-tour="lesson-board"]';
    if (step == "reference") return '[data-repertoire-tour="reference-line"]';
    if (step == "save") return '[data-repertoire-tour="save-line"]';
    return "";
}

function clamp(value:number,min:number,max:number){return Math.max(min,Math.min(value,max));}

function sanOf(button:HTMLButtonElement){
    const prefix=button.querySelector("small")?.textContent||"";
    const text=button.textContent||"";
    return (prefix&&text.startsWith(prefix)?text.slice(prefix.length):text.replace(prefix,"")).trim();
}

function tutorialMoveArrow():ArrowState|null{
    const host=document.querySelector<HTMLElement>('[data-repertoire-tour="lesson-board"]');
    const reference=document.querySelector<HTMLElement>('[data-repertoire-tour="reference-line"]');
    if(!host||!reference)return null;
    const buttons=Array.from(reference.querySelectorAll<HTMLButtonElement>("button"));
    if(!buttons.length)return null;
    const activeIndex=buttons.findIndex(button=>button.getAttribute("data-active")=="true");
    const game=new Chess();
    for(let i=0;i<=activeIndex;i++){
        const san=sanOf(buttons[i]);
        if(!san)return null;
        try{game.move(san);}catch{return null;}
    }
    const next=buttons[activeIndex+1];
    if(!next)return null;
    let move;
    try{move=game.move(sanOf(next));}catch{return null;}
    if(!move)return null;
    const activeSide=host.closest("section")?.querySelector('header button[data-active="true"]') as HTMLElement|null;
    const flipped=Boolean(activeSide?.parentElement&&Array.from(activeSide.parentElement.children).indexOf(activeSide)==1);
    return {host,from:move.from as Square,to:move.to as Square,flipped};
}

function RepertoireTutorial({onResetWorkspace}:Props){
    const {i18n}=useTranslation();
    const language=(i18n.resolvedLanguage||i18n.language||"en").split("-")[0].toLowerCase();
    const copy=getRepertoireTutorialCopy(language);
    const navCopy=NAV_COPY[language]||NAV_COPY.en;
    const initial=useRef<TutorialState>(readState()).current;
    const [state,setState]=useState<TutorialState>(initial);
    const [step,setStep]=useState<CoreStep|null>(initial.completed?null:"welcome");
    const [microtip,setMicrotip]=useState<Microtip|null>(null);
    const [rect,setRect]=useState<RectState|null>(null);
    const [moveArrow,setMoveArrow]=useState<ArrowState|null>(null);
    const justCompleted=useRef(false);
    const microtipShownThisSession=useRef(false);
    const autoScrolledSelector=useRef("");

    function persist(next:TutorialState){setState(next);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{}}
    function patch(next:Partial<TutorialState>){persist({...state,...next,seen:next.seen||state.seen});}
    function startAgain(){onResetWorkspace();justCompleted.current=false;setMicrotip(null);setRect(null);setMoveArrow(null);autoScrolledSelector.current="";setStep("welcome");}
    function finishCore(){const next={...state,completed:true,completedAt:Date.now()};persist(next);justCompleted.current=true;setMoveArrow(null);setStep("done");}
    function skipCore(){const next={...state,completed:true,completedAt:Date.now()};persist(next);justCompleted.current=true;setMicrotip(null);setRect(null);setMoveArrow(null);setStep(null);}
    function chooseExperience(experience:Experience){
        const next={...state,experience};persist(next);
        if(experience=="advanced"){justCompleted.current=true;persist({...next,completed:true,completedAt:Date.now()});setStep("done");return;}
        setStep("learn");
    }
    function dismissMicrotip(){if(!microtip)return;patch({seen:{...state.seen,[microtip]:true}});setMicrotip(null);setRect(null);}
    function nextInformationStep(){
        if(step=="tree"){setStep(state.experience=="basic"?"line":"search");return;}
        if(step=="search"){setStep("fullscreen");return;}
        if(step=="fullscreen"){setStep("line");return;}
        if(step=="reference"){setStep("save");return;}
        finishCore();
    }

    const selector=selectorFor(step,microtip);
    useEffect(()=>{
        if(!selector){setRect(null);setMoveArrow(null);return;}
        let frame=0;
        let observed:HTMLElement|null=null;
        const resizeObserver=new ResizeObserver(()=>schedule());
        const measure=()=>{
            frame=0;
            const element=document.querySelector(selector) as HTMLElement|null;
            if(element!==observed){resizeObserver.disconnect();observed=element;if(observed)resizeObserver.observe(observed);}
            if(!element){setRect(null);if(step=="move")setMoveArrow(null);return;}
            const box=element.getBoundingClientRect();
            setRect({left:box.left,top:box.top,right:box.right,bottom:box.bottom,width:box.width,height:box.height});
            if(step=="move"){
                const next=tutorialMoveArrow();
                setMoveArrow(previous=>previous&&next&&previous.host==next.host&&previous.from==next.from&&previous.to==next.to&&previous.flipped==next.flipped?previous:next);
            }else setMoveArrow(null);
            if(autoScrolledSelector.current!=selector){
                autoScrolledSelector.current=selector;
                if(step=="move"||box.top<86||box.bottom>window.innerHeight-64){
                    window.setTimeout(()=>element.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"}),0);
                }
            }
        };
        function schedule(){if(frame)return;frame=window.requestAnimationFrame(measure);}
        schedule();
        const observer=new MutationObserver(schedule);observer.observe(document.body,{subtree:true,childList:true});
        window.addEventListener("resize",schedule);window.addEventListener("scroll",schedule,true);
        window.visualViewport?.addEventListener("resize",schedule);window.visualViewport?.addEventListener("scroll",schedule);
        return()=>{
            if(frame)window.cancelAnimationFrame(frame);
            resizeObserver.disconnect();observer.disconnect();
            window.removeEventListener("resize",schedule);window.removeEventListener("scroll",schedule,true);
            window.visualViewport?.removeEventListener("resize",schedule);window.visualViewport?.removeEventListener("scroll",schedule);
        };
    },[selector,step]);

    useEffect(()=>{
        if(!step||!["learn","family","line"].includes(step))return;
        const activeSelector=selectorFor(step,null);
        const handler=(event:MouseEvent)=>{
            const target=event.target as Element|null;
            if(!target?.closest(activeSelector))return;
            if(step=="learn")setStep("family");
            else if(step=="family")setStep("tree");
            else setStep("move");
        };
        document.addEventListener("click",handler,true);
        return()=>document.removeEventListener("click",handler,true);
    },[step]);

    useEffect(()=>{
        if(step!="move")return;
        const handler=()=>{if(state.experience=="basic")finishCore();else setStep("reference");};
        window.addEventListener("nexochess:repertoire-study-move",handler);
        return()=>window.removeEventListener("nexochess:repertoire-study-move",handler);
    },[step,state.experience,state]);

    useEffect(()=>{
        if(!step||step=="welcome"||step=="done")return;
        const observer=new MutationObserver(()=>{
            if(step=="learn"&&document.querySelector('[data-repertoire-tour="family-grid"]'))setStep("family");
            if(step=="family"&&document.querySelector('[data-repertoire-tour="focus-tree"]'))setStep("tree");
            if(step=="line"&&document.querySelector('[data-repertoire-tour="lesson-board"]'))setStep("move");
        });
        observer.observe(document.body,{subtree:true,childList:true});
        return()=>observer.disconnect();
    },[step]);

    useEffect(()=>{
        if(!state.completed||step||microtip||justCompleted.current||microtipShownThisSession.current)return;
        let timer:number|undefined;
        const tryShow=()=>{
            const candidates:Microtip[]=["habit","variants","stockfish"];
            const found=candidates.find(item=>!state.seen[item]&&document.querySelector(selectorFor(null,item)));
            if(!found)return;
            if(timer!=undefined)window.clearTimeout(timer);
            timer=window.setTimeout(()=>{if(document.querySelector(selectorFor(null,found))){microtipShownThisSession.current=true;setMicrotip(found);}},900);
        };
        tryShow();
        const observer=new MutationObserver(tryShow);observer.observe(document.body,{subtree:true,childList:true});
        return()=>{observer.disconnect();if(timer!=undefined)window.clearTimeout(timer);};
    },[state.completed,state.seen,step,microtip]);

    useEffect(()=>{
        if(!step&&!microtip)return;
        const handler=(event:KeyboardEvent)=>{
            if(event.key!="Escape")return;
            event.preventDefault();event.stopPropagation();
            if(microtip)dismissMicrotip();else skipCore();
        };
        document.addEventListener("keydown",handler,true);
        return()=>document.removeEventListener("keydown",handler,true);
    },[step,microtip,state]);

    const tooltipPosition=useMemo(()=>{
        if(!rect)return undefined;
        const margin=12;const gap=16;const maxWidth=Math.min(340,window.innerWidth-margin*2);const estimatedHeight=210;
        if(step=="move"){
            const roomLeft=Math.max(0,rect.left-gap-margin);
            const roomRight=Math.max(0,window.innerWidth-rect.right-gap-margin);
            const useRight=roomRight>=roomLeft;
            const room=Math.max(roomLeft,roomRight);
            if(room>=220){
                const width=Math.min(maxWidth,room);
                const left=useRight?rect.right+gap:rect.left-gap-width;
                const top=clamp(rect.top+(rect.height-estimatedHeight)/2,margin,Math.max(margin,window.innerHeight-estimatedHeight-margin));
                return{top,left,width};
            }
        }
        const width=maxWidth;
        let top=rect.bottom+gap;
        if(top+estimatedHeight>window.innerHeight&&rect.top>estimatedHeight+gap)top=rect.top-estimatedHeight-gap;
        top=clamp(top,margin,Math.max(margin,window.innerHeight-estimatedHeight-margin));
        let left=rect.left+Math.min(rect.width/2,180)-width/2;
        left=clamp(left,margin,window.innerWidth-width-margin);
        return{top,left,width};
    },[rect,step]);

    const beginnerSteps:CoreStep[]=["learn","family","tree","search","fullscreen","line","move","reference","save"];
    const basicSteps:CoreStep[]=["learn","family","tree","line","move"];
    const sequence=state.experience=="basic"?basicSteps:beginnerSteps;
    const progress=step?Math.max(0,sequence.indexOf(step)+1):0;
    const total=sequence.length;
    const title=step=="tree"?navCopy.treeTitle:step=="search"?navCopy.searchTitle:step=="fullscreen"?navCopy.fullscreenTitle:step=="learn"?copy.learnTitle:step=="family"?copy.familyTitle:step=="line"?copy.lineTitle:step=="move"?copy.moveTitle:step=="reference"?copy.referenceTitle:step=="save"?copy.saveTitle:microtip=="variants"?copy.variantsTitle:microtip=="stockfish"?copy.stockfishTitle:copy.habitTitle;
    const body=step=="tree"?navCopy.treeBody:step=="search"?navCopy.searchBody:step=="fullscreen"?navCopy.fullscreenBody:step=="learn"?copy.learnBody:step=="family"?copy.familyBody:step=="line"?copy.lineBody:step=="move"?copy.moveBody:step=="reference"?copy.referenceBody:step=="save"?copy.saveBody:microtip=="variants"?copy.variantsBody:microtip=="stockfish"?copy.stockfishBody:copy.habitBody;
    const actionable=Boolean(step&&["learn","family","line","move"].includes(step));

    return <>
        {!step&&!microtip&&<button type="button" className={styles.launcher} onClick={startAgain} title={copy.launcher}><span>?</span><b>{copy.launcher}</b></button>}
        {step=="welcome"&&<div className={styles.modalBackdrop} role="dialog" aria-modal="true"><section className={styles.modal}><span className={styles.modalEyebrow}>NexoChess</span><h2>{copy.welcomeTitle}</h2><p>{copy.welcomeBody}</p><div className={styles.experienceGrid}><button type="button" onClick={()=>chooseExperience("beginner")}><strong>{copy.beginner}</strong><small>{copy.beginnerHelp}</small></button><button type="button" onClick={()=>chooseExperience("basic")}><strong>{copy.basic}</strong><small>{copy.basicHelp}</small></button><button type="button" onClick={()=>chooseExperience("advanced")}><strong>{copy.advanced}</strong><small>{copy.advancedHelp}</small></button></div><div className={styles.modalActions}><button type="button" className={styles.skip} onClick={skipCore}>{copy.skip}</button></div></section></div>}
        {step=="done"&&<div className={styles.modalBackdrop} role="dialog" aria-modal="true"><section className={styles.modal}><span className={styles.doneMark}>✓</span><h2>{copy.doneTitle}</h2><p>{copy.doneBody}</p><div className={styles.modalActions}><button type="button" className={styles.skip} onClick={startAgain}>{copy.restart}</button><button type="button" onClick={()=>setStep(null)}>{copy.keepGoing}</button></div></section></div>}
        {rect&&selector&&<div className={styles.spotlight} style={{left:rect.left-6,top:rect.top-6,width:rect.width+12,height:rect.height+12}}/>}
        {step=="move"&&moveArrow&&createPortal(<div className={styles.tutorialArrow}><SuggestionArrowOverlay arrows={[{from:moveArrow.from,to:moveArrow.to,colour:"#66b5ff"}]} flipped={moveArrow.flipped}/></div>,moveArrow.host)}
        {(rect&&tooltipPosition&&(step&&!(["welcome","done"].includes(step))||microtip))&&<section className={styles.tooltip} style={tooltipPosition} role="status"><div className={styles.tooltipHeader}><div><span>{microtip?"NexoChess":`${progress}/${total}`}</span><h3>{title}</h3></div>{!microtip&&<div className={styles.progressDots}>{Array.from({length:total},(_,index)=><i key={index} data-active={index<progress}/>)}</div>}</div><p>{body}</p><div className={styles.tooltipFooter}><span className={styles.actionHint}>{actionable?copy.actionHint:""}</span><div>{microtip?<button type="button" onClick={dismissMicrotip}>{copy.understood}</button>:actionable?<button type="button" className={styles.skip} onClick={skipCore}>{copy.skip}</button>:<button type="button" onClick={nextInformationStep}>{copy.understood}</button>}</div></div></section>}
    </>;
}

export default RepertoireTutorial;
