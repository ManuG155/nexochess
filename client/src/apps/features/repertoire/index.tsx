import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { useTranslation } from "react-i18next";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

import I18nGate from "@/components/layout/I18nGate";
import PageWrapper from "@/components/layout/PageWrapper";
import useSettingsStore from "@/stores/SettingsStore";
import { removeDefaultConsentLink } from "@/lib/consent";

import "@/i18n";
import "@/index.css";
import * as styles from "./index.module.css";

type RepertoireSide = "white" | "black";
type Filter = "all" | RepertoireSide;

interface Repertoire {
    id: string;
    name: string;
    side: RepertoireSide;
    rootNodeId: string;
    createdAt: string;
    updatedAt: string;
}

interface RepertoireNode {
    id: string;
    repertoireId: string;
    parentId: string | null;
    childIds: string[];
    fen: string;
    positionKey: string;
    moveUci: string | null;
    moveSan: string | null;
    ply: number;
    notes: string;
    preferredChildId: string | null;
    createdAt: string;
    updatedAt: string;
}

interface RepertoireStore {
    version: 1;
    repertoires: Record<string, Repertoire>;
    nodes: Record<string, RepertoireNode>;
}

const STORAGE_KEY = "nexochess.repertoire.v1";
const START_FEN = new Chess().fen();

function now() {
    return new Date().toISOString();
}

