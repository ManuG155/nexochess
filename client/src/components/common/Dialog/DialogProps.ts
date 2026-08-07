import { CSSProperties, ReactNode } from "react";

interface DialogProps {
    children?: ReactNode;
    style?: CSSProperties;
    className?: string;
    closeButtonStyle?: CSSProperties;
    onClose?: () => void;
    closeOnBackdrop?: boolean;
    ariaLabel?: string;
    ariaLabelledBy?: string;
}

export default DialogProps;
