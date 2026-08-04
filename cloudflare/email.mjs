const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const DEFAULT_FROM_ADDRESS = "contact@nexochess.com";
const DEFAULT_FROM_NAME = "NexoChess";

const COPY = {
    en: {
        verifyAccount: {
            subject: "Verify your NexoChess email",
            heading: "Verify your email",
            message: "Confirm that this email address belongs to you to complete your NexoChess account.",
            button: "Verify email",
            security: "If you did not create or update a NexoChess account, you can ignore this message."
        },
        resetPassword: {
            subject: "Reset your NexoChess password",
            heading: "Reset your password",
            message: "A password reset was requested for your NexoChess account. Use the button below to choose a new password.",
            button: "Reset password",
            security: "If you did not request this change, ignore this message and your password will remain unchanged."
        },
        approveEmailChange: {
            subject: "Approve your NexoChess email change",
            heading: "Approve the email change",
            message: "A request was made to change your NexoChess account email to {{newEmail}}. Approve it from your current address.",
            button: "Approve change",
            security: "If you did not request this change, do not open the link and contact us."
        }
    },
    es: {
        verifyAccount: {
            subject: "Verifica tu correo de NexoChess",
            heading: "Verifica tu correo",
            message: "Confirma que esta dirección te pertenece para completar tu cuenta de NexoChess.",
            button: "Verificar correo",
            security: "Si no has creado ni actualizado una cuenta de NexoChess, puedes ignorar este mensaje."
        },
        resetPassword: {
            subject: "Restablece tu contraseña de NexoChess",
            heading: "Restablece tu contraseña",
            message: "Se ha solicitado restablecer la contraseña de tu cuenta de NexoChess. Utiliza el botón para elegir una nueva.",
            button: "Restablecer contraseña",
            security: "Si no lo has solicitado, ignora este mensaje y tu contraseña seguirá siendo la misma."
        },
        approveEmailChange: {
            subject: "Aprueba el cambio de correo de NexoChess",
            heading: "Aprueba el cambio de correo",
            message: "Se ha solicitado cambiar el correo de tu cuenta de NexoChess a {{newEmail}}. Apruébalo desde tu dirección actual.",
            button: "Aprobar cambio",
            security: "Si no has solicitado este cambio, no abras el enlace y contacta con nosotros."
        }
    },
    fr: {
        verifyAccount: {
            subject: "Vérifiez votre adresse NexoChess",
            heading: "Vérifiez votre adresse e-mail",
            message: "Confirmez que cette adresse vous appartient afin de finaliser votre compte NexoChess.",
            button: "Vérifier l’adresse",
            security: "Si vous n’avez pas créé ou modifié de compte NexoChess, ignorez ce message."
        },
        resetPassword: {
            subject: "Réinitialisez votre mot de passe NexoChess",
            heading: "Réinitialisez votre mot de passe",
            message: "Une réinitialisation du mot de passe de votre compte NexoChess a été demandée.",
            button: "Réinitialiser le mot de passe",
            security: "Si vous n’êtes pas à l’origine de cette demande, ignorez ce message."
        },
        approveEmailChange: {
            subject: "Approuvez le changement d’adresse NexoChess",
            heading: "Approuvez le changement d’adresse",
            message: "Une demande vise à remplacer l’adresse de votre compte NexoChess par {{newEmail}}.",
            button: "Approuver le changement",
            security: "Si vous n’avez rien demandé, n’ouvrez pas le lien et contactez-nous."
        }
    },
    de: {
        verifyAccount: {
            subject: "Bestätige deine NexoChess-E-Mail",
            heading: "E-Mail bestätigen",
            message: "Bestätige, dass diese E-Mail-Adresse dir gehört, um dein NexoChess-Konto abzuschließen.",
            button: "E-Mail bestätigen",
            security: "Wenn du kein NexoChess-Konto erstellt oder geändert hast, kannst du diese Nachricht ignorieren."
        },
        resetPassword: {
            subject: "NexoChess-Passwort zurücksetzen",
            heading: "Passwort zurücksetzen",
            message: "Für dein NexoChess-Konto wurde eine Passwortzurücksetzung angefordert.",
            button: "Passwort zurücksetzen",
            security: "Wenn du dies nicht angefordert hast, ignoriere diese Nachricht."
        },
        approveEmailChange: {
            subject: "NexoChess-E-Mail-Änderung bestätigen",
            heading: "E-Mail-Änderung bestätigen",
            message: "Die E-Mail deines NexoChess-Kontos soll zu {{newEmail}} geändert werden.",
            button: "Änderung bestätigen",
            security: "Wenn du dies nicht angefordert hast, öffne den Link nicht und kontaktiere uns."
        }
    },
    pt: {
        verifyAccount: {
            subject: "Verifica o teu e-mail do NexoChess",
            heading: "Verifica o teu e-mail",
            message: "Confirma que este endereço te pertence para concluir a tua conta NexoChess.",
            button: "Verificar e-mail",
            security: "Se não criaste nem alteraste uma conta NexoChess, ignora esta mensagem."
        },
        resetPassword: {
            subject: "Redefine a tua palavra-passe do NexoChess",
            heading: "Redefine a tua palavra-passe",
            message: "Foi pedida a redefinição da palavra-passe da tua conta NexoChess.",
            button: "Redefinir palavra-passe",
            security: "Se não fizeste este pedido, ignora esta mensagem."
        },
        approveEmailChange: {
            subject: "Aprova a alteração de e-mail do NexoChess",
            heading: "Aprova a alteração de e-mail",
            message: "Foi pedido alterar o e-mail da tua conta NexoChess para {{newEmail}}.",
            button: "Aprovar alteração",
            security: "Se não fizeste este pedido, não abras a ligação e contacta-nos."
        }
    },
    ru: {
        verifyAccount: {
            subject: "Подтвердите адрес NexoChess",
            heading: "Подтвердите электронную почту",
            message: "Подтвердите, что этот адрес принадлежит вам, чтобы завершить создание аккаунта NexoChess.",
            button: "Подтвердить адрес",
            security: "Если вы не создавали и не изменяли аккаунт NexoChess, проигнорируйте письмо."
        },
        resetPassword: {
            subject: "Сброс пароля NexoChess",
            heading: "Сбросьте пароль",
            message: "Для вашего аккаунта NexoChess был запрошен сброс пароля.",
            button: "Сбросить пароль",
            security: "Если запрос сделали не вы, проигнорируйте письмо."
        },
        approveEmailChange: {
            subject: "Подтвердите смену адреса NexoChess",
            heading: "Подтвердите смену адреса",
            message: "Запрошена смена адреса аккаунта NexoChess на {{newEmail}}.",
            button: "Подтвердить изменение",
            security: "Если запрос сделали не вы, не открывайте ссылку и свяжитесь с нами."
        }
    },
    zh: {
        verifyAccount: {
            subject: "验证你的 NexoChess 邮箱",
            heading: "验证邮箱",
            message: "请确认此邮箱属于你，以完成 NexoChess 账户设置。",
            button: "验证邮箱",
            security: "若你未创建或修改 NexoChess 账户，可忽略此邮件。"
        },
        resetPassword: {
            subject: "重置你的 NexoChess 密码",
            heading: "重置密码",
            message: "你的 NexoChess 账户收到密码重置请求。",
            button: "重置密码",
            security: "若并非你本人操作，请忽略此邮件。"
        },
        approveEmailChange: {
            subject: "批准 NexoChess 邮箱变更",
            heading: "批准邮箱变更",
            message: "有人请求将你的 NexoChess 账户邮箱更改为 {{newEmail}}。",
            button: "批准变更",
            security: "若并非你本人操作，请勿打开链接并联系我们。"
        }
    },
    vi: {
        verifyAccount: {
            subject: "Xác minh email NexoChess",
            heading: "Xác minh email",
            message: "Hãy xác nhận địa chỉ này thuộc về bạn để hoàn tất tài khoản NexoChess.",
            button: "Xác minh email",
            security: "Nếu bạn không tạo hoặc cập nhật tài khoản NexoChess, hãy bỏ qua thư này."
        },
        resetPassword: {
            subject: "Đặt lại mật khẩu NexoChess",
            heading: "Đặt lại mật khẩu",
            message: "Đã có yêu cầu đặt lại mật khẩu cho tài khoản NexoChess của bạn.",
            button: "Đặt lại mật khẩu",
            security: "Nếu bạn không yêu cầu, hãy bỏ qua thư này."
        },
        approveEmailChange: {
            subject: "Phê duyệt thay đổi email NexoChess",
            heading: "Phê duyệt thay đổi email",
            message: "Có yêu cầu đổi email tài khoản NexoChess của bạn thành {{newEmail}}.",
            button: "Phê duyệt thay đổi",
            security: "Nếu bạn không yêu cầu, đừng mở liên kết và hãy liên hệ với chúng tôi."
        }
    },
    hi: {
        verifyAccount: {
            subject: "अपना NexoChess ईमेल सत्यापित करें",
            heading: "ईमेल सत्यापित करें",
            message: "अपना NexoChess खाता पूरा करने के लिए पुष्टि करें कि यह ईमेल आपका है।",
            button: "ईमेल सत्यापित करें",
            security: "यदि आपने खाता नहीं बनाया या बदला है, तो इस संदेश को अनदेखा करें।"
        },
        resetPassword: {
            subject: "NexoChess पासवर्ड रीसेट करें",
            heading: "पासवर्ड रीसेट करें",
            message: "आपके NexoChess खाते के लिए पासवर्ड रीसेट का अनुरोध किया गया है।",
            button: "पासवर्ड रीसेट करें",
            security: "यदि आपने अनुरोध नहीं किया है, तो इस संदेश को अनदेखा करें।"
        },
        approveEmailChange: {
            subject: "NexoChess ईमेल बदलाव मंजूर करें",
            heading: "ईमेल बदलाव मंजूर करें",
            message: "आपके NexoChess खाते का ईमेल {{newEmail}} करने का अनुरोध किया गया है।",
            button: "बदलाव मंजूर करें",
            security: "यदि आपने अनुरोध नहीं किया है, तो लिंक न खोलें और हमसे संपर्क करें।"
        }
    },
    mr: {
        verifyAccount: {
            subject: "तुमचा NexoChess ईमेल सत्यापित करा",
            heading: "ईमेल सत्यापित करा",
            message: "NexoChess खातेची प्रक्रिया पूर्ण करण्यासाठी हा ईमेल तुमचाच असल्याची पुष्टी करा.",
            button: "ईमेल सत्यापित करा",
            security: "तुम्ही खाते तयार किंवा बदलले नसेल तर हा संदेश दुर्लक्षित करा."
        },
        resetPassword: {
            subject: "NexoChess संकेतशब्द रीसेट करा",
            heading: "संकेतशब्द रीसेट करा",
            message: "तुमच्या NexoChess खात्यासाठी संकेतशब्द रीसेट करण्याची विनंती आली आहे.",
            button: "संकेतशब्द रीसेट करा",
            security: "ही विनंती तुमची नसेल तर संदेश दुर्लक्षित करा."
        },
        approveEmailChange: {
            subject: "NexoChess ईमेल बदल मंजूर करा",
            heading: "ईमेल बदल मंजूर करा",
            message: "तुमच्या NexoChess खात्याचा ईमेल {{newEmail}} करण्याची विनंती आली आहे.",
            button: "बदल मंजूर करा",
            security: "ही विनंती तुमची नसेल तर दुवा उघडू नका आणि आमच्याशी संपर्क साधा."
        }
    },
    pl: {
        verifyAccount: {
            subject: "Zweryfikuj adres NexoChess",
            heading: "Zweryfikuj adres e-mail",
            message: "Potwierdź, że ten adres należy do Ciebie, aby ukończyć konfigurację konta NexoChess.",
            button: "Zweryfikuj adres",
            security: "Jeżeli nie zakładałeś ani nie zmieniałeś konta NexoChess, zignoruj tę wiadomość."
        },
        resetPassword: {
            subject: "Zresetuj hasło NexoChess",
            heading: "Zresetuj hasło",
            message: "Poproszono o zresetowanie hasła do Twojego konta NexoChess.",
            button: "Zresetuj hasło",
            security: "Jeżeli to nie Ty wysłałeś prośbę, zignoruj tę wiadomość."
        },
        approveEmailChange: {
            subject: "Zatwierdź zmianę adresu NexoChess",
            heading: "Zatwierdź zmianę adresu",
            message: "Poproszono o zmianę adresu konta NexoChess na {{newEmail}}.",
            button: "Zatwierdź zmianę",
            security: "Jeżeli to nie Ty, nie otwieraj odnośnika i skontaktuj się z nami."
        }
    }
};

