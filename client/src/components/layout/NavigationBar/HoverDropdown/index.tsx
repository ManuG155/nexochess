import React, {
    CSSProperties,
    FocusEvent,
    KeyboardEvent,
    useCallback,
    useEffect,
    useId,
    useRef,
    useState
} from "react";

import HoverDropdownProps from "./HoverDropdownProps";
import * as styles from "./HoverDropdown.module.css";

function HoverDropdown({
    children,
    dropdownClassName,
    dropdownStyle,
    menuClassName,
    menuStyle,
    menuPosition = "left",
    menuPositionStrategy,
    openStrategy = "hover",
    icon,
    url,
    options = []
}: HoverDropdownProps) {
    const [open, setOpen] = useState(false);
    const menuId = useId();

    const dropdownRef = useRef<HTMLElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const closeMenu = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (openStrategy != "click" || !open) return;

        document.addEventListener("click", closeMenu);
        return () => document.removeEventListener("click", closeMenu);
    }, [open, openStrategy, closeMenu]);

    useEffect(() => {
        document.addEventListener("scroll", closeMenu);
        return () => document.removeEventListener("scroll", closeMenu);
    }, [closeMenu]);

    function toggleMenu(event: React.MouseEvent) {
        if (openStrategy != "click") return;
        event.stopPropagation();
        setOpen(current => !current);
    }

    function handleTriggerKeyDown(event: KeyboardEvent<HTMLElement>) {
        if (event.key === "Escape") {
            closeMenu();
            return;
        }

        if (options.length === 0) return;
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            if (url && openStrategy != "click") return;
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => {
                wrapperRef.current
                    ?.querySelector<HTMLElement>('[role="menuitem"]')
                    ?.focus();
            });
        }
    }

    function handleBlur(event: FocusEvent<HTMLDivElement>) {
        if (openStrategy != "hover") return;
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            closeMenu();
        }
    }

    const triggerContent = <>
        {icon && <img src={icon} style={{ width: "25px" }} alt="" aria-hidden="true" />}
        {children}
    </>;

    const triggerProps = {
        className: `${styles.dropdown} ${dropdownClassName}`,
        style: dropdownStyle,
        onMouseEnter: () => {
            if (openStrategy == "hover") setOpen(true);
        },
        onKeyDown: handleTriggerKeyDown,
        "aria-haspopup": options.length > 0 ? "menu" as const : undefined,
        "aria-expanded": options.length > 0 ? open : undefined,
        "aria-controls": options.length > 0 ? menuId : undefined
    };

    function getMenuPosition(): CSSProperties {
        const dropdownRect = dropdownRef.current?.getBoundingClientRect();

        if (!dropdownRect || menuPositionStrategy == "absolute") {
            return { position: "absolute", left: 0 };
        }

        return {
            position: "fixed",
            top: dropdownRect.top + dropdownRect.height,
            ...(menuPosition == "left"
                ? { left: dropdownRect.left }
                : { right: document.body.offsetWidth - dropdownRect.right }
            ),
            width: dropdownRect.width
        };
    }

    return <div
        ref={wrapperRef}
        className={styles.wrapper}
        style={{ cursor: (url || openStrategy == "click") ? "pointer" : "default" }}
        onMouseLeave={() => {
            if (openStrategy == "hover") setOpen(false);
        }}
        onFocus={() => {
            if (openStrategy == "hover" && options.length > 0) setOpen(true);
        }}
        onBlur={handleBlur}
        onKeyDown={event => {
            if (event.key === "Escape") {
                event.stopPropagation();
                closeMenu();
                dropdownRef.current?.focus();
            }
        }}
    >
        {url ? <a
            {...triggerProps}
            ref={node => {
                dropdownRef.current = node;
            }}
            href={url}
        >
            {triggerContent}
        </a> : <button
            {...triggerProps}
            ref={node => {
                dropdownRef.current = node;
            }}
            type="button"
            onClick={toggleMenu}
        >
            {triggerContent}
        </button>}

        {open && <div
            id={menuId}
            className={`${styles.menu} ${menuClassName}`}
            style={{ ...getMenuPosition(), ...menuStyle }}
            role="menu"
        >
            {options.map((opt, index) => opt.url ? <a
                key={index}
                className={styles.item}
                href={opt.url}
                onClick={opt.onClick}
                role="menuitem"
            >
                {opt.icon && <img src={opt.icon} alt="" aria-hidden="true" />}
                {opt.label}
            </a> : <button
                key={index}
                type="button"
                className={styles.item}
                onClick={opt.onClick}
                role="menuitem"
            >
                {opt.icon && <img src={opt.icon} alt="" aria-hidden="true" />}
                {opt.label}
            </button>)}
        </div>}
    </div>;
}

export default HoverDropdown;
