import { Chess } from "chess.js";

import AnalysedGame from
    "shared/types/game/AnalysedGame";

import PieceColour from
    "shared/constants/PieceColour";

import {
    Classification
} from "shared/constants/Classification";

import {
    StateTreeNode,
    getNodeChain
} from "shared/types/game/position/StateTreeNode";

import Evaluation from
    "shared/types/game/position/Evaluation";

import {
    getLineGroupSibling,
    getTopEngineLine
} from "shared/types/game/position/EngineLine";

import {
    getExpectedPoints,
    getExpectedPointsLoss
} from "shared/lib/reporter/expectedPoints";


/*
 * ============================================================
 * TYPES
 * ============================================================
 */


export type GamePhase =
    | "opening"
    | "middlegame"
    | "endgame";


export interface ColourSummaryMetrics {

    /*
     * Accuracy final V2.
     */
    accuracy:
        number | null;


    /*
     * Game Rating V5.
     */
    estimatedRating:
        number | null;


    /*
     * Conteos utilizados
     * por Game Summary.
     *
     * Se leen directamente desde
     * node.state.classification,
     * incluida Classification.MISS.
     */
    classificationCounts:
        Record<
            Classification,
            number
        >;


    /*
     * Accuracy por fase.
     *
     * Conservamos EP-CAPS v1
     * para evitar volatilidad
     * en muestras pequeñas.
     */
    phaseScores:
        Record<
            GamePhase,
            number | null
        >;

}


export interface GameSummaryMetrics {

    white:
        ColourSummaryMetrics;

    black:
        ColourSummaryMetrics;

}


/*
 * ============================================================
 * GENERIC UTILITIES
 * ============================================================
 */


function clamp(
    value: number,
    min: number,
    max: number
) {

    return Math.min(
        max,
        Math.max(
            min,
            value
        )
    );
}


function roundToOneDecimal(
    value: number
) {

    return (

        Math.round(
            value * 10
        )

        / 10

    );
}


function mean(
    values: number[]
) {

    if (
        values.length == 0
    ) {

        return 0;
    }


    return (

        values.reduce(
            (
                total,
                value
            ) => (
                total + value
            ),
            0
        )

        /

        values.length

    );
}


function standardDeviation(
    values: number[]
) {

    if (
        values.length <= 1
    ) {

        return 0;
    }


    const average =
        mean(
            values
        );


    const variance =

        mean(

            values.map(
                value =>
                    Math.pow(
                        value - average,
                        2
                    )
            )

        );


    return Math.sqrt(
        variance
    );
}


/*
 * ============================================================
 * MOVE COLLECTION
 * ============================================================
 */


function getColourNodes(
    chain: StateTreeNode[],
    colour: PieceColour
) {

    return chain.filter(
        node => (

            node.state.move

            &&

            node.state.moveColour
            == colour

            &&

            node.state.accuracy
            != undefined

            &&

            Number.isFinite(
                node.state.accuracy
            )

        )
    );
}


/*
 * ============================================================
 * ACCURACY EP-CAPS v1
 * ============================================================
 *
 * Se mantiene como BASE.
 *
 *
 * Engine evaluation
 *        ↓
 * Expected Points Loss
 *        ↓
 * Accuracy individual WintrChess
 *        ↓
 * media
 *        ↓
 * calibración CAPS-like
 *
 *
 * Accuracy V2 utilizará este resultado
 * como feature principal.
 */


const CAPS_BASE_EXPONENT =
    2.9043;


const CAPS_EXPONENT_SLOPE =
    0.01142;


const CAPS_MIN_EXPONENT =
    2.6;


const CAPS_MAX_EXPONENT =
    3.4;


function calculateRawExpectedPointsAccuracy(
    nodes: StateTreeNode[]
) {

    const accuracies =

        nodes

            .map(
                node =>
                    node.state.accuracy
            )

            .filter(
                (
                    accuracy
                ): accuracy is number => (

                    accuracy
                    != undefined

                    &&

                    Number.isFinite(
                        accuracy
                    )

                )
            )

            .map(
                accuracy =>
                    clamp(
                        accuracy,
                        0,
                        100
                    )
            );


    if (
        accuracies.length
        == 0
    ) {

        return null;
    }


    return mean(
        accuracies
    );
}


