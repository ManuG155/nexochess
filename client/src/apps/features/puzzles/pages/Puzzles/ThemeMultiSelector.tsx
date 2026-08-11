import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    PuzzleCatalogue,
    PuzzleThemeCategory,
    PuzzleThemeSelection
} from "../../types";
import {
    formatOpeningTag,
    formatPuzzleTheme,
    getPuzzleFilterOptions,
    puzzleThemeCategories
} from "../../lib/themeCatalogue";

interface ThemeMultiSelectorProps {
    catalogue?: PuzzleCatalogue;
    selections: PuzzleThemeSelection[];
    onChange: (next: PuzzleThemeSelection[]) => void;
}

function selectionKey(selection: PuzzleThemeSelection) {
    return [
        selection.category,
        selection.kind || "category",
        selection.value || "all"
    ].join(":");
}

function ThemeMultiSelector({
    catalogue,
    selections,
    onChange
}: ThemeMultiSelectorProps) {
    const { t, i18n } = useTranslation("puzzles");
    const [openingSearch, setOpeningSearch] = useState("");
    const language = i18n.resolvedLanguage || "en";
    const selectedKeys = useMemo(
        () => new Set(selections.map(selectionKey)),
        [selections]
    );
    const categories = puzzleThemeCategories.filter(
        value => value != "all"
    );
    const mixedSelected = selections.some(
        selection => selection.category == "all"
    );

    function selectMixed() {
        onChange([{ category: "all" }]);
    }

    function selectWholeCategory(category: PuzzleThemeCategory) {
        const next = selections.filter(selection => (
            selection.category != "all"
            && selection.category != category
        ));

        onChange([
            ...next,
            { category }
        ]);
    }

    function toggleSpecific(
        category: PuzzleThemeCategory,
        kind: "theme" | "opening",
        value: string
    ) {
        const key = selectionKey({ category, kind, value });
        const exists = selectedKeys.has(key);
        const next = selections.filter(selection => (
            selection.category != "all"
            && !(
                selection.category == category
                && !selection.value
            )
            && selectionKey(selection) != key
        ));

        if (!exists) {
            next.push({ category, kind, value });
        }

        onChange(next.length > 0 ? next : [{ category: "all" }]);
    }

    function getCategorySummary(category: PuzzleThemeCategory) {
        const selected = selections.filter(
            selection => selection.category == category
        );

        if (selected.some(selection => !selection.value)) {
            return t("filters.clearSubtheme");
        }

        if (selected.length == 0) return "";

        const labels = selected.slice(0, 2).map(selection => (
            selection.kind == "opening"
                ? formatOpeningTag(selection.value || "", language)
                : formatPuzzleTheme(selection.value || "", language)
        ));

        if (selected.length > 2) labels.push(`+${selected.length - 2}`);

        return labels.join(" · ");
    }

    return <div className="nexo-puzzle-multi-selector">
        <button
            type="button"
            className={[
                "nexo-puzzle-mixed-option",
                mixedSelected ? "nexo-active" : ""
            ].filter(Boolean).join(" ")}
            onClick={selectMixed}
            aria-pressed={mixedSelected}
        >
            <span>{t("themeCategories.all")}</span>
            <small>{t("filters.themeHelp")}</small>
        </button>

        <div className="nexo-puzzle-theme-accordions">
            {categories.map(category => {
                const options = getPuzzleFilterOptions(catalogue, category);
                const categoryAll = selections.some(selection => (
                    selection.category == category
                    && !selection.value
                ));
                const summary = getCategorySummary(category);
                const query = category == "opening"
                    ? openingSearch.trim().toLocaleLowerCase(language)
                    : "";
                const visibleOptions = query
                    ? options.filter(option => (
                        formatOpeningTag(option.value, language)
                            .toLocaleLowerCase(language)
                            .includes(query)
                    ))
                    : options;

                return <details
                    key={category}
                    className="nexo-puzzle-theme-section"
                >
                    <summary>
                        <span>{t(`themeCategories.${category}`)}</span>
                        <small>{summary}</small>
                    </summary>

                    <div className="nexo-puzzle-theme-section-body">
                        {category == "opening" && options.length > 8 && (
                            <input
                                type="search"
                                value={openingSearch}
                                onChange={event => (
                                    setOpeningSearch(event.target.value)
                                )}
                                placeholder={t("filters.openingSearch")}
                                aria-label={t("filters.openingSearch")}
                            />
                        )}

                        <button
                            type="button"
                            className={categoryAll ? "nexo-active" : ""}
                            onClick={() => selectWholeCategory(category)}
                            aria-pressed={categoryAll}
                        >
                            <span>{t("filters.clearSubtheme")}</span>
                        </button>

                        <div className="nexo-puzzle-theme-option-list">
                            {visibleOptions.map(option => {
                                const active = selectedKeys.has(selectionKey({
                                    category,
                                    kind: option.kind,
                                    value: option.value
                                }));

                                return <button
                                    type="button"
                                    key={`${option.kind}:${option.value}`}
                                    className={active ? "nexo-active" : ""}
                                    onClick={() => toggleSpecific(
                                        category,
                                        option.kind,
                                        option.value
                                    )}
                                    aria-pressed={active}
                                >
                                    <span>
                                        {option.kind == "opening"
                                            ? formatOpeningTag(
                                                option.value,
                                                language
                                            )
                                            : formatPuzzleTheme(
                                                option.value,
                                                language
                                            )
                                        }
                                    </span>
                                    {option.count > 0 && (
                                        <small>{option.count}</small>
                                    )}
                                </button>;
                            })}
                        </div>
                    </div>
                </details>;
            })}
        </div>
    </div>;
}

export default ThemeMultiSelector;
