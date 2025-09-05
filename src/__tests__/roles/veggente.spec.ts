import { describe, it, expect, beforeEach, vi } from 'vitest';
import veggente from '../../roles/veggente';
import { setMockGameState } from '../setup';

describe('Veggente Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          veggente: true,
          lupomannaro: true
        }
      },
      settings: {
        difficolta: false
      },
      nightNumber: 1,
      night: {
        context: {
          checks: [],
          pendingKills: {}
        }
      },
      players: [
        { 
          id: 1, 
          roleId: 'veggente',
          name: 'Veggente Player',
          alive: true
        },
        { 
          id: 2, 
          roleId: 'lupo',
          name: 'Lupo Player',
          alive: true,
          roleState: { realTeam: 'lupi', visibleAsTeam: 'lupi' }
        },
        { 
          id: 3, 
          roleId: 'villico',
          name: 'Villico Player',
          alive: true,
          roleState: { realTeam: 'villaggio', visibleAsTeam: 'villaggio' }
        },
        { 
          id: 4, 
          roleId: 'lupomannaro',
          name: 'Lupomannaro Player',
          alive: true,
          roleState: { realTeam: 'lupi', visibleAsTeam: 'villaggio' }
        }
      ]
    };
    setMockGameState(mockGameState);
  });

  describe('Resolve Function', () => {
    it('should investigate alive player faction', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 3 },
        used: true
      };

      const result = veggente.resolve(mockGameState, action);

      expect(mockGameState.night.context.checks).toHaveLength(1);
      expect(result).toBeDefined();
      expect(result.type).toBe('veggente_action');
      expect(result.discoveredFaction).toBe('villaggio');
    });

    it('should handle lupomannaro special rule', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 4 },
        used: true
      };

      const result = veggente.resolve(mockGameState, action);

      expect(mockGameState.night.context.checks).toHaveLength(1);
      expect(result).toBeDefined();
      expect(result.discoveredFaction).toBe('villaggio');
    });

    it('should handle invalid target ID', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 'invalid' },
        used: true
      };

      const result = veggente.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.checks).toHaveLength(0);
    });

    it('should handle missing target ID', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: {},
        used: true
      };

      const result = veggente.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.checks).toHaveLength(0);
    });

    it('should handle non-existent target', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 999 },
        used: true
      };

      const result = veggente.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(mockGameState.night.context.checks).toHaveLength(0);
    });

    it('should use visibleAsTeam when available', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 2 },
        used: true
      };

      const result = veggente.resolve(mockGameState, action);

      expect(result.discoveredFaction).toBe('lupi');
    });

    it('should fallback to realTeam when visibleAsTeam not available', () => {
      const playerWithOnlyRealTeam = {
        id: 5,
        roleId: 'villico',
        name: 'Player 5',
        alive: true,
        roleState: { realTeam: 'villaggio' }
      };
      mockGameState.players.push(playerWithOnlyRealTeam);

      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 5 },
        used: true
      };

      const result = veggente.resolve(mockGameState, action);

      expect(result.discoveredFaction).toBe('villaggio');
    });

    it('should handle target with no roleState', () => {
      const playerWithoutRoleState = {
        id: 6,
        roleId: 'villico',
        name: 'Player 6',
        alive: true
      };
      mockGameState.players.push(playerWithoutRoleState);

      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 6 },
        used: true
      };

      const result = veggente.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(result.discoveredFaction).toBeUndefined();
    });
  });

  describe('Win Condition', () => {
    it('should use village win condition', () => {
      expect(typeof veggente.checkWin).toBe('function');
    });
  });

  describe('Pending Kills for Mannari', () => {
    it('should add pending kill when investigating lupomannaro', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 4 },
        used: true
      };

      // Initialize pendingKills if it doesn't exist
      if (!mockGameState.night.context.pendingKills) {
        mockGameState.night.context.pendingKills = {};
      }

      const result = veggente.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(result.type).toBe('veggente_action');
      expect(mockGameState.night.context.pendingKills[4]).toBeDefined();
      expect(mockGameState.night.context.pendingKills[4]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[4][0]).toEqual({
        role: 'veggente',
        reason: 'Investigated by veggente'
      });
    });

    it('should add pending kill when investigating muccamannara', () => {
      // Add muccamannara player to the game state
      const muccamannaraPlayer = {
        id: 5,
        roleId: 'muccamannara',
        name: 'Muccamannara Player',
        alive: true,
        roleState: { realTeam: 'mannari', visibleAsTeam: 'villaggio' }
      };
      mockGameState.players.push(muccamannaraPlayer);

      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 5 },
        used: true
      };

      // Initialize pendingKills if it doesn't exist
      if (!mockGameState.night.context.pendingKills) {
        mockGameState.night.context.pendingKills = {};
      }

      const result = veggente.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(result.type).toBe('veggente_action');
      expect(mockGameState.night.context.pendingKills[5]).toBeDefined();
      expect(mockGameState.night.context.pendingKills[5]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[5][0]).toEqual({
        role: 'veggente',
        reason: 'Investigated by veggente'
      });
    });

    it('should not add pending kill when investigating non-mannari players', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 2 },
        used: true
      };

      // Initialize pendingKills if it doesn't exist
      if (!mockGameState.night.context.pendingKills) {
        mockGameState.night.context.pendingKills = {};
      }

      const result = veggente.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(result.type).toBe('veggente_action');
      // Should not add pending kill for lupo
      expect(mockGameState.night.context.pendingKills[2]).toBeUndefined();
    });

    it('should handle multiple pending kills for the same target', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 4 },
        used: true
      };

      // Initialize pendingKills if it doesn't exist
      if (!mockGameState.night.context.pendingKills) {
        mockGameState.night.context.pendingKills = {};
      }

      // Add an existing pending kill
      mockGameState.night.context.pendingKills[4] = [
        { role: 'lupo', reason: 'Wolf attack' }
      ];

      const result = veggente.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(mockGameState.night.context.pendingKills[4]).toHaveLength(2);
      expect(mockGameState.night.context.pendingKills[4][1]).toEqual({
        role: 'veggente',
        reason: 'Investigated by veggente'
      });
    });

    it('should initialize night context if it does not exist', () => {
      // Remove night context to test initialization
      delete mockGameState.night.context;

      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 4 },
        used: true
      };

      // Ensure gameState has proper structure for checkPlayerRole
      mockGameState.settings = { difficolta: false };
      mockGameState.groupings = [];

      // Update the mock game state after deleting context
      setMockGameState(mockGameState);

      const result = veggente.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(mockGameState.night.context).toBeDefined();
      expect(mockGameState.night.context.pendingKills).toBeDefined();
      expect(mockGameState.night.context.pendingKills[4]).toBeDefined();
    });
  });
});