function newId() {
    if (typeof crypto != "undefined" && typeof crypto.randomUUID == "function") {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function positionKey(fen: string) {
    return fen.split(" ").slice(0, 4).join(" ");
}

function emptyStore(): RepertoireStore {
    return { version: 1, repertoires: {}, nodes: {} };
}

function readStore(): RepertoireStore {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return emptyStore();
        const parsed = JSON.parse(raw) as RepertoireStore;
        if (parsed.version != 1 || !parsed.repertoires || !parsed.nodes) return emptyStore();
        return parsed;
    } catch {
        return emptyStore();
    }
}

function descendants(store: RepertoireStore, nodeId: string): string[] {
    const node = store.nodes[nodeId];
    if (!node) return [];
    return [nodeId, ...node.childIds.flatMap(childId => descendants(store, childId))];
}

function countMoves(store: RepertoireStore, repertoire: Repertoire) {
    return Math.max(0, descendants(store, repertoire.rootNodeId).length - 1);
}

function pathToNode(store: RepertoireStore, nodeId: string): RepertoireNode[] {
    const result: RepertoireNode[] = [];
    let cursor = store.nodes[nodeId];
    while (cursor) {
        result.push(cursor);
        if (!cursor.parentId) break;
        cursor = store.nodes[cursor.parentId];
    }
    return result.reverse();
}

function RepertoireApp() {
    const { t } = useTranslation("repertoire");
    const settings = useSettingsStore(state => state.settings);
    const [store, setStore] = useState<RepertoireStore>(() => readStore());
    const [filter, setFilter] = useState<Filter>("all");
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState("");
    const [side, setSide] = useState<RepertoireSide>("white");
    const [activeRepertoireId, setActiveRepertoireId] = useState<string | null>(null);
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
    const [flipped, setFlipped] = useState(false);
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [saved, setSaved] = useState(true);

    useEffect(() => {
        removeDefaultConsentLink();
    }, []);

    useEffect(() => {
        setSaved(false);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        const timer = window.setTimeout(() => setSaved(true), 180);
        return () => window.clearTimeout(timer);
    }, [store]);

    const activeRepertoire = activeRepertoireId
        ? store.repertoires[activeRepertoireId]
        : null;
    const currentNode = currentNodeId ? store.nodes[currentNodeId] : null;
    const currentPath = currentNodeId ? pathToNode(store, currentNodeId) : [];
    const movePath = currentPath.filter(node => node.moveSan);

    const visibleRepertoires = useMemo(() => Object.values(store.repertoires)
        .filter(item => filter == "all" || item.side == filter)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [store, filter]);

    function createRepertoire(event: React.FormEvent) {
        event.preventDefault();
        const cleanName = name.trim();
        if (!cleanName) return;

        const repertoireId = newId();
        const rootNodeId = newId();
        const timestamp = now();
        const repertoire: Repertoire = {
            id: repertoireId,
            name: cleanName,
            side,
            rootNodeId,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        const root: RepertoireNode = {
            id: rootNodeId,
            repertoireId,
            parentId: null,
            childIds: [],
            fen: START_FEN,
            positionKey: positionKey(START_FEN),
            moveUci: null,
            moveSan: null,
            ply: 0,
            notes: "",
            preferredChildId: null,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        setStore(previous => ({
            version: 1,
            repertoires: { ...previous.repertoires, [repertoireId]: repertoire },
            nodes: { ...previous.nodes, [rootNodeId]: root }
        }));
        setName("");
        setCreating(false);
        openRepertoire(repertoire, rootNodeId);
    }

    function openRepertoire(repertoire: Repertoire, nodeId = repertoire.rootNodeId) {
        setActiveRepertoireId(repertoire.id);
        setCurrentNodeId(nodeId);
        setFlipped(false);
        setSelectedSquare(null);
    }

    function closeEditor() {
        setActiveRepertoireId(null);
        setCurrentNodeId(null);
        setSelectedSquare(null);
    }

    function deleteRepertoire(repertoire: Repertoire) {
        if (!window.confirm(t("library.deleteConfirm", { name: repertoire.name }))) return;
        setStore(previous => {
            const nextRepertoires = { ...previous.repertoires };
            const nextNodes = { ...previous.nodes };
            delete nextRepertoires[repertoire.id];
            for (const id of descendants(previous, repertoire.rootNodeId)) delete nextNodes[id];
            return { ...previous, repertoires: nextRepertoires, nodes: nextNodes };
        });
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
            setCurrentNodeId(existing.id);
            setSelectedSquare(null);
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
                    preferredChildId: previous.nodes[currentNode.id].preferredChildId || childId,
                    updatedAt: timestamp
                },
                [childId]: child
            }
        }));
        setCurrentNodeId(childId);
        setSelectedSquare(null);
        return true;
    }

    function onSquareClick(square: string) {
        if (!currentNode) return;
        if (!selectedSquare) {
            const game = new Chess(currentNode.fen);
            const piece = game.get(square as never);
            if (piece && piece.color == game.turn()) setSelectedSquare(square);
            return;
        }
        if (selectedSquare == square) {
            setSelectedSquare(null);
            return;
        }
        if (!playMove(selectedSquare, square)) {
            const game = new Chess(currentNode.fen);
            const piece = game.get(square as never);
            setSelectedSquare(piece && piece.color == game.turn() ? square : null);
        }
    }

    function goBack() {
        if (!currentNode?.parentId) return;
        setCurrentNodeId(currentNode.parentId);
        setSelectedSquare(null);
    }

    function goForward() {
        if (!currentNode || currentNode.childIds.length == 0) return;
        const nextId = currentNode.preferredChildId
            || (currentNode.childIds.length == 1 ? currentNode.childIds[0] : null);
        if (nextId) setCurrentNodeId(nextId);
    }

    function goStart() {
        if (!activeRepertoire) return;
        setCurrentNodeId(activeRepertoire.rootNodeId);
        setSelectedSquare(null);
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
            return {
                ...previous,
                repertoires: {
                    ...previous.repertoires,
                    [activeRepertoire.id]: {
                        ...previous.repertoires[activeRepertoire.id],
                        updatedAt: timestamp
                    }
                },
                nodes: nextNodes
            };
        });
        setCurrentNodeId(parent.id);
    }

    if (!activeRepertoire || !currentNode) {
        return <main className={styles.library}>
            <section className={styles.hero}>
                <div>
                    <span className={styles.eyebrow}>{t("eyebrow")}</span>
                    <h1>{t("title")}</h1>
                    <p className={styles.heroText}>{t("intro")}</p>
                </div>
                <div className={styles.explainer}>
                    <strong>{t("whatIs.title")}</strong>
                    <p>{t("whatIs.body")}</p>
                    <span>{t("whatIs.reassurance")}</span>
                </div>
            </section>

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

            {creating && <form className={styles.createPanel} onSubmit={createRepertoire}>
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
                <h3>{t(store && Object.keys(store.repertoires).length ? "library.noFilterTitle" : "library.emptyTitle")}</h3>
                <p>{t(store && Object.keys(store.repertoires).length ? "library.noFilterBody" : "library.emptyBody")}</p>
                {!creating && Object.keys(store.repertoires).length == 0 && <button className={styles.primaryButton} type="button" onClick={() => setCreating(true)}>{t("library.createFirst")}</button>}
            </section> : <div className={styles.cardGrid}>
                {visibleRepertoires.map(repertoire => <article className={styles.card} key={repertoire.id}>
                    <div className={styles.cardTop}>
                        <span className={`${styles.sideBadge} ${repertoire.side == "white" ? styles.whiteSide : styles.blackSide}`}>
                            {t(`side.${repertoire.side}`)}
                        </span>
                        <button className={styles.iconButton} type="button" onClick={() => deleteRepertoire(repertoire)} aria-label={t("library.delete")}>×</button>
                    </div>
                    <h3>{repertoire.name}</h3>
                    <p>{t("library.movesSaved", { count: countMoves(store, repertoire) })}</p>
                    <div className={styles.cardFooter}>
                        <span>{t("library.local")}</span>
                        <button className={styles.openButton} type="button" onClick={() => openRepertoire(repertoire)}>{t("library.open")}</button>
                    </div>
                </article>)}
            </div>}
        </main>;
    }

    const children = currentNode.childIds.map(id => store.nodes[id]).filter(Boolean);
    const orientation = flipped
        ? (activeRepertoire.side == "white" ? "black" : "white")
        : activeRepertoire.side;
    const moveNumber = Math.floor(currentNode.ply / 2) + 1;
    const turnText = currentNode.ply % 2 == 0 ? t("side.white") : t("side.black");
    const boardStyle = {
        borderRadius: "10px",
        boxShadow: "0 18px 45px rgba(0, 0, 0, 0.24)"
    };
    const squareStyles = selectedSquare ? {
        [selectedSquare]: { boxShadow: "inset 0 0 0 4px rgba(76, 155, 255, .9)" }
    } : {};

    return <main className={styles.editor}>
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
                        onClick={() => setCurrentNodeId(node.id)}
                    >
                        <span>{index % 2 == 0 ? `${Math.floor(index / 2) + 1}.` : "…"}</span>{node.moveSan}
                    </button>)}
                </div>

                <div className={styles.continuationsHeader}>
                    <div><strong>{t("editor.continuations")}</strong><span>{t("editor.continuationsHelp")}</span></div>
                    <span className={styles.countBadge}>{children.length}</span>
                </div>
                {children.length == 0 ? <div className={styles.noContinuations}>
                    <strong>{t("editor.noContinuationsTitle")}</strong>
                    <p>{t("editor.noContinuationsBody")}</p>
                </div> : <div className={styles.continuationList}>
                    {children.map(child => <div className={styles.continuation} key={child.id}>
                        <button type="button" className={styles.continuationMove} onClick={() => setCurrentNodeId(child.id)}>
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
                <div className={styles.boardWrap}>
                    <Chessboard
                        id="repertoire-board"
                        position={currentNode.fen}
                        boardOrientation={orientation}
                        onPieceDrop={(source, target) => playMove(source, target)}
                        onSquareClick={onSquareClick}
                        customBoardStyle={boardStyle}
                        customDarkSquareStyle={{ backgroundColor: settings.themes.board.darkSquareColour }}
                        customLightSquareStyle={{ backgroundColor: settings.themes.board.lightSquareColour }}
                        customSquareStyles={squareStyles}
                        arePiecesDraggable
                    />
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
    </main>;
}

const root = ReactDOM.createRoot(document.querySelector(".root")!);
root.render(<I18nGate><PageWrapper contentClassName={styles.pageContent}><RepertoireApp/></PageWrapper></I18nGate>);
