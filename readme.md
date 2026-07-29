# NexoChess

NexoChess is a free chess game analyser focused on clear game reviews, move classifications and an accessible experience for players of every level.

> **Pre-release status:** the production website is planned for [www.nexochess.com](https://www.nexochess.com). The domain and public source repository must be configured before launch.

## Product principles

- Analysing a game does not require an account.
- The local Archive remains available without signing in.
- Accounts are optional and are intended for cross-device storage and account-specific features.
- Stockfish 17 runs in the user's browser for the core engine analysis.
- The project remains free and open source under the GNU GPL v3.

## Project structure

NexoChess is a TypeScript monorepo with three workspaces:

### `client`

React frontend, browser-side analysis workflow, Stockfish workers and local persistence.

### `server`

Express backend for authentication, account features, server-backed storage and API endpoints.

### `shared`

Types and chess-analysis logic shared by the client and server.

## Local development

### Requirements

- Node.js 22 or later
- npm
- Docker Desktop with Docker Compose

### Setup

Create your local environment file from the provided example and fill in the required secrets:

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

Check the client TypeScript build:

```sh
npm run check -w client
```

Build and run the application with Docker:

```sh
docker compose up -d --build
```

The local application is available at:

```text
http://localhost:8080
```

See [`docs/hosting.md`](docs/hosting.md) for environment variables, Google OAuth and production deployment notes.

## Licensing and upstream project

NexoChess is a modified version of [WintrChess](https://github.com/WintrCat/wintrchess), originally created by WintrCat. The original project and this modified version are distributed under the GNU General Public License version 3.

NexoChess is an independent project and is not presented as the official WintrChess website or as a product of WintrCat.

The complete GPL text is available in [`LICENSE`](LICENSE). Third-party components and release obligations are documented in [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md).

## Contributing

Read [`docs/contributing.md`](docs/contributing.md) before modifying the project. Several mature subsystems are intentionally protected from incidental changes.
