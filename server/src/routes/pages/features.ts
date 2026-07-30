import { Router } from "express";

import appRouter from "@/lib/appRouter";

const router = Router();

router.get("/analysis", appRouter("features/analysis.html"));

router.get("/archive", appRouter("features/archive.html"));

router.get("/academy", appRouter("features/academy.html"));

router.get("/news*", async (_req, res) => {
    res.redirect(308, "/analysis");
});

export default router;
