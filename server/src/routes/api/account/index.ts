import { Router } from "express";

import profileRouter from "./profile";
import dateOfBirthRouter from "./dateOfBirth";

const router = Router();

router.use("/account", profileRouter, dateOfBirthRouter);

export default router;