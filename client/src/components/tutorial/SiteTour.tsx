import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { useTranslation } from "react-i18next";

import { getSiteTourCopy, SiteTourStepKey } from "./copy";
import * as styles from "./SiteTour.module.css";

interface SiteTourProps {
    routeName: string;
}

interface TourStep {
    key: SiteTourStepKey;
    selector: string;
    fallbackSelector?: string;
}

interface RectState {
    left: number;
    top: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
}

interface CardPosition {
    left: number;
    top: number;
}

const NAV_FALLBACK = "header button[aria-controls=\"nexo-sidebar\"]";
const VIEWPORT_GAP = 12;
const TARGET_GAP = 16;
const MIN_CARD_TOP = 78;

const TOUR_STEPS: TourStep[] = [
    { key: "logo", selector: "header a[aria-label=\"NexoChess\"]" },
    { key: "academy", selector: "header nav a[href$=\"/academy\"]", fallbackSelector: NAV_FALLBACK },
    { key: "lessons", selector: "header nav a[href$=\"/lessons\"]", fallbackSelector: NAV_FALLBACK },
    { key: "analysis", selector: "header nav a[href$=\"/analysis\"]", fallbackSelector: NAV_FALLBACK },
    { key: "engine", selector: "header nav a[href$=\"/engine\"]", fallbackSelector: NAV_FALLBACK },
    { key: "archive", selector: "header nav a[href$=\"/archive\"]", fallbackSelector: NAV_FALLBACK },
    { key: "statistics", selector: "header nav a[href$=\"/statistics\"]", fallbackSelector: NAV_FALLBACK },
    { key: "puzzles", selector: "header nav a[href$=\"/puzzles\"]", fallbackSelector: NAV_FALLBACK },
    { key: "repertoire", selector: "header nav a[href$=\"/repertoire\"]", fallbackSelector: NAV_FALLBACK },
    { key: "support", selector: "header a[href^=\"https://ko-fi.com/nexochess\"]" },
    { key: "settings", selector: "header a[href$=\"/settings\"]" },
    { key: "help", selector: "footer a[href$=\"/help\"]" },
    { key: "language", selector: "footer nav button:first-of-type" },
    { key: "contact", selector: "footer a[title=\"contact@nexochess.com\"]" },
    { key: "consent", selector: "footer nav button:nth-of-type(2)" },
    { key: "about", selector: "footer a[href$=\"/about\"]" }
];

function isVisibleElement(element: Element | null): element is HTMLElement {
    if (!(element instanceof HTMLElement)) return false;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0
        && rect.height > 0
        && style.display != "none"
        && style.visibility != "hidden";
}

function findTarget(step: TourStep) {
    const primary = document.querySelector(step.selector);
    if (isVisibleElement(primary)) return primary;

    if (step.fallbackSelector) {
        const fallback = document.querySelector(step.fallbackSelector);
        if (isVisibleElement(fallback)) return fallback;
    }

    return undefined;
}

function compactRect(rect: DOMRect): RectState {
    return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom
    };
}

function clamp(value: number, minimum: number, maximum: number) {
    if (maximum < minimum) return minimum;
    return Math.min(maximum, Math.max(minimum, value));
}

