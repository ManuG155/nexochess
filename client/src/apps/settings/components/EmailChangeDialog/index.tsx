import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import accountErrors from "shared/constants/account/errors";
import schemas from "shared/constants/account/schemas";
import Dialog from "@/components/common/Dialog";
import Button from "@/components/common/Button";
import LogMessage from "@/components/common/LogMessage";
import TextField from "@/components/common/TextField";
import authClient from "@/lib/auth";

import {
    VerifyStatus,
    editProfileStrings,
    verifyButtonColours
} from "@/apps/settings/constants/utils";

import EmailChangeDialogProps from "./EmailChangeDialogProps";
import * as settingsStyles from "../../index.module.css";
import * as styles from "./EmailChangeDialog.module.css";

function EmailChangeDialog({ onClose }: EmailChangeDialogProps) {
    const { t, i18n } = useTranslation(["settings", "common"]);

    const [ email, setEmail ] = useState("");
    
    const [ verifyStatus, setVerifyStatus ] = useState<VerifyStatus>("unsent");
    const [ verifyError, setVerifyError ] = useState<string>();

    const buttonMessages = useMemo(() => ({
        unsent: t(`${editProfileStrings}.email.changeButton.unsent`),
        sending: t(`${editProfileStrings}.email.changeButton.sending`),
        sent: t(`${editProfileStrings}.email.changeButton.sent`)
    }), [i18n.language]);

    function getChangeEmailError(error: {
        code?: string;
        status?: number;
    }) {
        const code = error.code?.toUpperCase();

        if (code == "EMAIL_IS_THE_SAME") {
            return t(`${editProfileStrings}.email.same`);
        }

        if ([
            "USER_ALREADY_EXISTS",
            "EMAIL_ALREADY_EXISTS",
            "EMAIL_ALREADY_IN_USE",
            "EMAIL_TAKEN"
        ].includes(code || "")) {
            return t(`${editProfileStrings}.email.taken`);
        }

        if ([
            "EMAIL_NOT_VERIFIED",
            "EMAIL_VERIFICATION_REQUIRED"
        ].includes(code || "")) {
            return t(`${editProfileStrings}.email.currentNotVerified`);
        }

        if (
            error.status == 401
            || ["UNAUTHORIZED", "INVALID_SESSION", "SESSION_EXPIRED"]
                .includes(code || "")
        ) {
            return t(`${editProfileStrings}.email.sessionExpired`);
        }

        if (error.status == 429 || code == "TOO_MANY_REQUESTS") {
            return t(`${editProfileStrings}.email.cooldown`);
        }

        return t(`${editProfileStrings}.email.sendFailed`);
    }

    async function changeEmail() {
        if (verifyStatus != "unsent") return;

        const normalisedEmail = email.trim().toLowerCase();

        if (!schemas.email.safeParse(normalisedEmail).success) {
            setVerifyError(t(accountErrors.INVALID_EMAIL.message));
            return;
        }

        setVerifyError(undefined);
        setVerifyStatus("sending");

        try {
            const response = await authClient.changeEmail({
                callbackURL: "/settings/user",
                newEmail: normalisedEmail
            }, {
                headers: {
                    "x-nexochess-language": i18n.resolvedLanguage
                        || i18n.language
                }
            });

            if (response.error) {
                setVerifyStatus("unsent");
                setVerifyError(getChangeEmailError(response.error));
                return;
            }

            setEmail(normalisedEmail);
            setVerifyStatus("sent");
        } catch {
            setVerifyStatus("unsent");
            setVerifyError(t(`${editProfileStrings}.email.sendFailed`));
        }
    }

    return <Dialog className={styles.wrapper} onClose={onClose}>
        <span className={styles.message}>
            {t(`${editProfileStrings}.email.verification`)}
        </span>

        <div className={settingsStyles.updateDialogInputContainer}>
            <TextField
                className={settingsStyles.inputField}
                placeholder={t("account.placeholders.email", { ns: "common" })}
                value={email}
                onChange={setEmail}
            />

            {verifyError && <LogMessage>
                {verifyError}
            </LogMessage>}
        </div>

        <div className={styles.verificationButtonContainer}>
            <Button
                className={styles.verificationButton}
                style={{
                    backgroundColor: verifyButtonColours[verifyStatus],
                    cursor: verifyStatus == "unsent" ? "pointer" : "default"
                }}
                disabled={verifyStatus == "sending"}
                onClick={changeEmail}
            >
                {buttonMessages[verifyStatus]}
            </Button>
        </div>
    </Dialog>;
}

export default EmailChangeDialog;