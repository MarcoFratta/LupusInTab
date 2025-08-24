import { vi } from 'vitest';

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
    wolvesWin: vi.fn(() => false)
  })),
  villageWin: vi.fn(() => false),
  wolvesWin: vi.fn(() => false)
}));
