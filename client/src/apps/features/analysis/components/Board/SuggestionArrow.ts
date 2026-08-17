import { Square } from "chess.js";

interface SuggestionArrow {
    from: Square;
    to: Square;
    colour: string;

    /*
     * Board normalisation keeps the configurable engine-suggestion colour.
     * An overlay colour survives that normalisation and is used only by
     * pedagogical arrows that must remain visually distinct.
     */
    overlayColour?: string;
}

export default SuggestionArrow;
