import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import EngineVersion from "shared/constants/EngineVersion";
import PieceColour from "shared/constants/PieceColour";
import Evaluation from "shared/types/game/position/Evaluation";

import useSettingsStore from "@/stores/SettingsStore";
import { createCustomPieces } from "@/lib/chessAppearance";
import EvaluationBar from "@analysis/components/EvaluationBar";
import Engine from "@analysis/lib/engine";

import {
    OpenTarget,
    Repertoire,
    RepertoireNode,
    RepertoireSide,
    RepertoireStore,
    countMoves,
    createRepertoire,
    deleteRepertoireFromStore,
    descendants,
    newId,
    now,
    pathToNode,
    positionKey
} from "./repertoireStore";
import * as styles from "./index.module.css";

type Filter = "all" | RepertoireSide;

interface PersonalRepertoirePanelProps {
    store: RepertoireStore;
    setStore: React.Dispatch<React.SetStateAction<RepertoireStore>>;
    target: OpenTarget | null;
    onOpen: (target: OpenTarget) => void;
    onClose: () => void;
    saved: boolean;
}

function getBoardSquareStyles(
    fen: string,
    selectedSquare: Square | undefined,
    legalMoveHints: boolean
): NonNullable<React.ComponentProps<typeof Chessboard>["customSquareStyles"]> {
    const result: NonNullable<
        React.ComponentProps<typeof Chessboard>["customSquareStyles"]
    > = {};

    if (!selectedSquare) return result;

    result[selectedSquare] = {
        boxShadow: "inset 0 0 0 4px rgba(96, 151, 255, 0.92)"
    };

    if (!legalMoveHints) return result;

    const board = new Chess(fen);
    board.moves({ square: selectedSquare, verbose: true }).forEach(move => {
        result[move.to] = board.get(move.to)
            ? { boxShadow: "inset 0 0 0 5px rgba(18, 24, 34, 0.34)" }
            : {
                backgroundImage:
                    "radial-gradient(circle, rgba(18, 24, 34, 0.42) 0 16%, transparent 17%)"
            };
    });

    return result;
}

