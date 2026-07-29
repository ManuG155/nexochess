import React, {
    useEffect,
    useMemo,
    useState
} from "react";
import { useTranslation } from "react-i18next";

import {
    Classification
} from "shared/constants/Classification";

import useAnalysisGameStore from
    "@analysis/stores/AnalysisGameStore";

import useAnalysisBoardStore from
    "@analysis/stores/AnalysisBoardStore";

import useAnalysisProgressStore from
    "@analysis/stores/AnalysisProgressStore";

import AnalysisStatus from
    "@analysis/constants/AnalysisStatus";

import {
    classificationColours,
    classificationImages
} from "@analysis/constants/classifications";

import EvaluationGraphArea from
    "../GameReport/EvaluationGraphArea";

import AnalysisProgress from
    "../AnalysisProgress";

import {
    GamePhase,
    getGameSummaryMetrics
} from "./summaryMetrics";

import * as styles from
    "./GameSummaryPanel.module.css";

import iconDefaultProfileImage from
    "@assets/img/defaultprofileimage.png";

import {
    useAuthedProfile
} from "@/hooks/api/useProfile";

import useSettingsStore from
    "@/stores/SettingsStore";

import {
    CoachSummaryState,
    getCoachById,
    getCoachSummaryLine
} from "@analysis/lib/coach";

import CoachPicker from
    "../CoachPicker";

import CoachPortrait from
    "../CoachPortrait";


interface GameSummaryPanelProps {
    onStartReview: () => void;
}

/*
 * ORDEN EXACTO
 * QUE QUEREMOS MOSTRAR.
 */
const moveClassificationRows = [
    {
        translationKey: "brilliant",
        classification: Classification.BRILLIANT
    },
    {
        translationKey: "great",
        classification: Classification.CRITICAL
    },
    {
        translationKey: "book",
        classification: Classification.THEORY
    },
    {
        translationKey: "best",
        classification: Classification.BEST
    },
    {
        translationKey: "excellent",
        classification: Classification.EXCELLENT
    },
    {
        translationKey: "good",
        classification: Classification.OKAY
    },
    {
        translationKey: "inaccuracy",
        classification: Classification.INACCURACY
    },
    {
        translationKey: "mistake",
        classification: Classification.MISTAKE
    },
    {
        translationKey: "miss",
        classification: Classification.MISS
    },
    {
        translationKey: "blunder",
        classification: Classification.BLUNDER
    }
] as const;

function getScoreClassification(score: number | null) {
    if (score == null) return null;
    if (score >= 96) return Classification.BRILLIANT;
    if (score >= 90) return Classification.BEST;
    if (score >= 82) return Classification.EXCELLENT;
    if (score >= 72) return Classification.OKAY;
    if (score >= 62) return Classification.INACCURACY;
    if (score >= 48) return Classification.MISTAKE;
    return Classification.BLUNDER;
}

function formatAccuracy(value: number | null) {
    return value != null ? value.toFixed(1) : "—";
}

function PlayerAvatar({
    image,
    username
}: {
    image?: string;
    username: string;
}) {
    return (
        <img
            className={styles.playerAvatar}
            src={image || iconDefaultProfileImage}
            alt={username}
            onError={event => {
                event.currentTarget.src = iconDefaultProfileImage;
            }}
        />
    );
}

function PhaseIcon({
    score
}: {
    score: number | null;
}) {
    const classification = getScoreClassification(score);

    if (!classification) {
        return <span className={styles.noPhase}>—</span>;
    }

    return (
        <img
            className={styles.phaseIcon}
            src={classificationImages[classification]}
            alt=""
            title={score?.toFixed(1)}
        />
    );
}

function getRequesterName(
    profileUsername: string | undefined,
    whiteUsername: string,
    blackUsername: string
) {
    if (!profileUsername) return null;

    const lower = profileUsername.toLowerCase();

    if (whiteUsername && whiteUsername.toLowerCase() == lower) {
        return whiteUsername;
    }

    if (blackUsername && blackUsername.toLowerCase() == lower) {
        return blackUsername;
    }

    return null;
}

