import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import SemanticDiscoverySection from
    "@/components/SemanticDiscoverySection/SemanticDiscoverySection";
import type { SemanticPageCopy } from "@/i18n/semanticDiscoveryCopy";

import * as styles from "./PuzzleInfoDisclosure.module.css";

interface PuzzleInfoDisclosureProps {
    copy: SemanticPageCopy;
    relatedHref: string;
    helpHref: string;
}

function PuzzleInfoDisclosure({
    copy,
    relatedHref,
    helpHref
}: PuzzleInfoDisclosureProps) {
    const [open, setOpen] = useState(false);
    const [host, setHost] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const resolveHost = () => {
            const next = document.querySelector<HTMLElement>(
                ".nexo-puzzle-left-rail"
            );

            setHost(current => current === next ? current : next);

            if (!next) setOpen(false);
        };

        resolveHost();

        const observer = new MutationObserver(resolveHost);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => observer.disconnect();
    }, []);

    return <>
        {host && createPortal(
            <button
                type="button"
                className={styles.infoButton}
                data-puzzle-info-toggle="true"
                aria-expanded={open}
                aria-label={copy.title}
                title={copy.title}
                onClick={() => setOpen(value => !value)}
            >
                <span aria-hidden="true">i</span>
            </button>,
            host
        )}

        {open && (
            <div className={styles.discovery}>
                <SemanticDiscoverySection
                    copy={copy}
                    relatedHref={relatedHref}
                    helpHref={helpHref}
                />
            </div>
        )}
    </>;
}

export default PuzzleInfoDisclosure;
