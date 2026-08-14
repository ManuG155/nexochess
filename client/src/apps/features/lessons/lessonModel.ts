import type { Square } from "chess.js";

export type LessonOutcome =
    | "success"
    | "acceptedAlternative"
    | "legalOffTarget"
    | "conceptualError"
    | "illegalAction";

export interface LessonMove {
    from: Square;
    to: Square;
}

export interface LessonHint {
    textKey: string;
    highlightSquares?: Square[];
    arrows?: Array<[Square, Square]>;
}

interface LessonStepBase {
    id: string;
    fen: string;
    coachKey: string;
    hints?: LessonHint[];
}

export interface MessageStep extends LessonStepBase {
    kind: "message";
    bodyKey: string;
}

export interface MoveStep extends LessonStepBase {
    kind: "move";
    instructionKey: string;
    targetMove: LessonMove;
    acceptedMoves?: LessonMove[];
    successKey: string;
}

export interface MultipleChoiceOption {
    id: string;
    labelKey: string;
}

export interface MultipleChoiceStep extends LessonStepBase {
    kind: "multipleChoice";
    questionKey: string;
    options: MultipleChoiceOption[];
    correctOptionId: string;
    successKey: string;
    errorKey: string;
}

export interface SelectSquareStep extends LessonStepBase {
    kind: "selectSquare";
    instructionKey: string;
    acceptedSquares: Square[];
    successKey: string;
}

export interface CompletionStep extends LessonStepBase {
    kind: "completion";
    titleKey: string;
    bodyKey: string;
}

export type LessonStep =
    | MessageStep
    | MoveStep
    | MultipleChoiceStep
    | SelectSquareStep
    | CompletionStep;

export interface LessonDefinition {
    id: string;
    titleKey: string;
    moduleKey: string;
    steps: LessonStep[];
}

export interface AttemptResult {
    outcome: LessonOutcome;
    feedbackKey: string;
    resultingFen?: string;
    san?: string;
}
