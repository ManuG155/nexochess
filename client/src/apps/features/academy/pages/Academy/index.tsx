import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Classification } from "shared/constants/Classification";
import PieceColour from "shared/constants/PieceColour";

import {
    classificationColours,
    classificationImages
} from "@analysis/constants/classifications";
import EvaluationBar from
    "@analysis/components/EvaluationBar";

import useSettingsStore from "@/stores/SettingsStore";

import {
    PieceAsset,
    PieceCode
} from "@/lib/chessAppearance";

import * as styles from "./Academy.module.css";

type ModuleId =
    | "notation"
    | "movement"
    | "values"
    | "practice"
    | "classifications"
    | "evaluation"
    | "challenge";

type PieceId = "K" | "Q" | "R" | "B" | "N" | "P";

interface Square {
    file: number;
    rank: number;
    name: string;
}

const moduleOrder: ModuleId[] = [
    "notation",
    "movement",
    "values",
    "practice",
    "classifications",
    "evaluation",
    "challenge"
];

const pieces: PieceId[] = ["K", "Q", "R", "B", "N", "P"];

const pieceValues: Array<{
    piece: PieceId;
    value: string;
}> = [
    { piece: "P", value: "1" },
    { piece: "N", value: "3" },
    { piece: "B", value: "3" },
    { piece: "R", value: "5" },
    { piece: "Q", value: "9" },
    { piece: "K", value: "∞" }
];

const evaluationPresets = [
    { id: "blackWinning", value: -600 },
    { id: "blackBetter", value: -200 },
    { id: "equal", value: 0 },
    { id: "whiteBetter", value: 200 },
    { id: "whiteWinning", value: 600 }
] as const;

type EvaluationPresetId =
    typeof evaluationPresets[number]["id"];

const whitePieceCodes: Record<PieceId, PieceCode> = {
    K: "wK",
    Q: "wQ",
    R: "wR",
    B: "wB",
    N: "wN",
    P: "wP"
};

const notationExamples = [
    "e4",
    "Nf3",
    "Bxf7+",
    "O-O",
    "Rae1",
    "e8=Q#"
] as const;

const classifications: Classification[] = [
    Classification.BRILLIANT,
    Classification.CRITICAL,
    Classification.BEST,
    Classification.EXCELLENT,
    Classification.OKAY,
    Classification.INACCURACY,
    Classification.MISTAKE,
    Classification.MISS,
    Classification.BLUNDER,
    Classification.FORCED,
    Classification.THEORY,
    Classification.RISKY
];

const boardSquares: Square[] = Array.from(
    { length: 64 },
    (_, index) => {
        const file = index % 8;
        const rank = 7 - Math.floor(index / 8);

        return {
            file,
            rank,
            name: `${String.fromCharCode(97 + file)}${rank + 1}`
        };
    }
);

const challengeQuestions = [
    {
        notation: "Bxf7+",
        answer: "captureCheck"
    },
    {
        notation: "O-O-O",
        answer: "longCastle"
    },
    {
        notation: "e8=Q#",
        answer: "promotionMate"
    }
] as const;

interface PracticePiece {
    piece: PieceCode;
    square: string;
}

interface PracticeExercise {
    id: "knight" | "rook" | "bishop";
    from: string;
    to: string;
    notation: string;
    pieces: PracticePiece[];
}

const practiceExercises: PracticeExercise[] = [
    {
        id: "knight",
        from: "f3",
        to: "e5",
        notation: "Ne5",
        pieces: [
            { piece: "wK", square: "g1" },
            { piece: "wN", square: "f3" },
            { piece: "bK", square: "g8" }
        ]
    },
    {
        id: "rook",
        from: "a1",
        to: "a8",
        notation: "Rxa8+",
        pieces: [
            { piece: "wK", square: "g1" },
            { piece: "wR", square: "a1" },
            { piece: "bR", square: "a8" },
            { piece: "bK", square: "g8" }
        ]
    },
    {
        id: "bishop",
        from: "c4",
        to: "b5",
        notation: "Bb5+",
        pieces: [
            { piece: "wK", square: "g1" },
            { piece: "wB", square: "c4" },
            { piece: "bK", square: "e8" }
        ]
    }
];

