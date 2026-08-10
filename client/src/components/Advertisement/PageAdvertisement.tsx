import React from "react";

import ads from "@/constants/advertisements";
import Advertisement from ".";

function PageAdvertisement() {
    return <div style={{
        width: "min(1180px, calc(100% - 64px))",
        minHeight: "90px",
        margin: "22px auto"
    }}>
        <Advertisement
            adUnitId={ads.content.inline}
            format="horizontal"
            fullWidthResponsive
            style={{ width: "100%", minHeight: "90px" }}
        />
    </div>;
}

export default PageAdvertisement;
