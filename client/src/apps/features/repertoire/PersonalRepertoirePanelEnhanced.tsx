import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Chess } from "chess.js";

import PersonalRepertoirePanel from "./PersonalRepertoirePanel";
import RepertoireEngineInsight from "./RepertoireEngineInsight";
import { appendPvToRepertoire } from "./repertoireEngine";
import { OpeningCatalogueEntry, loadOpeningCatalogue } from "./openingCatalogue";
import { localizeMaybeOpening, localizeOpeningName } from "./openingLocalization";
import { OpenTarget, RepertoireStore, pathToNode } from "./repertoireStore";
import { SavedRepertoireLine, SavedRepertoireLineStore, deleteSavedRepertoireLine, linesForRepertoire, readSavedRepertoireLines, upsertSavedRepertoireLine, writeSavedRepertoireLines } from "./savedRepertoireLines";
import { formatEnhancementCopy, useRepertoireEnhancementCopy } from "./repertoireEnhancementCopy";
import * as styles from "./repertoirePolish.module.css";

interface Props { store: RepertoireStore; setStore: React.Dispatch<React.SetStateAction<RepertoireStore>>; target: OpenTarget | null; onOpen: (target: OpenTarget) => void; onClose: () => void; saved: boolean; onStudyRepertoire: (repertoireId: string) => void; onStudyMixed: () => void; }
const LINE_WORD: Record<string,string> = { en:"Line", es:"Línea", fr:"Ligne", de:"Variante", pt:"Linha", ru:"Вариант", zh:"路线", vi:"Biến", hi:"लाइन", mr:"लाईन", pl:"Wariant" };
function validLine(store: RepertoireStore,line:SavedRepertoireLine){return Boolean(store.repertoires[line.repertoireId]&&store.nodes[line.nodeId]);}
function pgnSans(opening:OpeningCatalogueEntry){try{const board=new Chess();board.loadPgn(opening.pgn);return board.history();}catch{return [] as string[];}}

