import type { GameState } from '../../types';
import { ROLES } from '../../roles';
import { GameStateManager } from './GameStateManager';

/**
 * RoleConstraintManager - Responsible for validating role constraints and usage limits
 * Following Single Responsibility Principle
 */
export class RoleConstraintManager {
  
  /**
   * Get all players for a role, including those from grouped roles
   * This centralizes the grouping logic and makes the code cleaner
   */
  static getPlayersForRole(roleId: string, state: GameState): any[] {
    const directPlayers = state.players.filter((p: any) => p.roleId === roleId);
    const groupedPlayers: any[] = [];
    
    if (state.groupings) {
      for (const grouping of state.groupings) {
        if (grouping.fromRole === roleId) {
          const groupedRolePlayers = state.players.filter((p: any) => p.roleId === grouping.toRole);
          groupedPlayers.push(...groupedRolePlayers);
        }
      }
    }
    
    const allPlayers = [...directPlayers, ...groupedPlayers];
    
    if (groupedPlayers.length > 0) {
      console.log(`🔍 [DEBUG] getPlayersForRole - Role ${roleId}: ${directPlayers.length} direct + ${groupedPlayers.length} grouped players`);
    }
    
    return allPlayers;
  }
  
  /**
   * Check if a role can act based on various constraints
   * Returns null if role can act, or a string describing the constraint
   */
  static checkRoleConstraints(state: GameState, roleId: string, playerIds: number[]): string | null {
    const roleDef = ROLES[roleId];
    if (!roleDef) return null;

    const aliveMembers = state.players.filter(p => playerIds.includes(p.id) && p.alive);
    const deadMembers = state.players.filter(p => playerIds.includes(p.id) && !p.alive);

    console.log(`🔍 [DEBUG] checkRoleConstraints - Role: ${roleId}, Player IDs: ${playerIds}, Alive: ${aliveMembers.length}, Dead: ${deadMembers.length}`);
    console.log(`🔍 [DEBUG] Alive members:`, aliveMembers.map(p => ({ id: p.id, name: p.name, roleId: p.roleId })));
    console.log(`🔍 [DEBUG] Dead members:`, deadMembers.map(p => ({ id: p.id, name: p.name, roleId: p.roleId })));

    // Check if all players with this role are blocked
    if (aliveMembers.length > 0 && aliveMembers.every(player => 
      player.roleState?.actsAtNight === 'blocked'
    )) {
      console.log(`🔍 [DEBUG] Role ${roleId} blocked - all alive members are blocked`);
      return "blocked";
    }

    // Check if role requires alive players but ALL players are dead
    if (roleDef.actsAtNight === 'alive' && aliveMembers.length === 0) {
      console.log(`🔍 [DEBUG] Role ${roleId} dead - requires alive players but all are dead`);
      return "dead";
    }

    // Check if role requires dead players but ALL players are alive
    if (roleDef.actsAtNight === 'dead' && deadMembers.length === 0) {
      console.log(`🔍 [DEBUG] Role ${roleId} alive - requires dead players but all are alive`);
      return "alive";
    }

    // Check if role has reached usage limit for ALL players
    const hasUsageLimit = RoleConstraintManager.checkUsageLimitConstraint(state, roleId, playerIds);
    if (hasUsageLimit) {
      console.log(`🔍 [DEBUG] Role ${roleId} usage limit reached`);
      return "usageLimit";
    }

    // Check if role cannot be used yet due to startNight restriction
    const hasStartNightRestriction = RoleConstraintManager.checkStartNightConstraint(state, roleId, playerIds, roleDef);
    if (hasStartNightRestriction) {
      console.log(`🔍 [DEBUG] Role ${roleId} start night restriction`);
      return "startNight";
    }

    console.log(`🔍 [DEBUG] Role ${roleId} can act - no constraints`);
    return null;
  }

  /**
   * Check if role cannot be used due to startNight restriction
   */
  private static checkStartNightConstraint(state: GameState, roleId: string, playerIds: number[], roleDef: any): boolean {
    const rolePlayers = state.players.filter(p => playerIds.includes(p.id));
    
    // Return true only if ALL players have startNight restrictions that prevent them from acting
    return rolePlayers.every(player => {
      const roleStartNight = roleDef.startNight;
      const playerStartNight = player.roleState?.startNight;
      const startNight = playerStartNight || roleStartNight;
      return startNight && typeof startNight === 'number' && state.nightNumber < startNight;
    });
  }

