import React from "react";
import { useTranslation } from "react-i18next";
import { HexColorPicker, HexColorInput } from "react-colorful";

import ColourSwatchProps from "./ColourSwatchProps";
import * as styles from "./ColourSwatch.module.css";

function ColourSwatch({
    colour,
    onColourChange,
    open,
    onToggle
}: ColourSwatchProps) {
    const { t } = useTranslation("settings");

    return <div className={styles.wrapper}>
        <div
            className={styles.swatch}
            style={{
                backgroundColor: colour || "white"
            }}
            onClick={event => {
                onToggle?.(!open);
                event.stopPropagation();
            }}
        />

        {
            open
            && <div
                className={styles.picker}
                onClick={event => event.stopPropagation()}
            >
                <HexColorPicker
                    color={colour}
                    onChange={onColourChange}
                />

                <HexColorInput
                    className={styles.pickerInput}
                    color={colour}
                    onChange={onColourChange}
                    placeholder={t("appearance.boardTheme.colourPlaceholder")}
                />
            </div>
        }
    </div>;
}

export default ColourSwatch;