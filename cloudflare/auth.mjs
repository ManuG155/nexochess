import {
    APIError,
    betterAuth,
    createAuthMiddleware,
    getMigrations
} from "../client/cloudflare/betterAuthRuntime.mjs";
import { resolveApplicationOrigin } from "../config/site.mjs";
import { queueAccountEmail } from "./emailQueue.mjs";

const AUTH_PATH = "/auth/account";
const SCHEMA_VERSION = 2;

let authInstance;
let schemaPromise;

function validateUsername(value) {
    if (typeof value !== "string") return "INVALID_USERNAME";
    if (value.length < 3) return "USERNAME_TOO_SHORT";
    if (value.length > 20) return "USERNAME_TOO_LONG";
    if (!/^[a-z0-9_]+$/i.test(value)) return "INVALID_USERNAME";

    return null;
}

function sanitiseDisplayName(value, fallback) {
    const cleaned = String(value || "")
        .replace(/[^\p{L}\p{N}_ \-.]/gu, "")
        .slice(0, 24)
        .trim();

    return cleaned.length >= 3 ? cleaned : fallback;
}

function usernameStem(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20);
}

async function usernameExists(database, username) {
    const row = await database.prepare(
        "SELECT id FROM \"user\" WHERE lower(username) = lower(?) LIMIT 1"
    ).bind(username).first();

    return Boolean(row);
}

async function availableSocialUsername(database, name) {
    let stem = usernameStem(name);
    if (stem.length < 3) stem = "player";

    if (!await usernameExists(database, stem)) return stem;

    for (let attempt = 0; attempt < 20; attempt++) {
        const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8);
        const candidate = `${stem.slice(0, 11)}_${suffix}`;

        if (!await usernameExists(database, candidate)) return candidate;
    }

    return `player_${crypto.randomUUID().replaceAll("-", "").slice(0, 8)}`;
}

function createAuth(env, request) {
    if (!env.DB) throw new Error("The NexoChess D1 binding is missing.");
    if (!env.AUTH_SECRET) throw new Error("AUTH_SECRET is not configured.");

    const origin = resolveApplicationOrigin(request.url, env);
    const fallbackEmailRequest = new Request(origin);

    const sendEmail = ({ type, recipient, url, callbackRequest, newEmail }) => {
        queueAccountEmail({
            env,
            request: callbackRequest || fallbackEmailRequest,
            type,
            recipient,
            url,
            newEmail
        });
    };

    const validateRegistration = createAuthMiddleware(async context => {
        if (!context.path.startsWith("/sign-up/email")) return;

        const username = context.body?.name;
        const validationError = validateUsername(username);

        if (validationError) {
            throw new APIError("BAD_REQUEST", { code: validationError });
        }

        if (await usernameExists(env.DB, username)) {
            throw new APIError("CONFLICT", { code: "USERNAME_TAKEN" });
        }
    });

    const googleConfigured = Boolean(
        env.GOOGLE_OAUTH_CLIENT_ID
        && env.GOOGLE_OAUTH_CLIENT_SECRET
    );

    return betterAuth({
        appName: "NexoChess",
        baseURL: `${origin}${AUTH_PATH}`,
        secret: env.AUTH_SECRET,
        database: env.DB,
        trustedOrigins: [origin],
        rateLimit: {
            enabled: true,
            window: 60,
            max: 100
        },
        emailAndPassword: {
            enabled: true,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            requireEmailVerification: false,
            autoSignIn: true,
            revokeSessionsOnPasswordReset: true,
            sendResetPassword: ({ user, url }, callbackRequest) => sendEmail({
                type: "resetPassword",
                recipient: user.email,
                url,
                callbackRequest
            })
        },
        emailVerification: {
            sendOnSignUp: true,
            autoSignInAfterVerification: false,
            sendVerificationEmail: ({ user, url }, callbackRequest) => sendEmail({
                type: "verifyAccount",
                recipient: user.email,
                url,
                callbackRequest
            })
        },
        socialProviders: googleConfigured
            ? {
                google: {
                    clientId: env.GOOGLE_OAUTH_CLIENT_ID,
                    clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
                    prompt: "select_account"
                }
            }
            : {},
        user: {
            additionalFields: {
                username: {
                    type: "string",
                    required: false,
                    unique: true,
                    input: false
                },
                roles: {
                    type: "string[]",
                    required: false,
                    defaultValue: [],
                    input: false
                },
                dateOfBirth: {
                    type: "string",
                    required: false,
                    input: false
                }
            },
            changeEmail: {
                enabled: true,
                sendChangeEmailConfirmation: (
                    { user, newEmail, url },
                    callbackRequest
                ) => sendEmail({
                    type: "approveEmailChange",
                    recipient: user.email,
                    url,
                    newEmail,
                    callbackRequest
                })
            },
            deleteUser: {
                enabled: true
            }
        },
        hooks: {
            before: validateRegistration
        },
        databaseHooks: {
            user: {
                create: {
                    before: async (user, context) => {
                        const emailRegistration = context?.path
                            ?.startsWith("/sign-up/email");
                        const requested = usernameStem(user.name);
                        const username = emailRegistration
                            ? requested
                            : await availableSocialUsername(env.DB, user.name);

                        if (emailRegistration) {
                            const validationError = validateUsername(username);

                            if (validationError) {
                                throw new APIError("BAD_REQUEST", {
                                    code: validationError
                                });
                            }

                            if (await usernameExists(env.DB, username)) {
                                throw new APIError("CONFLICT", {
                                    code: "USERNAME_TAKEN"
                                });
                            }
                        }

                        return {
                            data: {
                                ...user,
                                username,
                                name: sanitiseDisplayName(user.name, username),
                                roles: [],
                                dateOfBirth: null
                            }
                        };
                    }
                }
            }
        },
        advanced: {
            cookiePrefix: "wintrchess",
            ipAddress: {
                ipAddressHeaders: ["cf-connecting-ip"]
            }
        },
        logger: {
            level: "error"
        }
    });
}

