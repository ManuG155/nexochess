import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { Chess } from "chess.js";
import { useTranslation } from "react-i18next";

import { Classification } from "shared/constants/Classification";
import PieceColour from "shared/constants/PieceColour";
import type { StateTreeNode } from
    "shared/types/game/position/StateTreeNode";

import useSettingsStore from
    "@/stores/SettingsStore";

import useAnalysisBoardStore from
    "@analysis/stores/AnalysisBoardStore";

import {
    getCoachById
} from "@analysis/lib/coach";

import {
    getDynamicCoachComment
} from "@analysis/lib/coachComment";

import {
    getDetailedCoachComment
} from "@analysis/lib/coachCommentDetailed";

import {
    getCoachTacticInsight,
    shouldSuppressCoachLineNotation
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

interface InlineTacticSentence {
    prefix: string;
    label: string;
    suffix: string;
}

function normaliseLanguage(language?: string) {
    return language?.toLowerCase().replace("_", "-").split("-")[0] || "en";
}

function inlineTacticSentence(
    prefix: string,
    label: string,
    language?: string
): InlineTacticSentence {
    const cleanPrefix = prefix.replace(/[:：]\s*$/, "").trimEnd();
    const languageKey = normaliseLanguage(language);
    let connector = " through a ";

    if (languageKey == "es") {
        connector = label == "táctica"
            ? " mediante una "
            : " mediante un ";
    } else if (languageKey == "fr") {
        connector = (
            label == "fourchette"
            || label == "tactique"
        )
            ? " grâce à une "
            : " grâce à un ";
    } else if (languageKey == "de") {
        connector = (
            label == "Gabel"
            || label == "Taktik"
        )
            ? " durch eine "
            : " durch ein ";
    } else if (languageKey == "pt") {
        connector = label == "tática"
            ? " por uma "
            : " por um ";
    } else if (languageKey == "ru") {
        connector = " через ";
    } else if (languageKey == "zh") {
        connector = "，关键是";
    } else if (languageKey == "vi") {
        connector = " nhờ ";
    } else if (languageKey == "hi") {
        connector = " के जरिए ";
    } else if (languageKey == "mr") {
        connector = " द्वारे ";
    } else if (languageKey == "pl") {
        connector = " dzięki ";
    }

    return {
        prefix: `${cleanPrefix}${connector}`,
        label,
        suffix: "."
    };
}

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

    const message = useMemo(() => {
        const suppressLineNotation = !tacticInsight
            && shouldSuppressCoachLineNotation(
                currentNode,
                classification
            );

        const statusLine = suppressLineNotation
            ? getDynamicCoachComment(
                currentNode,
                classification,
                coach.id,
                t
            )
            : getDetailedCoachComment(
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
        tacticInsight,
        t
    ]);

    const tacticSentence = tacticInsight
        ? inlineTacticSentence(
            tacticInsight.prefix,
            tacticInsight.label,
            i18n.resolvedLanguage
        )
        : undefined;

    const spokenMessage = tacticSentence
        ? `${tacticSentence.prefix}${tacticSentence.label}${tacticSentence.suffix}`
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
        const sequenceNodes: StateTreeNode[] = [];
        const playbackId = Date.now();

        for (const [index, uci] of tacticInsight.uciMoves.entries()) {
            try {
                const move = new Chess(cursor.state.fen).move(uci);
                const node: StateTreeNode = {
                    id: `coach-pv-${playbackId}-${index}`,
                    mainline: false,
                    parent: cursor,
                    children: [],
                    state: {
                        fen: move.after,
                        engineLines: [],
                        move: {
                            san: move.san,
                            uci: move.lan
                        },
                        moveColour: move.color == "w"
                            ? PieceColour.WHITE
                            : PieceColour.BLACK,
                        /*
                         * These are detached principal-variation playback
                         * nodes. Every ply comes directly from Stockfish's
                         * selected PV, so it must never inherit an OK/error
                         * classification from an unrelated real-game node.
                         */
                        classification: Classification.BEST
                    }
                };

                cursor = node;
                sequenceNodes.push(node);
            } catch {
                break;
            }
        }

        if (sequenceNodes.length != tacticInsight.uciMoves.length) return;

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
                    {tacticInsight && tacticSentence ? (
                        <span>
                            {tacticSentence.prefix}
                            <button
                                type="button"
                                className={styles.tacticButton}
                                onClick={playTacticSequence}
                                title={tacticInsight.actionTitle}
                                aria-label={tacticInsight.actionTitle}
                            >
                                {tacticSentence.label}
                            </button>
                            {tacticSentence.suffix}
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
