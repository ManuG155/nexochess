import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { OpenTarget, RepertoireStore } from "./repertoireStore";
import {
    getSavedLines,
    removeSavedLine,
    suggestSavedLineName,
    upsertSavedLine,
    canSaveLine,
    describeSavedLine
} from "./repertoireSavedLines";
import * as polish from "./manualPolish.module.css";

interface Props {
    store: RepertoireStore;
    setStore: React.Dispatch<React.SetStateAction<RepertoireStore>>;
    target: OpenTarget;
    onOpen: (target: OpenTarget) => void;
}

export default function ManualSavedLinesDock({
    store,
    setStore,
    target,
    onOpen
}: Props) {
    const { t } = useTranslation("repertoireEditor");
    const repertoire = store.repertoires[target.repertoireId];
    const currentNodeId = target.nodeId
        || repertoire?.baseNodeId
        || repertoire?.rootNodeId;
    const currentNode = currentNodeId
        ? store.nodes[currentNodeId]
        : undefined;
    const baseNodeId = repertoire?.baseNodeId && store.nodes[repertoire.baseNodeId]
        ? repertoire.baseNodeId
        : repertoire?.rootNodeId;
    const lines = useMemo(() => repertoire
        ? getSavedLines(repertoire).filter(line => (
            Boolean(store.nodes[line.nodeId]) && Boolean(store.nodes[line.baseNodeId])
        ))
        : [], [repertoire, store.nodes]);
    const existing = currentNodeId
        ? lines.find(line => line.nodeId == currentNodeId)
        : undefined;
    const [dialogOpen, setDialogOpen] = useState(false);
    const suggested = repertoire && currentNode && baseNodeId
        ? existing?.name || suggestSavedLineName(
            store,
            repertoire,
            currentNode.id,
            baseNodeId
        )
        : "";
    const [name, setName] = useState("");
    const saveEnabled = Boolean(
        repertoire && currentNode && baseNodeId
        && canSaveLine(store, currentNode.id, baseNodeId)
    );

    if (!repertoire || !currentNode || !baseNodeId) return null;
    const validBaseNodeId = baseNodeId;
    const validNodeId = currentNode.id;

    function openDialog() {
        if (!saveEnabled) return;
        setName(suggested);
        setDialogOpen(true);
    }

    function save(event: React.FormEvent) {
        event.preventDefault();
        const clean = name.trim();
        if (!clean) return;
        setStore(previous => upsertSavedLine(previous, repertoire.id, {
            name: clean,
            nodeId: validNodeId,
            baseNodeId: validBaseNodeId
        }));
        setDialogOpen(false);
    }

    function deleteLine(lineId: string, lineName: string) {
        if (!window.confirm(t("manual.deleteLineConfirm", { name: lineName }))) return;
        setStore(previous => removeSavedLine(previous, repertoire.id, lineId));
    }

    return <>
        <section className={`${polish.savedLinesCard} repertoire-saved-lines-dock`}>
            <div className={polish.savedLinesHeader}>
                <div>
                    <strong>{t("manual.savedLines")}</strong>
                    <span>{lines.length}</span>
                </div>
                <button
                    type="button"
                    className={polish.saveLineButton}
                    onClick={openDialog}
                    disabled={!saveEnabled}
                    title={!saveEnabled ? t("manual.saveLineDisabled") : undefined}
                >{existing ? t("manual.updateLine") : t("manual.saveLine")}</button>
            </div>
            {lines.length == 0 ? <p className={polish.emptySavedLines}>
                {t("manual.savedLinesEmpty")}
            </p> : <div className={polish.savedLineList}>
                {lines.map(line => <div className={polish.savedLineRow} key={line.id}>
                    <button
                        type="button"
                        className={polish.savedLineOpen}
                        onClick={() => onOpen({
                            repertoireId: repertoire.id,
                            nodeId: line.nodeId
                        })}
                    >
                        <strong>{line.name}</strong>
                        <small>{describeSavedLine(
                            store,
                            line.nodeId,
                            line.baseNodeId
                        )}</small>
                    </button>
                    <button
                        type="button"
                        className={polish.savedLineDelete}
                        onClick={() => deleteLine(line.id, line.name)}
                        aria-label={t("manual.deleteLine")}
                    >×</button>
                </div>)}
            </div>}
        </section>

        {dialogOpen && <div
            className={polish.modalBackdrop}
            role="presentation"
            onMouseDown={event => {
                if (event.target == event.currentTarget) setDialogOpen(false);
            }}
        >
            <form
                className={polish.modal}
                role="dialog"
                aria-modal="true"
                onSubmit={save}
            >
                <span className={polish.modalEyebrow}>{t("manual.modalEyebrow")}</span>
                <h3>{t("manual.modalTitle")}</h3>
                <p>{t("manual.modalBody")}</p>
                <span className={polish.suggestedName}>
                    <strong>{t("manual.suggested")}: </strong>{suggested}
                </span>
                <label className={polish.nameField}>
                    <span>{t("manual.nameLabel")}</span>
                    <input
                        autoFocus
                        value={name}
                        onChange={event => setName(event.target.value)}
                        maxLength={120}
                    />
                </label>
                <div className={polish.modalActions}>
                    <button
                        type="button"
                        className={polish.modalCancel}
                        onClick={() => setDialogOpen(false)}
                    >{t("manual.cancel")}</button>
                    <button
                        type="submit"
                        className={polish.modalPrimary}
                        disabled={!name.trim()}
                    >{t("manual.save")}</button>
                </div>
            </form>
        </div>}
    </>;
}
