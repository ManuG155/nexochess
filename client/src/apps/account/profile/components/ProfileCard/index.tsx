import React from "react";
import { useTranslation } from "react-i18next";

import ProfileCardProps from "./ProfileCardProps";
import * as styles from "./ProfileCard.module.css";

function ProfileCard({
    className,
    style,
    profile
}: ProfileCardProps) {
    const { t, i18n } = useTranslation("otherPages");
    const locale = i18n.resolvedLanguage || i18n.language;

    return <div
        className={`${styles.wrapper} ${className}`}
        style={{
            animation: !profile
                ? `${styles.pulse} 1.5s infinite ease`
                : undefined,
            ...style
        }}
    >
        {profile && <>
            <div className={styles.avatar}>
                AVATAR
            </div>

            <div className={styles.details}>
                <span className={styles.displayName}>
                    {profile.displayName}

                    {profile.roles.map(role => <span key={role}>
                        {role}
                    </span>)}
                </span>

                <span className={styles.username} contentEditable>
                    {profile.username}
                </span>

                <span>
                    {t("profile.memberSince", {
                        date: new Intl.DateTimeFormat(locale, {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }).format(new Date(profile.createdAt))
                    })}
                </span>
            </div>
        </>}
    </div>;
}

export default ProfileCard;
