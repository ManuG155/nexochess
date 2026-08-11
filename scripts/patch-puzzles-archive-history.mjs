import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

const target = "client/src/apps/features/puzzles/pages/Puzzles/index.tsx";
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
        <div className="nexo-puzzle-archive-trail">
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
                    <span
                        className="nexo-puzzle-archive-current"
                        aria-label="Current puzzle"
                    />
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

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
execFileSync(npm, ["run", "check", "-w", "client"], { stdio: "inherit" });
execFileSync("git", ["diff", "--check"], { stdio: "inherit" });

unlinkSync(self);

execFileSync(
    "git",
    ["add", "-A", "--", target, selfRelative],
    { stdio: "inherit" }
);
execFileSync(
    "git",
    ["commit", "-m", "Puzzles: add archive session history"],
    { stdio: "inherit" }
);
execFileSync("git", ["push", "origin", "develop"], { stdio: "inherit" });

console.log("Archive session history patched on develop.");
