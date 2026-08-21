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
import type {
    StateTreeNode
} from "shared/types/game/position/StateTreeNode";

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
    getStrictCoachTacticInsight
} from "@analysis/lib/coachTacticInsightStrict";

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

function isSanToken(value: string): boolean {
    const token = value
        .replace(/^[([{"'“”¿¡]+/, "")
        .replace(/[\])},.;:!?"'“”]+$/, "");

    return /^(?:O-O(?:-O)?|[KQRBN][a-h1-8]{0,2}x?[a-h][1-8](?:=[QRBN])?[+#]?|[a-h](?:x[a-h])?[1-8](?:=[QRBN])?[+#]?)$/.test(token);
}

/*
 * The detailed-comment generator predates the interactive tactic buttons and
 * can still produce an engine line in SAN. Do not surface a raw sequence in
 * the speech bubble: when two or more SAN moves are written consecutively,
 * fall back to the normal human classification comment instead.
 */
function containsRawMoveSequence(text: string): boolean {
    let consecutiveMoves = 0;

    for (const token of text.split(/\s+/)) {
        if (token == "..." || token == "…") continue;

        if (isSanToken(token)) {
            consecutiveMoves += 1;
            if (consecutiveMoves >= 2) return true;
        } else {
            consecutiveMoves = 0;
        }
    }

    return false;
}

function createTacticPlaybackNode(
    parent: StateTreeNode,
    uci: string,
    index: number
): StateTreeNode | undefined {
    try {
        const move = new Chess(parent.state.fen).move(uci);

        return {
            id: `coach-tactic-${Date.now()}-${index}-${move.lan}`,
            mainline: false,
            parent,
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
                 * These detached nodes reproduce Stockfish's principal
                 * variation. They are not moves played by the user, so they
                 * must never inherit OK/inaccuracy/error classifications from
                 * the analysed game.
                 */
                classification: Classification.BEST
            }
        };
    } catch {
        return;
    }
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

    const message = useMemo(() => {
        const detailedStatusLine = getDetailedCoachComment(
            currentNode,
            classification,
            coach.id,
            t,
            i18n.resolvedLanguage
        );
        const statusLine = containsRawMoveSequence(detailedStatusLine)
            ? getDynamicCoachComment(
                currentNode,
                classification,
                coach.id,
                t
            )
            : detailedStatusLine;
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
        () => getStrictCoachTacticInsight(
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

        for (
            let index = 0;
            index < tacticInsight.uciMoves.length;
            index += 1
        ) {
            const nextNode = createTacticPlaybackNode(
                cursor,
                tacticInsight.uciMoves[index],
                index
            );

            if (!nextNode) break;

            cursor = nextNode;
            sequenceNodes.push(cursor);
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