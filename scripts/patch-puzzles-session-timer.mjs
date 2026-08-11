import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

const target = "client/src/apps/features/puzzles/pages/Puzzles/index.tsx";
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
    "timer state",
    "    const [coachPickerOpen, setCoachPickerOpen] = useState(false);\n",
    "    const [coachPickerOpen, setCoachPickerOpen] = useState(false);\n"
    + "    const [puzzleElapsedSeconds, setPuzzleElapsedSeconds] = useState(0);\n"
);

replaceOnce(
    "timer ref",
    "    const requestingPuzzleRef = useRef(false);\n",
    "    const requestingPuzzleRef = useRef(false);\n"
    + "    const puzzleStartedAtRef = useRef(0);\n"
);

replaceOnce(
    "timer effect",
    "    }, [autoNext]);\n\n    useEffect(() => {\n        let cancelled = false;\n",
    "    }, [autoNext]);\n\n"
    + "    useEffect(() => {\n"
    + "        if (!puzzle || pageState != \"playing\") return undefined;\n\n"
    + "        const updateElapsed = () => {\n"
    + "            const elapsed = Math.max(\n"
    + "                0,\n"
    + "                Math.floor((Date.now() - puzzleStartedAtRef.current) / 1000)\n"
    + "            );\n"
    + "            setPuzzleElapsedSeconds(elapsed);\n"
    + "        };\n\n"
    + "        updateElapsed();\n"
    + "        const intervalId = window.setInterval(updateElapsed, 1000);\n\n"
    + "        return () => window.clearInterval(intervalId);\n"
    + "    }, [puzzle?.id, pageState]);\n\n"
    + "    useEffect(() => {\n"
    + "        let cancelled = false;\n"
);

replaceOnce(
    "timer reset on puzzle",
    "        window.clearTimeout(autoNextTimer.current);\n\n        const history = nextPuzzle.previousFen\n",
    "        window.clearTimeout(autoNextTimer.current);\n\n"
    + "        puzzleStartedAtRef.current = Date.now();\n"
    + "        setPuzzleElapsedSeconds(0);\n\n"
    + "        const history = nextPuzzle.previousFen\n"
);

replaceOnce(
    "timer reset on setup",
    "        setPuzzle(undefined);\n        setPageState(\"setup\");\n",
    "        setPuzzle(undefined);\n"
    + "        puzzleStartedAtRef.current = 0;\n"
    + "        setPuzzleElapsedSeconds(0);\n"
    + "        setPageState(\"setup\");\n"
);

replaceOnce(
    "unified session controls",
`                    <button
                        type="button"
                        className="nexo-puzzle-back-link"
                        onClick={returnToSetup}
                    >
                        <span aria-hidden="true">‹</span>
                        {t("actions.changeFilters")}
                    </button>

                    <div className="nexo-puzzle-left-control">
                        <div className="nexo-puzzle-control-row">
                            <strong>{t("puzzle.evaluation")}</strong>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={evaluationVisible}
                                aria-label={t("puzzle.evaluation")}
                                className="nexo-puzzle-switch"
                                onClick={() => setEvaluationVisible(value => !value)}
                            />
                        </div>
                    </div>

                    <div className="nexo-puzzle-left-control">
                        <div className="nexo-puzzle-control-row">
                            <strong>{t("actions.autoNext")}</strong>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={autoNext}
                                aria-label={t("actions.autoNext")}
                                className="nexo-puzzle-switch"
                                onClick={() => setAutoNext(value => !value)}
                            />
                        </div>
                    </div>
`,
`                    <div className="nexo-puzzle-session-card">
                        <button
                            type="button"
                            className="nexo-puzzle-back-link"
                            onClick={returnToSetup}
                        >
                            <span aria-hidden="true">‹</span>
                            {t("actions.changeFilters")}
                        </button>

                        <div className={[
                            "nexo-puzzle-left-control",
                            "nexo-puzzle-auto-next-control"
                        ].join(" ")}>
                            <div className="nexo-puzzle-control-row">
                                <strong>{t("actions.autoNext")}</strong>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={autoNext}
                                    aria-label={t("actions.autoNext")}
                                    className="nexo-puzzle-switch"
                                    onClick={() => setAutoNext(value => !value)}
                                />
                            </div>
                        </div>
                    </div>
`
);

replaceOnce(
    "puzzle timer markup",
`                    )}

                    {showRatedProfile && (
                        <div className="nexo-puzzle-left-history">
`,
`                    )}

                    <div
                        className="nexo-puzzle-timer"
                        role="timer"
                        aria-live="off"
                    >
                        <span aria-hidden="true">
                            <svg
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="13" r="8" />
                                <path d="M12 9v4l2.5 1.5" />
                                <path d="M9 3h6" />
                            </svg>
                        </span>
                        <strong>
                            {String(Math.floor(puzzleElapsedSeconds / 60))
                                .padStart(2, "0")}
                            :
                            {String(puzzleElapsedSeconds % 60)
                                .padStart(2, "0")}
                        </strong>
                    </div>

                    {showRatedProfile && (
                        <div className="nexo-puzzle-left-history">
`
);

writeFileSync(target, source, "utf8");

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
execFileSync(npm, ["run", "check", "-w", "client"], { stdio: "inherit" });
execFileSync("git", ["diff", "--check"], { stdio: "inherit" });

const self = fileURLToPath(import.meta.url);
unlinkSync(self);

execFileSync("git", ["add", "-A"], { stdio: "inherit" });
execFileSync(
    "git",
    ["commit", "-m", "Puzzles: unify session controls and add puzzle timer"],
    { stdio: "inherit" }
);
execFileSync("git", ["push", "origin", "develop"], { stdio: "inherit" });

console.log("Puzzles session controls and timer patched on develop.");
