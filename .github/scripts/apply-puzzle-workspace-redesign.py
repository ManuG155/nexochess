from pathlib import Path

INDEX_PATH = Path("client/src/apps/features/puzzles/pages/Puzzles/index.tsx")
CSS_PATH = Path("client/src/apps/features/puzzles/pages/Puzzles/Puzzles.module.css")
MARKER = "NEXO_PUZZLE_WORKSPACE_REDESIGN"

index = INDEX_PATH.read_text(encoding="utf-8")
css = CSS_PATH.read_text(encoding="utf-8")

if MARKER in css:
    raise SystemExit("Puzzle workspace redesign is already applied")

profile_stats_const = '''    const profileStats = showRatedProfile ? (
        <div className={styles.profileStats}>
            <div>
                <span>{t("stats.rating")}</span>
                <strong>{profile.rating}</strong>
                <small>
                    {calibrationRemaining > 0
                        ? t("stats.calibrating", {
                            count: calibrationRemaining
                        })
                        : t("stats.calibrated")
                    }
                </small>
            </div>
            <div>
                <span>{t("stats.accuracy")}</span>
                <strong>{accuracy}%</strong>
                <small>
                    {t("stats.attempts", {
                        count: profile.attempts
                    })}
                </small>
            </div>
            <div>
                <span>{t("stats.streak")}</span>
                <strong>{profile.streak}</strong>
                <small>
                    {t("stats.best", {
                        count: profile.bestStreak
                    })}
                </small>
            </div>
        </div>
    ) : null;
'''

if "    const profileStats = showRatedProfile ? (" not in index:
    insertion = "    return <main\n"
    if insertion not in index:
        raise SystemExit("Return insertion point not found")
    index = index.replace(
        insertion,
        profile_stats_const + "\n" + insertion,
        1
    )

old_profile_stats = '''            {showRatedProfile && <div className={styles.profileStats}>
                <div>
                    <span>{t("stats.rating")}</span>
                    <strong>{profile.rating}</strong>
                    <small>
                        {calibrationRemaining > 0
                            ? t("stats.calibrating", {
                                count: calibrationRemaining
                            })
                            : t("stats.calibrated")
                        }
                    </small>
                </div>
                <div>
                    <span>{t("stats.accuracy")}</span>
                    <strong>{accuracy}%</strong>
                    <small>
                        {t("stats.attempts", {
                            count: profile.attempts
                        })}
                    </small>
                </div>
                <div>
                    <span>{t("stats.streak")}</span>
                    <strong>{profile.streak}</strong>
                    <small>
                        {t("stats.best", {
                            count: profile.bestStreak
                        })}
                    </small>
                </div>
            </div>}'''

if old_profile_stats in index:
    index = index.replace(old_profile_stats, "            {profileStats}", 1)
elif "            {profileStats}" not in index:
    raise SystemExit("Original profile stats block not found")

hero_open = "        <section className={styles.hero}>\n"
if hero_open in index:
    index = index.replace(
        hero_open,
        "        {!trainingActive && <section className={styles.hero}>\n",
        1
    )

hero_close = '''        </section>

        {(pageState == "loading" || pageState == "error") && ('''
if hero_close in index:
    index = index.replace(
        hero_close,
        '''        </section>}

        {(pageState == "loading" || pageState == "error") && (''',
        1
    )
elif "        </section>}\n\n        {(pageState == \"loading\"" not in index:
    raise SystemExit("Hero closing point not found")

old_training_header = '''            <section className={styles.trainingGrid}>
                <div className={styles.boardColumn}>
                    <header className={styles.puzzleMeta}>
                        <div>
                            <span>
                                {puzzle.source == "archive"
                                    ? t("puzzle.archiveSource")
                                    : pageCopy.thematicSource
                                }
                            </span>
                            <h2>
                                {t("puzzle.toMove", {
                                    colour: t(`colours.${puzzle.solver}`)
                                })}
                            </h2>
                        </div>

                        <div className={styles.puzzleBadges}>
                            {puzzle.rating && (
                                <span>
                                    {t("puzzle.rating", {
                                        rating: puzzle.rating
                                    })}
                                </span>
                            )}
                            {puzzle.classification && (
                                <span className={styles.errorBadge}>
                                    {t(
                                        `classifications.${puzzle.classification}`,
                                        { ns: "analysis" }
                                    )}
                                </span>
                            )}
                            {visibleThemes.map(value => (
                                <span key={value}>
                                    {formatPuzzleTheme(
                                        value,
                                        i18n.resolvedLanguage || "en"
                                    )}
                                </span>
                            ))}
                        </div>
                    </header>

                    <div className={['''

