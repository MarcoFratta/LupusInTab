export default {
  // Top-level keys
  Execute: 'Execute',
  Resurrect: 'Resurrect',
  'Confirm selection': 'Confirm selection',
  
  // Navigation
  nav: {
    home: 'Home',
    roles: 'Roles',
    players: 'Players',
    settings: 'Settings'
  },

  // Common UI
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    start: 'Start',
    configure: 'Configure',
    resume: 'Resume',
    ignore: 'Ignore',
    skip: 'Skip',
    continue: 'Continue',
    reset: 'Reset',
    quit: 'Quit',
    refresh: 'Refresh',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    execute: 'Execute',
    none: 'None',
    unknown: 'Unknown'
  },

  // Game phases
  phases: {
    setup: 'Setup',
    reveal: 'Reveal',
    preNight: 'Pre-Night',
    night: 'Night',
    day: 'Day',
    end: 'End'
  },

  // Setup page
  setup: {
    title: 'Configuration',
    balance: 'Balance',
    weakestFaction: 'Weakest faction',
    startGame: 'Start',
    configureGame: 'Configure',
    duplicateNames: 'Resolve duplicate names to start the game',
    roles: 'Roles',
    players: 'Players',
    settings: 'Settings',
    enabled: 'Enabled',
    disabled: 'Disabled'
  },

  // Players management
  players: {
    title: 'Player Management',
    subtitle: 'Enter names in the same order as you are positioned',
    players: 'Players',
    player: 'Player',
    addPlayer: 'Add',
    reset: 'Reset',
    removePlayer: 'Remove player',
    moveUp: 'Move player up',
    moveDown: 'Move player down',
    nameErrors: 'Resolve name errors to continue',
    duplicateName: 'Duplicate name',
    nameTooLong: 'Name too long (max 15 characters)',
    placeholder: 'Player {number}'
  },

  // Roles management
  roles: {
    title: 'Select Roles',
    subtitle: 'Choose which roles are available in this game. Villagers and Wolves are always enabled.',
    details: 'Details',
    always: 'Always',
    roles: 'roles',
    role: 'role',
    creditPrefix: 'Some roles come from',
    creditLabel: 'Lupus in Forum'
  },

  // Settings page
  settings: {
    title: 'Settings',
    language: 'Language',
    selectLanguage: 'Select language',
    languageDescription: 'Choose the user interface language',
    gameOptions: 'Game Options',
    supportProject: 'Support the Project',
    buyCoffee: 'Buy me a coffee',
    buyCoffeeDescription: 'If you like the project, consider supporting it with a donation to keep the project active.',
    offerCoffee: 'Buy me a coffee',
    contributeGitHub: 'Contribute on GitHub',
    contributeGitHubDescription: 'Star the project and report any issues or suggestions for improvements.',
    starProject: 'Star the project',
    reportIssue: 'Report an issue',
    version: 'Version',
    skipFirstNight: 'Skip first night actions',
    skipFirstNightDescription: 'All roles are called on Night 1, but their effects are ignored.',
    enableMayor: 'Enable Mayor',
    enableMayorDescription: 'The mayor\'s vote counts double during voting when alive.',
    discussionTimer: 'Discussion timer',
    discussionTimerDescription: 'Shows a compact timer in the lynching phase for discussion (max 60 minutes).',
    maxDifficulty: 'Maximum Difficulty',
    maxDifficultyDescription: 'Requires more specific role declarations. E.g.: The Executioner must declare "Fat Wolf" instead of "Wolf" to kill a Fat Wolf.'
  },

  // Game state
  game: {
    gameInProgress: 'Game in progress',
    savedGame: 'You have a saved game that you can resume',
    noResult: 'No result',
    noDetailsAvailable: 'No details available',
    canOpenEyes: 'Can open their eyes:',
    chooseVictim: 'Choose a victim to devour tonight',
    whoToEliminate: 'Who do you want to eliminate?',
    confirmSelection: 'Confirm selection'
  },

  // Role blocking reasons
  blocking: {
    blocked: 'Someone blocked their role',
    dead: 'Cannot use the role',
    alive: 'Must be dead to act',
    startNight: 'You can use your role starting from night {night}',
    usageLimit: 'You have already used this role the maximum number of times',
    default: 'Cannot use the role this night'
  },

  // Teams
  teams: {
    village: 'Village',
    wolves: 'Wolves',
    werewolves: 'Werewolves',
    mad: 'Mad',
    parasite: 'Parasite',
    aliens: 'Aliens'
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
      title: 'You are dead',
      subtitle: 'You can no longer participate in the game',
      buttonText: 'Continue'
    },
    blocked: {
      title: 'Role blocked',
      subtitle: 'Someone prevented your action',
      buttonText: 'Continue'
    },
    alive: {
      title: 'You are alive',
      subtitle: 'You can participate in the game',
      buttonText: 'Continue'
    },
    startNight: {
      title: 'Start the night',
      subtitle: 'All roles can act',
      buttonText: 'Start'
    },
    usageLimit: {
      title: 'Limit reached',
      subtitle: 'You have already used this role the maximum number of times',
      buttonText: 'Continue'
    },
    yesNo: {
      yes: 'Yes',
      no: 'No'
    }
  },

  // Role states
  roleStates: {
    alive: 'alive',
    dead: 'dead',
    blocked: 'blocked',
    player: 'Player'
  },

  // Game constants
  gameConstants: {
    canOpenEyes: 'Can open their eyes:',
    chooseVictim: 'Choose a victim to devour tonight',
    whoToEliminate: 'Who do you want to eliminate?',
    confirmSelection: 'Confirm selection',
    noResult: 'No result',
    noDetailsAvailable: 'No details available'
  },

  // Role names and descriptions
  roleNames: {
    lupo: 'Wolf',
    veggente: 'Seer',
    guardia: 'Guard',
    boia: 'Hangman',
    giustiziere: 'Executioner',
    angelo: 'Angel',
    barabba: 'Barabbas',
    bugiardo: 'Liar',
    genio: 'Genius',
    illusionista: 'Illusionist',
    indemoniato: 'Possessed',
    insinuo: 'Insinuator',
    lupomannaro: 'Werewolf',
    massone: 'Mason',
    matto: 'Mad',
    medium: 'Medium',
    misspurple: 'Miss Purple',
    muccamannara: 'Werecow',
    mutaforma: 'Shapeshifter',
    parassita: 'Parasite',
    simbionte: 'Symbiont',
    villico: 'Villager',
    lupoCieco: 'Blind Wolf',
    lupoCiccione: 'Fat Wolf',
    ammaestratore: 'Trainer'
  },

  // Role descriptions
  roleDescriptions: {
    lupo: 'The wolf devours a player every night.',
    veggente: 'Every night can check a player\'s faction.',
    guardia: 'Every night can protect a player from wolves.',
    boia: 'Can kill a player by correctly declaring their role.',
    giustiziere: 'Can kill a player during the night once per game.',
    angelo: 'Once per game can resurrect a dead player.',
    barabba: 'When dead, can take a player with him to the afterlife.',
    bugiardo: 'Can investigate dead players to discover their roles.',
    genio: 'Can transform into another player\'s role once per game.',
    illusionista: 'Can block a player\'s ability during the night.',
    indemoniato: 'A villager who plays for the wolves.',
    insinuo: 'During the night, can change a player\'s faction in the eyes of those who investigate them.',
    lupomannaro: 'Plays alone. Every night can kill a player by correctly declaring their role. Cannot be killed by wolves.',
    massone: 'Knows the identity of other masons.',
    matto: 'Wins if lynched.',
    medium: 'Can investigate a dead player to discover their faction.',
    misspurple: 'Every night discovers how many players that appear as wolves are alive.',
    muccamannara: 'Plays alone. Knows the wolves and appears as a wolf. Cannot be killed by wolves.',
    mutaforma: 'Every night can copy another player\'s role.',
    parassita: 'Infects other players and wins when all are infected.',
    simbionte: 'Must transform into another player\'s role at the start of the game.',
    villico: 'A village inhabitant with no special powers.',
    lupoCieco: 'A wolf that investigates three adjacent players every night. Does not know the other wolves.',
    lupoCiccione: 'A wolf that makes players adjacent to him appear as wolves.',
    ammaestratore: 'Can redirect the wolves\' target from the 2nd night, once per game.',
    lupoLong: `The Wolf is the most feared role in the game, every night must choose a victim to devour.

HOW IT WORKS:
• Every night must choose a victim to kill
• Can kill any living player
• The victim dies at dawn`,
    veggenteLong: `The Seer is the village investigator, capable of discovering players' factions.

HOW IT WORKS:
• Every night can choose a player to investigate
• Discovers the faction of that player (as it appears to others)`,
    guardiaLong: `The Guard is the village protector, capable of saving innocent lives.

HOW IT WORKS:
• Every night can choose a player to protect
• The protected player cannot be killed by wolves that night

CUSTOMIZATION:
This is a generic role that can be adapted to different playstyles:
• Can protect themselves
• Cannot protect the same player twice in a row`,
    boiaLong: `The Hangman works for the wolves.
    Once per game can kill another player by correctly declaring their role.
    If the declaration is wrong, the Hangman dies.

HOW IT WORKS:
• Is seen as a wolf
• During the night can declare a player's role
• If the declaration is correct, the player dies
• If the declaration is wrong, the Hangman dies
• Can act only once per game`,
    giustiziereLong: `The Executioner is the village avenger, capable of executing the guilty.

HOW IT WORKS:
• During the night can choose a player to execute
• The action cannot be stopped
• Can execute only once per game`,
    massoneLong: `The Mason is a member of a secret society that knows other members.

HOW IT WORKS:
• Knows the identity of other masons`,
    villicoLong: `The Villager is a common citizen without special powers, but with the right to vote.

HOW IT WORKS:
• Has no special powers`,
    angeloLong: `The Angel is a divine being capable of resurrecting the dead.

HOW IT WORKS:
• Can resurrect a dead player
• The action can be used only once per game
• The resurrected player returns to the game with their original role`,
    barabbaLong: `When dead, can take a player with him to the afterlife.

HOW IT WORKS:
• Can kill a player during the night when dead
• The action can be used only once per game`,
    mattoLong: `The Madman is a villager who wins if lynched by the village.

HOW IT WORKS:
• Wins immediately if lynched
• Has no other special powers
• Must convince the village to lynch him`,
    lupomannaroLong: `The Werewolf is a wolf that can kill players by correctly declaring their role.
    Plays alone and cannot be killed by wolves.
    Wins if survives until the end of the game.

HOW IT WORKS:
• Cannot be killed by wolves
• Can kill a player by declaring their role
• If the declaration is correct, the player dies
• If the declaration is wrong, no one dies`,
    muccamannaraLong: `The Werecow plays alone. Knows the wolves and appears as a wolf.
    Wins if survives until the end of the game.

HOW IT WORKS:
• Cannot be killed by wolves
• Appears as a wolf when investigated
• Can confuse investigations`,
    indemoniatoLong: `The Possessed is a villager who plays for the wolves.

HOW IT WORKS:
• Behaves like a normal villager
• Must help the wolves win even if they don't know who they are`,
    insinuoLong: `The Insinuator works for the wolves. Can change a player's faction in the eyes
    of other players who investigate them.

HOW IT WORKS:
• Every night can choose a player to "insinuate"
• Changes the visible faction of the chosen player, if they were a wolf they appear as villager, if they were a villager they appear as wolf
• The effect lasts for one night
• Can confuse investigations`,
    illusionistaLong: `The Illusionist plays for the wolves. Can block another player's ability.

HOW IT WORKS:
• Every night can choose a player to block
• The blocked player cannot use their ability that night
• The effect lasts for one night
• If there is another living player with the same role as the blocked player,
  those players can still use their ability`,
    genioLong: `The Genius can transform into another role chosen from three at random.
    Can use this power only once per game, starting from the third night.

HOW IT WORKS:
• Can choose a role from three at random (chosen by the narrator)
• The action can be used only once per game`,
    parassitaLong: `The Parasite wins if they manage to infect all living players.

HOW IT WORKS:
• The first night can infect up to 3 players
• The second night can infect up to 2 players
• From the third night onwards, can infect 1 player
• Wins if all other living players are infected`,
    simbionteLong: `The Symbiont assumes another player's role. The first night must
    choose a player and immediately assume their role.

HOW IT WORKS:
• Must choose a player and assume their role
• The action can be used only once per game`,
    mutaformaLong: `The Shapeshifter is an alien who, every night, can copy another player's role.

HOW IT WORKS:
• Can choose a player and copy their role for that night
• Copies all powers of the chosen role`,
    misspurpleLong: `Miss Purple is a villager who, every night, discovers how many players
    that appear as wolves are alive.

HOW IT WORKS:
• Every night discovers how many players that appear as wolves are alive`,
    bugiardoLong: `The Liar works for the wolves. Once per game can discover the role
    of a dead player.

HOW IT WORKS:
• Can investigate dead players
• Discovers the role of a dead player
• Can help the wolves by pretending to have the discovered role`,
    ammaestratoreLong: `The Trainer can train the wolves and force them to devour a victim chosen by him.
    If the trainer chooses a wolf as victim, no one dies.
    If he chooses another player, they die instead of the wolves' original target.

HOW IT WORKS:
• Can choose a target for wolf attacks
• If chooses a wolf, no one dies
• If chooses another player, they die instead of the original target`,
    lupoCiccioneLong: `The Fat Wolf is a wolf that makes adjacent players appear as wolves.

HOW IT WORKS:
• Behaves like a normal wolf, so opens eyes with wolves
• Makes the first two living players to his left and right appear as wolves
• Can confuse investigations`,
    lupoCiecoLong: `The Blind Wolf is a solitary wolf who doesn't know the other wolves.
    The other wolves don't know him. Can investigate three adjacent players and discover if
    there is at least one wolf among the three.

HOW IT WORKS:
• Every night investigates three adjacent players
• Discovers if there is at least one wolf among the three
• If all wolves are dead, can also kill like a normal wolf`,
    mediumLong: `The Medium can communicate with dead players to obtain information.

HOW IT WORKS:
• Every night can choose a dead player to communicate with
• Discovers which team the dead player played for`
  },

  // Faction names
  factions: {
    village: 'Village',
    wolves: 'Wolves',
    werewolves: 'Werewolves',
    mad: 'Mad',
    parasite: 'Parasite',
    aliens: 'Aliens',
    villaggio: 'Village',
    lupi: 'Wolves',
    mannari: 'Werewolves',
    matti: 'Mad',
    parassita: 'Parasite',
    alieni: 'Aliens'
  },

  // Game phases detailed
  gamePhases: {
    setup: {
      title: 'Setup',
      description: 'Configure players, roles and game options'
    },
    reveal: {
      title: 'Reveal',
      description: 'Players discover their roles'
    },
    night: {
      title: 'Night',
      description: 'Night roles can act'
    },
    day: {
      title: 'Day',
      description: 'Discussion and voting for lynching'
    },
    resolve: {
      title: 'Resolve',
      description: 'Results of night actions'
    },
    end: {
      title: 'Game Over',
      description: 'The game has ended'
    }
  },

  // Role prompts
  rolePrompts: {
    selectPlayer: 'Select a player…',
    whoToCheck: 'Who do you want to check?',
    whoToInvestigate: 'Who do you want to investigate?',
    whoToProtect: 'Who do you want to protect?',
    whoToBlock: 'Who do you want to block?',
    whoToResurrect: 'Who do you want to resurrect?',
    selectDeadPlayer: 'Select a dead player',
    confirmSelection: 'Confirm selection',
    confirmMayor: 'Confirm Mayor',
    confirmLynch: 'Confirm lynching',
    investigatePlayer: 'Choose a player to investigate',
    checkFaction: 'Check a player\'s faction',
    discovered: 'Discovered that',
    protectPlayer: 'Choose a player to protect tonight',
    chooseTarget: 'Choose a target',
    choosePlayerToKill: 'Choose a player to kill (once per game)',
    choosePlayerToBlock: 'Select a player to block',
    choosePlayerToCopy: 'Choose a player to copy their role',
    choosePlayerToTransform: 'Choose a player to assume their role',
    choosePlayerToIllusion: 'Choose a player to create an illusion for',
    illusionistaDescription: 'Create an illusion that will appear as a different role to other players',
    chooseThreeAdjacentPlayers: 'Choose three adjacent players to investigate',
    chooseFirstPlayerToInvestigate: 'Choose the first player to investigate',
    nextTwoPlayersAutoSelected: 'The next two players will be automatically selected',
    selectPlayerToSeeThree: 'Select a player to see three adjacent players',
    confirmInvestigation: 'Confirm investigation',
    playersSelectedForInvestigation: 'Players selected for investigation',
    wolfFoundInInvestigation: 'Wolf found in investigation',
    noWolfInInvestigation: 'No wolf found in investigation',
    whoToKill: 'Who do you want to kill?',
    whoFirstInvestigated: 'Who will be the first player investigated?',
    selectPlayerPlaceholder: 'Select a player...',
    powerUnavailable: 'Power unavailable - Team unbalanced',
    powerBlocked: 'Power blocked',
    copyRole: 'Copy Role',
    choosePlayerAndGuessRole: 'Choose a player and try to guess their role',
    condemnPlayerOrRevealRole: 'Condemn a player or reveal a role',
    chooseDeadPlayerToResurrect: 'Choose a dead player to resurrect',
    angeloChooseDeadPlayerDescription: 'Angel, choose a dead player to bring back to life (once per game)',
    alreadyUsedPower: 'You have already used your power in this game',
    noDeadPlayersToResurrect: 'No dead players to resurrect',
    resurrect: 'Resurrect',
    continue: 'Continue',
    chooseAnotherRole: 'Choose another role',
    continueWithoutPower: 'Continue without power',
    backToSelection: 'Back to selection',
    reshuffleRoles: 'Reshuffle roles',
    chooseDeadPlayerToInvestigate: 'Choose a dead player to investigate',
    investigateDeadPlayerDescription: 'Investigate a dead player to discover their real role',
    powerOncePerGameFromNight2: 'You can use this power only once per game, starting from night 2',
    canUsePowerFromNight2: 'You can use this power from night 2',
    investigationResult: 'Investigation result',
    hadRole: 'had the role',
    skip: 'Skip',
    choosePlayerToExecute: 'Choose a player to execute',
    giustiziereChoosePlayerDescription: 'Executioner, choose a player to execute (once per game)',
    whoToExecute: 'Who do you want to execute?',
    execute: 'Execute',
    kill: 'Kill',
    selectTarget: 'Select a target…',
    playersWillBeInvestigatedInOrder: 'Players will be investigated in this order',
    discoverWolvesInVillage: 'Discover how many wolves are in the village',
    wolvesInVillage: 'wolves in the village',
    confirm: 'Confirm',
    choosePlayersToInfect: 'Choose players to infect',
    usageNumber: 'Usage {number}',
    infectUpToPlayers: 'Infect up to {count} player(s)',
    allAlivePlayersAlreadyInfected: 'All alive players are already infected!',
    confirmInfection: 'Confirm infection ({current}/{max})',
    powerNotUsedDueToImbalance: 'Power not used due to team balance loss',
    noTransformation: 'No transformation',
    transformed: 'transformed',
    transformedPlural: 'transformed',
    newRole: 'New role',
    target: 'Target',
    hasBlocked: 'has blocked',
    noPlayerBlocked: 'No player blocked',
    noInvestigationPerformed: 'No investigation performed',
    lupoCiecoChoseNotToInvestigate: 'The Blind Wolf chose not to investigate anyone',
    investigatedPlayers: 'Investigated Players',
    wolvesFound: 'Wolves found',
    noInfectionPerformed: 'No infection performed',
    parassitaChoseNotToInfect: 'The Parasite chose not to infect anyone',
    infectedPlayers: 'Infected Players',
    choosePlayerToInsinuate: 'Choose a player to insinuate',
    choosePlayerToInsinuateDescription: 'Choose a player and change their visible faction',
    whoToInsinuate: 'Who do you want to insinuate?',
    youChose: 'You chose',
    selectRole: 'Select a role…',
    selectBetweenPlayers: 'Select between {min} and {max} players',
    selectedPlayers: 'Selected ({count}):',
    clear: 'Clear',
    selectAtLeastPlayers: 'Select at least {count} player{count !== 1 ? "s" : ""}',
    yes: 'Yes',
    no: 'No',
    selectPlayerAndRole: 'Select player and role',
    player: 'Player',
    role: 'Role',
    powerOncePerGame: 'You can use this power only once per game',
    chooseTargetForWolves: 'Choose a target for the wolves to devour',
    chooseTargetToRedirect: 'Choose a target to redirect wolf attacks',
    ammaestratoreDescription: 'If you choose a wolf, no one will die. If you choose another player, they will die instead of the original target.',
    whoToReveal: 'Who do you want to reveal the role to?',
    revealRole: 'Reveal role',
    selectPlayerToRevealRole: 'Select a player to let them see their role again'
  },
  factionComparison: {
    before: 'Before:',
    after: 'After:'
  },
  promptMessages: {
    firstNightSkipped: {
      title: 'The first night is peaceful. Effects are ignored.',
      buttonText: 'Skip'
    },
    dead: {
      title: 'All players with this role are dead',
      subtitle: 'They cannot use their role this night',
      buttonText: 'Continue'
    },
    alive: {
      title: 'Players with this role are alive',
      subtitle: 'They must be dead to use their role',
      buttonText: 'Continue'
    },
    blocked: {
      title: 'All players with this role are blocked',
      subtitle: 'Someone has blocked their role',
      buttonText: 'Continue'
    },
    startNight: {
      title: 'Not yet the time',
      buttonText: 'Continue'
    },
    usageLimit: {
      title: 'Usage limit reached',
      subtitle: 'This role has already been used the maximum number of times',
      buttonText: 'Continue'
    },
    noAction: {
      title: 'No action required for this role',
      buttonText: 'Continue'
    }
  },
  resolveDetails: {
    target: 'Target',
    confirmKill: 'Confirm kill',
    confirmMayor: 'Confirm Mayor',
    confirmLynch: 'Confirm lynching',
    whoToReveal: 'Who do you want to reveal the role to?',
    revealRole: 'Reveal role',
    checkFaction: 'Check a player\'s faction',
    discovered: 'Discovered that',
    noWolfAttacksToRedirect: 'No wolf attacks to redirect',
    chooseTargetForWolves: 'Choose a target for the wolves to devour',
    chooseTargetToRedirect: 'Choose a target to redirect wolf attacks',
    ammaestratoreDescription: 'If you choose a wolf, no one will die. If you choose another player, they will die instead of the original target.',
    powerAlreadyUsed: 'You have already used your power in this game.',
    kill: 'Kill',
    powerOncePerGame: 'You can use this power only once per game',
    choosePlayerToIllusion: 'Choose a player to illusion',
    illusionistaDescription: 'The chosen player will not be able to use their ability this night',
    choosePlayerToInsinuate: 'Choose a player to insinuate',
    choosePlayerToInsinuateDescription: 'Choose a player to insinuate for this night.',
    whoToInsinuate: 'Who do you want to insinuate?',
    youChose: 'You chose:',
    chooseThreeAdjacentPlayers: 'Choose three adjacent players to investigate',
    chooseFirstPlayerToInvestigate: 'Choose the first player to investigate',
    nextTwoPlayersAutoSelected: 'The next 2 adjacent players will be selected automatically',
    selectPlayerToSeeThree: 'Select a player to see the 3 investigated',
    playersSelectedForInvestigation: 'Players selected for investigation',
    wolfFoundInInvestigation: 'There is at least one wolf among the investigated players!',
    noWolfInInvestigation: 'There are no wolves among the investigated players.',
    confirmInvestigation: 'Confirm investigation',
    notEnoughPlayersToInvestigate: 'Not enough players to investigate',
    cannotSelectThreeAdjacent: 'Cannot select 3 adjacent players without including yourself',
    skipInvestigation: 'Skip investigation',
    allWolvesDeadCanKill: 'All wolves are dead! Now you can also kill someone',
    chooseTargetToEliminate: 'Choose a target to eliminate',
    investigatedPlayers: 'Investigated Players',
    investigationResult: 'Investigation Result',
    wolvesFound: 'Wolves Found',
    infectedPlayers: 'Infected Players',
    noInvestigationPerformed: 'No investigation performed',
    lupoCiecoChoseNotToInvestigate: 'The Blind Wolf chose not to investigate anyone',
    noInfectionPerformed: 'No infection performed',
    parassitaChoseNotToInfect: 'The Parasite chose not to infect anyone',
    transformedInto: 'transformed into',
    copiedRole: 'Copied Role',
    copiedPlural: 'copied',
    copied: 'copied',
    copiedActionResult: 'copied action result',
    copiedAction: 'copied action',
    noActionTaken: 'No action taken',
    copiedRoleNoEffect: 'copied role no effect',
    copiedRoleChoseNotToUse: 'chose not to use',
    copiedRoleCannotBeUsed: 'cannot be used',
    insinuated: 'insinuated',
    noPlayerInsinuated: 'No player insinuated',
    sawPlural: 'saw',
    saw: 'saw',
    playsFor: 'plays for',
    hadRole: 'had the role',
    chose: 'chose',
    correct: 'correct',
    wrong: 'wrong',
    noDeclaration: 'No declaration',
    attacked: 'attacked',
    attackedPlural: 'attacked',
    noAttack: 'No attack',
    wolvesChoseNotToAttack: 'Wolves chose not to attack',
    wolves: 'Wolves',
    targets: 'Targets',
    noTransformation: 'No transformation',
    newRole: 'New role',
    executed: 'executed',
    protected: 'protected',
    ammaestratore: 'Trainer',
    barabba: 'Barabbas',
    angelo: 'Angel',
    resuscitato: 'Resurrected',
    blockedAttacks: 'blocked attacks',
    redirectedAttacksTo: 'redirected attacks to',
    killed: 'killed',
    resurrected: 'resurrected'
  },

  // Start night prompt
  startNightPrompt: {
    title: 'Not yet the time',
    description: 'This role can be used starting from night {night}',
    buttonText: 'Continue'
  },

  // Forms
  forms: {
    playerPlaceholder: 'Player {number}'
  },

  // Phase Reveal
  // Event History
  eventHistory: {
    title: 'Event History',
    noEvents: 'No events recorded',
    playerDied: '{player} died',
    playerLynched: '{player} was lynched',
    playerProtected: '{player} was protected',
    playerBlocked: '{player} was blocked',
    roleRevealed: 'Role revealed: {role}',
    gameStarted: 'Game started',
    nightStarted: 'Night {number} started',
    dayStarted: 'Day {number} started',
    day: 'Day {day}',
    night: 'Night {night}',
    results: 'Results',
    deaths: 'Deaths',
    deathsCount: '{count} deaths',
    noDeaths: 'No deaths',
    peacefulNight: 'The night was peaceful',
    nightDetails: 'Night details',
    voting: 'Voting',
    lynching: 'Lynching',
    noLynching: 'No lynching'
  },

  // Win Conditions
  winConditions: {
    villageWins: 'The Village wins!',
    wolvesWins: 'The Wolves win!',
    werewolvesWins: 'The Werewolves win!',
    madWins: 'The Mad win!',
    parasiteWins: 'The Parasite wins!',
    aliensWins: 'The Aliens win!',
    gameEnded: 'Game ended'
  },

  // Win Results
  winResults: {
    title: 'Game Over',
    battleEnded: 'The battle has ended',
    noWinner: 'No one won this battle',
    events: 'Events',
    newGame: 'New Game'
  },

  // Win Logic
  winLogic: {
    tie: 'Tie, everyone is dead',
    teamWins: '{team} wins',
    teamsWin: '{teams} win'
  },

  // Role Details
  roleDetails: {
    target: 'Target',
    completeRoleDetails: 'Complete role details',
    description: 'Description',
    detailedDescription: 'Detailed Description',
    factionInformation: 'Faction Information',
    realFaction: 'Real Faction',
    realFactionDesc: 'The faction it actually belongs to',
    howItAppears: 'How it Appears',
    howItAppearsDesc: 'How it appears to other players',
    countsAs: 'Counts As',
    countsAsDesc: 'Faction for which it counts in victory conditions',
    roleRequiresDead: 'This role requires being dead to be used.',
    roleRequiresAlive: 'This role requires you to be alive to be used.',
    roleNotUsable: 'Role not usable',
    powerNotAvailable: 'Power not available',
    roleCopiedSuccessfully: 'Role copied successfully',
    copiedRole: 'Copied role',
    gameMechanics: 'Game Mechanics',
    abilitiesAndFeatures: 'Abilities and Features',
    effectType: 'Effect Type',
    required: 'Required - must use the ability',
    optional: 'Optional - can choose to use the ability',
    usage: 'Usage',
    unlimited: 'Unlimited',
    once: 'Once - can act only once per game',
    times: 'times',
    timesPerGame: 'per game',
    notSpecified: 'Not specified',
    actsAtNight: 'Acts at Night',
    always: 'Always acts at night',
    whenAlive: 'Acts at night when alive',
    whenDead: 'Acts at night when dead',
    never: 'Never acts at night',
    startNight: 'Start Night',
    fromNight: 'From night',
    canTargetDead: 'Can target dead players',
    affects: 'Affects',
    knownTo: 'Known to',
    winCondition: 'Win Condition',
    specificRoleCondition: 'Specific role condition',
    playerCount: 'Player Count',
    minCount: 'Minimum Count',
    maxCount: 'Maximum Count',
    roleNotFound: 'The requested role does not exist or is not available.',
    roleNotFoundTitle: 'Role not found',
    roleNotFoundSubtitle: 'Error searching for the role',
    backToRoles: 'Back to roles',
    unknown: 'Unknown',
    firstNight: '1st night',
    nightOrdinal: 'th night',
    nightAction: 'Night Action',
    revealedToAllies: 'Revealed to allies',
    roleName: 'Role name',
    factionOnly: 'Faction only',
    maxUsageReached: 'This role has already been used the maximum number of times allowed.',
    cannotUsePowerDying: 'You cannot use your power because you are dying due to the loss of balance between teams.',
    selectedPlayerBlocked: 'The selected player is blocked and cannot use their role.',
    selectedPlayerDead: 'The selected player is dead and cannot use their role.',
    roleCannotBeUsedAtNight: 'This role cannot be used during the night.',
    roleCanOnlyBeUsedFromNight: 'This role can only be used starting from night {night}.',
    roleBlockedByOther: 'This role is blocked by another player or has other restrictions.',
    roleCannotBeUsedUnknown: 'This role cannot be used for unknown reasons.',
    powerBlockedDueToImbalance: 'Your power is blocked due to the loss of balance between teams',
    copyAnotherPlayerPower: 'Copy another player\'s power for this night',
    cannotUsePowerDyingShort: 'You cannot use your power because you are dying',
    selectedRoleCannotBeUsed: 'The selected role cannot be used',
    hasBlocked: 'has blocked',
    transformed: 'transformed',
    transformedPlural: 'transformed',
    newRole: 'New role'
  },


  // Faction win conditions
  factionWinConditions: {
    villaggio: 'Villagers win when all wolves have been eliminated',
    lupi: 'Wolves win when they reach numerical parity with villagers or exceed them',
    mannari: 'The werewolf wins if only two players remain (him and another player)',
    matti: 'The madman wins if eliminated during the day (voting)',
    parassita: 'The parasite wins when all living players are infected',
    alieni: 'Aliens win when they remain alive with the same number of players for each team'
  },

  // New roles popup
  newRoles: {
    title: 'New Roles Available!',
    description: 'New roles have arrived in the village! Here\'s what\'s new:',
    gotIt: 'Perfect!'
  },

  // Genio role
  genio: {
    chooseRole: 'Choose one of the three available roles to transform into',
    chooseRoleDescription: 'Choose one of the three available roles to transform into'
  },

  // Phase reveal
  phaseReveal: {
    title: 'Role Reveal',
    howToReveal: 'How to reveal roles',
    howToRevealDescription: 'Each player will see their own role and information about their teammates. Pass the phone to the next player when you\'re done.',
    startReveals: 'Start reveals',
    beforeNight: 'Before night',
    closeEyes: 'Close your eyes',
    whenReady: 'When you\'re ready, start the night',
    revealAgain: 'Reveal again',
    startNight: 'Start night',
    reveal: 'Reveal',
    roleRevealed: 'Role revealed',
    roleRevealedSuccess: 'Role revealed successfully',
    yourFaction: 'Your faction',
    yourInformation: 'Your information',
    youKnowEachOther: 'You know each other',
    youKnowThem: 'You know them',
    next: 'Next',
    holdToContinue: 'hold to continue',
    holdToReveal: 'hold to reveal',
    unknownRole: 'Unknown role',
    noAction: 'No action',
    passPhoneTo: 'Pass the phone to',
    noRolesUsedPowers: 'No roles used their powers this night.',
    revealRoleAgain: 'Reveal a role again',
    appearsAs: 'appears as'
  },
  phaseResolve: {
    title: 'Night Resolution',
    nightResults: 'Announcements to make',
    deaths: 'Deaths',
    player: 'player',
    players: 'players',
    noDeaths: 'No deaths',
    peacefulNight: 'The night was peaceful',
    resurrected: 'Resurrected',
    details: 'Details',
    hide: 'Hide',
    continue: 'Continue',
    resolving: 'Resolving…',
    reloadHelp: 'Reload to start a new game from the main menu'
  },
  roleComparison: {
    declared: 'Declared:'
  },
  dayPhase: {
    day: 'Day',
    selectPlayer: 'Select player',
    electMayor: 'Elect Mayor',
    mayorVoteDescription: 'The elected player\'s vote will count as 2 for the rest of the game.',
    whoToElectAsMayor: 'Who do you want to elect as Mayor?',
    firstDayLynchSkipped: 'First day lynch was skipped',
    goToNight: 'Go to Night',
    selectPlayerToLynch: 'Select player to lynch',
    timeToVote: 'It\'s time to vote. After voting, select who was lynched.',
    whoToLynch: 'Who do you want to lynch?'
  },
  preNightPhase: {
    night: 'Night',
    askPlayersToCloseEyes: 'Ask all players to close their eyes',
    whenReadyProceed: 'When everyone is ready, proceed to the night phase',
    alivePlayersAndRoles: 'Alive players and their roles',
    startNight: 'Start Night',
    reloadHelp: 'Reload to start a new game from the main menu',
    unknown: 'Unknown'
  },
  mediumPrompt: {
    selectDeadPlayer: 'Select a dead player…',
    chooseDeadPlayer: 'Choose a dead player to investigate',
    checkDeadPlayerFaction: 'Check the faction of a dead player',
    noDeadPlayers: 'No dead players to investigate',
    continue: 'Continue',
    whoToCheck: 'Who do you want to check?',
    discovered: 'Discovered that'
  },
}