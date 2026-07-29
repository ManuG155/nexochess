export type AccountEmailLocale = "en" | "es";

export type AccountEmailType =
    | "verifyAccount"
    | "resetPassword"
    | "changeEmail"
    | "approveEmailChange";

interface AccountEmailCopy {
    subject: string;
    preheader: string;
    message: string;
    buttonLabel: string;
    securityNote: string;
    tagline: string;
    automatedNotice: string;
}

type EmailVariables = Record<string, string | undefined>;

const copy: Record<
    AccountEmailLocale,
    Record<AccountEmailType, AccountEmailCopy>
> = {
    en: {
        verifyAccount: {
            subject: "Verify your NexoChess account",
            preheader: "Confirm your email address to finish creating your NexoChess account.",
            message: "Thanks for creating a NexoChess account. Confirm your email address to finish setting it up.",
            buttonLabel: "Verify email address",
            securityNote: "If you did not create this account, you can safely ignore this email.",
            tagline: "Connect the moves. Understand the game.",
            automatedNotice: "This is an automatic account message from NexoChess. You can reply to this email if you need help."
        },
        resetPassword: {
            subject: "Reset your NexoChess password",
            preheader: "Use this secure link to choose a new password for your NexoChess account.",
            message: "We received a request to reset the password for your NexoChess account.",
            buttonLabel: "Reset password",
            securityNote: "If you did not request a password reset, ignore this email. Your password will not change.",
            tagline: "Connect the moves. Understand the game.",
            automatedNotice: "This is an automatic account message from NexoChess. You can reply to this email if you need help."
        },
        changeEmail: {
            subject: "Confirm your new NexoChess email address",
            preheader: "Confirm this address to use it with your NexoChess account.",
            message: "Confirm this email address to use it with your NexoChess account.",
            buttonLabel: "Confirm new email",
            securityNote: "If you did not request this change, ignore this email and keep using your current address.",
            tagline: "Connect the moves. Understand the game.",
            automatedNotice: "This is an automatic account message from NexoChess. You can reply to this email if you need help."
        },
        approveEmailChange: {
            subject: "Approve your NexoChess email change",
            preheader: "Approve the request to change the email address on your NexoChess account.",
            message: "Approve the request to change your NexoChess account email to {{newEmail}}.",
            buttonLabel: "Approve email change",
            securityNote: "If you did not request this change, do not approve it and consider changing your password.",
            tagline: "Connect the moves. Understand the game.",
            automatedNotice: "This is an automatic account message from NexoChess. You can reply to this email if you need help."
        }
    },
    es: {
        verifyAccount: {
            subject: "Verifica tu cuenta de NexoChess",
            preheader: "Confirma tu correo para terminar de crear tu cuenta de NexoChess.",
            message: "Gracias por crear una cuenta de NexoChess. Confirma tu dirección de correo para terminar de configurarla.",
            buttonLabel: "Verificar correo",
            securityNote: "Si no has creado esta cuenta, puedes ignorar este correo con tranquilidad.",
            tagline: "Conecta las jugadas. Entiende la partida.",
            automatedNotice: "Este es un mensaje automático de cuenta de NexoChess. Puedes responder a este correo si necesitas ayuda."
        },
        resetPassword: {
            subject: "Restablece tu contraseña de NexoChess",
            preheader: "Usa este enlace seguro para elegir una nueva contraseña para tu cuenta de NexoChess.",
            message: "Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de NexoChess.",
            buttonLabel: "Restablecer contraseña",
            securityNote: "Si no has solicitado el cambio de contraseña, ignora este correo. Tu contraseña no cambiará.",
            tagline: "Conecta las jugadas. Entiende la partida.",
            automatedNotice: "Este es un mensaje automático de cuenta de NexoChess. Puedes responder a este correo si necesitas ayuda."
        },
        changeEmail: {
            subject: "Confirma tu nuevo correo de NexoChess",
            preheader: "Confirma esta dirección para utilizarla con tu cuenta de NexoChess.",
            message: "Confirma esta dirección de correo para utilizarla con tu cuenta de NexoChess.",
            buttonLabel: "Confirmar nuevo correo",
            securityNote: "Si no has solicitado este cambio, ignora el correo y continúa utilizando tu dirección actual.",
            tagline: "Conecta las jugadas. Entiende la partida.",
            automatedNotice: "Este es un mensaje automático de cuenta de NexoChess. Puedes responder a este correo si necesitas ayuda."
        },
        approveEmailChange: {
            subject: "Aprueba el cambio de correo de NexoChess",
            preheader: "Aprueba la solicitud para cambiar el correo de tu cuenta de NexoChess.",
            message: "Aprueba la solicitud para cambiar el correo de tu cuenta de NexoChess a {{newEmail}}.",
            buttonLabel: "Aprobar cambio de correo",
            securityNote: "Si no has solicitado este cambio, no lo apruebes y considera cambiar tu contraseña.",
            tagline: "Conecta las jugadas. Entiende la partida.",
            automatedNotice: "Este es un mensaje automático de cuenta de NexoChess. Puedes responder a este correo si necesitas ayuda."
        }
    }
};

function normaliseLocale(value?: string | null): AccountEmailLocale {
    return value?.toLowerCase().startsWith("es") ? "es" : "en";
}

export function getAccountEmailLocale(request?: Request): AccountEmailLocale {
    const selectedLanguage = request?.headers.get("x-nexochess-language");
    if (selectedLanguage) return normaliseLocale(selectedLanguage);

    return normaliseLocale(request?.headers.get("accept-language"));
}

export function getAccountEmailCopy(
    type: AccountEmailType,
    locale: AccountEmailLocale,
    variables: EmailVariables = {}
): AccountEmailCopy {
    const template = copy[locale][type];

    const interpolate = (value: string) => value.replace(
        /\{\{(\w+)\}\}/g,
        (_, key: string) => variables[key] || ""
    );

    return {
        subject: interpolate(template.subject),
        preheader: interpolate(template.preheader),
        message: interpolate(template.message),
        buttonLabel: interpolate(template.buttonLabel),
        securityNote: interpolate(template.securityNote),
        tagline: interpolate(template.tagline),
        automatedNotice: interpolate(template.automatedNotice)
    };
}
