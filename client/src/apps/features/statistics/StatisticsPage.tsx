import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { StatusCodes } from "http-status-codes";

import { Classification } from "shared/constants/Classification";
import PieceColour from "shared/constants/PieceColour";
import type AnalysedGame from "shared/types/game/AnalysedGame";
import type {
    ArchivedGameMetadata,
    GameArchive
} from "shared/types/game/ArchivedGame";
import { getNodeChain } from "shared/types/game/position/StateTreeNode";

import LoadingPlaceholder from "@/components/layout/LoadingPlaceholder";
import MiniBoard from "@/apps/features/archive/components/MiniBoard";
import { getArchivedGame, getArchivedGames } from "@/lib/gameArchive";
import { getPuzzleProfile } from "@/apps/features/puzzles/lib/progress";
import { loadLessonsProgress } from "@/apps/features/lessons/progress";
import { TOTAL_LESSONS } from "@/apps/features/lessons/curriculum";
import { ENGINE_LEVELS } from "@/apps/features/enginePlay/engineLevels";
import { useAuthedProfile } from "@/hooks/api/useProfile";
import { currentLanguageHref } from "@/i18n/routing";
import {
    classificationColours,
    classificationImages
} from "@analysis/constants/classifications";

import { getStatisticsCopy } from "./copy";
import * as styles from "./StatisticsPage.module.css";

type SampleKey = "10" | "20" | "50" | "100" | "7d" | "30d" | "90d" | "365d" | "all";
type ViewKey = "overview" | "games" | "openings" | "puzzles" | "training" | "brilliants";
type Colour = "white" | "black";
type Phase = "opening" | "middlegame" | "endgame";
type ArchiveEntry = [string, ArchivedGameMetadata];

type BrilliantMoment = {
    gameId: string;
    ply: number;
    san: string;
    fen: string;
    targetSquare?: string;
    opening: string;
    opponent: string;
    date?: string;
};

type PhaseDetails = {
    moves: number;
    accuracies: number[];
    mistakes: number;
    misses: number;
    blunders: number;
};

type DetailedSummary = {
    loadedGames: number;
    moves: number;
    classifications: Partial<Record<Classification, number>>;
    phases: Record<Phase, PhaseDetails>;
    brilliants: BrilliantMoment[];
};

const SAMPLE_KEYS: SampleKey[] = ["10", "20", "50", "100", "7d", "30d", "90d", "365d", "all"];
const DETAIL_BATCH_SIZE = 6;
const ENGINE_ELOS = new Set(ENGINE_LEVELS.map(level => level.elo));
const detailCache = new Map<string, Promise<AnalysedGame | undefined>>();

const EMPTY_PHASE = (): PhaseDetails => ({
    moves: 0,
    accuracies: [],
    mistakes: 0,
    misses: 0,
    blunders: 0
});

function entryTimestamp(game: ArchivedGameMetadata) {
    const value = game.date || game.archiveSummary?.savedAt;
    const timestamp = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(timestamp) ? timestamp : 0;
}

