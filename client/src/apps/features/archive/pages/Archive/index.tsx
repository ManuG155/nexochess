import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { StatusCodes } from "http-status-codes";

import LoadingPlaceholder from "@/components/layout/LoadingPlaceholder";
import Separator from "@/components/common/Separator";
import LogMessage from "@/components/common/LogMessage";
import Button from "@/components/common/Button";
import ButtonColour from "@/components/common/Button/Colour";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
    deleteArchivedGames,
    getArchivedGames
} from "@/lib/gameArchive";

import ArchiveGameCard from "../../components/ArchiveGameCard";
import * as styles from "./Archive.module.css";

import iconArchive from "@assets/img/icons/archive.png";
import iconDelete from "@assets/img/interface/delete.svg";

function Archive() {
    const { t } = useTranslation(["otherPages", "common"]);

    const { data: archive, status, refetch } = useQuery({
        queryKey: ["archive"],
        queryFn: async () => {
            const response = await getArchivedGames();
            if (response.status != StatusCodes.OK) throw new Error();

            return response.games || {};
        },
        refetchOnWindowFocus: false,
        retry: false
    });

    const sortedArchive = useMemo(() => {
        if (!archive) return [];

        return Object.entries(archive).sort(([, first], [, second]) => {
            const firstDate = first.archiveSummary?.savedAt
                || first.date
                || "";
            const secondDate = second.archiveSummary?.savedAt
                || second.date
                || "";

            return secondDate.localeCompare(firstDate);
        });
    }, [archive]);

    const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <span className={styles.title}>
                        <img src={iconArchive} height={24} alt="" />
                        {t("archive.title")}
                        <span className={styles.count}>
                            {archive ? sortedArchive.length : "…"}
                        </span>
                    </span>

                    <span className={styles.description}>
                        {t("archive.description")}
                    </span>

                    {archive && selectedGameIds.length > 0 && (
                        <span className={styles.selection}>
                            {t("archive.selected", {
                                amount: selectedGameIds.length
                            })}

                            <button
                                type="button"
                                onClick={() => setSelectedGameIds(
                                    Object.keys(archive)
                                )}
                            >
                                {t("archive.selectAll")}
                            </button>
                        </span>
                    )}
                </div>

                {selectedGameIds.length > 0 && (
                    <div className={styles.toolbarRight}>
                        <Button onClick={() => setSelectedGameIds([])}>
                            {t("cancel", { ns: "common" })}
                        </Button>

                        <Button
                            style={{
                                backgroundColor: ButtonColour.RED,
                                padding: "8px"
                            }}
                            icon={iconDelete}
                            iconSize="28px"
                            ariaLabel={t("archive.deleteSelected")}
                            onClick={() => setDeleteDialogOpen(true)}
                        />
                    </div>
                )}
            </div>

            <Separator />

            {status == "error" && (
                <LogMessage>
                    {t("archive.error")}
                </LogMessage>
            )}

            {status == "pending" && <LoadingPlaceholder />}

            {status == "success" && sortedArchive.length == 0 && (
                <div className={styles.emptyState}>
                    <b>{t("archive.emptyTitle")}</b>
                    <span>{t("archive.emptyDescription")}</span>
                    <a href="/analysis">
                        {t("archive.analyseGame")}
                    </a>
                </div>
            )}

            <div className={styles.games}>
                {sortedArchive.map(([id, game]) => (
                    <ArchiveGameCard
                        key={id}
                        id={id}
                        game={game}
                        selected={selectedGameIds.includes(id)}
                        onOpen={() => {
                            location.href = `/analysis?game=${encodeURIComponent(id)}`;
                        }}
                        onSelect={selected => {
                            if (selected) {
                                setSelectedGameIds([
                                    ...selectedGameIds,
                                    id
                                ]);
                                return;
                            }

                            setSelectedGameIds(
                                selectedGameIds.filter(
                                    selectedId => selectedId != id
                                )
                            );
                        }}
                    />
                ))}
            </div>

            {deleteDialogOpen && (
                <ConfirmDialog
                    onClose={() => setDeleteDialogOpen(false)}
                    onConfirm={async () => {
                        await deleteArchivedGames(selectedGameIds);
                        await refetch();
                        setSelectedGameIds([]);
                    }}
                    dangerAction
                >
                    <span style={{ color: "white" }}>
                        {t("archive.deleteConfirm", {
                            amount: selectedGameIds.length
                        })}
                    </span>
                </ConfirmDialog>
            )}
        </div>
    );
}

export default Archive;