function PersonalRepertoirePanel({
    store,
    setStore,
    target,
    onOpen,
    onClose,
    saved
}: PersonalRepertoirePanelProps) {
    const { t } = useTranslation("repertoire");
    const settings = useSettingsStore(state => state.settings);
    const customPieces = useMemo(
        () => createCustomPieces(settings.themes.piece),
        [settings.themes.piece]
    );

    const [filter, setFilter] = useState<Filter>("all");
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState("");
    const [side, setSide] = useState<RepertoireSide>("white");
    const [flipped, setFlipped] = useState(false);
    const [selectedSquare, setSelectedSquare] = useState<Square>();
    const [boardEvaluation, setBoardEvaluation] = useState<Evaluation>({
        type: "centipawn",
        value: 0
    });

    const evaluationCacheRef = useRef(new Map<string, Evaluation>());
    const evaluationRequestRef = useRef(0);

    const activeRepertoire = target
        ? store.repertoires[target.repertoireId]
        : undefined;
    const fallbackNodeId = activeRepertoire
        ? activeRepertoire.baseNodeId && store.nodes[activeRepertoire.baseNodeId]
            ? activeRepertoire.baseNodeId
            : activeRepertoire.rootNodeId
        : undefined;
    const currentNodeId = target?.nodeId || fallbackNodeId;
    const currentNode = currentNodeId ? store.nodes[currentNodeId] : undefined;
    const currentPath = currentNodeId ? pathToNode(store, currentNodeId) : [];
    const movePath = currentPath.filter(node => node.moveSan);
    const baseNodeId = activeRepertoire
        ? activeRepertoire.baseNodeId && store.nodes[activeRepertoire.baseNodeId]
            ? activeRepertoire.baseNodeId
            : activeRepertoire.rootNodeId
        : undefined;
    const basePath = baseNodeId
        ? pathToNode(store, baseNodeId).filter(node => node.moveSan)
        : [];

    const visibleRepertoires = useMemo(() => Object.values(store.repertoires)
        .filter(item => filter == "all" || item.side == filter)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [store, filter]);

    useEffect(() => {
        if (!currentNode) return;

        const currentFen = currentNode.fen;
        const requestId = ++evaluationRequestRef.current;
        const cached = evaluationCacheRef.current.get(currentFen);
        setBoardEvaluation(cached
            ? { ...cached }
            : { type: "centipawn", value: 0 });

        if (!settings.analysis.engine.enabled) return;

        const engine = new Engine(EngineVersion.STOCKFISH_17_LITE);
        let cancelled = false;

        function updateEvaluation(evaluation: Evaluation) {
            if (cancelled || requestId != evaluationRequestRef.current) return;
            evaluationCacheRef.current.set(currentFen, evaluation);
            setBoardEvaluation({ ...evaluation });
        }

        engine
            .setThreadCount(1)
            .setLineCount(1)
            .setPosition(currentFen);

        void engine.evaluate({
            depth: 16,
            timeLimit: 1200,
            onEngineLine: line => {
                if (line.index == 1 && line.depth >= 1) {
                    updateEvaluation(line.evaluation);
                }
            }
        }).then(lines => {
            const finalLine = lines.filter(line => line.index == 1).at(-1);
            if (finalLine) updateEvaluation(finalLine.evaluation);
        }).catch(() => undefined).finally(() => engine.terminate());

        return () => {
            cancelled = true;
            evaluationRequestRef.current++;
            engine.terminate();
        };
    }, [currentNode?.fen, settings.analysis.engine.enabled]);

    function scrollTop() {
        requestAnimationFrame(() => window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        }));
    }

    function openRepertoire(repertoire: Repertoire, nodeId?: string) {
        const start = nodeId
            || (repertoire.baseNodeId && store.nodes[repertoire.baseNodeId]
                ? repertoire.baseNodeId
                : repertoire.rootNodeId);
        setFlipped(false);
        setSelectedSquare(undefined);
        onOpen({ repertoireId: repertoire.id, nodeId: start });
        scrollTop();
    }

    function closeEditor() {
        setSelectedSquare(undefined);
        onClose();
        scrollTop();
    }

    function goToNode(nodeId: string) {
        if (!activeRepertoire || !store.nodes[nodeId]) return;
        setSelectedSquare(undefined);
        onOpen({ repertoireId: activeRepertoire.id, nodeId });
    }

    function createNewRepertoire(event: React.FormEvent) {
        event.preventDefault();
        const cleanName = name.trim();
        if (!cleanName) return;
        const created = createRepertoire(store, cleanName, side);
        setStore(created.store);
        setName("");
        setCreating(false);
        setFlipped(false);
        onOpen({
            repertoireId: created.repertoire.id,
            nodeId: created.repertoire.rootNodeId
        });
        scrollTop();
    }

    function removeRepertoire(repertoire: Repertoire) {
        if (!window.confirm(t("library.deleteConfirm", { name: repertoire.name }))) return;
        setStore(previous => deleteRepertoireFromStore(previous, repertoire));
    }

    function playMove(from: string, to: string) {
        if (!activeRepertoire || !currentNode) return false;
        const game = new Chess(currentNode.fen);
        let move;
        try {
            move = game.move({ from, to, promotion: "q" });
        } catch {
            return false;
        }
        if (!move) return false;

        const uci = `${move.from}${move.to}${move.promotion || ""}`;
        const existing = currentNode.childIds
            .map(id => store.nodes[id])
            .find(node => node?.moveUci == uci);
        if (existing) {
            goToNode(existing.id);
            return true;
        }

        const timestamp = now();
        const childId = newId();
        const child: RepertoireNode = {
            id: childId,
            repertoireId: activeRepertoire.id,
            parentId: currentNode.id,
            childIds: [],
            fen: game.fen(),
            positionKey: positionKey(game.fen()),
            moveUci: uci,
            moveSan: move.san,
            ply: currentNode.ply + 1,
            notes: "",
            preferredChildId: null,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        setStore(previous => ({
            version: 1,
            repertoires: {
                ...previous.repertoires,
                [activeRepertoire.id]: {
                    ...previous.repertoires[activeRepertoire.id],
                    updatedAt: timestamp
                }
            },
            nodes: {
                ...previous.nodes,
                [currentNode.id]: {
                    ...previous.nodes[currentNode.id],
                    childIds: [...previous.nodes[currentNode.id].childIds, childId],
                    preferredChildId:
                        previous.nodes[currentNode.id].preferredChildId || childId,
                    updatedAt: timestamp
                },
                [childId]: child
            }
        }));
        setSelectedSquare(undefined);
        onOpen({ repertoireId: activeRepertoire.id, nodeId: childId });
        return true;
    }

    function onSquareClick(squareName: string) {
        if (!currentNode) return;
        const square = squareName as Square;
        const game = new Chess(currentNode.fen);

        if (!selectedSquare) {
            const piece = game.get(square);
            if (piece && piece.color == game.turn()) setSelectedSquare(square);
            return;
        }
        if (selectedSquare == square) {
            setSelectedSquare(undefined);
            return;
        }
        if (!playMove(selectedSquare, square)) {
            const piece = game.get(square);
            setSelectedSquare(piece && piece.color == game.turn() ? square : undefined);
        }
    }

    function goBack() {
        if (currentNode?.parentId) goToNode(currentNode.parentId);
    }

    function goForward() {
        if (!currentNode || currentNode.childIds.length == 0) return;
        const nextId = currentNode.preferredChildId
            || (currentNode.childIds.length == 1 ? currentNode.childIds[0] : null);
        if (nextId) goToNode(nextId);
    }

    function goStart() {
        if (activeRepertoire) goToNode(activeRepertoire.rootNodeId);
    }

    function goBase() {
        if (baseNodeId) goToNode(baseNodeId);
    }

    function setCurrentAsBase() {
        if (!activeRepertoire || !currentNode) return;
        const timestamp = now();
        setStore(previous => ({
            ...previous,
            repertoires: {
                ...previous.repertoires,
                [activeRepertoire.id]: {
                    ...previous.repertoires[activeRepertoire.id],
                    baseNodeId: currentNode.id,
                    updatedAt: timestamp
                }
            }
        }));
    }

    function setPreferred(childId: string) {
        if (!currentNode || !activeRepertoire) return;
        const timestamp = now();
        setStore(previous => ({
            ...previous,
            repertoires: {
                ...previous.repertoires,
                [activeRepertoire.id]: {
                    ...previous.repertoires[activeRepertoire.id],
                    updatedAt: timestamp
                }
            },
            nodes: {
                ...previous.nodes,
                [currentNode.id]: {
                    ...previous.nodes[currentNode.id],
                    preferredChildId: childId,
                    updatedAt: timestamp
                }
            }
        }));
    }

    function updateNotes(notes: string) {
        if (!currentNode || !activeRepertoire) return;
        const timestamp = now();
        setStore(previous => ({
            ...previous,
            repertoires: {
                ...previous.repertoires,
                [activeRepertoire.id]: {
                    ...previous.repertoires[activeRepertoire.id],
                    updatedAt: timestamp
                }
            },
            nodes: {
                ...previous.nodes,
                [currentNode.id]: {
                    ...previous.nodes[currentNode.id],
                    notes,
                    updatedAt: timestamp
                }
            }
        }));
    }

    function deleteCurrentBranch() {
        if (!currentNode?.parentId || !activeRepertoire) return;
        if (!window.confirm(t("editor.deleteBranchConfirm"))) return;
        const parent = store.nodes[currentNode.parentId];
        if (!parent) return;
        const doomed = descendants(store, currentNode.id);
        const timestamp = now();

        setStore(previous => {
            const nextNodes = { ...previous.nodes };
            for (const id of doomed) delete nextNodes[id];
            nextNodes[parent.id] = {
                ...nextNodes[parent.id],
                childIds: parent.childIds.filter(id => id != currentNode.id),
                preferredChildId: parent.preferredChildId == currentNode.id
                    ? parent.childIds.find(id => id != currentNode.id) || null
                    : parent.preferredChildId,
                updatedAt: timestamp
            };
            const previousRepertoire = previous.repertoires[activeRepertoire.id];
            return {
                ...previous,
                repertoires: {
                    ...previous.repertoires,
                    [activeRepertoire.id]: {
                        ...previousRepertoire,
                        baseNodeId: previousRepertoire.baseNodeId
                            && doomed.includes(previousRepertoire.baseNodeId)
                            ? parent.id
                            : previousRepertoire.baseNodeId,
                        updatedAt: timestamp
                    }
                },
                nodes: nextNodes
            };
        });
        setSelectedSquare(undefined);
        onOpen({ repertoireId: activeRepertoire.id, nodeId: parent.id });
    }

    if (!activeRepertoire || !currentNode) {
        return <section className={styles.library}>
            <section className={styles.libraryHeader}>
                <div>
                    <h2>{t("library.title")}</h2>
                    <p>{t("library.subtitle")}</p>
                </div>
                <button className={styles.primaryButton} type="button" onClick={() => setCreating(true)}>
                    {t("library.create")}
                </button>
            </section>

            <div className={styles.filters} role="group" aria-label={t("library.filterLabel")}>
                {(["all", "white", "black"] as Filter[]).map(item => <button
                    key={item}
                    type="button"
                    className={filter == item ? styles.filterActive : styles.filterButton}
                    onClick={() => setFilter(item)}
                >{t(`library.filters.${item}`)}</button>)}
            </div>

            {creating && <form className={styles.createPanel} onSubmit={createNewRepertoire}>
                <div className={styles.createIntro}>
                    <strong>{t("create.title")}</strong>
                    <span>{t("create.help")}</span>
                </div>
                <label>
                    <span>{t("create.name")}</span>
                    <input autoFocus value={name} onChange={event => setName(event.target.value)} placeholder={t("create.placeholder")} maxLength={80}/>
                </label>
                <fieldset>
                    <legend>{t("create.side")}</legend>
                    <div className={styles.sideChoices}>
                        {(["white", "black"] as RepertoireSide[]).map(item => <button
                            key={item}
                            type="button"
                            className={side == item ? styles.sideActive : styles.sideButton}
                            onClick={() => setSide(item)}
                        >
                            <span className={item == "white" ? styles.whiteDisc : styles.blackDisc}/>
                            <span><strong>{t(`create.${item}.title`)}</strong><small>{t(`create.${item}.help`)}</small></span>
                        </button>)}
                    </div>
                </fieldset>
                <div className={styles.formActions}>
                    <button type="button" className={styles.secondaryButton} onClick={() => setCreating(false)}>{t("actions.cancel")}</button>
                    <button type="submit" className={styles.primaryButton} disabled={!name.trim()}>{t("create.submit")}</button>
                </div>
            </form>}

            {visibleRepertoires.length == 0 ? <section className={styles.emptyState}>
                <div className={styles.emptyIcon}>♟</div>
                <h3>{t(Object.keys(store.repertoires).length ? "library.noFilterTitle" : "library.emptyTitle")}</h3>
                <p>{t(Object.keys(store.repertoires).length ? "library.noFilterBody" : "library.emptyBody")}</p>
                {!creating && Object.keys(store.repertoires).length == 0 && <button className={styles.primaryButton} type="button" onClick={() => setCreating(true)}>{t("library.createFirst")}</button>}
            </section> : <div className={styles.cardGrid}>
                {visibleRepertoires.map(repertoire => <article className={styles.card} key={repertoire.id}>
                    <div className={styles.cardTop}>
                        <span className={`${styles.sideBadge} ${repertoire.side == "white" ? styles.whiteSide : styles.blackSide}`}>
                            {t(`side.${repertoire.side}`)}
                        </span>
                        <button className={styles.iconButton} type="button" onClick={() => removeRepertoire(repertoire)} aria-label={t("library.delete")}>×</button>
                    </div>
                    <h3>{repertoire.name}</h3>
                    <p>{t("library.movesSaved", { count: countMoves(store, repertoire) })}</p>
                    <div className={styles.cardFooter}>
                        <span>{t("library.local")}</span>
                        <button className={styles.openButton} type="button" onClick={() => openRepertoire(repertoire)}>{t("library.open")}</button>
                    </div>
                </article>)}
            </div>}
        </section>;
    }

    const children = currentNode.childIds
        .map(id => store.nodes[id])
        .filter((node): node is RepertoireNode => Boolean(node));
    const orientation = flipped
        ? (activeRepertoire.side == "white" ? "black" : "white")
        : activeRepertoire.side;
    const moveNumber = Math.floor(currentNode.ply / 2) + 1;
    const turnColour = new Chess(currentNode.fen).turn();
    const turnText = turnColour == "w" ? t("side.white") : t("side.black");
    const moveColour = turnColour == "w" ? PieceColour.WHITE : PieceColour.BLACK;
    const boardStyle = {
        borderRadius: "8px",
        boxShadow: "0 18px 45px rgba(0, 0, 0, 0.24)"
    };
    const squareStyles = getBoardSquareStyles(
        currentNode.fen,
        selectedSquare,
        settings.themes.board.legalMoveHints
    );

    return <section className={styles.editor}>
        <header className={styles.editorHeader}>
            <div className={styles.editorIdentity}>
                <button type="button" className={styles.backLibrary} onClick={closeEditor}>← {t("editor.backLibrary")}</button>
                <div>
                    <div className={styles.titleLine}>
                        <h1>{activeRepertoire.name}</h1>
                        <span className={`${styles.sideBadge} ${activeRepertoire.side == "white" ? styles.whiteSide : styles.blackSide}`}>{t(`side.${activeRepertoire.side}`)}</span>
                    </div>
                    <p>{activeRepertoire.side == "white" ? t("editor.whitePurpose") : t("editor.blackPurpose")}</p>
                </div>
            </div>
            <span className={saved ? styles.saved : styles.saving}>{saved ? t("editor.saved") : t("editor.saving")}</span>
        </header>

        <section className={styles.guideStrip} aria-label={t("guide.title")}>
            <strong>{t("guide.title")}</strong>
            <ol>
                <li><span>1</span>{t("guide.play")}</li>
                <li><span>2</span>{t("guide.back")}</li>
                <li><span>3</span>{t("guide.branch")}</li>
                <li><span>4</span>{t("guide.notes")}</li>
            </ol>
        </section>

        <div className={styles.editorGrid}>
            <aside className={styles.linePanel}>
                <div className={styles.panelHeading}>
                    <div><span>{t("editor.currentLine")}</span><strong>{movePath.length ? movePath.map(node => node.moveSan).join(" ") : t("editor.startPosition")}</strong></div>
                </div>

                <div className={styles.moveTrail}>
                    <button type="button" className={currentNode.id == activeRepertoire.rootNodeId ? styles.trailActive : styles.trailButton} onClick={goStart}>{t("editor.start")}</button>
                    {movePath.map((node, index) => <button
                        type="button"
                        key={node.id}
                        className={node.id == currentNode.id ? styles.trailActive : styles.trailButton}
                        onClick={() => goToNode(node.id)}
                    >
                        <span>{index % 2 == 0 ? `${Math.floor(index / 2) + 1}.` : "…"}</span>{node.moveSan}
                    </button>)}
                </div>

                <section className={styles.baseCard}>
                    <div>
                        <strong>{t("editor.baseTitle")}</strong>
                        <p>{t("editor.baseHelp")}</p>
                        <span className={styles.baseLine}>{basePath.length ? basePath.map(node => node.moveSan).join(" ") : t("editor.startPosition")}</span>
                    </div>
                    <div className={styles.baseActions}>
                        {currentNode.id == baseNodeId
                            ? <span className={styles.baseCurrent}>✓ {t("editor.baseCurrent")}</span>
                            : <>
                                <button type="button" onClick={setCurrentAsBase}>{t("editor.setBase")}</button>
                                <button type="button" onClick={goBase}>{t("editor.goBase")}</button>
                            </>}
                    </div>
                </section>

                <div className={styles.continuationsHeader}>
                    <div><strong>{t("editor.continuations")}</strong><span>{t("editor.continuationsHelp")}</span></div>
                    <span className={styles.countBadge}>{children.length}</span>
                </div>
                {children.length == 0 ? <div className={styles.noContinuations}>
                    <strong>{t("editor.noContinuationsTitle")}</strong>
                    <p>{t("editor.noContinuationsBody")}</p>
                </div> : <div className={styles.continuationList}>
                    {children.map(child => <div className={styles.continuation} key={child.id}>
                        <button type="button" className={styles.continuationMove} onClick={() => goToNode(child.id)}>
                            <strong>{child.moveSan}</strong>
                            <span>{currentNode.preferredChildId == child.id ? `★ ${t("editor.main")}` : t("editor.openContinuation")}</span>
                        </button>
                        {currentNode.preferredChildId != child.id && <button type="button" className={styles.starButton} onClick={() => setPreferred(child.id)} title={t("editor.makeMain")}>☆</button>}
                    </div>)}
                </div>}
            </aside>

            <section className={styles.boardColumn}>
                <div className={styles.turnHint}>
                    <span>{t("editor.position", { move: moveNumber })}</span>
                    <strong>{t("editor.toMove", { side: turnText })}</strong>
                </div>
                <div className={styles.boardStage}>
                    {settings.analysis.engine.enabled && <EvaluationBar
                        className={styles.evaluationBar}
                        evaluation={boardEvaluation}
                        moveColour={moveColour}
                        flipped={orientation == "black"}
                    />}
                    <div className={styles.boardWrap}>
                        <Chessboard
                            id="repertoire-board"
                            position={currentNode.fen}
                            boardOrientation={orientation}
                            onPieceDrop={(source, destination) => playMove(source, destination)}
                            onPieceDragBegin={(_piece, source) => setSelectedSquare(source as Square)}
                            onPieceDragEnd={() => setSelectedSquare(undefined)}
                            onSquareClick={onSquareClick}
                            customBoardStyle={boardStyle}
                            customDarkSquareStyle={{ backgroundColor: settings.themes.board.darkSquareColour }}
                            customLightSquareStyle={{ backgroundColor: settings.themes.board.lightSquareColour }}
                            customSquareStyles={squareStyles}
                            customPieces={customPieces}
                            showBoardNotation={settings.themes.board.coordinates == "inside"}
                            snapToCursor
                            arePiecesDraggable
                        />
                    </div>
                </div>
                <div className={styles.boardControls}>
                    <button type="button" onClick={goStart} disabled={currentNode.id == activeRepertoire.rootNodeId}>|← <span>{t("editor.start")}</span></button>
                    <button type="button" onClick={goBack} disabled={!currentNode.parentId}>← <span>{t("editor.previous")}</span></button>
                    <button type="button" onClick={goForward} disabled={children.length == 0 || (children.length > 1 && !currentNode.preferredChildId)}><span>{t("editor.next")}</span> →</button>
                    <button type="button" onClick={() => setFlipped(value => !value)}>↻ <span>{t("editor.flip")}</span></button>
                </div>
                <p className={styles.boardTip}>{activeRepertoire.side == "black" && currentNode.ply == 0 ? t("editor.blackFirstHint") : t("editor.moveHint")}</p>
            </section>

            <aside className={styles.notesPanel}>
                <div className={styles.notesHeading}>
                    <span>{t("editor.positionNotes")}</span>
                    <strong>{currentNode.moveSan || t("editor.startPosition")}</strong>
                </div>
                <p className={styles.notesHelp}>{t("editor.notesHelp")}</p>
                <textarea value={currentNode.notes} onChange={event => updateNotes(event.target.value)} placeholder={t("editor.notesPlaceholder")} maxLength={4000}/>
                <div className={styles.ideaPrompts}>
                    <span>{t("editor.noteIdeas")}</span>
                    <ul>
                        <li>{t("editor.notePlan")}</li>
                        <li>{t("editor.noteResponse")}</li>
                        <li>{t("editor.noteMistake")}</li>
                    </ul>
                </div>
                {currentNode.parentId && <button type="button" className={styles.dangerButton} onClick={deleteCurrentBranch}>{t("editor.deleteBranch")}</button>}
            </aside>
        </div>
    </section>;
}

export default PersonalRepertoirePanel;
