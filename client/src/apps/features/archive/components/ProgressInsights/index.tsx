import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Classification } from "shared/constants/Classification";
import PieceColour from "shared/constants/PieceColour";
import type AnalysedGame from "shared/types/game/AnalysedGame";
import type {
    ArchivedGameMetadata,
    GameArchive
} from "shared/types/game/ArchivedGame";
import { getNodeChain } from "shared/types/game/position/StateTreeNode";

import { currentLanguageHref } from "@/i18n/routing";
import { getArchivedGame } from "@/lib/gameArchive";
import { getPuzzleProfile } from "@/apps/features/puzzles/lib/progress";
import { loadLessonsProgress } from "@/apps/features/lessons/progress";
import { TOTAL_LESSONS } from "@/apps/features/lessons/curriculum";
import { ENGINE_LEVELS } from "@/apps/features/enginePlay/engineLevels";

import { getProgressCopy } from "./copy";
import * as styles from "./ProgressInsights.module.css";

type PeriodKey = "7" | "30" | "90" | "365" | "all";
type Colour = "white" | "black";
type Phase = "opening" | "middlegame" | "endgame";
type ErrorKind = "mistake" | "miss" | "blunder";
type ArchiveEntry = [string, ArchivedGameMetadata];

type DetailSummary = {
    games: number;
    counts: Record<Phase, Record<ErrorKind, number>>;
};

const DETAIL_GAME_LIMIT = 36;
const DETAIL_BATCH_SIZE = 6;
const GENERIC_NAMES = new Set([
    "white",
    "black",
    "you",
    "tu",
    "tú",
    "vous",
    "du",
    "sie",
    "você",
    "voce",
    "ты",
    "你",
    "bạn",
    "ban",
    "आप",
    "तुम्ही",
    "ty"
]);
const COACH_NAMES = new Set([
    "foxy",
    "fog",
    "cybe",
    "max_rooks",
    "max rooks"
]);
const ENGINE_ELOS = new Set(ENGINE_LEVELS.map(level => level.elo));
const detailCache = new Map<string, Promise<AnalysedGame | undefined>>();

function normaliseName(value?: string) {
    return (value || "").trim().toLowerCase();
}

function entryTimestamp(game: ArchivedGameMetadata) {
    const value = game.date || game.archiveSummary?.savedAt;
    const timestamp = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(timestamp) ? timestamp : 0;
}

function average(values: Array<number | null | undefined>) {
    const valid = values.filter((value): value is number => (
        typeof value == "number" && Number.isFinite(value)
    ));
    if (!valid.length) return undefined;
    return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function formatNumber(value?: number, digits = 1) {
    return value == null || !Number.isFinite(value)
        ? "—"
        : value.toFixed(digits);
}

function inferPrimaryUsername(entries: ArchiveEntry[]) {
    const counts = new Map<string, number>();

    for (const [, game] of entries) {
        for (const colour of ["white", "black"] as const) {
            const name = normaliseName(game.players[colour].username);
            if (!name || GENERIC_NAMES.has(name) || COACH_NAMES.has(name)) {
                continue;
            }
            counts.set(name, (counts.get(name) || 0) + 1);
        }
    }

    const [candidate] = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])[0] || [];
    return candidate;
}

function playerSide(
    game: ArchivedGameMetadata,
    username?: string
): Colour | undefined {
    if (!username) return undefined;
    if (normaliseName(game.players.white.username) == username) return "white";
    if (normaliseName(game.players.black.username) == username) return "black";
    return undefined;
}

function isWin(result: string | undefined, side: Colour) {
    return (
        (result == "1-0" && side == "white")
        || (result == "0-1" && side == "black")
    );
}

function isLoss(result: string | undefined, side: Colour) {
    return (
        (result == "0-1" && side == "white")
        || (result == "1-0" && side == "black")
    );
}

function resultScore(result: string | undefined, side: Colour) {
    if (isWin(result, side)) return 1;
    if (isLoss(result, side)) return 0;
    if (result == "1/2-1/2") return 0.5;
    return undefined;
}

function phaseFor(ply: number, fen: string): Phase {
    if (ply <= 20) return "opening";

    const board = fen.split(" ")[0] || "";
    const values: Record<string, number> = {
        q: 9,
        r: 5,
        b: 3,
        n: 3,
        p: 1
    };
    let material = 0;

    for (const char of board.toLowerCase()) {
        material += values[char] || 0;
    }

    return material <= 26 ? "endgame" : "middlegame";
}

