import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import LegalDocument from "../../components/LegalDocument";
import { applyAdvertisingPrivacyRevision } from "./advertisingPrivacyRevision";
import { applyAnalyticsPrivacyRevision } from "./analyticsPrivacyRevision";
import { getPrivacyRevisionCopy } from "./privacyRevisionCopy";

const sectionOrder = [
    "controller",
    "dataCollected",
    "purposes",
    "legalBases",
    "browserStorage",
    "accounts",
    "publicSharing",
    "providers",
    "internationalTransfers",
    "retention",
    "security",
    "automatedDecisions",
    "rights",
    "children",
    "changes"
];

function PrivacyPolicy() {
    const { i18n } = useTranslation("legal");
    const language = i18n.resolvedLanguage || i18n.language;
    const copy = useMemo(
        () => applyAdvertisingPrivacyRevision(
            applyAnalyticsPrivacyRevision(
                getPrivacyRevisionCopy(language),
                language
            ),
            language
        ),
        [language]
    );

    return <LegalDocument
        documentKey="privacy"
        sectionOrder={sectionOrder}
        copy={copy}
    />;
}

export default PrivacyPolicy;