function calibrateCapsAccuracy(
    rawAccuracy: number
) {

    if (
        rawAccuracy >= 99.999
    ) {

        return 100;
    }


    const exponent =

        clamp(

            CAPS_BASE_EXPONENT

            +

            (

                CAPS_EXPONENT_SLOPE

                *

                (
                    80
                    - rawAccuracy
                )

            ),

            CAPS_MIN_EXPONENT,

            CAPS_MAX_EXPONENT

        );


    const normalizedAccuracy =

        clamp(
            rawAccuracy / 100,
            0,
            1
        );


    return clamp(

        100

        *

        Math.pow(
            normalizedAccuracy,
            exponent
        ),

        0,

        100

    );
}


function calculateCapsAccuracy(
    nodes: StateTreeNode[]
) {

    const rawAccuracy =

        calculateRawExpectedPointsAccuracy(
            nodes
        );


    if (
        rawAccuracy == null
    ) {

        return null;
    }


    return roundToOneDecimal(

        calibrateCapsAccuracy(
            rawAccuracy
        )

    );
}


/*
 * ============================================================
 * EXPECTED POINTS HELPERS
 * ============================================================
 */


/*
 * Expected Points vistos
 * desde la perspectiva
 * de un color concreto.
 */
function getExpectedPointsForColour(
    evaluation: Evaluation,
    colour: PieceColour
) {

    const whiteExpectedPoints =

        getExpectedPoints(

            evaluation,

            {
                moveColour:
                    colour
            }

        );


    if (
        colour
        == PieceColour.WHITE
    ) {

        return whiteExpectedPoints;
    }


    return (

        1

        -

        whiteExpectedPoints

    );
}


/*
 * Expected Points Loss
 * provocado por una jugada.
 */
function getMoveExpectedPointsLoss(
    node: StateTreeNode
) {

    if (

        !node.parent

        ||

        !node.state.move

        ||

        !node.state.moveColour

    ) {

        return null;
    }


    const previousLine =

        getTopEngineLine(

            node.parent
                .state
                .engineLines

        );


    const currentLine =

        getTopEngineLine(

            node.state
                .engineLines

        );


    if (

        !previousLine

        ||

        !currentLine

    ) {

        return null;
    }


    return clamp(

        getExpectedPointsLoss(

            previousLine.evaluation,

            currentLine.evaluation,

            node.state.moveColour

        ),

        0,

        1

    );
}


/*
 * ============================================================
 * MOVE QUALITY
 * ============================================================
 */


function getMoveQuality(
    node: StateTreeNode
) {

    const accuracy =
        node.state.accuracy;


    if (

        accuracy == undefined

        ||

        !Number.isFinite(
            accuracy
        )

    ) {

        return null;
    }


    return clamp(

        accuracy
        / 100,

        0,

        1

    );
}


/*
 * ============================================================
 * POSITION CRITICALITY V2
 * ============================================================
 *
 *
 * Analizamos:
 *
 * EP1 = mejor línea
 * EP2 = segunda línea
 * EP3 = tercera línea
 *
 *
 * La prioridad es detectar
 * posiciones de "única jugada".
 *
 *
 * C =
 *
 * 0.70 * gap(1, 2)
 * +
 * 0.20 * gap(1, 3)
 * +
 * 0.10 * volatilidad
 *
 *
 * Si solo existen dos líneas:
 *
 * hacemos fallback usando
 * únicamente EP1 y EP2.
 *
 *
 * Para obtener la versión completa
 * conviene configurar:
 *
 * Number of Lines = 3.
 */


