const MAX_ARCHIVE_BODY_BYTES = 500_000;
const MAXIMUM_ARCHIVE_SIZE = 50;
const MAX_DELETE_IDS = 50;
const MAX_PROGRESS_COMPLETIONS = 20_000;
const RELEASE_NOTE_VERSION = "v1.1";
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i;
const PUBLIC_ARCHIVE_ID_PATTERN = /^[a-z0-9_-]{1,100}$/i;
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function apiHeaders(contentType) {
    const headers = new Headers();
    if (contentType) headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return headers;
}

function json(payload, status = 200, additionalHeaders = {}) {
    const headers = apiHeaders("application/json; charset=utf-8");
    for (const [name, value] of Object.entries(additionalHeaders)) {
        headers.set(name, value);
    }

    return new Response(JSON.stringify(payload), { status, headers });
}

function text(payload, status = 200) {
    return new Response(payload, {
        status,
        headers: apiHeaders("text/plain; charset=utf-8")
    });
}

function empty(status = 204) {
    return new Response(null, { status, headers: apiHeaders() });
}

function methodNotAllowed(methods) {
    return json(
        { error: "Method Not Allowed" },
        405,
        { Allow: methods.join(", ") }
    );
}

function configuredOrigin(request, env) {
    try {
        return new URL(env.NEXOCHESS_ORIGIN || request.url).origin;
    } catch {
        return new URL(request.url).origin;
    }
}

function validMutationOrigin(request, env) {
    const expectedOrigin = configuredOrigin(request, env);
    const suppliedOrigin = request.headers.get("Origin");

    if (suppliedOrigin) {
        try {
            if (new URL(suppliedOrigin).origin !== expectedOrigin) return false;
        } catch {
            return false;
        }
    }

    return request.headers.get("Sec-Fetch-Site") !== "cross-site";
}

function validJsonContentType(request) {
    const contentType = request.headers.get("Content-Type") || "";
    return contentType.split(";", 1)[0].trim().toLowerCase()
        === "application/json";
}

function guardApiMutation(request, env) {
    if (!MUTATING_METHODS.has(request.method.toUpperCase())) return null;

    if (!validMutationOrigin(request, env)) {
        return json({ error: "Untrusted request origin." }, 403);
    }

    if (!validJsonContentType(request)) {
        return json({ error: "Expected an application/json request body." }, 415);
    }

    return null;
}

function normaliseRoles(value) {
    if (Array.isArray(value)) {
        return value.filter(role => typeof role === "string");
    }

    if (typeof value !== "string") return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
            ? parsed.filter(role => typeof role === "string")
            : [];
    } catch {
        return [];
    }
}

function toIsoDate(value) {
    if (value instanceof Date) return value.toISOString();

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? new Date().toISOString()
        : date.toISOString();
}

function isRecord(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function decodePublicUsername(pathname) {
    const prefix = "/api/public/profile/";
    const encodedUsername = pathname.slice(prefix.length);

    try {
        const username = decodeURIComponent(encodedUsername);
        return USERNAME_PATTERN.test(username) ? username : null;
    } catch {
        return null;
    }
}

function publicArchiveId(url) {
    const ids = url.searchParams.getAll("id");
    if (ids.length !== 1) return null;

    const id = ids[0];
    return PUBLIC_ARCHIVE_ID_PATTERN.test(id) ? id : null;
}

async function getSession(auth, request) {
    try {
        return await auth.api.getSession({ headers: request.headers });
    } catch {
        return null;
    }
}

async function requireSession(auth, request) {
    const session = await getSession(auth, request);
    return session?.user?.id ? session : null;
}

async function readJson(request, maximumBytes = 100_000) {
    const declaredLength = Number(request.headers.get("Content-Length") || 0);
    if (declaredLength > maximumBytes) throw new Response(null, { status: 413 });

    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > maximumBytes) {
        throw new Response(null, { status: 413 });
    }

    try {
        return JSON.parse(raw);
    } catch {
        throw new Response(null, { status: 400 });
    }
}

function archiveMetadata(game) {
    return {
        date: game.date,
        estimatedRatings: game.estimatedRatings,
        initialPosition: game.initialPosition,
        players: game.players,
        timeControl: game.timeControl,
        variant: game.variant,
        archiveSummary: game.archiveSummary
    };
}

function validArchivedGame(game) {
    return Boolean(
        isRecord(game)
        && typeof game.initialPosition === "string"
        && isRecord(game.players)
        && isRecord(game.stateTree)
    );
}

