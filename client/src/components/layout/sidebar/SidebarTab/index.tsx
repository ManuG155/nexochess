import React from "react";

import SidebarTabProps from "./SidebarTabProps";
import * as styles from "./SidebarTab.module.css";

const defaultIconSize = "30px";

function SidebarTab({
    children,
    className,
    style,
    active,
    url,
    icon,
    iconSize,
    tabIndex
}: SidebarTabProps) {
    const isTabActive = active || (location.pathname == url);

    return <a
        className={`${styles.sidebarTab} ${className}`}
        href={url}
        tabIndex={tabIndex}
        aria-current={isTabActive ? "page" : undefined}
        style={{
            ...style,
            backdropFilter: isTabActive ? "brightness(1.2)" : "",
            boxShadow: isTabActive ? "inset 0 -2px 0 0 var(--ui-blue)" : undefined
        }}
    >
        {icon && <img
            src={icon}
            height={iconSize || defaultIconSize}
            alt=""
            aria-hidden="true"
        />}

        {children}
    </a>;
}

export default SidebarTab;
