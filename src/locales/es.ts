export default {
  // Top-level keys
  Execute: 'Ejecutar',
  Resurrect: 'Resucitar',
  'Confirm selection': 'Confirmar selección',
  
  // Navigation
  nav: {
    home: 'Inicio',
    roles: 'Roles',
    players: 'Jugadores',
    settings: 'Configuración'
  },

  // Common UI
  common: {
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    yes: 'Sí',
    no: 'No',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    start: 'Iniciar',
    configure: 'Configurar',
    resume: 'Reanudar',
    ignore: 'Ignorar',
    skip: 'Saltar',
    continue: 'Continuar',
    reset: 'Restablecer',
    quit: 'Salir',
    refresh: 'Actualizar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
    execute: 'Ejecutar',
    none: 'Ninguno',
    unknown: 'Desconocido'
  },

  // Game phases
  phases: {
    setup: 'Configuración',
    reveal: 'Revelación',
    preNight: 'Pre-Noche',
    night: 'Noche',
    day: 'Día',
    end: 'Fin'
  },

  // Setup page
  setup: {
    title: 'Configuración',
    balance: 'Equilibrio',
    weakestFaction: 'Facción más débil',
    startGame: 'Iniciar',
    configureGame: 'Configurar',
    duplicateNames: 'Resuelve los nombres duplicados para iniciar el juego',
    roles: 'Roles',
    players: 'Jugadores',
    settings: 'Configuración',
    enabled: 'Habilitados',
    disabled: 'Deshabilitados'
  },

  // Players management
  players: {
    title: 'Gestión de Jugadores',
    subtitle: 'Ingresa los nombres en el mismo orden en que están posicionados',
    players: 'Jugadores',
    player: 'Jugador',
    addPlayer: 'Agregar',
    reset: 'Restablecer',
    removePlayer: 'Eliminar jugador',
    moveUp: 'Mover jugador hacia arriba',
    moveDown: 'Mover jugador hacia abajo',
    nameErrors: 'Resuelve los errores en los nombres para continuar',
    duplicateName: 'Nombre duplicado',
    nameTooLong: 'Nombre demasiado largo (máx. 15 caracteres)',
    placeholder: 'Jugador {number}'
  },

  // Roles management
  roles: {
    title: 'Seleccionar Roles',
    subtitle: 'Elige qué roles están disponibles en esta partida. Aldeanos y Lobos siempre están habilitados.',
    details: 'Detalles',
    always: 'Siempre',
    roles: 'roles',
    role: 'rol'
  },

  // Settings page
  settings: {
    title: 'Configuración',
    language: 'Idioma',
    selectLanguage: 'Seleccionar idioma',
    languageDescription: 'Elige el idioma de la interfaz de usuario',
    gameOptions: 'Opciones de Juego',
    supportProject: 'Apoya el Proyecto',
    buyCoffee: 'Cómprame un café',
    buyCoffeeDescription: 'Si te gusta el proyecto, considera apoyarlo con una donación para mantener el proyecto activo.',
    offerCoffee: 'Cómprame un café',
    contributeGitHub: 'Contribuye en GitHub',
    contributeGitHubDescription: 'Dale una estrella al proyecto y reporta cualquier problema o sugerencia de mejora.',
    starProject: 'Dale una estrella',
    reportIssue: 'Reportar un problema',
    version: 'Versión',
    skipFirstNight: 'Saltar acciones de la primera noche',
    skipFirstNightDescription: 'Todos los roles son llamados en la Noche 1, pero sus efectos son ignorados.',
    enableMayor: 'Habilitar Alcalde',
    enableMayorDescription: 'El voto del alcalde cuenta doble durante la votación cuando está vivo.',
    discussionTimer: 'Temporizador de discusión',
    discussionTimerDescription: 'Muestra un temporizador compacto en la fase de linchamiento para la discusión (máx. 60 minutos).',
    maxDifficulty: 'Dificultad Máxima',
    maxDifficultyDescription: 'Requiere declaraciones de roles más específicas. Ej: El Verdugo debe declarar "Lobo Gordo" en lugar de "Lobo" para matar a un Lobo Gordo.'
  },

  // Game state
  game: {
    gameInProgress: 'Partida en curso',
    savedGame: 'Tienes una partida guardada que puedes reanudar',
    noResult: 'Sin resultado',
    noDetailsAvailable: 'Sin detalles disponibles',
    canOpenEyes: 'Pueden abrir los ojos:',
    chooseVictim: 'Elige una víctima para devorar esta noche',
    whoToEliminate: '¿A quién quieres eliminar?',
    confirmSelection: 'Confirmar selección'
  },

  // Role blocking reasons
  blocking: {
    blocked: 'Alguien bloqueó su rol',
    dead: 'No puede usar el rol',
    alive: 'Debe estar muerto para actuar',
    startNight: 'Puedes usar tu rol a partir de la noche {night}',
    usageLimit: 'Ya has usado este rol el número máximo de veces',
    default: 'No puede usar el rol esta noche'
  },

  // Teams
  teams: {
    village: 'Aldea',
    wolves: 'Lobos',
    werewolves: 'Hombres Lobo',
    mad: 'Locos',
    parasite: 'Parásito',
    aliens: 'Alienígenas'
  },

  // App updates
  updates: {
    available: 'Actualización de App Disponible',
    description: 'Una nueva versión de la app está lista. Actualiza para obtener las últimas características.',
    refreshNow: 'Actualizar Ahora'
  },

  // Prompts
  prompts: {
    dead: {
      title: 'Estás muerto',
      subtitle: 'Ya no puedes participar en el juego',
      buttonText: 'Continuar'
    },
    blocked: {
      title: 'Rol bloqueado',
      subtitle: 'Alguien impidió tu acción',
      buttonText: 'Continuar'
    },
    alive: {
      title: 'Estás vivo',
      subtitle: 'Puedes participar en el juego',
      buttonText: 'Continuar'
    },
    startNight: {
      title: 'Iniciar la noche',
      subtitle: 'Todos los roles pueden actuar',
      buttonText: 'Iniciar'
    },
    usageLimit: {
      title: 'Límite alcanzado',
      subtitle: 'Ya has usado este rol el número máximo de veces',
      buttonText: 'Continuar'
    },
    yesNo: {
      yes: 'Sí',
      no: 'No'
    }
  },

  // Role states
  roleStates: {
    alive: 'vivo',
    dead: 'muerto',
    blocked: 'bloqueado',
    player: 'Jugador'
  },

  // Game constants
  gameConstants: {
    canOpenEyes: 'Pueden abrir los ojos:',
    chooseVictim: 'Elige una víctima para devorar esta noche',
    whoToEliminate: '¿A quién quieres eliminar?',
    confirmSelection: 'Confirmar selección',
    noResult: 'Sin resultado',
    noDetailsAvailable: 'Sin detalles disponibles'
  },

  // Role names and descriptions
  roleNames: {
    lupo: 'Lobo',
    veggente: 'Vidente',
    guardia: 'Guardia',
    boia: 'Verdugo',
    giustiziere: 'Ejecutor',
    angelo: 'Ángel',
    barabba: 'Barrabás',
    bugiardo: 'Mentiroso',
    genio: 'Genio',
    illusionista: 'Ilusionista',
    indemoniato: 'Poseído',
    insinuo: 'Insinuador',
    lupomannaro: 'Hombre Lobo',
    massone: 'Masón',
    matto: 'Loco',
    medium: 'Médium',
    misspurple: 'Señorita Púrpura',
    muccamannara: 'Vaca Loba',
    mutaforma: 'Cambiaformas',
    parassita: 'Parásito',
    simbionte: 'Simbionte',
    villico: 'Aldeano',
    lupoCieco: 'Lobo Ciego',
    lupoCiccione: 'Lobo Gordo',
    ammaestratore: 'Domador'
  },

  // Role descriptions
  roleDescriptions: {
    lupo: 'El lobo devora un jugador cada noche.',
    veggente: 'Cada noche puede verificar la facción de un jugador.',
    guardia: 'Cada noche puede proteger a un jugador de los lobos.',
    boia: 'Puede matar a un jugador declarando correctamente su rol.',
    giustiziere: 'Puede matar a un jugador durante la noche una vez por partida.',
    angelo: 'Una vez por partida puede resucitar a un jugador muerto.',
    barabba: 'Cuando muere, puede llevarse a un jugador al más allá.',
    bugiardo: 'Puede investigar jugadores muertos para descubrir sus roles.',
    genio: 'Puede transformarse en el rol de otro jugador una vez por partida.',
    illusionista: 'Puede bloquear la habilidad de un jugador durante la noche.',
    indemoniato: 'Un aldeano que juega para los lobos.',
    insinuo: 'Durante la noche, puede cambiar la facción de un jugador a los ojos de quienes lo investigan.',
    lupomannaro: 'Juega solo. Cada noche puede matar a un jugador declarando correctamente su rol. No puede ser matado por los lobos.',
    massone: 'Conoce la identidad de otros masones.',
    matto: 'Gana si es linchado.',
    medium: 'Puede investigar a un jugador muerto para descubrir su facción.',
    misspurple: 'Cada noche descubre cuántos jugadores que aparecen como lobos están vivos.',
    muccamannara: 'Juega sola. Conoce a los lobos y aparece como lobo. No puede ser matada por los lobos.',
    mutaforma: 'Cada noche puede copiar el rol de otro jugador.',
    parassita: 'Infecta a otros jugadores y gana cuando todos están infectados.',
    simbionte: 'Debe transformarse en el rol de otro jugador al inicio de la partida.',
    villico: 'Un habitante de la aldea sin poderes especiales.',
    lupoCieco: 'Un lobo que investiga tres jugadores adyacentes cada noche. No conoce a los otros lobos.',
    lupoCiccione: 'Un lobo que hace que los jugadores adyacentes a él aparezcan como lobos.',
    ammaestratore: 'Puede redirigir el objetivo de los lobos desde la 2ª noche, una vez por partida.',
    lupoLong: `El Lobo es el rol más temido del juego, cada noche debe elegir una víctima para devorar.

CÓMO FUNCIONA:
• Cada noche debe elegir una víctima para matar
• Puede matar a cualquier jugador vivo
• La víctima muere al amanecer`,
    veggenteLong: `El Vidente es el investigador de la aldea, capaz de descubrir las facciones de los jugadores.

CÓMO FUNCIONA:
• Cada noche puede elegir un jugador para investigar
• Descubre la facción de ese jugador (como aparece a otros)`,
    guardiaLong: `La Guardia es la protectora de la aldea, capaz de salvar vidas inocentes.

CÓMO FUNCIONA:
• Cada noche puede elegir un jugador para proteger
• El jugador protegido no puede ser matado por los lobos esa noche

PERSONALIZACIÓN:
Este es un rol genérico que puede adaptarse a diferentes estilos de juego, por ejemplo:
• Puede protegerse a sí mismo
• No puede proteger al mismo jugador dos veces seguidas`,
    boiaLong: `El Verdugo trabaja para los lobos.
    Una vez por partida puede matar a otro jugador declarando correctamente su rol.
    Si la declaración es incorrecta, el Verdugo muere.

CÓMO FUNCIONA:
• Es visto como lobo
• Durante la noche puede declarar el rol de un jugador
• Si la declaración es correcta, el jugador muere
• Si la declaración es incorrecta, el Verdugo muere
• Puede actuar solo una vez por partida`,
    giustiziereLong: `El Ejecutor es el vengador de la aldea, capaz de ejecutar a los culpables.

CÓMO FUNCIONA:
• Durante la noche puede elegir un jugador para ejecutar
• La acción no puede ser detenida
• Puede ejecutar solo una vez por partida`,
    massoneLong: `El Masón es miembro de una sociedad secreta que conoce a otros miembros.

CÓMO FUNCIONA:
• Conoce la identidad de otros masones`,
    villicoLong: `El Aldeano es un ciudadano común sin poderes especiales, pero con derecho a voto.

CÓMO FUNCIONA:
• No tiene poderes especiales`,
    angeloLong: `El Ángel es un ser divino capaz de resucitar a los muertos.

CÓMO FUNCIONA:
• Puede resucitar a un jugador muerto
• La acción puede usarse solo una vez por partida
• El jugador resucitado regresa al juego con su rol original`,
    barabbaLong: `Cuando muere, puede llevarse a un jugador al más allá.

CÓMO FUNCIONA:
• Puede matar a un jugador durante la noche cuando está muerto
• La acción puede usarse solo una vez por partida`,
    mattoLong: `El Loco es un aldeano que gana si es linchado por la aldea.

CÓMO FUNCIONA:
• Gana inmediatamente si es linchado
• No tiene otros poderes especiales
• Debe convencer a la aldea de lincharlo`,
    lupomannaroLong: `El Hombre Lobo es un lobo que puede matar jugadores declarando correctamente su rol.
    Juega solo y no puede ser matado por los lobos.
    Gana si sobrevive hasta el final del juego.

CÓMO FUNCIONA:
• No puede ser matado por los lobos
• Puede matar a un jugador declarando su rol
• Si la declaración es correcta, el jugador muere
• Si la declaración es incorrecta, nadie muere`,
    muccamannaraLong: `La Vaca Loba juega sola. Conoce a los lobos y aparece como lobo.
    Gana si sobrevive hasta el final del juego.

CÓMO FUNCIONA:
• No puede ser matada por los lobos
• Aparece como lobo cuando es investigada
• Puede confundir las investigaciones`,
    indemoniatoLong: `El Poseído es un aldeano que juega para los lobos.

CÓMO FUNCIONA:
• Se comporta como un aldeano normal
• Debe ayudar a los lobos a ganar aunque no sepa quiénes son`,
    insinuoLong: `El Insinuador trabaja para los lobos. Puede cambiar la facción de un jugador a los ojos
    de otros jugadores que lo investigan.

CÓMO FUNCIONA:
• Cada noche puede elegir un jugador para "insinuar"
• Cambia la facción visible del jugador elegido, si era lobo aparecerá como aldeano, si era aldeano aparecerá como lobo
• El efecto dura una noche
• Puede confundir las investigaciones`,
    illusionistaLong: `El Ilusionista juega para los lobos. Puede bloquear la habilidad de otro jugador.

CÓMO FUNCIONA:
• Cada noche puede elegir un jugador para bloquear
• El jugador bloqueado no puede usar su habilidad esa noche
• El efecto dura una noche
• Si hay otro jugador vivo con el mismo rol que el jugador bloqueado,
  esos jugadores aún pueden usar su habilidad`,
    genioLong: `El Genio puede transformarse en otro rol elegido entre tres al azar.
    Puede usar este poder solo una vez por partida, a partir de la tercera noche.

CÓMO FUNCIONA:
• Puede elegir un rol entre tres al azar (elegidos por el narrador)
• La acción puede usarse solo una vez por partida`,
    parassitaLong: `El Parásito gana si logra infectar a todos los jugadores vivos.

CÓMO FUNCIONA:
• La primera noche puede infectar hasta 3 jugadores
• La segunda noche puede infectar hasta 2 jugadores
• Desde la tercera noche en adelante, puede infectar 1 jugador
• Gana si todos los otros jugadores vivos están infectados`,
    simbionteLong: `El Simbionte asume el rol de otro jugador. La primera noche debe
    elegir un jugador e inmediatamente asumir su rol.

CÓMO FUNCIONA:
• Debe elegir un jugador y asumir su rol
• La acción puede usarse solo una vez por partida`,
    mutaformaLong: `El Cambiaformas es un alienígena que, cada noche, puede copiar el rol de otro jugador.

CÓMO FUNCIONA:
• Puede elegir un jugador y copiar su rol para esa noche
• Copia todos los poderes del rol elegido`,
    misspurpleLong: `La Señorita Púrpura es una aldeana que, cada noche, descubre cuántos jugadores
    que aparecen como lobos están vivos.

CÓMO FUNCIONA:
• Cada noche descubre cuántos jugadores que aparecen como lobos están vivos`,
    bugiardoLong: `El Mentiroso trabaja para los lobos. Una vez por partida puede descubrir el rol
    de un jugador muerto.

CÓMO FUNCIONA:
• Puede investigar jugadores muertos
• Descubre el rol de un jugador muerto
• Puede ayudar a los lobos fingiendo tener el rol que descubrió`,
    ammaestratoreLong: `El Domador puede domar a los lobos y forzarlos a devorar una víctima elegida por él.
    Si el domador elige un lobo como víctima, nadie muere.
    Si elige otro jugador, muere en lugar del objetivo original de los lobos.

CÓMO FUNCIONA:
• Puede elegir un objetivo para los ataques de los lobos
• Si elige un lobo, nadie muere
• Si elige otro jugador, muere en lugar del objetivo original`,
    lupoCiccioneLong: `El Lobo Gordo es un lobo que hace que los jugadores adyacentes aparezcan como lobos.

CÓMO FUNCIONA:
• Se comporta como un lobo normal, así que abre los ojos con los lobos
• Hace que los primeros dos jugadores vivos a su izquierda y derecha aparezcan como lobos
• Puede confundir las investigaciones`,
    lupoCiecoLong: `El Lobo Ciego es un lobo solitario que no conoce a los otros lobos.
    Los otros lobos no lo conocen. Puede investigar tres jugadores contiguos y descubrir si
    hay al menos un lobo entre los tres.

CÓMO FUNCIONA:
• Cada noche investiga tres jugadores contiguos
• Descubre si hay al menos un lobo entre los tres
• Si todos los lobos están muertos, también puede matar como un lobo normal`,
    mediumLong: `El Médium puede comunicarse con jugadores muertos para obtener información.

CÓMO FUNCIONA:
• Cada noche puede elegir un jugador muerto con quien comunicarse
• Descubre para qué equipo jugaba el jugador muerto`
  },

  // Faction names
  factions: {
    village: 'Aldea',
    wolves: 'Lobos',
    werewolves: 'Hombres Lobo',
    mad: 'Locos',
    parasite: 'Parásito',
    aliens: 'Alienígenas',
    villaggio: 'Aldea',
    lupi: 'Lobos',
    mannari: 'Hombres Lobo',
    matti: 'Locos',
    parassita: 'Parásito',
    alieni: 'Alienígenas'
  },

  // Game phases detailed
  gamePhases: {
    setup: {
      title: 'Configuración',
      description: 'Configura jugadores, roles y opciones de juego'
    },
    reveal: {
      title: 'Revelación',
      description: 'Los jugadores descubren sus roles'
    },
    night: {
      title: 'Noche',
      description: 'Los roles nocturnos pueden actuar'
    },
    day: {
      title: 'Día',
      description: 'Discusión y votación para el linchamiento'
    },
    resolve: {
      title: 'Resolución',
      description: 'Resultados de las acciones nocturnas'
    },
    end: {
      title: 'Fin de Partida',
      description: 'La partida ha terminado'
    }
  },

  // Role prompts
  rolePrompts: {
    selectPlayer: 'Selecciona un jugador…',
    whoToCheck: '¿A quién quieres verificar?',
    whoToInvestigate: '¿A quién quieres investigar?',
    whoToProtect: '¿A quién quieres proteger?',
    whoToBlock: '¿A quién quieres bloquear?',
    whoToResurrect: '¿A quién quieres resucitar?',
    selectDeadPlayer: 'Selecciona un jugador muerto',
    confirmSelection: 'Confirmar selección',
    confirmMayor: 'Confirmar Alcalde',
    confirmLynch: 'Confirmar linchamiento',
    investigatePlayer: 'Elige un jugador para investigar',
    checkFaction: 'Verifica la facción de un jugador',
    discovered: 'Descubrió que',
    protectPlayer: 'Elige un jugador para proteger esta noche',
    chooseTarget: 'Elige un objetivo',
    choosePlayerToKill: 'Elige un jugador para matar (una vez por partida)',
    choosePlayerToBlock: 'Selecciona un jugador para bloquear',
    choosePlayerToCopy: 'Elige un jugador para copiar su rol',
    choosePlayerToTransform: 'Elige un jugador para asumir su rol',
    choosePlayerToIllusion: 'Elige un jugador para crear una ilusión',
    illusionistaDescription: 'Crea una ilusión que aparecerá como un rol diferente a otros jugadores',
    chooseThreeAdjacentPlayers: 'Elige tres jugadores adyacentes para investigar',
    chooseFirstPlayerToInvestigate: 'Elige el primer jugador para investigar',
    nextTwoPlayersAutoSelected: 'Los siguientes dos jugadores serán seleccionados automáticamente',
    selectPlayerToSeeThree: 'Selecciona un jugador para ver tres jugadores adyacentes',
    confirmInvestigation: 'Confirmar investigación',
    playersSelectedForInvestigation: 'Jugadores seleccionados para la investigación',
    wolfFoundInInvestigation: 'Lobo encontrado en la investigación',
    noWolfInInvestigation: 'No se encontró lobo en la investigación',
    whoToKill: '¿A quién quieren matar?',
    whoFirstInvestigated: '¿Quién será el primer jugador investigado?',
    selectPlayerPlaceholder: 'Selecciona un jugador...',
    powerUnavailable: 'Poder no disponible - Equipo desequilibrado',
    powerBlocked: 'Poder bloqueado',
    copyRole: 'Copiar Rol',
    choosePlayerAndGuessRole: 'Elige un jugador e intenta adivinar su rol',
    condemnPlayerOrRevealRole: 'Condena a un jugador o revela un rol',
    chooseDeadPlayerToResurrect: 'Elige un jugador muerto para resucitar',
    angeloChooseDeadPlayerDescription: 'Ángel, elige un jugador muerto para traer de vuelta a la vida (una vez por partida)',
    alreadyUsedPower: 'Ya has usado tu poder en esta partida',
    noDeadPlayersToResurrect: 'No hay jugadores muertos para resucitar',
    resurrect: 'Resucitar',
    continue: 'Continuar',
    chooseAnotherRole: 'Elige otro rol',
    continueWithoutPower: 'Continuar sin poder',
    backToSelection: 'Volver a la selección',
    reshuffleRoles: 'Revolver roles',
    chooseDeadPlayerToInvestigate: 'Elige un jugador muerto para investigar',
    investigateDeadPlayerDescription: 'Investiga un jugador muerto para descubrir su rol real',
    powerOncePerGameFromNight2: 'Puedes usar este poder solo una vez por partida, a partir de la noche 2',
    canUsePowerFromNight2: 'Podrás usar este poder desde la noche 2',
    investigationResult: 'Resultado de investigación',
    hadRole: 'tenía el rol',
    skip: 'Saltar',
    choosePlayerToExecute: 'Elige un jugador para ejecutar',
    giustiziereChoosePlayerDescription: 'Ejecutor, elige un jugador para ejecutar (una vez por partida)',
    whoToExecute: '¿A quién quieres ejecutar?',
    execute: 'Ejecutar',
    kill: 'Matar',
    selectTarget: 'Selecciona un objetivo…',
    playersWillBeInvestigatedInOrder: 'Los jugadores serán investigados en este orden',
    discoverWolvesInVillage: 'Descubre cuántos lobos hay en la aldea',
    wolvesInVillage: 'lobos en la aldea',
    confirm: 'Confirmar',
    choosePlayersToInfect: 'Elige jugadores para infectar',
    usageNumber: 'Uso {number}',
    infectUpToPlayers: 'Infecta hasta {count} jugador(es)',
    allAlivePlayersAlreadyInfected: '¡Todos los jugadores vivos ya están infectados!',
    confirmInfection: 'Confirmar infección ({current}/{max})',
    powerNotUsedDueToImbalance: 'Poder no utilizado debido a la pérdida de equilibrio entre equipos',
    noTransformation: 'Sin transformación',
    transformed: 'se transformó',
    transformedPlural: 'se transformaron',
    newRole: 'Nuevo rol',
    target: 'Objetivo',
    hasBlocked: 'ha bloqueado',
    noPlayerBlocked: 'Ningún jugador bloqueado',
    noInvestigationPerformed: 'Ninguna investigación realizada',
    lupoCiecoChoseNotToInvestigate: 'El Lobo Ciego eligió no investigar a nadie',
    investigatedPlayers: 'Jugadores Investigados',
    wolvesFound: 'Lobos encontrados',
    noInfectionPerformed: 'Ninguna infección realizada',
    parassitaChoseNotToInfect: 'El Parásito eligió no infectar a nadie',
    infectedPlayers: 'Jugadores Infectados',
    choosePlayerToInsinuate: 'Elige un jugador para insinuar',
    choosePlayerToInsinuateDescription: 'Elige un jugador y cambia su facción visible',
    whoToInsinuate: '¿A quién quieres insinuar?',
    youChose: 'Elegiste',
    selectRole: 'Selecciona un rol…',
    selectBetweenPlayers: 'Selecciona entre {min} y {max} jugadores',
    selectedPlayers: 'Seleccionados ({count}):',
    clear: 'Limpiar',
    selectAtLeastPlayers: 'Selecciona al menos {count} jugador{count !== 1 ? "es" : ""}',
    yes: 'Sí',
    no: 'No',
    selectPlayerAndRole: 'Selecciona jugador y rol',
    player: 'Jugador',
    role: 'Rol',
    powerOncePerGame: 'Puedes usar este poder solo una vez por partida',
    chooseTargetForWolves: 'Elige un objetivo para que los lobos devoren',
    chooseTargetToRedirect: 'Elige un objetivo para redirigir los ataques de los lobos',
    ammaestratoreDescription: 'Si eliges un lobo, nadie morirá. Si eliges otro jugador, morirá en lugar del objetivo original.',
    selectPlayerToRevealRole: 'Selecciona un jugador para que vea su rol nuevamente',
    whoToReveal: '¿A quién quieres revelar el rol?',
    revealRole: 'Revelar rol'
  },
  factionComparison: {
    before: 'Antes:',
    after: 'Después:'
  },
  promptMessages: {
    firstNightSkipped: {
      title: 'La primera noche es tranquila. Los efectos son ignorados.',
      buttonText: 'Saltar'
    },
    dead: {
      title: 'Todos los jugadores con este rol están muertos',
      subtitle: 'No pueden usar su rol esta noche',
      buttonText: 'Continuar'
    },
    alive: {
      title: 'Los jugadores con este rol están vivos',
      subtitle: 'Deben estar muertos para usar su rol',
      buttonText: 'Continuar'
    },
    blocked: {
      title: 'Todos los jugadores con este rol están bloqueados',
      subtitle: 'Alguien ha bloqueado su rol',
      buttonText: 'Continuar'
    },
    startNight: {
      title: 'Aún no es el momento',
      buttonText: 'Continuar'
    },
    usageLimit: {
      title: 'Límite de uso alcanzado',
      subtitle: 'Este rol ya ha sido usado el número máximo de veces',
      buttonText: 'Continuar'
    },
    noAction: {
      title: 'No se requiere acción para este rol',
      buttonText: 'Continuar'
    }
  },
  resolveDetails: {
    target: 'Objetivo',
    confirmKill: 'Confirmar muerte',
    confirmMayor: 'Confirmar Alcalde',
    confirmLynch: 'Confirmar linchamiento',
    whoToReveal: '¿A quién quieres revelar el rol?',
    revealRole: 'Revelar rol',
    selectPlayerToRevealRole: 'Selecciona un jugador para que vea su rol nuevamente',
    checkFaction: 'Verifica la facción de un jugador',
    discovered: 'Descubrió que',
    noWolfAttacksToRedirect: 'No hay ataques de lobos para redirigir',
    chooseTargetForWolves: 'Elige un objetivo para que los lobos devoren',
    chooseTargetToRedirect: 'Elige un objetivo para redirigir los ataques de los lobos',
    ammaestratoreDescription: 'Si eliges un lobo, nadie morirá. Si eliges otro jugador, morirá en lugar del objetivo original.',
    powerAlreadyUsed: 'Ya has usado tu poder en esta partida.',
    kill: 'Matar',
    powerOncePerGame: 'Podrás usar este poder solo una vez por partida',
    choosePlayerToIllusion: 'Elige un jugador para ilusionar',
    illusionistaDescription: 'El jugador elegido no podrá usar su habilidad esta noche',
    choosePlayerToInsinuate: 'Elige un jugador para insinuar',
    choosePlayerToInsinuateDescription: 'Elige un jugador para insinuar esta noche.',
    whoToInsinuate: '¿A quién quieres insinuar?',
    youChose: 'Elegiste:',
    chooseThreeAdjacentPlayers: 'Elige tres jugadores adyacentes para investigar',
    chooseFirstPlayerToInvestigate: 'Elige el primer jugador para investigar',
    nextTwoPlayersAutoSelected: 'Los siguientes 2 jugadores contiguos serán seleccionados automáticamente',
    selectPlayerToSeeThree: 'Selecciona un jugador para ver los 3 investigados',
    playersSelectedForInvestigation: 'Jugadores seleccionados para la investigación',
    wolfFoundInInvestigation: '¡Hay al menos un lobo entre los jugadores investigados!',
    noWolfInInvestigation: 'No hay lobos entre los jugadores investigados.',
    confirmInvestigation: 'Confirmar investigación',
    notEnoughPlayersToInvestigate: 'No hay suficientes jugadores para investigar',
    cannotSelectThreeAdjacent: 'No se pueden seleccionar 3 jugadores contiguos sin incluirte a ti mismo',
    skipInvestigation: 'Saltar investigación',
    allWolvesDeadCanKill: '¡Todos los lobos están muertos! Ahora también pueden matar a alguien',
    chooseTargetToEliminate: 'Elige un objetivo para eliminar',
    investigatedPlayers: 'Jugadores Investigados',
    investigationResult: 'Resultado de Investigación',
    wolvesFound: 'Lobos Encontrados',
    infectedPlayers: 'Jugadores Infectados',
    noInvestigationPerformed: 'Ninguna investigación realizada',
    lupoCiecoChoseNotToInvestigate: 'El Lobo Ciego eligió no investigar a nadie',
    noInfectionPerformed: 'Ninguna infección realizada',
    parassitaChoseNotToInfect: 'El Parásito eligió no infectar a nadie',
    transformedInto: 'se transformó en',
    copiedRole: 'Rol Copiado',
    copiedPlural: 'copiaron',
    copied: 'copió',
    copiedActionResult: 'resultado de acción copiada',
    copiedAction: 'acción copiada',
    noActionTaken: 'Ninguna acción tomada',
    copiedRoleNoEffect: 'rol copiado sin efecto',
    copiedRoleChoseNotToUse: 'eligió no usar',
    copiedRoleCannotBeUsed: 'no puede ser usado',
    insinuated: 'insinuó',
    noPlayerInsinuated: 'Ningún jugador insinuado',
    sawPlural: 'vieron',
    saw: 'vio',
    playsFor: 'juega para',
    hadRole: 'tenía el rol',
    chose: 'eligió',
    correct: 'correcto',
    wrong: 'incorrecto',
    noDeclaration: 'Ninguna declaración',
    attacked: 'atacó',
    attackedPlural: 'atacaron',
    noAttack: 'Ningún ataque',
    wolvesChoseNotToAttack: 'Los lobos eligieron no atacar',
    wolves: 'Lobos',
    targets: 'Objetivos',
    noTransformation: 'Sin transformación',
    newRole: 'Nuevo rol',
    executed: 'ejecutó',
    protected: 'protegió',
    ammaestratore: 'Domador',
    barabba: 'Barrabás',
    angelo: 'Ángel',
    resuscitato: 'Resucitado',
    blockedAttacks: 'bloqueó los ataques',
    redirectedAttacksTo: 'redirigió los ataques hacia',
    killed: 'mató',
    resurrected: 'resucitó'
  },

  // Start night prompt
  startNightPrompt: {
    title: 'Aún no es el momento',
    description: 'Este rol puede usarse a partir de la noche {night}',
    buttonText: 'Continuar'
  },

  // Forms
  forms: {
    playerPlaceholder: 'Jugador {number}'
  },

  // Phase Reveal
  // Event History
  eventHistory: {
    title: 'Historial de Eventos',
    noEvents: 'Ningún evento registrado',
    playerDied: '{player} murió',
    playerLynched: '{player} fue linchado',
    playerProtected: '{player} fue protegido',
    playerBlocked: '{player} fue bloqueado',
    roleRevealed: 'Rol revelado: {role}',
    gameStarted: 'Partida iniciada',
    nightStarted: 'Noche {number} iniciada',
    dayStarted: 'Día {number} iniciado',
    day: 'Día {day}',
    night: 'Noche {night}',
    results: 'Resultados',
    deaths: 'Muertes',
    deathsCount: '{count} muertes',
    noDeaths: 'Sin muertes',
    peacefulNight: 'La noche fue tranquila',
    nightDetails: 'Detalles nocturnos',
    voting: 'Votación',
    lynching: 'Linchamiento',
    noLynching: 'Sin linchamiento'
  },

  // Win Conditions
  winConditions: {
    villageWins: '¡La Aldea gana!',
    wolvesWins: '¡Los Lobos ganan!',
    werewolvesWins: '¡Los Hombres Lobo ganan!',
    madWins: '¡Los Locos ganan!',
    parasiteWins: '¡El Parásito gana!',
    aliensWins: '¡Los Alienígenas ganan!',
    gameEnded: 'Partida terminada'
  },

  // Win Results
  winResults: {
    title: 'Fin de partida',
    battleEnded: 'La batalla ha terminado',
    noWinner: 'Nadie ganó esta batalla',
    events: 'Eventos',
    newGame: 'Nueva partida'
  },

  // Win Logic
  winLogic: {
    tie: 'Empate, todos están muertos',
    teamWins: '{team} gana',
    teamsWin: '{teams} ganan'
  },

  // Role Details
  roleDetails: {
    target: 'Objetivo',
    completeRoleDetails: 'Detalles completos del rol',
    description: 'Descripción',
    detailedDescription: 'Descripción Detallada',
    factionInformation: 'Información de Facción',
    realFaction: 'Facción Real',
    realFactionDesc: 'La facción a la que realmente pertenece',
    howItAppears: 'Cómo Aparece',
    howItAppearsDesc: 'Cómo aparece a otros jugadores',
    countsAs: 'Cuenta Como',
    countsAsDesc: 'Facción para la que cuenta en las condiciones de victoria',
    roleRequiresDead: 'Este rol requiere estar muerto para ser utilizado.',
    roleRequiresAlive: 'Este rol requiere que estés vivo para ser utilizado.',
    roleNotUsable: 'Rol no utilizable',
    powerNotAvailable: 'Poder no disponible',
    roleCopiedSuccessfully: 'Rol copiado exitosamente',
    copiedRole: 'Rol copiado',
    gameMechanics: 'Mecánicas de Juego',
    abilitiesAndFeatures: 'Habilidades y Características',
    effectType: 'Tipo de Efecto',
    required: 'Obligatorio - debe usar la habilidad',
    optional: 'Opcional - puede elegir usar la habilidad',
    usage: 'Uso',
    unlimited: 'Ilimitado',
    once: 'Una vez - puede actuar solo una vez por partida',
    times: 'veces',
    timesPerGame: 'por partida',
    notSpecified: 'No especificado',
    actsAtNight: 'Actúa en la Noche',
    always: 'Siempre actúa en la noche',
    whenAlive: 'Actúa en la noche cuando está vivo',
    whenDead: 'Actúa en la noche cuando está muerto',
    never: 'Nunca actúa en la noche',
    startNight: 'Noche de Inicio',
    fromNight: 'Desde la noche',
    canTargetDead: 'Puede apuntar a jugadores muertos',
    affects: 'Afecta',
    knownTo: 'Conocido por',
    winCondition: 'Condición de Victoria',
    specificRoleCondition: 'Condición específica del rol',
    playerCount: 'Número de Jugadores',
    minCount: 'Conteo Mínimo',
    maxCount: 'Conteo Máximo',
    roleNotFound: 'El rol solicitado no existe o no está disponible.',
    roleNotFoundTitle: 'Rol no encontrado',
    roleNotFoundSubtitle: 'Error al buscar el rol',
    backToRoles: 'Volver a los roles',
    unknown: 'Desconocido',
    firstNight: '1ª noche',
    nightOrdinal: 'ª noche',
    nightAction: 'Acción Nocturna',
    revealedToAllies: 'Revelado a los aliados',
    roleName: 'Nombre del rol',
    factionOnly: 'Solo facción',
    maxUsageReached: 'Este rol ya ha sido utilizado el número máximo de veces permitido.',
    cannotUsePowerDying: 'No puedes usar tu poder porque estás muriendo debido a la pérdida de equilibrio entre equipos.',
    selectedPlayerBlocked: 'El jugador seleccionado está bloqueado y no puede usar su rol.',
    selectedPlayerDead: 'El jugador seleccionado está muerto y no puede usar su rol.',
    roleCannotBeUsedAtNight: 'Este rol no puede ser utilizado durante la noche.',
    roleCanOnlyBeUsedFromNight: 'Este rol solo puede ser utilizado a partir de la noche {night}.',
    roleBlockedByOther: 'Este rol está bloqueado por otro jugador o tiene otras restricciones.',
    roleCannotBeUsedUnknown: 'Este rol no puede ser utilizado por razones desconocidas.',
    powerBlockedDueToImbalance: 'Tu poder está bloqueado debido a la pérdida de equilibrio entre equipos',
    copyAnotherPlayerPower: 'Copia el poder de otro jugador para esta noche',
    cannotUsePowerDyingShort: 'No puedes usar tu poder porque estás muriendo',
    selectedRoleCannotBeUsed: 'El rol seleccionado no puede ser utilizado',
    hasBlocked: 'ha bloqueado',
    transformed: 'se transformó',
    transformedPlural: 'se transformaron',
    newRole: 'Nuevo rol'
  },


  // Faction win conditions
  factionWinConditions: {
    villaggio: 'Los aldeanos ganan cuando todos los lobos han sido eliminados',
    lupi: 'Los lobos ganan cuando alcanzan paridad numérica con los aldeanos o los superan',
    mannari: 'El hombre lobo gana si solo quedan dos jugadores (él y otro jugador)',
    matti: 'El loco gana si es eliminado durante el día (votación)',
    parassita: 'El parásito gana cuando todos los jugadores vivos están infectados',
    alieni: 'Los alienígenas ganan cuando permanecen vivos con el mismo número de jugadores para cada equipo'
  },

  // New roles popup
  newRoles: {
    title: '¡Nuevos Roles Disponibles!',
    description: '¡Han llegado nuevos roles a la aldea! Esto es lo que hay de nuevo:',
    gotIt: '¡Perfecto!'
  },

  // Genio role
  genio: {
    chooseRole: 'Elige uno de los tres roles disponibles para transformarte',
    chooseRoleDescription: 'Elige uno de los tres roles disponibles para transformarte'
  },
  phaseResolve: {
    title: 'Resolución de Noche',
    nightResults: 'Anuncios por hacer',
    deaths: 'Muertes',
    player: 'jugador',
    players: 'jugadores',
    noDeaths: 'Sin muertes',
    peacefulNight: 'La noche fue tranquila',
    resurrected: 'Resucitados',
    details: 'Detalles',
    hide: 'Ocultar',
    continue: 'Continuar',
    resolving: 'Resolviendo…',
    reloadHelp: 'Recarga para iniciar una nueva partida desde el menú principal'
  },
  roleComparison: {
    declared: 'Declarado:'
  },
  dayPhase: {
    day: 'Día',
    selectPlayer: 'Seleccionar jugador',
    electMayor: 'Elegir Alcalde',
    mayorVoteDescription: 'El voto del elegido contará como 2 por el resto de la partida.',
    whoToElectAsMayor: '¿A quién quieres elegir como Alcalde?',
    firstDayLynchSkipped: 'El linchamiento del primer día fue saltado',
    goToNight: 'Ir a la noche',
    selectPlayerToLynch: 'Selecciona el jugador para linchar',
    timeToVote: 'Es hora de votar. Después de votar, selecciona quién fue linchado.',
    whoToLynch: '¿A quién quieres linchar?'
  },
  preNightPhase: {
    night: 'Noche',
    askPlayersToCloseEyes: 'Pide a todos los jugadores que cierren los ojos',
    whenReadyProceed: 'Cuando todos estén listos, procede a la fase nocturna',
    alivePlayersAndRoles: 'Jugadores vivos y sus roles',
    startNight: 'Iniciar Noche',
    reloadHelp: 'Recarga para iniciar una nueva partida desde el menú principal',
    unknown: 'Desconocidos'
  },
  mediumPrompt: {
    selectDeadPlayer: 'Selecciona un jugador muerto…',
    chooseDeadPlayer: 'Elige un jugador muerto para investigar',
    checkDeadPlayerFaction: 'Verifica la facción de un jugador muerto',
    noDeadPlayers: 'No hay jugadores muertos para investigar',
    continue: 'Continuar',
    whoToCheck: '¿A quién quieres verificar?',
    discovered: 'Descubrió que'
  }
}
