import type { GameState, RolesRegistry, NightContext } from '../../types';
import { ROLES } from '../../roles';
import { GameStateManager } from './GameStateManager';
import { RoleConstraintManager } from './RoleConstraintManager';

export class NightPhaseManager {
  
  static beginNight(state: GameState, roles: RolesRegistry): void {
    console.log(`🌙 [DEBUG] beginNight - Starting night ${state.nightNumber + 1}`);
    
    state.nightNumber += 1;
    GameStateManager.initializeNightTracking(state, state.nightNumber);
    
    state.night = { 
      turns: [],
      currentIndex: 0,
      context: { 
        pendingKills: {}, 
        savesBy: [], 
        checks: [],
        calledRoles: []
      }, 
      summary: null 
    } as any;
    
    state.phase = 'night';
    
    NightPhaseManager.processRoleGroupings(state, roles);
  }

  static resumeNight(state: GameState, roles: RolesRegistry): void {
    console.log(`🌙 [DEBUG] resumeNight - Resuming night ${state.nightNumber}`);
    
    if (!state.night?.context) {
      console.warn(`🌙 [WARNING] resumeNight - No night context found, initializing new night`);
      this.beginNight(state, roles);
      return;
    }
    
    // Ensure calledRoles is synchronized with completed turns
    if (state.night.turns.length > 0) {
      const completedRoles = new Set();
      for (const turn of state.night.turns) {
        if (turn.roleId) {
          completedRoles.add(turn.roleId);
        }
      }
      
      // Update calledRoles to reflect completed turns
      if (state.night.context.calledRoles) {
        state.night.context.calledRoles = Array.from(completedRoles) as string[];
      }
      
      console.log(`🌙 [DEBUG] resumeNight - Synchronized calledRoles with ${completedRoles.size} completed roles:`, Array.from(completedRoles));
    }
    
    // Always reprocess role groupings when resuming to ensure effects are properly applied
    console.log(`🌙 [DEBUG] resumeNight - Reprocessing role groupings for resume`);
    NightPhaseManager.processRoleGroupings(state, roles);
    
    // Reapply passive effects for all roles that should have them active
    NightPhaseManager.reapplyPassiveEffects(state, roles);
    
    console.log(`🌙 [DEBUG] resumeNight - Resuming existing night with ${state.night.turns.length} turns and ${state.groupings?.length || 0} groupings`);
  }

  private static processRoleGroupings(state: GameState, roles: RolesRegistry): void {
    if (!state.groupings) {
      state.groupings = [];
    }
    
    state.groupings = [];
    
    for (const player of state.players) {
      const roleDef = roles[player.roleId];
      if (roleDef && typeof roleDef.groups === 'function') {
        try {
          const groupings = roleDef.groups(state);
          if (Array.isArray(groupings)) {
            state.groupings.push(...groupings);
          }
        } catch (error) {
          console.error(`Error in groups function for role ${player.roleId}:`, error);
        }
      }
    }
    
    console.log(`🌙 [DEBUG] processRoleGroupings - Processed groupings:`, state.groupings);
  }

  static nextRole(state: GameState): any {
    if (!state.night?.context) return null;
    
    const availableRoles = this.getAvailableRoles(state);
    
    if (availableRoles.length === 0) {
      return null;
    }
    
    const nextRole = availableRoles[0];
    
    this.processPassiveEffects(nextRole, state);
    
    if (nextRole.roleDef.actsAtNight !== 'never') {
      state.night.context.currentRoleId = nextRole.roleId;
      
      return {
        roleId: nextRole.roleId,
        kind: 'group',
        playerIds: nextRole.players.map((p: any) => p.id)
      };
    }
    
    this.completeRole(nextRole, state);
    return this.nextRole(state);
  }

  private static getAvailableRoles(state: GameState): any[] {
    // Get current unique roles dynamically (in case roles changed during the night)
    const uniqueRoles = new Set(state.players.map((p: any) => p.roleId));
    
    return Array.from(uniqueRoles)
      .filter((roleId: string) => !state.night?.context?.calledRoles.includes(roleId))
      .map(roleId => ({
        roleId,
        roleDef: ROLES[roleId],
        players: RoleConstraintManager.getPlayersForRole(roleId, state)
      }))
      .filter(role => role.roleDef && role.players.length > 0)
      .sort((a, b) => {
        const aOrder = a.roleDef.phaseOrder;
        const bOrder = b.roleDef.phaseOrder;
        
        if (aOrder === "any" && bOrder === "any") {
          return a.roleId.localeCompare(b.roleId);
        }
        if (aOrder === "any") return 1;
        if (bOrder === "any") return -1;
        
        return Number(aOrder) - Number(bOrder);
      });
  }

