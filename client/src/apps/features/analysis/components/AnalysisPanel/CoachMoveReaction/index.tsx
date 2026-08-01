import React, {
    useMemo,
    useState
} from "react";
import { useTranslation } from "react-i18next";

import useSettingsStore from
    "@/stores/SettingsStore";

import useAnalysisBoardStore from
    "@analysis/stores/AnalysisBoardStore";

import {
    getCoachById
} from "@analysis/lib/coach";

import {
    getDetailedCoachComment
} from "@analysis/lib/coachCommentDetailed";

import {
    addOccasionalCoachCatchphrase
} from "@analysis/lib/coachSpeech";

import CoachPicker from
    "../CoachPicker";

import CoachPortrait from
    "../CoachPortrait";

import * as styles from
    "./CoachMoveReaction.module.css";


function CoachMoveReaction() {
    const { t, i18n } = useTranslation("coach", { useSuspense: false });

    const {
        settings,
        setSettings
    } = useSettingsStore();

    const currentNode = useAnalysisBoardStore(
        state => state.currentStateTreeNode
    );

    const currentNodeUpdate = useAnalysisBoardStore(
        state => state.currentStateTreeNodeUpdate
    );

    const [isCoachPickerOpen, setIsCoachPickerOpen] =
        useState(false);

    const classification =
        currentNode.state.classification;

    const moveSan =
        currentNode.state.move?.san;

    const coach = getCoachById(
        settings.appearance.selectedCoach
    );

    const message = useMemo(() => {
        const statusLine = getDetailedCoachComment(
            currentNode,
            classification,
            coach.id,
            t,
            i18n.resolvedLanguage
        );
        const seed = `${currentNode.state.fen}|${moveSan || "start"}`;

        return addOccasionalCoachCatchphrase(
            coach,
            statusLine,
            seed,
            t
        );
    }, [
        currentNode.state.fen,
        currentNodeUpdate,
        currentNode.state.engineLines?.length ?? 0,
        currentNode.parent?.state.engineLines?.length ?? 0,
        currentNode.state.opening,
        currentNode.parent?.state.opening,
        moveSan,
        classification,
        coach.id,
        i18n.resolvedLanguage,
        t
    ]);

    if (!settings.coach.enabled) {
        return null;
    }

    return (
        <>
            <section className={styles.wrapper}>
                <button
                    type="button"
                    className={styles.portraitButton}
                    onClick={() => setIsCoachPickerOpen(true)}
                    aria-label={t("picker.choose")}
                    title={t("picker.choose")}
                >
                    <CoachPortrait
                        className={styles.portrait}
                        coach={coach}
                        speechText={
                            settings.coach.animations
                                ? message
                                : ""
                        }
                        animationsEnabled={settings.coach.animations}
                    />
                </button>

                <div
                    className={styles.bubble}
                    aria-live="polite"
                >
                    {message}
                </div>
            </section>

            {isCoachPickerOpen && (
                <CoachPicker
                    selectedCoach={coach}
                    onClose={() => setIsCoachPickerOpen(false)}
                    onConfirm={coachId => {
                        setSettings(draft => {
                            draft.appearance.selectedCoach = coachId;
                            return draft;
                        });

                        setIsCoachPickerOpen(false);
                    }}
                />
            )}
        </>
    );
}


export default CoachMoveReaction;
