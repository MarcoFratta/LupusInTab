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
      title: 'promptMessages.firstNightSkipped.title',
      buttonText: 'promptMessages.firstNightSkipped.buttonText'
    },
    DEAD: {
      title: 'promptMessages.dead.title',
      subtitle: 'promptMessages.dead.subtitle',
      buttonText: 'promptMessages.dead.buttonText'
    },
    ALIVE: {
      title: 'promptMessages.alive.title',
      subtitle: 'promptMessages.alive.subtitle',
      buttonText: 'promptMessages.alive.buttonText'
    },
    BLOCKED: {
      title: 'promptMessages.blocked.title',
      subtitle: 'promptMessages.blocked.subtitle',
      buttonText: 'promptMessages.blocked.buttonText'
    },
    START_NIGHT: {
      title: 'promptMessages.startNight.title',
      buttonText: 'promptMessages.startNight.buttonText'
    },
    USAGE_LIMIT: {
      title: 'promptMessages.usageLimit.title',
      subtitle: 'promptMessages.usageLimit.subtitle',
      buttonText: 'promptMessages.usageLimit.buttonText'
    },
    NO_ACTION: {
      title: 'promptMessages.noAction.title',
      buttonText: 'promptMessages.noAction.buttonText'
    }
  }
} as const;
