import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import * as styles from "./transfer.module.css";

type RepertoireSide = "white" | "black";

interface ImportResult {
    ok: boolean;
    count?: number;
    message?: string;
}

interface RepertoireTransferPanelProps {
    onImportPgn: (
        name: string,
        side: RepertoireSide,
        pgn: string
    ) => ImportResult;
    onImportBackup: (content: string) => ImportResult;
    onExportBackup: () => void;
}

function RepertoireTransferPanel({
    onImportPgn,
    onImportBackup,
    onExportBackup
}: RepertoireTransferPanelProps) {
    const { t } = useTranslation("repertoire");
    const fileRef = useRef<HTMLInputElement | null>(null);
    const backupRef = useRef<HTMLInputElement | null>(null);
    const [name, setName] = useState("");
    const [side, setSide] = useState<RepertoireSide>("white");
    const [pgnText, setPgnText] = useState("");
    const [status, setStatus] = useState<string>();
    const [statusOk, setStatusOk] = useState(true);

    async function readFile(file?: File) {
        if (!file) return;
        const text = await file.text();
        setPgnText(text);
        if (!name.trim()) {
            setName(file.name.replace(/\.(pgn|txt)$/i, ""));
        }
        setStatus(undefined);
    }

    async function importBackup(file?: File) {
        if (!file) return;
        const result = onImportBackup(await file.text());
        setStatusOk(result.ok);
        setStatus(
            result.ok
                ? t("transfer.backupImported", { count: result.count || 0 })
                : result.message || t("transfer.invalidBackup")
        );
        if (backupRef.current) backupRef.current.value = "";
    }

    function submitPgn(event: React.FormEvent) {
        event.preventDefault();
        if (!name.trim() || !pgnText.trim()) return;
        const result = onImportPgn(name.trim(), side, pgnText);
        setStatusOk(result.ok);
        setStatus(
            result.ok
                ? t("transfer.pgnImported", { count: result.count || 0 })
                : result.message || t("transfer.invalidPgn")
        );
        if (result.ok) {
            setPgnText("");
            setName("");
            if (fileRef.current) fileRef.current.value = "";
        }
    }

    return <section className={styles.transferSection}>
        <div className={styles.transferIntro}>
            <span className={styles.eyebrow}>{t("transfer.eyebrow")}</span>
            <h2>{t("transfer.title")}</h2>
            <p>{t("transfer.intro")}</p>
        </div>

        <div className={styles.transferGrid}>
            <form className={styles.transferCard} onSubmit={submitPgn}>
                <div className={styles.transferCardHeading}>
                    <span className={styles.transferIcon}>♙</span>
                    <div>
                        <strong>{t("transfer.pgnTitle")}</strong>
                        <p>{t("transfer.pgnHelp")}</p>
                    </div>
                </div>

                <label>
                    <span>{t("transfer.name")}</span>
                    <input
                        type="text"
                        value={name}
                        onChange={event => setName(event.target.value)}
                        placeholder={t("transfer.namePlaceholder")}
                        maxLength={80}
                    />
                </label>

                <fieldset>
                    <legend>{t("transfer.side")}</legend>
                    <div className={styles.transferSideChoices}>
                        {(["white", "black"] as RepertoireSide[]).map(value => <button
                            key={value}
                            type="button"
                            className={side == value ? styles.filterActive : styles.filterButton}
                            onClick={() => setSide(value)}
                        >{t(`side.${value}`)}</button>)}
                    </div>
                </fieldset>

                <label className={styles.fileButton}>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".pgn,.txt,text/plain,application/x-chess-pgn"
                        onChange={event => void readFile(event.target.files?.[0])}
                    />
                    <span>{t("transfer.choosePgn")}</span>
                </label>

                <label>
                    <span>{t("transfer.orPaste")}</span>
                    <textarea
                        value={pgnText}
                        onChange={event => setPgnText(event.target.value)}
                        placeholder={t("transfer.pgnPlaceholder")}
                    />
                </label>

                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={!name.trim() || !pgnText.trim()}
                >{t("transfer.importPgn")}</button>
                <small>{t("transfer.pgnLimit")}</small>
            </form>

            <section className={styles.transferCard}>
                <div className={styles.transferCardHeading}>
                    <span className={styles.transferIcon}>↕</span>
                    <div>
                        <strong>{t("transfer.backupTitle")}</strong>
                        <p>{t("transfer.backupHelp")}</p>
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={onExportBackup}
                >{t("transfer.exportBackup")}</button>

                <label className={styles.fileButton}>
                    <input
                        ref={backupRef}
                        type="file"
                        accept=".json,application/json"
                        onChange={event => void importBackup(event.target.files?.[0])}
                    />
                    <span>{t("transfer.importBackup")}</span>
                </label>

                <div className={styles.backupExplanation}>
                    <strong>{t("transfer.whatPreserved")}</strong>
                    <ul>
                        <li>{t("transfer.preserveBranches")}</li>
                        <li>{t("transfer.preserveNotes")}</li>
                        <li>{t("transfer.preserveBases")}</li>
                    </ul>
                </div>
            </section>
        </div>

        {status && <div className={statusOk ? styles.transferSuccess : styles.transferError} role="status">
            {status}
        </div>}
    </section>;
}

export default RepertoireTransferPanel;
