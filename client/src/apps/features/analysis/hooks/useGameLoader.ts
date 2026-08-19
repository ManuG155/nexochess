import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import useAnalysisGameStore from "../stores/AnalysisGameStore";
import useAnalysisBoardStore from "../stores/AnalysisBoardStore";
import useRealtimeEngineStore from "../stores/RealtimeEngineStore";

function useGameLoader() {
    const [ searchParams ] = useSearchParams();

    const { setAnalysisGame, setGameAnalysisOpen } = useAnalysisGameStore(
        useShallow(state => ({
            setAnalysisGame: state.setAnalysisGame,
            setGameAnalysisOpen: state.setGameAnalysisOpen
        }))
    );

    const setCurrentStateTreeNode = useAnalysisBoardStore(
        state => state.setCurrentStateTreeNode
    );

    const setDisplayedEngineLines = useRealtimeEngineStore(
        state => state.setDisplayedEngineLines
    );

    async function loadGame() {
        const gameId = searchParams.get("game");
        if (!gameId) return;

        const { getArchivedGame } = await import("@/lib/gameArchive");
        const { game } = await getArchivedGame(gameId);
        if (!game) return;

        setGameAnalysisOpen(true);
        setAnalysisGame(game);
        setCurrentStateTreeNode(game.stateTree);
        setDisplayedEngineLines(
            game.stateTree.state.fen,
            game.stateTree.state.engineLines
        );
    }

    useEffect(() => {
        void loadGame();
    }, []);
}

export default useGameLoader;
