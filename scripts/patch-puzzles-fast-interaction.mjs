import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

const target = "client/src/apps/features/puzzles/pages/Puzzles/index.tsx";
const self = fileURLToPath(import.meta.url);
const selfRelative = "scripts/patch-puzzles-fast-interaction.mjs";

const hintLines = {
    de: "Die Figur, die ziehen soll, ist markiert. Finde selbst das Zielfeld.",
    en: "The piece that should move is highlighted. Find the destination yourself.",
    es: "La pieza que debe moverse está resaltada. Encuentra tú la casilla de destino.",
    fr: "La pièce qui doit jouer est mise en évidence. Trouve toi-même la case d’arrivée.",
    hi: "जिस मोहरे को चलना है उसे हाइलाइट किया गया है। लक्ष्य खाने को खुद खोजो।",
    mr: "ज्या मोहऱ्याने चाल करायची आहे तो ठळक केला आहे. लक्ष्य घर स्वतः शोधा.",
    pl: "Figura, która powinna się ruszyć, jest podświetlona. Sam znajdź pole docelowe.",
    pt: "A peça que deve mover está destacada. Encontra tu a casa de destino.",
    ru: "Фигура, которой нужно сходить, подсвечена. Найди поле назначения сам.",
    vi: "Quân cờ cần di chuyển đã được tô sáng. Hãy tự tìm ô đích.",
    zh: "需要移动的棋子已高亮。请自己找出目标格。"
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
    "premove type",
`interface MoveFeedback {
    square: Square;
    kind: "correct" | "brilliant";
}

interface PuzzleRatingEvent {`,
`interface MoveFeedback {
    square: Square;
    kind: "correct" | "brilliant";
}

interface PuzzlePremove {
    from: Square;
    to: Square;
}

interface PuzzleRatingEvent {`
);

replaceOnce(
    "interaction state",
`    const [solutionIndex, setSolutionIndex] = useState(0);
    const [selectedSquare, setSelectedSquare] = useState<Square>();
    const [wrongMovePreview, setWrongMovePreview] =
`,
`    const [solutionIndex, setSolutionIndex] = useState(0);
    const [selectedSquare, setSelectedSquare] = useState<Square>();
    const [hintedSquare, setHintedSquare] = useState<Square>();
    const [queuedPremove, setQueuedPremove] = useState<PuzzlePremove>();
    const [wrongMovePreview, setWrongMovePreview] =
`
);

replaceOnce(
    "premove execution effect",
`    useEffect(() => {
        if (!puzzle || pageState != "playing") return undefined;

        const updateElapsed = () => {`,
`    useEffect(() => {
        if (
            pendingReply
            || !queuedPremove
            || !puzzle
            || pageState != "playing"
        ) return undefined;

        const premove = queuedPremove;
        const timeoutId = window.setTimeout(() => {
            setQueuedPremove(current => current === premove ? undefined : current);
            setSelectedSquare(undefined);
            playExpectedMove(premove.from, premove.to);
        }, 80);

        return () => window.clearTimeout(timeoutId);
    }, [pendingReply, queuedPremove, puzzle?.id, pageState]);

    useEffect(() => {
        if (!puzzle || pageState != "playing") return undefined;

        const updateElapsed = () => {`
);

replaceOnce(
    "initialise clears interaction state",
`        setSolutionIndex(0);
        setSelectedSquare(undefined);
        setWrongMovePreview(undefined);
        setMoveFeedback(undefined);
        setHintArrow([]);
`,
`        setSolutionIndex(0);
        setSelectedSquare(undefined);
        setHintedSquare(undefined);
        setQueuedPremove(undefined);
        setWrongMovePreview(undefined);
        setMoveFeedback(undefined);
        setHintArrow([]);
`
);

replaceOnce(
    "faster auto next",
`        const autoAdvanceDelay = focusMode
            ? (revealed ? 2400 : 1500)
            : (!revealed && autoNext ? 1500 : undefined);`,
`        const autoAdvanceDelay = focusMode
            ? (revealed ? 450 : 320)
            : (!revealed && autoNext ? 320 : undefined);`
);

replaceOnce(
    "return clears interaction state",
`        setPendingReply(false);
        setWrongMovePreview(undefined);
        setMoveFeedback(undefined);
        setCoachExpression("idle");`,
`        setPendingReply(false);
        setSelectedSquare(undefined);
        setHintedSquare(undefined);
        setQueuedPremove(undefined);
        setWrongMovePreview(undefined);
        setMoveFeedback(undefined);
        setCoachExpression("idle");`
);

