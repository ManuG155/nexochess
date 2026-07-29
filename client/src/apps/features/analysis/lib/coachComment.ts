import type { TFunction } from "i18next";
import { Chess, Move } from "chess.js";

import { Classification } from "shared/constants/Classification";

import type { CoachId } from "./coach";
import {
    StateTreeNode
} from "shared/types/game/position/StateTreeNode";
import {
    getTopEngineLine
} from "shared/types/game/position/EngineLine";


const pieceNames: Record<string, string> = {
    p: "pawn",
    n: "knight",
    b: "bishop",
    r: "rook",
    q: "queen",
    k: "king"
};

const pieceValues: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 100
};

const COMMENT_LIMIT = 154;


interface MoveContext {
    seed: string;
    playedSan?: string;
    playedMove?: Move;
    bestSan?: string;
    bestMove?: Move;
    replySan?: string;
    replyMove?: Move;
    evaluationLoss?: number;
    mateAllowed?: number;
    opening?: string;
    previousOpening?: string;
    ply: number;
}


function sentence(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) return "";
    if (/[.!?]$/.test(trimmed)) return trimmed;

    return `${trimmed}.`;
}


function fitComment(primary: string, secondary?: string): string {
    const first = sentence(primary);
    const second = secondary ? sentence(secondary) : "";
    const combined = second ? `${first} ${second}` : first;

    if (combined.length <= COMMENT_LIMIT) {
        return combined;
    }

    if (first.length <= COMMENT_LIMIT) {
        return first;
    }

    const available = first.slice(0, COMMENT_LIMIT - 1).trimEnd();
    const lastSpace = available.lastIndexOf(" ");
    const clipped = lastSpace > 40
        ? available.slice(0, lastSpace)
        : available;

    return `${clipped}…`;
}


function hashText(value: string): number {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}


function pickStable<T>(
    context: MoveContext,
    tag: string,
    values: T[]
): T {
    const index = hashText(`${context.seed}|${tag}`) % values.length;
    return values[index];
}


function moveFromPosition(
    fen: string,
    notation: string | undefined
): Move | undefined {
    if (!notation) return;

    try {
        return new Chess(fen).move(notation);
    } catch {
        return;
    }
}


function getPlayedMove(node: StateTreeNode): Move | undefined {
    if (!node.parent || !node.state.move) return;

    return moveFromPosition(
        node.parent.state.fen,
        node.state.move.uci || node.state.move.san
    );
}


function getBestMove(node: StateTreeNode): Move | undefined {
    if (!node.parent) return;

    const bestUci = getTopEngineLine(
        node.parent.state.engineLines
    )?.moves.at(0)?.uci;

    return moveFromPosition(node.parent.state.fen, bestUci);
}


function getReplyMove(node: StateTreeNode): Move | undefined {
    const replyUci = getTopEngineLine(
        node.state.engineLines
    )?.moves.at(0)?.uci;

    return moveFromPosition(node.state.fen, replyUci);
}


function evaluationForMover(
    evaluation: {
        type: string;
        value: number;
    },
    moverIsWhite: boolean
): number | undefined {
    if (evaluation.type != "centipawn") return;

    const whiteValue = evaluation.value / 100;
    return moverIsWhite ? whiteValue : -whiteValue;
}


function getEvaluationLoss(
    node: StateTreeNode,
    playedMove: Move | undefined
): number | undefined {
    if (!node.parent || !playedMove) return;

    const before = getTopEngineLine(
        node.parent.state.engineLines
    )?.evaluation;

    const after = getTopEngineLine(
        node.state.engineLines
    )?.evaluation;

    if (!before || !after) return;

    const moverIsWhite = playedMove.color == "w";
    const beforeValue = evaluationForMover(before, moverIsWhite);
    const afterValue = evaluationForMover(after, moverIsWhite);

    if (beforeValue == undefined || afterValue == undefined) return;

    return Math.max(0, beforeValue - afterValue);
}


