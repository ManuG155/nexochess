# Secret rotation checklist

Do this before the public GitHub push and production deployment.

## Application session secret

Generate a new value locally:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Store it only as `AUTH_SECRET` in the deployment environment. Rotating it invalidates existing sessions.

## Google OAuth

Create two separate web OAuth clients:

### Local

```text
Origin: http://localhost:8080
Redirect: http://localhost:8080/auth/account/callback/google
```

### Production

```text
Origin: https://www.nexochess.com
Redirect: https://www.nexochess.com/auth/account/callback/google
```

Revoke the client secret that was visible in a screenshot after the replacement is working.

## Brevo SMTP

Generate a dedicated key named `NexoChess Production`. Keep the existing key only for local testing if needed. Store the production key in the hosting provider's secret manager.

## Database

Use a production database user with a unique, strong password and only the permissions required by NexoChess. Never expose MongoDB directly to the public internet without authentication and network restrictions.

## Internal administration

Remove unused internal routes. If `INTERNAL_PASSWORD` remains necessary, generate a strong unique value and do not reuse any personal password.

## Verification

After rotation:

- log in with Google;
- create and verify an email account;
- request a password reset;
- send a transactional email;
- restart the deployment;
- confirm that old sessions are invalidated as expected;
- run `npm run check:repository`.
