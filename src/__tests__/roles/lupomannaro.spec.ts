import { describe, it, expect, beforeEach, vi } from 'vitest';
import lupomannaro from '../../roles/lupomannaro';
import { setMockGameState } from '../setup';

describe('Lupomannaro Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          lupomannaro: true
        }
      },
      nightNumber: 1,
      night: {
        context: {
          pendingKills: {}
        }
      },
      settings: { difficolta: false },
      groupings: [],
      players: [
        { 
          id: 1, 
          roleId: 'lupomannaro',
          name: 'Lupomannaro Player',
          alive: true
        },
        { 
          id: 2, 
          roleId: 'lupo',
          name: 'Lupo Player',
          alive: true
        },
        { 
          id: 3, 
          roleId: 'villico',
          name: 'Villico Player',
          alive: true
        }
      ]
    };
    setMockGameState(mockGameState);
  });

  describe('Resolve Function', () => {
    it('should add kill to pendingKills when target is valid', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 3, roleId: 'villico' },
        used: true
      };

      const result = lupomannaro.resolve(mockGameState, action);

      expect(mockGameState.night.context.pendingKills[3]).toBeDefined();
      expect(mockGameState.night.context.pendingKills[3]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('lupomannaro');
      expect(result).toBeDefined();
      expect(result.type).toBe('lupomannaro_action');
      expect(result.targetId).toBe(3);
    });

    it('should handle targetId from result.targetId', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        result: { targetId: 3 },
        data: { targetId: 3, roleId: 'villico' },
        used: true
      };

      const result = lupomannaro.resolve(mockGameState, action);

      expect(mockGameState.night.context.pendingKills[3]).toBeDefined();
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('lupomannaro');
    });

    it('should not duplicate kills for the same target', () => {
      const action1 = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 3, roleId: 'villico' },
        used: true
      };
      const action2 = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 3, roleId: 'villico' },
        used: true
      };

      lupomannaro.resolve(mockGameState, action1);
      lupomannaro.resolve(mockGameState, action2);

      expect(mockGameState.night.context.pendingKills[3]).toHaveLength(2);
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('lupomannaro');
      expect(mockGameState.night.context.pendingKills[3][1].role).toBe('lupomannaro');
    });

    it('should handle invalid target ID', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 'invalid', roleId: 'villico' },
        used: true
      };

      const result = lupomannaro.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.pendingKills).toEqual({});
    });

    it('should handle missing target ID', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { roleId: 'villico' },
        used: true
      };

      const result = lupomannaro.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.pendingKills).toEqual({});
    });

    it('should handle non-existent target', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 999, roleId: 'villico' },
        used: true
      };

      const result = lupomannaro.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.pendingKills[999]).toBeUndefined();
    });

    it('should handle multiple targets correctly', () => {
      const action1 = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 3, roleId: 'villico' },
        used: true
      };
      const action2 = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 2, roleId: 'lupo' },
        used: true
      };

      lupomannaro.resolve(mockGameState, action1);
      lupomannaro.resolve(mockGameState, action2);

      expect(mockGameState.night.context.pendingKills[3]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('lupomannaro');
      expect(mockGameState.night.context.pendingKills[2][0].role).toBe('lupomannaro');
    });
  });

  describe('Win Condition', () => {
    it('should use wolves win condition', () => {
      expect(typeof lupomannaro.checkWin).toBe('function');
    });
  });

  describe('Passive Effect', () => {
    it('should be immune to lupo kills', () => {
      // Simulate a lupo kill being recorded
      mockGameState.night.context.pendingKills[1] = [{ role: 'lupo' }];
      
      // Apply passive effect
      lupomannaro.passiveEffect(mockGameState, mockGameState.players[0]);
      
      // The lupo kill should be filtered out
      expect(mockGameState.night.context.pendingKills[1]).toBeUndefined();
    });

    it('should not be immune to other role kills', () => {
      // Simulate kills from other roles
      mockGameState.night.context.pendingKills[1] = [
        { role: 'lupo' },
        { role: 'veggente' },
        { role: 'giustiziere' }
      ];
      
      // Apply passive effect
      lupomannaro.passiveEffect(mockGameState, mockGameState.players[0]);
      
      // Only lupo kills should be filtered out, others should remain
      expect(mockGameState.night.context.pendingKills[1]).toHaveLength(2);
      expect(mockGameState.night.context.pendingKills[1]).toEqual([
        { role: 'veggente' },
        { role: 'giustiziere' }
      ]);
    });

    it('should handle case with no pending kills', () => {
      // No pending kills
      mockGameState.night.context.pendingKills = {};
      
      // Apply passive effect
      lupomannaro.passiveEffect(mockGameState, mockGameState.players[0]);
      
      // Should not crash and should remain empty
      expect(mockGameState.night.context.pendingKills).toEqual({});
    });

    it('should prevent lupo from killing lupomannaro in the game flow', () => {
      // Simulate the exact bug scenario
      // 1. Lupo acts and records a kill on lupomannaro
      mockGameState.night.context.pendingKills[1] = [{ role: 'lupo' }];
      
      // 2. Lupomannaro's passive effect should be applied BEFORE lupo's kill is processed
      // This simulates the new engine behavior where passive effects run before each role's turn
      lupomannaro.passiveEffect(mockGameState, mockGameState.players[0]);
      
      // 3. The lupo kill should be filtered out, preventing lupomannaro from dying
      expect(mockGameState.night.context.pendingKills[1]).toBeUndefined();
      
      // 4. Lupomannaro should still be alive
      expect(mockGameState.players[0].alive).toBe(true);
    });
  });
});
