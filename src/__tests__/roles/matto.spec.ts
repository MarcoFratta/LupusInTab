import { describe, it, expect, beforeEach, vi } from 'vitest';
import matto from '../../roles/matto';

describe('Matto Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          matto: true
        }
      },
      nightNumber: 1,
      players: [
        { 
          id: 1, 
          roleId: 'matto',
          name: 'Matto Player',
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
    it('should not perform any night actions', () => {
      const action = {
        playerId: 1,
        data: { targetId: 3 },
        used: true
      };

      const result = matto.resolve(mockGameState, action);

      expect(result).toBeUndefined();
    });

    it('should handle any action without errors', () => {
      const action = {
        playerId: 1,
        data: { targetId: 999 },
        used: true
      };

      expect(() => {
        matto.resolve(mockGameState, action);
      }).not.toThrow();
    });

    it('should handle null action', () => {
      expect(() => {
        matto.resolve(mockGameState, null);
      }).not.toThrow();
    });

    it('should handle undefined action', () => {
      expect(() => {
        matto.resolve(mockGameState, undefined);
      }).not.toThrow();
    });
  });

  describe('Win Condition', () => {
    it('should use village win condition', () => {
      expect(typeof matto.checkWin).toBe('function');
    });
  });
});
