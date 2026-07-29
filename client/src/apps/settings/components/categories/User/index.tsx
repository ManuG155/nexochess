import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StatusCodes } from "http-status-codes";

import schemas from "shared/constants/account/schemas";
import { validate } from "shared/lib/utils/validate";

import { useAuthedProfile } from "@/hooks/api/useProfile";
import useAuthErrors from "@/hooks/auth/useAuthErrors";
import authClient from "@/lib/auth";
import Button from "@/components/common/Button";
import ButtonColour from "@/components/common/Button/Colour";
import Dialog from "@/components/common/Dialog";
import LogMessage from "@/components/common/LogMessage";
import Separator from "@/components/common/Separator";
import DetailUpdateDialog from "@/apps/settings/components/DetailUpdateDialog";
import EmailChangeDialog from "@/apps/settings/components/EmailChangeDialog";
import PasswordResetDialog from "@/apps/settings/components/PasswordResetDialog";

import * as categoryStyles from "../Category.module.css";
import * as styles from "./User.module.css";

interface DateOfBirthDialogProps {
    initialValue?: string;
    onClose: () => void;
    onSaved: () => void;
}

function DateOfBirthDialog({
    initialValue,
    onClose,
    onSaved
}: DateOfBirthDialogProps) {
    const { t } = useTranslation("settings");
    const [value, setValue] = useState(initialValue || "");
    const [error, setError] = useState<string>();
    const [saving, setSaving] = useState(false);

    async function saveDateOfBirth(dateOfBirth: string | null) {
        setSaving(true);
        setError(undefined);

        try {
            const response = await fetch("/api/account/date-of-birth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dateOfBirth })
            });

            if (!response.ok) {
                throw new Error(t("user.dateOfBirthDialog.invalid"));
            }

            onSaved();
            onClose();
        } catch (caught) {
            setError((caught as Error).message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog
            className={styles.dateDialog}
            onClose={onClose}
            closeOnBackdrop
        >
            <div className={styles.dialogHeader}>
                <b>{t("user.dateOfBirth")}</b>
                <span>{t("user.dateOfBirthDialog.description")}</span>
            </div>

            <input
                className={styles.dateInput}
                type="date"
                min="1900-01-01"
                max={new Date().toISOString().slice(0, 10)}
                value={value}
                onChange={event => setValue(event.target.value)}
            />

            {error && <LogMessage>{error}</LogMessage>}

            <div className={styles.dialogActions}>
                {initialValue && (
                    <Button
                        style={{ backgroundColor: ButtonColour.RED }}
                        disabled={saving}
                        onClick={() => void saveDateOfBirth(null)}
                    >
                        {t("user.remove")}
                    </Button>
                )}

                <Button
                    style={{ backgroundColor: ButtonColour.BLUE }}
                    disabled={saving || !value}
                    onClick={() => void saveDateOfBirth(value)}
                >
                    {saving
                        ? t("user.saving")
                        : t("user.save")}
                </Button>
            </div>
        </Dialog>
    );
}

function User() {
    const { t, i18n } = useTranslation("settings");
    const { profile, status, refetch } = useAuthedProfile();
    const getErrorMessage = useAuthErrors();

    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
    const [dateDialogOpen, setDateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const formattedDateOfBirth = useMemo(() => {
        if (!profile?.dateOfBirth) return t("user.notSet");

        return new Intl.DateTimeFormat(i18n.resolvedLanguage || "en", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        }).format(new Date(`${profile.dateOfBirth}T00:00:00.000Z`));
    }, [profile?.dateOfBirth, i18n.language]);

    function validateUsername(input: string) {
        const error = validate(input, schemas.username);
        return error ? getErrorMessage(error) : undefined;
    }

    async function updateUsername(username: string) {
        const response = await fetch("/auth/change-username", {
            method: "POST",
            body: username
        });

        if (response.status == StatusCodes.CONFLICT) {
            throw new Error(t("user.usernameTaken"));
        }

        if (!response.ok) {
            throw new Error(t("user.usernameUpdateFailed"));
        }

        await refetch();
    }

    async function deleteAccount(input: string) {
        if (input != profile?.username) {
            throw new Error(t("user.delete.usernameMismatch"));
        }

        const result = await authClient.deleteUser();

        if (result.error) {
            throw new Error(getErrorMessage(result.error.code));
        }

        location.href = "/analysis";
    }

    if (status == "pending") {
        return (
            <div className={categoryStyles.wrapper}>
                <div className={styles.introduction}>
                    <b className={categoryStyles.header}>{t("user.title")}</b>
                    <span>{t("user.checking")}</span>
                </div>
            </div>
        );
    }

    if (status == "error" || !profile) {
        return (
            <div className={categoryStyles.wrapper}>
                <div className={styles.introduction}>
                    <b className={categoryStyles.header}>{t("user.title")}</b>
                    <span>{t("user.description")}</span>
                </div>

                <Separator className={categoryStyles.separator}/>

                <div className={styles.guestCard}>
                    <span className={styles.guestIcon} aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                            <path d="M12 12a4.35 4.35 0 1 0 0-8.7 4.35 4.35 0 0 0 0 8.7Zm0 2c-4.58 0-8.3 2.37-8.3 5.3 0 .77.63 1.4 1.4 1.4h13.8c.77 0 1.4-.63 1.4-1.4 0-2.93-3.72-5.3-8.3-5.3Z"/>
                        </svg>
                    </span>
                    <div>
                        <b>{t("user.guest.title")}</b>
                        <p>{t("user.guest.description")}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={categoryStyles.wrapper}>
            <div className={styles.introduction}>
                <b className={categoryStyles.header}>{t("user.title")}</b>
                <span>{t("user.description")}</span>
            </div>

            <Separator className={categoryStyles.separator} />

            <div className={styles.rows}>
                <div className={styles.row}>
                    <div className={styles.rowText}>
                        <b>{t("user.email")}</b>
                        <span>{profile.email}</span>
                    </div>

                    <Button onClick={() => setEmailDialogOpen(true)}>
                        {t("user.change")}
                    </Button>
                </div>

                <div className={styles.row}>
                    <div className={styles.rowText}>
                        <b>{t("user.password")}</b>
                        <span className={styles.password}>••••••••••••</span>
                    </div>

                    <Button onClick={() => setPasswordDialogOpen(true)}>
                        {t("user.change")}
                    </Button>
                </div>

                <div className={styles.row}>
                    <div className={styles.rowText}>
                        <b>{t("user.username")}</b>
                        <span>{profile.username}</span>
                    </div>

                    <Button onClick={() => setUsernameDialogOpen(true)}>
                        {t("user.change")}
                    </Button>
                </div>

                <div className={styles.row}>
                    <div className={styles.rowText}>
                        <b>
                            {t("user.dateOfBirth")}
                            <small>{t("user.optional")}</small>
                        </b>
                        <span>{formattedDateOfBirth}</span>
                    </div>

                    <Button onClick={() => setDateDialogOpen(true)}>
                        {profile.dateOfBirth
                            ? t("user.change")
                            : t("user.add")}
                    </Button>
                </div>
            </div>

            <div className={styles.dangerZone}>
                <b>{t("user.delete.title")}</b>
                <span>{t("user.delete.description")}</span>

                <Button
                    style={{ backgroundColor: ButtonColour.RED }}
                    onClick={() => setDeleteDialogOpen(true)}
                >
                    {t("user.delete.title")}
                </Button>
            </div>

            {emailDialogOpen && (
                <EmailChangeDialog
                    onClose={() => setEmailDialogOpen(false)}
                />
            )}

            {passwordDialogOpen && (
                <PasswordResetDialog
                    onClose={() => setPasswordDialogOpen(false)}
                />
            )}

            {usernameDialogOpen && (
                <DetailUpdateDialog
                    placeholder={t("user.usernamePlaceholder")}
                    onClose={() => setUsernameDialogOpen(false)}
                    onConfirm={updateUsername}
                    getErrorMessage={validateUsername}
                    buttonDisabled={input => input.length < 3}
                >
                    {t("user.usernameDialog")}
                </DetailUpdateDialog>
            )}

            {dateDialogOpen && (
                <DateOfBirthDialog
                    initialValue={profile.dateOfBirth}
                    onClose={() => setDateDialogOpen(false)}
                    onSaved={() => void refetch()}
                />
            )}

            {deleteDialogOpen && (
                <DetailUpdateDialog
                    placeholder={`${profile.username}…`}
                    buttonStyle={{ backgroundColor: ButtonColour.RED }}
                    onClose={() => setDeleteDialogOpen(false)}
                    onConfirm={deleteAccount}
                    buttonDisabled={input => input != profile.username}
                >
                    {t("user.delete.confirm", {
                        username: profile.username
                    })}
                </DetailUpdateDialog>
            )}
        </div>
    );
}

export default User;
