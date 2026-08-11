import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

const target = "client/src/apps/features/puzzles/pages/Puzzles/index.tsx";
const cssTarget = "client/src/components/layout/PageWrapper/PuzzlesPolishV6.css";
const self = fileURLToPath(import.meta.url);
const selfRelative = "scripts/patch-puzzles-archive-history.mjs";

const status = execFileSync("git", ["status", "--porcelain"], {
    encoding: "utf8"
}).trim();

if (status) {
    throw new Error(
        "Worktree is not clean. Commit, stash or discard local changes before running this patch."
    );
}

let source = readFileSync(target, "utf8");

function replaceOnce(label, before, after) {
    const first = source.indexOf(before);
    if (first < 0) throw new Error(`Patch anchor not found: ${label}`);
    if (source.indexOf(before, first + before.length) >= 0) {
        throw new Error(`Patch anchor is not unique: ${label}`);
    }
    source = source.slice(0, first) + after + source.slice(first + before.length);
}

replaceOnce(
    "archive event type",
`interface PuzzleRatingEvent {
    id: string;
    delta: number;
    ratingAfter: number;
}
`,
`interface PuzzleRatingEvent {
    id: string;
    delta: number;
    ratingAfter: number;
}

interface ArchiveSessionEvent {
    id: string;
    solved: boolean;
}
`
);

replaceOnce(
    "archive history state",
`    const [ratingHistory, setRatingHistory] =
        useState<PuzzleRatingEvent[]>([]);
`,
`    const [ratingHistory, setRatingHistory] =
        useState<PuzzleRatingEvent[]>([]);
    const [archiveSessionHistory, setArchiveSessionHistory] =
        useState<ArchiveSessionEvent[]>([]);
`
);

replaceOnce(
    "archive outcome recording",
`        await markPuzzleCompleted(
            puzzle.id,
            puzzle.source,
            solvedWithoutHelp
        );

        if (
            puzzle.source == "lichess"
`,
`        await markPuzzleCompleted(
            puzzle.id,
            puzzle.source,
            solvedWithoutHelp
        );

        if (puzzle.source == "archive") {
            setArchiveSessionHistory(previous => [
                ...previous,
                { id: puzzle.id, solved: solvedWithoutHelp }
            ].slice(-8));
        }

        if (
            puzzle.source == "lichess"
`
);

replaceOnce(
    "archive trail markup",
`    const sessionRatingTrail = showRatedProfile ? (
        <div className={styles.ratingTrail}>
            <span className={styles.ratingTrailLabel}>{t("stats.rating")}</span>
            <div className={styles.ratingTrailItems}>
                {ratingHistory.map((event, index) => (
                    <span
                        key={\`${event.id}-${index}\`}
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
                    && <span className={styles.ratingPending} aria-hidden="true" />
                }
            </div>
        </div>
    ) : null;
`,
`    const sessionRatingTrail = showRatedProfile ? (
        <div className={styles.ratingTrail}>
            <span className={styles.ratingTrailLabel}>{t("stats.rating")}</span>
            <div className={styles.ratingTrailItems}>
                {ratingHistory.map((event, index) => (
                    <span
                        key={\`${event.id}-${index}\`}
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
                    && <span className={styles.ratingPending} aria-hidden="true" />
                }
            </div>
        </div>
    ) : null;

    const archiveSessionTrail = puzzle?.source == "archive" ? (
        <div className="nexo-puzzle-archive-trail" aria-hidden="true">
            <div className="nexo-puzzle-archive-trail-items">
                {archiveSessionHistory.map((event, index) => (
                    <span
                        key={\`${event.id}-${index}\`}
                        className={[
                            "nexo-puzzle-archive-result",
                            event.solved
                                ? "nexo-puzzle-archive-success"
                                : "nexo-puzzle-archive-failure"
                        ].join(" ")}
                    >
                        {event.solved ? "✓" : "✕"}
                    </span>
                ))}
                {pageState == "playing" && (
                    <span className="nexo-puzzle-archive-current" />
                )}
            </div>
        </div>
    ) : null;
`
);

