import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { clamp, floor } from "lodash-es";

import EngineVersion from "shared/constants/EngineVersion";
import EngineArrowType from "@analysis/constants/EngineArrowType";

import useSettingsStore from "@/stores/SettingsStore";
import DropdownSetting from "@/components/settings/DropdownSetting";
import NumberSetting from "@/components/settings/NumberSetting";
import SwitchSetting from "@/components/settings/SwitchSetting";
import Separator from "@/components/common/Separator";

import * as categoryStyles from "../Category.module.css";
import * as styles from "./Analysis.module.css";

const engineVersionOptions = [
    {
        label: "Stockfish 17 (68 MB)",
        value: EngineVersion.STOCKFISH_17
    },
    {
        label: "Stockfish 17 Lite",
        value: EngineVersion.STOCKFISH_17_LITE
    },
    {
        label: "Stockfish 17 (Compatibility)",
        value: EngineVersion.STOCKFISH_17_ASM
    }
];

const arrowColours = [
    { name: "green", value: "#97bf5b" },
    { name: "orange", value: "#f1b24a" },
    { name: "blue", value: "#77aee6" },
    { name: "red", value: "#e58a8a" },
    { name: "purple", value: "#b59be8" }
];

function Analysis() {
    const { t, i18n } = useTranslation([
        "settings",
        "analysis",
        "common"
    ]);

    const { settings, setSettings } = useSettingsStore();

    const engineArrowOptions = useMemo(() => [
        {
            label: t("disabled", { ns: "common" }),
            value: EngineArrowType.DISABLED
        },
        {
            label: t(
                "settings.engine.suggestionArrows.continuation",
                { ns: "analysis" }
            ),
            value: EngineArrowType.TOP_CONTINUATION
        }
    ], [i18n.language]);

    const arrowStyle = settings.analysis.arrowStyle;

    return (
    <div className={categoryStyles.wrapper}>

        {/* ENGINE */}
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
                {t("settings.engine.title", { ns: "analysis" })}
            </h2>

            <div className={styles.sectionContent}>

                <div className={styles.valueSetting}>
                    <span>{t("enabled", { ns: "common" })}</span>

                    <SwitchSetting
                        defaultChecked={
                            settings.analysis.engine.enabled
                        }
                        onChange={checked => setSettings(draft => {
                            draft.analysis.engine.enabled = checked;
                            return draft;
                        })}
                    />
                </div>

                <div className={styles.valueSetting}>
                    <span>
                        {t(
                            "settings.engine.version",
                            { ns: "analysis" }
                        )}
                    </span>

                    <DropdownSetting
                        options={engineVersionOptions}
                        defaultValue={engineVersionOptions.find(
                            option => (
                                option.value
                                == settings.analysis.engine.version
                            )
                        )}
                        onSelect={option => {
                            if (!option) return;

                            setSettings(draft => {
                                draft.analysis.engine.version =
                                    option.value;

                                return draft;
                            });
                        }}
                        dropdownStyle={{ width: "200px" }}
                    />
                </div>

                <div className={styles.valueSetting}>
                    <span>
                        {t(
                            "settings.engine.depth",
                            { ns: "analysis" }
                        )}
                    </span>

                    <NumberSetting
                        min={10}
                        max={99}
                        defaultValue={
                            settings.analysis.engine.depth
                        }
                        onChange={value => setSettings(draft => {
                            draft.analysis.engine.depth = floor(
                                clamp(value, 10, 99)
                            );

                            return draft;
                        })}
                        style={{ width: "120px" }}
                    />
                </div>

                <div className={styles.valueSetting}>
                    <span>
                        {t(
                            "settings.engine.lines",
                            { ns: "analysis" }
                        )}
                    </span>

                    <NumberSetting
                        min={1}
                        max={5}
                        defaultValue={
                            settings.analysis.engine.lines
                        }
                        onChange={value => setSettings(draft => {
                            draft.analysis.engine.lines = floor(
                                clamp(value, 1, 5)
                            );

                            return draft;
                        })}
                        style={{ width: "120px" }}
                    />
                </div>

                <div className={styles.valueSetting}>
                    <span>
                        {t(
                            "settings.engine.suggestionArrows.title",
                            { ns: "analysis" }
                        )}
                    </span>

                    <DropdownSetting
                        options={engineArrowOptions}
                        defaultValue={engineArrowOptions.find(
                            option => (
                                option.value
                                == settings.analysis.engine
                                    .suggestionArrows
                            )
                        )}
                        onSelect={option => {
                            if (!option) return;

                            setSettings(draft => {
                                draft.analysis.engine
                                    .suggestionArrows =
                                    option.value;

                                return draft;
                            });
                        }}
                        dropdownStyle={{ width: "200px" }}
                    />
                </div>

            </div>
        </section>


        <hr className={styles.sectionSeparator} />


        {/* ARROW APPEARANCE */}
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
                {t("analysis.arrowAppearance")}
            </h2>

            <div className={styles.sectionContent}>

                <div className={styles.valueSetting}>
                    <span>
                        {t("analysis.arrowWidth")}
                    </span>

                    <NumberSetting
                        min={4}
                        max={40}
                        defaultValue={arrowStyle.width}
                        onChange={value => setSettings(draft => {
                            draft.analysis.arrowStyle.width =
                                floor(clamp(value, 4, 40));

                            return draft;
                        })}
                        style={{ width: "120px" }}
                    />
                </div>

                <div className={styles.valueSetting}>
                    <span>
                        {t("analysis.headLength")}
                    </span>

                    <NumberSetting
                        min={8}
                        max={64}
                        defaultValue={arrowStyle.headLength}
                        onChange={value => setSettings(draft => {
                            draft.analysis.arrowStyle.headLength =
                                floor(clamp(value, 8, 64));

                            return draft;
                        })}
                        style={{ width: "120px" }}
                    />
                </div>

                <div className={styles.valueSetting}>
                    <span>
                        {t("analysis.headWidth")}
                    </span>

                    <NumberSetting
                        min={8}
                        max={64}
                        defaultValue={arrowStyle.headWidth}
                        onChange={value => setSettings(draft => {
                            draft.analysis.arrowStyle.headWidth =
                                floor(clamp(value, 8, 64));

                            return draft;
                        })}
                        style={{ width: "120px" }}
                    />
                </div>

                <div className={styles.valueSetting}>
                    <span>
                        {t("analysis.bestMoveColour")}
                    </span>

                    <div className={styles.palette}>
                        {arrowColours.map(colour => (
                            <button
                                key={`suggestion-${colour.name}`}
                                type="button"
                                aria-label={colour.name}
                                className={`${styles.swatch} ${
                                    arrowStyle.suggestionColour
                                        == colour.value
                                        ? styles.swatchSelected
                                        : ""
                                }`}
                                style={{
                                    backgroundColor: colour.value
                                }}
                                onClick={() => setSettings(draft => {
                                    draft.analysis.arrowStyle
                                        .suggestionColour =
                                        colour.value;

                                    return draft;
                                })}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.valueSetting}>
                    <span>
                        {t("analysis.manualColour")}
                    </span>

                    <div className={styles.palette}>
                        {arrowColours.map(colour => (
                            <button
                                key={`manual-${colour.name}`}
                                type="button"
                                aria-label={colour.name}
                                className={`${styles.swatch} ${
                                    arrowStyle.manualColour
                                        == colour.value
                                        ? styles.swatchSelected
                                        : ""
                                }`}
                                style={{
                                    backgroundColor: colour.value
                                }}
                                onClick={() => setSettings(draft => {
                                    draft.analysis.arrowStyle
                                        .manualColour =
                                        colour.value;

                                    return draft;
                                })}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </section>


        <hr className={styles.sectionSeparator} />


        {/* OTHER */}
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
                {t("analysis.other")}
            </h2>

            <div className={styles.sectionContent}>
                <div className={styles.valueSetting}>
                    <span>
                        {t(
                            "settings.other.simpleNotation",
                            { ns: "analysis" }
                        )}
                    </span>

                    <SwitchSetting
                        defaultChecked={
                            settings.analysis.simpleNotation
                        }
                        onChange={checked => setSettings(draft => {
                            draft.analysis.simpleNotation =
                                checked;

                            return draft;
                        })}
                    />
                </div>
            </div>
        </section>

    </div>
);
}

export default Analysis;