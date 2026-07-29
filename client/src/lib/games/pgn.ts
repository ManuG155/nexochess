import { validateFen } from "chess.js";
import { parseGame } from "@mliebelt/pgn-parser";

import Game from "shared/types/game/Game";
import { GameResult } from "shared/constants/game/GameResult";
import { PieceColour } from "shared/constants/PieceColour";
import Variant from "shared/constants/game/Variant";
import { STARTING_FEN } from "shared/constants/utils";

function parseResultString(result: string, colour: PieceColour) {
    if (result == "1/2-1/2") return GameResult.DRAW;
    if (result == "*") return GameResult.UNKNOWN;

    const winningResult = colour == PieceColour.WHITE ? "1-0" : "0-1";

    return result == winningResult ? GameResult.WIN : GameResult.LOSE;
}


function parseRatingChange(
    headers: Record<string, string>,
    colour: "White" | "Black"
) {
    const raw = (
        headers[`${colour}RatingDiff`]
        || headers[`${colour}EloDiff`]
        || headers[`${colour}RatingChange`]
    );

    if (!raw) return undefined;

    const value = Number(raw.replace(/^\+/, ""));

    return Number.isFinite(value) ? value : undefined;
}

function parsePgnDate(headers: Record<string, string>) {
    const rawDate = headers["UTCDate"] || headers["Date"];

    if (!rawDate || !/^\d{4}\.\d{2}\.\d{2}$/.test(rawDate)) {
        return undefined;
    }

    const [year, month, day] = rawDate.split(".").map(Number);
    const rawTime = headers["UTCTime"] || headers["EndTime"] || "";
    const timeMatch = rawTime.match(/^(\d{2}):(\d{2})(?::(\d{2}))?/);

    const hour = timeMatch ? Number(timeMatch[1]) : 12;
    const minute = timeMatch ? Number(timeMatch[2]) : 0;
    const second = timeMatch?.[3] ? Number(timeMatch[3]) : 0;

    const date = new Date(Date.UTC(
        year,
        month - 1,
        day,
        hour,
        minute,
        second
    ));

    if (
        Number.isNaN(date.getTime())
        || date.getUTCFullYear() != year
        || date.getUTCMonth() != month - 1
        || date.getUTCDate() != day
    ) {
        return undefined;
    }

    return date.toISOString();
}

function getCountryHeader(
    headers: Record<string, string>,
    colour: "White" | "Black"
) {
    return (
        headers[`${colour}Country`]
        || headers[`${colour}Federation`]
        || headers[`${colour}Fed`]
    );
}

function parsePgn(pgn: string): Game {
    const sanitisedPGN = pgn.replace(/(\"])\n(\d+\.)/, "$1\n\n$2");

    const game = parseGame(sanitisedPGN);

    const headers = (game.tags ?? {}) as unknown as Record<string, string>;

    const variant = headers["Variant"] == "Chess960"
        ? Variant.CHESS960 : Variant.STANDARD;

    const initialPosition = (headers["FEN"] && validateFen(headers["FEN"]).ok)
        ? headers["FEN"] : STARTING_FEN;

    const ratings = {
        white: parseInt(headers["WhiteElo"] || ""),
        black: parseInt(headers["BlackElo"] || "")
    };

    return {
        pgn: sanitisedPGN,
        players: {
            white: {
                username: headers["White"] || "White",
                title: headers["WhiteTitle"],
                rating: isNaN(ratings.white) ? undefined : ratings.white,
                ratingChange: parseRatingChange(headers, "White"),
                image: headers["WhiteUrl"],
                country: getCountryHeader(headers, "White"),
                result: parseResultString(
                    headers["Result"],
                    PieceColour.WHITE
                )
            },
            black: {
                username: headers["Black"] || "Black",
                title: headers["BlackTitle"],
                rating: isNaN(ratings.black) ? undefined : ratings.black,
                ratingChange: parseRatingChange(headers, "Black"),
                image: headers["BlackUrl"],
                country: getCountryHeader(headers, "Black"),
                result: parseResultString(
                    headers["Result"],
                    PieceColour.BLACK
                )
            }
        },
        variant: variant,
        initialPosition: initialPosition,
        date: parsePgnDate(headers)
    };
}

export default parsePgn;
