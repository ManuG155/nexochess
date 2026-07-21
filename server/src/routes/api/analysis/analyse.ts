import express, { Router } from "express";
import { StatusCodes } from "http-status-codes";

import {
    SerializedStateTreeNode,
    serializeNode,
    deserializeNode,
    stateTreeNodeSchema
} from "shared/types/game/position/StateTreeNode";
import { getGameAnalysis } from "shared/lib/reporter/report";
import analysisAuthenticator from "@/lib/security/analysis";

const path = "/analysis/analyse";

const router = Router();

router.use(path,
    analysisAuthenticator,
    express.json({ limit: "1mb" })
);

function parseOptionalNumber(
    value: unknown
) {

    if (
        typeof value
        != "string"

        ||

        value.trim()
        == ""
    ) {

        return undefined;
    }


    const parsed =
        Number(
            value
        );


    if (
        !Number.isFinite(
            parsed
        )
    ) {

        return undefined;
    }


    return parsed;
}

router.post(path, async (req, res) => {
    const serializedStateTree: SerializedStateTreeNode = req.body;

    if (!stateTreeNodeSchema.safeParse(serializedStateTree).success)
        return res.sendStatus(StatusCodes.BAD_REQUEST);

    const stateTree = deserializeNode(serializedStateTree);

    try {
        const gameAnalysis = getGameAnalysis(
    stateTree,
    {
        includeBrilliant:
            req
                .query
                .brilliant
            == "true",

        includeCritical:
            req
                .query
                .critical
            == "true",

        includeTheory:
            req
                .query
                .theory
            == "true",


        whiteRating:

            parseOptionalNumber(

                req
                    .query
                    .whiteRating

            ),


        blackRating:

            parseOptionalNumber(

                req
                    .query
                    .blackRating

            )
    }
);

        res.json({
            ...gameAnalysis,
            stateTree: serializeNode(gameAnalysis.stateTree)
        });
    } catch {
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
});

export default router;