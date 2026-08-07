import { ReactNode, CSSProperties } from "react";

interface SidebarTabProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    active?: boolean;
    url?: string;
    icon?: string;
    iconSize?: string;
    tabIndex?: number;
}

export default SidebarTabProps;