function getAllowedMate(
    node: StateTreeNode,
    playedMove: Move | undefined
): number | undefined {
    if (!playedMove) return;

    const after = getTopEngineLine(
        node.state.engineLines
    )?.evaluation;

    if (!after || after.type != "mate") return;

    const mateForWhite = after.value > 0;
    const moverIsWhite = playedMove.color == "w";

    if (mateForWhite == moverIsWhite) return;

    return Math.abs(after.value);
}


function getNodePly(node: StateTreeNode): number {
    let ply = 0;
    let current = node.parent;

    while (current) {
        ply += 1;
        current = current.parent;
    }

    return ply;
}


function getPreviousOpening(node: StateTreeNode): string | undefined {
    let current = node.parent;

    while (current) {
        if (current.state.opening) {
            return current.state.opening;
        }

        current = current.parent;
    }

    return;
}


function createContext(node: StateTreeNode): MoveContext {
    const playedMove = getPlayedMove(node);
    const bestMove = getBestMove(node);
    const replyMove = getReplyMove(node);
    const playedSan = playedMove?.san || node.state.move?.san;

    return {
        seed: [
            node.state.fen,
            playedSan || "start",
            bestMove?.san || "none",
            replyMove?.san || "none"
        ].join("|"),
        playedSan,
        playedMove,
        bestSan: bestMove?.san,
        bestMove,
        replySan: replyMove?.san,
        replyMove,
        evaluationLoss: getEvaluationLoss(node, playedMove),
        mateAllowed: getAllowedMate(node, playedMove),
        opening: node.state.opening,
        previousOpening: getPreviousOpening(node),
        ply: getNodePly(node)
    };
}


function isDevelopmentMove(move: Move | undefined): boolean {
    if (!move || (move.piece != "n" && move.piece != "b")) return false;

    const startingSquares = new Set([
        "b1", "g1", "c1", "f1",
        "b8", "g8", "c8", "f8"
    ]);

    return startingSquares.has(move.from);
}


function isCentralPawnAdvance(move: Move | undefined): boolean {
    if (!move || move.piece != "p") return false;

    return ["d4", "e4", "d5", "e5"].includes(move.to);
}


function describeMoveFeature(move: Move | undefined): string | undefined {
    if (!move) return;

    if (move.san.includes("#")) {
        return "delivers checkmate";
    }

    if (move.san.includes("+")) {
        return "checks the king";
    }

    if (move.promotion) {
        return `promotes to a ${pieceNames[move.promotion] || "new piece"}`;
    }

    if (move.san == "O-O") {
        return "castles kingside and secures the king";
    }

    if (move.san == "O-O-O") {
        return "castles queenside and brings the rook into play";
    }

    if (move.captured) {
        return `captures the ${pieceNames[move.captured] || "piece"}`;
    }

    if (isDevelopmentMove(move)) {
        return `develops the ${pieceNames[move.piece]}`;
    }

    if (isCentralPawnAdvance(move)) {
        return "claims space in the centre";
    }

    return;
}


function pieceLossPhrase(piece: string | undefined): string {
    const name = pieceNames[piece || ""] || "piece";

    if (name == "queen") return "losing the queen";
    if (name == "pawn") return "dropping a pawn";

    return `losing a ${name}`;
}


function replyTakesMovedPiece(context: MoveContext): boolean {
    if (!context.playedMove || !context.replyMove) return false;

    return context.replyMove.to == context.playedMove.to
        && context.replyMove.captured == context.playedMove.piece;
}


function isFavourableExchange(context: MoveContext): boolean {
    if (!context.playedMove?.captured || !replyTakesMovedPiece(context)) {
        return false;
    }

    return pieceValues[context.playedMove.captured]
        > pieceValues[context.playedMove.piece];
}


function getImmediateLoss(context: MoveContext): string | undefined {
    const captured = context.replyMove?.captured;

    if (!captured || !context.replySan) return;

    if (replyTakesMovedPiece(context) && context.playedMove) {
        const name = pieceNames[context.playedMove.piece] || "piece";
        return `After ${context.replySan}, the ${name} on ${context.playedMove.to} is lost`;
    }

    return `This allows ${context.replySan}, ${pieceLossPhrase(captured)}`;
}


