import type { LegalDocumentCopy } from "../../components/LegalDocument";

const revisions: Record<string, LegalDocumentCopy> = {
    en: {
        updated: "Last updated: 4 August 2026",
        sections: {
            eligibility: {
                title: "Age and legal capacity",
                paragraphs: [
                    "NexoChess is not directed to children under 14. If you are under the age required in your country to accept these Terms on your own, use the service only with the permission and supervision of a parent or legal guardian.",
                    "By using the service, you confirm that you have the legal capacity to accept these Terms or that the required adult has accepted them for you. Mandatory protections for minors and consumers remain unaffected."
                ]
            },
            acceptableUse: {
                title: "Acceptable use and fair play",
                paragraphs: [
                    "Use NexoChess lawfully and in a way that does not harm the service, other users or third parties."
                ],
                bullets: [
                    "Do not attack, overload, probe, disrupt or bypass security controls, technical limits or access restrictions.",
                    "Do not distribute malware or use bots, mass scraping or automated extraction without prior permission, except for ordinary browser use and access to the public source and licence materials.",
                    "Do not infringe intellectual-property, privacy, contractual or other legal rights, impersonate another person, or falsely claim an official relationship with NexoChess or another chess platform.",
                    "Do not use engine assistance during live games, examinations or competitions where external assistance is prohibited.",
                    "Do not present NexoChess output as an official anti-cheating finding, tournament decision or guaranteed assessment."
                ]
            },
            commercialFeatures: {
                title: "Free service, advertising and future paid features",
                paragraphs: [
                    "The core NexoChess service is currently offered without a subscription fee. NexoChess may later include donations, clearly identified advertising or sponsorship, optional paid features, usage limits or other commercial functionality.",
                    "Before any paid transaction, the price, taxes, renewal terms and cancellation conditions will be shown separately. You will not be charged without an explicit action. Sponsored content will be identified and will not determine chess-engine evaluations."
                ]
            },
            suspension: {
                title: "Restriction, suspension and termination",
                paragraphs: [
                    "We may proportionately restrict automated access, an account or part of the service when reasonably necessary for security, unlawful use, a material breach of these Terms, protection of users or prevention of damage. We will explain the measure when legally and technically possible.",
                    "You may stop using NexoChess at any time and may delete an optional account through the available controls. A restriction or deletion does not remove rights that applicable law requires us to preserve."
                ]
            },
            liability: {
                title: "Automated analysis, warranties and liability",
                paragraphs: [
                    "NexoChess output is generated automatically and is informational. It is not an official tournament ruling, anti-cheating determination or guarantee of improvement, accuracy or a particular result. You remain responsible for your decisions and for following the rules of any platform, club, school or competition.",
                    "The service is provided on an available basis. To the fullest extent permitted by law, NexoChess is not responsible for indirect or unforeseeable losses, failures of a user's device or browser, interruptions caused by independent providers, or data loss that could reasonably have been avoided by keeping a copy. Nothing in these Terms excludes or limits mandatory consumer rights or liability that cannot legally be excluded."
                ]
            },
            changes: {
                title: "Changes to these Terms",
                paragraphs: [
                    "We may update these Terms when NexoChess, applicable law, security requirements or essential providers change. The revision date appears at the top of this page.",
                    "Material changes will be communicated through the service and, when appropriate, by account email with reasonable advance notice. If you do not accept them, you may stop using NexoChess and delete your account before they take effect. Changes will not retroactively remove rights already acquired under mandatory law."
                ]
            },
            law: {
                title: "Applicable law, disputes and contact",
                paragraphs: [
                    "These Terms are governed by Spanish law, without depriving consumers of mandatory protections provided by the law of their country of habitual residence. Courts and competent authorities will be determined by applicable law, and consumers retain any right to bring proceedings in the forum available to them by law.",
                    "For questions or complaints, contact contact@nexochess.com so we can try to resolve the matter directly. If any provision is invalid or unenforceable, the remaining provisions continue to apply. Failure to enforce a provision is not a waiver of it."
                ]
            }
        }
    },
    es: {
        updated: "Última actualización: 4 de agosto de 2026",
        sections: {
            eligibility: {
                title: "Edad y capacidad legal",
                paragraphs: [
                    "NexoChess no está dirigido a menores de 14 años. Si no tienes la edad exigida en tu país para aceptar estos Términos por ti mismo, utiliza el servicio únicamente con permiso y supervisión de tu padre, madre o representante legal.",
                    "Al utilizar el servicio confirmas que tienes capacidad legal para aceptar estos Términos o que el adulto correspondiente los ha aceptado por ti. Las protecciones obligatorias de menores y consumidores no se ven afectadas."
                ]
            },
            acceptableUse: {
                title: "Uso aceptable y juego limpio",
                paragraphs: [
                    "Utiliza NexoChess de forma lícita y sin perjudicar al servicio, a otros usuarios ni a terceros."
                ],
                bullets: [
                    "No ataques, sobrecargues, sondees, interrumpas ni eludas controles de seguridad, límites técnicos o restricciones de acceso.",
                    "No distribuyas software malicioso ni utilices bots, extracción masiva o scraping automatizado sin autorización previa, salvo el uso normal del navegador y el acceso al código fuente y a las licencias públicas.",
                    "No infrinjas derechos de propiedad intelectual, privacidad, contrato u otros derechos legales, no suplantes a terceros ni afirmes falsamente una relación oficial con NexoChess u otra plataforma de ajedrez.",
                    "No utilices ayuda de motor durante partidas en directo, exámenes o competiciones en las que esté prohibida la asistencia externa.",
                    "No presentes los resultados de NexoChess como una conclusión oficial antitrampas, una decisión arbitral o una valoración garantizada."
                ]
            },
            commercialFeatures: {
                title: "Servicio gratuito, publicidad y futuras funciones de pago",
                paragraphs: [
                    "El servicio principal de NexoChess se ofrece actualmente sin cuota de suscripción. En el futuro podrá incluir donaciones, publicidad o patrocinios claramente identificados, funciones de pago opcionales, límites de uso u otras funciones comerciales.",
                    "Antes de cualquier pago se mostrarán por separado el precio, los impuestos, la renovación y las condiciones de cancelación. No se realizará ningún cobro sin una acción expresa. El contenido patrocinado estará identificado y no determinará las evaluaciones del motor."
                ]
            },
            suspension: {
                title: "Restricción, suspensión y finalización",
                paragraphs: [
                    "Podremos restringir de forma proporcionada el acceso automatizado, una cuenta o parte del servicio cuando sea razonablemente necesario por seguridad, uso ilícito, incumplimiento grave de estos Términos, protección de usuarios o prevención de daños. Explicaremos la medida cuando sea legal y técnicamente posible.",
                    "Puedes dejar de utilizar NexoChess en cualquier momento y eliminar una cuenta opcional mediante los controles disponibles. Una restricción o eliminación no suprime los derechos que la ley aplicable obligue a conservar."
                ]
            },
            liability: {
                title: "Análisis automatizado, garantías y responsabilidad",
                paragraphs: [
                    "Los resultados de NexoChess se generan automáticamente y tienen carácter informativo. No son una decisión oficial de torneo, una conclusión antitrampas ni una garantía de mejora, exactitud o resultado. Tú sigues siendo responsable de tus decisiones y de cumplir las normas de cualquier plataforma, club, centro educativo o competición.",
                    "El servicio se presta según disponibilidad. En la máxima medida permitida por la ley, NexoChess no responde de pérdidas indirectas o imprevisibles, fallos del dispositivo o navegador del usuario, interrupciones de proveedores independientes ni pérdida de datos que pudiera haberse evitado razonablemente conservando una copia. Nada de estos Términos excluye o limita derechos obligatorios de consumidores ni responsabilidades que legalmente no puedan excluirse."
                ]
            },
            changes: {
                title: "Cambios en estos Términos",
                paragraphs: [
                    "Podremos actualizar estos Términos cuando cambien NexoChess, la legislación aplicable, los requisitos de seguridad o proveedores esenciales. La fecha de revisión aparece al inicio de la página.",
                    "Los cambios importantes se comunicarán mediante el servicio y, cuando proceda, por correo de la cuenta con una antelación razonable. Si no los aceptas, podrás dejar de utilizar NexoChess y eliminar tu cuenta antes de su entrada en vigor. Los cambios no eliminarán retroactivamente derechos ya adquiridos conforme a normas obligatorias."
                ]
            },
            law: {
                title: "Ley aplicable, conflictos y contacto",
                paragraphs: [
                    "Estos Términos se rigen por la legislación española, sin privar a los consumidores de las protecciones obligatorias de la ley de su país de residencia habitual. Los tribunales y autoridades competentes serán los determinados por la normativa aplicable, y los consumidores conservan el derecho a acudir al fuero que la ley les reconozca.",
                    "Para consultas o reclamaciones, escribe a contact@nexochess.com para intentar resolver el asunto directamente. Si alguna cláusula fuese inválida o inaplicable, las demás seguirán vigentes. La falta de ejercicio de un derecho no supone renunciar a él."
                ]
            }
        }
    },
    fr: {
        updated: "Dernière mise à jour : 4 août 2026",
        sections: {
            eligibility: {
                title: "Âge et capacité juridique",
                paragraphs: [
                    "NexoChess ne s'adresse pas aux enfants de moins de 14 ans. Si vous n'avez pas l'âge requis dans votre pays pour accepter seul ces Conditions, utilisez le service uniquement avec l'autorisation et la supervision d'un parent ou représentant légal.",
                    "En utilisant le service, vous confirmez avoir la capacité juridique nécessaire ou que l'adulte requis a accepté ces Conditions pour vous. Les protections obligatoires des mineurs et des consommateurs restent applicables."
                ]
            },
            acceptableUse: {
                title: "Utilisation acceptable et jeu loyal",
                paragraphs: ["Utilisez NexoChess légalement et sans nuire au service, aux autres utilisateurs ou aux tiers."],
                bullets: [
                    "N'attaquez pas, ne surchargez pas, ne sondez pas et ne contournez pas les mesures de sécurité, limites techniques ou restrictions d'accès.",
                    "N'utilisez pas de logiciel malveillant, de robots, de collecte massive ou d'extraction automatisée sans autorisation préalable, sauf l'usage normal du navigateur et l'accès au code source et aux licences publiques.",
                    "Ne violez pas les droits de propriété intellectuelle, de vie privée ou contractuels, n'usurpez pas d'identité et ne prétendez pas à tort avoir une relation officielle avec NexoChess ou une autre plateforme.",
                    "N'utilisez pas l'assistance d'un moteur pendant une partie en direct, un examen ou une compétition qui interdit l'aide extérieure.",
                    "Ne présentez pas les résultats de NexoChess comme une décision officielle anticheat, arbitrale ou garantie."
                ]
            },
            commercialFeatures: {
                title: "Service gratuit, publicité et futures fonctions payantes",
                paragraphs: [
                    "Le service principal est actuellement proposé sans abonnement. NexoChess pourra ultérieurement inclure des dons, de la publicité ou du parrainage clairement identifiés, des fonctions payantes facultatives ou des limites d'utilisation.",
                    "Avant tout paiement, le prix, les taxes, le renouvellement et l'annulation seront présentés séparément. Aucun débit n'aura lieu sans action explicite. Le contenu sponsorisé sera identifié et ne déterminera pas les évaluations du moteur."
                ]
            },
            suspension: {
                title: "Restriction, suspension et résiliation",
                paragraphs: [
                    "Nous pouvons restreindre de manière proportionnée un accès automatisé, un compte ou une partie du service lorsque cela est raisonnablement nécessaire pour la sécurité, un usage illégal, une violation grave, la protection des utilisateurs ou la prévention d'un dommage. Une explication sera fournie lorsque cela est légalement et techniquement possible.",
                    "Vous pouvez cesser d'utiliser NexoChess à tout moment et supprimer un compte facultatif. Une restriction ou suppression n'efface pas les droits que la loi impose de préserver."
                ]
            },
            liability: {
                title: "Analyse automatisée, garanties et responsabilité",
                paragraphs: [
                    "Les résultats sont automatisés et informatifs. Ils ne constituent ni une décision officielle de tournoi, ni une conclusion anticheat, ni une garantie d'amélioration, d'exactitude ou de résultat. Vous restez responsable de vos décisions et du respect des règles applicables.",
                    "Le service est fourni selon disponibilité. Dans les limites permises par la loi, NexoChess n'est pas responsable des pertes indirectes ou imprévisibles, des défaillances de l'appareil ou du navigateur, des interruptions de prestataires indépendants ou des données non sauvegardées. Aucun droit impératif du consommateur ni aucune responsabilité légalement non excluable n'est limité."
                ]
            },
            changes: {
                title: "Modification de ces Conditions",
                paragraphs: [
                    "Ces Conditions peuvent être mises à jour lorsque NexoChess, la loi, la sécurité ou des prestataires essentiels changent. La date de révision figure en haut de la page.",
                    "Les changements importants seront annoncés dans le service et, le cas échéant, par e-mail avec un préavis raisonnable. Vous pouvez cesser d'utiliser le service et supprimer votre compte avant leur entrée en vigueur. Les droits déjà acquis en vertu de règles impératives ne seront pas supprimés rétroactivement."
                ]
            },
            law: {
                title: "Droit applicable, litiges et contact",
                paragraphs: [
                    "Ces Conditions sont régies par le droit espagnol, sans priver les consommateurs des protections impératives de leur pays de résidence habituelle. Les juridictions compétentes sont celles prévues par la loi applicable.",
                    "Pour toute question ou réclamation, écrivez à contact@nexochess.com. Si une clause est invalide, les autres restent applicables. Le fait de ne pas exercer un droit ne constitue pas une renonciation."
                ]
            }
        }
    },
    de: {
        updated: "Letzte Aktualisierung: 4. August 2026",
        sections: {
            eligibility: {
                title: "Alter und Rechtsfähigkeit",
                paragraphs: [
                    "NexoChess richtet sich nicht an Kinder unter 14 Jahren. Wenn du in deinem Land diese Bedingungen noch nicht selbst wirksam akzeptieren kannst, darfst du den Dienst nur mit Erlaubnis und Aufsicht eines Elternteils oder gesetzlichen Vertreters nutzen.",
                    "Mit der Nutzung bestätigst du deine Rechtsfähigkeit oder die Zustimmung der erforderlichen erwachsenen Person. Zwingende Schutzrechte für Minderjährige und Verbraucher bleiben unberührt."
                ]
            },
            acceptableUse: {
                title: "Zulässige Nutzung und Fair Play",
                paragraphs: ["Nutze NexoChess rechtmäßig und ohne den Dienst, andere Nutzer oder Dritte zu schädigen."],
                bullets: [
                    "Greife den Dienst nicht an, überlaste oder untersuche ihn nicht und umgehe keine Sicherheitsmaßnahmen, technischen Grenzen oder Zugangsbeschränkungen.",
                    "Verwende keine Schadsoftware, Bots, massenhaftes Scraping oder automatisierte Extraktion ohne vorherige Erlaubnis; ausgenommen sind die normale Browsernutzung und der Zugriff auf öffentliche Quellcode- und Lizenzinformationen.",
                    "Verletze keine Urheber-, Datenschutz-, Vertrags- oder sonstigen Rechte, täusche keine Identität vor und behaupte keine falsche offizielle Verbindung.",
                    "Nutze keine Engine-Hilfe während Live-Partien, Prüfungen oder Wettbewerben, in denen externe Hilfe verboten ist.",
                    "Stelle NexoChess-Ausgaben nicht als offizielle Anti-Cheating-Feststellung, Turnierentscheidung oder garantierte Bewertung dar."
                ]
            },
            commercialFeatures: {
                title: "Kostenloser Dienst, Werbung und künftige Bezahlfunktionen",
                paragraphs: [
                    "Der Kerndienst wird derzeit ohne Abonnementgebühr angeboten. Später können Spenden, klar gekennzeichnete Werbung oder Sponsoring, optionale Bezahlfunktionen oder Nutzungsgrenzen hinzukommen.",
                    "Vor einer Zahlung werden Preis, Steuern, Verlängerung und Kündigung gesondert angezeigt. Ohne ausdrückliche Handlung erfolgt keine Belastung. Gesponserte Inhalte werden gekennzeichnet und bestimmen keine Engine-Bewertungen."
                ]
            },
            suspension: {
                title: "Beschränkung, Sperrung und Beendigung",
                paragraphs: [
                    "Wir dürfen automatisierten Zugriff, ein Konto oder Teile des Dienstes verhältnismäßig beschränken, wenn dies aus Sicherheitsgründen, wegen rechtswidriger Nutzung, eines wesentlichen Verstoßes, zum Schutz von Nutzern oder zur Schadensvermeidung erforderlich ist. Soweit rechtlich und technisch möglich, erläutern wir die Maßnahme.",
                    "Du kannst die Nutzung jederzeit beenden und ein optionales Konto löschen. Zwingend zu erhaltende Rechte bleiben bestehen."
                ]
            },
            liability: {
                title: "Automatisierte Analyse, Gewährleistung und Haftung",
                paragraphs: [
                    "Ausgaben werden automatisiert erstellt und dienen nur der Information. Sie sind keine offizielle Turnierentscheidung, Anti-Cheating-Feststellung oder Garantie für Verbesserung, Richtigkeit oder Erfolg. Du bleibst für deine Entscheidungen und die Einhaltung geltender Regeln verantwortlich.",
                    "Der Dienst wird nach Verfügbarkeit bereitgestellt. Soweit gesetzlich zulässig, haftet NexoChess nicht für indirekte oder unvorhersehbare Schäden, Geräte- oder Browserfehler, Ausfälle unabhängiger Anbieter oder vermeidbaren Datenverlust ohne eigene Sicherung. Zwingende Verbraucherrechte und nicht ausschließbare Haftung bleiben unberührt."
                ]
            },
            changes: {
                title: "Änderungen dieser Bedingungen",
                paragraphs: [
                    "Diese Bedingungen können bei Änderungen von NexoChess, Recht, Sicherheit oder wesentlichen Anbietern aktualisiert werden. Das Revisionsdatum steht oben.",
                    "Wesentliche Änderungen werden im Dienst und gegebenenfalls per E-Mail mit angemessener Vorankündigung mitgeteilt. Wenn du nicht zustimmst, kannst du die Nutzung beenden und dein Konto vor Inkrafttreten löschen. Bereits erworbene zwingende Rechte werden nicht rückwirkend entzogen."
                ]
            },
            law: {
                title: "Anwendbares Recht, Streitigkeiten und Kontakt",
                paragraphs: [
                    "Es gilt spanisches Recht, ohne Verbrauchern zwingende Schutzrechte ihres gewöhnlichen Aufenthaltslandes zu nehmen. Zuständige Gerichte und Behörden bestimmen sich nach dem anwendbaren Recht.",
                    "Fragen oder Beschwerden können an contact@nexochess.com gesendet werden. Ist eine Bestimmung unwirksam, bleiben die übrigen wirksam. Die Nichtdurchsetzung eines Rechts ist kein Verzicht."
                ]
            }
        }
    },
    pt: {
        updated: "Última atualização: 4 de agosto de 2026",
        sections: {
            eligibility: {
                title: "Idade e capacidade legal",
                paragraphs: [
                    "O NexoChess não se destina a menores de 14 anos. Se ainda não tiveres idade para aceitar estes Termos sozinho no teu país, utiliza o serviço apenas com autorização e supervisão de um responsável legal.",
                    "Ao utilizar o serviço, confirmas que tens capacidade legal ou que o adulto necessário aceitou estes Termos por ti. As proteções obrigatórias de menores e consumidores mantêm-se."
                ]
            },
            acceptableUse: {
                title: "Utilização aceitável e jogo limpo",
                paragraphs: ["Utiliza o NexoChess legalmente e sem prejudicar o serviço, outros utilizadores ou terceiros."],
                bullets: [
                    "Não ataques, sobrecarregues, testes, interrompas nem contornes controlos de segurança, limites técnicos ou restrições de acesso.",
                    "Não uses malware, bots, scraping em massa ou extração automatizada sem autorização prévia, salvo a utilização normal do navegador e o acesso ao código-fonte e licenças públicas.",
                    "Não infrinjas direitos de propriedade intelectual, privacidade, contratos ou outros direitos, não suplantes terceiros nem alegues uma relação oficial inexistente.",
                    "Não uses ajuda de motor em partidas ao vivo, exames ou competições em que a assistência externa seja proibida.",
                    "Não apresentes os resultados do NexoChess como decisão oficial antitrapaça, arbitral ou garantida."
                ]
            },
            commercialFeatures: {
                title: "Serviço gratuito, publicidade e futuras funções pagas",
                paragraphs: [
                    "O serviço principal é atualmente oferecido sem subscrição. No futuro poderá incluir donativos, publicidade ou patrocínio claramente identificados, funções pagas opcionais ou limites de utilização.",
                    "Antes de qualquer pagamento serão apresentados separadamente o preço, impostos, renovação e cancelamento. Não haverá cobrança sem uma ação expressa. Conteúdo patrocinado será identificado e não determinará avaliações do motor."
                ]
            },
            suspension: {
                title: "Restrição, suspensão e encerramento",
                paragraphs: [
                    "Podemos restringir proporcionalmente o acesso automatizado, uma conta ou parte do serviço quando necessário por segurança, uso ilegal, incumprimento grave, proteção de utilizadores ou prevenção de danos. Explicaremos a medida quando for legal e tecnicamente possível.",
                    "Podes deixar de usar o NexoChess a qualquer momento e eliminar uma conta opcional. Direitos que a lei obrigue a preservar mantêm-se."
                ]
            },
            liability: {
                title: "Análise automatizada, garantias e responsabilidade",
                paragraphs: [
                    "Os resultados são automatizados e informativos. Não são decisão oficial de torneio, conclusão antitrapaça nem garantia de melhoria, precisão ou resultado. Continuas responsável pelas tuas decisões e pelo cumprimento das regras aplicáveis.",
                    "O serviço é fornecido conforme disponibilidade. Na medida permitida por lei, o NexoChess não responde por perdas indiretas ou imprevisíveis, falhas do dispositivo ou navegador, interrupções de fornecedores independentes ou perda evitável de dados sem cópia. Direitos obrigatórios do consumidor e responsabilidades não excluíveis mantêm-se."
                ]
            },
            changes: {
                title: "Alterações a estes Termos",
                paragraphs: [
                    "Estes Termos podem ser atualizados quando mudarem o NexoChess, a lei, a segurança ou fornecedores essenciais. A data de revisão aparece no topo.",
                    "Alterações importantes serão comunicadas no serviço e, quando adequado, por e-mail com antecedência razoável. Se não concordares, podes deixar de usar o serviço e eliminar a conta antes da entrada em vigor. Direitos já adquiridos por normas obrigatórias não serão removidos retroativamente."
                ]
            },
            law: {
                title: "Lei aplicável, conflitos e contacto",
                paragraphs: [
                    "Estes Termos regem-se pela lei espanhola, sem retirar aos consumidores as proteções obrigatórias do país da sua residência habitual. Os tribunais competentes são os definidos pela lei aplicável.",
                    "Para questões ou reclamações, contacta contact@nexochess.com. Se uma cláusula for inválida, as restantes continuam em vigor. A falta de exercício de um direito não constitui renúncia."
                ]
            }
        }
    },
    ru: {
        updated: "Последнее обновление: 4 августа 2026 г.",
        sections: {
            eligibility: {
                title: "Возраст и дееспособность",
                paragraphs: [
                    "NexoChess не предназначен для детей младше 14 лет. Если по закону вашей страны вы не можете самостоятельно принять эти Условия, пользуйтесь сервисом только с разрешения и под контролем родителя или законного представителя.",
                    "Используя сервис, вы подтверждаете наличие необходимой дееспособности либо согласие требуемого взрослого. Обязательные гарантии для несовершеннолетних и потребителей сохраняются."
                ]
            },
            acceptableUse: {
                title: "Допустимое использование и честная игра",
                paragraphs: ["Используйте NexoChess законно и не причиняйте вред сервису, другим пользователям или третьим лицам."],
                bullets: [
                    "Не атакуйте, не перегружайте и не исследуйте сервис и не обходите меры безопасности, технические лимиты или ограничения доступа.",
                    "Не распространяйте вредоносный код и не используйте ботов, массовый сбор или автоматическое извлечение без разрешения, кроме обычной работы браузера и доступа к открытому коду и лицензиям.",
                    "Не нарушайте авторские, личные, договорные и иные права, не выдавайте себя за других и не заявляйте о несуществующей официальной связи.",
                    "Не используйте движок во время живых партий, экзаменов или соревнований, где внешняя помощь запрещена.",
                    "Не представляйте вывод NexoChess как официальное решение по читерству, турниру или гарантированную оценку."
                ]
            },
            commercialFeatures: {
                title: "Бесплатный сервис, реклама и будущие платные функции",
                paragraphs: [
                    "Основной сервис сейчас предоставляется без подписки. В будущем могут появиться пожертвования, ясно обозначенная реклама или спонсорство, дополнительные платные функции или лимиты использования.",
                    "До оплаты отдельно будут показаны цена, налоги, продление и отмена. Списание возможно только после явного действия. Спонсорский материал будет отмечен и не будет определять оценки движка."
                ]
            },
            suspension: {
                title: "Ограничение, приостановка и прекращение",
                paragraphs: [
                    "Мы можем соразмерно ограничить автоматический доступ, аккаунт или часть сервиса, если это необходимо для безопасности, из-за незаконного использования, существенного нарушения, защиты пользователей или предотвращения вреда. Причина будет объяснена, когда это возможно юридически и технически.",
                    "Вы можете прекратить использование и удалить необязательный аккаунт в любое время. Права, которые закон требует сохранить, не утрачиваются."
                ]
            },
            liability: {
                title: "Автоматический анализ, гарантии и ответственность",
                paragraphs: [
                    "Результаты формируются автоматически и носят информационный характер. Это не официальное турнирное решение, вывод о читерстве или гарантия улучшения, точности либо результата. Вы отвечаете за свои решения и соблюдение применимых правил.",
                    "Сервис предоставляется по мере доступности. В пределах закона NexoChess не отвечает за косвенные или непредвиденные потери, сбои устройства или браузера, перерывы независимых поставщиков или предотвратимую потерю данных без резервной копии. Обязательные права потребителей и неисключаемая ответственность сохраняются."
                ]
            },
            changes: {
                title: "Изменение Условий",
                paragraphs: [
                    "Условия могут обновляться при изменении NexoChess, законодательства, требований безопасности или ключевых поставщиков. Дата редакции указана вверху.",
                    "О существенных изменениях будет сообщено в сервисе и, при необходимости, по электронной почте заблаговременно. При несогласии можно прекратить использование и удалить аккаунт до вступления изменений в силу. Уже приобретённые обязательные права не отменяются задним числом."
                ]
            },
            law: {
                title: "Применимое право, споры и контакты",
                paragraphs: [
                    "Условия регулируются правом Испании, но не лишают потребителей обязательной защиты закона страны их обычного проживания. Компетентные суды и органы определяются применимым правом.",
                    "Вопросы и жалобы направляйте на contact@nexochess.com. Недействительность одного положения не затрагивает остальные. Неиспользование права не означает отказ от него."
                ]
            }
        }
    },
    zh: {
        updated: "最后更新：2026年8月4日",
        sections: {
            eligibility: {
                title: "年龄与法律行为能力",
                paragraphs: [
                    "NexoChess 不面向14岁以下儿童。如果你所在国家的法律不允许你独立接受本条款，请仅在父母或法定监护人许可和监督下使用本服务。",
                    "使用本服务即表示你具备接受本条款的法律能力，或所需的成年人已代表你接受。未成年人和消费者依法享有的强制性保护不受影响。"
                ]
            },
            acceptableUse: {
                title: "可接受使用与公平竞赛",
                paragraphs: ["请合法使用 NexoChess，不得损害服务、其他用户或第三方。"],
                bullets: [
                    "不得攻击、过载、探测或干扰服务，也不得绕过安全措施、技术限制或访问限制。",
                    "未经事先许可，不得传播恶意软件或使用机器人、大规模抓取或自动提取；正常浏览器使用以及访问公开源代码和许可证资料除外。",
                    "不得侵犯知识产权、隐私、合同或其他合法权利，不得冒充他人或虚假声称与 NexoChess 或其他平台存在官方关系。",
                    "在禁止外部协助的实时对局、考试或比赛中，不得使用引擎帮助。",
                    "不得将 NexoChess 输出描述为官方反作弊结论、比赛裁决或保证准确的评估。"
                ]
            },
            commercialFeatures: {
                title: "免费服务、广告与未来付费功能",
                paragraphs: [
                    "NexoChess 核心服务目前不收取订阅费。未来可能加入捐赠、明确标识的广告或赞助、可选付费功能或使用限制。",
                    "任何付款前都会单独展示价格、税费、续订和取消条件。未经你的明确操作不会收费。赞助内容会被标识，且不会决定引擎评估。"
                ]
            },
            suspension: {
                title: "限制、暂停与终止",
                paragraphs: [
                    "出于安全、违法使用、严重违反条款、保护用户或防止损害的合理需要，我们可按比例限制自动访问、账户或部分服务。在法律和技术允许时，我们会说明原因。",
                    "你可随时停止使用并删除可选账户。法律要求保留的权利不会因限制或删除而消失。"
                ]
            },
            liability: {
                title: "自动分析、保证与责任",
                paragraphs: [
                    "NexoChess 输出由系统自动生成，仅供参考，不构成官方比赛裁决、反作弊结论，也不保证进步、准确性或特定结果。你仍应对自己的决定以及遵守适用规则负责。",
                    "服务按可用状态提供。在法律允许的最大范围内，NexoChess 不对间接或不可预见的损失、用户设备或浏览器故障、独立服务商中断，或因未保存副本而可合理避免的数据丢失负责。依法不得排除的消费者权利和责任不受限制。"
                ]
            },
            changes: {
                title: "条款变更",
                paragraphs: [
                    "当 NexoChess、适用法律、安全要求或关键服务商发生变化时，我们可能更新本条款。页面顶部会显示修订日期。",
                    "重大变更将通过服务通知，并在适当情况下提前通过账户邮箱通知。如不同意，你可在生效前停止使用并删除账户。强制性法律下已取得的权利不会被追溯取消。"
                ]
            },
            law: {
                title: "适用法律、争议与联系",
                paragraphs: [
                    "本条款适用西班牙法律，但不会剥夺消费者依据其惯常居住国法律享有的强制性保护。管辖法院和主管机关由适用法律确定。",
                    "如有问题或投诉，请联系 contact@nexochess.com。某项条款无效不影响其他条款；未行使某项权利不构成放弃。"
                ]
            }
        }
    },
    vi: {
        updated: "Cập nhật lần cuối: 4 tháng 8 năm 2026",
        sections: {
            eligibility: {
                title: "Độ tuổi và năng lực pháp lý",
                paragraphs: [
                    "NexoChess không hướng đến trẻ em dưới 14 tuổi. Nếu pháp luật nơi bạn sống không cho phép bạn tự mình chấp nhận Điều khoản, chỉ sử dụng dịch vụ với sự cho phép và giám sát của cha mẹ hoặc người giám hộ hợp pháp.",
                    "Khi sử dụng dịch vụ, bạn xác nhận mình có năng lực pháp lý cần thiết hoặc người lớn có thẩm quyền đã chấp nhận thay bạn. Các quyền bảo vệ bắt buộc dành cho trẻ vị thành niên và người tiêu dùng vẫn được giữ nguyên."
                ]
            },
            acceptableUse: {
                title: "Sử dụng chấp nhận được và chơi công bằng",
                paragraphs: ["Hãy sử dụng NexoChess hợp pháp và không gây hại cho dịch vụ, người dùng khác hoặc bên thứ ba."],
                bullets: [
                    "Không tấn công, làm quá tải, thăm dò, gây gián đoạn hoặc vượt qua biện pháp bảo mật, giới hạn kỹ thuật hay hạn chế truy cập.",
                    "Không phát tán mã độc hoặc dùng bot, thu thập hàng loạt hay trích xuất tự động khi chưa được phép; ngoại trừ sử dụng trình duyệt thông thường và truy cập mã nguồn, giấy phép công khai.",
                    "Không xâm phạm quyền sở hữu trí tuệ, quyền riêng tư, hợp đồng hoặc quyền hợp pháp khác; không mạo danh hay tuyên bố sai về quan hệ chính thức.",
                    "Không dùng hỗ trợ của engine trong ván trực tiếp, kỳ thi hoặc giải đấu cấm trợ giúp bên ngoài.",
                    "Không trình bày kết quả NexoChess như kết luận chống gian lận, quyết định giải đấu hoặc đánh giá được bảo đảm."
                ]
            },
            commercialFeatures: {
                title: "Dịch vụ miễn phí, quảng cáo và tính năng trả phí tương lai",
                paragraphs: [
                    "Dịch vụ cốt lõi hiện không thu phí thuê bao. Sau này NexoChess có thể bổ sung quyên góp, quảng cáo hoặc tài trợ được ghi rõ, tính năng trả phí tùy chọn hoặc giới hạn sử dụng.",
                    "Trước mọi khoản thanh toán, giá, thuế, gia hạn và điều kiện hủy sẽ được hiển thị riêng. Không có khoản phí nào nếu bạn không thực hiện hành động rõ ràng. Nội dung tài trợ sẽ được nhận diện và không quyết định đánh giá của engine."
                ]
            },
            suspension: {
                title: "Hạn chế, tạm ngừng và chấm dứt",
                paragraphs: [
                    "Chúng tôi có thể hạn chế tương xứng quyền truy cập tự động, tài khoản hoặc một phần dịch vụ khi cần thiết vì an ninh, sử dụng trái pháp luật, vi phạm nghiêm trọng, bảo vệ người dùng hoặc ngăn ngừa thiệt hại. Lý do sẽ được giải thích khi pháp luật và kỹ thuật cho phép.",
                    "Bạn có thể ngừng sử dụng và xóa tài khoản tùy chọn bất cứ lúc nào. Các quyền mà pháp luật yêu cầu bảo lưu vẫn còn hiệu lực."
                ]
            },
            liability: {
                title: "Phân tích tự động, bảo đảm và trách nhiệm",
                paragraphs: [
                    "Kết quả được tạo tự động và chỉ mang tính thông tin. Đây không phải quyết định chính thức của giải đấu, kết luận chống gian lận hay bảo đảm về tiến bộ, độ chính xác hoặc kết quả. Bạn vẫn chịu trách nhiệm về quyết định và việc tuân thủ quy tắc áp dụng.",
                    "Dịch vụ được cung cấp theo tình trạng sẵn có. Trong phạm vi pháp luật cho phép, NexoChess không chịu trách nhiệm đối với thiệt hại gián tiếp hoặc không thể dự đoán, lỗi thiết bị hay trình duyệt, gián đoạn của nhà cung cấp độc lập hoặc mất dữ liệu có thể tránh bằng bản sao. Quyền bắt buộc của người tiêu dùng và trách nhiệm không thể loại trừ vẫn được giữ nguyên."
                ]
            },
            changes: {
                title: "Thay đổi Điều khoản",
                paragraphs: [
                    "Điều khoản có thể được cập nhật khi NexoChess, pháp luật, yêu cầu an ninh hoặc nhà cung cấp thiết yếu thay đổi. Ngày sửa đổi được hiển thị ở đầu trang.",
                    "Thay đổi quan trọng sẽ được thông báo trong dịch vụ và, khi phù hợp, qua email trước một khoảng thời gian hợp lý. Nếu không đồng ý, bạn có thể ngừng sử dụng và xóa tài khoản trước khi thay đổi có hiệu lực. Quyền đã có theo quy định bắt buộc không bị xóa hồi tố."
                ]
            },
            law: {
                title: "Luật áp dụng, tranh chấp và liên hệ",
                paragraphs: [
                    "Điều khoản chịu sự điều chỉnh của luật Tây Ban Nha nhưng không tước bỏ các bảo vệ bắt buộc dành cho người tiêu dùng theo luật nơi cư trú thường xuyên. Tòa án và cơ quan có thẩm quyền được xác định theo luật áp dụng.",
                    "Gửi câu hỏi hoặc khiếu nại đến contact@nexochess.com. Nếu một điều khoản vô hiệu, các điều khoản còn lại vẫn áp dụng. Việc không thực thi một quyền không đồng nghĩa từ bỏ quyền đó."
                ]
            }
        }
    },
    hi: {
        updated: "अंतिम अपडेट: 4 अगस्त 2026",
        sections: {
            eligibility: {
                title: "आयु और कानूनी क्षमता",
                paragraphs: [
                    "NexoChess 14 वर्ष से कम आयु के बच्चों के लिए निर्देशित नहीं है। यदि आपके देश का कानून आपको स्वयं इन शर्तों को स्वीकार करने की अनुमति नहीं देता, तो सेवा का उपयोग केवल माता-पिता या कानूनी अभिभावक की अनुमति और निगरानी में करें।",
                    "सेवा का उपयोग करके आप पुष्टि करते हैं कि आपके पास आवश्यक कानूनी क्षमता है या आवश्यक वयस्क ने आपकी ओर से इन शर्तों को स्वीकार किया है। नाबालिगों और उपभोक्ताओं की अनिवार्य सुरक्षा बनी रहती है।"
                ]
            },
            acceptableUse: {
                title: "स्वीकार्य उपयोग और निष्पक्ष खेल",
                paragraphs: ["NexoChess का उपयोग कानूनसम्मत तरीके से करें और सेवा, अन्य उपयोगकर्ताओं या तीसरे पक्ष को नुकसान न पहुँचाएँ।"],
                bullets: [
                    "सेवा पर हमला, अत्यधिक भार, जाँच या व्यवधान न करें और सुरक्षा उपायों, तकनीकी सीमाओं या पहुँच प्रतिबंधों को न तोड़ें।",
                    "पूर्व अनुमति के बिना मैलवेयर, बॉट, बड़े पैमाने पर स्क्रैपिंग या स्वचालित निष्कर्षण का उपयोग न करें; सामान्य ब्राउज़र उपयोग और सार्वजनिक स्रोत व लाइसेंस सामग्री तक पहुँच अपवाद हैं।",
                    "बौद्धिक संपदा, गोपनीयता, अनुबंध या अन्य कानूनी अधिकारों का उल्लंघन न करें, किसी का रूप धारण न करें और झूठा आधिकारिक संबंध न बताएँ।",
                    "लाइव खेल, परीक्षा या ऐसी प्रतियोगिता में इंजन सहायता न लें जहाँ बाहरी सहायता प्रतिबंधित हो।",
                    "NexoChess परिणाम को आधिकारिक एंटी-चीटिंग निष्कर्ष, टूर्नामेंट निर्णय या गारंटीशुदा मूल्यांकन के रूप में प्रस्तुत न करें।"
                ]
            },
            commercialFeatures: {
                title: "मुफ़्त सेवा, विज्ञापन और भविष्य की सशुल्क सुविधाएँ",
                paragraphs: [
                    "मुख्य सेवा फिलहाल सदस्यता शुल्क के बिना उपलब्ध है। भविष्य में दान, स्पष्ट रूप से पहचाने गए विज्ञापन या प्रायोजन, वैकल्पिक सशुल्क सुविधाएँ या उपयोग सीमाएँ जोड़ी जा सकती हैं।",
                    "भुगतान से पहले मूल्य, कर, नवीनीकरण और रद्द करने की शर्तें अलग से दिखाई जाएँगी। स्पष्ट कार्रवाई के बिना शुल्क नहीं लिया जाएगा। प्रायोजित सामग्री पहचानी जाएगी और इंजन मूल्यांकन तय नहीं करेगी।"
                ]
            },
            suspension: {
                title: "प्रतिबंध, निलंबन और समाप्ति",
                paragraphs: [
                    "सुरक्षा, अवैध उपयोग, गंभीर उल्लंघन, उपयोगकर्ता संरक्षण या नुकसान रोकने के लिए आवश्यक होने पर हम स्वचालित पहुँच, खाते या सेवा के हिस्से को अनुपातिक रूप से सीमित कर सकते हैं। कानूनी और तकनीकी रूप से संभव होने पर कारण बताया जाएगा।",
                    "आप किसी भी समय उपयोग बंद कर सकते हैं और वैकल्पिक खाता हटा सकते हैं। कानून द्वारा सुरक्षित रखे जाने वाले अधिकार बने रहते हैं।"
                ]
            },
            liability: {
                title: "स्वचालित विश्लेषण, वारंटी और दायित्व",
                paragraphs: [
                    "परिणाम स्वचालित और केवल सूचना के लिए हैं। वे आधिकारिक टूर्नामेंट निर्णय, एंटी-चीटिंग निष्कर्ष या सुधार, सटीकता अथवा परिणाम की गारंटी नहीं हैं। अपने निर्णय और लागू नियमों का पालन आपकी जिम्मेदारी है।",
                    "सेवा उपलब्धता के आधार पर दी जाती है। कानून की सीमा में NexoChess अप्रत्यक्ष या अप्रत्याशित हानि, उपकरण या ब्राउज़र विफलता, स्वतंत्र प्रदाता की रुकावट या प्रतिलिपि न रखने से बचाई जा सकने वाली डेटा हानि के लिए उत्तरदायी नहीं है। अनिवार्य उपभोक्ता अधिकार और गैर-बहिष्करणीय दायित्व प्रभावित नहीं होते।"
                ]
            },
            changes: {
                title: "इन शर्तों में बदलाव",
                paragraphs: [
                    "NexoChess, कानून, सुरक्षा आवश्यकताओं या आवश्यक प्रदाताओं में बदलाव होने पर शर्तें अपडेट की जा सकती हैं। संशोधन तिथि ऊपर दिखाई जाती है।",
                    "महत्वपूर्ण बदलाव सेवा में और उचित होने पर उचित अग्रिम सूचना के साथ ईमेल से बताए जाएँगे। असहमति होने पर प्रभावी तिथि से पहले उपयोग बंद और खाता हटाया जा सकता है। अनिवार्य कानून के अंतर्गत पहले से प्राप्त अधिकार पीछे से नहीं हटाए जाएँगे।"
                ]
            },
            law: {
                title: "लागू कानून, विवाद और संपर्क",
                paragraphs: [
                    "इन शर्तों पर स्पेन का कानून लागू होता है, लेकिन उपभोक्ताओं को उनके सामान्य निवास देश के अनिवार्य संरक्षण से वंचित नहीं किया जाता। सक्षम न्यायालय और प्राधिकरण लागू कानून से तय होंगे।",
                    "प्रश्न या शिकायत contact@nexochess.com पर भेजें। किसी प्रावधान के अमान्य होने पर बाकी प्रावधान लागू रहेंगे। किसी अधिकार को लागू न करना उसका त्याग नहीं है।"
                ]
            }
        }
    },
    mr: {
        updated: "शेवटचे अद्यतन: 4 ऑगस्ट 2026",
        sections: {
            eligibility: {
                title: "वय आणि कायदेशीर क्षमता",
                paragraphs: [
                    "NexoChess हे 14 वर्षांखालील मुलांसाठी निर्देशित नाही. तुमच्या देशाच्या कायद्यानुसार तुम्ही या अटी स्वतः स्वीकारू शकत नसाल, तर पालक किंवा कायदेशीर संरक्षकाच्या परवानगी व देखरेखीखालीच सेवा वापरा.",
                    "सेवा वापरून तुम्ही आवश्यक कायदेशीर क्षमता असल्याची किंवा आवश्यक प्रौढाने तुमच्यावतीने अटी स्वीकारल्याची पुष्टी करता. अल्पवयीन आणि ग्राहकांचे अनिवार्य संरक्षण कायम राहते."
                ]
            },
            acceptableUse: {
                title: "मान्य वापर आणि निष्पक्ष खेळ",
                paragraphs: ["NexoChess चा कायदेशीर वापर करा आणि सेवा, इतर वापरकर्ते किंवा तृतीय पक्षांना हानी पोहोचवू नका."],
                bullets: [
                    "सेवेवर हल्ला, अतिभार, तपासणी किंवा व्यत्यय आणू नका आणि सुरक्षा नियंत्रण, तांत्रिक मर्यादा किंवा प्रवेश निर्बंध चुकवू नका.",
                    "पूर्वपरवानगीशिवाय मालवेअर, बॉट, मोठ्या प्रमाणातील स्क्रॅपिंग किंवा स्वयंचलित डेटा काढणे वापरू नका; सामान्य ब्राउझर वापर आणि सार्वजनिक स्रोत व परवाना माहितीचा प्रवेश अपवाद आहे.",
                    "बौद्धिक संपदा, गोपनीयता, करार किंवा इतर कायदेशीर अधिकारांचे उल्लंघन करू नका, दुसऱ्याचे रूप घेऊ नका किंवा खोटा अधिकृत संबंध सांगू नका.",
                    "बाह्य मदत निषिद्ध असलेल्या थेट खेळ, परीक्षा किंवा स्पर्धेत इंजिन सहाय्य वापरू नका.",
                    "NexoChess परिणाम अधिकृत अँटी-चीटिंग निष्कर्ष, स्पर्धा निर्णय किंवा हमी असलेले मूल्यांकन म्हणून मांडू नका."
                ]
            },
            commercialFeatures: {
                title: "मोफत सेवा, जाहिरात आणि भविष्यातील सशुल्क सुविधा",
                paragraphs: [
                    "मुख्य सेवा सध्या सदस्यता शुल्काशिवाय उपलब्ध आहे. भविष्यात देणग्या, स्पष्टपणे दर्शविलेली जाहिरात किंवा प्रायोजकत्व, ऐच्छिक सशुल्क सुविधा किंवा वापर मर्यादा जोडल्या जाऊ शकतात.",
                    "कोणत्याही देयकापूर्वी किंमत, कर, नूतनीकरण आणि रद्द करण्याच्या अटी वेगळ्या दाखवल्या जातील. स्पष्ट कृतीशिवाय शुल्क घेतले जाणार नाही. प्रायोजित सामग्री ओळखली जाईल आणि इंजिन मूल्यांकन ठरवणार नाही."
                ]
            },
            suspension: {
                title: "मर्यादा, निलंबन आणि समाप्ती",
                paragraphs: [
                    "सुरक्षा, बेकायदेशीर वापर, गंभीर उल्लंघन, वापरकर्ता संरक्षण किंवा नुकसान टाळण्यासाठी आवश्यक असल्यास आम्ही स्वयंचलित प्रवेश, खाते किंवा सेवेचा भाग प्रमाणबद्ध रीतीने मर्यादित करू शकतो. कायदेशीर आणि तांत्रिकदृष्ट्या शक्य असल्यास कारण स्पष्ट केले जाईल.",
                    "तुम्ही कधीही वापर थांबवू शकता आणि ऐच्छिक खाते हटवू शकता. कायद्याने जपणे आवश्यक असलेले अधिकार कायम राहतात."
                ]
            },
            liability: {
                title: "स्वयंचलित विश्लेषण, हमी आणि जबाबदारी",
                paragraphs: [
                    "परिणाम स्वयंचलित आणि माहितीपुरते आहेत. ते अधिकृत स्पर्धा निर्णय, अँटी-चीटिंग निष्कर्ष किंवा सुधारणा, अचूकता वा निकालाची हमी नाहीत. तुमचे निर्णय आणि लागू नियमांचे पालन ही तुमची जबाबदारी आहे.",
                    "सेवा उपलब्धतेनुसार दिली जाते. कायद्याने परवानगी दिलेल्या मर्यादेत NexoChess अप्रत्यक्ष किंवा अनपेक्षित नुकसान, उपकरण वा ब्राउझर बिघाड, स्वतंत्र पुरवठादारांचा व्यत्यय किंवा प्रत न ठेवल्यामुळे टाळता आली असती अशी डेटा हानी यासाठी जबाबदार नाही. अनिवार्य ग्राहक अधिकार आणि वगळता न येणारी जबाबदारी अबाधित राहते."
                ]
            },
            changes: {
                title: "या अटींतील बदल",
                paragraphs: [
                    "NexoChess, कायदा, सुरक्षा आवश्यकता किंवा आवश्यक पुरवठादार बदलल्यास अटी अद्यतनित केल्या जाऊ शकतात. सुधारणा दिनांक वर दिला आहे.",
                    "महत्त्वाचे बदल सेवेत आणि योग्य असल्यास वाजवी पूर्वसूचनेसह ईमेलने कळवले जातील. असहमती असल्यास प्रभावी दिनांकापूर्वी वापर थांबवून खाते हटवता येईल. अनिवार्य कायद्यानुसार आधी मिळालेले अधिकार मागील तारखेपासून काढले जाणार नाहीत."
                ]
            },
            law: {
                title: "लागू कायदा, वाद आणि संपर्क",
                paragraphs: [
                    "या अटींवर स्पॅनिश कायदा लागू होतो, परंतु ग्राहकांना त्यांच्या नेहमीच्या निवासाच्या देशातील अनिवार्य संरक्षणापासून वंचित केले जात नाही. सक्षम न्यायालये आणि प्राधिकरण लागू कायद्यानुसार ठरतील.",
                    "प्रश्न किंवा तक्रारी contact@nexochess.com वर पाठवा. एखादी तरतूद अमान्य ठरल्यास उर्वरित तरतुदी लागू राहतील. एखादा अधिकार न वापरणे म्हणजे त्याग नाही."
                ]
            }
        }
    },
    pl: {
        updated: "Ostatnia aktualizacja: 4 sierpnia 2026 r.",
        sections: {
            eligibility: {
                title: "Wiek i zdolność prawna",
                paragraphs: [
                    "NexoChess nie jest kierowany do dzieci poniżej 14 lat. Jeżeli prawo Twojego kraju nie pozwala Ci samodzielnie zaakceptować Warunków, korzystaj z usługi wyłącznie za zgodą i pod nadzorem rodzica lub opiekuna prawnego.",
                    "Korzystając z usługi, potwierdzasz wymaganą zdolność prawną albo zgodę właściwej osoby dorosłej. Obowiązkowa ochrona małoletnich i konsumentów pozostaje bez zmian."
                ]
            },
            acceptableUse: {
                title: "Dozwolone korzystanie i fair play",
                paragraphs: ["Korzystaj z NexoChess zgodnie z prawem i bez szkody dla usługi, innych użytkowników lub osób trzecich."],
                bullets: [
                    "Nie atakuj, nie przeciążaj, nie testuj ani nie zakłócaj usługi i nie omijaj zabezpieczeń, limitów technicznych ani ograniczeń dostępu.",
                    "Nie rozpowszechniaj złośliwego oprogramowania i nie używaj botów, masowego scrapingu ani automatycznego pozyskiwania danych bez wcześniejszej zgody; wyjątkiem jest zwykłe korzystanie z przeglądarki oraz dostęp do publicznego kodu i licencji.",
                    "Nie naruszaj praw własności intelektualnej, prywatności, umów ani innych praw, nie podszywaj się pod inne osoby i nie twierdź fałszywie, że istnieje oficjalna współpraca.",
                    "Nie korzystaj z pomocy silnika podczas partii na żywo, egzaminów ani zawodów, w których pomoc zewnętrzna jest zabroniona.",
                    "Nie przedstawiaj wyników NexoChess jako oficjalnego ustalenia dotyczącego oszustwa, decyzji turniejowej ani gwarantowanej oceny."
                ]
            },
            commercialFeatures: {
                title: "Bezpłatna usługa, reklamy i przyszłe funkcje płatne",
                paragraphs: [
                    "Podstawowa usługa jest obecnie dostępna bez opłaty abonamentowej. W przyszłości mogą pojawić się darowizny, wyraźnie oznaczone reklamy lub sponsoring, opcjonalne funkcje płatne albo limity korzystania.",
                    "Przed płatnością osobno pokażemy cenę, podatki, zasady odnowienia i anulowania. Opłata nie zostanie pobrana bez wyraźnego działania. Treści sponsorowane będą oznaczone i nie będą wpływać na oceny silnika."
                ]
            },
            suspension: {
                title: "Ograniczenie, zawieszenie i zakończenie",
                paragraphs: [
                    "Możemy proporcjonalnie ograniczyć automatyczny dostęp, konto lub część usługi, gdy jest to rozsądnie konieczne dla bezpieczeństwa, z powodu bezprawnego użycia, istotnego naruszenia, ochrony użytkowników lub zapobiegania szkodzie. Przyczyna zostanie wyjaśniona, gdy będzie to prawnie i technicznie możliwe.",
                    "Możesz w każdej chwili przestać korzystać z NexoChess i usunąć opcjonalne konto. Prawa, które prawo nakazuje zachować, pozostają w mocy."
                ]
            },
            liability: {
                title: "Automatyczna analiza, gwarancje i odpowiedzialność",
                paragraphs: [
                    "Wyniki są generowane automatycznie i mają charakter informacyjny. Nie są oficjalną decyzją turniejową, ustaleniem antycheat ani gwarancją poprawy, dokładności lub wyniku. Odpowiadasz za własne decyzje i przestrzeganie obowiązujących zasad.",
                    "Usługa jest świadczona w miarę dostępności. W granicach prawa NexoChess nie odpowiada za straty pośrednie lub nieprzewidywalne, awarie urządzenia lub przeglądarki, przerwy niezależnych dostawców ani możliwą do uniknięcia utratę danych bez kopii. Obowiązkowe prawa konsumenta i odpowiedzialność, której nie można wyłączyć, pozostają nienaruszone."
                ]
            },
            changes: {
                title: "Zmiany Warunków",
                paragraphs: [
                    "Warunki mogą być aktualizowane, gdy zmienia się NexoChess, prawo, wymagania bezpieczeństwa lub kluczowi dostawcy. Data wersji znajduje się u góry.",
                    "Istotne zmiany będą ogłaszane w usłudze i, gdy to właściwe, e-mailem z rozsądnym wyprzedzeniem. W razie braku zgody możesz przestać korzystać i usunąć konto przed wejściem zmian w życie. Prawa już nabyte na podstawie przepisów bezwzględnie obowiązujących nie zostaną odebrane wstecz."
                ]
            },
            law: {
                title: "Prawo właściwe, spory i kontakt",
                paragraphs: [
                    "Warunki podlegają prawu hiszpańskiemu, bez pozbawiania konsumentów obowiązkowej ochrony prawa państwa ich zwykłego pobytu. Właściwe sądy i organy określa obowiązujące prawo.",
                    "Pytania i skargi kieruj na contact@nexochess.com. Nieważność jednego postanowienia nie wpływa na pozostałe. Niewykonanie prawa nie oznacza zrzeczenia się go."
                ]
            }
        }
    }
};

export function getTermsRevisionCopy(language: string) {
    const normalisedLanguage = language.toLowerCase().split("-")[0];
    return revisions[normalisedLanguage] || revisions.en;
}