function getMoveCriticality(
    node: StateTreeNode
) {

    if (

        !node.parent

        ||

        !node.state.moveColour

    ) {

        return 0;
    }


    const engineLines =

        node.parent
            .state
            .engineLines;


    const bestLine =

        getTopEngineLine(
            engineLines
        );


    if (
        !bestLine
    ) {

        return 0;
    }


    const secondLine =

        getLineGroupSibling(

            engineLines,

            bestLine,

            2

        );


    if (
        !secondLine
    ) {

        /*
         * Sin MultiPV 2
         * no podemos medir
         * dificultad relativa.
         */
        return 0;
    }


    const thirdLine =

        getLineGroupSibling(

            engineLines,

            bestLine,

            3

        );


    const colour =

        node.state.moveColour;


    const ep1 =

        getExpectedPointsForColour(

            bestLine.evaluation,

            colour

        );


    const ep2 =

        getExpectedPointsForColour(

            secondLine.evaluation,

            colour

        );


    const gap12 =

        Math.max(
            0,
            ep1 - ep2
        );


    /*
     * Normalizamos:
     *
     * una diferencia EP de 0.20
     * ya representa una decisión
     * muy crítica.
     */
    const gap12Normalized =

        clamp(

            gap12
            / 0.20,

            0,

            1

        );


    /*
     * FALLBACK MULTIPV 2.
     */
    if (
        !thirdLine
    ) {

        return gap12Normalized;
    }


    const ep3 =

        getExpectedPointsForColour(

            thirdLine.evaluation,

            colour

        );


    const gap13 =

        Math.max(
            0,
            ep1 - ep3
        );


    /*
     * EP1 - EP3 suele ser
     * naturalmente mayor,
     * por eso usamos 0.35
     * como escala.
     */
    const gap13Normalized =

        clamp(

            gap13
            / 0.35,

            0,

            1

        );


    /*
     * Dispersión general
     * de las tres alternativas.
     */
    const volatility =

        standardDeviation(
            [
                ep1,
                ep2,
                ep3
            ]
        );


    const volatilityNormalized =

        clamp(

            volatility
            / 0.20,

            0,

            1

        );


    return clamp(

        (
            0.70
            * gap12Normalized
        )

        +

        (
            0.20
            * gap13Normalized
        )

        +

        (
            0.10
            * volatilityNormalized
        ),

        0,

        1

    );
}


/*
 * ============================================================
 * CRITICAL PERFORMANCE
 * ============================================================
 */


const CRITICAL_PRIOR_STRENGTH =
    2.0;


function getCriticalPerformance(
    nodes: StateTreeNode[]
) {

    const validEntries =

        nodes

            .map(
                node => ({

                    node,

                    quality:
                        getMoveQuality(
                            node
                        )

                })
            )

            .filter(
                (
                    entry
                ): entry is {

                    node:
                        StateTreeNode;

                    quality:
                        number;

                } => (

                    entry.quality
                    != null

                )
            );


    if (
        validEntries.length == 0
    ) {

        return {

            overallQuality:
                0,

            criticalQuality:
                0,

            delta:
                0

        };
    }


    const overallQuality =

        mean(

            validEntries.map(
                entry =>
                    entry.quality
            )

        );


    let criticalitySum =
        0;


    let weightedQualitySum =
        0;


    for (
        const entry
        of validEntries
    ) {

        const criticality =

            getMoveCriticality(
                entry.node
            );


        criticalitySum +=
            criticality;


        weightedQualitySum +=

            criticality

            *

            entry.quality;

    }


    /*
     * Regularización correcta:
     *
     * Qcritical =
     *
     * (
     *   sum(C * Q)
     *   +
     *   epsilon * Qall
     * )
     *
     * /
     *
     * (
     *   sum(C)
     *   +
     *   epsilon
     * )
     *
     *
     * Si apenas existen
     * posiciones críticas:
     *
     * Qcritical -> Qall
     *
     * y el efecto tiende a cero.
     */
    const criticalQuality =

        (

            weightedQualitySum

            +

            (

                CRITICAL_PRIOR_STRENGTH

                *

                overallQuality

            )

        )

        /

        (

            criticalitySum

            +

            CRITICAL_PRIOR_STRENGTH

        );


    return {

        overallQuality,

        criticalQuality,

        delta:

            criticalQuality

            -

            overallQuality

    };
}


/*
 * ============================================================
 * INTERNAL MISS DETECTOR
 * ============================================================
 *
 *
 * NO añadimos aún Classification.MISS
 * porque el enum actual no lo contiene.
 *
 *
 * Utilizamos provisionalmente:
 *
 * Classification.RISKY
 *
 * como representación interna
 * de Miss dentro del Game Summary.
 *
 *
 * Idea:
 *
 * posición antes de mover el rival
 *        ↓
 * el rival comete una jugada
 * que nos concede una oportunidad
 *        ↓
 * nuestra jugada no aprovecha
 * esa oportunidad
 *
 *
 * Para ser Miss exigimos:
 *
 * 1. El rival nos concedió
 *    >= 0.18 EP.
 *
 * 2. Nuestra jugada perdió
 *    >= 0.12 EP de esa oportunidad.
 *
 * 3. Conservamos como máximo
 *    el 35% de la ventaja
 *    recién obtenida.
 */