  private static getPlayersForRole(roleId: string, state: GameState): any[] {
    // Use the centralized function from RoleConstraintManager
    return RoleConstraintManager.getPlayersForRole(roleId, state);
  }

  private static processPassiveEffects(roleInfo: any, state: GameState): void {
    const { roleDef, players } = roleInfo;
    
    if (typeof roleDef.passiveEffect === 'function') {
      for (const player of players) {
        if (player.alive) {
          try {
            const result = roleDef.passiveEffect(state as any, player);
            if (result != null) {
              if (!(state as any).history[state.nightNumber]) {
                (state as any).history[state.nightNumber] = {};
              }
              (state as any).history[state.nightNumber][roleInfo.roleId] = result;
            }
          } catch (error) {
            console.error(`Error in passive effect for ${roleInfo.roleId}:`, error);
          }
        }
      }
    }
  }

  private static completeRole(roleInfo: any, state: GameState): void {
    if (state.night?.context) {
      // Check if this role has already been completed to prevent duplicates
      if (state.night.context.calledRoles.includes(roleInfo.roleId)) {
        console.log(`🌙 [DEBUG] Role ${roleInfo.roleId} already completed, skipping duplicate`);
        return;
      }
      
      // Check if this role is already in turns array to prevent duplicate entries
      const existingTurn = state.night.turns.find(turn => turn.roleId === roleInfo.roleId);
      if (existingTurn) {
        console.log(`🌙 [DEBUG] Role ${roleInfo.roleId} already in turns array, skipping duplicate`);
        return;
      }
      
      state.night.turns.push({
        roleId: roleInfo.roleId,
        playerIds: roleInfo.players.map((p: any) => p.id)
      } as any);
      
      state.night.context.calledRoles.push(roleInfo.roleId);
    }
  }

  static recordNightResult(state: GameState, result: any): void {
    if (!state.night?.context) return;
    
    const currentRoleId = state.night.context.currentRoleId;
    if (!currentRoleId) return;
    
    const allPlayers = NightPhaseManager.getPlayersForRole(currentRoleId, state);
    const playerIds = allPlayers.map(p => p.id);
    
    // Get the role definition from the actual player's current role (handles transformations)
    const actualRoleId = allPlayers[0]?.roleId || currentRoleId;
    const roleDef = ROLES[actualRoleId];
    
    console.log(`🔄 [DEBUG] recordNightResult - currentRoleId: ${currentRoleId}, actualRoleId: ${actualRoleId}`);
    console.log(`🔄 [DEBUG] recordNightResult - allPlayers:`, allPlayers.map(p => ({ id: p.id, name: p.name, roleId: p.roleId, actsAtNight: p.roleState?.actsAtNight })));
    console.log(`🔄 [DEBUG] recordNightResult - roleDef:`, roleDef?.id, roleDef?.name);
    
    const isFirstNightSkipped = state.settings?.skipFirstNightActions && state.nightNumber === 1;
    
    if (!isFirstNightSkipped) {
      GameStateManager.initializeHistory(state, state.nightNumber);
      NightPhaseManager.processNightActionResult(state, {
        roleId: actualRoleId, // Use actual role ID
        kind: 'group',
        playerIds: playerIds
      }, result, roleDef, playerIds);
    }
    
    NightPhaseManager.completeRole({
      roleId: actualRoleId, // Use actual role ID
      roleDef,
      players: allPlayers
    }, state);
    
    delete state.night.context.currentRoleId;
  }

