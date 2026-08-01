import { createHash } from "crypto";
import { Request, RequestHandler, Response } from "express";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

type PlaceholderGenerator = (req: Request, res: Response) => (
    Promise<Record<string, string>>
);

function versionEntryBundles(htmlContent: string) {
    return htmlContent.replace(
        /(<script\s+[^>]*src=["']\/)([^"'?]+\.bundle\.js)(["'][^>]*><\/script>)/gi,
        (match, prefix: string, bundleName: string, suffix: string) => {
            const bundlePath = resolve(`client/dist/${bundleName}`);

            if (!existsSync(bundlePath)) return match;

            const version = createHash("sha256")
                .update(readFileSync(bundlePath))
                .digest("hex")
                .slice(0, 12);

            return `${prefix}${bundleName}?v=${version}${suffix}`;
        }
    );
}

function appRouter(
    filepath: string,
    getPlaceholders?: PlaceholderGenerator
): RequestHandler {
    return async (req, res) => {
        let htmlContent = readFileSync(
            resolve(`client/public/apps/${filepath}`),
            "utf-8"
        );

        if (getPlaceholders) {
            const placeholders = Object.entries(
                await getPlaceholders(req, res)
            );

            for (const [ key, value ] of placeholders) {
                htmlContent = htmlContent.replace(
                    new RegExp(`\\\${${key}}`, "gi"), value
                );
            }
        }

        htmlContent = versionEntryBundles(htmlContent);

        res.setHeader("Content-Type", "text/html");
        res.setHeader(
            "Cache-Control",
            "no-cache, no-store, must-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        res.send(htmlContent);
    };
}

export default appRouter;
