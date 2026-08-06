function freezeMetadata(metadata) {
    return Object.freeze(metadata);
}

export const INDEXABLE_PAGE_METADATA = Object.freeze({
    "/": freezeMetadata({
        title: "NexoChess — Understand Every Move",
        description: "Analyse your chess games, understand every critical move, revisit saved reviews and train with more than six million puzzles in NexoChess."
    }),
    "/about": freezeMetadata({
        title: "About NexoChess — Independent Chess Tools",
        description: "Learn why NexoChess exists, how its independent chess tools are built and which principles guide its analysis, training and open-source development."
    }),
    "/faq": freezeMetadata({
        title: "NexoChess FAQ — Accounts, Analysis and Privacy",
        description: "Find clear answers about NexoChess accounts, chess analysis, saved games, puzzles, supported languages, privacy and other common questions."
    }),
    "/analysis": freezeMetadata({
        title: "Free Chess Game Analysis with Stockfish — NexoChess",
        description: "Analyse chess games with Stockfish, review critical moments, move classifications, accuracy and estimated performance in a clear interactive board."
    }),
    "/academy": freezeMetadata({
        title: "NexoChess Academy — Learn Chess Notation",
        description: "Learn chess notation, piece movement and NexoChess move classifications through short interactive lessons designed for practical understanding."
    }),
    "/puzzles": freezeMetadata({
        title: "Chess Puzzles and Tactics Training — NexoChess",
        description: "Train chess tactics with puzzles created from your analysed games or filtered by theme and difficulty from a database of more than six million positions."
    }),
    "/help": freezeMetadata({
        title: "NexoChess Help Center — Guides and Troubleshooting",
        description: "Learn how to analyse games, use the Archive, train with puzzles, manage your account and solve common NexoChess problems with practical guides."
    }),
    "/terms": freezeMetadata({
        title: "NexoChess Terms of Service",
        description: "Read the terms that govern access to NexoChess, its chess analysis, accounts, saved games, puzzles and other available services."
    }),
    "/privacy": freezeMetadata({
        title: "NexoChess Privacy Policy",
        description: "Learn what data NexoChess processes, why it is used, how account and browser information is handled and which privacy choices are available."
    }),
    "/source": freezeMetadata({
        title: "NexoChess Source Code and Licences",
        description: "Review the NexoChess source code, open-source licences, third-party components, chess engine information and required data attributions."
    })
});

export function getIndexablePageMetadata(pathname) {
    return INDEXABLE_PAGE_METADATA[pathname] || null;
}

export function getPageMetadataReplacements(pathname) {
    const metadata = getIndexablePageMetadata(pathname);

    return metadata
        ? {
            PAGE_TITLE: metadata.title,
            PAGE_DESCRIPTION: metadata.description
        }
        : {};
}
