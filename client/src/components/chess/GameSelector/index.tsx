import React, {
    lazy,
    Suspense,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { useTranslation } from "react-i18next";
import { trim } from "lodash-es";

import { Game, getColourPlayed } from "shared/types/game/Game";
import PieceColour from "shared/constants/PieceColour";
import {
    GameSource,
    GameSourceData,
    GameSourceType,
    GameSelectorButton
} from "@/components/chess/GameSelector/GameSource";
import useGameSelector from "@/hooks/useGameSelector";
import useAnalysisBoardStore from "@/apps/features/analysis/stores/AnalysisBoardStore";
import Button from "@/components/common/Button";
import FileUploader from "@/components/common/FileUploader";

import GameSelectorProps from "./GameSelectorProps";
import * as styles from "./GameSelector.module.css";

import iconInterfaceSearch from "@assets/img/interface/search.svg";
import iconInterfaceUpload from "@assets/img/interface/upload.svg";
import iconInterfaceCopy from "@assets/img/interface/copy.svg";
import iconInterfaceClose from "@assets/img/interface/close.svg";

const loadGameSearchMenu = () => import("../GameSearchMenu");
const GameSearchMenu = lazy(loadGameSearchMenu);

const sourcePlaceholderKeys: Record<GameSourceType, string> = {
    PGN: "pgn",
    FEN: "fen",
    CHESS_COM: "chessCom",
    LICHESS: "lichess"
};

interface PgnPreview {
    white?: string;
    black?: string;
    result?: string;
}

function getPgnTag(pgn: string, tag: string): string | undefined {
    const match = pgn.match(
        new RegExp(`\\[${tag}\\s+"([^"]*)"\\]`, "i")
    );

    return match?.[1]?.trim() || undefined;
}

function GameSelector({
    style,
    saveLocalStorage,
    onGameSelect
}: GameSelectorProps) {
    const { t } = useTranslation("analysis");

    const {
        savedGameSource,
        setSavedGameSource,
        savedFieldInputs,
        setSavedFieldInput
    } = useGameSelector();

    const setBoardFlipped = useAnalysisBoardStore(
        state => state.setBoardFlipped
    );

    const [ gameSource, setGameSource ] = useState(
        saveLocalStorage ? savedGameSource : GameSource.PGN
    );

    const [
        fieldInputs,
        setFieldInputs
    ] = useState(saveLocalStorage ? savedFieldInputs : {});

    const currentFieldInput = useMemo(() => (
        fieldInputs[gameSource.key] || ""
    ), [gameSource.key, fieldInputs]);

    const [
        serviceGames,
        setServiceGames
    ] = useState<Record<string, Game | null>>({
        [GameSource.CHESS_COM.key]: null,
        [GameSource.LICHESS.key]: null
    });

    const [ searchMenuOpen, setSearchMenuOpen ] = useState(false);
    const [ feedbackKey, setFeedbackKey ] = useState<string>();
    const [ dragActive, setDragActive ] = useState(false);

    const dragDepth = useRef(0);

    const pgnPreview = useMemo<PgnPreview | null>(() => {
        if (gameSource.key != GameSource.PGN.key) return null;
        if (!currentFieldInput.trim()) return null;

        const preview = {
            white: getPgnTag(currentFieldInput, "White"),
            black: getPgnTag(currentFieldInput, "Black"),
            result: getPgnTag(currentFieldInput, "Result")
        };

        return preview.white || preview.black || preview.result
            ? preview
            : null;
    }, [currentFieldInput, gameSource.key]);

    const hasInput = currentFieldInput.trim().length > 0;
    const selectedServiceGame = serviceGames[gameSource.key];
    const isReady = hasInput || Boolean(selectedServiceGame);

    useEffect(() => {
        if (gameSource.selectorButton == GameSelectorButton.SEARCH_GAMES) {
            return onGameSelect?.(serviceGames[gameSource.key]);
        }

        onGameSelect?.(currentFieldInput || null);
    }, [currentFieldInput, serviceGames]);

    useEffect(() => {
        if (!feedbackKey) return;

        const timeout = window.setTimeout(
            () => setFeedbackKey(undefined),
            2600
        );

        return () => window.clearTimeout(timeout);
    }, [feedbackKey]);

    function updateFieldInput(value: string) {
        const updatedFieldInputs = {
            ...fieldInputs,
            [gameSource.key]: value
        };

        setFieldInputs(updatedFieldInputs);

        if (!saveLocalStorage) return;
        setSavedFieldInput(gameSource.key, value);
    }

    function selectGameSource(source: GameSourceData) {
        setGameSource(source);
        setFeedbackKey(undefined);
        setDragActive(false);

        if (!saveLocalStorage) return;
        setSavedGameSource(source.key);
    }

    async function openGameSearchMenu() {
        if (currentFieldInput.length == 0) return;

        // The account-game browser is only needed after an explicit search.
        // Resolve its async chunk before opening the dialog so the landing UI
        // does not pay for listings, date controls and remote fetch code.
        await loadGameSearchMenu();
        setSearchMenuOpen(true);
    }

    async function importPgnFile(file?: File) {
        if (!file || !file.name.toLowerCase().endsWith(".pgn")) {
            setFeedbackKey("gameSelector.fileError");
            return;
        }

        const pgn = await file.text();

        if (!pgn.trim()) {
            setFeedbackKey("gameSelector.fileError");
            return;
        }

        updateFieldInput(pgn);
        setFeedbackKey("gameSelector.fileSuccess");
    }

    async function pasteFromClipboard() {
        if (!navigator.clipboard?.readText) {
            setFeedbackKey("gameSelector.clipboardError");
            return;
        }

        try {
            const text = await navigator.clipboard.readText();

            if (!text.trim()) {
                setFeedbackKey("gameSelector.clipboardEmpty");
                return;
            }

            updateFieldInput(text);
            setFeedbackKey("gameSelector.clipboardSuccess");
        } catch {
            setFeedbackKey("gameSelector.clipboardError");
        }
    }

    function onDragEnter(event: React.DragEvent<HTMLDivElement>) {
        if (gameSource.key != GameSource.PGN.key) return;

        event.preventDefault();
        dragDepth.current += 1;
        setDragActive(true);
    }

    function onDragOver(event: React.DragEvent<HTMLDivElement>) {
        if (gameSource.key != GameSource.PGN.key) return;

        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    }

    function onDragLeave(event: React.DragEvent<HTMLDivElement>) {
        if (gameSource.key != GameSource.PGN.key) return;

        event.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);

        if (dragDepth.current == 0) setDragActive(false);
    }

    async function onDrop(event: React.DragEvent<HTMLDivElement>) {
        if (gameSource.key != GameSource.PGN.key) return;

        event.preventDefault();
        dragDepth.current = 0;
        setDragActive(false);

        await importPgnFile(event.dataTransfer.files.item(0) || undefined);
    }

    const inputKey = sourcePlaceholderKeys[gameSource.key];

    return <div
        className={`${styles.wrapper} ${dragActive ? styles.dragActive : ""}`}
        style={style}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
    >
        <div
            className={styles.sourceTabs}
            role="tablist"
            aria-label={t("gameSelector.sourceTabsLabel")}
        >
            {Object.values(GameSource).map(source => (
                <button
                    key={source.key}
                    type="button"
                    role="tab"
                    aria-selected={gameSource.key == source.key}
                    className={`${styles.sourceTab} ${
                        gameSource.key == source.key
                            ? styles.sourceTabActive
                            : ""
                    }`}
                    onClick={() => selectGameSource(source)}
                >
                    {source.title}
                </button>
            ))}
        </div>

        <div className={styles.editorCard}>
            <div className={styles.fieldHeader}>
                <div className={styles.fieldHeading}>
                    <span className={styles.fieldLabel}>
                        {t(`gameSelector.inputLabels.${inputKey}`)}
                    </span>

                    <span className={styles.fieldHelper}>
                        {t(`gameSelector.helperText.${inputKey}`)}
                    </span>
                </div>

                <div className={styles.fieldActions}>
                    {gameSource.key == GameSource.PGN.key && (
                        <button
                            type="button"
                            className={styles.utilityButton}
                            onClick={pasteFromClipboard}
                        >
                            <img src={iconInterfaceCopy} alt="" />
                            {t("gameSelector.pasteButton")}
                        </button>
                    )}

                    {hasInput && (
                        <button
                            type="button"
                            className={styles.utilityButton}
                            onClick={() => updateFieldInput("")}
                        >
                            <img src={iconInterfaceClose} alt="" />
                            {t("gameSelector.clearButton")}
                        </button>
                    )}
                </div>
            </div>

            <textarea
                className={`${styles.selectorField} ${
                    gameSource.expandField
                        ? styles.selectorFieldExpanded
                        : styles.selectorFieldCompact
                }`}
                placeholder={t(
                    "gameSelector.sourcePlaceholders."
                    + inputKey
                )}
                value={currentFieldInput}
                spellCheck={false}
                onChange={event => updateFieldInput(event.target.value)}
                onKeyDown={event => {
                    if (event.key != "Enter") return;
                    if (
                        gameSource.selectorButton
                        != GameSelectorButton.SEARCH_GAMES
                    ) return;

                    event.preventDefault();
                    void openGameSearchMenu();
                }}
            />

            {pgnPreview && (
                <div className={styles.gamePreview}>
                    <span className={styles.previewTitle}>
                        {t("gameSelector.preview.title")}
                    </span>

                    <div className={styles.previewPlayers}>
                        <span title={t("gameSelector.preview.white")}>
                            {pgnPreview.white || t("gameSelector.preview.unknown")}
                        </span>

                        <strong>{pgnPreview.result || "—"}</strong>

                        <span title={t("gameSelector.preview.black")}>
                            {pgnPreview.black || t("gameSelector.preview.unknown")}
                        </span>
                    </div>
                </div>
            )}

            <div className={styles.fieldFooter}>
                <span className={isReady ? styles.readyStatus : styles.emptyStatus}>
                    <span className={styles.statusDot} />
                    {t(
                        isReady
                            ? "gameSelector.ready"
                            : "gameSelector.empty"
                    )}
                </span>

                <span className={styles.characterCount}>
                    {t("gameSelector.characters", {
                        count: currentFieldInput.length
                    })}
                </span>
            </div>

            {feedbackKey && (
                <div className={styles.feedback} role="status">
                    {t(feedbackKey)}
                </div>
            )}
        </div>

        {gameSource.selectorButton == GameSelectorButton.SEARCH_GAMES && (
            <Button
                className={styles.selectorButton}
                icon={iconInterfaceSearch}
                iconSize="22px"
                disabled={!hasInput}
                onClick={() => {
                    void openGameSearchMenu();
                }}
            >
                {t("gameSelector.searchGamesButton")}
            </Button>
        )}

        {gameSource.selectorButton == GameSelectorButton.UPLOAD_FILE && (
            <FileUploader
                extensions={[".pgn"]}
                onFilesUpload={async files => {
                    await importPgnFile(files.item(0) || undefined);
                }}
            >
                <Button
                    className={styles.selectorButton}
                    icon={iconInterfaceUpload}
                    iconSize="22px"
                >
                    {t("gameSelector.uploadPGNButton")}
                </Button>
            </FileUploader>
        )}

        {gameSource.key == GameSource.PGN.key && (
            <span className={styles.dropHint}>
                {t("gameSelector.dropHint")}
            </span>
        )}

        {dragActive && (
            <div className={styles.dropOverlay}>
                <img src={iconInterfaceUpload} alt="" />
                <strong>{t("gameSelector.dropOverlay")}</strong>
            </div>
        )}
        
        {searchMenuOpen && <Suspense fallback={null}>
            <GameSearchMenu
                username={trim(currentFieldInput)}
                gameSource={gameSource}
                onClose={() => setSearchMenuOpen(false)}
                onGameSelect={game => {
                    setServiceGames({
                        ...serviceGames,
                        [gameSource.key]: game
                    });

                    const usersColour = getColourPlayed(
                        game, trim(currentFieldInput)
                    );

                    setBoardFlipped(usersColour == PieceColour.BLACK);
                }}
            />
        </Suspense>}
    </div>;
}

export default GameSelector;
