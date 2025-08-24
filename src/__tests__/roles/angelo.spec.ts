import { describe, it, expect, beforeEach, vi } from 'vitest';
import angelo from '../../roles/angelo';

describe('Angelo Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          angelo: true
        }
      },
      nightNumber: 1,
      players: [
        { 
          id: 1, 
          roleId: 'angelo',
          name: 'Angelo Player',
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

      const result = angelo.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(result.type).toBe('angelo_action');
    });

    it('should handle any action without errors', () => {
      const action = {
        playerId: 1,
        data: { targetId: 999 },
        used: true
      };

      expect(() => {
        angelo.resolve(mockGameState, action);
      }).not.toThrow();
    });

    it('should handle null action', () => {
      expect(() => {
        angelo.resolve(mockGameState, null);
      }).not.toThrow();
    });

    it('should handle undefined action', () => {
      expect(() => {
        angelo.resolve(mockGameState, undefined);
      }).not.toThrow();
    });
  });

  describe('Win Condition', () => {
    it('should use village win condition', () => {
      expect(typeof angelo.checkWin).toBe('function');
    });
  });
});
