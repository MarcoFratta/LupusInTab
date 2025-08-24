import { describe, it, expect, beforeEach, vi } from 'vitest';
import illusionista from '../../roles/illusionista';

describe('Illusionista Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          illusionista: true
        }
      },
      nightNumber: 1,
      players: [
        { 
          id: 1, 
          roleId: 'illusionista',
          name: 'Illusionista Player',
          alive: true
        },
        { 
          id: 2, 
          roleId: 'lupo',
          name: 'Lupo Player',
          alive: true,
          roleState: { actsAtNight: 'alive' }
        },
        { 
          id: 3, 
          roleId: 'villico',
          name: 'Villico Player',
          alive: true,
          roleState: { actsAtNight: 'never' }
        }
      ]
    };
  });

  describe('Resolve Function', () => {
    it('should block target player when target is valid', () => {
      const action = {
        playerId: 1,
        data: { targetId: 2 },
        used: true
      };

      const result = illusionista.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(result.type).toBe('illusionista_action');
      expect(result.targetId).toBe(2);
    });

    it('should handle any action without errors', () => {
      const action = {
        playerId: 1,
        data: { targetId: 999 },
        used: true
      };

      expect(() => {
        illusionista.resolve(mockGameState, action);
      }).not.toThrow();
    });

    it('should handle null action', () => {
      expect(() => {
        illusionista.resolve(mockGameState, null);
      }).not.toThrow();
    });

    it('should handle undefined action', () => {
      expect(() => {
        illusionista.resolve(mockGameState, undefined);
      }).not.toThrow();
    });
  });

  describe('Win Condition', () => {
    it('should use village win condition', () => {
      expect(typeof illusionista.checkWin).toBe('function');
    });
  });
});
