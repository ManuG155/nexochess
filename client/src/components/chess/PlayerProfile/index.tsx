import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import PlayerProfileProps from "./PlayerProfileProps";
import * as styles from "./PlayerProfile.module.css";

import iconDefaultProfileImage from "@assets/img/defaultprofileimage.png";


/*
 * Normaliza códigos ISO alpha-2 y URLs del tipo:
 * https://api.chess.com/pub/country/PE
 */
function getCountryCode(country?: string) {
    if (!country) return undefined;

    const rawCode = country
        .trim()
        .split("/")
        .filter(Boolean)
        .at(-1)
        ?.toUpperCase();

    if (!rawCode || !/^[A-Z]{2}$/.test(rawCode)) {
        return undefined;
    }

    return rawCode;
}


/*
 * Windows/Chrome no siempre dibuja los regional indicators como una bandera
 * y puede mostrar "PE", "IT", etc. Usamos el SVG de Twemoji para garantizar
 * que siempre se vea la bandera gráfica real.
 */
function getTwemojiFlagUrl(countryCode?: string) {
    if (!countryCode) return undefined;

    const codePoints = [...countryCode]
        .map(character => (
            0x1F1E6
            + character.charCodeAt(0)
            - 65
        ).toString(16))
        .join("-");

    return (
        "https://cdn.jsdelivr.net/gh/"
        + "twitter/twemoji@14.0.2/assets/svg/"
        + `${codePoints}.svg`
    );
}


function formatClock(seconds: number) {
    const safeSeconds = Math.max(
        0,
        Math.floor(seconds)
    );

    const hours = Math.floor(
        safeSeconds / 3600
    );

    const minutes = Math.floor(
        (safeSeconds % 3600) / 60
    );

    const remainingSeconds =
        safeSeconds % 60;

    if (hours > 0) {
        return (
            `${hours}:`
            + `${minutes.toString().padStart(2, "0")}:`
            + remainingSeconds.toString().padStart(2, "0")
        );
    }

    return (
        `${minutes}:`
        + remainingSeconds.toString().padStart(2, "0")
    );
}


function ClockIcon() {
    return (
        <svg
            className={styles.clockIcon}
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="8.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M12 7.5v5l3.5 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}


function PlayerProfile({
    profile,
    capturedPieces = [],
    materialAdvantage = 0,
    clockSeconds,
    clockActive = false
}: PlayerProfileProps) {

    const { t } = useTranslation("common");
    const [ defaultImage, setDefaultImage ] = useState(false);

    const countryCode = getCountryCode(
        profile.country
    );

    const displayCountryCode = countryCode == "IL"
        ? "UN"
        : countryCode;

    const flagUrl = useMemo(
        () => getTwemojiFlagUrl(displayCountryCode),
        [ displayCountryCode ]
    );

    const imageSource =
        !profile.image
        || defaultImage
            ? iconDefaultProfileImage
            : profile.image;

    return (
        <div className={styles.wrapper}>

            <img
                className={styles.profileImage}
                src={imageSource}
                alt={profile.username || "Player"}
                onError={() => setDefaultImage(true)}
            />


            <div className={styles.profileContent}>

                <div className={styles.identityLine}>

                    {profile.title && (
                        <span className={styles.title}>
                            {profile.title}
                        </span>
                    )}

                    <span className={styles.username}>
                        {profile.username || "?"}
                    </span>

                    {profile.rating != undefined && (
                        <span className={styles.rating}>
                            ({profile.rating})
                        </span>
                    )}

                    {flagUrl && (
                        <img
                            className={styles.flag}
                            src={flagUrl}
                            alt={displayCountryCode || ""}
                            title={displayCountryCode}
                            onError={event => {
                                event.currentTarget.style.display = "none";
                            }}
                        />
                    )}

                </div>


                <div className={styles.materialLine}>

                    <span
                        className={styles.capturedPieces}
                        role="group"
                        aria-label={t("chess.capturedPieces")}
                    >
                        {capturedPieces.join("")}
                    </span>

                    {materialAdvantage > 0 && (
                        <span className={styles.materialAdvantage}>
                            +{materialAdvantage}
                        </span>
                    )}

                </div>

            </div>


            {clockSeconds != undefined && (
                <div
                    className={
                        clockActive
                            ? `${styles.clock} ${styles.clockActive}`
                            : `${styles.clock} ${styles.clockInactive}`
                    }
                >
                    {clockActive && <ClockIcon />}

                    <span className={styles.clockValue}>
                        {formatClock(clockSeconds)}
                    </span>
                </div>
            )}

        </div>
    );
}

export default PlayerProfile;
