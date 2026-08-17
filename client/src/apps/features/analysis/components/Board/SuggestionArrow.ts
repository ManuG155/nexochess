import { Square } from "chess.js";

interface SuggestionArrow {
    from: Square;
    to: Square;
    colour: string;

    /*
     * Engine suggestion arrows keep using the configurable Analysis colour.
     * Pedagogical arrows can opt out so concepts such as threats remain
     * visually distinct from the engine's normal recommendation.
     */
    preserveColour?: boolean;
}

export default SuggestionArrow;
