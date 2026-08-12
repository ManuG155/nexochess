import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

const target = "client/src/apps/features/puzzles/pages/Puzzles/index.tsx";
const self = fileURLToPath(import.meta.url);
const selfRelative = "scripts/patch-puzzles-focus-mode.mjs";

const localeLabels = {
    de: ["Ablenkungsfreier Modus", "Ablenkungsfreien Modus beenden"],
    en: ["Distraction-free mode", "Exit distraction-free mode"],
    es: ["Modo sin distracciones", "Salir del modo sin distracciones"],
    fr: ["Mode sans distraction", "Quitter le mode sans distraction"],
    hi: ["ध्यान भंग-मुक्त मोड", "ध्यान भंग-मुक्त मोड से बाहर निकलें"],
    mr: ["व्यत्ययरहित मोड", "व्यत्ययरहित मोडमधून बाहेर पडा"],
    pl: ["Tryb bez rozpraszania", "Wyjdź z trybu bez rozpraszania"],
    pt: ["Modo sem distrações", "Sair do modo sem distrações"],
    ru: ["Режим без отвлечений", "Выйти из режима без отвлечений"],
    vi: ["Chế độ không xao nhãng", "Thoát chế độ không xao nhãng"],
    zh: ["无干扰模式", "退出无干扰模式"]
};

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
    "focus labels",
`    const flipBoardLabel = t("optionsToolbar.flipBoard", {
        ns: "analysis"
    });

    const [pageState, setPageState] = useState<PageState>("loading");
`,
`    const flipBoardLabel = t("optionsToolbar.flipBoard", {
        ns: "analysis"
    });
    const focusModeLabel = t("actions.focusMode");
    const exitFocusModeLabel = t("actions.exitFocusMode");

    const [pageState, setPageState] = useState<PageState>("loading");
`
);

replaceOnce(
    "focus state",
`    const [evaluationVisible, setEvaluationVisible] = useState(true);
    const [boardFlipped, setBoardFlipped] = useState(false);
`,
`    const [evaluationVisible, setEvaluationVisible] = useState(true);
    const [boardFlipped, setBoardFlipped] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
`
);

replaceOnce(
    "focus lifecycle",
`    useEffect(() => {
        try {
            window.localStorage.setItem(
                AUTO_NEXT_STORAGE_KEY,
                String(autoNext)
            );
        } catch {
            // The preference remains active for the current tab.
        }

        if (!autoNext) window.clearTimeout(autoNextTimer.current);
    }, [autoNext]);

    useEffect(() => {
        if (!puzzle || pageState != "playing") return undefined;
`,
`    useEffect(() => {
        try {
            window.localStorage.setItem(
                AUTO_NEXT_STORAGE_KEY,
                String(autoNext)
            );
        } catch {
            // The preference remains active for the current tab.
        }

        if (!autoNext) window.clearTimeout(autoNextTimer.current);
    }, [autoNext]);

    useEffect(() => {
        if (!focusMode) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        setCoachPickerOpen(false);

        const leaveOnEscape = (event: KeyboardEvent) => {
            if (event.key == "Escape") setFocusMode(false);
        };

        window.addEventListener("keydown", leaveOnEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", leaveOnEscape);
        };
    }, [focusMode]);

    useEffect(() => {
        if (!puzzle || pageState != "playing") return undefined;
`
);

replaceOnce(
    "disable evaluation in focus",
`        if (!puzzle || !currentFen || !evaluationVisible) return;
`,
`        if (!puzzle || !currentFen || !evaluationVisible || focusMode) return;
`
);

replaceOnce(
    "evaluation dependencies",
`    }, [currentFen, evaluationVisible, puzzle?.id]);
`,
`    }, [currentFen, evaluationVisible, focusMode, puzzle?.id]);
`
);

