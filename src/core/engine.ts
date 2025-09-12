import type { GameState, Player, RolesRegistry } from '../types';
import { 
  GameStateManager,
  WinConditionManager,
  PlayerManager,
  RoleConstraintManager,
  SetupManager,
  NightPhaseManager,
  DayPhaseManager
} from './managers/index';

// Re-export main functions for backward compatibility
export const createEmptyState = GameStateManager.createEmptyState;
export const getAlivePlayers = GameStateManager.getAlivePlayers;
export const getAliveTeams = GameStateManager.getAliveTeams;

// Setup functions
export const initSetupPlayers = SetupManager.initSetupPlayers;
export const initDefaultRolesCounts = SetupManager.initDefaultRolesCounts;
export const resizePlayers = SetupManager.resizePlayers;
export const normalizeRoleCounts = SetupManager.normalizeRoleCounts;
export const updateRoleCount = SetupManager.updateRoleCount;
export const getMaxCountForRole = SetupManager.getMaxCountForRole;
export const getMinCountForRole = SetupManager.getMinCountForRole;
export const setRoleEnabled = SetupManager.setRoleEnabled;
export const validateAndFixRoleCounts = SetupManager.validateAndFixRoleCounts;
export const setupGame = SetupManager.setupGame;
export const beginReveal = SetupManager.beginReveal;
export const nextReveal = SetupManager.nextReveal;

// Player functions
export const initializePlayerRoleState = PlayerManager.initializePlayerRoleState;
export const setSindaco = GameStateManager.setSindaco;

// Night phase functions
export const beginNight = NightPhaseManager.beginNight;
export const nextRole = (state: GameState) => NightPhaseManager.nextRole(state);
export const recordNightResult = NightPhaseManager.recordNightResult;
export const resolveNight = NightPhaseManager.resolveNight;
export const startNextNight = NightPhaseManager.startNextNight;

// Day phase functions
export const continueToDay = DayPhaseManager.continueToDay;
export const completeDay = DayPhaseManager.completeDay;
export const lynchPlayer = DayPhaseManager.lynchPlayer;

// Win condition functions
export const computeWinner = WinConditionManager.computeWinner;
export const evaluateWinner = WinConditionManager.evaluateWinner;

// Utility functions
export const getPlayerRealTimeVisibleTeam = GameStateManager.getPlayerRealTimeVisibleTeam;

/**
 * @deprecated Use getMaxCountForRole instead
 */
export function getMaxCount(state: GameState, roleId: string): number {
  return SetupManager.getMaxCountForRole(state, roleId);
}

/**
 * Create a test state for development/testing purposes
 */
export function createTestState(): GameState {
  const state = createEmptyState();
  state.players = [
    { id: 1, name: 'Giocatore 1', roleId: 'insinuo', alive: true, roleState: {} as any },
    { id: 2, name: 'Giocatore 2', roleId: 'lupo', alive: true, roleState: {} as any },
    { id: 3, name: 'Giocatore 3', roleId: 'villico', alive: true, roleState: {} as any },
    { id: 4, name: 'Giocatore 4', roleId: 'villico', alive: true, roleState: {} as any },
    { id: 5, name: 'Giocatore 5', roleId: 'guardia', alive: true, roleState: {} as any },
    { id: 6, name: 'Giocatore 6', roleId: 'guardia', alive: true, roleState: {} as any },
    { id: 7, name: 'Giocatore 7', roleId: 'veggente', alive: true, roleState: {} as any },
  ];
  
  for (const player of state.players) {
    const roleDef = require('../roles').ROLES[player.roleId];
    if (roleDef) {
      PlayerManager.initializePlayerRoleState(player, roleDef);
    }
  }
  
  state.setup.numPlayers = state.players.length;
  state.setup.players = state.players.map(p => ({ name: p.name }));
  state.setup.rolesCounts = { insinuo: 1, lupo: 1, villico: 2, guardia: 2, veggente: 1 };
  
  state.custom = {};
  state.history = {};
  
  state.nightNumber = 1;
  
  return state;
}

// Legacy compatibility - some functions may still be referenced directly
export function hasNonUndefinedHistoryBefore(state: any, playerId: number): boolean {
  const hist = state.history?.[playerId];
  if (!hist) return false;
  for (const nightKey of Object.keys(hist)) {
    const nightNum = Number(nightKey);
    if (!Number.isFinite(nightNum)) continue;
    if (nightNum >= state.nightNumber) continue;
    const arr = hist[nightNum];
    if (Array.isArray(arr) && arr.some(Boolean)) return true;
  }
  return false;
}
