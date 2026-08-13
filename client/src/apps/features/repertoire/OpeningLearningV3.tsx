import React, { useEffect, useMemo, useState } from "react";
import CourseFamilyV3 from "./CourseFamilyV3";
import CourseHomeV3 from "./CourseHomeV3";
import CourseLessonV3 from "./CourseLessonV3";
import CourseReviewV3 from "./CourseReviewV3";
import { OpeningCatalogueEntry, OpeningCategory, buildCourseLessons, getFallbackOpeningCatalogue, loadOpeningCatalogue } from "./openingCatalogue";
import { CourseProgressStore, createLessonId, readCourseProgress, writeCourseProgress } from "./courseProgress";
import { RepertoireSide } from "./courseV3Model";

type PanelMode = "learn" | "review";
interface Props { mode?: PanelMode; onAddToRepertoire: (opening: OpeningCatalogueEntry, side: RepertoireSide) => void; onFocusChange?: (focused: boolean) => void; }
interface Family { name: string; lines: OpeningCatalogueEntry[]; }
const CATEGORIES: OpeningCategory[] = ["e4", "d4", "vsE4", "vsD4", "flank"];

function OpeningLearningV3({ mode = "learn", onAddToRepertoire, onFocusChange }: Props) {
    const [catalogue, setCatalogue] = useState<OpeningCatalogueEntry[]>(getFallbackOpeningCatalogue());
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<OpeningCategory>("e4");
    const [familyName, setFamilyName] = useState<string>();
    const [preferredSide, setPreferredSide] = useState<RepertoireSide>();
    const [opening, setOpening] = useState<OpeningCatalogueEntry>();
    const [practice, setPractice] = useState(false);
    const [progress, setProgress] = useState<CourseProgressStore>(() => readCourseProgress());

    useEffect(() => {
        let cancelled = false;
        void loadOpeningCatalogue().then(entries => { if (!cancelled) { setCatalogue(entries); setLoading(false); } });
        return () => { cancelled = true; };
    }, []);
    useEffect(() => writeCourseProgress(progress), [progress]);
    useEffect(() => { onFocusChange?.(Boolean(opening)); }, [opening, onFocusChange]);
    useEffect(() => { setFamilyName(undefined); setPreferredSide(undefined); setOpening(undefined); setPractice(false); setQuery(""); }, [mode]);

    const families = useMemo<Family[]>(() => {
        const grouped = new Map<string, OpeningCatalogueEntry[]>();
        for (const item of catalogue) grouped.set(item.family, [...(grouped.get(item.family) || []), item]);
        return Array.from(grouped, ([name, lines]) => ({ name, lines })).sort((a, b) => a.name.localeCompare(b.name));
    }, [catalogue]);
    const family = familyName ? families.find(item => item.name == familyName) : undefined;
    const lines = useMemo(() => buildCourseLessons(family?.lines || []), [family]);
    const selectedIndex = opening ? lines.findIndex(item => createLessonId(item.eco, item.name, item.pgn) == createLessonId(opening.eco, opening.name, opening.pgn)) : -1;

    function openFamily(name: string, side?: RepertoireSide) {
        setFamilyName(name); setPreferredSide(side); setOpening(undefined); setQuery("");
        window.scrollTo({ top: 0, behavior: "auto" });
    }
    function openLine(item: OpeningCatalogueEntry, side?: RepertoireSide, startPractice = false) {
        setFamilyName(item.family); setPreferredSide(side); setPractice(startPractice); setOpening(item);
        window.scrollTo({ top: 0, behavior: "auto" });
    }

    if (opening) {
        const next = selectedIndex >= 0 ? lines[selectedIndex + 1] : undefined;
        return <CourseLessonV3 key={`${createLessonId(opening.eco, opening.name, opening.pgn)}|${practice}`} opening={opening} lineNumber={Math.max(1, selectedIndex + 1)} lineTotal={Math.max(1, lines.length)} progress={progress} setProgress={setProgress} preferredSide={preferredSide} startInPractice={practice} onLearned={onAddToRepertoire} onBack={() => { setOpening(undefined); setPractice(false); }} onNext={next ? () => openLine(next, preferredSide) : undefined}/>;
    }
    if (family) return <CourseFamilyV3 name={family.name} lines={lines} progress={progress} preferredSide={preferredSide} onBack={() => { setFamilyName(undefined); setPreferredSide(undefined); }} onOpen={openLine}/>;
    if (mode == "review") return <CourseReviewV3 progress={progress} onOpen={openLine}/>;
    return <CourseHomeV3 catalogue={catalogue} families={families} progress={progress} loading={loading} query={query} category={category} categories={CATEGORIES} onQuery={setQuery} onCategory={setCategory} onFamily={openFamily}/>;
}
export default OpeningLearningV3;
