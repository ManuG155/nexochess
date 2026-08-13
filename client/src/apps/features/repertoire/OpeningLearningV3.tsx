import React, { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { useTranslation } from "react-i18next";
import CourseFamilyV3 from "./CourseFamilyV3";
import CourseHomeV3 from "./CourseHomeV3";
import CourseLessonV3 from "./CourseLessonV3";
import CourseReviewV3 from "./CourseReviewV3";
import { OpeningCatalogueEntry, buildCourseLessons, getFallbackOpeningCatalogue, loadOpeningCatalogue } from "./openingCatalogue";
import { localizeOpeningName, repertoireLanguage } from "./openingLocalization";
import { CustomCourseLine, addCustomCourseLine, readCustomCourseLines, writeCustomCourseLines } from "./customCourseLines";
import { CourseProgressStore, createLessonId, readCourseProgress, writeCourseProgress } from "./courseProgress";
import { RepertoireSide } from "./courseV3Model";

type PanelMode = "learn" | "review";
interface Props { mode?: PanelMode; onAddToRepertoire: (opening: OpeningCatalogueEntry, side: RepertoireSide) => void; onFocusChange?: (focused: boolean) => void; }
interface Family { name: string; lines: OpeningCatalogueEntry[]; }

const LINE_WORD: Record<string,string> = { en:"Line", es:"Línea", fr:"Ligne", de:"Variante", pt:"Linha", ru:"Вариант", zh:"路线", vi:"Biến", hi:"लाइन", mr:"लाईन", pl:"Wariant" };

function normalizedHistory(pgn: string) {
    try {
        const board = new Chess();
        board.loadPgn(pgn);
        return board.history().join(" ");
    } catch {
        return "";
    }
}

function OpeningLearningV3({ mode = "learn", onAddToRepertoire, onFocusChange }: Props) {
    const { i18n } = useTranslation();
    const language = i18n.resolvedLanguage || i18n.language || "en";
    const lang = repertoireLanguage(language);
    const [catalogue, setCatalogue] = useState<OpeningCatalogueEntry[]>(getFallbackOpeningCatalogue());
    const [customLines, setCustomLines] = useState<CustomCourseLine[]>(() => readCustomCourseLines());
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
    useEffect(() => writeCustomCourseLines(customLines), [customLines]);
    useEffect(() => { onFocusChange?.(Boolean(opening)); }, [opening, onFocusChange]);
    useEffect(() => { setFamilyName(undefined); setPreferredSide(undefined); setOpening(undefined); setPractice(false); setBlindPractice(false); setReviewQueue([]); setReviewIndex(0); setQuery(""); }, [mode]);

    const allLines = useMemo(() => [...catalogue, ...customLines], [catalogue, customLines]);
    const families = useMemo<Family[]>(() => {
        const grouped = new Map<string, OpeningCatalogueEntry[]>();
        for (const item of allLines) grouped.set(item.family, [...(grouped.get(item.family) || []), item]);
        return Array.from(grouped, ([name, lines]) => ({ name, lines })).sort((a, b) => localizeOpeningName(a.name, language).localeCompare(localizeOpeningName(b.name, language)));
    }, [allLines, language]);
    const family = familyName ? families.find(item => item.name == familyName) : undefined;
    const lines = useMemo(() => {
        const sources = family?.lines || [];
        const standard = sources.filter(item => item.eco != "USR");
        const personal = sources.filter(item => item.eco == "USR");
        return [...buildCourseLessons(standard), ...personal];
    }, [family]);
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
    function genericCustomName(familyValue: string) {
        const word = LINE_WORD[lang] || LINE_WORD.en;
        const count = customLines.filter(item => item.family == familyValue).length + 1;
        return `${word} ${count}`;
    }
    function suggestionFor(pgn: string, familyValue: string) {
        const history = normalizedHistory(pgn);
        if (history) {
            const exact = catalogue.find(item => item.family == familyValue && normalizedHistory(item.pgn) == history);
            if (exact) return localizeOpeningName(exact.name, language);
        }
        return genericCustomName(familyValue);
    }
    function saveCustomLine(payload: { opening: OpeningCatalogueEntry; side: RepertoireSide; pgn: string; name: string }) {
        const synthetic: OpeningCatalogueEntry = { eco: "USR", family: payload.opening.family, name: payload.name, pgn: payload.pgn };
        setCustomLines(previous => addCustomCourseLine(previous, synthetic));
        onAddToRepertoire(synthetic, payload.side);
    }

    if (opening) {
        const next = selectedIndex >= 0 ? lines[selectedIndex + 1] : undefined;
        const reviewing = reviewQueue.length > 0;
        const hasReviewNext = reviewing && reviewIndex < reviewQueue.length - 1;
        const customSuggestion = genericCustomName(opening.family);
        return <CourseLessonV3 key={`${createLessonId(opening.eco, opening.name, opening.pgn)}|${practice}|${blindPractice}|${reviewIndex}`} opening={opening} lineNumber={reviewing ? reviewIndex + 1 : Math.max(1, selectedIndex + 1)} lineTotal={reviewing ? reviewQueue.length : Math.max(1, lines.length)} progress={progress} setProgress={setProgress} preferredSide={preferredSide} startInPractice={practice} blindPractice={blindPractice} customLineSuggestedName={customSuggestion} onSaveCustomLine={payload => saveCustomLine({ ...payload, name: payload.name || suggestionFor(payload.pgn, payload.opening.family) })} onLearned={onAddToRepertoire} onBack={closeLesson} onNext={hasReviewNext ? advanceReview : !blindPractice && next ? () => openLine(next, preferredSide) : undefined}/>;
    }
    if (family) return <CourseFamilyV3 name={family.name} lines={lines} progress={progress} preferredSide={preferredSide} onBack={() => { setFamilyName(undefined); setPreferredSide(undefined); }} onOpen={openLine} onReviewFamily={startReview}/>;
    if (mode == "review") return <CourseReviewV3 progress={progress} onOpen={(item, side, startPractice) => openLine(item, side, startPractice, true)} onReviewAll={startReview}/>;
    return <CourseHomeV3 catalogue={allLines} families={families} progress={progress} loading={loading} query={query} onQuery={setQuery} onFamily={openFamily}/>;
}
export default OpeningLearningV3;
