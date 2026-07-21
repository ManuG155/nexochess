import React, {
    useMemo
} from "react";

import {
    Classification
} from "shared/constants/Classification";

import useAnalysisGameStore from
    "@analysis/stores/AnalysisGameStore";

import useAnalysisBoardStore from
    "@analysis/stores/AnalysisBoardStore";

import {
    classificationColours,
    classificationImages
} from "@analysis/constants/classifications";

import EvaluationGraphArea from
    "../GameReport/EvaluationGraphArea";

import {
    GamePhase,
    getGameSummaryMetrics
} from "./summaryMetrics";

import * as styles from
    "./GameSummaryPanel.module.css";

import iconDefaultProfileImage from
    "@assets/img/defaultprofileimage.png";


interface GameSummaryPanelProps {

    onStartReview:
        () => void;

}


/*
 * ORDEN EXACTO
 * QUE QUEREMOS MOSTRAR.
 */
const moveClassificationRows = [

    {
        label:
            "Brilliant",

        classification:
            Classification.BRILLIANT
    },

    {
        label:
            "Great",

        classification:
            Classification.CRITICAL
    },

    {
        label:
            "Book",

        classification:
            Classification.THEORY
    },

    {
        label:
            "Best",

        classification:
            Classification.BEST
    },

    {
        label:
            "Excellent",

        classification:
            Classification.EXCELLENT
    },

    {
        label:
            "Good",

        classification:
            Classification.OKAY
    },

    {
        label:
            "Inaccuracy",

        classification:
            Classification.INACCURACY
    },

    {
        label:
            "Mistake",

        classification:
            Classification.MISTAKE
    },

    {
        label:
            "Miss",

        classification:
            Classification.MISS
    },

    {
        label:
            "Blunder",

        classification:
            Classification.BLUNDER
    }

] as const;


/*
 * Clasificación visual
 * de una fase según
 * su puntuación.
 */
function getScoreClassification(
    score:
        number | null
) {

    if (
        score == null
    ) {
        return null;
    }


    if (
        score >= 96
    ) {
        return Classification.BRILLIANT;
    }


    if (
        score >= 90
    ) {
        return Classification.BEST;
    }


    if (
        score >= 82
    ) {
        return Classification.EXCELLENT;
    }


    if (
        score >= 72
    ) {
        return Classification.OKAY;
    }


    if (
        score >= 62
    ) {
        return Classification.INACCURACY;
    }


    if (
        score >= 48
    ) {
        return Classification.MISTAKE;
    }


    return Classification.BLUNDER;
}


/*
 * Devuelve:
 *
 * 78.6
 *
 * o
 *
 * —
 */
function formatAccuracy(
    value:
        number | null
) {

    return value != null
        ? value.toFixed(1)
        : "—";
}


/*
 * AVATAR.
 *
 * Si falla la imagen importada
 * desde Chess.com/Lichess/etc,
 * usamos el avatar por defecto.
 */
function PlayerAvatar({
    image,
    username
}: {
    image?:
        string;

    username:
        string;
}) {

    return (
        <img
            className={
                styles.playerAvatar
            }

            src={
                image
                || iconDefaultProfileImage
            }

            alt={
                username
            }

            onError={
                event => {

                    event.currentTarget.src =
                        iconDefaultProfileImage;
                }
            }
        />
    );
}


/*
 * ICONO DE FASE.
 */
function PhaseIcon({
    score
}: {
    score:
        number | null;
}) {

    const classification =
        getScoreClassification(
            score
        );


    if (
        !classification
    ) {

        return (
            <span
                className={
                    styles.noPhase
                }
            >
                —
            </span>
        );
    }


    return (
        <img
            className={
                styles.phaseIcon
            }

            src={
                classificationImages[
                    classification
                ]
            }

            alt=""
            title={
                score?.toFixed(1)
            }
        />
    );
}


