import React from "react";
import { useTranslation } from "react-i18next";

import TypographyProps from "./TypographyProps";
import * as styles from "./Typography.module.css";

function Typography({
    includeIcon,
    className,
    style,
    iconClassName,
    iconStyle,
    textClassName,
    textStyle,
    onClick
}: TypographyProps) {
    const { t } = useTranslation("common");

    return (
        <div
            className={`${styles.wrapper} ${className || ""}`}
            style={{ cursor: onClick ? "pointer" : undefined, ...style }}
            onClick={onClick}
        >
            {includeIcon && (
                <img
                    className={[
                        styles.iconMark,
                        iconClassName
                    ].filter(Boolean).join(" ")}
                    style={iconStyle}
                    src="/img/nexochess-icon-white.png"
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                />
            )}

            <img
                className={[
                    styles.wordmark,
                    textClassName
                ].filter(Boolean).join(" ")}
                style={textStyle}
                src="/img/nexochess-white.png"
                alt="NexoChess"
                title={`NexoChess — ${t("footer.tagline")}`}
                draggable={false}
            />
        </div>
    );
}

export default Typography;
