import type { LessonDefinition } from "./lessonModel";

const ROOK_CENTRE = "7k/8/8/8/3R4/8/8/K7 w - - 0 1";
const ROOK_BLOCKED = "7k/8/8/8/8/P7/8/R6K w - - 0 1";
const ROOK_CAPTURE = "7k/8/p7/8/8/8/8/R6K w - - 0 1";
const ROOK_COMBINED = "7k/3p4/8/8/3R1P2/8/8/K7 w - - 0 1";

export const rookLesson: LessonDefinition = {
    id: "first-contact.rook",
    titleKey: "lesson.rook.title",
    moduleKey: "path.sectionTitle",
    steps: [
        {
            id: "meet-rook",
            kind: "message",
            fen: ROOK_CENTRE,
            coachKey: "lesson.rook.intro.coach",
            bodyKey: "lesson.rook.intro.body"
        },
        {
            id: "horizontal",
            kind: "move",
            fen: ROOK_CENTRE,
            coachKey: "lesson.rook.horizontal.coach",
            instructionKey: "lesson.rook.horizontal.instruction",
            targetMove: { from: "d4", to: "g4" },
            successKey: "lesson.rook.horizontal.success",
            hints: [
                { textKey: "lesson.rook.horizontal.hint1" },
                {
                    textKey: "lesson.rook.horizontal.hint2",
                    highlightSquares: ["d4", "g4"]
                },
                {
                    textKey: "lesson.rook.horizontal.hint3",
                    highlightSquares: ["d4", "g4"],
                    arrows: [["d4", "g4"]]
                }
            ]
        },
        {
            id: "vertical",
            kind: "move",
            fen: ROOK_CENTRE,
            coachKey: "lesson.rook.vertical.coach",
            instructionKey: "lesson.rook.vertical.instruction",
            targetMove: { from: "d4", to: "d7" },
            successKey: "lesson.rook.vertical.success",
            hints: [
                { textKey: "lesson.rook.vertical.hint1" },
                {
                    textKey: "lesson.rook.vertical.hint2",
                    highlightSquares: ["d4", "d7"]
                },
                {
                    textKey: "lesson.rook.vertical.hint3",
                    highlightSquares: ["d4", "d7"],
                    arrows: [["d4", "d7"]]
                }
            ]
        },
        {
            id: "blocked",
            kind: "multipleChoice",
            fen: ROOK_BLOCKED,
            coachKey: "lesson.rook.blocked.coach",
            questionKey: "lesson.rook.blocked.question",
            options: [
                { id: "yes", labelKey: "lesson.rook.blocked.yes" },
                { id: "no", labelKey: "lesson.rook.blocked.no" }
            ],
            correctOptionId: "no",
            successKey: "lesson.rook.blocked.success",
            errorKey: "lesson.rook.blocked.error",
            hints: [
                { textKey: "lesson.rook.blocked.hint1" },
                {
                    textKey: "lesson.rook.blocked.hint2",
                    highlightSquares: ["a1", "a3", "a5"]
                }
            ]
        },
        {
            id: "capture",
            kind: "move",
            fen: ROOK_CAPTURE,
            coachKey: "lesson.rook.capture.coach",
            instructionKey: "lesson.rook.capture.instruction",
            targetMove: { from: "a1", to: "a6" },
            successKey: "lesson.rook.capture.success",
            hints: [
                { textKey: "lesson.rook.capture.hint1" },
                {
                    textKey: "lesson.rook.capture.hint2",
                    highlightSquares: ["a1", "a6"]
                },
                {
                    textKey: "lesson.rook.capture.hint3",
                    highlightSquares: ["a1", "a6"],
                    arrows: [["a1", "a6"]]
                }
            ]
        },
        {
            id: "control",
            kind: "selectSquare",
            fen: ROOK_CENTRE,
            coachKey: "lesson.rook.control.coach",
            instructionKey: "lesson.rook.control.instruction",
            acceptedSquares: [
                "d1", "d2", "d3", "d5", "d6", "d7", "d8",
                "a4", "b4", "c4", "e4", "f4", "g4", "h4"
            ],
            successKey: "lesson.rook.control.success",
            hints: [
                { textKey: "lesson.rook.control.hint1" },
                {
                    textKey: "lesson.rook.control.hint2",
                    highlightSquares: [
                        "d1", "d2", "d3", "d5", "d6", "d7", "d8",
                        "a4", "b4", "c4", "e4", "f4", "g4", "h4"
                    ]
                }
            ]
        },
        {
            id: "combined",
            kind: "move",
            fen: ROOK_COMBINED,
            coachKey: "lesson.rook.combined.coach",
            instructionKey: "lesson.rook.combined.instruction",
            targetMove: { from: "d4", to: "d7" },
            successKey: "lesson.rook.combined.success",
            hints: [
                { textKey: "lesson.rook.combined.hint1" },
                {
                    textKey: "lesson.rook.combined.hint2",
                    highlightSquares: ["d4", "d7"]
                },
                {
                    textKey: "lesson.rook.combined.hint3",
                    highlightSquares: ["d4", "d7"],
                    arrows: [["d4", "d7"]]
                }
            ]
        },
        {
            id: "complete",
            kind: "completion",
            fen: ROOK_COMBINED,
            coachKey: "lesson.rook.completion.coach",
            titleKey: "lesson.rook.completion.title",
            bodyKey: "lesson.rook.completion.body"
        }
    ]
};