function getMovementSquares(piece: PieceId) {
    const origin = { file: 3, rank: 3 };

    return boardSquares.filter(square => {
        const fileDistance = Math.abs(square.file - origin.file);
        const rankDistance = Math.abs(square.rank - origin.rank);

        switch (piece) {
            case "K":
                return Math.max(fileDistance, rankDistance) == 1;
            case "Q":
                return (
                    fileDistance == 0
                    || rankDistance == 0
                    || fileDistance == rankDistance
                ) && (fileDistance + rankDistance > 0);
            case "R":
                return (
                    fileDistance == 0
                    || rankDistance == 0
                ) && (fileDistance + rankDistance > 0);
            case "B":
                return fileDistance == rankDistance && fileDistance > 0;
            case "N":
                return (
                    fileDistance == 1
                    && rankDistance == 2
                ) || (
                    fileDistance == 2
                    && rankDistance == 1
                );
            case "P":
                return (
                    square.rank == origin.rank + 1
                    && fileDistance <= 1
                );
        }
    }).map(square => square.name);
}

function ModuleIcon({ module }: { module: ModuleId }) {
    const paths: Record<ModuleId, React.ReactNode> = {
        notation: <>
            <path d="M6 4h9l3 3v13H6z" />
            <path d="M15 4v4h4M9 12h6M9 16h4" />
        </>,
        movement: <>
            <path d="M7 17.5c1.5-2.8 1.8-5.7 1-9L12 4l5 4.5-2.2 3.2 2.7 5.8z" />
            <path d="M6 20h12" />
        </>,
        values: <>
            <circle cx="12" cy="12" r="8" />
            <path d="M9 9.5h4.2a2 2 0 0 1 0 4H9M12 7v10" />
        </>,
        practice: <>
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M12 4v16M4 12h16" />
            <path d="m7 16 2-2 2 2M17 8l-2 2-2-2" />
        </>,
        classifications: <>
            <path d="M5 5h14v14H5z" />
            <path d="M8 15.5 11 12l2.2 2.2L17 9" />
        </>,
        evaluation: <>
            <rect x="7" y="3" width="10" height="18" rx="2" />
            <path d="M7 11h10M10 7h4M10 16h4" />
        </>,
        challenge: <>
            <path d="M8 4h8v3H8zM6 6h12v14H6z" />
            <path d="m9 13 2 2 4-5" />
        </>
    };

    return <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        aria-hidden="true"
    >
        {paths[module]}
    </svg>;
}

