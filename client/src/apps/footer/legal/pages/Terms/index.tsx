import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import LegalDocument from "../../components/LegalDocument";
import { getTermsRevisionCopy } from "./termsRevisionCopy";

const sectionOrder = [
    "scope",
    "service",
    "eligibility",
    "accounts",
    "acceptableUse",
    "gameContent",
    "thirdParties",
    "openSource",
    "commercialFeatures",
    "availability",
    "suspension",
    "liability",
    "changes",
    "law"
];

function Terms() {
    const { i18n } = useTranslation("legal");
    const copy = useMemo(
        () => getTermsRevisionCopy(
            i18n.resolvedLanguage || i18n.language
        ),
        [i18n.resolvedLanguage, i18n.language]
    );

    return <LegalDocument
        documentKey="terms"
        sectionOrder={sectionOrder}
        copy={copy}
    />;
}

export default Terms;
