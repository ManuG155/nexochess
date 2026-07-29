import express, { Router } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

import { accountAuthenticator } from "@/lib/security/account";
import { User } from "@/database/models/account";

const path = "/date-of-birth";
const router = Router();

const dateOfBirthSchema = z.object({
    dateOfBirth: z.iso.date().nullable()
});

router.use(
    path,
    express.json(),
    accountAuthenticator()
);

router.post(path, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }

    const parsed = dateOfBirthSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.sendStatus(StatusCodes.BAD_REQUEST);
    }

    const value = parsed.data.dateOfBirth;

    if (value) {
        const date = new Date(`${value}T00:00:00.000Z`);
        const earliest = new Date("1900-01-01T00:00:00.000Z");
        const today = new Date();

        if (date < earliest || date > today) {
            return res.sendStatus(StatusCodes.BAD_REQUEST);
        }
    }

    await User.updateOne(
        { _id: req.user.id },
        value
            ? { $set: { dateOfBirth: value } }
            : { $unset: { dateOfBirth: "" } }
    );

    return res.sendStatus(StatusCodes.OK);
});

export default router;
