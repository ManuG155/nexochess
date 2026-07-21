export enum Classification {
    BRILLIANT = "brilliant",
    CRITICAL = "critical",

    BEST = "best",
    EXCELLENT = "excellent",
    OKAY = "okay",

    INACCURACY = "inaccuracy",
    MISTAKE = "mistake",

    /*
     * Miss real.
     *
     * Representa una oportunidad
     * importante creada por un error
     * del rival que no fue aprovechada.
     */
    MISS = "miss",

    BLUNDER = "blunder",

    THEORY = "theory",
    FORCED = "forced",

    /*
     * Conservamos RISKY
     * por compatibilidad con
     * código antiguo de WintrChess.
     *
     * Más adelante decidiremos
     * si lo eliminamos completamente.
     */
    RISKY = "risky"
}


/*
 * Valor relativo de calidad.
 *
 * Se utiliza internamente
 * para comparar categorías.
 */
export const classifValues:
    Record<
        Classification,
        number
    > = {

    [Classification.BLUNDER]:
        0,

    /*
     * Un Miss no es necesariamente
     * tan destructivo como un Blunder,
     * pero tampoco es una jugada buena.
     */
    [Classification.MISS]:
        1,

    [Classification.MISTAKE]:
        1,

    [Classification.INACCURACY]:
        2,

    [Classification.RISKY]:
        2,

    [Classification.OKAY]:
        3,

    [Classification.EXCELLENT]:
        4,

    [Classification.BEST]:
        5,

    [Classification.CRITICAL]:
        5,

    [Classification.BRILLIANT]:
        5,

    [Classification.FORCED]:
        5,

    [Classification.THEORY]:
        5
};


/*
 * Standard PGN NAG values.
 *
 * Miss no tiene un NAG estándar
 * perfectamente equivalente,
 * así que no inventamos uno.
 */
export const classifNags:
    Record<
        string,
        string | undefined
    > = {

    [Classification.BRILLIANT]:
        "$3",

    [Classification.CRITICAL]:
        "$1",

    [Classification.INACCURACY]:
        "$6",

    [Classification.MISTAKE]:
        "$2",

    [Classification.BLUNDER]:
        "$4",

    [Classification.RISKY]:
        "$5",

    [Classification.MISS]:
        undefined
};