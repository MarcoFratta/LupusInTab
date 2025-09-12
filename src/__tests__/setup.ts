import { vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Create a proper localStorage mock with actual storage
const mockStorage: Record<string, string> = {};

localStorageMock.getItem = vi.fn((key: string) => mockStorage[key] || null);
localStorageMock.setItem = vi.fn((key: string, value: string) => {
  mockStorage[key] = value;
});
localStorageMock.removeItem = vi.fn((key: string) => {
  delete mockStorage[key];
});
localStorageMock.clear = vi.fn(() => {
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Setup Pinia for tests
beforeEach(() => {
  setActivePinia(createPinia());
});

// Mock componentFactory function
vi.mock('../utils/roleUtils', () => ({
  componentFactory: vi.fn(() => () => Promise.resolve({})),
  addToHistory: vi.fn(),
  addGroupHistory: vi.fn(),
  getRoleCustomData: vi.fn(() => ({})),
  setRoleCustomData: vi.fn(),
  clearRoleCustomData: vi.fn(),
  canPlayerActAtNight: vi.fn((player, gameState) => {
    if (!player?.roleState?.startNight) return false;
    return gameState.nightNumber >= player.roleState.startNight;
  }),
  hasPlayerExceededUsageLimit: vi.fn((player, gameState) => {
    if (!player?.roleId) return false;
    
    // Handle unlimited and undefined usage directly
    if (player.roleState?.numberOfUsage === 'unlimited' || player.roleState?.numberOfUsage === undefined) {
      return false;
    }
    
    // Mock role definitions for testing
    const mockRoles = {
      testrole: { numberOfUsage: 2 },
      boia: { numberOfUsage: 1 },
      giustiziere: { numberOfUsage: 1 },
      genio: { numberOfUsage: 1 },
      villico: { numberOfUsage: 'unlimited' },
      guardia: { numberOfUsage: 'unlimited' }
    };
    const roleDef = mockRoles[player.roleId];
    if (!roleDef) return false;
    
    const usageCount = gameState.usedPowers?.[player.roleId]?.length || 0;
    return usageCount >= roleDef.numberOfUsage;
  })
}));

// Mock winConditions
vi.mock('../utils/winConditions', () => ({
  useWinConditions: vi.fn(() => ({
    villageWin: vi.fn(() => false),
    wolvesWin: vi.fn(() => false),
    alieniWin: vi.fn(() => false),
    mannariWin: vi.fn(() => false)
  })),
  villageWin: vi.fn(() => false),
  wolvesWin: vi.fn(() => false),
  alieniWin: vi.fn(() => false),
  mannariWin: vi.fn((state: any) => {
    const alive = state.players.filter((p: any) => p.alive);
    const mannariAlive = alive.filter((p: any) => p.roleId === 'lupomannaro' || p.roleId === 'muccamannara').length;
    const nonMannariAlive = alive.filter((p: any) => p.roleId !== 'lupomannaro' && p.roleId !== 'muccamannara').length;
    
    return mannariAlive > 0 && mannariAlive >= nonMannariAlive;
  })
}));

// Don't mock RoleAPI - let it use real functions
// The tests are using real game state, so RoleAPI should work with real game state too

// Don't mock GameStateManager - let it use real functions
// The tests are using real game state, so GameStateManager should work with real game state too

// Don't mock the engine module - let tests use real engine functions

// Don't mock NightPhaseManager - let tests use real functions

// Helper functions removed - tests now use real functions
