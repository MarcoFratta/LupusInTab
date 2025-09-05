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

// Mock RoleAPI
let mockGameState: any = null;

vi.mock('../utils/roleAPI', () => ({
  initializeRoleAPI: vi.fn(),
  setGameAPI: vi.fn(),
  getGameAPI: vi.fn(),
  RoleAPI: {
    // Player queries
    getAlivePlayers: vi.fn(() => mockGameState?.players?.filter((p: any) => p.alive) || []),
    getDeadPlayers: vi.fn(() => mockGameState?.players?.filter((p: any) => !p.alive) || []),
    getPlayer: vi.fn((id: number) => mockGameState?.players?.find((p: any) => p.id === id)),
    getPlayersByRole: vi.fn((roleId: string) => mockGameState?.players?.filter((p: any) => p.roleId === roleId) || []),
    getAlivePlayersByRole: vi.fn((roleId: string) => mockGameState?.players?.filter((p: any) => p.roleId === roleId && p.alive) || []),
    getPlayersByTeam: vi.fn((team: string) => mockGameState?.players?.filter((p: any) => p.team === team) || []),
    getAlivePlayersByTeam: vi.fn((team: string) => mockGameState?.players?.filter((p: any) => p.team === team && p.alive) || []),

    // Role queries
    hasRole: vi.fn((playerId: number, roleId: string) => {
      const player = mockGameState?.players?.find((p: any) => p.id === playerId);
      return player?.roleId === roleId;
    }),
    hasAnyRole: vi.fn((playerId: number, roleIds: string[]) => {
      const player = mockGameState?.players?.find((p: any) => p.id === playerId);
      return roleIds.includes(player?.roleId);
    }),
    getPlayersWithRole: vi.fn((roleId: string) => mockGameState?.players?.filter((p: any) => p.roleId === roleId) || []),
    getAlivePlayersWithRole: vi.fn((roleId: string) => mockGameState?.players?.filter((p: any) => p.roleId === roleId && p.alive) || []),

    // Game state
    getNightNumber: vi.fn(() => mockGameState?.nightNumber || 1),
    getDayNumber: vi.fn(() => mockGameState?.dayNumber || 1),
    getPhase: vi.fn(() => mockGameState?.phase || 'night'),
    isFirstNight: vi.fn(() => mockGameState?.nightNumber === 1),
    isFirstNightSkipped: vi.fn(() => false),

    // Night context
    getPendingKills: vi.fn((gameStateOrPlayerId?: any) => {
      // If it's a number, it's a playerId
      if (typeof gameStateOrPlayerId === 'number') {
        return mockGameState?.night?.context?.pendingKills?.[gameStateOrPlayerId] || [];
      }
      // Otherwise, it's a gameState object, return all pending kills
      return mockGameState?.night?.context?.pendingKills || {};
    }),
    hasPendingKills: vi.fn((playerId: number) => (mockGameState?.night?.context?.pendingKills?.[playerId] || []).length > 0),
    getSaves: vi.fn((playerId: number) => mockGameState?.night?.context?.savesBy?.filter((s: any) => s.target === playerId) || []),
    wasSaved: vi.fn((playerId: number) => (mockGameState?.night?.context?.savesBy?.filter((s: any) => s.target === playerId) || []).length > 0),
    getChecks: vi.fn(() => mockGameState?.night?.context?.checks || []),

    // Role actions
    addKill: vi.fn((targetId: number, killerRole: string, data?: any) => {
      if (!mockGameState.night.context) {
        mockGameState.night.context = {};
      }
      if (!mockGameState.night.context.pendingKills) {
        mockGameState.night.context.pendingKills = {};
      }
      if (!mockGameState.night.context.pendingKills[targetId]) {
        mockGameState.night.context.pendingKills[targetId] = [];
      }
      mockGameState.night.context.pendingKills[targetId].push({ role: killerRole, ...data });
    }),
    removeKills: vi.fn((targetId: number, killerRole: string) => {
      if (mockGameState.night.context.pendingKills?.[targetId]) {
        mockGameState.night.context.pendingKills[targetId] = mockGameState.night.context.pendingKills[targetId].filter((kill: any) => kill.role !== killerRole);
        if (mockGameState.night.context.pendingKills[targetId].length === 0) {
          delete mockGameState.night.context.pendingKills[targetId];
        }
      }
    }),
    addSave: vi.fn((targetId: number, saverId: number, fromRoles: string[]) => {
      if (!mockGameState.night.context.savesBy) {
        mockGameState.night.context.savesBy = [];
      }
      mockGameState.night.context.savesBy.push({ by: saverId, target: targetId, fromRoles });
    }),
    addCheck: vi.fn((investigatorId: number, targetId: number, discoveredTeam: string) => {
      if (!mockGameState.night.context.checks) {
        mockGameState.night.context.checks = [];
      }
      mockGameState.night.context.checks.push({ by: investigatorId, target: targetId, team: discoveredTeam, discoveredFaction: discoveredTeam });
    }),
    setPlayerVisibleTeam: vi.fn((playerId: number, team: string) => {
      const player = mockGameState?.players?.find((p: any) => p.id === playerId);
      if (player) {
        player.visibleAsTeam = team;
      }
    }),
    blockPlayer: vi.fn((playerId: number) => {
      const player = mockGameState?.players?.find((p: any) => p.id === playerId);
      if (player) {
        player.actsAtNight = 'blocked';
      }
    }),
    unblockPlayer: vi.fn((playerId: number, originalActsAtNight: string) => {
      const player = mockGameState?.players?.find((p: any) => p.id === playerId);
      if (player) {
        player.actsAtNight = originalActsAtNight;
      }
    }),

    // Usage tracking
    recordPowerUsage: vi.fn((roleId: string, playerId: number) => {
      if (!mockGameState.usedPowers) {
        mockGameState.usedPowers = {};
      }
      if (!mockGameState.usedPowers[roleId]) {
        mockGameState.usedPowers[roleId] = [];
      }
      mockGameState.usedPowers[roleId].push(playerId);
    }),
    getPowerUsageCount: vi.fn((roleId: string, playerId: number) => {
      return mockGameState.usedPowers?.[roleId]?.length || 0;
    }),
    canUsePower: vi.fn((playerId: number) => true),

    // Win conditions
    checkTeamWin: vi.fn((team: string) => false),
    getWinningTeams: vi.fn(() => []),

    // Custom data
    getCustomData: vi.fn((roleId: string) => mockGameState?.custom?.[roleId] || {}),
    setCustomData: vi.fn((roleId: string, data: any) => {
      if (!mockGameState.custom) {
        mockGameState.custom = {};
      }
      mockGameState.custom[roleId] = data;
    }),
    clearCustomData: vi.fn((roleId: string) => {
      if (mockGameState.custom) {
        delete mockGameState.custom[roleId];
      }
    })
  }
}));