function GameSummaryPanel({
    onStartReview
}: GameSummaryPanelProps) {

    const analysisGame =
        useAnalysisGameStore(
            state =>
                state.analysisGame
        );


    /*
     * Nos suscribimos también
     * al contador de actualizaciones.
     *
     * Así el summary se recalcula
     * cuando cambian datos del árbol.
     */
    const currentStateTreeNodeUpdate =
        useAnalysisBoardStore(
            state =>
                state
                    .currentStateTreeNodeUpdate
        );


    const metrics = useMemo(
        () => (

            getGameSummaryMetrics(
                analysisGame
            )

        ),
        [
            analysisGame,
            currentStateTreeNodeUpdate
        ]
    );


    const whitePlayer =
        analysisGame.players.white;


    const blackPlayer =
        analysisGame.players.black;


    const phaseRows:
        Array<{
            label: string;
            phase: GamePhase;
        }> = [

            {
                label:
                    "Opening",

                phase:
                    "opening"
            },

            {
                label:
                    "Middlegame",

                phase:
                    "middlegame"
            },

            {
                label:
                    "Endgame",

                phase:
                    "endgame"
            }

        ];


    return (
        <section
            className={
                styles.wrapper
            }
        >

            <div
                className={
                    styles.scrollArea
                }
            >

                {/*
                 * ===============================
                 * CABECERA
                 * ===============================
                 */}
                <h2
                    className={
                        styles.title
                    }
                >
                    Game summary
                </h2>


                {/*
                 * ===============================
                 * GRÁFICO
                 * ===============================
                 */}
                <div
                    className={
                        styles.graphCard
                    }
                >

                    <EvaluationGraphArea />

                </div>


                {/*
                 * ===============================
                 * JUGADORES + ACCURACY
                 * ===============================
                 */}
                <section
                    className={
                        styles.playersSection
                    }
                >

                    <div
                        className={
                            styles.playersGrid
                        }
                    >

                        {/*
                         * BLANCAS
                         */}
                        <div
                            className={
                                styles.playerColumn
                            }
                        >

                            <span
                                className={
                                    styles.playerName
                                }
                            >

                                {
                                    whitePlayer
                                        .username

                                    || "White"
                                }

                            </span>


                            <PlayerAvatar
                                image={
                                    whitePlayer.image
                                }

                                username={
                                    whitePlayer
                                        .username

                                    || "White"
                                }
                            />


                            <div
                                className={
                                    styles.accuracyBox
                                }
                            >

                                {
                                    formatAccuracy(
                                        metrics
                                            .white
                                            .accuracy
                                    )
                                }

                            </div>

                        </div>


                        {/*
                         * NEGRAS
                         */}
                        <div
                            className={
                                styles.playerColumn
                            }
                        >

                            <span
                                className={
                                    styles.playerName
                                }
                            >

                                {
                                    blackPlayer
                                        .username

                                    || "Black"
                                }

                            </span>


                            <PlayerAvatar
                                image={
                                    blackPlayer.image
                                }

                                username={
                                    blackPlayer
                                        .username

                                    || "Black"
                                }
                            />


                            <div
                                className={
                                    styles.accuracyBox
                                }
                            >

                                {
                                    formatAccuracy(
                                        metrics
                                            .black
                                            .accuracy
                                    )
                                }

                            </div>

                        </div>

                    </div>

                </section>


                {/*
                 * ===============================
                 * CLASIFICACIONES
                 * ===============================
                 */}
                <section
                    className={
                        styles.moveTableSection
                    }
                >

                    {moveClassificationRows.map(
                        row => {

                            const colour =
                                row.classification

                                    ? classificationColours[
                                        row
                                            .classification
                                    ]

                                    : "#F87171";


                            const whiteCount =
                                row.classification

                                    ? metrics
                                        .white
                                        .classificationCounts[
                                            row
                                                .classification
                                        ]

                                    : 0;


                            const blackCount =
                                row.classification

                                    ? metrics
                                        .black
                                        .classificationCounts[
                                            row
                                                .classification
                                        ]

                                    : 0;


                            return (

                                <div
                                    key={
                                        row.label
                                    }

                                    className={
                                        styles.moveRow
                                    }
                                >

                                    <span
                                        className={
                                            styles.moveLabel
                                        }
                                    >
                                        {
                                            row.label
                                        }
                                    </span>


                                    <span
                                        className={
                                            styles.moveCount
                                        }

                                        style={{
                                            color:
                                                colour
                                        }}
                                    >
                                        {
                                            whiteCount
                                        }
                                    </span>


                                    <div
                                        className={
                                            styles.moveIconCell
                                        }
                                    >

                                        {row.classification

                                            ? (
                                                <img
                                                    className={
                                                        styles.moveIcon
                                                    }

                                                    src={
                                                        classificationImages[
                                                            row
                                                                .classification
                                                        ]
                                                    }

                                                    alt=""
                                                />
                                            )

                                            : (
                                                <span
                                                    className={
                                                        styles.missIcon
                                                    }
                                                >
                                                    ×
                                                </span>
                                            )
                                        }

                                    </div>


                                    <span
                                        className={
                                            styles.moveCount
                                        }

                                        style={{
                                            color:
                                                colour
                                        }}
                                    >
                                        {
                                            blackCount
                                        }
                                    </span>

                                </div>
                            );
                        }
                    )}

                </section>


                {/*
                 * ===============================
                 * RENDIMIENTO POR FASES
                 * ===============================
                 */}
                <section
                    className={
                        styles.phaseSection
                    }
                >

                    {/*
                     * GAME RATING
                     */}
                    <div
                        className={
                            styles.phaseRow
                        }
                    >

                        <span
                            className={
                                styles.phaseLabel
                            }
                        >
                            Game rating
                        </span>


                        <span
                            className={
                                styles.gameRating
                            }
                        >

                            {
                                metrics
                                    .white
                                    .estimatedRating
                                ?? "—"
                            }

                        </span>


                        <span
                            className={
                                styles.gameRating
                            }
                        >

                            {
                                metrics
                                    .black
                                    .estimatedRating
                                ?? "—"
                            }

                        </span>

                    </div>


                    {phaseRows.map(
                        row => (

                            <div
                                key={
                                    row.phase
                                }

                                className={
                                    styles.phaseRow
                                }
                            >

                                <span
                                    className={
                                        styles.phaseLabel
                                    }
                                >
                                    {
                                        row.label
                                    }
                                </span>


                                <div
                                    className={
                                        styles.phaseValue
                                    }
                                >

                                    <PhaseIcon
                                        score={
                                            metrics
                                                .white
                                                .phaseScores[
                                                    row.phase
                                                ]
                                        }
                                    />

                                </div>


                                <div
                                    className={
                                        styles.phaseValue
                                    }
                                >

                                    <PhaseIcon
                                        score={
                                            metrics
                                                .black
                                                .phaseScores[
                                                    row.phase
                                                ]
                                        }
                                    />

                                </div>

                            </div>

                        )
                    )}

                </section>

            </div>


            {/*
             * ===============================
             * START REVIEW
             * ===============================
             */}
            <div
                className={
                    styles.footer
                }
            >

                <button
                    type="button"

                    className={
                        styles.startReviewButton
                    }

                    onClick={
                        onStartReview
                    }
                >
                    Start Review
                </button>

            </div>

        </section>
    );
}


export default GameSummaryPanel;