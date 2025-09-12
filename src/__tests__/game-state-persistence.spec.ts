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

  it('should reset showRoleResee to false when resuming game to ensure proper reveal flow', async () => {
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

  it('should persist and restore revealPhaseState', async () => {
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
      showRoleResee: false,
      revealPhaseState: {
        showIntro: false,
        showPreNightInfo: true,
        showRoleReveal: false,
        roleRevealed: false
      },
      custom: {},
      history: {},
      nightDeathsByNight: {},
      lynchedHistoryByDay: {}
    };

    saveGameState(initialState);
    
    const saved = loadGameState();
    expect(saved).toBeDefined();
    expect(saved.revealPhaseState).toBeDefined();
    expect(saved.revealPhaseState.showIntro).toBe(false);
    expect(saved.revealPhaseState.showPreNightInfo).toBe(true);

    await gameLogic.resumeGame(saved);
    
    expect(store.state.revealPhaseState).toBeDefined();
    expect(store.state.revealPhaseState?.showIntro).toBe(false);
    expect(store.state.revealPhaseState?.showPreNightInfo).toBe(true);
  });

  it('should smart restore revealPhaseState when no saved state exists', async () => {
    const initialState = {
      phase: 'revealRoles',
      nightNumber: 0,
      dayNumber: 0,
      players: [
        { id: 1, name: 'Player 1', roleId: 'villico', alive: true, roleState: {} },
        { id: 2, name: 'Player 2', roleId: 'lupo', alive: true, roleState: {} }
      ],
      setup: { numPlayers: 2, players: [], rolesCounts: {}, rolesEnabled: {} },
      revealIndex: 2, // At the end of reveal phase
      night: { turns: [], currentIndex: 0, results: [], context: null, summary: null },
      settings: { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false },
      sindacoId: null,
      winner: null,
      lynchedHistory: [],
      usedPowers: {},
      showRoleResee: false,
      // No revealPhaseState - should be smart restored
      custom: {},
      history: {},
      nightDeathsByNight: {},
      lynchedHistoryByDay: {}
    };

    saveGameState(initialState);
    
    const saved = loadGameState();
    expect(saved).toBeDefined();
    expect(saved.revealPhaseState).toBeUndefined();

    await gameLogic.resumeGame(saved);
    
    // Should smart restore to prenight state since revealIndex >= players.length
    expect(store.state.revealPhaseState).toBeDefined();
    expect(store.state.revealPhaseState?.showIntro).toBe(false);
    expect(store.state.revealPhaseState?.showPreNightInfo).toBe(true);
  });

  it('should reset showRoleResee when starting night phase', () => {
    store.state.showRoleResee = true;
    store.state.phase = 'revealRoles';
    
    gameLogic.beginNight();
    
    expect(store.state.showRoleResee).toBe(false);
  });

  it('should reset revealPhaseState when resetting game', () => {
    store.state.revealPhaseState = {
      showIntro: false,
      showPreNightInfo: true,
      showRoleReveal: false,
      roleRevealed: false
    };
    
    gameLogic.resetAll();
    
    expect(store.state.revealPhaseState?.showIntro).toBe(true);
    expect(store.state.revealPhaseState?.showPreNightInfo).toBe(false);
  });

  it('should reset showRoleResee when resetting game', () => {
    store.state.showRoleResee = true;
    
    gameLogic.resetAll();
    
    expect(store.state.showRoleResee).toBe(false);
  });

  it('should reset showRoleResee to false when resuming prenight phase to ensure proper reveal flow', async () => {
    // Simulate the exact scenario: user is in prenight phase and has clicked "Rivela di nuovo un ruolo"
    const initialState = {
      phase: 'revealRoles',
      nightNumber: 0,
      dayNumber: 0,
      players: [
        { id: 1, name: 'Player 1', roleId: 'villico', alive: true, roleState: {} },
        { id: 2, name: 'Player 2', roleId: 'lupo', alive: true, roleState: {} }
      ],
      setup: { numPlayers: 2, players: [], rolesCounts: {}, rolesEnabled: {} },
      revealIndex: 2, // At the end of reveal phase (2 players, so index 2 means finished)
      night: { turns: [], currentIndex: 0, results: [], context: null, summary: null },
      settings: { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false },
      sindacoId: null,
      winner: null,
      lynchedHistory: [],
      usedPowers: {},
      showRoleResee: true, // User clicked "Rivela di nuovo un ruolo"
      revealPhaseState: {
        showIntro: false, // Past the intro
        showPreNightInfo: true, // At the prenight info screen
        showRoleReveal: false, // Not showing role reveal
        roleRevealed: false
      },
      custom: {},
      history: {},
      nightDeathsByNight: {},
      lynchedHistoryByDay: {}
    };

    saveGameState(initialState);
    
    const saved = loadGameState();
    expect(saved).toBeDefined();
    expect(saved.showRoleResee).toBe(true);
    expect(saved.revealPhaseState.showPreNightInfo).toBe(true);

    await gameLogic.resumeGame(saved);
    
    // When resuming a game, showRoleResee should be reset to false to ensure
    // the game resumes in the proper reveal flow instead of showing a revealed role
    expect(store.state.showRoleResee).toBe(false);
    expect(store.state.revealPhaseState?.showIntro).toBe(false);
    expect(store.state.revealPhaseState?.showPreNightInfo).toBe(true);
    expect(store.state.revealPhaseState?.showRoleReveal).toBe(false);
    
    // This means the game resumes in the prenight phase, ready for the user to click
    // "Rivela di nuovo un ruolo" again if needed
  });

  it('should correctly handle role resee button click', async () => {
    // Test that clicking the role resee button properly sets the state
    const initialState = {
      phase: 'revealRoles',
      nightNumber: 0,
      dayNumber: 0,
      players: [
        { id: 1, name: 'Player 1', roleId: 'villico', alive: true, roleState: {} },
        { id: 2, name: 'Player 2', roleId: 'lupo', alive: true, roleState: {} }
      ],
      setup: { numPlayers: 2, players: [], rolesCounts: {}, rolesEnabled: {} },
      revealIndex: 2, // At the end of reveal phase
      night: { turns: [], currentIndex: 0, results: [], context: null, summary: null },
      settings: { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false },
      sindacoId: null,
      winner: null,
      lynchedHistory: [],
      usedPowers: {},
      showRoleResee: false,
      revealPhaseState: {
        showIntro: false,
        showPreNightInfo: true,
        showRoleReveal: false,
        roleRevealed: false
      }
    };

    // Save the initial state
    saveGameState(initialState);
    
    // Load the saved state
    const saved = loadGameState();
    
    // Resume the game
    await gameLogic.resumeGame(saved);
    
    // Verify initial state - should be reset to false when resuming
    expect(store.state.showRoleResee).toBe(false);
    
    // Simulate clicking the role resee button
    store.state.showRoleResee = true;
    
    // Verify the state was updated
    expect(store.state.showRoleResee).toBe(true);
    
    // Save the updated state
    saveGameState(store.state);
    
    // Resume again to verify persistence - but it should still reset to false
    const savedUpdated = loadGameState();
    await gameLogic.resumeGame(savedUpdated);
    
    // Verify the state was reset to false when resuming (to ensure proper reveal flow)
    expect(store.state.showRoleResee).toBe(false);
  });

  it('should restore role groupings when resuming game', async () => {
    const initialState = {
      phase: 'night',
      nightNumber: 1,
      dayNumber: 1,
      players: [
        { id: 1, name: 'Player 1', roleId: 'lupo', alive: true, roleState: {} },
        { id: 2, name: 'Player 2', roleId: 'lupo', alive: true, roleState: {} },
        { id: 3, name: 'Player 3', roleId: 'villico', alive: true, roleState: {} }
      ],
      setup: { numPlayers: 3, players: [], rolesCounts: {}, rolesEnabled: {} },
      revealIndex: 3,
      night: { 
        turns: [], 
        currentIndex: 0, 
        results: [], 
        context: { 
          calledRoles: ['lupo'],
          pendingKills: {},
          savesBy: [],
          checks: []
        }, 
        summary: null 
      },
      settings: { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false },
      sindacoId: null,
      winner: null,
      lynchedHistory: [],
      usedPowers: {},
      showRoleResee: false,
      groupings: [
        { fromRole: 'lupo', toRole: 'lupo' }
      ],
      custom: {},
      history: {},
      nightDeathsByNight: {},
      lynchedHistoryByDay: {}
    };

    saveGameState(initialState);
    
    const saved = loadGameState();
    expect(saved).toBeDefined();
    expect(saved.groupings).toEqual([{ fromRole: 'lupo', toRole: 'lupo' }]);

    await gameLogic.resumeGame(saved);
    
    // When resuming a game, groupings should be properly restored
    expect(store.state.groupings).toEqual([{ fromRole: 'lupo', toRole: 'lupo' }]);
    expect(store.state.phase).toBe('night');
    expect(store.state.nightNumber).toBe(1);
  });
});