// Mock GameStateManager
vi.mock('../core/managers/GameStateManager', () => ({
  GameStateManager: {
    getPlayerRealTimeVisibleTeam: vi.fn((state: any, playerId: number) => {
      const player = mockGameState?.players?.find((p: any) => p.id === playerId);
      if (!player) return undefined;
      return player.roleState?.visibleAsTeam || player.roleState?.realTeam;
    }),
    initializeNightTracking: vi.fn(),
    recordNightDeaths: vi.fn(),
    getAlivePlayers: vi.fn(() => mockGameState?.players?.filter((p: any) => p.alive) || []),
    getPowerUsageCount: vi.fn(() => 0),
    createEmptyState: vi.fn(() => ({
      phase: 'setup',
      nightNumber: 0,
      dayNumber: 0,
      players: [],
      setup: { 
        numPlayers: 10, 
        players: [], 
        rolesCounts: {}, 
        rolesEnabled: {} 
      },
      revealIndex: 0,
      night: { turns: [], currentIndex: 0, context: null, summary: null },
      settings: { 
        skipFirstNightActions: true, 
        enableSindaco: false, 
        discussionTimerEnabled: false,
        difficolta: false
      },
      sindacoId: null,
      winner: null,
      lynchedHistory: [],
      usedPowers: {},
      custom: {},
      history: {},
      nightDeathsByNight: {},
      lynchedHistoryByDay: {},
    }))
  }
}));

// Mock engine module
vi.mock('../core/engine', () => ({
  createEmptyState: vi.fn(() => ({
    phase: 'setup',
    nightNumber: 0,
    dayNumber: 0,
    players: [],
    setup: { 
      numPlayers: 10, 
      players: [], 
      rolesCounts: {}, 
      rolesEnabled: {} 
    },
    revealIndex: 0,
    night: { turns: [], currentIndex: 0, context: null, summary: null },
    settings: { 
      skipFirstNightActions: true, 
      enableSindaco: false, 
      discussionTimerEnabled: false,
      difficolta: false
    },
    sindacoId: null,
    winner: null,
    lynchedHistory: [],
    usedPowers: {},
    custom: {},
    history: {},
    nightDeathsByNight: {},
    lynchedHistoryByDay: {},
  })),
  getAlivePlayers: vi.fn(() => mockGameState?.players?.filter((p: any) => p.alive) || []),
  initSetupPlayers: vi.fn(),
  resizePlayers: vi.fn(),
  initDefaultRolesCounts: vi.fn(),
  normalizeRoleCounts: vi.fn(),
  updateRoleCount: vi.fn(),
  getMaxCountForRole: vi.fn(() => 1),
  beginReveal: vi.fn(),
  nextReveal: vi.fn(),
  startNextNight: vi.fn(),
  recordNightResult: vi.fn(),
  resolveNight: vi.fn(),
  continueToDay: vi.fn(),
  completeDay: vi.fn(),
  lynchPlayer: vi.fn(),
  setSindaco: vi.fn(),
  evaluateWinner: vi.fn(() => null)
}));

// Mock NightPhaseManager
vi.mock('../core/managers/NightPhaseManager', () => ({
  NightPhaseManager: {
    beginNight: vi.fn(),
    getCurrentTurn: vi.fn(() => ({
      roleId: 'lupo',
      playerIds: [1, 2],
      kind: 'group'
    })),
    resolveNight: vi.fn()
  }
}));

// Helper function to set mock game state for tests
export function setMockGameState(gameState: any) {
  mockGameState = gameState;
}
