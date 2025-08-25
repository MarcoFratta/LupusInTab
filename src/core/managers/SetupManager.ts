import type { GameState, Player } from '../../types';
import { ROLES } from '../../roles';
import { PlayerManager } from './PlayerManager';

/**
 * SetupManager - Responsible for game setup and initialization
 * Following Single Responsibility Principle
 */
export class SetupManager {
  
  /**
   * Initialize setup players array
   */
  static initSetupPlayers(state: GameState): void {
    state.setup.players = Array.from(
      { length: state.setup.numPlayers }, 
      (_, i) => ({ name: `Giocatore ${i + 1}` })
    );
    SetupManager.initDefaultRolesCounts(state);
  }

  /**
   * Initialize default role counts based on number of players
   */
  static initDefaultRolesCounts(state: GameState): void {
    const n = state.setup.numPlayers;
    
    // Special case: 9 players get a specific balanced setup
    if (n === 9) {
      state.setup.rolesCounts = { 
        veggente: 1, 
        medium: 1, 
        guardia: 1, 
        lupo: 2, 
        indemoniato: 1, 
        massone: 2, 
        villico: 1 
      } as Record<string, number>;
    } else {
      // Default logic for other player counts
      const lupi = Math.max(SetupManager.getMinCountForRole(state, 'lupo'), Math.floor(n / 4));
      const guardia = n >= 5 ? Math.max(SetupManager.getMinCountForRole(state, 'guardia'), 1) : 0;
      const veggente = n >= 6 ? Math.max(SetupManager.getMinCountForRole(state, 'veggente'), 1) : 0;
      const insinuo = n >= 7 ? Math.max(SetupManager.getMinCountForRole(state, 'insinuo'), 1) : 0;
      const used = lupi + guardia + veggente + insinuo;
      const villico = Math.max(0, n - used);
      
      state.setup.rolesCounts = { lupo: lupi, guardia, veggente, insinuo, villico } as Record<string, number>;
    }
    
    if (!state.setup.rolesEnabled) {
      // Enable roles based on player count
      if (n === 9) {
        state.setup.rolesEnabled = { 
          lupo: true, 
          villico: true, 
          guardia: true, 
          veggente: true, 
          massone: true, 
          matto: false, 
          giustiziere: false, 
          boia: false, 
          medium: true, 
          lupomannaro: false, 
          indemoniato: true, 
          insinuo: false, 
          barabba: false, 
          angelo: false, 
          genio: false,
          parassita: false,
          simbionte: false
        } as Record<string, boolean>;
      } else {
        state.setup.rolesEnabled = { 
          lupo: true, 
          villico: true, 
          guardia: true, 
          veggente: true, 
          massone: false, 
          matto: false, 
          giustiziere: false, 
          boia: false, 
          medium: false, 
          lupomannaro: false, 
          indemoniato: false, 
          insinuo: false, 
          barabba: false, 
          angelo: false, 
          genio: false,
          parassita: false,
          simbionte: false
        } as Record<string, boolean>;
      }
    }
    
    // Normalize role counts to respect rolesEnabled setting
    SetupManager.normalizeRoleCounts(state);
  }

  /**
   * Resize the number of players and adjust role counts accordingly
   */
  static resizePlayers(state: GameState, nextCount: number): void {
    const n = Math.max(4, Math.min(20, Number(nextCount) || 0));
    state.setup.numPlayers = n;
    const current = state.setup.players.length;
    
    if (n > current) {
      for (let i = current; i < n; i += 1) {
        state.setup.players.push({ name: `Giocatore ${i + 1}` });
      }
    } else if (n < current) {
      state.setup.players.splice(n);
    }
    
    // Recalculate role counts after changing player count
    SetupManager.initDefaultRolesCounts(state);
  }

  /**
   * Normalize role counts based on enabled roles and constraints
   */
  static normalizeRoleCounts(state: GameState): void {
    const roles = state.setup.rolesCounts;
    const enabled = state.setup.rolesEnabled || {};
    
    for (const key of Object.keys(roles)) {
      if (enabled && enabled[key] === false) {
        roles[key] = 0;
      } else {
        const min = SetupManager.getMinCountForRole(state, key);
        const max = SetupManager.getMaxCountForRole(state, key);
        const current = Math.floor(Number(roles[key]) || 0);
        
        if (current < min) {
          roles[key] = min;
        } else if (current > max) {
          roles[key] = max;
        } else {
          roles[key] = Math.max(0, current);
        }
      }
    }
  }

  /**
   * Update the count for a specific role
   */
  static updateRoleCount(state: GameState, roleId: string, count: number): void {
    const counts = state.setup.rolesCounts;
    const min = SetupManager.getMinCountForRole(state, roleId);
    const max = SetupManager.getMaxCountForRole(state, roleId);
    const next = Math.floor(Number(count) || 0);
    
    if (next === 0 && min > 0) {
      // Cannot set to 0 if role has minimum count requirement
      counts[roleId] = min;
    } else if (next === 0) {
      counts[roleId] = 0;
    } else if (next < min) {
      counts[roleId] = min;
    } else if (next > max) {
      counts[roleId] = max;
    } else {
      counts[roleId] = next;
    }
  }