async function accountProfile(request, env, auth) {
    const session = await requireSession(auth, request);
    if (!session) return empty(401);

    const stored = await env.DB.prepare(`
        SELECT dateOfBirth FROM "user" WHERE id = ? LIMIT 1
    `).bind(session.user.id).first();

    return json({
        email: session.user.email,
        displayName: session.user.name,
        username: session.user.username,
        roles: normaliseRoles(session.user.roles),
        createdAt: toIsoDate(session.user.createdAt),
        dateOfBirth: stored?.dateOfBirth || undefined
    });
}

async function publicProfile(pathname, env) {
    const username = decodePublicUsername(pathname);
    if (!username) return empty(404);

    const user = await env.DB.prepare(`
        SELECT name, username, roles, createdAt
        FROM "user"
        WHERE lower(username) = lower(?)
        LIMIT 1
    `).bind(username).first();

    if (!user?.username) return empty(404);

    return json({
        displayName: user.name,
        username: user.username,
        roles: normaliseRoles(user.roles),
        createdAt: toIsoDate(user.createdAt)
    });
}

async function updateDateOfBirth(request, env, auth) {
    const session = await requireSession(auth, request);
    if (!session) return empty(401);

    const body = await readJson(request, 2_000);
    const value = body?.dateOfBirth;

    if (value !== null && typeof value !== "string") return empty(400);

    if (value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return empty(400);

        const date = new Date(`${value}T00:00:00.000Z`);
        const earliest = new Date("1900-01-01T00:00:00.000Z");
        const today = new Date();

        if (
            Number.isNaN(date.getTime())
            || date.toISOString().slice(0, 10) !== value
            || date < earliest
            || date > today
        ) return empty(400);
    }

    await env.DB.prepare(`
        UPDATE "user"
        SET dateOfBirth = ?, updatedAt = ?
        WHERE id = ?
    `).bind(value || null, Date.now(), session.user.id).run();

    return empty(200);
}

async function getReleaseNoteState(request, env, auth) {
    const session = await requireSession(auth, request);
    if (!session) return empty(401);

    const row = await env.DB.prepare(`
        SELECT 1 AS seen
        FROM release_note_views
        WHERE user_id = ? AND version = ?
        LIMIT 1
    `).bind(session.user.id, RELEASE_NOTE_VERSION).first();

    return json({ seen: Boolean(row?.seen) });
}

async function markReleaseNoteSeen(request, env, auth) {
    const session = await requireSession(auth, request);
    if (!session) return empty(401);

    await env.DB.prepare(`
        INSERT INTO release_note_views(user_id, version, seen_at)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, version) DO NOTHING
    `).bind(session.user.id, RELEASE_NOTE_VERSION, Date.now()).run();

    return empty(200);
}

async function listArchive(request, env, auth) {
    const session = await requireSession(auth, request);
    if (!session) return empty(401);

    const result = await env.DB.prepare(`
        SELECT id, metadata_json
        FROM archived_games
        WHERE user_id = ?
        ORDER BY updated_at DESC
        LIMIT ?
    `).bind(session.user.id, MAXIMUM_ARCHIVE_SIZE).all();

    const archive = {};
    for (const row of result.results || []) {
        try {
            archive[row.id] = JSON.parse(row.metadata_json);
        } catch {
            // Ignore a damaged row rather than breaking the entire Archive.
        }
    }

    return json(archive);
}

