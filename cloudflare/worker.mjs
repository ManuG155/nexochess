const PAGE_ROUTES = new Map([
    ["/analysis", "features/analysis.html"],
    ["/archive", "features/archive.html"],
    ["/academy", "features/academy.html"],
    ["/puzzles", "features/puzzles.html"],
    ["/help", "footer/helpCenter.html"],
    ["/signin", "account/signin.html"],
    ["/signup", "account/signin.html"],
    ["/auth/reset-password", "account/resetPassword.html"],
    ["/terms", "footer/legal.html"],
    ["/privacy", "footer/legal.html"],
    ["/source", "footer/legal.html"]
]);

const AUTH_METADATA = {
    "/signin": {
        AUTH_TITLE: "Sign In",
        AUTH_DESCRIPTION: "Sign in to your NexoChess account.",
        AUTH_CANONICAL: "https://www.nexochess.com/signin"
    },
    "/signup": {
        AUTH_TITLE: "Create Account",
        AUTH_DESCRIPTION: "Create a NexoChess account to sync your Archive across devices.",
        AUTH_CANONICAL: "https://www.nexochess.com/signup"
    }
};

const LEGAL_METADATA = {
    "/terms": {
        LEGAL_TITLE: "Terms of Service",
        LEGAL_DESCRIPTION: "Read the terms that govern the use of NexoChess.",
        LEGAL_CANONICAL: "https://www.nexochess.com/terms"
    },
    "/privacy": {
        LEGAL_TITLE: "Privacy Policy",
        LEGAL_DESCRIPTION: "Learn how NexoChess handles account, Archive and browser data.",
        LEGAL_CANONICAL: "https://www.nexochess.com/privacy"
    },
    "/source": {
        LEGAL_TITLE: "Source code and licences",
        LEGAL_DESCRIPTION: "View NexoChess source-code and licence information.",
        LEGAL_CANONICAL: "https://www.nexochess.com/source"
    }
};

function normalisePathname(pathname) {
    if (pathname.length > 1 && pathname.endsWith("/")) {
        return pathname.slice(0, -1);
    }

    return pathname;
}

function metadataFor(pathname) {
    return AUTH_METADATA[pathname] || LEGAL_METADATA[pathname] || {};
}

function replacePlaceholders(html, replacements) {
    let output = html;

    for (const [key, value] of Object.entries(replacements)) {
        output = output.replaceAll("${" + key + "}", value);
    }

    return output;
}

function withStagingHeaders(headers, contentType) {
    const nextHeaders = new Headers(headers);

    if (contentType) nextHeaders.set("Content-Type", contentType);
    nextHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    nextHeaders.set("Pragma", "no-cache");
    nextHeaders.set("Expires", "0");
    nextHeaders.set("X-Robots-Tag", "noindex, nofollow, noarchive");

    return nextHeaders;
}

async function renderPage(request, env, filepath, replacements = {}, status = 200) {
    const assetUrl = new URL(`/apps/${filepath}`, request.url);
    const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, {
        method: "GET",
        headers: request.headers
    }));

    if (!assetResponse.ok) return assetResponse;

    const html = replacePlaceholders(
        await assetResponse.text(),
        replacements
    );

    return new Response(request.method === "HEAD" ? null : html, {
        status,
        headers: withStagingHeaders(
            assetResponse.headers,
            "text/html; charset=utf-8"
        )
    });
}

function json(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: withStagingHeaders(
            { "Content-Type": "application/json; charset=utf-8" }
        )
    });
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = normalisePathname(url.pathname);

        if (request.method !== "GET" && request.method !== "HEAD") {
            if (pathname.startsWith("/api/") || pathname.startsWith("/auth/")) {
                return json({
                    error: "This staging endpoint has not been migrated yet."
                }, 501);
            }

            return new Response("Method Not Allowed", {
                status: 405,
                headers: { Allow: "GET, HEAD" }
            });
        }

        if (pathname === "/") {
            return Response.redirect(new URL("/analysis", request.url), 308);
        }

        if (pathname.startsWith("/news")) {
            return Response.redirect(new URL("/analysis", request.url), 308);
        }

        if (pathname.startsWith("/api/") || pathname.startsWith("/auth/account/")) {
            return json({
                error: "This staging API route is being migrated from MongoDB to Cloudflare."
            }, 501);
        }

        if (pathname.startsWith("/settings")) {
            return renderPage(request, env, "settings.html");
        }

        const filepath = PAGE_ROUTES.get(pathname);
        if (filepath) {
            return renderPage(
                request,
                env,
                filepath,
                metadataFor(pathname)
            );
        }

        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) return assetResponse;

        return renderPage(request, env, "unfound.html", {}, 404);
    }
};
