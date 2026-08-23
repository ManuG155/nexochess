import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import * as styles from "./EndgameAccess.module.css";

const ACCESS_COPY: Record<string, { title: string; subtitle: string; cta: string }> = {
    en: { title: "Endgame laboratory", subtitle: "Playable endgames with exact feedback, from fundamentals to advanced technique.", cta: "Open laboratory" },
    es: { title: "Laboratorio de finales", subtitle: "Finales jugables con feedback exacto, desde fundamentos hasta técnica avanzada.", cta: "Abrir laboratorio" },
    fr: { title: "Laboratoire de finales", subtitle: "Finales jouables avec retour exact, des bases à la technique avancée.", cta: "Ouvrir le laboratoire" },
    de: { title: "Endspiel-Labor", subtitle: "Spielbare Endspiele mit exaktem Feedback, von Grundlagen bis Fortgeschritten.", cta: "Labor öffnen" },
    pt: { title: "Laboratório de finais", subtitle: "Finais jogáveis com feedback exato, dos fundamentos à técnica avançada.", cta: "Abrir laboratório" },
    ru: { title: "Лаборатория эндшпиля", subtitle: "Игровые эндшпили с точной проверкой — от основ до продвинутой техники.", cta: "Открыть лабораторию" },
    zh: { title: "残局实验室", subtitle: "可实战的残局训练，使用精确反馈，从基础到高级技术。", cta: "打开实验室" },
    vi: { title: "Phòng thí nghiệm tàn cuộc", subtitle: "Tàn cuộc có thể chơi với phản hồi chính xác, từ cơ bản đến nâng cao.", cta: "Mở phòng luyện" },
    hi: { title: "एंडगेम प्रयोगशाला", subtitle: "बुनियादी से उन्नत स्तर तक सटीक फ़ीडबैक वाले खेलने योग्य एंडगेम।", cta: "प्रयोगशाला खोलें" },
    mr: { title: "एंडगेम प्रयोगशाळा", subtitle: "मूलभूत ते प्रगत तंत्रापर्यंत अचूक अभिप्रायासह खेळता येणारे एंडगेम.", cta: "प्रयोगशाळा उघडा" },
    pl: { title: "Laboratorium końcówek", subtitle: "Grywalne końcówki z dokładnym feedbackiem — od podstaw po technikę zaawansowaną.", cta: "Otwórz laboratorium" }
};

function languageKey(value?: string) {
    return (value || "en").toLowerCase().replace("_", "-").split("-")[0];
}

function findInsertionPoint() {
    const mains = [...document.querySelectorAll("main")];
    return mains.find(main => main.firstElementChild?.tagName == "SECTION") || null;
}

function EndgameGateway({ onOpen }: { onOpen: () => void }) {
    const { i18n } = useTranslation();
    const [host, setHost] = useState<HTMLDivElement | null>(null);
    const key = languageKey(i18n.resolvedLanguage || i18n.language);
    const copy = ACCESS_COPY[key] || ACCESS_COPY.en;

    useEffect(() => {
        let container: HTMLDivElement | null = null;

        function sync() {
            const main = findInsertionPoint();
            if (!main) {
                if (container) {
                    container.remove();
                    container = null;
                    setHost(null);
                }
                return;
            }

            const first = main.firstElementChild;
            if (!first) return;

            if (container && container.parentElement == main) return;
            container?.remove();
            container = document.createElement("div");
            container.dataset.nexoEndgameGateway = "true";
            first.insertAdjacentElement("afterend", container);
            setHost(container);
        }

        sync();
        const observer = new MutationObserver(sync);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            container?.remove();
        };
    }, []);

    if (!host) return null;

    return createPortal(
        <div className={styles.access}>
            <button type="button" className={styles.card} onClick={onOpen}>
                <span className={styles.icon} aria-hidden="true">♔</span>
                <span className={styles.copy}>
                    <strong>{copy.title}</strong>
                    <span>{copy.subtitle}</span>
                </span>
                <span className={styles.cta}>{copy.cta} →</span>
            </button>
        </div>,
        host
    );
}

export default EndgameGateway;
