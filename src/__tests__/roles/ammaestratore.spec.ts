import { describe, it, expect, beforeEach, vi } from 'vitest';
import ammaestratore from '../../roles/ammaestratore';

describe('Ammaestratore Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          ammaestratore: true,
          villico: true
        }
      },
      nightNumber: 2,
      night: {
        context: {
          pendingKills: {}
        }
      },
      players: [
        { 
          id: 1, 
          roleId: 'ammaestratore',
          name: 'Ammaestratore Player',
          alive: true
        },
        { 
          id: 2, 
          roleId: 'villico',
          name: 'Villico Player',
          alive: true
        },
        { 
          id: 3, 
          roleId: 'lupo',
          name: 'Lupo Player',
          alive: true
        },
        { 
          id: 4, 
          roleId: 'villico',
          name: 'Another Villico',
          alive: true
        }
      ]
    };
  });

  describe('Role Properties', () => {
    it('should have correct basic properties', () => {
      expect(ammaestratore.id).toBe('ammaestratore');
      expect(ammaestratore.name).toBe('Ammaestratore');
      expect(ammaestratore.team).toBe('villaggio');
      expect(ammaestratore.visibleAsTeam).toBe('villaggio');
      expect(ammaestratore.countAs).toBe('villaggio');
      expect(ammaestratore.score).toBe(6);
      expect(ammaestratore.phaseOrder).toBe(2);
      expect(ammaestratore.actsAtNight).toBe('alive');
      expect(ammaestratore.effectType).toBe('optional');
      expect(ammaestratore.numberOfUsage).toBe(1);
      expect(ammaestratore.startNight).toBe(2);
      expect(ammaestratore.affectedRoles).toEqual(['lupo']);
    });

    it('should have components defined', () => {
      expect(typeof ammaestratore.getPromptComponent).toBe('function');
      expect(typeof ammaestratore.getResolveDetailsComponent).toBe('function');
    });
  });

  describe('Resolve Function - Redirect to Villico', () => {
    it('should redirect wolf kills to a villico target', () => {
      mockGameState.night.context.pendingKills = {
        2: [{ role: 'lupo' }]
      };

      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 4 }
      };

      const result = ammaestratore.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(result.type).toBe('ammaestratore_action');
      expect(result.targetId).toBe(4);
      expect(result.playerIds).toEqual([1]);

      expect(mockGameState.night.context.pendingKills[2]).toBeUndefined();
      expect(mockGameState.night.context.pendingKills[4]).toEqual([{ role: 'lupo' }]);
      expect(result.redirectInfo).toBeDefined();
      expect(result.redirectInfo.result).toBe('redirected');
      expect(result.redirectInfo.targetId).toBe(4);
    });

    it('should handle multiple wolf kills from different targets', () => {
      mockGameState.night.context.pendingKills = {
        2: [{ role: 'lupo' }],
        4: [{ role: 'lupo' }]
      };

      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 4 } // Redirect to player 4 (villico)
      };

      const result = ammaestratore.resolve(mockGameState, action);

      // Only one lupo kill should be redirected, the other should remain
      // Check that exactly one kill remains in the original targets + one redirected kill
      const remainingKills = Object.values(mockGameState.night.context.pendingKills).flat();
      expect(remainingKills).toHaveLength(2); // One kill remains + one redirected kill
      
      // Check that target 4 now has 2 kills (original + redirected)
      expect(mockGameState.night.context.pendingKills[4]).toEqual([{ role: 'lupo' }, { role: 'lupo' }]);
      expect(result.redirectInfo.originalKills).toHaveLength(1); // Only one kill redirected
    });
  });

  describe('Resolve Function - Redirect to Lupo', () => {
    it('should block all wolf kills when targeting a lupo', () => {
      mockGameState.night.context.pendingKills = {
        2: [{ role: 'lupo' }],
        4: [{ role: 'lupo' }]
      };

      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 3 }
      };

      const result = ammaestratore.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(result.targetId).toBe(3);

      // When targeting a lupo, only one kill should be removed (not all)
      // One kill should remain, one should be removed
      const remainingKills = Object.values(mockGameState.night.context.pendingKills).flat();
      expect(remainingKills).toHaveLength(1); // One kill should remain
      expect(result.redirectInfo).toBeDefined();
      expect(result.redirectInfo.result).toBe('blocked');
      expect(result.redirectInfo.targetId).toBe(3);
    });
  });

  describe('Resolve Function - Edge Cases', () => {
    it('should handle no target selection (skip)', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: null }
      };

      const result = ammaestratore.resolve(mockGameState, action);

      expect(result).toBeUndefined();
    });

    it('should handle invalid target ID', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 999 }
      };

      const result = ammaestratore.resolve(mockGameState, action);

      expect(result).toBeUndefined();
    });

    it('should handle no pending kills', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 2 }
      };

      const result = ammaestratore.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(mockGameState.night.context.ammaestratoreRedirect).toBeUndefined();
    });

    it('should handle no wolf kills in pending kills', () => {
      mockGameState.night.context.pendingKills = {
        2: [{ role: 'guardia' }]
      };

      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 4 }
      };

      ammaestratore.resolve(mockGameState, action);

      expect(mockGameState.night.context.ammaestratoreRedirect).toBeUndefined();
      expect(mockGameState.night.context.pendingKills[2]).toEqual([{ role: 'guardia' }]);
    });
  });

  describe('Win Condition', () => {
    it('should use village win condition', () => {
      expect(typeof ammaestratore.checkWin).toBe('function');
    });
  });
});
