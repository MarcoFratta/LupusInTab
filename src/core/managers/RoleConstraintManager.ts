import type { GameState } from '../../types';
import { ROLES } from '../../roles';
import { GameStateManager } from './GameStateManager';

/**
 * RoleConstraintManager - Responsible for validating role constraints and usage limits
 * Following Single Responsibility Principle
 */
export class RoleConstraintManager {
  
  /**
   * Check if a role can act based on various constraints
   * Returns null if role can act, or a string describing the constraint
   */
  static checkRoleConstraints(state: GameState, roleId: string, playerIds: number[]): string | null {
    const roleDef = ROLES[roleId];
    if (!roleDef) return null;

    const aliveMembers = state.players.filter(p => playerIds.includes(p.id) && p.alive);
    const deadMembers = state.players.filter(p => playerIds.includes(p.id) && !p.alive);

    // Check if all players with this role are blocked
    if (aliveMembers.length > 0 && aliveMembers.every(player => 
      player.roleState?.actsAtNight === 'blocked'
    )) {
      return "blocked";
    }

    // Check if all players with this role are dead and role requires alive players
    if (aliveMembers.length === 0 && roleDef.actsAtNight === 'alive') {
      return "dead";
    }

    // Check if all players with this role are alive and role requires dead players
    if (deadMembers.length === 0 && roleDef.actsAtNight === 'dead') {
      return "alive";
    }

    // Check if role has reached usage limit
    const hasUsageLimit = RoleConstraintManager.checkUsageLimitConstraint(state, roleId, playerIds);
    if (hasUsageLimit) {
      return "usageLimit";
    }

    // Check if role cannot be used yet due to startNight restriction
    const hasStartNightRestriction = RoleConstraintManager.checkStartNightConstraint(state, roleId, playerIds, roleDef);
    if (hasStartNightRestriction) {
      return "startNight";
    }

    return null;
  }

  /**
   * Check if role has exceeded usage limit
   */
  private static checkUsageLimitConstraint(state: GameState, roleId: string, playerIds: number[]): boolean {
    const rolePlayers = state.players.filter(p => playerIds.includes(p.id));
    
    return rolePlayers.some(player => {
      const numberOfUsage = player.roleState?.numberOfUsage;
      if (numberOfUsage === 'unlimited' || numberOfUsage === undefined) return false;
      
      const timesUsed = GameStateManager.getPowerUsageCount(state, roleId, player.id);
      return timesUsed >= numberOfUsage;
    });
  }

  /**
   * Check if role cannot be used due to startNight restriction
   */
  private static checkStartNightConstraint(state: GameState, roleId: string, playerIds: number[], roleDef: any): boolean {
    const rolePlayers = state.players.filter(p => playerIds.includes(p.id));
    
    return rolePlayers.some(player => {
      const roleStartNight = roleDef.startNight;
      const playerStartNight = player.roleState?.startNight;
      const startNight = playerStartNight || roleStartNight;
      return startNight && typeof startNight === 'number' && state.nightNumber < startNight;
    });
  }

  /**
   * Check if a result indicates the role was actually used
   */
  static isRoleUsed(result: any): boolean {
    if (!result || typeof result !== 'object') return false;
    
    // Explicit used/skipped flags - these take priority
    if (result.used === true) return true;
    if (result.used === false || result.skipped === true) return false;
    
    // Check for meaningful data that indicates the role was used
    const hasTargetId = result.targetId !== null && result.targetId !== undefined;
    const hasTarget = result.target !== null && result.target !== undefined;
    const hasAction = result.action && result.action !== 'none';
    const hasChoice = result.choice !== null && result.choice !== undefined;
    const hasRoleId = result.roleId !== null && result.roleId !== undefined;
    
    // If any meaningful data is present, consider the role used
    return hasTargetId || hasTarget || hasAction || hasChoice || hasRoleId;
  }

  /**
   * Get the usage type for a role (backward compatibility)
   */
  static getRoleUsage(state: GameState, roleId: string): 'unlimited' | 'once' | 'requiredEveryNight' | undefined {
    const meta: any = ROLES[roleId];
    
    // Use the new system, but provide backward compatibility
    if (meta?.numberOfUsage === 'unlimited') return 'unlimited';
    if (meta?.numberOfUsage === 1) return 'once';
    if (meta?.effectType === 'required') return 'requiredEveryNight';
    
    // Fallback to old system
    return meta?.usage;
  }

  /**
   * Check if a player can act at night based on their role state
   */
  static canPlayerActAtNight(player: any): boolean {
    if (!player || !player.alive) return false;
    
    const actsAtNight = player.roleState?.actsAtNight;
    
    switch (actsAtNight) {
      case 'always':
        return true;
      case 'alive':
        return player.alive;
      case 'dead':
        return !player.alive;
      case 'blocked':
        return false;
      case 'never':
      default:
        return false;
    }
  }

  /**
   * Check if a player has exceeded their usage limit
   */
  static hasPlayerExceededUsageLimit(state: GameState, player: any): boolean {
    if (!player) return true;
    
    const numberOfUsage = player.roleState?.numberOfUsage;
    if (numberOfUsage === 'unlimited' || numberOfUsage === undefined) return false;
    
    const timesUsed = GameStateManager.getPowerUsageCount(state, player.roleId, player.id);
    return timesUsed >= numberOfUsage;
  }
}
