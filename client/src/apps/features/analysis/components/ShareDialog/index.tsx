import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import renderStateTree from "shared/lib/stateTree/render";

import Dialog from "@/components/common/Dialog";
import TextField from "@/components/common/TextField";

import ShareDialogProps from "./ShareDialogProps";
import * as styles from "./ShareDialog.module.css";

function ShareDialog({ game, currentNode, onClose }: ShareDialogProps) {
    const { t } = useTranslation(["common", "analysis"]);

    const pgn = renderStateTree(game.stateTree, game);
    const fen = currentNode.state.fen;

    const canUseNativeShare =
        typeof navigator != "undefined"
        && typeof navigator.share == "function";

    useEffect(() => {
        function closeWithEscape(event: KeyboardEvent) {
            if (event.key == "Escape") onClose();
        }

        window.addEventListener("keydown", closeWithEscape);

        return () => {
            window.removeEventListener("keydown", closeWithEscape);
        };
    }, [onClose]);

    function downloadPGN() {
        const blob = new Blob([pgn], {
            type: "application/x-chess-pgn;charset=utf-8"
        });

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = "nexochess-game.pgn";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();

        URL.revokeObjectURL(url);
    }

    async function sharePGN() {
        try {
            await navigator.share({
                title: t("shareGame.title"),
                text: pgn
            });
        } catch (error) {
            if (
                error instanceof DOMException
                && error.name == "AbortError"
            ) return;
        }
    }

    return <Dialog
        className={styles.wrapper}
        onClose={onClose}
        closeOnBackdrop
    >
        <header className={styles.header}>
            <div className={styles.headerIcon}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="18" cy="5" r="2.5" />
                    <circle cx="6" cy="12" r="2.5" />
                    <circle cx="18" cy="19" r="2.5" />
                    <path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" />
                </svg>
            </div>

            <div>
                <span>{t("shareGame.eyebrow")}</span>
                <h2>{t("shareGame.title")}</h2>
                <p>{t("shareGame.subtitle")}</p>
            </div>
        </header>

        <div className={styles.content}>
            <section className={styles.section}>
                <div className={styles.sectionHeading}>
                    <div className={styles.sectionIcon}>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                            <path d="M12 4v16M4 12h16" />
                        </svg>
                    </div>

                    <div>
                        <span>FEN</span>
                        <h3>{t("shareGame.fenTitle")}</h3>
                        <p>{t("shareGame.fenDescription")}</p>
                    </div>
                </div>

                <TextField
                    wrapperClassName={styles.fieldWrapper}
                    className={styles.field}
                    copyClassName={styles.fieldCopy}
                    value={fen}
                    readOnly
                    copyable
                    copyTooltip={t("shareGame.copyFEN")}
                    copyToast={t("shareGame.copyFENToast")}
                    onClick={event => event.currentTarget.select()}
                />
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeading}>
                    <div className={styles.sectionIcon}>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M6 3.5h8l4 4V20.5H6z" />
                            <path d="M14 3.5v4h4M9 12h6M9 16h6" />
                        </svg>
                    </div>

                    <div>
                        <span>PGN</span>
                        <h3>{t("shareGame.pgnTitle")}</h3>
                        <p>{t("shareGame.pgnDescription")}</p>
                    </div>

                    <span className={styles.characterCount}>
                        {t("shareGame.characters", {
                            count: pgn.length
                        })}
                    </span>
                </div>

                <TextField
                    wrapperClassName={`${styles.fieldWrapper} ${styles.areaWrapper}`}
                    className={styles.field}
                    copyClassName={styles.areaFieldCopy}
                    value={pgn}
                    multiline
                    readOnly
                    copyable
                    copyTooltip={t("shareGame.copyPGN")}
                    copyToast={t("shareGame.copyPGNToast")}
                    onClick={event => event.currentTarget.select()}
                />
            </section>
        </div>

        <footer className={styles.footer}>
            <span>{t("shareGame.closeHint")}</span>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={downloadPGN}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                        <path d="M5 19h14" />
                    </svg>
                    {t("shareGame.downloadPGN")}
                </button>

                {canUseNativeShare && (
                    <button
                        type="button"
                        className={styles.primaryAction}
                        onClick={sharePGN}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M12 16V4m0 0L8 8m4-4 4 4" />
                            <path d="M5 11v9h14v-9" />
                        </svg>
                        {t("shareGame.shareWith")}
                    </button>
                )}
            </div>
        </footer>
    </Dialog>;
}

export default ShareDialog;
