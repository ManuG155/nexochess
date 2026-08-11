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
    const categories = puzzleThemeCategories.filter(
        value => value != "all"
    );
    const firstSpecificCategory = selections.find(
        selection => selection.category != "all"
    )?.category;
    const [activeCategory, setActiveCategory] = useState<PuzzleThemeCategory>(
        firstSpecificCategory || categories[0]
    );
    const [openingSearch, setOpeningSearch] = useState("");
    const language = i18n.resolvedLanguage || "en";
    const selectedKeys = useMemo(
        () => new Set(selections.map(selectionKey)),
        [selections]
    );
    const mixedSelected = selections.some(
        selection => selection.category == "all"
    );
    const activeOptions = getPuzzleFilterOptions(catalogue, activeCategory);
    const activeCategoryAll = selections.some(selection => (
        selection.category == activeCategory
        && !selection.value
    ));
    const query = activeCategory == "opening"
        ? openingSearch.trim().toLocaleLowerCase(language)
        : "";
    const visibleOptions = query
        ? activeOptions.filter(option => (
            formatOpeningTag(option.value, language)
                .toLocaleLowerCase(language)
                .includes(query)
        ))
        : activeOptions;

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

    function categorySelectionCount(category: PuzzleThemeCategory) {
        return selections.filter(
            selection => selection.category == category
        ).length;
    }

    function getActiveSummary() {
        const selected = selections.filter(
            selection => selection.category == activeCategory
        );

        if (selected.some(selection => !selection.value)) {
            return t("filters.clearSubtheme");
        }

        if (selected.length == 0) {
            return t("filters.subthemeHelp");
        }

        const labels = selected.slice(0, 3).map(selection => (
            selection.kind == "opening"
                ? formatOpeningTag(selection.value || "", language)
                : formatPuzzleTheme(selection.value || "", language)
        ));

        if (selected.length > 3) {
            labels.push(`+${selected.length - 3}`);
        }

        return labels.join(" · ");
    }

    return <div className="nexo-puzzle-multi-selector nexo-puzzle-theme-picker">
        <div className="nexo-puzzle-theme-tabs" role="tablist">
            <button
                type="button"
                className={[
                    "nexo-puzzle-theme-tab",
                    "nexo-puzzle-theme-tab-mixed",
                    mixedSelected ? "nexo-active" : ""
                ].filter(Boolean).join(" ")}
                onClick={selectMixed}
                aria-pressed={mixedSelected}
            >
                {t("themeCategories.all")}
            </button>

            {categories.map(category => {
                const count = categorySelectionCount(category);
                const active = activeCategory == category;

                return <button
                    type="button"
                    key={category}
                    className={[
                        "nexo-puzzle-theme-tab",
                        active ? "nexo-current" : "",
                        count > 0 ? "nexo-has-selection" : ""
                    ].filter(Boolean).join(" ")}
                    onClick={() => {
                        setActiveCategory(category);
                        if (category != "opening") setOpeningSearch("");
                    }}
                    aria-selected={active}
                    role="tab"
                >
                    <span>{t(`themeCategories.${category}`)}</span>
                    {count > 0 && <small>{count}</small>}
                </button>;
            })}
        </div>

        <section
            className="nexo-puzzle-theme-panel"
            role="tabpanel"
            aria-label={t(`themeCategories.${activeCategory}`)}
        >
            <header className="nexo-puzzle-theme-panel-head">
                <div>
                    <strong>{t(`themeCategories.${activeCategory}`)}</strong>
                    <span>{getActiveSummary()}</span>
                </div>
                <button
                    type="button"
                    className={activeCategoryAll ? "nexo-active" : ""}
                    onClick={() => selectWholeCategory(activeCategory)}
                    aria-pressed={activeCategoryAll}
                >
                    {t("filters.clearSubtheme")}
                </button>
            </header>

            {activeCategory == "opening" && activeOptions.length > 8 && (
                <input
                    type="search"
                    value={openingSearch}
                    onChange={event => setOpeningSearch(event.target.value)}
                    placeholder={t("filters.openingSearch")}
                    aria-label={t("filters.openingSearch")}
                    className="nexo-puzzle-theme-search"
                />
            )}

            <div className="nexo-puzzle-theme-options-grid">
                {visibleOptions.map(option => {
                    const active = selectedKeys.has(selectionKey({
                        category: activeCategory,
                        kind: option.kind,
                        value: option.value
                    }));

                    return <button
                        type="button"
                        key={`${option.kind}:${option.value}`}
                        className={active ? "nexo-active" : ""}
                        onClick={() => toggleSpecific(
                            activeCategory,
                            option.kind,
                            option.value
                        )}
                        aria-pressed={active}
                    >
                        <span>
                            {option.kind == "opening"
                                ? formatOpeningTag(option.value, language)
                                : formatPuzzleTheme(option.value, language)
                            }
                        </span>
                        {option.count > 0 && <small>{option.count}</small>}
                    </button>;
                })}
            </div>
        </section>
    </div>;
}

export default ThemeMultiSelector;
