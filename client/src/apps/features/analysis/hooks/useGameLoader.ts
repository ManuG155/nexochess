import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { getNodeChain } from "shared/types/game/position/StateTreeNode";

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

        const requestedPly = Number.parseInt(
            searchParams.get("ply") || "",
            10
        );
        const chain = getNodeChain(game.stateTree);
        const targetNode = Number.isFinite(requestedPly)
            && requestedPly >= 0
            && requestedPly < chain.length
                ? chain[requestedPly]
                : game.stateTree;

        setGameAnalysisOpen(true);
        setAnalysisGame(game);
        setCurrentStateTreeNode(targetNode);
        setDisplayedEngineLines(
            targetNode.state.fen,
            targetNode.state.engineLines
        );
    }

    useEffect(() => {
        void loadGame();
    }, []);
}

export default useGameLoader;
