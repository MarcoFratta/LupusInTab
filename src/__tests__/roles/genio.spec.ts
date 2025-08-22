import { describe, it, expect, beforeEach, vi } from 'vitest';
import { genio } from '../../roles/genio';

vi.mock('../../roles', () => ({
  ROLES: {
    lupo: {
      id: 'lupo',
      name: 'Lupo',
      team: 'lupi',
      phaseOrder: 1
    },
    villico: {
      id: 'villico',
      name: 'Villico',
      team: 'villaggio',
      phaseOrder: 99
    },
    veggente: {
      id: 'veggente',
      name: 'Veggente',
      team: 'villaggio',
      phaseOrder: 3
    }
  }
}));

describe('Genio della Lampada', () => {
  let mockGameState: any;
  let mockPlayer: any;
  let mockAction: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          guardia: true,
          veggente: true,
          genio: true
        }
      },
      nightNumber: 3,
      history: {},
      players: [
        { id: 1, roleId: 'genio' },
        { id: 2, roleId: 'lupo' }
      ]
    };

    mockPlayer = {
      id: 1,
      roleId: 'genio',
      roleState: {}
    };

    mockAction = {
      playerId: 1,
      target: { roleId: 'lupo' },
      used: true
    };


  });

  describe('basic properties', () => {
    it('should have correct basic properties', () => {
      expect(genio.id).toBe('genio');
      expect(genio.name).toBe('Genio');
      expect(genio.team).toBe('villaggio');
      expect(genio.actsAtNight).toBe('alive');
      expect(genio.effectType).toBe('required');
      expect(genio.numberOfUsage).toBe(1);
      expect(genio.startNight).toBe(2);
      expect(genio.phaseOrder).toBe(0);
      expect(genio.minCount).toBeUndefined();
      expect(genio.maxCount).toBeUndefined();
    });

    it('should have correct component references', () => {
      expect(typeof genio.resolve).toBe('function');
    });
  });

  describe('resolve function', () => {
    it('should transform player to selected role', () => {
      genio.resolve(mockGameState, mockAction);

      const player = mockGameState.players.find((p: any) => p.id === 1);
      expect(player.roleId).toBe('lupo');
      expect(player.roleState.realTeam).toBe('lupi');
      expect(player.roleState.countAs).toBe('lupi');
    });

    it('should not transform if action is invalid', () => {
      const originalRoleId = mockGameState.players[0].roleId;
      genio.resolve(mockGameState, null);

      expect(mockGameState.players[0].roleId).toBe(originalRoleId);
    });

    it('should not transform if target role is not enabled', () => {
      mockGameState.setup.rolesEnabled.lupo = false;
      const originalRoleId = mockGameState.players[0].roleId;
      
      genio.resolve(mockGameState, mockAction);

      expect(mockGameState.players[0].roleId).toBe(originalRoleId);
    });

    it('should handle role not found in ROLES', () => {
      const invalidAction = {
        playerId: 1,
        target: { roleId: 'nonexistent' },
        used: true
      };
      const originalRoleId = mockGameState.players[0].roleId;
      
      genio.resolve(mockGameState, invalidAction);

      expect(mockGameState.players[0].roleId).toBe(originalRoleId);
    });
  });

  describe('edge cases', () => {
    it('should handle missing gameState.history', () => {
      delete mockGameState.history;
      
      expect(() => {
        genio.resolve(mockGameState, mockAction);
      }).not.toThrow();
    });

    it('should handle missing player in players array', () => {
      const actionWithInvalidPlayer = {
        playerId: 999,
        target: { roleId: 'lupo' },
        used: true
      };
      
      expect(() => {
        genio.resolve(mockGameState, actionWithInvalidPlayer);
      }).not.toThrow();
    });
  });
});
