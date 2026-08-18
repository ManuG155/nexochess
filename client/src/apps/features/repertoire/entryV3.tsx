import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { useTranslation } from "react-i18next";
import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";
import { removeDefaultConsentLink } from "@/lib/consent";
import OpeningLearningV3 from "./OpeningLearningV3";
import PersonalRepertoirePanelEnhanced from "./PersonalRepertoirePanelEnhanced";
import RepertoireDrill from "./RepertoireDrill";
import RepertoireTransferPanel from "./RepertoireTransferPanel";
import RepertoireTutorial from "./RepertoireTutorial";
import { OpeningCatalogueEntry } from "./openingCatalogue";
import { parsePgnRepertoire } from "./pgnImport";
import { ImportResult, OpenTarget, RepertoireSide, RepertoireStore, importBackupStore, importPgnLines, mergeOpening, readRepertoireStore, serializeBackup, writeRepertoireStore } from "./repertoireStore";
import "@/i18n";
import "@/index.css";
import "../FeatureMobileBase.css";
import "./repertoireLayoutOverrides.css";
import * as hubStyles from "./hub.module.css";
import * as personalStyles from "./index.module.css";

type WorkspaceMode = "mine" | "learn" | "review" | "import";
interface DrillTarget { mixed: boolean; repertoireId?: string; }

function RepertoireWorkspace() {
    const { t } = useTranslation("repertoire");
    const [store, setStore] = useState<RepertoireStore>(() => readRepertoireStore());
    const [mode, setMode] = useState<WorkspaceMode>("mine");
    const [target, setTarget] = useState<OpenTarget | null>(null);
    const [saved, setSaved] = useState(true);
    const [courseFocused, setCourseFocused] = useState(false);
    const [drill, setDrill] = useState<DrillTarget>();
    useEffect(() => { removeDefaultConsentLink(); }, []);
    useEffect(() => { setSaved(false); writeRepertoireStore(store); const timer = window.setTimeout(() => setSaved(true), 180); return () => window.clearTimeout(timer); }, [store]);

    function changeMode(nextMode: WorkspaceMode) { setMode(nextMode); setTarget(null); setDrill(undefined); setCourseFocused(false); window.scrollTo({ top: 0, behavior: "auto" }); }
    function addOpening(opening: OpeningCatalogueEntry, side: RepertoireSide) { setStore(previous => mergeOpening(previous, opening, side).store); }
    function importPgn(name: string, side: RepertoireSide, pgn: string): ImportResult { const lines = parsePgnRepertoire(pgn); if (!lines.length) return { ok: false, message: t("transfer.invalidPgn") }; const result = importPgnLines(store, name, side, lines); setStore(result.store); return { ok: true, count: result.importedLines }; }
    function importBackup(content: string): ImportResult { const result = importBackupStore(store, content, t("transfer.importedSuffix")); if (!result.ok || !result.store) return { ok: false, message: t("transfer.invalidBackup") }; setStore(result.store); return { ok: true, count: result.count }; }
    function exportBackup() { const content = serializeBackup(store); const file = new File([content], `nexochess-repertoire-${new Date().toISOString().slice(0,10)}.json`, { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(file); link.download = file.name; link.click(); URL.revokeObjectURL(link.href); }

    const panel = (openTarget: OpenTarget | null) => <PersonalRepertoirePanelEnhanced store={store} setStore={setStore} target={openTarget} onOpen={setTarget} onClose={() => setTarget(null)} saved={saved} onStudyRepertoire={repertoireId => setDrill({ mixed: false, repertoireId })} onStudyMixed={() => setDrill({ mixed: true })}/>;
    let content: React.ReactNode;

    if (drill) {
        content = <main className={hubStyles.page}><RepertoireDrill store={store} repertoireId={drill.repertoireId} mixed={drill.mixed} onExit={() => setDrill(undefined)}/></main>;
    } else if (target && mode == "mine") {
        content = <main className={hubStyles.page}>{panel(target)}</main>;
    } else {
        content = <main className={hubStyles.page}>
            {!courseFocused && <><section className={hubStyles.hero}><div><span className={hubStyles.eyebrow}>{t("eyebrow")}</span><h1>{t("title")}</h1><p className={hubStyles.heroText}>{t("intro")}</p></div><div className={hubStyles.explainer}><strong>{t("whatIs.title")}</strong><p>{t("whatIs.body")}</p><span>{t("whatIs.reassurance")}</span></div></section><nav className={hubStyles.modeNav} aria-label={t("modes.label")}>{(["mine","learn","review","import"] as WorkspaceMode[]).map(item => <button type="button" key={item} data-repertoire-tour={`mode-${item}`} className={mode == item ? hubStyles.modeActive : hubStyles.modeButton} onClick={() => changeMode(item)}><span className={hubStyles.modeIcon}>{item == "mine" ? "♙" : item == "learn" ? "▤" : item == "review" ? "↻" : "⇩"}</span><strong>{t(`modes.${item}`)}</strong><small>{t(`modes.${item}Help`)}</small></button>)}</nav></>}
            <div className={hubStyles.content}>{mode == "mine" && panel(null)}{mode == "learn" && <OpeningLearningV3 mode="learn" onAddToRepertoire={addOpening} onFocusChange={setCourseFocused}/>} {mode == "review" && <OpeningLearningV3 mode="review" onAddToRepertoire={addOpening} onFocusChange={setCourseFocused}/>} {mode == "import" && <RepertoireTransferPanel onImportPgn={importPgn} onImportBackup={importBackup} onExportBackup={exportBackup}/>}</div>
        </main>;
    }

    return <>{content}<RepertoireTutorial onResetWorkspace={() => changeMode("mine")}/></>;
}

const root = ReactDOM.createRoot(document.querySelector(".root")!);
root.render(<I18nGate><PageWrapper contentClassName={personalStyles.pageContent}><RepertoireWorkspace/></PageWrapper></I18nGate>);
