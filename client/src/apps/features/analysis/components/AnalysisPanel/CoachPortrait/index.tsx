import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    CoachExpression,
    CoachOption,
    getCoachExpressionPath
} from "@analysis/lib/coach";

import * as styles from "./CoachPortrait.module.css";


interface CoachPortraitProps {
    coach: CoachOption;
    className?: string;
    baseExpression?: CoachExpression;
    speechText?: string;
    animationsEnabled?: boolean;
}

type TransitionKind =
    | "soft"
    | "positive"
    | "negative"
    | "surprised"
    | "blink";

type MouthState = "closed" | "half" | "open";

const BLINK_MIN_DELAY_MS = 4000;
const BLINK_MAX_DELAY_MS = 9000;
const BLINK_DURATION_MS = 105;
const DOUBLE_BLINK_GAP_MS = 95;
const DOUBLE_BLINK_CHANCE = 0.10;
const POSE_TRANSITION_MS = 170;

const transitionClassNames: Record<TransitionKind, string> = {
    soft: styles.transition_soft,
    positive: styles.transition_positive,
    negative: styles.transition_negative,
    surprised: styles.transition_surprised,
    blink: styles.transition_blink
};

const imageReadyPromises = new Map<string, Promise<boolean>>();

function getRandomBlinkDelay() {
    return BLINK_MIN_DELAY_MS
        + Math.random() * (BLINK_MAX_DELAY_MS - BLINK_MIN_DELAY_MS);
}

function getRandomMouthDelay() {
    return 76 + Math.random() * 82;
}

function getSpeechDuration(text: string) {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount <= 10) return 1400;
    if (wordCount <= 24) return 2200;

    return Math.min(3500, 2200 + (wordCount - 24) * 90);
}

const CYBE_REST_WAVES = [22, 38, 56, 38, 22];
const CYBE_WAVE_RANGES: ReadonlyArray<readonly [number, number]> = [
    [18, 46],
    [34, 76],
    [58, 100],
    [34, 76],
    [18, 46]
];

function getRandomCybeWaveHeights() {
    return CYBE_WAVE_RANGES.map(([minimum, maximum]) => (
        minimum + Math.random() * (maximum - minimum)
    ));
}

function getRandomCybeWaveDelay() {
    return 72 + Math.random() * 58;
}

function ensureImageReady(path: string): Promise<boolean> {
    const cachedPromise = imageReadyPromises.get(path);

    if (cachedPromise) {
        return cachedPromise;
    }

    const promise = new Promise<boolean>(resolve => {
        const image = new Image();
        let settled = false;

        const finish = (result: boolean) => {
            if (settled) return;
            settled = true;
            resolve(result);
        };

        const decodeImage = () => {
            if (typeof image.decode != "function") {
                finish(true);
                return;
            }

            image.decode()
                .then(() => finish(true))
                .catch(() => finish(image.naturalWidth > 0));
        };

        image.onload = decodeImage;
        image.onerror = () => finish(false);
        image.src = path;

        if (image.complete && image.naturalWidth > 0) {
            decodeImage();
        }
    });

    imageReadyPromises.set(path, promise);
    return promise;
}

function getTransitionKind(expression: CoachExpression): TransitionKind {
    if (expression == "blink") {
        return "blink";
    }

    if (
        expression == "celebrating"
        || expression == "happy"
        || expression == "approving"
        || expression == "openArms"
    ) {
        return "positive";
    }

    if (
        expression == "worried"
        || expression == "sad"
        || expression == "error"
    ) {
        return "negative";
    }

    if (expression == "surprised") {
        return "surprised";
    }

    return "soft";
}

interface FoxyPortraitProps {
    coach: CoachOption;
    className?: string;
    speechText?: string;
}

/*
 * Foxy utiliza una implementación deliberadamente sencilla:
 * - idle permanece siempre pintado;
 * - un overlay que contiene solo los párpados se superpone sin fundido;
 * - una boca SVG aparece únicamente mientras "narra" el texto nuevo.
 * Así evitamos cambios de pose, frames transparentes y dependencias de rigging.
 */
