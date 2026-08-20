import React, { ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getHomeCopy } from "./copy";
import * as styles from "./Home.module.css";
import * as previewFix from "./HomePreviewFix.module.css";

type IconName =
    | "academy"
    | "analysis"
    | "archive"
    | "arrow"
    | "check"
    | "puzzle"
    | "review"
    | "spark"
    | "train"
    | "upload";

interface HomeIconProps {
    name: IconName;
}

function HomeIcon({ name }: HomeIconProps) {
    const paths: Record<IconName, ReactNode> = {
        analysis: <>
            <path d="M4 18.5V21h16v-2.5" />
            <path d="M7 16V10" />
            <path d="M12 16V4" />
            <path d="M17 16V8" />
        </>,
        archive: <>
            <path d="M4.5 8.5h15v11h-15z" />
            <path d="M3.5 4.5h17v4h-17z" />
            <path d="M9.5 12h5" />
        </>,
        academy: <>
            <path d="m3 9 9-5 9 5-9 5z" />
            <path d="M7 11.2V16c2.8 2.2 7.2 2.2 10 0v-4.8" />
            <path d="M21 9v6" />
        </>,
        puzzle: <path d="M9.5 4H4v5.5a2.5 2.5 0 1 1 0 5V20h5.5a2.5 2.5 0 1 0 5 0H20v-5.5a2.5 2.5 0 1 0 0-5V4h-5.5a2.5 2.5 0 1 1-5 0Z" />,
        arrow: <>
            <path d="M5 12h14" />
            <path d="m14 7 5 5-5 5" />
        </>,
        check: <path d="m5 12 4 4L19 6" />,
        spark: <>
            <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" />
            <path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
        </>,
        upload: <>
            <path d="M12 16V4" />
            <path d="m7 9 5-5 5 5" />
            <path d="M5 20h14" />
        </>,
        review: <>
            <path d="M4 5h16v14H4z" />
            <path d="m7 15 3-3 2 2 4-5 1 1" />
        </>,
        train: <>
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 4v3M20 12h-3M12 20v-3M4 12h3" />
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

const featureMetadata: Array<{
    icon: IconName;
    href: string;
}> = [
    { icon: "analysis", href: "/analysis" },
    { icon: "archive", href: "/archive" },
    { icon: "puzzle", href: "/puzzles" },
    { icon: "academy", href: "/academy" }
];

const stepIcons: IconName[] = ["upload", "review", "train"];

const boardPieces: Record<number, string> = {
    0: "♜", 1: "♞", 2: "♝", 3: "♛", 4: "♚", 5: "♝", 6: "♞", 7: "♜",
    8: "♟", 9: "♟", 10: "♟", 11: "♟", 13: "♟", 14: "♟", 15: "♟",
    27: "♟",
    28: "♙",
    42: "♘",
    48: "♙", 49: "♙", 50: "♙", 51: "♙", 53: "♙", 54: "♙", 55: "♙",
    56: "♖", 57: "♘", 58: "♗", 59: "♕", 60: "♔", 61: "♗", 63: "♖"
};

function AnalysisPreview() {
    const { i18n } = useTranslation();
    const copy = useMemo(
        () => getHomeCopy(i18n.resolvedLanguage || i18n.language),
        [i18n.resolvedLanguage, i18n.language]
    );

    return <figure className={styles.preview}>
        <figcaption className={styles.previewHeading}>
            <span className={styles.previewEyebrow}>{copy.previewLabel}</span>
            <strong>{copy.previewTitle}</strong>
        </figcaption>

        <div className={styles.previewWorkspace}>
            <div
                className={`${styles.boardShell} ${previewFix.boardShell}`}
                aria-hidden="true"
            >
                <div className={`${styles.board} ${previewFix.board}`}>
                    {Array.from({ length: 64 }, (_, index) => {
                        const row = Math.floor(index / 8);
                        const column = index % 8;
                        const light = (row + column) % 2 === 0;

                        return <span
                            key={index}
                            className={[
                                styles.square,
                                previewFix.square,
                                light ? styles.lightSquare : styles.darkSquare,
                                index === 28 ? styles.selectedSquare : "",
                                index === 36 ? styles.targetSquare : ""
                            ].filter(Boolean).join(" ")}
                        >
                            {boardPieces[index] || ""}
                        </span>;
                    })}
                </div>

                <span className={`${styles.evaluation} ${previewFix.evaluation}`}>
                    +1.6
                </span>
            </div>

            <div className={styles.reviewCard}>
                <div className={styles.reviewStatus}>
                    <span className={styles.statusDot}/>
                    {copy.previewStatus}
                </div>

                <div className={styles.moveSummary}>
                    <span className={styles.moveNumber}>18</span>
                    <div>
                        <span>{copy.previewBestMove}</span>
                        <strong>Nxe5</strong>
                    </div>
                    <span className={styles.moveBadge}>+1.6</span>
                </div>

                <div className={styles.reviewMetric}>
                    <span>{copy.previewAccuracy}</span>
                    <strong>87.4%</strong>
                </div>

                <div className={styles.reviewDivider}/>

                <div className={styles.keyMoment}>
                    <span className={styles.keyMomentIcon}>
                        <HomeIcon name="spark" />
                    </span>
                    <div>
                        <span>{copy.previewKeyMoment}</span>
                        <strong>18. Nxe5</strong>
                    </div>
                </div>

                <div className={styles.lineChart} aria-hidden="true">
                    <svg viewBox="0 0 240 72" preserveAspectRatio="none">
                        <path
                            className={styles.chartArea}
                            d="M0 55 C28 50 38 60 66 43 S105 45 125 30 S159 36 178 20 S212 27 240 10 L240 72 L0 72 Z"
                        />
                        <path
                            className={styles.chartLine}
                            d="M0 55 C28 50 38 60 66 43 S105 45 125 30 S159 36 178 20 S212 27 240 10"
                        />
                        <circle className={styles.chartPoint} cx="178" cy="20" r="4" />
                    </svg>
                </div>
            </div>
        </div>
    </figure>;
}

function Home() {
    const { i18n } = useTranslation();
    const copy = useMemo(
        () => getHomeCopy(i18n.resolvedLanguage || i18n.language),
        [i18n.resolvedLanguage, i18n.language]
    );

    return <main className={styles.home}>
        <section className={styles.hero} aria-labelledby="home-title">
            <div className={styles.heroGlow} aria-hidden="true"/>

            <div className={styles.heroCopy}>
                <span className={styles.eyebrow}>
                    <HomeIcon name="spark" />
                    {copy.eyebrow}
                </span>

                <h1 id="home-title">{copy.title}</h1>
                <p className={styles.heroIntroduction}>{copy.introduction}</p>

                <div className={styles.heroActions}>
                    <a className={styles.primaryAction} href="/analysis">
                        {copy.primaryAction}
                        <HomeIcon name="arrow" />
                    </a>
                    <a className={styles.secondaryAction} href="/puzzles">
                        {copy.secondaryAction}
                    </a>
                </div>

                <ul className={styles.badges} aria-label="NexoChess">
                    {copy.badges.map(badge => <li key={badge}>
                        <span><HomeIcon name="check" /></span>
                        {badge}
                    </li>)}
                </ul>
            </div>

            <AnalysisPreview/>
        </section>

        <section className={styles.section} aria-labelledby="features-title">
            <div className={styles.sectionHeading}>
                <span className={styles.sectionEyebrow}>{copy.featuresEyebrow}</span>
                <h2 id="features-title">{copy.featuresTitle}</h2>
                <p>{copy.featuresIntroduction}</p>
            </div>

            <div className={styles.featureGrid}>
                {copy.features.map((feature, index) => {
                    const metadata = featureMetadata[index];

                    return <a
                        key={metadata.href}
                        className={styles.featureCard}
                        href={metadata.href}
                    >
                        <span className={styles.featureIcon}>
                            <HomeIcon name={metadata.icon}/>
                        </span>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                        <span className={styles.featureAction}>
                            {feature.action}
                            <HomeIcon name="arrow" />
                        </span>
                    </a>;
                })}
            </div>
        </section>

        <section className={`${styles.section} ${styles.processSection}`} aria-labelledby="process-title">
            <div className={styles.sectionHeading}>
                <span className={styles.sectionEyebrow}>{copy.processEyebrow}</span>
                <h2 id="process-title">{copy.processTitle}</h2>
            </div>

            <ol className={styles.steps}>
                {copy.steps.map((step, index) => <li key={step.title}>
                    <span className={styles.stepNumber}>0{index + 1}</span>
                    <span className={styles.stepIcon}>
                        <HomeIcon name={stepIcons[index]}/>
                    </span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                </li>)}
            </ol>
        </section>

        <section className={styles.proof} aria-labelledby="proof-title">
            <div className={styles.proofCopy}>
                <span className={styles.sectionEyebrow}>{copy.proofEyebrow}</span>
                <h2 id="proof-title">{copy.proofTitle}</h2>
                <p>{copy.proofDescription}</p>
            </div>

            <dl className={styles.stats}>
                <div>
                    <dt>6,057,356</dt>
                    <dd>{copy.puzzleStat}</dd>
                </div>
                <div>
                    <dt>11</dt>
                    <dd>{copy.languageStat}</dd>
                </div>
                <div>
                    <dt>24/7</dt>
                    <dd>{copy.accessStat}</dd>
                </div>
            </dl>
        </section>

        <section className={styles.finalCallout} aria-labelledby="final-title">
            <div>
                <span className={styles.finalMark} aria-hidden="true">
                    <img src="/img/nexochess-icon-white.png" alt="" />
                </span>
                <h2 id="final-title">{copy.finalTitle}</h2>
                <p>{copy.finalDescription}</p>
            </div>

            <a className={styles.finalAction} href="/analysis">
                {copy.finalAction}
                <HomeIcon name="arrow" />
            </a>
        </section>
    </main>;
}

export default Home;
