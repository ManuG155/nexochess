let saveHost: HTMLElement | null = null;
let originalButton: HTMLButtonElement | null = null;
let namePlaceholder: HTMLElement | null = null;

function style(el: HTMLElement, values: Partial<CSSStyleDeclaration>) {
    Object.assign(el.style, values);
}

function make(tag: string, text = "") {
    const el = document.createElement(tag);
    el.textContent = text;
    return el;
}

function createSaveHost(grid: HTMLElement, card: HTMLElement, button: HTMLButtonElement) {
    saveHost?.remove();
    const aside = make("aside");
    aside.dataset.nexoCourseSave = "true";
    style(aside, { gridColumn: "1", gridRow: "1", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "6px" });

    const box = make("section");
    style(box, { width: "330px", maxWidth: "100%", padding: "16px", border: "1px solid #315071", borderRadius: "13px", background: "#0d1b29", color: "#f2f6fb", boxShadow: "0 12px 30px rgba(0,0,0,.16)" });

    const title = card.querySelector("strong")?.textContent || button.textContent || "";
    const body = card.querySelector("p")?.textContent || "";
    const heading = make("div");
    const strong = make("strong", title);
    const paragraph = make("p", body);
    style(strong, { display: "block", fontSize: "17px" });
    style(paragraph, { margin: "5px 0 0", color: "#aab7c7", fontSize: "14px", lineHeight: "1.4" });
    heading.append(strong, paragraph);

    const action = make("button", button.textContent || title) as HTMLButtonElement;
    action.type = "button";
    style(action, { width: "100%", minHeight: "44px", marginTop: "13px", border: "1px solid #438fdf", borderRadius: "9px", background: "#287bd6", color: "#fff", font: "inherit", fontWeight: "800", cursor: "pointer" });
    action.onclick = () => originalButton?.click();

    const placeholder = make("div");
    namePlaceholder = placeholder;
    style(placeholder, { minHeight: "178px", marginTop: "13px", padding: "13px", border: "1px solid #2c4b6c", borderRadius: "10px", background: "#08131f", filter: "blur(2.4px)", opacity: ".42", pointerEvents: "none" });
    for (const height of ["12px", "44px", "10px", "40px"]) {
        const bar = make("div");
        style(bar, { height, marginBottom: "10px", borderRadius: "8px", background: "#34506d" });
        placeholder.appendChild(bar);
    }

    box.append(heading, action, placeholder);
    aside.appendChild(box);
    grid.appendChild(aside);
    saveHost = aside;
}

export function refreshCourseSaveRuntime() {
    const board = document.getElementById("repertoire-course-board-v3");
    const grid = board?.parentElement?.parentElement?.parentElement as HTMLElement | null;
    if (!grid) { saveHost?.remove(); saveHost = null; return; }

    const card = Array.from(grid.querySelectorAll<HTMLElement>("aside section"))
        .find(section => section.querySelector(":scope > span + div + button")) || null;
    const button = card?.querySelector(":scope > button") as HTMLButtonElement | null;

    if (card && button) {
        card.style.setProperty("display", "none", "important");
        originalButton = button;
        if (!saveHost?.isConnected) createSaveHost(grid, card, button);
        if (saveHost) saveHost.style.display = "flex";
    } else if (saveHost) {
        saveHost.style.display = "none";
        originalButton = null;
    }
}

export function getCourseNamePlaceholder() { return namePlaceholder; }