function prefixCoachLine(
    line: string,
    requesterName: string | null,
    coachState: CoachSummaryState
) {
    if (!requesterName) return line;

    return `${requesterName}, ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
}

function personaliseCoachLine(
    line: string,
    requesterName: string | null,
    coachState: CoachSummaryState
) {
    return prefixCoachLine(line, requesterName, coachState);
}

function GameSummaryPanel({
    onStartReview
}: GameSummaryPanelProps) {
    const { t: tCoach, i18n } = useTranslation("coach", {
        useSuspense: false
    });
    const { t: tAnalysis } = useTranslation("analysis", {
        useSuspense: false
    });

    const analysisGame = useAnalysisGameStore(state => state.analysisGame);

    const analysisStatus = useAnalysisProgressStore(state => state.analysisStatus);
    const evaluationProgress = useAnalysisProgressStore(state => state.evaluationProgress);

    const currentStateTreeNodeUpdate = useAnalysisBoardStore(
        state => state.currentStateTreeNodeUpdate
    );

    const { profile } = useAuthedProfile();
    const { settings, setSettings } = useSettingsStore();

    const [isCoachPickerOpen, setIsCoachPickerOpen] = useState(false);
    const [coachMessage, setCoachMessage] = useState("");

    const metrics = useMemo(
        () => getGameSummaryMetrics(analysisGame),
        [analysisGame, currentStateTreeNodeUpdate]
    );

    const whitePlayer = analysisGame.players.white;
    const blackPlayer = analysisGame.players.black;

    const phaseRows: Array<{
        translationKey: GamePhase;
        phase: GamePhase;
    }> = [
        { translationKey: "opening", phase: "opening" },
        { translationKey: "middlegame", phase: "middlegame" },
        { translationKey: "endgame", phase: "endgame" }
    ];

    const selectedCoach = getCoachById(settings.appearance.selectedCoach);

    const hasCompletedAnalysis = metrics.white.accuracy != null
        || metrics.black.accuracy != null
        || metrics.white.estimatedRating != null
        || metrics.black.estimatedRating != null;

    const coachState: CoachSummaryState = analysisStatus == AnalysisStatus.INACTIVE
        ? (hasCompletedAnalysis ? "ready" : "idle")
        : "analysing";

    const requesterName = getRequesterName(
        profile?.username,
        whitePlayer.username || "",
        blackPlayer.username || ""
    );

    useEffect(() => {
        const randomLine = getCoachSummaryLine(
            selectedCoach,
            coachState,
            tCoach
        );
        setCoachMessage(
            personaliseCoachLine(randomLine, requesterName, coachState)
        );
    }, [
        selectedCoach.id,
        coachState,
        requesterName,
        i18n.resolvedLanguage,
        tCoach
    ]);

    const portraitSpeechText = settings.coach.animations
        ? coachMessage
        : "";

    const displayProgress = analysisStatus == AnalysisStatus.AWAITING_CAPTCHA
        ? 1
        : Math.max(0, Math.min(1, evaluationProgress));

    return (
        <section className={styles.wrapper}>
            <div
                className={[
                    styles.scrollArea,
                    !settings.coach.enabled
                        ? styles.scrollAreaWithoutCoach
                        : ""
                ].filter(Boolean).join(" ")}
            >
                <h2 className={styles.title}>
                    {tAnalysis("gameSummary.title")}
                </h2>

                {/*
                 * AnalysisProgress sigue montado de forma invisible porque
                 * contiene el puente que dispara la generación del informe
                 * cuando termina la evaluación del motor. Sin este componente,
                 * el flujo se quedaba bloqueado al 100% en AWAITING_CAPTCHA.
                 */}
                <div className={styles.analysisProgressBridge}>
                    <AnalysisProgress />
                </div>

                {settings.coach.enabled && (
                    <section className={styles.coachSection}>
                        <button
                            type="button"
                            className={styles.coachPortraitButton}
                            onClick={() => setIsCoachPickerOpen(true)}
                            aria-label={tCoach("picker.choose")}
                        >
                            <CoachPortrait
                                className={styles.coachPortrait}
                                coach={selectedCoach}
                                baseExpression={
                                    coachState == "analysing"
                                        ? "thinking"
                                        : "idle"
                                }
                                speechText={portraitSpeechText}
                                animationsEnabled={settings.coach.animations}
                            />
                        </button>

                        <div className={styles.coachBubble}>
                            <p className={styles.coachMessage}>
                                {coachMessage}
                            </p>

                            {coachState == "analysing" && (
                                <>
                                    <div
                                        className={styles.coachProgressTrack}
                                        role="progressbar"
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={Math.round(displayProgress * 100)}
                                    >
                                        <div
                                            className={styles.coachProgressFill}
                                            style={{ width: `${displayProgress * 100}%` }}
                                        />
                                    </div>

                                    <div className={styles.coachProgressPercentage}>
                                        {Math.round(displayProgress * 100)}%
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                )}

                <div
                    className={[
                        styles.graphCard,
                        !settings.coach.enabled
                            ? styles.graphCardWithoutCoach
                            : ""
                    ].filter(Boolean).join(" ")}
                >
                    <EvaluationGraphArea />
                </div>

                <section className={styles.playersSection}>
                    <div className={styles.playersGrid}>
                        <div className={styles.playerColumn}>
                            <span className={styles.playerName}>
                                {whitePlayer.username || tAnalysis("gameSummary.white")}
                            </span>

                            <PlayerAvatar
                                image={whitePlayer.image}
                                username={whitePlayer.username || tAnalysis("gameSummary.white")}
                            />

                            <div className={styles.accuracyBox}>
                                {formatAccuracy(metrics.white.accuracy)}
                            </div>
                        </div>

                        <div className={styles.playerColumn}>
                            <span className={styles.playerName}>
                                {blackPlayer.username || tAnalysis("gameSummary.black")}
                            </span>

                            <PlayerAvatar
                                image={blackPlayer.image}
                                username={blackPlayer.username || tAnalysis("gameSummary.black")}
                            />

                            <div className={styles.accuracyBox}>
                                {formatAccuracy(metrics.black.accuracy)}
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.moveTableSection}>
                    {moveClassificationRows.map(row => {
                        const colour = row.classification
                            ? classificationColours[row.classification]
                            : "#F87171";

                        const whiteCount = row.classification
                            ? metrics.white.classificationCounts[row.classification]
                            : 0;

                        const blackCount = row.classification
                            ? metrics.black.classificationCounts[row.classification]
                            : 0;

                        return (
                            <div
                                key={row.translationKey}
                                className={styles.moveRow}
                            >
                                <span className={styles.moveLabel}>
                                    {tAnalysis(
                                        `gameSummary.classifications.${row.translationKey}`
                                    )}
                                </span>

                                <span
                                    className={styles.moveCount}
                                    style={{ color: colour }}
                                >
                                    {whiteCount}
                                </span>

                                <div className={styles.moveIconCell}>
                                    {row.classification ? (
                                        <img
                                            className={styles.moveIcon}
                                            src={classificationImages[row.classification]}
                                            alt=""
                                        />
                                    ) : (
                                        <span className={styles.missIcon}>
                                            ×
                                        </span>
                                    )}
                                </div>

                                <span
                                    className={styles.moveCount}
                                    style={{ color: colour }}
                                >
                                    {blackCount}
                                </span>
                            </div>
                        );
                    })}
                </section>

                <section className={styles.phaseSection}>
                    <div className={styles.phaseRow}>
                        <span className={styles.phaseLabel}>
                            {tAnalysis("gameSummary.gameRating")}
                        </span>

                        <span className={styles.gameRating}>
                            {metrics.white.estimatedRating ?? "—"}
                        </span>

                        <span className={styles.gameRating}>
                            {metrics.black.estimatedRating ?? "—"}
                        </span>
                    </div>

                    {phaseRows.map(row => (
                        <div
                            key={row.phase}
                            className={styles.phaseRow}
                        >
                            <span className={styles.phaseLabel}>
                                {tAnalysis(
                                    `gameSummary.phases.${row.translationKey}`
                                )}
                            </span>

                            <div className={styles.phaseValue}>
                                <PhaseIcon score={metrics.white.phaseScores[row.phase]} />
                            </div>

                            <div className={styles.phaseValue}>
                                <PhaseIcon score={metrics.black.phaseScores[row.phase]} />
                            </div>
                        </div>
                    ))}
                </section>
            </div>

            {analysisStatus == AnalysisStatus.INACTIVE && (
                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.startReviewButton}
                        onClick={onStartReview}
                    >
                        {tAnalysis("gameSummary.startReview")}
                    </button>
                </div>
            )}

            {settings.coach.enabled && isCoachPickerOpen && (
                <CoachPicker
                    selectedCoach={selectedCoach}
                    onClose={() => setIsCoachPickerOpen(false)}
                    onConfirm={coachId => {
                        setSettings(draft => {
                            draft.appearance.selectedCoach = coachId;
                            return draft;
                        });
                        setIsCoachPickerOpen(false);
                    }}
                />
            )}
        </section>
    );
}

export default GameSummaryPanel;
