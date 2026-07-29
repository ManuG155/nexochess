import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

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

function SignIn() {
    const { t } = useTranslation(["otherPages", "common"]);
    const navigate = useNavigate();
    const getErrorMessage = useAuthErrors();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<StatusMessage>();
    const [pending, setPending] = useState(false);

    useAuthErrorReporter(setStatus);

    async function googleLogin() {
        try {
            const response = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/analysis",
                errorCallbackURL: "/signin",
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
                    message: t("unknownError", { ns: "common" })
                });
                return;
            }

            window.location.assign(response.data.url);
        } catch (error) {
            console.error("Failed to start Google authentication:", error);
            setStatus({
                theme: "error",
                message: t("unknownError", { ns: "common" })
            });
        }
    }

    async function login() {
        if (pending) return;
        setPending(true);

        const loginResponse = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/analysis"
        });

        if (loginResponse.error) {
            setStatus({
                theme: "error",
                message: getErrorMessage(loginResponse.error.code)
            });
            setPending(false);
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.dialog}>
                <a className={styles.brand} href="/analysis" aria-label={t("navigationBar.openAnalysis", { ns: "common" })}>
                    <img src="/img/nexochess-white.png" alt="NexoChess"/>
                </a>

                <div className={styles.heading}>
                    <h1>{t("signIn.loginTitle")}</h1>
                    <p>{t("signIn.loginDescription")}</p>
                </div>

                <Button
                    icon={iconGoogle}
                    iconSize="24px"
                    className={`${styles.actionButton} ${styles.googleButton}`}
                    onClick={googleLogin}
                >
                    {t("signIn.loginButtonGoogle")}
                </Button>

                <Separator className={styles.divider}>
                    <span>{t("signIn.alternative")}</span>
                </Separator>

                <div className={styles.fields}>
                    <label className={styles.fieldGroup}>
                        <span>{t("account.fields.email", { ns: "common" })}</span>
                        <TextField
                            wrapperStyle={{ width: "100%" }}
                            className={styles.field}
                            placeholder={t("account.placeholders.email", { ns: "common" })}
                            onChange={setEmail}
                        />
                    </label>

                    <label className={styles.fieldGroup}>
                        <span>{t("password", { ns: "common" })}</span>
                        <TextField
                            wrapperStyle={{ width: "100%" }}
                            className={styles.field}
                            placeholder={t("account.placeholders.password", { ns: "common" })}
                            password
                            onChange={setPassword}
                        />
                    </label>
                </div>

                <Button
                    className={`${styles.actionButton} ${styles.primaryButton}`}
                    disabled={pending || !email || !password}
                    onClick={() => void login()}
                >
                    {pending ? t("signIn.loginPending") : t("signIn.loginButtonEmail")}
                </Button>

                {status && (
                    <LogMessage theme={status.theme}>{status.message}</LogMessage>
                )}

                <div className={styles.switchFlow}>
                    <span>{t("signIn.newUser")}</span>
                    <button type="button" onClick={() => navigate("/signup")}>
                        {t("signIn.createAccount")}
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

export default SignIn;
