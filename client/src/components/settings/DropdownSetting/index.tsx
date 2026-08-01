import React from "react";
import { useTranslation } from "react-i18next";
import Select, { components } from "react-select";

import BaseDropdownOption from "./BaseDropdownOption";

import DropdownSettingProps from "./DropdownSettingProps";
import * as styles from "./DropdownSetting.module.css";

const defaultStyles = {
    dropdown: {
        width: "200px",
        minHeight: "42px",
        backgroundColor: "var(--nexo-surface-raised, var(--ui-shade-5))",
        border: "1px solid var(--nexo-line, transparent)",
        borderRadius: "10px",
        boxShadow: "none",
        cursor: "pointer",
        transitionDuration: "0.2s"
    },
    menu: {
        width: "200px",
        zIndex: 100000,
        overflow: "hidden",
        border: "1px solid var(--nexo-line, transparent)",
        borderRadius: "10px",
        backgroundColor: "var(--nexo-surface, var(--ui-shade-4))",
        color: "var(--nexo-text, white)",
        boxShadow: "0 16px 36px var(--nexo-shadow, rgba(0, 0, 0, 0.25))"
    },
    option: {
        minHeight: "38px",
        display: "flex",
        alignItems: "center",
        padding: "8px 12px",
        transitionDuration: "0.15s"
    }
};

function DropdownSetting<Option extends BaseDropdownOption>(
    props: DropdownSettingProps<Option>
) {
    const { t } = useTranslation("common");

    function getMenuOffset() {
        const dropdownWidth = (
            props.dropdownStyle?.width || defaultStyles.dropdown.width
        );
        const menuWidth = props.menuStyle?.width || defaultStyles.menu.width;

        if (props.menuAlignment == "left") {
            return "0px";
        } else if (props.menuAlignment == "center") {
            return `calc((${dropdownWidth} / 2) - (${menuWidth} / 2))`;
        } else {
            return `calc((${menuWidth} * -1) + ${dropdownWidth})`;
        }
    }

    function getLabel(option: BaseDropdownOption) {
        return option.label || t("error");
    }

    return <Select
        options={props.options}
        getOptionLabel={getLabel}
        defaultValue={props.defaultValue}
        onChange={value => props.onSelect?.(value ?? undefined)}
        isSearchable={props.searchable || false}
        styles={{
            control: (baseStyles, state) => ({
                ...baseStyles,
                ...defaultStyles.dropdown,
                borderColor: state.isFocused
                    ? "var(--nexo-line-strong, var(--ui-blue))"
                    : "var(--nexo-line, transparent)",
                boxShadow: state.isFocused
                    ? "0 0 0 2px rgba(70, 125, 232, 0.12)"
                    : "none",
                ...props.dropdownStyle
            }),
            valueContainer: baseStyles => ({
                ...baseStyles,
                padding: "2px 12px"
            }),
            dropdownIndicator: baseStyles => ({
                ...baseStyles,
                color: "var(--nexo-text-muted, rgba(255, 255, 255, 0.65))",
                ...props.dropdownArrowStyle
            }),
            indicatorSeparator: baseStyles => ({
                ...baseStyles,
                backgroundColor: "var(--nexo-line, rgba(255, 255, 255, 0.12))"
            }),
            singleValue: baseStyles => ({
                ...baseStyles,
                display: "flex",
                alignItems: "center",
                color: "var(--nexo-text, white)",
                ...props.dropdownLabelStyle
            }),
            placeholder: baseStyles => ({
                ...baseStyles,
                color: "var(--nexo-text-muted, rgba(255, 255, 255, 0.55))"
            }),
            menu: baseStyles => ({
                ...baseStyles,
                ...defaultStyles.menu,
                left: getMenuOffset(),
                ...props.menuStyle
            }),
            menuList: baseStyles => ({
                ...baseStyles,
                padding: "6px",
                backgroundColor: "transparent"
            }),
            option: (baseStyles, state) => ({
                ...baseStyles,
                ...defaultStyles.option,
                backgroundColor: state.isSelected
                    ? "rgba(70, 125, 232, 0.18)"
                    : state.isFocused
                        ? "var(--nexo-surface-soft, rgba(255, 255, 255, 0.06))"
                        : "transparent",
                color: "var(--nexo-text, white)",
                cursor: "pointer",
                ...props.optionStyle
            })
        }}
        components={{
            Control: controlProps => <components.Control
                {...controlProps}
                className={props.dropdownClassName}
            />,
            DropdownIndicator: props.dropdownArrowStyle?.display == "none"
                ? null
                : indicatorProps => <components.DropdownIndicator
                    {...indicatorProps}
                    className={props.dropdownArrowClassName}
                />,
            SingleValue: selectedValueProps => (
                <components.SingleValue
                    {...selectedValueProps}
                    className={props.dropdownLabelClassName}
                >
                    {props.dropdownLabelRenderer
                        ? props.dropdownLabelRenderer?.(selectedValueProps.data)
                        : getLabel(selectedValueProps.data)
                    }
                </components.SingleValue>
            ),
            Menu: menuProps => <components.Menu
                {...menuProps}
                className={props.menuClassName}
            />,
            Option: optionProps => <components.Option
                {...optionProps}
                className={`${styles.optionDefault} ${props.optionClassName || ""}`}
            />
        }}
        maxMenuHeight={360}
        menuPlacement="auto"
        menuPosition={props.menuPositionStrategy}
    />;
}

export default DropdownSetting;
