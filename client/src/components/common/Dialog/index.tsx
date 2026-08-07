import React, { KeyboardEvent, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import BlurBackground from "@/components/layout/BlurBackground";
import Button from "../Button";

import DialogProps from "./DialogProps";
import * as styles from "./Dialog.module.css";

import iconInterfaceClose from "@assets/img/interface/close.svg";

const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
].join(",");

function Dialog({
    children,
    onClose,
    className,
    style,
    closeButtonStyle,
    closeOnBackdrop = false,
    ariaLabel,
    ariaLabelledBy
}: DialogProps) {
    const { t } = useTranslation("common");
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        document.body.style.overflow = "hidden";
        const frame = requestAnimationFrame(() => {
            dialogRef.current
                ?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
                ?.focus();
        });

        return () => {
            cancelAnimationFrame(frame);
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };
    }, []);

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape") {
            event.preventDefault();
            onClose?.();
            return;
        }

        if (event.key !== "Tab") return;

        const focusable = Array.from(
            dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) || []
        ).filter(element => element.offsetParent !== null);

        if (focusable.length === 0) {
            event.preventDefault();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    return <BlurBackground
        className={styles.wrapper}
        onClick={closeOnBackdrop ? onClose : undefined}
    >
        <div
            ref={dialogRef}
            className={`${styles.menu} ${className || ""}`}
            style={style}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel || (ariaLabelledBy ? undefined : "NexoChess")}
            aria-labelledby={ariaLabelledBy}
            onClick={event => event.stopPropagation()}
            onKeyDown={handleKeyDown}
        >
            <Button
                className={styles.closeButton}
                icon={iconInterfaceClose}
                iconSize="30px"
                style={closeButtonStyle}
                ariaLabel={t("dialog.close")}
                onClick={onClose}
            />

            {children}
        </div>
    </BlurBackground>;
}

export default Dialog;
