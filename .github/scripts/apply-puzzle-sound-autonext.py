import json
from pathlib import Path

INDEX_PATH = Path("client/src/apps/features/puzzles/pages/Puzzles/index.tsx")
CSS_PATH = Path("client/src/apps/features/puzzles/pages/Puzzles/Puzzles.module.css")
SOUNDS_PATH = Path("client/src/lib/boardSounds.ts")
MARKER = "NEXO_PUZZLE_SOUND_AUTONEXT_POLISH"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one match, found {count}")
    return text.replace(old, new, 1)


index = INDEX_PATH.read_text(encoding="utf-8")
css = CSS_PATH.read_text(encoding="utf-8")
sounds = SOUNDS_PATH.read_text(encoding="utf-8")

if MARKER in css:
    print("Puzzle sound/autonext polish already applied.")
    raise SystemExit(0)

sounds = replace_once(
    sounds,
    "function playBoardSound(node: StateTreeNode) {",
    '''function safelyPlaySound(source: string) {
    const audio = new Audio(source);
    void audio.play().catch(() => {
        // Browsers can reject audio before the first user interaction.
    });
}

export function playBoardMoveSound(san: string) {
    const parsedMove = parseSanMove(san);

    if (parsedMove.check || parsedMove.checkmate) {
        safelyPlaySound(moveSounds.check);
    } else if (parsedMove.castling) {
        safelyPlaySound(moveSounds.castle);
    } else if (parsedMove.promotion) {
        safelyPlaySound(moveSounds.promote);
    } else if (parsedMove.capture) {
        safelyPlaySound(moveSounds.capture);
    } else {
        safelyPlaySound(moveSounds.move);
    }
}

function playBoardSound(node: StateTreeNode) {''',
    "board sound helper",
)

index = replace_once(
    index,
    '''import {
    createCustomPieces
} from "@/lib/chessAppearance";
''',
    '''import {
    createCustomPieces
} from "@/lib/chessAppearance";
import { playBoardMoveSound } from "@/lib/boardSounds";
''',
    "board sound import",
)

index = replace_once(
    index,
    '''const difficulties: PuzzleDifficulty[] = [
    "adaptive",
    "beginner",
    "intermediate",
    "advanced",
    "expert"
];

function getMoveSAN''',
    '''const difficulties: PuzzleDifficulty[] = [
    "adaptive",
    "beginner",
    "intermediate",
    "advanced",
    "expert"
];

const AUTO_NEXT_STORAGE_KEY = "nexochess-puzzle-auto-next-v1";

function getAutoNextPreference() {
    if (typeof window == "undefined") return false;

    try {
        return window.localStorage.getItem(AUTO_NEXT_STORAGE_KEY) == "true";
    } catch {
        return false;
    }
}

function getMoveSAN''',
    "auto-next preference helper",
)

index = replace_once(
    index,
    '''    const [ solutionEnabled, setSolutionEnabled ] =
        useState(true);
    const [ archivePuzzles, setArchivePuzzles ] =''',
    '''    const [ solutionEnabled, setSolutionEnabled ] =
        useState(true);
    const [ autoNext, setAutoNext ] =
        useState(getAutoNextPreference);
    const [ archivePuzzles, setArchivePuzzles ] =''',
    "auto-next state",
)

index = replace_once(
    index,
    '''    const moveFeedbackTimer = useRef<number | undefined>(undefined);
    const liveFen = useRef("");''',
    '''    const moveFeedbackTimer = useRef<number | undefined>(undefined);
    const autoNextTimer = useRef<number | undefined>(undefined);
    const liveFen = useRef("");''',
    "auto-next timer ref",
)

index = replace_once(
    index,
    '''    useEffect(() => {
        profileRef.current = profile;
    }, [profile]);

    useEffect(() => {
        let cancelled = false;''',
    '''    useEffect(() => {
        profileRef.current = profile;
    }, [profile]);

    useEffect(() => {
        try {
            window.localStorage.setItem(
                AUTO_NEXT_STORAGE_KEY,
                String(autoNext)
            );
        } catch {
            // The preference remains active for the current tab.
        }

        if (!autoNext) {
            window.clearTimeout(autoNextTimer.current);
        }
    }, [autoNext]);

    useEffect(() => {
        let cancelled = false;''',
    "auto-next persistence effect",
)

index = replace_once(
    index,
    '''            window.clearTimeout(replyTimer.current);
            window.clearTimeout(wrongMoveTimer.current);
            window.clearTimeout(moveFeedbackTimer.current);
        };
    }, []);''',
    '''            window.clearTimeout(replyTimer.current);
            window.clearTimeout(wrongMoveTimer.current);
            window.clearTimeout(moveFeedbackTimer.current);
            window.clearTimeout(autoNextTimer.current);
        };
    }, []);''',
    "unmount timer cleanup",
)