const MISS_OPPORTUNITY_GAIN =
    0.18;


const MISS_OPPORTUNITY_LOSS =
    0.12;


const MISS_MAX_RETENTION =
    0.35;


function isLikelyMiss(
    node: StateTreeNode
) {

    const playerColour =

        node.state.moveColour;


    const afterOpponentMove =

        node.parent;


    const beforeOpponentMove =

        afterOpponentMove
            ?.parent;


    if (

        !playerColour

        ||

        !afterOpponentMove

        ||

        !beforeOpponentMove

    ) {

        return false;
    }


    /*
     * Evitamos analizar posiciones
     * sin una jugada rival previa.
     */
    if (

        !afterOpponentMove
            .state
            .move

        ||

        afterOpponentMove
            .state
            .moveColour
        == playerColour

    ) {

        return false;
    }


    const beforeLine =

        getTopEngineLine(

            beforeOpponentMove
                .state
                .engineLines

        );


    const opportunityLine =

        getTopEngineLine(

            afterOpponentMove
                .state
                .engineLines

        );


    const afterPlayerLine =

        getTopEngineLine(

            node.state
                .engineLines

        );


    if (

        !beforeLine

        ||

        !opportunityLine

        ||

        !afterPlayerLine

    ) {

        return false;
    }


    const beforeEP =

        getExpectedPointsForColour(

            beforeLine.evaluation,

            playerColour

        );


    const opportunityEP =

        getExpectedPointsForColour(

            opportunityLine.evaluation,

            playerColour

        );


    const afterEP =

        getExpectedPointsForColour(

            afterPlayerLine.evaluation,

            playerColour

        );


    const opportunityGain =

        opportunityEP

        -

        beforeEP;


    if (

        opportunityGain

        < MISS_OPPORTUNITY_GAIN

    ) {

        return false;
    }


    const opportunityLost =

        opportunityEP

        -

        afterEP;


    if (

        opportunityLost

        < MISS_OPPORTUNITY_LOSS

    ) {

        return false;
    }


    const retainedGain =

        Math.max(

            0,

            afterEP

            -

            beforeEP

        );


    const retention =

        opportunityGain > 0

            ? (

                retainedGain

                /

                opportunityGain

            )

            : 1;


    return (

        retention

        <= MISS_MAX_RETENTION

    );
}


/*
 * ============================================================
 * ACCURACY V2 FEATURES
 * ============================================================
 */


/*
 * Media del peor 20%
 * de las jugadas.
 */
function getTailQuality(
    nodes: StateTreeNode[]
) {

    const qualities =

        nodes

            .map(
                node =>
                    getMoveQuality(
                        node
                    )
            )

            .filter(
                (
                    quality
                ): quality is number => (

                    quality
                    != null

                )
            )

            .sort(
                (
                    a,
                    b
                ) => (
                    a - b
                )
            );


    if (
        qualities.length == 0
    ) {

        return null;
    }


    const tailCount =

        Math.max(

            1,

            Math.ceil(

                qualities.length

                *

                0.20

            )

        );


    return mean(

        qualities.slice(
            0,
            tailCount
        )

    );
}


/*
 * Corrección estructural suave
 * observada en nuestra muestra:
 *
 * EP-CAPS v1 tiende a:
 *
 * - estar ligeramente alto
 *   en scores bajos;
 *
 * - quedarse corto
 *   en la franja media-alta.
 *
 *
 * La corrección desaparece
 * progresivamente al acercarnos
 * a 100.
 */
function getRangeCalibrationCorrection(
    baseAccuracy: number
) {

    const sigmoid =

        1

        /

        (

            1

            +

            Math.exp(

                -(
                    baseAccuracy
                    - 63
                )

                / 5

            )

        );


    const rawCorrection =

        -0.6

        +

        (
            3.5
            * sigmoid
        );


    /*
     * Una Accuracy perfecta
     * debe permanecer en 100.
     */
    const highAccuracyFade =

        clamp(

            (
                100
                - baseAccuracy
            )

            / 20,

            0,

            1

        );


    return (

        rawCorrection

        *

        highAccuracyFade

    );
}