function normaliseLocale(request) {
    const configured = request?.headers?.get("x-nexochess-language");
    const accepted = request?.headers?.get("accept-language");
    const candidate = configured || accepted || "en";
    const language = candidate.toLowerCase().split(/[,-]/)[0].trim();
    return COPY[language] ? language : "en";
}

function interpolate(value, variables = {}) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || "");
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function validActionUrl(value) {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.hostname !== "localhost") {
        throw new Error("Account email action URLs must use HTTPS.");
    }
    return url.toString();
}

export function buildAccountEmail({ request, type, url, newEmail }) {
    const locale = normaliseLocale(request);
    const copy = COPY[locale]?.[type] || COPY.en[type];
    if (!copy) throw new Error(`Unsupported account email type: ${type}`);

    const actionUrl = validActionUrl(url);
    const variables = { newEmail: newEmail || "" };
    const subject = interpolate(copy.subject, variables);
    const heading = interpolate(copy.heading, variables);
    const message = interpolate(copy.message, variables);
    const security = interpolate(copy.security, variables);

    const htmlContent = `<!doctype html>
<html lang="${escapeHtml(locale)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#111820;color:#edf4fb;font-family:Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px;background:#111820">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#192533;border:1px solid #30465d;border-radius:16px;overflow:hidden">
<tr><td style="padding:26px 30px 10px;font-size:25px;font-weight:800;color:#ffffff">NexoChess</td></tr>
<tr><td style="padding:12px 30px 4px"><h1 style="margin:0;font-size:23px;line-height:1.3;color:#ffffff">${escapeHtml(heading)}</h1></td></tr>
<tr><td style="padding:12px 30px;color:#cbd8e5;font-size:16px;line-height:1.6">${escapeHtml(message)}</td></tr>
<tr><td style="padding:15px 30px 22px"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:13px 20px;border-radius:9px;background:#4f7eac;color:#ffffff;text-decoration:none;font-weight:700">${escapeHtml(copy.button)}</a></td></tr>
<tr><td style="padding:0 30px 24px;color:#91a5b9;font-size:13px;line-height:1.55">${escapeHtml(security)}</td></tr>
<tr><td style="padding:18px 30px;border-top:1px solid #30465d;color:#788da2;font-size:12px;line-height:1.5">contact@nexochess.com · NexoChess</td></tr>
</table>
</td></tr></table>
</body></html>`;

    const textContent = [
        "NexoChess",
        heading,
        "",
        message,
        "",
        `${copy.button}: ${actionUrl}`,
        "",
        security,
        "",
        "contact@nexochess.com"
    ].join("\n");

    return { locale, subject, htmlContent, textContent };
}

