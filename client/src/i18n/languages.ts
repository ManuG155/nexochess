import LanguageOption from "@/types/LanguageOption";

import iconFlagsGb from "@assets/img/flags/GB.png";
import iconFlagsEs from "@assets/img/flags/ES.png";
import iconFlagsFr from "@assets/img/flags/FR.png";
import iconFlagsDe from "@assets/img/flags/DE.png";
import iconFlagsPt from "@assets/img/flags/PT.png";
import iconFlagsRu from "@assets/img/flags/RU.png";
import iconFlagsCn from "@assets/img/flags/CN.png";
import iconFlagsVn from "@assets/img/flags/VN.png";
import iconFlagsIn from "@assets/img/flags/IN.png";
import iconFlagsPl from "@assets/img/flags/PL.png";

const languages: LanguageOption[] = [
    {
        id: "en",
        label: "English",
        flag: iconFlagsGb
    },
    {
        id: "es",
        label: "Español",
        flag: iconFlagsEs
    },
    {
        id: "fr",
        label: "Français",
        flag: iconFlagsFr
    },
    {
        id: "de",
        label: "Deutsch",
        flag: iconFlagsDe
    },
    {
        id: "pt",
        label: "Português",
        flag: iconFlagsPt
    },
    {
        id: "ru",
        label: "Русский",
        flag: iconFlagsRu
    },
    {
        id: "zh",
        label: "中文",
        flag: iconFlagsCn
    },
    {
        id: "vi",
        label: "Tiếng Việt",
        flag: iconFlagsVn
    },
    {
        id: "hi",
        label: "हिन्दी",
        flag: iconFlagsIn
    },
    {
        id: "mr",
        label: "मराठी",
        flag: iconFlagsIn
    },
    {
        id: "pl",
        label: "Polski",
        flag: iconFlagsPl
    }
];

export default languages;
