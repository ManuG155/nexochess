import { Router } from "express";

import appRouter from "@/lib/appRouter";
import featuresRouter from "./features";
import accountRouter from "./account";
import footerRouter from "./footer";

const router = Router();

router.use("/",
    accountRouter,
    featuresRouter,
    footerRouter
);

router.get("/settings*", appRouter("settings.html"));

router.get("/", async (_req, res) => {
    res.redirect("/analysis");
});

const unfoundRouter = appRouter("unfound.html");

router.get("/*", async (req, res, next) => {
    res.status(404);
    return unfoundRouter(req, res, next);
});

export default router;
