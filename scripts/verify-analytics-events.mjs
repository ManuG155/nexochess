import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const read = (...parts) => readFile(resolve(...parts), "utf8");

const analytics = await read("client", "src", "lib", "analytics.ts");
const analysis = await read(
    "client", "src", "apps", "features", "analysis", "hooks", "useAnalyseGame.ts"
);
const share = await read(
    "client", "src", "apps", "features", "analysis", "components", "ShareDialog", "index.tsx"
);
const signIn = await read(
    "client", "src", "apps", "account", "signin", "pages", "SignIn", "index.tsx"
);
const signUp = await read(
    "client", "src", "apps", "account", "signin", "pages", "SignUp", "index.tsx"
);
const navigation = await read(
    "client", "src", "components", "layout", "NavigationBar", "index.tsx"
);
const puzzleSources = await read(
    "client", "src", "apps", "features", "puzzles", "lib", "sources.ts"
);
const puzzleProgress = await read(
    "client", "src", "apps", "features", "puzzles", "lib", "progress.ts"
);
const ci = await read(".github", "workflows", "ci.yml");
const packageJson = JSON.parse(await read("package.json"));

const eventNames = [
    "analysis_started",
    "analysis_completed",
    "analysis_failed",
    "puzzle_started",
    "puzzle_solved",
    "puzzle_failed",
    "game_shared",
    "signup_completed",
    "login_completed"
];

for (const eventName of eventNames) {
    assert.ok(
        analytics.includes(`name: "${eventName}"`),
        `Missing typed analytics event: ${eventName}`
    );
}

for (const fragment of [
    "type AnalyticsEvent =",
    "function emitAnalyticsEvent(event: AnalyticsEvent)",
    'ensureGtag()("event", event.name, parameters)',
    "readConsentPreferences()?.analytics === true",
    "readRuntimeMeasurementId()",
    'const PRODUCTION_ENVIRONMENT = "production"',
    'ad_storage: "denied"',
    'ad_user_data: "denied"',
    'ad_personalization: "denied"'
]) {
    assert.ok(
        analytics.includes(fragment),
        `Analytics event safeguard is missing: ${fragment}`
    );
}

assert.ok(
    !analytics.includes("export function emitAnalyticsEvent")
        && !analytics.includes("export const emitAnalyticsEvent"),
    "The generic event emitter must remain private to the analytics module."
);

for (const allowedParameter of [
    "failure_reason",
    "puzzle_source",
    "share_method",
    "auth_method"
]) {
    assert.ok(
        analytics.includes(`parameters.${allowedParameter}`),
        `Missing allowlisted analytics parameter: ${allowedParameter}`
    );
}

for (const forbiddenParameter of [
    "pgn",
    "fen",
    "email",
    "username",
    "user_id",
    "account_id",
    "game_id",
    "puzzle_id",
    "player"
]) {
    assert.ok(
        !analytics.includes(`parameters.${forbiddenParameter}`),
        `Sensitive analytics parameter is forbidden: ${forbiddenParameter}`
    );
}

for (const fragment of [
    "trackAnalysisStarted();",
    'trackAnalysisFailed("request_failed");',
    'trackAnalysisFailed("missing_result");',
    "trackAnalysisCompleted();"
]) {
    assert.ok(analysis.includes(fragment), `Analysis event hook is missing: ${fragment}`);
}

for (const fragment of [
    'trackGameShared("pgn_download");',
    'trackGameShared("native");'
]) {
    assert.ok(share.includes(fragment), `Share event hook is missing: ${fragment}`);
}
assert.ok(
    share.indexOf('trackGameShared("native");')
        > share.indexOf("await navigator.share"),
    "Native sharing must only be counted after navigator.share resolves."
);

for (const fragment of [
    'markPendingAuthAnalytics("login", "email")',
    'markPendingAuthAnalytics("login", "google")',
    "clearPendingAuthAnalytics()"
]) {
    assert.ok(signIn.includes(fragment), `Sign-in analytics hook is missing: ${fragment}`);
}
for (const fragment of [
    'markPendingAuthAnalytics("signup", "email")',
    'markPendingAuthAnalytics("signup", "google")',
    "clearPendingAuthAnalytics()"
]) {
    assert.ok(signUp.includes(fragment), `Sign-up analytics hook is missing: ${fragment}`);
}
for (const fragment of [
    "completePendingAuthAnalytics(true)",
    "completePendingAuthAnalytics(false)"
]) {
    assert.ok(
        navigation.includes(fragment),
        `Authenticated-session confirmation is missing: ${fragment}`
    );
}
for (const fragment of [
    "PENDING_AUTH_STORAGE_KEY",
    "PENDING_AUTH_MAX_AGE_MS",
    "window.sessionStorage.setItem",
    "window.sessionStorage.removeItem",
    "flow,",
    "method,",
    "createdAt: Date.now()"
]) {
    assert.ok(analytics.includes(fragment), `Pending-auth safeguard is missing: ${fragment}`);
}

for (const fragment of [
    'trackPuzzleStarted("lichess")',
    "trackPuzzleStarted(source)"
]) {
    assert.ok(
        puzzleSources.includes(fragment),
        `Puzzle-start analytics hook is missing: ${fragment}`
    );
}
for (const fragment of [
    "if (solvedWithoutHelp)",
    "trackPuzzleSolved(source);",
    "trackPuzzleFailed(source);"
]) {
    assert.ok(
        puzzleProgress.includes(fragment),
        `Puzzle-outcome analytics hook is missing: ${fragment}`
    );
}
assert.ok(
    puzzleProgress.indexOf("trackPuzzleSolved(source);")
        > puzzleProgress.indexOf("await storeLocalCompletions([completion]);"),
    "Puzzle outcomes must only be measured after local completion is stored."
);

assert.equal(
    packageJson.scripts?.["verify:analytics-events"],
    "node scripts/verify-analytics-events.mjs",
    "Missing verify:analytics-events package script."
);
assert.ok(
    packageJson.scripts.check.includes("verify:analytics-events"),
    "Analytics event verification must run as part of npm run check."
);
assert.ok(ci.includes("Verify privacy-safe analytics events"));
assert.ok(ci.includes("npm run verify:analytics-events"));
assert.ok(ci.includes("node --check scripts/verify-analytics-events.mjs"));

console.log("Analytics event verification passed.");
console.log("Nine consent-gated product events are typed, privacy-limited and wired into CI for Step 33.");
