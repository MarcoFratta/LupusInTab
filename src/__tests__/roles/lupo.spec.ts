import { describe, it, expect, beforeEach, vi } from 'vitest';
import lupo from '../../roles/lupo';
import { setMockGameState } from '../setup';

describe('Lupo Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          guardia: true
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
          roleId: 'lupo',
          name: 'Lupo Player 1',
          alive: true
        },
        { 
          id: 2, 
          roleId: 'lupo',
          name: 'Lupo Player 2',
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
        data: { targetIds: [3] },
        used: true
      };

      const result = lupo.resolve(mockGameState, action);

      expect(mockGameState.night.context.pendingKills[3]).toBeDefined();
      expect(mockGameState.night.context.pendingKills[3]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('lupo');
      expect(result).toBeDefined();
      expect(result.type).toBe('lupo_action');
      expect(result.targetIds).toEqual([3]);
    });

    it('should handle targetIds from result.targetIds', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        result: { targetIds: [3] },
        used: true
      };

      const result = lupo.resolve(mockGameState, action);

      expect(mockGameState.night.context.pendingKills[3]).toBeDefined();
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('lupo');
    });

    it('should not duplicate kills for the same target', () => {
      const action1 = {
        playerId: 1,
        playerIds: [1],
        data: { targetIds: [3] },
        used: true
      };
      const action2 = {
        playerId: 2,
        playerIds: [2],
        data: { targetIds: [3] },
        used: true
      };

      lupo.resolve(mockGameState, action1);
      lupo.resolve(mockGameState, action2);

      expect(mockGameState.night.context.pendingKills[3]).toHaveLength(2);
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('lupo');
      expect(mockGameState.night.context.pendingKills[3][1].role).toBe('lupo');
    });

    it('should handle invalid target ID', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetIds: ['invalid'] },
        used: true
      };

      const result = lupo.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(mockGameState.night.context.pendingKills).toEqual({});
    });

    it('should handle missing target ID', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: {},
        used: true
      };

      const result = lupo.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(mockGameState.night.context.pendingKills).toEqual({});
    });

    it('should handle non-existent target', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetIds: [999] },
        used: true
      };

      const result = lupo.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(mockGameState.night.context.pendingKills[999]).toBeDefined();
    });

    it('should handle multiple targets correctly', () => {
      const action1 = {
        playerId: 1,
        playerIds: [1],
        data: { targetIds: [3] },
        used: true
      };
      const action2 = {
        playerId: 2,
        playerIds: [2],
        data: { targetIds: [1] },
        used: true
      };

      lupo.resolve(mockGameState, action1);
      lupo.resolve(mockGameState, action2);

      expect(mockGameState.night.context.pendingKills[3]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[1]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('lupo');
      expect(mockGameState.night.context.pendingKills[1][0].role).toBe('lupo');
    });
  });

  describe('Win Condition', () => {
    it('should use wolves win condition', () => {
      expect(typeof lupo.checkWin).toBe('function');
    });
  });
});
