import type { LegalDocumentCopy } from "../../components/LegalDocument";

const revisions: Record<string, LegalDocumentCopy> = {
    en: {
        updated: "Last updated: 4 August 2026",
        plainSummary: "Analysis can remain in your browser. An optional account adds necessary authentication cookies and D1 storage for account data, cloud Archive games and puzzle progress. Optional analytics and advertising tracking are currently disabled.",
        sections: {
            controller: {
                title: "Controller and contact",
                paragraphs: [
                    "The controller for the processing described in this policy is Manuel García Villaescusa, established in Spain and operating the independent project NexoChess.",
                    "Privacy questions and rights requests can be sent to contact@nexochess.com."
                ]
            },
            dataCollected: {
                title: "Data we process",
                paragraphs: ["The categories depend on the features you use."],
                bullets: [
                    "Local browser data: language, appearance, analysis preferences, recent imports, local Archive games and locally stored puzzle progress.",
                    "Account and authentication data: email address, display name, username, provider identifiers, account and session records, roles, creation dates and optional date of birth.",
                    "Chess data: PGN, FEN, player names, public usernames, comments, positions, analysis results, Archive metadata and the complete saved game.",
                    "Puzzle data: rating, attempts, correct answers, streaks, completed puzzle identifiers, completion time, source and whether help was used.",
                    "Technical and security data: IP address, request headers, timestamps, device or browser information, error information and security or abuse events processed by NexoChess or its infrastructure providers.",
                    "Messages and account emails associated with requests sent to contact@nexochess.com."
                ]
            },
            purposes: {
                title: "Purposes",
                bullets: [
                    "Provide browser analysis, Archive, puzzles, settings and sharing features.",
                    "Create accounts, authenticate sessions, synchronise cloud data and send transactional account messages.",
                    "Protect the service, prevent abuse, investigate faults and maintain availability.",
                    "Respond to support, privacy and legal requests and comply with applicable obligations.",
                    "Optional analytics or advertising will only be activated after the required notice and consent mechanism is available."
                ]
            },
            legalBases: {
                title: "Legal bases",
                paragraphs: [
                    "Processing needed to provide requested features or manage an account is based on performance of the Terms or steps requested before using those features. Security, fraud prevention and service improvement rely on NexoChess's legitimate interest in operating a safe and reliable service, balanced against user rights.",
                    "Processing may also be necessary to comply with legal obligations or handle legal claims. Consent will be used where required for optional analytics, advertising or other non-essential storage, and it may be withdrawn at any time without affecting earlier lawful processing."
                ]
            },
            browserStorage: {
                title: "Browser storage and necessary cookies",
                paragraphs: [
                    "NexoChess uses localStorage and IndexedDB for functional purposes such as remembering language and settings, retaining imports and maintaining the guest Archive or local progress. This data remains on that browser until you remove it or the browser clears it.",
                    "When you sign in, strictly necessary authentication cookies or equivalent session storage keep the session secure. NexoChess currently does not activate optional analytics or advertising cookies. Clearing cookies may sign you out; clearing browser storage may remove local games and settings."
                ]
            },
            accounts: {
                title: "Accounts, Google sign-in and D1 storage",
                paragraphs: [
                    "Account, session, cloud Archive and puzzle-progress data are stored in the NexoChess Cloudflare D1 database. Password credentials are handled by the authentication system and are not stored as readable passwords.",
                    "If you choose Google sign-in, Google authenticates you and provides the basic account data needed to create or link the NexoChess account. Account deletion is available through the service; completed deletion removes active account data and directly associated cloud Archive and puzzle records, except information that must temporarily remain in backups, security records or legal files."
                ]
            },
            publicSharing: {
                title: "Public profiles and shared games",
                paragraphs: [
                    "A public profile may display your display name, username, roles and account creation date. Do not use a display name or username that reveals information you do not want to make public.",
                    "When a cloud Archive game is shared, anyone who obtains its unique link may access the complete saved game, including player names, public usernames, positions and analysis data contained in it. Delete the cloud game to disable that NexoChess link, and do not share games containing information you are not entitled to disclose."
                ]
            },
            providers: {
                title: "Providers and external platforms",
                bullets: [
                    "Cloudflare: website delivery, Workers, D1 database, security and operational processing.",
                    "Google: optional OAuth account authentication.",
                    "Brevo: transactional account email delivery.",
                    "Chess.com and lichess.org: retrieval of a public game when you request an import; lichess.org also provides the open puzzle dataset used by the training feature.",
                    "Each provider processes data under its own terms and privacy information. NexoChess does not sell personal data."
                ]
            },
            internationalTransfers: {
                title: "International processing and transfers",
                paragraphs: [
                    "Some providers operate global infrastructure and may process data outside Spain or the European Economic Area. Where European data-protection law applies, NexoChess relies on the provider's applicable contractual and legal safeguards, such as adequacy decisions, the EU-U.S. Data Privacy Framework where valid, or Standard Contractual Clauses.",
                    "Provider privacy notices linked on this page contain further information about their locations and safeguards."
                ]
            },
            retention: {
                title: "Retention",
                paragraphs: [
                    "Local browser data remains until you delete it, clear browser data or lose access to that browser. Active account, cloud Archive and puzzle-progress data remain while needed to provide those features and until you delete the relevant item or account.",
                    "Sessions expire or are revoked according to the authentication configuration. Security and operational logs, support messages, deletion records and backup copies are retained only for proportionate periods needed for security, recovery, dispute handling or legal obligations, after which they are deleted or anonymised."
                ]
            },
            security: {
                title: "Security",
                paragraphs: [
                    "NexoChess uses measures such as HTTPS, authenticated access to private account endpoints, access controls, input validation, request-size limits and provider security protections. Passwords are not displayed or stored as readable text.",
                    "No online service can guarantee absolute security. Protect your account, use a unique password and contact us promptly if you suspect unauthorised access."
                ]
            },
            automatedDecisions: {
                title: "Automated analysis and decisions",
                paragraphs: [
                    "Stockfish evaluations, move labels, estimated ratings and puzzle-rating changes are generated automatically to provide chess feedback. They are not used to make decisions that produce legal or similarly significant effects about you.",
                    "NexoChess does not use the submitted games to issue official cheating findings or disciplinary decisions."
                ]
            },
            rights: {
                title: "Your rights",
                paragraphs: [
                    "Where applicable, you may request access, correction, deletion, restriction, objection or portability, and withdraw consent where processing relies on consent. We may request information reasonably necessary to verify identity and protect the account.",
                    "Send requests to contact@nexochess.com. You may also lodge a complaint with the Spanish Data Protection Agency or another competent supervisory authority."
                ]
            },
            children: {
                title: "Children",
                paragraphs: [
                    "NexoChess is not directed to children under 14. The date-of-birth field is optional and must not be used to provide false information.",
                    "If you believe a child has provided personal data without the permission required by applicable law, contact us so the situation can be reviewed."
                ]
            },
            changes: {
                title: "Changes to this policy",
                paragraphs: [
                    "This policy may be updated when NexoChess, its providers or applicable law changes. The revision date appears at the top.",
                    "Material changes will be highlighted through the service and, where appropriate, by account email before they take effect."
                ]
            }
        }
    },
    es: {
        updated: "Última actualización: 4 de agosto de 2026",
        plainSummary: "El análisis puede permanecer en tu navegador. Una cuenta opcional añade cookies necesarias de autenticación y almacenamiento D1 para la cuenta, las partidas del Archivo en la nube y el progreso de puzzles. La analítica y el seguimiento publicitario opcionales están desactivados actualmente.",
        sections: {
            controller: {
                title: "Responsable y contacto",
                paragraphs: [
                    "El responsable de los tratamientos descritos en esta política es Manuel García Villaescusa, establecido en España y titular del proyecto independiente NexoChess.",
                    "Las consultas de privacidad y solicitudes de derechos pueden enviarse a contact@nexochess.com."
                ]
            },
            dataCollected: {
                title: "Datos que tratamos",
                paragraphs: ["Las categorías dependen de las funciones que utilices."],
                bullets: [
                    "Datos locales del navegador: idioma, apariencia, preferencias de análisis, importaciones recientes, partidas del Archivo local y progreso de puzzles guardado localmente.",
                    "Datos de cuenta y autenticación: correo electrónico, nombre visible, nombre de usuario, identificadores del proveedor, registros de cuenta y sesión, roles, fechas de creación y fecha de nacimiento opcional.",
                    "Datos de ajedrez: PGN, FEN, nombres de jugadores, usuarios públicos, comentarios, posiciones, resultados de análisis, metadatos del Archivo y partida completa guardada.",
                    "Datos de puzzles: puntuación, intentos, aciertos, rachas, identificadores completados, fecha de finalización, procedencia y uso de ayuda.",
                    "Datos técnicos y de seguridad: dirección IP, cabeceras, fechas, información de dispositivo o navegador, errores y sucesos de seguridad o abuso tratados por NexoChess o sus proveedores de infraestructura.",
                    "Mensajes y correos de cuenta vinculados a solicitudes enviadas a contact@nexochess.com."
                ]
            },
            purposes: {
                title: "Finalidades",
                bullets: [
                    "Prestar el análisis en el navegador, el Archivo, los puzzles, los ajustes y las funciones de compartir.",
                    "Crear cuentas, autenticar sesiones, sincronizar datos en la nube y enviar mensajes transaccionales de cuenta.",
                    "Proteger el servicio, prevenir abusos, investigar fallos y mantener la disponibilidad.",
                    "Atender soporte, privacidad y solicitudes legales y cumplir obligaciones aplicables.",
                    "La analítica o publicidad opcional solo se activará cuando exista la información y el mecanismo de consentimiento exigibles."
                ]
            },
            legalBases: {
                title: "Bases jurídicas",
                paragraphs: [
                    "El tratamiento necesario para prestar funciones solicitadas o gestionar una cuenta se basa en la ejecución de los Términos o en medidas solicitadas antes de utilizar esas funciones. La seguridad, prevención del fraude y mejora del servicio se apoyan en el interés legítimo de NexoChess por operar un servicio seguro y fiable, ponderado frente a los derechos del usuario.",
                    "También podremos tratar datos para cumplir obligaciones legales o gestionar reclamaciones. Cuando sea exigible, se solicitará consentimiento para analítica, publicidad u otro almacenamiento no esencial; podrá retirarse en cualquier momento sin afectar al tratamiento previo lícito."
                ]
            },
            browserStorage: {
                title: "Almacenamiento del navegador y cookies necesarias",
                paragraphs: [
                    "NexoChess utiliza localStorage e IndexedDB con fines funcionales, como recordar idioma y ajustes, conservar importaciones y mantener el Archivo de invitado o el progreso local. Los datos permanecen en ese navegador hasta que los elimines o el navegador los borre.",
                    "Al iniciar sesión, las cookies de autenticación estrictamente necesarias o el almacenamiento de sesión equivalente mantienen la sesión segura. NexoChess no activa actualmente cookies opcionales de analítica o publicidad. Borrar cookies puede cerrar la sesión; borrar el almacenamiento puede eliminar partidas y ajustes locales."
                ]
            },
            accounts: {
                title: "Cuentas, acceso con Google y almacenamiento D1",
                paragraphs: [
                    "Los datos de cuenta, sesión, Archivo en la nube y progreso de puzzles se almacenan en la base Cloudflare D1 de NexoChess. Las credenciales de contraseña son gestionadas por el sistema de autenticación y no se guardan como contraseñas legibles.",
                    "Al elegir Google, Google te autentica y facilita los datos básicos necesarios para crear o vincular la cuenta. La eliminación está disponible en el servicio; al completarse, se eliminan de la base activa la cuenta y sus partidas y progreso asociados, salvo datos que deban permanecer temporalmente en copias de seguridad, registros de seguridad o expedientes legales."
                ]
            },
            publicSharing: {
                title: "Perfiles públicos y partidas compartidas",
                paragraphs: [
                    "Un perfil público puede mostrar tu nombre visible, usuario, roles y fecha de creación de la cuenta. No utilices un nombre o usuario que revele información que no quieras hacer pública.",
                    "Cuando compartes una partida del Archivo en la nube, cualquiera que obtenga su enlace único puede acceder a la partida completa, incluidos nombres, usuarios públicos, posiciones y análisis. Elimina la partida de la nube para desactivar ese enlace de NexoChess y no compartas contenido que no tengas derecho a divulgar."
                ]
            },
            providers: {
                title: "Proveedores y plataformas externas",
                bullets: [
                    "Cloudflare: entrega de la web, Workers, base D1, seguridad y tratamiento operativo.",
                    "Google: autenticación OAuth opcional.",
                    "Brevo: entrega de correos transaccionales de cuenta.",
                    "Chess.com y lichess.org: recuperación de una partida pública cuando solicitas importarla; lichess.org también proporciona la base abierta de puzzles.",
                    "Cada proveedor trata datos conforme a sus propias condiciones e información de privacidad. NexoChess no vende datos personales."
                ]
            },
            internationalTransfers: {
                title: "Tratamiento y transferencias internacionales",
                paragraphs: [
                    "Algunos proveedores operan infraestructura global y pueden tratar datos fuera de España o del Espacio Económico Europeo. Cuando se aplica la normativa europea, NexoChess se apoya en las garantías contractuales y legales aplicables del proveedor, como decisiones de adecuación, el Marco de Privacidad de Datos UE-EE. UU. cuando resulte válido o cláusulas contractuales tipo.",
                    "Los avisos de privacidad enlazados en esta página ofrecen más información sobre ubicaciones y garantías."
                ]
            },
            retention: {
                title: "Conservación",
                paragraphs: [
                    "Los datos locales permanecen hasta que los elimines, borres los datos del navegador o pierdas acceso a ese navegador. Los datos de cuenta, Archivo en la nube y progreso permanecen mientras sean necesarios para prestar esas funciones y hasta que elimines el elemento o la cuenta.",
                    "Las sesiones caducan o se revocan según la configuración de autenticación. Los registros de seguridad y operación, mensajes de soporte, constancias de eliminación y copias de seguridad se conservan únicamente durante periodos proporcionados para seguridad, recuperación, reclamaciones u obligaciones legales, y después se eliminan o anonimizan."
                ]
            },
            security: {
                title: "Seguridad",
                paragraphs: [
                    "NexoChess aplica medidas como HTTPS, autenticación en endpoints privados, controles de acceso, validación de entradas, límites de tamaño de petición y protecciones de los proveedores. Las contraseñas no se muestran ni se almacenan como texto legible.",
                    "Ningún servicio en línea puede garantizar seguridad absoluta. Protege tu cuenta, utiliza una contraseña única y contacta rápidamente si sospechas un acceso no autorizado."
                ]
            },
            automatedDecisions: {
                title: "Análisis automatizado y decisiones",
                paragraphs: [
                    "Las evaluaciones de Stockfish, etiquetas de jugadas, puntuaciones estimadas y cambios de puntuación de puzzles se generan automáticamente para ofrecer información ajedrecística. No se utilizan para adoptar decisiones que produzcan efectos jurídicos o de importancia similar sobre ti.",
                    "NexoChess no utiliza las partidas enviadas para emitir conclusiones oficiales de trampas ni decisiones disciplinarias."
                ]
            },
            rights: {
                title: "Tus derechos",
                paragraphs: [
                    "Cuando corresponda, puedes solicitar acceso, rectificación, supresión, limitación, oposición o portabilidad, y retirar el consentimiento cuando el tratamiento dependa de él. Podremos solicitar información razonablemente necesaria para verificar la identidad y proteger la cuenta.",
                    "Envía las solicitudes a contact@nexochess.com. También puedes reclamar ante la Agencia Española de Protección de Datos u otra autoridad de control competente."
                ]
            },
            children: {
                title: "Menores",
                paragraphs: [
                    "NexoChess no está dirigido a menores de 14 años. El campo de fecha de nacimiento es opcional y no debe utilizarse para facilitar información falsa.",
                    "Si crees que un menor ha facilitado datos sin el permiso requerido por la legislación aplicable, contacta para que podamos revisar la situación."
                ]
            },
            changes: {
                title: "Cambios en esta política",
                paragraphs: [
                    "La política podrá actualizarse cuando cambien NexoChess, sus proveedores o la normativa. La fecha de revisión aparece al inicio.",
                    "Los cambios importantes se destacarán en el servicio y, cuando proceda, por correo de la cuenta antes de su entrada en vigor."
                ]
            }
        }
    },
    fr: {
        updated: "Dernière mise à jour : 4 août 2026",
        plainSummary: "L’analyse peut rester dans votre navigateur. Un compte facultatif ajoute les cookies d’authentification nécessaires et le stockage D1 du compte, des parties cloud et de la progression. Les traceurs facultatifs d’analyse et de publicité sont désactivés.",
        sections: {
            controller: { title: "Responsable et contact", paragraphs: ["Le responsable est Manuel García Villaescusa, établi en Espagne et exploitant le projet indépendant NexoChess.", "Les demandes relatives à la vie privée peuvent être envoyées à contact@nexochess.com."] },
            dataCollected: { title: "Données traitées", bullets: ["Préférences, imports, Archive et progression conservés localement dans le navigateur.", "E-mail, nom affiché, nom d’utilisateur, identifiants de fournisseur, comptes, sessions, rôles, dates et date de naissance facultative.", "PGN, FEN, joueurs, noms publics, positions, commentaires, analyses et parties enregistrées.", "Classement et historique de résolution des puzzles.", "Adresse IP, en-têtes, dates, navigateur, erreurs et événements de sécurité traités par NexoChess ou ses prestataires.", "Messages de contact et e-mails transactionnels."] },
            purposes: { title: "Finalités", bullets: ["Fournir l’analyse, l’Archive, les puzzles, les réglages et le partage.", "Gérer les comptes, sessions, synchronisation et e-mails de compte.", "Assurer la sécurité, prévenir les abus, corriger les erreurs et répondre aux demandes.", "Respecter les obligations légales.", "L’analyse d’audience et la publicité facultatives ne seront activées qu’après information et consentement requis."] },
            legalBases: { title: "Bases juridiques", paragraphs: ["Les fonctions demandées et le compte reposent sur l’exécution des Conditions ou les mesures demandées. La sécurité et la fiabilité reposent sur l’intérêt légitime de NexoChess, mis en balance avec vos droits.", "Les obligations légales et réclamations peuvent nécessiter un traitement. Le consentement sera utilisé lorsqu’il est requis pour les fonctions non essentielles et pourra être retiré."] },
            browserStorage: { title: "Stockage du navigateur et cookies nécessaires", paragraphs: ["localStorage et IndexedDB conservent les réglages, imports, Archive invité et progression locale jusqu’à leur suppression.", "La connexion utilise des cookies d’authentification strictement nécessaires. Aucun cookie facultatif d’analyse ou de publicité n’est actuellement activé."] },
            accounts: { title: "Comptes, Google et D1", paragraphs: ["Les comptes, sessions, parties cloud et progression sont stockés dans Cloudflare D1. Les mots de passe ne sont pas conservés en clair.", "Google fournit les données de base nécessaires lorsque vous choisissez OAuth. La suppression du compte efface les données actives associées, sous réserve des sauvegardes, journaux de sécurité et obligations légales temporaires."] },
            publicSharing: { title: "Profils publics et parties partagées", paragraphs: ["Un profil public peut afficher le nom, l’utilisateur, les rôles et la date de création.", "Toute personne possédant le lien unique d’une partie cloud partagée peut consulter la partie complète. Sa suppression désactive le lien NexoChess."] },
            providers: { title: "Prestataires", bullets: ["Cloudflare : hébergement, Workers, D1 et sécurité.", "Google : connexion OAuth facultative.", "Brevo : e-mails transactionnels.", "Chess.com et lichess.org : import de parties publiques ; lichess.org fournit également les puzzles ouverts.", "NexoChess ne vend pas les données personnelles."] },
            internationalTransfers: { title: "Transferts internationaux", paragraphs: ["Les prestataires mondiaux peuvent traiter des données hors d’Espagne ou de l’EEE. Les garanties applicables peuvent inclure décisions d’adéquation, cadre UE–États-Unis ou clauses contractuelles types.", "Leurs avis de confidentialité fournissent les détails."] },
            retention: { title: "Conservation", paragraphs: ["Les données locales restent jusqu’à leur suppression. Les données cloud restent tant que la fonction est utilisée ou jusqu’à la suppression de l’élément ou du compte.", "Sessions, journaux, assistance et sauvegardes sont conservés pendant des durées proportionnées à la sécurité, récupération, litiges ou obligations légales."] },
            security: { title: "Sécurité", paragraphs: ["HTTPS, authentification, contrôles d’accès, validation, limites de requêtes et protections des prestataires sont utilisés.", "Aucun service ne garantit une sécurité absolue ; protégez vos identifiants et signalez tout accès suspect."] },
            automatedDecisions: { title: "Analyse automatisée", paragraphs: ["Les évaluations et classements sont automatiques mais ne produisent aucune décision juridique ou effet similaire.", "NexoChess n’émet pas de conclusion officielle de triche ou de sanction."] },
            rights: { title: "Vos droits", paragraphs: ["Vous pouvez exercer les droits applicables d’accès, rectification, effacement, limitation, opposition, portabilité et retrait du consentement. Une vérification d’identité peut être demandée.", "Écrivez à contact@nexochess.com ou saisissez l’autorité de contrôle compétente."] },
            children: { title: "Mineurs", paragraphs: ["NexoChess ne s’adresse pas aux moins de 14 ans. La date de naissance est facultative.", "Contactez-nous si un mineur a fourni des données sans l’autorisation requise."] },
            changes: { title: "Modifications", paragraphs: ["La politique peut évoluer avec le service, les prestataires ou la loi.", "Les changements importants seront signalés avant leur entrée en vigueur lorsque cela est approprié."] }
        }
    },
    de: {
        updated: "Zuletzt aktualisiert: 4. August 2026",
        plainSummary: "Analysen können im Browser bleiben. Ein optionales Konto nutzt notwendige Authentifizierungs-Cookies und D1-Speicherung für Konto, Cloud-Archiv und Puzzle-Fortschritt. Optionale Analyse- und Werbetracker sind deaktiviert.",
        sections: {
            controller: { title: "Verantwortlicher und Kontakt", paragraphs: ["Verantwortlicher ist Manuel García Villaescusa mit Niederlassung in Spanien, Betreiber des unabhängigen Projekts NexoChess.", "Datenschutzanfragen können an contact@nexochess.com gesendet werden."] },
            dataCollected: { title: "Verarbeitete Daten", bullets: ["Lokale Einstellungen, Importe, Archivspiele und Fortschritt im Browser.", "E-Mail, Anzeigename, Benutzername, Anbieterkennungen, Konto-, Sitzungs- und Rollendaten sowie optionales Geburtsdatum.", "PGN, FEN, Spielernamen, öffentliche Nutzernamen, Stellungen, Kommentare, Analysen und gespeicherte Spiele.", "Puzzle-Wertung, Versuche, Ergebnisse, Serien und erledigte Puzzle-IDs.", "IP-Adresse, Header, Zeitpunkte, Browser-, Fehler- und Sicherheitsdaten.", "Kontaktanfragen und Transaktions-E-Mails."] },
            purposes: { title: "Zwecke", bullets: ["Analyse, Archiv, Puzzles, Einstellungen und Teilen bereitstellen.", "Konten, Sitzungen, Synchronisierung und Konto-E-Mails verwalten.", "Sicherheit, Missbrauchsprävention, Fehlerbehebung und Support.", "Gesetzliche Pflichten erfüllen.", "Optionale Analyse oder Werbung erst nach erforderlicher Information und Einwilligung aktivieren."] },
            legalBases: { title: "Rechtsgrundlagen", paragraphs: ["Angeforderte Funktionen und Kontoverwaltung beruhen auf Vertragserfüllung oder vorvertraglichen Maßnahmen. Sicherheit und Zuverlässigkeit beruhen auf berechtigtem Interesse unter Abwägung der Nutzerrechte.", "Gesetzliche Pflichten und Rechtsansprüche können Verarbeitung erfordern. Für nicht notwendige Funktionen wird erforderlichenfalls Einwilligung eingeholt und widerrufbar sein."] },
            browserStorage: { title: "Browserspeicher und notwendige Cookies", paragraphs: ["localStorage und IndexedDB speichern Einstellungen, Importe, Gast-Archiv und lokalen Fortschritt bis zur Löschung.", "Die Anmeldung verwendet unbedingt notwendige Authentifizierungs-Cookies. Optionale Analyse- oder Werbe-Cookies sind derzeit nicht aktiv."] },
            accounts: { title: "Konten, Google und D1", paragraphs: ["Konten, Sitzungen, Cloud-Spiele und Puzzle-Fortschritt werden in Cloudflare D1 gespeichert. Passwörter werden nicht lesbar gespeichert.", "Bei Google OAuth werden erforderliche Basisdaten übermittelt. Die Kontolöschung entfernt aktive verknüpfte Daten, vorbehaltlich vorübergehender Backups, Sicherheitsprotokolle und gesetzlicher Pflichten."] },
            publicSharing: { title: "Öffentliche Profile und geteilte Spiele", paragraphs: ["Ein öffentliches Profil kann Anzeigename, Benutzername, Rollen und Erstellungsdatum zeigen.", "Jeder mit dem eindeutigen Link kann ein geteiltes Cloud-Spiel vollständig sehen. Die Löschung deaktiviert den NexoChess-Link."] },
            providers: { title: "Anbieter", bullets: ["Cloudflare: Bereitstellung, Workers, D1 und Sicherheit.", "Google: optionale OAuth-Anmeldung.", "Brevo: Transaktions-E-Mails.", "Chess.com und lichess.org: Abruf öffentlicher Spiele; lichess.org stellt außerdem offene Puzzle-Daten bereit.", "NexoChess verkauft keine personenbezogenen Daten."] },
            internationalTransfers: { title: "Internationale Übermittlungen", paragraphs: ["Globale Anbieter können Daten außerhalb Spaniens oder des EWR verarbeiten. Schutzmechanismen können Angemessenheitsbeschlüsse, den EU-US-Datenschutzrahmen oder Standardvertragsklauseln umfassen.", "Weitere Angaben stehen in den Datenschutzhinweisen der Anbieter."] },
            retention: { title: "Speicherdauer", paragraphs: ["Lokale Daten bleiben bis zur Löschung. Cloud-Daten bleiben für die Nutzung der Funktion oder bis zur Löschung des Elements oder Kontos.", "Sitzungen, Protokolle, Supportdaten und Backups werden nur angemessen lange für Sicherheit, Wiederherstellung, Streitfälle oder gesetzliche Pflichten aufbewahrt."] },
            security: { title: "Sicherheit", paragraphs: ["HTTPS, Authentifizierung, Zugriffskontrollen, Validierung, Größenlimits und Anbieterschutz werden eingesetzt.", "Absolute Sicherheit kann nicht garantiert werden; schützen Sie Ihre Zugangsdaten und melden Sie verdächtigen Zugriff."] },
            automatedDecisions: { title: "Automatisierte Analyse", paragraphs: ["Bewertungen und Puzzle-Ratings werden automatisch erzeugt, führen aber nicht zu rechtlichen oder ähnlich erheblichen Entscheidungen.", "NexoChess trifft keine offiziellen Betrugs- oder Disziplinarentscheidungen."] },
            rights: { title: "Ihre Rechte", paragraphs: ["Sie können die anwendbaren Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch, Übertragbarkeit und Widerruf ausüben. Eine Identitätsprüfung kann erforderlich sein.", "Kontakt: contact@nexochess.com oder zuständige Aufsichtsbehörde."] },
            children: { title: "Kinder", paragraphs: ["NexoChess richtet sich nicht an Kinder unter 14 Jahren; das Geburtsdatum ist optional.", "Kontaktieren Sie uns bei unzulässiger Datenangabe eines Kindes."] },
            changes: { title: "Änderungen", paragraphs: ["Die Richtlinie kann bei Änderungen des Dienstes, der Anbieter oder des Rechts aktualisiert werden.", "Wesentliche Änderungen werden gegebenenfalls vor Inkrafttreten hervorgehoben."] }
        }
    },
    pt: {
        updated: "Última atualização: 4 de agosto de 2026",
        plainSummary: "A análise pode permanecer no navegador. Uma conta opcional acrescenta cookies necessários e armazenamento D1 para conta, Arquivo na nuvem e progresso. A análise e publicidade opcionais estão desativadas.",
        sections: {
            controller: { title: "Responsável e contacto", paragraphs: ["O responsável é Manuel García Villaescusa, estabelecido em Espanha e operador do projeto independente NexoChess.", "Pedidos de privacidade podem ser enviados para contact@nexochess.com."] },
            dataCollected: { title: "Dados tratados", bullets: ["Preferências, importações, Arquivo e progresso guardados localmente.", "Email, nome visível, utilizador, identificadores de fornecedor, conta, sessões, funções, datas e data de nascimento opcional.", "PGN, FEN, jogadores, utilizadores públicos, posições, comentários, análises e jogos guardados.", "Classificação e histórico de puzzles.", "IP, cabeçalhos, datas, navegador, erros e eventos de segurança.", "Mensagens e emails transacionais."] },
            purposes: { title: "Finalidades", bullets: ["Prestar análise, Arquivo, puzzles, definições e partilha.", "Gerir contas, sessões, sincronização e emails.", "Segurança, prevenção de abuso, resolução de falhas e suporte.", "Cumprir obrigações legais.", "Ativar análise ou publicidade opcionais apenas após informação e consentimento exigidos."] },
            legalBases: { title: "Bases legais", paragraphs: ["As funções pedidas e a conta baseiam-se na execução dos Termos ou medidas prévias solicitadas. Segurança e fiabilidade baseiam-se no interesse legítimo ponderado com os direitos do utilizador.", "Obrigações legais e reclamações podem exigir tratamento. Será pedido consentimento quando necessário para funções não essenciais e poderá ser retirado."] },
            browserStorage: { title: "Armazenamento e cookies necessários", paragraphs: ["localStorage e IndexedDB guardam definições, importações, Arquivo de convidado e progresso local até serem apagados.", "A sessão utiliza cookies de autenticação estritamente necessários. Não existem atualmente cookies opcionais de análise ou publicidade."] },
            accounts: { title: "Contas, Google e D1", paragraphs: ["Conta, sessão, jogos na nuvem e progresso são guardados em Cloudflare D1. As palavras-passe não são armazenadas de forma legível.", "Google fornece dados básicos quando escolhe OAuth. A eliminação da conta remove dados ativos associados, salvo backups, segurança e obrigações legais temporárias."] },
            publicSharing: { title: "Perfis públicos e jogos partilhados", paragraphs: ["O perfil público pode mostrar nome, utilizador, funções e data de criação.", "Qualquer pessoa com o link único pode ver o jogo partilhado completo. Apagar o jogo desativa o link NexoChess."] },
            providers: { title: "Fornecedores", bullets: ["Cloudflare: entrega, Workers, D1 e segurança.", "Google: OAuth opcional.", "Brevo: emails transacionais.", "Chess.com e lichess.org: jogos públicos; lichess.org também fornece puzzles abertos.", "NexoChess não vende dados pessoais."] },
            internationalTransfers: { title: "Transferências internacionais", paragraphs: ["Fornecedores globais podem tratar dados fora de Espanha ou do EEE, usando garantias como adequação, quadro UE-EUA ou cláusulas contratuais-tipo quando aplicáveis.", "Consulte os avisos dos fornecedores."] },
            retention: { title: "Conservação", paragraphs: ["Dados locais permanecem até serem apagados. Dados na nuvem permanecem enquanto a função for usada ou até apagar o item ou conta.", "Sessões, registos, suporte e backups são mantidos por períodos proporcionados para segurança, recuperação, litígios ou lei."] },
            security: { title: "Segurança", paragraphs: ["São usados HTTPS, autenticação, controlo de acesso, validação, limites e proteções dos fornecedores.", "Nenhum serviço garante segurança absoluta; proteja as credenciais e comunique acessos suspeitos."] },
            automatedDecisions: { title: "Análise automatizada", paragraphs: ["Avaliações e classificações são automáticas, mas não produzem decisões legais ou efeitos semelhantes.", "NexoChess não emite decisões oficiais de fraude ou disciplina."] },
            rights: { title: "Direitos", paragraphs: ["Pode exercer acesso, correção, eliminação, limitação, oposição, portabilidade e retirada de consentimento quando aplicáveis. Pode ser necessária verificação de identidade.", "Contacte contact@nexochess.com ou a autoridade competente."] },
            children: { title: "Menores", paragraphs: ["NexoChess não se destina a menores de 14 anos; a data de nascimento é opcional.", "Contacte-nos se um menor tiver fornecido dados sem autorização exigida."] },
            changes: { title: "Alterações", paragraphs: ["A política pode mudar com o serviço, fornecedores ou lei.", "Alterações importantes serão destacadas antes de vigorar quando adequado."] }
        }
    },
    ru: {
        updated: "Последнее обновление: 4 августа 2026 г.",
        plainSummary: "Анализ может оставаться в браузере. Необязательная учётная запись использует необходимые cookies и D1 для аккаунта, облачного архива и прогресса. Необязательная аналитика и реклама отключены.",
        sections: {
            controller: { title: "Ответственный и контакты", paragraphs: ["Ответственным является Manuel García Villaescusa, находящийся в Испании и управляющий независимым проектом NexoChess.", "Запросы о конфиденциальности: contact@nexochess.com."] },
            dataCollected: { title: "Обрабатываемые данные", bullets: ["Локальные настройки, импорты, архив и прогресс браузера.", "Email, отображаемое имя, логин, идентификаторы провайдера, аккаунт, сессии, роли, даты и необязательная дата рождения.", "PGN, FEN, игроки, публичные имена, позиции, комментарии, анализ и сохранённые партии.", "Рейтинг и история задач.", "IP, заголовки, время, браузер, ошибки и события безопасности.", "Сообщения и транзакционные письма."] },
            purposes: { title: "Цели", bullets: ["Анализ, Архив, задачи, настройки и обмен.", "Аккаунты, сессии, синхронизация и письма.", "Безопасность, предотвращение злоупотреблений, устранение ошибок и поддержка.", "Юридические обязанности.", "Необязательная аналитика или реклама — только после требуемого уведомления и согласия."] },
            legalBases: { title: "Правовые основания", paragraphs: ["Запрошенные функции и аккаунт необходимы для исполнения Условий. Безопасность и надёжность основаны на законном интересе с учётом прав пользователей.", "Обработка возможна для юридических обязанностей и требований. Для необязательных функций будет запрашиваться отзывное согласие, когда требуется."] },
            browserStorage: { title: "Хранилище браузера и необходимые cookies", paragraphs: ["localStorage и IndexedDB сохраняют настройки, импорты, гостевой архив и локальный прогресс до удаления.", "Вход использует строго необходимые cookies. Необязательные аналитические или рекламные cookies сейчас не активны."] },
            accounts: { title: "Аккаунты, Google и D1", paragraphs: ["Аккаунты, сессии, облачные партии и прогресс хранятся в Cloudflare D1. Пароли не хранятся в читаемом виде.", "При Google OAuth передаются необходимые базовые данные. Удаление аккаунта удаляет активные связанные данные с временными исключениями для резервных копий, безопасности и закона."] },
            publicSharing: { title: "Публичные профили и общие партии", paragraphs: ["Публичный профиль может показывать имя, логин, роли и дату создания.", "Любой, у кого есть уникальная ссылка, может просмотреть всю общую облачную партию. Удаление партии отключает ссылку NexoChess."] },
            providers: { title: "Поставщики", bullets: ["Cloudflare: доставка, Workers, D1 и безопасность.", "Google: необязательный OAuth.", "Brevo: транзакционные письма.", "Chess.com и lichess.org: публичные партии; lichess.org также предоставляет открытые задачи.", "NexoChess не продаёт персональные данные."] },
            internationalTransfers: { title: "Международная обработка", paragraphs: ["Глобальные поставщики могут обрабатывать данные вне Испании или ЕЭЗ с применимыми гарантиями, включая решения об адекватности, рамки ЕС–США или стандартные договорные положения.", "Подробности приведены в уведомлениях поставщиков."] },
            retention: { title: "Хранение", paragraphs: ["Локальные данные остаются до удаления. Облачные данные — пока используется функция или до удаления объекта или аккаунта.", "Сессии, журналы, поддержка и резервные копии хранятся соразмерное время для безопасности, восстановления, споров или закона."] },
            security: { title: "Безопасность", paragraphs: ["Используются HTTPS, аутентификация, контроль доступа, проверка, лимиты и защита поставщиков.", "Абсолютная безопасность невозможна; защищайте данные входа и сообщайте о подозрительном доступе."] },
            automatedDecisions: { title: "Автоматический анализ", paragraphs: ["Оценки и рейтинги создаются автоматически, но не принимают юридически значимых решений.", "NexoChess не выносит официальных решений о мошенничестве или наказании."] },
            rights: { title: "Ваши права", paragraphs: ["Применимые права включают доступ, исправление, удаление, ограничение, возражение, переносимость и отзыв согласия. Может потребоваться подтверждение личности.", "Пишите contact@nexochess.com или обращайтесь в компетентный орган."] },
            children: { title: "Дети", paragraphs: ["NexoChess не предназначен для детей младше 14 лет; дата рождения необязательна.", "Свяжитесь с нами, если ребёнок передал данные без требуемого разрешения."] },
            changes: { title: "Изменения", paragraphs: ["Политика может обновляться вместе с сервисом, поставщиками или законом.", "Существенные изменения будут отмечены заранее, когда это уместно."] }
        }
    },
    zh: {
        updated: "最后更新：2026年8月4日",
        plainSummary: "分析可以仅保留在浏览器中。可选账户会使用必要的身份验证 Cookie，并通过 D1 保存账户、云端存档和谜题进度。当前未启用可选分析或广告跟踪。",
        sections: {
            controller: { title: "负责人和联系方式", paragraphs: ["本政策所述处理的负责人是位于西班牙、运营独立项目 NexoChess 的 Manuel García Villaescusa。", "隐私和权利请求请发送至 contact@nexochess.com。"] },
            dataCollected: { title: "处理的数据", bullets: ["浏览器中的语言、设置、导入、本地存档和进度。", "邮箱、显示名称、用户名、提供商标识、账户、会话、角色、日期及可选出生日期。", "PGN、FEN、棋手、公开用户名、局面、评论、分析和保存的对局。", "谜题等级、尝试、正确数、连胜和完成记录。", "IP、请求头、时间、浏览器、错误和安全事件。", "联系消息和账户邮件。"] },
            purposes: { title: "处理目的", bullets: ["提供分析、存档、谜题、设置和分享。", "管理账户、会话、同步和账户邮件。", "安全、防滥用、排错和支持。", "履行法律义务。", "可选分析或广告仅在完成必要告知和同意后启用。"] },
            legalBases: { title: "法律依据", paragraphs: ["所请求功能和账户管理基于履行条款或用户请求的前置措施。安全和可靠性基于在平衡用户权利后的合法利益。", "法律义务和索赔可能需要处理数据。非必要功能在法律要求时将依赖可撤回的同意。"] },
            browserStorage: { title: "浏览器存储和必要 Cookie", paragraphs: ["localStorage 和 IndexedDB 保存设置、导入、访客存档和本地进度，直至删除。", "登录使用严格必要的身份验证 Cookie。目前未启用可选分析或广告 Cookie。"] },
            accounts: { title: "账户、Google 和 D1", paragraphs: ["账户、会话、云端对局和谜题进度存储于 Cloudflare D1。密码不会以可读形式保存。", "选择 Google OAuth 时会提供必要的基本数据。删除账户会删除活跃关联数据，但备份、安全记录或法律义务可能暂时保留部分信息。"] },
            publicSharing: { title: "公开资料和分享对局", paragraphs: ["公开资料可能显示显示名称、用户名、角色和创建日期。", "任何获得唯一链接的人都可查看完整的云端分享对局。删除该对局会停用 NexoChess 链接。"] },
            providers: { title: "服务提供商", bullets: ["Cloudflare：交付、Workers、D1 和安全。", "Google：可选 OAuth。", "Brevo：事务邮件。", "Chess.com 和 lichess.org：公开对局；lichess.org 还提供开放谜题数据。", "NexoChess 不出售个人数据。"] },
            internationalTransfers: { title: "国际处理", paragraphs: ["全球提供商可能在西班牙或欧洲经济区之外处理数据，并采用适用的充分性决定、欧盟—美国框架或标准合同条款等保障。", "详细信息见提供商隐私声明。"] },
            retention: { title: "保存期限", paragraphs: ["本地数据保留至删除；云端数据保留至不再使用相关功能或删除项目/账户。", "会话、日志、支持记录和备份仅在安全、恢复、争议或法律所需的合理期限内保留。"] },
            security: { title: "安全", paragraphs: ["使用 HTTPS、身份验证、访问控制、输入验证、请求限制和提供商保护。", "任何在线服务都无法保证绝对安全；请保护凭据并报告可疑访问。"] },
            automatedDecisions: { title: "自动分析", paragraphs: ["评估和等级由系统自动生成，但不会产生法律或类似重大影响的决定。", "NexoChess 不作出官方作弊或纪律决定。"] },
            rights: { title: "你的权利", paragraphs: ["适用时可行使访问、更正、删除、限制、反对、可携带及撤回同意等权利；可能需要验证身份。", "请联系 contact@nexochess.com 或主管监管机构。"] },
            children: { title: "未成年人", paragraphs: ["NexoChess 不面向14岁以下儿童；出生日期为可选项。", "如儿童未经所需许可提供数据，请联系我们。"] },
            changes: { title: "政策变更", paragraphs: ["服务、提供商或法律变化时可能更新本政策。", "重大变化将在适当情况下于生效前提示。"] }
        }
    },
    vi: {
        updated: "Cập nhật lần cuối: 4 tháng 8 năm 2026",
        plainSummary: "Phân tích có thể chỉ ở trong trình duyệt. Tài khoản tùy chọn dùng cookie xác thực cần thiết và D1 cho tài khoản, Kho lưu trữ đám mây và tiến trình. Phân tích và quảng cáo tùy chọn hiện bị tắt.",
        sections: {
            controller: { title: "Bên kiểm soát và liên hệ", paragraphs: ["Bên kiểm soát là Manuel García Villaescusa, đặt tại Tây Ban Nha và vận hành dự án độc lập NexoChess.", "Yêu cầu về quyền riêng tư: contact@nexochess.com."] },
            dataCollected: { title: "Dữ liệu được xử lý", bullets: ["Cài đặt, lượt nhập, Kho lưu trữ và tiến trình cục bộ.", "Email, tên hiển thị, tên người dùng, mã nhà cung cấp, tài khoản, phiên, vai trò, ngày và ngày sinh tùy chọn.", "PGN, FEN, người chơi, tên công khai, thế cờ, bình luận, phân tích và ván đã lưu.", "Xếp hạng và lịch sử bài tập.", "IP, tiêu đề yêu cầu, thời gian, trình duyệt, lỗi và sự kiện bảo mật.", "Tin nhắn và email giao dịch."] },
            purposes: { title: "Mục đích", bullets: ["Cung cấp phân tích, Kho lưu trữ, bài tập, cài đặt và chia sẻ.", "Quản lý tài khoản, phiên, đồng bộ và email.", "Bảo mật, ngăn lạm dụng, sửa lỗi và hỗ trợ.", "Tuân thủ nghĩa vụ pháp lý.", "Chỉ bật phân tích hoặc quảng cáo tùy chọn sau thông báo và đồng ý bắt buộc."] },
            legalBases: { title: "Cơ sở pháp lý", paragraphs: ["Tính năng được yêu cầu và tài khoản dựa trên việc thực hiện Điều khoản hoặc bước theo yêu cầu. Bảo mật và độ tin cậy dựa trên lợi ích hợp pháp đã cân bằng với quyền người dùng.", "Nghĩa vụ pháp lý và khiếu nại có thể cần xử lý. Tính năng không thiết yếu sẽ dùng sự đồng ý có thể rút lại khi pháp luật yêu cầu."] },
            browserStorage: { title: "Lưu trữ trình duyệt và cookie cần thiết", paragraphs: ["localStorage và IndexedDB giữ cài đặt, lượt nhập, Kho khách và tiến trình cục bộ đến khi xóa.", "Đăng nhập dùng cookie xác thực tuyệt đối cần thiết. Hiện không có cookie phân tích hoặc quảng cáo tùy chọn."] },
            accounts: { title: "Tài khoản, Google và D1", paragraphs: ["Tài khoản, phiên, ván đám mây và tiến trình được lưu trong Cloudflare D1. Mật khẩu không được lưu ở dạng đọc được.", "Google cung cấp dữ liệu cơ bản khi chọn OAuth. Xóa tài khoản loại bỏ dữ liệu hoạt động liên quan, ngoại trừ bản sao lưu, bảo mật hoặc nghĩa vụ pháp lý tạm thời."] },
            publicSharing: { title: "Hồ sơ công khai và ván chia sẻ", paragraphs: ["Hồ sơ công khai có thể hiển thị tên, người dùng, vai trò và ngày tạo.", "Bất kỳ ai có liên kết duy nhất đều có thể xem toàn bộ ván đám mây được chia sẻ. Xóa ván sẽ vô hiệu liên kết NexoChess."] },
            providers: { title: "Nhà cung cấp", bullets: ["Cloudflare: phân phối, Workers, D1 và bảo mật.", "Google: OAuth tùy chọn.", "Brevo: email giao dịch.", "Chess.com và lichess.org: ván công khai; lichess.org cũng cung cấp dữ liệu bài tập mở.", "NexoChess không bán dữ liệu cá nhân."] },
            internationalTransfers: { title: "Chuyển dữ liệu quốc tế", paragraphs: ["Nhà cung cấp toàn cầu có thể xử lý ngoài Tây Ban Nha hoặc EEA với các bảo đảm như quyết định đầy đủ, khuôn khổ EU–Hoa Kỳ hoặc điều khoản hợp đồng chuẩn.", "Xem thông báo của nhà cung cấp để biết chi tiết."] },
            retention: { title: "Lưu giữ", paragraphs: ["Dữ liệu cục bộ còn đến khi xóa. Dữ liệu đám mây còn khi dùng tính năng hoặc đến khi xóa mục/tài khoản.", "Phiên, nhật ký, hỗ trợ và bản sao lưu được giữ trong thời gian tương xứng cho bảo mật, khôi phục, tranh chấp hoặc pháp luật."] },
            security: { title: "Bảo mật", paragraphs: ["NexoChess dùng HTTPS, xác thực, kiểm soát truy cập, xác thực dữ liệu, giới hạn và bảo vệ của nhà cung cấp.", "Không dịch vụ nào bảo đảm an toàn tuyệt đối; hãy bảo vệ thông tin đăng nhập và báo truy cập đáng ngờ."] },
            automatedDecisions: { title: "Phân tích tự động", paragraphs: ["Đánh giá và xếp hạng được tạo tự động nhưng không đưa ra quyết định pháp lý hoặc ảnh hưởng đáng kể tương tự.", "NexoChess không đưa ra kết luận gian lận hoặc kỷ luật chính thức."] },
            rights: { title: "Quyền của bạn", paragraphs: ["Có thể thực hiện quyền truy cập, sửa, xóa, hạn chế, phản đối, chuyển dữ liệu và rút đồng ý khi áp dụng. Có thể cần xác minh danh tính.", "Liên hệ contact@nexochess.com hoặc cơ quan có thẩm quyền."] },
            children: { title: "Trẻ em", paragraphs: ["NexoChess không dành cho trẻ dưới 14 tuổi; ngày sinh là tùy chọn.", "Hãy liên hệ nếu trẻ cung cấp dữ liệu mà không có phép cần thiết."] },
            changes: { title: "Thay đổi", paragraphs: ["Chính sách có thể thay đổi cùng dịch vụ, nhà cung cấp hoặc pháp luật.", "Thay đổi quan trọng sẽ được nêu trước khi có hiệu lực khi phù hợp."] }
        }
    },
    hi: {
        updated: "अंतिम अद्यतन: 4 अगस्त 2026",
        plainSummary: "विश्लेषण ब्राउज़र में रह सकता है। वैकल्पिक खाता आवश्यक प्रमाणीकरण कुकी और खाते, क्लाउड संग्रह तथा पहेली प्रगति के लिए D1 जोड़ता है। वैकल्पिक विश्लेषिकी और विज्ञापन ट्रैकिंग अभी बंद हैं।",
        sections: {
            controller: { title: "नियंत्रक और संपर्क", paragraphs: ["नियंत्रक Manuel García Villaescusa हैं, जो स्पेन में स्थापित हैं और स्वतंत्र NexoChess परियोजना चलाते हैं।", "गोपनीयता अनुरोध contact@nexochess.com पर भेजें।"] },
            dataCollected: { title: "संसाधित डेटा", bullets: ["स्थानीय ब्राउज़र सेटिंग, आयात, संग्रह और प्रगति।", "ईमेल, दिखने वाला नाम, उपयोगकर्ता नाम, प्रदाता पहचान, खाता, सत्र, भूमिकाएँ, तिथियाँ और वैकल्पिक जन्मतिथि।", "PGN, FEN, खिलाड़ी, सार्वजनिक नाम, स्थितियाँ, टिप्पणियाँ, विश्लेषण और सहेजे खेल।", "पहेली रेटिंग और पूर्णता इतिहास।", "IP, अनुरोध हेडर, समय, ब्राउज़र, त्रुटि और सुरक्षा घटनाएँ।", "संपर्क संदेश और लेन-देन ईमेल।"] },
            purposes: { title: "उद्देश्य", bullets: ["विश्लेषण, संग्रह, पहेलियाँ, सेटिंग और साझा करना।", "खाते, सत्र, समन्वयन और ईमेल।", "सुरक्षा, दुरुपयोग रोकना, समस्या समाधान और सहायता।", "कानूनी दायित्व।", "वैकल्पिक विश्लेषिकी या विज्ञापन केवल आवश्यक सूचना और सहमति के बाद।"] },
            legalBases: { title: "कानूनी आधार", paragraphs: ["माँगी गई सुविधाएँ और खाता शर्तों के निष्पादन या अनुरोधित पूर्व कदमों पर आधारित हैं। सुरक्षा और विश्वसनीयता उपयोगकर्ता अधिकारों के साथ संतुलित वैध हित पर आधारित हैं।", "कानूनी दायित्व और दावे प्रसंस्करण माँग सकते हैं। गैर-आवश्यक सुविधाओं के लिए जहाँ आवश्यक हो वापस ली जा सकने वाली सहमति ली जाएगी।"] },
            browserStorage: { title: "ब्राउज़र संग्रह और आवश्यक कुकी", paragraphs: ["localStorage और IndexedDB सेटिंग, आयात, अतिथि संग्रह और स्थानीय प्रगति हटाए जाने तक रखते हैं।", "लॉगिन के लिए अत्यंत आवश्यक प्रमाणीकरण कुकी उपयोग होती हैं। वैकल्पिक विश्लेषिकी या विज्ञापन कुकी अभी सक्रिय नहीं हैं।"] },
            accounts: { title: "खाते, Google और D1", paragraphs: ["खाता, सत्र, क्लाउड खेल और प्रगति Cloudflare D1 में रहती है। पासवर्ड पठनीय रूप में संग्रहीत नहीं होते।", "Google OAuth चुनने पर आवश्यक मूल डेटा देता है। खाता हटाने पर सक्रिय संबद्ध डेटा हटता है, अस्थायी बैकअप, सुरक्षा और कानूनी अपवादों के अधीन।"] },
            publicSharing: { title: "सार्वजनिक प्रोफ़ाइल और साझा खेल", paragraphs: ["सार्वजनिक प्रोफ़ाइल नाम, उपयोगकर्ता नाम, भूमिकाएँ और निर्माण तिथि दिखा सकती है।", "विशिष्ट लिंक वाला कोई भी व्यक्ति पूरा साझा क्लाउड खेल देख सकता है। खेल हटाने से NexoChess लिंक बंद हो जाता है।"] },
            providers: { title: "प्रदाता", bullets: ["Cloudflare: वितरण, Workers, D1 और सुरक्षा।", "Google: वैकल्पिक OAuth।", "Brevo: लेन-देन ईमेल।", "Chess.com और lichess.org: सार्वजनिक खेल; lichess.org खुले पहेली डेटा भी देता है।", "NexoChess व्यक्तिगत डेटा नहीं बेचता।"] },
            internationalTransfers: { title: "अंतरराष्ट्रीय स्थानांतरण", paragraphs: ["वैश्विक प्रदाता स्पेन या EEA से बाहर लागू पर्याप्तता निर्णय, EU-US ढाँचा या मानक अनुबंध धाराओं जैसी सुरक्षा के साथ डेटा संसाधित कर सकते हैं।", "विवरण प्रदाता सूचनाओं में है।"] },
            retention: { title: "अवधारण", paragraphs: ["स्थानीय डेटा हटाने तक रहता है। क्लाउड डेटा सुविधा उपयोग या वस्तु/खाता हटाने तक रहता है।", "सत्र, लॉग, सहायता और बैकअप सुरक्षा, पुनर्प्राप्ति, विवाद या कानून के लिए अनुपातिक अवधि तक रहते हैं।"] },
            security: { title: "सुरक्षा", paragraphs: ["HTTPS, प्रमाणीकरण, पहुँच नियंत्रण, सत्यापन, सीमा और प्रदाता सुरक्षा उपयोग की जाती है।", "पूर्ण सुरक्षा की गारंटी नहीं; अपने प्रमाण सुरक्षित रखें और संदिग्ध पहुँच बताएँ।"] },
            automatedDecisions: { title: "स्वचालित विश्लेषण", paragraphs: ["मूल्यांकन और रेटिंग स्वचालित हैं, पर कानूनी या समान महत्वपूर्ण निर्णय नहीं लेते।", "NexoChess आधिकारिक धोखाधड़ी या अनुशासन निर्णय नहीं देता।"] },
            rights: { title: "आपके अधिकार", paragraphs: ["जहाँ लागू हो, पहुँच, सुधार, हटाना, सीमित करना, आपत्ति, पोर्टेबिलिटी और सहमति वापसी के अधिकार हैं। पहचान सत्यापन माँगा जा सकता है।", "contact@nexochess.com या सक्षम प्राधिकरण से संपर्क करें।"] },
            children: { title: "बच्चे", paragraphs: ["NexoChess 14 वर्ष से कम बच्चों के लिए नहीं है; जन्मतिथि वैकल्पिक है।", "बिना आवश्यक अनुमति बच्चे द्वारा डेटा देने पर संपर्क करें।"] },
            changes: { title: "परिवर्तन", paragraphs: ["सेवा, प्रदाता या कानून बदलने पर नीति बदल सकती है।", "महत्वपूर्ण परिवर्तन उचित होने पर प्रभावी होने से पहले बताए जाएँगे।"] }
        }
    },
    mr: {
        updated: "शेवटचे अद्यतन: 4 ऑगस्ट 2026",
        plainSummary: "विश्लेषण ब्राउझरमध्ये राहू शकते. ऐच्छिक खाते आवश्यक प्रमाणीकरण कुकी आणि खाते, क्लाउड संग्रह व कोडे प्रगतीसाठी D1 वापरते. ऐच्छिक विश्लेषण व जाहिरात ट्रॅकिंग सध्या बंद आहे.",
        sections: {
            controller: { title: "नियंत्रक आणि संपर्क", paragraphs: ["नियंत्रक Manuel García Villaescusa आहेत, जे स्पेनमध्ये स्थापित असून स्वतंत्र NexoChess प्रकल्प चालवतात.", "गोपनीयता विनंत्या contact@nexochess.com वर पाठवा."] },
            dataCollected: { title: "प्रक्रिया केलेला डेटा", bullets: ["स्थानिक सेटिंग, आयात, संग्रह आणि प्रगती.", "ईमेल, दिसणारे नाव, वापरकर्ता नाव, प्रदाता ओळख, खाते, सत्र, भूमिका, तारखा आणि ऐच्छिक जन्मतारीख.", "PGN, FEN, खेळाडू, सार्वजनिक नावे, स्थिती, टिप्पण्या, विश्लेषण आणि जतन केलेले खेळ.", "कोडे रेटिंग आणि पूर्णता इतिहास.", "IP, विनंती हेडर, वेळ, ब्राउझर, त्रुटी आणि सुरक्षा घटना.", "संपर्क संदेश आणि व्यवहार ईमेल."] },
            purposes: { title: "उद्देश", bullets: ["विश्लेषण, संग्रह, कोडी, सेटिंग आणि शेअरिंग.", "खाती, सत्र, समक्रमण आणि ईमेल.", "सुरक्षा, गैरवापर प्रतिबंध, त्रुटी दुरुस्ती आणि मदत.", "कायदेशीर दायित्व.", "ऐच्छिक विश्लेषण किंवा जाहिरात फक्त आवश्यक माहिती आणि संमतीनंतर."] },
            legalBases: { title: "कायदेशीर आधार", paragraphs: ["मागितलेल्या सुविधा आणि खाते अटींच्या अंमलबजावणीवर किंवा मागितलेल्या पूर्व पावलांवर आधारित आहेत. सुरक्षा आणि विश्वासार्हता वापरकर्ता हक्कांशी संतुलित वैध हितावर आधारित आहेत.", "कायदेशीर दायित्व आणि दावे प्रक्रियेस कारणीभूत ठरू शकतात. अनावश्यक सुविधांसाठी आवश्यक असल्यास मागे घेता येणारी संमती घेतली जाईल."] },
            browserStorage: { title: "ब्राउझर संचय आणि आवश्यक कुकी", paragraphs: ["localStorage आणि IndexedDB सेटिंग, आयात, अतिथी संग्रह आणि स्थानिक प्रगती हटेपर्यंत ठेवतात.", "लॉगिनसाठी अत्यावश्यक प्रमाणीकरण कुकी वापरल्या जातात. ऐच्छिक विश्लेषण किंवा जाहिरात कुकी सध्या सक्रिय नाहीत."] },
            accounts: { title: "खाती, Google आणि D1", paragraphs: ["खाते, सत्र, क्लाउड खेळ आणि प्रगती Cloudflare D1 मध्ये असतात. संकेतशब्द वाचनीय स्वरूपात साठवले जात नाहीत.", "Google OAuth निवडल्यास आवश्यक मूलभूत डेटा देते. खाते हटवल्यावर सक्रिय संबंधित डेटा हटतो, तात्पुरत्या बॅकअप, सुरक्षा आणि कायदेशीर अपवादांच्या अधीन."] },
            publicSharing: { title: "सार्वजनिक प्रोफाइल आणि शेअर खेळ", paragraphs: ["सार्वजनिक प्रोफाइल नाव, वापरकर्ता नाव, भूमिका आणि निर्मिती तारीख दाखवू शकते.", "विशिष्ट लिंक असलेला कोणीही पूर्ण शेअर केलेला क्लाउड खेळ पाहू शकतो. खेळ हटवल्यास NexoChess लिंक बंद होते."] },
            providers: { title: "प्रदाता", bullets: ["Cloudflare: वितरण, Workers, D1 आणि सुरक्षा.", "Google: ऐच्छिक OAuth.", "Brevo: व्यवहार ईमेल.", "Chess.com आणि lichess.org: सार्वजनिक खेळ; lichess.org खुले कोडे डेटा देखील देते.", "NexoChess वैयक्तिक डेटा विकत नाही."] },
            internationalTransfers: { title: "आंतरराष्ट्रीय हस्तांतरण", paragraphs: ["जागतिक प्रदाता स्पेन किंवा EEA बाहेर लागू पर्याप्तता निर्णय, EU-US चौकट किंवा मानक करार कलमांसारख्या संरक्षणासह डेटा प्रक्रिया करू शकतात.", "तपशील प्रदाता सूचनांत आहेत."] },
            retention: { title: "जतन", paragraphs: ["स्थानिक डेटा हटेपर्यंत राहतो. क्लाउड डेटा सुविधा वापरेपर्यंत किंवा वस्तू/खाते हटेपर्यंत राहतो.", "सत्र, लॉग, मदत आणि बॅकअप सुरक्षा, पुनर्प्राप्ती, वाद किंवा कायद्यासाठी प्रमाणबद्ध काळ ठेवले जातात."] },
            security: { title: "सुरक्षा", paragraphs: ["HTTPS, प्रमाणीकरण, प्रवेश नियंत्रण, पडताळणी, मर्यादा आणि प्रदाता संरक्षण वापरले जाते.", "पूर्ण सुरक्षेची हमी नाही; आपली ओळख माहिती सुरक्षित ठेवा आणि संशयास्पद प्रवेश कळवा."] },
            automatedDecisions: { title: "स्वयंचलित विश्लेषण", paragraphs: ["मूल्यांकन आणि रेटिंग स्वयंचलित असतात, पण कायदेशीर किंवा तत्सम महत्त्वाचे निर्णय घेत नाहीत.", "NexoChess अधिकृत फसवणूक किंवा शिस्तभंग निर्णय देत नाही."] },
            rights: { title: "तुमचे हक्क", paragraphs: ["लागू असल्यास प्रवेश, दुरुस्ती, हटवणे, मर्यादा, आक्षेप, पोर्टेबिलिटी आणि संमती मागे घेण्याचे हक्क आहेत. ओळख पडताळणी मागितली जाऊ शकते.", "contact@nexochess.com किंवा सक्षम प्राधिकरणाशी संपर्क करा."] },
            children: { title: "मुले", paragraphs: ["NexoChess 14 वर्षांखालील मुलांसाठी नाही; जन्मतारीख ऐच्छिक आहे.", "आवश्यक परवानगीशिवाय मुलाने डेटा दिल्यास संपर्क करा."] },
            changes: { title: "बदल", paragraphs: ["सेवा, प्रदाता किंवा कायदा बदलल्यास धोरण बदलू शकते.", "महत्त्वाचे बदल योग्य असल्यास लागू होण्यापूर्वी दर्शवले जातील."] }
        }
    },
    pl: {
        updated: "Ostatnia aktualizacja: 4 sierpnia 2026 r.",
        plainSummary: "Analiza może pozostać w przeglądarce. Opcjonalne konto używa niezbędnych plików cookie i D1 dla konta, Archiwum w chmurze oraz postępów. Opcjonalna analityka i reklamy są obecnie wyłączone.",
        sections: {
            controller: { title: "Administrator i kontakt", paragraphs: ["Administratorem jest Manuel García Villaescusa, działający w Hiszpanii i prowadzący niezależny projekt NexoChess.", "Wnioski dotyczące prywatności: contact@nexochess.com."] },
            dataCollected: { title: "Przetwarzane dane", bullets: ["Lokalne ustawienia, importy, Archiwum i postępy w przeglądarce.", "E-mail, nazwa wyświetlana, użytkownik, identyfikatory dostawcy, konto, sesje, role, daty i opcjonalna data urodzenia.", "PGN, FEN, gracze, publiczne nazwy, pozycje, komentarze, analizy i zapisane partie.", "Ranking i historia zadań.", "IP, nagłówki, czas, przeglądarka, błędy i zdarzenia bezpieczeństwa.", "Wiadomości i e-maile transakcyjne."] },
            purposes: { title: "Cele", bullets: ["Analiza, Archiwum, zadania, ustawienia i udostępnianie.", "Konta, sesje, synchronizacja i wiadomości e-mail.", "Bezpieczeństwo, zapobieganie nadużyciom, usuwanie błędów i wsparcie.", "Obowiązki prawne.", "Opcjonalna analityka lub reklamy dopiero po wymaganej informacji i zgodzie."] },
            legalBases: { title: "Podstawy prawne", paragraphs: ["Żądane funkcje i konto opierają się na wykonaniu Warunków lub żądanych działaniach przed ich użyciem. Bezpieczeństwo i niezawodność opierają się na uzasadnionym interesie, z uwzględnieniem praw użytkownika.", "Obowiązki prawne i roszczenia mogą wymagać przetwarzania. Dla funkcji niekoniecznych zgoda będzie pozyskiwana, gdy wymaga tego prawo, i będzie możliwa do wycofania."] },
            browserStorage: { title: "Pamięć przeglądarki i niezbędne cookie", paragraphs: ["localStorage i IndexedDB przechowują ustawienia, importy, Archiwum gościa i lokalne postępy do usunięcia.", "Logowanie używa ściśle niezbędnych plików cookie. Opcjonalne cookie analityczne lub reklamowe nie są obecnie aktywne."] },
            accounts: { title: "Konta, Google i D1", paragraphs: ["Konta, sesje, partie w chmurze i postępy są przechowywane w Cloudflare D1. Hasła nie są przechowywane w czytelnej postaci.", "Google przekazuje niezbędne dane przy OAuth. Usunięcie konta usuwa aktywne powiązane dane z czasowymi wyjątkami dla kopii, bezpieczeństwa i prawa."] },
            publicSharing: { title: "Profile publiczne i udostępnione partie", paragraphs: ["Profil publiczny może pokazywać nazwę, użytkownika, role i datę utworzenia.", "Każdy z unikalnym linkiem może zobaczyć całą udostępnioną partię w chmurze. Usunięcie partii wyłącza link NexoChess."] },
            providers: { title: "Dostawcy", bullets: ["Cloudflare: dostarczanie, Workers, D1 i bezpieczeństwo.", "Google: opcjonalne OAuth.", "Brevo: e-maile transakcyjne.", "Chess.com i lichess.org: publiczne partie; lichess.org dostarcza również otwarte zadania.", "NexoChess nie sprzedaje danych osobowych."] },
            internationalTransfers: { title: "Transfery międzynarodowe", paragraphs: ["Globalni dostawcy mogą przetwarzać dane poza Hiszpanią lub EOG z użyciem właściwych zabezpieczeń, takich jak decyzje o adekwatności, ramy UE–USA lub standardowe klauzule umowne.", "Szczegóły znajdują się w informacjach dostawców."] },
            retention: { title: "Przechowywanie", paragraphs: ["Dane lokalne pozostają do usunięcia. Dane w chmurze pozostają podczas korzystania z funkcji lub do usunięcia elementu/konta.", "Sesje, logi, wsparcie i kopie są przechowywane proporcjonalnie długo dla bezpieczeństwa, odzyskiwania, sporów lub prawa."] },
            security: { title: "Bezpieczeństwo", paragraphs: ["Stosowane są HTTPS, uwierzytelnianie, kontrola dostępu, walidacja, limity i zabezpieczenia dostawców.", "Nie można zagwarantować pełnego bezpieczeństwa; chroń dane logowania i zgłaszaj podejrzany dostęp."] },
            automatedDecisions: { title: "Automatyczna analiza", paragraphs: ["Oceny i rankingi są generowane automatycznie, lecz nie powodują decyzji prawnych ani podobnie istotnych.", "NexoChess nie wydaje oficjalnych decyzji o oszustwie lub dyscyplinie."] },
            rights: { title: "Twoje prawa", paragraphs: ["Możesz wykonywać odpowiednie prawa dostępu, poprawienia, usunięcia, ograniczenia, sprzeciwu, przenoszenia i wycofania zgody. Może być wymagana weryfikacja tożsamości.", "Napisz na contact@nexochess.com lub do właściwego organu."] },
            children: { title: "Dzieci", paragraphs: ["NexoChess nie jest skierowany do dzieci poniżej 14 lat; data urodzenia jest opcjonalna.", "Skontaktuj się, jeśli dziecko przekazało dane bez wymaganej zgody."] },
            changes: { title: "Zmiany", paragraphs: ["Polityka może się zmienić wraz z usługą, dostawcami lub prawem.", "Istotne zmiany zostaną wskazane przed wejściem w życie, gdy będzie to właściwe."] }
        }
    }
};

export function getPrivacyRevisionCopy(language: string) {
    const normalisedLanguage = language.toLowerCase().split("-")[0];
    return revisions[normalisedLanguage] || revisions.en;
}