replaceOnce(
    "clear hints on attempt",
`        const attemptBoard = new Chess(liveFen.current);
        const legalMove = attemptBoard.moves({`,
`        setHintedSquare(undefined);
        const attemptBoard = new Chess(liveFen.current);
        const legalMove = attemptBoard.moves({`
);

replaceOnce(
    "faster opponent reply",
`        }, 680);

        return true;
    }

    function selectBoardSquare`,
`        }, 220);

        return true;
    }

    function queuePremove(from: Square, to: Square) {
        if (!puzzle || !pendingReply || from == to) return false;

        const board = new Chess(liveFen.current);
        const piece = board.get(from);
        const solverColour = puzzle.solver == "white" ? "w" : "b";

        if (piece?.color != solverColour) return false;

        setQueuedPremove({ from, to });
        setSelectedSquare(undefined);
        setHintedSquare(undefined);
        return false;
    }

    function selectBoardSquare`
);

replaceOnce(
    "square selection premove",
`    function selectBoardSquare(square: Square) {
        if (
            !puzzle
            || pageState != "playing"
            || pendingReply
            || wrongMovePreview
            || historyIndex != boardHistory.length - 1
        ) return;

        if (!selectedSquare) {
            const piece = new Chess(liveFen.current).get(square);
            const expectedColour = puzzle.solver == "white" ? "w" : "b";

            if (piece?.color == expectedColour) setSelectedSquare(square);
            return;
        }

        if (square == selectedSquare) {
            setSelectedSquare(undefined);
            return;
        }

        const board = new Chess(liveFen.current);
        const piece = board.get(square);
        const expectedColour = puzzle.solver == "white" ? "w" : "b";

        if (piece?.color == expectedColour) {
            setSelectedSquare(square);
            return;
        }

        const legalDestination = board.moves({
            square: selectedSquare,
            verbose: true
        }).some(move => move.to == square);

        if (!legalDestination) {
            setSelectedSquare(undefined);
            return;
        }

        if (!playExpectedMove(selectedSquare, square)) {
            setSelectedSquare(undefined);
        }
    }`,
`    function selectBoardSquare(square: Square) {
        if (
            !puzzle
            || pageState != "playing"
            || wrongMovePreview
            || historyIndex != boardHistory.length - 1
        ) return;

        const board = new Chess(liveFen.current);
        const piece = board.get(square);
        const expectedColour = puzzle.solver == "white" ? "w" : "b";

        if (pendingReply) {
            if (!selectedSquare) {
                if (piece?.color == expectedColour) setSelectedSquare(square);
                return;
            }

            if (square == selectedSquare) {
                setSelectedSquare(undefined);
                return;
            }

            if (piece?.color == expectedColour) {
                setSelectedSquare(square);
                return;
            }

            queuePremove(selectedSquare, square);
            return;
        }

        if (!selectedSquare) {
            if (piece?.color == expectedColour) setSelectedSquare(square);
            return;
        }

        if (square == selectedSquare) {
            setSelectedSquare(undefined);
            return;
        }

        if (piece?.color == expectedColour) {
            setSelectedSquare(square);
            return;
        }

        const legalDestination = board.moves({
            square: selectedSquare,
            verbose: true
        }).some(move => move.to == square);

        if (!legalDestination) {
            setSelectedSquare(undefined);
            return;
        }

        if (!playExpectedMove(selectedSquare, square)) {
            setSelectedSquare(undefined);
        }
    }`
);

replaceOnce(
    "piece-only hint",
`        failedAttempt.current = true;
        setHintArrow([[
            expected.slice(0, 2) as Square,
            expected.slice(2, 4) as Square,
            "#78a7ff"
        ]]);
        setCoachExpression("explaining");
        setCoachMessage({
            key: "coach.hint",
            values: { move: getMoveSAN(liveFen.current, expected) }
        });`,
`        failedAttempt.current = true;
        setHintArrow([]);
        setHintedSquare(expected.slice(0, 2) as Square);
        setCoachExpression("explaining");
        setCoachMessage({ key: "coach.hint" });`
);

replaceOnce(
    "reveal clears interaction state",
`        setSolutionIndex(puzzle.solution.length);
        setPendingReply(false);
        setSelectedSquare(undefined);
        setHintArrow([]);
        void finishPuzzle(true);`,
`        setSolutionIndex(puzzle.solution.length);
        setPendingReply(false);
        setSelectedSquare(undefined);
        setHintedSquare(undefined);
        setQueuedPremove(undefined);
        setHintArrow([]);
        void finishPuzzle(true);`
);

