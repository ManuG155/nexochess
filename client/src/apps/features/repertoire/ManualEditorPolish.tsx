import { useEffect } from "react";

export default function ManualEditorPolish() {
    useEffect(() => {
        const board = document.getElementById("repertoire-board");
        if (!board) return;

        const boardWrap = board.parentElement as HTMLElement | null;
        const boardStage = boardWrap?.parentElement as HTMLElement | null;
        const boardColumn = boardStage?.parentElement as HTMLElement | null;
        const editorGrid = boardColumn?.parentElement as HTMLElement | null;
        const editor = editorGrid?.parentElement as HTMLElement | null;
        if (!boardWrap || !boardStage || !boardColumn || !editorGrid || !editor) return;

        const touched = new Map<HTMLElement, string | null>();
        const remember = (element: HTMLElement, property: string) => {
            const key = `${property}:${touched.size}`;
            touched.set(element, element.getAttribute("style"));
            return key;
        };
        void remember;

        const applyLayout = () => {
            const width = window.innerWidth;
            const boardSize = Math.min(860, Math.max(500, window.innerHeight - 205));
            boardStage.style.width = `min(100%, ${boardSize}px)`;
            boardStage.style.maxWidth = "none";
            boardWrap.style.width = "100%";
            boardColumn.style.minWidth = "0";

            if (width > 1500) {
                editorGrid.style.gridTemplateColumns =
                    "minmax(300px,.78fr) minmax(610px,1.55fr) minmax(300px,.82fr)";
            } else if (width > 1050) {
                editorGrid.style.gridTemplateColumns =
                    "minmax(290px,.82fr) minmax(570px,1.45fr)";
            } else {
                editorGrid.style.gridTemplateColumns = "minmax(0,1fr)";
            }
            editorGrid.style.gap = "clamp(16px,1.45vw,26px)";
            editorGrid.style.alignItems = "start";
        };

        editor.style.fontSize = "1.05rem";
        editor.querySelectorAll<HTMLElement>("p,button,label,textarea,li")
            .forEach(element => {
                element.style.fontSize = ".98rem";
                element.style.lineHeight = "1.48";
            });
        editor.querySelectorAll<HTMLElement>("small")
            .forEach(element => element.style.fontSize = ".9rem");

        applyLayout();
        window.addEventListener("resize", applyLayout);
        return () => {
            window.removeEventListener("resize", applyLayout);
            boardStage.removeAttribute("style");
            boardWrap.removeAttribute("style");
            boardColumn.removeAttribute("style");
            editorGrid.removeAttribute("style");
            editor.removeAttribute("style");
            editor.querySelectorAll<HTMLElement>("p,button,label,textarea,li,small")
                .forEach(element => {
                    element.style.removeProperty("font-size");
                    element.style.removeProperty("line-height");
                });
        };
    }, []);

    return null;
}