  /**
   * Get maximum count for a role
   */
  static getMaxCountForRole(state: GameState, roleId: string): number {
    const n = state.setup.numPlayers;
    const roleDef = (ROLES as any)?.[roleId] as any;
    const maxFromDef = roleDef?.maxCount;
    
    if (typeof maxFromDef === 'function') {
      return maxFromDef(state);
    }
    if (typeof maxFromDef === 'number') {
      return maxFromDef;
    }
    return n;
  }

  /**
   * Get minimum count for a role
   */
  static getMinCountForRole(state: GameState, roleId: string): number {
    const roleDef = (ROLES as any)?.[roleId] as any;
    const minFromDef = roleDef?.minCount;
    
    if (typeof minFromDef === 'function') {
      return minFromDef(state);
    }
    if (typeof minFromDef === 'number') {
      return minFromDef;
    }
    return 0;
  }

  /**
   * Set whether a role is enabled or disabled
   */
  static setRoleEnabled(state: GameState, roleId: string, enabled: boolean): void {
    if (!state.setup.rolesEnabled) state.setup.rolesEnabled = {} as any;
    
    // Core roles cannot be disabled
    if (roleId === 'lupo' || roleId === 'villico') {
      state.setup.rolesEnabled[roleId] = true;
      SetupManager.normalizeRoleCounts(state);
      return;
    }
    
    state.setup.rolesEnabled[roleId] = !!enabled;
    
    if (!enabled) {
      state.setup.rolesCounts[roleId] = 0;
    } else {
      const min = SetupManager.getMinCountForRole(state, roleId);
      if (min > 0) {
        state.setup.rolesCounts[roleId] = min;
      }
    }
    
    SetupManager.normalizeRoleCounts(state);
  }

  /**
   * Validate and fix role counts to match player count
   */
  static validateAndFixRoleCounts(state: GameState): void {
    const totalRoles = Object.values(state.setup.rolesCounts).reduce((sum, count) => sum + (count || 0), 0);
    const numPlayers = state.setup.numPlayers;
    
    if (totalRoles !== numPlayers) {
      const currentVillici = state.setup.rolesCounts['villico'] || 0;
      const neededVillici = numPlayers - totalRoles + currentVillici;
      
      if (neededVillici > 0) {
        state.setup.rolesCounts['villico'] = neededVillici;
      } else if (neededVillici < 0) {
        console.warn(`Too many roles (${totalRoles}) for ${numPlayers} players. This shouldn't happen.`);
      }
    }
  }

  /**
   * Setup the game with specific role counts
   */
  static setupGame(state: GameState, rolesCounts: Record<string, number>): void {
    const players = PlayerManager.createPlayersFromRoleCounts(rolesCounts);
    
    state.players = players;
    state.setup.rolesCounts = rolesCounts;
    state.setup.numPlayers = players.length;
    state.setup.players = players.map(p => ({ name: p.name }));
  }

  /**
   * Begin the reveal phase by assigning roles to players
   */
  static beginReveal(state: GameState, roleList: any[], shuffled: (a: string[]) => string[]): void {
    SetupManager.validateAndFixRoleCounts(state);
    
    const pool: string[] = [];
    
    for (const role of roleList) {
      const count = state.setup.rolesCounts[role.id] || 0;
      const isEnabled = state.setup.rolesEnabled?.[role.id] !== false;
      if (count > 0 && isEnabled) {
        for (let i = 0; i < count; i += 1) pool.push(role.id);
      }
    }
    
    if (pool.length !== state.setup.numPlayers) {
      console.error(`Critical error: Role pool size (${pool.length}) doesn't match player count (${state.setup.numPlayers})`);
      console.error('Role counts:', state.setup.rolesCounts);
      console.error('Roles enabled:', state.setup.rolesEnabled);
      
      const missingRoles = state.setup.numPlayers - pool.length;
      if (missingRoles > 0) {
        console.warn(`Attempting to fix by adding ${missingRoles} villico roles`);
        for (let i = 0; i < missingRoles; i++) {
          pool.push('villico');
        }
      }
    }
    
    const randomized = shuffled(pool);
    
    state.players = state.setup.players.map((p, idx) => {
      const roleId = randomized[idx];
      if (!roleId) {
        console.error(`No role available for player ${p.name} at index ${idx}`);
        console.error('Pool size:', pool.length, 'Player count:', state.setup.numPlayers);
      }
      
      return { 
        id: idx + 1, 
        name: p.name?.trim() || `Giocatore ${idx + 1}`, 
        roleId: roleId || 'villico',
        alive: true,
        roleState: {} as any
      };
    });
    
    // Initialize role states for each player
    for (const player of state.players) {
      const roleDef = ROLES[player.roleId];
      if (roleDef) {
        PlayerManager.initializePlayerRoleState(player, roleDef);
      } else {
        console.error(`Unknown roleId: ${player.roleId} for player ${player.name}`);
        console.error('Available roles:', Object.keys(ROLES));
      }
    }
    
    // Adjust startNight values if first night actions are skipped
    PlayerManager.adjustStartNightForFirstNightSkip(state);
    
    state.revealIndex = 0;
    state.phase = 'revealRoles';
  }

  /**
   * Move to next player in reveal phase
   */
  static nextReveal(state: GameState, onEnd: () => void): void {
    if (state.revealIndex < state.players.length - 1) {
      state.revealIndex += 1;
    } else {
      onEnd();
    }
  }
}
