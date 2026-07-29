import { BoardState } from "shared/types/game/position/BoardState";
import Evaluation from "shared/types/game/position/Evaluation";

interface EvaluationGraphPoint {
    nodeId: string;
    state: BoardState;
    evaluation: Evaluation;
    x: number;
    y: number | null;
}

export default EvaluationGraphPoint;
