import React, { ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getAboutCopy } from "./copy";
import * as styles from "./About.module.css";

type AboutIconName =
    | "arrow"
    | "check"
    | "code"
    | "engine"
    | "globe"
    | "independent"
    | "learn"
    | "shield"
    | "spark";

interface AboutIconProps {
    name: AboutIconName;
}

function AboutIcon({ name }: AboutIconProps) {
    const paths: Record<AboutIconName, ReactNode> = {
        arrow: <>
            <path d="M5 12h14" />
            <path d="m14 7 5 5-5 5" />
        </>,
        check: <path d="m5 12 4 4L19 6" />,
        code: <>
            <path d="m8.5 8-4 4 4 4" />
            <path d="m15.5 8 4 4-4 4" />
            <path d="m13.5 5-3 14" />
        </>,
        engine: <>
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
            <path d="m5.3 5.3 2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
        </>,
        globe: <>
            <circle cx="12" cy="12" r="9" />
            <path d="M3.5 12h17" />
            <path d="M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" />
        </>,
        independent: <>
            <path d="M12 3 5 6v5c0 4.6 2.7 8.2 7 10 4.3-1.8 7-5.4 7-10V6z" />
            <path d="m8.5 12 2.2 2.2 4.8-5" />
        </>,
        learn: <>
            <path d="m3 8.5 9-5 9 5-9 5z" />
            <path d="M7 11v5c2.8 2.1 7.2 2.1 10 0v-5" />
        </>,
        shield: <>
            <path d="M12 3 5 6v5c0 4.6 2.7 8.2 7 10 4.3-1.8 7-5.4 7-10V6z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </>,
        spark: <>
            <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" />
            <path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
        </>
    };

    return <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
    >
        {paths[name]}
    </svg>;
}

const principleIcons: AboutIconName[] = [
    "learn",
    "spark",
    "globe",
    "shield"
];

function About() {
    const { i18n } = useTranslation();
    const copy = useMemo(
        () => getAboutCopy(i18n.resolvedLanguage || i18n.language),
        [i18n.resolvedLanguage, i18n.language]
    );

    return <main className={styles.about}>
        <section className={styles.hero} aria-labelledby="about-title">
            <div className={styles.heroGlow} aria-hidden="true" />

            <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>
                    <AboutIcon name="spark" />
                    {copy.eyebrow}
                </span>

                <h1 id="about-title">{copy.title}</h1>
                <p className={styles.heroIntroduction}>
                    {copy.introduction}
                </p>

                <div className={styles.heroActions}>
                    <a className={styles.primaryAction} href="/analysis">
                        {copy.primaryAction}
                        <AboutIcon name="arrow" />
                    </a>
                    <a
                        className={styles.secondaryAction}
                        href="https://github.com/ManuG155/nexochess"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {copy.secondaryAction}
                        <AboutIcon name="code" />
                    </a>
                </div>
            </div>

            <aside className={styles.identityCard} aria-label={copy.identityLabel}>
                <div className={styles.identityHeader}>
                    <span className={styles.identityMark} aria-hidden="true">
                        <img src="/img/nexochess-icon-white.png" alt="" />
                    </span>
                    <div>
                        <span>{copy.identityLabel}</span>
                        <strong>NexoChess</strong>
                    </div>
                </div>

                <h2>{copy.identityTitle}</h2>
                <p>{copy.identityDescription}</p>

                <ul className={styles.identityBadges}>
                    {[copy.freeLabel, copy.openSourceLabel, copy.independentLabel]
                        .map(label => <li key={label}>
                            <AboutIcon name="check" />
                            {label}
                        </li>)}
                </ul>

                <dl className={styles.metrics}>
                    <div>
                        <dt>6,057,356</dt>
                        <dd>{copy.puzzleMetric}</dd>
                    </div>
                    <div>
                        <dt>11</dt>
                        <dd>{copy.languageMetric}</dd>
                    </div>
                    <div>
                        <dt>Stockfish 17</dt>
                        <dd>{copy.engineMetric}</dd>
                    </div>
                </dl>
            </aside>
        </section>

        <section className={styles.mission} aria-labelledby="mission-title">
            <div className={styles.sectionHeading}>
                <span className={styles.sectionEyebrow}>
                    {copy.missionEyebrow}
                </span>
                <h2 id="mission-title">{copy.missionTitle}</h2>
            </div>

            <div className={styles.missionCopy}>
                {copy.missionParagraphs.map(paragraph => (
                    <p key={paragraph}>{paragraph}</p>
                ))}
            </div>
        </section>

        <section className={styles.section} aria-labelledby="principles-title">
            <div className={styles.sectionHeading}>
                <span className={styles.sectionEyebrow}>
                    {copy.principlesEyebrow}
                </span>
                <h2 id="principles-title">{copy.principlesTitle}</h2>
            </div>

            <div className={styles.principleGrid}>
                {copy.principles.map((principle, index) => (
                    <article className={styles.principleCard} key={principle.title}>
                        <span className={styles.principleIcon}>
                            <AboutIcon name={principleIcons[index]} />
                        </span>
                        <h3>{principle.title}</h3>
                        <p>{principle.description}</p>
                    </article>
                ))}
            </div>
        </section>

        <section
            className={styles.independence}
            aria-labelledby="independence-title"
        >
            <div className={styles.independenceIcon} aria-hidden="true">
                <AboutIcon name="independent" />
            </div>

            <div className={styles.independenceCopy}>
                <span className={styles.sectionEyebrow}>
                    {copy.independenceEyebrow}
                </span>
                <h2 id="independence-title">{copy.independenceTitle}</h2>
                <p>{copy.independenceDescription}</p>
                <p>{copy.independenceNote}</p>
            </div>

            <a className={styles.sourceAction} href="/source">
                {copy.sourceAction}
                <AboutIcon name="arrow" />
            </a>
        </section>

        <section className={styles.creator} aria-labelledby="creator-title">
            <div className={styles.creatorPortrait} aria-hidden="true">
                <span>MGV</span>
            </div>

            <div>
                <span className={styles.sectionEyebrow}>
                    {copy.creatorEyebrow}
                </span>
                <h2 id="creator-title">{copy.creatorTitle}</h2>
                <p>{copy.creatorDescription}</p>
                <span className={styles.creatorLocation}>
                    {copy.creatorLocation}
                </span>
            </div>
        </section>

        <section className={styles.finalCallout} aria-labelledby="about-final-title">
            <div>
                <h2 id="about-final-title">{copy.finalTitle}</h2>
                <p>{copy.finalDescription}</p>
            </div>

            <div className={styles.finalActions}>
                <a className={styles.primaryAction} href="/analysis">
                    {copy.finalPrimaryAction}
                    <AboutIcon name="arrow" />
                </a>
                <a className={styles.secondaryAction} href="/puzzles">
                    {copy.finalSecondaryAction}
                </a>
            </div>
        </section>
    </main>;
}

export default About;
