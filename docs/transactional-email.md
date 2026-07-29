# Transactional email

NexoChess sends account emails through Brevo SMTP. The public sender and reply-to address are both:

```text
NexoChess <contact@nexochess.com>
```

The following account actions currently trigger an automatic email:

- account email verification;
- password reset;
- new email-address verification.

The message language follows the language selected in NexoChess. Spanish and English are supported, with English as the fallback.

## Required environment variables

Create an SMTP key in **Brevo → SMTP & API → SMTP** and add the values to the private `.env` file:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-smtp-login
SMTP_PASSWORD=your-brevo-smtp-key
EMAIL_FROM_NAME=NexoChess
EMAIL_FROM_ADDRESS=contact@nexochess.com
EMAIL_REPLY_TO=contact@nexochess.com
```

`SMTP_PASSWORD` is the SMTP key, not the Brevo account password and not an API key.

Never commit the real SMTP login or key. The public `.env.example` must contain empty placeholders only.

## Local test

After changing `.env`, recreate the application container:

```powershell
docker compose down
docker compose up -d --build
```

Then test these flows from the UI:

1. create an email/password account;
2. request a password reset;
3. request an email-address change.

Check Brevo's transactional logs if a message does not arrive. The sender domain must remain authenticated with DKIM and DMARC.
