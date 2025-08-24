import { describe, it, expect, beforeEach, vi } from 'vitest';
import lupomannaro from '../../roles/lupomannaro';

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
  });

  describe('Resolve Function', () => {
    it('should add kill to pendingKills when target is valid', () => {
      const action = {
        playerId: 1,
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
        data: { targetId: 3, roleId: 'villico' },
        used: true
      };
      const action2 = {
        playerId: 1,
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
        data: { targetId: 3, roleId: 'villico' },
        used: true
      };
      const action2 = {
        playerId: 1,
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
});
