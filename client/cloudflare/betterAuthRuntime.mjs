/*
 * Wrangler resolves bare package imports relative to the importing module.
 * Better Auth is already installed by the client workspace because both the
 * browser auth client and the Cloudflare auth runtime must use the same
 * version. Re-exporting it here lets the root Worker bundle that exact
 * workspace dependency without duplicating it in the lockfile.
 */
export { betterAuth } from "better-auth";
export { APIError, createAuthMiddleware } from "better-auth/api";
export { getMigrations } from "better-auth/db/migration";