index = replace_once(
    index,
    '''        window.clearTimeout(replyTimer.current);
        window.clearTimeout(wrongMoveTimer.current);
        window.clearTimeout(moveFeedbackTimer.current);

        const history = nextPuzzle.previousFen''',
    '''        window.clearTimeout(replyTimer.current);
        window.clearTimeout(wrongMoveTimer.current);
        window.clearTimeout(moveFeedbackTimer.current);
        window.clearTimeout(autoNextTimer.current);

        const history = nextPuzzle.previousFen''',
    "initialise timer cleanup",
)

index = replace_once(
    index,
    '''    async function startTraining() {
        if (requestingPuzzleRef.current) return;

        requestingPuzzleRef.current = true;''',
    '''    async function startTraining() {
        if (requestingPuzzleRef.current) return;

        window.clearTimeout(autoNextTimer.current);
        requestingPuzzleRef.current = true;''',
    "manual start timer cleanup",
)

index = replace_once(
    index,
    '''        setCoachMessage({
            key: revealed
                ? "coach.solutionShown"
                : solvedWithoutHelp
                    ? "coach.solvedClean"
                    : "coach.solvedAfterHelp"
        });
    }

    async function skipPuzzle()''',
    '''        setCoachMessage({
            key: revealed
                ? "coach.solutionShown"
                : solvedWithoutHelp
                    ? "coach.solvedClean"
                    : "coach.solvedAfterHelp"
        });

        if (!revealed && autoNext) {
            window.clearTimeout(autoNextTimer.current);
            autoNextTimer.current = window.setTimeout(() => {
                void startTraining();
            }, 1500);
        }
    }

    async function skipPuzzle()''',
    "auto-next scheduling",
)

index = replace_once(
    index,
    '''        window.clearTimeout(replyTimer.current);
        window.clearTimeout(wrongMoveTimer.current);
        window.clearTimeout(moveFeedbackTimer.current);
        setPendingReply(false);''',
    '''        window.clearTimeout(replyTimer.current);
        window.clearTimeout(wrongMoveTimer.current);
        window.clearTimeout(moveFeedbackTimer.current);
        window.clearTimeout(autoNextTimer.current);
        setPendingReply(false);''',
    "skip timer cleanup",
)

index = replace_once(
    index,
    '''                attemptBoard.move({
                    from: from as Square,
                    to: to as Square,
                    ...(legalMove.promotion
                        ? { promotion: legalMove.promotion }
                        : {})
                });

                setWrongMovePreview({''',
    '''                const attemptedMove = attemptBoard.move({
                    from: from as Square,
                    to: to as Square,
                    ...(legalMove.promotion
                        ? { promotion: legalMove.promotion }
                        : {})
                });
                playBoardMoveSound(attemptedMove.san);

                setWrongMovePreview({''',
    "wrong move sound",
)

index = replace_once(
    index,
    '''        try {
            board.move(expected);
        } catch {''',
    '''        try {
            const playedMove = board.move(expected);
            playBoardMoveSound(playedMove.san);
        } catch {''',
    "player move sound",
)

index = replace_once(
    index,
    '''            try {
                replyBoard.move(reply);
            } catch {''',
    '''            try {
                const playedReply = replyBoard.move(reply);
                playBoardMoveSound(playedReply.san);
            } catch {''',
    "reply move sound",
)

index = replace_once(
    index,
    '''                    <button
                        type="button"
                        className={styles.nextPuzzle}''',
    '''                    <div className={styles.autoNextControl}>
                        <span className={styles.autoNextCopy}>
                            <strong>{t("actions.autoNext")}</strong>
                            <small>{t("actions.autoNextHelp")}</small>
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={autoNext}
                            className={[
                                styles.autoNextSwitch,
                                autoNext ? styles.autoNextEnabled : ""
                            ].filter(Boolean).join(" ")}
                            onClick={() => setAutoNext(value => !value)}
                        >
                            <i aria-hidden="true" />
                        </button>
                    </div>

                    <button
                        type="button"
                        className={styles.nextPuzzle}''',
    "auto-next control",
)

index = replace_once(
    index,
    '''                            onClick={() => {
                                setPuzzle(undefined);
                                setPageState("setup");''',
    '''                            onClick={() => {
                                window.clearTimeout(autoNextTimer.current);
                                setPuzzle(undefined);
                                setPageState("setup");''',
    "change session timer cleanup",
)

