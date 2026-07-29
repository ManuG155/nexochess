import { Router } from "express";

import { accountAuthenticator } from "@/lib/security/account";
import appRouter from "@/lib/appRouter";

const router = Router();

const authPageRouter = appRouter(
    "account/signin.html",
    async req => {
        const signingUp = req.path.startsWith("/signup");

        return signingUp
            ? {
                AUTH_TITLE: "Create Account",
                AUTH_DESCRIPTION: "Create a NexoChess account to sync your Archive across devices.",
                AUTH_CANONICAL: "https://www.nexochess.com/signup"
            }
            : {
                AUTH_TITLE: "Sign In",
                AUTH_DESCRIPTION: "Sign in to your NexoChess account.",
                AUTH_CANONICAL: "https://www.nexochess.com/signin"
            };
    }
);

router.get(/^\/(signin|signup)\/?$/, authPageRouter);

// Profile page route disabled until the page is useful
// router.get("/profile/:username", async (req, res, next) => {
//     const user = await User.findOne({
//         username: req.params.username
//     });

//     if (!user) return next();

//     const profileRouter = appRouter(
//         "account/profile.html",
//         async req => req.params
//     );

//     profileRouter(req, res, next);
// });

router.get("/auth/reset-password",
    accountAuthenticator(true),
    appRouter("account/resetPassword.html")
);

export default router;
