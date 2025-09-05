import type { GameState, Player } from '../../types';
import { DEFAULT_ROLES_CONFIG } from '../../config/defaultRoles';

/**
 * GameStateManager - Responsible for basic game state operations
 * Following Single Responsibility Principle
 */
export class GameStateManager {
  
  /**
   * Create an empty game state with default values
   */
  static createEmptyState(): GameState {
    return {
      phase: 'setup',
      nightNumber: 0,
      dayNumber: 0,
      players: [],
      setup: { 
        numPlayers: DEFAULT_ROLES_CONFIG.defaultPlayerCount, 
        players: [], 
        rolesCounts: {}, 
        rolesEnabled: { ...DEFAULT_ROLES_CONFIG.rolesEnabled } 
      },
      revealIndex: 0,
      night: { turns: [], currentIndex: 0, context: null, summary: null },
      settings: { 
        skipFirstNightActions: true, 
        enableSindaco: false, 
        discussionTimerEnabled: false,
        difficolta: false
      },
      sindacoId: null as any,
      winner: null,
      lynchedHistory: [],
      usedPowers: {},
      custom: {},
      history: {},
      nightDeathsByNight: {},
      lynchedHistoryByDay: {},
    };
  }

  /**
   * Get all alive players from the game state
   */
  static getAlivePlayers(state: GameState): Player[] {
    return state.players.filter(p => p.alive);
  }

  /**
   * Get unique teams of alive players
   */
  static getAliveTeams(state: GameState): string[] {
    const alive = GameStateManager.getAlivePlayers(state);
    const aliveTeams = new Set<string>(
      alive.map(p => p.roleState?.realTeam).filter(Boolean) as string[]
    );
    return Array.from(aliveTeams);
  }

  /**
   * Initialize night tracking data for a specific night
   */
  static initializeNightTracking(state: GameState, nightNumber: number): void {
    if (!(state as any).usedPowers) (state as any).usedPowers = {};
    if (!(state as any).deadAtNightStart) (state as any).deadAtNightStart = {};
    
    (state as any).deadAtNightStart[nightNumber] = state.players
      .filter(p => !p.alive)
      .map(p => p.id);
  }

  /**
   * Initialize history tracking if not present
   */
  static initializeHistory(state: GameState, nightNumber: number): void {
    if (!state.history) (state as any).history = {} as any;
    if (!(state as any).history[nightNumber]) (state as any).history[nightNumber] = {};
  }

  /**
   * Record that a power was used by a player
   */
  static recordPowerUsage(state: GameState, roleId: string, playerId: number): void {
    if (!(state as any).usedPowers) (state as any).usedPowers = {};
    if (!(state as any).usedPowers[roleId]) (state as any).usedPowers[roleId] = [];
    (state as any).usedPowers[roleId].push(playerId);
  }

  /**
   * Get the number of times a player has used their power
   */
  static getPowerUsageCount(state: GameState, roleId: string, playerId: number): number {
    const usedPowers = (state as any).usedPowers?.[roleId] || [];
    return usedPowers.filter((id: number) => id === playerId).length;
  }

  /**
   * Set the Sindaco (mayor) for the game
   */
  static setSindaco(state: GameState, playerId: number): void {
    const target = state.players.find(p => p.id === playerId && p.alive);
    if (!target) return;
    (state as any).sindacoId = target.id;
  }

  /**
   * Initialize night deaths tracking if not present
   */
  static initializeNightDeathsTracking(state: GameState): void {
    if (!(state as any).nightDeathsByNight) {
      (state as any).nightDeathsByNight = {} as Record<number, number[]>;
    }
  }

  /**
   * Record night deaths for a specific night
   */
  static recordNightDeaths(state: GameState, nightNumber: number, deaths: number[]): void {
    GameStateManager.initializeNightDeathsTracking(state);
    (state as any).nightDeathsByNight[nightNumber] = [...deaths];
  }

  /**
   * Get a player's real-time visible team (considering effects like Insinuo)
   */
  static getPlayerRealTimeVisibleTeam(state: GameState, playerId: number): string | undefined {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return undefined;
    
    return player.roleState?.visibleAsTeam || player.roleState?.realTeam;
  }
}
