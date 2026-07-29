import { Router } from "express";

import appRouter from "@/lib/appRouter";

const router = Router();

router.get("/help", appRouter("footer/helpCenter.html"));

const legalPageRouter = appRouter(
    "footer/legal.html",
    async req => {
        if (req.path.startsWith("/privacy")) {
            return {
                LEGAL_TITLE: "Privacy Policy",
                LEGAL_DESCRIPTION: "Learn how NexoChess handles account, Archive and browser data.",
                LEGAL_CANONICAL: "https://www.nexochess.com/privacy"
            };
        }

        if (req.path.startsWith("/source")) {
            return {
                LEGAL_TITLE: "Source code and licences",
                LEGAL_DESCRIPTION: "View NexoChess source-code and licence information.",
                LEGAL_CANONICAL: "https://www.nexochess.com/source"
            };
        }

        return {
            LEGAL_TITLE: "Terms of Service",
            LEGAL_DESCRIPTION: "Read the terms that govern the use of NexoChess.",
            LEGAL_CANONICAL: "https://www.nexochess.com/terms"
        };
    }
);

router.get(/^\/(terms|privacy|source)\/?$/, legalPageRouter);

export default router;
