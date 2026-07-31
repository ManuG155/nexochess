import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import { truncate, uniqueId } from "lodash-es";

import { GameResult, getOpinionatedGameResult } from "shared/constants/game/GameResult";
import TimeControl from "shared/constants/game/TimeControl";
import { formatDate } from "shared/lib/utils/date";
import GameListingMetadata from "./GameListingMetadata";
import Button from "@/components/common/Button";
import displayToast from "@/lib/toast";

import GameListingProps from "./GameListingProps";
import * as styles from "./GameListing.module.css";

import iconTimeControlsBullet from "@assets/img/timeControls/bullet.png";
import iconTimeControlsBlitz from "@assets/img/timeControls/blitz.png";
import iconTimeControlsRapid from "@assets/img/timeControls/rapid.png";
import iconTimeControlsClassical from "@assets/img/timeControls/classical.svg";
import iconTimeControlsCorrespondence from "@assets/img/timeControls/correspondence.png";
import iconGameResultsDraw from "@assets/img/gameResults/draw.png";
import iconGameResultsUnopinionatedWin from "@assets/img/gameResults/unopinionated_win.png";
import iconGameResultsUnopinionatedLose from "@assets/img/gameResults/unopinionated_lose.png";
import iconGameResultsOpinionatedWin from "@assets/img/gameResults/opinionated_win.png";
import iconGameResultsOpinionatedLose from "@assets/img/gameResults/opinionated_lose.png";
import iconGameResultsUnknown from "@assets/img/gameResults/unknown.png";
import iconInterfaceCopy from "@assets/img/interface/copy.svg";

const timeControlIcons = {
    [TimeControl.BULLET]: iconTimeControlsBullet,
    [TimeControl.BLITZ]: iconTimeControlsBlitz,
    [TimeControl.RAPID]: iconTimeControlsRapid,
    [TimeControl.CLASSICAL]: iconTimeControlsClassical,
    [TimeControl.CORRESPONDENCE]: iconTimeControlsCorrespondence
};

// Gets a game result icon from white's result
const gameResultIcons = {
    unopinionated: {
        [GameResult.WIN]: iconGameResultsUnopinionatedWin,
        [GameResult.DRAW]: iconGameResultsDraw,
        [GameResult.LOSE]: iconGameResultsUnopinionatedLose,
        [GameResult.UNKNOWN]: iconGameResultsUnknown
    },
    opinionated: {
        [GameResult.WIN]: iconGameResultsOpinionatedWin,
        [GameResult.DRAW]: iconGameResultsDraw,
        [GameResult.LOSE]: iconGameResultsOpinionatedLose,
        [GameResult.UNKNOWN]: iconGameResultsUnknown
    }
};

// Map of game results to their tooltip keys in translation file
const gameResultTooltipCodes = {
    [GameResult.WIN]: "win",
    [GameResult.DRAW]: "draw",
    [GameResult.LOSE]: "lose",
    [GameResult.UNKNOWN]: "unknown"
};

const maxProfileLength = 20;

