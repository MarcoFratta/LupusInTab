import type { GameState } from '../types';
import { FACTIONS } from '../factions';

export function useWinLogic() {
  function hexToTailwindColor(hexColor: string, type: 'text' | 'border'): string {
    const colorMap: Record<string, { text: string; border: string }> = {
      '#ef4444': { text: 'text-red-400', border: 'border-red-500/40' },
      '#10b981': { text: 'text-emerald-400', border: 'border-emerald-500/40' },
      '#f59e0b': { text: 'text-amber-400', border: 'border-amber-500/40' },
      '#8b5cf6': { text: 'text-violet-400', border: 'border-violet-500/40' },
      '#ec4899': { text: 'text-pink-400', border: 'border-pink-500/40' },
      '#06b6d4': { text: 'text-cyan-400', border: 'border-cyan-500/40' }
    };
    
    return colorMap[hexColor]?.[type] || (type === 'text' ? 'text-neutral-200' : 'border-white/10');
  }

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
    return faction ? hexToTailwindColor(faction.color, 'border') : 'border-white/10';
  }

  function getTeamTextColor(team: string): string {
    const faction = FACTIONS[team];
    return faction ? hexToTailwindColor(faction.color, 'text') : 'text-neutral-200';
  }

  return {
    getWinnerColor,
    getWinnerText,
    getTeamDisplayName,
    getTeamBorderColor,
    getTeamTextColor
  };
}
