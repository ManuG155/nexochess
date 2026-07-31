from pathlib import Path

INDEX_PATH = Path("client/src/apps/features/puzzles/pages/Puzzles/index.tsx")
CSS_PATH = Path("client/src/apps/features/puzzles/pages/Puzzles/Puzzles.module.css")
MARKER = "NEXO_PUZZLE_FINISHING_POLISH"

index = INDEX_PATH.read_text(encoding="utf-8")
css = CSS_PATH.read_text(encoding="utf-8")

if MARKER in css:
    raise SystemExit("finishing polish already applied")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"missing insertion point: {label}")
    return text.replace(old, new, 1)


index = replace_once(
    index,
    '''interface MoveFeedback {
    square: Square;
    kind: "correct" | "brilliant";
}
''',
    '''interface MoveFeedback {
    square: Square;
    kind: "correct" | "brilliant";
}

interface PuzzleRatingEvent {
    id: string;
    delta: number;
    ratingAfter: number;
}
''',
    "rating event interface"
)

index = replace_once(
    index,
    '''    const [ moveFeedback, setMoveFeedback ] =
        useState<MoveFeedback>();
    const [ hintArrow, setHintArrow ] =
''',
    '''    const [ moveFeedback, setMoveFeedback ] =
        useState<MoveFeedback>();
    const [ ratingHistory, setRatingHistory ] =
        useState<PuzzleRatingEvent[]>([]);
    const [ hintArrow, setHintArrow ] =
''',
    "rating history state"
)

index = replace_once(
    index,
    '''            const updated = recordRatedAttempt(
                profileRef.current,
                puzzle.rating,
                solvedWithoutHelp
            );

            profileRef.current = updated;
            setProfile(updated);
''',
    '''            const previousProfile = profileRef.current;
            const updated = recordRatedAttempt(
                previousProfile,
                puzzle.rating,
                solvedWithoutHelp
            );
            const delta = updated.rating - previousProfile.rating;

            profileRef.current = updated;
            setProfile(updated);
            setRatingHistory(previous => [
                ...previous,
                {
                    id: puzzle.id,
                    delta,
                    ratingAfter: updated.rating
                }
            ].slice(-8));
''',
    "rating delta recording"
)

index = replace_once(
    index,
    '''        moveFeedbackTimer.current = window.setTimeout(() => {
            setMoveFeedback(undefined);
        }, 820);
''',
    '''        moveFeedbackTimer.current = window.setTimeout(() => {
            setMoveFeedback(undefined);
        }, feedbackKind == "brilliant" ? 1350 : 820);
''',
    "brilliant feedback duration"
)

index = replace_once(
    index,
    '''    ) : null;

    return <main
''',
    '''    ) : null;

    const sessionRatingTrail = showRatedProfile ? (
        <div className={styles.ratingTrail}>
            <span className={styles.ratingTrailLabel}>
                {t("stats.rating")}
            </span>
            <div className={styles.ratingTrailItems}>
                {ratingHistory.map((event, index) => (
                    <span
                        key={`${event.id}-${index}`}
                        className={[
                            styles.ratingResult,
                            event.delta > 0
                                ? styles.ratingGain
                                : event.delta < 0
                                    ? styles.ratingLoss
                                    : styles.ratingNeutral
                        ].join(" ")}
                        title={String(event.ratingAfter)}
                    >
                        {event.delta > 0 ? "+" : ""}{event.delta}
                    </span>
                ))}
                {puzzle?.source == "lichess"
                    && ratedSession
                    && pageState == "playing"
                    && (
                        <span
                            className={styles.ratingPending}
                            aria-hidden="true"
                        />
                    )
                }
            </div>
        </div>
    ) : null;

    return <main
''',
    "session rating trail"
)

index = replace_once(
    index,
    '''

                    {profileStats}
                </header>
''',
    '''
                </header>
''',
    "remove header profile stats"
)

index = replace_once(
    index,
    '''                    </div>

                    {pageState == "playing" && (
                        <div className={styles.puzzleActions}>
''',
    '''                    </div>

                    {showRatedProfile && (
                        <div className={styles.performancePanel}>
                            {profileStats}
                            {sessionRatingTrail}
                        </div>
                    )}

                    {pageState == "playing" && (
                        <div className={styles.puzzleActions}>
''',
    "performance panel"
)

INDEX_PATH.write_text(index, encoding="utf-8")

