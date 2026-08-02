import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import schemas from "shared/constants/account/schemas";
import { validate } from "shared/lib/utils/validate";
import useAuthErrors from "@/hooks/auth/useAuthErrors";
import useAuthErrorReporter from "../../hooks/useAuthErrorReporter";
import Separator from "@/components/common/Separator";
import TextField from "@/components/common/TextField";
import Button from "@/components/common/Button";
import LogMessage from "@/components/common/LogMessage";
import StatusMessage from "@/components/common/LogMessage/StatusMessage";
import authClient from "@/lib/auth";

import * as styles from "../../index.module.css";
import iconGoogle from "@assets/img/connections/google.png";

function SignUp() {
    const { t, i18n } = useTranslation(["common", "otherPages"]);
    const navigate = useNavigate();
    const getErrorMessage = useAuthErrors();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [status, setStatus] = useState<StatusMessage>();
    const [registrationPending, setRegistrationPending] = useState(false);

    useAuthErrorReporter(setStatus);

    async function googleLogin() {
        try {
            const response = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/analysis",
                errorCallbackURL: "/signup",
                disableRedirect: true
            });

            if (response.error) {
                setStatus({
                    theme: "error",
                    message: getErrorMessage(response.error.code)
                });
                return;
            }

            if (!response.data?.url) {
                setStatus({
                    theme: "error",
                    message: t("unknownError")
                });
                return;
            }

            window.location.assign(response.data.url);
        } catch (error) {
            console.error("Failed to start Google authentication:", error);
            setStatus({
                theme: "error",
                message: t("unknownError")
            });
        }
    }

    async function register() {
        if (password != confirmedPassword) {
            return setStatus({
                theme: "error",
                message: t("account.errors.passwordNoMatch")
            });
        }

        const registration = { email, name: username, password };
        const error = validate(registration, schemas.registration);

        if (error) {
            return setStatus({
                theme: "error",
                message: getErrorMessage(error)
            });
        }

        setRegistrationPending(true);

        const registerResponse = await authClient.signUp.email(registration, {
            headers: {
                "x-nexochess-language": i18n.resolvedLanguage
                    || i18n.language
            },
            onSuccess: () => window.location.assign("/analysis")
        });

        if (registerResponse.error) {
            setStatus({
                theme: "error",
                message: getErrorMessage(registerResponse.error.code)
            });

            console.error(`failed to sign up: ${JSON.stringify(registerResponse.error)}`);
        }

        setRegistrationPending(false);
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.dialog}>
                <a className={styles.brand} href="/analysis" aria-label={t("navigationBar.openAnalysis", { ns: "common" })}>
                    <img src="/img/nexochess-white.png" alt="NexoChess"/>
                </a>

                <div className={styles.heading}>
                    <h1>{t("signIn.registerTitle", { ns: "otherPages" })}</h1>
                    <p>{t("signIn.registerDescription", { ns: "otherPages" })}</p>
                </div>

                <Button
                    icon={iconGoogle}
                    iconSize="24px"
                    className={`${styles.actionButton} ${styles.googleButton}`}
                    onClick={googleLogin}
                >
                    {t("signIn.registerButtonGoogle", { ns: "otherPages" })}
                </Button>

                <Separator className={styles.divider}>
                    <span>{t("signIn.alternative", { ns: "otherPages" })}</span>
                </Separator>

                <div className={styles.fields}>
                    <label className={styles.fieldGroup}>
                        <span>{t("account.fields.email")}</span>
                        <TextField
                            wrapperStyle={{ width: "100%" }}
                            className={styles.field}
                            placeholder={t("account.placeholders.email")}
                            onChange={setEmail}
                        />
                    </label>

                    <label className={styles.fieldGroup}>
                        <span>{t("account.fields.username")}</span>
                        <TextField
                            wrapperStyle={{ width: "100%" }}
                            className={styles.field}
                            placeholder={t("account.placeholders.username")}
                            onChange={setUsername}
                        />
                    </label>

                    <div className={styles.passwordGrid}>
                        <label className={styles.fieldGroup}>
                            <span>{t("password")}</span>
                            <TextField
                                wrapperStyle={{ width: "100%" }}
                                className={styles.field}
                                placeholder={t("account.placeholders.password")}
                                password
                                onChange={setPassword}
                            />
                        </label>

                        <label className={styles.fieldGroup}>
                            <span>{t("confirmPassword")}</span>
                            <TextField
                                wrapperStyle={{ width: "100%" }}
                                className={styles.field}
                                placeholder={t("account.placeholders.confirmPassword")}
                                password
                                onChange={setConfirmedPassword}
                            />
                        </label>
                    </div>
                </div>

                <Button
                    className={`${styles.actionButton} ${styles.primaryButton}`}
                    disabled={registrationPending || !email || !username || !password || !confirmedPassword}
                    onClick={() => void register()}
                >
                    {registrationPending ? t("signIn.registerPending", { ns: "otherPages" }) : t("signIn.registerButtonEmail", { ns: "otherPages" })}
                </Button>

                {status && (
                    <LogMessage theme={status.theme}>{status.message}</LogMessage>
                )}

                <div className={styles.switchFlow}>
                    <span>{t("signIn.existingUser", { ns: "otherPages" })}</span>
                    <button type="button" onClick={() => navigate("/signin")}>
                        {t("signIn.loginButtonEmail", { ns: "otherPages" })}
                    </button>
                </div>

                <p className={styles.legalMessage}>
                    <Trans
                        ns="otherPages"
                        i18nKey="signIn.legalMessage"
                        components={{
                            terms: <a href="/terms" />,
                            privacy: <a href="/privacy" />
                        }}
                    />
                </p>
            </div>
        </div>
    );
}

export default SignUp;
