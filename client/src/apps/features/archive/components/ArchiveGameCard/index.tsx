import React from "react";
import { useTranslation } from "react-i18next";

import { ArchivedGameMetadata } from "shared/types/game/ArchivedGame";

import MiniBoard from "../MiniBoard";
import * as styles from "./ArchiveGameCard.module.css";

interface ArchiveGameCardProps {
    id: string;
    game: ArchivedGameMetadata;
    selected: boolean;
    onOpen: () => void;
    onSelect: (selected: boolean) => void;
}

function formatAccuracy(value?: number | null) {
    return value == null || !Number.isFinite(value)
        ? "—"
        : value.toFixed(1);
}

function formatRatingChange(value?: number) {
    if (value == null || !Number.isFinite(value)) return "—";
    return value > 0 ? `+${value}` : value.toString();
}

function getWinner(
    result: string | undefined,
    colour: "white" | "black"
) {
    return (
        (result == "1-0" && colour == "white")
        || (result == "0-1" && colour == "black")
    );
}

function PlayerRow({
    colour,
    game
}: {
    colour: "white" | "black";
    game: ArchivedGameMetadata;
}) {
    const { t } = useTranslation("otherPages");
    const player = game.players[colour];
    const summary = game.archiveSummary?.[colour];
    const ratingChange = summary?.ratingChange;
    const winner = getWinner(game.archiveSummary?.result, colour);

    return (
        <div className={`${styles.playerRow} ${winner ? styles.winner : ""}`}>
            <span className={`${styles.pieceDot} ${styles[colour]}`} />

            <span className={styles.playerName}>
                {player.username || t(`archive.card.${colour}`)}
            </span>

            <span className={styles.rating}>
                {player.rating ?? "?"}
            </span>

            <span className={
                ratingChange == null
                    ? styles.ratingNeutral
                    : ratingChange > 0
                        ? styles.ratingGain
                        : ratingChange < 0
                            ? styles.ratingLoss
                            : styles.ratingNeutral
            }>
                {formatRatingChange(ratingChange)}
            </span>

            <span className={styles.accuracy}>
                {formatAccuracy(summary?.accuracy)}
            </span>
        </div>
    );
}

function ArchiveGameCard({
    game,
    selected,
    onOpen,
    onSelect
}: ArchiveGameCardProps) {
    const { t, i18n } = useTranslation("otherPages");
    const summary = game.archiveSummary;
    const locale = i18n.resolvedLanguage || i18n.language;

    return (
        <article
            className={`${styles.card} ${selected ? styles.selected : ""}`}
            onClick={onOpen}
        >
            <label
                className={styles.selector}
                onClick={event => event.stopPropagation()}
            >
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={event => onSelect(event.target.checked)}
                    aria-label={t("archive.card.select")}
                />
            </label>

            <MiniBoard fen={summary?.finalPosition || game.initialPosition} />

            <div className={styles.details}>
                <div className={styles.heading}>
                    <div>
                        <strong className={styles.result}>
                            {summary?.result || "*"}
                        </strong>

                        <span className={styles.date}>
                            {game.date
                                ? new Intl.DateTimeFormat(locale, {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                }).format(new Date(game.date))
                                : t("archive.card.analysedGame")}
                        </span>
                    </div>

                    {game.archiveSource == "local" && (
                        <span className={styles.localBadge}>
                            {t("archive.card.savedLocally")}
                        </span>
                    )}
                </div>

                <div className={styles.playersHeader}>
                    <span aria-hidden="true" />
                    <span>{t("archive.card.players")}</span>
                    <span>{t("archive.card.elo")}</span>
                    <span className={styles.ratingChangeHeader}>+/−</span>
                    <span>{t("archive.card.accuracy")}</span>
                </div>

                <PlayerRow colour="white" game={game} />
                <PlayerRow colour="black" game={game} />

                <div className={styles.metadata}>
                    <span className={styles.opening}>
                        {summary?.opening || t("archive.card.unknownOpening")}
                    </span>

                    <span>
                        {summary?.moveCount == null
                            ? `— ${t("archive.card.movesLabel")}`
                            : t("archive.card.moves", {
                                count: summary.moveCount
                            })}
                    </span>
                </div>
            </div>

            <span className={styles.openHint} aria-hidden="true">
                ›
            </span>
        </article>
    );
}

export default ArchiveGameCard;
