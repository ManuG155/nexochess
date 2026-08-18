import React from "react";

import type { CurriculumTone } from "./curriculum";
import * as styles from "./lessonsV4.module.css";

export type LandmarkVariant = 0 | 1 | 2 | 3;

interface LandmarkProps {
    tone: CurriculumTone;
    variant: LandmarkVariant;
    className?: string;
}

function RookCitadel() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Chess rook citadel">
        <defs>
            <linearGradient id="ice-stone" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#d7f3ff"/>
                <stop offset=".48" stopColor="#71b9e8"/>
                <stop offset="1" stopColor="#244f79"/>
            </linearGradient>
            <linearGradient id="ice-shadow" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#4e88b4"/>
                <stop offset="1" stopColor="#17334f"/>
            </linearGradient>
        </defs>
        <ellipse cx="130" cy="211" rx="86" ry="19" fill="#06101c" opacity=".7"/>
        <path d="M60 188 84 109h92l24 79-24 19H84Z" fill="url(#ice-shadow)"/>
        <path d="M78 188 96 118h68l18 70-14 10H92Z" fill="url(#ice-stone)"/>
        <path d="M87 116V70h19V48h22v22h14V48h22v22h19v46Z" fill="url(#ice-stone)"/>
        <path d="M87 84h96" stroke="#e8fbff" strokeWidth="5" opacity=".65"/>
        <path d="M103 116V82M130 116V75M157 116V82" stroke="#2a608a" strokeWidth="8" opacity=".55"/>
        <path d="M58 190h144" stroke="#9edcff" strokeWidth="6" strokeLinecap="round" opacity=".5"/>
        <circle cx="130" cy="145" r="17" fill="#10283d" opacity=".8"/>
        <path d="M130 130v30M115 145h30" stroke="#b9efff" strokeWidth="4" strokeLinecap="round"/>
    </svg>;
}

function BoardCompass() {
    const squares = Array.from({ length: 16 });
    return <svg viewBox="0 0 260 240" role="img" aria-label="Chess board compass">
        <defs>
            <linearGradient id="compass-base" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#356f9c"/>
                <stop offset="1" stopColor="#10283e"/>
            </linearGradient>
        </defs>
        <ellipse cx="130" cy="205" rx="82" ry="18" fill="#06101c" opacity=".68"/>
        <path d="M51 153 130 79l79 74-79 56Z" fill="url(#compass-base)" stroke="#76c7f6" strokeWidth="5"/>
        <g transform="translate(84 103) skewY(-17) scale(1 .83)">
            {squares.map((_, index) => {
                const x = index % 4;
                const y = Math.floor(index / 4);
                return <rect
                    key={index}
                    x={x * 23}
                    y={y * 23}
                    width="23"
                    height="23"
                    fill={(x + y) % 2 ? "#163f61" : "#a9def8"}
                    opacity=".92"
                />;
            })}
        </g>
        <circle cx="130" cy="135" r="27" fill="#091a2a" stroke="#d2f3ff" strokeWidth="4"/>
        <path d="m130 106 11 28-11 30-11-30Z" fill="#7de2ff"/>
        <circle cx="130" cy="135" r="5" fill="#fff"/>
    </svg>;
}

function KnightGarden() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Knight statue garden">
        <defs>
            <linearGradient id="knight-metal" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#e1f7ff"/>
                <stop offset=".55" stopColor="#6eb5df"/>
                <stop offset="1" stopColor="#234969"/>
            </linearGradient>
        </defs>
        <ellipse cx="130" cy="211" rx="85" ry="18" fill="#06101c" opacity=".7"/>
        <g opacity=".9">
            <circle cx="62" cy="158" r="29" fill="#235f61"/>
            <circle cx="78" cy="176" r="23" fill="#1c4d58"/>
            <circle cx="198" cy="164" r="31" fill="#24596b"/>
            <circle cx="180" cy="184" r="22" fill="#1c4658"/>
            <path d="M39 190q30-38 64-2M157 194q29-43 69-7" fill="none" stroke="#63a998" strokeWidth="8" strokeLinecap="round"/>
        </g>
        <path d="M100 193h60l13 13H87Z" fill="#183b56"/>
        <path d="M105 188h50l7-26h-64Z" fill="#4386ae"/>
        <path d="M115 164c-3-28 3-44 20-62 9-10 11-22 1-36 27 7 44 24 46 48-13-9-25-10-38-4 17 11 24 24 23 40-2 23-17 39-39 42Z" fill="url(#knight-metal)" stroke="#bdeaff" strokeWidth="4"/>
        <circle cx="153" cy="91" r="4" fill="#0d2539"/>
        <path d="M138 112c13 0 27 8 32 20" fill="none" stroke="#285f83" strokeWidth="5" strokeLinecap="round"/>
    </svg>;
}

