import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getRepertoireTutorialCopy } from "./repertoireTutorialCopy";
import * as styles from "./repertoireTutorial.module.css";

type Experience = "beginner" | "basic" | "advanced";
type CoreStep = "welcome" | "learn" | "family" | "line" | "move" | "reference" | "save" | "done";
type Microtip = "variants" | "stockfish" | "habit";

interface TutorialState {
    version: 1;
    experience?: Experience;
    completed: boolean;
    completedAt?: number;
    seen: Partial<Record<Microtip, boolean>>;
}

interface RectState { left:number; top:number; right:number; bottom:number; width:number; height:number; }
interface Props { onResetWorkspace: () => void; }

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
    if (step == "line") return '[data-repertoire-tour="lesson-list"] button';
    if (step == "move") return '[data-repertoire-tour="lesson-board"]';
    if (step == "reference") return '[data-repertoire-tour="reference-line"]';
    if (step == "save") return '[data-repertoire-tour="save-line"]';
    return "";
}

function RepertoireTutorial({onResetWorkspace}:Props){
    const {i18n}=useTranslation();
    const copy=getRepertoireTutorialCopy(i18n.resolvedLanguage||i18n.language||"en");
    const initial=useRef<TutorialState>(readState()).current;
    const [state,setState]=useState<TutorialState>(initial);
    const [step,setStep]=useState<CoreStep|null>(initial.completed?null:"welcome");
    const [microtip,setMicrotip]=useState<Microtip|null>(null);
    const [rect,setRect]=useState<RectState|null>(null);
    const justCompleted=useRef(false);
    const microtipShownThisSession=useRef(false);

    function persist(next:TutorialState){setState(next);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{}}
    function patch(next:Partial<TutorialState>){persist({...state,...next,seen:next.seen||state.seen});}
    function startAgain(){onResetWorkspace();justCompleted.current=false;setMicrotip(null);setStep("welcome");}
    function finishCore(){const next={...state,completed:true,completedAt:Date.now()};persist(next);justCompleted.current=true;setStep("done");}
    function skipCore(){const next={...state,completed:true,completedAt:Date.now()};persist(next);justCompleted.current=true;setStep(null);}
    function chooseExperience(experience:Experience){
        const next={...state,experience};persist(next);
        if(experience=="advanced"){justCompleted.current=true;persist({...next,completed:true,completedAt:Date.now()});setStep("done");return;}
        setStep("learn");
    }
    function dismissMicrotip(){if(!microtip)return;patch({seen:{...state.seen,[microtip]:true}});setMicrotip(null);}

    const selector=selectorFor(step,microtip);
    useEffect(()=>{
        if(!selector){setRect(null);return;}
        let frame=0;
        const refresh=()=>{window.cancelAnimationFrame(frame);frame=window.requestAnimationFrame(()=>{const element=document.querySelector(selector) as HTMLElement|null;if(!element){setRect(null);return;}const box=element.getBoundingClientRect();setRect({left:box.left,top:box.top,right:box.right,bottom:box.bottom,width:box.width,height:box.height});});};
        refresh();
        const observer=new MutationObserver(refresh);observer.observe(document.body,{subtree:true,childList:true,attributes:true});
        window.addEventListener("resize",refresh);window.addEventListener("scroll",refresh,true);
        return()=>{window.cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener("resize",refresh);window.removeEventListener("scroll",refresh,true);};
    },[selector]);

    useEffect(()=>{
        if(!step||!["learn","family","line"].includes(step))return;
        const activeSelector=selectorFor(step,null);
        const handler=(event:MouseEvent)=>{const target=event.target as Element|null;if(!target?.closest(activeSelector))return;
            if(step=="learn")setStep("family");else if(step=="family")setStep("line");else setStep("move");
        };
        document.addEventListener("click",handler,true);return()=>document.removeEventListener("click",handler,true);
    },[step]);

    useEffect(()=>{
        if(step!="move")return;
        const handler=()=>{if(state.experience=="basic")finishCore();else setStep("reference");};
        window.addEventListener("nexochess:repertoire-study-move",handler);return()=>window.removeEventListener("nexochess:repertoire-study-move",handler);
    },[step,state.experience,state]);

    useEffect(()=>{
        if(!step||step=="welcome"||step=="done")return;
        const observer=new MutationObserver(()=>{
            if(step=="learn"&&document.querySelector('[data-repertoire-tour="family-grid"]'))setStep("family");
            if(step=="family"&&document.querySelector('[data-repertoire-tour="lesson-list"]'))setStep("line");
            if(step=="line"&&document.querySelector('[data-repertoire-tour="lesson-board"]'))setStep("move");
        });
        observer.observe(document.body,{subtree:true,childList:true});return()=>observer.disconnect();
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
        tryShow();const observer=new MutationObserver(tryShow);observer.observe(document.body,{subtree:true,childList:true});
        return()=>{observer.disconnect();if(timer!=undefined)window.clearTimeout(timer);};
    },[state.completed,state.seen,step,microtip]);

    const tooltipPosition=useMemo(()=>{
        if(!rect)return undefined;
        const width=Math.min(340,window.innerWidth-24);const estimatedHeight=190;const gap=14;
        let top=rect.bottom+gap;
        if(top+estimatedHeight>window.innerHeight&&rect.top>estimatedHeight+gap)top=rect.top-estimatedHeight-gap;
        top=Math.max(12,Math.min(top,window.innerHeight-estimatedHeight-12));
        let left=rect.left+Math.min(rect.width/2,180)-width/2;
        left=Math.max(12,Math.min(left,window.innerWidth-width-12));
        return{top,left,width};
    },[rect]);

    const progress=step&&["learn","family","line","move","reference","save"].includes(step)?(["learn","family","line","move","reference","save"].indexOf(step)+1):0;
    const total=state.experience=="basic"?4:6;
    const title=step=="learn"?copy.learnTitle:step=="family"?copy.familyTitle:step=="line"?copy.lineTitle:step=="move"?copy.moveTitle:step=="reference"?copy.referenceTitle:step=="save"?copy.saveTitle:microtip=="variants"?copy.variantsTitle:microtip=="stockfish"?copy.stockfishTitle:copy.habitTitle;
    const body=step=="learn"?copy.learnBody:step=="family"?copy.familyBody:step=="line"?copy.lineBody:step=="move"?copy.moveBody:step=="reference"?copy.referenceBody:step=="save"?copy.saveBody:microtip=="variants"?copy.variantsBody:microtip=="stockfish"?copy.stockfishBody:copy.habitBody;
    const actionable=Boolean(step&&["learn","family","line","move"].includes(step));

    return <>
        {!step&&!microtip&&<button type="button" className={styles.launcher} onClick={startAgain} title={copy.launcher}><span>?</span><b>{copy.launcher}</b></button>}
        {step=="welcome"&&<div className={styles.modalBackdrop} role="dialog" aria-modal="true"><section className={styles.modal}><span className={styles.modalEyebrow}>NexoChess</span><h2>{copy.welcomeTitle}</h2><p>{copy.welcomeBody}</p><div className={styles.experienceGrid}><button type="button" onClick={()=>chooseExperience("beginner")}><strong>{copy.beginner}</strong><small>{copy.beginnerHelp}</small></button><button type="button" onClick={()=>chooseExperience("basic")}><strong>{copy.basic}</strong><small>{copy.basicHelp}</small></button><button type="button" onClick={()=>chooseExperience("advanced")}><strong>{copy.advanced}</strong><small>{copy.advancedHelp}</small></button></div><div className={styles.modalActions}><button type="button" className={styles.skip} onClick={skipCore}>{copy.skip}</button></div></section></div>}
        {step=="done"&&<div className={styles.modalBackdrop} role="dialog" aria-modal="true"><section className={styles.modal}><span className={styles.doneMark}>✓</span><h2>{copy.doneTitle}</h2><p>{copy.doneBody}</p><div className={styles.modalActions}><button type="button" className={styles.skip} onClick={startAgain}>{copy.restart}</button><button type="button" onClick={()=>setStep(null)}>{copy.keepGoing}</button></div></section></div>}
        {rect&&selector&&<div className={styles.spotlight} style={{left:rect.left-6,top:rect.top-6,width:rect.width+12,height:rect.height+12}}/>}
        {(rect&&tooltipPosition&&(step&&!(["welcome","done"].includes(step))||microtip))&&<section className={styles.tooltip} style={tooltipPosition} role="status"><div className={styles.tooltipHeader}><div><span>{microtip?"NexoChess":`${progress}/${total}`}</span><h3>{title}</h3></div>{!microtip&&<div className={styles.progressDots}>{Array.from({length:total},(_,index)=><i key={index} data-active={index<progress}/>)}</div>}</div><p>{body}</p><div className={styles.tooltipFooter}><span className={styles.actionHint}>{actionable?copy.actionHint:""}</span><div>{microtip?<button type="button" onClick={dismissMicrotip}>{copy.understood}</button>:actionable?<button type="button" className={styles.skip} onClick={skipCore}>{copy.skip}</button>:<button type="button" onClick={()=>step=="reference"?setStep("save"):finishCore()}>{copy.understood}</button>}</div></div></section>}
    </>;
}

export default RepertoireTutorial;
