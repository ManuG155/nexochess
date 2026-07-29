import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { AuthedUserProfile } from "shared/types/UserProfile";
import { accountAuthenticator } from "@/lib/security/account";
import { User } from "@/database/models/account";

const path = "/profile";

const router = Router();

router.use(path, accountAuthenticator());

router.get(path, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }

    const storedUser = await User.findById(req.user.id)
        .select("dateOfBirth")
        .lean() as { dateOfBirth?: string } | null;

    res.json({
        email: req.user.email,
        displayName: req.user.name,
        username: req.user.username,
        roles: req.user.roles,
        createdAt: req.user.createdAt.toISOString(),
        dateOfBirth: storedUser?.dateOfBirth
    } satisfies AuthedUserProfile);
});

export default router;
