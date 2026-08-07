import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { handleCloudflareApi } from "../cloudflare/api.mjs";

const ORIGIN = "https://nexochess-staging.example";

function createAuth(session = null) {
    return {
        api: {
            getSession: async () => session
        }
    };
}

function createDatabase(resolveFirst = () => null) {
    const calls = [];

    return {
        calls,
        prepare(sql) {
            return {
                bind(...values) {
                    calls.push({ sql, values });
                    return {
                        first: async () => resolveFirst(sql, values),
                        all: async () => ({ results: [] }),
                        run: async () => ({ meta: { changes: 0 } })
                    };
                }
            };
        },
        batch: async () => []
    };
}

function request(path, options = {}) {
    return new Request(`${ORIGIN}${path}`, options);
}

async function expectStatus(responsePromise, expected) {
    const response = await responsePromise;
    assert.equal(response.status, expected);
    return response;
}

const noDb = createDatabase(() => {
    throw new Error("The database must not be queried for invalid public input.");
});
const publicEnv = { DB: noDb, NEXOCHESS_ORIGIN: ORIGIN };

await expectStatus(handleCloudflareApi(
    request("/api/public/profile/%E0%A4%A"),
    publicEnv,
    createAuth()
), 404);
await expectStatus(handleCloudflareApi(
    request("/api/public/profile/a!"),
    publicEnv,
    createAuth()
), 404);
await expectStatus(handleCloudflareApi(
    request("/api/public/archived-game?id=bad%20id"),
    publicEnv,
    createAuth()
), 404);
await expectStatus(handleCloudflareApi(
    request("/api/public/archived-game?id=one&id=two"),
    publicEnv,
    createAuth()
), 404);
assert.equal(noDb.calls.length, 0);

const profileDb = createDatabase(sql => {
    if (sql.includes('FROM "user"')) {
        return {
            name: "Player",
            username: "player_1",
            roles: "[]",
            createdAt: 1_700_000_000_000
        };
    }
    return null;
});
const profileResponse = await expectStatus(handleCloudflareApi(
    request("/api/public/profile/player_1"),
    { DB: profileDb, NEXOCHESS_ORIGIN: ORIGIN },
    createAuth()
), 200);
const profile = await profileResponse.json();
assert.deepEqual(Object.keys(profile).sort(), [
    "createdAt",
    "displayName",
    "roles",
    "username"
]);
assert.equal(profile.email, undefined);
assert.equal(profile.dateOfBirth, undefined);

const game = {
    initialPosition: "start",
    players: { white: {}, black: {} },
    stateTree: { root: {} }
};
const gameDb = createDatabase(sql => (
    sql.includes("FROM archived_games")
        ? { game_json: JSON.stringify(game) }
        : null
));
const gameResponse = await expectStatus(handleCloudflareApi(
    request("/api/public/archived-game?id=shared_game_1"),
    { DB: gameDb, NEXOCHESS_ORIGIN: ORIGIN },
    createAuth()
), 200);
assert.deepEqual(await gameResponse.json(), game);

const damagedDb = createDatabase(() => ({ game_json: "not-json" }));
await expectStatus(handleCloudflareApi(
    request("/api/public/archived-game?id=damaged_game"),
    { DB: damagedDb, NEXOCHESS_ORIGIN: ORIGIN },
    createAuth()
), 404);

const wrongMethod = await expectStatus(handleCloudflareApi(
    request("/api/account/profile", { method: "POST" }),
    { DB: noDb, NEXOCHESS_ORIGIN: ORIGIN },
    createAuth()
), 405);
assert.equal(wrongMethod.headers.get("Allow"), "GET");

await expectStatus(handleCloudflareApi(
    request("/api/unknown", { method: "POST" }),
    { DB: noDb, NEXOCHESS_ORIGIN: ORIGIN },
    createAuth()
), 404);

await expectStatus(handleCloudflareApi(
    request("/api/account/date-of-birth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Origin: "https://attacker.example"
        },
        body: JSON.stringify({ dateOfBirth: null })
    }),
    { DB: noDb, NEXOCHESS_ORIGIN: ORIGIN },
    createAuth()
), 403);

await expectStatus(handleCloudflareApi(
    request("/api/account/date-of-birth", {
        method: "POST",
        headers: { Origin: ORIGIN },
        body: JSON.stringify({ dateOfBirth: null })
    }),
    { DB: noDb, NEXOCHESS_ORIGIN: ORIGIN },
    createAuth()
), 415);

await expectStatus(handleCloudflareApi(
    request("/api/account/release-notes/v1.1"),
    { DB: noDb, NEXOCHESS_ORIGIN: ORIGIN },
    createAuth()
), 401);

await expectStatus(handleCloudflareApi(
    request("/api/account/release-notes/v1.1", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Origin: "https://attacker.example"
        },
        body: "{}"
    }),
    { DB: noDb, NEXOCHESS_ORIGIN: ORIGIN },
    createAuth()
), 403);

const source = await readFile(resolve("cloudflare", "api.mjs"), "utf8");

function functionSource(name) {
    const start = source.indexOf(`async function ${name}(`);
    assert.notEqual(start, -1, `Missing function ${name}`);

    const matches = [
        source.indexOf("\nasync function ", start + 1),
        source.indexOf("\nfunction ", start + 1),
        source.indexOf("\nexport async function ", start + 1)
    ].filter(index => index > start);
    const end = matches.length > 0 ? Math.min(...matches) : source.length;
    return source.slice(start, end);
}

for (const name of [
    "accountProfile",
    "updateDateOfBirth",
    "getReleaseNoteState",
    "markReleaseNoteSeen",
    "listArchive",
    "addArchiveGame",
    "deleteArchiveGames",
    "getPuzzleProgress",
    "savePuzzleProfile",
    "savePuzzleCompletions"
]) {
    const block = functionSource(name);
    assert.match(block, /requireSession\(auth, request\)/);
    assert.match(block, /session\.user\.id/);
}

const publicProfileSource = functionSource("publicProfile");
assert.doesNotMatch(publicProfileSource, /\bemail\b/);
assert.doesNotMatch(publicProfileSource, /dateOfBirth/);
assert.match(publicProfileSource, /SELECT name, username, roles, createdAt/);

const publicGameSource = functionSource("getArchivedGame");
assert.match(publicGameSource, /SELECT game_json FROM archived_games WHERE id = \?/);
assert.doesNotMatch(publicGameSource, /SELECT \*/);
assert.match(publicGameSource, /JSON\.parse/);
assert.match(publicGameSource, /validArchivedGame/);

assert.doesNotMatch(source, /\b501\b/);
assert.match(source, /Method Not Allowed/);
assert.match(source, /requestId/);

console.log("Public API and D1 isolation verification passed.");
