import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import AnalysisStatus from "@analysis/constants/AnalysisStatus";
import useAnalysisProgressStore from "@analysis/stores/AnalysisProgressStore";
import LogMessage from "@/components/common/LogMessage";

import useAnalyseGame from "@analysis/hooks/useAnalyseGame";

import * as styles from "./AnalysisProgress.module.css";

const DEFAULT_COACH = {
    name: "Pixie",
    image: "/images/bots/fog.png"
} as const;

function AnalysisProgress() {
    const { t } = useTranslation(["analysis", "coach"], { useSuspense: false });

    const {
        evaluationProgress,
        analysisStatus,
        analysisError
    } = useAnalysisProgressStore();

    const analyseGame = useAnalyseGame();

    useEffect(() => {
        if (analysisStatus != AnalysisStatus.AWAITING_CAPTCHA) return;

        if (!document.hasFocus()) {
            document.title = t("progressReporter.completeNotification");
        }

        function focusListener() {
            document.title = "NexoChess";
            removeEventListener("focus", focusListener);
        }

        addEventListener("focus", focusListener);
    }, [analysisStatus, t]);

    useEffect(() => {
        if (analysisStatus != AnalysisStatus.AWAITING_CAPTCHA) return;

        /*
         * The engine evaluation and final report now both run in the browser.
         * AWAITING_CAPTCHA is retained as the existing internal transition
         * value, but no network CAPTCHA or analysis session is required.
         */
        void analyseGame();
    }, [analysisStatus]);

    if (analysisStatus == AnalysisStatus.INACTIVE) {
        return null;
    }

    const displayProgress = analysisStatus == AnalysisStatus.AWAITING_CAPTCHA
        ? 1
        : Math.max(0, Math.min(1, evaluationProgress));

    return (
        <section
            className={styles.wrapper}
            aria-live="polite"
        >
            <div className={styles.coachAvatarArea}>
                <img
                    className={styles.coachAvatar}
                    src={DEFAULT_COACH.image}
                    alt={DEFAULT_COACH.name}
                />
            </div>

            <div className={styles.speechBubble}>
                <p className={styles.message}>
                    {t("progress.reviewing", { ns: "coach" })}
                </p>

                <div
                    className={styles.progressOutline}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(displayProgress * 100)}
                    aria-label={t("progress.aria", {
                        ns: "coach",
                        progress: Math.round(displayProgress * 100)
                    })}
                >
                    <div className={styles.progressTrack}>
                        <div
                            className={styles.progressFill}
                            style={{
                                width: `${displayProgress * 100}%`
                            }}
                        />
                    </div>
                </div>

                {analysisError && (
                    <div className={styles.errorArea}>
                        <LogMessage>
                            {analysisError}
                        </LogMessage>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AnalysisProgress;