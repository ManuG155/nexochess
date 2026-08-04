import type { LegalSection } from "../../components/LegalDocument";

const copies: Record<string, LegalSection> = {
    en: {
        title: "Service operator and contact",
        paragraphs: [
            "NexoChess is an independent project operated by Manuel García Villaescusa, established in Spain, under the commercial name NexoChess.",
            "The direct contact address for questions, complaints and legal notices is contact@nexochess.com."
        ]
    },
    es: {
        title: "Titular del servicio y contacto",
        paragraphs: [
            "NexoChess es un proyecto independiente cuyo titular es Manuel García Villaescusa, establecido en España, y que opera bajo el nombre comercial NexoChess.",
            "La dirección de contacto directo para consultas, reclamaciones y comunicaciones legales es contact@nexochess.com."
        ]
    },
    fr: {
        title: "Exploitant du service et contact",
        paragraphs: [
            "NexoChess est un projet indépendant exploité par Manuel García Villaescusa, établi en Espagne, sous le nom commercial NexoChess.",
            "L’adresse de contact direct pour les questions, réclamations et notifications juridiques est contact@nexochess.com."
        ]
    },
    de: {
        title: "Diensteanbieter und Kontakt",
        paragraphs: [
            "NexoChess ist ein unabhängiges Projekt, das von Manuel García Villaescusa mit Sitz in Spanien unter dem Handelsnamen NexoChess betrieben wird.",
            "Die direkte Kontaktadresse für Fragen, Beschwerden und rechtliche Mitteilungen lautet contact@nexochess.com."
        ]
    },
    pt: {
        title: "Responsável pelo serviço e contacto",
        paragraphs: [
            "O NexoChess é um projeto independente operado por Manuel García Villaescusa, estabelecido em Espanha, sob o nome comercial NexoChess.",
            "O endereço de contacto direto para dúvidas, reclamações e comunicações legais é contact@nexochess.com."
        ]
    },
    ru: {
        title: "Оператор сервиса и контакты",
        paragraphs: [
            "NexoChess — независимый проект, которым управляет Manuel García Villaescusa, находящийся в Испании, под коммерческим наименованием NexoChess.",
            "Прямой адрес для вопросов, жалоб и юридических уведомлений: contact@nexochess.com."
        ]
    },
    zh: {
        title: "服务运营者与联系方式",
        paragraphs: [
            "NexoChess 是一个独立项目，由位于西班牙的 Manuel García Villaescusa 以 NexoChess 商业名称运营。",
            "用于咨询、投诉和法律通知的直接联系地址是 contact@nexochess.com。"
        ]
    },
    vi: {
        title: "Đơn vị vận hành và liên hệ",
        paragraphs: [
            "NexoChess là một dự án độc lập do Manuel García Villaescusa, có trụ sở tại Tây Ban Nha, vận hành dưới tên thương mại NexoChess.",
            "Địa chỉ liên hệ trực tiếp cho câu hỏi, khiếu nại và thông báo pháp lý là contact@nexochess.com."
        ]
    },
    hi: {
        title: "सेवा संचालक और संपर्क",
        paragraphs: [
            "NexoChess एक स्वतंत्र परियोजना है, जिसका संचालन स्पेन में स्थापित Manuel García Villaescusa द्वारा NexoChess व्यापारिक नाम के अंतर्गत किया जाता है।",
            "प्रश्नों, शिकायतों और कानूनी सूचनाओं के लिए सीधा संपर्क पता contact@nexochess.com है।"
        ]
    },
    mr: {
        title: "सेवा संचालक आणि संपर्क",
        paragraphs: [
            "NexoChess हा स्वतंत्र प्रकल्प असून तो स्पेनमध्ये स्थापित Manuel García Villaescusa यांच्याकडून NexoChess या व्यापारी नावाने चालवला जातो.",
            "प्रश्न, तक्रारी आणि कायदेशीर सूचना यांसाठी थेट संपर्क पत्ता contact@nexochess.com आहे."
        ]
    },
    pl: {
        title: "Operator usługi i kontakt",
        paragraphs: [
            "NexoChess jest niezależnym projektem prowadzonym przez Manuela Garcíę Villaescusę, działającego w Hiszpanii pod nazwą handlową NexoChess.",
            "Bezpośredni adres kontaktowy do pytań, reklamacji i zawiadomień prawnych to contact@nexochess.com."
        ]
    }
};

export function getOperatorIdentityCopy(language: string) {
    const normalisedLanguage = language.toLowerCase().split("-")[0];
    return copies[normalisedLanguage] || copies.en;
}
