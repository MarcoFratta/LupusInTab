import { describe, it, expect, beforeEach, vi } from 'vitest';
import barabba from '../../roles/barabba';

describe('Barabba Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          barabba: true
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
          roleId: 'barabba',
          name: 'Barabba Player',
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
        data: { targetId: 3 },
        used: true
      };

      const result = barabba.resolve(mockGameState, action);

      expect(mockGameState.night.context.pendingKills[3]).toBeDefined();
      expect(mockGameState.night.context.pendingKills[3]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[3][0].role).toBe('barabba');
      expect(result).toBeDefined();
    });

    it('should handle invalid target ID', () => {
      const action = {
        playerId: 1,
        data: { targetId: 'invalid' },
        used: true
      };

      const result = barabba.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.pendingKills).toEqual({});
    });

    it('should handle missing target ID', () => {
      const action = {
        playerId: 1,
        data: {},
        used: true
      };

      const result = barabba.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.pendingKills).toEqual({});
    });

    it('should handle non-existent target', () => {
      const action = {
        playerId: 1,
        data: { targetId: 999 },
        used: true
      };

      const result = barabba.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(mockGameState.night.context.pendingKills[999]).toBeDefined();
    });
  });

  describe('Win Condition', () => {
    it('should use village win condition', () => {
      expect(typeof barabba.checkWin).toBe('function');
    });
  });
});
