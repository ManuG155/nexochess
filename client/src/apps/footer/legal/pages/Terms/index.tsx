import React from "react";

import LegalDocument from "../../components/LegalDocument";

const sectionOrder = [
    "scope",
    "service",
    "accounts",
    "acceptableUse",
    "gameContent",
    "thirdParties",
    "openSource",
    "availability",
    "liability",
    "changes"
];

function Terms() {
    return <LegalDocument
        documentKey="terms"
        sectionOrder={sectionOrder}
    />;
}

export default Terms;
