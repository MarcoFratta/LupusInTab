import type { GameState, RolesRegistry } from '../../types';
import { PlayerManager } from './PlayerManager';
import { WinConditionManager } from './WinConditionManager';

/**
 * DayPhaseManager - Responsible for day phase logic and execution
 * Following Single Responsibility Principle
 */
export class DayPhaseManager {
  
  /**
   * Continue from night resolution to day phase
   */
  static continueToDay(state: GameState, roles: RolesRegistry): void {
    // Check if game should end before starting day
    if (!WinConditionManager.validateGameContinuation(state, roles)) {
      return; // Game has ended
    }
    
    // Call restore functions for all roles that have them, in reverse order of night phase execution
    DayPhaseManager.callRestoreFunctions(state, roles);
    
    state.dayNumber += 1;
    state.phase = 'day';
  }

  /**
   * Call restore functions for roles in reverse order
   */
  private static callRestoreFunctions(state: GameState, roles: RolesRegistry): void {
    if (state.night && state.night.turns && state.night.turns.length > 0) {
      const rolesWithRestore = state.night.turns
        .map(turn => ({ turn, role: roles[turn.roleId] }))
        .filter(({ role }) => role && typeof role.restoreFunction === 'function')
        .reverse(); // Reverse order so higher phase numbers (later night actions) restore first
      
      for (const { role } of rolesWithRestore) {
        try {
          role.restoreFunction!(state);
        } catch (error) {
          console.error('Error in restore function:', error);
        }
      }
    }
  }

  /**
   * Lynch a player during the day phase
   */
  static lynchPlayer(state: GameState, playerId: number): void {
    const target = PlayerManager.lynchPlayer(state, playerId);
    if (!target) return;
    
    // Store day event in history
    if (!state.history) state.history = {} as any;
    
    // Check for immediate win condition (like Matto being lynched)
    WinConditionManager.checkImmediateWinOnLynch(state, playerId);
  }

  /**
   * Complete the day phase and prepare for next phase
   */
  static completeDay(state: GameState, roles: RolesRegistry): void {
    if (state.phase === 'end' || state.winner) return;
    
    // Check win conditions before transitioning
    if (!WinConditionManager.validateGameContinuation(state, roles)) {
      return; // Game has ended
    }
    
    // Move to pre-night confirmation screen
    state.phase = 'preNight';
  }

  /**
   * Handle voting logic (can be extended for more complex voting systems)
   */
  static processVote(state: GameState, voterId: number, targetId: number): boolean {
    const voter = PlayerManager.findPlayer(state, voterId);
    const target = PlayerManager.findPlayer(state, targetId);
    
    if (!voter || !voter.alive || !target || !target.alive) {
      return false;
    }
    
    // Basic voting logic - can be extended
    // For now, just record the vote (implementation depends on voting system)
    
    return true;
  }

  /**
   * Get voting power for a player (considering roles like Sindaco)
   */
  static getVotingPower(state: GameState, playerId: number): number {
    const player = PlayerManager.findPlayer(state, playerId);
    if (!player || !player.alive) return 0;
    
    // Sindaco has double voting power
    if ((state as any).sindacoId === playerId) {
      return 2;
    }
    
    return 1;
  }

  /**
   * Check if a player can vote
   */
  static canPlayerVote(state: GameState, playerId: number): boolean {
    const player = PlayerManager.findPlayer(state, playerId);
    return player ? player.alive : false;
  }

  /**
   * Get all players eligible for voting
   */
  static getEligibleVoters(state: GameState): number[] {
    return state.players
      .filter(p => p.alive)
      .map(p => p.id);
  }

  /**
   * Get all players eligible to be voted for (usually all alive players)
   */
  static getEligibleTargets(state: GameState): number[] {
    return state.players
      .filter(p => p.alive)
      .map(p => p.id);
  }
}