replaceOnce(
    "premove square styles",
`        if (moveFeedback) {
            squareStyles[moveFeedback.square] = {
                "--nexo-puzzle-feedback": moveFeedback.kind
            };
        }

        if (selectedSquare) {`,
`        if (moveFeedback) {
            squareStyles[moveFeedback.square] = {
                "--nexo-puzzle-feedback": moveFeedback.kind
            };
        }

        if (queuedPremove) {
            squareStyles[queuedPremove.from] = {
                backgroundImage:
                    "linear-gradient(rgba(242, 132, 132, 0.48), "
                    + "rgba(242, 132, 132, 0.48))",
                boxShadow: "inset 0 0 0 3px rgba(255, 171, 171, 0.78)"
            };
            squareStyles[queuedPremove.to] = {
                backgroundImage:
                    "linear-gradient(rgba(207, 56, 43, 0.66), "
                    + "rgba(207, 56, 43, 0.66))",
                boxShadow: "inset 0 0 0 3px rgba(232, 75, 59, 0.92)"
            };
        }

        if (hintedSquare) {
            squareStyles[hintedSquare] = {
                boxShadow: "inset 0 0 0 5px rgba(120, 167, 255, 0.95)"
            };
        }

        if (selectedSquare) {`
);

replaceOnce(
    "square style dependencies",
`        currentFen,
        moveFeedback,
        pageState,
        pendingReply,
        selectedSquare,`,
`        currentFen,
        hintedSquare,
        moveFeedback,
        pageState,
        pendingReply,
        queuedPremove,
        selectedSquare,`
);

replaceOnce(
    "fast chessboard interaction",
`                                animationDuration={165}
                                arePiecesDraggable={
                                    pageState == "playing"
                                    && !pendingReply
                                    && !wrongMovePreview
                                    && atLivePosition
                                }
                                onPieceDrop={(from, to) => playExpectedMove(from, to)}
                                onSquareClick={selectBoardSquare}
                                areArrowsAllowed={false}`, 
`                                animationDuration={70}
                                arePiecesDraggable={
                                    pageState == "playing"
                                    && !wrongMovePreview
                                    && atLivePosition
                                }
                                isDraggablePiece={({ piece }) => {
                                    const solverColour = puzzle.solver == "white"
                                        ? "w"
                                        : "b";
                                    return piece[0] == solverColour;
                                }}
                                onPieceDragBegin={(_, square) => {
                                    setSelectedSquare(square);
                                }}
                                onPieceDragEnd={() => {
                                    setSelectedSquare(undefined);
                                }}
                                onPieceDrop={(from, to) => pendingReply
                                    ? queuePremove(from, to)
                                    : playExpectedMove(from, to)
                                }
                                onSquareClick={selectBoardSquare}
                                snapToCursor={true}
                                customDropSquareStyle={{
                                    boxShadow:
                                        "inset 0 0 0 3px rgba(120, 167, 255, 0.62)"
                                }}
                                areArrowsAllowed={false}`
);

writeFileSync(target, source, "utf8");

for (const [locale, hintLine] of Object.entries(hintLines)) {
    const path = `client/public/locales/${locale}/puzzles.json`;
    const data = JSON.parse(readFileSync(path, "utf8"));
    if (!data.coach || typeof data.coach != "object") {
        throw new Error(`Missing coach object in ${path}`);
    }
    data.coach.hint = hintLine;
    writeFileSync(path, `${JSON.stringify(data, null, 4)}\n`, "utf8");
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
execFileSync(npm, ["run", "check:translations"], { stdio: "inherit" });
execFileSync(npm, ["run", "check:puzzles"], { stdio: "inherit" });
execFileSync(npm, ["run", "check", "-w", "client"], { stdio: "inherit" });
execFileSync("git", ["diff", "--check"], { stdio: "inherit" });

unlinkSync(self);
execFileSync(
    "git",
    ["add", "-A", "--", target, "client/public/locales", selfRelative],
    { stdio: "inherit" }
);
execFileSync(
    "git",
    ["commit", "-m", "Puzzles: speed up interaction and add premoves"],
    { stdio: "inherit" }
);
execFileSync("git", ["push", "origin", "develop"], { stdio: "inherit" });

console.log("Fast puzzle interaction patched and pushed to develop.");
