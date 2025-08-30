import type { GameState, RolesRegistry } from '../../types';
import { GameStateManager } from './GameStateManager';
import { ROLES } from '../../roles';

/**
 * WinConditionManager - Responsible for all win condition logic
 * Following Single Responsibility Principle
 */
export class WinConditionManager {
  
  /**
   * Compute winner based on simple team count logic
   */
  static computeWinner(state: GameState): GameState['winner'] {
    const alive = GameStateManager.getAlivePlayers(state);
    if (alive.length === 0) return 'tie';
    
    const teams = new Set<string>();
    for (const p of alive) {
      const def = ROLES[p.roleId];
      if (!def) continue;
      const team = p.roleState?.realTeam || def.team;
      teams.add(team);
    }
    
    if (teams.size === 1) {
      return Array.from(teams)[0];
    }
    
    return null;
  }

  /**
   * Evaluate custom win conditions by checking role-specific win functions
   * Returns the winning team id, or null if no winner
   */
  static evaluateWinner(state: GameState, roles: RolesRegistry): string[] | null {
    const alivePlayers = GameStateManager.getAlivePlayers(state);
    if (alivePlayers.length === 0) return null;
    
    // First, check if any role's checkWinConstraint blocks all wins
    for (const p of alivePlayers) {
      const def = roles[p.roleId];
      if (def && typeof def.checkWinConstraint === 'function') {
        try {
          if (def.checkWinConstraint(state as any)) {
            return null; // This role blocks all wins
          }
        } catch (error) {
          console.error(`Error in checkWinConstraint for role ${p.roleId}:`, error);
        }
      }
    }
    
    // Let roles declare their faction win
    const winningTeams = new Set<string>();
    for (const p of alivePlayers) {
      const def = roles[p.roleId];
      if (def && typeof def.checkWin === 'function') {
        try {
          if (def.checkWin(state as any)) {
            const team = p.roleState?.realTeam || def.team;
            if (team) {
              winningTeams.add(team);
            }
          }
        } catch (error) {
          console.error(`Error in checkWin for role ${p.roleId}:`, error);
        }
      }
    }
    
    return winningTeams.size > 0 ? Array.from(winningTeams) : null;
  }

  /**
   * Check if the game should end after a specific event (like lynching)
   * Returns the winner if game should end, null otherwise
   */
  static checkGameEndCondition(state: GameState, roles: RolesRegistry): string[] | null {
    // Check for immediate win conditions first (like Matto being lynched)
    if (state.winner) return Array.isArray(state.winner) ? state.winner : [state.winner];
    
    // Check custom win conditions
    const customWinners = WinConditionManager.evaluateWinner(state, roles);
    if (customWinners) return customWinners;
    
    // Check basic win conditions
    const basicWinner = WinConditionManager.computeWinner(state);
    return basicWinner ? [basicWinner] : null;
  }

  /**
   * Handle immediate win condition for specific roles (like Matto when lynched)
   */
  static checkImmediateWinOnLynch(state: GameState, lynchedPlayerId: number): boolean {
    const target = state.players.find(p => p.id === lynchedPlayerId);
    if (!target) return false;
    
    const roleTeam = target.roleState?.realTeam;
    if (roleTeam === 'matti') {
      state.winner = 'matti';
      state.phase = 'end';
      return true;
    }
    
    return false;
  }

  /**
   * Validate if the game can continue or should end
   * Sets the winner and phase if game should end
   */
  static validateGameContinuation(state: GameState, roles: RolesRegistry): boolean {
    const winners = WinConditionManager.checkGameEndCondition(state, roles);
    if (winners) {
      state.winner = winners;
      state.phase = 'end';
      return false; // Game should end
    }
    return true; // Game can continue
  }
}
