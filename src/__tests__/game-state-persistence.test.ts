import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../stores/game';
import { useGameLogic } from '../composables/useGameLogic';
import { saveGameState, loadGameState, clearSavedGame } from '../utils/storage';

describe('Game State Persistence', () => {
  let store: ReturnType<typeof useGameStore>;
  let gameLogic: ReturnType<typeof useGameLogic>;

  beforeEach(() => {
    clearSavedGame();
    store = useGameStore();
    gameLogic = useGameLogic();
    
    vi.clearAllMocks();
  });

  it('should reset showRoleResee to false when resuming game to ensure proper reveal flow', () => {
    const initialState = {
      phase: 'revealRoles',
      nightNumber: 0,
      dayNumber: 0,
      players: [
        { id: 1, name: 'Player 1', roleId: 'villico', alive: true, roleState: {} },
        { id: 2, name: 'Player 2', roleId: 'lupo', alive: true, roleState: {} }
      ],
      setup: { numPlayers: 2, players: [], rolesCounts: {}, rolesEnabled: {} },
      revealIndex: 0,
      night: { turns: [], currentIndex: 0, results: [], context: null, summary: null },
      settings: { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false },
      sindacoId: null,
      winner: null,
      lynchedHistory: [],
      usedPowers: {},
      showRoleResee: true,
      custom: {},
      history: {},
      nightDeathsByNight: {},
      lynchedHistoryByDay: {}
    };

    saveGameState(initialState);
    
    const saved = loadGameState();
    expect(saved).toBeDefined();
    expect(saved.showRoleResee).toBe(true);

    gameLogic.resumeGame(saved);
    
    // When resuming a game, showRoleResee should be reset to false to ensure
    // the game resumes in the proper reveal flow instead of showing a revealed role
    expect(store.state.showRoleResee).toBe(false);
  });

  it('should reset showRoleResee when starting night phase', () => {
    store.state.showRoleResee = true;
    store.state.phase = 'revealRoles';
    
    gameLogic.beginNight();
    
    expect(store.state.showRoleResee).toBe(false);
  });

  it('should reset showRoleResee when resetting game', () => {
    store.state.showRoleResee = true;
    
    gameLogic.resetAll();
    
    expect(store.state.showRoleResee).toBe(false);
  });
});
