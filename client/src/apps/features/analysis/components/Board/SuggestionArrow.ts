import { Square } from "chess.js";

interface SuggestionArrow {
    from: Square;
    to: Square;
    colour: string;
}

export default SuggestionArrow;