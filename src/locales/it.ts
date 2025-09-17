export default {
  // Top-level keys
  Execute: 'Giustizia',
  Resurrect: 'Resuscita',
  'Confirm selection': 'Conferma selezione',
  
  // Navigation
  nav: {
    home: 'Home',
    roles: 'Ruoli',
    players: 'Giocatori',
    settings: 'Impostazioni'
  },

  // Common UI
  common: {
    confirm: 'Conferma',
    cancel: 'Annulla',
    yes: 'Sì',
    no: 'No',
    save: 'Salva',
    delete: 'Elimina',
    edit: 'Modifica',
    close: 'Chiudi',
    back: 'Indietro',
    next: 'Avanti',
    previous: 'Precedente',
    start: 'Avvia',
    configure: 'Configura',
    resume: 'Riprendi',
    ignore: 'Ignora',
    skip: 'Salta',
    continue: 'Continua',
    reset: 'Ripristina',
    quit: 'Esci',
    refresh: 'Aggiorna',
    loading: 'Caricamento...',
    error: 'Errore',
    success: 'Successo',
    warning: 'Avviso',
    info: 'Informazione',
    execute: 'Giustizia',
    none: 'Nessuno',
    unknown: 'Sconosciuto'
  },

  // Game phases
  phases: {
    setup: 'Configurazione',
    reveal: 'Rivelazione',
    preNight: 'Pre-Notte',
    night: 'Notte',
    day: 'Giorno',
    end: 'Fine'
  },

  // Setup page
  setup: {
    title: 'Configurazione',
    balance: 'Bilanciamento',
    weakestFaction: 'Fazione più debole',
    startGame: 'Avvia',
    configureGame: 'Configura',
    duplicateNames: 'Risolvi i nomi duplicati per avviare il gioco',
    roles: 'Ruoli',
    players: 'Giocatori',
    settings: 'Impostazioni',
    enabled: 'Abilitati',
    disabled: 'Disabilitati'
  },

  // Players management
  players: {
    title: 'Gestione Giocatori',
    subtitle: 'Inserisci i nomi nello stesso ordine in cui siete posizionati',
    players: 'Giocatori',
    player: 'Giocatore',
    addPlayer: 'Aggiungi',
    reset: 'Reset',
    removePlayer: 'Rimuovi giocatore',
    moveUp: 'Sposta giocatore in alto',
    moveDown: 'Sposta giocatore in basso',
    nameErrors: 'Risolvi gli errori nei nomi per continuare',
    duplicateName: 'Nome duplicato',
    nameTooLong: 'Nome troppo lungo (max 15 caratteri)',
    placeholder: 'Giocatore {number}'
  },

  // Roles management
  roles: {
    title: 'Seleziona i Ruoli',
    subtitle: 'Scegli quali ruoli sono disponibili in questa partita. Contadini e Lupi sono sempre abilitati.',
    details: 'Dettagli',
    always: 'Sempre',
    roles: 'ruoli',
    role: 'ruolo'
  },

  // Settings page
  settings: {
    title: 'Impostazioni',
    language: 'Lingua',
    selectLanguage: 'Seleziona lingua',
    languageDescription: 'Scegli la lingua dell\'interfaccia utente',
    gameOptions: 'Opzioni di Gioco',
    supportProject: 'Supporta il Progetto',
    buyCoffee: 'Offrimi un caffè',
    buyCoffeeDescription: 'Se ti piace il progetto, considera di supportarlo con una donazione per mantenere il progetto attivo.',
    offerCoffee: 'Offri un caffè',
    contributeGitHub: 'Contribuisci su GitHub',
    contributeGitHubDescription: 'Lascia una stella al progetto e segnala eventuali problemi o suggerimenti per miglioramenti.',
    starProject: 'Lascia una stella',
    reportIssue: 'Segnala un problema',
    version: 'Versione',
    skipFirstNight: 'Salta le azioni della prima notte',
    skipFirstNightDescription: 'Tutti i ruoli vengono chiamati nella Notte 1, ma i loro effetti sono ignorati.',
    enableMayor: 'Abilita Sindaco',
    enableMayorDescription: 'Il voto del sindaco vale doppio durante la votazione quando è in vita.',
    discussionTimer: 'Timer discussione',
    discussionTimerDescription: 'Mostra un timer compatto nella fase di linciaggio per la discussione (max 60 minuti).',
    maxDifficulty: 'Difficoltà Massima',
    maxDifficultyDescription: 'Richiede dichiarazioni di ruoli più specifiche. Es: Il Boia deve dichiarare "Lupo Ciccione" invece di "Lupo" per uccidere un Lupo Ciccione.'
  },

  // Game state
  game: {
    gameInProgress: 'Partita in corso',
    savedGame: 'Hai una partita salvata che puoi riprendere',
    noResult: 'Nessun risultato',
    noDetailsAvailable: 'Nessun dettaglio disponibile',
    canOpenEyes: 'Possono aprire gli occhi:',
    chooseVictim: 'Scegliete una vittima da sbranare questa notte',
    whoToEliminate: 'Chi vuoi eliminare?',
    confirmSelection: 'Conferma selezione'
  },

  // Role blocking reasons
  blocking: {
    blocked: 'Qualcuno ha bloccato il suo ruolo',
    dead: 'Non può usare il ruolo',
    alive: 'Deve essere morto per agire',
    startNight: 'Puoi usare il tuo ruolo a partire dalla notte {night}',
    usageLimit: 'Hai già usato questo ruolo il massimo numero di volte',
    default: 'Non può usare il ruolo questa notte'
  },

  // Teams
  teams: {
    village: 'Villaggio',
    wolves: 'Lupi',
    werewolves: 'Mannari',
    mad: 'Matti',
    parasite: 'Parassita',
    aliens: 'Alieni'
  },

  // App updates
  updates: {
    available: 'App Update Available',
    description: 'A new version of the app is ready. Refresh to get the latest features.',
    refreshNow: 'Refresh Now'
  },

  // Prompts
  prompts: {
    dead: {
      title: 'Sei morto',
      subtitle: 'Non puoi più partecipare al gioco',
      buttonText: 'Continua'
    },
    blocked: {
      title: 'Ruolo bloccato',
      subtitle: 'Qualcuno ha impedito la tua azione',
      buttonText: 'Continua'
    },
    alive: {
      title: 'Sei vivo',
      subtitle: 'Puoi partecipare al gioco',
      buttonText: 'Continua'
    },
    startNight: {
      title: 'Inizia la notte',
      subtitle: 'Tutti i ruoli possono agire',
      buttonText: 'Inizia'
    },
    usageLimit: {
      title: 'Limite raggiunto',
      subtitle: 'Hai già usato questo ruolo il massimo numero di volte',
      buttonText: 'Continua'
    },
    yesNo: {
      yes: 'Sì',
      no: 'No'
    }
  },

  // Role states
  roleStates: {
    alive: 'vivo',
    dead: 'morto',
    blocked: 'bloccato',
    player: 'Giocatore'
  },

  // Game constants
  gameConstants: {
    canOpenEyes: 'Possono aprire gli occhi:',
    chooseVictim: 'Scegliete una vittima da sbranare questa notte',
    whoToEliminate: 'Chi vuoi eliminare?',
    confirmSelection: 'Conferma selezione',
    noResult: 'Nessun risultato',
    noDetailsAvailable: 'Nessun dettaglio disponibile'
  },

  // Role names and descriptions
  roleNames: {
    lupo: 'Lupo',
    veggente: 'Veggente',
    guardia: 'Guardia',
    boia: 'Boia',
    giustiziere: 'Giustiziere',
    angelo: 'Angelo',
    barabba: 'Barabba',
    bugiardo: 'Bugiardo',
    genio: 'Genio',
    illusionista: 'Illusionista',
    indemoniato: 'Indemoniato',
    insinuo: 'Insinuo',
    lupomannaro: 'Lupo Mannaro',
    massone: 'Massone',
    matto: 'Matto',
    medium: 'Medium',
    misspurple: 'Miss Purple',
    muccamannara: 'Mucca Mannara',
    mutaforma: 'Mutaforma',
    parassita: 'Parassita',
    simbionte: 'Simbionte',
    villico: 'Villico',
    lupoCieco: 'Lupo Cieco',
    lupoCiccione: 'Lupo Ciccione',
    ammaestratore: 'Ammaestratore'
  },

  // Role descriptions
  roleDescriptions: {
    lupo: 'Il lupo sbrana un giocatore ogni notte.',
    veggente: 'Ogni notte può controllare la fazione di un giocatore.',
    guardia: 'Ogni notte può proteggere un giocatore dai lupi.',
    boia: 'Può uccidere un giocatore dichiarando correttamente il suo ruolo.',
    giustiziere: 'Può uccidere un giocatore durante la notte una volta per partita.',
    angelo: 'Una volta per partita può resuscitare un giocatore morto.',
    barabba: 'Quando muore, può portare con se un giocatore nell\'aldilà.',
    bugiardo: 'Può investigare i giocatori morti per scoprire i loro ruoli.',
    genio: 'Può trasformarsi nel ruolo di un altro giocatore una volta per partita.',
    illusionista: 'Può bloccare l\'abilità di un giocatore durante la notte.',
    indemoniato: 'Un contadino che gioca per i lupi.',
    insinuo: 'Durate la notte, può cambiare la fazione di un giocatore agli occhi di chi lo controlla.',
    lupomannaro: 'Gioca da solo. Ogni notte può uccidere un giocatore dichiarando correttamente il suo ruolo.'+
    ' Non può essere ucciso dai lupi.',
    massone: 'Conosce l\'identità degli altri massoni.',
    matto: 'Vince se viene linciato.',
    medium: 'Può investigare un giocatore morto per scoprire la sua fazione.',
    misspurple: 'Ogni notte scopre quanti giocatori che appaiono come lupi sono vivi.',
    muccamannara: 'Gioca da sola. Conosce i lupi e appare come lupo. Non può essere uccisa dai lupi.',
    mutaforma: 'Ogni notte può copiare il ruolo di un altro giocatore.',
    parassita: 'Infetta altri giocatori e vince quando tutti sono infetti.',
    simbionte: 'Deve trasformarsi nel ruolo di un altro giocatore a inizio partita.',
    villico: 'Un abitante del villaggio senza poteri speciali.',
    lupoCieco: 'Un lupo che investiga tre giocatori adiacenti ogni notte. Non conosce gli altri lupi.',
    lupoCiccione: 'Un lupo che fa apparire i giocatori a lui adiacenti come lupi.',
    ammaestratore: 'Può reindirizzare il bersaglio dei lupi dalla 2ª notte, una volta per partita.',
    lupoLong: `Il Lupo è il ruolo più temuto del gioco, ogni notte deve scegliere una vittima da sbranare.

COME FUNZIONA:
• Ogni notte deve scegliere una vittima da uccidere
• Può uccidere qualsiasi giocatore vivo
• La vittima muore all'alba`,
    veggenteLong: `Il Veggente è l'investigatore del villaggio, capace di scoprire le fazioni dei giocatori.

COME FUNZIONA:
• Ogni notte può scegliere un giocatore da investigare
• Scopre la fazione di quel giocatore (come appare agli altri)`,
    guardiaLong: `La Guardia è il protettore del villaggio, capace di salvare vite innocenti.

COME FUNZIONA:
• Ogni notte può scegliere un giocatore da proteggere
• Il giocatore protetto non può essere ucciso dai lupi quella notte

PERSONALIZZAZIONE:
Questo è un ruolo generico che può essere adattato a diversi stili di gioco, ad esempio:
• Può proteggere se stesso
• Non può proteggere lo stesso giocatore due volte di seguito`,
    boiaLong: `Il Boia lavora per i lupi. 
    Una volta per partita può uccidere un altro giocatore dichiarando correttamente il suo ruolo.
    Se la dichiarazione è sbagliata, il Boia muore.

COME FUNZIONA:
• Viene visto come lupo
• Durante la notte può dichiarare il ruolo di un giocatore
• Se la dichiarazione è corretta, il giocatore muore
• Se la dichiarazione è sbagliata, il Boia muore
• Può agire solo una volta per partita`,
    giustiziereLong: `Il Giustiziere è il vendicatore del villaggio, capace di giustiziare i colpevoli.

COME FUNZIONA:
• Durante la notte può scegliere un giocatore da giustiziare
• L'azione non può essere fermata
• Può giustiziare solo una volta per partita`,
    massoneLong: `Il Massone è un membro di una società segreta che conosce gli altri membri.

COME FUNZIONA:
• Conosce l'identità degli altri massoni`,
    villicoLong: `Il Contadino è un cittadino comune senza poteri speciali, ma con il diritto di voto.

COME FUNZIONA:
• Non ha poteri speciali`,
    angeloLong: `L'Angelo è un essere divino capace di resuscitare i morti.

COME FUNZIONA:
• Può resuscitare un giocatore morto
• L'azione può essere usata solo una volta per partita
• Il giocatore resuscitato torna in gioco con il suo ruolo originale`,
    barabbaLong: `Quando muore, può portare con se un giocatore nell'aldilà.

COME FUNZIONA:
• Può uccidere un giocatore durante la notte quando è morto
• L'azione può essere usata solo una volta per partita`,
    mattoLong: `Il Matto è un contadino che vince se viene linciato dal villaggio.

COME FUNZIONA:
• Vince immediatamente se viene linciato
• Non ha altri poteri speciali
• Deve convincere il villaggio a linciarlo`,
    lupomannaroLong: `Il Lupo Mannaro è un lupo che può uccidere giocatori dichiarando correttamente il loro ruolo.
    Gioca da solo e non può essere ucciso dai lupi.
    Vince se sopravvive fino alla fine del gioco.

COME FUNZIONA:
• Non può essere ucciso dai lupi
• Può uccidere un giocatore dichiarando il suo ruolo
• Se la dichiarazione è corretta, il giocatore muore
• Se la dichiarazione è sbagliata, nessuno muore`,
    muccamannaraLong: `La Mucca Mannara gioca da sola. Conosce i lupi e appare come lupo.
    Vince se sopravvive fino alla fine del gioco.

COME FUNZIONA:
• Non può essere uccisa dai lupi
• Appare come lupo quando investigata
• Può confondere le investigazioni`,
    indemoniatoLong: `L'Indemoniato è un contadino che gioca per i lupi.

COME FUNZIONA:
• Si comporta come un contadio normale
• Deve aiutare i lupi a vincere anche se non sa chi sono`,
    insinuoLong: `L'Insinuo lavora per i lupi. Può cambiare la fazione di un giocatore agli occhi
    degli altri giocatori che lo controllano.

COME FUNZIONA:
• Ogni notte può scegliere un giocatore da "insinuare"
• Cambia la fazione del giocatore scelto, se era lupo apparirà come villico, se era villico apparirà come lupo
• L'effetto dura per una notte
• Può confondere le investigazioni`,
    illusionistaLong: `L'Illusionista gioca per i lupi. Può bloccare l'abilità di un altro giocatore.

COME FUNZIONA:
• Ogni notte può scegliere un giocatore da bloccare
• Il giocatore bloccato non può usare la sua abilità quella notte
• L'effetto dura per una notte
• Se è presente un altro giocatore vivo con lo stesso ruolo del giocatore bloccato, 
  quei giocatori possono usare lo stesso la loro abilità`,
    genioLong: `Il Genio può trasformarsi in un altro ruolo scelto tra tre a caso.
    Può usare questo potere solo una volta per partita, a partire dalla terza notte.

COME FUNZIONA:
• Può scegliere un ruolo tra tre a caso (scelti dal narratore)
• L'azione può essere usata solo una volta per partita`,
    parassitaLong: `Il Parassita vince se riesce ad infettare tutti i giocatori vivi.

COME FUNZIONA:
• La prima notte può infettare fino a 3 giocatori
• La seconda notte può infettare fino a 2 giocatori
• Dalla terza notte, in poi, può infettare 1 giocatore
• Vince se tutti gli altri giocatori vivi sono infetti`,
    simbionteLong: `Il Simbionte assume il ruolo di un altro giocatore. La prima notte deve 
    scegliere un giocatore e assumerà, immediatamente, il suo ruolo.

COME FUNZIONA:
• Deve scegliere un giocatore e assumere il suo ruolo
• L'azione può essere usata solo una volta per partita`,
    mutaformaLong: `La Mutaforma è un alieno che, ogni notte, può copiare il ruolo di un altro giocatore.

COME FUNZIONA:
• Può scegliere un giocatore e copiare il suo ruolo per quella notte
• Copia tutti i poteri del ruolo scelto`,
    misspurpleLong: `Miss Purple è una contadina che, ogni notte, scopre quanti giocatori che 
    appaiono come lupi sono vivi.

COME FUNZIONA:
• Ogni notte scopre quanti giocatori che appaiono come lupi sono vivi`,
    bugiardoLong: `Il Bugiardo lavora per i lupi. Una volta per partita può scoprire il ruolo di 
    un giocatore morto.

COME FUNZIONA:
• Può investigare i giocatori morti
• Scopre il ruolo di un giocatore morto
• Può aiutare i lupi fingendo di avere il ruolo che ha scoperto`,
    ammaestratoreLong: `L'Ammaestratore può ammaestrare i lupi e costringerli a sbranare una vittima scelta da lui.
    Se l'ammaestratore sceglie un lupo come vittima , nessuno muore. 
    Se sceglie un altro giocatore, muore al posto del bersaglio originale dei lupi.

COME FUNZIONA:
• Può scegliere un bersaglio per gli attacchi dei lupi
• Se sceglie un lupo, nessuno muore
• Se sceglie un altro giocatore, muore al posto del bersaglio originale`,
    lupoCiccioneLong: `Il Lupo Ciccione è un lupo che fa apparire i giocatori adiacenti come lupi.

COME FUNZIONA:
• Si comporta come un lupo normale, quindi apre gli occhi con i lupi
• Fa apparire i primi due giocatori vivi alla sua sinistra e destra come lupi
• Può confondere le investigazioni`,
    lupoCiecoLong: `Il Lupo Cieco è un lupo solitario che non conosce gli altri lupi.
    Gli altri lupi non lo conoscono. Può investigare tre giocatori contigui e scoprire se 
    c'è almeno un lupo tra i tre.

COME FUNZIONA:
• Ogni notte investiga tre giocatori contigui
• Scopre se c'è almeno un lupo tra i tre
• Se tutti i lupi sono morti, può anche uccidere come un lupo normale`,
    mediumLong: `Il Medium può comunicare con i giocatori morti per ottenere informazioni.

COME FUNZIONA:
• Ogni notte può scegliere un giocatore morto con cui comunicare
• Scopre per chi giocava il giocatore morto`
  },

  // Faction names
  factions: {
    village: 'Villaggio',
    wolves: 'Lupi',
    werewolves: 'Mannari',
    mad: 'Matti',
    parasite: 'Parassita',
    aliens: 'Alieni',
    villaggio: 'Villaggio',
    lupi: 'Lupi',
    mannari: 'Mannari',
    matti: 'Matti',
    parassita: 'Parassita',
    alieni: 'Alieni'
  },

  // Game phases detailed
  gamePhases: {
    setup: {
      title: 'Configurazione',
      description: 'Imposta giocatori, ruoli e opzioni di gioco'
    },
    reveal: {
      title: 'Rivelazione',
      description: 'I giocatori scoprono i loro ruoli'
    },
    night: {
      title: 'Notte',
      description: 'I ruoli notturni possono agire'
    },
    day: {
      title: 'Giorno',
      description: 'Discussione e votazione per il linciaggio'
    },
    resolve: {
      title: 'Risoluzione',
      description: 'Risultati delle azioni notturne'
    },
    end: {
      title: 'Fine Partita',
      description: 'La partita è terminata'
    }
  },

  // Role prompts
  rolePrompts: {
    selectPlayer: 'Seleziona un giocatore…',
    whoToCheck: 'Chi vuoi controllare?',
    whoToInvestigate: 'Chi vuoi investigare?',
    whoToProtect: 'Chi vuoi proteggere?',
    whoToBlock: 'Chi vuoi bloccare?',
    whoToResurrect: 'Chi vuoi resuscitare?',
    selectDeadPlayer: 'Seleziona un giocatore morto',
    confirmSelection: 'Conferma selezione',
    confirmMayor: 'Conferma Sindaco',
    confirmLynch: 'Conferma linciaggio',
    investigatePlayer: 'Scegli un giocatore da investigare',
    checkFaction: 'Controlla la fazione di un giocatore',
    discovered: 'Ha scoperto che',
    protectPlayer: 'Scegli un giocatore da proteggere questa notte',
    chooseTarget: 'Scegli un bersaglio',
    choosePlayerToKill: 'Scegli un giocatore da uccidere (una volta per partita)',
    choosePlayerToBlock: 'Seleziona un giocatore da bloccare',
    choosePlayerToCopy: 'Scegli un giocatore per copiare il suo ruolo',
    choosePlayerToTransform: 'Scegli un giocatore per assumere il suo ruolo',
    choosePlayerToIllusion: 'Scegli un giocatore per cui creare un\'illusione',
    illusionistaDescription: 'Crea un\'illusione che apparirà come un ruolo diverso agli altri giocatori',
    chooseThreeAdjacentPlayers: 'Scegli tre giocatori adiacenti da investigare',
    chooseFirstPlayerToInvestigate: 'Scegli il primo giocatore da investigare',
    nextTwoPlayersAutoSelected: 'I prossimi due giocatori saranno selezionati automaticamente',
    selectPlayerToSeeThree: 'Seleziona un giocatore per vedere tre giocatori adiacenti',
    confirmInvestigation: 'Conferma investigazione',
    playersSelectedForInvestigation: 'Giocatori selezionati per l\'investigazione',
    wolfFoundInInvestigation: 'Lupo trovato nell\'investigazione',
    noWolfInInvestigation: 'Nessun lupo trovato nell\'investigazione',
    whoToKill: 'Chi volete uccidere?',
    whoFirstInvestigated: 'Chi sarà il primo giocatore investigato?',
    selectPlayerPlaceholder: 'Seleziona un giocatore...',
    powerUnavailable: 'Potere non disponibile - Squadra sbilanciata',
    powerBlocked: 'Potere bloccato',
    copyRole: 'Copia Ruolo',
    choosePlayerAndGuessRole: 'Scegli un giocatore e prova ad indovinare il suo ruolo',
    condemnPlayerOrRevealRole: 'Condanna un giocatore o rivela un ruolo',
    chooseDeadPlayerToResurrect: 'Scegli un giocatore morto da resuscitare',
    angeloChooseDeadPlayerDescription: 'Angelo, scegli un giocatore morto da riportare in vita (una volta per partita)',
    alreadyUsedPower: 'Hai già usato il tuo potere in questa partita',
    noDeadPlayersToResurrect: 'Nessun giocatore da resuscitare',
    resurrect: 'Resuscita',
    continue: 'Continua',
    chooseAnotherRole: 'Scegli un altro ruolo',
    continueWithoutPower: 'Continua senza potere',
    backToSelection: 'Torna alla selezione',
    reshuffleRoles: 'Rimescola i ruoli',
    chooseDeadPlayerToInvestigate: 'Scegli un giocatore morto da investigare',
    investigateDeadPlayerDescription: 'Investiga un giocatore morto per scoprire il suo ruolo reale',
    powerOncePerGameFromNight2: 'Puoi usare questo potere una sola volta per partita, a partire dalla notte 2',
    canUsePowerFromNight2: 'Potrai usare questo potere dalla notte 2',
    investigationResult: 'Risultato investigazione',
    hadRole: 'aveva il ruolo',
    skip: 'Salta',
    choosePlayerToExecute: 'Scegli un giocatore da giustiziare',
    giustiziereChoosePlayerDescription: 'Giustiziere, scegli un giocatore da giustiziare (una volta per partita)',
    whoToExecute: 'Chi vuoi giustiziare?',
    execute: 'Giustizia',
    kill: 'Uccidi',
    selectTarget: 'Seleziona un bersaglio…',
    playersWillBeInvestigatedInOrder: 'I giocatori verranno investigati in questo ordine',
    discoverWolvesInVillage: 'Scopri quanti lupi ci sono nel villaggio',
    wolvesInVillage: 'lupi nel villaggio',
    confirm: 'Conferma',
    choosePlayersToInfect: 'Scegli i giocatori da infettare',
    usageNumber: 'Utilizzo {number}',
    infectUpToPlayers: 'Infetta fino a {count} giocatore/i',
    allAlivePlayersAlreadyInfected: 'Tutti i giocatori vivi sono già infetti!',
    confirmInfection: 'Conferma infezione ({current}/{max})',
    powerNotUsedDueToImbalance: 'Potere non utilizzato a causa della perdita di equilibrio tra le squadre',
    noTransformation: 'Nessuna trasformazione',
    transformed: 'si è trasformato',
    transformedPlural: 'si sono trasformati',
    newRole: 'Nuovo ruolo',
    target: 'Bersaglio',
    hasBlocked: 'ha bloccato',
    noPlayerBlocked: 'Nessun giocatore bloccato',
    noInvestigationPerformed: 'Nessuna investigazione effettuata',
    lupoCiecoChoseNotToInvestigate: 'Il Lupo Cieco ha scelto di non investigare nessuno',
    investigatedPlayers: 'Giocatori Investigati',
    wolvesFound: 'Lupi trovati',
    noInfectionPerformed: 'Nessuna infezione effettuata',
    parassitaChoseNotToInfect: 'Il Parassita ha scelto di non infettare nessuno',
    infectedPlayers: 'Giocatori Infetti',
    choosePlayerToInsinuate: 'Scegli un giocatore da insinuare',
    choosePlayerToInsinuateDescription: 'Scegli un giocatore e cambia la sua fazione visibile',
    whoToInsinuate: 'Chi vuoi insinuare?',
    youChose: 'Hai scelto',
    selectRole: 'Seleziona un ruolo…',
    selectBetweenPlayers: 'Seleziona tra {min} e {max} giocatori',
    selectedPlayers: 'Selezionati ({count}):',
    clear: 'Cancella',
    selectAtLeastPlayers: 'Seleziona almeno {count} giocatore{count !== 1 ? "i" : ""}',
    yes: 'Sì',
    no: 'No',
    selectPlayerAndRole: 'Seleziona giocatore e ruolo',
    player: 'Giocatore',
    role: 'Ruolo',
    powerOncePerGame: 'Puoi usare questo potere solo una volta per partita',
    chooseTargetForWolves: 'Scegli un bersaglio da far sbranare dai lupi',
    chooseTargetToRedirect: 'Scegli un bersaglio per reindirizzare gli attacchi dei lupi',
    ammaestratoreDescription: 'Se scegli un lupo, nessuno morirà. Se scegli un altro giocatore, morirà al posto del bersaglio originale.',
    selectPlayerToRevealRole: 'Seleziona un giocatore per fargli rivedere il suo ruolo',
    whoToReveal: 'Chi vuoi far rivedere il ruolo?',
    revealRole: 'Rivela ruolo'
  },
  factionComparison: {
    before: 'Prima:',
    after: 'Dopo:'
  },
  promptMessages: {
    firstNightSkipped: {
      title: 'La prima notte è tranquilla. Gli effetti sono ignorati.',
      buttonText: 'Salta'
    },
    dead: {
      title: 'Tutti i giocatori con questo ruolo sono morti',
      subtitle: 'Non possono usare il loro ruolo questa notte',
      buttonText: 'Continua'
    },
    alive: {
      title: 'I giocatori con questo ruolo sono vivi',
      subtitle: 'Devono essere morti per usare il loro ruolo',
      buttonText: 'Continua'
    },
    blocked: {
      title: 'Tutti i giocatori con questo ruolo sono bloccati',
      subtitle: 'Qualcuno ha bloccato il loro ruolo',
      buttonText: 'Continua'
    },
    startNight: {
      title: 'Non è ancora il momento',
      buttonText: 'Continua'
    },
    usageLimit: {
      title: 'Limite di utilizzo raggiunto',
      subtitle: 'Questo ruolo è già stato usato il massimo numero di volte',
      buttonText: 'Continua'
    },
    noAction: {
      title: 'Nessuna azione richiesta per questo ruolo',
      buttonText: 'Continua'
    }
  },
  resolveDetails: {
    target: 'Bersaglio',
    confirmKill: 'Conferma uccisione',
    confirmMayor: 'Conferma Sindaco',
    confirmLynch: 'Conferma linciaggio',
    whoToReveal: 'Chi vuoi far rivedere il ruolo?',
    revealRole: 'Rivela ruolo',
    selectPlayerToRevealRole: 'Seleziona un giocatore per fargli rivedere il suo ruolo',
    checkFaction: 'Controlla la fazione di un giocatore',
    discovered: 'Ha scoperto che',
    noWolfAttacksToRedirect: 'Nessun attacco dei lupi da reindirizzare',
    chooseTargetForWolves: 'Scegli un bersaglio da far sbranare dai lupi',
    chooseTargetToRedirect: 'Scegli un bersaglio per reindirizzare gli attacchi dei lupi',
    ammaestratoreDescription: 'Se scegli un lupo, nessuno morirà. Se scegli un altro giocatore, morirà al posto del bersaglio originale.',
    powerAlreadyUsed: 'Hai già usato il tuo potere in questa partita.',
    kill: 'Uccidi',
    powerOncePerGame: 'Potrai usare questo potere solo una volta per partita',
    choosePlayerToIllusion: 'Scegli un giocatore da illusionare',
    illusionistaDescription: 'Il giocatore scelto non potrà usare la sua abilità questa notte',
    choosePlayerToInsinuate: 'Scegli un giocatore da insinuare',
    choosePlayerToInsinuateDescription: 'Scegli un giocatore da insinuare per questa notte.',
    whoToInsinuate: 'Chi vuoi insinuare?',
    youChose: 'Hai scelto:',
    chooseThreeAdjacentPlayers: 'Scegli tre giocatori vicini tra loro da investigare',
    chooseFirstPlayerToInvestigate: 'Scegliete il primo giocatore da investigare',
    nextTwoPlayersAutoSelected: 'I prossimi 2 giocatori contigui verranno selezionati automaticamente',
    selectPlayerToSeeThree: 'Seleziona un giocatore per vedere i 3 investigati',
    playersSelectedForInvestigation: 'Giocatori selezionati per l\'investigazione',
    wolfFoundInInvestigation: 'C\'è almeno un lupo tra i giocatori investigati!',
    noWolfInInvestigation: 'Non ci sono lupi tra i giocatori investigati.',
    confirmInvestigation: 'Conferma investigazione',
    notEnoughPlayersToInvestigate: 'Non ci sono abbastanza giocatori per investigare',
    cannotSelectThreeAdjacent: 'Non è possibile selezionare 3 giocatori contigui senza includere te stesso',
    skipInvestigation: 'Salta investigazione',
    allWolvesDeadCanKill: 'Tutti i lupi sono morti! Ora potete anche uccidere qualcuno',
    chooseTargetToEliminate: 'Scegliete un bersaglio da eliminare',
    investigatedPlayers: 'Giocatori Investigati',
    investigationResult: 'Risultato Investigazione',
    wolvesFound: 'Lupi Trovati',
    infectedPlayers: 'Giocatori Infetti',
    noInvestigationPerformed: 'Nessuna investigazione effettuata',
    lupoCiecoChoseNotToInvestigate: 'Il Lupo Cieco ha scelto di non investigare nessuno',
    noInfectionPerformed: 'Nessuna infezione effettuata',
    parassitaChoseNotToInfect: 'Il Parassita ha scelto di non infettare nessuno',
    transformedInto: 'si è trasformato in',
    copiedRole: 'Ruolo Copiato',
    copiedPlural: 'hanno copiato',
    copied: 'ha copiato',
    copiedActionResult: 'risultato azione copiata',
    copiedAction: 'azione copiata',
    noActionTaken: 'Nessuna azione intrapresa',
    copiedRoleNoEffect: 'ruolo copiato nessun effetto',
    copiedRoleChoseNotToUse: 'ha scelto di non usare',
    copiedRoleCannotBeUsed: 'non può essere usato',
    insinuated: 'ha insinuato',
    noPlayerInsinuated: 'Nessun giocatore insinuato',
    sawPlural: 'hanno visto',
    saw: 'ha visto',
    playsFor: 'gioca per',
    hadRole: 'aveva il ruolo',
    chose: 'ha scelto',
    correct: 'corretto',
    wrong: 'sbagliato',
    noDeclaration: 'Nessuna dichiarazione',
    attacked: 'ha attaccato',
    attackedPlural: 'hanno attaccato',
    noAttack: 'Nessun attacco',
    wolvesChoseNotToAttack: 'I lupi hanno scelto di non attaccare',
    wolves: 'Lupi',
    targets: 'Bersagli',
    noTransformation: 'Nessuna trasformazione',
    newRole: 'Nuovo ruolo',
    executed: 'ha giustiziato',
    protected: 'ha protetto',
    ammaestratore: 'Ammaestratore',
    barabba: 'Barabba',
    angelo: 'Angelo',
    resuscitato: 'Resuscitato',
    blockedAttacks: 'ha bloccato gli attacchi',
    redirectedAttacksTo: 'ha reindirizzato gli attacchi verso',
    killed: 'ha ucciso',
    resurrected: 'ha resuscitato'
  },

  // Start night prompt
  startNightPrompt: {
    title: 'Non è ancora il momento',
    description: 'Questo ruolo può essere usato a partire dalla notte {night}',
    buttonText: 'Continua'
  },

  // Forms
  forms: {
    playerPlaceholder: 'Giocatore {number}'
  },

  // Phase Reveal
  phaseReveal: {
    title: 'Rivelazione dei ruoli',
    howToReveal: 'Come rivelare i ruoli',
    howToRevealDescription: 'Passa il dispositivo a ogni giocatore a turno. Tieni premuto per vedere il tuo ruolo, poi passa al prossimo.',
    startReveals: 'Inizia Rivelazioni',
    beforeNight: 'Prima che inizi la Notte',
    closeEyes: 'Chiedi a tutti i giocatori di chiudere gli occhi',
    whenReady: 'Quando tutti sono pronti vai alla prima notte',
    revealAgain: 'Rivela di nuovo un ruolo',
    startNight: 'Inizia la Notte',
    reveal: 'Rivela',
    roleRevealed: 'Ruolo rivelato',
    roleRevealedSuccess: 'Ruolo rivelato!',
    yourFaction: 'La tua fazione',
    yourInformation: 'Le tue informazioni',
    youKnowEachOther: 'Vi conoscete',
    youKnowThem: 'Li conosci',
    next: 'Avanti',
    holdToContinue: 'tieni premuto per continuare',
    holdToReveal: 'tieni premuto per rivelare',
    unknownRole: 'Ruolo sconosciuto',
    noAction: 'Nessuna azione',
    passPhoneTo: 'Passa il telefono a',
    noRolesUsedPowers: 'Nessun ruolo ha usato i suoi poteri questa notte.',
    revealRoleAgain: 'Rivela di nuovo un ruolo',
    appearsAs: 'appare come',
    nextPlayer: 'Prossimo Giocatore',
    allies: 'Alleati',
    sameRole: 'Stesso Ruolo',
    sameTeam: 'Stessa Squadra'
  },

  // Phase Resolve
  // Event History
  eventHistory: {
    title: 'Cronologia Eventi',
    noEvents: 'Nessun evento registrato',
    playerDied: '{player} è morto',
    playerLynched: '{player} è stato linciato',
    playerProtected: '{player} è stato protetto',
    playerBlocked: '{player} è stato bloccato',
    roleRevealed: 'Ruolo rivelato: {role}',
    gameStarted: 'Partita iniziata',
    nightStarted: 'Notte {number} iniziata',
    dayStarted: 'Giorno {number} iniziato',
    day: 'Giorno {day}',
    night: 'Notte {night}',
    results: 'Risultati',
    deaths: 'Morti',
    deathsCount: '{count} morti',
    noDeaths: 'Nessun morto',
    peacefulNight: 'La notte è stata tranquilla',
    nightDetails: 'Dettagli notturni',
    voting: 'Votazione',
    lynching: 'Linciaggio',
    noLynching: 'Nessun linciaggio'
  },

  // Win Conditions
  winConditions: {
    villageWins: 'Il Villaggio vince!',
    wolvesWins: 'I Lupi vincono!',
    werewolvesWins: 'I Mannari vincono!',
    madWins: 'I Matti vincono!',
    parasiteWins: 'Il Parassita vince!',
    aliensWins: 'Gli Alieni vincono!',
    gameEnded: 'Partita terminata'
  },

  // Win Results
  winResults: {
    title: 'Fine partita',
    battleEnded: 'La battaglia è finita',
    noWinner: 'Nessuno ha vinto questa battaglia',
    events: 'Eventi',
    newGame: 'Nuova partita'
  },

  // Win Logic
  winLogic: {
    tie: 'Pareggio, tutti sono morti',
    teamWins: '{team} vince',
    teamsWin: '{teams} vincono'
  },

  // Role Details
  roleDetails: {
    target: 'Bersaglio',
    completeRoleDetails: 'Dettagli completi del ruolo',
    description: 'Descrizione',
    detailedDescription: 'Descrizione Dettagliata',
    factionInformation: 'Informazioni Fazione',
    realFaction: 'Fazione Reale',
    realFactionDesc: 'La fazione a cui appartiene realmente',
    howItAppears: 'Come Appare',
    howItAppearsDesc: 'Come appare agli altri giocatori',
    countsAs: 'Conta Come',
    countsAsDesc: 'Fazione per cui conta nelle condizioni di vittoria',
    roleRequiresDead: 'Questo ruolo richiede di essere morto per essere utilizzato.',
    roleRequiresAlive: 'Questo ruolo richiede che tu sia vivo per essere utilizzato.',
    roleNotUsable: 'Ruolo non utilizzabile',
    powerNotAvailable: 'Potere non disponibile',
    roleCopiedSuccessfully: 'Ruolo copiato con successo',
    copiedRole: 'Ruolo copiato',
    gameMechanics: 'Meccaniche di Gioco',
    abilitiesAndFeatures: 'Abilità e Caratteristiche',
    effectType: 'Tipo di Effetto',
    required: 'Obbligatorio - deve utilizzare l\'abilità',
    optional: 'Opzionale - può scegliere di utilizzare l\'abilità',
    usage: 'Utilizzo',
    unlimited: 'Illimitato',
    once: 'Una volta - può agire solo una volta per partita',
    times: 'volte',
    timesPerGame: 'per partita',
    notSpecified: 'Non specificato',
    actsAtNight: 'Agisce di Notte',
    always: 'Agisce sempre di notte',
    whenAlive: 'Agisce di notte quando vivo',
    whenDead: 'Agisce di notte quando morto',
    never: 'Non agisce di notte',
    startNight: 'Notte di Inizio',
    fromNight: 'Dalla notte',
    canTargetDead: 'Può agire sui morti',
    affects: 'Influenza',
    knownTo: 'Conosciuto da',
    winCondition: 'Condizione di Vittoria',
    specificRoleCondition: 'Condizione specifica del ruolo',
    playerCount: 'Numero Giocatori',
    minCount: 'Conteggio Minimo',
    maxCount: 'Conteggio Massimo',
    roleNotFound: 'Il ruolo richiesto non esiste o non è disponibile.',
    roleNotFoundTitle: 'Ruolo non trovato',
    roleNotFoundSubtitle: 'Errore nella ricerca del ruolo',
    backToRoles: 'Torna ai ruoli',
    unknown: 'Sconosciuto',
    firstNight: '1ª notte',
    nightOrdinal: 'ª notte',
    nightAction: 'Azione Notturna',
    revealedToAllies: 'Rivelato agli alleati',
    roleName: 'Nome del ruolo',
    factionOnly: 'Solo fazione',
    maxUsageReached: 'Questo ruolo è già stato utilizzato il numero massimo di volte permesso.',
    cannotUsePowerDying: 'Non puoi utilizzare il tuo potere perché stai morendo a causa della perdita di equilibrio tra le squadre.',
    selectedPlayerBlocked: 'Il giocatore selezionato è bloccato e non può utilizzare il suo ruolo.',
    selectedPlayerDead: 'Il giocatore selezionato è morto e non può utilizzare il suo ruolo.',
    roleCannotBeUsedAtNight: 'Questo ruolo non può essere utilizzato durante la notte.',
    roleCanOnlyBeUsedFromNight: 'Questo ruolo può essere utilizzato solo a partire dalla notte {night}.',
    roleBlockedByOther: 'Questo ruolo è bloccato da un altro giocatore o ha altre restrizioni.',
    roleCannotBeUsedUnknown: 'Questo ruolo non può essere utilizzato per motivi sconosciuti.',
    powerBlockedDueToImbalance: 'Il vostro potere è bloccato a causa della perdita di equilibrio tra le squadre',
    copyAnotherPlayerPower: 'Copia il potere di un altro giocatore per questa notte',
    cannotUsePowerDyingShort: 'Non puoi utilizzare il tuo potere perché stai morendo',
    selectedRoleCannotBeUsed: 'Il ruolo selezionato non può essere utilizzato',
    hasBlocked: 'ha bloccato',
    transformed: 'si è trasformato',
    transformedPlural: 'si sono trasformati',
    newRole: 'Nuovo ruolo'
  },


  // Faction win conditions
  factionWinConditions: {
    villaggio: 'I villici vincono quando tutti i lupi sono stati eliminati',
    lupi: 'I lupi vincono quando raggiungono la parità numerica con i villici o li superano',
    mannari: 'Il lupo mannaro vince se restano solo in due (lui e un altro giocatore)',
    matti: 'Il matto vince se viene eliminato durante il giorno (votazione)',
    parassita: 'Il parassita vince quando tutti i giocatori vivi sono infetti',
    alieni: 'Gli alieni vincono quando rimangono vivi con lo stesso numero di giocatori per ogni squadra'
  },

  // New roles popup
  newRoles: {
    title: 'Nuovi Ruoli Disponibili!',
    description: 'Sono arrivati nuovi ruoli nel villaggio! Ecco cosa c\'è di nuovo:',
    gotIt: 'Perfetto!'
  },

  // Genio role
  genio: {
    chooseRole: 'Scegli uno dei tre ruoli disponibili in cui trasformarti',
    chooseRoleDescription: 'Scegli uno dei tre ruoli disponibili per trasformarti'
  },
  phaseResolve: {
    title: 'Risoluzione Notte',
    nightResults: 'Annunci da fare',
    deaths: 'Morti',
    player: 'giocatore',
    players: 'giocatori',
    noDeaths: 'Nessun morto',
    peacefulNight: 'La notte è stata tranquilla',
    resurrected: 'Resuscitati',
    details: 'Dettagli',
    hide: 'Nascondi',
    continue: 'Continua',
    resolving: 'Risoluzione in corso…',
    reloadHelp: 'Ricarica per iniziare una nuova partita dal menu principale'
  },
  roleComparison: {
    declared: 'Dichiarato:'
  },
  dayPhase: {
    day: 'Giorno',
    selectPlayer: 'Seleziona giocatore',
    electMayor: 'Eleggi il Sindaco',
    mayorVoteDescription: 'Il voto dell\'eletto conterà come 2 per il resto della partita.',
    whoToElectAsMayor: 'Chi vuoi eleggere come Sindaco?',
    firstDayLynchSkipped: 'Il linciaggio del primo giorno è saltato',
    goToNight: 'Vai alla notte',
    selectPlayerToLynch: 'Seleziona il giocatore da linciare',
    timeToVote: 'È il momento di votare. Effettuate le votazioni, poi seleziona chi è stato linciato.',
    whoToLynch: 'Chi vuoi linciare?'
  },
  preNightPhase: {
    night: 'Notte',
    askPlayersToCloseEyes: 'Chiedi a tutti i giocatori di chiudere gli occhi',
    whenReadyProceed: 'Quando tutti sono pronti prosegui alla fase notturna',
    alivePlayersAndRoles: 'Giocatori vivi e i loro ruoli',
    startNight: 'Inizia la Notte',
    reloadHelp: 'Ricarica per iniziare una nuova partita dal menu principale',
    unknown: 'Sconosciuti'
  },
  mediumPrompt: {
    selectDeadPlayer: 'Seleziona un giocatore morto…',
    chooseDeadPlayer: 'Scegli un giocatore morto da investigare',
    checkDeadPlayerFaction: 'Controlla la fazione di un giocatore morto',
    noDeadPlayers: 'Nessun giocatore morto da investigare',
    continue: 'Continua',
    whoToCheck: 'Chi vuoi controllare?',
    discovered: 'Ha scoperto che'
  }
}