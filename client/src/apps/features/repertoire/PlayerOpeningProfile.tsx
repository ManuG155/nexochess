import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { OpeningCatalogueEntry } from "./openingCatalogue";
import { PlayerOpeningProfile as PlayerOpeningProfileResult, PlayerOpeningStat, PlayerPlatform, PlayerSide, analysePlayerOpenings } from "./playerOpeningAnalysis";
import * as styles from "./profileV2.module.css";

interface PlayerOpeningProfileProps { catalogue: OpeningCatalogueEntry[]; onTrainFamily: (family: string, side: PlayerSide) => void; }
const GAME_LIMITS = [20, 50, 100, 250, 500, 1000];

function scoreLabel(value: number) {
    return new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 0 }).format(value);
}

function ProfileList({ title, items, emptyLabel }: { title: string; items: PlayerOpeningStat[]; emptyLabel: string; }) {
    return <div className={styles.repertoireColumn}><strong>{title}</strong>{items.length == 0 ? <p>{emptyLabel}</p> : items.slice(0, 6).map(item => <div key={`${item.side}-${item.family}`} className={styles.observedLine}><span>{item.family}</span><small>{item.games} · {scoreLabel(item.scoreRate)}</small></div>)}</div>;
}

function PlayerOpeningProfile({ catalogue, onTrainFamily }: PlayerOpeningProfileProps) {
    const { t } = useTranslation("repertoireCourse");
    const { t: tRepertoire } = useTranslation("repertoire");
    const [expanded, setExpanded] = useState(false);
    const [platform, setPlatform] = useState<PlayerPlatform>("chesscom");
    const [username, setUsername] = useState("");
    const [maximum, setMaximum] = useState(100);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [profile, setProfile] = useState<PlayerOpeningProfileResult>();

    async function analyse(event: React.FormEvent) {
        event.preventDefault();
        if (!username.trim() || loading) return;
        setLoading(true); setError("");
        try { setProfile(await analysePlayerOpenings(platform, username, maximum, catalogue)); }
        catch { setProfile(undefined); setError(t("profile.error")); }
        finally { setLoading(false); }
    }

    const recommendation = profile?.recommendations[0];
    return <section className={styles.profileCard}>
        <div className={styles.profileIntro}><div><span>{t("profile.eyebrow")}</span><strong>{t("profile.title")}</strong><p>{t("profile.intro")}</p></div>{expanded ? <em>{t("profile.optional")}</em> : <button type="button" className={styles.profileExpandButton} onClick={() => setExpanded(true)}>{t("profile.analyse")}</button>}</div>
        {expanded && <>
            <form className={styles.profileForm} onSubmit={analyse}>
                <label><span>{t("profile.platform")}</span><select value={platform} onChange={event => setPlatform(event.target.value as PlayerPlatform)}><option value="chesscom">Chess.com</option><option value="lichess">Lichess</option></select></label>
                <label className={styles.usernameField}><span>{t("profile.username")}</span><input value={username} onChange={event => setUsername(event.target.value)} placeholder={t("profile.usernamePlaceholder")} maxLength={40}/></label>
                <label><span>{t("profile.games")}</span><select value={maximum} onChange={event => setMaximum(Number(event.target.value))}>{GAME_LIMITS.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
                <button type="submit" disabled={loading || !username.trim()}>{loading ? t("profile.loading") : t("profile.analyse")}</button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
            {profile && <div className={styles.profileResult}>
                <div className={styles.resultHeader}><div><strong>{t("profile.resultTitle", { username: profile.username })}</strong><span>{t("profile.gamesAnalysed", { count: profile.gamesAnalysed })}</span></div><small>{t("profile.heuristic")}</small></div>
                {recommendation && <div className={styles.recommendation}><div><span>{t("profile.startHere")}</span><strong>{recommendation.family}</strong><p>{t("profile.recommendation", { side: tRepertoire(`side.${recommendation.side}`), games: recommendation.games, score: scoreLabel(recommendation.scoreRate), moves: recommendation.averageKnownMoves })}</p></div><button type="button" onClick={() => onTrainFamily(recommendation.family, recommendation.side)}>{t("profile.train")}</button></div>}
                <div className={styles.observedGrid}><ProfileList title={t("profile.whiteRepertoire")} items={profile.white} emptyLabel={t("profile.noData")}/><ProfileList title={t("profile.blackRepertoire")} items={profile.black} emptyLabel={t("profile.noData")}/></div>
            </div>}
        </>}
    </section>;
}
export default PlayerOpeningProfile;