function KingGate() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="King gate">
        <defs>
            <linearGradient id="gate-stone" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#bceaff"/>
                <stop offset=".5" stopColor="#5b9cc6"/>
                <stop offset="1" stopColor="#244b69"/>
            </linearGradient>
        </defs>
        <ellipse cx="130" cy="212" rx="90" ry="18" fill="#06101c" opacity=".72"/>
        <path d="M54 197V95h34V70h84v25h34v102h-39v-56c0-23-15-40-37-40s-37 17-37 40v56Z" fill="url(#gate-stone)" stroke="#8fd8f6" strokeWidth="4"/>
        <path d="M72 95h116M88 70h84" stroke="#e1f7ff" strokeWidth="5" opacity=".58"/>
        <path d="M119 69V48h22v21M108 52h44" stroke="#dff7ff" strokeWidth="8" strokeLinecap="round"/>
        <circle cx="130" cy="142" r="22" fill="#0b1d2d" opacity=".9"/>
        <path d="M130 123v38M115 142h30" stroke="#7ed5f8" strokeWidth="5" strokeLinecap="round"/>
    </svg>;
}

function IndigoCastle() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Chess learning castle">
        <defs>
            <linearGradient id="indigo-wall" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#bec8ff"/>
                <stop offset=".48" stopColor="#6c77d6"/>
                <stop offset="1" stopColor="#30356f"/>
            </linearGradient>
        </defs>
        <ellipse cx="130" cy="212" rx="90" ry="18" fill="#070918" opacity=".7"/>
        <path d="M55 190V105h32V73h34v32h18V73h34v32h32v85l-23 18H78Z" fill="url(#indigo-wall)" stroke="#a9b9ff" strokeWidth="4"/>
        <path d="M86 73V55h11v-12h12v12h12v18M139 73V55h11v-12h12v12h11v18" fill="#838fe7"/>
        <path d="M105 190v-39c0-18 10-29 25-29s25 11 25 29v39Z" fill="#171a43"/>
        <path d="M63 118h134" stroke="#d5dbff" strokeWidth="5" opacity=".45"/>
        <circle cx="130" cy="146" r="8" fill="#a7b7ff"/>
    </svg>;
}

function ShieldHall() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Chess shield hall">
        <ellipse cx="130" cy="211" rx="86" ry="18" fill="#070918" opacity=".72"/>
        <path d="M61 190 84 88h92l23 102-23 18H84Z" fill="#292e6e" stroke="#7d89df" strokeWidth="4"/>
        <path d="M130 77 176 94v38c0 34-18 57-46 70-28-13-46-36-46-70V94Z" fill="#6571cf" stroke="#c3ccff" strokeWidth="5"/>
        <path d="M130 92v91M95 119h70" stroke="#20265d" strokeWidth="8" opacity=".65"/>
        <path d="M103 153c15-14 39-14 54 0" fill="none" stroke="#d4dcff" strokeWidth="6" strokeLinecap="round"/>
        <circle cx="130" cy="118" r="15" fill="#20265d"/>
        <path d="M130 103v30M116 118h28" stroke="#cbd4ff" strokeWidth="4"/>
    </svg>;
}

function BookBridge() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Chess book bridge">
        <ellipse cx="130" cy="212" rx="88" ry="18" fill="#070918" opacity=".7"/>
        <path d="M42 174q44-39 88-8 44-31 88 8v29q-44-28-88 4-44-32-88-4Z" fill="#6f79d8" stroke="#b7c2ff" strokeWidth="4"/>
        <path d="M130 166v41" stroke="#313773" strokeWidth="4"/>
        <path d="M58 180q36-25 72-4M202 180q-36-25-72-4" fill="none" stroke="#e0e4ff" strokeWidth="3" opacity=".6"/>
        <path d="M82 142h96" stroke="#343b7a" strokeWidth="11" strokeLinecap="round"/>
        <path d="M94 140c6-25 17-39 36-48 19 9 30 23 36 48" fill="#4954ae" stroke="#aebaff" strokeWidth="4"/>
        <path d="M130 91v49" stroke="#d6ddff" strokeWidth="5"/>
        <circle cx="130" cy="81" r="13" fill="#93a3ff"/>
    </svg>;
}

function OpeningObservatory() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Opening observatory">
        <ellipse cx="130" cy="211" rx="84" ry="18" fill="#070918" opacity=".72"/>
        <path d="M78 190h104l-14-59H92Z" fill="#343b83" stroke="#7784dc" strokeWidth="4"/>
        <path d="M91 131a39 39 0 0 1 78 0Z" fill="#717bd6" stroke="#c0c8ff" strokeWidth="4"/>
        <circle cx="130" cy="126" r="18" fill="#171a43"/>
        <path d="M130 108v36M112 126h36" stroke="#d9deff" strokeWidth="4"/>
        <path d="M161 103 198 63" stroke="#9aa8ff" strokeWidth="11" strokeLinecap="round"/>
        <circle cx="202" cy="58" r="18" fill="#4d57af" stroke="#bec8ff" strokeWidth="4"/>
        <path d="M66 193h128" stroke="#abb6ff" strokeWidth="5" strokeLinecap="round" opacity=".45"/>
    </svg>;
}