export async function sendAccountEmail({
    env,
    request,
    type,
    recipient,
    url,
    newEmail
}) {
    const apiKey = env.BREVO_API_KEY?.trim();
    if (!apiKey) throw new Error("BREVO_API_KEY is not configured.");

    const fromAddress = env.EMAIL_FROM_ADDRESS?.trim()
        || DEFAULT_FROM_ADDRESS;
    const fromName = env.EMAIL_FROM_NAME?.trim() || DEFAULT_FROM_NAME;
    const replyToAddress = env.EMAIL_REPLY_TO?.trim() || fromAddress;
    const content = buildAccountEmail({ request, type, url, newEmail });

    const response = await fetch(BREVO_ENDPOINT, {
        method: "POST",
        headers: {
            accept: "application/json",
            "api-key": apiKey,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            sender: { name: fromName, email: fromAddress },
            replyTo: { name: fromName, email: replyToAddress },
            to: [{ email: recipient }],
            subject: content.subject,
            htmlContent: content.htmlContent,
            textContent: content.textContent,
            tags: ["nexochess-account", type]
        })
    });

    if (!response.ok) {
        const detail = (await response.text()).slice(0, 500);
        throw new Error(`Brevo rejected the account email (${response.status}): ${detail}`);
    }

    return response.json();
}

export function queueAccountEmail(executionContext, options) {
    const task = sendAccountEmail(options).catch(error => {
        console.error("NexoChess account email delivery failed", error);
    });

    if (executionContext?.waitUntil) {
        executionContext.waitUntil(task);
        return;
    }

    return task;
}
