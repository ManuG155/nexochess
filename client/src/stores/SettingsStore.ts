import { create } from "zustand";
import { produce } from "immer";
import { cloneDeep, merge } from "lodash-es";
import z from "zod";

import EngineVersion from "shared/constants/EngineVersion";
import EngineArrowType from "@analysis/constants/EngineArrowType";
import LocalStorageKey from "@/constants/LocalStorageKey";

const settingsSchema = z.object({
    analysis: z.object({
        engine: z.object({
            enabled: z.boolean(),
            version: z.enum(EngineVersion),
            depth: z.number().min(10).max(99),
            timeLimitEnabled: z.boolean(),
            timeLimit: z.number().min(0.01),
            lines: z.number().min(1).max(5),
            threads: z.number().min(1).max(64),
            suggestionArrows: z.enum(EngineArrowType)
        }),
        arrowStyle: z.object({
            width: z.number().min(4).max(40),
            headLength: z.number().min(8).max(64),
            headWidth: z.number().min(8).max(64),
            suggestionColour: z.string(),
            manualColour: z.string()
        }),
        classifications: z.object({
            hide: z.boolean(),
            included: z.object({
                brilliant: z.boolean(),
                critical: z.boolean(),
                theory: z.boolean()
            })
        }),
        simpleNotation: z.boolean(),
        showTimer: z.boolean()
    }),
    appearance: z.object({
        colourMode: z.enum(["dark", "light"]),
        selectedCoach: z.enum([
            "fog",
            "foxy",
            "cybe",
            "max_rooks"
        ])
    }),
    coach: z.object({
        enabled: z.boolean(),
        animations: z.boolean()
    }),
    themes: z.object({
        board: z.object({
            darkSquareColour: z.string().regex(/^#.{6}$/),
            lightSquareColour: z.string().regex(/^#.{6}$/),
            coordinates: z.enum(["inside", "outside"]),
            legalMoveHints: z.boolean()
        }),
        piece: z.string()
    }),
    bugReportingMode: z.boolean()
});

type Settings = z.infer<typeof settingsSchema>;
type SettingsReducer = (settings: Settings) => Settings;

export const defaultSettings: Settings = {
    analysis: {
        engine: {
            enabled: true,
            version: EngineVersion.STOCKFISH_17_LITE,
            depth: 16,
            lines: 2,
            timeLimitEnabled: false,
            timeLimit: 1,
            threads: 4,
            suggestionArrows: EngineArrowType.TOP_CONTINUATION
        },
        arrowStyle: {
            width: 16,
            headLength: 32,
            headWidth: 40,
            suggestionColour: "#97bf5b",
            manualColour: "#f1b24a"
        },
        classifications: {
            hide: false,
            included: {
                brilliant: true,
                critical: true,
                theory: true
            }
        },
        simpleNotation: false,
        showTimer: true
    },
    appearance: {
        colourMode: "dark",
        selectedCoach: "fog"
    },
    coach: {
        enabled: true,
        animations: true
    },
    themes: {
        board: {
            darkSquareColour: "#b58863",
            lightSquareColour: "#f0d9b5",
            coordinates: "outside",
            legalMoveHints: true
        },
        piece: "cburnett"
    },
    bugReportingMode: false
};

function fetchSettings() {
    const value = localStorage.getItem(LocalStorageKey.SETTINGS);

    const defaultSettingsCopy = cloneDeep(defaultSettings);

    if (value == null) return defaultSettingsCopy;

    try {
        const storedSettings = JSON.parse(value);

        /*
         * Migrate the previous Appearance > Show coach setting into the
         * dedicated coach section. Existing users keep their choice and
         * animations remain enabled by default. The old voice option is
         * discarded because coach audio no longer exists.
         */
        if (storedSettings.coach == null) {
            storedSettings.coach = {
                enabled: storedSettings.appearance?.showCoach ?? true,
                animations: true
            };
        } else {
            delete storedSettings.coach.voice;
        }

        if (storedSettings.appearance == null) {
            storedSettings.appearance = {};
        }

        storedSettings.appearance.colourMode =
            storedSettings.appearance.colourMode == "light"
                ? "light"
                : "dark";

        return merge(defaultSettingsCopy, storedSettings);
    } catch {
        return defaultSettingsCopy;
    }
}

interface SettingsStore {
    settings: Settings;
    setSettings: (updater: SettingsReducer) => void;
}

const useSettingsStore = create<SettingsStore>((set, get) => ({
    settings: fetchSettings(),

    setSettings(updater) {
        const newSettings = produce(get().settings, updater);

        set({ settings: newSettings });

        localStorage.setItem(
            LocalStorageKey.SETTINGS,
            JSON.stringify(newSettings)
        );
    }
}));

export default useSettingsStore;