function TimeControlGlyph({ timeControl }: { timeControl: TimeControl }) {
    const paths: Record<TimeControl, React.ReactNode> = {
        [TimeControl.BULLET]: <>
            <path d="m9 15.5 6.8-6.8a3 3 0 0 1 4.2 4.2l-6.8 6.8z" />
            <path d="m4 20 4-4M3.5 15.5l3-3M8.5 20.5l3-3" />
        </>,
        [TimeControl.BLITZ]: <>
            <path d="M14.2 2.5 5.8 13h5.7l-1.3 8.5 8-11.2h-5.7z" />
            <path d="M5 5.5h3M3.5 9h3" />
        </>,
        [TimeControl.RAPID]: <>
            <circle cx="12" cy="13" r="7.5" />
            <path d="M9 2.5h6M12 5.5v2M12 13l3.5-2.5" />
        </>,
        [TimeControl.CLASSICAL]: <>
            <path d="M7 3h10M7 21h10M8 4c0 4 2 5 4 8-2 3-4 4-4 8M16 4c0 4-2 5-4 8 2 3 4 4 4 8" />
        </>,
        [TimeControl.CORRESPONDENCE]: <>
            <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
            <path d="m5 7 7 5.5L19 7" />
        </>
    };

    return <svg
        className={styles.nexoTimeControlIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        aria-hidden="true"
    >
        {paths[timeControl]}
    </svg>;
}

function ResultGlyph({
    result,
    title
}: {
    result: GameResult;
    title: string;
}) {
    return <span
        className={`${styles.nexoResult} ${styles[`result_${result}`]}`}
        title={title}
        aria-label={title}
    >
        {result == GameResult.WIN && (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 12.5 4 4L18.5 8" />
            </svg>
        )}

        {result == GameResult.LOSE && (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7.5 7.5 9 9M16.5 7.5l-9 9" />
            </svg>
        )}

        {result == GameResult.DRAW && (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 9.5h10M7 14.5h10" />
            </svg>
        )}

        {result == GameResult.UNKNOWN && (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9.5 9a2.7 2.7 0 1 1 4.2 2.25c-1.2.78-1.7 1.25-1.7 2.25M12 17.8h.01" />
            </svg>
        )}
    </span>;
}

function GameListing<T extends GameListingMetadata>({
    className,
    style,
    game,
    perspective,
    selected,
    onClick,
    onSelect,
    visualStyle = "classic"
}: GameListingProps<T>) {
    const { t } = useTranslation("common");

    const displayResult = useMemo(() => {
        if (!game.players.white.result) return;

        return perspective
            ? getOpinionatedGameResult(
                game.players.white.result,
                perspective
            )
            : game.players.white.result;
    }, [game, perspective]);

    const listingId = useMemo(uniqueId, []);

    function copyPGN() {
        if (!game.pgn) return;

        navigator.clipboard.writeText(game.pgn);

        displayToast({
            message: t("shareGame.copyPGNToast"),
            theme: "success"
        });
    }

    return <div
        className={[
            styles.gameListing,
            onClick && styles.clickableListing,
            className
        ].join(" ")}
        style={style}
        onClick={() => onClick?.(game)}
    >
        {onSelect && <input
            className={styles.selector}
            type="checkbox"
            checked={selected}
            onChange={event => onSelect(event.target.checked, game)}
            onClick={event => event.stopPropagation()}
        />}
        
        {game.timeControl && <div
            data-game-listing-section="time-control"
            style={{ width: "30px" }}
        >
            {visualStyle == "nexo"
                ? <TimeControlGlyph timeControl={game.timeControl}/>
                : <img
                    className={styles.timeControlIcon}
                    src={timeControlIcons[game.timeControl]}
                    title={game.timeControl}
                />
            }
        </div>}

        <div
            data-game-listing-section="players"
            style={{ width: "250px" }}
        >
            {Object.entries(game.players)
                .map(([ colour, player ]) => <div
                    className={styles.playerProfile}
                    key={colour}
                >
                    {player.title && <span className={styles.playerTitle}>
                        {player.title}
                    </span>}
                    
                    <div className={styles.usersColour} style={{
                        backgroundColor: player === game.players.white
                            ? "whitesmoke" : "black"
                    }}/>

                    <span>
                        {truncate(player.username, {
                            length: maxProfileLength
                                - (player.title?.length || 0)
                        })}
                    </span>
    
                    <span style={{ color: "grey" }}>
                        ({player.rating || "?"})
                    </span>
                </div>)
            }
        </div>

        <div
            data-game-listing-section="date"
            style={{ width: "110px" }}
        >
            <span title={game.date?.toLocaleString()}>
                {game.date ? formatDate(new Date(game.date)) : t(
                    "gameListing.gameResults.opinionated.unknown"
                )}
            </span>
        </div>

        {displayResult && <div
            data-game-listing-section="result"
            style={{ width: "20px" }}
        >
            {visualStyle == "nexo"
                ? <ResultGlyph
                    result={displayResult}
                    title={t(
                        "gameListing.gameResults."
                        + (perspective ? "opinionated." : "unopinionated.")
                        + gameResultTooltipCodes[displayResult]
                    )}
                />
                : <img
                    src={perspective
                        ? gameResultIcons.opinionated[displayResult]
                        : gameResultIcons.unopinionated[displayResult]
                    }
                    title={t(
                        "gameListing.gameResults."
                        + (perspective ? "opinionated." : "unopinionated.")
                        + gameResultTooltipCodes[displayResult]
                    )}
                    style={{ width: "100%" }}
                />
            }
        </div>}

        {game.pgn && <Button
            className={styles.copyButton}
            icon={iconInterfaceCopy}
            tooltipId={`game-listing-copy-${listingId}`}
            onClick={event => {
                event.stopPropagation();
                copyPGN();
            }}
        />}

        <Tooltip
            id={`game-listing-copy-${listingId}`}
            content={t("gameListing.copyPGN")}
            delayShow={500}
        />
    </div>;
}

export default GameListing;