function FoxyPortrait({
    coach,
    className,
    speechText = ""
}: FoxyPortraitProps) {
    const [isBlinking, setIsBlinking] = useState(false);
    const [mouthState, setMouthState] =
        useState<MouthState>("closed");

    const mouthSequenceRef = useRef(0);

    const idlePath = coach.expressions.idle;
    const blinkPath = coach.expressions.blink;

    useEffect(() => {
        void ensureImageReady(idlePath);
        void ensureImageReady(blinkPath);
    }, [idlePath, blinkPath]);

    useEffect(() => {
        let timeoutId: number | undefined;
        let cancelled = false;

        const scheduleNextBlink = () => {
            if (cancelled) return;

            timeoutId = window.setTimeout(
                runBlink,
                getRandomBlinkDelay()
            );
        };

        const finishSequence = () => {
            if (cancelled) return;
            setIsBlinking(false);
            scheduleNextBlink();
        };

        const runSecondBlink = () => {
            if (cancelled) return;
            setIsBlinking(true);

            timeoutId = window.setTimeout(
                finishSequence,
                BLINK_DURATION_MS
            );
        };

        const finishFirstBlink = () => {
            if (cancelled) return;
            setIsBlinking(false);

            if (Math.random() < DOUBLE_BLINK_CHANCE) {
                timeoutId = window.setTimeout(
                    runSecondBlink,
                    DOUBLE_BLINK_GAP_MS
                );
                return;
            }

            scheduleNextBlink();
        };

        const runBlink = async () => {
            if (cancelled) return;

            if (document.visibilityState == "hidden") {
                scheduleNextBlink();
                return;
            }

            const ready = await ensureImageReady(blinkPath);

            if (cancelled || !ready) {
                scheduleNextBlink();
                return;
            }

            setIsBlinking(true);
            timeoutId = window.setTimeout(
                finishFirstBlink,
                BLINK_DURATION_MS
            );
        };

        scheduleNextBlink();

        return () => {
            cancelled = true;
            setIsBlinking(false);

            if (timeoutId != undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [blinkPath]);

    useEffect(() => {
        const text = speechText.trim();
        const sequence = ++mouthSequenceRef.current;

        let timeoutId: number | undefined;
        let cancelled = false;
        let previousState: MouthState = "closed";

        setMouthState("closed");

        if (!text) {
            return undefined;
        }

        const stopAt = performance.now() + getSpeechDuration(text);

        const moveMouth = () => {
            if (
                cancelled
                || mouthSequenceRef.current != sequence
                || performance.now() >= stopAt
            ) {
                setMouthState("closed");
                return;
            }

            const availableStates: MouthState[] = previousState == "open"
                ? ["half", "closed", "half"]
                : previousState == "closed"
                    ? ["half", "open", "half"]
                    : ["open", "closed", "half", "open"];

            const nextState = availableStates[
                Math.floor(Math.random() * availableStates.length)
            ];

            previousState = nextState;
            setMouthState(nextState);

            timeoutId = window.setTimeout(
                moveMouth,
                getRandomMouthDelay()
            );
        };

        timeoutId = window.setTimeout(moveMouth, 90);

        return () => {
            cancelled = true;
            setMouthState("closed");

            if (timeoutId != undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [speechText, coach.id]);

    const rootClassName = className
        ? `${styles.root} ${styles.foxyRoot} ${className}`
        : `${styles.root} ${styles.foxyRoot}`;

    const blinkClassName = [
        styles.layer,
        styles.foxyBlinkLayer,
        isBlinking ? styles.foxyBlinkVisible : ""
    ].filter(Boolean).join(" ");

    const mouthClassName = [
        styles.foxyMouth,
        styles[`foxyMouth_${mouthState}`]
    ].filter(Boolean).join(" ");

    return (
        <span
            className={rootClassName}
            aria-hidden="true"
        >
            <img
                className={`${styles.layer} ${styles.foxyIdleLayer}`}
                src={idlePath}
                alt=""
                draggable={false}
                decoding="sync"
                loading="eager"
            />

            <img
                className={blinkClassName}
                src={blinkPath}
                alt=""
                draggable={false}
                decoding="sync"
                loading="eager"
            />

            <svg
                className={mouthClassName}
                viewBox="0 0 120 64"
                preserveAspectRatio="xMidYMid meet"
                focusable="false"
            >
                <path
                    className={styles.foxyMouthOpening}
                    d="M18 18 C34 7 86 7 102 18 C99 46 82 57 60 57 C38 57 21 46 18 18 Z"
                />
                <path
                    className={styles.foxyMouthTongue}
                    d="M31 42 C45 33 75 33 89 42 C79 53 41 53 31 42 Z"
                />
            </svg>
        </span>
    );
}

interface FogPortraitProps {
    coach: CoachOption;
    className?: string;
    speechText?: string;
}

/*
 * Pixie mantiene idle.png fijo y usa únicamente un overlay de párpados.
 * La boca es un SVG pequeño y anclado a la cara: no sustituye el hocico,
 * no escala ninguna imagen completa y conserva siempre sus proporciones.
 */
function FogPortrait({
    coach,
    className,
    speechText = ""
}: FogPortraitProps) {
    const [isBlinking, setIsBlinking] = useState(false);
    const [mouthState, setMouthState] =
        useState<MouthState>("closed");

    const mouthSequenceRef = useRef(0);

    const idlePath = coach.expressions.idle;
    const blinkPath = coach.expressions.blink;

    useEffect(() => {
        void ensureImageReady(idlePath);
        void ensureImageReady(blinkPath);
    }, [idlePath, blinkPath]);

    useEffect(() => {
        let timeoutId: number | undefined;
        let cancelled = false;

        const scheduleNextBlink = () => {
            if (cancelled) return;

            timeoutId = window.setTimeout(
                runBlink,
                getRandomBlinkDelay()
            );
        };

        const finishSequence = () => {
            if (cancelled) return;
            setIsBlinking(false);
            scheduleNextBlink();
        };

        const runSecondBlink = () => {
            if (cancelled) return;
            setIsBlinking(true);

            timeoutId = window.setTimeout(
                finishSequence,
                BLINK_DURATION_MS
            );
        };

        const finishFirstBlink = () => {
            if (cancelled) return;
            setIsBlinking(false);

            if (Math.random() < DOUBLE_BLINK_CHANCE) {
                timeoutId = window.setTimeout(
                    runSecondBlink,
                    DOUBLE_BLINK_GAP_MS
                );
                return;
            }

            scheduleNextBlink();
        };

        const runBlink = async () => {
            if (cancelled) return;

            if (document.visibilityState == "hidden") {
                scheduleNextBlink();
                return;
            }

            const ready = await ensureImageReady(blinkPath);

            if (cancelled || !ready) {
                scheduleNextBlink();
                return;
            }

            setIsBlinking(true);
            timeoutId = window.setTimeout(
                finishFirstBlink,
                BLINK_DURATION_MS
            );
        };

        scheduleNextBlink();

        return () => {
            cancelled = true;
            setIsBlinking(false);

            if (timeoutId != undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [blinkPath]);

    useEffect(() => {
        const text = speechText.trim();
        const sequence = ++mouthSequenceRef.current;

        let timeoutId: number | undefined;
        let cancelled = false;
        let previousState: MouthState = "closed";

        setMouthState("closed");

        if (!text) {
            return undefined;
        }

        const stopAt = performance.now() + getSpeechDuration(text);

        const moveMouth = () => {
            if (
                cancelled
                || mouthSequenceRef.current != sequence
                || performance.now() >= stopAt
            ) {
                setMouthState("closed");
                return;
            }

            const availableStates: MouthState[] = previousState == "open"
                ? ["half", "half"]
                : previousState == "closed"
                    ? ["half", "open", "half"]
                    : ["open", "half", "closed", "open"];

            const nextState = availableStates[
                Math.floor(Math.random() * availableStates.length)
            ];

            previousState = nextState;
            setMouthState(nextState);

            timeoutId = window.setTimeout(
                moveMouth,
                getRandomMouthDelay()
            );
        };

        timeoutId = window.setTimeout(moveMouth, 90);

        return () => {
            cancelled = true;
            setMouthState("closed");

            if (timeoutId != undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [speechText, coach.id]);

    const rootClassName = className
        ? `${styles.root} ${styles.fogRoot} ${className}`
        : `${styles.root} ${styles.fogRoot}`;

    const blinkClassName = [
        styles.layer,
        styles.fogBlinkLayer,
        isBlinking ? styles.fogBlinkVisible : ""
    ].filter(Boolean).join(" ");

    const mouthClassName = [
        styles.fogMouth,
        styles[`fogMouth_${mouthState}`]
    ].filter(Boolean).join(" ");

    return (
        <span
            className={rootClassName}
            aria-hidden="true"
        >
            <img
                className={`${styles.layer} ${styles.fogIdleLayer}`}
                src={idlePath}
                alt=""
                draggable={false}
                decoding="sync"
                loading="eager"
            />

            <img
                className={blinkClassName}
                src={blinkPath}
                alt=""
                draggable={false}
                decoding="sync"
                loading="eager"
            />

            <svg
                className={mouthClassName}
                viewBox="0 0 120 64"
                preserveAspectRatio="xMidYMid meet"
                focusable="false"
            >
                <path
                    className={styles.fogMouthOpening}
                    d="M25 18 C36 8 84 8 95 18 C92 36 78 52 60 55 C42 52 28 36 25 18 Z"
                />
                <path
                    className={styles.fogMouthLowerLip}
                    d="M36 39 C45 47 75 47 84 39"
                />
            </svg>
        </span>
    );
}

interface ExpressionPortraitProps {
    coach: CoachOption;
    className?: string;
    baseExpression: CoachExpression;
}

/*
 * Se conserva el sistema anterior para Cybe y Max Rooks.
 * Foxy y Pixie usan overlays fijos para evitar desapariciones y saltos.
 */
function ExpressionPortrait({
    coach,
    className,
    baseExpression
}: ExpressionPortraitProps) {
    const [expression, setExpression] = useState<CoachExpression>(
        baseExpression
    );

    const targetPath = getCoachExpressionPath(coach, expression);

    const [displayedPath, setDisplayedPath] = useState(targetPath);
    const displayedPathRef = useRef(targetPath);

    const [incomingPath, setIncomingPath] = useState<string | null>(null);
    const [incomingVisible, setIncomingVisible] = useState(false);
    const [transitionKind, setTransitionKind] =
        useState<TransitionKind>("soft");

    const transitionSequenceRef = useRef(0);

    const availableImagePaths = useMemo<string[]>(
        () => Array.from(
            new Set(
                Object.values(coach.expressions).filter(
                    (path): path is string => typeof path == "string"
                )
            )
        ),
        [coach.id]
    );

    useEffect(() => {
        availableImagePaths.forEach(path => {
            void ensureImageReady(path);
        });
    }, [availableImagePaths]);

    useEffect(() => {
        setExpression(baseExpression);
    }, [baseExpression, coach.id]);

    useEffect(() => {
        const sequence = ++transitionSequenceRef.current;
        let cancelled = false;
        let firstFrame = 0;
        let secondFrame = 0;
        let completionTimer: number | undefined;

        const clearIncomingLayer = () => {
            setIncomingVisible(false);
            setIncomingPath(null);
        };

        const runTransition = async () => {
            const ready = await ensureImageReady(targetPath);

            if (
                cancelled
                || !ready
                || transitionSequenceRef.current != sequence
            ) {
                return;
            }

            const kind = getTransitionKind(expression);

            if (kind == "blink") {
                setTransitionKind("blink");
                setIncomingPath(targetPath);
                setIncomingVisible(true);
                return;
            }

            if (targetPath == displayedPathRef.current) {
                clearIncomingLayer();
                return;
            }

            setTransitionKind(kind);
            setIncomingPath(targetPath);
            setIncomingVisible(false);

            firstFrame = window.requestAnimationFrame(() => {
                secondFrame = window.requestAnimationFrame(() => {
                    if (
                        cancelled
                        || transitionSequenceRef.current != sequence
                    ) {
                        return;
                    }

                    setIncomingVisible(true);

                    completionTimer = window.setTimeout(() => {
                        if (
                            cancelled
                            || transitionSequenceRef.current != sequence
                        ) {
                            return;
                        }

                        displayedPathRef.current = targetPath;
                        setDisplayedPath(targetPath);

                        firstFrame = window.requestAnimationFrame(() => {
                            secondFrame = window.requestAnimationFrame(() => {
                                if (
                                    cancelled
                                    || transitionSequenceRef.current != sequence
                                ) {
                                    return;
                                }

                                clearIncomingLayer();
                            });
                        });
                    }, POSE_TRANSITION_MS);
                });
            });
        };

        void runTransition();

        return () => {
            cancelled = true;
            window.cancelAnimationFrame(firstFrame);
            window.cancelAnimationFrame(secondFrame);

            if (completionTimer != undefined) {
                window.clearTimeout(completionTimer);
            }
        };
    }, [targetPath, expression]);

    useEffect(() => {
        if (baseExpression != "idle") {
            return;
        }

        let timeoutId: number | undefined;
        let cancelled = false;

        const scheduleNextBlink = () => {
            if (cancelled) return;

            timeoutId = window.setTimeout(
                runBlink,
                getRandomBlinkDelay()
            );
        };

        const finishBlinkSequence = () => {
            if (cancelled) return;

            setExpression("idle");
            scheduleNextBlink();
        };

        const runSecondBlink = () => {
            if (cancelled) return;

            setExpression("blink");

            timeoutId = window.setTimeout(
                finishBlinkSequence,
                BLINK_DURATION_MS
            );
        };

        const finishFirstBlink = () => {
            if (cancelled) return;

            setExpression("idle");

            if (Math.random() < DOUBLE_BLINK_CHANCE) {
                timeoutId = window.setTimeout(
                    runSecondBlink,
                    DOUBLE_BLINK_GAP_MS
                );
                return;
            }

            scheduleNextBlink();
        };

        const runBlink = async () => {
            if (cancelled) return;

            if (document.visibilityState == "hidden") {
                scheduleNextBlink();
                return;
            }

            const blinkPath = getCoachExpressionPath(coach, "blink");
            const ready = await ensureImageReady(blinkPath);

            if (cancelled || !ready) {
                scheduleNextBlink();
                return;
            }

            setExpression("blink");

            timeoutId = window.setTimeout(
                finishFirstBlink,
                BLINK_DURATION_MS
            );
        };

        setExpression("idle");
        scheduleNextBlink();

        return () => {
            cancelled = true;

            if (timeoutId != undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [baseExpression, coach.id]);

    const rootClassName = className
        ? `${styles.root} ${className}`
        : styles.root;

    const incomingClassName = [
        styles.layer,
        styles.incomingLayer,
        transitionClassNames[transitionKind],
        incomingVisible ? styles.incomingVisible : ""
    ].filter(Boolean).join(" ");

    return (
        <span
            className={rootClassName}
            aria-hidden="true"
        >
            <img
                className={`${styles.layer} ${styles.baseLayer}`}
                src={displayedPath}
                alt=""
                draggable={false}
            />

            {incomingPath && (
                <img
                    className={incomingClassName}
                    src={incomingPath}
                    alt=""
                    draggable={false}
                />
            )}
        </span>
    );
}


interface CybePortraitProps {
    coach: CoachOption;
    className?: string;
    speechText?: string;
    baseExpression?: CoachExpression;
}

/*
 * Cybe V2 mantiene siempre inmóvil la pose base. El parpadeo solo dibuja
 * los ojos cerrados sobre la cara y la voz se representa mediante cinco
 * barras centradas que cambian de altura de forma independiente.
 */
function CybePortrait({
    coach,
    className,
    speechText = "",
    baseExpression = "idle"
}: CybePortraitProps) {
    const [isBlinking, setIsBlinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [waveHeights, setWaveHeights] =
        useState<number[]>([...CYBE_REST_WAVES]);

    const waveSequenceRef = useRef(0);

    // Cybe mantiene siempre la pose idle, también durante la carga de Stockfish.
    // El parpadeo usa el overlay alineado con esa misma pose para evitar saltos.
    const basePath = coach.expressions.idle;
    const blinkPath = "/images/bots/cybe/blink-overlay-idle.png";

    useEffect(() => {
        void ensureImageReady(basePath);
        void ensureImageReady(blinkPath);
    }, [basePath, blinkPath]);

    useEffect(() => {
        let timeoutId: number | undefined;
        let cancelled = false;

        const scheduleNextBlink = () => {
            if (cancelled) return;

            timeoutId = window.setTimeout(
                runBlink,
                getRandomBlinkDelay()
            );
        };

        const finishSequence = () => {
            if (cancelled) return;
            setIsBlinking(false);
            scheduleNextBlink();
        };

        const runSecondBlink = () => {
            if (cancelled) return;
            setIsBlinking(true);

            timeoutId = window.setTimeout(
                finishSequence,
                BLINK_DURATION_MS
            );
        };

        const finishFirstBlink = () => {
            if (cancelled) return;
            setIsBlinking(false);

            if (Math.random() < DOUBLE_BLINK_CHANCE) {
                timeoutId = window.setTimeout(
                    runSecondBlink,
                    DOUBLE_BLINK_GAP_MS
                );
                return;
            }

            scheduleNextBlink();
        };

        const runBlink = async () => {
            if (cancelled) return;

            if (document.visibilityState == "hidden") {
                scheduleNextBlink();
                return;
            }

            const ready = await ensureImageReady(blinkPath);

            if (cancelled || !ready) {
                scheduleNextBlink();
                return;
            }

            setIsBlinking(true);
            timeoutId = window.setTimeout(
                finishFirstBlink,
                BLINK_DURATION_MS
            );
        };

        scheduleNextBlink();

        return () => {
            cancelled = true;
            setIsBlinking(false);

            if (timeoutId != undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [blinkPath]);

    useEffect(() => {
        const text = speechText.trim();
        const sequence = ++waveSequenceRef.current;

        let timeoutId: number | undefined;
        let cancelled = false;

        setIsSpeaking(false);
        setWaveHeights([...CYBE_REST_WAVES]);

        if (!text) {
            return undefined;
        }

        const stopAt = performance.now() + getSpeechDuration(text);

        const animateWave = () => {
            if (
                cancelled
                || waveSequenceRef.current != sequence
                || performance.now() >= stopAt
            ) {
                setIsSpeaking(false);
                setWaveHeights([...CYBE_REST_WAVES]);
                return;
            }

            setIsSpeaking(true);
            setWaveHeights(getRandomCybeWaveHeights());

            timeoutId = window.setTimeout(
                animateWave,
                getRandomCybeWaveDelay()
            );
        };

        setIsSpeaking(true);
        animateWave();

        return () => {
            cancelled = true;
            setIsSpeaking(false);
            setWaveHeights([...CYBE_REST_WAVES]);

            if (timeoutId != undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [speechText, coach.id]);

    const rootClassName = className
        ? `${styles.root} ${styles.cybeRoot} ${className}`
        : `${styles.root} ${styles.cybeRoot}`;

    const blinkClassName = [
        styles.layer,
        styles.cybeBlinkLayer,
        isBlinking ? styles.cybeBlinkVisible : ""
    ].filter(Boolean).join(" ");

    const mouthClassName = [
        styles.cybeMouth,
        isSpeaking ? styles.cybeMouthActive : ""
    ].filter(Boolean).join(" ");

    return (
        <span
            className={rootClassName}
            aria-hidden="true"
        >
            <img
                className={`${styles.layer} ${styles.cybeIdleLayer}`}
                src={basePath}
                alt=""
                draggable={false}
                decoding="sync"
                loading="eager"
            />

            <img
                className={blinkClassName}
                src={blinkPath}
                alt=""
                draggable={false}
                decoding="sync"
                loading="eager"
            />

            <span className={mouthClassName}>
                <span className={styles.cybeWaveform}>
                    {waveHeights.map((height, index) => (
                        <span
                            key={index}
                            className={styles.cybeWaveBar}
                            style={{ height: `${height}%` }}
                        />
                    ))}
                </span>
            </span>
        </span>
    );
}


interface MaxRooksPortraitProps {
    coach: CoachOption;
    className?: string;
    speechText?: string;
}

/*
 * Max Rooks conserva siempre la pose idle, también durante el análisis.
 * El parpadeo y la boca se renderizan como overlays alineados para evitar
 * saltos entre PNG completos.
 */
function MaxRooksPortrait({
    coach,
    className,
    speechText = ""
}: MaxRooksPortraitProps) {
    const [isBlinking, setIsBlinking] = useState(false);
    const [mouthState, setMouthState] =
        useState<MouthState>("closed");

    const mouthSequenceRef = useRef(0);

    const idlePath = coach.expressions.idle;
    const blinkPath = "/images/bots/max_rooks/blink-overlay.png";
    const mouthPath = "/images/bots/max_rooks/mouth-overlay.png";

    useEffect(() => {
        void ensureImageReady(idlePath);
        void ensureImageReady(blinkPath);
        void ensureImageReady(mouthPath);
    }, [idlePath, blinkPath, mouthPath]);

    useEffect(() => {
        let timeoutId: number | undefined;
        let cancelled = false;

        const scheduleNextBlink = () => {
            if (cancelled) return;

            timeoutId = window.setTimeout(
                runBlink,
                getRandomBlinkDelay()
            );
        };

        const finishSequence = () => {
            if (cancelled) return;
            setIsBlinking(false);
            scheduleNextBlink();
        };

        const runSecondBlink = () => {
            if (cancelled) return;
            setIsBlinking(true);

            timeoutId = window.setTimeout(
                finishSequence,
                BLINK_DURATION_MS
            );
        };

        const finishFirstBlink = () => {
            if (cancelled) return;
            setIsBlinking(false);

            if (Math.random() < DOUBLE_BLINK_CHANCE) {
                timeoutId = window.setTimeout(
                    runSecondBlink,
                    DOUBLE_BLINK_GAP_MS
                );
                return;
            }

            scheduleNextBlink();
        };

        const runBlink = async () => {
            if (cancelled) return;

            if (document.visibilityState == "hidden") {
                scheduleNextBlink();
                return;
            }

            const ready = await ensureImageReady(blinkPath);

            if (cancelled || !ready) {
                scheduleNextBlink();
                return;
            }

            setIsBlinking(true);
            timeoutId = window.setTimeout(
                finishFirstBlink,
                BLINK_DURATION_MS
            );
        };

        scheduleNextBlink();

        return () => {
            cancelled = true;
            setIsBlinking(false);

            if (timeoutId != undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [blinkPath]);

    useEffect(() => {
        const text = speechText.trim();
        const sequence = ++mouthSequenceRef.current;

        let timeoutId: number | undefined;
        let cancelled = false;
        let previousState: MouthState = "closed";

        setMouthState("closed");

        if (!text) {
            return undefined;
        }

        const stopAt = performance.now() + getSpeechDuration(text);

        const moveMouth = () => {
            if (
                cancelled
                || mouthSequenceRef.current != sequence
                || performance.now() >= stopAt
            ) {
                setMouthState("closed");
                return;
            }

            const availableStates: MouthState[] = previousState == "open"
                ? ["half", "closed", "half"]
                : previousState == "closed"
                    ? ["half", "open", "half"]
                    : ["open", "closed", "half", "open"];

            const nextState = availableStates[
                Math.floor(Math.random() * availableStates.length)
            ];

            previousState = nextState;
            setMouthState(nextState);

            timeoutId = window.setTimeout(
                moveMouth,
                getRandomMouthDelay()
            );
        };

        timeoutId = window.setTimeout(moveMouth, 90);

        return () => {
            cancelled = true;
            setMouthState("closed");

            if (timeoutId != undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [speechText, coach.id]);

    const rootClassName = className
        ? `${styles.root} ${styles.maxRooksRoot} ${className}`
        : `${styles.root} ${styles.maxRooksRoot}`;

    const blinkClassName = [
        styles.layer,
        styles.maxRooksBlinkLayer,
        isBlinking ? styles.maxRooksBlinkVisible : ""
    ].filter(Boolean).join(" ");

    const mouthClassName = [
        styles.layer,
        styles.maxRooksMouth,
        styles[`maxRooksMouth_${mouthState}`]
    ].filter(Boolean).join(" ");

    return (
        <span
            className={rootClassName}
            aria-hidden="true"
        >
            <img
                className={`${styles.layer} ${styles.maxRooksIdleLayer}`}
                src={idlePath}
                alt=""
                draggable={false}
                decoding="sync"
                loading="eager"
            />

            <img
                className={blinkClassName}
                src={blinkPath}
                alt=""
                draggable={false}
                decoding="sync"
                loading="eager"
            />

            <img
                className={mouthClassName}
                src={mouthPath}
                alt=""
                draggable={false}
                decoding="sync"
                loading="eager"
            />
        </span>
    );
}

function CoachPortrait({
    coach,
    className,
    baseExpression = "idle",
    speechText = "",
    animationsEnabled = true
}: CoachPortraitProps) {
    if (!animationsEnabled) {
        return (
            <img
                className={className}
                src={`/images/bots/${coach.id}.png`}
                alt=""
                aria-hidden="true"
                draggable={false}
                decoding="sync"
                loading="eager"
            />
        );
    }

    if (coach.id == "foxy") {
        return (
            <FoxyPortrait
                coach={coach}
                className={className}
                speechText={speechText}
            />
        );
    }

    if (coach.id == "fog") {
        return (
            <FogPortrait
                coach={coach}
                className={className}
                speechText={speechText}
            />
        );
    }

    if (coach.id == "cybe") {
        return (
            <CybePortrait
                coach={coach}
                className={className}
                speechText={speechText}
                baseExpression={baseExpression}
            />
        );
    }


    if (coach.id == "max_rooks") {
        return (
            <MaxRooksPortrait
                coach={coach}
                className={className}
                speechText={speechText}
            />
        );
    }

    return (
        <ExpressionPortrait
            coach={coach}
            className={className}
            baseExpression={baseExpression}
        />
    );
}

export default CoachPortrait;
