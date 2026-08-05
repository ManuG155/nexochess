export const PRODUCTION_ENVIRONMENT = "production";
export const STAGING_ENVIRONMENT = "staging";

export const PRODUCTION_CANONICAL_ORIGIN = "https://www.nexochess.com";
export const PRODUCTION_CANONICAL_HOST = "www.nexochess.com";
export const PRODUCTION_APEX_HOST = "nexochess.com";
export const PRODUCTION_WORKER_HOST =
    "nexochess-production.manuel-garcia-villaescusa.workers.dev";

export const STAGING_ORIGIN =
    "https://nexochess-staging.manuel-garcia-villaescusa.workers.dev";
export const STAGING_WORKER_HOST =
    "nexochess-staging.manuel-garcia-villaescusa.workers.dev";

export const PRODUCTION_PUZZLE_ORIGIN =
    "https://nexochess-puzzle-data-production.manuel-garcia-villaescusa.workers.dev";
export const STAGING_PUZZLE_ORIGIN =
    "https://nexochess-puzzle-data-staging.manuel-garcia-villaescusa.workers.dev";

export const PERMANENT_CANONICAL_REDIRECT_STATUS = 308;

const PRODUCTION_REDIRECT_HOSTS = new Set([
    PRODUCTION_CANONICAL_HOST,
    PRODUCTION_APEX_HOST,
    PRODUCTION_WORKER_HOST
]);

export function normaliseOrigin(value) {
    const url = new URL(value);

    if (url.protocol !== "https:") {
        throw new Error("NexoChess origins must use HTTPS.");
    }

    if (
        url.username
        || url.password
        || url.pathname !== "/"
        || url.search
        || url.hash
    ) {
        throw new Error("NexoChess origins must not include credentials, paths, queries or fragments.");
    }

    return url.origin;
}

export function productionUrl(pathname = "/", search = "") {
    const url = new URL(pathname, `${PRODUCTION_CANONICAL_ORIGIN}/`);

    if (url.origin !== PRODUCTION_CANONICAL_ORIGIN) {
        throw new Error("Canonical NexoChess URLs cannot target an external origin.");
    }

    url.search = search;
    return url.toString();
}

export function resolveApplicationOrigin(requestUrl, env = {}) {
    const requestOrigin = new URL(requestUrl).origin;
    const configured = normaliseOrigin(
        env.NEXOCHESS_ORIGIN || requestOrigin
    );

    if (
        env.NEXOCHESS_ENV === PRODUCTION_ENVIRONMENT
        && configured !== PRODUCTION_CANONICAL_ORIGIN
    ) {
        throw new Error(
            `Production NEXOCHESS_ORIGIN must be ${PRODUCTION_CANONICAL_ORIGIN}.`
        );
    }

    return configured;
}

export function getProductionCanonicalRedirect(requestUrl, env = {}) {
    if (env.NEXOCHESS_ENV !== PRODUCTION_ENVIRONMENT) return null;

    const incoming = new URL(requestUrl);
    if (incoming.origin === PRODUCTION_CANONICAL_ORIGIN) return null;
    if (!PRODUCTION_REDIRECT_HOSTS.has(incoming.hostname)) return null;

    const target = new URL(incoming.pathname, `${PRODUCTION_CANONICAL_ORIGIN}/`);
    target.search = incoming.search;

    return target.toString();
}