function describeEvaluationLoss(
    context: MoveContext,
    severe: boolean
): string {
    const loss = context.evaluationLoss;

    if (loss == undefined) {
        return severe
            ? "This leaves the position in serious trouble"
            : "This gives the opponent a much easier game";
    }

    if (loss >= 5) {
        return pickStable(context, "loss-5", [
            "This gives away a decisive advantage",
            "This turns the position into a losing one",
            "This changes the game completely"
        ]);
    }

    if (loss >= 2.5) {
        return pickStable(context, "loss-25", [
            "This swings the position heavily toward the opponent",
            "This concedes a major part of the position",
            "This leaves the opponent clearly on top"
        ]);
    }

    if (loss >= 1.2) {
        return pickStable(context, "loss-12", [
            "This gives away a clear part of the advantage",
            "This hands the opponent a strong improvement",
            "This makes the position substantially worse"
        ]);
    }

    return pickStable(context, "loss-small", [
        "This makes the position harder to handle",
        "This gives the opponent an easier route forward",
        "This loses some of the position's flexibility"
    ]);
}


function bestMoveFollowUp(
    context: MoveContext,
    wording: string
): string | undefined {
    if (!context.bestSan) return;
    if (context.bestSan == context.playedSan) return;

    return `${context.bestSan} ${wording}`;
}


function bestMoveReason(context: MoveContext): string | undefined {
    if (!context.bestSan || context.bestSan == context.playedSan) return;

    const feature = describeMoveFeature(context.bestMove);

    if (feature) {
        return `${context.bestSan} was stronger because it ${feature}`;
    }

    return;
}


function generateBrilliant(context: MoveContext): string {
    const move = context.playedSan || "This move";
    const feature = describeMoveFeature(context.playedMove);

    if (context.playedMove?.san.includes("#")) {
        return fitComment(`${move} is a brilliant finish: checkmate`);
    }

    if (replyTakesMovedPiece(context) && context.replySan) {
        if (isFavourableExchange(context)) {
            return fitComment(
                `${move} is a brilliant exchange: ${context.replySan} still leaves you ahead in material`
            );
        }

        return fitComment(
            `${move} is a brilliant sacrifice`,
            `${context.replySan} is the critical test`
        );
    }

    if (feature) {
        return fitComment(
            `${move} is a brilliant find: it ${feature}`,
            context.replySan
                ? `${context.replySan} is the critical reply`
                : undefined
        );
    }

    return fitComment(
        `${move} is a brilliant find`,
        context.replySan
            ? `${context.replySan} is the critical test`
            : "The idea is difficult to spot"
    );
}


function generateCritical(context: MoveContext): string {
    const move = context.playedSan || "This move";
    const feature = describeMoveFeature(context.playedMove);

    if (feature) {
        return fitComment(
            `${move} is a strong practical move: it ${feature}`,
            context.replySan
                ? `${context.replySan} is the main test`
                : undefined
        );
    }

    return fitComment(
        pickStable(context, "critical-primary", [
            `${move} finds the critical continuation`,
            `${move} keeps the position firmly on course`,
            `${move} handles the key moment accurately`
        ]),
        context.replySan
            ? `${context.replySan} is the main reply`
            : undefined
    );
}


function generateBest(context: MoveContext): string {
    const move = context.playedSan || "This move";
    const feature = describeMoveFeature(context.playedMove);

    if (feature) {
        return fitComment(`${move} is best: it ${feature}`);
    }

    return fitComment(
        pickStable(context, "best-primary", [
            `${move} is the most precise choice`,
            `${move} is the cleanest continuation`,
            `${move} fits the position best`
        ]),
        context.replySan
            ? `${context.replySan} is the main continuation`
            : undefined
    );
}


