import fs from "node:fs";
import { spawnSync } from "node:child_process";

const target = "client/src/apps/features/puzzles/pages/Puzzles/index.tsx";
const script = "scripts/puzzle-workspace-quickfilters.mjs";

const branch = spawnSync("git", ["branch", "--show-current"], {
    encoding: "utf8"
}).stdout.trim();

if (branch !== "develop") {
    console.error(`Expected develop, found ${branch || "unknown"}.`);
    process.exit(1);
}

let source = fs.readFileSync(target, "utf8");

if (source.includes('className="nexo-puzzle-left-rail"')) {
    console.error("Quick filters are already present; no changes applied.");
    process.exit(1);
}

const boardMarker = `                </header>\n\n                <div className={styles.boardColumn}>`;

const leftRail = `                </header>\n\n                <aside className="nexo-puzzle-left-rail">\n                    {showRatedProfile && (\n                        <div className="nexo-puzzle-left-performance">\n                            {profileStats}\n                            {sessionRatingTrail}\n                        </div>\n                    )}\n\n                    <div className="nexo-puzzle-quick-filters">\n                        <strong>{t("setup.kicker")}</strong>\n\n                        <label>\n                            <span>{t("setup.title")}</span>\n                            <select\n                                value={source}\n                                onChange={event => (\n                                    setSource(event.target.value as PuzzleSource)\n                                )}\n                            >\n                                <option value="archive">\n                                    {t("sources.archive.title")}\n                                </option>\n                                <option value="lichess">\n                                    {pageCopy.trainingTitle}\n                                </option>\n                            </select>\n                        </label>\n\n                        {source == "lichess" && (\n                            <>\n                                <label>\n                                    <span>{t("filters.theme")}</span>\n                                    <select\n                                        value={themeSelection.category}\n                                        onChange={event => {\n                                            setThemeSelection({\n                                                category: event.target.value as\n                                                    PuzzleThemeSelection["category"]\n                                            });\n                                            setOpeningSearch("");\n                                        }}\n                                    >\n                                        {puzzleThemeCategories.map(value => (\n                                            <option key={value} value={value}>\n                                                {t(\n                                                    \`themeCategories.\${value}\`\n                                                )}\n                                            </option>\n                                        ))}\n                                    </select>\n                                </label>\n\n                                {filterOptions.length > 0 && (\n                                    <label>\n                                        <span>\n                                            {t("filters.subtheme", {\n                                                theme: t(\n                                                    "themeCategories."\n                                                    + themeSelection.category\n                                                )\n                                            })}\n                                        </span>\n                                        <select\n                                            value={\n                                                themeSelection.kind\n                                                && themeSelection.value\n                                                    ? themeSelection.kind\n                                                        + ":::"\n                                                        + themeSelection.value\n                                                    : ""\n                                            }\n                                            onChange={event => {\n                                                const encoded =\n                                                    event.target.value;\n\n                                                if (!encoded) {\n                                                    setThemeSelection({\n                                                        category:\n                                                            themeSelection\n                                                                .category\n                                                    });\n                                                    return;\n                                                }\n\n                                                const [kind, ...parts] =\n                                                    encoded.split(":::");\n\n                                                setThemeSelection({\n                                                    category:\n                                                        themeSelection.category,\n                                                    kind: kind as NonNullable<\n                                                        PuzzleThemeSelection[\n                                                            "kind"\n                                                        ]\n                                                    >,\n                                                    value: parts.join(":::")\n                                                });\n                                            }}\n                                        >\n                                            <option value="">\n                                                {t("filters.clearSubtheme")}\n                                            </option>\n                                            {filterOptions.map(option => (\n                                                <option\n                                                    key={\n                                                        option.kind + ":"\n                                                        + option.value\n                                                    }\n                                                    value={\n                                                        option.kind + ":::"\n                                                        + option.value\n                                                    }\n                                                >\n                                                    {option.kind == "opening"\n                                                        ? formatOpeningTag(\n                                                            option.value,\n                                                            i18n.resolvedLanguage\n                                                                || "en"\n                                                        )\n                                                        : formatPuzzleTheme(\n                                                            option.value,\n                                                            i18n.resolvedLanguage\n                                                                || "en"\n                                                        )\n                                                    }\n                                                </option>\n                                            ))}\n                                        </select>\n                                    </label>\n                                )}\n\n                                <label>\n                                    <span>{t("filters.difficulty")}</span>\n                                    <select\n                                        value={difficulty}\n                                        onChange={event => (\n                                            setDifficulty(\n                                                event.target.value as\n                                                    PuzzleDifficulty\n                                            )\n                                        )}\n                                    >\n                                        {difficulties.map(value => (\n                                            <option key={value} value={value}>\n                                                {t(\n                                                    \`difficulties.\${value}.title\`\n                                                )}\n                                                {" · "}\n                                                {t(\n                                                    \`difficulties.\${value}.range\`\n                                                )}\n                                            </option>\n                                        ))}\n                                    </select>\n                                </label>\n                            </>\n                        )}\n                    </div>\n                </aside>\n\n                <div className={styles.boardColumn}>`;

if (!source.includes(boardMarker)) {
    console.error("Board insertion marker not found; source left untouched.");
    process.exit(1);
}

source = source.replace(boardMarker, leftRail);

const oldPerformance = `                    {showRatedProfile && (\n                        <div className={styles.performancePanel}>\n                            {profileStats}\n                            {sessionRatingTrail}\n                        </div>\n                    )}\n\n`;

if (!source.includes(oldPerformance)) {
    console.error("Performance block marker not found; source left untouched.");
    process.exit(1);
}

source = source.replace(oldPerformance, "");
fs.writeFileSync(target, source);

const diffCheck = spawnSync("git", ["diff", "--check"], {
    stdio: "inherit"
});

if (diffCheck.status !== 0) {
    console.error("git diff --check failed; not committing.");
    process.exit(diffCheck.status || 1);
}

fs.unlinkSync(script);

for (const args of [
    ["add", "-A"],
    ["commit", "-m", "Puzzles: añade filtros rápidos al workspace"],
    ["push", "origin", "develop"]
]) {
    const result = spawnSync("git", args, { stdio: "inherit" });
    if (result.status !== 0) process.exit(result.status || 1);
}

console.log("Quick filters applied and pushed to develop.");