function PersonalRepertoirePanelEnhanced({store,setStore,target,onOpen,onClose,saved,onStudyRepertoire,onStudyMixed}:Props){
    const copy=useRepertoireEnhancementCopy();
    const {i18n}=useTranslation();
    const language=i18n.resolvedLanguage||i18n.language||"en";
    const [lineStore,setLineStore]=useState<SavedRepertoireLineStore>(()=>readSavedRepertoireLines());
    const [catalogue,setCatalogue]=useState<OpeningCatalogueEntry[]>([]);
    const [leftDockHost,setLeftDockHost]=useState<HTMLElement|null>(null);
    const [rightDockHost,setRightDockHost]=useState<HTMLElement|null>(null);
    const [saveOpen,setSaveOpen]=useState(false);
    const [draftName,setDraftName]=useState("");
    const [fallbackName,setFallbackName]=useState("");
    useEffect(()=>writeSavedRepertoireLines(lineStore),[lineStore]);
    useEffect(()=>{let cancelled=false;void loadOpeningCatalogue().then(items=>{if(!cancelled)setCatalogue(items);});return()=>{cancelled=true;};},[]);

    const localizedStore=useMemo<RepertoireStore>(()=>({
        ...store,
        repertoires:Object.fromEntries(Object.entries(store.repertoires).map(([id,item])=>[id,{...item,name:localizeMaybeOpening(item.name,language)}]))
    }),[store,language]);
    const setLocalizedStore:React.Dispatch<React.SetStateAction<RepertoireStore>>=action=>{
        setStore(previous=>{
            const previousView:RepertoireStore={...previous,repertoires:Object.fromEntries(Object.entries(previous.repertoires).map(([id,item])=>[id,{...item,name:localizeMaybeOpening(item.name,language)}]))};
            const next=typeof action==="function"?action(previousView):action;
            const repertoires=Object.fromEntries(Object.entries(next.repertoires).map(([id,item])=>{
                const canonical=previous.repertoires[id];
                const displayed=previousView.repertoires[id];
                return [id,{...item,name:canonical&&displayed&&item.name===displayed.name?canonical.name:item.name}];
            }));
            return {...next,repertoires};
        });
    };

    const repertoire=target?store.repertoires[target.repertoireId]:undefined;
    const baseNodeId=repertoire?(repertoire.baseNodeId&&store.nodes[repertoire.baseNodeId]?repertoire.baseNodeId:repertoire.rootNodeId):undefined;
    const currentNodeId=target?.nodeId||baseNodeId;
    const currentFen=currentNodeId?store.nodes[currentNodeId]?.fen:undefined;
    const path=currentNodeId?pathToNode(store,currentNodeId):[];
    const baseIndex=baseNodeId?path.findIndex(node=>node.id==baseNodeId):-1;
    const continuation=baseIndex>=0?path.slice(baseIndex+1).filter(node=>node.moveSan):[];
    const lines=useMemo(()=>repertoire?linesForRepertoire(lineStore,repertoire.id).filter(line=>validLine(store,line)):[],[lineStore,repertoire?.id,store]);
    const existing=currentNodeId?lines.find(line=>line.nodeId==currentNodeId):undefined;
    const mixedCount=Object.values(lineStore.lines).filter(line=>validLine(store,line)).length;

    useEffect(()=>{
        if(!repertoire){setLeftDockHost(null);setRightDockHost(null);return;}
        const frame=requestAnimationFrame(()=>{
            const board=document.getElementById("repertoire-board");
            const wrap=board?.parentElement as HTMLElement|null;
            const stage=wrap?.parentElement as HTMLElement|null;
            const column=stage?.parentElement as HTMLElement|null;
            const grid=column?.parentElement as HTMLElement|null;
            const left=grid?.firstElementChild as HTMLElement|null;
            const right=grid?.lastElementChild as HTMLElement|null;
            setLeftDockHost(left||null);
            setRightDockHost(right||null);
        });
        return()=>{cancelAnimationFrame(frame);setLeftDockHost(null);setRightDockHost(null);};
    },[repertoire?.id,currentNodeId]);

    function nextGenericName(){
        const languageCode=language.split("-")[0].toLowerCase();
        const word=LINE_WORD[languageCode]||LINE_WORD.en;
        const matcher=new RegExp(`^${word.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\s+(\\d+)$`,"i");
        const highest=lines.reduce((value,line)=>{const match=line.name.trim().match(matcher);return match?Math.max(value,Number(match[1])||0):value;},0);
        return `${word} ${highest+1}`;
    }
    function recognisedName(){
        if(!repertoire)return undefined;
        const sans=path.filter(node=>node.moveSan).map(node=>node.moveSan as string);
        let best:{name:string;length:number}|undefined;
        for(const opening of catalogue){
            const moves=pgnSans(opening);
            if(!moves.length||moves.length>sans.length||!moves.every((move,index)=>move==sans[index]))continue;
            if(!best||moves.length>best.length)best={name:opening.name,length:moves.length};
        }
        return best&&best.name.toLocaleLowerCase()!=repertoire.name.toLocaleLowerCase()?localizeOpeningName(best.name,language):undefined;
    }
    function openSaveDialog(){if(!repertoire||!currentNodeId||!continuation.length)return;const fallback=nextGenericName();setFallbackName(fallback);setDraftName(existing?.name||recognisedName()||fallback);setSaveOpen(true);}
    function saveCurrentLine(event:React.FormEvent){event.preventDefault();if(!repertoire||!currentNodeId||!continuation.length)return;const name=draftName.trim()||fallbackName||nextGenericName();setLineStore(previous=>upsertSavedRepertoireLine(previous,{repertoireId:repertoire.id,nodeId:currentNodeId,name}));setSaveOpen(false);}
    function remove(line:SavedRepertoireLine){if(!confirm(copy.deleteConfirm))return;setLineStore(previous=>deleteSavedRepertoireLine(previous,line.id));}
    function addEngineLine(pvUci:string[],name:string){
        if(!repertoire||!currentNodeId)return;
        const merged=appendPvToRepertoire(store,repertoire.id,currentNodeId,pvUci,8);
        if(merged.lastNodeId==currentNodeId)return;
        setStore(merged.store);
        setLineStore(previous=>upsertSavedRepertoireLine(previous,{repertoireId:repertoire.id,nodeId:merged.lastNodeId,name}));
        onOpen({repertoireId:repertoire.id,nodeId:merged.lastNodeId});
    }

    const lineDock=repertoire?<section className={styles.lineDock}>
        <div className={styles.lineDockTop}>
            <div><span>{copy.savedLinesTitle}</span><strong>{localizeMaybeOpening(repertoire.name,language)}</strong><p>{copy.savedLinesHelp}</p></div>
            <div className={styles.lineDockActions}><button type="button" onClick={openSaveDialog} disabled={!continuation.length}>{copy.saveLine}</button><button type="button" onClick={()=>onStudyRepertoire(repertoire.id)} disabled={!lines.length}>{copy.studyLines}</button></div>
        </div>
        <div className={styles.savedLineRow}>{!lines.length?<span>{copy.noSavedLines}</span>:lines.map(line=><div key={line.id} className={styles.savedLineChip}><button type="button" onClick={()=>onOpen({repertoireId:line.repertoireId,nodeId:line.nodeId})}><strong>{localizeMaybeOpening(line.name,language)}</strong><small>{copy.openLine}</small></button><button type="button" onClick={()=>remove(line)} aria-label={copy.deleteLine}>×</button></div>)}</div>
    </section>:null;
    const engineDock=repertoire&&currentFen?<RepertoireEngineInsight fen={currentFen} onAddLine={addEngineLine}/>:null;
    const dialog=saveOpen&&repertoire?<div className={styles.modalBackdrop} onMouseDown={event=>{if(event.target==event.currentTarget)setSaveOpen(false);}}><form className={styles.saveModal} role="dialog" aria-modal="true" onSubmit={saveCurrentLine}><span>{copy.saveModalTitle}</span><h3>{copy.customNameLabel}</h3><p>{formatEnhancementCopy(copy.linePreview,{moves:continuation.map(node=>node.moveSan).join(" ")})}</p><div className={styles.suggestedName}><strong>{draftName||fallbackName}</strong></div><label><span>{copy.customNameLabel}</span><input autoFocus value={draftName} onChange={event=>setDraftName(event.target.value)} maxLength={120} placeholder={fallbackName}/></label><div className={styles.modalActions}><button type="button" onClick={()=>setSaveOpen(false)}>{copy.cancel}</button><button type="submit">{copy.save}</button></div></form></div>:null;

    return <div className={styles.personalScale}>{!repertoire&&<section className={styles.mixedDock}><div><strong>{copy.studyMixed}</strong><span>{copy.studyMixedHelp}</span></div><button type="button" onClick={onStudyMixed} disabled={!mixedCount}>{copy.studyMixed}{mixedCount?` · ${mixedCount}`:""}</button></section>}<PersonalRepertoirePanel store={localizedStore} setStore={setLocalizedStore} target={target} onOpen={onOpen} onClose={onClose} saved={saved}/>{leftDockHost&&lineDock&&createPortal(lineDock,leftDockHost)}{rightDockHost&&engineDock&&createPortal(engineDock,rightDockHost)}{dialog&&createPortal(dialog,document.body)}</div>;
}
export default PersonalRepertoirePanelEnhanced;
