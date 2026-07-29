import React, { useEffect } from "react";

import BlurBackground from "@/components/layout/BlurBackground";
import Button from "../Button";

import DialogProps from "./DialogProps";
import * as styles from "./Dialog.module.css";

import iconInterfaceClose from "@assets/img/interface/close.svg";

function Dialog({
    children,
    onClose,
    className,
    style,
    closeButtonStyle,
    closeOnBackdrop = false
}: DialogProps) {
    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    return <BlurBackground
    className={styles.wrapper}
    onClick={closeOnBackdrop ? onClose : undefined}
>
    <div
        className={`${styles.menu} ${className}`}
        style={style}
        onClick={event => event.stopPropagation()}
    >
            <Button
                className={styles.closeButton}
                icon={iconInterfaceClose}
                iconSize="30px"
                style={closeButtonStyle}
                onClick={onClose}
            />

            {children}
        </div>
    </BlurBackground>;
}

export default Dialog;