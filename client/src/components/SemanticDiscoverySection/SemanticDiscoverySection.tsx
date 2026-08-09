import React from "react";

import type { SemanticPageCopy } from "@/i18n/semanticDiscoveryCopy";

import * as styles from "./SemanticDiscoverySection.module.css";

interface SemanticDiscoverySectionProps {
    copy: SemanticPageCopy;
    relatedHref: string;
    helpHref: string;
}

function SemanticDiscoverySection({
    copy,
    relatedHref,
    helpHref
}: SemanticDiscoverySectionProps) {
    return <section className={styles.section}>
        <header className={styles.header}>
            <span className={styles.eyebrow}>{copy.eyebrow}</span>
            <h2>{copy.title}</h2>
            <p>{copy.description}</p>
        </header>

        <div className={styles.cards}>
            {copy.cards.map(card => (
                <article key={card.title} className={styles.card}>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                </article>
            ))}
        </div>

        <div className={styles.topics}>
            <h3>{copy.topicsTitle}</h3>
            <ul>
                {copy.topics.map(topic => (
                    <li key={topic}>{topic}</li>
                ))}
            </ul>
        </div>

        <nav className={styles.links} aria-label={copy.topicsTitle}>
            <a href={relatedHref}>{copy.relatedAction}</a>
            <a href={helpHref}>{copy.helpAction}</a>
        </nav>
    </section>;
}

export default SemanticDiscoverySection;
