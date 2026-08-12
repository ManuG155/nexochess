import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { useTranslation } from "react-i18next";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";
import { removeDefaultConsentLink } from "@/lib/consent";

import OpeningLearningPanel from "./OpeningLearningPanel";
import PersonalRepertoirePanel from "./PersonalRepertoirePanel";
import RepertoireTransferPanel from "./RepertoireTransferPanel";
import { OpeningCatalogueEntry } from "./openingCatalogue";
import { parsePgnRepertoire } from "./pgnImport";
import {
    ImportResult,
    OpenTarget,
    RepertoireSide,
    RepertoireStore,
    importBackupStore,
    importPgnLines,
    mergeOpening,
    readRepertoireStore,
    serializeBackup,
    writeRepertoireStore
} from "./repertoireStore";

import "@/i18n";
import "@/index.css";
import * as hubStyles from "./hub.module.css";
import * as personalStyles from "./index.module.css";

type WorkspaceMode = "mine" | "learn" | "review" | "import";

function RepertoireWorkspace() {
    const { t } = useTranslation("repertoire");
    const [store, setStore] = useState<RepertoireStore>(
        () => readRepertoireStore()
    );
    const [mode, setMode] = useState<WorkspaceMode>("mine");
    const [target, setTarget] = useState<OpenTarget | null>(null);
    const [saved, setSaved] = useState(true);

    useEffect(() => {
        removeDefaultConsentLink();
    }, []);

    useEffect(() => {
        setSaved(false);
        writeRepertoireStore(store);
        const timer = window.setTimeout(() => setSaved(true), 180);
        return () => window.clearTimeout(timer);
    }, [store]);

    function changeMode(nextMode: WorkspaceMode) {
        setMode(nextMode);
        setTarget(null);
        requestAnimationFrame(() => window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        }));
    }

    function addOpeningToRepertoire(
        opening: OpeningCatalogueEntry,
        side: RepertoireSide
    ) {
        const result = mergeOpening(store, opening, side);
        setStore(result.store);
        setMode("mine");
        setTarget({
            repertoireId: result.repertoire.id,
            nodeId: result.lastNodeId
        });
        requestAnimationFrame(() => window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        }));
    }

    function importPgn(
        name: string,
        side: RepertoireSide,
        pgn: string
    ): ImportResult {
        const lines = parsePgnRepertoire(pgn);
        if (lines.length == 0) {
            return { ok: false, message: t("transfer.invalidPgn") };
        }

        const result = importPgnLines(store, name, side, lines);
        setStore(result.store);
        return { ok: true, count: result.importedLines };
    }

    function importBackup(content: string): ImportResult {
        const result = importBackupStore(
            store,
            content,
            t("transfer.importedSuffix")
        );
        if (!result.ok || !result.store) {
            return { ok: false, message: t("transfer.invalidBackup") };
        }
        setStore(result.store);
        return { ok: true, count: result.count };
    }

    function exportBackup() {
        const blob = new Blob(
            [serializeBackup(store)],
            { type: "application/json" }
        );
        const href = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.download = `nexochess-repertoire-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(href);
    }

    if (target && mode == "mine") {
        return <main className={hubStyles.page}>
            <PersonalRepertoirePanel
                store={store}
                setStore={setStore}
                target={target}
                onOpen={setTarget}
                onClose={() => setTarget(null)}
                saved={saved}
            />
        </main>;
    }

    return <main className={hubStyles.page}>
        <section className={hubStyles.hero}>
            <div>
                <span className={hubStyles.eyebrow}>{t("eyebrow")}</span>
                <h1>{t("title")}</h1>
                <p className={hubStyles.heroText}>{t("intro")}</p>
            </div>
            <div className={hubStyles.explainer}>
                <strong>{t("whatIs.title")}</strong>
                <p>{t("whatIs.body")}</p>
                <span>{t("whatIs.reassurance")}</span>
            </div>
        </section>

        <nav className={hubStyles.modeNav} aria-label={t("modes.label")}>
            {(["mine", "learn", "review", "import"] as WorkspaceMode[])
                .map(item => <button
                    type="button"
                    key={item}
                    className={mode == item
                        ? hubStyles.modeActive
                        : hubStyles.modeButton}
                    onClick={() => changeMode(item)}
                >
                    <span className={hubStyles.modeIcon}>
                        {item == "mine"
                            ? "♙"
                            : item == "learn"
                                ? "▤"
                                : item == "review"
                                    ? "↻"
                                    : "⇩"}
                    </span>
                    <strong>{t(`modes.${item}`)}</strong>
                    <small>{t(`modes.${item}Help`)}</small>
                </button>)}
        </nav>

        <div className={hubStyles.content}>
            {mode == "mine" && <PersonalRepertoirePanel
                store={store}
                setStore={setStore}
                target={null}
                onOpen={setTarget}
                onClose={() => setTarget(null)}
                saved={saved}
            />}

            {mode == "learn" && <OpeningLearningPanel
                mode="learn"
                onAddToRepertoire={addOpeningToRepertoire}
            />}

            {mode == "review" && <OpeningLearningPanel
                mode="review"
                onAddToRepertoire={addOpeningToRepertoire}
            />}

            {mode == "import" && <RepertoireTransferPanel
                onImportPgn={importPgn}
                onImportBackup={importBackup}
                onExportBackup={exportBackup}
            />}
        </div>
    </main>;
}

const root = ReactDOM.createRoot(document.querySelector(".root")!);
root.render(
    <I18nGate>
        <PageWrapper contentClassName={personalStyles.pageContent}>
            <RepertoireWorkspace/>
        </PageWrapper>
    </I18nGate>
);
