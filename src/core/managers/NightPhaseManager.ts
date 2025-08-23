import type { GameState, RolesRegistry } from '../../types';
import { ROLES } from '../../roles';
import { GameStateManager } from './GameStateManager';
import { RoleConstraintManager } from './RoleConstraintManager';

/**
 * NightPhaseManager - Responsible for night phase logic and execution
 * Following Single Responsibility Principle
 */
export class NightPhaseManager {
  
  /**
   * Begin the night phase
   */
  static beginNight(state: GameState, roles: RolesRegistry): void {
    state.nightNumber += 1;
    
    // Initialize night tracking
    GameStateManager.initializeNightTracking(state, state.nightNumber);
    
    const uniqueRoles = new Set(state.players.map(p => p.roleId));
    
    // Separate roles that can act at night from those that only have passive effects
    const rolesWithPrompts = [];
    const rolesWithPassiveOnly = [];
    
    for (const roleId of uniqueRoles) {
      const roleDef = roles[roleId];
      if (!roleDef) continue;
      
      const rolePlayers = state.players.filter(p => p.roleId === roleId);
      const roleInfo = {
        roleId,
        roleDef,
        players: rolePlayers,
        phaseOrder: roleDef.phaseOrder !== undefined ? roleDef.phaseOrder : 'any'
      };
      
      if (roleDef.actsAtNight !== "never") {
        // Roles that can act at night (show prompts)
        rolesWithPrompts.push(roleInfo);
      } else if (typeof roleDef.passiveEffect === 'function') {
        // Roles that can't act but have passive effects
        rolesWithPassiveOnly.push(roleInfo);
      }
    }
    
    // Sort roles with prompts by phase order
    rolesWithPrompts.sort(NightPhaseManager.compareRolesByPhaseOrder);
    
    const turns = rolesWithPrompts.map(role => ({
      kind: 'group' as const,
      roleId: role.roleId,
      playerIds: role.players.map(p => p.id)
    }));
    
    const nightContext = { 
      pendingKills: {}, 
      savesBy: [], 
      checks: []
    };
    
    state.night = { 
      turns, 
      currentIndex: 0, 
      context: nightContext, 
      summary: null 
    } as any;
    
    // Apply passive effects to roles that can't act at night
    NightPhaseManager.applyPassiveEffects(state, rolesWithPassiveOnly);
    
    state.phase = 'night';
  }

  /**
   * Compare roles by their phase order for sorting
   */
  private static compareRolesByPhaseOrder(a: any, b: any): number {
    const aOrder = a.phaseOrder;
    const bOrder = b.phaseOrder;
    
    if (aOrder === "any" && bOrder === "any") {
      return a.roleId.localeCompare(b.roleId);
    }
    
    if (aOrder === "any") return 1;
    if (bOrder === "any") return -1;
    
    const aNum = Number(aOrder);
    const bNum = Number(bOrder);
    
    if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
      return aNum - bNum;
    }
    
    if (Number.isFinite(aNum)) return -1;
    if (Number.isFinite(bNum)) return 1;
    
