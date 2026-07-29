import { Chess } from "chess.js";

import Game from "shared/types/game/Game";

import iconDefaultProfileImage from "@assets/img/defaultprofileimage.png";

export function isGameFromChessCom(game: Game) {
    const board = new Chess();
    board.loadPgn(game.pgn);

    const headers = board.getHeaders();

    return headers["Site"] == "Chess.com";
}

export interface ChessComProfileDetails {
    image: string;
    country?: string;
}

function normaliseCountry(country?: unknown) {
    if (typeof country != "string") {
        return undefined;
    }

    return country
        .trim()
        .split("/")
        .filter(Boolean)
        .at(-1)
        ?.toUpperCase();
}

export async function getChessComProfileDetails(
    username: string
): Promise<ChessComProfileDetails> {
    if (!username) {
        return {
            image: iconDefaultProfileImage
        };
    }

    try {
        const profileResponse = await fetch(
            `https://api.chess.com/pub/player/${username}`
        );

        if (!profileResponse.ok) {
            return {
                image: iconDefaultProfileImage
            };
        }

        const profile = await profileResponse.json();

        return {
            image: profile.avatar || iconDefaultProfileImage,
            country: normaliseCountry(profile.country)
        };

    } catch {
        return {
            image: iconDefaultProfileImage
        };
    }
}

export async function getChessComProfileImage(
    username: string
): Promise<string> {
    const profile = await getChessComProfileDetails(
        username
    );

    return profile.image;
}

export async function getChessComProfileImages(game: Game) {
    const board = new Chess();
    board.loadPgn(game.pgn);

    const headers = board.getHeaders();

    const [ white, black ] = await Promise.all([
        getChessComProfileDetails(headers["White"]),
        getChessComProfileDetails(headers["Black"])
    ]);

    return {
        white,
        black
    };
}