function normaliseName(value?: string) {
    return (value || "").trim().toLowerCase();
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
    const ignored = new Set([
        "white", "black", "you", "tu", "tú", "vous", "du", "sie",
        "você", "voce", "ты", "你", "bạn", "ban", "आप", "तुम्ही", "ty",
        "foxy", "fog", "cybe", "max_rooks", "max rooks"
    ]);
    const counts = new Map<string, number>();

    for (const [, game] of entries) {
        for (const colour of ["white", "black"] as const) {
            const name = normaliseName(game.players[colour].username);
            if (!name || ignored.has(name)) continue;
            counts.set(name, (counts.get(name) || 0) + 1);
        }
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

function playerSide(game: ArchivedGameMetadata, username?: string): Colour | undefined {
    if (!username) return undefined;
    if (normaliseName(game.players.white.username) == username) return "white";
    if (normaliseName(game.players.black.username) == username) return "black";
    return undefined;
}

function resultScore(result: string | undefined, side: Colour) {
    if (result == "1-0") return side == "white" ? 1 : 0;
    if (result == "0-1") return side == "black" ? 1 : 0;
    if (result == "1/2-1/2") return 0.5;
    return undefined;
}

function resultKind(result: string | undefined, side: Colour) {
    const score = resultScore(result, side);
    if (score == 1) return "win";
    if (score == 0.5) return "draw";
    if (score == 0) return "loss";
    return undefined;
}

function phaseFor(ply: number, fen: string): Phase {
    if (ply <= 20) return "opening";

    const board = fen.split(" ")[0] || "";
    const values: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1 };
    let material = 0;
    for (const char of board.toLowerCase()) material += values[char] || 0;
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

function selectSample(entries: ArchiveEntry[], sample: SampleKey) {
    if (sample == "all") return entries;
    if (!sample.endsWith("d")) return entries.slice(0, Number(sample));

    const days = Number(sample.slice(0, -1));
    const cutoff = Date.now() - days * 86_400_000;
    return entries.filter(([, game]) => entryTimestamp(game) >= cutoff);
}

function AccuracyChart({ values }: { values: number[] }) {
    if (values.length < 2) return <div className={styles.chartEmpty}>—</div>;

    const points = values.map((value, index) => {
        const x = index / (values.length - 1) * 100;
        const y = 38 - Math.max(0, Math.min(100, value)) / 100 * 34;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");

    return (
        <svg className={styles.chart} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="10" x2="100" y2="10" />
            <line x1="0" y1="20" x2="100" y2="20" />
            <line x1="0" y1="30" x2="100" y2="30" />
            <polyline points={points} />
        </svg>
    );
}

function StatisticsPage() {
    const { i18n, t } = useTranslation(["analysis"]);
    const language = i18n.resolvedLanguage || i18n.language || "en";
    const c = getStatisticsCopy(language);
    const { profile } = useAuthedProfile();
    const [sample, setSample] = useState<SampleKey>("20");
    const [view, setView] = useState<ViewKey>("overview");
    const [details, setDetails] = useState<DetailedSummary>();
    const [detailProgress, setDetailProgress] = useState({ done: 0, total: 0 });

    const { data: archive, status } = useQuery({
        queryKey: ["statistics-archive"],
        queryFn: async () => {
            const response = await getArchivedGames();
            if (response.status != StatusCodes.OK) throw new Error();
            return response.games || {} as GameArchive;
        },
        refetchOnWindowFocus: false,
        retry: false
    });

    const allEntries = useMemo<ArchiveEntry[]>(() => (
        Object.entries(archive || {}).sort((a, b) => entryTimestamp(b[1]) - entryTimestamp(a[1]))
    ), [archive]);

    const username = useMemo(() => {
        const profileUsername = normaliseName(profile?.username);
        const profileMatchesArchive = Boolean(
            profileUsername
            && allEntries.some(([, game]) => Boolean(playerSide(game, profileUsername)))
        );

        if (profileMatchesArchive) return profileUsername;
        return inferPrimaryUsername(allEntries) || profileUsername;
    }, [profile?.username, allEntries]);

    const personalAllEntries = useMemo(() => allEntries.filter(([, game]) => (
        Boolean(playerSide(game, username))
    )), [allEntries, username]);

    const selectedEntries = useMemo(
        () => selectSample(personalAllEntries, sample),
        [personalAllEntries, sample]
    );

    const selectedAllEntries = useMemo(
        () => selectSample(allEntries, sample),
        [allEntries, sample]
    );

    useEffect(() => {
        let cancelled = false;
        setDetails(undefined);
        setDetailProgress({ done: 0, total: selectedEntries.length });
        if (!selectedEntries.length || !username) return undefined;

        void (async () => {
            const summary: DetailedSummary = {
                loadedGames: 0,
                moves: 0,
                classifications: {},
                phases: {
                    opening: EMPTY_PHASE(),
                    middlegame: EMPTY_PHASE(),
                    endgame: EMPTY_PHASE()
                },
                brilliants: []
            };

            for (let start = 0; start < selectedEntries.length && !cancelled; start += DETAIL_BATCH_SIZE) {
                const batch = selectedEntries.slice(start, start + DETAIL_BATCH_SIZE);
                const loaded = await Promise.all(batch.map(async ([id, metadata]) => ({
                    id,
                    metadata,
                    game: await loadDetailedGame(id)
                })));

                for (const item of loaded) {
                    if (!item.game) continue;
                    const side = playerSide(item.metadata, username);
                    if (!side) continue;
                    const targetColour = side == "white" ? PieceColour.WHITE : PieceColour.BLACK;
                    summary.loadedGames += 1;

                    getNodeChain(item.game.stateTree).slice(1).forEach((node, index) => {
                        const ply = index + 1;
                        if (node.state.moveColour != targetColour) return;

                        summary.moves += 1;
                        const phase = phaseFor(ply, node.state.fen);
                        const phaseRow = summary.phases[phase];
                        phaseRow.moves += 1;
                        if (typeof node.state.accuracy == "number" && Number.isFinite(node.state.accuracy)) {
                            phaseRow.accuracies.push(node.state.accuracy);
                        }

                        const classification = node.state.classification;
                        if (classification) {
                            summary.classifications[classification] = (
                                summary.classifications[classification] || 0
                            ) + 1;
                        }

                        if (classification == Classification.MISTAKE) phaseRow.mistakes += 1;
                        if (classification == Classification.MISS) phaseRow.misses += 1;
                        if (classification == Classification.BLUNDER) phaseRow.blunders += 1;

                        if (classification == Classification.BRILLIANT && node.state.move) {
                            const uci = node.state.move.uci || "";
                            const opponent = side == "white"
                                ? item.metadata.players.black.username
                                : item.metadata.players.white.username;
                            summary.brilliants.push({
                                gameId: item.id,
                                ply,
                                san: node.state.move.san,
                                fen: node.state.fen,
                                targetSquare: uci.length >= 4 ? uci.slice(2, 4) : undefined,
                                opening: item.metadata.archiveSummary?.opening || c.unknownOpening,
                                opponent: opponent || c.unknownOpponent,
                                date: item.metadata.date || item.metadata.archiveSummary?.savedAt
                            });
                        }
                    });
                }

                if (!cancelled) {
                    setDetailProgress({
                        done: Math.min(start + batch.length, selectedEntries.length),
                        total: selectedEntries.length
                    });
                }
            }

            if (!cancelled) setDetails(summary);
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedEntries, username, c.unknownOpening, c.unknownOpponent]);

    const personalStats = useMemo(() => selectedEntries.map(([id, game]) => {
        const side = playerSide(game, username)!;
        return {
            id,
            game,
            side,
            accuracy: game.archiveSummary?.[side].accuracy,
            performance: game.estimatedRatings?.[side],
            score: resultScore(game.archiveSummary?.result, side),
            result: resultKind(game.archiveSummary?.result, side)
        };
    }), [selectedEntries, username]);

    const averageAccuracy = average(personalStats.map(item => item.accuracy));
    const averagePerformance = average(personalStats.map(item => item.performance));
    const scored = personalStats.map(item => item.score).filter((value): value is number => value != null);
    const scorePercent = scored.length ? average(scored)! * 100 : undefined;
    const wins = personalStats.filter(item => item.result == "win").length;
    const draws = personalStats.filter(item => item.result == "draw").length;
    const losses = personalStats.filter(item => item.result == "loss").length;
    const trend = personalStats.slice().reverse().map(item => item.accuracy)
        .filter((value): value is number => typeof value == "number" && Number.isFinite(value));

    function sideStats(side: Colour) {
        const items = personalStats.filter(item => item.side == side);
        const sideScores = items.map(item => item.score).filter((value): value is number => value != null);
        return {
            games: items.length,
            accuracy: average(items.map(item => item.accuracy)),
            performance: average(items.map(item => item.performance)),
            score: sideScores.length ? average(sideScores)! * 100 : undefined
        };
    }

    const white = sideStats("white");
    const black = sideStats("black");

    const openingRows = useMemo(() => {
        const grouped = new Map<string, {
            games: number;
            accuracies: number[];
            performances: number[];
            scores: number[];
            wins: number;
            draws: number;
            losses: number;
        }>();

        for (const item of personalStats) {
            const name = item.game.archiveSummary?.opening || c.unknownOpening;
            const row = grouped.get(name) || {
                games: 0,
                accuracies: [],
                performances: [],
                scores: [],
                wins: 0,
                draws: 0,
                losses: 0
            };
            row.games += 1;
            if (typeof item.accuracy == "number") row.accuracies.push(item.accuracy);
            if (typeof item.performance == "number") row.performances.push(item.performance);
            if (typeof item.score == "number") row.scores.push(item.score);
            if (item.result == "win") row.wins += 1;
            if (item.result == "draw") row.draws += 1;
            if (item.result == "loss") row.losses += 1;
            grouped.set(name, row);
        }

        return [...grouped.entries()].map(([name, row]) => ({
            name,
            games: row.games,
            accuracy: average(row.accuracies),
            performance: average(row.performances),
            score: row.scores.length ? average(row.scores)! * 100 : undefined,
            wins: row.wins,
            draws: row.draws,
            losses: row.losses
        })).sort((a, b) => b.games - a.games || (b.score || 0) - (a.score || 0));
    }, [personalStats, c.unknownOpening]);

    const puzzleProfile = useMemo(() => getPuzzleProfile(), [archive]);
    const lessons = useMemo(() => loadLessonsProgress(), [archive]);
    const puzzleAccuracy = puzzleProfile.attempts
        ? puzzleProfile.correct / puzzleProfile.attempts * 100
        : undefined;

    const duelRows = useMemo(() => {
        const grouped = new Map<number, { wins: number; draws: number; losses: number }>();

        for (const [, game] of selectedAllEntries) {
            const whiteElo = game.players.white.rating;
            const blackElo = game.players.black.rating;
            let engineSide: Colour | undefined;
            let elo: number | undefined;

            if (typeof whiteElo == "number" && ENGINE_ELOS.has(whiteElo) && blackElo == null) {
                engineSide = "white";
                elo = whiteElo;
            } else if (typeof blackElo == "number" && ENGINE_ELOS.has(blackElo) && whiteElo == null) {
                engineSide = "black";
                elo = blackElo;
            }
            if (!engineSide || elo == null) continue;

            const userSide: Colour = engineSide == "white" ? "black" : "white";
            const kind = resultKind(game.archiveSummary?.result, userSide);
            const row = grouped.get(elo) || { wins: 0, draws: 0, losses: 0 };
            if (kind == "win") row.wins += 1;
            if (kind == "draw") row.draws += 1;
            if (kind == "loss") row.losses += 1;
            grouped.set(elo, row);
        }

        return [...grouped.entries()].sort((a, b) => a[0] - b[0]);
    }, [selectedAllEntries]);

    const classificationCount = (classification: Classification) => (
        details?.classifications[classification] || 0
    );
    const mistakeCount = classificationCount(Classification.MISTAKE);
    const missCount = classificationCount(Classification.MISS);
    const blunderCount = classificationCount(Classification.BLUNDER);
    const seriousTotal = mistakeCount + missCount + blunderCount;
    const errorsPer100 = details?.moves
        ? seriousTotal / details.moves * 100
        : undefined;

    const bestGame = [...personalStats]
        .filter(item => typeof item.accuracy == "number")
        .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0];
    const worstGame = [...personalStats]
        .filter(item => typeof item.accuracy == "number")
        .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0))[0];

    function openGame(id: string, ply?: number) {
        const query = ply
            ? `/analysis?game=${encodeURIComponent(id)}&review=1&ply=${ply}`
            : `/analysis?game=${encodeURIComponent(id)}`;
        location.href = currentLanguageHref(query);
    }

    const viewTabs: Array<[ViewKey, string]> = [
        ["overview", c.tabs.overview],
        ["games", c.tabs.games],
        ["openings", c.tabs.openings],
        ["puzzles", c.tabs.puzzles],
        ["training", c.tabs.training],
        ["brilliants", c.tabs.brilliants]
    ];

    if (status == "pending") return <LoadingPlaceholder />;

    if (status == "error") {
        return <div className={styles.empty}>{c.noGames}</div>;
    }

    return (
        <main className={styles.page}>
            <header className={styles.hero}>
                <div>
                    <span className={styles.eyebrow}>{c.eyebrow}</span>
                    <h1>{c.title}</h1>
                    <p>{c.subtitle}</p>
                </div>
                <div className={styles.sampleBox}>
                    <span>{c.sample}</span>
                    <div className={styles.sampleButtons}>
                        {SAMPLE_KEYS.map(key => (
                            <button
                                key={key}
                                type="button"
                                className={sample == key ? styles.activeButton : ""}
                                onClick={() => setSample(key)}
                            >
                                {c.samples[key]}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <nav className={styles.tabs} aria-label={c.title}>
                {viewTabs.map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        className={view == key ? styles.activeTab : ""}
                        onClick={() => setView(key)}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            {!selectedEntries.length ? (
                <div className={styles.empty}>{c.noGames}</div>
            ) : (
                <>
                    {detailProgress.total > 0 && detailProgress.done < detailProgress.total && (
                        <div className={styles.detailProgress}>
                            <span>{c.loadingDetails(detailProgress.done, detailProgress.total)}</span>
                            <div><i style={{ width: `${detailProgress.done / detailProgress.total * 100}%` }} /></div>
                        </div>
                    )}

                    {view == "overview" && (
                        <section className={styles.stack}>
                            <div className={styles.kpiGrid}>
                                <Kpi label={c.metrics.games} value={personalStats.length} />
                                <Kpi label={c.metrics.accuracy} value={`${formatNumber(averageAccuracy)}%`} />
                                <Kpi label={c.metrics.score} value={`${formatNumber(scorePercent)}%`} sub={`${wins}W · ${draws}D · ${losses}L`} />
                                <Kpi label={c.metrics.performance} value={formatNumber(averagePerformance, 0)} />
                                <Kpi label={c.metrics.blunders} value={blunderCount} sub={details?.loadedGames ? `${formatNumber(blunderCount / details.loadedGames, 2)} ${c.metrics.perGame}` : undefined} />
                                <Kpi label={c.metrics.brilliants} value={details?.brilliants.length ?? "…"} />
                            </div>

                            <div className={styles.twoColumns}>
                                <article className={styles.card}>
                                    <h2>{c.sections.accuracyTrend}</h2>
                                    <AccuracyChart values={trend} />
                                </article>
                                <article className={styles.card}>
                                    <h2>{c.sections.colour}</h2>
                                    <div className={styles.sideCompare}>
                                        <SideBlock title={c.metrics.white} games={white.games} accuracy={white.accuracy} performance={white.performance} score={white.score} />
                                        <SideBlock title={c.metrics.black} games={black.games} accuracy={black.accuracy} performance={black.performance} score={black.score} />
                                    </div>
                                </article>
                            </div>

                            <article className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h2>{c.sections.errorsByPhase}</h2>
                                    {details && <span>{seriousTotal} · {formatNumber(errorsPer100, 1)} {c.metrics.per100}</span>}
                                </div>
                                <PhaseBars details={details} labels={c.metrics} />
                            </article>

                            <article className={`${styles.card} ${styles.planCard}`}>
                                <div>
                                    <h2>{c.sections.plan}</h2>
                                    <p>{c.subtitle}</p>
                                </div>
                                <a href={currentLanguageHref("/archive?view=plan")}>{c.planCta} →</a>
                            </article>
                        </section>
                    )}

                    {view == "games" && (
                        <section className={styles.stack}>
                            <div className={styles.kpiGrid}>
                                <Kpi label={c.metrics.moves} value={details?.moves ?? "…"} />
                                <Kpi label={c.metrics.mistakes} value={mistakeCount} />
                                <Kpi label={c.metrics.misses} value={missCount} />
                                <Kpi label={c.metrics.blunders} value={blunderCount} />
                                <Kpi label={c.metrics.per100} value={formatNumber(errorsPer100, 1)} />
                                <Kpi label={c.metrics.brilliants} value={details?.brilliants.length ?? "…"} />
                            </div>

                            <article className={styles.card}>
                                <h2>{c.sections.quality}</h2>
                                <div className={styles.qualityGrid}>
                                    {[
                                        Classification.BRILLIANT,
                                        Classification.CRITICAL,
                                        Classification.BEST,
                                        Classification.EXCELLENT,
                                        Classification.OKAY,
                                        Classification.INACCURACY,
                                        Classification.MISTAKE,
                                        Classification.MISS,
                                        Classification.BLUNDER
                                    ].map(classification => (
                                        <div key={classification}>
                                            <span style={{ backgroundColor: classificationColours[classification] }} />
                                            <b>{t(`classifications.${classification}`, { ns: "analysis", defaultValue: classification })}</b>
                                            <strong>{classificationCount(classification)}</strong>
                                        </div>
                                    ))}
                                </div>
                            </article>

                            <article className={styles.card}>
                                <h2>{c.sections.errorsByPhase}</h2>
                                <PhaseTable details={details} labels={c.metrics} />
                            </article>

                            <div className={styles.twoColumns}>
                                <GameHighlight label={c.metrics.bestGame} item={bestGame} onOpen={openGame} />
                                <GameHighlight label={c.metrics.worstGame} item={worstGame} onOpen={openGame} />
                            </div>
                        </section>
                    )}

                    {view == "openings" && (
                        <section className={styles.card}>
                            <h2>{c.sections.openings}</h2>
                            <div className={styles.openingTable}>
                                <div className={styles.tableHeader}>
                                    <span>{c.metrics.opening}</span>
                                    <span>{c.metrics.games}</span>
                                    <span>{c.metrics.accuracy}</span>
                                    <span>{c.metrics.performance}</span>
                                    <span>{c.metrics.score}</span>
                                    <span>W-D-L</span>
                                </div>
                                {openingRows.map(row => (
                                    <div key={row.name} className={styles.tableRow}>
                                        <strong>{row.name}</strong>
                                        <span>{row.games}</span>
                                        <span>{formatNumber(row.accuracy)}%</span>
                                        <span>{formatNumber(row.performance, 0)}</span>
                                        <span>{formatNumber(row.score)}%</span>
                                        <span>{row.wins}-{row.draws}-{row.losses}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {view == "puzzles" && (
                        <section className={styles.stack}>
                            <div className={styles.kpiGrid}>
                                <Kpi label={c.metrics.currentRating} value={puzzleProfile.rating} />
                                <Kpi label={c.metrics.attempts} value={puzzleProfile.attempts} />
                                <Kpi label={c.metrics.correct} value={`${formatNumber(puzzleAccuracy)}%`} />
                                <Kpi label={c.metrics.currentStreak} value={puzzleProfile.streak} />
                                <Kpi label={c.metrics.bestStreak} value={puzzleProfile.bestStreak} />
                            </div>
                            <article className={styles.card}>
                                <h2>{c.sections.puzzleSummary}</h2>
                                <p className={styles.note}>{c.puzzleHistoryNote}</p>
                            </article>
                        </section>
                    )}

                    {view == "training" && (
                        <section className={styles.stack}>
                            <div className={styles.kpiGrid}>
                                <Kpi label={c.metrics.lessons} value={`${lessons.completedLessonIds.length}/${TOTAL_LESSONS}`} sub={c.metrics.completed} />
                                <Kpi label={c.metrics.duel} value={duelRows.reduce((sum, [, row]) => sum + row.wins + row.draws + row.losses, 0)} />
                                <Kpi label={c.metrics.games} value={personalStats.length} />
                                <Kpi label={c.metrics.currentRating} value={puzzleProfile.rating} />
                            </div>
                            <article className={styles.card}>
                                <h2>{c.metrics.duel}</h2>
                                <div className={styles.duelGrid}>
                                    {duelRows.length ? duelRows.map(([elo, row]) => (
                                        <div key={elo}>
                                            <strong>{elo} Elo</strong>
                                            <span>{row.wins}W · {row.draws}D · {row.losses}L</span>
                                        </div>
                                    )) : <span>—</span>}
                                </div>
                            </article>
                            <article className={`${styles.card} ${styles.planCard}`}>
                                <div><h2>{c.sections.plan}</h2></div>
                                <a href={currentLanguageHref("/archive?view=plan")}>{c.planCta} →</a>
                            </article>
                        </section>
                    )}

                    {view == "brilliants" && (
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h2>{c.sections.brilliants}</h2>
                                    <p>{c.sections.brilliantsSub}</p>
                                </div>
                                <strong className={styles.brilliantCount}>{details?.brilliants.length ?? "…"} !!</strong>
                            </div>
                            {details && details.brilliants.length == 0 ? (
                                <div className={styles.emptyInline}>{c.sections.noBrilliants}</div>
                            ) : (
                                <div className={styles.brilliantGrid}>
                                    {details?.brilliants.map(moment => (
                                        <button
                                            type="button"
                                            className={styles.brilliantCard}
                                            key={`${moment.gameId}-${moment.ply}`}
                                            onClick={() => openGame(moment.gameId, moment.ply)}
                                        >
                                            <MiniBoard
                                                fen={moment.fen}
                                                highlightSquare={moment.targetSquare}
                                                markerSquare={moment.targetSquare}
                                                markerImage={classificationImages[Classification.BRILLIANT]}
                                            />
                                            <div>
                                                <strong>{moment.san}!!</strong>
                                                <span>{moment.opening}</span>
                                                <span>{moment.opponent}</span>
                                                {moment.date && <small>{new Date(moment.date).toLocaleDateString(language)}</small>}
                                                <em>{c.viewBrilliant} →</em>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </>
            )}
        </main>
    );
}

function Kpi({ label, value, sub }: {
    label: string;
    value: React.ReactNode;
    sub?: string;
}) {
    return (
        <div className={styles.kpi}>
            <span>{label}</span>
            <strong>{value}</strong>
            {sub && <small>{sub}</small>}
        </div>
    );
}

function SideBlock({ title, games, accuracy, performance, score }: {
    title: string;
    games: number;
    accuracy?: number;
    performance?: number;
    score?: number;
}) {
    return (
        <div className={styles.sideBlock}>
            <strong>{title}</strong>
            <b>{formatNumber(accuracy)}%</b>
            <span>{games} · {formatNumber(performance, 0)} Elo · {formatNumber(score)}%</span>
        </div>
    );
}

function PhaseBars({ details, labels }: {
    details?: DetailedSummary;
    labels: ReturnType<typeof getStatisticsCopy>["metrics"];
}) {
    const rows: Array<[Phase, string]> = [
        ["opening", labels.opening],
        ["middlegame", labels.middlegame],
        ["endgame", labels.endgame]
    ];
    const totals = rows.map(([phase]) => details
        ? details.phases[phase].mistakes
            + details.phases[phase].misses
            + details.phases[phase].blunders
        : 0
    );
    const total = totals.reduce((sum, value) => sum + value, 0);

    return (
        <div className={styles.phaseBars}>
            {rows.map(([phase, label], index) => (
                <div key={phase}>
                    <span>{label}</span>
                    <div><i style={{ width: `${total ? totals[index] / total * 100 : 0}%` }} /></div>
                    <strong>
                        {totals[index]} {total ? `· ${Math.round(totals[index] / total * 100)}%` : ""}
                    </strong>
                </div>
            ))}
        </div>
    );
}

function PhaseTable({ details, labels }: {
    details?: DetailedSummary;
    labels: ReturnType<typeof getStatisticsCopy>["metrics"];
}) {
    const rows: Array<[Phase, string]> = [
        ["opening", labels.opening],
        ["middlegame", labels.middlegame],
        ["endgame", labels.endgame]
    ];

    return (
        <div className={styles.phaseTable}>
            <div className={styles.tableHeader}>
                <span></span>
                <span>{labels.mistakes}</span>
                <span>{labels.misses}</span>
                <span>{labels.blunders}</span>
                <span>{labels.accuracy}</span>
            </div>
            {rows.map(([phase, label]) => {
                const row = details?.phases[phase];
                return (
                    <div className={styles.tableRow} key={phase}>
                        <strong>{label}</strong>
                        <span>{row?.mistakes ?? "—"}</span>
                        <span>{row?.misses ?? "—"}</span>
                        <span>{row?.blunders ?? "—"}</span>
                        <span>{row ? `${formatNumber(average(row.accuracies))}%` : "—"}</span>
                    </div>
                );
            })}
        </div>
    );
}

function GameHighlight({ label, item, onOpen }: {
    label: string;
    item?: {
        id: string;
        accuracy?: number | null;
        game: ArchivedGameMetadata;
    };
    onOpen: (id: string) => void;
}) {
    return (
        <article className={styles.card}>
            <h2>{label}</h2>
            {item ? (
                <button
                    type="button"
                    className={styles.gameHighlight}
                    onClick={() => onOpen(item.id)}
                >
                    <strong>{formatNumber(item.accuracy ?? undefined)}%</strong>
                    <span>{item.game.archiveSummary?.opening || "—"}</span>
                    <em>→</em>
                </button>
            ) : <span>—</span>}
        </article>
    );
}

export default StatisticsPage;
