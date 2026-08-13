import { useTranslation } from "react-i18next";
import en from "./repertoireCopy/en";
import es from "./repertoireCopy/es";
import fr from "./repertoireCopy/fr";
import de from "./repertoireCopy/de";
import pt from "./repertoireCopy/pt";
import ru from "./repertoireCopy/ru";
import zh from "./repertoireCopy/zh";
import vi from "./repertoireCopy/vi";
import hi from "./repertoireCopy/hi";
import mr from "./repertoireCopy/mr";
import pl from "./repertoireCopy/pl";

export type RepertoireEnhancementCopy = typeof en;
const copy: Record<string, RepertoireEnhancementCopy> = { en, es, fr, de, pt, ru, zh, vi, hi, mr, pl };
export function formatEnhancementCopy(template: string, values: Record<string, string | number>) {
    return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}
export function useRepertoireEnhancementCopy() {
    const { i18n } = useTranslation();
    const language = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0].toLowerCase();
    return copy[language] || en;
}