function generateExcellent(context: MoveContext): string {
    const move = context.playedSan || "This move";
    const feature = describeMoveFeature(context.playedMove);

    if (feature) {
        return fitComment(`${move} is excellent: it ${feature}`);
    }

    return fitComment(
        pickStable(context, "excellent-primary", [
            `${move} is excellent and keeps the position under control`,
            `${move} is accurate and preserves your advantage`,
            `${move} improves the position without creating new weaknesses`
        ]),
        bestMoveFollowUp(context, "was only marginally more precise")
    );
}


function generateOkay(context: MoveContext): string {
    const move = context.playedSan || "This move";
    const feature = describeMoveFeature(context.playedMove);

    if (feature) {
        return fitComment(`${move} is sound: it ${feature}`);
    }

    return fitComment(
        pickStable(context, "okay-primary", [
            `${move} is sound and keeps the position stable`,
            `${move} is a reasonable continuation`,
            `${move} keeps the game balanced and playable`
        ])
    );
}


function generateInaccuracy(context: MoveContext): string {
    const immediateLoss = getImmediateLoss(context);

    if (immediateLoss && (context.evaluationLoss || 0) >= 0.8) {
        return fitComment(
            immediateLoss,
            bestMoveFollowUp(context, "was cleaner")
        );
    }

    const reason = bestMoveReason(context);

    if (reason) {
        return fitComment(
            `${context.playedSan} is slightly imprecise`,
            reason
        );
    }

    return fitComment(
        `${context.playedSan} is slightly imprecise`,
        bestMoveFollowUp(context, "kept more options available")
    );
}


function generateMistake(
    context: MoveContext,
    severe: boolean
): string {
    if (context.mateAllowed != undefined) {
        const mateText = context.mateAllowed == 1
            ? "mate on the next move"
            : `mate in ${context.mateAllowed}`;

        return fitComment(
            `This allows ${mateText}`,
            bestMoveFollowUp(context, "was necessary")
        );
    }

    const immediateLoss = getImmediateLoss(context);

    if (immediateLoss) {
        return fitComment(
            immediateLoss,
            bestMoveFollowUp(
                context,
                severe ? "avoided the tactic" : "was safer"
            )
        );
    }

    return fitComment(
        describeEvaluationLoss(context, severe),
        bestMoveFollowUp(
            context,
            severe ? "kept the position together" : "was more accurate"
        )
    );
}


function generateMiss(context: MoveContext): string {
    if (!context.bestSan) {
        return fitComment(
            `${context.playedSan} overlooks the strongest continuation`
        );
    }

    const feature = describeMoveFeature(context.bestMove);

    if (feature) {
        return fitComment(
            `This overlooks ${context.bestSan}, which ${feature}`
        );
    }

    return fitComment(
        `This overlooks ${context.bestSan}`,
        "That was the strongest continuation"
    );
}


function generateRisky(context: MoveContext): string {
    const move = context.playedSan || "This move";

    return fitComment(
        `${move} is playable, but it leaves little room for error`,
        context.replySan
            ? `${context.replySan} is the most demanding reply`
            : bestMoveFollowUp(context, "was safer")
    );
}


type OpeningStep =
    | "identified"
    | "settled"
    | "refined"
    | "entered"
    | "returned"
    | "transposed"
    | "familiar";


function openingFamily(opening: string): string {
    return opening.split(":", 1)[0].trim();
}


function isBroadOpening(opening: string): boolean {
    const family = openingFamily(opening);

    if (opening != family) return false;

    return [
        "King's Pawn Game",
        "Queen's Pawn Game",
        "English Opening",
        "Zukertort Opening",
        "Réti Opening",
        "Nimzo-Larsen Attack",
        "Sicilian Defense",
        "French Defense",
        "Caro-Kann Defense"
    ].includes(family);
}


function isFamilyName(opening: string): boolean {
    return opening == openingFamily(opening);
}


