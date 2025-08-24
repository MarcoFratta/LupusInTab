import { describe, it, expect, beforeEach, vi } from 'vitest';
import medium from '../../roles/medium';

describe('Medium Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          medium: true,
          lupomannaro: true
        }
      },
      nightNumber: 1,
      night: {
        context: {
          checks: [],
          pendingKills: {}
        }
      },
      players: [
        { 
          id: 1, 
          roleId: 'medium',
          name: 'Medium Player',
          alive: true
        },
        { 
          id: 2, 
          roleId: 'lupo',
          name: 'Lupo Player',
          alive: false,
          roleState: { realTeam: 'lupi', visibleAsTeam: 'lupi' }
        },
        { 
          id: 3, 
          roleId: 'villico',
          name: 'Villico Player',
          alive: false,
          roleState: { realTeam: 'villaggio', visibleAsTeam: 'villaggio' }
        },
        { 
          id: 4, 
          roleId: 'lupomannaro',
          name: 'Lupomannaro Player',
          alive: false,
          roleState: { realTeam: 'lupi', visibleAsTeam: 'villaggio' }
        }
      ]
    };
  });

  describe('Resolve Function', () => {
    it('should discover dead player faction', () => {
      const action = {
        playerId: 1,
        data: { targetId: 3 },
        used: true
      };

      const result = medium.resolve(mockGameState, action);

      expect(mockGameState.night.context.checks).toHaveLength(1);
      expect(mockGameState.night.context.checks[0].by).toBe(1);
      expect(mockGameState.night.context.checks[0].target).toBe(3);
      expect(mockGameState.night.context.checks[0].discoveredFaction).toBe('villaggio');
      expect(result).toBeDefined();
      expect(result.type).toBe('medium_action');
      expect(result.discoveredFaction).toBe('villaggio');
    });

    it('should handle lupomannaro special rule', () => {
      const action = {
        playerId: 1,
        data: { targetId: 4 },
        used: true
      };

      const result = medium.resolve(mockGameState, action);

      expect(mockGameState.night.context.checks).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[1]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[1][0].role).toBe('medium');
      expect(result).toBeDefined();
      expect(result.discoveredFaction).toBe('villaggio');
    });

    it('should handle invalid target ID', () => {
      const action = {
        playerId: 1,
        data: { targetId: 'invalid' },
        used: true
      };

      const result = medium.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.checks).toHaveLength(0);
    });

    it('should handle missing target ID', () => {
      const action = {
        playerId: 1,
        data: {},
        used: true
      };

      const result = medium.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.checks).toHaveLength(0);
    });

    it('should handle non-existent target', () => {
      const action = {
        playerId: 1,
        data: { targetId: 999 },
        used: true
      };

      const result = medium.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.checks).toHaveLength(0);
    });

    it('should handle target with no roleState', () => {
      const playerWithoutRoleState = {
        id: 5,
        roleId: 'villico',
        name: 'Player 5',
        alive: false
      };
      mockGameState.players.push(playerWithoutRoleState);

      const action = {
        playerId: 1,
        data: { targetId: 5 },
        used: true
      };

      const result = medium.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(result.discoveredFaction).toBeUndefined();
    });

    it('should use visibleAsTeam when available', () => {
      const action = {
        playerId: 1,
        data: { targetId: 2 },
        used: true
      };

      const result = medium.resolve(mockGameState, action);

      expect(result.discoveredFaction).toBe('lupi');
    });

    it('should fallback to realTeam when visibleAsTeam not available', () => {
      const playerWithOnlyRealTeam = {
        id: 6,
        roleId: 'villico',
        name: 'Player 6',
        alive: false,
        roleState: { realTeam: 'villaggio' }
      };
      mockGameState.players.push(playerWithOnlyRealTeam);

      const action = {
        playerId: 1,
        data: { targetId: 6 },
        used: true
      };

      const result = medium.resolve(mockGameState, action);

      expect(result.discoveredFaction).toBe('villaggio');
    });
  });

  describe('Win Condition', () => {
    it('should use village win condition', () => {
      expect(typeof medium.checkWin).toBe('function');
    });
  });
});
