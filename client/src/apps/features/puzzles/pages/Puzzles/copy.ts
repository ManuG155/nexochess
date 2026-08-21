import type { TFunction } from "i18next";

export interface PuzzlePageCopy {
    heroSubtitle: string;
    trainingTitle: string;
    trainingSubtitle: string;
    thematicSource: string;
    thematicContext: string;
    trainingTurn: string;
    archiveChecking: string;
    archiveNoGames: string;
    archiveNoErrors: string;
    archiveReady: string;
    trainingSetup: string;
    noGamesTitle: string;
    noGamesBody: string;
    noErrorsTitle: string;
    noErrorsBody: string;
    noMatchTitle: string;
    noMatchBody: string;
    noFilteredPuzzle: string;
    sourceGame: string;
    loadErrorTitle: string;
    loadErrorBody: string;
}

/**
 * Keep every visible Puzzles sentence inside the i18next catalogue. This is
 * deliberately a mapping rather than a second set of language dictionaries:
 * changing the selected language must update the setup, empty states and
 * coach text together.
 */
export function getPuzzlePageCopy(t: TFunction): PuzzlePageCopy {
    return {
        // Puzzles is practice-only now, so the hero must no longer advertise
        // positions derived from analysed games. Reuse the translated
        // thematic-training sentence in every supported language.
        heroSubtitle: t("sources.lichess.body"),
        trainingTitle: t("sources.lichess.title"),
        trainingSubtitle: t("sources.lichess.body"),
        thematicSource: t("puzzle.lichessSource"),
        thematicContext: t("puzzle.lichessContext"),
        trainingTurn: t("coach.lichessTurn"),
        archiveChecking: t("coach.archiveChecking"),
        archiveNoGames: t("coach.archiveNoGames"),
        archiveNoErrors: t("coach.archiveNoErrors"),
        archiveReady: t("coach.archiveReady"),
        trainingSetup: t("coach.trainingSetup"),
        noGamesTitle: t("sources.archive.emptyTitle"),
        noGamesBody: t("sources.archive.emptyBody"),
        noErrorsTitle: t("states.noErrorsTitle"),
        noErrorsBody: t("states.noErrorsBody"),
        noMatchTitle: t("states.noMatchTitle"),
        noMatchBody: t("states.noMatchBody"),
        noFilteredPuzzle: t("coach.noFiltered"),
        sourceGame: t("actions.sourceGame"),
        loadErrorTitle: t("states.errorTitle"),
        loadErrorBody: t("states.errorBody")
    };
}