function getOpeningStep(context: MoveContext): OpeningStep {
    const current = context.opening;
    const previous = context.previousOpening;

    /*
     * Some theoretical nodes do not carry a fresh opening label. In that
     * situation we still explain the move, but never repeat the last name.
     */
    if (!current) return "familiar";
    if (!previous) return "identified";
    if (current == previous) return "settled";

    const currentFamily = openingFamily(current);
    const previousFamily = openingFamily(previous);

    if (currentFamily == previousFamily) {
        const currentIsFamily = isFamilyName(current);
        const previousIsFamily = isFamilyName(previous);

        if (currentIsFamily && !previousIsFamily) {
            return "returned";
        }

        if (!currentIsFamily && previousIsFamily) {
            return "refined";
        }

        /*
         * Opening databases often extend a name with a comma as the line
         * becomes more specific. That is a refinement, not a transposition.
         * A switch between two sibling variations of the same family is a
         * genuine move-order change and should be announced once.
         */
        if (current.startsWith(`${previous},`)) {
            return "refined";
        }

        if (previous.startsWith(`${current},`)) {
            return "returned";
        }

        return "transposed";
    }

    if (context.ply <= 4 || isBroadOpening(previous)) {
        return "entered";
    }

    return "transposed";
}


function describeOpeningMove(context: MoveContext): string {
    const move = context.playedSan || "This move";
    const feature = describeMoveFeature(context.playedMove);

    if (!feature) return move;

    return `${move} ${feature}`;
}


function quietOpeningAnnouncement(
    context: MoveContext,
    coachId: CoachId,
    step: "settled" | "familiar"
): string {
    const templates: Record<CoachId, Record<typeof step, string[]>> = {
        fog: {
            settled: [
                "This keeps padding along the established line",
                "The familiar trail continues without changing variation",
                "This is still known territory"
            ],
            familiar: [
                "This is still a known theoretical move",
                "The trail remains familiar, with no new variation to announce",
                "We are still inside established theory"
            ]
        },
        foxy: {
            settled: [
                "This follows the established line",
                "The move order stays on its current route",
                "No new variation is revealed yet"
            ],
            familiar: [
                "This remains a known theoretical move",
                "The position stays on familiar ground",
                "The route is still theoretical, but no new branch appears"
            ]
        },
        cybe: {
            settled: [
                "Current opening branch remains unchanged",
                "Known sequence confirmed; no branch update",
                "Opening state stable"
            ],
            familiar: [
                "Known theoretical move confirmed",
                "Theory status retained; no new branch identified",
                "Opening sequence remains recognised"
            ]
        },
        max_rooks: {
            settled: [
                "This follows the established line",
                "The current variation continues",
                "We remain on the same theoretical path"
            ],
            familiar: [
                "This is still a recognised theoretical move",
                "We remain in familiar theory, without a new variation",
                "The move is known, but the opening name does not change"
            ]
        }
    };

    return pickStable(
        context,
        `opening-${coachId}-${step}`,
        templates[coachId][step]
    );
}


