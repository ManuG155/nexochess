from pathlib import Path

NAV_PATH = Path("client/src/components/layout/NavigationBar/index.tsx")
PUZZLES_PATH = Path("client/src/apps/features/puzzles/pages/Puzzles/index.tsx")
MARKER = "NEXO_PUZZLES_NAV_FLIP"
EVENT = "nexochess:puzzles:flip-board"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"Missing block: {label}")
    return text.replace(old, new, 1)


nav = NAV_PATH.read_text(encoding="utf-8")
puzzles = PUZZLES_PATH.read_text(encoding="utf-8")

if MARKER not in nav:
    nav = replace_once(
        nav,
        'import * as styles from "./NavigationBar.module.css";\n',
        'import * as styles from "./NavigationBar.module.css";\n\n'
        f'const PUZZLES_FLIP_EVENT = "{EVENT}"; // {MARKER}\n',
        "navigation marker"
    )

    nav = replace_once(
        nav,
        '    const showGameActions =\n'
        '        !onSettingsPage\n'
        '        && !onAcademyPage\n'
        '        && !onPuzzlesPage;\n',
        '    const showFlipAction =\n'
        '        onAnalysisPage || onPuzzlesPage;\n\n'
        '    const showShareAction = onAnalysisPage;\n',
        "navigation visibility"
    )

    nav = replace_once(
        nav,
        '    async function signOut() {\n',
        '    function flipVisibleBoard() {\n'
        '        if (onPuzzlesPage) {\n'
        '            window.dispatchEvent(\n'
        '                new Event(PUZZLES_FLIP_EVENT)\n'
        '            );\n'
        '            return;\n'
        '        }\n\n'
        '        setBoardFlipped(!boardFlipped);\n'
        '    }\n\n'
        '    async function signOut() {\n',
        "flip handler"
    )

    nav = replace_once(
        nav,
        '                {showGameActions && (\n'
        '                    <NavigationAction\n'
        '                        icon="flip"\n'
        '                        onClick={() => (\n'
        '                            setBoardFlipped(\n'
        '                                !boardFlipped\n'
        '                            )\n'
        '                        )}\n',
        '                {showFlipAction && (\n'
        '                    <NavigationAction\n'
        '                        icon="flip"\n'
        '                        onClick={flipVisibleBoard}\n',
        "desktop flip"
    )

    nav = replace_once(
        nav,
        '                {showGameActions && (\n'
        '                    <NavigationAction\n'
        '                        icon="share"\n',
        '                {showShareAction && (\n'
        '                    <NavigationAction\n'
        '                        icon="share"\n',
        "desktop share"
    )

    nav = replace_once(
        nav,
        '                {showGameActions && (\n'
        '                    <div className={styles.analysisActions}>\n'
        '                        <NavigationAction\n'
        '                            icon="flip"\n'
        '                            onClick={() => (\n'
        '                                setBoardFlipped(\n'
        '                                    !boardFlipped\n'
        '                                )\n'
        '                            )}\n'
        '                        >\n'
        '                            {t(\n'
        '                                "optionsToolbar.flipBoard",\n'
        '                                { ns: "analysis" }\n'
        '                            )}\n'
        '                        </NavigationAction>\n\n'
        '                        <NavigationAction\n'
        '                            icon="share"\n'
        '                            onClick={() => setShareOpen(true)}\n'
        '                        >\n'
        '                            {t(\n'
        '                                "navigationBar.share",\n'
        '                                { ns: "common" }\n'
        '                            )}\n'
        '                        </NavigationAction>\n'
        '                    </div>\n'
        '                )}\n',
        '                {(showFlipAction || showShareAction) && (\n'
        '                    <div className={styles.analysisActions}>\n'
        '                        {showFlipAction && (\n'
        '                            <NavigationAction\n'
        '                                icon="flip"\n'
        '                                onClick={flipVisibleBoard}\n'
        '                            >\n'
        '                                {t(\n'
        '                                    "optionsToolbar.flipBoard",\n'
        '                                    { ns: "analysis" }\n'
        '                                )}\n'
        '                            </NavigationAction>\n'
        '                        )}\n\n'
        '                        {showShareAction && (\n'
        '                            <NavigationAction\n'
        '                                icon="share"\n'
        '                                onClick={() => setShareOpen(true)}\n'
        '                            >\n'
        '                                {t(\n'
        '                                    "navigationBar.share",\n'
        '                                    { ns: "common" }\n'
        '                                )}\n'
        '                            </NavigationAction>\n'
        '                        )}\n'
        '                    </div>\n'
        '                )}\n',
        "mobile actions"
    )