css += '''

/* NEXO_PUZZLE_SOUND_AUTONEXT_POLISH */
.trainingGrid .boardStageWithOutsideCoordinates .evaluationBar {
    margin-right: 30px;
}

.trainingGrid .boardStageWithOutsideCoordinates .boardShell {
    width: calc(100% - 45px);
}

.trainingGrid .outsideRanks {
    right: calc(100% + 7px);
    width: 16px;
}

.trainingGrid .outsideRanks span {
    align-items: center;
    justify-content: center;
    line-height: 1;
    text-align: center;
}

.performancePanel .profileStats > div {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-sizing: border-box;
    min-height: 66px;
    text-align: center;
}

.performancePanel .profileStats span,
.performancePanel .profileStats strong,
.performancePanel .profileStats small {
    width: 100%;
    text-align: center;
}

.performancePanel .profileStats span {
    font-size: 0.71rem;
}

.performancePanel .profileStats strong {
    font-size: 1.12rem;
}

.performancePanel .profileStats small {
    min-height: 1.1em;
    color: rgba(244, 247, 252, 0.5);
    font-size: 0.72rem;
    line-height: 1.2;
    white-space: normal;
}

.autoNextControl {
    grid-area: auto-next;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-sizing: border-box;
    min-width: 0;
    min-height: 54px;
    padding: 9px 12px;
    border: 1px solid rgba(121, 164, 241, 0.13);
    border-radius: 11px;
    background: rgba(7, 10, 15, 0.28);
}

.autoNextCopy {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.autoNextCopy strong {
    color: rgba(244, 247, 252, 0.88);
    font-size: 0.82rem;
    line-height: 1.2;
}

.autoNextCopy small {
    margin-top: 2px;
    color: rgba(244, 247, 252, 0.46);
    font-size: 0.7rem;
    line-height: 1.25;
}

.autoNextSwitch {
    position: relative;
    flex: 0 0 auto;
    box-sizing: border-box;
    width: 48px;
    height: 27px;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.13);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    cursor: pointer;
    transition:
        border-color 0.18s ease,
        background 0.18s ease,
        box-shadow 0.18s ease;
}

.autoNextSwitch i {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 19px;
    height: 19px;
    border-radius: 50%;
    background: rgba(244, 247, 252, 0.78);
    box-shadow: 0 2px 7px rgba(0, 0, 0, 0.3);
    transition:
        transform 0.2s cubic-bezier(0.2, 0.85, 0.25, 1.15),
        background 0.18s ease;
}

.autoNextSwitch:hover {
    border-color: rgba(112, 160, 246, 0.42);
}

.autoNextSwitch:focus-visible {
    outline: 2px solid rgba(112, 160, 246, 0.72);
    outline-offset: 2px;
}

.autoNextEnabled {
    border-color: rgba(94, 148, 246, 0.6);
    background: linear-gradient(180deg, #4f8bea, #3975d4);
    box-shadow: 0 5px 14px rgba(53, 111, 215, 0.2);
}

.autoNextEnabled i {
    background: #ffffff;
    transform: translateX(21px);
}

@media (min-width: 1321px) {
    .trainingGrid .trainingPanel {
        grid-template-areas:
            "coach coach"
            "objective actions"
            "objective auto-next"
            "objective next"
            "performance performance"
            "secondary secondary";
    }
}

@media (max-width: 1320px) and (min-width: 1101px) {
    .trainingGrid .trainingPanel {
        grid-template-areas:
            "coach"
            "objective"
            "actions"
            "auto-next"
            "next"
            "performance"
            "secondary";
    }
}

@media (max-width: 1100px) {
    .trainingGrid .trainingPanel {
        grid-template-areas:
            "coach"
            "objective"
            "actions"
            "auto-next"
            "next"
            "performance"
            "secondary";
    }
}

@media (max-width: 620px) {
    .trainingGrid .boardStageWithOutsideCoordinates .evaluationBar {
        margin-right: 25px;
    }

    .trainingGrid .boardStageWithOutsideCoordinates .boardShell {
        width: calc(100% - 40px);
    }

    .trainingGrid .outsideRanks {
        right: calc(100% + 5px);
        width: 14px;
    }

    .autoNextControl {
        min-height: 52px;
    }
}
'''

translations = {
    "de": ("Automatisch weiter", "Nach dem Lösen zum nächsten Puzzle"),
    "en": ("Auto-next", "Open the next puzzle after solving"),
    "es": ("Siguiente automático", "Pasa al siguiente al resolverlo"),
    "fr": ("Passage automatique", "Passe au puzzle suivant après résolution"),
    "hi": ("अगली पहेली अपने आप", "हल होते ही अगली पहेली खोलें"),
    "mr": ("पुढचे कोडे आपोआप", "सोडवल्यावर पुढचे कोडे उघडा"),
    "pl": ("Automatycznie dalej", "Po rozwiązaniu przejdź do następnego"),
    "pt": ("Avanço automático", "Passa ao puzzle seguinte ao resolver"),
    "ru": ("Автопереход", "Открывать следующую задачу после решения"),
    "vi": ("Tự động chuyển", "Mở bài tiếp theo sau khi giải xong"),
    "zh": ("自动下一题", "解出后自动进入下一题"),
}

for language, (title, help_text) in translations.items():
    path = Path(f"client/public/locales/{language}/puzzles.json")
    data = json.loads(path.read_text(encoding="utf-8"))
    data["actions"]["autoNext"] = title
    data["actions"]["autoNextHelp"] = help_text
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=4) + "\n",
        encoding="utf-8",
    )

INDEX_PATH.write_text(index, encoding="utf-8")
CSS_PATH.write_text(css, encoding="utf-8")
SOUNDS_PATH.write_text(sounds, encoding="utf-8")
print("Applied puzzle sounds, auto-next and alignment polish.")