function openingAnnouncement(
    context: MoveContext,
    coachId: CoachId,
    step: OpeningStep
): string {
    if (step == "settled" || step == "familiar") {
        return quietOpeningAnnouncement(context, coachId, step);
    }

    const opening = context.opening;

    if (!opening) {
        return quietOpeningAnnouncement(context, coachId, "familiar");
    }

    const templates: Record<
        CoachId,
        Record<Exclude<OpeningStep, "settled" | "familiar">, string[]>
    > = {
        fog: {
            identified: [
                `The trail leads into the ${opening}`,
                `This position has the scent of the ${opening}`,
                `We have padded into the ${opening}`
            ],
            refined: [
                `The trail narrows into the ${opening}`,
                `A more specific branch appears: the ${opening}`,
                `We have reached the ${opening}`
            ],
            entered: [
                `This steers the game into the ${opening}`,
                `The position now takes the shape of the ${opening}`,
                `We have entered the ${opening}`
            ],
            returned: [
                `The trail returns to the ${opening} main line`,
                `We are back on the ${opening} route`,
                `The move order has returned to the ${opening}`
            ],
            transposed: [
                `The move order has transposed into the ${opening}`,
                `A different trail has led us into the ${opening}`,
                `The position has quietly become the ${opening}`
            ]
        },
        foxy: {
            identified: [
                `This steers us into the ${opening}`,
                `A familiar route leads to the ${opening}`,
                `The position now reveals the ${opening}`
            ],
            refined: [
                `The line sharpens into the ${opening}`,
                `A more specific route reveals the ${opening}`,
                `The move order now points to the ${opening}`
            ],
            entered: [
                `This guides the game into the ${opening}`,
                `The position now becomes the ${opening}`,
                `This is the route into the ${opening}`
            ],
            returned: [
                `The route circles back to the ${opening} main line`,
                `The position returns to the ${opening}`,
                `We are back on the ${opening} path`
            ],
            transposed: [
                `A clever move order transposes into the ${opening}`,
                `The position has slipped into the ${opening}`,
                `This reaches the ${opening} from another route`
            ]
        },
        cybe: {
            identified: [
                `Opening pattern identified: ${opening}`,
                `The current sequence resolves to the ${opening}`,
                `Opening map updated: ${opening}`
            ],
            refined: [
                `Variation identified: ${opening}`,
                `The sequence has refined into the ${opening}`,
                `Opening branch updated to the ${opening}`
            ],
            entered: [
                `The sequence now enters the ${opening}`,
                `Opening transition confirmed: ${opening}`,
                `The position now matches the ${opening}`
            ],
            returned: [
                `Main-line return confirmed: ${opening}`,
                `Opening map restored to the ${opening}`,
                `Sequence returned to the ${opening}`
            ],
            transposed: [
                `Move-order shift detected: ${opening}`,
                `The position has transposed into the ${opening}`,
                `Transposition confirmed: ${opening}`
            ]
        },
        max_rooks: {
            identified: [
                `This establishes the ${opening}`,
                `We have entered the ${opening}`,
                `This is the ${opening}`
            ],
            refined: [
                `The line is now the ${opening}`,
                `This develops into the ${opening}`,
                `We have reached the ${opening}`
            ],
            entered: [
                `This brings us into the ${opening}`,
                `The position now becomes the ${opening}`,
                `This is a standard route into the ${opening}`
            ],
            returned: [
                `The move order returns to the ${opening} main line`,
                `We are back in the ${opening}`,
                `The position has returned to the ${opening}`
            ],
            transposed: [
                `A useful move-order point: this transposes into the ${opening}`,
                `The position has transposed into the ${opening}`,
                `This reaches the ${opening} through a different move order`
            ]
        }
    };

    return pickStable(
        context,
        `opening-${coachId}-${step}`,
        templates[coachId][step]
    );
}


function getOpeningCue(
    context: MoveContext,
    coachId: CoachId,
    step: OpeningStep
): string {
    const cues: Record<CoachId, string[]> = {
        fog: [
            "Mrrp...",
            "Prrr...",
            "Sniff, sniff...",
            "Meow."
        ],
        foxy: [
            "Heh...",
            "Yip.",
            "Sniff, sniff...",
            "Tch."
        ],
        cybe: step == "transposed"
            ? [
                "BEEP.",
                "ROUTE RECALCULATED.",
                "MOVE-ORDER SHIFT."
            ]
            : [
                "BEEP.",
                "PATTERN LOCKED.",
                "SEQUENCE CONFIRMED."
            ],
        max_rooks: [
            "Hm.",
            "Indeed.",
            "Quite.",
            "Ahem."
        ]
    };

    const showCue = (
        hashText(`${context.seed}|${coachId}|opening-cue`) % 100
    ) < 42;

    if (!showCue) return "";

    return pickStable(
        context,
        `opening-cue-${coachId}-${step}`,
        cues[coachId]
    );
}


