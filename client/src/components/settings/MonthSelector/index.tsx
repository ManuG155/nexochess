import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../common/Button";

import MonthSelectorProps from "./MonthSelectorProps";
import * as styles from "./MonthSelector.module.css";

import iconInterfaceBack from "@assets/img/interface/back.svg";
import iconInterfaceNext from "@assets/img/interface/next.svg";

function MonthSelector({ 
    onMonthChange, 
    allowFuture, 
    locked
}: MonthSelectorProps) {
    const { i18n } = useTranslation();

    const [ year, setYear ] = useState(new Date().getFullYear());
    const [ month, setMonth ] = useState(new Date().getMonth());

    const monthName = new Intl.DateTimeFormat(
        i18n.resolvedLanguage || i18n.language,
        { month: "long" }
    ).format(new Date(year, month, 1));

    function incrementMonth(offset: number) {
        if (locked) return;

        let newMonth = month + offset;
        let newYear = year;

        const currentDate = new Date();
        if (
            newMonth > currentDate.getMonth() 
            && newYear >= currentDate.getFullYear()
            && !allowFuture
        ) return;

        if (newMonth >= 12) {
            newYear += Math.floor(newMonth / 12);
            newMonth %= 12;
        } else if (newMonth < 0) {
            newYear += Math.floor(newMonth / 12);
            newMonth = 12 + newMonth;
        }

        setMonth(newMonth);
        setYear(newYear);

        onMonthChange?.(newMonth + 1, newYear);
    }

    return <div className={styles.wrapper}>
        <Button
            className={styles.selectorButton}
            icon={iconInterfaceBack}
            iconSize="30px"
            onClick={() => incrementMonth(-1)}
        />

        <span>
            {monthName.charAt(0).toLocaleUpperCase(
                i18n.resolvedLanguage || i18n.language
            ) + monthName.slice(1)} {year}
        </span>

        <Button
            className={styles.selectorButton}
            icon={iconInterfaceNext}
            iconSize="30px"
            onClick={() => incrementMonth(1)}
        />
    </div>;
}

export default MonthSelector;
