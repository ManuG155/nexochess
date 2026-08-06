import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import * as styles from "./HelpCenterCompletion.module.css";
import { getHelpCompletionCopy } from "./helpCompletionContent";

interface HelpCompletionProps {
    contactUrl: string;
}

function HelpCompletion({ contactUrl }: HelpCompletionProps) {
    const { i18n } = useTranslation();
    const copy = useMemo(
        () => getHelpCompletionCopy(
            i18n.resolvedLanguage || i18n.language
        ),
        [i18n.resolvedLanguage, i18n.language]
    );

    return <>
        <section className={styles.library} id="help-guides">
            <header className={styles.sectionHeading}>
                <span>{copy.libraryEyebrow}</span>
                <h2>{copy.libraryTitle}</h2>
                <p>{copy.librarySubtitle}</p>
            </header>

            <div className={styles.guideGrid}>
                {copy.guides.map((guide, guideIndex) => (
                    <article className={styles.guideCard} key={guide.id}>
                        <div className={styles.guideHeader}>
                            <span className={styles.guideNumber}>
                                {String(guideIndex + 1).padStart(2, "0")}
                            </span>

                            <div>
                                <h3>{guide.title}</h3>
                                <p>{guide.summary}</p>
                            </div>
                        </div>

                        <ol className={styles.guideSteps}>
                            {guide.steps.map((step, stepIndex) => (
                                <li key={`${guide.id}-${stepIndex}`}>
                                    <span>{stepIndex + 1}</span>
                                    <p>{step}</p>
                                </li>
                            ))}
                        </ol>

                        <a className={styles.guideAction} href={guide.href}>
                            {guide.action}
                            <span aria-hidden="true">→</span>
                        </a>
                    </article>
                ))}
            </div>
        </section>

        <section className={styles.troubleshooting} id="troubleshooting">
            <header className={styles.sectionHeading}>
                <span>{copy.troubleshootingEyebrow}</span>
                <h2>{copy.troubleshootingTitle}</h2>
                <p>{copy.troubleshootingSubtitle}</p>
            </header>

            <div className={styles.issueGrid}>
                {copy.issues.map(issue => (
                    <details className={styles.issue} key={issue.id}>
                        <summary>{issue.title}</summary>
                        <p>{issue.answer}</p>
                    </details>
                ))}
            </div>
        </section>

        <section className={styles.supportCard} aria-labelledby="support-request-title">
            <div className={styles.supportCopy}>
                <span>{copy.troubleshootingEyebrow}</span>
                <h2 id="support-request-title">{copy.supportTitle}</h2>
                <p>{copy.supportSubtitle}</p>
            </div>

            <ul className={styles.supportChecklist}>
                {copy.supportChecklist.map((item, index) => (
                    <li key={item}>
                        <span aria-hidden="true">{index + 1}</span>
                        {item}
                    </li>
                ))}
            </ul>

            <a
                className={styles.supportAction}
                href={contactUrl}
                target="_blank"
                rel="noreferrer"
            >
                {copy.supportAction}
                <span aria-hidden="true">→</span>
            </a>
        </section>
    </>;
}

export default HelpCompletion;