  private static processNightActionResult(state: GameState, entry: any, result: any, roleDef: any, playerIds: number[]): void {
    if (result?.skipped === true) {
      (state as any).history[state.nightNumber][entry.roleId] = "skipped";
    } else if (result?.blocked === true) {
      (state as any).history[state.nightNumber][entry.roleId] = "blocked";
    } else {
      const constraintCheck = RoleConstraintManager.checkRoleConstraints(state, entry.roleId, playerIds);
      
      if (constraintCheck !== null) {
        (state as any).history[state.nightNumber][entry.roleId] = constraintCheck;
      } else if (RoleConstraintManager.isRoleUsed(result)) {
        NightPhaseManager.recordRoleUsage(state, entry, result, roleDef, playerIds);
      } else {
        (state as any).history[state.nightNumber][entry.roleId] = "skipped";
      }
    }
  }

  private static recordRoleUsage(state: GameState, entry: any, result: any, roleDef: any, playerIds: number[]): void {
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
    
    if (roleDef?.resolve) {
      const roleHistory = roleDef.resolve(state as any, action);
      if (roleHistory) {
        (state as any).history[state.nightNumber][entry.roleId] = roleHistory;
      } else {
        (state as any).history[state.nightNumber][entry.roleId] = NightPhaseManager.createGenericHistory(entry, result, playerIds, state.nightNumber);
      }
    } else {
      (state as any).history[state.nightNumber][entry.roleId] = NightPhaseManager.createGenericHistory(entry, result, playerIds, state.nightNumber);
    }
  }

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

  static resolveNight(state: GameState, roles: RolesRegistry): void {
    if (!state.night?.context) return;
    
    const summary = NightPhaseManager.createNightSummary(state);
    state.night.summary = summary;
    GameStateManager.recordNightDeaths(state, state.nightNumber, summary.died);
  }

  private static createNightSummary(state: GameState): any {
    const context = state.night?.context;
    if (!context) return { died: [], saved: [], targeted: [], resurrected: [], checks: [] };
    
    const deadAtNightStart = (state as any).deadAtNightStart?.[state.nightNumber] || [];
    
    const summary: any = {
      died: [],
      saved: [],
      targeted: [],
      resurrected: [],
      checks: context.checks || []
    };

    if (context.pendingKills) {
      for (const [playerId, kills] of Object.entries(context.pendingKills)) {
        const pid = Number(playerId);
        const player = state.players.find(p => p.id === pid);
        if (player && player.alive && (kills as any[]).length > 0) {
          summary.died.push(pid);
          player.alive = false;
        }
      }
    }

    if (context.savesBy) {
      for (const save of context.savesBy) {
        if (typeof save === 'object' && save !== null && 'target' in save) {
          const target = (save as any).target;
          if (!summary.saved.includes(target)) {
            summary.saved.push(target);
          }
        }
      }
    }

    if (context.targeted) {
      summary.targeted = [...context.targeted];
    }

    for (const playerId of deadAtNightStart) {
      const player = state.players.find(p => p.id === playerId);
      if (player && player.alive) {
        summary.resurrected.push(playerId);
      }
    }

    return summary;
  }

  static startNextNight(state: GameState, roles: RolesRegistry): void {
    NightPhaseManager.beginNight(state, roles);
  }

  private static reapplyPassiveEffects(state: GameState, roles: RolesRegistry): void {
    console.log(`🌙 [DEBUG] reapplyPassiveEffects - Reapplying passive effects for all roles`);
    
    const uniqueRoles = new Set(state.players.map((p: any) => p.roleId));
    
    for (const roleId of uniqueRoles) {
      const roleDef = roles[roleId];
      if (roleDef && typeof roleDef.passiveEffect === 'function') {
        const players = state.players.filter((p: any) => p.roleId === roleId);
        
        for (const player of players) {
          if (player.alive) {
            try {
              console.log(`🌙 [DEBUG] reapplyPassiveEffects - Reapplying passive effect for ${roleId} player ${player.name}`);
              const result = roleDef.passiveEffect(state as any, player);
              if (result != null) {
                if (!(state as any).history[state.nightNumber]) {
                  (state as any).history[state.nightNumber] = {};
                }
                (state as any).history[state.nightNumber][roleId] = result;
              }
            } catch (error) {
              console.error(`Error reapplying passive effect for ${roleId}:`, error);
            }
          }
        }
      }
    }
    
    console.log(`🌙 [DEBUG] reapplyPassiveEffects - Completed reapplying passive effects`);
  }
}
