import type { CurriculumLesson } from "./curriculum";
import { buildPracticeLesson as buildFoundationalPracticeLesson } from "./lessonPracticeV3";
import type { ChoicePractice, PracticeLesson } from "./lessonPracticeBase";

const choices: ChoicePractice["choices"] = ["checkmate", "stalemate"];

const mateOrStalemate: ChoicePractice[] = [
    {
        id: "mate-corner-h8",
        kind: "choice",
        fen: "7k/6Q1/5K2/8/8/8/8/8 b - - 0 1",
        prompt: "choose",
        choices,
        correctChoice: "checkmate"
    },
    {
        id: "stalemate-corner-h8",
        kind: "choice",
        fen: "7k/5K2/6Q1/8/8/8/8/8 b - - 0 1",
        prompt: "choose",
        choices,
        correctChoice: "stalemate"
    },
    {
        id: "mate-corner-a8",
        kind: "choice",
        fen: "k7/1Q6/2K5/8/8/8/8/8 b - - 0 1",
        prompt: "choose",
        choices,
        correctChoice: "checkmate"
    },
    {
        id: "stalemate-corner-a8",
        kind: "choice",
        fen: "k7/2K5/1Q6/8/8/8/8/8 b - - 0 1",
        prompt: "choose",
        choices,
        correctChoice: "stalemate"
    },
    {
        id: "mate-corner-h1",
        kind: "choice",
        fen: "8/8/8/8/8/5K2/6Q1/7k b - - 0 1",
        prompt: "choose",
        choices,
        correctChoice: "checkmate"
    },
    {
        id: "stalemate-corner-h1",
        kind: "choice",
        fen: "8/8/8/8/8/6Q1/5K2/7k b - - 0 1",
        prompt: "choose",
        choices,
        correctChoice: "stalemate"
    }
];

export function buildPracticeLesson(lesson: CurriculumLesson): PracticeLesson {
    if (lesson.id == "first-contact.mate-vs-stalemate") {
        return {
            lessonId: lesson.id,
            positions: mateOrStalemate.slice(0, lesson.practiceCount)
        };
    }

    return buildFoundationalPracticeLesson(lesson);
}
