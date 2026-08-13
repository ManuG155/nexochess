import React, { useEffect, useMemo, useState } from "react";
import CourseFamilyV3 from "./CourseFamilyV3";
import CourseHomeV3 from "./CourseHomeV3";
import CourseLessonV3 from "./CourseLessonV3";
import CourseReviewV3 from "./CourseReviewV3";
import { OpeningCatalogueEntry, buildCourseLessons, getFallbackOpeningCatalogue, loadOpeningCatalogue } from "./openingCatalogue";
import { CourseProgressStore, createLessonId, readCourseProgress, writeCourseProgress } from "./courseProgress";
import { RepertoireSide } from "./courseV3Model";

type PanelMode = "learn" | "review";
interface Props { mode?: PanelMode; onAddToRepertoire: (opening: OpeningCatalogueEntry, side: RepertoireSide) => void; onFocusChange?: (focused: boolean) => void; }
interface Family { name: string; lines: OpeningCatalogueEntry[]; }

function OpeningLearningV3({ mode = "learn", onAddToRepertoire, onFocusChange }: Props) {
    const [catalogue, setCatalogue] = useState<OpeningCatalogueEntry[]>(getFallbackOpeningCatalogue());
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [familyName, setFamilyName] = useState<string>();
    const [preferredSide, setPreferredSide] = useState<RepertoireSide>();
    const [opening, setOpening] = useState<OpeningCatalogueEntry>();
    const [practice, setPractice] = useState(false);
    const [blindPractice, setBlindPractice] = useState(false);
    const [reviewQueue, setReviewQueue] = useState<OpeningCatalogueEntry[]>([]);
    const [reviewIndex, setReviewIndex] = useState(0);
    const [progress, setProgress] = useState<CourseProgressStore>(() => readCourseProgress());

    useEffect(() => {
        let cancelled = false;
        void loadOpeningCatalogue().then(entries => { if (!cancelled) { setCatalogue(entries); setLoading(false); } });
        return () => { cancelled = true; };
    }, []);
    useEffect(() => writeCourseProgress(progress), [progress]);
    useEffect(() => { onFocusChange?.(Boolean(opening)); }, [opening, onFocusChange]);
    useEffect(() => { setFamilyName(undefined); setPreferredSide(undefined); setOpening(undefined); setPractice(false); setBlindPractice(false); setReviewQueue([]); setReviewIndex(0); setQuery(""); }, [mode]);

    const families = useMemo<Family[]>(() => {
        const grouped = new Map<string, OpeningCatalogueEntry[]>();
        for (const item of catalogue) grouped.set(item.family, [...(grouped.get(item.family) || []), item]);
        return Array.from(grouped, ([name, lines]) => ({ name, lines })).sort((a, b) => a.name.localeCompare(b.name));
    }, [catalogue]);
    const family = familyName ? families.find(item => item.name == familyName) : undefined;
    const lines = useMemo(() => buildCourseLessons(family?.lines || []), [family]);
    const selectedIndex = opening ? lines.findIndex(item => createLessonId(item.eco, item.name, item.pgn) == createLessonId(opening.eco, opening.name, opening.pgn)) : -1;

    function sideFor(item: OpeningCatalogueEntry, fallback?: RepertoireSide) {
        return progress[createLessonId(item.eco, item.name, item.pgn)]?.side || fallback;
    }
    function openFamily(name: string, side?: RepertoireSide) {
        setFamilyName(name); setPreferredSide(side); setOpening(undefined); setReviewQueue([]); setReviewIndex(0); setBlindPractice(false); setQuery("");
        window.scrollTo({ top: 0, behavior: "auto" });
    }
    function openLine(item: OpeningCatalogueEntry, side?: RepertoireSide, startPractice = false, blind = false) {
        setFamilyName(item.family); setPreferredSide(sideFor(item, side)); setPractice(startPractice); setBlindPractice(blind); setReviewQueue([]); setReviewIndex(0); setOpening(item);
        window.scrollTo({ top: 0, behavior: "auto" });
    }
    function startReview(items: OpeningCatalogueEntry[]) {
        if (!items.length) return;
        const queue = [...items].sort(() => Math.random() - .5);
        const first = queue[0];
        setReviewQueue(queue); setReviewIndex(0); setFamilyName(first.family); setPreferredSide(sideFor(first)); setPractice(true); setBlindPractice(true); setOpening(first);
        window.scrollTo({ top: 0, behavior: "auto" });
    }
    function advanceReview() {
        const nextIndex = reviewIndex + 1;
        const next = reviewQueue[nextIndex];
        if (!next) return;
        setReviewIndex(nextIndex); setFamilyName(next.family); setPreferredSide(sideFor(next)); setPractice(true); setBlindPractice(true); setOpening(next);
        window.scrollTo({ top: 0, behavior: "auto" });
    }
    function closeLesson() {
        setOpening(undefined); setPractice(false); setBlindPractice(false); setReviewQueue([]); setReviewIndex(0);
    }

    if (opening) {
        const next = selectedIndex >= 0 ? lines[selectedIndex + 1] : undefined;
        const reviewing = reviewQueue.length > 0;
        const hasReviewNext = reviewing && reviewIndex < reviewQueue.length - 1;
        return <CourseLessonV3 key={`${createLessonId(opening.eco, opening.name, opening.pgn)}|${practice}|${blindPractice}|${reviewIndex}`} opening={opening} lineNumber={reviewing ? reviewIndex + 1 : Math.max(1, selectedIndex + 1)} lineTotal={reviewing ? reviewQueue.length : Math.max(1, lines.length)} progress={progress} setProgress={setProgress} preferredSide={preferredSide} startInPractice={practice} blindPractice={blindPractice} onLearned={onAddToRepertoire} onBack={closeLesson} onNext={hasReviewNext ? advanceReview : !blindPractice && next ? () => openLine(next, preferredSide) : undefined}/>;
    }
    if (family) return <CourseFamilyV3 name={family.name} lines={lines} progress={progress} preferredSide={preferredSide} onBack={() => { setFamilyName(undefined); setPreferredSide(undefined); }} onOpen={openLine} onReviewFamily={startReview}/>;
    if (mode == "review") return <CourseReviewV3 progress={progress} onOpen={(item, side, startPractice) => openLine(item, side, startPractice, true)} onReviewAll={startReview}/>;
    return <CourseHomeV3 catalogue={catalogue} families={families} progress={progress} loading={loading} query={query} onQuery={setQuery} onFamily={openFamily}/>;
}
export default OpeningLearningV3;
