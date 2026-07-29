import React from "react";

import LegalDocument from "../../components/LegalDocument";

const sectionOrder = [
    "controller",
    "dataCollected",
    "purposes",
    "browserStorage",
    "accounts",
    "providers",
    "retention",
    "rights",
    "children",
    "changes"
];

function PrivacyPolicy() {
    return <LegalDocument
        documentKey="privacy"
        sectionOrder={sectionOrder}
    />;
}

export default PrivacyPolicy;
