import React from "react";
import { useTranslation } from "react-i18next";

import useSettingsStore from "@/stores/SettingsStore";
import SwitchSetting from "@/components/settings/SwitchSetting";
import Separator from "@/components/common/Separator";

import * as categoryStyles from "../Category.module.css";
import * as styles from "./Coach.module.css";

function Coach() {
    const { t } = useTranslation("settings");
    const { settings, setSettings } = useSettingsStore();
    const coachEnabled = settings.coach.enabled;

    return (
        <div className={categoryStyles.wrapper}>
            <div className={styles.headingBlock}>
                <b className={categoryStyles.header}>{t("coach.title")}</b>
                <p className={styles.intro}>{t("coach.description")}</p>
            </div>

            <section className={styles.section}>
                <div className={styles.settingRow}>
                    <div className={styles.settingCopy}>
                        <h2 className={styles.sectionTitle}>
                            {t("coach.enabled.title")}
                        </h2>
                        <p className={styles.sectionDescription}>
                            {t("coach.enabled.description")}
                        </p>
                    </div>

                    <SwitchSetting
                        defaultChecked={coachEnabled}
                        onChange={checked => setSettings(draft => {
                            draft.coach.enabled = checked;
                            return draft;
                        })}
                    />
                </div>
            </section>

            <Separator className={categoryStyles.separator}/>

            <section className={styles.section}>
                <div className={styles.settingRow}>
                    <div className={styles.settingCopy}>
                        <h2 className={styles.sectionTitle}>
                            {t("coach.animations.title")}
                        </h2>
                        <p className={styles.sectionDescription}>
                            {t("coach.animations.description")}
                        </p>
                    </div>

                    <SwitchSetting
                        defaultChecked={settings.coach.animations}
                        disabled={!coachEnabled}
                        onChange={checked => setSettings(draft => {
                            draft.coach.animations = checked;
                            return draft;
                        })}
                    />
                </div>
            </section>
        </div>
    );
}

export default Coach;
