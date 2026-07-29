import cluster from "cluster";
import mongoose, { mongo } from "mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import schemas, { additionalUserFields } from "shared/constants/account/schemas";
import Collection from "@/constants/Collection";
import { sendAccountEmail } from "@/lib/email";
import { clearArchivedGames } from "@/lib/gameArchive";
import {
    AccountEmailType,
    getAccountEmailCopy,
    getAccountEmailLocale
} from "@/lib/emailContent";

import { requestProcessor, userInitialiser } from "./registration";

export type AuthType = ReturnType<typeof createAuth>;
export type AuthInfer = AuthType["$Infer"]["Session"];

let instance: AuthType | null = null;

function sendAuthEmail({
    type,
    recipient,
    url,
    request,
    variables
}: {
    type: AccountEmailType;
    recipient: string;
    url: string;
    request?: Request;
    variables?: Record<string, string>;
}) {
    const locale = getAccountEmailLocale(request);
    const content = getAccountEmailCopy(type, locale, variables);

    return sendAccountEmail({
        recipient,
        locale,
        ...content,
        buttonUrl: url,
        plaintextFallback: `${content.message} ${url}\n\n${content.securityNote}`
    });
}

function createAuth(database: mongo.Db) {
    if (!process.env.ORIGIN) {
        throw new Error("origin not specified.");
    }

    if (!process.env.AUTH_SECRET) {
        throw new Error("auth secret not specified.");
    }

    return betterAuth({
        baseURL: `${process.env.ORIGIN}/auth/account`,
        secret: process.env.AUTH_SECRET,
        database: mongodbAdapter(database),
        emailAndPassword: {
            enabled: true,
            minPasswordLength: schemas.password.minLength || 8,
            maxPasswordLength: schemas.password.maxLength || 128,
            requireEmailVerification: true,
            sendResetPassword: async ({ user, url }, request) => sendAuthEmail({
                type: "resetPassword",
                recipient: user.email,
                url,
                request
            }),
            revokeSessionsOnPasswordReset: true
        },
        emailVerification: {
            autoSignInAfterVerification: true,
            sendVerificationEmail: async ({ user, url }, request) => sendAuthEmail({
                type: "verifyAccount",
                recipient: user.email,
                url,
                request
            })
        },
        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
                prompt: "select_account"
            }
        },
        user: {
            modelName: Collection.USERS,
            additionalFields: additionalUserFields,
            changeEmail: {
                enabled: true,
                sendChangeEmailConfirmation: async ({
                    user,
                    newEmail,
                    url
                }, request) => sendAuthEmail({
                    type: "approveEmailChange",
                    recipient: user.email,
                    url,
                    request,
                    variables: { newEmail }
                })
            },
            deleteUser: {
                enabled: true,
                beforeDelete: async user => {
                    await clearArchivedGames(user.id);
                }
            }
        },
        account: { modelName: Collection.ACCOUNTS },
        session: { modelName: Collection.SESSIONS },
        verification: { modelName: Collection.ACCOUNT_VERIFICATIONS },
        hooks: { before: requestProcessor },
        databaseHooks: {
            user: {
                create: { before: userInitialiser }
            }
        },
        logger: { disabled: cluster.worker?.id != 1 },
        advanced: { cookiePrefix: "wintrchess" }
    });
}

export function getAuth() {
    if (!mongoose.connection.db) throw new Error(
        "cannot initialise auth without database connection."
    );

    return instance ??= createAuth(mongoose.connection.db);
}

export default getAuth;