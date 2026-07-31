from pathlib import Path
import re


def append_once(path: str, marker: str, content: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    if marker not in text:
        file.write_text(
            text.rstrip() + "\n\n" + content.strip() + "\n",
            encoding="utf-8"
        )


index_path = Path("client/src/apps/features/puzzles/pages/Puzzles/index.tsx")
index = index_path.read_text(encoding="utf-8")

index = index.replace(
    'import { stringifyEvaluation } from "shared/lib/utils/chess";\n',
    ""
)

if ': "coach.trainingTurn",' not in index:
    raise SystemExit("trainingTurn key not found")
index = index.replace(
    ': "coach.trainingTurn",',
    ': "coach.lichessTurn",',
    1
)

stale_text = '''            text: nextPuzzle.source == "archive"
                ? undefined
                : pageCopy.trainingTurn,
'''
if stale_text not in index:
    raise SystemExit("pretranslated coach text not found")
index = index.replace(stale_text, "", 1)

state_anchor = '        setPageState("playing");\n        setCoachExpression("explaining");'
state_replacement = '''        setPageState("playing");

        window.requestAnimationFrame(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "auto"
            });
        });

        setCoachExpression("explaining");'''
if state_anchor not in index:
    raise SystemExit("playing state anchor not found")
index = index.replace(state_anchor, state_replacement, 1)

effect_start = index.index(
    '    useEffect(() => {\n        if (!puzzle || !reviewedFen) return;'
)
effect_end = index.index("\n\n    return <main", effect_start)
effect = index[effect_start:effect_end].replace("reviewedFen", "currentFen")
index = index[:effect_start] + effect + index[effect_end:]

evaluation_pattern = re.compile(
    r'\n\s*<div className=\{styles\.evaluationSummary\}>.*?</div>\n'
    r'(?=\s*</aside>)',
    re.S
)
index, removed = evaluation_pattern.subn("", index, count=1)
if removed != 1:
    raise SystemExit("evaluation summary not found")

index_path.write_text(index, encoding="utf-8")

append_once(
    "client/src/apps/features/puzzles/pages/Puzzles/Puzzles.module.css",
    "NEXO_PUZZLE_TRAINING_LAYOUT_POLISH",
    '''
/* NEXO_PUZZLE_TRAINING_LAYOUT_POLISH */
.coachCopy {
    position: relative;
    overflow: visible;
    border-color: rgba(112, 160, 246, 0.46);
    background: #11161f;
}

.coachCopy::before,
.coachCopy::after {
    content: "";
    position: absolute;
    top: auto;
    left: auto;
    margin: 0;
    border: 0;
    clip-path: polygon(0 0, 0 100%, 100% 50%);
    transform: none;
}

.coachCopy::before {
    right: -15px;
    bottom: 22px;
    width: 15px;
    height: 24px;
    background: rgba(112, 160, 246, 0.62);
}

.coachCopy::after {
    right: -13px;
    bottom: 23px;
    width: 13px;
    height: 22px;
    background: #11161f;
}

@media (min-width: 1101px) {
    .trainingPage {
        width: min(1480px, 100%);
        padding: 10px 24px 30px;
    }

    .trainingPage .hero {
        min-height: 26px;
        margin-bottom: 8px;
        align-items: center;
    }

    .trainingPage .hero h1,
    .trainingPage .hero p,
    .trainingPage .profileStats {
        display: none;
    }

    .trainingPage .hero > div {
        display: flex;
        align-items: center;
    }

    .trainingPage .hero .eyebrow {
        font-size: 0.78rem;
    }

    .trainingGrid {
        grid-template-columns: minmax(0, 760px) minmax(360px, 480px);
        width: 100%;
        max-width: 1264px;
        gap: 24px;
        justify-content: center;
    }

    .puzzleMeta {
        min-height: 52px;
        margin-bottom: 10px;
    }

    .boardStage {
        width: min(100%, calc(100dvh - 180px));
        max-width: 760px;
        margin-inline: 0;
    }

    .evaluationBar {
        margin-right: 14px;
    }

    .boardShell {
        width: calc(100% - 31px);
    }

    .boardStageWithOutsideCoordinates .evaluationBar {
        margin-right: 28px;
    }

    .boardStageWithOutsideCoordinates .boardShell {
        width: calc(100% - 45px);
    }

    .outsideRanks {
        right: calc(100% + 7px);
    }

    .trainingPanel {
        margin-top: 62px;
    }
}

@media (min-width: 1101px) and (max-height: 820px) {
    .trainingPage {
        padding-top: 6px;
    }

    .trainingPage .hero {
        min-height: 22px;
        margin-bottom: 4px;
    }

    .puzzleMeta {
        min-height: 45px;
        margin-bottom: 6px;
    }

    .trainingPanel {
        margin-top: 51px;
    }
}
'''
)

append_once(
    "client/src/apps/features/analysis/components/AnalysisPanel/CoachMoveReaction/CoachMoveReaction.module.css",
    "NEXO_COACH_BUBBLE_OUTLINE",
    '''
/* NEXO_COACH_BUBBLE_OUTLINE */
.bubble {
    border: 1px solid rgba(112, 160, 246, 0.52);
}

.bubble::before,
.bubble::after {
    content: "";
    position: absolute;
    top: 50%;
    clip-path: polygon(100% 0, 100% 100%, 0 50%);
    transform: translateY(-50%);
}

.bubble::before {
    left: -22px;
    width: 22px;
    height: 32px;
    background: rgba(112, 160, 246, 0.72);
}

.bubble::after {
    left: -20px;
    width: 20px;
    height: 30px;
    background: #FFFFFF;
}
'''
)

append_once(
    "client/src/apps/features/analysis/components/AnalysisPanel/GameSummaryPanel/GameSummaryPanel.module.css",
    "NEXO_SUMMARY_BUBBLE_OUTLINE",
    '''
/* NEXO_SUMMARY_BUBBLE_OUTLINE */
.coachBubble {
    border-color: rgba(112, 160, 246, 0.52);
}

.coachBubble::before,
.coachBubble::after {
    content: "";
    position: absolute;
    top: 30px;
    clip-path: polygon(100% 0, 100% 100%, 0 50%);
}

.coachBubble::before {
    left: -22px;
    width: 22px;
    height: 32px;
    background: rgba(112, 160, 246, 0.72);
}

.coachBubble::after {
    left: -20px;
    width: 20px;
    height: 30px;
    background: #FFFFFF;
}
'''
)

append_once(
    "client/src/apps/features/analysis/components/AnalysisPanel/AnalysisProgress/AnalysisProgress.module.css",
    "NEXO_PROGRESS_BUBBLE_OUTLINE",
    '''
/* NEXO_PROGRESS_BUBBLE_OUTLINE */
.speechBubble {
    border-color: rgba(112, 160, 246, 0.46);
}

.speechBubble::before {
    border-color: transparent rgba(112, 160, 246, 0.66) transparent transparent;
}
'''
)

append_once(
    "client/src/apps/features/analysis/components/AnalysisPanel/CoachPicker/CoachPicker.module.css",
    "NEXO_PICKER_BUBBLE_OUTLINE",
    '''
/* NEXO_PICKER_BUBBLE_OUTLINE */
.leadBubble {
    border-color: rgba(112, 160, 246, 0.46);
}

.leadBubble::before,
.leadBubble::after {
    content: "";
    position: absolute;
    top: auto;
    bottom: 18px;
    clip-path: polygon(100% 0, 100% 100%, 0 68%);
}

.leadBubble::before {
    left: -19px;
    width: 19px;
    height: 30px;
    background: rgba(112, 160, 246, 0.66);
}

.leadBubble::after {
    left: -17px;
    width: 18px;
    height: 28px;
    background: #151A23;
}
'''
)