/*
 * ============================================================
 * ACCURACY V2
 * ============================================================
 *
 *
 * EP-CAPS v1
 *        ↓
 * calibración de rango
 *        +
 * calidad en posiciones críticas
 *        +
 * comportamiento del peor 20%
 *        +
 * corrección semántica de Miss
 *        ↓
 * Accuracy V2
 *
 *
 * Los coeficientes son deliberadamente
 * moderados.
 *
 * Esta versión debe validarse
 * con más partidas antes
 * de congelarla.
 */


function calculateAccuracyV2(
    nodes: StateTreeNode[]
) {

    const baseAccuracy =

        calculateCapsAccuracy(
            nodes
        );


    if (
        baseAccuracy == null
    ) {

        return null;
    }


    if (
        nodes.length == 0
    ) {

        return baseAccuracy;
    }


    /*
     * --------------------------------------------------------
     * 1. RANGE CALIBRATION
     * --------------------------------------------------------
     */
    const rangeCorrection =

        getRangeCalibrationCorrection(
            baseAccuracy
        );


    /*
     * --------------------------------------------------------
     * 2. CRITICAL PERFORMANCE
     * --------------------------------------------------------
     */
    const criticalPerformance =

        getCriticalPerformance(
            nodes
        );


    /*
     * Máximo aproximado:
     *
     * ±2.5 puntos.
     */
    const criticalCorrection =

        clamp(

            criticalPerformance.delta

            *

            8,

            -2.5,

            2.5

        );


    /*
     * --------------------------------------------------------
     * 3. TAIL QUALITY
     * --------------------------------------------------------
     *
     * Una partida cuya peor parte
     * es mejor de lo esperable
     * recibe una pequeña mejora.
     *
     * Una cola extremadamente mala
     * recibe una penalización.
     */
    const tailQuality =

        getTailQuality(
            nodes
        );


    let tailCorrection =
        0;


    if (
        tailQuality != null
    ) {

        const expectedTailQuality =

            criticalPerformance
                .overallQuality

            *

            0.55;


        tailCorrection =

            clamp(

                (

                    tailQuality

                    -

                    expectedTailQuality

                )

                *

                4,

                -1.5,

                1.5

            );

    }


    /*
     * --------------------------------------------------------
     * 4. MISS SEMANTIC CORRECTION
     * --------------------------------------------------------
     *
     * No sustituimos el EP Loss.
     *
     * Simplemente evitamos que
     * una serie de oportunidades
     * desaprovechadas domine
     * del mismo modo que una serie
     * de colapsos autogenerados.
     *
     *
     * Corrección máxima:
     *
     * +2.5 puntos.
     */
    const missCount =

        nodes.filter(
            node =>
                isLikelyMiss(
                    node
                )
        ).length;


    const missCorrection =

        Math.min(

            2.5,

            missCount
            * 0.85

        );


    /*
     * --------------------------------------------------------
     * RESULTADO
     * --------------------------------------------------------
     */
    const finalAccuracy =

        baseAccuracy

        +

        rangeCorrection

        +

        criticalCorrection

        +

        tailCorrection

        +

        missCorrection;


    return roundToOneDecimal(

        clamp(
            finalAccuracy,
            0,
            100
        )

    );
}


/*
 * ============================================================
 * BOOK / THEORY
 * ============================================================
 */


function getBookNodeIds(
    chain: StateTreeNode[]
) {

    const bookNodes =
        new Set<string>();


    let stillInBook =
        true;


    for (
        const node
        of chain
    ) {

        if (
            !node.state.move
        ) {

            continue;
        }


        if (
            !stillInBook
        ) {

            continue;
        }


        if (
            node.state.classification
            == Classification.THEORY
        ) {

            bookNodes.add(
                node.id
            );


            continue;
        }


        /*
         * Primera desviación.
         *
         * La teoría se acaba
         * para el resto de la partida.
         */
        stillInBook =
            false;

    }


    return bookNodes;
}


/*
 * ============================================================
 * SUMMARY CLASSIFICATION
 * ============================================================
 *
 * Esto afecta únicamente
 * al Summary.
 *
 * Más adelante sustituiremos
 * el clasificador global completo.
 */


