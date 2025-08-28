import type { GameState } from '../types';
import { FACTIONS } from '../factions';

export function useWinLogic() {
  function getWinnerColor(winner: GameState['winner']): string {
    if (winner === 'tie') return 'text-yellow-400';
    return 'text-neutral-100';
  }

  function getWinnerText(winner: GameState['winner']): string {
    if (winner === 'tie') return 'Pareggio, tutti sono morti';
    if (Array.isArray(winner)) {
      if (winner.length === 1) return winner[0] + ' vincono';
      return winner.join(', ') + ' vincono';
    }
    return (winner || 'Sconosciuto') + ' vince';
  }

  function getTeamDisplayName(team: string): string {
    const faction = FACTIONS[team];
    return faction?.displayName || team;
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