replaceOnce(
    "focus auto advance",
`        if (!revealed && autoNext) {
            window.clearTimeout(autoNextTimer.current);
            autoNextTimer.current = window.setTimeout(() => {
                void startTraining();
            }, 1500);
        }
`,
`        const autoAdvanceDelay = focusMode
            ? (revealed ? 2400 : 1500)
            : (!revealed && autoNext ? 1500 : undefined);

        if (autoAdvanceDelay != undefined) {
            window.clearTimeout(autoNextTimer.current);
            autoNextTimer.current = window.setTimeout(() => {
                void startTraining();
            }, autoAdvanceDelay);
        }
`
);

replaceOnce(
    "leave focus on setup",
`        setPuzzle(undefined);
        puzzleStartedAtRef.current = 0;
`,
`        setPuzzle(undefined);
        setFocusMode(false);
        puzzleStartedAtRef.current = 0;
`
);

replaceOnce(
    "focus shell class",
`            <section className={[
                styles.trainingGrid,
                "nexo-puzzle-training-shell"
            ].join(" ")}>
`,
`            <section className={[
                styles.trainingGrid,
                "nexo-puzzle-training-shell",
                focusMode ? "nexo-puzzle-focus-mode" : ""
            ].filter(Boolean).join(" ")}>
`
);

replaceOnce(
    "evaluation hidden class",
`                            evaluationVisible ? "" : "nexo-eval-hidden"
`,
`                            evaluationVisible && !focusMode
                                ? ""
                                : "nexo-eval-hidden"
`
);

replaceOnce(
    "focus toolbar button",
`                            </button>
                        </div>

                        {evaluationVisible && (
`,
`                            </button>

                            <button
                                type="button"
                                className={[
                                    "nexo-puzzle-tool-button",
                                    "nexo-puzzle-tool-focus"
                                ].join(" ")}
                                onClick={() => setFocusMode(value => !value)}
                                title={focusMode
                                    ? exitFocusModeLabel
                                    : focusModeLabel
                                }
                                aria-label={focusMode
                                    ? exitFocusModeLabel
                                    : focusModeLabel
                                }
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    width="20"
                                    height="20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                >
                                    {focusMode ? (
                                        <>
                                            <path d="M4 4l6 6" />
                                            <path d="M6 10h4V6" />
                                            <path d="M20 4l-6 6" />
                                            <path d="M14 6v4h4" />
                                            <path d="M4 20l6-6" />
                                            <path d="M6 14h4v4" />
                                            <path d="M20 20l-6-6" />
                                            <path d="M14 18v-4h4" />
                                        </>
                                    ) : (
                                        <>
                                            <path d="M10 10 4 4" />
                                            <path d="M4 9V4h5" />
                                            <path d="m14 10 6-6" />
                                            <path d="M15 4h5v5" />
                                            <path d="m10 14-6 6" />
                                            <path d="M4 15v5h5" />
                                            <path d="m14 14 6 6" />
                                            <path d="M15 20h5v-5" />
                                        </>
                                    )}
                                </svg>
                            </button>
                        </div>

                        {evaluationVisible && !focusMode && (
`
);

writeFileSync(target, source, "utf8");

for (const [locale, [focusMode, exitFocusMode]] of Object.entries(localeLabels)) {
    const path = `client/public/locales/${locale}/puzzles.json`;
    const data = JSON.parse(readFileSync(path, "utf8"));

    if (!data.actions || typeof data.actions != "object") {
        throw new Error(`Missing actions object in ${path}`);
    }

    data.actions.focusMode = focusMode;
    data.actions.exitFocusMode = exitFocusMode;
    writeFileSync(path, `${JSON.stringify(data, null, 4)}\n`, "utf8");
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
execFileSync(npm, ["run", "check:translations"], { stdio: "inherit" });
execFileSync(npm, ["run", "check", "-w", "client"], { stdio: "inherit" });
execFileSync("git", ["diff", "--check"], { stdio: "inherit" });

unlinkSync(self);

execFileSync("git", ["add", "-A", "--", target, "client/public/locales", selfRelative], {
    stdio: "inherit"
});
execFileSync(
    "git",
    ["commit", "-m", "Puzzles: add distraction-free training mode"],
    { stdio: "inherit" }
);
execFileSync("git", ["push", "origin", "develop"], { stdio: "inherit" });

console.log("Distraction-free mode patched and pushed to develop.");
