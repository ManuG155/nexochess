import { getCourseNamePlaceholder } from "./courseSaveRuntime";

function important(el: HTMLElement, name: string, value: string) {
    el.style.setProperty(name, value, "important");
}

function positionForm(form: HTMLFormElement) {
    const placeholder = getCourseNamePlaceholder();
    if (!placeholder) return;
    const rect = placeholder.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    placeholder.style.visibility = "hidden";

    const backdrop = form.parentElement as HTMLElement | null;
    if (backdrop) {
        important(backdrop, "position", "fixed");
        important(backdrop, "inset", "0");
        important(backdrop, "padding", "0");
        important(backdrop, "background", "transparent");
        important(backdrop, "backdrop-filter", "none");
        important(backdrop, "pointer-events", "none");
        important(backdrop, "display", "block");
        important(backdrop, "z-index", "10000");
    }

    important(form, "position", "fixed");
    important(form, "left", `${rect.left}px`);
    important(form, "top", `${rect.top}px`);
    important(form, "width", `${rect.width}px`);
    important(form, "max-width", `${rect.width}px`);
    important(form, "margin", "0");
    important(form, "padding", "13px");
    important(form, "pointer-events", "auto");
    important(form, "border-radius", "10px");
    important(form, "box-shadow", "none");

    const eyebrow = form.querySelector(":scope > span") as HTMLElement | null;
    const heading = form.querySelector("h3") as HTMLElement | null;
    if (eyebrow) important(eyebrow, "display", "none");
    if (heading) important(heading, "display", "none");
}

export function refreshCourseSaveModalRuntime() {
    const placeholder = getCourseNamePlaceholder();
    const form = document.querySelector("form[role=\"dialog\"]") as HTMLFormElement | null;
    const courseVisible = Boolean(document.getElementById("repertoire-course-board-v3"));
    if (!courseVisible) return;
    if (form) requestAnimationFrame(() => positionForm(form));
    else if (placeholder) placeholder.style.visibility = "visible";
}