function cardPositionForTarget(
    target: RectState | undefined,
    cardWidth: number,
    cardHeight: number,
    viewportWidth: number,
    viewportHeight: number
): CardPosition {
    const maximumLeft = Math.max(
        VIEWPORT_GAP,
        viewportWidth - cardWidth - VIEWPORT_GAP
    );
    const maximumTop = Math.max(
        MIN_CARD_TOP,
        viewportHeight - cardHeight - VIEWPORT_GAP
    );

    if (!target) {
        return {
            left: clamp(
                (viewportWidth - cardWidth) / 2,
                VIEWPORT_GAP,
                maximumLeft
            ),
            top: clamp(
                (viewportHeight - cardHeight) / 2,
                MIN_CARD_TOP,
                maximumTop
            )
        };
    }

    const centredLeft = clamp(
        target.left + target.width / 2 - cardWidth / 2,
        VIEWPORT_GAP,
        maximumLeft
    );
    const centredTop = clamp(
        target.top + target.height / 2 - cardHeight / 2,
        MIN_CARD_TOP,
        maximumTop
    );

    const placements = [
        {
            name: "below",
            room: viewportHeight - target.bottom,
            left: centredLeft,
            top: target.bottom + TARGET_GAP
        },
        {
            name: "above",
            room: target.top - MIN_CARD_TOP,
            left: centredLeft,
            top: target.top - cardHeight - TARGET_GAP
        },
        {
            name: "right",
            room: viewportWidth - target.right,
            left: target.right + TARGET_GAP,
            top: centredTop
        },
        {
            name: "left",
            room: target.left,
            left: target.left - cardWidth - TARGET_GAP,
            top: centredTop
        }
    ].sort((a, b) => b.room - a.room);

    for (const placement of placements) {
        const fitsHorizontally = placement.left >= VIEWPORT_GAP
            && placement.left + cardWidth <= viewportWidth - VIEWPORT_GAP;
        const fitsVertically = placement.top >= MIN_CARD_TOP
            && placement.top + cardHeight <= viewportHeight - VIEWPORT_GAP;

        if (fitsHorizontally && fitsVertically) {
            return {
                left: placement.left,
                top: placement.top
            };
        }
    }

    const fallback = placements[0];
    return {
        left: clamp(fallback.left, VIEWPORT_GAP, maximumLeft),
        top: clamp(fallback.top, MIN_CARD_TOP, maximumTop)
    };
}

function routeHasMainMenu(routeName: string) {
    if (routeName == "analysis" || routeName == "analysis-entry") return true;
    if (["academy", "archive", "statistics"].includes(routeName)) return true;

    if (routeName == "lessons") {
        return Boolean(document.querySelector("[id^=\"lesson-node-\"]"));
    }

    if (routeName == "puzzles") {
        return Boolean(document.querySelector(".nexo-puzzle-setup-shell"));
    }

    if (routeName == "engine") {
        return Boolean(document.querySelector("main[data-phase=\"setup\"]"));
    }

    return false;
}