function loadDetailedGame(id: string) {
    const cached = detailCache.get(id);
    if (cached) return cached;

    const request = getArchivedGame(id)
        .then(response => response.game)
        .catch(() => undefined);
    detailCache.set(id, request);
    return request;
}

function AccuracyChart({ values }: { values: number[] }) {
    if (values.length < 2) return null;

    const points = values.map((value, index) => {
        const x = index / (values.length - 1) * 100;
        const y = 30 - Math.max(0, Math.min(100, value)) / 100 * 26;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");

    return (
        <svg
            className={styles.chart}
            viewBox="0 0 100 32"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <line x1="0" y1="8" x2="100" y2="8" />
            <line x1="0" y1="17" x2="100" y2="17" />
            <line x1="0" y1="26" x2="100" y2="26" />
            <polyline points={points} />
        </svg>
    );
}

function ProgressInsights({ archive }: { archive: GameArchive }) {
    const { i18n } = useTranslation();
    const language = i18n.resolvedLanguage || i18n.language || "en";
    const c = getProgressCopy(language);
    const [period, setPeriod] = useState<PeriodKey>("30");
    const [details, setDetails] = useState<DetailSummary>();
    const [detailsLoading, setDetailsLoading] = useState(false);

    const allEntries = useMemo<ArchiveEntry[]>(() => (
        Object.entries(archive).sort(
            (a, b) => entryTimestamp(b[1]) - entryTimestamp(a[1])
        )
    ), [archive]);

    const primaryUsername = useMemo(
        () => inferPrimaryUsername(allEntries),
        [allEntries]
    );

    const filteredEntries = useMemo(() => {
        if (period == "all") return allEntries;
        const cutoff = Date.now() - Number(period) * 86_400_000;
        return allEntries.filter(([, game]) => entryTimestamp(game) >= cutoff);
    }, [allEntries, period]);

    const personalEntries = useMemo(() => filteredEntries.filter(([, game]) => (
        Boolean(playerSide(game, primaryUsername))
    )), [filteredEntries, primaryUsername]);

    useEffect(() => {
        let cancelled = false;
        setDetails(undefined);
        setDetailsLoading(false);

        if (!primaryUsername || !personalEntries.length) return undefined;

        const selected = personalEntries.slice(0, DETAIL_GAME_LIMIT);
        setDetailsLoading(true);

        void (async () => {
            const loaded: Array<readonly [AnalysedGame, Colour] | undefined> = [];

            for (
                let start = 0;
                start < selected.length && !cancelled;
                start += DETAIL_BATCH_SIZE
            ) {
                const batch = selected.slice(start, start + DETAIL_BATCH_SIZE);
                const results = await Promise.all(batch.map(async ([id, metadata]) => {
                    const side = playerSide(metadata, primaryUsername);
                    if (!side) return undefined;
                    const game = await loadDetailedGame(id);
                    return game ? [game, side] as const : undefined;
                }));
                loaded.push(...results);
            }

            if (cancelled) return;

            const summary: DetailSummary = {
                games: 0,
                counts: {
                    opening: { mistake: 0, miss: 0, blunder: 0 },
                    middlegame: { mistake: 0, miss: 0, blunder: 0 },
                    endgame: { mistake: 0, miss: 0, blunder: 0 }
                }
            };

            for (const item of loaded) {
                if (!item) continue;
                const [game, side] = item;
                summary.games += 1;
                const targetColour = side == "white"
                    ? PieceColour.WHITE
                    : PieceColour.BLACK;

                getNodeChain(game.stateTree)
                    .slice(1)
                    .forEach((node, index) => {
                        if (node.state.moveColour != targetColour) return;

                        const classification = node.state.classification;
                        const kind: ErrorKind | undefined = (
                            classification == Classification.BLUNDER
                                ? "blunder"
                                : classification == Classification.MISS
                                    ? "miss"
                                    : classification == Classification.MISTAKE
                                        ? "mistake"
                                        : undefined
                        );
                        if (!kind) return;

                        summary.counts[
                            phaseFor(index + 1, node.state.fen)
                        ][kind] += 1;
                    });
            }

            setDetails(summary);
            setDetailsLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [period, primaryUsername, personalEntries]);

    const personalStats = useMemo(() => personalEntries.map(([, game]) => {
        const side = playerSide(game, primaryUsername)!;
        return {
            game,
            side,
            accuracy: game.archiveSummary?.[side].accuracy,
            performance: game.estimatedRatings?.[side],
            score: resultScore(game.archiveSummary?.result, side)
        };
    }), [personalEntries, primaryUsername]);

    const averageAccuracy = average(
        personalStats.map(item => item.accuracy)
    );

    const trendValues = personalStats
        .slice()
        .reverse()
        .map(item => item.accuracy)
        .filter((value): value is number => (
            typeof value == "number" && Number.isFinite(value)
        ))
        .slice(-40);

    function getSideStats(side: Colour) {
        const items = personalStats.filter(item => item.side == side);
        const scores = items
            .map(item => item.score)
            .filter((value): value is number => value != null);

        return {
            count: items.length,
            accuracy: average(items.map(item => item.accuracy)),
            performance: average(items.map(item => item.performance)),
            score: scores.length
                ? scores.reduce((sum, value) => sum + value, 0)
                    / scores.length * 100
                : undefined
        };
    }

    const whiteStats = getSideStats("white");
    const blackStats = getSideStats("black");

    const openingRows = useMemo(() => {
        const grouped = new Map<string, {
            count: number;
            accuracy: number[];
            performance: number[];
            scores: number[];
        }>();

        for (const item of personalStats) {
            const name = item.game.archiveSummary?.opening || c.unknownOpening;
            const row = grouped.get(name) || {
                count: 0,
                accuracy: [],
                performance: [],
                scores: []
            };

            row.count += 1;
            if (typeof item.accuracy == "number") row.accuracy.push(item.accuracy);
            if (typeof item.performance == "number") {
                row.performance.push(item.performance);
            }
            if (typeof item.score == "number") row.scores.push(item.score);
            grouped.set(name, row);
        }

        return [...grouped.entries()]
            .map(([name, row]) => ({
                name,
                count: row.count,
                accuracy: average(row.accuracy),
                performance: average(row.performance),
                score: row.scores.length
                    ? average(row.scores)! * 100
                    : undefined
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [personalStats, c.unknownOpening]);

    const puzzleProfile = useMemo(() => getPuzzleProfile(), [archive]);
    const lessonProgress = useMemo(() => loadLessonsProgress(), [archive]);
    const puzzleAccuracy = puzzleProfile.attempts
        ? puzzleProfile.correct / puzzleProfile.attempts * 100
        : undefined;

    const duelRows = useMemo(() => {
        const grouped = new Map<number, {
            wins: number;
            draws: number;
            losses: number;
        }>();

        for (const [, game] of filteredEntries) {
            const whiteElo = game.players.white.rating;
            const blackElo = game.players.black.rating;
            let engineSide: Colour | undefined;
            let elo: number | undefined;

            if (
                typeof whiteElo == "number"
                && ENGINE_ELOS.has(whiteElo)
                && blackElo == null
            ) {
                engineSide = "white";
                elo = whiteElo;
            } else if (
                typeof blackElo == "number"
                && ENGINE_ELOS.has(blackElo)
                && whiteElo == null
            ) {
                engineSide = "black";
                elo = blackElo;
            }

            if (!engineSide || elo == null) continue;

            const userSide: Colour = engineSide == "white" ? "black" : "white";
            const row = grouped.get(elo) || {
                wins: 0,
                draws: 0,
                losses: 0
            };
            const result = game.archiveSummary?.result;

            if (isWin(result, userSide)) row.wins += 1;
            else if (isLoss(result, userSide)) row.losses += 1;
            else if (result == "1/2-1/2") row.draws += 1;

            grouped.set(elo, row);
        }

        return [...grouped.entries()].sort((a, b) => a[0] - b[0]);
    }, [filteredEntries]);

    const totalBlunders = details
        ? Object.values(details.counts)
            .reduce((sum, phase) => sum + phase.blunder, 0)
        : 0;

    const phaseTotals = details
        ? (Object.keys(details.counts) as Phase[])
            .map(phase => ({
                phase,
                total: details.counts[phase].mistake
                    + details.counts[phase].miss
                    + details.counts[phase].blunder
            }))
            .sort((a, b) => b.total - a.total)
        : [];

    const insightLines: string[] = [];
    if (phaseTotals[0]?.total) {
        insightLines.push(
            `${c.improvePhase} ${c[phaseTotals[0].phase].toLowerCase()}.`
        );
    }

    if (
        whiteStats.count >= 2
        && blackStats.count >= 2
        && whiteStats.accuracy != null
        && blackStats.accuracy != null
    ) {
        const weaker = whiteStats.accuracy < blackStats.accuracy
            ? c.white
            : c.black;
        const gap = Math.abs(whiteStats.accuracy - blackStats.accuracy);
        if (gap >= 2) {
            insightLines.push(
                `${c.weakerSide} ${weaker.toLowerCase()} (${gap.toFixed(1)} pp).`
            );
        }
    }

    const strongestOpening = openingRows
        .filter(row => row.count >= 2 && row.accuracy != null)
        .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0];
    if (strongestOpening) {
        insightLines.push(
            `${c.bestOpening}: ${strongestOpening.name} `
            + `(${formatNumber(strongestOpening.accuracy)}%).`
        );
    }

    const periodKeys: PeriodKey[] = ["7", "30", "90", "365", "all"];
    const displayedGameCount = primaryUsername
        ? personalEntries.length
        : filteredEntries.length;

    if (!filteredEntries.length) {
        return <section className={styles.empty}>{c.empty}</section>;
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.headerRow}>
                <div>
                    <span className={styles.eyebrow}>{c.title}</span>
                    <h2>{c.subtitle}</h2>
                    <small>
                        {primaryUsername
                            ? `${c.profile}: ${primaryUsername}`
                            : c.profileFallback}
                    </small>
                </div>

                <div
                    className={styles.periods}
                    role="group"
                    aria-label={c.title}
                >
                    {periodKeys.map((key, index) => (
                        <button
                            key={key}
                            type="button"
                            className={period == key ? styles.periodActive : ""}
                            onClick={() => setPeriod(key)}
                        >
                            {c.periods[index]}
                        </button>
                    ))}
                </div>
            </div>

            <section className={styles.kpis}>
                <article>
                    <span>{c.accuracy}</span>
                    <strong>{formatNumber(averageAccuracy)}%</strong>
                    <small>{displayedGameCount} {c.games.toLowerCase()}</small>
                </article>
                <article>
                    <span>{c.games}</span>
                    <strong>{displayedGameCount}</strong>
                    <small>
                        {period == "all"
                            ? c.totalLabel
                            : c.periods[periodKeys.indexOf(period)]}
                    </small>
                </article>
                <article>
                    <span>{c.puzzleElo}</span>
                    <strong>{puzzleProfile.rating}</strong>
                    <small>
                        {c.totalLabel} · {puzzleProfile.attempts} {c.attempts}
                    </small>
                </article>
                <article>
                    <span>{c.lessons}</span>
                    <strong>
                        {lessonProgress.completedLessonIds.length}/{TOTAL_LESSONS}
                    </strong>
                    <small>{c.totalLabel} · {c.completed}</small>
                </article>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionTitle}>
                    <div>
                        <span>{c.gameForm}</span>
                        <h3>{c.accuracyTrend}</h3>
                    </div>
                    <strong>{formatNumber(averageAccuracy)}%</strong>
                </div>

                {trendValues.length >= 2
                    ? <AccuracyChart values={trendValues} />
                    : <p className={styles.muted}>{c.noAccuracy}</p>}
            </section>

            <section className={styles.twoColumns}>
                <article className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <div>
                            <span>{c.gameForm}</span>
                            <h3>{c.errors}</h3>
                        </div>
                        {details?.games
                            ? <strong>
                                {formatNumber(totalBlunders / details.games, 2)}
                            </strong>
                            : null}
                    </div>

                    {detailsLoading && (
                        <p className={styles.muted}>{c.detailLoading}</p>
                    )}

                    {details && details.games > 0 && (
                        <>
                            <div className={styles.phaseGrid}>
                                {(["opening", "middlegame", "endgame"] as Phase[])
                                    .map(phase => (
                                        <div key={phase}>
                                            <strong>{c[phase]}</strong>
                                            <span>
                                                {c.mistakes}
                                                <b>{details.counts[phase].mistake}</b>
                                            </span>
                                            <span>
                                                {c.misses}
                                                <b>{details.counts[phase].miss}</b>
                                            </span>
                                            <span>
                                                {c.blunders}
                                                <b>{details.counts[phase].blunder}</b>
                                            </span>
                                        </div>
                                    ))}
                            </div>
                            <small className={styles.note}>
                                {formatNumber(
                                    totalBlunders / details.games,
                                    2
                                )} {c.blundersPerGame}. {details.games} {c.sample}.
                                {personalEntries.length > DETAIL_GAME_LIMIT
                                    ? ` ${c.detailLimited}`
                                    : ""}
                            </small>
                        </>
                    )}
                </article>

                <article className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <div>
                            <span>{c.gameForm}</span>
                            <h3>{c.sides}</h3>
                        </div>
                    </div>

                    {primaryUsername
                        ? (
                            <div className={styles.sideGrid}>
                                {([
                                    ["white", whiteStats],
                                    ["black", blackStats]
                                ] as const).map(([side, stats]) => (
                                    <div key={side}>
                                        <span>
                                            {side == "white" ? c.white : c.black}
                                        </span>
                                        <strong>
                                            {formatNumber(stats.accuracy)}%
                                        </strong>
                                        <small>
                                            {c.performance}: {formatNumber(
                                                stats.performance,
                                                0
                                            )}
                                        </small>
                                        <small>
                                            {c.results}: {formatNumber(stats.score)}%
                                        </small>
                                        <small>
                                            {stats.count} {c.played}
                                        </small>
                                    </div>
                                ))}
                            </div>
                        )
                        : <p className={styles.muted}>{c.noSide}</p>}
                </article>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionTitle}>
                    <div>
                        <span>{c.gameForm}</span>
                        <h3>{c.openings}</h3>
                        <small>{c.openingHint}</small>
                    </div>
                </div>

                <div className={styles.openingList}>
                    {openingRows.map(row => (
                        <div key={row.name}>
                            <strong>{row.name}</strong>
                            <span>{row.count} {c.played}</span>
                            <span>
                                {c.accuracy}: {formatNumber(row.accuracy)}%
                            </span>
                            <span>
                                {c.performance}: {formatNumber(
                                    row.performance,
                                    0
                                )}
                            </span>
                            <span>{c.score}: {formatNumber(row.score)}%</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.twoColumns}>
                <article className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <div>
                            <span>{c.training}</span>
                            <h3>{c.puzzleElo}</h3>
                        </div>
                        <strong>{puzzleProfile.rating}</strong>
                    </div>

                    <div className={styles.trainingStats}>
                        <span>
                            <b>{puzzleProfile.attempts}</b>
                            {c.attempts}
                        </span>
                        <span>
                            <b>{formatNumber(puzzleAccuracy)}%</b>
                            {c.correct}
                        </span>
                        <span>
                            <b>{puzzleProfile.bestStreak}</b>
                            {c.bestStreak}
                        </span>
                    </div>
                    <a
                        className={styles.actionLink}
                        href={currentLanguageHref("/puzzles")}
                    >
                        {c.actionPuzzles} →
                    </a>
                </article>

                <article className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <div>
                            <span>{c.training}</span>
                            <h3>{c.lessons}</h3>
                        </div>
                        <strong>
                            {lessonProgress.completedLessonIds.length}/{TOTAL_LESSONS}
                        </strong>
                    </div>

                    <div className={styles.progressBar}>
                        <i style={{
                            width: `${Math.min(
                                100,
                                lessonProgress.completedLessonIds.length
                                    / TOTAL_LESSONS * 100
                            )}%`
                        }} />
                    </div>
                    <a
                        className={styles.actionLink}
                        href={currentLanguageHref("/lessons")}
                    >
                        {c.actionLessons} →
                    </a>
                </article>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionTitle}>
                    <div>
                        <span>{c.training}</span>
                        <h3>{c.duel}</h3>
                    </div>
                </div>

                {duelRows.length
                    ? (
                        <div className={styles.duelGrid}>
                            {duelRows.map(([elo, row]) => (
                                <div key={elo}>
                                    <strong>{elo} Elo</strong>
                                    <span>
                                        {row.wins}{c.wins} · {row.draws}{c.draws}
                                        {" · "}{row.losses}{c.losses}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )
                    : <p className={styles.muted}>{c.noDuel}</p>}
            </section>

            <section className={`${styles.section} ${styles.focus}`}>
                <div className={styles.sectionTitle}>
                    <div>
                        <span>NexoChess</span>
                        <h3>{c.focus}</h3>
                    </div>
                </div>

                {insightLines.length
                    ? (
                        <ol>
                            {insightLines.slice(0, 3).map(line => (
                                <li key={line}>{line}</li>
                            ))}
                        </ol>
                    )
                    : <p className={styles.muted}>{c.empty}</p>}

                <div className={styles.actions}>
                    <a href={currentLanguageHref("/analysis")}>
                        {c.actionAnalysis}
                    </a>
                    <a href={currentLanguageHref("/puzzles")}>
                        {c.actionPuzzles}
                    </a>
                </div>
            </section>
        </div>
    );
}

export default ProgressInsights;
