import z from "zod";

import {
    SerializedStateTreeNode,
    stateTreeNodeSchema
} from "./position/StateTreeNode";

export const archivePlayerSummarySchema = z.object({
    accuracy: z.number().nullable().optional(),
    ratingChange: z.number().optional()
});

export const archiveSummarySchema = z.object({
    fingerprint: z.string(),
    savedAt: z.iso.datetime(),
    finalPosition: z.string(),
    opening: z.string().optional(),
    moveCount: z.number().int().nonnegative(),
    result: z.enum(["1-0", "0-1", "1/2-1/2", "*"]),
    white: archivePlayerSummarySchema,
    black: archivePlayerSummarySchema
});

export type ArchiveSummary = z.infer<typeof archiveSummarySchema>;

export const gameAnalysisSchema = z.object({
    estimatedRatings: z.object({
        white: z.number(),
        black: z.number()
    }).optional(),
    stateTree: stateTreeNodeSchema,
    archiveSummary: archiveSummarySchema.optional()
});

export type GameAnalysis = z.infer<typeof gameAnalysisSchema>;

export type SerializedGameAnalysis = (
    Omit<GameAnalysis, "stateTree">
    & { stateTree: SerializedStateTreeNode }
);

export default GameAnalysis;