function SiteTour({ routeName }: SiteTourProps) {
    const { i18n } = useTranslation();
    const copy = useMemo(
        () => getSiteTourCopy(i18n.resolvedLanguage || i18n.language),
        [i18n.language, i18n.resolvedLanguage]
    );
    const [eligible, setEligible] = useState(false);
    const [active, setActive] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<RectState>();
    const [cardHeight, setCardHeight] = useState(260);
    const nextButtonRef = useRef<HTMLButtonElement>(null);
    const cardRef = useRef<HTMLElement>(null);
    const rafRef = useRef<number>();

    const step = TOUR_STEPS[stepIndex];
    const stepCopy = copy.steps[step.key];
    const lastStep = stepIndex == TOUR_STEPS.length - 1;

    const refreshEligibility = useCallback(() => {
        const next = routeHasMainMenu(routeName);
        setEligible(next);
        if (!next) setActive(false);
    }, [routeName]);

    useEffect(() => {
        refreshEligibility();
        const root = document.getElementById("nexo-main-content") || document.body;
        const observer = new MutationObserver(refreshEligibility);
        observer.observe(root, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["data-phase"]
        });
        return () => observer.disconnect();
    }, [refreshEligibility]);

    const refreshTarget = useCallback(() => {
        if (!active) return;
        if (rafRef.current != undefined) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            const target = findTarget(step);
            setTargetRect(target ? compactRect(target.getBoundingClientRect()) : undefined);
        });
    }, [active, step]);

    useEffect(() => {
        if (!active) {
            setTargetRect(undefined);
            return;
        }

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let target = findTarget(step);

        if (!target && step.selector.startsWith("footer")) {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: reduceMotion ? "auto" : "smooth"
            });
        } else if (target) {
            const rect = target.getBoundingClientRect();
            const outsideViewport = rect.top < 78 || rect.bottom > window.innerHeight - 72;
            if (outsideViewport) {
                target.scrollIntoView({
                    behavior: reduceMotion ? "auto" : "smooth",
                    block: "center",
                    inline: "nearest"
                });
            }
        }

        refreshTarget();
        const retryOne = window.setTimeout(refreshTarget, 180);
        const retryTwo = window.setTimeout(() => {
            target = findTarget(step);
            if (target) {
                const rect = target.getBoundingClientRect();
                if (rect.top < 78 || rect.bottom > window.innerHeight - 72) {
                    target.scrollIntoView({
                        behavior: reduceMotion ? "auto" : "smooth",
                        block: "center",
                        inline: "nearest"
                    });
                }
            }
            refreshTarget();
        }, 520);

        window.addEventListener("scroll", refreshTarget, { passive: true });
        window.addEventListener("resize", refreshTarget);

        return () => {
            window.clearTimeout(retryOne);
            window.clearTimeout(retryTwo);
            window.removeEventListener("scroll", refreshTarget);
            window.removeEventListener("resize", refreshTarget);
            if (rafRef.current != undefined) cancelAnimationFrame(rafRef.current);
        };
    }, [active, refreshTarget, step]);

    useLayoutEffect(() => {
        if (!active || !cardRef.current) return;

        const card = cardRef.current;
        const measure = () => {
            const nextHeight = Math.ceil(card.getBoundingClientRect().height);
            setCardHeight(previous => previous == nextHeight ? previous : nextHeight);
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(card);

        return () => observer.disconnect();
    }, [active, stepIndex, stepCopy.body, stepCopy.title]);

    useEffect(() => {
        if (!active) return;
        const timer = window.setTimeout(() => nextButtonRef.current?.focus(), 220);

        function onKeyDown(event: KeyboardEvent) {
            if (event.key == "Escape") {
                setActive(false);
                return;
            }
            if (event.key == "ArrowRight") {
                event.preventDefault();
                if (lastStep) setActive(false);
                else setStepIndex(index => Math.min(TOUR_STEPS.length - 1, index + 1));
            }
            if (event.key == "ArrowLeft") {
                event.preventDefault();
                setStepIndex(index => Math.max(0, index - 1));
            }
        }

        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [active, lastStep, stepIndex]);

    if (!eligible) return null;

    const launcher = <button
        type="button"
        className={[
            styles.launcher,
            active ? styles.launcherActive : ""
        ].filter(Boolean).join(" ")}
        onClick={() => {
            if (active) {
                setActive(false);
                return;
            }
            setStepIndex(0);
            setActive(true);
        }}
        aria-label={active ? copy.close : copy.open}
        title={active ? copy.close : copy.open}
        aria-pressed={active}
    >
        ?
    </button>;

    if (!active) return launcher;

    const viewportWidth = typeof window == "undefined" ? 1280 : window.innerWidth;
    const viewportHeight = typeof window == "undefined" ? 800 : window.innerHeight;
    const cardWidth = Math.min(360, viewportWidth - 24);
    const cardPosition = cardPositionForTarget(
        targetRect,
        cardWidth,
        cardHeight,
        viewportWidth,
        viewportHeight
    );

    return <>
        {targetRect && <div
            className={styles.spotlight}
            style={{
                left: `${targetRect.left - 6}px`,
                top: `${targetRect.top - 6}px`,
                width: `${targetRect.width + 12}px`,
                height: `${targetRect.height + 12}px`
            }}
            aria-hidden="true"
        />}

        {launcher}

        <section
            ref={cardRef}
            className={styles.card}
            style={{
                left: `${cardPosition.left}px`,
                top: `${cardPosition.top}px`,
                width: `${cardWidth}px`
            }}
            role="dialog"
            aria-modal="false"
            aria-labelledby="nexo-site-tour-title"
            aria-describedby="nexo-site-tour-body"
        >
            <div className={styles.cardTopline}>
                <span>{copy.kicker}</span>
                <button
                    type="button"
                    className={styles.close}
                    onClick={() => setActive(false)}
                    aria-label={copy.close}
                >×</button>
            </div>

            <h2 id="nexo-site-tour-title">{stepCopy.title}</h2>
            <p id="nexo-site-tour-body">{stepCopy.body}</p>

            <div className={styles.progressLine}>
                <span>{copy.step(stepIndex + 1, TOUR_STEPS.length)}</span>
                <div className={styles.progressTrack} aria-hidden="true">
                    <i style={{ width: `${(stepIndex + 1) / TOUR_STEPS.length * 100}%` }}/>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    onClick={() => setStepIndex(index => Math.max(0, index - 1))}
                    disabled={stepIndex == 0}
                >
                    {copy.back}
                </button>
                <button
                    ref={nextButtonRef}
                    type="button"
                    className={styles.primary}
                    onClick={() => {
                        if (lastStep) {
                            setActive(false);
                            return;
                        }
                        setStepIndex(index => Math.min(TOUR_STEPS.length - 1, index + 1));
                    }}
                >
                    {lastStep ? copy.finish : copy.next}
                </button>
            </div>
        </section>
    </>;
}

export default SiteTour;