function fitOpeningComment(
    context: MoveContext,
    coachId: CoachId,
    step: OpeningStep
): string {
    const moveLead = sentence(describeOpeningMove(context));
    const announcement = sentence(
        openingAnnouncement(context, coachId, step)
    );
    const cue = getOpeningCue(context, coachId, step);

    const full = [cue, moveLead, announcement]
        .filter(Boolean)
        .join(" ");

    if (full.length <= COMMENT_LIMIT) {
        return full;
    }

    const withoutCue = `${moveLead} ${announcement}`;

    if (withoutCue.length <= COMMENT_LIMIT) {
        return withoutCue;
    }

    const conciseMove = sentence(context.playedSan || "This move");
    const concise = `${conciseMove} ${announcement}`;

    if (concise.length <= COMMENT_LIMIT) {
        return concise;
    }

    /*
     * Never truncate an opening or variation name. Long official names are
     * more valuable than forcing the bubble under the soft character limit.
     */
    return announcement;
}


function generateTheory(
    context: MoveContext,
    coachId: CoachId
): string {
    return fitOpeningComment(
        context,
        coachId,
        getOpeningStep(context)
    );
}


function getTranslatedDynamicCoachComment(
    context: MoveContext,
    classification: Classification | undefined,
    t: TFunction
): string {
    if (!context.playedSan) {
        return t("dynamic.start");
    }

    if (!classification) {
        return t("dynamic.reviewing", {
            move: context.playedSan
        });
    }

    const classificationKey = classification == Classification.THEORY
        ? context.opening
            ? "dynamic.classifications.theory"
            : "dynamic.classifications.theoryUnknown"
        : `dynamic.classifications.${classification}`;

    const primary = t(classificationKey, {
        move: context.playedSan,
        opening: context.opening || ""
    });

    const negativeClassifications = new Set<Classification>([
        Classification.INACCURACY,
        Classification.MISTAKE,
        Classification.MISS,
        Classification.BLUNDER,
        Classification.RISKY
    ]);

    if (!negativeClassifications.has(classification)) {
        return fitComment(primary);
    }

    if (context.mateAllowed != undefined) {
        return fitComment(
            primary,
            t("dynamic.mateAllowed", {
                mate: context.mateAllowed
            })
        );
    }

    if (
        context.bestSan
        && context.bestSan != context.playedSan
    ) {
        return fitComment(
            primary,
            t("dynamic.betterMove", {
                best: context.bestSan
            })
        );
    }

    if (
        context.evaluationLoss != undefined
        && context.evaluationLoss >= 0.75
    ) {
        return fitComment(
            primary,
            t("dynamic.evaluationLoss", {
                loss: context.evaluationLoss.toFixed(1)
            })
        );
    }

    return fitComment(primary);
}


export function getDynamicCoachComment(
    node: StateTreeNode,
    classification: Classification | undefined,
    coachId: CoachId = "max_rooks",
    t?: TFunction
): string {
    const context = createContext(node);

    if (t) {
        return getTranslatedDynamicCoachComment(
            context,
            classification,
            t
        );
    }

    if (!context.playedSan) {
        return "Let's start from the beginning. Select a move below or use the controls.";
    }

    if (!classification) {
        return `Reviewing ${context.playedSan}...`;
    }

    switch (classification) {
        case Classification.BRILLIANT:
            return generateBrilliant(context);

        case Classification.CRITICAL:
            return generateCritical(context);

        case Classification.BEST:
            return generateBest(context);

        case Classification.EXCELLENT:
            return generateExcellent(context);

        case Classification.OKAY:
            return generateOkay(context);

        case Classification.INACCURACY:
            return generateInaccuracy(context);

        case Classification.MISTAKE:
            return generateMistake(context, false);

        case Classification.MISS:
            return generateMiss(context);

        case Classification.BLUNDER:
            return generateMistake(context, true);

        case Classification.FORCED:
            return fitComment(
                `${context.playedSan} is forced; the alternatives do not keep the position together`
            );

        case Classification.THEORY:
            return generateTheory(context, coachId);

        case Classification.RISKY:
            return generateRisky(context);

        default:
            return fitComment(`${context.playedSan} has been reviewed`);
    }
}
