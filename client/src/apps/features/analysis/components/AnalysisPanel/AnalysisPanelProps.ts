import { CSSProperties } from "react";

export type AnalysisPanelMode =
    | "summary"
    | "review";

interface AnalysisPanelProps {
    className?: string;
    style?: CSSProperties;
    onModeChange?: (mode: AnalysisPanelMode) => void;
}

export default AnalysisPanelProps;