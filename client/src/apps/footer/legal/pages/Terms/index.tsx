import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import LegalDocument from "../../components/LegalDocument";
import { getOperatorIdentityCopy } from "./operatorIdentityCopy";
import { getTermsRevisionCopy } from "./termsRevisionCopy";

const sectionOrder = [
    "scope",
    "operator",
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
    const language = i18n.resolvedLanguage || i18n.language;
    const copy = useMemo(() => {
        const revision = getTermsRevisionCopy(language);

        return {
            ...revision,
            sections: {
                ...(revision.sections || {}),
                operator: getOperatorIdentityCopy(language)
            }
        };
    }, [language]);

    return <LegalDocument
        documentKey="terms"
        sectionOrder={sectionOrder}
        copy={copy}
    />;
}

export default Terms;
