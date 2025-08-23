export const GAME_CONSTANTS = {
  DEFAULT_START_NIGHT: 2,
  DEFAULT_ROLE_COLOR: '#6b7280',
  PROMPT_ICONS: {
    DEAD: '💀',
    ALIVE: '🟢',
    BLOCKED: '🚫',
    START_NIGHT: '⏰',
    USAGE_LIMIT: '🔒'
  },
  PROMPT_MESSAGES: {
    FIRST_NIGHT_SKIPPED: {
      title: 'La prima notte è tranquilla. Gli effetti sono ignorati.',
      buttonText: 'Salta'
    },
    DEAD: {
      title: 'Tutti i giocatori con questo ruolo sono morti',
      subtitle: 'Non possono usare il loro ruolo questa notte',
      buttonText: 'Continua'
    },
    ALIVE: {
      title: 'I giocatori con questo ruolo sono vivi',
      subtitle: 'Devono essere morti per usare il loro ruolo',
      buttonText: 'Continua'
    },
    BLOCKED: {
      title: 'Tutti i giocatori con questo ruolo sono bloccati',
      subtitle: 'Qualcuno ha bloccato il loro ruolo',
      buttonText: 'Continua'
    },
    START_NIGHT: {
      title: 'Non è ancora il momento',
      buttonText: 'Continua'
    },
    USAGE_LIMIT: {
      title: 'Limite di utilizzo raggiunto',
      subtitle: 'Questo ruolo è già stato usato il massimo numero di volte',
      buttonText: 'Continua'
    },
    NO_ACTION: {
      title: 'Nessuna azione richiesta per questo ruolo',
      buttonText: 'Continua'
    }
  }
} as const;