replaceOnce(
    "left history render",
`                    {showRatedProfile && (
                        <div className="nexo-puzzle-left-history">
                            {sessionRatingTrail}
                        </div>
                    )}
`,
`                    {(showRatedProfile || puzzle.source == "archive") && (
                        <div className="nexo-puzzle-left-history">
                            {puzzle.source == "archive"
                                ? archiveSessionTrail
                                : sessionRatingTrail
                            }
                        </div>
                    )}
`
);

writeFileSync(target, source, "utf8");

let css = readFileSync(cssTarget, "utf8");
const mouthBefore = "    translate: 0 13px !important;";
const mouthAfter = "    translate: 0 15px !important;";

if (!css.includes(mouthBefore)) {
    throw new Error("Puzzle mouth offset anchor not found");
}
css = css.replace(mouthBefore, mouthAfter);

const archiveMarker = "/* Archive left rail: compact, centered and session-history aware. */";
if (css.includes(archiveMarker)) {
    throw new Error("Archive rail styles already present");
}

css += `\n\n${archiveMarker}\n[data-nexo-shell][data-route="puzzles"]\n.nexo-puzzle-left-rail:has(.nexo-puzzle-source-card) {\n    align-self: center !important;\n    height: min(460px, var(--nexo-puzzle-stage)) !important;\n    padding: 14px !important;\n    gap: 12px !important;\n    overflow: visible !important;\n}\n\n[data-nexo-shell][data-route="puzzles"]\n.nexo-puzzle-left-rail:has(.nexo-puzzle-source-card) .nexo-puzzle-source-card {\n    padding: 12px 13px !important;\n}\n\n[data-nexo-shell][data-route="puzzles"]\n.nexo-puzzle-left-rail:has(.nexo-puzzle-source-card) .nexo-puzzle-session-card {\n    flex: 0 0 auto !important;\n}\n\n[data-nexo-shell][data-route="puzzles"]\n.nexo-puzzle-left-rail:has(.nexo-puzzle-source-card) .nexo-puzzle-timer {\n    min-height: 76px !important;\n    margin-top: 0 !important;\n}\n\n[data-nexo-shell][data-route="puzzles"]\n.nexo-puzzle-left-rail:has(.nexo-puzzle-source-card) .nexo-puzzle-left-history {\n    min-height: 42px !important;\n    margin-top: 0 !important;\n    padding-top: 10px !important;\n}\n\n.nexo-puzzle-archive-trail-items {\n    display: flex;\n    align-items: center;\n    justify-content: flex-start;\n    flex-wrap: wrap;\n    gap: 7px;\n}\n\n.nexo-puzzle-archive-result,\n.nexo-puzzle-archive-current {\n    display: inline-grid;\n    place-items: center;\n    width: 34px;\n    height: 34px;\n    box-sizing: border-box;\n    border-radius: 9px;\n    font-size: 1rem;\n    font-weight: 800;\n    line-height: 1;\n}\n\n.nexo-puzzle-archive-success {\n    color: #f5fff0;\n    background: #4d991f;\n}\n\n.nexo-puzzle-archive-failure {\n    color: #fff4f4;\n    background: #d64545;\n}\n\n.nexo-puzzle-archive-current {\n    background: #a87512;\n    box-shadow: inset 0 0 0 1px rgba(255, 218, 117, 0.18);\n}\n`;

writeFileSync(cssTarget, css, "utf8");

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
execFileSync(npm, ["run", "check", "-w", "client"], { stdio: "inherit" });
execFileSync("git", ["diff", "--check"], { stdio: "inherit" });

unlinkSync(self);

execFileSync(
    "git",
    ["add", "-A", "--", target, cssTarget, selfRelative],
    { stdio: "inherit" }
);
execFileSync(
    "git",
    ["commit", "-m", "Puzzles: refine archive rail and history"],
    { stdio: "inherit" }
);
execFileSync("git", ["push", "origin", "develop"], { stdio: "inherit" });

console.log("Archive puzzle rail refined on develop.");
