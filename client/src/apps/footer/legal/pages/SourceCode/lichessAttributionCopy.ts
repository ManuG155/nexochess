interface LichessAttributionCopy {
    title: string;
    description: string;
    open: string;
}

const copies: Record<string, LichessAttributionCopy> = {
    en: {
        title: "Lichess puzzle data",
        description: "NexoChess incorporates positions from the open lichess.org puzzle database, published under CC0 1.0. NexoChess is an independent project and is not affiliated with, sponsored by or endorsed by lichess.org.",
        open: "Open the Lichess puzzle database"
    },
    es: {
        title: "Datos de puzzles de Lichess",
        description: "NexoChess incorpora posiciones procedentes de la base de datos abierta de puzzles de lichess.org, publicada bajo CC0 1.0. NexoChess es un proyecto independiente y no está afiliado, patrocinado ni respaldado por lichess.org.",
        open: "Abrir la base de datos de puzzles de Lichess"
    },
    fr: {
        title: "Données de puzzles de Lichess",
        description: "NexoChess intègre des positions issues de la base de données ouverte de puzzles de lichess.org, publiée sous CC0 1.0. NexoChess est un projet indépendant, sans affiliation, parrainage ni soutien de lichess.org.",
        open: "Ouvrir la base de données de puzzles de Lichess"
    },
    de: {
        title: "Lichess-Puzzledaten",
        description: "NexoChess verwendet Stellungen aus der offenen Puzzle-Datenbank von lichess.org, die unter CC0 1.0 veröffentlicht ist. NexoChess ist ein unabhängiges Projekt und weder mit lichess.org verbunden noch von lichess.org gesponsert oder unterstützt.",
        open: "Lichess-Puzzle-Datenbank öffnen"
    },
    pt: {
        title: "Dados de puzzles do Lichess",
        description: "O NexoChess incorpora posições da base de dados aberta de puzzles do lichess.org, publicada sob CC0 1.0. O NexoChess é um projeto independente e não é afiliado, patrocinado nem apoiado pelo lichess.org.",
        open: "Abrir a base de dados de puzzles do Lichess"
    },
    ru: {
        title: "Данные задач Lichess",
        description: "NexoChess использует позиции из открытой базы шахматных задач lichess.org, опубликованной по лицензии CC0 1.0. NexoChess — независимый проект, не связанный с lichess.org и не спонсируемый или поддерживаемый им.",
        open: "Открыть базу задач Lichess"
    },
    zh: {
        title: "Lichess 谜题数据",
        description: "NexoChess 使用 lichess.org 开放谜题数据库中的局面，该数据库以 CC0 1.0 发布。NexoChess 是独立项目，与 lichess.org 不存在隶属、赞助或背书关系。",
        open: "打开 Lichess 谜题数据库"
    },
    vi: {
        title: "Dữ liệu bài tập Lichess",
        description: "NexoChess sử dụng các thế cờ từ cơ sở dữ liệu bài tập mở của lichess.org, được phát hành theo CC0 1.0. NexoChess là một dự án độc lập, không liên kết, được tài trợ hay chứng thực bởi lichess.org.",
        open: "Mở cơ sở dữ liệu bài tập Lichess"
    },
    hi: {
        title: "Lichess पहेली डेटा",
        description: "NexoChess, lichess.org के खुले पहेली डेटाबेस से स्थितियाँ शामिल करता है, जिसे CC0 1.0 के अंतर्गत प्रकाशित किया गया है। NexoChess एक स्वतंत्र परियोजना है और lichess.org से संबद्ध, प्रायोजित या समर्थित नहीं है।",
        open: "Lichess पहेली डेटाबेस खोलें"
    },
    mr: {
        title: "Lichess कोडे डेटा",
        description: "NexoChess मध्ये lichess.org च्या CC0 1.0 अंतर्गत प्रकाशित खुल्या कोडे डेटाबेसमधील स्थिती वापरल्या जातात. NexoChess हा स्वतंत्र प्रकल्प आहे आणि तो lichess.org शी संलग्न, प्रायोजित किंवा समर्थित नाही.",
        open: "Lichess कोडे डेटाबेस उघडा"
    },
    pl: {
        title: "Dane zadań Lichess",
        description: "NexoChess wykorzystuje pozycje z otwartej bazy zadań lichess.org, opublikowanej na zasadach CC0 1.0. NexoChess jest niezależnym projektem i nie jest powiązany, sponsorowany ani wspierany przez lichess.org.",
        open: "Otwórz bazę zadań Lichess"
    }
};

export function getLichessAttributionCopy(language: string) {
    const normalisedLanguage = language.toLowerCase().split("-")[0];
    return copies[normalisedLanguage] || copies.en;
}
