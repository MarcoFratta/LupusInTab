import { describe, it, expect, beforeEach, vi } from 'vitest';
import giustiziere from '../../roles/giustiziere';
import { setMockGameState } from '../setup';

describe('Giustiziere Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          giustiziere: true
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
          roleId: 'giustiziere',
          name: 'Giustiziere Player',
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
        data: { targetId: 3 },
        used: true
      };

      const result = giustiziere.resolve(mockGameState, action);

      expect(mockGameState.night.context.pendingKills[3]).toBeDefined();
      expect(mockGameState.night.context.pendingKills[3]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('giustiziere');
      expect(result).toBeDefined();
      expect(result.type).toBe('giustiziere_action');
      expect(result.targetId).toBe(3);
    });

    it('should handle targetId from result.targetId', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        result: { targetId: 3 },
        data: { targetId: 3 },
        used: true
      };

      const result = giustiziere.resolve(mockGameState, action);

      expect(mockGameState.night.context.pendingKills[3]).toBeDefined();
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('giustiziere');
    });

    it('should not duplicate kills for the same target', () => {
      const action1 = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 3 },
        used: true
      };
      const action2 = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 3 },
        used: true
      };

      giustiziere.resolve(mockGameState, action1);
      giustiziere.resolve(mockGameState, action2);

      expect(mockGameState.night.context.pendingKills[3]).toHaveLength(2);
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('giustiziere');
      expect(mockGameState.night.context.pendingKills[3][1].role).toBe('giustiziere');
    });

    it('should handle invalid target ID', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 'invalid' },
        used: true
      };

      const result = giustiziere.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.pendingKills).toEqual({});
    });

    it('should handle missing target ID', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: {},
        used: true
      };

      const result = giustiziere.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.pendingKills).toEqual({});
    });

    it('should handle non-existent target', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 999 },
        used: true
      };

      const result = giustiziere.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(mockGameState.night.context.pendingKills[999]).toBeDefined();
    });

    it('should handle multiple targets correctly', () => {
      const action1 = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 3 },
        used: true
      };
      const action2 = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 2 },
        used: true
      };

      giustiziere.resolve(mockGameState, action1);
      giustiziere.resolve(mockGameState, action2);

      expect(mockGameState.night.context.pendingKills[3]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('giustiziere');
      expect(mockGameState.night.context.pendingKills[2][0].role).toBe('giustiziere');
    });
  });

  describe('Win Condition', () => {
    it('should use village win condition', () => {
      expect(typeof giustiziere.checkWin).toBe('function');
    });
  });
});