  /**
   * Check if role has exceeded usage limit for ALL players
   * Returns true only if ALL players with this role have exceeded their usage limit
   */
  private static checkUsageLimitConstraint(state: GameState, roleId: string, playerIds: number[]): boolean {
    const rolePlayers = state.players.filter(p => playerIds.includes(p.id));
    
    // If no players, they can't act
    if (rolePlayers.length === 0) return true;
    
    // Check if ALL players have exceeded their usage limit
    return rolePlayers.every(player => {
      const numberOfUsage = player.roleState?.numberOfUsage;
      if (numberOfUsage === 'unlimited' || numberOfUsage === undefined) return false;
      
      // Check usage against the player's CURRENT role ID, not the original roleId parameter
      // This handles cases where genio transforms into a different role
      const currentRoleId = player.roleId;
      const timesUsed = GameStateManager.getPowerUsageCount(state, currentRoleId, player.id);
      return timesUsed >= numberOfUsage;
    });
  }

  /**
   * Check if a role can act considering all constraints including usage limits
   * This is a more comprehensive check that considers if ANY player can act
   */
  static canRoleAct(state: GameState, roleId: string, playerIds: number[]): boolean {
    const roleDef = ROLES[roleId];
    if (!roleDef) return false;

    const rolePlayers = state.players.filter(p => playerIds.includes(p.id));
    if (rolePlayers.length === 0) return false;

    // Check if ANY player can act (not blocked, alive if required, and hasn't exceeded usage)
    return rolePlayers.some(player => {
      // Check if player is blocked
      if (player.roleState?.actsAtNight === 'blocked') return false;
      
      // Check if player is alive/dead as required by role
      if (roleDef.actsAtNight === 'alive' && !player.alive) return false;
      if (roleDef.actsAtNight === 'dead' && player.alive) return false;
      
      // Check if player has exceeded usage limit
      const numberOfUsage = player.roleState?.numberOfUsage;
      if (numberOfUsage !== 'unlimited' && numberOfUsage !== undefined) {
        // Check usage against the player's CURRENT role ID, not the original roleId parameter
        // This handles cases where genio transforms into a different role
        const currentRoleId = player.roleId;
        const timesUsed = GameStateManager.getPowerUsageCount(state, currentRoleId, player.id);
        if (timesUsed >= numberOfUsage) return false;
      }
      
      // Check if player can act due to startNight restriction
      const roleStartNight = roleDef.startNight;
      const playerStartNight = player.roleState?.startNight;
      const startNight = playerStartNight || roleStartNight;
      if (startNight && typeof startNight === 'number' && state.nightNumber < startNight) return false;
      
      return true;
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
    const hasTargetIds = result.targetIds !== null && result.targetIds !== undefined;
    const hasTarget = result.target !== null && result.target !== undefined;
    const hasAction = result.action && result.action !== 'none';
    const hasChoice = result.choice !== null && result.choice !== undefined;
    const hasRoleId = result.roleId !== null && result.roleId !== undefined;
    const hasLupiCount = result.lupiCount !== null && result.lupiCount !== undefined;
    const hasInfetti = result.infetti !== null && result.infetti !== undefined;
    const hasDiscoveredFaction = result.discoveredFaction !== null && result.discoveredFaction !== undefined;
    const hasDiscoveredRole = result.discoveredRole !== null && result.discoveredRole !== undefined;
    const hasDiscoveredRealTeam = result.discoveredRealTeam !== null && result.discoveredRealTeam !== undefined;
    
    // lupoCieco-specific properties
    const hasInvestigationTargets = result.investigationTargets !== null && result.investigationTargets !== undefined;
    const hasInvestigationResult = result.investigationResult !== null && result.investigationResult !== undefined;
    const hasKillTargetId = result.killTargetId !== null && result.killTargetId !== undefined;
    
    // If any meaningful data is present, consider the role used
    return hasTargetId || hasTargetIds || hasTarget || hasAction || hasChoice || hasRoleId || 
           hasLupiCount || hasInfetti || hasDiscoveredFaction || hasDiscoveredRole || hasDiscoveredRealTeam ||
           hasInvestigationTargets || hasInvestigationResult || hasKillTargetId;
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