    return a.roleId.localeCompare(b.roleId);
  }

  /**
   * Apply passive effects for roles that don't have prompts
   */
  private static applyPassiveEffects(state: GameState, rolesWithPassiveOnly: any[]): void {
    for (const roleInfo of rolesWithPassiveOnly) {
      const { roleDef, players } = roleInfo;
      if (typeof roleDef.passiveEffect === 'function') {
        for (const player of players) {
          if (player.alive) {
            try {
              roleDef.passiveEffect(state as any, player);
            } catch (error) {
              console.error(`Error in passive effect for ${roleInfo.roleId} (player ${player.id}):`, error);
            }
          }
        }
      }
    }
  }

  /**
   * Record the result of a night action
   */
  static recordNightResult(state: GameState, result: any): void {
    const entry = state.night.turns[state.night.currentIndex];
    if (!entry) return;

    if (entry.kind === 'group') {
      const roleDef = ROLES[entry.roleId];
      const playerIds = (entry as any).playerIds || [];
      
      // Check if this is the first night and first night actions are skipped
      const isFirstNightSkipped = state.settings?.skipFirstNightActions && state.nightNumber === 1;
      
      if (!isFirstNightSkipped) {
        // Apply passive effects if not first night skipped
        NightPhaseManager.applyRolePassiveEffects(state, roleDef, playerIds, entry.roleId);
        
        // Initialize history for this night
        GameStateManager.initializeHistory(state, state.nightNumber);

        // Process the result and update history
        NightPhaseManager.processNightActionResult(state, entry, result, roleDef, playerIds);
      }
      // If first night is skipped, we don't add anything to history
    }
    
    // Move to next turn or resolve phase
    if (state.night.currentIndex < state.night.turns.length - 1) {
      state.night.currentIndex += 1;
    } else {
      state.phase = 'resolve';
    }
  }

  /**
   * Apply passive effects for a specific role
   */
  private static applyRolePassiveEffects(state: GameState, roleDef: any, playerIds: number[], roleId: string): void {
    const aliveMembers = state.players.filter(p => playerIds.includes(p.id) && p.alive);
    
    if (roleDef && typeof roleDef.passiveEffect === 'function') {
      for (const playerId of playerIds) {
        const player = state.players.find(p => p.id === playerId);
        if (player && player.alive) {
          try {
            roleDef.passiveEffect(state as any, player);
          } catch (error) {
            console.error(`Error in passive effect for ${roleId} (player ${playerId}):`, error);
          }
        }
      }
    }
  }

  /**
   * Process the result of a night action and update history
   */
  private static processNightActionResult(state: GameState, entry: any, result: any, roleDef: any, playerIds: number[]): void {
    if (result?.skipped === true) {
      // Role was explicitly skipped by player choice
      (state as any).history[state.nightNumber][entry.roleId] = "skipped";
    } else if (result?.blocked === true) {
      // Role was blocked by another role
      (state as any).history[state.nightNumber][entry.roleId] = "blocked";
    } else {
      // Check if role can act based on constraints
      const constraintCheck = RoleConstraintManager.checkRoleConstraints(state, entry.roleId, playerIds);
      
      if (constraintCheck !== null) {
        // Role cannot act due to constraints
        (state as any).history[state.nightNumber][entry.roleId] = constraintCheck;
      } else if (RoleConstraintManager.isRoleUsed(result)) {
        // Role was actually used (has meaningful data)
        NightPhaseManager.recordRoleUsage(state, entry, result, roleDef, playerIds);
      } else {
        // Role can act but wasn't used (no meaningful data provided)
        (state as any).history[state.nightNumber][entry.roleId] = "skipped";
      }
    }
  }

  /**
   * Record that a role was used and process its effects
   */
  private static recordRoleUsage(state: GameState, entry: any, result: any, roleDef: any, playerIds: number[]): void {
    // Record power usage
    for (const playerId of playerIds) {
      GameStateManager.recordPowerUsage(state, entry.roleId, playerId);
    }
    
    const action = {
      roleId: entry.roleId,
      kind: entry.kind,
      playerId: playerIds[0],
      playerIds: playerIds,
      data: result
    };
    
    if (roleDef && typeof roleDef.resolve === 'function') {
      // Each role's resolve function returns its own history object
      const roleHistory = roleDef.resolve(state as any, action);
      
      if (roleHistory) {
        // Store the role's history object
        (state as any).history[state.nightNumber][entry.roleId] = roleHistory;
      } else {
        // Fallback to generic history if role doesn't return anything
        (state as any).history[state.nightNumber][entry.roleId] = NightPhaseManager.createGenericHistory(entry, result, playerIds, state.nightNumber);
      }
    } else {
      // Role has no resolve function, create generic history
              (state as any).history[state.nightNumber][entry.roleId] = NightPhaseManager.createGenericHistory(entry, result, playerIds, state.nightNumber);
    }
  }

  /**
   * Create generic history object for roles without custom resolve function
   */
  private static createGenericHistory(entry: any, result: any, playerIds: number[], nightNumber: number): any {
    return {
      type: `${entry.roleId}_action`,
      nightNumber: nightNumber,
      roleId: entry.roleId,
      playerIds: playerIds,
      data: result,
      groupAction: true
    };
  }

  /**
   * Resolve the night phase and create summary
   */
  static resolveNight(state: GameState, roles: RolesRegistry): void {
    if (!state.night) return;
    
    // Create night summary from context
    if (state.night.context) {
      const summary = NightPhaseManager.createNightSummary(state);
      state.night.summary = summary;
      GameStateManager.recordNightDeaths(state, state.nightNumber, summary.died);
    }
  }

  /**
   * Create night summary from the night context
   */
  private static createNightSummary(state: GameState): any {
    const context = state.night.context;
    
    // Get players who were dead at the start of the night
    const deadAtNightStart = (state as any).deadAtNightStart?.[state.nightNumber] || [];
    
    const summary: any = {
      died: [],
      saved: [],
      targeted: [],
      resurrected: [],
      checks: context.checks || []
    };

    // Process pending kills (roles have already handled saves/immunities)
    if (context.pendingKills) {
      for (const [playerId, kills] of Object.entries(context.pendingKills)) {
        const pid = Number(playerId);
        const player = state.players.find(p => p.id === pid);
        if (player && player.alive && (kills as any[]).length > 0) {
          // If there are any remaining kills, the player dies
          summary.died.push(pid);
          player.alive = false;
        }
      }
    }

    // Build saved list from savesBy (for display purposes)
    if (context.savesBy) {
      for (const save of context.savesBy) {
        if (!summary.saved.includes(save.target)) {
          summary.saved.push(save.target);
        }
      }
    }

    // Process targeted players (for roles that don't kill but target)
    if (context.targeted) {
      summary.targeted = [...context.targeted];
    }

    // Detect resurrected players: those who were dead at night start but are now alive
    for (const playerId of deadAtNightStart) {
      const player = state.players.find(p => p.id === playerId);
      if (player && player.alive) {
        summary.resurrected.push(playerId);
      }
    }

    return summary;
  }

  /**
   * Start the next night phase
   */
  static startNextNight(state: GameState, roles: RolesRegistry): void {
    NightPhaseManager.beginNight(state, roles);
  }
}
