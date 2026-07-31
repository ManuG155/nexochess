from pathlib import Path

INDEX_PATH = Path("client/src/apps/features/puzzles/pages/Puzzles/index.tsx")
PUZZLES_CSS_PATH = Path("client/src/apps/features/puzzles/pages/Puzzles/Puzzles.module.css")
EVAL_CSS_PATH = Path("client/src/apps/features/analysis/components/EvaluationBar/EvaluationBar.module.css")
NAV_CSS_PATH = Path("client/src/components/layout/NavigationBar/NavigationBar.module.css")
MARKER = "NEXO_PUZZLE_EVALUATION_LAYOUT_POLISH"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one match, found {count}")
    return text.replace(old, new, 1)


index = INDEX_PATH.read_text(encoding="utf-8")
puzzles_css = PUZZLES_CSS_PATH.read_text(encoding="utf-8")
eval_css = EVAL_CSS_PATH.read_text(encoding="utf-8")
nav_css = NAV_CSS_PATH.read_text(encoding="utf-8")

if MARKER in puzzles_css:
    print("Puzzle evaluation/layout polish already applied")
    raise SystemExit(0)

index = replace_once(
    index,
    "function getMoveSAN(fen: string, uci: string) {",
    '''function getProvisionalEvaluation(fen: string): Evaluation {
    try {
        const board = new Chess(fen);

        if (board.isCheckmate()) {
            return {
                type: "mate",
                value: board.turn() == "b" ? 1 : -1
            };
        }

        if (board.isDraw()) {
            return {
                type: "centipawn",
                value: 0
            };
        }

        let material = 0;

        board.board().forEach(row => {
            row.forEach(piece => {
                if (!piece) return;

                const value = piece.type == "p"
                    ? 100
                    : piece.type == "n"
                        ? 320
                        : piece.type == "b"
                            ? 330
                            : piece.type == "r"
                                ? 500
                                : piece.type == "q"
                                    ? 900
                                    : 0;

                material += piece.color == "w" ? value : -value;
            });
        });

        return {
            type: "centipawn",
            value: material
        };
    } catch {
        return {
            type: "centipawn",
            value: 0
        };
    }
}

function getMoveSAN(fen: string, uci: string) {''',
    "insert provisional evaluation"
)

old_evaluation = '''        const cachedEvaluation =
            evaluationCacheRef.current.get(currentFen);
        if (cachedEvaluation) {
            setBoardEvaluation({ ...cachedEvaluation });
        }

        let cancelled = false;
        const selectedVersion = settings.analysis.engine.version;
        const localVersion = selectedVersion == EngineVersion.LICHESS_CLOUD
            ? EngineVersion.STOCKFISH_17_LITE
            : selectedVersion;
        const engine = new Engine(localVersion);

        engine
            .setThreadCount(1)
            .setLineCount(1)
            .setPosition(currentFen);

        void engine.evaluate({
            depth: Math.min(
                14,
                Math.max(10, settings.analysis.engine.depth)
            ),
            timeLimit: 450,
            onEngineLine: line => {
                if (!cancelled && line.index == 1) {
                    updateEvaluation(line.evaluation);
                }
            }
        }).then(lines => {
            const finalLine = lines
                .filter(line => line.index == 1)
                .at(-1);

            if (!cancelled && finalLine) {
                updateEvaluation(finalLine.evaluation);
            }
        }).catch(() => {
            // Keep the last safe evaluation if this device cannot run a worker.
        }).finally(() => {
            engine.terminate();
        });'''

new_evaluation = '''        const provisionalEvaluation =
            getProvisionalEvaluation(currentFen);
        const cachedEvaluation =
            evaluationCacheRef.current.get(currentFen);

        setBoardEvaluation(
            cachedEvaluation
                ? { ...cachedEvaluation }
                : { ...provisionalEvaluation }
        );

        let cancelled = false;
        const selectedVersion = settings.analysis.engine.version;
        const localVersion = selectedVersion == EngineVersion.LICHESS_CLOUD
            ? EngineVersion.STOCKFISH_17_LITE
            : selectedVersion;
        const engine = new Engine(localVersion);

        engine
            .setThreadCount(1)
            .setLineCount(1)
            .setPosition(currentFen);

        void engine.evaluate({
            depth: Math.min(
                18,
                Math.max(12, settings.analysis.engine.depth)
            ),
            timeLimit: 1100,
            onEngineLine: line => {
                if (
                    !cancelled
                    && line.index == 1
                    && line.depth >= 6
                ) {
                    updateEvaluation(line.evaluation);
                }
            }
        }).then(lines => {
            const finalLine = lines
                .filter(line => line.index == 1)
                .at(-1);

            if (!cancelled && finalLine) {
                updateEvaluation(finalLine.evaluation);
            }
        }).catch(() => {
            if (
                !cancelled
                && requestId == evaluationRequestRef.current
            ) {
                setBoardEvaluation({ ...provisionalEvaluation });
            }
        }).finally(() => {
            engine.terminate();
        });'''

index = replace_once(
    index,
    old_evaluation,
    new_evaluation,
    "replace puzzle evaluation pipeline"
)

old_header = '''                        <div className={styles.workspaceTitleRow}>
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
                        </div>'''

new_header = '''                        <div className={styles.workspaceTitleRow}>
                            <h2>
                                {t("puzzle.toMove", {
                                    colour: t(`colours.${puzzle.solver}`)
                                })}
                            </h2>
                        </div>'''

index = replace_once(
    index,
    old_header,
    new_header,
    "remove floating puzzle badges"
)

