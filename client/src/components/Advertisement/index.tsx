import React, { useEffect } from "react";

import AdvertisementProps from "./AdvertisementProps";
import * as styles from "./Advertisement.module.css";

const BLOCKED_PATH_SEGMENTS = new Set([
    "puzzles",
    "academy",
    "archive",
    "language",
    "languages",
    "contact",
    "source",
    "licenses",
    "licences",
    "about",
    "settings",
    "signin",
    "login",
    "share"
]);

function readPublisherIdFromPage() {
    if (typeof document === "undefined") return "";

    return document
        .querySelector<HTMLMetaElement>('meta[name="google-adsense-account"]')
        ?.content
        .trim() || "";
}

function isAdvertisingBlockedOnCurrentPage() {
    if (typeof window === "undefined") return false;

    return window.location.pathname
        .toLowerCase()
        .split("/")
        .filter(Boolean)
        .some(segment => BLOCKED_PATH_SEGMENTS.has(segment));
}

function Advertisement({
    className,
    style,
    publisherId,
    adUnitId,
    format = "auto",
    fullWidthResponsive = true
}: AdvertisementProps) {
    const blocked = isAdvertisingBlockedOnCurrentPage();
    const pubId = publisherId
        || readPublisherIdFromPage()
        || process.env.ADS_PUBLISHER_ID
        || "";

    useEffect(() => {
        if (blocked || !pubId || !adUnitId) return;

        try {
            window.adsbygoogle ??= [];
            window.adsbygoogle.push({});
        } catch {
            console.warn("advertisement duplicate load cancelled.");
        }
    }, [blocked, pubId, adUnitId]);

    // These surfaces are intentionally ad-free. Staging also lacks the
    // AdSense account meta tag, so it never makes real ad requests.
    if (blocked || !pubId || !adUnitId) return null;

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
