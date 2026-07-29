import { readFileSync } from "fs";
import mailer, { Transporter } from "nodemailer";

import { AccountEmailLocale } from "./emailContent";

interface AccountEmailOptions {
    recipient: string;
    locale: AccountEmailLocale;
    subject: string;
    preheader: string;
    message: string;
    buttonLabel: string;
    buttonUrl: string;
    securityNote: string;
    tagline: string;
    automatedNotice: string;
    plaintextFallback: string;
}

const accountEmailTemplate = readFileSync(
    "server/src/resources/account.html",
    "utf-8"
);

let transporter: Transporter | null = null;

function requiredEnvironmentVariable(name: string) {
    const value = process.env[name];
    if (!value) throw new Error(`${name} environment variable missing.`);

    return value;
}

function getTransporter() {
    if (transporter) return transporter;

    const port = Number(process.env.SMTP_PORT || 587);
    if (!Number.isFinite(port)) {
        throw new Error("SMTP_PORT must be a valid number.");
    }

    transporter = mailer.createTransport({
        host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
        port,
        secure: port == 465,
        requireTLS: port != 465,
        auth: {
            user: requiredEnvironmentVariable("SMTP_USER"),
            pass: requiredEnvironmentVariable("SMTP_PASSWORD")
        }
    });

    return transporter;
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function replaceToken(template: string, token: string, value: string) {
    return template.replace(new RegExp(`\\$\\{${token}\\}`, "g"), value);
}

export async function sendAccountEmail(options: AccountEmailOptions) {
    const fromAddress = process.env.EMAIL_FROM_ADDRESS
        || "contact@nexochess.com";
    const replyTo = process.env.EMAIL_REPLY_TO || fromAddress;
    const fromName = process.env.EMAIL_FROM_NAME || "NexoChess";

    let html = accountEmailTemplate;
    const replacements: Record<string, string> = {
        LANG: escapeHtml(options.locale),
        SUBJECT: escapeHtml(options.subject),
        PREHEADER: escapeHtml(options.preheader),
        TAGLINE: escapeHtml(options.tagline),
        MESSAGE: escapeHtml(options.message),
        VERIFICATION_URL: escapeHtml(options.buttonUrl),
        BUTTON_LABEL: escapeHtml(options.buttonLabel),
        SECURITY_NOTE: escapeHtml(options.securityNote),
        AUTOMATED_NOTICE: escapeHtml(options.automatedNotice),
        CONTACT_ADDRESS: escapeHtml(replyTo),
        COPYRIGHT_YEAR: new Date().getFullYear().toString()
    };

    for (const [token, value] of Object.entries(replacements)) {
        html = replaceToken(html, token, value);
    }

    await getTransporter().sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        replyTo,
        to: options.recipient,
        subject: options.subject,
        text: options.plaintextFallback,
        html,
        attachments: [{
            filename: "nexochess-white.png",
            path: "client/public/img/nexochess-white.png",
            cid: "nexochess-logo"
        }]
    });
}