function getSummaryClassification(
    node: StateTreeNode,
    isBook:
        boolean
) {

    /*
     * BOOK.
     */
    if (
        isBook
    ) {

        return Classification.THEORY;
    }


    /*
     * MISS.
     *
     * Provisionalmente utilizamos
     * RISKY como almacenamiento
     * interno porque el enum original
     * todavía no contiene MISS.
     */
    if (
        isLikelyMiss(
            node
        )
    ) {

        return Classification.RISKY;
    }


    const rawLoss =

        getMoveExpectedPointsLoss(
            node
        );


    if (
        rawLoss == null
    ) {

        return undefined;
    }


    /*
     * Cuantización exclusivamente
     * para estabilizar categorías.
     *
     * Accuracy V2 utiliza
     * valores continuos.
     */
    const loss =

        Math.round(
            rawLoss * 200
        )

        / 200;


    /*
     * Brilliant provisional.
     */
    if (

        node.state.classification
        == Classification.BRILLIANT

        &&

        loss <= 0.02

    ) {

        return Classification.BRILLIANT;
    }


    /*
     * Great provisional.
     */
    if (

        node.state.classification
        == Classification.CRITICAL

        &&

        loss <= 0.02

    ) {

        return Classification.CRITICAL;
    }


    /*
     * Best.
     */
    if (
        loss == 0
    ) {

        return Classification.BEST;
    }


    /*
     * Excellent.
     */
    if (
        loss <= 0.02
    ) {

        return Classification.EXCELLENT;
    }


    /*
     * Good.
     */
    if (
        loss <= 0.05
    ) {

        return Classification.OKAY;
    }


    /*
     * Inaccuracy.
     */
    if (
        loss <= 0.10
    ) {

        return Classification.INACCURACY;
    }


    /*
     * Mistake.
     */
    if (
        loss <= 0.20
    ) {

        return Classification.MISTAKE;
    }


    /*
     * Blunder.
     */
    return Classification.BLUNDER;
}


/*
 * ============================================================
 * CLASSIFICATION COUNTS
 * ============================================================
 */


function getClassificationCounts(
    chain:
        StateTreeNode[],

    colour:
        PieceColour
) {

    const counts =

        Object.values(
            Classification
        ).reduce(
            (
                result,
                classification
            ) => {

                result[
                    classification
                ] = 0;


                return result;

            },

            {} as Record<
                Classification,
                number
            >

        );


    for (
        const node
        of chain
    ) {

        /*
         * Solo contamos
         * movimientos del jugador
         * correspondiente.
         */
        if (

            !node
                .state
                .move

            ||

            node
                .state
                .moveColour
            != colour

        ) {

            continue;
        }


        /*
         * FUENTE ÚNICA DE VERDAD.
         *
         * Ya NO recalculamos
         * la clasificación
         * dentro del Summary.
         *
         * Utilizamos exactamente
         * la clasificación producida
         * por Classification V2.
         */

        const classification =

            node
                .state
                .classification;


        if (
            !classification
        ) {

            continue;
        }


        counts[
            classification
        ]++;

    }


    return counts;
}


/*
 * ============================================================
 * GAME PHASE DETECTION
 * ============================================================
 */


function getGamePhase(
    node: StateTreeNode,
    plyIndex: number
): GamePhase {

    try {

        const chess =

            new Chess(
                node.state.fen
            );


        const board =

            chess.board();


        let nonPawnMaterial =
            0;


        let queenCount =
            0;


        for (
            const rank
            of board
        ) {

            for (
                const piece
                of rank
            ) {

                if (
                    !piece
                ) {

                    continue;
                }


                switch (
                    piece.type
                ) {

                    case "q":

                        queenCount++;

                        nonPawnMaterial
                            += 9;

                        break;


                    case "r":

                        nonPawnMaterial
                            += 5;

                        break;


                    case "b":

                    case "n":

                        nonPawnMaterial
                            += 3;

                        break;

                }

            }

        }


        /*
         * OPENING.
         */
        if (

            plyIndex <= 20

            &&

            nonPawnMaterial >= 48

        ) {

            return "opening";
        }


        /*
         * ENDGAME.
         */
        if (

            nonPawnMaterial <= 18

            ||

            (

                queenCount == 0

                &&

                nonPawnMaterial <= 28

            )

        ) {

            return "endgame";
        }


        return "middlegame";

    } catch {

        return "middlegame";
    }
}