function Academy() {
    const { t } = useTranslation(["academy", "analysis"]);

    const [ activeModule, setActiveModule ] =
        useState<ModuleId>("notation");

    const [ visitedModules, setVisitedModules ] =
        useState<Set<ModuleId>>(new Set(["notation"]));

    const [ selectedExample, setSelectedExample ] =
        useState<typeof notationExamples[number]>("Bxf7+");

    const [ selectedPiece, setSelectedPiece ] =
        useState<PieceId>("N");

    const [ selectedClassification, setSelectedClassification ] =
        useState<Classification>(Classification.BRILLIANT);

    const [ selectedEvaluation, setSelectedEvaluation ] =
        useState<EvaluationPresetId>("whiteBetter");

    const [ answers, setAnswers ] =
        useState<Record<number, string>>({});

    const [ practiceIndex, setPracticeIndex ] =
        useState(0);

    const [ practiceSelection, setPracticeSelection ] =
        useState<string | null>(null);

    const [ practiceFeedback, setPracticeFeedback ] =
        useState<"idle" | "wrong" | "correct">("idle");

    const boardTheme = useSettingsStore(
        state => state.settings.themes.board
    );

    const pieceTheme = useSettingsStore(
        state => state.settings.themes.piece
    );

    const movementSquares = useMemo(
        () => getMovementSquares(selectedPiece),
        [selectedPiece]
    );

    const practiceExercise = practiceExercises[practiceIndex];
    const evaluationPreset = evaluationPresets.find(
        preset => preset.id == selectedEvaluation
    )!;

    const score = challengeQuestions.filter(
        (question, index) => answers[index] == question.answer
    ).length;

    const answeredQuestions = Object.keys(answers).length;

    function openModule(module: ModuleId) {
        setActiveModule(module);
        setVisitedModules(previous => new Set(previous).add(module));
    }

    function moveModule(direction: -1 | 1) {
        const currentIndex = moduleOrder.indexOf(activeModule);
        const nextIndex = Math.min(
            moduleOrder.length - 1,
            Math.max(0, currentIndex + direction)
        );

        openModule(moduleOrder[nextIndex]);
    }

    function resetPractice() {
        setPracticeSelection(null);
        setPracticeFeedback("idle");
    }

    function selectPractice(index: number) {
        setPracticeIndex(index);
        setPracticeSelection(null);
        setPracticeFeedback("idle");
    }

    function playPracticeSquare(square: string) {
        if (practiceFeedback == "correct") return;

        if (practiceFeedback == "wrong") {
            setPracticeFeedback("idle");
            setPracticeSelection(
                square == practiceExercise.from ? square : null
            );
            return;
        }

        if (practiceSelection == null) {
            if (square == practiceExercise.from) {
                setPracticeSelection(square);
            } else {
                setPracticeFeedback("wrong");
            }

            return;
        }

        if (square == practiceExercise.to) {
            setPracticeFeedback("correct");
            setPracticeSelection(null);
        } else if (square == practiceExercise.from) {
            setPracticeSelection(null);
        } else {
            setPracticeFeedback("wrong");
        }
    }

    function getPracticePiece(square: string) {
        if (
            practiceFeedback == "correct"
            && square == practiceExercise.from
        ) {
            return undefined;
        }

        if (
            practiceFeedback == "correct"
            && square == practiceExercise.to
        ) {
            return practiceExercise.pieces.find(
                piece => piece.square == practiceExercise.from
            )?.piece;
        }

        return practiceExercise.pieces.find(
            piece => piece.square == square
        )?.piece;
    }

    const currentModuleIndex = moduleOrder.indexOf(activeModule);

    const boardStyle = {
        "--academy-board-light": boardTheme.lightSquareColour,
        "--academy-board-dark": boardTheme.darkSquareColour
    } as React.CSSProperties;

    return <main className={styles.page}>
        <section className={styles.hero}>
            <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>{t("hero.eyebrow")}</span>
                <h1>{t("hero.title")}</h1>
                <p>{t("hero.subtitle")}</p>

                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => openModule("notation")}
                >
                    {t("hero.start")}
                    <span aria-hidden="true">→</span>
                </button>
            </div>

            <div
                className={styles.heroBoard}
                style={boardStyle}
                aria-hidden="true"
            >
                <span className={styles.heroKnight}>
                    <PieceAsset
                        theme={pieceTheme}
                        piece="wN"
                        size="100%"
                    />
                </span>
                <span className={styles.heroMove}>Nf3</span>
                <span className={styles.heroLine}/>
                <span className={styles.heroBadge}>!</span>
            </div>
        </section>

        <section className={styles.course}>
            <nav
                className={styles.moduleNavigation}
                aria-label={t("hero.progress")}
            >
                {moduleOrder.map((module, index) => (
                    <button
                        type="button"
                        key={module}
                        className={[
                            styles.moduleButton,
                            activeModule == module ? styles.moduleActive : "",
                            visitedModules.has(module) ? styles.moduleVisited : ""
                        ].join(" ")}
                        onClick={() => openModule(module)}
                    >
                        <span className={styles.moduleNumber}>
                            {visitedModules.has(module) && activeModule != module
                                ? "✓"
                                : index + 1
                            }
                        </span>

                        <span className={styles.moduleIcon}>
                            <ModuleIcon module={module}/>
                        </span>

                        <span>{t(`modules.${module}`)}</span>
                    </button>
                ))}
            </nav>

            <div className={styles.lesson}>
                {activeModule == "notation" && (
                    <section>
                        <LessonHeading
                            kicker={t("notation.kicker")}
                            title={t("notation.title")}
                            intro={t("notation.intro")}
                        />

                        <div className={styles.twoColumns}>
                            <article className={styles.lessonCard}>
                                <h3>{t("notation.piecesTitle")}</h3>
                                <p>{t("notation.piecesHelp")}</p>

                                <div className={styles.pieceGrid}>
                                    {pieces.map(piece => (
                                        <div className={styles.pieceCard} key={piece}>
                                            <span className={styles.pieceGlyph}>
                                                <PieceAsset
                                                    theme={pieceTheme}
                                                    piece={whitePieceCodes[piece]}
                                                    size="100%"
                                                />
                                            </span>
                                            <span className={styles.pieceCode}>
                                                {piece == "P" ? "—" : piece}
                                            </span>
                                            <strong>
                                                {t(`notation.pieces.${piece}.name`)}
                                            </strong>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.tip}>
                                    <span aria-hidden="true">i</span>
                                    {t("notation.pawnRule")}
                                </div>
                            </article>

                            <article className={styles.lessonCard}>
                                <h3>{t("notation.examplesTitle")}</h3>
                                <p>{t("notation.examplesHelp")}</p>

                                <div className={styles.exampleButtons}>
                                    {notationExamples.map(example => (
                                        <button
                                            type="button"
                                            key={example}
                                            className={
                                                selectedExample == example
                                                    ? styles.exampleActive
                                                    : ""
                                            }
                                            onClick={() => setSelectedExample(example)}
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>

                                <div className={styles.exampleExplanation}>
                                    <span>{selectedExample}</span>
                                    <p>
                                        {t(
                                            `notation.examples.${selectedExample}`
                                        )}
                                    </p>
                                </div>
                            </article>
                        </div>
                    </section>
                )}

                {activeModule == "movement" && (
                    <section>
                        <LessonHeading
                            kicker={t("movement.kicker")}
                            title={t("movement.title")}
                            intro={t("movement.intro")}
                        />

                        <div className={styles.boardLesson}>
                            <article className={styles.lessonCard}>
                                <h3>{t("movement.choosePiece")}</h3>

                                <div className={styles.pieceSelector}>
                                    {pieces.map(piece => (
                                        <button
                                            type="button"
                                            key={piece}
                                            className={
                                                selectedPiece == piece
                                                    ? styles.pieceSelected
                                                    : ""
                                            }
                                            onClick={() => setSelectedPiece(piece)}
                                            aria-label={t(
                                                `notation.pieces.${piece}.name`
                                            )}
                                        >
                                            <PieceAsset
                                                theme={pieceTheme}
                                                piece={whitePieceCodes[piece]}
                                                size="42px"
                                            />
                                        </button>
                                    ))}
                                </div>

                                <h3 className={styles.movementName}>
                                    {t(`notation.pieces.${selectedPiece}.name`)}
                                </h3>
                                <p>{t(`movement.pieces.${selectedPiece}`)}</p>

                                <div className={styles.boardLegend}>
                                    <span><i className={styles.moveLegend}/>{t("movement.move")}</span>
                                    {selectedPiece == "P" && (
                                        <span><i className={styles.captureLegend}/>{t("movement.capture")}</span>
                                    )}
                                </div>
                            </article>

                            <div
                                className={styles.miniBoard}
                                style={boardStyle}
                                role="img"
                                aria-label={t("movement.boardLabel", {
                                    piece: t(
                                        `notation.pieces.${selectedPiece}.name`
                                    )
                                })}
                            >
                                {boardSquares.map(square => {
                                    const isOrigin = square.name == "d4";
                                    const isMove = movementSquares.includes(square.name);
                                    const isPawnCapture = (
                                        selectedPiece == "P"
                                        && isMove
                                        && square.file != 3
                                    );

                                    return <span
                                        key={square.name}
                                        className={[
                                            styles.boardSquare,
                                            (square.file + square.rank) % 2
                                                ? styles.darkSquare
                                                : styles.lightSquare,
                                            isMove ? styles.moveSquare : "",
                                            isPawnCapture ? styles.captureSquare : ""
                                        ].join(" ")}
                                    >
                                        {isOrigin && (
                                            <b>
                                                <PieceAsset
                                                    theme={pieceTheme}
                                                    piece={
                                                        whitePieceCodes[
                                                            selectedPiece
                                                        ]
                                                    }
                                                    size="84%"
                                                />
                                            </b>
                                        )}
                                        {square.file == 0 && (
                                            <small className={styles.rank}>
                                                {square.rank + 1}
                                            </small>
                                        )}
                                        {square.rank == 0 && (
                                            <small className={styles.file}>
                                                {String.fromCharCode(97 + square.file)}
                                            </small>
                                        )}
                                    </span>;
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {activeModule == "values" && (
                    <section>
                        <LessonHeading
                            kicker={t("values.kicker")}
                            title={t("values.title")}
                            intro={t("values.intro")}
                        />

                        <div className={styles.valueGrid}>
                            {pieceValues.map(({ piece, value }) => (
                                <article
                                    className={styles.valueCard}
                                    key={piece}
                                >
                                    <span className={styles.valuePiece}>
                                        <PieceAsset
                                            theme={pieceTheme}
                                            piece={whitePieceCodes[piece]}
                                            size="100%"
                                        />
                                    </span>
                                    <div>
                                        <span className={styles.valueLabel}>
                                            {t("values.points", { value })}
                                        </span>
                                        <h3>
                                            {t(`notation.pieces.${piece}.name`)}
                                        </h3>
                                        <p>{t(`values.pieces.${piece}`)}</p>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className={styles.engineNote}>
                            <span aria-hidden="true">i</span>
                            {t("values.note")}
                        </div>
                    </section>
                )}

                {activeModule == "practice" && (
                    <section>
                        <LessonHeading
                            kicker={t("practice.kicker")}
                            title={t("practice.title")}
                            intro={t("practice.intro")}
                        />

                        <div className={styles.practiceTabs}>
                            {practiceExercises.map((exercise, index) => (
                                <button
                                    type="button"
                                    key={exercise.id}
                                    className={
                                        practiceIndex == index
                                            ? styles.practiceTabActive
                                            : ""
                                    }
                                    onClick={() => selectPractice(index)}
                                >
                                    <span>{index + 1}</span>
                                    {t(`practice.positions.${exercise.id}.tab`)}
                                </button>
                            ))}
                        </div>

                        <div className={styles.practiceLayout}>
                            <article className={styles.practiceCard}>
                                <span className={styles.practiceProgress}>
                                    {t("practice.progress", {
                                        current: practiceIndex + 1,
                                        total: practiceExercises.length
                                    })}
                                </span>

                                <code>{practiceExercise.notation}</code>

                                <h3>
                                    {t(
                                        `practice.positions.${practiceExercise.id}.title`
                                    )}
                                </h3>
                                <p>
                                    {t(
                                        `practice.positions.${practiceExercise.id}.prompt`
                                    )}
                                </p>

                                <ol className={styles.practiceSteps}>
                                    <li className={
                                        practiceSelection
                                        || practiceFeedback == "correct"
                                            ? styles.practiceStepDone
                                            : ""
                                    }>
                                        <span>1</span>
                                        {t("practice.selectPiece")}
                                    </li>
                                    <li className={
                                        practiceFeedback == "correct"
                                            ? styles.practiceStepDone
                                            : ""
                                    }>
                                        <span>2</span>
                                        {t("practice.selectTarget")}
                                    </li>
                                </ol>

                                {practiceFeedback != "idle" && (
                                    <div
                                        className={[
                                            styles.practiceFeedback,
                                            practiceFeedback == "correct"
                                                ? styles.practiceCorrect
                                                : styles.practiceWrong
                                        ].join(" ")}
                                        aria-live="polite"
                                    >
                                        <strong>
                                            {t(
                                                practiceFeedback == "correct"
                                                    ? "practice.correct"
                                                    : "practice.incorrect"
                                            )}
                                        </strong>
                                        <span>
                                            {t(
                                                `practice.positions.${practiceExercise.id}.${practiceFeedback}`
                                            )}
                                        </span>
                                    </div>
                                )}

                                <div className={styles.practiceActions}>
                                    <button
                                        type="button"
                                        onClick={resetPractice}
                                    >
                                        ↻ {t("practice.retry")}
                                    </button>

                                    {practiceFeedback == "correct"
                                    && practiceIndex < practiceExercises.length - 1
                                    && (
                                        <button
                                            type="button"
                                            className={styles.practiceNext}
                                            onClick={() => (
                                                selectPractice(practiceIndex + 1)
                                            )}
                                        >
                                            {t("practice.next")} →
                                        </button>
                                    )}
                                </div>
                            </article>

                            <div
                                className={`${styles.miniBoard} ${styles.practiceBoard}`}
                                style={boardStyle}
                                aria-label={t("practice.boardLabel")}
                            >
                                {boardSquares.map(square => {
                                    const piece = getPracticePiece(square.name);
                                    const sourceSelected =
                                        practiceSelection == square.name;
                                    const solvedTarget =
                                        practiceFeedback == "correct"
                                        && square.name == practiceExercise.to;

                                    return <button
                                        type="button"
                                        key={square.name}
                                        className={[
                                            styles.boardSquare,
                                            (square.file + square.rank) % 2
                                                ? styles.darkSquare
                                                : styles.lightSquare,
                                            sourceSelected
                                                ? styles.practiceSource
                                                : "",
                                            solvedTarget
                                                ? styles.practiceTarget
                                                : ""
                                        ].join(" ")}
                                        onClick={() => (
                                            playPracticeSquare(square.name)
                                        )}
                                        aria-label={square.name}
                                    >
                                        {piece && (
                                            <b>
                                                <PieceAsset
                                                    theme={pieceTheme}
                                                    piece={piece}
                                                    size="84%"
                                                />
                                            </b>
                                        )}
                                        {square.file == 0 && (
                                            <small className={styles.rank}>
                                                {square.rank + 1}
                                            </small>
                                        )}
                                        {square.rank == 0 && (
                                            <small className={styles.file}>
                                                {String.fromCharCode(
                                                    97 + square.file
                                                )}
                                            </small>
                                        )}
                                    </button>;
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {activeModule == "classifications" && (
                    <section>
                        <LessonHeading
                            kicker={t("classifications.kicker")}
                            title={t("classifications.title")}
                            intro={t("classifications.intro")}
                        />

                        <div className={styles.classificationLayout}>
                            <div className={styles.classificationGrid}>
                                {classifications.map(classification => (
                                    <button
                                        type="button"
                                        key={classification}
                                        className={[
                                            styles.classificationButton,
                                            selectedClassification == classification
                                                ? styles.classificationActive
                                                : ""
                                        ].join(" ")}
                                        style={{
                                            "--classification-colour":
                                                classificationColours[classification]
                                        } as React.CSSProperties}
                                        onClick={() => (
                                            setSelectedClassification(classification)
                                        )}
                                    >
                                        <img
                                            src={classificationImages[classification]}
                                            alt=""
                                        />
                                        <span>
                                            {t(
                                                `classifications.${classification}`,
                                                { ns: "analysis" }
                                            )}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <article
                                className={styles.classificationDetail}
                                style={{
                                    "--classification-colour":
                                        classificationColours[
                                            selectedClassification
                                        ]
                                } as React.CSSProperties}
                            >
                                <img
                                    src={classificationImages[selectedClassification]}
                                    alt=""
                                />
                                <div>
                                    <span>{t("classifications.selected")}</span>
                                    <h3>
                                        {t(
                                            `classifications.${selectedClassification}`,
                                            { ns: "analysis" }
                                        )}
                                    </h3>
                                    <p>
                                        {t(
                                            `classifications.descriptions.${selectedClassification}`
                                        )}
                                    </p>
                                </div>
                            </article>
                        </div>

                        <div className={styles.engineNote}>
                            <span aria-hidden="true">↗</span>
                            {t("classifications.engineNote")}
                        </div>
                    </section>
                )}

                {activeModule == "evaluation" && (
                    <section>
                        <LessonHeading
                            kicker={t("evaluation.kicker")}
                            title={t("evaluation.title")}
                            intro={t("evaluation.intro")}
                        />

                        <div className={styles.evaluationLesson}>
                            <div className={styles.evaluationDemo}>
                                <EvaluationBar
                                    className={styles.academyEvaluationBar}
                                    evaluation={{
                                        type: "centipawn",
                                        value: evaluationPreset.value
                                    }}
                                    moveColour={PieceColour.WHITE}
                                />

                                <div className={styles.evaluationScale}>
                                    <span>{t("evaluation.black")}</span>
                                    <strong>
                                        {evaluationPreset.value > 0 ? "+" : ""}
                                        {(evaluationPreset.value / 100).toFixed(1)}
                                    </strong>
                                    <span>{t("evaluation.white")}</span>
                                </div>
                            </div>

                            <div className={styles.evaluationControls}>
                                <span>{t("evaluation.tryLabel")}</span>

                                <div className={styles.evaluationPresets}>
                                    {evaluationPresets.map(preset => (
                                        <button
                                            type="button"
                                            key={preset.id}
                                            className={
                                                selectedEvaluation == preset.id
                                                    ? styles.evaluationPresetActive
                                                    : ""
                                            }
                                            onClick={() => (
                                                setSelectedEvaluation(preset.id)
                                            )}
                                        >
                                            <span>
                                                {preset.value > 0 ? "+" : ""}
                                                {(preset.value / 100).toFixed(1)}
                                            </span>
                                            {t(`evaluation.presets.${preset.id}.title`)}
                                        </button>
                                    ))}
                                </div>

                                <article className={styles.evaluationDetail}>
                                    <span>{t("evaluation.current")}</span>
                                    <h3>
                                        {t(
                                            `evaluation.presets.${selectedEvaluation}.title`
                                        )}
                                    </h3>
                                    <p>
                                        {t(
                                            `evaluation.presets.${selectedEvaluation}.body`
                                        )}
                                    </p>
                                </article>
                            </div>
                        </div>

                        <div className={styles.evaluationFacts}>
                            {(["scale", "colours", "sign", "mate"] as const)
                                .map((fact, index) => (
                                    <article key={fact}>
                                        <span>{index + 1}</span>
                                        <div>
                                            <h3>
                                                {t(`evaluation.facts.${fact}.title`)}
                                            </h3>
                                            <p>
                                                {t(`evaluation.facts.${fact}.body`)}
                                            </p>
                                        </div>
                                    </article>
                                ))
                            }
                        </div>

                        <div className={styles.engineNote}>
                            <span aria-hidden="true">↗</span>
                            {t("evaluation.note")}
                        </div>
                    </section>
                )}

                {activeModule == "challenge" && (
                    <section>
                        <LessonHeading
                            kicker={t("challenge.kicker")}
                            title={t("challenge.title")}
                            intro={t("challenge.intro")}
                        />

                        <div className={styles.challengeHeader}>
                            <span>
                                {t("challenge.score", {
                                    score,
                                    total: challengeQuestions.length
                                })}
                            </span>
                            <div>
                                <i style={{
                                    width: `${(
                                        answeredQuestions
                                        / challengeQuestions.length
                                    ) * 100}%`
                                }}/>
                            </div>
                        </div>

                        <div className={styles.questions}>
                            {challengeQuestions.map((question, index) => {
                                const selectedAnswer = answers[index];
                                const isCorrect =
                                    selectedAnswer == question.answer;

                                return <article
                                    className={styles.questionCard}
                                    key={question.notation}
                                >
                                    <div className={styles.questionTop}>
                                        <span>{index + 1}</span>
                                        <code>{question.notation}</code>
                                    </div>

                                    <p>{t(`challenge.questions.q${index + 1}.prompt`)}</p>

                                    <div className={styles.answers}>
                                        {["a", "b", "c"].map(option => {
                                            const answerKey = t(
                                                `challenge.questions.q${index + 1}.options.${option}.key`
                                            );

                                            return <button
                                                type="button"
                                                key={option}
                                                className={[
                                                    selectedAnswer == answerKey
                                                        ? styles.answerSelected
                                                        : "",
                                                    selectedAnswer == answerKey
                                                    && answerKey == question.answer
                                                        ? styles.answerCorrect
                                                        : "",
                                                    selectedAnswer == answerKey
                                                    && answerKey != question.answer
                                                        ? styles.answerWrong
                                                        : ""
                                                ].join(" ")}
                                                onClick={() => setAnswers(previous => ({
                                                    ...previous,
                                                    [index]: answerKey
                                                }))}
                                            >
                                                {t(
                                                    `challenge.questions.q${index + 1}.options.${option}.label`
                                                )}
                                            </button>;
                                        })}
                                    </div>

                                    {selectedAnswer && (
                                        <div
                                            className={[
                                                styles.feedback,
                                                isCorrect
                                                    ? styles.feedbackCorrect
                                                    : styles.feedbackWrong
                                            ].join(" ")}
                                            aria-live="polite"
                                        >
                                            <strong>
                                                {t(
                                                    isCorrect
                                                        ? "challenge.correct"
                                                        : "challenge.incorrect"
                                                )}
                                            </strong>
                                            {t(
                                                `challenge.questions.q${index + 1}.explanation`
                                            )}
                                        </div>
                                    )}
                                </article>;
                            })}
                        </div>

                        {score == challengeQuestions.length && (
                            <div className={styles.challengeComplete}>
                                <span aria-hidden="true">✓</span>
                                <div>
                                    <h3>{t("challenge.completeTitle")}</h3>
                                    <p>{t("challenge.completeBody")}</p>
                                </div>
                            </div>
                        )}

                        {answeredQuestions > 0 && (
                            <button
                                type="button"
                                className={styles.resetButton}
                                onClick={() => setAnswers({})}
                            >
                                {t("challenge.reset")}
                            </button>
                        )}
                    </section>
                )}

                <footer className={styles.lessonFooter}>
                    <button
                        type="button"
                        disabled={currentModuleIndex == 0}
                        onClick={() => moveModule(-1)}
                    >
                        ← {t("actions.previous")}
                    </button>

                    <span>
                        {currentModuleIndex + 1} / {moduleOrder.length}
                    </span>

                    <button
                        type="button"
                        disabled={currentModuleIndex == moduleOrder.length - 1}
                        onClick={() => moveModule(1)}
                    >
                        {t("actions.next")} →
                    </button>
                </footer>
            </div>
        </section>
    </main>;
}

function LessonHeading({
    kicker,
    title,
    intro
}: {
    kicker: string;
    title: string;
    intro: string;
}) {
    return <header className={styles.lessonHeading}>
        <span>{kicker}</span>
        <h2>{title}</h2>
        <p>{intro}</p>
    </header>;
}

export default Academy;
