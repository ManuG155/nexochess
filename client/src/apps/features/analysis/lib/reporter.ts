import { StatusCodes } from "http-status-codes";
import { clone } from "lodash-es";

import { getGameAnalysis } from "shared/lib/reporter/report";
import AnalysisOptions from "shared/lib/reporter/types/AnalysisOptions";
import { GameAnalysis } from "shared/types/game/GameAnalysis";
import {
    StateTreeNode
} from "shared/types/game/position/StateTreeNode";
import APIResponse from "@/types/APIResponse";

export async function analyseStateTree(
    rootNode: StateTreeNode,
    options?: AnalysisOptions
): APIResponse<{ gameAnalysis: GameAnalysis }> {
    try {
        /*
         * Stockfish already evaluates every position in the browser. The final
         * classifications, accuracies and opening labels also live in the
         * shared package, so generating the report locally avoids the former
         * CAPTCHA/session/Express round trip entirely.
         */
        return {
            status: StatusCodes.OK,
            gameAnalysis: getGameAnalysis(rootNode, options)
        };
    } catch {
        return { status: StatusCodes.INTERNAL_SERVER_ERROR };
    }
}

export async function analyseNode(
    node: StateTreeNode,
    options?: AnalysisOptions
): APIResponse<{ node: StateTreeNode }> {
    if (!node.parent)
        return { status: StatusCodes.BAD_REQUEST };

    const childlessNode = clone(node);
    childlessNode.children = [];

    const parentNode = clone(node.parent);
    parentNode.children = [childlessNode];

    const reportResult = await analyseStateTree(parentNode, options);
    const analysedNode = reportResult.gameAnalysis?.stateTree.children.at(0);

    return {
        status: reportResult.status,
        node: analysedNode
    };
}