/*
 * ============================================================
 * PHASE ACCURACY
 * ============================================================
 *
 * Conservamos EP-CAPS v1.
 *
 * Accuracy V2 necesita una muestra
 * razonable y sería demasiado volátil
 * aplicada a fases de 2 o 3 jugadas.
 */


function calculatePhaseScores(
    chain: StateTreeNode[],
    colour: PieceColour
) {

    const phases:
        Record<
            GamePhase,
            StateTreeNode[]
        > = {

            opening: [],

            middlegame: [],

            endgame: []

        };


    chain.forEach(
        (
            node,
            index
        ) => {

            if (

                !node.state.move

                ||

                node.state.moveColour
                != colour

                ||

                node.state.accuracy
                == undefined

            ) {

                return;
            }


            const phase =

                getGamePhase(
                    node,
                    index
                );


            phases[
                phase
            ].push(
                node
            );

        }
    );


    return {

        opening:

            calculateCapsAccuracy(
                phases.opening
            ),


        middlegame:

            calculateCapsAccuracy(
                phases.middlegame
            ),


        endgame:

            calculateCapsAccuracy(
                phases.endgame
            )

    };
}


/*
 * ============================================================
 * GAME RATING V5
 * RELATIVE CONTEXTUAL PERFORMANCE
 * ============================================================
 *
 *
 * Rating real del jugador
 *        ↓
 * Accuracy esperada
 * para ese rating
 *        ↓
 * Accuracy V2 obtenida
 *        ↓
 * diferencia respecto
 * a la expectativa
 *        +
 * calidad en decisiones críticas
 *        ↓
 * ajuste suave por longitud
 *        ↓
 * Game Rating
 *
 *
 * NO utilizamos:
 *
 * - una curva absoluta Accuracy -> Elo;
 * - resultado de la partida;
 * - victoria / derrota / tablas;
 * - un confidence que sustituya
 *   completamente el rating real.
 */


const GAME_RATING_MIN =
    100;


const GAME_RATING_MAX =
    3200;


/*
 * ============================================================
 * EXPECTED ACCURACY BY RATING
 * ============================================================
 *
 * Modelo propio inicial.
 *
 *
 * Aproximadamente:
 *
 * 150  -> 49.5
 * 725  -> 65
 * 1300 -> 80.5
 * 2000 -> 90.6
 * 2800 -> 94
 *
 *
 * Para imitar Chess.com,
 * el rating de entrada debería ser
 * el rating ONLINE correspondiente
 * al control de tiempo del PGN.
 */


function getExpectedAccuracy(
    rating: number
) {

    return (

        35

        +

        (

            60

            /

            (

                1

                +

                Math.exp(

                    -(
                        rating
                        - 725
                    )

                    / 503

                )

            )

        )

    );
}


/*
 * ============================================================
 * ACCURACY -> ELO SENSITIVITY
 * ============================================================
 */


function getAccuracyEloSensitivity(
    rating: number
) {

    return (

        36

        +

        (

            8

            /

            (

                1

                +

                Math.exp(

                    -(
                        rating
                        - 1600
                    )

                    / 500

                )

            )

        )

    );
}


/*
 * ============================================================
 * LENGTH FACTOR
 * ============================================================
 *
 * La longitud reduce únicamente
 * la magnitud del delta.
 *
 * Nunca elimina el rating base.
 */


function getGameLengthFactor(
    evaluatedMoveCount: number
) {

    const count =

        Math.max(
            evaluatedMoveCount,
            0
        );


    return (

        0.55

        +

        (

            0.45

            *

            (

                1

                -

                Math.exp(

                    -count
                    / 8

                )

            )

        )

    );
}


/*
 * ============================================================
 * DIFFICULTY BONUS V2
 * ============================================================
 */


const DIFFICULTY_PRIOR_STRENGTH =
    2.0;


const DIFFICULTY_BONUS_SCALE =
    450;


const DIFFICULTY_BONUS_LIMIT =
    250;


