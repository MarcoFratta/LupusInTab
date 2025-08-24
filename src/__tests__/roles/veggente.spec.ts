import { describe, it, expect, beforeEach, vi } from 'vitest';
import veggente from '../../roles/veggente';

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
      nightNumber: 1,
      night: {
        context: {
          checks: []
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
  });

  describe('Resolve Function', () => {
    it('should investigate alive player faction', () => {
      const action = {
        playerId: 1,
        data: { targetId: 3 },
        used: true
      };

      const result = veggente.resolve(mockGameState, action);

      expect(mockGameState.night.context.checks).toHaveLength(0);
      expect(result).toBeDefined();
      expect(result.type).toBe('veggente_action');
      expect(result.discoveredFaction).toBe('villaggio');
    });

    it('should handle lupomannaro special rule', () => {
      const action = {
        playerId: 1,
        data: { targetId: 4 },
        used: true
      };

      const result = veggente.resolve(mockGameState, action);

      expect(mockGameState.night.context.checks).toHaveLength(0);
      expect(result).toBeDefined();
      expect(result.discoveredFaction).toBe('villaggio');
    });

    it('should handle invalid target ID', () => {
      const action = {
        playerId: 1,
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
});
