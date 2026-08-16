import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import useSettingsStore from "@/stores/SettingsStore";

import {
    CoachId,
    CoachOption,
    coachOptions,
    getCoachById,
    getCoachPickerLine
} from "@analysis/lib/coach";

import CoachPortrait from "../CoachPortrait";

import * as styles from "./CoachPicker.module.css";

interface CoachPickerProps {
    selectedCoach: CoachOption;
    onClose: () => void;
    onConfirm: (coachId: CoachId) => void;
    forceVisible?: boolean;
}

function CoachPicker({
    selectedCoach,
    onClose,
    onConfirm,
    forceVisible = false
}: CoachPickerProps) {
    const { t, i18n } = useTranslation("coach", {
        useSuspense: false
    });

    const [ pendingCoachId, setPendingCoachId ] = useState<CoachId>(
        selectedCoach.id
    );

    const coachSettings = useSettingsStore(
        state => state.settings.coach
    );

    const pickerLines = useMemo<Record<CoachId, string>>(() => (
        Object.fromEntries(
            coachOptions.map(coach => [
                coach.id,
                getCoachPickerLine(coach, t)
            ])
        ) as Record<CoachId, string>
    ), [i18n.resolvedLanguage, t]);

    if (!forceVisible && !coachSettings.enabled) return null;

    const pendingCoach = getCoachById(pendingCoachId);
    const pickerLine = pickerLines[pendingCoachId];

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
        >
            <div
                className={styles.dialog}
                onClick={event => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="coach-picker-title"
            >
                <div className={styles.header}>
                    <div>
                        <span className={styles.kicker}>
                            NexoChess
                        </span>
                        <h3
                            id="coach-picker-title"
                            className={styles.title}
                        >
                            {t("picker.title")}
                        </h3>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label={t("picker.close")}
                    >
                        ×
                    </button>
                </div>

                <div className={styles.lead}>
                    <CoachPortrait
                        className={styles.leadImage}
                        coach={pendingCoach}
                        speechText={
                            coachSettings.animations
                                ? pickerLine
                                : ""
                        }
                        animationsEnabled={coachSettings.animations}
                    />

                    <div className={styles.leadBubble}>
                        {pickerLine}
                    </div>
                </div>

                <div className={styles.grid}>
                    {coachOptions.map(coach => {
                        const isActive = coach.id == pendingCoachId;

                        return (
                            <button
                                key={coach.id}
                                type="button"
                                className={[
                                    styles.card,
                                    isActive ? styles.cardActive : ""
                                ].filter(Boolean).join(" ")}
                                onClick={() => setPendingCoachId(coach.id)}
                                aria-pressed={isActive}
                            >
                                <div className={styles.cardImageWrap}>
                                    <img
                                        className={styles.cardImage}
                                        src={coach.imagePath}
                                        alt={coach.name}
                                    />

                                    {isActive && (
                                        <span className={styles.check}>
                                            ✓
                                        </span>
                                    )}
                                </div>

                                <span className={styles.cardName}>
                                    {coach.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className={styles.confirmButton}
                    onClick={() => onConfirm(pendingCoachId)}
                >
                    {t("picker.select")}
                </button>
            </div>
        </div>
    );
}

export default CoachPicker;
