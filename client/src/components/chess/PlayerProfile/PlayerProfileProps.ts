import PieceColour from "shared/constants/PieceColour";
import PlayerProfile from "shared/types/game/PlayerProfile";

interface PlayerProfileProps {
    profile: PlayerProfile;
    colour?: PieceColour;
    capturedPieces?: string[];
    materialAdvantage?: number;
    clockSeconds?: number;
    clockActive?: boolean;
}

export default PlayerProfileProps;
