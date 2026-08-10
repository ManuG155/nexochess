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

function isAdvertisementPreviewHost() {
    if (typeof window === "undefined") return false;

    const hostname = window.location.hostname.toLowerCase();

    return hostname === "localhost"
        || hostname.startsWith("127.")
        || hostname.startsWith("nexochess-staging.");
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
    const previewHost = isAdvertisementPreviewHost();
    const pubId = publisherId
        || readPublisherIdFromPage()
        || process.env.ADS_PUBLISHER_ID
        || "";

    useEffect(() => {
        if (blocked || previewHost || !pubId || !adUnitId) return;

        try {
            window.adsbygoogle ??= [];
            window.adsbygoogle.push({});
        } catch {
            console.warn("advertisement duplicate load cancelled.");
        }
    }, [blocked, previewHost, pubId, adUnitId]);

    if (blocked || !adUnitId) return null;

    if (previewHost) {
        const previewClasses = [
            className,
            styles.preview,
            format === "vertical" ? styles.previewVertical : ""
        ].filter(Boolean).join(" ");

        return <div
            className={previewClasses}
            style={style}
            aria-label="Vista previa de espacio publicitario"
        >
            <span>ESPACIO PUBLICITARIO</span>
            <small>Vista previa · staging</small>
        </div>;
    }

    // Production renders nothing when the account or slot is unavailable.
    // This prevents blank inventory and avoids accidental requests elsewhere.
    if (!pubId) return null;

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
