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
    
    // Create the night context with minimal tracking
    const nightContext = { 
      pendingKills: {}, 
      savesBy: [], 
      checks: [],
      calledRoles: new Set() // Track which roles have been called this night
    };
    
    state.night = { 
      turns: [], // Will be computed dynamically each time
      currentIndex: 0, // Not used in dynamic approach
      context: nightContext, 
      summary: null 
    } as any;
    
    console.log(`🌙 [DEBUG] Night setup complete. Roles will be computed dynamically based on current player states.`);
    
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
   * Record the result of a night action and move to the next role
   */
  static recordNightResult(state: GameState, result: any): void {
    if (!state.night || !state.night.context) return;

    try {
      // Get the current turn that was just completed
      const currentTurn = NightPhaseManager.getCurrentTurn(state);
      if (!currentTurn) {
        console.log(`🌙 [DEBUG] recordNightResult - No current turn, resolving night`);
        state.phase = 'resolve';
        return;
      }

      const { calledRoles } = state.night.context;
      const roleDef = ROLES[currentTurn.roleId];
      const playerIds = currentTurn.playerIds || [];
      
      console.log(`🌙 [DEBUG] recordNightResult - Processing role ${currentTurn.roleId} result`);
      
      // Check if this is the first night and first night actions are skipped
      const isFirstNightSkipped = state.settings?.skipFirstNightActions && state.nightNumber === 1;
      
      if (!isFirstNightSkipped) {
        // Apply passive effects if not first night skipped
        NightPhaseManager.applyRolePassiveEffects(state, roleDef, playerIds, currentTurn.roleId);
        
        // Initialize history for this night
        GameStateManager.initializeHistory(state, state.nightNumber);

        // Process the result and update history
        NightPhaseManager.processNightActionResult(state, currentTurn, result, roleDef, playerIds);
      } else {
        console.log(`🌙 [DEBUG] First night actions skipped for role ${currentTurn.roleId}`);
      }
      
      // Mark this role as called for this night
      calledRoles.add(currentTurn.roleId);
      console.log(`🌙 [DEBUG] recordNightResult - Marked role ${currentTurn.roleId} as called. Called roles:`, Array.from(calledRoles));
      
      // Check if there are more roles to call
      const nextTurn = NightPhaseManager.getCurrentTurn(state);
      if (!nextTurn) {
        console.log(`🌙 [DEBUG] recordNightResult - No more roles to call, resolving night`);
        state.phase = 'resolve';
      } else {
        console.log(`🌙 [DEBUG] recordNightResult - Next role to call: ${nextTurn.roleId}`);
      }
      
    } catch (error) {
      console.error(`🌙 [DEBUG] Error in recordNightResult:`, error);
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



  /**
   * Get the next role that should be called based on current player roles and phase order
   */
  static getCurrentTurn(state: GameState): any {
    if (!state.night || !state.night.context) return null;
    
    try {
      const { calledRoles } = state.night.context;
      
      // Get all unique roles from current players
      const uniqueRoles = new Set(state.players.map(p => p.roleId));
      
      // Build current night turns based on actual player roles
      const rolesWithPrompts = [];
      
      for (const roleId of uniqueRoles) {
        const roleDef = ROLES[roleId];
        if (!roleDef || roleDef.actsAtNight === 'never') continue;
        
        const rolePlayers = state.players.filter(p => p.roleId === roleId);
        if (rolePlayers.length === 0) continue;
        
        // Skip roles that have already been called this night
        if (calledRoles.has(roleId)) continue;
        
        const roleInfo = {
          roleId,
          roleDef,
          players: rolePlayers,
          phaseOrder: roleDef.phaseOrder !== undefined ? roleDef.phaseOrder : 'any'
        };
        
        rolesWithPrompts.push(roleInfo);
      }
      
      // Sort by phase order
      rolesWithPrompts.sort(NightPhaseManager.compareRolesByPhaseOrder);
      
      // Return the first role that hasn't been called yet
      if (rolesWithPrompts.length === 0) {
        console.log(`🌙 [DEBUG] getCurrentTurn - No more roles to call for this night`);
        return null;
      }
      
      const nextRole = rolesWithPrompts[0];
      const turn = {
        kind: 'group' as const,
        roleId: nextRole.roleId,
        playerIds: nextRole.players.map(p => p.id)
      };
      
      console.log(`🌙 [DEBUG] getCurrentTurn - Next role to call: ${nextRole.roleId} (phaseOrder: ${nextRole.phaseOrder})`);
      return turn;
      
    } catch (error) {
      console.error(`🌙 [DEBUG] Error in getCurrentTurn:`, error);
      return null;
    }
  }
}
