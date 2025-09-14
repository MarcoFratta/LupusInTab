import type { GameState } from '../types';
import { FACTIONS } from '../factions';
import { getFactionDisplayName } from '../utils/factionUtils';
import { useI18n } from './useI18n';

export function useWinLogic() {
  const { t } = useI18n();
  
  function getWinnerColor(winner: GameState['winner']): string {
    if (winner === 'tie') return 'text-yellow-400';
    return 'text-neutral-100';
  }

  function getWinnerText(winner: GameState['winner']): string {
    if (winner === 'tie') return t('winLogic.tie');
    if (Array.isArray(winner)) {
      if (winner.length === 1) return t('winLogic.teamWins', { team: getTeamDisplayName(winner[0]) });
      return t('winLogic.teamsWin', { teams: winner.map(team => getTeamDisplayName(team)).join(', ') });
    }
    return t('winLogic.teamWins', { team: getTeamDisplayName(winner || 'unknown') });
  }

  function getTeamDisplayName(team: string): string {
    return getFactionDisplayName(team, t);
  }

  function getTeamBorderColor(team: string): string {
    const faction = FACTIONS[team];
    return faction ? faction.color : '#6b7280';
  }

  function getTeamTextColor(team: string): string {
    const faction = FACTIONS[team];
    return faction ? faction.color : '#e5e7eb';
  }

  return {
    getWinnerColor,
    getWinnerText,
    getTeamDisplayName,
    getTeamBorderColor,
    getTeamTextColor
  };
}
