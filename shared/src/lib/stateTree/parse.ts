import { Chess } from "chess.js";
import { ParseTree, parseGame } from "@mliebelt/pgn-parser";
import { uniqueId } from "lodash-es";

import Game from "@/types/game/Game";
import { StateTreeNode } from "@/types/game/position/StateTreeNode";
import PieceColour from "@/constants/PieceColour";

type ParsedPGNMove = ParseTree["moves"][number];


/*
 * Convierte un valor de reloj PGN a segundos.
 *
 * Formatos habituales:
 *   0:01:00
 *   0:00:59.6
 *   1:23
 */
function parseClockValue(value: string) {
    const parts = value
        .trim()
        .split(":")
        .map(Number);

    if (
        parts.length < 2
        || parts.length > 3
        || parts.some(part => Number.isNaN(part))
    ) {
        return undefined;
    }

    if (parts.length == 2) {
        const [ minutes, seconds ] = parts;
        return minutes * 60 + seconds;
    }

    const [ hours, minutes, seconds ] = parts;
    return hours * 3600 + minutes * 60 + seconds;
}


/*
 * Devuelve el tiempo base del tag TimeControl cuando es un reloj
 * convencional de partidas en vivo.
 *
 * 60      -> 60 s
 * 600+5   -> 600 s
 *
 * Formatos de correspondencia como 1/86400 se ignoran.
 */
function getInitialClockSeconds(pgn: string) {
    const timeControl = pgn.match(
        /^\s*\[TimeControl\s+"([^"]+)"\]\s*$/im
    )?.[1];

    if (!timeControl || timeControl.includes("/")) {
        return undefined;
    }

    const base = Number(
        timeControl.split("+")[0]
    );

    return Number.isFinite(base)
        ? base
        : undefined;
}


/*
 * Extrae los [%clk ...] de la línea principal conservando su índice de ply.
 *
 * No dependemos de que @mliebelt/pgn-parser exponga los comentarios en sus
 * tipos públicos. Recorremos el movetext directamente, ignorando variantes
 * entre paréntesis, comentarios normales y NAGs.
 */
function getMainlineClockAnnotations(pgn: string) {
    const movetext = pgn.replace(
        /^\s*\[[^\r\n]*\]\s*$/gm,
        ""
    );

    const clocks: Array<number | undefined> = [];

    let plyIndex = -1;
    let variationDepth = 0;
    let buffer = "";

    function flushMoveTokens() {
        const tokens = buffer
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        buffer = "";

        for (const originalToken of tokens) {
            let token = originalToken.trim();

            /*
             * Soporta tanto "1. e4" como "1.e4" y "1...e5".
             */
            token = token.replace(
                /^\d+\.(?:\.\.)?/,
                ""
            );

            if (!token) continue;

            if (
                token == "1-0"
                || token == "0-1"
                || token == "1/2-1/2"
                || token == "*"
                || /^\$\d+$/.test(token)
                || /^[!?]+$/.test(token)
            ) {
                continue;
            }

            plyIndex++;

            if (clocks.length <= plyIndex) {
                clocks.push(undefined);
            }
        }
    }

    for (let index = 0; index < movetext.length; index++) {
        const character = movetext[index];

        if (character == "(" && variationDepth == 0) {
            flushMoveTokens();
            variationDepth = 1;
            continue;
        }

        if (character == "(" && variationDepth > 0) {
            variationDepth++;
            continue;
        }

        if (character == ")" && variationDepth > 0) {
            variationDepth--;
            continue;
        }

        if (variationDepth > 0) {
            continue;
        }

        if (character == "{") {
            flushMoveTokens();

            const commentEnd = movetext.indexOf(
                "}",
                index + 1
            );

            const end = commentEnd == -1
                ? movetext.length
                : commentEnd;

            const comment = movetext.slice(
                index + 1,
                end
            );

            const clockText = comment.match(
                /\[%clk\s+([^\]]+)\]/i
            )?.[1];

            if (clockText && plyIndex >= 0) {
                const seconds = parseClockValue(
                    clockText
                );

                if (seconds != undefined) {
                    clocks[plyIndex] = seconds;
                }
            }

            index = end;
            continue;
        }

        if (character == ";") {
            flushMoveTokens();

            const lineEnd = movetext.indexOf(
                "\n",
                index + 1
            );

            index = lineEnd == -1
                ? movetext.length
                : lineEnd;

            continue;
        }

        buffer += character;
    }

    flushMoveTokens();

    return clocks;
}


function parseStateTree(game: Game) {
    const parsedPGN = parseGame(game.pgn);

    const mainlineClocks =
        getMainlineClockAnnotations(
            game.pgn
        );

    const hasClockData =
        mainlineClocks.some(
            clock => clock != undefined
        );

    const initialClockSeconds =
        hasClockData
            ? getInitialClockSeconds(game.pgn)
            : undefined;

    let mainlinePlyIndex = 0;


    function addMovesToNode(
        node: StateTreeNode,
        moves: ParsedPGNMove[],
        mainline: boolean
    ) {
        let lastNode = node;

        for (const pgnMove of moves) {
            const move = new Chess(lastNode.state.fen)
                .move(pgnMove.notation.notation);

            const clocks = lastNode.state.clocks
                ? { ...lastNode.state.clocks }
                : undefined;

            let nextClocks = clocks;

            if (mainline) {
                const moveClock =
                    mainlineClocks[
                        mainlinePlyIndex
                    ];

                mainlinePlyIndex++;

                if (moveClock != undefined) {
                    nextClocks ||= {};

                    if (move.color == "w") {
                        nextClocks.white = moveClock;
                    } else {
                        nextClocks.black = moveClock;
                    }
                }
            }

            const newNode: StateTreeNode = {
                id: uniqueId(),
                mainline: mainline,
                parent: lastNode,
                children: [],
                state: {
                    fen: move.after,
                    engineLines: [],
                    move: {
                        san: move.san,
                        uci: move.lan
                    },
                    moveColour: move.color == "w"
                        ? PieceColour.WHITE
                        : PieceColour.BLACK,
                    clocks: nextClocks
                }
            };

            lastNode.children.push(newNode);

            for (const variation of pgnMove.variations) {
                addMovesToNode(lastNode, variation, false);
            }

            lastNode = newNode;
        }
    }


    const rootClocks =
        initialClockSeconds != undefined
            ? {
                white: initialClockSeconds,
                black: initialClockSeconds
            }
            : undefined;


    const rootNode: StateTreeNode = {
        id: uniqueId(),
        mainline: true,
        children: [],
        state: {
            fen: game.initialPosition,
            engineLines: [],
            clocks: rootClocks
        }
    };

    addMovesToNode(rootNode, parsedPGN.moves, true);

    return rootNode;
}

export default parseStateTree;