function CopperForge() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Tactical chess forge">
        <defs>
            <linearGradient id="copper-metal" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#ffd4aa"/>
                <stop offset=".5" stopColor="#c57943"/>
                <stop offset="1" stopColor="#66351f"/>
            </linearGradient>
        </defs>
        <ellipse cx="130" cy="211" rx="88" ry="18" fill="#120a06" opacity=".72"/>
        <path d="M65 197h130l-15-48H80Z" fill="#6d3924" stroke="#bb7247" strokeWidth="4"/>
        <path d="M89 146h82l19-29h-38l-10-21h-24l-10 21H70Z" fill="url(#copper-metal)" stroke="#ffbd84" strokeWidth="4"/>
        <path d="M130 96V58" stroke="#ffb26f" strokeWidth="9" strokeLinecap="round"/>
        <path d="m130 47-14 22h28Z" fill="#ffd0a2"/>
        <path d="M98 76 72 55M162 76l26-21" stroke="#e59458" strokeWidth="6" strokeLinecap="round"/>
        <circle cx="130" cy="132" r="12" fill="#4a2518"/>
        <path d="M130 120v24M118 132h24" stroke="#ffd2a8" strokeWidth="4"/>
    </svg>;
}

function PinObelisk() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Pinned piece obelisk">
        <ellipse cx="130" cy="211" rx="84" ry="17" fill="#120a06" opacity=".72"/>
        <path d="M93 196h74l-8-28h-58Z" fill="#6b3823"/>
        <path d="m130 54 29 114h-58Z" fill="#a55f39" stroke="#efad77" strokeWidth="4"/>
        <circle cx="130" cy="128" r="16" fill="#4d2819" stroke="#ffd0a6" strokeWidth="4"/>
        <circle cx="130" cy="81" r="10" fill="#f1a264"/>
        <circle cx="130" cy="176" r="12" fill="#f1a264"/>
        <path d="M130 81v95" stroke="#ffd6b2" strokeWidth="5" strokeDasharray="7 7"/>
        <path d="M55 145h42M163 145h42" stroke="#c97745" strokeWidth="7" strokeLinecap="round" opacity=".65"/>
    </svg>;
}

function MateLantern() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Checkmate lantern">
        <ellipse cx="130" cy="211" rx="85" ry="18" fill="#120a06" opacity=".72"/>
        <path d="M87 180V98h86v82Z" fill="#7d4529" stroke="#e69a60" strokeWidth="5"/>
        <path d="M105 98c0-24 10-39 25-39s25 15 25 39" fill="none" stroke="#f4b77d" strokeWidth="7"/>
        <path d="M98 180h64l18 20H80Z" fill="#5f321f"/>
        <circle cx="130" cy="139" r="31" fill="#f29a50" opacity=".3"/>
        <circle cx="130" cy="139" r="19" fill="#f8bf7d" opacity=".55"/>
        <path d="M130 120v38M114 139h32" stroke="#fff0d8" strokeWidth="5" strokeLinecap="round"/>
        <path d="M72 113 51 96M188 113l21-17" stroke="#dc7c45" strokeWidth="6" strokeLinecap="round"/>
    </svg>;
}

function TacticalEngine() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Tactical chess mechanism">
        <ellipse cx="130" cy="211" rx="86" ry="18" fill="#120a06" opacity=".72"/>
        <g fill="#8f5031" stroke="#efaa74" strokeWidth="4">
            <circle cx="101" cy="137" r="43"/>
            <circle cx="162" cy="145" r="33"/>
        </g>
        <g fill="#3f2116">
            <circle cx="101" cy="137" r="19"/>
            <circle cx="162" cy="145" r="14"/>
        </g>
        <path d="M101 93v18M101 163v18M57 137h18M127 137h18M71 107l13 13M118 154l13 13M71 167l13-13M118 120l13-13" stroke="#f5b37f" strokeWidth="8" strokeLinecap="round"/>
        <path d="M162 112v14M162 164v14M129 145h14M181 145h14" stroke="#e59058" strokeWidth="7" strokeLinecap="round"/>
        <path d="M91 197h82" stroke="#6a3722" strokeWidth="16" strokeLinecap="round"/>
        <path d="m130 54 12 20-12 20-12-20Z" fill="#ffc18d"/>
    </svg>;
}

