import { CSSProperties } from "react";

import { StateTreeNode } from "shared/types/game/position/StateTreeNode";
import EvaluationGraphPoint from "./Point";

interface EvaluationGraphProps {
    className?: string;
    style?: CSSProperties;
    nodes: StateTreeNode[];
    selectedIndex: number;

    /*
     * Durante el análisis mantenemos todos los nodos en el eje X para
     * conservar el ancho total de la partida, pero solo dibujamos los
     * primeros N ya evaluados. Así la curva crece de izquierda a derecha.
     */
    visibleNodeCount?: number;

    onPointClick?: (point: EvaluationGraphPoint) => void;
}

export default EvaluationGraphProps;
