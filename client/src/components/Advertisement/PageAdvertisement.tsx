import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import ads from "@/constants/advertisements";
import Advertisement from ".";

interface PageAdvertisementProps {
    afterSelector: string;
}

function PageAdvertisement({ afterSelector }: PageAdvertisementProps) {
    const [host, setHost] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        const target = document.querySelector(afterSelector);
        if (!target) return;

        const advertisementHost = document.createElement("div");
        advertisementHost.dataset.nexoAdvertisement = "inline";
        target.insertAdjacentElement("afterend", advertisementHost);
        setHost(advertisementHost);

        return () => {
            setHost(null);
            advertisementHost.remove();
        };
    }, [afterSelector]);

    if (!host) return null;

    return createPortal(
        <div style={{
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
        </div>,
        host
    );
}

export default PageAdvertisement;
