import React from "react";
import { useTranslation } from "react-i18next";

import Button from "@/components/common/Button";
import ButtonColour from "@/components/common/Button/Colour";

import * as styles from "./Unfound.module.css";

import iconUnfoundgame from "@assets/img/unfoundgame.gif";
import iconInterfaceBack from "@assets/img/interface/back.svg";

function Unfound() {
    const { t } = useTranslation("common");

    return <div className={styles.wrapper}>
        <h1 className={styles.errorCode}>404</h1>
        <span>{t("notFound.message")}</span>

        <img
            className={styles.image}
            src={iconUnfoundgame}
            alt=""
        />

        <a href="/">
            <Button
                icon={iconInterfaceBack}
                iconSize="30px"
                style={{
                    backgroundColor: ButtonColour.BLUE,
                    padding: "5px 10px"
                }}
            >
                {t("notFound.returnHome")}
            </Button>
        </a>
    </div>;
}

export default Unfound;