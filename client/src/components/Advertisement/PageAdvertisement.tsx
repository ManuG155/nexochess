import React from "react";

import ads from "@/constants/advertisements";
import Advertisement from ".";

function PageAdvertisement() {
    return <div style={{
        width: "min(970px, calc(100% - 40px))",
        minHeight: "90px",
        margin: "24px auto 40px"
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