function calculateDifficultyBonus(
    nodes: StateTreeNode[]
) {

    const performance =

        getCriticalPerformance(
            nodes
        );


    const rawBonus =

        DIFFICULTY_BONUS_SCALE

        *

        performance.delta;


    return clamp(

        rawBonus,

        -DIFFICULTY_BONUS_LIMIT,

        DIFFICULTY_BONUS_LIMIT

    );
}


/*
 * ============================================================
 * FINAL GAME RATING V5
 * ============================================================
 */


function estimatePerformanceRating(
    ownRating:
        number | undefined,

    opponentRating:
        number | undefined,

    accuracy:
        number | null,

    nodes:
        StateTreeNode[]
) {

    if (
        accuracy == null
    ) {

        return null;
    }


    /*
     * Ancla principal:
     *
     * rating del propio jugador.
     *
     * Para reproducir Chess.com,
     * debería venir del PGN
     * de esa modalidad.
     */
    const baseRating =

        ownRating

        ??

        opponentRating

        ??

        1200;


    /*
     * Rendimiento esperado
     * para un jugador
     * de este nivel.
     */
    const expectedAccuracy =

        getExpectedAccuracy(
            baseRating
        );


    /*
     * ¿Jugó mejor o peor
     * de lo esperado?
     */
    const accuracyDelta =

        accuracy

        -

        expectedAccuracy;


    /*
     * Conversión del diferencial
     * a puntos Elo.
     */
    const eloSensitivity =

        getAccuracyEloSensitivity(
            baseRating
        );


    const accuracyRatingDelta =

        accuracyDelta

        *

        eloSensitivity;


    /*
     * Ajuste según la calidad
     * mostrada específicamente
     * en posiciones críticas.
     */
    const difficultyBonus =

        calculateDifficultyBonus(
            nodes
        );


    /*
     * Las partidas muy cortas
     * reducen el tamaño del ajuste.
     */
    const lengthFactor =

        getGameLengthFactor(
            nodes.length
        );


    /*
     * El rating REAL sigue siendo
     * siempre el punto de partida.
     */
    const estimatedRating =

        baseRating

        +

        (

            lengthFactor

            *

            (

                accuracyRatingDelta

                +

                difficultyBonus

            )

        );


    const boundedRating =

        clamp(

            estimatedRating,

            GAME_RATING_MIN,

            GAME_RATING_MAX

        );


    /*
     * Interfaz:
     *
     * múltiplos de 50.
     */
    return (

        Math.round(

            boundedRating

            / 50

        )

        *

        50

    );
}


/*
 * ============================================================
 * MAIN ENTRY POINT
 * ============================================================
 */


export function getGameSummaryMetrics(
    analysisGame:
        AnalysedGame
): GameSummaryMetrics {

    const chain =

        getNodeChain(
            analysisGame.stateTree
        );


    const whiteNodes =

        getColourNodes(

            chain,

            PieceColour.WHITE

        );


    const blackNodes =

        getColourNodes(

            chain,

            PieceColour.BLACK

        );


    /*
     * Accuracy V2.
     */
    const whiteAccuracy =

        calculateAccuracyV2(
            whiteNodes
        );


    const blackAccuracy =

        calculateAccuracyV2(
            blackNodes
        );


    return {

        /*
         * ====================================================
         * WHITE
         * ====================================================
         */
        white: {

            accuracy:
                whiteAccuracy,


            estimatedRating:

                estimatePerformanceRating(

                    analysisGame
                        .players
                        .white
                        .rating,

                    analysisGame
                        .players
                        .black
                        .rating,

                    whiteAccuracy,

                    whiteNodes

                ),


            classificationCounts:

                getClassificationCounts(

                    chain,

                    PieceColour.WHITE

                ),


            phaseScores:

                calculatePhaseScores(

                    chain,

                    PieceColour.WHITE

                )

        },


        /*
         * ====================================================
         * BLACK
         * ====================================================
         */
        black: {

            accuracy:
                blackAccuracy,


            estimatedRating:

                estimatePerformanceRating(

                    analysisGame
                        .players
                        .black
                        .rating,

                    analysisGame
                        .players
                        .white
                        .rating,

                    blackAccuracy,

                    blackNodes

                ),


            classificationCounts:

                getClassificationCounts(

                    chain,

                    PieceColour.BLACK

                ),


            phaseScores:

                calculatePhaseScores(

                    chain,

                    PieceColour.BLACK

                )

        }

    };
}