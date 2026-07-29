import React from "react";
import { useTranslation } from "react-i18next";

import Button from "@/components/common/Button";

import AnalyseButtonProps from "./AnalyseButtonProps";
import * as styles from "./AnalyseButton.module.css";

import iconAnalysis from "@assets/img/interface/analysis.svg";

function AnalyseButton({
    style,
    disabled,
    onClick
}: AnalyseButtonProps) {
    const { t } = useTranslation("analysis");

    return <Button
        className={styles.analyseButton}
        style={style}
        icon={iconAnalysis}
        iconSize="30px"
        disabled={disabled}
        onClick={onClick}
    >
        {t("analyseButton")}
    </Button>;
}

export default AnalyseButton;