new_training_header = '''            <section className={styles.trainingGrid}>
                <header className={styles.workspaceHeader}>
                    <div className={styles.workspaceIdentity}>
                        <span className={styles.workspaceSource}>
                            {puzzle.source == "archive"
                                ? t("puzzle.archiveSource")
                                : pageCopy.thematicSource
                            }
                        </span>

                        <div className={styles.workspaceTitleRow}>
                            <h2>
                                {t("puzzle.toMove", {
                                    colour: t(`colours.${puzzle.solver}`)
                                })}
                            </h2>

                            <div className={styles.puzzleBadges}>
                                {puzzle.rating && (
                                    <span>
                                        {t("puzzle.rating", {
                                            rating: puzzle.rating
                                        })}
                                    </span>
                                )}
                                {puzzle.classification && (
                                    <span className={styles.errorBadge}>
                                        {t(
                                            `classifications.${puzzle.classification}`,
                                            { ns: "analysis" }
                                        )}
                                    </span>
                                )}
                                {visibleThemes.map(value => (
                                    <span key={value}>
                                        {formatPuzzleTheme(
                                            value,
                                            i18n.resolvedLanguage || "en"
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {profileStats}
                </header>

                <div className={styles.boardColumn}>
                    <div className={['''

if old_training_header not in index:
    raise SystemExit("Training header block not found")
index = index.replace(old_training_header, new_training_header, 1)

index = index.replace(
    "                    </div>                </aside>",
    "                    </div>\n                </aside>",
    1
)

