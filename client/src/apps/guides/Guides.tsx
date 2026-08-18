import React from "react";
import { useTranslation } from "react-i18next";

import * as styles from "./Guides.module.css";

interface GuideSectionCopy {
    title: string;
    summary: string;
    paragraphs: string[];
    checklistTitle: string;
    checklist: string[];
    takeaway: string;
    action: string;
}

interface GuidesCopy {
    hero: {
        eyebrow: string;
        title: string;
        introduction: string;
        primaryAction: string;
        secondaryAction: string;
    };
    editorial: {
        byline: string;
        updated: string;
    };
    contents: {
        title: string;
        description: string;
    };
    sections: {
        analyze: GuideSectionCopy;
        accuracy: GuideSectionCopy;
        stockfish: GuideSectionCopy;
        tactics: GuideSectionCopy;
    };
    closing: {
        title: string;
        description: string;
        analysisAction: string;
        puzzlesAction: string;
    };
}

const SECTION_CONFIG = [
    { key: "analyze", id: "analyze-chess-game", href: "/analysis" },
    { key: "accuracy", id: "chess-errors-accuracy", href: "/analysis" },
    { key: "stockfish", id: "stockfish-analysis", href: "/analysis" },
    { key: "tactics", id: "chess-tactics-puzzles", href: "/puzzles" }
] as const;

const RELATED_TOOL_CONFIG = [
    {
        href: "/engine",
        titleKey: "title",
        descriptionKey: "subtitle",
        namespace: "enginePlay"
    },
    {
        href: "/lessons",
        titleKey: "page.title",
        descriptionKey: "page.subtitle",
        namespace: "lessons"
    },
    {
        href: "/repertoire",
        titleKey: "title",
        descriptionKey: "intro",
        namespace: "repertoire"
    }
] as const;

function Guides() {
    const { t } = useTranslation([
        "guides",
        "enginePlay",
        "lessons",
        "repertoire"
    ]);
    const copy = t("page", {
        ns: "guides",
        returnObjects: true
    }) as GuidesCopy;
    const relatedTools = RELATED_TOOL_CONFIG.map(tool => ({
        href: tool.href,
        title: t(tool.titleKey, { ns: tool.namespace }),
        description: t(tool.descriptionKey, { ns: tool.namespace })
    }));

    return <main className={styles.guides}>
        <section className={styles.hero} aria-labelledby="guides-title">
            <span className={styles.eyebrow}>{copy.hero.eyebrow}</span>
            <h1 id="guides-title">{copy.hero.title}</h1>
            <p className={styles.heroIntroduction}>{copy.hero.introduction}</p>

            <div className={styles.heroActions}>
                <a className={styles.primaryAction} href="/analysis">
                    {copy.hero.primaryAction}
                </a>
                <a className={styles.secondaryAction} href="/puzzles">
                    {copy.hero.secondaryAction}
                </a>
            </div>

            <div className={styles.editorialLine}>
                <a href="/about">{copy.editorial.byline}</a>
                <span aria-hidden="true">•</span>
                <span>{copy.editorial.updated}</span>
            </div>
        </section>

        <section className={styles.contents} aria-labelledby="guides-contents-title">
            <div>
                <span className={styles.sectionEyebrow}>{copy.contents.title}</span>
                <p>{copy.contents.description}</p>
            </div>
            <nav className={styles.contentsGrid} aria-label={copy.contents.title}>
                {SECTION_CONFIG.map((section, index) => {
                    const sectionCopy = copy.sections[section.key];
                    return <a key={section.id} href={`#${section.id}`}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{sectionCopy.title}</strong>
                        <p>{sectionCopy.summary}</p>
                    </a>;
                })}
            </nav>
        </section>

        <div className={styles.articleStack}>
            {SECTION_CONFIG.map((section, index) => {
                const sectionCopy = copy.sections[section.key];
                return <article
                    className={styles.article}
                    id={section.id}
                    key={section.id}
                    aria-labelledby={`${section.id}-title`}
                >
                    <header className={styles.articleHeader}>
                        <span className={styles.articleNumber}>
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                            <h2 id={`${section.id}-title`}>{sectionCopy.title}</h2>
                            <p>{sectionCopy.summary}</p>
                        </div>
                    </header>

                    <div className={styles.articleBody}>
                        <div className={styles.articleCopy}>
                            {sectionCopy.paragraphs.map(paragraph => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}

                            <p className={styles.takeaway}>{sectionCopy.takeaway}</p>
                        </div>

                        <aside className={styles.checklist}>
                            <h3>{sectionCopy.checklistTitle}</h3>
                            <ol>
                                {sectionCopy.checklist.map(item => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ol>
                            <a href={section.href}>{sectionCopy.action}</a>
                        </aside>
                    </div>
                </article>;
            })}
        </div>

        <section className={styles.closing} aria-labelledby="guides-closing-title">
            <div className={styles.closingLead}>
                <span className={styles.sectionEyebrow}>NexoChess</span>
                <h2 id="guides-closing-title">{copy.closing.title}</h2>
                <p>{copy.closing.description}</p>

                <div className={styles.heroActions}>
                    <a className={styles.primaryAction} href="/analysis">
                        {copy.closing.analysisAction}
                    </a>
                    <a className={styles.secondaryAction} href="/puzzles">
                        {copy.closing.puzzlesAction}
                    </a>
                </div>
            </div>

            <nav className={styles.relatedTools} aria-label="NexoChess">
                {relatedTools.map(tool => (
                    <a className={styles.relatedTool} href={tool.href} key={tool.href}>
                        <strong>{tool.title}</strong>
                        <p>{tool.description}</p>
                        <span aria-hidden="true">→</span>
                    </a>
                ))}
            </nav>
        </section>
    </main>;
}

export default Guides;
