import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chessboard } from "react-chessboard";

import useSettingsStore from "@/stores/SettingsStore";
import languages from "@/i18n/languages";
import ColourSwatch from "@/components/settings/ColourSwatch";
import DropdownSetting from "@/components/settings/DropdownSetting";
import SwitchSetting from "@/components/settings/SwitchSetting";
import Separator from "@/components/common/Separator";
import {
    boardThemePresets,
    createCustomPieces,
    normalisePieceTheme,
    pieceThemePresets,
    PieceAsset,
    PieceCode
} from "@/lib/chessAppearance";

import * as categoryStyles from "../Category.module.css";
import * as styles from "./Appearance.module.css";
import { getColourModeCopy } from "./colourModeCopy";

const INITIAL_FEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const PIECE_PREVIEW = [
    "wN",
    "bK",
    "wQ"
] as PieceCode[];

function Appearance() {
    const { t, i18n } = useTranslation("settings");
    const { settings, setSettings } = useSettingsStore();

    const [
        lightSquareColourSwatchOpen,
        setLightSquareColourSwatchOpen
    ] = useState(false);

    const [
        darkSquareColourSwatchOpen,
        setDarkSquareColourSwatchOpen
    ] = useState(false);

    const selectedPieceTheme = normalisePieceTheme(
        settings.themes.piece
    );

    const previewCustomPieces = useMemo(
        () => createCustomPieces(selectedPieceTheme),
        [ selectedPieceTheme ]
    );

    const languageOptions = useMemo(() => languages.map(language => ({
        label: language.label,
        value: language.id
    })), []);

    const colourModeCopy = useMemo(
        () => getColourModeCopy(
            i18n.resolvedLanguage || i18n.language
        ),
        [i18n.resolvedLanguage, i18n.language]
    );

    const colourModeOptions = useMemo(() => [
        {
            label: colourModeCopy.dark,
            value: "dark" as const
        },
        {
            label: colourModeCopy.light,
            value: "light" as const
        }
    ], [colourModeCopy]);

    const coordinateOptions = useMemo(() => [
        {
            label: t("appearance.coordinates.inside"),
            value: "inside" as const
        },
        {
            label: t("appearance.coordinates.outside"),
            value: "outside" as const
        }
    ], [i18n.language]);

    function setBoardColours(light: string, dark: string) {
        setSettings(draft => {
            draft.themes.board.lightSquareColour = light;
            draft.themes.board.darkSquareColour = dark;
            return draft;
        });
    }

    return (
        <div
            className={categoryStyles.wrapper}
            onClick={event => {
                setLightSquareColourSwatchOpen(false);
                setDarkSquareColourSwatchOpen(false);
                event.stopPropagation();
            }}
        >
            <b className={categoryStyles.header}>{t("appearance.title")}</b>

            <Separator className={categoryStyles.separator}/>

            <section className={styles.section}>
                <div className={styles.coordinatesRow}>
                    <div>
                        <h2 className={styles.sectionTitle}>
                            {t("appearance.language.title")}
                        </h2>
                        <p className={styles.sectionDescription}>
                            {t("appearance.language.description")}
                        </p>
                    </div>

                    <DropdownSetting
                        options={languageOptions}
                        defaultValue={languageOptions.find(option => (
                            option.value == (i18n.resolvedLanguage || i18n.language)
                        ))}
                        onSelect={option => {
                            if (!option) return;
                            void i18n.changeLanguage(option.value);
                        }}
                        dropdownStyle={{ width: "180px" }}
                        menuStyle={{ width: "180px" }}
                    />
                </div>
            </section>

            <Separator className={categoryStyles.separator}/>

            <section className={styles.section}>
                <div className={styles.coordinatesRow}>
                    <div>
                        <h2 className={styles.sectionTitle}>
                            {colourModeCopy.title}
                        </h2>
                        <p className={styles.sectionDescription}>
                            {colourModeCopy.description}
                        </p>
                    </div>

                    <DropdownSetting
                        options={colourModeOptions}
                        defaultValue={colourModeOptions.find(
                            option => option.value == settings.appearance.colourMode
                        )}
                        onSelect={option => {
                            if (!option) return;

                            setSettings(draft => {
                                draft.appearance.colourMode = option.value;
                                return draft;
                            });
                        }}
                        dropdownStyle={{ width: "180px" }}
                        menuStyle={{ width: "180px" }}
                    />
                </div>
            </section>

            <Separator className={categoryStyles.separator}/>

            <section className={styles.section}>
                <div className={styles.headingBlock}>
                    <h2 className={styles.sectionTitle}>
                        {t("appearance.boardTheme.title")}
                    </h2>
                    <p className={styles.sectionDescription}>
                        {t("appearance.boardTheme.description")}
                    </p>
                </div>

                <div className={styles.boardThemeGrid}>
                    {boardThemePresets.map(preset => {
                        const translatedLabel = t(
                            `appearance.boardTheme.presets.${preset.name}`,
                            { defaultValue: preset.label }
                        );

                        const selected = (
                            settings.themes.board.lightSquareColour == preset.light
                            && settings.themes.board.darkSquareColour == preset.dark
                        );

                        return (
                            <button
                                key={preset.name}
                                type="button"
                                className={`${styles.themeCard} ${selected ? styles.selected : ""}`}
                                onClick={() => setBoardColours(preset.light, preset.dark)}
                                title={translatedLabel}
                            >
                                <span className={styles.boardSwatch}>
                                    {[0, 1, 2, 3].map(index => (
                                        <span
                                            key={index}
                                            style={{
                                                backgroundColor:
                                                    index == 0 || index == 3
                                                        ? preset.light
                                                        : preset.dark
                                            }}
                                        />
                                    ))}
                                </span>
                                <span className={styles.cardLabel}>
                                    {translatedLabel}
                                </span>
                                {selected && <span className={styles.check}>✓</span>}
                            </button>
                        );
                    })}
                </div>

                <div className={styles.customColours}>
                    <div className={categoryStyles.setting}>
                        <span>{t("appearance.boardTheme.lightSquares")}</span>
                        <ColourSwatch
                            colour={settings.themes.board.lightSquareColour}
                            onColourChange={colour => setSettings(draft => {
                                draft.themes.board.lightSquareColour = colour;
                                return draft;
                            })}
                            open={lightSquareColourSwatchOpen}
                            onToggle={setLightSquareColourSwatchOpen}
                        />
                    </div>

                    <div className={categoryStyles.setting}>
                        <span>{t("appearance.boardTheme.darkSquares")}</span>
                        <ColourSwatch
                            colour={settings.themes.board.darkSquareColour}
                            onColourChange={colour => setSettings(draft => {
                                draft.themes.board.darkSquareColour = colour;
                                return draft;
                            })}
                            open={darkSquareColourSwatchOpen}
                            onToggle={setDarkSquareColourSwatchOpen}
                        />
                    </div>
                </div>
            </section>

            <Separator className={categoryStyles.separator}/>

            <section className={styles.section}>
                <div className={styles.headingBlock}>
                    <h2 className={styles.sectionTitle}>{t("appearance.pieces.title")}</h2>
                    <p className={styles.sectionDescription}>
                        {t("appearance.pieces.description")}
                    </p>
                </div>

                <div className={styles.pieceThemeGrid}>
                    {pieceThemePresets.map(preset => {
                        const selected = selectedPieceTheme == preset.name;

                        return (
                            <button
                                key={preset.name}
                                type="button"
                                className={`${styles.pieceCard} ${selected ? styles.selected : ""}`}
                                onClick={() => setSettings(draft => {
                                    draft.themes.piece = preset.name;
                                    return draft;
                                })}
                                title={preset.label}
                            >
                                <span className={styles.pieceSample}>
                                    {PIECE_PREVIEW.map(piece => (
                                        <PieceAsset
                                            key={piece}
                                            theme={preset.name}
                                            piece={piece}
                                            size={46}
                                        />
                                    ))}
                                </span>
                                <span className={styles.cardLabel}>{preset.label}</span>
                                {selected && <span className={styles.check}>✓</span>}
                            </button>
                        );
                    })}
                </div>

                <p className={styles.pieceNote}>
                    {t("appearance.pieces.note")}
                </p>
            </section>

            <Separator className={categoryStyles.separator}/>

            <section className={styles.section}>
                <div className={styles.coordinatesRow}>
                    <div>
                        <h2 className={styles.sectionTitle}>{t("appearance.coordinates.title")}</h2>
                        <p className={styles.sectionDescription}>
                            {t("appearance.coordinates.description")}
                        </p>
                    </div>

                    <DropdownSetting
                        options={coordinateOptions}
                        defaultValue={coordinateOptions.find(
                            option => option.value == settings.themes.board.coordinates
                        )}
                        onSelect={option => {
                            if (!option) return;

                            setSettings(draft => {
                                draft.themes.board.coordinates = option.value;
                                return draft;
                            });
                        }}
                        dropdownStyle={{ width: "180px" }}
                        menuStyle={{ width: "180px" }}
                    />
                </div>
            </section>

            <Separator className={categoryStyles.separator}/>

            <section className={styles.section}>
                <div className={styles.coordinatesRow}>
                    <div>
                        <h2 className={styles.sectionTitle}>
                            {t("appearance.legalMoves.title")}
                        </h2>
                        <p className={styles.sectionDescription}>
                            {t("appearance.legalMoves.description")}
                        </p>
                    </div>

                    <SwitchSetting
                        defaultChecked={
                            settings.themes.board.legalMoveHints
                        }
                        onChange={checked => {
                            setSettings(draft => {
                                draft.themes.board.legalMoveHints = checked;
                                return draft;
                            });
                        }}
                    />
                </div>
            </section>

            <Separator className={categoryStyles.separator}/>

            <section className={styles.section}>
                <div className={styles.headingBlock}>
                    <h2 className={styles.sectionTitle}>{t("appearance.preview.title")}</h2>
                    <p className={styles.sectionDescription}>
                        {t("appearance.preview.description")}
                    </p>
                </div>

                <div className={styles.previewArea}>
                    <Chessboard
                        id="appearance-preview-board"
                        position={INITIAL_FEN}
                        boardWidth={420}
                        arePiecesDraggable={false}
                        showBoardNotation={false}
                        animationDuration={0}
                        customPieces={previewCustomPieces}
                        customLightSquareStyle={{
                            backgroundColor:
                                settings.themes.board.lightSquareColour
                        }}
                        customDarkSquareStyle={{
                            backgroundColor:
                                settings.themes.board.darkSquareColour
                        }}
                    />
                </div>
            </section>
        </div>
    );
}

export default Appearance;
