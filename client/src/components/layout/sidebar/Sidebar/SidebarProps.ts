import { CSSProperties } from "react";

interface SidebarProps {
    style?: CSSProperties;
    onClose?: () => void;
    open?: boolean;
}

export default SidebarProps;
