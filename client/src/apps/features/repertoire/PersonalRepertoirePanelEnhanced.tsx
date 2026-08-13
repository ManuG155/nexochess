import React, { useEffect, useMemo, useState } from "react";

import PersonalRepertoirePanel from "./PersonalRepertoirePanel";
import { OpenTarget, RepertoireStore, pathToNode } from "./repertoireStore";
import {
    SavedRepertoireLine,
    SavedRepertoireLineStore,
    deleteSavedRepertoireLine,
    linesForRepertoire,
    readSavedRepertoireLines,
    upsertSavedRepertoireLine,
    writeSavedRepertoireLines
} from "./savedRepertoireLines";
import {
    formatEnhancementCopy,
    useRepertoireEnhancementCopy
} from "./repertoireEnhancementCopy";
import * as styles from "./repertoirePolish.module.css";

interface Props {
    store: RepertoireStore;
    setStore: React.Dispatch<React.SetStateAction<RepertoireStore>>;
    target: OpenTarget | null;
    onOpen: (target: OpenTarget) => void;
    onClose: () => void;
    saved: boolean;
    onStudyRepertoire: (repertoireId: string) => void;
    onStudyMixed: () => void;
}

function validLine(store: RepertoireStore, line: SavedRepertoireLine) {
    return Boolean(store.repertoires[line.repertoireId] && store.nodes[line.nodeId]);
}

function PersonalRepertoirePanelEnhanced({
    store,
    setStore,
    target,
    onOpen,
    onClose,
    saved,
    onStudyRepertoire,
    onStudyMixed
}: Props) {
    const copy = useRepertoireEnhancementCopy();
    const [lineStore, setLineStore] = useState<SavedRepertoireLineStore>(
        () => readSavedRepertoireLines()
    );

    useEffect(() => writeSavedRepertoireLines(lineStore), [lineStore]);

    const repertoire = target ? store.repertoires[target.repertoireId] : undefined;
    const baseNodeId = repertoire
        ? repertoire.baseNodeId && store.nodes[repertoire.baseNodeId]
            ? repertoire.baseNodeId
            : repertoire.rootNodeId
        : undefined;
    const currentNodeId = target?.nodeId || baseNodeId;
    const path = currentNodeId ? pathToNode(store, currentNodeId) : [];
    const baseIndex = baseNodeId ? path.findIndex(node => node.id == baseNodeId) : -1;
    const continuation = baseIndex >= 0
        ? path.slice(baseIndex + 1).filter(node => node.moveSan)
        : [];
    const lines = useMemo(() => repertoire
        ? linesForRepertoire(lineStore, repertoire.id).filter(line => validLine(store, line))
        : [], [lineStore, repertoire?.id, store]);
    const existing = currentNodeId ? lines.find(line => line.nodeId == currentNodeId) : undefined;
    const mixedCount = Object.values(lineStore.lines).filter(line => validLine(store, line)).length;

    function saveCurrentLine() {
        if (!repertoire || !currentNodeId || continuation.length == 0) return;
        const finalMove = continuation.at(-1)?.moveSan || "";
        const suggestion = existing?.name || formatEnhancementCopy(
            copy.suggestedLineName,
            { move: finalMove }
        );
        const moves = continuation.map(node => node.moveSan).join(" ");
        const accept = window.confirm(
            `${formatEnhancementCopy(copy.suggestedQuestion, { name: suggestion })}\n\n${formatEnhancementCopy(copy.linePreview, { moves })}`
        );
        const name = accept
            ? suggestion
            : window.prompt(copy.customNameLabel, suggestion)?.trim();
        if (!name) return;
        setLineStore(previous => upsertSavedRepertoireLine(previous, {
            repertoireId: repertoire.id,
            nodeId: currentNodeId,
            name
        }));
    }

    function remove(line: SavedRepertoireLine) {
        if (!window.confirm(copy.deleteConfirm)) return;
        setLineStore(previous => deleteSavedRepertoireLine(previous, line.id));
    }

    return <div className={styles.personalScale}>
        {repertoire ? <section className={styles.lineDock}>
            <div className={styles.lineDockTop}>
                <div>
                    <span>{copy.savedLinesTitle}</span>
                    <strong>{repertoire.name}</strong>
                    <p>{copy.savedLinesHelp}</p>
                </div>
                <div className={styles.lineDockActions}>
                    <button type="button" onClick={saveCurrentLine} disabled={continuation.length == 0}>
                        {existing ? copy.renameLine : copy.saveLine}
                    </button>
                    <button type="button" onClick={() => onStudyRepertoire(repertoire.id)} disabled={lines.length == 0}>
                        {copy.studyLines}
                    </button>
                </div>
            </div>
            <div className={styles.savedLineRow}>
                {lines.length == 0 ? <span>{copy.noSavedLines}</span> : lines.map(line => <div key={line.id} className={styles.savedLineChip}>
                    <button type="button" onClick={() => onOpen({ repertoireId: line.repertoireId, nodeId: line.nodeId })}>
                        <strong>{line.name}</strong><small>{copy.openLine}</small>
                    </button>
                    <button type="button" onClick={() => remove(line)} aria-label={copy.deleteLine}>×</button>
                </div>)}
            </div>
        </section> : <section className={styles.mixedDock}>
            <div><strong>{copy.studyMixed}</strong><span>{copy.studyMixedHelp}</span></div>
            <button type="button" onClick={onStudyMixed} disabled={mixedCount == 0}>
                {copy.studyMixed}{mixedCount ? ` · ${mixedCount}` : ""}
            </button>
        </section>}

        <PersonalRepertoirePanel
            store={store}
            setStore={setStore}
            target={target}
            onOpen={onOpen}
            onClose={onClose}
            saved={saved}
        />
    </div>;
}

export default PersonalRepertoirePanelEnhanced;