history_block = '''                        {boardHistory.length > 1 && (
                            <div className={styles.historyControls}>
                                <button
                                    type="button"
                                    onClick={() => setHistoryIndex(index => (
                                        Math.max(0, index - 1)
                                    ))}
                                    disabled={historyIndex == 0}
                                    aria-label={t("controls.previous")}
                                >
                                    ←
                                </button>
                                <span>
                                    {historyIndex == 0 && puzzle.previousFen
                                        ? t("controls.beforeMistake")
                                        : atLivePosition
                                            ? t("controls.current")
                                            : t("controls.linePosition", {
                                                current: historyIndex + 1,
                                                total: boardHistory.length
                                            })
                                    }
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setHistoryIndex(index => (
                                        Math.min(
                                            boardHistory.length - 1,
                                            index + 1
                                        )
                                    ))}
                                    disabled={atLivePosition}
                                    aria-label={t("controls.next")}
                                >
                                    →
                                </button>
                            </div>
                        )}'''

position_details = history_block + '''

                        <div className={styles.positionDetails}>
                            {puzzle.rating && (
                                <span>
                                    {t("puzzle.rating", {
                                        rating: puzzle.rating
                                    })}
                                </span>
                            )}
                            {puzzle.classification && (
                                <span className={styles.positionErrorBadge}>
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
                        </div>'''

index = replace_once(
    index,
    history_block,
    position_details,
    "move puzzle metadata into objective card"
)

puzzles_css += '''

/* NEXO_PUZZLE_EVALUATION_LAYOUT_POLISH */
.trainingGrid .workspaceHeader {
    min-height: 38px;
    padding-bottom: 7px;
}

.trainingGrid .workspaceTitleRow h2 {
    font-size: clamp(1.5rem, 1.8vw, 1.95rem);
}

.trainingGrid .objectiveCard {
    display: flex;
    flex-direction: column;
}

.positionDetails {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: auto;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.055);
}

.positionDetails span {
    padding: 6px 10px;
    color: rgba(244, 247, 252, 0.68);
    border: 1px solid rgba(122, 164, 241, 0.15);
    border-radius: 999px;
    background: rgba(71, 114, 196, 0.07);
    font-size: 0.79rem;
    font-weight: 560;
    line-height: 1.2;
}

.positionDetails span.positionErrorBadge {
    color: #f1b0a7;
    border-color: rgba(224, 112, 96, 0.22);
    background: rgba(224, 112, 96, 0.08);
}

.trainingGrid .evaluationBar {
    width: 24px;
    min-width: 24px;
    margin-right: 15px;
}

.trainingGrid .boardShell {
    width: calc(100% - 39px);
}

.trainingGrid .boardStageWithOutsideCoordinates .evaluationBar {
    margin-right: 32px;
}

.trainingGrid .boardStageWithOutsideCoordinates .boardShell {
    width: calc(100% - 56px);
}

.trainingGrid .outsideRanks {
    right: calc(100% + 8px);
    width: 16px;
}

@media (max-width: 620px) {
    .trainingGrid .evaluationBar {
        width: 20px;
        min-width: 20px;
        margin-right: 11px;
    }

    .trainingGrid .boardShell {
        width: calc(100% - 31px);
    }

    .trainingGrid .boardStageWithOutsideCoordinates .evaluationBar {
        margin-right: 28px;
    }

    .trainingGrid .boardStageWithOutsideCoordinates .boardShell {
        width: calc(100% - 48px);
    }

    .positionDetails span {
        padding: 5px 8px;
        font-size: 0.72rem;
    }
}
'''

eval_css += '''

/* NEXO_EVALUATION_LABEL_POLISH */
.evaluationText {
    font-weight: 650;
    letter-spacing: -0.025em;
}
'''

nav_css += '''

/* NEXO_NAVIGATION_SCALE_POLISH */
@media (min-width: 801px) {
    .wrapper {
        height: 72px;
        gap: 20px;
        padding-inline: 20px;
    }

    .brandArea {
        gap: 11px;
        padding-right: 20px;
    }

    .navItem,
    .actionButton,
    .utilityButton,
    .profileButton,
    .menuButton {
        height: 46px;
        gap: 10px;
        border-radius: 11px;
        font-size: 0.98rem;
    }

    .navItem {
        padding-inline: 14px;
    }

    .icon {
        width: 22px;
        height: 22px;
    }

    .utilityButton,
    .menuButton {
        width: 46px;
        flex-basis: 46px;
    }

    .signIn {
        padding-inline: 16px;
    }

    .typographyText {
        height: 52px;
        max-width: 265px;
    }

    .typographyIcon {
        width: 50px;
        height: 50px;
    }
}

@media (min-width: 801px) and (max-width: 1250px) {
    .wrapper {
        gap: 14px;
        padding-inline: 15px;
    }

    .brandArea {
        padding-right: 15px;
    }

    .navItem {
        padding-inline: 11px;
    }
}

@media (min-width: 801px) and (max-width: 1050px) {
    .navItem,
    .actionButton {
        width: 46px;
        padding: 0;
    }
}
'''

INDEX_PATH.write_text(index, encoding="utf-8")
PUZZLES_CSS_PATH.write_text(puzzles_css, encoding="utf-8")
EVAL_CSS_PATH.write_text(eval_css, encoding="utf-8")
NAV_CSS_PATH.write_text(nav_css, encoding="utf-8")

print("Applied puzzle evaluation, metadata, evaluation bar and navigation polish")