css += r'''

/* NEXO_PUZZLE_FINISHING_POLISH */
@media (min-width: 1101px) {
    .trainingGrid {
        grid-template-columns:
            min(740px, calc(100dvh - 182px))
            minmax(500px, 1fr);
    }

    .boardColumn {
        box-sizing: border-box;
        padding-bottom: 24px;
        overflow: visible;
    }

    .trainingGrid .boardStage {
        overflow: visible;
    }

    .trainingGrid .trainingPanel {
        grid-template-areas:
            "coach coach"
            "objective actions"
            "objective next"
            "performance performance"
            "secondary secondary";
    }
}

.performancePanel {
    grid-area: performance;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 0.72fr);
    align-items: stretch;
    gap: 9px;
    min-width: 0;
}

.performancePanel .profileStats {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
    width: 100%;
}

.performancePanel .profileStats > div {
    min-width: 0;
    padding: 9px 11px;
    border-color: rgba(255, 255, 255, 0.065);
    border-radius: 11px;
    background: rgba(7, 10, 15, 0.28);
}

.performancePanel .profileStats span,
.performancePanel .profileStats small {
    font-size: 0.66rem;
}

.performancePanel .profileStats strong {
    margin-block: 1px;
    font-size: 1.05rem;
    line-height: 1.05;
}

.performancePanel .profileStats small {
    display: block;
    overflow: hidden;
    color: rgba(244, 247, 252, 0.36);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ratingTrail {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: 9px 11px;
    border: 1px solid rgba(255, 255, 255, 0.065);
    border-radius: 11px;
    background: rgba(7, 10, 15, 0.28);
}

.ratingTrailLabel {
    margin-bottom: 7px;
    color: rgba(244, 247, 252, 0.42);
    font-size: 0.66rem;
}

.ratingTrailItems {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    min-height: 30px;
}

.ratingResult,
.ratingPending {
    display: inline-grid;
    place-items: center;
    box-sizing: border-box;
    min-width: 42px;
    height: 30px;
    padding-inline: 8px;
    border-radius: 9px;
    font-size: 0.8rem;
    font-weight: 780;
    line-height: 1;
    box-shadow: inset 0 1px rgba(255, 255, 255, 0.08);
}

.ratingGain {
    color: #efffe7;
    border: 1px solid rgba(133, 206, 74, 0.32);
    background: linear-gradient(180deg, #568f24, #3e7419);
}

.ratingLoss {
    color: #fff0f0;
    border: 1px solid rgba(241, 91, 91, 0.34);
    background: linear-gradient(180deg, #d64242, #b92e35);
}

.ratingNeutral {
    color: #e5eaf4;
    border: 1px solid rgba(179, 189, 209, 0.18);
    background: rgba(130, 142, 166, 0.28);
}

.ratingPending {
    border: 1px solid rgba(235, 166, 43, 0.32);
    background: linear-gradient(180deg, #bd841c, #9d6910);
    animation: ratingPendingPulse 1.7s ease-in-out infinite;
}

.squareFeedbackSurface {
    overflow: hidden;
}

.squareFeedbackBrilliant {
    z-index: 2;
    background:
        radial-gradient(
            circle at 50% 50%,
            rgba(196, 255, 249, 0.72) 0 15%,
            rgba(66, 218, 207, 0.55) 36%,
            rgba(21, 151, 157, 0.28) 68%,
            transparent 78%
        );
    box-shadow:
        inset 0 0 0 3px rgba(168, 255, 247, 0.42),
        inset 0 0 26px rgba(71, 231, 220, 0.48),
        0 0 18px rgba(52, 203, 197, 0.42);
    animation: brilliantSquarePulse 1.32s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.squareFeedbackBrilliant::before,
.squareFeedbackBrilliant::after {
    content: "";
    position: absolute;
    pointer-events: none;
}

.squareFeedbackBrilliant::before {
    inset: 8%;
    border: 2px solid rgba(215, 255, 251, 0.82);
    border-radius: 50%;
    animation: brilliantRing 1.1s ease-out both;
}

.squareFeedbackBrilliant::after {
    top: -35%;
    bottom: -35%;
    left: -80%;
    width: 42%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(235, 255, 253, 0.78),
        transparent
    );
    transform: skewX(-18deg);
    animation: brilliantSweep 0.92s 0.08s ease-out both;
}

.squareFeedbackIconBrilliant {
    color: #ecfffd;
    border-color: rgba(226, 255, 252, 0.94);
    background:
        radial-gradient(circle at 32% 24%, #73eee5, #169c9f 72%);
    box-shadow:
        0 0 0 4px rgba(54, 210, 203, 0.2),
        0 7px 18px rgba(7, 70, 74, 0.42);
    animation: brilliantBadge 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes ratingPendingPulse {
    0%, 100% {
        opacity: 0.72;
        transform: scale(0.96);
    }

    50% {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes brilliantSquarePulse {
    0% {
        opacity: 0;
        transform: scale(0.72) rotate(-5deg);
    }

    22% {
        opacity: 1;
        transform: scale(1.06) rotate(1deg);
    }

    55% {
        opacity: 0.96;
        transform: scale(1);
    }

    100% {
        opacity: 0;
        transform: scale(1.02);
    }
}

@keyframes brilliantRing {
    0% {
        opacity: 0;
        transform: scale(0.24);
    }

    28% {
        opacity: 0.95;
    }

    100% {
        opacity: 0;
        transform: scale(1.52);
    }
}

@keyframes brilliantSweep {
    0% {
        opacity: 0;
        transform: translateX(0) skewX(-18deg);
    }

    22% {
        opacity: 0.9;
    }

    100% {
        opacity: 0;
        transform: translateX(430%) skewX(-18deg);
    }
}

@keyframes brilliantBadge {
    0% {
        opacity: 0;
        transform: scale(0.28) rotate(-18deg);
    }

    35% {
        opacity: 1;
        transform: scale(1.2) rotate(4deg);
    }

    62% {
        transform: scale(0.96) rotate(-1deg);
    }

    100% {
        opacity: 1;
        transform: scale(1) rotate(0);
    }
}

@media (max-width: 1320px) and (min-width: 1101px) {
    .performancePanel {
        grid-template-columns: minmax(0, 1fr);
    }

    .trainingGrid .trainingPanel {
        grid-template-areas:
            "coach"
            "objective"
            "actions"
            "next"
            "performance"
            "secondary";
    }
}

@media (max-width: 1100px) {
    .boardColumn {
        box-sizing: border-box;
        padding-bottom: 24px;
        overflow: visible;
    }

    .trainingGrid .trainingPanel {
        grid-template-areas:
            "coach"
            "objective"
            "actions"
            "next"
            "performance"
            "secondary";
    }

    .performancePanel {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (max-width: 620px) {
    .performancePanel .profileStats {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .performancePanel .profileStats > div {
        padding-inline: 7px;
    }

    .ratingResult,
    .ratingPending {
        min-width: 38px;
        height: 28px;
        padding-inline: 6px;
    }
}
'''

CSS_PATH.write_text(css, encoding="utf-8")
