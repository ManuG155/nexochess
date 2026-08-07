interface HelpGuide {
    id: string;
    title: string;
    summary: string;
    steps: string[];
    href: string;
    action: string;
}

interface HelpIssue {
    id: string;
    title: string;
    answer: string;
}

interface HelpCompletionCopy {
    libraryEyebrow: string;
    libraryTitle: string;
    librarySubtitle: string;
    guides: HelpGuide[];
    troubleshootingEyebrow: string;
    troubleshootingTitle: string;
    troubleshootingSubtitle: string;
    issues: HelpIssue[];
    supportTitle: string;
    supportSubtitle: string;
    supportChecklist: string[];
    supportAction: string;
}

const copies: Record<string, HelpCompletionCopy> = {
    en: {
        libraryEyebrow: "Practical guides",
        libraryTitle: "Use every part of NexoChess with confidence",
        librarySubtitle: "Short, direct instructions for the main workflows, without sending you through technical documentation.",
        guides: [
            {
                id: "analysis",
                title: "Analyse and review a game",
                summary: "Go from a game source to the summary and the move-by-move review.",
                steps: [
                    "Open Analysis and choose PGN, FEN or a supported public game source.",
                    "Add the game, check the players and colours, then start the analysis.",
                    "Use the summary first and then review each move with the board, evaluation and coach explanation."
                ],
                href: "/analysis",
                action: "Open Analysis"
            },
            {
                id: "archive",
                title: "Find and keep your analyses",
                summary: "Understand the difference between the local Archive and optional account synchronisation.",
                steps: [
                    "Guest analyses are stored in the current browser profile.",
                    "Use the same browser and profile to find local games again in Archive.",
                    "Sign in only when you want compatible account and synchronisation features across devices."
                ],
                href: "/archive",
                action: "Open Archive"
            },
            {
                id: "puzzles",
                title: "Train with puzzles",
                summary: "Choose between learning from analysed games and filtered free training.",
                steps: [
                    "Choose the training mode that matches your goal.",
                    "Filter by theme and difficulty when using free training.",
                    "Use hints or the solution when needed, then continue manually or with automatic advance."
                ],
                href: "/puzzles",
                action: "Open Puzzles"
            },
            {
                id: "account",
                title: "Account, language and appearance",
                summary: "Manage optional sign-in, language, theme and personal preferences.",
                steps: [
                    "You can use the basic analysis flow without creating an account.",
                    "Use the account controls for sign-in, email verification and password recovery.",
                    "Open Settings to change language, appearance, coach and available preferences."
                ],
                href: "/settings",
                action: "Open Settings"
            }
        ],
        troubleshootingEyebrow: "Troubleshooting",
        troubleshootingTitle: "Solve the most common problems",
        troubleshootingSubtitle: "Try these checks before contacting support. They do not delete your account or cloud data.",
        issues: [
            {
                id: "import",
                title: "The game cannot be imported",
                answer: "Check that the PGN or FEN is complete and has not gained extra text when copied. For a public username, verify its spelling and retry with another recent game."
            },
            {
                id: "analysis",
                title: "The analysis does not finish",
                answer: "Keep the analysis tab open, confirm that the connection is stable and retry the same game once. If it happens repeatedly, note the browser, game source and the point where it stops."
            },
            {
                id: "archive",
                title: "A local analysis is missing",
                answer: "Local analyses belong to the browser profile where they were created. Check that you are using the same device, browser profile and non-private window, and that site data was not cleared."
            },
            {
                id: "account",
                title: "Sign-in or verification fails",
                answer: "Check the email address, spam folder and whether the verification link is still valid. Retry from a normal browser window; if the problem remains, contact support without sending passwords or secret codes."
            }
        ],
        supportTitle: "Send a useful support request",
        supportSubtitle: "These details usually let us reproduce the problem much faster:",
        supportChecklist: [
            "Browser and device used.",
            "Exact steps before the problem appeared.",
            "Screenshot or visible error message, with personal data hidden.",
            "Whether it happens once or every time."
        ],
        supportAction: "Contact support"
    },
    es: {
        libraryEyebrow: "Guías prácticas",
        libraryTitle: "Usa cada parte de NexoChess con seguridad",
        librarySubtitle: "Instrucciones breves y directas para los flujos principales, sin obligarte a leer documentación técnica.",
        guides: [
            {
                id: "analysis",
                title: "Analizar y revisar una partida",
                summary: "Pasa desde el origen de la partida hasta el resumen y la revisión movimiento a movimiento.",
                steps: [
                    "Abre Análisis y elige PGN, FEN o una fuente pública de partidas compatible.",
                    "Añade la partida, comprueba jugadores y colores, e inicia el análisis.",
                    "Consulta primero el resumen y después revisa cada jugada con el tablero, la evaluación y la explicación del entrenador."
                ],
                href: "/analysis",
                action: "Abrir Análisis"
            },
            {
                id: "archive",
                title: "Encontrar y conservar tus análisis",
                summary: "Entiende la diferencia entre el Archivo local y la sincronización opcional de la cuenta.",
                steps: [
                    "Los análisis como invitado se guardan en el perfil actual del navegador.",
                    "Usa el mismo navegador y perfil para volver a encontrarlos en Archivo.",
                    "Inicia sesión solo cuando quieras funciones compatibles de cuenta y sincronización entre dispositivos."
                ],
                href: "/archive",
                action: "Abrir Archivo"
            },
            {
                id: "puzzles",
                title: "Entrenar con puzzles",
                summary: "Elige entre aprender de partidas analizadas y entrenar por libre con filtros.",
                steps: [
                    "Selecciona el modo de entrenamiento que encaje con tu objetivo.",
                    "Filtra por tema y dificultad cuando uses el entrenamiento libre.",
                    "Utiliza la pista o la solución cuando la necesites y continúa manualmente o con el paso automático."
                ],
                href: "/puzzles",
                action: "Abrir Puzzles"
            },
            {
                id: "account",
                title: "Cuenta, idioma y apariencia",
                summary: "Gestiona el inicio de sesión opcional, el idioma, el tema y tus preferencias.",
                steps: [
                    "Puedes utilizar el flujo básico de análisis sin crear una cuenta.",
                    "Usa los controles de cuenta para iniciar sesión, verificar el correo o recuperar la contraseña.",
                    "Abre Ajustes para cambiar idioma, apariencia, entrenador y las preferencias disponibles."
                ],
                href: "/settings",
                action: "Abrir Ajustes"
            }
        ],
        troubleshootingEyebrow: "Resolución de problemas",
        troubleshootingTitle: "Soluciona los problemas más habituales",
        troubleshootingSubtitle: "Prueba estas comprobaciones antes de contactar. No eliminan tu cuenta ni tus datos en la nube.",
        issues: [
            {
                id: "import",
                title: "La partida no se puede importar",
                answer: "Comprueba que el PGN o la FEN estén completos y que no hayan ganado texto adicional al copiarlos. Para un usuario público, revisa cómo está escrito y prueba con otra partida reciente."
            },
            {
                id: "analysis",
                title: "El análisis no termina",
                answer: "Mantén abierta la pestaña del análisis, confirma que la conexión sea estable y vuelve a probar una vez con la misma partida. Si se repite, apunta el navegador, el origen de la partida y el punto donde se detiene."
            },
            {
                id: "archive",
                title: "Falta un análisis local",
                answer: "Los análisis locales pertenecen al perfil del navegador donde se crearon. Comprueba que usas el mismo dispositivo, perfil y ventana no privada, y que no se hayan borrado los datos del sitio."
            },
            {
                id: "account",
                title: "Falla el inicio de sesión o la verificación",
                answer: "Revisa la dirección de correo, la carpeta de spam y que el enlace de verificación siga siendo válido. Reinténtalo desde una ventana normal; si continúa, contacta sin enviar contraseñas ni códigos secretos."
            }
        ],
        supportTitle: "Envía una solicitud de soporte útil",
        supportSubtitle: "Estos datos suelen permitirnos reproducir el problema mucho más rápido:",
        supportChecklist: [
            "Navegador y dispositivo utilizados.",
            "Pasos exactos anteriores al problema.",
            "Captura o mensaje de error visible, ocultando datos personales.",
            "Si sucede una sola vez o siempre."
        ],
        supportAction: "Contactar con soporte"
    },
    fr: {
        libraryEyebrow: "Guides pratiques",
        libraryTitle: "Utilisez chaque partie de NexoChess en toute confiance",
        librarySubtitle: "Des instructions courtes et directes pour les principaux parcours, sans documentation technique inutile.",
        guides: [
            {
                id: "analysis",
                title: "Analyser et revoir une partie",
                summary: "Passez de la source de la partie au résumé puis à la révision coup par coup.",
                steps: [
                    "Ouvrez Analyse et choisissez PGN, FEN ou une source publique compatible.",
                    "Ajoutez la partie, vérifiez les joueurs et les couleurs, puis lancez l’analyse.",
                    "Consultez d’abord le résumé, puis chaque coup avec l’échiquier, l’évaluation et l’explication de l’entraîneur."
                ],
                href: "/analysis",
                action: "Ouvrir Analyse"
            },
            {
                id: "archive",
                title: "Retrouver et conserver vos analyses",
                summary: "Comprenez la différence entre les Archives locales et la synchronisation facultative du compte.",
                steps: [
                    "Les analyses en mode invité sont enregistrées dans le profil actuel du navigateur.",
                    "Utilisez le même navigateur et le même profil pour les retrouver dans Archives.",
                    "Connectez-vous seulement si vous souhaitez les fonctions compatibles de compte et de synchronisation entre appareils."
                ],
                href: "/archive",
                action: "Ouvrir Archives"
            },
            {
                id: "puzzles",
                title: "S’entraîner avec les puzzles",
                summary: "Choisissez entre vos parties analysées et un entraînement libre filtré.",
                steps: [
                    "Choisissez le mode d’entraînement adapté à votre objectif.",
                    "Filtrez par thème et difficulté en entraînement libre.",
                    "Utilisez l’indice ou la solution si nécessaire, puis continuez manuellement ou automatiquement."
                ],
                href: "/puzzles",
                action: "Ouvrir Puzzles"
            },
            {
                id: "account",
                title: "Compte, langue et apparence",
                summary: "Gérez la connexion facultative, la langue, le thème et vos préférences.",
                steps: [
                    "Le parcours d’analyse de base fonctionne sans création de compte.",
                    "Utilisez les commandes du compte pour vous connecter, vérifier l’adresse e-mail ou récupérer le mot de passe.",
                    "Ouvrez Paramètres pour modifier la langue, l’apparence, l’entraîneur et les préférences disponibles."
                ],
                href: "/settings",
                action: "Ouvrir Paramètres"
            }
        ],
        troubleshootingEyebrow: "Dépannage",
        troubleshootingTitle: "Résoudre les problèmes les plus fréquents",
        troubleshootingSubtitle: "Essayez ces vérifications avant de contacter l’assistance. Elles ne suppriment ni le compte ni les données cloud.",
        issues: [
            {
                id: "import",
                title: "La partie ne peut pas être importée",
                answer: "Vérifiez que le PGN ou la FEN est complet et qu’aucun texte supplémentaire n’a été ajouté lors de la copie. Pour un identifiant public, vérifiez l’orthographe et essayez une autre partie récente."
            },
            {
                id: "analysis",
                title: "L’analyse ne se termine pas",
                answer: "Gardez l’onglet ouvert, vérifiez la stabilité de la connexion et réessayez une fois avec la même partie. Si cela se répète, notez le navigateur, la source et l’étape où l’analyse s’arrête."
            },
            {
                id: "archive",
                title: "Une analyse locale a disparu",
                answer: "Les analyses locales appartiennent au profil de navigateur où elles ont été créées. Vérifiez l’appareil, le profil, l’absence de navigation privée et que les données du site n’ont pas été effacées."
            },
            {
                id: "account",
                title: "La connexion ou la vérification échoue",
                answer: "Vérifiez l’adresse e-mail, le dossier indésirable et la validité du lien. Réessayez dans une fenêtre normale ; si le problème persiste, contactez-nous sans envoyer de mot de passe ni de code secret."
            }
        ],
        supportTitle: "Envoyer une demande d’assistance utile",
        supportSubtitle: "Ces informations nous permettent généralement de reproduire le problème plus vite :",
        supportChecklist: [
            "Navigateur et appareil utilisés.",
            "Étapes exactes avant le problème.",
            "Capture ou message d’erreur visible, avec les données personnelles masquées.",
            "Le problème se produit une fois ou à chaque fois."
        ],
        supportAction: "Contacter l’assistance"
    },
    de: {
        libraryEyebrow: "Praktische Anleitungen",
        libraryTitle: "Nutze alle Bereiche von NexoChess sicher",
        librarySubtitle: "Kurze, direkte Schritte für die wichtigsten Abläufe – ohne technische Dokumentation durchsuchen zu müssen.",
        guides: [
            {
                id: "analysis",
                title: "Partie analysieren und prüfen",
                summary: "Von der Partiequelle zur Zusammenfassung und zur Zug-für-Zug-Überprüfung.",
                steps: [
                    "Öffne Analyse und wähle PGN, FEN oder eine unterstützte öffentliche Partiequelle.",
                    "Füge die Partie hinzu, prüfe Spieler und Farben und starte die Analyse.",
                    "Lies zuerst die Zusammenfassung und prüfe danach jeden Zug mit Brett, Bewertung und Trainererklärung."
                ],
                href: "/analysis",
                action: "Analyse öffnen"
            },
            {
                id: "archive",
                title: "Analysen finden und behalten",
                summary: "Verstehe den Unterschied zwischen lokalem Archiv und optionaler Kontosynchronisierung.",
                steps: [
                    "Gastanalysen werden im aktuellen Browserprofil gespeichert.",
                    "Nutze denselben Browser und dasselbe Profil, um lokale Partien im Archiv wiederzufinden.",
                    "Melde dich nur an, wenn du kompatible Konto- und Synchronisierungsfunktionen auf mehreren Geräten nutzen möchtest."
                ],
                href: "/archive",
                action: "Archiv öffnen"
            },
            {
                id: "puzzles",
                title: "Mit Aufgaben trainieren",
                summary: "Wähle zwischen Fehlern aus analysierten Partien und frei gefiltertem Training.",
                steps: [
                    "Wähle den Trainingsmodus passend zu deinem Ziel.",
                    "Filtere beim freien Training nach Thema und Schwierigkeit.",
                    "Nutze bei Bedarf Hinweis oder Lösung und fahre manuell oder automatisch fort."
                ],
                href: "/puzzles",
                action: "Aufgaben öffnen"
            },
            {
                id: "account",
                title: "Konto, Sprache und Darstellung",
                summary: "Verwalte optionale Anmeldung, Sprache, Design und persönliche Einstellungen.",
                steps: [
                    "Der grundlegende Analyseablauf funktioniert ohne Konto.",
                    "Nutze die Kontofunktionen für Anmeldung, E-Mail-Bestätigung und Passwortwiederherstellung.",
                    "Öffne Einstellungen, um Sprache, Darstellung, Trainer und verfügbare Optionen zu ändern."
                ],
                href: "/settings",
                action: "Einstellungen öffnen"
            }
        ],
        troubleshootingEyebrow: "Fehlerbehebung",
        troubleshootingTitle: "Häufige Probleme lösen",
        troubleshootingSubtitle: "Probiere diese Prüfungen vor einer Supportanfrage. Sie löschen weder Konto noch Cloud-Daten.",
        issues: [
            {
                id: "import",
                title: "Die Partie lässt sich nicht importieren",
                answer: "Prüfe, ob PGN oder FEN vollständig sind und beim Kopieren kein zusätzlicher Text eingefügt wurde. Kontrolliere bei einem öffentlichen Benutzernamen die Schreibweise und teste eine andere aktuelle Partie."
            },
            {
                id: "analysis",
                title: "Die Analyse wird nicht abgeschlossen",
                answer: "Lass den Analyse-Tab geöffnet, prüfe die Verbindung und versuche dieselbe Partie einmal erneut. Tritt es wiederholt auf, notiere Browser, Quelle und die Stelle, an der die Analyse stoppt."
            },
            {
                id: "archive",
                title: "Eine lokale Analyse fehlt",
                answer: "Lokale Analysen gehören zum Browserprofil, in dem sie erstellt wurden. Prüfe Gerät, Profil, normales Fenster und ob die Website-Daten gelöscht wurden."
            },
            {
                id: "account",
                title: "Anmeldung oder Bestätigung schlägt fehl",
                answer: "Prüfe E-Mail-Adresse, Spam-Ordner und Gültigkeit des Bestätigungslinks. Versuche es in einem normalen Browserfenster erneut; sende dem Support niemals Passwörter oder geheime Codes."
            }
        ],
        supportTitle: "Eine hilfreiche Supportanfrage senden",
        supportSubtitle: "Mit diesen Angaben können wir das Problem meist deutlich schneller nachstellen:",
        supportChecklist: [
            "Verwendeter Browser und Gerät.",
            "Genaue Schritte vor dem Problem.",
            "Screenshot oder sichtbare Fehlermeldung, persönliche Daten verdeckt.",
            "Ob es einmalig oder jedes Mal passiert."
        ],
        supportAction: "Support kontaktieren"
    },
    pt: {
        libraryEyebrow: "Guias práticos",
        libraryTitle: "Utilize todas as áreas do NexoChess com confiança",
        librarySubtitle: "Instruções curtas e diretas para os fluxos principais, sem documentação técnica desnecessária.",
        guides: [
            {
                id: "analysis",
                title: "Analisar e rever uma partida",
                summary: "Passe da origem da partida ao resumo e à revisão jogada a jogada.",
                steps: [
                    "Abra Análise e escolha PGN, FEN ou uma fonte pública compatível.",
                    "Adicione a partida, confirme jogadores e cores e inicie a análise.",
                    "Veja primeiro o resumo e depois reveja cada jogada com o tabuleiro, a avaliação e a explicação do treinador."
                ],
                href: "/analysis",
                action: "Abrir Análise"
            },
            {
                id: "archive",
                title: "Encontrar e conservar análises",
                summary: "Compreenda a diferença entre o Arquivo local e a sincronização opcional da conta.",
                steps: [
                    "As análises como convidado ficam guardadas no perfil atual do navegador.",
                    "Use o mesmo navegador e perfil para voltar a encontrá-las no Arquivo.",
                    "Inicie sessão apenas quando quiser funções compatíveis de conta e sincronização entre dispositivos."
                ],
                href: "/archive",
                action: "Abrir Arquivo"
            },
            {
                id: "puzzles",
                title: "Treinar com puzzles",
                summary: "Escolha entre aprender com partidas analisadas e treino livre com filtros.",
                steps: [
                    "Escolha o modo de treino adequado ao seu objetivo.",
                    "Filtre por tema e dificuldade no treino livre.",
                    "Use a pista ou a solução quando necessário e continue manualmente ou com avanço automático."
                ],
                href: "/puzzles",
                action: "Abrir Puzzles"
            },
            {
                id: "account",
                title: "Conta, idioma e aparência",
                summary: "Gira o início de sessão opcional, o idioma, o tema e as preferências.",
                steps: [
                    "Pode usar o fluxo básico de análise sem criar uma conta.",
                    "Use os controlos da conta para iniciar sessão, verificar o e-mail ou recuperar a palavra-passe.",
                    "Abra Definições para alterar idioma, aparência, treinador e preferências disponíveis."
                ],
                href: "/settings",
                action: "Abrir Definições"
            }
        ],
        troubleshootingEyebrow: "Resolução de problemas",
        troubleshootingTitle: "Resolver os problemas mais comuns",
        troubleshootingSubtitle: "Faça estas verificações antes de contactar o suporte. Não eliminam a conta nem os dados na nuvem.",
        issues: [
            {
                id: "import",
                title: "A partida não pode ser importada",
                answer: "Confirme que o PGN ou FEN está completo e sem texto extra acrescentado ao copiar. Para um utilizador público, reveja a escrita e teste outra partida recente."
            },
            {
                id: "analysis",
                title: "A análise não termina",
                answer: "Mantenha o separador aberto, confirme que a ligação está estável e tente novamente uma vez. Se repetir, anote o navegador, a origem da partida e o ponto onde para."
            },
            {
                id: "archive",
                title: "Falta uma análise local",
                answer: "As análises locais pertencem ao perfil do navegador onde foram criadas. Confirme dispositivo, perfil, janela não privada e se os dados do site não foram apagados."
            },
            {
                id: "account",
                title: "O início de sessão ou a verificação falha",
                answer: "Verifique o e-mail, a pasta de spam e se a ligação de verificação ainda é válida. Tente numa janela normal; se continuar, contacte o suporte sem enviar palavras-passe ou códigos secretos."
            }
        ],
        supportTitle: "Enviar um pedido de suporte útil",
        supportSubtitle: "Estes dados costumam permitir reproduzir o problema muito mais depressa:",
        supportChecklist: [
            "Navegador e dispositivo utilizados.",
            "Passos exatos antes do problema.",
            "Captura ou mensagem de erro visível, ocultando dados pessoais.",
            "Se acontece uma vez ou sempre."
        ],
        supportAction: "Contactar o suporte"
    },
    ru: {
        libraryEyebrow: "Практические руководства",
        libraryTitle: "Уверенно используйте все возможности NexoChess",
        librarySubtitle: "Короткие и понятные инструкции для основных действий без лишней технической документации.",
        guides: [
            {
                id: "analysis",
                title: "Анализ и разбор партии",
                summary: "От источника партии до сводки и пошагового разбора ходов.",
                steps: [
                    "Откройте раздел анализа и выберите PGN, FEN или поддерживаемый публичный источник партии.",
                    "Добавьте партию, проверьте игроков и цвета, затем запустите анализ.",
                    "Сначала изучите сводку, а затем каждый ход с доской, оценкой и объяснением тренера."
                ],
                href: "/analysis",
                action: "Открыть анализ"
            },
            {
                id: "archive",
                title: "Поиск и хранение анализов",
                summary: "Разберитесь, чем локальный Архив отличается от необязательной синхронизации аккаунта.",
                steps: [
                    "Гостевые анализы сохраняются в текущем профиле браузера.",
                    "Используйте тот же браузер и профиль, чтобы снова найти локальные партии в Архиве.",
                    "Входите в аккаунт только для совместимых функций аккаунта и синхронизации между устройствами."
                ],
                href: "/archive",
                action: "Открыть Архив"
            },
            {
                id: "puzzles",
                title: "Тренировка с задачами",
                summary: "Выберите обучение на разобранных партиях или свободную тренировку с фильтрами.",
                steps: [
                    "Выберите режим тренировки под свою цель.",
                    "В свободной тренировке задайте тему и сложность.",
                    "При необходимости используйте подсказку или решение и переходите дальше вручную либо автоматически."
                ],
                href: "/puzzles",
                action: "Открыть задачи"
            },
            {
                id: "account",
                title: "Аккаунт, язык и оформление",
                summary: "Управляйте необязательным входом, языком, темой и персональными настройками.",
                steps: [
                    "Базовый анализ доступен без создания аккаунта.",
                    "Используйте элементы аккаунта для входа, подтверждения почты и восстановления пароля.",
                    "Откройте Настройки, чтобы изменить язык, оформление, тренера и доступные параметры."
                ],
                href: "/settings",
                action: "Открыть Настройки"
            }
        ],
        troubleshootingEyebrow: "Устранение неполадок",
        troubleshootingTitle: "Решение частых проблем",
        troubleshootingSubtitle: "Проверьте эти пункты до обращения в поддержку. Они не удаляют аккаунт или облачные данные.",
        issues: [
            {
                id: "import",
                title: "Партия не импортируется",
                answer: "Убедитесь, что PGN или FEN полный и при копировании не добавился лишний текст. Для публичного имени проверьте написание и попробуйте другую недавнюю партию."
            },
            {
                id: "analysis",
                title: "Анализ не завершается",
                answer: "Не закрывайте вкладку, проверьте стабильность соединения и один раз повторите анализ той же партии. При повторении запишите браузер, источник и этап остановки."
            },
            {
                id: "archive",
                title: "Пропал локальный анализ",
                answer: "Локальные анализы привязаны к профилю браузера, где были созданы. Проверьте устройство, профиль, обычное окно и не удалялись ли данные сайта."
            },
            {
                id: "account",
                title: "Не работает вход или подтверждение",
                answer: "Проверьте адрес, папку спама и срок действия ссылки. Повторите попытку в обычном окне; в поддержку нельзя отправлять пароли или секретные коды."
            }
        ],
        supportTitle: "Полезное обращение в поддержку",
        supportSubtitle: "Эти сведения обычно помогают намного быстрее воспроизвести проблему:",
        supportChecklist: [
            "Браузер и устройство.",
            "Точные действия перед ошибкой.",
            "Снимок экрана или текст ошибки без личных данных.",
            "Возникает ли проблема один раз или постоянно."
        ],
        supportAction: "Связаться с поддержкой"
    },
    zh: {
        libraryEyebrow: "实用指南",
        libraryTitle: "放心使用 NexoChess 的各项功能",
        librarySubtitle: "针对主要流程提供简短直接的说明，无需阅读复杂的技术文档。",
        guides: [
            {
                id: "analysis",
                title: "分析并复盘棋局",
                summary: "从导入棋局到查看总结，再逐步复盘每一步。",
                steps: [
                    "打开分析页面，选择 PGN、FEN 或受支持的公开棋局来源。",
                    "添加棋局，确认棋手与执棋颜色，然后开始分析。",
                    "先查看总结，再结合棋盘、评估和教练说明逐步复盘。"
                ],
                href: "/analysis",
                action: "打开分析"
            },
            {
                id: "archive",
                title: "查找并保存分析",
                summary: "了解本地档案与可选账户同步之间的区别。",
                steps: [
                    "访客分析会保存在当前浏览器配置中。",
                    "请使用同一浏览器和配置，在档案中重新找到本地棋局。",
                    "只有需要跨设备的兼容账户与同步功能时才需要登录。"
                ],
                href: "/archive",
                action: "打开档案"
            },
            {
                id: "puzzles",
                title: "使用战术题训练",
                summary: "可从已分析棋局中学习，也可按条件自由训练。",
                steps: [
                    "根据目标选择合适的训练模式。",
                    "自由训练时可按主题和难度筛选。",
                    "需要时使用提示或答案，然后手动或自动进入下一题。"
                ],
                href: "/puzzles",
                action: "打开战术题"
            },
            {
                id: "account",
                title: "账户、语言和外观",
                summary: "管理可选登录、语言、主题和个人偏好。",
                steps: [
                    "无需创建账户也能使用基本分析流程。",
                    "账户控件可用于登录、验证邮箱和找回密码。",
                    "在设置中更改语言、外观、教练及其他可用选项。"
                ],
                href: "/settings",
                action: "打开设置"
            }
        ],
        troubleshootingEyebrow: "故障排查",
        troubleshootingTitle: "解决常见问题",
        troubleshootingSubtitle: "联系支持前请先检查这些项目。它们不会删除账户或云端数据。",
        issues: [
            {
                id: "import",
                title: "无法导入棋局",
                answer: "请确认 PGN 或 FEN 完整，复制时没有混入额外文字。使用公开用户名时，请检查拼写并尝试另一盘近期棋局。"
            },
            {
                id: "analysis",
                title: "分析无法完成",
                answer: "保持分析标签页开启，确认网络稳定，并对同一棋局重试一次。若反复发生，请记录浏览器、棋局来源和停止位置。"
            },
            {
                id: "archive",
                title: "本地分析不见了",
                answer: "本地分析属于创建它的浏览器配置。请确认设备、浏览器配置和非隐私窗口相同，并检查是否清除了网站数据。"
            },
            {
                id: "account",
                title: "登录或验证失败",
                answer: "检查邮箱地址、垃圾邮件和验证链接是否仍有效。请在普通窗口重试；联系支持时不要发送密码或秘密代码。"
            }
        ],
        supportTitle: "提交有效的支持请求",
        supportSubtitle: "以下信息通常能帮助我们更快复现问题：",
        supportChecklist: [
            "所用浏览器和设备。",
            "问题出现前的准确步骤。",
            "隐藏个人信息后的截图或错误消息。",
            "问题只出现一次还是每次都会出现。"
        ],
        supportAction: "联系支持"
    },
    vi: {
        libraryEyebrow: "Hướng dẫn thực tế",
        libraryTitle: "Tự tin sử dụng mọi phần của NexoChess",
        librarySubtitle: "Hướng dẫn ngắn gọn cho các quy trình chính, không cần đọc tài liệu kỹ thuật phức tạp.",
        guides: [
            {
                id: "analysis",
                title: "Phân tích và xem lại ván đấu",
                summary: "Từ nguồn ván đấu đến phần tổng kết và xem lại từng nước.",
                steps: [
                    "Mở Phân tích và chọn PGN, FEN hoặc nguồn ván đấu công khai được hỗ trợ.",
                    "Thêm ván đấu, kiểm tra người chơi và màu quân rồi bắt đầu phân tích.",
                    "Xem phần tổng kết trước, sau đó xem từng nước với bàn cờ, đánh giá và giải thích của huấn luyện viên."
                ],
                href: "/analysis",
                action: "Mở Phân tích"
            },
            {
                id: "archive",
                title: "Tìm và lưu các bản phân tích",
                summary: "Hiểu sự khác nhau giữa Kho lưu trữ cục bộ và đồng bộ tài khoản tùy chọn.",
                steps: [
                    "Phân tích khi dùng với tư cách khách được lưu trong hồ sơ trình duyệt hiện tại.",
                    "Dùng cùng trình duyệt và hồ sơ để tìm lại ván cục bộ trong Kho lưu trữ.",
                    "Chỉ đăng nhập khi cần các tính năng tài khoản và đồng bộ tương thích giữa thiết bị."
                ],
                href: "/archive",
                action: "Mở Kho lưu trữ"
            },
            {
                id: "puzzles",
                title: "Luyện tập với bài thế",
                summary: "Chọn học từ các ván đã phân tích hoặc luyện tự do có bộ lọc.",
                steps: [
                    "Chọn chế độ luyện tập phù hợp với mục tiêu.",
                    "Lọc theo chủ đề và độ khó khi luyện tự do.",
                    "Dùng gợi ý hoặc lời giải khi cần, rồi chuyển tiếp thủ công hoặc tự động."
                ],
                href: "/puzzles",
                action: "Mở Bài thế"
            },
            {
                id: "account",
                title: "Tài khoản, ngôn ngữ và giao diện",
                summary: "Quản lý đăng nhập tùy chọn, ngôn ngữ, chủ đề và tùy chọn cá nhân.",
                steps: [
                    "Bạn có thể dùng quy trình phân tích cơ bản mà không cần tạo tài khoản.",
                    "Dùng điều khiển tài khoản để đăng nhập, xác minh email hoặc khôi phục mật khẩu.",
                    "Mở Cài đặt để đổi ngôn ngữ, giao diện, huấn luyện viên và các tùy chọn có sẵn."
                ],
                href: "/settings",
                action: "Mở Cài đặt"
            }
        ],
        troubleshootingEyebrow: "Khắc phục sự cố",
        troubleshootingTitle: "Giải quyết các vấn đề thường gặp",
        troubleshootingSubtitle: "Hãy thử các bước này trước khi liên hệ hỗ trợ. Chúng không xóa tài khoản hoặc dữ liệu đám mây.",
        issues: [
            {
                id: "import",
                title: "Không thể nhập ván đấu",
                answer: "Kiểm tra PGN hoặc FEN đã đầy đủ và không có văn bản thừa khi sao chép. Với tên người dùng công khai, kiểm tra chính tả và thử một ván gần đây khác."
            },
            {
                id: "analysis",
                title: "Phân tích không hoàn tất",
                answer: "Giữ tab phân tích mở, kiểm tra kết nối ổn định và thử lại cùng ván một lần. Nếu lặp lại, ghi lại trình duyệt, nguồn ván và vị trí bị dừng."
            },
            {
                id: "archive",
                title: "Thiếu một phân tích cục bộ",
                answer: "Phân tích cục bộ thuộc hồ sơ trình duyệt nơi nó được tạo. Kiểm tra đúng thiết bị, hồ sơ, cửa sổ không riêng tư và dữ liệu trang chưa bị xóa."
            },
            {
                id: "account",
                title: "Đăng nhập hoặc xác minh thất bại",
                answer: "Kiểm tra địa chỉ email, thư rác và hiệu lực của liên kết xác minh. Thử lại trong cửa sổ thường; không gửi mật khẩu hoặc mã bí mật cho hỗ trợ."
            }
        ],
        supportTitle: "Gửi yêu cầu hỗ trợ hữu ích",
        supportSubtitle: "Những thông tin này thường giúp chúng tôi tái hiện vấn đề nhanh hơn:",
        supportChecklist: [
            "Trình duyệt và thiết bị đã dùng.",
            "Các bước chính xác trước khi lỗi xuất hiện.",
            "Ảnh chụp hoặc thông báo lỗi, đã che dữ liệu cá nhân.",
            "Lỗi xảy ra một lần hay mọi lần."
        ],
        supportAction: "Liên hệ hỗ trợ"
    },
    hi: {
        libraryEyebrow: "व्यावहारिक मार्गदर्शिकाएँ",
        libraryTitle: "NexoChess के हर भाग का भरोसे से उपयोग करें",
        librarySubtitle: "मुख्य प्रक्रियाओं के लिए छोटी और सीधी जानकारी, बिना कठिन तकनीकी दस्तावेज़ पढ़े।",
        guides: [
            {
                id: "analysis",
                title: "गेम का विश्लेषण और समीक्षा",
                summary: "गेम के स्रोत से सारांश और हर चाल की समीक्षा तक जाएँ।",
                steps: [
                    "विश्लेषण खोलें और PGN, FEN या समर्थित सार्वजनिक गेम स्रोत चुनें।",
                    "गेम जोड़ें, खिलाड़ियों और रंगों की जाँच करें, फिर विश्लेषण शुरू करें।",
                    "पहले सारांश देखें, फिर बोर्ड, मूल्यांकन और कोच की व्याख्या के साथ हर चाल की समीक्षा करें।"
                ],
                href: "/analysis",
                action: "विश्लेषण खोलें"
            },
            {
                id: "archive",
                title: "विश्लेषण ढूँढें और सुरक्षित रखें",
                summary: "स्थानीय आर्काइव और वैकल्पिक खाता सिंक का अंतर समझें।",
                steps: [
                    "अतिथि विश्लेषण वर्तमान ब्राउज़र प्रोफ़ाइल में सहेजे जाते हैं।",
                    "स्थानीय गेम फिर पाने के लिए वही ब्राउज़र और प्रोफ़ाइल उपयोग करें।",
                    "अलग उपकरणों पर संगत खाता और सिंक सुविधाएँ चाहिए तभी साइन इन करें।"
                ],
                href: "/archive",
                action: "आर्काइव खोलें"
            },
            {
                id: "puzzles",
                title: "पज़ल से अभ्यास",
                summary: "विश्लेषित गेम से सीखें या फ़िल्टर के साथ स्वतंत्र अभ्यास करें।",
                steps: [
                    "अपने लक्ष्य के अनुसार अभ्यास मोड चुनें।",
                    "स्वतंत्र अभ्यास में विषय और कठिनाई से फ़िल्टर करें।",
                    "ज़रूरत पर संकेत या समाधान लें और मैन्युअल या स्वचालित रूप से आगे बढ़ें।"
                ],
                href: "/puzzles",
                action: "पज़ल खोलें"
            },
            {
                id: "account",
                title: "खाता, भाषा और रूप",
                summary: "वैकल्पिक साइन-इन, भाषा, थीम और व्यक्तिगत पसंद प्रबंधित करें।",
                steps: [
                    "मूल विश्लेषण के लिए खाता बनाना आवश्यक नहीं है।",
                    "साइन-इन, ईमेल सत्यापन और पासवर्ड पुनर्प्राप्ति के लिए खाता नियंत्रण उपयोग करें।",
                    "भाषा, रूप, कोच और उपलब्ध पसंद बदलने के लिए सेटिंग्स खोलें।"
                ],
                href: "/settings",
                action: "सेटिंग्स खोलें"
            }
        ],
        troubleshootingEyebrow: "समस्या निवारण",
        troubleshootingTitle: "सामान्य समस्याएँ हल करें",
        troubleshootingSubtitle: "सहायता से संपर्क करने से पहले ये जाँच करें। इससे खाता या क्लाउड डेटा नहीं मिटता।",
        issues: [
            {
                id: "import",
                title: "गेम आयात नहीं हो रहा",
                answer: "जाँचें कि PGN या FEN पूरा है और कॉपी करते समय अतिरिक्त टेक्स्ट नहीं जुड़ा। सार्वजनिक उपयोगकर्ता नाम की वर्तनी जाँचें और कोई दूसरा हाल का गेम आज़माएँ।"
            },
            {
                id: "analysis",
                title: "विश्लेषण पूरा नहीं होता",
                answer: "विश्लेषण टैब खुला रखें, कनेक्शन स्थिर होने की पुष्टि करें और उसी गेम को एक बार फिर चलाएँ। दोहराने पर ब्राउज़र, स्रोत और रुकने का स्थान लिखें।"
            },
            {
                id: "archive",
                title: "स्थानीय विश्लेषण नहीं मिल रहा",
                answer: "स्थानीय विश्लेषण उसी ब्राउज़र प्रोफ़ाइल से जुड़े हैं जहाँ वे बने थे। वही उपकरण, प्रोफ़ाइल और सामान्य विंडो उपयोग करें तथा साइट डेटा मिटा तो नहीं है, जाँचें।"
            },
            {
                id: "account",
                title: "साइन-इन या सत्यापन विफल",
                answer: "ईमेल पता, स्पैम फ़ोल्डर और सत्यापन लिंक की वैधता जाँचें। सामान्य विंडो में दोबारा प्रयास करें; सहायता को पासवर्ड या गुप्त कोड न भेजें।"
            }
        ],
        supportTitle: "उपयोगी सहायता अनुरोध भेजें",
        supportSubtitle: "इन जानकारियों से समस्या को जल्दी दोहराने में मदद मिलती है:",
        supportChecklist: [
            "उपयोग किया गया ब्राउज़र और उपकरण।",
            "समस्या से पहले के सटीक चरण।",
            "व्यक्तिगत जानकारी छिपाकर स्क्रीनशॉट या त्रुटि संदेश।",
            "समस्या एक बार होती है या हर बार।"
        ],
        supportAction: "सहायता से संपर्क करें"
    },
    mr: {
        libraryEyebrow: "व्यावहारिक मार्गदर्शिका",
        libraryTitle: "NexoChess चा प्रत्येक भाग आत्मविश्वासाने वापरा",
        librarySubtitle: "तांत्रिक कागदपत्रे शोधण्याची गरज न पडता मुख्य प्रक्रियांसाठी थोडक्यात आणि स्पष्ट सूचना.",
        guides: [
            {
                id: "analysis",
                title: "डावाचे विश्लेषण आणि पुनरावलोकन",
                summary: "डावाच्या स्रोतापासून सारांश आणि प्रत्येक चालीच्या पुनरावलोकनापर्यंत जा.",
                steps: [
                    "विश्लेषण उघडा आणि PGN, FEN किंवा समर्थित सार्वजनिक डावाचा स्रोत निवडा.",
                    "डाव जोडा, खेळाडू व रंग तपासा आणि विश्लेषण सुरू करा.",
                    "प्रथम सारांश पाहा, नंतर पट, मूल्यमापन आणि प्रशिक्षकाच्या स्पष्टीकरणासह प्रत्येक चाल तपासा."
                ],
                href: "/analysis",
                action: "विश्लेषण उघडा"
            },
            {
                id: "archive",
                title: "विश्लेषणे शोधा आणि जतन करा",
                summary: "स्थानिक संग्रह आणि ऐच्छिक खाते समक्रमण यातील फरक समजा.",
                steps: [
                    "पाहुणे म्हणून केलेली विश्लेषणे सध्याच्या ब्राउझर प्रोफाइलमध्ये साठवली जातात.",
                    "स्थानिक डाव पुन्हा शोधण्यासाठी तोच ब्राउझर आणि प्रोफाइल वापरा.",
                    "उपकरणांदरम्यान सुसंगत खाते व समक्रमण सुविधा हव्या असतील तेव्हाच साइन इन करा."
                ],
                href: "/archive",
                action: "संग्रह उघडा"
            },
            {
                id: "puzzles",
                title: "कोड्यांद्वारे सराव",
                summary: "विश्लेषित डावांमधून शिका किंवा फिल्टरसह मुक्त सराव करा.",
                steps: [
                    "तुमच्या उद्दिष्टानुसार सराव मोड निवडा.",
                    "मुक्त सरावात विषय आणि अवघडपणानुसार फिल्टर करा.",
                    "गरज पडल्यास सूचना किंवा उत्तर वापरा आणि हाताने किंवा स्वयंचलितपणे पुढे जा."
                ],
                href: "/puzzles",
                action: "कोडी उघडा"
            },
            {
                id: "account",
                title: "खाते, भाषा आणि रूप",
                summary: "ऐच्छिक साइन-इन, भाषा, थीम आणि वैयक्तिक पसंती व्यवस्थापित करा.",
                steps: [
                    "मूलभूत विश्लेषणासाठी खाते तयार करणे आवश्यक नाही.",
                    "साइन-इन, ईमेल पडताळणी आणि पासवर्ड पुनर्प्राप्तीसाठी खाते नियंत्रणे वापरा.",
                    "भाषा, रूप, प्रशिक्षक आणि उपलब्ध पसंती बदलण्यासाठी सेटिंग्ज उघडा."
                ],
                href: "/settings",
                action: "सेटिंग्ज उघडा"
            }
        ],
        troubleshootingEyebrow: "समस्या निवारण",
        troubleshootingTitle: "सामान्य समस्या सोडवा",
        troubleshootingSubtitle: "सहाय्याशी संपर्क करण्यापूर्वी या तपासण्या करा. यामुळे खाते किंवा क्लाउड डेटा हटत नाही.",
        issues: [
            {
                id: "import",
                title: "डाव आयात होत नाही",
                answer: "PGN किंवा FEN पूर्ण आहे आणि कॉपी करताना अतिरिक्त मजकूर जोडला नाही याची खात्री करा. सार्वजनिक वापरकर्तानावाची स्पेलिंग तपासा आणि दुसरा अलीकडचा डाव वापरून पाहा."
            },
            {
                id: "analysis",
                title: "विश्लेषण पूर्ण होत नाही",
                answer: "विश्लेषणाचा टॅब उघडा ठेवा, जोडणी स्थिर आहे याची खात्री करा आणि तोच डाव एकदा पुन्हा वापरा. वारंवार झाल्यास ब्राउझर, स्रोत आणि थांबलेली जागा नोंदवा."
            },
            {
                id: "archive",
                title: "स्थानिक विश्लेषण दिसत नाही",
                answer: "स्थानिक विश्लेषण ते तयार केलेल्या ब्राउझर प्रोफाइलशी जोडलेले असते. तेच उपकरण, प्रोफाइल आणि सामान्य विंडो वापरा व साइट डेटा हटवला गेला नाही याची खात्री करा."
            },
            {
                id: "account",
                title: "साइन-इन किंवा पडताळणी अयशस्वी",
                answer: "ईमेल पत्ता, स्पॅम फोल्डर आणि पडताळणी दुवा वैध आहे का तपासा. सामान्य विंडोमध्ये पुन्हा प्रयत्न करा; सहाय्याला पासवर्ड किंवा गुप्त कोड पाठवू नका."
            }
        ],
        supportTitle: "उपयुक्त सहाय्य विनंती पाठवा",
        supportSubtitle: "ही माहिती समस्या अधिक लवकर पुन्हा निर्माण करण्यात मदत करते:",
        supportChecklist: [
            "वापरलेला ब्राउझर आणि उपकरण.",
            "समस्या येण्यापूर्वीची अचूक पावले.",
            "वैयक्तिक माहिती लपवून स्क्रीनशॉट किंवा त्रुटी संदेश.",
            "समस्या एकदाच येते की प्रत्येक वेळी."
        ],
        supportAction: "सहाय्याशी संपर्क करा"
    },
    pl: {
        libraryEyebrow: "Praktyczne poradniki",
        libraryTitle: "Korzystaj pewnie z każdej części NexoChess",
        librarySubtitle: "Krótkie i konkretne instrukcje najważniejszych działań, bez przeglądania dokumentacji technicznej.",
        guides: [
            {
                id: "analysis",
                title: "Analiza i przegląd partii",
                summary: "Od źródła partii do podsumowania i przeglądu ruch po ruchu.",
                steps: [
                    "Otwórz Analizę i wybierz PGN, FEN albo obsługiwane publiczne źródło partii.",
                    "Dodaj partię, sprawdź zawodników i kolory, a następnie uruchom analizę.",
                    "Najpierw przeczytaj podsumowanie, potem sprawdź każdy ruch z szachownicą, oceną i wyjaśnieniem trenera."
                ],
                href: "/analysis",
                action: "Otwórz Analizę"
            },
            {
                id: "archive",
                title: "Znajdowanie i przechowywanie analiz",
                summary: "Poznaj różnicę między lokalnym Archiwum a opcjonalną synchronizacją konta.",
                steps: [
                    "Analizy gościa są zapisywane w bieżącym profilu przeglądarki.",
                    "Użyj tej samej przeglądarki i profilu, aby ponownie znaleźć lokalne partie w Archiwum.",
                    "Zaloguj się tylko wtedy, gdy potrzebujesz zgodnych funkcji konta i synchronizacji między urządzeniami."
                ],
                href: "/archive",
                action: "Otwórz Archiwum"
            },
            {
                id: "puzzles",
                title: "Trening z zadaniami",
                summary: "Ucz się z przeanalizowanych partii albo trenuj swobodnie z filtrami.",
                steps: [
                    "Wybierz tryb treningu zgodny z celem.",
                    "W treningu swobodnym filtruj według motywu i trudności.",
                    "W razie potrzeby użyj podpowiedzi lub rozwiązania, a potem przejdź dalej ręcznie albo automatycznie."
                ],
                href: "/puzzles",
                action: "Otwórz Zadania"
            },
            {
                id: "account",
                title: "Konto, język i wygląd",
                summary: "Zarządzaj opcjonalnym logowaniem, językiem, motywem i preferencjami.",
                steps: [
                    "Podstawowy przepływ analizy działa bez tworzenia konta.",
                    "Użyj opcji konta do logowania, potwierdzania e-maila i odzyskiwania hasła.",
                    "Otwórz Ustawienia, aby zmienić język, wygląd, trenera i dostępne preferencje."
                ],
                href: "/settings",
                action: "Otwórz Ustawienia"
            }
        ],
        troubleshootingEyebrow: "Rozwiązywanie problemów",
        troubleshootingTitle: "Rozwiąż najczęstsze problemy",
        troubleshootingSubtitle: "Wypróbuj te kroki przed kontaktem ze wsparciem. Nie usuwają konta ani danych w chmurze.",
        issues: [
            {
                id: "import",
                title: "Nie można zaimportować partii",
                answer: "Sprawdź, czy PGN lub FEN jest kompletny i czy podczas kopiowania nie dodano dodatkowego tekstu. Przy publicznej nazwie użytkownika sprawdź pisownię i spróbuj innej niedawnej partii."
            },
            {
                id: "analysis",
                title: "Analiza się nie kończy",
                answer: "Pozostaw kartę otwartą, sprawdź stabilność połączenia i raz ponów tę samą partię. Jeśli problem wraca, zapisz przeglądarkę, źródło partii i miejsce zatrzymania."
            },
            {
                id: "archive",
                title: "Brakuje lokalnej analizy",
                answer: "Lokalne analizy należą do profilu przeglądarki, w którym powstały. Sprawdź urządzenie, profil, zwykłe okno i czy dane witryny nie zostały usunięte."
            },
            {
                id: "account",
                title: "Logowanie lub weryfikacja nie działa",
                answer: "Sprawdź adres e-mail, spam i ważność linku. Spróbuj ponownie w zwykłym oknie; nie wysyłaj wsparciu haseł ani tajnych kodów."
            }
        ],
        supportTitle: "Wyślij przydatne zgłoszenie",
        supportSubtitle: "Te informacje zwykle pozwalają znacznie szybciej odtworzyć problem:",
        supportChecklist: [
            "Używana przeglądarka i urządzenie.",
            "Dokładne kroki przed problemem.",
            "Zrzut ekranu lub komunikat błędu z ukrytymi danymi osobowymi.",
            "Czy problem wystąpił raz, czy występuje zawsze."
        ],
        supportAction: "Skontaktuj się ze wsparciem"
    }
};

function getHelpCompletionCopy(language?: string | null): HelpCompletionCopy {
    const normalised = String(language || "en")
        .trim()
        .toLowerCase()
        .replace("_", "-")
        .split("-")[0];

    return copies[normalised] || copies.en;
}

const HELP_COMPLETION_LANGUAGES = Object.freeze(Object.keys(copies));

export {
    HELP_COMPLETION_LANGUAGES,
    getHelpCompletionCopy
};

export type {
    HelpCompletionCopy,
    HelpGuide,
    HelpIssue
};
