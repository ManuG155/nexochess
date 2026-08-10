import React, { useEffect } from "react";

import AdvertisementProps from "./AdvertisementProps";
import * as styles from "./Advertisement.module.css";

function readPublisherIdFromPage() {
    if (typeof document === "undefined") return "";

    return document
        .querySelector<HTMLMetaElement>('meta[name="google-adsense-account"]')
        ?.content
        .trim() || "";
}

function Advertisement({
    className,
    style,
    publisherId,
    adUnitId,
    format = "auto",
    fullWidthResponsive = true
}: AdvertisementProps) {
    const pubId = publisherId
        || readPublisherIdFromPage()
        || process.env.ADS_PUBLISHER_ID
        || "";

    useEffect(() => {
        if (!pubId || !adUnitId) return;

        try {
            window.adsbygoogle ??= [];
            window.adsbygoogle.push({});
        } catch {
            console.warn("advertisement duplicate load cancelled.");
        }
    }, [pubId, adUnitId]);

    // Staging intentionally has no AdSense account meta tag. Rendering nothing
    // there avoids blank inventory and keeps real ad requests production-only.
    if (!pubId || !adUnitId) return null;

    const devClassName = process.env.NODE_ENV == "development"
        ? styles.dev : "";
    const classes = ["adsbygoogle", className, devClassName]
        .filter(Boolean)
        .join(" ");

    return <ins
        className={classes}
        style={{ display: "block", ...style }}
        data-ad-client={pubId}
        data-ad-slot={adUnitId}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
    />;
}

export default Advertisement;
