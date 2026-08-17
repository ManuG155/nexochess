import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { Chess } from "chess.js";
import { useTranslation } from "react-i18next";

import {
    addChildMove
} from "shared/types/game/position/StateTreeNode";

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
    getCoachTacticInsight
} from "@analysis/lib/coachTacticInsight";

import {
    addOccasionalCoachCatchphrase
} from "@analysis/lib/coachSpeech";

import playBoardSound from "@/lib/boardSounds";

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

    const {
        currentStateTreeNode: currentNode,
        currentStateTreeNodeUpdate,
        setCurrentStateTreeNode,
        dispatchCurrentNodeUpdate,
        setAutoplayEnabled
    } = useAnalysisBoardStore();

    const [isCoachPickerOpen, setIsCoachPickerOpen] =
        useState(false);

    const playbackTimersRef = useRef<number[]>([]);

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
        currentStateTreeNodeUpdate,
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

    const tacticInsight = useMemo(
        () => getCoachTacticInsight(
            currentNode,
            classification,
            i18n.resolvedLanguage
        ),
        [
            currentNode.state.fen,
            currentStateTreeNodeUpdate,
            currentNode.state.engineLines?.length ?? 0,
            currentNode.parent?.state.engineLines?.length ?? 0,
            classification,
            i18n.resolvedLanguage
        ]
    );

    const spokenMessage = tacticInsight
        ? `${tacticInsight.prefix}${tacticInsight.label}${tacticInsight.suffix}`
        : message;

    function clearTacticPlayback() {
        for (const timer of playbackTimersRef.current) {
            window.clearTimeout(timer);
        }

        playbackTimersRef.current = [];
    }

    function playTacticSequence() {
        if (!tacticInsight) return;

        clearTacticPlayback();
        setAutoplayEnabled(false);

        let cursor = tacticInsight.startNode;
        const sequenceNodes = [];

        for (const uci of tacticInsight.uciMoves) {
            try {
                const move = new Chess(cursor.state.fen).move(uci);
                cursor = addChildMove(cursor, move.san);
                sequenceNodes.push(cursor);
            } catch {
                break;
            }
        }

        if (sequenceNodes.length == 0) return;

        dispatchCurrentNodeUpdate();
        setCurrentStateTreeNode(tacticInsight.startNode);

        sequenceNodes.forEach((node, index) => {
            const timer = window.setTimeout(() => {
                setCurrentStateTreeNode(node);
                playBoardSound(node);
            }, (index + 1) * 1000);

            playbackTimersRef.current.push(timer);
        });
    }

    useEffect(() => () => {
        clearTacticPlayback();
    }, []);

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
                                ? spokenMessage
                                : ""
                        }
                        animationsEnabled={settings.coach.animations}
                    />
                </button>

                <div
                    className={styles.bubble}
                    aria-live="polite"
                >
                    {tacticInsight ? (
                        <span>
                            {tacticInsight.prefix}
                            <button
                                type="button"
                                className={styles.tacticButton}
                                onClick={playTacticSequence}
                                title={tacticInsight.actionTitle}
                                aria-label={tacticInsight.actionTitle}
                            >
                                {tacticInsight.label}
                            </button>
                            {tacticInsight.suffix}
                        </span>
                    ) : message}
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
