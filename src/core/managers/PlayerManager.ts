import type { GameState, Player } from '../../types';
import { ROLES } from '../../roles';

/**
 * PlayerManager - Responsible for player-related operations
 * Following Single Responsibility Principle
 */
export class PlayerManager {
  
  /**
   * Initialize a player's role state based on their role definition
   */
  static initializePlayerRoleState(player: Player, roleDef: any): void {
    if (!player || !roleDef) return;
    
    player.roleState = {
      // Runtime properties that can change during the game
      visibleAsTeam: roleDef.visibleAsTeam || roleDef.team,
      actsAtNight: roleDef.actsAtNight || 'never',
      
      // Static properties copied from role definition (never change)
      realTeam: roleDef.team,
      countAs: roleDef.countAs || roleDef.team,
      phaseOrder: roleDef.phaseOrder !== undefined ? roleDef.phaseOrder : 'any',
      usage: roleDef.usage || 'unlimited',
      effectType: roleDef.effectType || 'optional',
      numberOfUsage: roleDef.numberOfUsage || 'unlimited',
      startNight: roleDef.startNight || 1,
      canTargetDead: roleDef.canTargetDead || false,
      affectedRoles: roleDef.affectedRoles || [],

      knownTo: roleDef.knownTo || [],
      revealPartnersRoleIds: roleDef.revealPartnersRoleIds || [],
      revealAlliesWithinRole: roleDef.revealAlliesWithinRole || false,
      revealToAllies: roleDef.revealToAllies || 'team',
      revealToPartners: roleDef.revealToPartners || 'role'
    };
  }

  /**
   * Create players array from role counts
   */
  static createPlayersFromRoleCounts(rolesCounts: Record<string, number>): Player[] {
    const players: Player[] = [];
    
    for (const [roleId, count] of Object.entries(rolesCounts)) {
      for (let i = 0; i < count; i++) {
        const player: Player = {
          id: players.length + 1,
          name: `Giocatore ${players.length + 1}`,
          roleId,
          alive: true,
          roleState: {} as any
        };
        
        // Initialize the player's role state
        const roleDef = ROLES[roleId];
        if (roleDef) {
          PlayerManager.initializePlayerRoleState(player, roleDef);
        }
        
        players.push(player);
      }
    }
    
    return players;
  }

  /**
   * Lynch a player (kill them during day phase)
   */
  static lynchPlayer(state: GameState, playerId: number): Player | null {
    const target = state.players.find(p => p.id === playerId);
    if (!target || !target.alive) return null;
    
    target.alive = false;
    
    // Update lynched history
    if (!Array.isArray((state as any).lynchedHistory)) {
      (state as any).lynchedHistory = [];
    }
    (state as any).lynchedHistory.push(target.id);
    
    // Update daily lynched history
    if (!(state as any).lynchedHistoryByDay) {
      (state as any).lynchedHistoryByDay = {} as Record<number, number[]>;
    }
    const day = state.dayNumber;
    if (!Array.isArray((state as any).lynchedHistoryByDay[day])) {
      (state as any).lynchedHistoryByDay[day] = [];
    }
    (state as any).lynchedHistoryByDay[day].push(target.id);
    
    return target;
  }

  /**
   * Kill a player (set alive to false)
   */
  static killPlayer(state: GameState, playerId: number): Player | null {
    const target = state.players.find(p => p.id === playerId);
    if (!target || !target.alive) return null;
    
    target.alive = false;
    return target;
  }

  /**
   * Resurrect a player (set alive to true)
   */
  static resurrectPlayer(state: GameState, playerId: number): Player | null {
    const target = state.players.find(p => p.id === playerId);
    if (!target || target.alive) return null;
    
    target.alive = true;
    return target;
  }

  /**
   * Get players by role ID
   */
  static getPlayersByRole(state: GameState, roleId: string): Player[] {
    return state.players.filter(p => p.roleId === roleId);
  }

  /**
   * Get alive players by role ID
   */
  static getAlivePlayersByRole(state: GameState, roleId: string): Player[] {
    return state.players.filter(p => p.roleId === roleId && p.alive);
  }

  /**
   * Get dead players by role ID
   */
  static getDeadPlayersByRole(state: GameState, roleId: string): Player[] {
    return state.players.filter(p => p.roleId === roleId && !p.alive);
  }

  /**
   * Find player by ID
   */
  static findPlayer(state: GameState, playerId: number): Player | undefined {
    return state.players.find(p => p.id === playerId);
  }

  /**
   * Check if all players with a specific role are dead
   */
  static areAllPlayersWithRoleDead(state: GameState, roleId: string): boolean {
    const rolePlayers = PlayerManager.getPlayersByRole(state, roleId);
    return rolePlayers.length > 0 && rolePlayers.every(p => !p.alive);
  }

  /**
   * Check if all players with a specific role are alive
   */
  static areAllPlayersWithRoleAlive(state: GameState, roleId: string): boolean {
    const rolePlayers = PlayerManager.getPlayersByRole(state, roleId);
    return rolePlayers.length > 0 && rolePlayers.every(p => p.alive);
  }

  /**
   * Adjust startNight values for first night skip setting
   */
  static adjustStartNightForFirstNightSkip(state: GameState): void {
    if (!state.settings?.skipFirstNightActions) return;
    
    for (const player of state.players) {
      if (player.roleState?.startNight && player.roleState.startNight > 1) {
        player.roleState.startNight += 1;
      }
    }
  }
}
