import { OpeningCatalogueEntry } from "./openingCatalogue";

const STORAGE_KEY = "nexochess.repertoire.course-custom.v1";

export interface CustomCourseLine extends OpeningCatalogueEntry {
    id: string;
    createdAt: string;
}

export function readCustomCourseLines(): CustomCourseLine[] {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as CustomCourseLine[];
        return Array.isArray(parsed) ? parsed.filter(item => item && item.id && item.family && item.pgn) : [];
    } catch {
        return [];
    }
}

export function writeCustomCourseLines(lines: CustomCourseLine[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

export function addCustomCourseLine(previous: CustomCourseLine[], line: Omit<CustomCourseLine,"id"|"createdAt">) {
    const duplicate = previous.find(item => item.family == line.family && item.pgn == line.pgn);
    if (duplicate) return previous;
    const id = typeof crypto != "undefined" && typeof crypto.randomUUID == "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return [...previous, { ...line, id, createdAt: new Date().toISOString() }];
}