workspace_css = r'''
/* NEXO_PUZZLE_WORKSPACE_REDESIGN */
.trainingPage {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    min-height: 0;
    padding: 6px 12px 16px;
}

.trainingGrid {
    display: grid;
    grid-template-columns:
        min(760px, calc(100dvh - 150px))
        minmax(520px, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    grid-template-areas:
        "workspace-header workspace-header"
        "board panel";
    align-items: start;
    justify-content: stretch;
    gap: 10px 20px;

    box-sizing: border-box;
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 10px;

    border: 1px solid rgba(121, 164, 241, 0.13);
    border-radius: 20px;
    background:
        radial-gradient(
            circle at 78% 2%,
            rgba(64, 107, 190, 0.09),
            transparent 34%
        ),
        linear-gradient(
            145deg,
            rgba(29, 33, 42, 0.96),
            rgba(20, 23, 30, 0.98)
        );
    box-shadow:
        0 26px 72px rgba(0, 0, 0, 0.24),
        inset 0 1px rgba(255, 255, 255, 0.025);
}

.workspaceHeader {
    grid-area: workspace-header;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;

    min-width: 0;
    min-height: 44px;
    padding: 0 4px 8px;

    border-bottom: 1px solid rgba(255, 255, 255, 0.055);
}

.workspaceIdentity {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.workspaceSource {
    color: #7fa9ff;
    font-size: 0.7rem;
    font-weight: 780;
    letter-spacing: 0.095em;
    text-transform: uppercase;
}

.workspaceTitleRow {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px 14px;
    min-width: 0;
}

.workspaceTitleRow h2 {
    flex: 0 0 auto;
    margin: 0;
    color: #f5f7fc;
    font-size: clamp(1.45rem, 1.75vw, 1.9rem);
    line-height: 1.08;
    letter-spacing: -0.025em;
}

.workspaceHeader .puzzleBadges {
    justify-content: flex-start;
}

.workspaceHeader .puzzleBadges span {
    padding: 4px 8px;
    font-size: 0.7rem;
}

.workspaceHeader .profileStats {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(105px, 1fr));
    flex: 0 0 auto;
    gap: 7px;
}

.workspaceHeader .profileStats > div {
    min-width: 105px;
    padding: 5px 10px;

    border-color: rgba(255, 255, 255, 0.065);
    border-radius: 10px;
    background: rgba(8, 11, 16, 0.26);
}

.workspaceHeader .profileStats span {
    font-size: 0.66rem;
}

.workspaceHeader .profileStats strong {
    margin: 0;
    font-size: 1.03rem;
    line-height: 1.05;
}

.workspaceHeader .profileStats small {
    display: none;
}

.boardColumn {
    grid-area: board;

    display: flex;
    align-items: flex-start;
    justify-content: flex-start;

    min-width: 0;
    min-height: 0;
}

.trainingGrid .boardStage {
    width: 100%;
    max-width: none;
    margin: 0;
}

.trainingGrid .evaluationBar {
    width: 15px;
    min-width: 15px;
    margin-right: 12px;
}

.trainingGrid .boardShell {
    width: calc(100% - 27px);
}

.trainingGrid .boardStageWithOutsideCoordinates .evaluationBar {
    margin-right: 20px;
}

.trainingGrid .boardStageWithOutsideCoordinates .boardShell {
    width: calc(100% - 35px);
}

.trainingGrid .outsideRanks {
    right: calc(100% + 7px);
}

.trainingGrid .trainingPanel {
    grid-area: panel;

    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(245px, 0.85fr);
    grid-template-areas:
        "coach coach"
        "objective actions"
        "objective next"
        "secondary secondary";
    align-content: start;
    align-items: stretch;
    gap: 10px;

    min-width: 0;
    min-height: 0;
    margin: 0;
    padding: 10px;

    border-color: rgba(121, 164, 241, 0.12);
    background:
        linear-gradient(
            180deg,
            rgba(27, 32, 42, 0.94),
            rgba(20, 24, 32, 0.96)
        );
    box-shadow: none;
}

.trainingGrid .trainingPanel > .coachCard {
    grid-area: coach;
    min-height: 158px;
    margin: 0;
}

.trainingGrid .trainingPanel .coachCard {
    grid-template-columns: minmax(0, 1fr) 160px;
}

.trainingGrid .trainingPanel .coachPortrait {
    width: 172px;
    height: 172px;
}

.trainingGrid .objectiveCard {
    grid-area: objective;
    min-width: 0;
}

.trainingGrid .puzzleActions {
    grid-area: actions;
    grid-template-columns: minmax(0, 1fr);
}

.trainingGrid .puzzleActions button {
    min-height: 66px;
}

.trainingGrid .nextPuzzle {
    grid-area: next;
    align-self: stretch;
    min-height: 50px;
    margin: 0;
}

.trainingGrid .secondaryActions {
    grid-area: secondary;
    padding: 0 4px;
}

@media (max-width: 1320px) and (min-width: 1101px) {
    .trainingGrid {
        grid-template-columns:
            min(700px, calc(100dvh - 150px))
            minmax(455px, 1fr);
        gap: 10px 14px;
    }

    .workspaceHeader .profileStats {
        grid-template-columns: repeat(3, minmax(92px, 1fr));
    }

    .workspaceHeader .profileStats > div {
        min-width: 92px;
        padding-inline: 8px;
    }

    .trainingGrid .trainingPanel {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
            "coach"
            "objective"
            "actions"
            "next"
            "secondary";
    }

    .trainingGrid .puzzleActions {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 1100px) {
    .trainingPage {
        padding: 10px 18px 22px;
    }

    .trainingGrid {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto auto auto;
        grid-template-areas:
            "workspace-header"
            "board"
            "panel";
        gap: 14px;
        padding: 12px;
    }

    .workspaceHeader {
        align-items: flex-start;
        flex-wrap: wrap;
    }

    .workspaceHeader .profileStats {
        width: 100%;
    }

    .boardColumn {
        justify-content: center;
    }

    .trainingGrid .boardStage {
        width: min(100%, 720px);
    }

    .trainingGrid .trainingPanel {
        width: min(100%, 720px);
        justify-self: center;
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
            "coach"
            "objective"
            "actions"
            "next"
            "secondary";
    }

    .trainingGrid .puzzleActions {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 620px) {
    .trainingPage {
        padding-inline: 8px;
    }

    .trainingGrid {
        padding: 9px;
        border-radius: 15px;
    }

    .workspaceTitleRow {
        align-items: flex-start;
        flex-direction: column;
    }

    .workspaceHeader .profileStats {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .workspaceHeader .profileStats > div {
        min-width: 0;
        padding: 6px;
    }

    .workspaceHeader .profileStats span {
        font-size: 0.59rem;
    }

    .workspaceHeader .profileStats strong {
        font-size: 0.94rem;
    }

    .trainingGrid .trainingPanel .coachCard {
        grid-template-columns: minmax(0, 1fr) 110px;
    }

    .trainingGrid .trainingPanel .coachPortrait {
        width: 126px;
        height: 126px;
    }

    .trainingGrid .puzzleActions {
        grid-template-columns: minmax(0, 1fr);
    }
}
'''

INDEX_PATH.write_text(index, encoding="utf-8")
CSS_PATH.write_text(css.rstrip() + "\n\n" + workspace_css.strip() + "\n", encoding="utf-8")
