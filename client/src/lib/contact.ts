export const CONTACT_EMAIL = "contact@nexochess.com";

interface ContactMessageOptions {
    subject?: string;
    body?: string;
}

function currentPageContext() {
    if (typeof window == "undefined") return "";

    return [
        `Página: ${window.location.href}`,
        typeof navigator != "undefined"
            ? `Navegador: ${navigator.userAgent}`
            : ""
    ].filter(Boolean).join("\n");
}

export function createContactBody(introduction?: string) {
    return [
        introduction?.trim(),
        "",
        "Describe aquí tu consulta o el problema que has encontrado:",
        "",
        "",
        currentPageContext()
    ].filter(value => value !== undefined).join("\n");
}

export function createContactMailto({
    subject = "Contacto NexoChess",
    body = createContactBody()
}: ContactMessageOptions = {}) {
    const query = new URLSearchParams({ subject, body });
    return `mailto:${CONTACT_EMAIL}?${query.toString()}`;
}

export function createGmailComposeUrl({
    subject = "Contacto NexoChess",
    body = createContactBody()
}: ContactMessageOptions = {}) {
    const query = new URLSearchParams({
        view: "cm",
        fs: "1",
        to: CONTACT_EMAIL,
        su: subject,
        body
    });

    return `https://mail.google.com/mail/?${query.toString()}`;
}

export function openContactEmail(options: ContactMessageOptions = {}) {
    if (typeof window == "undefined") return;

    const composeWindow = window.open(
        createGmailComposeUrl(options),
        "_blank",
        "noopener,noreferrer"
    );

    if (!composeWindow) {
        window.location.href = createContactMailto(options);
    }
}