function JadeTemple() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Endgame temple">
        <defs>
            <linearGradient id="jade-stone" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#cbfff0"/>
                <stop offset=".48" stopColor="#5ebf9d"/>
                <stop offset="1" stopColor="#205c50"/>
            </linearGradient>
        </defs>
        <ellipse cx="130" cy="211" rx="90" ry="18" fill="#06130f" opacity=".72"/>
        <path d="M57 194h146l-17 15H74Z" fill="#1d5047"/>
        <path d="M73 184h114l-12-22H85Z" fill="#347b68"/>
        <path d="M87 159V86h18v73M155 159V86h18v73" stroke="url(#jade-stone)" strokeWidth="17"/>
        <path d="M73 85h114l-16-24H89Z" fill="url(#jade-stone)" stroke="#a8efd9" strokeWidth="4"/>
        <path d="M107 160c0-27 8-43 23-43s23 16 23 43" fill="#173d36"/>
        <path d="M130 117V86M116 100h28" stroke="#c9fff0" strokeWidth="5" strokeLinecap="round"/>
    </svg>;
}

function PromotionShrine() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Pawn promotion shrine">
        <ellipse cx="130" cy="211" rx="87" ry="18" fill="#06130f" opacity=".72"/>
        <path d="M68 196h124v14H68ZM83 173h94v18H83ZM98 150h64v18H98Z" fill="#2c7160" stroke="#74cdb0" strokeWidth="3"/>
        <circle cx="130" cy="127" r="17" fill="#71cfae" stroke="#c5ffed" strokeWidth="4"/>
        <path d="M115 146h30l9 15h-48Z" fill="#4da287"/>
        <path d="M130 111V76" stroke="#8be1c0" strokeWidth="7" strokeLinecap="round"/>
        <path d="m130 57 9 14 16 4-11 12 1 17-15-7-15 7 1-17-11-12 16-4Z" fill="#b6ffe8" stroke="#55b596" strokeWidth="4"/>
    </svg>;
}

function SacrificeAltar() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Chess sacrifice altar">
        <ellipse cx="130" cy="211" rx="88" ry="18" fill="#06130f" opacity=".72"/>
        <path d="M72 191h116l-17 18H89Z" fill="#1d5146"/>
        <path d="M91 181h78l-9-55h-60Z" fill="#347c68" stroke="#79d4b5" strokeWidth="4"/>
        <circle cx="130" cy="116" r="30" fill="#5de6bd" opacity=".18"/>
        <circle cx="130" cy="116" r="20" fill="#77e6c2" opacity=".28"/>
        <path d="M116 127h28l7 18h-42Z" fill="#b9ffea" stroke="#55af93" strokeWidth="4"/>
        <circle cx="130" cy="109" r="13" fill="#d2fff2"/>
        <path d="M130 77V50M101 87 80 66M159 87l21-21M94 116H65M166 116h29" stroke="#81e8c5" strokeWidth="6" strokeLinecap="round"/>
        <path d="m130 47 6 11-6 11-6-11Z" fill="#e4fff7"/>
    </svg>;
}

function ChampionThrone() {
    return <svg viewBox="0 0 260 240" role="img" aria-label="Chess champion throne">
        <ellipse cx="130" cy="213" rx="91" ry="18" fill="#06130f" opacity=".72"/>
        <path d="M77 195V96l22-26 18 21 13-35 13 35 18-21 22 26v99Z" fill="#3d8b75" stroke="#8cdfc1" strokeWidth="5"/>
        <path d="M96 195v-58c0-25 12-42 34-42s34 17 34 42v58Z" fill="#1b4b40"/>
        <path d="M106 151h48v44h-48Z" fill="#66b99d"/>
        <path d="M98 195h64l18 15H80Z" fill="#235d50"/>
        <path d="m130 44 10 16 18 4-13 14 2 19-17-8-17 8 2-19-13-14 18-4Z" fill="#c8ffed" stroke="#59b89a" strokeWidth="4"/>
        <path d="M130 106v32M115 122h30" stroke="#d7fff4" strokeWidth="5" strokeLinecap="round"/>
    </svg>;
}

const artwork: Record<CurriculumTone, React.FC[]> = {
    ice: [RookCitadel, BoardCompass, KnightGarden, KingGate],
    indigo: [IndigoCastle, ShieldHall, BookBridge, OpeningObservatory],
    copper: [CopperForge, PinObelisk, MateLantern, TacticalEngine],
    jade: [JadeTemple, PromotionShrine, SacrificeAltar, ChampionThrone]
};

export default function LessonLandmark({ tone, variant, className }: LandmarkProps) {
    const Artwork = artwork[tone][variant];
    return <div className={[styles.landmark, className].filter(Boolean).join(" ")} data-tone={tone}>
        <Artwork/>
    </div>;
}
