interface PasswordResetCopy {
    action: string;
    pending: string;
    sent: string;
    missingEmail: string;
}

const copies: Record<string, PasswordResetCopy> = {
    en: {
        action: "Forgot your password?",
        pending: "Sending reset email…",
        sent: "If an account exists for that address, you will receive a password-reset email shortly.",
        missingEmail: "Enter your email address first."
    },
    es: {
        action: "¿Has olvidado la contraseña?",
        pending: "Enviando correo de recuperación…",
        sent: "Si existe una cuenta con esa dirección, recibirás en breve un correo para restablecer la contraseña.",
        missingEmail: "Introduce primero tu dirección de correo."
    },
    fr: {
        action: "Mot de passe oublié ?",
        pending: "Envoi du message…",
        sent: "Si un compte correspond à cette adresse, vous recevrez bientôt un message de réinitialisation.",
        missingEmail: "Saisissez d’abord votre adresse e-mail."
    },
    de: {
        action: "Passwort vergessen?",
        pending: "E-Mail wird gesendet…",
        sent: "Falls für diese Adresse ein Konto existiert, erhältst du in Kürze eine E-Mail zum Zurücksetzen.",
        missingEmail: "Gib zuerst deine E-Mail-Adresse ein."
    },
    pt: {
        action: "Esqueceste-te da palavra-passe?",
        pending: "A enviar o e-mail…",
        sent: "Se existir uma conta com esse endereço, receberás em breve um e-mail de recuperação.",
        missingEmail: "Introduz primeiro o teu endereço de e-mail."
    },
    ru: {
        action: "Забыли пароль?",
        pending: "Письмо отправляется…",
        sent: "Если аккаунт с таким адресом существует, вскоре придёт письмо для сброса пароля.",
        missingEmail: "Сначала введите адрес электронной почты."
    },
    zh: {
        action: "忘记密码？",
        pending: "正在发送重置邮件…",
        sent: "若该邮箱对应账户，你很快会收到密码重置邮件。",
        missingEmail: "请先输入邮箱地址。"
    },
    vi: {
        action: "Quên mật khẩu?",
        pending: "Đang gửi email đặt lại…",
        sent: "Nếu có tài khoản dùng địa chỉ này, bạn sẽ sớm nhận được email đặt lại mật khẩu.",
        missingEmail: "Hãy nhập địa chỉ email trước."
    },
    hi: {
        action: "पासवर्ड भूल गए?",
        pending: "रीसेट ईमेल भेजा जा रहा है…",
        sent: "यदि इस पते से कोई खाता है, तो शीघ्र ही पासवर्ड रीसेट ईमेल मिलेगा।",
        missingEmail: "पहले अपना ईमेल पता दर्ज करें।"
    },
    mr: {
        action: "संकेतशब्द विसरलात?",
        pending: "रीसेट ईमेल पाठवत आहे…",
        sent: "या पत्त्याशी खाते जोडलेले असल्यास लवकरच संकेतशब्द रीसेट ईमेल मिळेल.",
        missingEmail: "प्रथम ईमेल पत्ता प्रविष्ट करा."
    },
    pl: {
        action: "Nie pamiętasz hasła?",
        pending: "Wysyłanie wiadomości…",
        sent: "Jeżeli konto z tym adresem istnieje, wkrótce otrzymasz wiadomość do zresetowania hasła.",
        missingEmail: "Najpierw wpisz adres e-mail."
    }
};

export function getPasswordResetCopy(language: string) {
    const normalisedLanguage = language.toLowerCase().split("-")[0];
    return copies[normalisedLanguage] || copies.en;
}
