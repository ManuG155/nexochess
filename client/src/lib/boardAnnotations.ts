const BOARD_PRIMARY_INTERACTION_EVENT =
    "nexochess:board-primary-interaction";

let primaryPointerListenerInstalled = false;

function installPrimaryPointerListener() {
    if (
        primaryPointerListenerInstalled
        || typeof document == "undefined"
        || typeof window == "undefined"
    ) {
        return;
    }

    document.addEventListener(
        "pointerdown",
        event => {
            if (event.button != 0) return;

            const target = event.target;

            if (!(target instanceof Element)) return;

            /*
             * react-chessboard marks every board square with data-square.
             * Using the square ancestor means the event also fires when the
             * primary press starts directly on a piece, just like Chess.com.
             */
            if (!target.closest("[data-square]")) return;

            window.dispatchEvent(
                new Event(BOARD_PRIMARY_INTERACTION_EVENT)
            );
        },
        true
    );

    primaryPointerListenerInstalled = true;
}

export function subscribeToBoardPrimaryInteraction(
    listener: () => void
) {
    if (typeof window == "undefined") {
        return () => {};
    }

    installPrimaryPointerListener();

    window.addEventListener(
        BOARD_PRIMARY_INTERACTION_EVENT,
        listener
    );

    return () => {
        window.removeEventListener(
            BOARD_PRIMARY_INTERACTION_EVENT,
            listener
        );
    };
}
