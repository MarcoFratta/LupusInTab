import type { GameState, RolesRegistry, NightContext } from '../../types';
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
    
    GameStateManager.initializeNightTracking(state, state.nightNumber);
    
    const nightContext: NightContext = { 
      pendingKills: {}, 
      savesBy: [], 
      checks: [],
      calledRoles: []
    };
    
    state.night = { 
      turns: [],
      currentIndex: 0,
      context: nightContext, 
      summary: null 
    } as any;
    
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
   * Record the result of a night action and move to the next role
   * Record the result of a night action and move to the next role
   */
  static recordNightResult(state: GameState, result: any): void {
    if (!state.night) {
      console.warn(`🌙 [WARNING] recordNightResult - No night state, creating one`);
      NightPhaseManager.beginNight(state, {} as any);
      // After creating night state, we need to get the current turn again
      const currentTurn = NightPhaseManager.getCurrentTurn(state);
      if (!currentTurn) {
        state.phase = 'resolve';
        return;
      }
    }
    
    if (!state.night.context) {
      console.warn(`🌙 [WARNING] recordNightResult - No night context, creating one`);
      state.night.context = {
        pendingKills: {},
        savesBy: [],
        checks: [],
        calledRoles: []
      };
    }

    try {
      // Get the current turn that was just completed
      const currentTurn = NightPhaseManager.getCurrentTurn(state);
      if (!currentTurn) {
        state.phase = 'resolve';
        return;
      }

      const { calledRoles } = state.night.context;
      
      // Ensure calledRoles is always an array
      if (!Array.isArray(calledRoles)) {
        console.warn(`🌙 [WARNING] recordNightResult - calledRoles is not an array, converting from:`, calledRoles);
        
        // Convert to array if it's a Set or other type
        let rolesArray: string[] = [];
        if (calledRoles instanceof Set) {
          rolesArray = Array.from(calledRoles);
        } else if (calledRoles && typeof calledRoles === 'object') {
          // Handle case where it might be a reactive proxy
          try {
            rolesArray = Array.from(calledRoles as any);
          } catch (e) {
            console.warn(`🌙 [WARNING] Failed to convert calledRoles to array:`, e);
            rolesArray = [];
          }
        }
        
        // Create a new array and replace the corrupted one
        state.night.context.calledRoles = rolesArray;
        console.log(`🌙 [INFO] Successfully converted calledRoles to array with ${rolesArray.length} items`);
      }
      
      const roleDef = ROLES[currentTurn.roleId];
      const playerIds = currentTurn.playerIds || [];
      
      // Check if this is the first night and first night actions are skipped
      const isFirstNightSkipped = state.settings?.skipFirstNightActions && state.nightNumber === 1;
      
      if (!isFirstNightSkipped) {
        // Apply passive effects BEFORE processing the role's action
        // This ensures immunities and other passive effects are applied before kills are recorded
        NightPhaseManager.applyRolePassiveEffects(state, currentTurn.roleId, playerIds);
        
        // Initialize history for this night
        GameStateManager.initializeHistory(state, state.nightNumber);

        // Process the result and update history
        NightPhaseManager.processNightActionResult(state, currentTurn, result, roleDef, playerIds);
      }
      
      // Record this turn in the night.turns array for proper restore order
      if (!state.night.turns) state.night.turns = [];
      state.night.turns.push({
        roleId: currentTurn.roleId,
        playerIds: currentTurn.playerIds || [],
        phaseOrder: roleDef?.phaseOrder,
        timestamp: Date.now()
      });
      
      // Mark this role as called for this night
      state.night.context.calledRoles.push(currentTurn.roleId);
      
      // Check if there are more roles to call
      const nextTurn = NightPhaseManager.getCurrentTurn(state);
      if (!nextTurn) {
        state.phase = 'resolve';
      }
      
    } catch (error) {
      console.error(`🌙 [DEBUG] Error in recordNightResult:`, error);
    }
  }

  /**
   * Apply passive effects for a specific role before processing their action
   * This ensures immunities and other passive effects are applied before kills are recorded
   */
  private static applyRolePassiveEffects(state: GameState, roleId: string, playerIds: number[]): void {
    const roleDef = ROLES[roleId];
    if (!roleDef || typeof roleDef.passiveEffect !== 'function') return;
    
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
    
    // Ensure night context is properly initialized
    if (!state.night.context) {
      state.night.context = {
        pendingKills: {},
        savesBy: [],
        checks: [],
        calledRoles: []
      };
    }
    
    if (state.night.context) {
      const summary = NightPhaseManager.createNightSummary(state);
      state.night.summary = summary;
      GameStateManager.recordNightDeaths(state, state.nightNumber, summary.died);
    }
  }

  /**
   * Apply passive effects for a specific role before processing their action
   * This ensures immunities and other passive effects are applied before kills are recorded
   */
  private static applyRolePassiveEffects(state: GameState, roleId: string, playerIds: number[]): void {
    const roleDef = ROLES[roleId];
    if (!roleDef || typeof roleDef.passiveEffect !== 'function') return;
    
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
   * Get the next role that should be called based on current player roles and phase order
   */
  static getCurrentTurn(state: GameState): any {
    if (!state.night) {
      console.warn(`🌙 [WARNING] getCurrentTurn - No night state, creating one`);
      NightPhaseManager.beginNight(state, {} as any);
      return null;
    }
    
    if (!state.night.context) {
      console.warn(`🌙 [WARNING] getCurrentTurn - No night context, creating one`);
      state.night.context = {
        pendingKills: {},
        savesBy: [],
        checks: [],
        calledRoles: []
      };
    }
    
    try {
      const { calledRoles } = state.night.context;
      
      if (!Array.isArray(calledRoles)) {
        console.warn(`🌙 [WARNING] getCurrentTurn - calledRoles is not an array, converting from:`, calledRoles);
        
        let rolesArray: string[] = [];
        if (calledRoles instanceof Set) {
          rolesArray = Array.from(calledRoles);
        } else if (calledRoles && typeof calledRoles === 'object') {
          try {
            rolesArray = Array.from(calledRoles as any);
          } catch (e) {
            console.warn(`🌙 [WARNING] Failed to convert calledRoles to array:`, e);
            rolesArray = [];
          }
        }
        
        state.night.context.calledRoles = rolesArray;
        console.log(`🌙 [INFO] Successfully converted calledRoles to array with ${rolesArray.length} items`);
      }
      
      const uniqueRoles = new Set(state.players.map(p => p.roleId));
      const availableRoles = [];
      
      for (const roleId of uniqueRoles) {
        const roleDef = ROLES[roleId];
        if (!roleDef) {
          continue;
        }
        
        const rolePlayers = state.players.filter(p => p.roleId === roleId);
        if (rolePlayers.length === 0) {
          continue;
        }
        
        if (state.night.context.calledRoles.includes(roleId)) {
          continue;
        }
        
        const roleInfo = {
          roleId,
          roleDef,
          players: rolePlayers,
          phaseOrder: roleDef.phaseOrder !== undefined ? roleDef.phaseOrder : 'any'
        };
        
        availableRoles.push(roleInfo);
      }
      
      if (availableRoles.length === 0) {
        return null;
      }
      
      availableRoles.sort(NightPhaseManager.compareRolesByPhaseOrder);
      
      // Find the first role that actually needs a prompt (not actsAtNight: "never")
      const nextRole = availableRoles.find(role => role.roleDef.actsAtNight !== 'never');
      
      if (!nextRole) {
        // All remaining roles are actsAtNight: "never", mark them as called
        for (const role of availableRoles) {
          if (!state.night.context.calledRoles.includes(role.roleId)) {
            state.night.context.calledRoles.push(role.roleId);
          }
        }
        return null;
      }
      
      const turn = {
        kind: 'group' as const,
        roleId: nextRole.roleId,
        playerIds: nextRole.players.map(p => p.id)
      };
      
      return turn;
      
    } catch (error) {
      console.error(`🌙 [DEBUG] Error in getCurrentTurn:`, error);
      return null;
    }
  }
}
