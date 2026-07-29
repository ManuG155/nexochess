# Hosting NexoChess

This guide covers the current NexoChess architecture: a React client, an Express server and MongoDB. The core engine analysis runs in the browser, while authentication and synced account features still require the backend.

## Requirements

- Node.js 22 or later
- npm
- MongoDB when running without Docker
- Docker Desktop and Docker Compose when using the provided container setup

## Local setup

Create a local environment file:

```sh
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Install dependencies:

```sh
npm install
```

Check the client:

```sh
npm run check -w client
```

Build and start with Docker:

```sh
docker compose up -d --build
```

Open:

```text
http://localhost:8080
```

To inspect server logs:

```sh
docker compose logs app --tail=150
```

## Environment variables

### Runtime

```env
NODE_ENV=development
PORT=8080
ORIGIN=http://localhost:8080
```

`ORIGIN` is required. Authentication callbacks, links and origin-sensitive behaviour use this value.

For production:

```env
NODE_ENV=production
ORIGIN=https://www.nexochess.com
```

The production server accepts `nexochess.com` and its subdomains. Development mode additionally accepts `localhost` and `127.0.0.1`.

### Database

```env
DATABASE_URI=mongodb://database/wintrchess
```

The internal database identifier intentionally remains `wintrchess` during the first rebranding stage. Renaming it without migrating the database can create an apparently empty installation or orphan existing data.

### Authentication

```env
AUTH_SECRET=replace-with-a-long-random-secret
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
```

Never commit real authentication secrets.

For local Google OAuth, configure the following in Google Cloud:

```text
Authorized JavaScript origin:
http://localhost:8080

Authorized redirect URI:
http://localhost:8080/auth/account/callback/google
```

For production:

```text
Authorized JavaScript origin:
https://www.nexochess.com

Authorized redirect URI:
https://www.nexochess.com/auth/account/callback/google
```

### Limits

```env
ANALYSIS_SESSION_ACTIONS=80
MAXIMUM_ARCHIVE_SIZE=50
```

These control server-backed analysis-session actions and the maximum server Archive size. They do not redefine the current no-account local Archive behaviour.

### Optional administration and email

```env
INTERNAL_PASSWORD=
EMAIL_ACCOUNT=
AUTOMATED_EMAIL_ADDRESS=
AUTOMATED_EMAIL_KEY=
```

Do not enable production email flows until the sending domain, privacy disclosures and account-deletion process are ready.

### Optional analytics and advertising

```env
ANALYTICS_MEASUREMENT_ID=
ADS_PUBLISHER_ID=
```

Leave these values blank while analytics and advertising are disabled. Non-essential tracking must not be enabled before the consent and privacy implementation is complete.

## Manual build

Build all workspaces:

```sh
npm run build
```

Or build them individually:

```sh
npm run build -w shared
npm run build -w server
npm run build -w client
```

Start the server:

```sh
npm start
```

## Docker commands

Start or rebuild:

```sh
docker compose up -d --build
```

Stop containers:

```sh
docker compose down
```

Do not add `-v` unless you deliberately intend to remove the MongoDB volume and its stored data.

## Production checklist

Before pointing DNS at a deployment:

1. Register and control `nexochess.com`.
2. Configure HTTPS and redirect plain HTTP to HTTPS.
3. Set `ORIGIN=https://www.nexochess.com`.
4. Configure the production Google OAuth origin and callback.
5. Use a new production `AUTH_SECRET` and protected OAuth credentials.
6. Publish the corresponding GPL source code and third-party notices.
7. Complete privacy, cookie, account-deletion and contact pages.
8. Confirm every distributed image, font, sound and engine binary has an appropriate license or permission.
9. Test the production build on Chrome, Brave, Firefox, Edge and mobile browsers.