async function createApplicationTables(database) {
    await database.batch([
        database.prepare(`
            CREATE TABLE IF NOT EXISTS nexo_schema (
                name TEXT PRIMARY KEY NOT NULL,
                version INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `),
        database.prepare(`
            CREATE TABLE IF NOT EXISTS archived_games (
                id TEXT PRIMARY KEY NOT NULL,
                user_id TEXT NOT NULL,
                fingerprint TEXT,
                metadata_json TEXT NOT NULL,
                game_json TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
            )
        `),
        database.prepare(`
            CREATE INDEX IF NOT EXISTS archived_games_user_updated
            ON archived_games(user_id, updated_at DESC)
        `),
        database.prepare(`
            CREATE UNIQUE INDEX IF NOT EXISTS archived_games_user_fingerprint
            ON archived_games(user_id, fingerprint)
            WHERE fingerprint IS NOT NULL
        `),
        database.prepare(`
            CREATE TABLE IF NOT EXISTS puzzle_profiles (
                user_id TEXT PRIMARY KEY NOT NULL,
                rating INTEGER NOT NULL,
                attempts INTEGER NOT NULL,
                correct INTEGER NOT NULL,
                streak INTEGER NOT NULL,
                best_streak INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
            )
        `),
        database.prepare(`
            CREATE TABLE IF NOT EXISTS puzzle_completions (
                user_id TEXT NOT NULL,
                puzzle_id TEXT NOT NULL,
                source TEXT NOT NULL,
                completed_at INTEGER NOT NULL,
                solved_without_help INTEGER NOT NULL,
                PRIMARY KEY (user_id, puzzle_id),
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
            )
        `),
        database.prepare(`
            CREATE INDEX IF NOT EXISTS puzzle_completions_user_date
            ON puzzle_completions(user_id, completed_at DESC)
        `),
        database.prepare(`
            CREATE TABLE IF NOT EXISTS release_note_views (
                user_id TEXT NOT NULL,
                version TEXT NOT NULL,
                seen_at INTEGER NOT NULL,
                PRIMARY KEY (user_id, version),
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
            )
        `)
    ]);
}

async function migrateSchema(auth, env) {
    await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS nexo_schema (
            name TEXT PRIMARY KEY NOT NULL,
            version INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    `).run();

    const marker = await env.DB.prepare(
        "SELECT version FROM nexo_schema WHERE name = ?"
    ).bind("cloudflare-core").first();

    if (Number(marker?.version) >= SCHEMA_VERSION) return;

    const migrations = await getMigrations(auth.options);
    await migrations.runMigrations();
    await createApplicationTables(env.DB);

    await env.DB.prepare(`
        INSERT INTO nexo_schema(name, version, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(name) DO UPDATE SET
            version = excluded.version,
            updated_at = excluded.updated_at
    `).bind("cloudflare-core", SCHEMA_VERSION, Date.now()).run();
}

export function getCloudflareAuth(env, request) {
    authInstance ||= createAuth(env, request);
    return authInstance;
}

export async function ensureCloudflareData(auth, env) {
    schemaPromise ||= migrateSchema(auth, env).catch(error => {
        schemaPromise = undefined;
        throw error;
    });

    await schemaPromise;
}

export { AUTH_PATH };