async function addArchiveGame(request, url, env, auth) {
    const session = await requireSession(auth, request);
    if (!session) return empty(401);

    const game = await readJson(request, MAX_ARCHIVE_BODY_BYTES);
    if (!validArchivedGame(game)) return empty(400);

    const requestedId = url.searchParams.get("id");
    const fingerprint = typeof game.archiveSummary?.fingerprint === "string"
        ? game.archiveSummary.fingerprint.slice(0, 128)
        : null;
    const metadataJson = JSON.stringify(archiveMetadata(game));
    const gameJson = JSON.stringify(game);
    const now = Date.now();

    let existing = null;
    if (requestedId) {
        existing = await env.DB.prepare(`
            SELECT id FROM archived_games
            WHERE id = ? AND user_id = ?
            LIMIT 1
        `).bind(requestedId, session.user.id).first();
    }

    if (!existing && fingerprint) {
        existing = await env.DB.prepare(`
            SELECT id FROM archived_games
            WHERE user_id = ? AND fingerprint = ?
            LIMIT 1
        `).bind(session.user.id, fingerprint).first();
    }

    if (existing?.id) {
        await env.DB.prepare(`
            UPDATE archived_games
            SET fingerprint = ?, metadata_json = ?, game_json = ?, updated_at = ?
            WHERE id = ? AND user_id = ?
        `).bind(
            fingerprint,
            metadataJson,
            gameJson,
            now,
            existing.id,
            session.user.id
        ).run();

        return text(existing.id, 200);
    }

    const count = await env.DB.prepare(`
        SELECT COUNT(*) AS total FROM archived_games WHERE user_id = ?
    `).bind(session.user.id).first();

    if (Number(count?.total || 0) >= MAXIMUM_ARCHIVE_SIZE) {
        return empty(507);
    }

    const id = crypto.randomUUID();
    await env.DB.prepare(`
        INSERT INTO archived_games(
            id, user_id, fingerprint, metadata_json, game_json,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
        id,
        session.user.id,
        fingerprint,
        metadataJson,
        gameJson,
        now,
        now
    ).run();

    return text(id, 200);
}

async function deleteArchiveGames(request, env, auth) {
    const session = await requireSession(auth, request);
    if (!session) return empty(401);

    const ids = await readJson(request, 10_000);
    if (
        !Array.isArray(ids)
        || ids.length === 0
        || ids.length > MAX_DELETE_IDS
        || !ids.every(id => typeof id === "string" && id.length <= 100)
    ) return empty(400);

    const placeholders = ids.map(() => "?").join(", ");
    const deletion = await env.DB.prepare(`
        DELETE FROM archived_games
        WHERE user_id = ? AND id IN (${placeholders})
    `).bind(session.user.id, ...ids).run();

    return Number(deletion.meta?.changes || 0) > 0
        ? empty(200)
        : empty(404);
}

async function getArchivedGame(url, env) {
    const id = publicArchiveId(url);
    if (!id) return empty(404);

    const row = await env.DB.prepare(`
        SELECT game_json FROM archived_games WHERE id = ? LIMIT 1
    `).bind(id).first();

    if (!row?.game_json) return empty(404);

    let game;
    try {
        game = JSON.parse(row.game_json);
    } catch {
        return empty(404);
    }

    return validArchivedGame(game) ? json(game) : empty(404);
}

function validPuzzleProfile(value) {
    return Boolean(
        value
        && Number.isFinite(value.rating)
        && Number.isInteger(value.attempts)
        && Number.isInteger(value.correct)
        && Number.isInteger(value.streak)
        && Number.isInteger(value.bestStreak)
        && value.rating >= 600
        && value.rating <= 3000
        && value.attempts >= 0
        && value.correct >= 0
        && value.correct <= value.attempts
        && value.streak >= 0
        && value.bestStreak >= value.streak
    );
}

async function getPuzzleProgress(request, env, auth) {
    const session = await requireSession(auth, request);
    if (!session) return empty(401);

    const [profile, completions] = await Promise.all([
        env.DB.prepare(`
            SELECT rating, attempts, correct, streak, best_streak
            FROM puzzle_profiles WHERE user_id = ? LIMIT 1
        `).bind(session.user.id).first(),
        env.DB.prepare(`
            SELECT puzzle_id FROM puzzle_completions
            WHERE user_id = ?
            ORDER BY completed_at DESC
            LIMIT ?
        `).bind(session.user.id, MAX_PROGRESS_COMPLETIONS).all()
    ]);

    return json({
        profile: profile
            ? {
                rating: Number(profile.rating),
                attempts: Number(profile.attempts),
                correct: Number(profile.correct),
                streak: Number(profile.streak),
                bestStreak: Number(profile.best_streak)
            }
            : null,
        completions: (completions.results || []).map(row => row.puzzle_id)
    });
}

async function savePuzzleProfile(request, env, auth) {
    const session = await requireSession(auth, request);
    if (!session) return empty(401);

    const profile = await readJson(request, 5_000);
    if (!validPuzzleProfile(profile)) return empty(400);

    await env.DB.prepare(`
        INSERT INTO puzzle_profiles(
            user_id, rating, attempts, correct, streak, best_streak, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            rating = excluded.rating,
            attempts = excluded.attempts,
            correct = excluded.correct,
            streak = excluded.streak,
            best_streak = excluded.best_streak,
            updated_at = excluded.updated_at
        WHERE excluded.attempts >= puzzle_profiles.attempts
    `).bind(
        session.user.id,
        profile.rating,
        profile.attempts,
        profile.correct,
        profile.streak,
        profile.bestStreak,
        Date.now()
    ).run();

    return empty(200);
}

async function savePuzzleCompletions(request, env, auth) {
    const session = await requireSession(auth, request);
    if (!session) return empty(401);

    const body = await readJson(request, 250_000);
    const completions = Array.isArray(body) ? body : [body];

    if (
        completions.length === 0
        || completions.length > 1_000
        || !completions.every(item => (
            item
            && typeof item.id === "string"
            && item.id.length <= 180
            && (item.source === "archive" || item.source === "lichess")
            && typeof item.solvedWithoutHelp === "boolean"
        ))
    ) return empty(400);

    const now = Date.now();
    const statements = completions.map(item => env.DB.prepare(`
        INSERT INTO puzzle_completions(
            user_id, puzzle_id, source, completed_at, solved_without_help
        ) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, puzzle_id) DO UPDATE SET
            completed_at = excluded.completed_at,
            solved_without_help = MAX(
                puzzle_completions.solved_without_help,
                excluded.solved_without_help
            )
    `).bind(
        session.user.id,
        item.id,
        item.source,
        now,
        item.solvedWithoutHelp ? 1 : 0
    ));

    for (let index = 0; index < statements.length; index += 100) {
        await env.DB.batch(statements.slice(index, index + 100));
    }

    return empty(200);
}

function allowedMethods(pathname) {
    if (pathname === "/api/account/profile") return ["GET"];
    if (pathname.startsWith("/api/public/profile/")) return ["GET"];
    if (pathname === "/api/account/date-of-birth") return ["POST"];
    if (pathname === "/api/account/release-notes/v1.1") return ["GET", "POST"];
    if (pathname === "/api/analysis/archive") return ["GET"];
    if (pathname === "/api/analysis/archive/add") return ["POST"];
    if (pathname === "/api/analysis/archive/delete") return ["POST"];
    if (pathname === "/api/public/archived-game") return ["GET"];
    if (pathname === "/api/puzzles/progress") return ["GET"];
    if (pathname === "/api/puzzles/progress/profile") return ["POST"];
    if (pathname === "/api/puzzles/progress/completions") return ["POST"];
    return null;
}

async function routeApiRequest(request, url, pathname, env, auth) {
    if (pathname === "/api/account/profile") {
        return accountProfile(request, env, auth);
    }

    if (pathname.startsWith("/api/public/profile/")) {
        return publicProfile(pathname, env);
    }

    if (pathname === "/api/account/date-of-birth") {
        return updateDateOfBirth(request, env, auth);
    }

    if (pathname === "/api/account/release-notes/v1.1") {
        return request.method === "GET"
            ? getReleaseNoteState(request, env, auth)
            : markReleaseNoteSeen(request, env, auth);
    }

    if (pathname === "/api/analysis/archive") {
        return listArchive(request, env, auth);
    }

    if (pathname === "/api/analysis/archive/add") {
        return addArchiveGame(request, url, env, auth);
    }

    if (pathname === "/api/analysis/archive/delete") {
        return deleteArchiveGames(request, env, auth);
    }

    if (pathname === "/api/public/archived-game") {
        return getArchivedGame(url, env);
    }

    if (pathname === "/api/puzzles/progress") {
        return getPuzzleProgress(request, env, auth);
    }

    if (pathname === "/api/puzzles/progress/profile") {
        return savePuzzleProfile(request, env, auth);
    }

    return savePuzzleCompletions(request, env, auth);
}

export async function handleCloudflareApi(request, env, auth) {
    const url = new URL(request.url);
    const pathname = url.pathname.length > 1 && url.pathname.endsWith("/")
        ? url.pathname.slice(0, -1)
        : url.pathname;
    const methods = allowedMethods(pathname);

    if (!methods) return empty(404);
    if (!methods.includes(request.method)) return methodNotAllowed(methods);

    const rejectedMutation = guardApiMutation(request, env);
    if (rejectedMutation) return rejectedMutation;

    try {
        return await routeApiRequest(request, url, pathname, env, auth);
    } catch (error) {
        if (error instanceof Response) return error;

        const requestId = crypto.randomUUID();
        console.error("Cloudflare API failure", {
            requestId,
            method: request.method,
            pathname,
            error
        });

        return json({
            error: "The Cloudflare API request failed.",
            requestId
        }, 500);
    }
}