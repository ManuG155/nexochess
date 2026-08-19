import { useTranslation } from "react-i18next";

import type AnalysedGame from "shared/types/game/AnalysedGame";
import { GameSelectorButton, GameSource } from "@/components/chess/GameSelector/GameSource";
import useGameSelector from "@/hooks/useGameSelector";
import type { SelectedGame } from "@/hooks/useGameSelector";
import useAnalysisGameStore from "@analysis/stores/AnalysisGameStore";
import useAnalysisBoardStore from "@analysis/stores/AnalysisBoardStore";

const messages = {
    fetchingLatest: "gameSelector.statusMessages.fetchingLatest",
    noGameSelected: "gameSelector.errors.noGameSelected",
    invalidGame: "gameSelector.errors.invalidGame"
};

function useImportGame() {
    const { t } = useTranslation("analysis");

    const {
        selectedGame,
        savedGameSource,
        savedCurrentFieldInput
    } = useGameSelector();

    const {
        setAnalysisGame,
        setGameAnalysisOpen
    } = useAnalysisGameStore();

    const { setCurrentStateTreeNode } = useAnalysisBoardStore();

    async function convertSelectedGame(selectedGame: SelectedGame) {
        if (typeof selectedGame == "string") {
            if (selectedGame.length == 0) return null;

            try {
                if (savedGameSource.key == GameSource.PGN.key) {
                    const { default: parsePgn } = await import("@/lib/games/pgn");
                    return parsePgn(selectedGame);
                } else if (savedGameSource.key == GameSource.FEN.key) {
                    const { default: parseFenString } = await import("@/lib/games/fen");
                    return parseFenString(selectedGame);
                }
            } catch {
                throw new Error(t(messages.invalidGame));
            }
        } else {
            return selectedGame;
        }

        return null;
    }

    async function importSelectedGame(
        onStatusMessage?: (message?: string) => void
    ) {
        let importedGame = await convertSelectedGame(selectedGame);

        if (!importedGame) {
            if (
                savedGameSource.selectorButton
                != GameSelectorButton.SEARCH_GAMES
            ) throw new Error(t(messages.noGameSelected));

            onStatusMessage?.(t(messages.fetchingLatest));

            const date = new Date();

            try {
                const gamesModule = savedGameSource.key == GameSource.CHESS_COM.key
                    ? await import("@/lib/games/chessCom")
                    : await import("@/lib/games/lichess");

                var gamesResponse = await gamesModule.default(
                    savedCurrentFieldInput,
                    date.getMonth() + 1,
                    date.getFullYear()
                );
            } catch (err) {
                throw new Error(t((err as Error).message));
            } finally {
                onStatusMessage?.();
            }

            const latestGame = gamesResponse.games?.at(0);

            if (!latestGame) throw new Error(t(messages.noGameSelected));

            importedGame = latestGame;
        }

        const loadedGame = importedGame;
        const { default: parseStateTree } = await import(
            "shared/lib/stateTree/parse"
        );

        // Set analysis game to the selected one
        const analysisGame: AnalysedGame = {
            ...loadedGame,
            stateTree: parseStateTree(loadedGame)
        };

        setAnalysisGame(analysisGame);
        setCurrentStateTreeNode(analysisGame.stateTree);
        setGameAnalysisOpen(true);

        // Profile enrichment is not required to start the analysis. Keep it
        // outside the landing bundle and update the UI asynchronously if the
        // imported game came from Chess.com.
        void import("@/lib/profileImages").then(({
            getChessComProfileImages,
            isGameFromChessCom
        }) => {
            if (!isGameFromChessCom(loadedGame)) return;

            void getChessComProfileImages(loadedGame).then(profiles => {
                analysisGame.players.white.image = profiles.white.image;
                analysisGame.players.black.image = profiles.black.image;

                analysisGame.players.white.country =
                    profiles.white.country
                    || analysisGame.players.white.country;

                analysisGame.players.black.country =
                    profiles.black.country
                    || analysisGame.players.black.country;

                setAnalysisGame({
                    ...analysisGame,
                    players: {
                        white: {
                            ...analysisGame.players.white
                        },
                        black: {
                            ...analysisGame.players.black
                        }
                    }
                });
            });
        });

        return analysisGame;
    }

    return importSelectedGame;
}

export default useImportGame;
