import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const { Chess } = require("chess.js");
const tscPath = require.resolve("typescript/bin/tsc");

const root = path.resolve(import.meta.dirname, "..");
const lessonsRoot = path.join(root, "client/src/apps/features/lessons");
const tempRoot = path.join(root, `.nexochess-lessons-check-${process.pid}`);
fs.rmSync(tempRoot, { recursive: true, force: true });
fs.mkdirSync(tempRoot, { recursive: true });

function fail(message) {
    throw new Error(`[Lessons] ${message}`);
}

function pieceCount(board) {
    return board.board().flat().filter(Boolean).length;
}

try {
    const compile = spawnSync(process.execPath, [
        tscPath,
        path.join(lessonsRoot, "curriculum.ts"),
        path.join(lessonsRoot, "lessonPractice.ts"),
        "--target", "ES2020",
        "--module", "CommonJS",
        "--moduleResolution", "node",
        "--skipLibCheck",
        "--esModuleInterop",
        "--rootDir", lessonsRoot,
        "--outDir", tempRoot
    ], {
        cwd: root,
        encoding: "utf8"
    });

    if (compile.status !== 0) {
        process.stderr.write(compile.stdout || "");
        process.stderr.write(compile.stderr || "");
        fail("Could not compile the declarative curriculum for validation.");
    }

    const curriculum = require(path.join(tempRoot, "curriculum.js"));
    const practice = require(path.join(tempRoot, "lessonPractice.js"));

    const ids = new Set();
    let totalPositions = 0;
    let contextualPositions = 0;

    for (const lesson of curriculum.curriculumLessons) {
        if (ids.has(lesson.id)) fail(`Duplicate lesson id: ${lesson.id}`);
        ids.add(lesson.id);

        if (lesson.practiceCount < 4 || lesson.practiceCount > 10) {
            fail(`${lesson.id} declares ${lesson.practiceCount} positions; expected 4–10.`);
        }

        const generated = practice.buildPracticeLesson(lesson);
        if (!generated || generated.lessonId !== lesson.id) {
            fail(`${lesson.id} did not generate its own practice lesson.`);
        }
        if (generated.positions.length !== lesson.practiceCount) {
            fail(`${lesson.id} generated ${generated.positions.length} positions; expected ${lesson.practiceCount}.`);
        }
        if (generated.positions.some(position => position.id.includes("fallback"))) {
            fail(`${lesson.id} is still using generic fallback practice.`);
        }

        const signatures = new Set();

        for (const position of generated.positions) {
            let board;
            try {
                board = new Chess(position.fen);
            } catch (error) {
                fail(`${lesson.id}/${position.id} has invalid FEN: ${String(error)}`);
            }

            if (practice.lessonNeedsGameContext?.(lesson.id, position.id)) {
                contextualPositions += 1;
                if (pieceCount(board) < 10) {
                    fail(
                        `${lesson.id}/${position.id} is too sparse for a game-context exercise `
                        + `(${pieceCount(board)} pieces).`
                    );
                }
            }

            if (lesson.id === "first-contact.escape-check" && !board.isCheck()) {
                fail(`${lesson.id}/${position.id} must start with the side to move in check.`);
            }

            if (position.kind === "move") {
                const legalMoves = board.moves({ verbose: true });
                const expectedLegal = legalMoves.some(move => (
                    move.from === position.expected.from
                    && move.to === position.expected.to
                ));

                if (!expectedLegal) {
                    fail(
                        `${lesson.id}/${position.id} expects illegal move `
                        + `${position.expected.from}${position.expected.to} in ${position.fen}`
                    );
                }

                for (const accepted of position.accepted || []) {
                    const acceptedLegal = legalMoves.some(move => (
                        move.from === accepted.from && move.to === accepted.to
                    ));
                    if (!acceptedLegal) {
                        fail(
                            `${lesson.id}/${position.id} accepts illegal move `
                            + `${accepted.from}${accepted.to}.`
                        );
                    }
                }
            } else if (position.kind === "select") {
                fail(
                    `${lesson.id}/${position.id} still uses select-only board practice. `
                    + "Lesson board exercises must be solved by moving a piece."
                );
            } else if (!position.choices.includes(position.correctChoice)) {
                fail(`${lesson.id}/${position.id} correct choice is not offered.`);
            }

            const signature = JSON.stringify({
                fen: position.fen,
                kind: position.kind,
                expected: position.kind === "move" ? position.expected : undefined,
                accepted: position.kind === "move" ? position.accepted : undefined,
                correctChoice: position.kind === "choice" ? position.correctChoice : undefined
            });

            if (signatures.has(signature)) {
                fail(`${lesson.id} contains a repeated practice position (${position.id}).`);
            }
            signatures.add(signature);
            totalPositions += 1;
        }
    }

    if (ids.size !== curriculum.TOTAL_LESSONS) {
        fail(`Catalog count mismatch: ${ids.size} ids vs TOTAL_LESSONS=${curriculum.TOTAL_LESSONS}.`);
    }

    console.log(
        `Lessons audit passed: ${ids.size} lessons, ${totalPositions} unique positions, `
        + `${contextualPositions} game-context positions, move-first board exercises, valid FENs `
        + "and legal expected moves."
    );
} finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
}