if MARKER not in puzzles:
    puzzles = replace_once(
        puzzles,
        'const AUTO_NEXT_STORAGE_KEY = "nexochess-puzzle-auto-next-v1";\n',
        'const AUTO_NEXT_STORAGE_KEY = "nexochess-puzzle-auto-next-v1";\n'
        f'const PUZZLES_FLIP_EVENT = "{EVENT}"; // {MARKER}\n',
        "puzzle marker"
    )

    puzzles = replace_once(
        puzzles,
        '    const [ autoNext, setAutoNext ] =\n'
        '        useState(getAutoNextPreference);\n',
        '    const [ autoNext, setAutoNext ] =\n'
        '        useState(getAutoNextPreference);\n'
        '    const [ boardFlipped, setBoardFlipped ] =\n'
        '        useState(false);\n',
        "puzzle flip state"
    )

    puzzles = replace_once(
        puzzles,
        '    useEffect(() => {\n'
        '        profileRef.current = profile;\n'
        '    }, [profile]);\n',
        '    useEffect(() => {\n'
        '        const flipBoard = () => {\n'
        '            setBoardFlipped(flipped => !flipped);\n'
        '        };\n\n'
        '        window.addEventListener(\n'
        '            PUZZLES_FLIP_EVENT,\n'
        '            flipBoard\n'
        '        );\n\n'
        '        return () => {\n'
        '            window.removeEventListener(\n'
        '                PUZZLES_FLIP_EVENT,\n'
        '                flipBoard\n'
        '            );\n'
        '        };\n'
        '    }, []);\n\n'
        '    useEffect(() => {\n'
        '        profileRef.current = profile;\n'
        '    }, [profile]);\n',
        "puzzle flip listener"
    )

    puzzles = replace_once(
        puzzles,
        '    const showRatedProfile = (\n'
        '        puzzle?.source\n'
        '        || source\n'
        '    ) == "lichess";\n',
        '    const showRatedProfile = (\n'
        '        puzzle?.source\n'
        '        || source\n'
        '    ) == "lichess";\n'
        '    const puzzleBoardOrientation = puzzle\n'
        '        ? boardFlipped\n'
        '            ? puzzle.solver == "white"\n'
        '                ? "black"\n'
        '                : "white"\n'
        '            : puzzle.solver\n'
        '        : "white";\n',
        "puzzle orientation"
    )

    puzzles = replace_once(
        puzzles,
        '                            flipped={puzzle.solver == "black"}\n',
        '                            flipped={puzzleBoardOrientation == "black"}\n',
        "evaluation orientation"
    )

    puzzles = replace_once(
        puzzles,
        '                                boardOrientation={puzzle.solver}\n',
        '                                boardOrientation={puzzleBoardOrientation}\n',
        "board orientation"
    )

    puzzles = replace_once(
        puzzles,
        '                                    flipped={puzzle.solver == "black"}\n',
        '                                    flipped={\n'
        '                                        puzzleBoardOrientation == "black"\n'
        '                                    }\n',
        "coordinate orientation"
    )

NAV_PATH.write_text(nav, encoding="utf-8")
PUZZLES_PATH.write_text(puzzles, encoding="utf-8")
